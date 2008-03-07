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

/*** class: HSlider
  **
  ** HSlider is a control unit that enables the user to choose a value in a range of values. 
  ** Sliders support both dragging the handle and clicking the mouse anywhere on the slider 
  ** to move the handle towards the mouse, as well as keyboard support 
  ** after the handle is in active mode. There are two types of sliders: vertical and horizontal. 
  ** Naturally, sliders are commonly used as colour mixers, volume controls, 
  ** graphical equalizers and seekers in media applications. 
  ** A typical slider is a drag-able knob along vertical or horizontal line. 
  ** Slider view or theme can be changed; the helmiTheme is used by default.
  **
  ** vars: Instance variables
  **  type - '[HSlider]'
  **  value - Numeric value currently set to this object.
  **  minValue - The minimum value that can be set to this object.
  **  maxValue - The maximum value that can be set to this object.
  **
  ** Extends:
  **  <HControl>
  **
  ** See also:
  **  <HControl> <HVSlider>
  ***/
HSlider = HControl.extend({
  
  packageName:   "sliders",
  componentName: "slider",
  
/** constructor: constructor
  *
  * Parameters:
  *   _rect - An <HRect> object that sets the position and dimensions of this control.
  *   _parentClass - The parent view that this control is to be inserted in.
  *   _options - (optional) All other parameters. See <HComponentDefaults>.
  **/
  constructor: function(_rect,_parentClass,_options) {

    if (!_options) {
      _options = {};
    }
    _options.events = {
      mouseDown: false,
      mouseUp:   false,
      draggable: true,
      keyDown: true, 
      keyUp: true, 
      mouseWheel: true
    };

    // Default range values.
    var _defaults = Base.extend({
      minValue: 0,
      maxValue: 1
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
    
    this.type = '[HSlider]';
    
    this.refreshOnValueChange = false;
    
    // These are overridden in vertical slider.
    this._knobPrefix = 'sliderknob';
    this._isVertical = false;
    
    if(!this.isinherited){
      this.draw();
    }
  },
  
  
/** method: setValue
  * 
  * Sets the current value of the object and moves the slider knob to the correct position.
  * 
  * Parameters:
  *   _value - A numeric value to be set to the object.
  *
  * See also:
  *  <HControl.setValue>
  **/
  setValue: function(_value) {
    if (_value < this.minValue) {
      _value = this.minValue;
    }
    if (_value > this.maxValue) {
      _value = this.maxValue;
    }
    this.base(_value);
    if(this._knobElemId){
      this.drawKnobPos();
    }
  },
  
/** method: draw
  * 
  * Draws the rectangle and the markup of this object on the screen.
  *
  * See also:
  *  <HView.draw>
  **/
  draw: function() {
    if(!this.drawn) {
      this.drawRect();
      this.drawMarkup();
      this._initKnob();
    }
    this.refresh();
  },
  
  
/** event: startDrag
  * 
  * This gets called automatically when the user starts to drag the slider knob.
  * Extend this method if you want something special to happen when the dragging starts.
  * 
  * Parameters:
  *   _x - The X coordinate of the point where the drag started.
  *   _y - The Y coordinate of the point where the drag started.
  *
  * See also:
  *  <HControl.startDrag>
  **/
  startDrag: function(_x,_y){
    var _element = elem_get(this.elemId);
    var _originalPosition = helmi.Element.getPageLocation(_element, true);
    this._originX = _originalPosition[0];
    this._originY = _originalPosition[1];
    
    this.doDrag(_x,_y);
  },
  
  
/** event: endDrag
  * 
  * This gets called automatically when the user stops dragging the slider knob.
  * Extend this method if you want something special to happen when the dragging ends.
  * 
  * Parameters:
  *   _x - The X coordinate of the point where the drag ended.
  *   _y - The Y coordinate of the point where the drag ended.
  *
  * See also:
  *  <HControl.endDrag>
  **/
  endDrag: function(_x,_y){
    this.doDrag(_x,_y);
  },
  
  
/** event: doDrag
  * 
  * This gets called periodically while the user drags the slider knob.
  * Extend this method if you want something special to happen while dragging.
  * 
  * Parameters:
  *   _x - The X coordinate of the point where the user is currently dragging.
  *   _y - The Y coordinate of the point where the user is currently dragging.
  *
  * See also:
  *  <HControl.doDrag>
  **/
  doDrag: function(_x,_y){
    _x -= this._originX;
    _y -= this._originY;
    
    _rawVal = this._isVertical?_y:_x;
    _value = this._pos2value(_rawVal);
    this.setValue(_value);
  },
  
  
/** event: keyDown
  * 
  * This gets called when the user presses a key down while this control is 
  * active. The default behaviour is to move the knob with arrow keys, page up,
  * page down, home and end.
  * 
  * Parameters:
  *   _keycode - The keycode of the key that was pressed down.
  *
  * See also:
  *  <HControl.keyDown>
  **/
  keyDown: function(_keycode) {
    // Arrow keys move the knob 5% at a time.
    if ( (_keycode == Event.KEY_LEFT && !this._isVertical) ||
      (_keycode == Event.KEY_UP && this._isVertical) ) {
      this._moving = true;
      this._moveKnob(-0.05);
    }
    else if ( (_keycode == Event.KEY_RIGHT && !this._isVertical) ||
      (_keycode == Event.KEY_DOWN && this._isVertical) ) {
      this._moving = true;
      this._moveKnob(0.05);
    }
    // Home key moves the knob to the beginning and end key to the end.
    else if (_keycode == Event.KEY_HOME) {
      this.setValue(this.minValue);
    }
    else if (_keycode == Event.KEY_END) {
      this.setValue(this.maxValue);
    }
    // Page up and page down keys move the knob 25% at a time.
    else if (_keycode == Event.KEY_PAGEUP) {
      this._moving = true;
      this._moveKnob(-0.25);
    }
    else if (_keycode == Event.KEY_PAGEDOWN) {
      this._moving = true;
      this._moveKnob(0.25);
    }
    
    
  },
  
  
/** event: keyUp
  * 
  * This gets called when the user releases a key while this control is active.
  * 
  * Parameters:
  *   _keycode - The keycode of the key that was released.
  *
  * See also:
  *  <HControl.keyUp>
  **/
  keyUp: function(_keycode) {
    this._moving = false;
  },
  
  
/** event: mouseWheel
  *
  * This gets called when the mouse wheel is used and the component instance has
  * focus.
  *
  * Parameters:
  *  _delta - Scrolling delta, the wheel angle change. If delta is positive,
  *   wheel was scrolled up. Otherwise, it was scrolled down.
  *
  * See also:
  *  <HControl.mouseWheel>
  **/
  mouseWheel: function(_delta) {
    var _valueChange;
    if (_delta > 0) {
      _valueChange = -0.05;
    }
    else {
      _valueChange = 0.05;
    }
    _value = (this.maxValue - this.minValue) * _valueChange;
    this.setValue( this.value + _value);
  },
  
  
  // private method
  _moveKnob: function(_valueChange, _rate) {
    
    if (!_rate) {
      // If the key is held down, wait for a while before actually pulsating.
      _rate = 300;
    }
    else if (_rate == 300) {
      _rate = 50;
    }
    
    if (this._moving && this.active) {
      
      _value = (this.maxValue - this.minValue) * _valueChange;
      
      this.setValue( this.value + _value);
    
      var _that = this;
      if (this._knobMoveTimeout) {
        window.clearTimeout(this._knobMoveTimeout);
        this._knobMoveTimeout = null;
      }
      this._knobMoveTimeout = window.setTimeout(function(){
        _that._moveKnob(_valueChange, _rate);
      }, _rate);
    }

  },
  
  
  // private method
  _initKnob: function() {
    this._knobElemId = this.bindDomElement(this._knobPrefix+this.elemId);
    this.drawKnobPos();
  },
  
  
  // private method
  _value2px: function() {
    var _elem = elem_get(this._knobElemId);
    if(this._isVertical){
      _pxrange  = this.rect.height - parseInt( _elem.offsetHeight, 10 );
    } else {
      _pxrange  = this.rect.width - parseInt( _elem.offsetWidth, 10 );
    }
    _intvalue = _pxrange * (
      (this.value-this.minValue) / (this.maxValue - this.minValue)
    );
    _pxvalue = parseInt(_intvalue, 10)+'px';
    return _pxvalue;
  },
  
  
  // private method
  _pos2value: function(_mousePos) {
    _relPos = this._isVertical?(_mousePos):(_mousePos);
    if(_relPos < 0){_relPos = 0;}
    if(this._isVertical){
      if(_relPos > this.rect.height){
        _relPos = this.rect.height;
      }
      return this.minValue + ((_relPos / this.rect.height) * (this.maxValue - this.minValue));
    } else {
      if(_relPos > this.rect.width){
        _relPos = this.rect.width;
      }
      return this.minValue + ((_relPos / this.rect.width) * (this.maxValue - this.minValue));
    }
  },
  
  
  // private method
  drawKnobPos: function() {
    _whichprop = this._isVertical?'top':'left';
    _propval   = this._value2px();
    prop_set(this._knobElemId,_whichprop,_propval);
  }
  
});

