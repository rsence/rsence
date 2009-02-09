/**
  * Riassence Core -- http://rsence.org/
  *
  * Copyright (C) 2008 Juha-Jarmo Heinonen <jjh@riassence.com>
  * Copyright (C) 2006 Helmi Technologies Inc.
  *
  * This file is part of Riassence Core.
  *
  * Riassence Core is free software: you can redistribute it and/or modify
  * it under the terms of the GNU General Public License as published by
  * the Free Software Foundation, either version 3 of the License, or
  * (at your option) any later version.
  *
  * Riassence Core is distributed in the hope that it will be useful,
  * but WITHOUT ANY WARRANTY; without even the implied warranty of
  * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  * GNU General Public License for more details.
  *
  * You should have received a copy of the GNU General Public License
  * along with this program.  If not, see <http://www.gnu.org/licenses/>.
  *
  **/

/*** class: HStepper
  **
  ** HStepper is a control unit made of two adjacent buttons with up and down arrows 
  ** to select the previous or next of a set of contiguous values. 
  ** Normally, a HStepper instance works in combination with a HTextControl or a HStringView instance.
  ***/

HStepper = HControl.extend({
  
  componentName: "stepper",
  
  constructor: function(_rect,_parent,_options) {
    
    // Makes sure there is at least an empty options block
    if (!_options) {
      _options = {};
    }
    
    // Makes sure the default events for HStepper are enabled
    if (!_options.events) {
      _options.events = {
        mouseDown:  true,
        keyDown:    true,
        mouseWheel: true
      };
    }
    
    // Makes sure some other optional options are at some sane defaults
    _options = HClass.extend({
      
      // The smallest allowed value
      minValue: 0,
      
      // The biggest allowed value
      maxValue: 100,
      
      // Amount of to step, defaults to +/- 1
      stepSize: 1,
      
      // Interval in milliseconds for repeat
      repeatInterval: 200,
      
      // Boolean to control wrap-around behaviour
      wrapAround: false
      
    }).extend(
      
      // Include user-specified overrides to options
      _options
      
    ).nu(); // new instance of the HClass as _options
    
    this.base( _rect, _parent, _options );
    
  },
  
  // Setter for wrap-around behaviour
  setWrapAround: function(_on){
    this.options.wrapAround = _on;
  },
  
  // Makes sure the value is in its boundaries and either wrap-around
  // to min/max or revert to the current value
  _checkValueBoundaries: function(_value){
    
    // checks for boundaries
    var _this     = this,
        _options  = _this.options,
        _minVal   = _options.minValue,
        _maxVal   = _options.maxValue,
        _tooSmall = _value<_minVal,
        _tooBig   = _value>_maxVal,
        _overflow = ( _tooSmall || _tooBig );
    
    // The value is ok, just return it as it is
    if (!_overflow) {
      return _value;
    }
    
    
    /// Handle the overflow condition:
    
    // Wrap around uses min/max as new value as either is reached
    if (_options.wrapAround) {
      if (_tooSmall) {
        return _maxVal;
      }
      else {
        return _minVal;
      }
    }
    // Any other condition means we just revert the changes
    else {
      return _this.value;
    }
    
  },
  
  // Adds the step size to the value
  stepUp: function(){
    this.setValue(
      this._checkValueBoundaries(
        this.value + this.options.stepSize
      )
    );
  },
  
  // Subtracts the step size from the value
  stepDown: function(){
    this.setValue(
      this._checkValueBoundaries(
        this.value - this.options.stepSize
      )
    );
  },
  
  // Returns an action string for the setInterval in _setRepeatInterval
  _repeatIntervalStr: function( _up ){
    return [
      'HSystem.views[',
      this.viewId,
      '].step',
      (_up?'Up':'Down'),
      '();'
    ].join('');
  },
  
  // Background-offset of the state images up/down,
  // overrideable in the html template
  bgStateUp: '0px -23px',
  bgStateDown: '0px -46px',
  
  // enables the up/down effect in the image based on the _up boolean (true means up, false means down)
  _bgStateOn: function( _up ){
    ELEM.setStyle(this.markupElemIds.state,'background-position',_up?this.bgStateUp:this.bgStateDown);
  },
  
  // reverts the up/down effect
  _bgStateOff: function(){
    ELEM.setStyle(this.markupElemIds.state,'background-position','');
  },
  
  // Starts the repeating stepping up or down (when the mouse button or a arrow key is down)
  _setRepeatInterval: function( _up ){
    var _this    = this,
        _options = _this.options;
    _this._bgStateOn( _up );
    if (_up) {
      _this.stepUp();
      _this._repeatInterval = setInterval( _this._repeatIntervalStr(1), _options.repeatInterval );
    }
    else {
      _this.stepDown();
      _this._repeatInterval = setInterval( _this._repeatIntervalStr(0), _options.repeatInterval );
    }
  },
  
  // Stops the repeating stepping up or down enabled in _setRepeatInterval
  _clearRepeatInterval: function(){
    this._bgStateOff();
    clearInterval( this._repeatInterval );
  },
  
  // Checks where the mouseDown happened and adjusts the stepper up/down based on that
  mouseDown: function( x, y ){
    this.setMouseUp(true);
    this._setRepeatInterval(  ( y - ELEM.getVisiblePosition( this.elemId )[1] ) <= 11  );
  },
  
  // Stops the repeating stepping, when the mouse button goes up
  mouseUp: function(){
    this._clearRepeatInterval();
  },
  
  // Stops the repeating stepping, when the control becomes inactive
  blur: function(){
    this._clearRepeatInterval();
  },
  
  // adjusts stepping up/down based on the arrow key pressed.
  // up and right arrow keys steps the value up, down and left steps the value down
  keyDown: function( _keyCode ) {
    this.setKeyUp(true);
    var _keyDown  = (_keyCode == Event.KEY_DOWN),
        _keyUp    = (_keyCode == Event.KEY_UP),
        _keyLeft  = (_keyCode == Event.KEY_LEFT),
        _keyRight = (_keyCode == Event.KEY_RIGHT),
        _arrowKey = (_keyDown || _keyUp || _keyLeft || _keyRight);
    if (_arrowKey) {
      this._setRepeatInterval( (_keyUp || _keyRight) );
    }
    else if (_keyCode == Event.KEY_HOME) {
      this.setValue(this.options.minValue);
    }
    else if (_keyCode == Event.KEY_END) {
      this.setValue(this.options.maxValue);
    }
    // Page up and page down keys act just like arrow up/down.
    else if (_keyCode == Event.KEY_PAGEUP) {
      this._setRepeatInterval( 1 );
    }
    else if (_keyCode == Event.KEY_PAGEDOWN) {
      this._setRepeatInterval( 0 );
    }
  },
  
  // stops the repeating when a key goes up
  keyUp: function(){
    this._clearRepeatInterval();
  },
  
  // steps the value up/down based on the mouse scroll wheel
  mouseWheel: function(_delta) {
    (_delta>0)?this.stepUp():this.stepDown();
  }
  
  
});


