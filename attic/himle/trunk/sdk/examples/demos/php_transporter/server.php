<?

$conn_id = mysql_connect( 'localhost', 'root', '' ) or die( "t.syncDelay=500;" );
@mysql_select_db( 'tomi', $conn_id ) or die( "t.syncDelay=500;" );

Header( "Content-type: text/plain; charset=utf-8" );

#echo "Hei"; exit;

$sql = mysql_query( "select id from sessions where timeout < " . time() );
#echo "select id from sessions where timeout < " . time();
#exit;
if( mysql_num_rows( $sql ) > 0 ) {
	while( $row = mysql_fetch_array( $sql ) ) {
		$id = $row[ 'id' ];
		mysql_query( "delete from hvalues where ses_id = $id" );
	}
	mysql_query( "delete from sessions where timeout < " . time() );
}

if( empty( $_COOKIE[ 'session' ] ) ) {
	$ses_key = md5( time() );
	mysql_query( "insert into sessions ( ses_key ) values ( '$ses_key' )" );
	setcookie( 'session', $ses_key, time() + 86400 );
	$_COOKIE[ 'session' ] = $ses_key;
} else {
	$ses_key = $_COOKIE[ 'session' ];
	if( $_REQUEST[ 'ses_id' ] == '0' ) {
		$res = mysql_query( "select id from sessions where ses_key = '$ses_key'" );
		if( mysql_num_rows( $res ) > 0 ) {
			mysql_query( "update sessions set state = 0 where ses_key = '$ses_key'" );
		} else {
			mysql_query( "insert into sessions ( ses_key ) values ( '$ses_key' )" );
		}
	}
	setcookie( 'session', $ses_key, time() + 86400 );
}

mysql_query( "update sessions set timeout = " . ( time() + 86400 ) . " where ses_key = '$ses_key'" );
#echo "update sessions set timeout = " . ( time() + 60 ) . " where ses_key = '$ses_key'";
#echo "alert('" . $_REQUEST[ 'ses_id' ] . "');";

echo "php_db={};";
echo "t.ses_id='$ses_key'; window.status=t.ses_id;";



function makeDBValue( $name, $value, $jstype ) {
	global $conn_id, $ses_id;
	#if( $jstype == 'string' ) $value = "'$value'";
	
	mysql_query( "insert into hvalues ( ses_id, name, value, jstype ) values ( $ses_id, '$name', '$value', '$jstype' )" );
	return mysql_insert_id( $conn_id );
}

function makeJSValue( $name, $id, $value ) {
	echo "php_db.$name = new HValue( $id, $value );";
}

function makeValue( $name, $value, $jstype = 'string' ) {
	$arr = getDBValue( $name );
	if( !$arr ) {
		$id = makeDBValue( $name, $value, $jstype );
		if( $jstype == 'string' ) $value = "'$value'";
	} else {
		$id = $arr[ 'id' ];
		$value = $arr[ 'value' ];
	}
	makeJSValue( $name, $id, $value );
}

function getDBValue( $name ) {
	global $conn_id, $ses_id;
	$result = mysql_query( "select * from hvalues where ses_id = $ses_id and name = '$name' limit 1");
	if( mysql_num_rows( $result ) > 0 ) {
		$jstype = mysql_result( $result, 0, 'jstype' );
		$value = mysql_result( $result, 0, 'value' );
		$id = mysql_result( $result, 0, 'id' );
		if( $jstype == 'string' ) $value = "'$value'";
		$arr = array();
		$arr[ 'id' ] = $id;
		$arr[ 'value' ] = $value;
		return $arr;
	} else return false;
}

function makeFormHandlingApp() {
	makeValue( 'windowTitle', 'Hello World', 'string' );
	makeValue( 'nameFieldValue', 'nimesi', 'string' );
	makeValue( 'sliderValue', 70, 'number' );
	makeValue( 'genderValue', 1, 'number' );
	makeValue( 'maleValue', 'false', 'boolean' );
	makeValue( 'femaleValue', 'false', 'boolean' );

	echo "myProgressBar.setValue( 2 );";
	echo "myAppInstance = new MyFormHandlingApp( 'Hello World', 640, 480 );";
	echo "myProgressBar.setValue( 10 );";
}


#$ses_key = $_REQUEST[ 'ses_id' ];
echo "t.syncDelay=100;";

$result = mysql_query( "select id, state from sessions where ses_key = '$ses_key'" );
#echo "<br><br>" . "select id, state from sessions where ses_key = '$ses_key'" . "<br><br>";
if( mysql_num_rows( $result ) > 0 ) {
	$ses_id = mysql_result( $result, 0, 'id' );

	$state = mysql_result( $result, 0, 'state' );

	#echo "<br><br>" . mysql_result( $result, 0, 'state' ) . "<br><br>"; 
	#exit;
	if( $state == 0 ) {
		makeFormHandlingApp();
		mysql_query( "update sessions set state = 1 where ses_key = '$ses_key'" );
	}
	
	if( $state == 1 ) {
		mysql_query( "update sessions set state = 2 where ses_key = '$ses_key'" );
		echo "progressBarApp.die();";
	}
	
	if( isset( $_REQUEST[ 'HSyncData' ] ) ) {
		$syncdata = stripslashes( $_REQUEST[ 'HSyncData' ] );
		$xml_parser = xml_parser_create();
		xml_parse_into_struct( $xml_parser, $syncdata, $vals, $index );
		xml_parser_free( $xml_parser );
		
		$HSyncValues = array();
		for( $i = 0; $i < count( $vals ); $i++ ) {
			if( $vals[ $i ][ 'tag' ] == 'HVALUE' ) {
				$id = $vals[ $i ][ 'attributes' ][ 'ID' ];
				$HSyncValues[ $id ]->value = $vals[ $i ][ 'value' ];
				$HSyncValues[ $id ]->jstype = $vals[ $i ][ 'attributes' ][ 'JSTYPE' ];
			}
		}
		foreach( $HSyncValues AS $key => $value ) {
			$sql = "update hvalues set value = '".$value->value."', jstype = '".$value->jstype."' where id = $key and ses_id = $ses_id";
			mysql_query( $sql );
		}
	}
	
	$res = mysql_query( "select * from hvalues where ses_id = $ses_id and changed = 1" );
	if( mysql_num_rows( $res ) > 0 ) {
		while( $row = mysql_fetch_array( $res ) ) {
			extract( $row );
			if( $jstype == 'number' ) echo "HValueManager.set( $id, $value );";
			else echo "HValueManager.set( $id, '$value' );";
			mysql_query( "update hvalues set changed = 0 where id = $id" );
		}
	}
}


mysql_close( $conn_id );

?>