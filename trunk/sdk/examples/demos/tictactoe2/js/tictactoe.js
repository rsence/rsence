/***  HIMLE RIA SYSTEM
  ** 
  **  Copyright (C) 2008 HIMLE GROUP http://himle.sorsacode.com/
  **  Copyright (C) 2006-2007 Helmi Technologies Inc.
  ** 
  **  This program is free software; you can redistribute it and/or modify it under the terms
  **  of the GNU General Public License as published by the Free Software Foundation;
  **  either version 2 of the License, or (at your option) any later version. 
  **  This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
  **  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
  **  See the GNU General Public License for more details. 
  **  You should have received a copy of the GNU General Public License along with this program;
  **  if not, write to the Free Software Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
  ***/

// JScript File


ConfirmBox = false;

StartNewGameButton = HClickButton.extend({
	click: function() {
	  if (ConfirmBox){
	    ConfirmBox.die();
	  }
	  window.location.reload();
	}
});

ExitGameButton = HClickButton.extend({
	mouseDown: function(_x,_y,_leftButton) {
	  this.setValue(1);	  
	  tictactoe.progressIndicator.setValue(false);
	  this.app.die();
	  window.home();
	}
});


CellButton = HRadioButton.extend({
  componentName: "tictactoe",
  mouseDown: function(_x, _y, _isLeftButton) {
    if (this.value === 0) {
      this.setValue( label );
      this.setEnabled(false);
    }
  }
});

playerTurn = HControl.extend({
  constructor: function(_parent){
    var _rect = new HRect(_parent.rect);
    _rect.offsetTo(0,0);
    _rect.setSize(_parent.rect.width-150,_parent.rect.height-1);
    this.base(_rect,_parent);
    this.setStyle('cursor','wait');
  },
  
  setValue: function(_value){
    if (_value===1) {
      this.show();
    } else {
      this.hide();
    }
    this.base(_value);
  }
});


