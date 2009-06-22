<?

/*******************************
*                              *
*  Initializing the session:   *
*                              *
*******************************/

/** The setting are for a MySQL DB connection **/
$conn_id = mysql_connect( 'localhost', 'root', '' ) or die( "t.syncDelay=500;" );
@mysql_select_db( 'tictactoe2', $conn_id ) or die( "t.syncDelay=500;" );

// The client expect the content to be text/plain
Header( "Content-type: text/plain; charset=utf-8" );

/** A new session initialization. A client reports its session id as '0'. **/
if( empty( $_COOKIE[ 'session' ] ) ) {
  $ses_key = md5( time() );
  mysql_query( "insert into sessions ( ses_key ) values ( '$ses_key' )" );
  setcookie( 'session', $ses_key, time() + 60 );
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
  setcookie( 'session', $ses_key, time() + 60 );
}

mysql_query( "update sessions set timeout = " . ( time() + 60 ) . " where ses_key = '$ses_key'" );




/**************************************
*                                     *
*  Checking if a session is valid:    *
*                                     *
**************************************/

/** Let's flush the expired data from the database **/
$sql = mysql_query( "select id from sessions where timeout < " . time() );
if( mysql_num_rows( $sql ) > 0 ) {
  while( $row = mysql_fetch_array( $sql ) ) {
    $id = $row[ 'id' ];
	mysql_query( "delete from hvalues where ses_id = $id" );
  }
  mysql_query( "delete from sessions where timeout < " . time() );
}

/***********************
*                      *
*  Initializing data:  *
*                      *
***********************/


function makeDBValue( $name, $value, $jstype ) {
  global $conn_id, $ses_id;
  mysql_query( "insert into hvalues ( ses_id, name, value, jstype, validated ) values ( $ses_id, '$name', '$value', '$jstype', 1 )" );
  return mysql_insert_id( $conn_id );
}

function makeCSSValue( $name ) {
  $cssvalue = 'cssvalue'.$name;
  echo "php_db.$cssvalue = new HCSSStyleValue( '$cssvalue', 'color:black' );";
}

