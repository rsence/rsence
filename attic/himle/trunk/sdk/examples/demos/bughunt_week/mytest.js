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

// JavaScript

CloseButton = HClickButton.extend({
	click: function() {
		this.app.die();
	}
});

RadioButton = HRadioButton.extend( HValueMatrixComponentExtension );

MyFormHandlingApp = HApplication.extend({
										
	makeTheWindows: function( theWindowTitle, windowWidth, windowHeight ) {
		leftP = 10;
		topP = 10;
		rightP = windowWidth + leftP;
		bottomP = windowHeight + topP;
		this.windowRect = new HRect( leftP, topP, rightP, bottomP );
		this.mainWindow = new HWindow( this.windowRect, this, { label: theWindowTitle} );
	},
	
	makeTheButtons: function() {
		var closeButtonRect = new HRect( 4, 4, 25, 25 );
		this.closeButton = new CloseButton( closeButtonRect, this.mainWindow, { label: 'X' } );
	},
	
	makeTheSlider: function() {
		var sliderRect = new HRect( 8, 8, 208, 29 );
		this.slider = new HSlider( sliderRect, this.tokaTab, {
			minValue: 0,
			maxValue: 100,
			value: 50
		});
	},
	
	makeTheFields: function() {
		var textRect = new HRect( 8, 8, 200, 29 );
		this.textField = new HTextControl( textRect, this.ekaTab, {} );
		
		var nameFieldRect = new HRect( 108, 40, 300, 61 );
		this.nameField = new HTextControl( nameFieldRect, this.ekaTab, {} );
		
		var nameFieldLabelRect = new HRect( 8, 40, 100, 61 );
		this.nameFieldLabel = new HStringView( nameFieldLabelRect, this.ekaTab, { value: 'Your name' } );
		
		var sliderValueRect = new HRect( 224, 8, 200, 29 );
		this.sliderValueField = new HStringView( sliderValueRect, this.tokaTab, {} );
		
		var radiobutton1value = new HValue('dummyId',true);
		this.radiobutton1 = new RadioButton( new HRect(8,80,28,100), this.ekaTab );
		//this.radiobutton1.setValueMatrix(myMultiValue);
		
		var radiobutton2value = new HValue('dummyId',false);
		this.radiobutton2 = new RadioButton( new HRect(30,80,50,100), this.ekaTab );
		//this.radiobutton2.setValueMatrix(myMultiValue);

		
		
	},
	
	makeTheValues: function( theWindowTitle ) {
		this.textFieldValue = new HValue( this.valueIDs.windowTitle, theWindowTitle );
		this.textFieldValue.bind( this.textField );
		
		this.nameFieldValue = new HValue( this.valueIDs.nameFieldValue, 'test' );
		this.nameFieldValue.bind( this.nameField );

		this.sliderValue = new HValue( this.valueIDs.sliderValue, 50 );
		this.sliderValue.bind( this.sliderValueField );
		this.sliderValue.bind( this.slider );
		
	},
	
	makeTheTabs: function() {
		var tabRect = new HRect( this.mainWindow.windowView.rect );
		tabRect.offsetTo( 0, 0 );
		tabRect.insetBy( 16, 16 );
		this.tabs = new HTabControl( tabRect, this.mainWindow.windowView );
		var ekaTabID = this.tabs.addTab( null, true, 'Eka', 50 );
		this.ekaTab = this.tabs.tabs[ ekaTabID ];
		var tokaTabID = this.tabs.addTab( null, false, 'Toka', 50 );
		this.tokaTab = this.tabs.tabs[ tokaTabID ];
	},

// CONSTRUCTOR
	constructor: function( windowTitle, windowWidth, windowHeight, valueIDs ) {
		this.base( 100 );
		this.makeTheWindows( windowTitle, windowWidth, windowHeight );
		//this.makeTheTabs();

		this.originalTitle = windowTitle;
		this.valueIDs = valueIDs;


		this.myMatrixContainerValue = new HValue('dummyParentId',-1);
  		var myMultiValue = new HValueMatrix( );
		this.myMatrixContainerValue.bind( myMultiValue );

		this.makeTheButtons();
		//this.makeTheFields();
		//this.makeTheSlider();
		//this.makeTheValues( windowTitle );
		

	},
	
	onIdle: function() {
		date = new Date();
		//window.status = date.getMilliseconds();
		this.base();
		//tVal = ( this.textFieldValue.value != "" ) ? ' - ' + this.textFieldValue.value : '';
		//sVal = " - " + Math.round( this.sliderValue.value );
		/*this.mainWindow.setLabel( this.originalTitle +
								 " - " + zeroise( date.getHours() ) +
								 ":" + zeroise( date.getMinutes() ) +
								 ":" + zeroise( date.getSeconds() ) +
								 tVal +
								 sVal
		
		); */
	}
});

function zeroise( n ) {
	if( n < 10 ) n = "0" + n;
	return n;
}

