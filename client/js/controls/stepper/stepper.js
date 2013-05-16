
/*** = Description
  ** HStepper is a control unit made of two adjacent buttons with up and down arrows 
  ** to select the previous or next of a set of contiguous values. 
  ** Normally, a HStepper instance works in combination with a HTextControl or a HStringView instance.
  **
  ** = Instance Variables
  ** +minValue+::         The smallest allowed value
  ** +maxValue+::         The biggest allowed value
  ** +stepSize+::         Amount of to step, defaults to +/- 1
  ** +repeatInterval+::   Interval in milliseconds for repeat
  ** +wrapAround+::       Boolean to control wrap-around behaviour
  ***/

var//RSence.Controls
HStepper = HControl.extend({
  
  componentName: "stepper",
  
  defaultEvents: {
    mouseDown: true,
    click: true,
    keyDown: true,
    mouseWheel: true
  },
  
  controlDefaults: (HControlDefaults.extend({
    minValue: 0,
    maxValue: 100,
    stepSize: 1,
    repeatInterval: 200,
    wrapAround: false
  })),
  
  /** Setter for wrap-around behaviour
    **/
  setWrapAround: function(_on){
    this.options.wrapAround = _on;
  },
  
  // -- Makes sure the value is in its boundaries and either wrap-around
  // to min/max or revert to the current value ++
  _checkValueBoundaries: function(_value){
    
    // -- checks for boundaries ++
    var _this     = this,
        _options  = _this.options,
        _minVal   = _options.minValue,
        _maxVal   = _options.maxValue,
        _tooSmall = _value<_minVal,
        _tooBig   = _value>_maxVal,
        _overflow = ( _tooSmall || _tooBig );
    
    // -- The value is ok, just return it as it is ++
    if (!_overflow) {
      return _value;
    }
    
    
    /// -- Handle the overflow condition: ++
    
    // -- Wrap around uses min/max as new value as either is reached ++
    if (_options.wrapAround) {
      if (_tooSmall) {
        return _maxVal;
      }
      else {
        return _minVal;
      }
    }
    // -- Any other condition means we just revert the changes ++
    else {
      return _this.value;
    }
    
  },
  
/** Adds the step size to the value
  **/
  stepUp: function(){
    this.setValue(
      this._checkValueBoundaries(
        this.value + this.options.stepSize
      )
    );
  },
  
/** Subtracts the step size from the value
  **/
  stepDown: function(){
    this.setValue(
      this._checkValueBoundaries(
        this.value - this.options.stepSize
      )
    );
  },
  
  // -- Background-offset of the state images up/down,
  // overrideable in the html template ++
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
    _this._repeatInterval && clearInterval( _this._repeatInterval );
    _this._bgStateOn( _up );
    _up?_this.stepUp():_this.stepDown();
    _this._repeatInterval = setInterval(
      _up?function(){_this.stepUp();}:function(){_this.stepDown();},
      _options.repeatInterval
    );
  },
  
  // Stops the repeating stepping up or down enabled in _setRepeatInterval
  _clearRepeatInterval: function(){
    this._bgStateOff();
    clearInterval( this._repeatInterval );
  },
  
  /** Checks where the mouseDown happened and adjusts the stepper up/down based on that
    **/
  mouseDown: function( x, y ){
    this.setMouseUp(true);
    this._setRepeatInterval(  ( y - this.pageY() ) <= 11  );
    return true;
  },
  
  /** Stops the repeating stepping, when the mouse button goes up
    **/
  mouseUp: function(){
    this._clearRepeatInterval();
    return true;
  },
  
  click: function(){
    this.mouseUp();
    return true;
  },
  
  /** Stops the repeating stepping, when the control becomes inactive
    **/
  blur: function(){
    this._clearRepeatInterval();
  },
  
/** adjusts stepping up/down based on the arrow key pressed.
  * up and right arrow keys steps the value up, down and left steps the value down
  **/
  keyDown: function( _keyCode ) {
    this.setKeyUp(true);
    var _keyDown  = (_keyCode === Event.KEY_DOWN),
        _keyUp    = (_keyCode === Event.KEY_UP),
        _keyLeft  = (_keyCode === Event.KEY_LEFT),
        _keyRight = (_keyCode === Event.KEY_RIGHT),
        _arrowKey = (_keyDown || _keyUp || _keyLeft || _keyRight);
    if (_arrowKey) {
      this._setRepeatInterval( (_keyUp || _keyRight) );
    }
    else if (_keyCode === Event.KEY_HOME) {
      this.setValue(this.options.minValue);
    }
    else if (_keyCode === Event.KEY_END) {
      this.setValue(this.options.maxValue);
    }
    // Page up and page down keys act just like arrow up/down.
    else if (_keyCode === Event.KEY_PAGEUP) {
      this._setRepeatInterval( 1 );
    }
    else if (_keyCode === Event.KEY_PAGEDOWN) {
      this._setRepeatInterval( 0 );
    }
    return true;
  },
  
/** stops the repeating when a key goes up
  **/
  keyUp: function(){
    this._clearRepeatInterval();
    return true;
  },
  
/** steps the value up/down based on the mouse scroll wheel
  **/
  mouseWheel: function(_delta) {
    (_delta>0)?this.stepUp():this.stepDown();
    return true;
  }
  
  
});
