/*   RSence
 *   Copyright 2006 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

/*** = Description
  ** HSlider is a control unit that enables the user to choose a value in a range of values. 
  ** Sliders support both dragging the handle and clicking the mouse anywhere on the slider 
  ** to move the handle towards the mouse, as well as keyboard support 
  ** after the handle is in active mode. There are two types of sliders: vertical and horizontal. 
  ** Naturally, sliders are commonly used as colour mixers, volume controls, 
  ** graphical equalizers and seekers in media applications. 
  ** A typical slider is a drag-able thumb along vertical or horizontal line. 
  **
  ** = Instance variables
  ** +minValue+::       The smallest allowed value.
  ** +maxValue+::       The biggest allowed value.
  ** +repeatDelay+::    The key repetition initial delay when changing the slider
  **                    with cursor keys. Defaults to 300 (ms)
  ** +repeatInterval+:: The key repetition interval when changing the slider
  **                    with cursor keys. Defaults to 50 (ms)
  ** +inveseAxis+::     Inverse Scrollwheel axis.
  **                    As there is only one scrollwheel event, sideways
  **                    scrolling doesn't work logically for horizonal
  **                    scrollbars by default, so set this to true to
  **                    have horizonal sliders work logically
  **                    with sideways scrolling, where supported.
***/
HSlider = HControl.extend({
  
  componentName: "slider",
  
  defaultEvents: {
    draggable: true,
    keyDown: true,
    keyUp: true,
    mouseWheel: true
  },
  
  controlDefaults: (HControlDefaults.extend({
    minValue: 0,
    maxValue: 1,
    repeatDelay: 300,
    repeatInterval: 50,
    inverseAxis: false
  })),
  
  refreshOnValueChange: false,
  
  _isVertical: false,
  
  
/** = Description
  * Sets the current value of the object and moves the slider thumb to the correct position.
  * 
  * = Parameters
  * +_value+:: A numeric value to be set to the object.
  *
  **/
  setValue: function(_value) {
    if (_value < this.minValue) {
      _value = this.minValue;
    }
    if (_value > this.maxValue) {
      _value = this.maxValue;
    }
    this.base(_value);
    if(this._thumbElemId){
      this.drawThumbPos();
    }
    return this;
  },
  
/** = Description
  * Draws the rectangle and the markup of this object on the screen.
  *
  **/
  draw: function() {
    if(!this.drawn) {
      this.drawRect();
      this.drawMarkup();
      this._initThumb();
    }
    this.refresh();
  },
  
  
/** = Description
  * This gets called automatically when the user starts to drag the slider thumb.
  * Extend this method if you want something special to happen when the dragging starts.
  * 
  * = Parameters
  * +_x+:: The X coordinate of the point where the drag started.
  * +_y+:: The Y coordinate of the point where the drag started.
  *  
  **/
  startDrag: function(_x,_y){
    var _originalPosition = ELEM.getVisiblePosition(this.elemId, true);
    this._originX = _originalPosition[0];
    this._originY = _originalPosition[1];
    
    this.drag(_x,_y);
  },
  
  
/** = Description
  * This gets called automatically when the user stops dragging the slider thumb.
  * Extend this method if you want something special to happen when the dragging ends.
  * 
  * = Parameters
  * +_x+:: The X coordinate of the point where the drag ended.
  * +_y+:: The Y coordinate of the point where the drag ended.
  *
  **/
  endDrag: function(_x,_y){
    this.drag(_x,_y);
  },
  
  
/** = Description
  * This gets called periodically while the user drags the slider thumb.
  * Extend this method if you want something special to happen while dragging.
  * 
  * = Parameters
  * +_x+:: The X coordinate of the point where the user is currently dragging.
  * +_y+:: The Y coordinate of the point where the user is currently dragging.
  *
  **/
  drag: function(_x,_y){
    _x -= this._originX;
    _y -= this._originY;
    
    var _rawVal = this._isVertical?_y:_x,
        _value = this._pos2value(_rawVal);
    
    this.setValue(_value);
  },
  
  
/** = Description
  * This gets called when the user presses a key down while this control is 
  * active. The default behaviour is to move the thumb with arrow keys, page up,
  * page down, home and end.
  * 
  * = Parameters
  * +_keycode+:: The keycode of the key that was pressed down.
  *
  **/
  keyDown: function(_keycode) {
    // Arrow keys move the thumb 5% at a time.
    if ( (_keycode === Event.KEY_LEFT && !this._isVertical) ||
      (_keycode === Event.KEY_DOWN && this._isVertical) ) {
      this._moving = true;
      this._moveThumb(-0.05);
    }
    else if ( (_keycode === Event.KEY_RIGHT && !this._isVertical) ||
      (_keycode === Event.KEY_UP && this._isVertical) ) {
      this._moving = true;
      this._moveThumb(0.05);
    }
    // Home key moves the thumb to the beginning and end key to the end.
    else if (_keycode === Event.KEY_HOME) {
      this.setValue(this.minValue);
    }
    else if (_keycode === Event.KEY_END) {
      this.setValue(this.maxValue);
    }
    // Page up and page down keys move the thumb 25% at a time.
    else if (_keycode === Event.KEY_PAGEDOWN) {
      this._moving = true;
      this._moveThumb(-0.25);
    }
    else if (_keycode === Event.KEY_PAGEUP) {
      this._moving = true;
      this._moveThumb(0.25);
    }
    
    
  },
  
  
/** = Description
  * This gets called when the user releases a key while this control is active.
  * 
  * = Parameters
  * +_keycode+:: The keycode of the key that was released.
  *
  **/
  keyUp: function(_keycode) {
    this._moving = false;
  },
  
  
/** = Description
  * This gets called when the mouse wheel is used and the component 
  * instance has focus.
  *
  * = Parameters
  * +_delta+:: Scrolling delta, the wheel angle change. If delta is positive,
  *            wheel was scrolled up. Otherwise, it was scrolled down.
  *
  **/
  mouseWheel: function(_delta) {
    var _valueChange;
    if (_delta > 0) {
      _valueChange = 0.05;
    }
    else {
      _valueChange = -0.05;
    }
    if ( this.options.inverseAxis ) {
      _valueChange = 0 - _valueChange;
    }
    
    var _value = (this.maxValue - this.minValue) * _valueChange;
    this.setValue( this.value + _value);
  },
  
  
  // --private method++
  _moveThumb: function(_valueChange, _rate) {
    
    if (!_rate) {
      // --If the key is held down, wait for a while before starting repeat.++
      _rate = this.options.repeatDelay;
    }
    else if (_rate === this.options.repeatDelay) {
      _rate = this.options.repeatInterval;
    }
    
    if (this._moving && this.active) {
      
      var _value = (this.maxValue - this.minValue) * _valueChange;
      
      this.setValue( this.value + _value);
    
      var _that = this;
      if (this._thumbMoveTimeout) {
        window.clearTimeout(this._thumbMoveTimeout);
        this._thumbMoveTimeout = null;
      }
      this._thumbMoveTimeout = window.setTimeout(function(){
        _that._moveThumb(_valueChange, _rate);
      }, _rate);
    }

  },
  
  thumbSize: 21,
  // -- private method ++
  _initThumb: function() {
    this._thumbElemId = this.markupElemIds.control;
    this.drawThumbPos();
  },
  
  
  // -- private method ++
  _value2px: function() {
    var _pxrange;
    if(this._isVertical){
      _pxrange  = this.rect.height - this.thumbSize;
    } else {
      _pxrange  = this.rect.width - this.thumbSize;
    }
    var _intvalue = _pxrange * (
      (this.value-this.minValue) / (this.maxValue - this.minValue)
    );
    if ( this._isVertical ) {
      _intvalue = _pxrange - _intvalue;
    }
    _pxvalue = parseInt(_intvalue, 10)+'px';
    return _pxvalue;
  },
  
  
  // -- private method ++
  _pos2value: function(_mousePos) {
    var _pxrange;
    if(this._isVertical){
      _pxrange  = this.rect.height - this.thumbSize;
    } else {
      _pxrange  = this.rect.width - this.thumbSize;
    }
    _mousePos -= (this.thumbSize/2);
    if(_mousePos < 0){
      _mousePos = 0;
    }
    if(_mousePos > _pxrange){
      _mousePos = _pxrange;
    }
    if(this._isVertical){
      return this.maxValue - ((_mousePos / _pxrange) * (this.maxValue - this.minValue));
    } else {
      return this.minValue + ((_mousePos / _pxrange) * (this.maxValue - this.minValue));
    }
  },
  
  
  // -- private method ++
  drawThumbPos: function() {
    var _whichprop = this._isVertical?'top':'left',
        _propval   = this._value2px();
    ELEM.setStyle(this._thumbElemId,_whichprop,_propval);
    this.setOrientation(this.options['orientation']||this.prevOrientation);
  },
  
  prevOrientation: 'c',
  
  cssClassPrefix: 'h',
  
/** = Description
  * Changes the thumb graphic. Possible orientations by default are
  * north ('n'), south ('s'), west ('w'), east('e') and center ('c').
  * Defaults to 'c'. No case sensitivity.
  *
  * = Parameters
  * +_orientation+:: The orientation of slider thumb graphic.
  *
  **/
  setOrientation: function(_orientation) {
    if(!_orientation){
      _orientation = 'c';
    }
    _orientation = _orientation.toLowerCase();
    if(_orientation === this.prevOrientation){
      return;
    }
    if(this['markupElemIds']===undefined){
      return;
    }
    if(this.markupElemIds['control']===undefined){
      return;
    }
    var _toggleCSS = this.toggleCSSClass,
        _ctrlId    = this.markupElemIds.control,
        _orientations = ['n','s','w','e','c'],
        _iOrientation = '',
        _cssClassName = '',
        _cssClassPrefix = this.cssClassPrefix,
        _cssClassVert = this._isVertical?'v':'',
        _activeOrientation = false,
        i = 0;
    for(;i<5;i++){
      _iOrientation = _orientations[i];
      _activeOrientation = (_orientation===_iOrientation);
      _cssClassName = (_orientation==='c')?_cssClassPrefix+_cssClassVert+'slider_thumb':_cssClassPrefix+'slider_thumb_'+_iOrientation;
      _toggleCSS( _ctrlId, _cssClassName, _activeOrientation );
    }
    
    this.prevOrientation = _orientation;
  }
});