TicTacToe = HApplication.extend({
    
  construct_window: function() { 
    // MAIN WINDOW
    this.mainwindow = new HWindowControl( 
      this.windowRect, 
      this, 
      { 
        label:this.windowLabel,
        minSize:[ this.windowRect.width, this.windowRect.height ], 
        maxSize:[ this.windowRect.width, this.windowRect.height ] 
      } 
    );
  },
  
  construct_closebutton: function() {
    // CLOSE BUTTON
    var closeButtonRect = new HRect( 6, 6, 26, 24 );
    closeButtonRect.setLeft( this.windowRect.width-26 );
	this.closeButton = new ExitGameButton( closeButtonRect, this.mainwindow, { label: 'X' } );
  },

  construct_gamefield: function() {  
    // Cell size
    
    var fieldHeight = this.windowRect.height; 
    var fieldWidth = this.windowRect.width - 150;
    
    var cellHeight = Math.round( (fieldHeight-31) / 3);
    var cellWidth   = Math.round( (fieldWidth-10) / 3);
    
    this.cell = [];
    
    // Set offset
    var left = 0;
    var top = 0;


    HThemeManager.setTheme( "tictactoe" );
    HThemeManager.setThemePath( "../themes" );  
    
    // ROW #1
    this.cell[0] = new CellButton ( new HRect ( left, top, cellWidth, cellHeight), this.mainwindow.windowView );    
    var newleft = cellWidth; 
    var newWidth = cellWidth * 2;
    this.cell[1] = new CellButton ( new HRect ( newleft, top, newWidth, cellHeight), this.mainwindow.windowView );
    newleft = cellWidth * 2; 
    newWidth = cellWidth * 3;
    this.cell[2] = new CellButton ( new HRect ( newleft, top, newWidth, cellHeight), this.mainwindow.windowView );
    
    // ROW #2
    var newtop = cellHeight;
    var newHeight = cellHeight * 2;
    this.cell[3] = new CellButton ( new HRect ( left, newtop, cellWidth, newHeight), this.mainwindow.windowView );
    var newleft = cellWidth; 
    var newWidth = cellWidth * 2;
    this.cell[4] = new CellButton ( new HRect ( newleft, newtop, newWidth, newHeight), this.mainwindow.windowView );
    newleft = cellWidth * 2; 
    newWidth = cellWidth * 3;
    this.cell[5] = new CellButton ( new HRect ( newleft, newtop, newWidth, newHeight), this.mainwindow.windowView );

    // ROW #3
    newtop = cellHeight * 2;
    newHeight = cellHeight * 3;
    this.cell[6] = new CellButton ( new HRect ( left, newtop, cellWidth, newHeight), this.mainwindow.windowView );
    var newleft = cellWidth; 
    var newWidth = cellWidth * 2;
    this.cell[7] = new CellButton ( new HRect ( newleft, newtop, newWidth, newHeight), this.mainwindow.windowView );
    newleft = cellWidth * 2; 
    newWidth = cellWidth * 3;
    this.cell[8] = new CellButton ( new HRect ( newleft, newtop, newWidth, newHeight), this.mainwindow.windowView );
    
    

    //Hint field

    HThemeManager.setTheme( "helmiTheme" );
    
    left = fieldWidth + 30;
    top = 20;
    right = left + 80;
    bottom = top + 20;
    this.imagelabel = new HStringView ( new HRect ( left, top, right, bottom ), this.mainwindow.windowView, {value: "Current player:"} );
    
    top = bottom + 10;
    bottom = top + 40;
    
    if ( label == 2 ) {
      var playerImagePath = "../themes/tictactoe/gfx/o.gif";
    } else {
      var playerImagePath = "../themes/tictactoe/gfx/x.gif";
    }
    
    this.player_image = new HImageView ( new HRect ( left + 20, top, right, bottom ), this.mainwindow.windowView, {value: playerImagePath} );

    top = bottom + 10;
    bottom = top + 20;
    this.imagelabel = new HStringView ( new HRect ( left, top, right, bottom ), this.mainwindow.windowView, {value: "Player's turn:"} );
    var _stringElemId = this.imagelabel.stringElementId();
    prop_set(_stringElemId,'color','#ff0000',true);
    this.imagelabel.setStyle('font-weight','bold');
    
    top = bottom + 10;
    bottom = top + 40;
    this.imagehint = new HImageView ( new HRect ( left + 20, top, right, bottom ), this.mainwindow.windowView );
    
    top = bottom + 30;
    bottom = top + 20;
    this.newGameButton = new StartNewGameButton ( new HRect ( left, top, right, bottom ), this.mainwindow.windowView, {label: "New Game"} );
    
    top = bottom + 10;
    bottom = top + 20;
    this.exitGameButton = new ExitGameButton ( new HRect ( left, top, right, bottom ), this.mainwindow.windowView, {label: "Exit Game"} );
    
    this.playerTurn = new playerTurn(this.mainwindow.windowView);

  },
  
  construct_loginWindow: function() {
    this.loginWindow = new HWindowControl( new HRect(50,80,400,210), this.mainwindow ,{label: 'Checking for another opponent...'});
  },
  
  construct_loginProgress: function() {
    this.progressIndicator = new HProgressIndicator(
      new HRect(50, 40, 300, 60),
      this.loginWindow.windowView
    );
    this.progressIndicator.setValue(true);  
  },
    
  construct_cellvalues: function() {

    // CellValues
    cell_1 = php_db.cell_1;
    cell_1.bind(this.cell[0]);
        
    cell_2 = php_db.cell_2;
    cell_2.bind(this.cell[1]);

    cell_3 = php_db.cell_3;
    cell_3.bind(this.cell[2]);

    cell_4 = php_db.cell_4;
    cell_4.bind(this.cell[3]);

    cell_5 = php_db.cell_5;
    cell_5.bind(this.cell[4]);

    cell_6 = php_db.cell_6;
    cell_6.bind(this.cell[5]);

    cell_7 = php_db.cell_7;
    cell_7.bind(this.cell[6]);

    cell_8 = php_db.cell_8;
    cell_8.bind(this.cell[7]);
    
    cell_9 = php_db.cell_9;
    cell_9.bind(this.cell[8]);
  },
  
  construct_cssvalues: function() { 

    // CSSStyleValue
    css_1 = php_db.css_1;
    css_1.bind(this.cell[0]);
        
    css_2 = php_db.css_2;
    css_2.bind(this.cell[1]);

    css_3 = php_db.css_3;
    css_3.bind(this.cell[2]);

    css_4 = php_db.css_4;
    css_4.bind(this.cell[3]);

    css_5 = php_db.css_5;
    css_5.bind(this.cell[4]);

    css_6 = php_db.css_6;
    css_6.bind(this.cell[5]);

    css_7 = php_db.css_7;
    css_7.bind(this.cell[6]);

    css_8 = php_db.css_8;
    css_8.bind(this.cell[7]);
    
    css_9 = php_db.css_9;
    css_9.bind(this.cell[8]);
  },

  
  construct_labelvalue: function() {
    labelvalue = php_db.labelvalue;
    label = labelvalue.get();
  },
  
  construct_hintvalue: function() {
    hintvalue = php_db.hintvalue;
    hintvalue.bind(this.imagehint);
  },

/*  
  construct_exitvalue: function() {
    exitvalue = php_db.exitvalue;
    exitvalue.bind(this.exitGameButton);
  },
*/
  construct_turnvalue: function() {
    turnvalue = php_db.turnvalue;
    turnvalue.bind(this.playerTurn);
  },

  constructor: function( _windowRect, _windowLabel ){
    this.base(10);

    HThemeManager.setThemePath( "../themes" );
    HThemeManager.setTheme( "helmiTheme" );

        
    this.windowRect = _windowRect;
    this.windowLabel = _windowLabel;
    
    
    this.construct_window();
    this.construct_closebutton();
    
    this.construct_labelvalue();
    this.construct_gamefield();
    this.construct_turnvalue();
    this.construct_hintvalue();

    this.construct_loginWindow();
    this.construct_loginProgress();
    
    this.construct_cellvalues();
    this.construct_cssvalues();
    
  }
  
});