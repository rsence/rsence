<?

/*********************
*
* Prerequisites:
*   MySQL database should have at least two tables, as follows:
*
*********************/

/***** MYSQL BEGIN: *****
*
* mysql> describe sessions;
* +---------+-------------+------+-----+---------+----------------+----------------- - -  -   -    -
* | Field   | Type        | Null | Key | Default | Extra          | Comment
* +---------+-------------+------+-----+---------+----------------+----------------- - -  -   -    -
* | id      | int(11)     | NO   | PRI | NULL    | auto_increment | Serial number, used to match values in the database.
* | ses_key | varchar(64) | YES  | UNI | NULL    |                | The session identifier, sent to the client.
* | state   | int(11)     | YES  |     | 0       |                | Internal state of the session, used for initialization.
* | timeout | int(11)     | YES  |     | 0       |                | The current time in seconds + the timeout amount in seconds.
* +---------+-------------+------+-----+---------+----------------+----------------- - -  -   -    -
*
* mysql> describe hvalues;
* +-----------+--------------+------+-----+---------+----------------+----------------- - -  -   -    -
* | Field     | Type         | Null | Key | Default | Extra          | Comment
* +-----------+--------------+------+-----+---------+----------------+----------------- - -  -   -    -
* | id        | int(11)      | NO   | PRI | NULL    | auto_increment | Serial number, used to tell values apart internally.
* | ses_id    | int(11)      | YES  |     | NULL    |                | Session serial number, match to: <sessions.id>
* | name      | varchar(255) | NO   |     |         |                | The variable name, used as a public identifier, common for server and client.
* | value     | varchar(255) | YES  |     | NULL    |                | The variable value, common for server and client
* | jstype    | varchar(12)  | YES  |     | string  |                | The type of value validation to be done on the server.
* | changed   | int(1)       | YES  |     | 0       |                | The state of the value, 1 while the server value is newer than the client value.
* | validated | int(1)       | NO   |     | 0       |                | The state of the value, 1 while the client value is not validated by the server.
* +-----------+--------------+------+-----+---------+----------------+----------------- - -  -   -    -
*
****** END MYSQL ******/


/*******************************
*                              *
*  Initializing the session:   *
*                              *
*******************************/

// MySQL DB connection settings
// Replace DATABASE_NAME by your own database name
$conn_id = mysql_connect( 'localhost', 'root', '' ) or die( "t.syncDelay=500;" );
@mysql_select_db( 'tictactoe2', $conn_id ) or die( "t.syncDelay=500;" );

// The client expects the content to be text/plain
Header( "Content-type: text/plain; charset=utf-8" );

// A new session initialization. A client reports its session id as '0'.
if( empty( $_COOKIE[ 'session' ] ) ) {
  // Generates a unique identifier for the client. For example: 'e907884caf194de1da4521b89fe8e170'
  $ses_key = md5( time() );
  mysql_query( "insert into sessions ( ses_key ) values ( '$ses_key' )" );
  setcookie( 'session', $ses_key, time() + 60 );
  $_COOKIE[ 'session' ] = $ses_key;
} else {
  // If the current session is not new. For example, if the page has been refreshed.
  $ses_key = $_COOKIE[ 'session' ];
  if( $_REQUEST[ 'ses_id' ] == '0' ) {
    $res = mysql_query( "select id from sessions where ses_key = '$ses_key'" );
	if( mysql_num_rows( $res ) > 0 ) {
	  mysql_query( "update sessions set state = 2 where ses_key = '$ses_key'" );
	} else {
      mysql_query( "insert into sessions ( ses_key ) values ( '$ses_key' )" );
	}
  }
  setcookie( 'session', $ses_key, time() + 60 );
}

mysql_query( "update sessions set timeout = " . ( time() + 60 ) . " where ses_key = '$ses_key'" );


/**************************************
*                                     *
*  Checking if the session is valid:  *
*                                     *
**************************************/

// Let's flush the expired data from the database.
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

/** A few abstract functions **/

// Inserts new values to the database and returns the row serial number.
function makeDBValue( $name, $value, $jstype, $cssname ) {
  global $conn_id, $ses_id;
  mysql_query( "insert into hvalues ( ses_id, name, value, jstype, validated, cssname ) values ( $ses_id, '$name', '$value', '$jstype', 1, '$cssname' )" );
  return mysql_insert_id( $conn_id );
}

