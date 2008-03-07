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

PasswordGeneratorRough = HApplication.extend({
  
  constructor: function(){
    this.base( 10 );
    this.makeMainView();
    this.makeHelp();
    this.makeFields();
    this.makeValues();
    this.makeHashers();
  },
  
  makeHashers: function(){
    this.siteHasher = new Hasher( this.siteHashValue );
    this.siteValue.bind( this.siteHasher );
    
    this.masterHasher = new Hasher( this.masterHashValue );
    this.masterValue.bind( this.masterHasher );
    
    this.passHasher = new PassHasher(
      this.siteHashValue,
      this.masterHashValue,
      this.passHash,
      this.lenValue
    );
    this.passHasher.onIdle();
  },
  
  makeValues: function(){
    this.siteValue = new HValue( 'site_name', localizable.prefs.default_site );
    this.siteValue.bind( this.siteField );
    this.siteHashValue = new HValue( 'site_hash', '' );
    this.masterValue = new HValue( 'master_pass', localizable.prefs.default_pass );
    this.masterValue.bind( this.masterField );
    this.masterHashValue = new HValue( 'master_hash', '' );
    this.passHash = new HValue( 'generated_password', '' );
    this.passHash.bind( this.passField );
    this.lenValue = new IntRangeValue( 'password_length', 27, 1, 27);
    this.lenValue.bind( this.lenSlider );
    this.lenValue.bind( this.lenText );
  },
  
  makeFields: function(){
    var descrRect = new HRect( 8, 8, 120, 28 );
    descrRect.offsetBy( 0, 75 );
    
    var fieldRect = new HRect( this.mainView.rect );
    fieldRect.insetBy( 8, 8 );
    fieldRect.offsetTo( 0, 0 );
    fieldRect.setLeft( 128 );
    fieldRect.setTop(  descrRect.top - 2 );
    fieldRect.setHeight( 22 );
    
    this.siteTitle = new HStringView( new HRect( descrRect ), this.mainView, {
      value: localizable.strings.site_title
    });
    
    this.siteField = new HTextControl( new HRect( fieldRect ), this.mainView, {
      value: localizable.prefs.default_site
    });
    fieldRect.offsetBy( 0, 25 );
    
    descrRect.offsetBy( 0, 25 );
    this.masterTitle = new HStringView( new HRect( descrRect ), this.mainView, {
      value: localizable.strings.master_pass_title
    });
    
    this.masterField = new HTextControl( new HRect( fieldRect ), this.mainView, {
      value: localizable.prefs.default_pass
    });
    descrRect.offsetBy( 0, 25 );
    fieldRect.offsetBy( 0, 25 );
    this.lenTitle = new HStringView( new HRect( descrRect), this.mainView, {
      value: localizable.strings.length_title
    });
    
    var lenSliderRect = new HRect( fieldRect );
    lenSliderRect.offsetBy( 40, 0 );
    lenSliderRect.setWidth( fieldRect.width - 40 );
    
    this.lenSlider = new HSlider( lenSliderRect, this.mainView, {
      value: 27,
      minValue: 1,
      maxValue: 27
    });
    
    var lenTextRect = new HRect( fieldRect );
    lenTextRect.setWidth( 40 );
    
    this.lenText = new HTextControl( lenTextRect, this.mainView, {
      value: 27
    });
    
    fieldRect.offsetBy( 0, 25 );
    
    descrRect.offsetBy( 0, 25 );
    this.passTitle = new HStringView( new HRect( descrRect ), this.mainView, {
      value: localizable.strings.generated_title
    });
    
    this.passField = new HTextControl( new HRect( fieldRect ), this.mainView, {
      value: localizable.strings.nothing_yet
    });
    
  },
  
  makeHelp: function(){
    this.helpViewRect = new HRect(
      this.mainView.rect
    );
    this.helpViewRect.offsetTo( -4, 0 );
    this.helpViewRect.insetBy(   12, 8 );
    this.helpViewRect.setHeight( 55 );
    this.helpView = new HStringView(
      this.helpViewRect,
      this.mainView, {
        value: localizable.strings.help
      }
    );
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
  
  onIdle: function(){
    if( this.mainViewWidth != this.mainView.rect.width ){
      this.mainViewWidth = this.mainView.rect.width;
      this.helpViewRect.setWidth( this.mainViewWidth - 24 );
      this.helpView.drawRect();
      var _fieldWidth =  this.mainViewWidth - 144;
      this.siteField.rect.setWidth(   _fieldWidth );
      this.siteField.drawRect();
      this.masterField.rect.setWidth( _fieldWidth );
      this.masterField.drawRect();
      this.passField.rect.setWidth(   _fieldWidth );
      this.passField.drawRect();
      this.lenSlider.rect.setWidth(   _fieldWidth - 40 );
      this.lenSlider.drawRect();
    }
  }
});

PasswordGeneratorStyled = PasswordGeneratorRough.extend({
  
  makeCloseButton: function(){
    var _closeButtonRect = new HRect(0,0,21,21);
    this.closeButton = new (HClickButton.extend({
      click: function(){
        this.app.passHasher.die();
        this.app.die();
        window.status = 'killed.';
      }
    }))( _closeButtonRect, this.appWindow.windowBar, { label: 'X' } );
  },
  
  decorate: function(){
    
    this.mainView.setStyle( 'overflow',         'hidden'          );
    this.helpView.setStyle( 'border',           '1px solid #ccc'  );
    this.helpView.setStyle( 'padding',          '2px'             );
    this.helpView.setStyle( 'overflow-y',       'auto'            );
    this.helpView.setStyle( 'background-color', '#ffc'            );
    
    this.siteTitle.setStyle(    'text-align', 'right'   );
    this.masterTitle.setStyle(  'text-align', 'right'   );
    this.lenTitle.setStyle(     'text-align', 'right'   );
    this.lenText.setStyle(      'text-align', 'center'  );
    this.passTitle.setStyle(    'text-align', 'right'   );
    
    this.makeCloseButton();
  },
  
  constructor: function(){
    this.base();
    this.decorate();
  }
});


PasswordGenerator = PasswordGeneratorStyled;

