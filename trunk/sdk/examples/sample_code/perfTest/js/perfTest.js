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

var localizable = {};

/*
localizable.prefs   = {
  main_window_rect:   [10,10,710,320]
};
*/
localizable.strings = {
  main_window_title:  'Performance Test',
  help: "<b>Performance</b> <b>Playground</b>."
};

var _baseX   = 10; // widget base origin X
var _baseY   = 50; // widget base origin Y
var _fieldW  = 80; // text field width
var _fieldH  = 20; // text field height
var _fieldS  =  2; // spacing between fields
var _buttonW = 64; // button width
var _buttonH = 24; // button height
var _buttonS = 5;  // spacing between buttons

var _rows = 9;
var _columns = 9;
var _loopMax = _rows * _columns;

var _nTextControl = new Array(_loopMax);

localizable.prefs   = {
  main_window_rect:   [
    10,
    10,
    40+_columns*(_fieldW+_fieldS),
    100+_rows*(_fieldH+_fieldS)
  ]
};

var idle = 0;


PerformanceTest = HApplication.extend({
  
  gridSizeValueId: "gridsize.id",
  commandValueId: "command.id",
  
  constructor: function() {
    this.uiCreated = false;
    
    this.base(10);
    
    this.makeMainView();
    
    this.makeInitialState();
    
    this.decorate();
  },
  
  
  makeInitialState: function() {
    
    this.commandValue = new HValue(this.commandValueId);
    
    this.gridStringValue = new HValue(this.gridSizeValueId);
    
    this.gridLabel = new HStringView( new HRect(5, 5, 125, 25),
      this.mainView, {
      value: "Number of fields in a row: "
    });
    
    this.gridLabel.refresh();
    
    var x = this.gridLabel.rect.right + 5;
    
    this.gridString = new HTextControl( new HRect(x, 5, x + 70, 25),
      this.mainView, {
        value: ""
    });
    
    x = this.gridString.rect.right + 5;
    
    var _that = this;
    this.generateButton = new HClickButton( new HRect(x, 5, x + 80, 25),
      this.mainView, {
        label: "Generate",
        action: function() {
          if (_that.gridString.value) {
            _that.gridStringValue.set(_that.gridString.value);
          }
        }
    });

  },
  
  
  makeSecondState: function() {
    
    _rows = this.gridStringValue.get();
    _columns = _rows;
    _loopMax = _rows * _columns;

    
    this.gridLabel.die();
    this.gridString.die();
    this.generateButton.die();
    
    this.makeFields();
    this.makeValues();
    
    this.uiCreated = true;
  },
  
  
  onIdle: function() {
    
    
    // Process server commands.
    if (this.commandValue && this.commandValue.get()) {
      eval(this.commandValue.get());
      this.commandValue.set("");
    }
    
    
    if (!this.uiCreated) {
      return;
    }
    
    idle++;

    if(this.mainView && this.mainView.rect &&
      this.mainViewWidth != this.mainView.rect.width ) {
        
      this.mainViewWidth = this.mainView.rect.width;
    }
    
    var diff = 0;

    for(i=0; i < _loopMax; i++){
       var _start = new Date();    //today's date
       _nTextControl[i].setValue( diff+" i: "+idle+"v:"+i);
       var _end = new Date();    //today's date
       diff = _end-_start;
    }
    window.status   = 'running.... idle: '+idle;
  },
  
  
  makeHelp: function() {
  },

  makeMainView: function() {
    var _coordPrefs = localizable.prefs.main_window_rect;
    
    this.prefsRect = new HRect(
      _coordPrefs[0],
      _coordPrefs[1],
      _coordPrefs[2],
      _coordPrefs[3]
    );
    
    this.appWindow  = new HWindow(
      this.prefsRect,
      this, {
        label:   localizable.strings.main_window_title,
        minSize: [
          _coordPrefs[2] - _coordPrefs[0],
          _coordPrefs[3] - _coordPrefs[1]
        ]
      }
    );
    
    this.mainView = this.appWindow.windowView;
    
    this.mainViewWidth = this.mainView.rect.width;
    
  },

  makeFields: function() {
    var fieldRect = new HRect( this.mainView.rect );
    
    var x = 1;
    var y = 1;
    var i = 0;
    var ycoor = _baseY;
    var xcoor  = _baseX;
    var diff = 0;
    
    var _start = new Date();    //today's date
    _timeSpent = "";
    for(x = 1; x <= _columns; x++) {
      for(y = 1; y <= _rows; y++) {
         
        var begin = new Date();
        _nTextControl[i] = new HTextControl( 
          new HRect(xcoor,ycoor,xcoor+_fieldW,ycoor+_fieldH), // left, top, right, bottom
          this.mainView,          // parent
          {value:"t: " +i +" "+diff}   // inital value
        );
        
        var end = new Date();
        var diff = end-begin;
        ycoor = ycoor + _fieldH + _fieldS;
        
        i++;
      }
      
      xcoor = xcoor + _fieldW + _fieldS;
      ycoor = _baseY;
    }
  
  },
  
  makeValues: function() {
    
    for(var i=0; i < _loopMax; i++) {
      this.nValue = new HValue( 'n'+i,i );
      this.nValue.bind(_nTextControl[i]);
    }
    
  },
  
  
  makeCloseButton: function() {
    var _closeButtonRect = new HRect(0, 0, 21, 21);
    this.closeButton = new (HClickButton.extend({
      click: function() {
        this.app.die();
        window.status = 'killed.';
      }
    }))( _closeButtonRect, this.appWindow.windowBar, { label: 'X' } );
  },
  
  
  decorate: function() {
    this.mainView.setStyle('overflow', 'hidden');
    this.makeCloseButton();
  }
  
  
});