// Initializes a new CSS value object in the client's "common_values" namespace.
function makeCSSValue( $cssname ) {
  echo "php_db.$cssname = new HCSSStyleValue( '$cssname', 'color:black' );";
}

// Initializes a new value object in the client's "common_values" namespace.
function makeJSValue( $name, $id, $value ) {
  echo "php_db.$name = new HValue( $id, $value );";
}

// Extracts an existing value from the DB, otherwise returns defaults.
function makeValue( $name, $value, $jstype = 'string', $cssname ) {
  $arr = getDBValue( $name );
  if( !$arr ) {
    $id = makeDBValue( $name, $value, $jstype, $cssname );
	if( $jstype == 'string' ) $value = "'$value'";
  } else {
    $id = $arr[ 'id' ];
	$value = $arr[ 'value' ];
  }
  makeJSValue( $name, $id, $value );
  if ($cssname) {
    makeCSSValue( $cssname );
  }
  return $id;
}

// Gets the current client's values by name.
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

// Creates control values: turnvalue, labelvalue
function setLabel(){
  global $ses_id;
  // Control value for disabled/enabled options
  $id = makeValue('turnvalue',1,'boolean','');

  $result = mysql_query( "select label from sessions where id = $ses_id" );
  if ( mysql_num_rows( $result ) > 0 ) {
    $label = mysql_result( $result, 0, 'label' );
    if ($label == 1) {
      echo "HValueManager.set($id, 0);";
      mysql_query( "update hvalues set value = 0 where ses_id = $ses_id and name = 'turnvalue'" );
    }
    echo "php_db.labelvalue = new HValue('labelvalue001',$label);";
  }
}


/** CREATE APPLICATION **/

function createApp() {

    /********************
    * USER-DEFINED CODE *
    ********************/

  // Creates js and css data values
  for ( $i=1; $i<10; $i++ ) {
    $name = 'cell_'.$i;
    $cssname = 'css_'.$i;
    makeValue( $name, 0, 'number', $cssname );
  }

  setLabel();
  // Creates a hintvalue, the first shot always belongs to X-player
  echo "php_db.hintvalue = new HValue('hintimagevalue001','../themes/tictactoe/gfx/x_red.gif');";

  $left = 300;
  $top = 100;
  $right = 750;
  $bottom = 400;
  $title = "TicTacToe";
  echo "tictactoe = new TicTacToe( new HRect( $left, $top, $right, $bottom ), '$title' );";

}

/*********************************
*                                *
*  Handling Client-server data:  *
*                                *
*********************************/

  // XML PARSER
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
          $HSyncValues[ $id ]->id = $id;
          $HSyncValues[ $id ]->value = $vals[ $i ][ 'value' ];
		  $HSyncValues[ $id ]->jstype = $vals[ $i ][ 'attributes' ][ 'JSTYPE' ];
        }
	  }
	  

      // Gets and Updates values from client.
      foreach( $HSyncValues AS $key => $value ) {
        $val = $value->value;
        $result = mysql_query( "select ses_id, name from hvalues where id = $key" );
        if ( mysql_num_rows($result) > 0 ) {
          $ses_id = mysql_result( $result, 0, 'ses_id' );
          $name = mysql_result( $result, 0, 'name' );
        }
        mysql_query( "update hvalues set changed = 1, validated = 0, value = $val, jstype = '".$value->jstype."' where name = '$name'" );
      }

    }
         return true;
  }

/*********************************
*                                *
*  Handling Server-client data:  *
*                                *
*********************************/

  function sync_css_values( $cssname, $value ) {
    if ( $value == 1 ) {
      echo "HValueManager.set( '$cssname','background-image: url(/sergey/tictactoe2/themes/tictactoe/gfx/x.gif)');";
      echo "HValueManager.set( '$cssname','background-repeat: no-repeat');";
      echo "HValueManager.set( '$cssname','background-position: center center');";
     } elseif ( $value == 2 ) {
      echo "HValueManager.set( '$cssname','background-image: url(/sergey/tictactoe2/themes/tictactoe/gfx/o.gif)');";
      echo "HValueManager.set( '$cssname','background-repeat: no-repeat');";
      echo "HValueManager.set( '$cssname','background-position: center center');";
    }
  }
  

  // Synchronizes one value on the client-side from the database.
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

	    sync_css_values( $cssname, $value );
		mysql_query( "update hvalues set changed = 0 where id = $id" );
		return $value;
	  }
    }
  }


  // Synchronizes all values on the client-side from the database.
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

  function zero_all_css_values() {
    global $ses_id;
    $res = mysql_query( "select cssname from hvalues where ses_id = $ses_id" );
    if ( mysql_num_rows( $res ) > 0 ) {
      while ( $row = mysql_fetch_array( $res ) ) {
        extract( $row );
        echo "HValueManager.set( '$cssname','background-image: url()');";
      }

    }
  }

  // Ghanges a value in order to be syncronized to the client
  function set_value( $name, $value ){
    mysql_query( "UPDATE hvalues SET value = $value, changed = 1 WHERE name = '$name'" );
  }


