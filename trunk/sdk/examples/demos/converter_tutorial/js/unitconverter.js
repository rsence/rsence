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


unitConverterConfig = {
  themePath:   '../../release/latest/themes',
  windowLabel: 'Unit Converter',
  unitLabel:   'Convert:',
  unitValue:    new HValue('conversionUnit', 1.5),
  fromValue:    new HValue('fromValue', 100),
  toValue:      new HValue('toValue',   150),
  unitConversions: [
    { value: 0.394,
      label: 'Centimeters &#x2192; Inches'   },
    { value: 2.54,
      label: 'Inches &#x2192; Centimeters'   },
    { value: 3.28,
      label: 'Meters &#x2192; Feet'   },
    { value: 0.305,
      label: 'Feet &#x2192; Meters'   },
    { value: 0.621,
      label: 'Kilometers &#x2192; Miles'   },
    { value: 1.61,
      label: 'Miles &#x2192; Kilometers'   },
    
    { value: 0.035273962,
      label: 'Grams &#x2192; Ounces'   },
    { value: 28.349523,
      label: 'Ounces &#x2192; Grams'   },
    { value: 2.2046226,
      label: 'Kilograms &#x2192; Pounds'   },
    { value: 0.45359237,
      label: 'Pounds &#x2192; Kilograms'   },
    
    { value: 0.264178,
      label: 'Liters &#x2192; Gallons'   },
    { value: 3.78533,
      label: 'Gallons &#x2192; Liters'   },
    
    { value: 0.239,
      label: 'Joules &#x2192; Calories'   },
    { value: 4.184,
      label: 'Calories &#x2192; Joules'   }
  ]
};

ValueConverter = HApplication.extend({
  constructor: function( _unit, _from, _to ){
    this.base(15);
    this.unit = _unit;
    this.from = _from;
    this.to   = _to;
  },
  
  onIdle: function(){
    var _result = parseFloat( this.unit.value ) * parseFloat( this.from.value );
    this.to.set( Math.round(_result*1000)/1000 );
  }
  
});

UnitConverter = HApplication.extend({
  constructor: function( _conf ){
    this.base(15);
    this.conf = _conf;
    this.buildUI();
    this.bindData();
    
    this.unitPopupMenu.selectItemAtIndex( 0 );
  },
  bindData: function(){
    this.conf.unitValue.bind( this.unitEditor );
    this.conf.fromValue.bind( this.fromEditor );
    this.conf.toValue.bind(   this.toViewer   );
    this.valueConverter = new ValueConverter(
      this.conf.unitValue,
      this.conf.fromValue,
      this.conf.toValue
    );
  },
  buildUI: function(){
    this.converterWindow = new HWindow(
      new HRect( 50, 50, 360, 160 ),
      this, {
        label: this.conf.windowLabel
      }
    );
    this.mainView  = this.converterWindow.windowView;
    
    this.unitLabel   = new HStringView(
      new HRect( 16, 16, 66, 36 ),
      this.mainView, {
        value: this.conf.unitLabel
      }
    );
    
    this.unitPopupMenu = new HPopUpMenu(new HRect(), this);
    var _convs = this.conf.unitConversions;
    for( var _idx=0; _idx < _convs.length; _idx++ ){
      var _conv = _convs[ _idx ];
      var _menuItem = new HMenuItem( new HRect(0,0,0,0), this.unitPopupMenu, _conv );
    }
    
    this.unitEditor  = new HPopupButton(
      new HRect( 76, 16, 286, 36 ),
      this.mainView, {
        popupMenu: this.unitPopupMenu
      }
    );
    
    
    this.fromEditor  = new HTextControl(
      new HRect( 16, 46, 116, 66 ),
      this.mainView
    );
    
    this.labelTo = new HView(
      new HRect( 126, 46, 176, 66 ),
      this.mainView
    );
    this.labelTo.setStyle('text-align','center');
    this.labelTo.setHTML('&#x2192;');
    
    this.toViewer    = new HTextControl(
      new HRect( 186, 46, 286, 66),
      this.mainView
    );
    this.toViewer.setEnabled( false );
  }
});


var initUnitConverter = function(){
  HThemeManager.setThemePath( unitConverterConfig.themePath );
  this.myUnitConverter = new UnitConverter( unitConverterConfig );
}

onloader('initUnitConverter();');
