<?

$conn_id = mysql_connect( 'localhost', 'root', '' ) or die( "t.syncDelay=500;" );
@mysql_select_db( 'tictactoe', $conn_id ) or die( "t.syncDelay=500;" );

Header( "Content-type: text/plain; charset=utf-8" );

$sql = mysql_query( "select id from sessions where timeout < " . time() );

if( mysql_num_rows( $sql ) > 0 ) {
	while( $row = mysql_fetch_array( $sql ) ) {
		$id = $row[ 'id' ];
		mysql_query( "delete from cellvalues where ses_id = $id" );
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


function makeDBValue( $name, $value, $css_id ) {
	global $conn_id, $ses_id;

	mysql_query( "insert into cellvalues ( ses_id, name, value, css_id ) values ( $ses_id, '$name', $value, '$css_id' )" );
	return mysql_insert_id( $conn_id );
}

function makeJSValue( $name, $id, $value, $css_id ) {
	echo "php_db.$name = new HValue( $id, $value );";
	echo "php_db.$css_id = new HCSSStyleValue( '$css_id', 'color:black' );";
}

function makeValue( $name, $value, $css_id ) {
	$arr = getDBValue( $name );
	if( !$arr ) {
		$id = makeDBValue( $name, $value, $css_id );
	} else {
		$id = $arr[ 'id' ];
		$value = $arr[ 'value' ];
	}
	makeJSValue( $name, $id, $value, $css_id );
}

function getDBValue( $name ) {
	global $conn_id, $ses_id;
	$result = mysql_query( "select * from cellvalues where ses_id = $ses_id and name = '$name' limit 1");
	if( mysql_num_rows( $result ) > 0 ) {
		$value = mysql_result( $result, 0, 'value' );
		$id = mysql_result( $result, 0, 'id' );
		$arr = array();
		$arr[ 'id' ] = $id;
		$arr[ 'value' ] = $value;
		return $arr;
	} else return false;
}


function makeFormHandlingApp() {

   for ( $i=0; $i<9; $i++ ) {
    $cname = 'cellvalue'.(string)$i;
    $css_id = 'cssvalue'.(string)$i;
    makeValue( $cname, 0, $css_id );
   }

   $left = 100;
   $top = 100;
   $right = 300;
   $bottom = 300;
   $title = "TicTacToe";
   echo "tictactoe = new TicTacToe( new HRect( $left, $top, $right, $bottom ), '$title' );";

}

echo "t.syncDelay=100;";

  // ***************************** //
  // ***** Begin: Game Logic ***** //
  // ***************************** //

function drawCross($cellname) {
  global $ses_id;

  $res = mysql_query( "select css_id from cellvalues where ses_id = $ses_id and name = '$cellname'" );

  if( mysql_num_rows( $res ) > 0 ) {
      $cssvalue = mysql_result($res, 0, 'css_id');
 	  echo "HValueManager.set( '$cssvalue','background-image: url(/sergey/tictactoe/gfx/tictactoe/x.gif)');";
      echo "HValueManager.set( '$cssvalue','background-repeat: no-repeat');";
      echo "HValueManager.set( '$cssvalue','background-position: center center');";
  }
}

function drawZero($cellname) {
  global $ses_id;

  $res = mysql_query( "select css_id from cellvalues where ses_id = $ses_id and name = '$cellname'" );

  if( mysql_num_rows( $res ) > 0 ) {
      $cssvalue = mysql_result($res, 0, 'css_id');
 	  echo "HValueManager.set( '$cssvalue','background-image: url(/sergey/tictactoe/gfx/tictactoe/o.gif)');";
      echo "HValueManager.set( '$cssvalue','background-repeat: no-repeat');";
      echo "HValueManager.set( '$cssvalue','background-position: center center');";
  }
}

function getCellValues() {
  $res = mysql_query( "select value from cellvalues order by id asc" );
  $cell_num = mysql_num_rows( $res );
  if( $cell_num > 0 ) {
    $CellValues = array();
    for( $i = 0; $i < $cell_num; $i++ ) {
      $CellValues[ $i ] = mysql_result($res, $i );
    }
    return $CellValues;
  }
}

function checkVictory() {
  $CellValues = getCellValues();

  if ($CellValues[0] == $CellValues[1] && $CellValues[1] == $CellValues[2] && $CellValues[2] > 0) return true;
  if ($CellValues[3] == $CellValues[4] && $CellValues[4] == $CellValues[5] && $CellValues[5] > 0) return true;
  if ($CellValues[6] == $CellValues[7] && $CellValues[7] == $CellValues[8] && $CellValues[8] > 0) return true;
  if ($CellValues[6] == $CellValues[3] && $CellValues[3] == $CellValues[0] && $CellValues[0] > 0) return true;
  if ($CellValues[7] == $CellValues[4] && $CellValues[4] == $CellValues[1] && $CellValues[1] > 0) return true;
  if ($CellValues[8] == $CellValues[5] && $CellValues[5] == $CellValues[2] && $CellValues[2] > 0) return true;
  if ($CellValues[6] == $CellValues[4] && $CellValues[4] == $CellValues[2] && $CellValues[2] > 0) return true;
  if ($CellValues[0] == $CellValues[4] && $CellValues[4] == $CellValues[8] && $CellValues[8] > 0) return true;

}

function startNewGame() {

  // Update database values
  $sql = "update cellvalues set value = 0";
  mysql_query( $sql );

  // Update HValueManager and HCSSStyleValues values
  $res = mysql_query( "select css_id, id from cellvalues" );
  $cell_num = mysql_num_rows( $res );
  if( $cell_num > 0 ) {
    for ( $i=0; $i < $cell_num; $i++) {
      $cssvalue = mysql_result($res, $i, 'css_id');
      $id = mysql_result($res, $i, 'id');
      echo "HValueManager.set( '$cssvalue','background-image: url()');";
      echo "HValueManager.set( $id, 0 );";
    }
  }

}

function checkDraw() {

  $state = false;
  $CellValues = getCellValues();

  for ($i=0; $i<9; $i++) {
    if ($CellValues[$i] == 0) {
      $state = true;
    }
  }
  if ($state == false) {
    echo "alert('Draw!');";
    startNewGame();
  }
}

function playServer() {
  $CellValues = getCellValues();

  for ($i=0; $i<9; $i++) { if ($CellValues[$i] == 0) { $cellname = 'cellvalue'.(string)$i; }  }

  for ($i=0; $i<3; $i++) {
    if ( ($CellValues[0] == $CellValues[1]) && ($CellValues[2] == 0) && ($CellValues[0] == $i) ) { $cellname = "cellvalue2"; }
    if ( ($CellValues[0] == $CellValues[2]) && ($CellValues[1] == 0) && ($CellValues[0] == $i) ) { $cellname = "cellvalue1"; }
    if ( ($CellValues[1] == $CellValues[2]) && ($CellValues[0] == 0) && ($CellValues[2] == $i) ) { $cellname = "cellvalue0"; }
    if ( ($CellValues[3] == $CellValues[4]) && ($CellValues[5] == 0) && ($CellValues[3] == $i) ) { $cellname = "cellvalue5"; }
    if ( ($CellValues[3] == $CellValues[5]) && ($CellValues[4] == 0) && ($CellValues[3] == $i) ) { $cellname = "cellvalue4"; }
    if ( ($CellValues[4] == $CellValues[5]) && ($CellValues[3] == 0) && ($CellValues[5] == $i) ) { $cellname = "cellvalue3"; }
    if ( ($CellValues[6] == $CellValues[7]) && ($CellValues[8] == 0) && ($CellValues[6] == $i) ) { $cellname = "cellvalue8"; }
    if ( ($CellValues[6] == $CellValues[8]) && ($CellValues[7] == 0) && ($CellValues[6] == $i) ) { $cellname = "cellvalue7"; }
    if ( ($CellValues[7] == $CellValues[8]) && ($CellValues[6] == 0) && ($CellValues[8] == $i) ) { $cellname = "cellvalue6"; }

    if ( ($CellValues[6] == $CellValues[3]) && ($CellValues[0] == 0) && ($CellValues[6] == $i) ) { $cellname = "cellvalue0"; }
    if ( ($CellValues[6] == $CellValues[0]) && ($CellValues[3] == 0) && ($CellValues[6] == $i) ) { $cellname = "cellvalue3"; }
    if ( ($CellValues[3] == $CellValues[0]) && ($CellValues[6] == 0) && ($CellValues[3] == $i) ) { $cellname = "cellvalue6"; }
    if ( ($CellValues[7] == $CellValues[4]) && ($CellValues[1] == 0) && ($CellValues[7] == $i) ) { $cellname = "cellvalue1"; }
    if ( ($CellValues[7] == $CellValues[1]) && ($CellValues[4] == 0) && ($CellValues[7] == $i) ) { $cellname = "cellvalue4"; }
    if ( ($CellValues[4] == $CellValues[1]) && ($CellValues[7] == 0) && ($CellValues[4] == $i) ) { $cellname = "cellvalue7"; }
    if ( ($CellValues[8] == $CellValues[5]) && ($CellValues[2] == 0) && ($CellValues[8] == $i) ) { $cellname = "cellvalue2"; }
    if ( ($CellValues[8] == $CellValues[2]) && ($CellValues[5] == 0) && ($CellValues[8] == $i) ) { $cellname = "cellvalue5"; }
    if ( ($CellValues[5] == $CellValues[2]) && ($CellValues[8] == 0) && ($CellValues[5] == $i) ) { $cellname = "cellvalue8"; }

    if ( ($CellValues[6] == $CellValues[4]) && ($CellValues[2] == 0) && ($CellValues[6] == $i) ) { $cellname = "cellvalue2"; }
    if ( ($CellValues[6] == $CellValues[2]) && ($CellValues[4] == 0) && ($CellValues[6] == $i) ) { $cellname = "cellvalue4"; }
    if ( ($CellValues[4] == $CellValues[2]) && ($CellValues[6] == 0) && ($CellValues[4] == $i) ) { $cellname = "cellvalue6"; }
    if ( ($CellValues[0] == $CellValues[4]) && ($CellValues[8] == 0) && ($CellValues[0] == $i) ) { $cellname = "cellvalue8"; }
    if ( ($CellValues[0] == $CellValues[8]) && ($CellValues[4] == 0) && ($CellValues[0] == $i) ) { $cellname = "cellvalue4"; }
    if ( ($CellValues[4] == $CellValues[8]) && ($CellValues[0] == 0) && ($CellValues[4] == $i) ) { $cellname = "cellvalue0"; }
  }

  drawZero($cellname);

  // Update HValueManager values
  $res = mysql_query( "select id from cellvalues where name = '$cellname'" );
  $cell_num = mysql_num_rows( $res );
  if( $cell_num > 0 ) {
    $id = mysql_result($res, 0, 'id');
    echo "HValueManager.set( $id, 2 );";
    mysql_query( "update cellvalues set value = 2 where id = $id" );
  }

  if ( checkVictory() == true ) {
    echo "alert('You lost!');";
    startNewGame();
  }
}

  // ***************************** //
  // ***** End: Game Logic ******* //
  // ***************************** //


$result = mysql_query( "select id, state from sessions where ses_key = '$ses_key'" );

if( mysql_num_rows( $result ) > 0 ) {
  $ses_id = mysql_result( $result, 0, 'id' );
  $state = mysql_result( $result, 0, 'state' );

  if( $state == 0 ) {
    echo "php_db={};";
    echo "t.ses_id='$ses_key'; window.status=t.ses_id;";

    // Application initialization
	makeFormHandlingApp();

    mysql_query( "update sessions set state = 1 where ses_key = '$ses_key'" );
  }
	
  if ($state == 1) {
    if( isset( $_REQUEST[ 'HSyncData' ] ) ) {
      $syncdata = stripslashes( $_REQUEST[ 'HSyncData' ] );
      $xml_parser = xml_parser_create();
	  xml_parse_into_struct( $xml_parser, $syncdata, $vals, $index );
	  xml_parser_free( $xml_parser );

	  $HSyncValues = array();
	  for( $i = 0; $i < count( $vals ); $i++ ) {
	    if( $vals[ $i ][ 'tag' ] == 'HVALUE' ) {
	      $id = $vals[ $i ][ 'attributes' ][ 'ID' ];
          $HSyncValues[ $id ]->id = $id;
          $HSyncValues[ $id ]->value = $vals[ $i ][ 'value' ];
        }
	  }

      foreach( $HSyncValues AS $key => $value ) {
	    $sql = "update cellvalues set value = ".$value->value." where id = $key and ses_id = $ses_id";
		mysql_query( $sql );

        if (($value->value)==1) {
          $res = mysql_query( "select name from cellvalues where id = $key" );
          $cellname = mysql_result( $res, 0, 'name' );
          drawCross($cellname);
            
          if ( checkVictory() == true ) {
            echo "alert('Congratulations! You won!');";
            startNewGame();
          } else {
            checkDraw();
            playServer();
            checkDraw();
          }
            
        }
	  }

    }

  }

}

mysql_close( $conn_id );

?>