/********************
*    Begin          *
*    USER CODE      *
*                   *
********************/

// LoginProgressIndicator initialization
function login_indicator(){
  echo "LoginProgressWindow = new HWindowControl(new HRect(50,50,370,250),tictactoe.mainwindow,{label: 'Looking for an opponent...'});";
  echo "ProgressIndicator = new HProgressIndicator(new HRect(50,100,200,125), LoginProgressWindow.windowView, {value: true} );";
}

// Looks for an opponent, makes a pair
function find_opponent() {
  global $ses_key, $ses_id;

  $result1 = mysql_query( "select pair, id from sessions where pair = 0" );
  $result2 = mysql_query( "select * from sessions where pair is NULL" );

  if ( (mysql_num_rows( $result1 ) > 0) && (mysql_num_rows( $result2 ) > 0) ) {
    //echo "alert('I got a pair!');";
    $id = mysql_result( $result1, 0, 'id' );
    /** x -> label=1, o -> label=2 **/
    mysql_query( "UPDATE sessions SET pair = $id, label = 2 where ses_key = '$ses_key'" );
    mysql_query( "UPDATE sessions SET pair = $ses_id where id = $id" );
    return true;
  } elseif ( mysql_num_rows( $result2 ) > 0 ) {
      //echo "alert('I am alone!');";
      mysql_query( "UPDATE sessions SET pair = 0, label =1 where ses_key = '$ses_key'" );
      return false;
  }

  $result3 = mysql_query( "select pair from sessions where id = $ses_id" );
  if ( mysql_num_rows( $result3 ) > 0 ) {
      $pair = mysql_result( $result3, 0, 'pair' );
      if ( $pair != 0 && $pair != NULL ) {
        //echo "alert('I am alive, too!');";
        return true;
      }
  }
}

// Players' order synchronization
function sync_player_order( $player ){
  global $ses_id;

  $result = mysql_query( "select id, value from hvalues where name='turnvalue' and ses_id=$ses_id" );
  if (mysql_num_rows($result)>0) {
    $id = mysql_result( $result, 0, 'id' );
    $turnvalue = mysql_result( $result, 0, 'value' );
    if ($turnvalue == 0){
      $turnvalue = 1;
    } else {
      $turnvalue = 0;
    }
    echo "HValueManager.set($id,$turnvalue);";
    mysql_query("update hvalues set value = $turnvalue where id = $id");
  }

  if ($player == 1) {
    // player = 2
    echo "HValueManager.set('hintimagevalue001','../themes/tictactoe/gfx/o_red.gif');";
  } elseif ($player == 2) {
    // player = 1
    echo "HValueManager.set('hintimagevalue001','../themes/tictactoe/gfx/x_red.gif');";
  }
}


/** Checks if the game has been initialized and returns an array of cell values. **/
function getCurrentState() {
  global $ses_id;
  $res = mysql_query( "select value from hvalues where ses_id = $ses_id order by id asc" );
  $cellnum = mysql_num_rows( $res );
  if ( $cellnum > 0 ){
    $CellValues = array();
    for( $i = 0; $i < $cellnum; $i++ ) {
      $CellValues[ $i ] = mysql_result($res, $i, 'value' );
    }
    return $CellValues;
  } else return false;
}
  
