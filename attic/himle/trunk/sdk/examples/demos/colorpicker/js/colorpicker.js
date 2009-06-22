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


/*** The App itself.
  ** Its purpose is to construct the UI and to provide the
  **  namespace and common methods for app functionality.
  **/ 
ColorMixerApp = HApplication.extend({
  
  
  /* Makes the values used by the color palette.
   */
  makeWebSafeColorValues: function(_amount){
    
    if(_amount === undefined){
      _amount = 216;
    }
    
    // Container for ColorValues of the palette:
    this.colorValues = [];
    
    // loop through the web safe colors
    for(var _colorI=0;_colorI!=_amount;_colorI++){
      
      // Initialize the color value
      var _colorVal = new HColorValue('colorpicker:setbgcolor:'+_colorI.toString(),[0,0,0]);
      
      // Store the value for later reference
      this.colorValues.push(_colorVal);
    }
  },
  
  /* Makes a web-safe set of colors
   */
  setWebSafeColorPalette: function(){
    
    /* Construct the web safe colors
     */ 
    var _webColors = [];
    for(var _r=0;_r<6;_r++){
      for(var _g=0;_g<6;_g++){
        for(var _b=0;_b<6;_b++){
          _webColors.push([_r*0x33,_g*0x33,_b*0x33]);
        }
      }
    }
    
    for(var _colorI=0;_colorI!=_webColors.length;_colorI++){
      
      // The rgb array item generated before
      var _colorArr = _webColors[_colorI];
      
      // Sets the value
      this.colorValues[ _colorI ].set( _colorArr );
    }
  },
  
  assignServerColors: function(){
    this.colorValues = [];
    for( var _colorIndex = 0; _colorIndex != 216; _colorIndex ++ ){
      var _commonColorValueItem = eval('common_values.colorMixerPaletteItem'+_colorIndex);
      prop_set(0,'background-color', _commonColorValueItem.toHexString() )
      this.colorValues.push( _commonColorValueItem );
    }
  },
  
  /* Constructs a palette of HColorSwatchItems
   */
  makeColorSwatch: function(){
    
    // Build the palette array from values given in the server
    if(HTransporter.ses_id!='0'){
      this.assignServerColors();
    }
    
    // Make the colors in the client, if there are no values from the server (in server we trust).
    else {
      this.makeWebSafeColorValues();
      this.setWebSafeColorPalette();
    }
    
    // The parent view for color swatch items
    this.colorSwatchView = new HView(new HRect(80,10,336,180),this.appView);
    
    /* Initialize the swatch the items by drawing them in a grid.
     */
    var _x = 0;
    var _y = 0;
    
    for( var _colorI = 0; _colorI != this.colorValues.length; _colorI ++ ){
      
      // make a 8*8px HColorSwatchItem and draw it with 1px margins.
      var _colorItem = new HColorSwatchItem(
        new HRect(_x*9,_y*9,_x*9+8,_y*9+8),
        this.colorSwatchView, {
          action:this.editColor
        }
      );
      
      _colorVal = this.colorValues[ _colorI ];
      
      // Bind the palette item to the value
      _colorVal.bind( _colorItem );
      
      // increment the x coordinate and check for the column limit
      _x++;
      if( _x > 27 ){
        _x = 0;
        _y++;
      }
    }
  },
  
  /* Constructs RGB and CMYK sliders to edit the HColorValue:s of the palette.
   */
  makeColorSliders: function(){
    
    // An array to store color HSlider components:
    this.colorSliders       = [];
    
    // An array to store the HValue:s the sliders manipulate:
    this.colorSliderValues  = [];
    
    // An array of responders to convert the integer HValue:s to HColorValue:s
    this.colorSliderResponders = [];
    
    // An array to store the label elements of the sliders:
    this.colorSliderLabels  = [];
    
    // A constructor list for the color sliders, re-arrange / rename
    // to fit your taste:
    var _sliderOpts = [
      /*     | Label text |     | EditR | EditG | EditB  */
      { descr: 'BLACK',   flags: [    1,      1,      1 ] },
      { descr: 'RED',     flags: [    1,      0,      0 ] },
      { descr: 'YELLOW',  flags: [    1,      1,      0 ] },
      { descr: 'GREEN',   flags: [    0,      1,      0 ] },
      { descr: 'CYAN',    flags: [    0,      1,      1 ] },
      { descr: 'BLUE',    flags: [    0,      0,      1 ] },
      { descr: 'MAGENTA', flags: [    1,      0,      1 ] }
    ];
    
    // Build the sliders/labels/values/responders defined by _sliderOpts
    for(var _sliderI=0; _sliderI < _sliderOpts.length; _sliderI++){
      
      // The offset from the top of the view:
      var _topPos = _sliderI*20;
      
      // The creation definiton
      var _sliderOpt = _sliderOpts[_sliderI];
      
      // The label component
      var _label  = new HStringView(
        new HRect(20,130+_topPos,74,150+_topPos),
        this.appView,
        { value: _sliderOpt.descr }
      );
      _label.setStyle('text-align','right');
      //_label.draw();
      this.colorSliderLabels.push(_label);
      
      // The slider component
      var _slider = new HSlider(
        new HRect(80,130+_topPos,336,150+(_topPos-5)),
        this.appView,
        { value:    0,
          minValue: 0,
          maxValue: 255   }
      );
      //_slider.draw();
      this.colorSliders.push(_slider);
      
      // The value item
      var _sliderValue = new HValue("null:null:"+_sliderI,0);
      _sliderValue.bind(_slider);
      _sliderValue.flags = _sliderOpt.flags;
      this.colorSliderValues.push(_sliderValue);
      
      // A value responder to convert integers to rgb values
      var _sliderValueResponder = new HColorValueMixer(
        this,
        _sliderOpt.flags[0],
        _sliderOpt.flags[1],
        _sliderOpt.flags[2]
      );
      _sliderValue.bind( _sliderValueResponder );
      this.colorSliderResponders.push( _sliderValueResponder );
    }
  },
  
  /* Activate a colorswatch item for editing
   */
  editColor: function( _aColorObject ){
    
    // namespace hack (js sux)
    if(!this.app){
      var _that = this;
    }
    else{
      var _that = this.app;
    }
    // Ignore if we are called the first time
    if(_that.valueObj){
      // Release components from the old value:
      _that.valueObj.unbind( _that.preView    );
      _that.valueObj.unbind( _that.colorMixer );
    }
    // Set a reference for the currently active colorswatch item (it's a HColorValue)
    _that.valueObj = _aColorObject;
    
    // Bind the new value to the components:
    _that.valueObj.bind( _that.preView );

    _that.valueObj.bind( _that.colorMixer );
  },
  
  /* A subclass responsible for converting HColorValues to slider values
   */
  colorMixer: {
    
    // An minimal valueobject catcher
    setValueObj: function(_valueObj){
      this.valueObj = _valueObj;
      this.setValue(_valueObj.value);
    },
    
    // Color -> individual integer value conversion
    setValue: function(_value){
      if(this.parent){
        
        // Update the color sliders
        // array -> sliders
        for(var _sliderI=0;_sliderI<this.parent.colorSliders.length;_sliderI++){
          
          // a reference to the slider component
          var _slider = this.parent.colorSliders[_sliderI];
          // a reference to its value:
          var _sliderHValue = this.parent.colorSliderValues[_sliderI];
          
          // calculate the average value based on the value flags of the component:
          var _sliderVal = 0;
          var _sliderValCount = 0;
          if(_sliderHValue.flags[0]){_sliderVal += _value[0];_sliderValCount++;}
          if(_sliderHValue.flags[1]){_sliderVal += _value[1];_sliderValCount++;}
          if(_sliderHValue.flags[2]){_sliderVal += _value[2];_sliderValCount++;}
          var _avgVal = (_sliderVal/_sliderValCount);
          
          // do a quick refresh of the slider
          _slider.value = _avgVal;
          if(_slider.drawn){
            _slider.drawKnobPos();
          }
        }
        
        // Update the #RRGGBB text view
        // value -> hexcolor
        this.parent.hexView.setValue(
          this.parent.valueObj.toHexString()
        );
      }
    },
    setParent: function(_parent){
      this.parent = _parent;
    }
  },
  
  /* Build the interface
   */
  constructor: function(_idleValue,_viewPos,_defaultColor){
    
    // Call the HApplication skeleton with the idle value,
    // the idling is not really used in this example:
    this.base(_idleValue);
    
    // Initialize a window for the app
    this.appWindow = new HWindowControl(
      new HRect( _viewPos.x,_viewPos.y,_viewPos.x+376,_viewPos.x+340 ),
      this,
      { label: 'Color Mixer' }
    );
    //this.appWindow.draw();
    
    // Use the window's view to draw stuff into it:
    this.appView = this.appWindow.windowView;
    
    // Draw the initial web safe color swatch
    this.makeColorSwatch();
    
    // Draw the big "current color preview" swatch item
    this.preView = new HColorSwatchItem(
      new HRect(10,10,74,74),
      this.appView
    );
    //this.preView.draw();
    this.preView.setStyle('border','1px solid #666');
    
    // Draw the color sliders
    this.makeColorSliders();
    
    // Edit the first RGBColor of the swatch by default
    this.editColor( this.colorValues[0] );
    
    // Draw the text view to display the currenly edited value
    this.hexView = new HTextControl(
      new HRect(10,76,76,94),
      this.appView,
      { label:   "Hexadecimal color value",
        value:    this.valueObj.toHexString() }
    );
    //this.hexView.draw();
    
    // Initialize the color converter
    this.colorMixer.setParent(this);
  }
});
