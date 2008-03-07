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

CloseButton = HClickButton.extend({
	click: function() {
		this.app.die();
	}
});

CellButton = HRadioButton.extend({
  mouseDown: function(_x, _y, _isLeftButton) {
    if(this.value==0){
      this.setValue(1);
    }
  }
});

TicTacToe = HApplication.extend({

  construct_window: function() { 
    // MAIN WINDOW
    this.mainwindow = new HWindowControl( 
      this.windowRect, 
      this, 
      { label:this.windowLabel,
        minSize:[ this.windowRect.width, this.windowRect.height ], 
        maxSize:[ this.windowRect.width, this.windowRect.height ] 
      } 
    );
  },
  
  construct_closebutton: function() {
    // CLOSE BUTTON
    var closeButtonRect = new HRect( 6, 6, 26, 24 );
    closeButtonRect.setLeft( this.windowRect.width-26 );
	this.closeButton = new CloseButton( closeButtonRect, this.mainwindow, { label: 'X' } );
  },
  
  construct_gamefield: function() {  
    // Cell size
    var cellHeight = Math.round( (this.windowRect.height-31) / 3);
    var cellWidth   = Math.round( (this.windowRect.width-10) / 3);
    
    this.cell = [];
    
    // Set offset
    var left = 0;
    var top = 0;

    HThemeManager.setTheme( "tictactoe" );
    HThemeManager.setThemePath( "/sergey/tictactoe" );  
    
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
  },
  
  construct_cellvalues: function() {

    // CellValues
    cellvalue0 = php_db.cellvalue0;
    cellvalue0.bind(this.cell[0]);
        
    cellvalue1 = php_db.cellvalue1;
    cellvalue1.bind(this.cell[1]);

    cellvalue2 = php_db.cellvalue2;
    cellvalue2.bind(this.cell[2]);

    cellvalue3 = php_db.cellvalue3;
    cellvalue3.bind(this.cell[3]);

    cellvalue4 = php_db.cellvalue4;
    cellvalue4.bind(this.cell[4]);

    cellvalue5 = php_db.cellvalue5;
    cellvalue5.bind(this.cell[5]);

    cellvalue6 = php_db.cellvalue6;
    cellvalue6.bind(this.cell[6]);

    cellvalue7 = php_db.cellvalue7;
    cellvalue7.bind(this.cell[7]);
    
    cellvalue8 = php_db.cellvalue8;
    cellvalue8.bind(this.cell[8]);
  },
  
  construct_cssvalues: function() { 

    // CSSStyleValue
    cssvalue0 = php_db.cssvalue0;
    cssvalue0.bind(this.cell[0]);
        
    cssvalue1 = php_db.cssvalue1;
    cssvalue1.bind(this.cell[1]);

    cssvalue2 = php_db.cssvalue2;
    cssvalue2.bind(this.cell[2]);

    cssvalue3 = php_db.cssvalue3;
    cssvalue3.bind(this.cell[3]);

    cssvalue4 = php_db.cssvalue4;
    cssvalue4.bind(this.cell[4]);

    cssvalue5 = php_db.cssvalue5;
    cssvalue5.bind(this.cell[5]);

    cssvalue6 = php_db.cssvalue6;
    cssvalue6.bind(this.cell[6]);

    cssvalue7 = php_db.cssvalue7;
    cssvalue7.bind(this.cell[7]);
    
    cssvalue8 = php_db.cssvalue8;
    cssvalue8.bind(this.cell[8]);
  },

  constructor: function( _windowRect, _windowLabel ){
    this.base(10);

    HThemeManager.setTheme( "helmiTheme" );
    HThemeManager.setThemePath( "/sergey/latest" );
    
    this.windowRect = _windowRect;
    this.windowLabel = _windowLabel;
    
    this.construct_window();
    this.construct_closebutton();
    this.construct_gamefield();
    this.construct_cellvalues();
    this.construct_cssvalues();
  }
  
});