function checkVictory() {
  $CellValues = getCurrentState();
  if ( $CellValues ) {
    if ($CellValues[0] == $CellValues[1] && $CellValues[1] == $CellValues[2] && $CellValues[2] > 0) return true;
    if ($CellValues[3] == $CellValues[4] && $CellValues[4] == $CellValues[5] && $CellValues[5] > 0) return true;
    if ($CellValues[6] == $CellValues[7] && $CellValues[7] == $CellValues[8] && $CellValues[8] > 0) return true;
    if ($CellValues[6] == $CellValues[3] && $CellValues[3] == $CellValues[0] && $CellValues[0] > 0) return true;
    if ($CellValues[7] == $CellValues[4] && $CellValues[4] == $CellValues[1] && $CellValues[1] > 0) return true;
    if ($CellValues[8] == $CellValues[5] && $CellValues[5] == $CellValues[2] && $CellValues[2] > 0) return true;
    if ($CellValues[6] == $CellValues[4] && $CellValues[4] == $CellValues[2] && $CellValues[2] > 0) return true;
    if ($CellValues[0] == $CellValues[4] && $CellValues[4] == $CellValues[8] && $CellValues[8] > 0) return true;
  }
}

function refreshApp() {
  global $ses_id, $pair;
  mysql_query( "delete from hvalues where ses_id = $ses_id" );
  mysql_query( "delete from hvalues where ses_id = $pair" );
  mysql_query( "delete from sessions where id = $ses_id" );
  mysql_query( "delete from sessions where id = $pair" );
}

function startNewGame() {
  global $ses_id;

  // Update database values
  mysql_query( "update hvalues set value = 0, validated = 1 where ses_id = $ses_id" );

  // Update HValueManager and HCSSStyleValues values
  sync_all_js_values();
  zero_all_css_values();

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
    $message = "DRAW!";
    confirmWindow( $message );
    startNewGame();
  }
}

// Outputs a confirmation window with the proper message
function confirmWindow( $message ){
  echo "ConfirmBox = new HWindowControl(new HRect(50,50,370,250),tictactoe.mainwindow,{label: 'Do you want to play more?'});";
  echo "ConfirmMessage = new HStringView(new HRect(50,50,250,70), ConfirmBox.windowView, {value: '$message'} );";
  echo "ConfirmMessage.setStyle('text-align','center');";
  echo "OkButton = new StartNewGameButton(new HRect(50,100,150,125), ConfirmBox.windowView, {label: 'Play'} );";
  echo "CancelButton = new ExitGameButton(new HRect(170,100,270,125), ConfirmBox.windowView, {label: 'Exit'} );";
}
  
// Checks the existence of an application instance
function existApp() {
  global $ses_id;
  $result = mysql_query( "select ses_id from hvalues where ses_id = $ses_id" );
  if ( mysql_num_rows( $result ) > 0 ) {
    return true;
  } else {
    return false;
  }
}
  

$result = mysql_query( "select * from sessions where ses_key = '$ses_key'" );
if( mysql_num_rows( $result ) > 0 ) {
  $ses_id = mysql_result( $result, 0, 'id' );
  $state = mysql_result( $result, 0, 'state' );
  $pair = mysql_result( $result, 0, 'pair' );
  $label = mysql_result( $result, 0, 'label' );
  

  if( $state == 0 ) {
  
    $opponent = find_opponent();
    $existApp = existApp();
    if ( !$existApp ) {
      /** Initialization for a client namespace for common client-server data. **/
      echo "php_db = {};";
      /** Set a new synchronization delay **/
      echo "t.syncDelay=500;";
      echo "t.ses_id='$ses_key';";
      createApp();
    }
    if ($opponent) {
      echo "tictactoe.progressIndicator.setValue(false);";
      echo "tictactoe.loginWindow.die();";
      mysql_query( "update sessions set state = 1 where ses_key = '$ses_key'" );
    }
  }
  if ($state == 1) {

    /********************
    * USER-DEFINED CODE *
    ********************/

    if ( getHSyncData() == true ){
      $player = sync_js_values();
      if ($player){
        sync_player_order($player);
      }

      if ( checkVictory() == true ) {
        if ( $player == 2 ) {
          $message = "Noughts won {O}! Crosses lost {X}...";
        } else {
          $message = "Crosses won {X}! Noughts lost {O}...";
        }
        confirmWindow($message);
        startNewGame();
      } else {
        checkDraw();
      }
    }

  }

  if ( $state == 2 ) {
    refreshApp();
  }
  

}

/********************
*    End            *
*    USER CODE      *
*                   *
********************/


mysql_close( $conn_id );

?>