function makeJSValue( $name, $id, $value ) {
  $cellvalue = 'cellvalue'.$name;
  echo "php_db.$cellvalue = new HValue( $id, $value );";
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
  makeCSSValue( $name );
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


/** Initializes the status ( 0 => 'X', 1 => 'O' ), when the first client starts the game. **/
function initStatus() {
  mysql_query( "insert into status ( flag ) values ( 0 )" );
}

/** Initializes the current state.  **/
function initCurrentState() {
  for( $i = 0; $i < 9; $i++ ) {
    mysql_query( "insert into states ( name, value ) values ( '$i', 0 )" );
  }
  initStatus();
}

/** Checks if the game has been initialized
    and returns an array of cell values. **/

function getCurrentState() {
  $res = mysql_query( "select value from states order by id asc" );
  $cellnum = mysql_num_rows( $res );
  if ( $cellnum > 0 ){
    $CellValues = array();
    for( $i = 0; $i < $cellnum; $i++ ) {
      $CellValues[ $i ] = mysql_result($res, $i, 'value' );
    }
    return $CellValues;
  } else return false;
}


/** Makes a new value from the current state table. **/

function makeValueFromCurrentState( $name, $value, $jstype = 'string' ) {
  global $ses_id;
  $result = mysql_query( "select * from hvalues where ses_id = $ses_id and name = '$name' limit 1");
  $counter = mysql_num_rows( $result );
  if( empty($counter) ) {
    $id = makeDBValue( $name, $value, $jstype );
    if( $jstype == 'string' ) $value = "'$value'";
  } else {
    $id = mysql_result( $result, 0, 'id' );
  }
  makeJSValue( $name, $id, $value );
  makeCSSValue( $name );
}


  /** Check the flag of the game. If the flag = 0, the status equals "X". If the flag = 1, the status equals "O". **/
  function getStatus () {
    $result = mysql_query( "select flag from status" );
    $flag = mysql_result( $result, 0, 'flag' );
    if ( $flag == 0 ) {
      $status = 1;
      $flag = 1;
    } else {
      $status = 2;
      $flag = 0;
    }
    mysql_query( "update status set flag = $flag" );
    return $status;
  }


/** CREATE APPLICATION **/

function createApp() {

  $CellValues = getCurrentState();

  /** If the current state is empty and there is no any active sessions,
     then make new values and initialize the current state.
     Else, make new values from the initialized current state.
  **/
     
  if (!$CellValues) {
    for ( $i=0; $i<9; $i++ ) {
      $name = "$i";
      makeValue( $name, 0, 'number' );
    }
    initCurrentState();
  } else {
    for ( $i=0; $i<9; $i++ ) {
      $name = "$i";
      makeValueFromCurrentState( $name, $CellValues[$i], 'number' );
    }
  }

  // Defines the status of a player ( 'X' or 'O' )
  $status = getStatus();
  echo "php_db.statusvalue = new HValue( 'statusvalue0001', $status );";

   $left = 100;
   $top = 100;
   $right = 300;
   $bottom = 300;
   $title = "TicTacToe";
   echo "tictactoe = new TicTacToe( new HRect( $left, $top, $right, $bottom ), '$title' );";

}


/*********************************
*                                *
*  Handling Client-server data:  *
*                                *
*********************************/

  /** If some hvalues have changed, then update the current state. **/
  function updateCurrentState( $name, $val ){
    mysql_query( "update states set value = $val where name = '$name'" );
  }

  function getHSyncData() {
    if( isset( $_REQUEST[ 'HSyncData' ] ) ) {
	  $syncdata = stripslashes( $_REQUEST[ 'HSyncData' ] );
	  $xml_parser = xml_parser_create();
	  xml_parse_into_struct( $xml_parser, $syncdata, $vals, $index );
	  xml_parser_free( $xml_parser );

	  $HSyncValues = array();
 	  for( $i = 0; $i < count( $vals ); $i++ ) {
        if( $vals[ $i ][ 'tag' ] == 'HVALUE' ) {
		  $id = $vals[ $i ][ 'attributes' ][ 'ID' ];
          //$HSyncValues[ $id ]->id = $id;
          $HSyncValues[ $id ]->value = $vals[ $i ][ 'value' ];
		  $HSyncValues[ $id ]->jstype = $vals[ $i ][ 'attributes' ][ 'JSTYPE' ];
        }
	  }

      /** Gets and Updates values from client  **/
    foreach( $HSyncValues AS $key => $value ) {
      $result = mysql_query( "select ses_id, name from hvalues where id = $key" );
        if ( mysql_num_rows($result) > 0 ) {
          $ses_id = mysql_result( $result, 0, 'ses_id' );
          $name = mysql_result( $result, 0, 'name' );
        }
          $val = $value->value;
          mysql_query( "update hvalues set changed = 1, validated = 0, value = $val, jstype = '".$value->jstype."' where name = '$name'" );
          updateCurrentState( $name, $val );
        }
	 }
     return true;
   }



/*********************************
*                                *
*  Handling Server-client data:  *
*                                *
*********************************/

  function sync_css_values( $name, $value ) {
    $cssvalue = 'cssvalue'.$name;
    if ( $value == 1 ) {
      echo "HValueManager.set( '$cssvalue','background-image: url(/sergey/tictactoe2/gfx/tictactoe/x.gif)');";
      echo "HValueManager.set( '$cssvalue','background-repeat: no-repeat');";
      echo "HValueManager.set( '$cssvalue','background-position: center center');";
    } elseif ( $value == 2 ) {
      echo "HValueManager.set( '$cssvalue','background-image: url(/sergey/tictactoe2/gfx/tictactoe/o.gif)');";
      echo "HValueManager.set( '$cssvalue','background-repeat: no-repeat');";
      echo "HValueManager.set( '$cssvalue','background-position: center center');";
    }
  }

  function sync_js_values() {
    global $ses_id;
	$res = mysql_query( "select * from hvalues where changed = 1 and ses_id = $ses_id" );
    if( mysql_num_rows( $res ) > 0 ) {
	  while( $row = mysql_fetch_array( $res ) ) {
		extract( $row );
		if( $jstype == 'number' ) {
          echo "HValueManager.set( $id, $value );";
        } else {
          echo "HValueManager.set( $id, '$value' );";
        }
	    sync_css_values( $name, $value );
		mysql_query( "update hvalues set changed = 0 where id = $id" );
	  }
    }
  }

  function sync_all_js_values() {
    global $ses_id;
	$res = mysql_query( "select * from hvalues where ses_id = $ses_id" );
    if( mysql_num_rows( $res ) > 0 ) {
	  while( $row = mysql_fetch_array( $res ) ) {
		extract( $row );
		if( $jstype == 'number' ) echo "HValueManager.set( $id, $value );";
	    else echo "HValueManager.set( $id, '$value' );";
	  }
    }
  }
  
  function sync_all_css_values() {
    $res = mysql_query( "select * from states" );
    if ( mysql_num_rows( $res ) > 0 ) {
      while ( $row = mysql_fetch_array( $res ) ) {
        extract( $row );
        $cssvalue = 'cssvalue'.$name;
        if ( $value == 1 ) {
          echo "HValueManager.set( '$cssvalue','background-image: url(/sergey/tictactoe2/gfx/tictactoe/x.gif)');";
          echo "HValueManager.set( '$cssvalue','background-repeat: no-repeat');";
          echo "HValueManager.set( '$cssvalue','background-position: center center');";
        } elseif ( $value == 2 ) {
          echo "HValueManager.set( '$cssvalue','background-image: url(/sergey/tictactoe2/gfx/tictactoe/o.gif)');";
          echo "HValueManager.set( '$cssvalue','background-repeat: no-repeat');";
          echo "HValueManager.set( '$cssvalue','background-position: center center');";
        } elseif ( $value == 0 ) {
          echo "HValueManager.set( '$cssvalue','background-image: url()');";
        }

      }
    }
  }

  // This function changes a value to be syncronized to the client
  function set_value( $name, $value ){
    sql_query( "UPDATE hvalues SET value = $value, changed = 1 WHERE name = '$name'" );
  }


/********************
*    Begin          *
*    USER CODE      *
*                   *
********************/

function checkVictory() {
  $CellValues = getCurrentState();

  if ($CellValues[0] == $CellValues[1] && $CellValues[1] == $CellValues[2] && $CellValues[2] > 0) return true;
  if ($CellValues[3] == $CellValues[4] && $CellValues[4] == $CellValues[5] && $CellValues[5] > 0) return true;
  if ($CellValues[6] == $CellValues[7] && $CellValues[7] == $CellValues[8] && $CellValues[8] > 0) return true;
  if ($CellValues[6] == $CellValues[3] && $CellValues[3] == $CellValues[0] && $CellValues[0] > 0) return true;
  if ($CellValues[7] == $CellValues[4] && $CellValues[4] == $CellValues[1] && $CellValues[1] > 0) return true;
  if ($CellValues[8] == $CellValues[5] && $CellValues[5] == $CellValues[2] && $CellValues[2] > 0) return true;
  if ($CellValues[6] == $CellValues[4] && $CellValues[4] == $CellValues[2] && $CellValues[2] > 0) return true;
  if ($CellValues[0] == $CellValues[4] && $CellValues[4] == $CellValues[8] && $CellValues[8] > 0) return true;

}

function checkDraw() {
  $state = false;
  $CellValues = getCurrentState();

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


function startNewGame() {
   // Update database values
  mysql_query( "update hvalues set value = 0, validated = 1" );
  mysql_query( "update states set value = 0" );
  mysql_query( "update status set flag = 0" );
  // Update HValueManager and HCSSStyleValues values

  /** !!!!!!!!!!!!!!!!!!!!! **/
  /** TODO: Get session ids **/
  sync_all_js_values();
  sync_all_css_values();
}

$result = mysql_query( "select id, state from sessions where ses_key = '$ses_key'" );

if( mysql_num_rows( $result ) > 0 ) {
  $ses_id = mysql_result( $result, 0, 'id' );
  $state = mysql_result( $result, 0, 'state' );

  if( $state == 0 ) {
    /** Initialization for a client namespace for common client-server data. **/
    echo "php_db = {};";
    /** Set a new synchronization delay **/
    echo "t.syncDelay=100;";
    echo "t.ses_id='$ses_key';";
    //window.status=t.ses_id;";
	createApp();
	mysql_query( "update sessions set state = 1 where ses_key = '$ses_key'" );
  }
  if ($state == 1) {
    if ( getHSyncData() == true ) {
      sync_js_values();
      if ( checkVictory() == true ) {
        echo "alert('Congratulations! You won!');";
        startNewGame();
      } else {
        checkDraw();
      }
    }
  }
}

/********************
*    End            *
*    USER CODE      *
*                   *
********************/


mysql_close( $conn_id );

?>
