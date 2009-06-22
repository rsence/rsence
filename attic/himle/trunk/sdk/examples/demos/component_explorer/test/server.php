<?

$conn_id = mysql_connect( 'localhost', 'root', '' ) or die( "t.syncDelay=500;" );
@mysql_select_db( 'tomi', $conn_id ) or die( "t.syncDelay=500;" );

Header( "Content-type: text/plain; charset=utf-8" );

#echo "Hei"; exit;

$sql = mysql_query( "select id from sessions where timeout < " . time() );

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


function makeMenuDBValue( $name, $value, $jstype ) {
	global $conn_id, $ses_id;

	mysql_query( "insert into hvalues ( ses_id, name, value, jstype, validated ) values ( $ses_id, '$name', '$value', '$jstype', 1 )" );
	return mysql_insert_id( $conn_id );
}

function makeMenuJSValue( $name, $id, $value ) {
	echo "php_db.$name = new HValue( $id, $value );";
}

function makeMenuValue( $name, $value, $jstype = 'string' ) {
	$arr = getMenuDBValue( $name );
	if( !$arr ) {
		$id = makeMenuDBValue( $name, $value, $jstype );
		if( $jstype == 'string' ) $value = "'$value'";
	} else {
		$id = $arr[ 'id' ];
		$value = $arr[ 'value' ];
	}
	makeMenuJSValue( $name, $id, $value );
}

