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
  main_window_rect:   [10,10,710,320]
};

localizable.strings = {
  main_window_title:  'vCard test',
  help: "<b>vCard</b> <b>Playground</b>."
};
var idle = 0;


VCardTest = HApplication.extend({

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

      window.status   = 'running.... idle: '+idle + ' search: ' + this.searchString.value;
  },
  
  makeHelp: function(){
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

// Search - string
   this.searchString = new HTextControl( new HRect(6, 6, 306, 25),
     this.mainView,
	 {value: "SEARCH STRING"}
	);

// Current record / Found Records  
  this.current = new HStringView( 
    new HRect(360,6,400,25), // left, top, right, bottom
    this.mainView,          // parent
    {value:"10"}   // inital value
  );

  this.found = new HStringView( 
    new HRect(390,6,420,25), // left, top, right, bottom
    this.mainView,          // parent
    {value:"100"}   // inital value
  );

// Previous Button
    this.prevButton = new HClickButton( new HRect(326, 6, 350, 25),
	  this.mainView,
	  {label: "<<"}
	);
    
// Next Button
    this.nextButton = new HClickButton( new HRect(426, 6, 450, 25),
	  this.mainView,
	  {label: ">>"}
  );


// Results:

  this.tabs = new HTabControl(new HRect(6, 30, 683, 260), this.mainView);

// Identification; n, fn, nickname, photo,bday

  this.tab1Ident = this.tabs.addTab(
    null,               // let the tabcontrol make a default view
    false,              // select it on creation
    'identification',   // title of the tab label
    96                  // width needed to display the tab label
  );
  // HStringView
  
  
  this.n = new HStringView( 
    new HRect(10,10,150,30), // left, top, right, bottom
    this.tabs.tabs[this.tab1Ident],          // parent
    {value:"N Type Definition"}   // inital value
  );

  this.fn = new HStringView( 
    new HRect(10,30,150,50), // left, top, right, bottom
    this.tabs.tabs[this.tab1Ident],          // parent
    {value:"FN Type Definition"}   // inital value
  );

  this.nickname = new HStringView( 
    new HRect(10,50,150,70), // left, top, right, bottom
    this.tabs.tabs[this.tab1Ident],          // parent
    {value:"NICKNAME Type Definition"}   // inital value
  );

  this.bday = new HStringView( 
    new HRect(10,70,150,90), // left, top, right, bottom
    this.tabs.tabs[this.tab1Ident],          // parent
    {value:"BDAY Type Definition"}   // inital value
  );

  var path = "http://www.w3schools.com/js/planets.gif";

  this.photo = new HImageView( 
    new HRect(180,10,270,100), // left, top, right, bottom
    this.tabs.tabs[this.tab1Ident],          // parent
    {value: path}   // inital value
  );

// Delivery Addressing; adr, label
  this.tab2Add = this.tabs.addTab(
    null,               // let the tabcontrol make a default view
    false,              // select it on creation
    'Addressing',   // title of the tab label
    96                  // width needed to display the tab label
  );

  this.adr = new HStringView( 
    new HRect(10,10,150,60), // left, top, right, bottom
    this.tabs.tabs[this.tab2Add],          // parent
    {value:"ADR Type Definition"}   // inital value
  );

  this.label = new HStringView( 
    new HRect(10,30,150,60), // left, top, right, bottom
    this.tabs.tabs[this.tab2Add],          // parent
    {value:"LABEL Type Definition"}   // inital value
  );

// Telecommunications Addressing; Tel, email, mailer
  this.tab3Tele = this.tabs.addTab(
    null,               // let the tabcontrol make a default view
    false,              // select it on creation
    'Telecommunication',   // title of the tab label
    116                  // width needed to display the tab label
  );

  this.tel = new HStringView( 
    new HRect(10,10,150,30), // left, top, right, bottom
    this.tabs.tabs[this.tab3Tele],          // parent
    {value:"TEL Type Definition"}   // inital value
  );

  this.email = new HStringView( 
    new HRect(10,30,150,50), // left, top, right, bottom
    this.tabs.tabs[this.tab3Tele],          // parent
    {value:"EMAIL Type Definition"}   // inital value
  );

  this.mailer = new HStringView( 
    new HRect(10,50,150,70), // left, top, right, bottom
    this.tabs.tabs[this.tab3Tele],          // parent
    {value:"MAILER Type Definition"}   // inital value
  );

// Geographical; tz, geo
  this.tab4Geo = this.tabs.addTab(
    null,               // let the tabcontrol make a default view
    false,              // select it on creation
    'Geographical',   // title of the tab label
    96                  // width needed to display the tab label
  );
  this.tz = new HStringView( 
    new HRect(10,10,150,30), // left, top, right, bottom
    this.tabs.tabs[this.tab4Geo],          // parent
    {value:"TZ Type Definition"}   // inital value
  );

  this.geo = new HStringView( 
    new HRect(10,30,150,50), // left, top, right, bottom
    this.tabs.tabs[this.tab4Geo],          // parent
    {value:"GEO Type Definition"}   // inital value
  );

// Organizational; title, role, logo, agent, org
  this.tab5Org = this.tabs.addTab(
    null,               // let the tabcontrol make a default view
    false,              // select it on creation
    'Organizational',   // title of the tab label
    96                  // width needed to display the tab label
  );
  this.title = new HStringView( 
    new HRect(10,10,150,60), // left, top, right, bottom
    this.tabs.tabs[this.tab5Org],          // parent
    {value:"TITLE Type Definition"}   // inital value
  );

  this.role = new HStringView( 
    new HRect(10,30,150,60), // left, top, right, bottom
    this.tabs.tabs[this.tab5Org],          // parent
    {value:"ROLE Type Definition"}   // inital value
  );

  this.logo = new HStringView( 
    new HRect(10,50,150,70), // left, top, right, bottom
    this.tabs.tabs[this.tab5Org],          // parent
    {value:"LOGO Type Definition"}   // inital value
  );

  this.agent = new HStringView( 
    new HRect(10,70,150,90), // left, top, right, bottom
    this.tabs.tabs[this.tab5Org],          // parent
    {value:"AGENT Type Definition"}   // inital value
  );

  this.org = new HStringView( 
    new HRect(10,90,150,110), // left, top, right, bottom
    this.tabs.tabs[this.tab5Org],          // parent
    {value:"ORG Type Definition"}   // inital value
  );

// Explanatory; categories, note, prodid, rev, sort-string, sound, UID, URL, version
  this.tab6Exp = this.tabs.addTab(
    null,               // let the tabcontrol make a default view
    false,              // select it on creation
    'Explanatory',      // title of the tab label
    96                  // width needed to display the tab label
  );

  this.categories = new HStringView( 
    new HRect(10,10,150,60), // left, top, right, bottom
    this.tabs.tabs[this.tab6Exp],          // parent
    {value:"CATEGORIES Type Definition"}   // inital value
  );

  this.note = new HStringView( 
    new HRect(10,30,150,60), // left, top, right, bottom
    this.tabs.tabs[this.tab6Exp],          // parent
    {value:"NOTE Type Definition"}   // inital value
  );

  this.prodid = new HStringView( 
    new HRect(10,50,150,70), // left, top, right, bottom
    this.tabs.tabs[this.tab6Exp],          // parent
    {value:"PRODID Type Definition"}   // inital value
  );

  this.rev = new HStringView( 
    new HRect(10,70,150,90), // left, top, right, bottom
    this.tabs.tabs[this.tab6Exp],          // parent
    {value:"REV Type Definition"}   // inital value
  );

  this.sortstring = new HStringView( 
    new HRect(10,90,150,110), // left, top, right, bottom
    this.tabs.tabs[this.tab6Exp],          // parent
    {value:"SORT-STRING Type Definition"}   // inital value
  );
  
  this.sound = new HStringView( 
    new HRect(10,110,150,130), // left, top, right, bottom
    this.tabs.tabs[this.tab6Exp],          // parent
    {value:"SOUND Type Definition"}   // inital value
  );

  this.uid = new HStringView( 
    new HRect(10,130,150,150), // left, top, right, bottom
    this.tabs.tabs[this.tab6Exp],          // parent
    {value:"UID Type Definition"}   // inital value
  );

  this.url = new HStringView( 
    new HRect(10,150,150,170), // left, top, right, bottom
    this.tabs.tabs[this.tab6Exp],          // parent
    {value:"URL Type Definition"}   // inital value
  );

  this.ver = new HStringView( 
    new HRect(10,170,150,190), // left, top, right, bottom
    this.tabs.tabs[this.tab6Exp],          // parent
    {value:"VERSION Type Definition"}   // inital value
  );


// Explanatory; class, key
  this.tab7Sec = this.tabs.addTab(
    null,               // let the tabcontrol make a default view
    false,              // select it on creation
    'Security',      // title of the tab label
    96                  // width needed to display the tab label
  );
  this.klass = new HStringView( 
    new HRect(10,10,150,60), // left, top, right, bottom
    this.tabs.tabs[this.tab7Sec],          // parent
    {value:"CLASS Type Definition"}   // inital value
  );

  this.key = new HStringView( 
    new HRect(10,30,150,60), // left, top, right, bottom
    this.tabs.tabs[this.tab7Sec],          // parent
    {value:"KEY Type Definition"}   // inital value
  );

  },
  
  makeValues: function(){
    // The value item
	this.searchStringValue = new HValue( null, 'look-up-string-to-search-joe-doe');
	this.searchStringValue.bind(this.searchString);

	this.currentValue = new HValue( 'current', '6');
	this.currentValue.bind(this.current);

	this.foundValue = new HValue( 'found', '66');
	this.foundValue.bind(this.found);

    this.nValue = new HValue( 'n','VCARD' );
    this.nValue.bind(this.n);

    this.fnValue = new HValue( 'fn','Joe Doe' );
    this.fnValue.bind(this.fn);

    this.nicknameValue = new HValue( 'nickname','Joe the DOE' );
    this.nicknameValue.bind(this.nickname);

    this.bdayValue = new HValue( 'bday','18-09-1962' );
    this.bdayValue.bind(this.bday);

    this.adrValue = new HValue( 'adr','Tallberginkatu 2A, 00180 Helsinki, Finland' );
    this.adrValue.bind(this.adr);

    this.labelValue = new HValue( 'label','label value ??' );
    this.labelValue.bind(this.label);

    this.telValue = new HValue( 'tel','+358 400 550962' );
    this.telValue.bind(this.tel);

    this.emailValue = new HValue( 'email','joe.doe@helmi.com' );
    this.emailValue.bind(this.email);

    this.mailerValue = new HValue( 'mailer','mailer value ??' );
    this.mailerValue.bind(this.mailer);

    this.tzValue = new HValue( 'tz','GMT+2' );
    this.tzValue.bind(this.tz);

    this.geoValue = new HValue( 'geo','geo value ??' );
    this.geoValue.bind(this.geo);

    this.titleValue = new HValue( 'title','COO' );
    this.titleValue.bind(this.title);

    this.roleValue = new HValue( 'role','role value ??' );
    this.roleValue.bind(this.role);

    this.logoValue = new HValue( 'logo','logo value should be a image ??' );
    this.logoValue.bind(this.logo);

    this.agentValue = new HValue( 'agent','agent value ??' );
    this.agentValue.bind(this.agent);

    this.orgValue = new HValue( 'org','Helmi Technologies Oy' );
    this.orgValue.bind(this.org);

    this.categoriesValue = new HValue( 'categories','categories value ??' );
    this.categoriesValue.bind(this.categories);

    this.noteValue = new HValue( 'note','note value ??' );
    this.noteValue.bind(this.note);

    this.prodidValue = new HValue( 'prodid','prodid value ??' );
    this.prodidValue.bind(this.prodid);

    this.revValue = new HValue( 'rev','rev value ??' );
    this.revValue.bind(this.rev);

    this.sortstringValue = new HValue( 'sortstring','sort-string value ??' );
    this.sortstringValue.bind(this.sortstring);

    this.soundValue = new HValue( 'sound','sound value ??' );
    this.soundValue.bind(this.sound);

    this.uidValue = new HValue( 'uid','joedoe' );
    this.uidValue.bind(this.uid);

    this.urlValue = new HValue( 'url','www.helmi.com' );
    this.urlValue.bind(this.url);

    this.verValue = new HValue( 'ver','2.1' );
    this.verValue.bind(this.ver);

    this.classValue = new HValue( 'class','class value ??' );
    this.classValue.bind(this.klass);

    this.keyValue = new HValue( 'key','key value ??' );
    this.keyValue.bind(this.key);
  },

  
  makeCloseButton: function(){
    var _closeButtonRect = new HRect(0,0,21,21);
    this.closeButton = new (HClickButton.extend({
      click: function(){
//        this.app.passHasher.die();
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
     
    this.makeCloseButton();
  }
});

