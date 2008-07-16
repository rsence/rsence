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

/*** class: HStepper
  **
  ** HStepper is a control unit made of two adjacent buttons with up and down arrows 
  ** to select the previous or next of a set of contiguous values. 
  ** Normally, a stepper works in combination with a textbox. 
  ** Steppers are similar to comboboxes in functionality (choosing one from a range of values), 
  ** except for that steppers do not have a drop-down list.
  **
  ***/
  
HStepper = HButton.extend({
  
  componentName: "stepper",

  constructor: function(_rect,_parentClass,_options) {
    
    if (!_options) {
      _options = {};
    }
    _options.events = {
      mouseDown: true,
      keyDown: true,
      mouseWheel: true
    };

    // Default options.
    var _defaults = Base.extend({
      minValue: 0,
      value: 0,
      interval: 500
    });
    _defaults = _defaults.extend(_options);
    _options = new _defaults();
    
    if(this.isinherited){
      this.base(_rect,_parentClass,_options);
    }
    else {
      this.isinherited = true;
      this.base(_rect,_parentClass,_options);
      this.isinherited = false;
    }
    
    this.interval = _options.interval;
    this._tmplLabelPrefix = "stepperlabel";
    
    this.border = ((_rect.bottom - _rect.top)/2 + _rect.top);	// calculate a middle border of a stepper
    
    if(!this.isinherited){
      this.draw();
    }
  }, 
  stepUp: function(_value){
    _value--;
    _value=(_value<this.minValue)?this.maxValue:_value;
    this.setValue(_value);
  },
  stepDown: function(_value){
    _value++;
    _value=(_value>this.maxValue)?this.minValue:_value;
    this.setValue(_value);
  },   
  mouseDown: function(_x,_y,_isLeftButton){
    this.setMouseUp(true);
    var temp = this;
    if (_y < this.border){
        this.stepUp(this.value);
        // works when a button is held down (repeater)  
        this.counter = setInterval(function(){temp.stepUp(temp.value);},this.interval);	
    } else {
        this.stepDown(this.value);
        // works when a button is held down (repeater)
        this.counter = setInterval(function(){temp.stepDown(temp.value);},this.interval);	
    }    
  },
  mouseUp: function(_x,_y,_isLeftButton){
    clearInterval(this.counter);
  },
  blur: function(){
    clearInterval(this.counter);
  },
  
  keyDown: function(_keycode) {
    this.setKeyUp(true);
    var temp = this;
    if (_keycode == Event.KEY_UP) {
      this.stepUp(this.value);
      this.counter = setInterval(function(){temp.stepUp(temp.value);},this.interval);	
    }
    else if (_keycode == Event.KEY_DOWN) {
      this.stepDown(this.value);
      this.counter = setInterval(function(){temp.stepUp(temp.value);},this.interval);
    }
  },
  
  keyUp: function(_keycode){
    clearInterval(this.counter);
  },
  
  mouseWheel: function(_delta) {
    if (_delta > 0) {
      this.stepUp(this.value);
    }
    else {
      this.stepDown(this.value);
    }
  }
});