function getMenuDBValue( $name ) {
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

function getMenuNewValues( ) {
	global $conn_id, $ses_id;
	$result = mysql_query( "select * from hvalues where ses_id = $ses_id and validated=0");
	$newValues = array();
	$rownum = mysql_num_rows( $result );
    if( $rownum > 0 ) {
        for ( $i=0; $i<$rownum; $i++ ){
		    $jstype = mysql_result( $result, $i, 'jstype' );
		    $value = mysql_result( $result, $i, 'value' );
		    $name = mysql_result( $result, $i, 'name' );
		    $id = mysql_result( $result, $i, 'id' );
		    if( $jstype == 'string' ) $value = "'$value'";
		    $arr = array();
		    $arr[ 'id' ] = $id;
		    $arr[ 'value' ] = $value;
            $newValues[ $name ] = $arr;
        } return $newValues;
	} else return false;
}

function setMenuValidated( $id ) {
	#global $conn_id;
         mysql_query( "update hvalues set validated = 1 where id = $id"  );
}

// begin: A new table for ComponentDemoValues

function makeDemoDBValue( $menuvalue, $demovalue, $description, $demo, $source ) {
	global $conn_id;

	mysql_query( "insert into components ( menuvalue, demovalue, description, demo, source ) values ( $menuvalue, '$demovalue', '$description', '$demo', '$source' )" );
	return mysql_insert_id( $conn_id );
}

function makeDemoJSValue( $name, $id, $demovalue ) {
	echo "php_db.$name = new HValue( $id, $demovalue );";
}

function makeDemoValue( $menuvalue, $name, $demovalue, $description, $demo, $source ) {
	$arr = getDemoDBValue( $menuvalue );
	if( !$arr ) {
		$id = makeDemoDBValue( $menuvalue, $demovalue, $description, $demo, $source );
	} else {
		$id = $arr[ 'id' ];
		$demovalue = $arr[ 'value' ];
	}
	makeDemoJSValue( $name, $id, $demovalue );
}

function getDemoDBValue( $menuvalue ) {
	//global $conn_id, $ses_id;
	$result = mysql_query( "select * from components where menuvalue = $menuvalue");
	if( mysql_num_rows( $result ) > 0 ) {
        $id = mysql_result( $result, 0, 'id' );
        $demovalue = mysql_result( $result, 0, 'demovalue' );
		$arr = array();
		$arr[ 'id' ] = $id;
		$arr[ 'value' ] = $demovalue;
		return $arr;
	} else return false;
}

// end: A new table for ComponentDemoValues


function makeFormHandlingApp() {

   $components = array("Button","Checkbox","ImageView","ComboBox","Menu","PopUpButton","ProgressBar","ProgressIndicator","RadioButton","RichTextEditor","Slider","VSlider","Stepper","StringView","Tab","Table","TextControl","TreeControl","Window");
   
   makeMenuValue( 'selectedComponentNumber', '-1', 'number' );

   $description = "DESCR";
   $demo = "var _buttonRect = new HRect(50,50,150,70); buttonValue = new HClickButton( _buttonRect, this.demoPanel );";
   $source = "var _buttonRect = new HRect(50,50,150,70); buttonValue = new HClickButton( _buttonRect, this.demoPanel );";
   $demovalue = "12";

   for ( $i=0; $i<count($components); $i++ ) {
    makeMenuValue( $components[$i], 'false', 'boolean' );
    makeDemoValue( $i, $components[$i], $demovalue, $description, $demo, $source );
   }

   echo "mainwindow = new ComponentExplorer( new HRect( left, top, right, bottom ), 'COMPONENT EXPLORER', 'logo.gif' );";

}

function output_content($file){
  //@is_file($file) or die("This $file does not exist!");
  $fh=fopen($file,"r") or die("Couldn't open $file!");
  fpassthru($fh);
  fclose($fh);
}

echo "t.syncDelay=1000;";

$result = mysql_query( "select id, state from sessions where ses_key = '$ses_key'" );

if( mysql_num_rows( $result ) > 0 ) {
	$ses_id = mysql_result( $result, 0, 'id' );

	$state = mysql_result( $result, 0, 'state' );

    if( $state == 0 ) {

        echo "php_db={};";
        echo "t.ses_id='$ses_key'; window.status=t.ses_id;";

		makeFormHandlingApp();
		mysql_query( "update sessions set state = 1 where ses_key = '$ses_key'" );
	}
	
	if( $state == 1 ) {
		mysql_query( "update sessions set state = 2 where ses_key = '$ses_key'" );
		//echo "progressBarApp.die();";
	}

    if( isset( $_REQUEST[ 'HSyncData' ] ) ) {
		$syncdata = stripslashes( $_REQUEST[ 'HSyncData' ] );
		$xml_parser = xml_parser_create();
		xml_parse_into_struct( $xml_parser, $syncdata, $vals, $index );
		xml_parser_free( $xml_parser );

        //echo "elem_set(this.debug,'";
        //    print_r($vals);
        //echo "');";

		$HSyncValues = array();
		for( $i = 0; $i < count( $vals ); $i++ ) {   # $temp = count($vals); echo "alert($vals);";
			if( $vals[ $i ][ 'tag' ] == 'HVALUE' ) {
				$id = $vals[ $i ][ 'attributes' ][ 'ID' ]; // echo "alert($id);";
                //$HSyncValues[ $id ]->id = $id;
                $HSyncValues[ $id ]->value = $vals[ $i ][ 'value' ];
				$HSyncValues[ $id ]->jstype = $vals[ $i ][ 'attributes' ][ 'JSTYPE' ];
				
			}
		}
		foreach( $HSyncValues AS $key => $value ) {      #echo "alert($id);"; # echo "alert($key);"; echo "alert($value->value);"; echo "alert($value->jstype);";
			$sql = "update hvalues set validated = 0, value = '".$value->value."', jstype = '".$value->jstype."' where id = $key and ses_id = $ses_id";
			mysql_query( $sql );
		}
	}

    // Check this out!!!!
	$res = mysql_query( "select * from hvalues where ses_id = $ses_id and changed = 1" );
	if( mysql_num_rows( $res ) > 0 ) {  #echo "alert('moi');";
		while( $row = mysql_fetch_array( $res ) ) {
			extract( $row );
			if( $jstype == 'number' ) echo "HValueManager.set( $id, $value );";
			else echo "HValueManager.set( $id, '$value' );";
			mysql_query( "update hvalues set changed = 0 where id = $id" );
		}
	}
	
	if ($state == 2) {
       $newValues = getMenuNewValues();
        if ($newValues) {
          if ($newValues[ "selectedComponentNumber" ]){
             $selectedComponent = $newValues[ "selectedComponentNumber" ]['value'];    # echo "alert($selectedComponent);";
             setMenuValidated( $newValues["selectedComponentNumber"]['id'] );

             echo "window.status = 'received selectedCompenent: $selectedComponent';";

             echo "if ( panelapp ) { alert(panelapp.mainView.views.length); panelapp.mainView.die();  alert(panelapp.mainView.views.length); HSystem.killApp(panelapp.appId); delete panelapp; panelapp = null; }";
             //echo "if ( panelapp ) {HSystem.killApp(panelapp.appId); delete panelapp; panelapp = null; }";
             //echo "panelapp = new ComponentPanel( mainwindow.panel );";

             switch ( $selectedComponent ) {
               case 0:
                 //echo "if ( panelapp ) { panelapp.mainView.die(); HSystem.killApp(panelapp.appId); delete panelapp; panelapp = null; }";

                 $result = mysql_query( "select * from components where menuvalue = 0" );
                 if( mysql_num_rows( $result ) > 0 ) {  #echo "alert('moi');";
		             while( $row = mysql_fetch_array( $result ) ) {
			           extract( $row );
                     }
                     echo "panelapp = new ComponentPanel( mainwindow.panel, '$demo', '$description', '$source' );";

                 }

                 break;
               case 1:
               //  echo "if ( panelapp ) { panelapp.mainView.die(); HSystem.killApp(panelapp.appId); delete panelapp; panelapp = null; }";

                 //echo "if ( panelapp ) { panelapp.mainView.die(); panelapp.die(); }";

                 $result = mysql_query( "select * from components where menuvalue = 1" );
                 if( mysql_num_rows( $result ) > 0 ) {  #echo "alert('moi');";
		             while( $row = mysql_fetch_array( $result ) ) {
			           extract( $row );
                     }
                     echo "panelapp = new ComponentPanel( mainwindow.panel, '$demo', '$description', '$source' );";

                 }

                 break;
               case 2:
                 //echo "if ( panelapp ) { panelapp.mainView.die(); HSystem.killApp(panelapp.appId); delete panelapp; panelapp = null; }";
                 echo "if ( panelapp ) { panelapp.die(); }";
                 echo "panelapp = new ComponentPanel( mainwindow.panel );";
                 $result = mysql_query( "select * from components where menuvalue = 2" );
                 if( mysql_num_rows( $result ) > 0 ) {  #echo "alert('moi');";
		             while( $row = mysql_fetch_array( $result ) ) {
			           extract( $row );
                     }

                     echo "elem_set(panelapp.descrPanel.windowView.elemId, '$description');";
                     echo "eval( '$demo' );";
                     echo "elem_set(panelapp.sourcePanel.windowView.elemId, '$source');";
                 }

                 break;
             }

   
         /*
            $chosen_name = mysql_query( "select name from hvalues where value = 'true'" );
             if ( mysql_num_rows($chosen_name)>0 ) {
                //echo "if ( typeof(panelapp) == 'object' ) { panelapp.die(); }";
                echo "panelapp = new ComponentPanel( mainwindow.panel );";
                //$name = mysql_result( $chosen_name, 0, 'name' );
                //$filename = $name.'.js';

                //  if ( file_exists( $filename ) ) {
                //    output_content( $filename );
                //  } else {
                //   echo "alert('The file does not exist!');";
                //  }

             }
             


             if ( $selectedComponent == '0' ) {
                  echo "panelapp.componentTitle.setValue('$name');";

                  setValidated( $newValues["selectedComponentNumber"]['id'] );

             }
           */
           
          }
        }
    }
    

}

mysql_close( $conn_id );

?>
