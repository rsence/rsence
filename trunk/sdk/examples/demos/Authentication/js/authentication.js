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

localizable.prefs   = {
  main_window_rect:   [10,10,230,180]
};

localizable.strings = {
  main_window_title:  'Login Please',
  username_label:     'Username',
  password_label:     'Password',
  username_seed:      'first.last@helmi.com',
  password_seed:      'pöllö',
  button_label:       'Login',
  help: "<b>Authentication</b> <b>Playground</b>."
};
var idle = 0;

VAuthenticationTest = HApplication.extend({

  constructor: function(){
    this.uiCreated = false;
    
    this.base( 10 );
    
    this.makeMainView();
    this.makeHelp();
    this.makeFields();
    this.makeValues();
    
    this.decorate();
    
    this.uiCreated = true;
  },

  onIdle: function(){
    
    if (!this.uiCreated) {
      return;
    }
    
      idle++;

      if(this.mainViewWidth != this.mainView.rect.width ){
          
        this.mainViewWidth = this.mainView.rect.width;
//        this.helpViewRect.setWidth( this.mainViewWidth - 24 );
//        this.helpView.drawRect();

//        var _fieldWidth =  this.mainViewWidth - 144;
      }
       if (this.textUsername.value && this.textPassword.value) {
          // enable login button in case both fields are filled
          this.enabled = 'true';
       } else {
		  this.enabled = 'false';
	   }
   	   this.login.setEnabled(this.enabled);
	   
      window.status   = 'running.... idle: '+idle +this.enabled + ' u: ' + this.textUsername.value + ' p: ' + this.textPassword.value;
  },
  
  makeHelp: function(){
/* place holder in case this "helper" is needed.   
    this.helpViewRect = new HRect(
      this.mainView.rect
    );
    this.helpViewRect.offsetTo( -4, 0 );
    this.helpViewRect.insetBy(   10, 245 );
    this.helpViewRect.setHeight( 20 );
    this.helpView = new HStringView(
      this.helpViewRect,
      this.mainView, {
        value: localizable.strings.help
      }
    );
*/
  },

  makeMainView: function(){
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
    
    this.mainView      = this.appWindow.windowView;
    
    this.mainViewWidth = this.mainView.rect.width;
    
  },

  makeFields: function(){
    var fieldRect = new HRect( this.mainView.rect );


   // Create TextControl for username and label
   this.stringUsername = new HStringView(
      new HRect(6,6,200,26), // left, top, right, bottom
      this.mainView,                // parent
      {value:localizable.strings.username_label}
    );
   this.textUsername = new HTextControl(
     new HRect(6,30,200,50), // left, top, right, bottom
     this.mainView,                // parent
     {value:localizable.strings.username_seed}  // inital value
   );

  // Create TextControl for password and label
   this.stringPassword = new HStringView(
      new HRect(6,54,200,74), // left, top, right, bottom
      this.mainView,                // parent
      {value:localizable.strings.password_label}
    );
  
   this.textPassword = new HPasswordControl(
     new HRect(6,78,200,98), // left, top, right, bottom
     this.mainView,          // parent
     {value:localizable.strings.password_seed}              // value
   );

   // Create login button and click action for it
   var _that = this;
   this.login = new HClickButton( new HRect(80,106,120,126),
      this.mainView, {
         label: localizable.strings.button_label,
         action: function() {
           if (_that.textUsername.value && _that.textPassword.value) {
             alert('Username:\n'+_that.textUsername.value+'\n'+'Password:\n'+_that.textPassword.value);
           }
         }
     });

  },
  
  makeValues: function(){
    // The value item
	this.textUsernameValue = new HValue( null, localizable.strings.username_seed);
	this.textUsernameValue.bind(this.textUsername);

	this.textPasswordValue = new HValue( null, localizable.strings.password_seed);
	this.textPasswordValue.bind(this.textPassword);
  },

  
  makeCloseButton: function(){
    var _closeButtonRect = new HRect(0,0,21,21);
    this.closeButton = new (HClickButton.extend({
      click: function(){
        this.app.die();
        window.status = 'killed.';
      }
    }))( _closeButtonRect, this.appWindow.windowBar, { label: 'X' } );
  },
  
  decorate: function(){
    
    this.mainView.setStyle( 'overflow',         'hidden'          );
/* in case helper is needed
    this.helpView.setStyle( 'border',           '1px solid #ccc'  );
    this.helpView.setStyle( 'padding',          '2px'             );
    this.helpView.setStyle( 'overflow-y',       'auto'            );
    this.helpView.setStyle( 'background-color', '#ffc'            );
*/     
    this.makeCloseButton();
  }
});

