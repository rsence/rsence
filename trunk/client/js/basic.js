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

/*** class: HButton
  **
  ** HButton is a control unit that provides the user a simple way to trigger an event 
  ** and responds to mouse clicks and keystrokes by calling a proper action method 
  ** on its target class. A typical button is a rectangle with a label in its centre. 
  ** Button view or theme can be changed; the helmiTheme is used by default. 
  ** 
  ** vars: Instance variables
  **  type - '[HButton]'
  **  label - The string that is shown as the label of this object.
  **
  ** Extends:
  **  <HControl>
  **
  ** See also:
  **  <HControl> <HClickButton>
  ***/
HButton = HControl.extend({
  
  componentName: "button",

/** constructor: constructor
  *
  * Parameters:
  *   _rect - An <HRect> object that sets the position and dimensions of this control.
  *   _parentClass - The parent view that this control is to be inserted in.
  *   _options - See <HControl.constructor> and <HComponentDefaults>
  **/
  constructor: function(_rect, _parentClass, _options) {
    if(this.isinherited) {
      this.base(_rect, _parentClass, _options);
    }
    else {
      this.isinherited = true;
      this.base(_rect, _parentClass, _options);
      this.isinherited = false;
    }
    
    this.type = '[HButton]';
    
    // When this is true, the component is always drawn with the theme that was
    // active at the creation of the component, not the current theme.
    this.preserveTheme = true;
    
    if(!this.isinherited) {
      this.draw();
    }
    
    this._drawnSize = [this.rect.width, this.rect.height];
  },
  
  setLabelHeightDiff: function( _newHeightDiff ) {
    this._labelHeightDiff = _newHeightDiff;
    return '';
  },
  
  setLabelWidthDiff: function( _newWidthDiff ) {
    this._labelWidthDiff = _newWidthDiff;
    return '';
  },
  
  onIdle: function() {
    if(this.drawn){
      var _width  = this.rect.width;
      var _height = this.rect.height;
      if( (_width != this._drawnSize[0]) || (_height != this._drawnSize[1]) ) {
        this._drawnSize[0] = _width;
        this._drawnSize[1] = _height;
        if( this.markupElemIds.label ) {
          var _heightDiff = parseInt( _height+this._labelHeightDiff, 10);
          ELEM.setStyle( this.markupElemIds.label, 'line-height', _heightDiff+'px');
          if(ELEM._is_ie6){
            var _widthDiff  = parseInt(_width + this._labelWidthDiff,  10);
            ELEM.setStyle( this.markupElemIds.label, 'height', _heightDiff+'px');
            ELEM.setStyle( this.markupElemIds.label, 'width', _widthDiff+'px');
          }
        }
      }
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
      this._labelHeightDiff=0;
      this._labelWidthDiff=0;
      this.drawMarkup();
    }
    // Make sure the label gets drawn:
    this.refresh();
  },
  
  
/** method: refresh
  * 
  * Redraws only the label, not the whole markup.
  *
  * See also:
  *  <HView.refresh>
  **/
  refresh: function() {
    if(this.drawn) {
      this.base();
      if( this.markupElemIds.label ) {
        // Sets the label's innerHTML:
        ELEM.setHTML( this.markupElemIds.label, this.label );
      }
    }
  }
  
});

/*** class: HClickButton
  **
  ** Identical to <HButton>, except has the default action of incrementing its
  ** value by one whenever clicked.
  **
  ** Bind to a <HValue> to enable begin monitoring click actions at the
  ** server side.
  **
  ** Enables mouseup/down listening automatically, enables the
  ** <click> method to be extended.
  **
  ** See also:
  **  <HButton>
  ***/
HClickButton = HButton.extend({

/*** constructor: constructor
  **
  ** Parameters:
  **   _rect - An <HRect> object that sets the position and dimensions of this control.
  **   _parentClass - The parent view that this control is to be inserted in.
  **   _label - The string that is shown as the label of this object.
  **
  ***/
  constructor: function(_rect, _parentClass, _options) {
    if(this.isinherited) {
      this.base(_rect, _parentClass, _options);
    }
    else {
      this.isinherited = true;
      this.base(_rect, _parentClass, _options);
      this.isinherited = false;
    }
    
    this.type = '[HClickButton]';
    
    this.setMouseDown(true);
    this.setMouseUp(true);
    this._clickOn = false;
    this._focusOn = false;
    
    if(!this.isinherited) {
      this.draw();
    }
  },
  focus: function() {
    if(!this._clickOn && !this._focusOn) {
      this._focusOn = true;
      this._clickOn = false;
    }
    this.base();
  },
  blur: function() {
    if(!this._clickOn) {
      this._focusOn = false;
    }
    this.base();
  },
  mouseDown: function(x, y, _leftButton) {
    if(this._focusOn) {
      this._clickOn = true;
    }
    this.base(x, y, _leftButton);
  },
  mouseUp: function(x, y, _leftButton) {
    if(this._focusOn && this._clickOn) {
      this._clickOn = false;
      this.click(x, y, _leftButton);
    }
    this.base(x, y, _leftButton);
  },
  
/** event: click
  *
  * Extend to implement your own js-side click actions.
  *
  **/
  click: function(x, y, _leftButton) {
    
    this.setValue(this.value + 1);
    
    if(this.action) {
      this.action();
    }
  }
});


/*** class: HToggleButton
  ** 
  ** A button with a selected status which changes when the button gets clicked.
  ** 
  ** constants: Static constants
  **  cssOn - The CSS class name of a selected item ("on").
  **  cssOff - The CSS class name of an unselected item ("off").
  ** 
  ** vars: Instance variables
  **  type - '[HToggleButton]'
  **  value - A boolean, true when the button is on, false when it's off.
  **
  ** See also:
  **  <HButton> <HClickButton>
  ***/
HToggleButton = HClickButton.extend({

/*** constructor: constructor
  **
  ** Parameters:
  **   _rect - An <HRect> object that sets the position and dimensions of this control.
  **   _parentClass - The parent view that this control is to be inserted in.
  **   _label - The string that is shown as the label of this object.
  **
  ***/
  constructor: function(_rect, _parentClass, _options) {
    if(this.isinherited) {
      this.base(_rect, _parentClass, _options);
    }
    else {
      this.isinherited = true;
      this.base(_rect, _parentClass, _options);
      this.isinherited = false;
    }
    
    this.type = '[HToggleButton]';
    
    if(!this.isinherited) {
      this.draw();
    }
  },
  
  click: function(x, y, _leftButton) {
    this.setValue(!this.value);
  },
  
/** method: setValue
  * 
  * Sets the selected status of the button.
  *
  * Parameters:
  *  _flag - True to set the status to selected, false to set to unselected.
  **/
  setValue: function(_flag) {
    if (null === _flag || undefined === _flag) {
      _flag = false;
    }
    this.base(_flag);
  },
  
  
  // Private method. Toggles the button status.
  _updateToggleState: function() {
    if (this.markupElemIds.control) {
      var _elem = ELEM.get(this.markupElemIds.control);
      this.toggleCSSClass(_elem, HToggleButton.cssOn, this.value);
      this.toggleCSSClass(_elem, HToggleButton.cssOff, !this.value);
    }
  },


/** method: refresh
  * 
  * Redraws only the label and button state, not the whole markup.
  *
  * See also:
  *  <HView.refresh>
  **/
  refresh: function() {
    if(this.drawn) {
      this.base();

      // Label
      if(this.markupElemIds.label) {
        ELEM.setHTML(this.markupElemIds.label, this.label);
      }

      // Button's toggle element
      if(this.markupElemIds.control) {
        this._updateToggleState();
      }

    }
  }

},{
  cssOn: "on",
  cssOff: "off"
});
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

/*** class: HStringView
  **
  ** HStringView is a view component that represents a non-editable line of text. 
  ** Commonly, stringview is used as a label to control elements 
  ** that do not have implicit labels (text fields, checkboxes and radio buttons, and menus). 
  ** Some form controls automatically have labels associated with them (press buttons) 
  ** while most do not have (text fields, checkboxes and radio buttons, and sliders etc.).  
  ** HStringView view or theme can be changed; the helmiTheme is used by default.
  **
  ** vars: Instance variables
  **  type - '[HStringView]'
  **  value - The string that this string view displays when drawn.
  **
  ** Extends:
  **  <HControl>
  **
  ** See also:
  **  <HControl>
  ***/
HStringView = HControl.extend({

  componentName: "stringview",

/** constructor: constructor
  *
  * Parameters:
  *   _rect - An <HRect> object that sets the position and dimensions of this control.
  *   _parentClass - The parent view that this control is to be inserted in.
  *   _options - (optional) All other parameters. See <HComponentDefaults>.
  **/
  constructor: function(_rect, _parentClass, _options) {
    
    if(this.isinherited) {
      this.base(_rect, _parentClass, _options);
    }
    else {
      this.isinherited = true;
      this.base(_rect, _parentClass, _options);
      this.isinherited = false;
    }
    
    this.type = '[HStringView]';
    
    // When this is true, the component is always drawn with the theme that was
    // active at the creation of the component, not the current theme.
    this.preserveTheme = true;
    
    if(!this.isinherited) {
      this.draw();
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
    if (!this.drawn) {
      this.drawRect();
      this.drawMarkup();
      this.drawn = true;
    }
    this.refresh();
  },
  
  

/** method: refresh
  * 
  * Redraws only the value, not the whole markup.
  *
  * See also:
  *  <HView.refresh>
  **/
  refresh: function() {
    if(this.drawn) {
      // Super takes care of calling optimizeWidth(), if required.
      this.base();
      if(this.markupElemIds.value) {
        ELEM.setHTML(this.markupElemIds.value, this.value);
      }
    }
  }

  
});

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

/*** class: HTextControl
  **
  ** HTextControl is a control unit that represents an editable input line of text. 
  ** Commonly, textcontrol is used as a single text field in the request forms. 
  ** HTextControl view or theme can be changed; the helmiTheme is used by default.
  **
  ** vars: Instance variables
  **  type - '[HTextControl]'
  **  value - The string that is currently held by this object.
  **
  ** Extends:
  **  <HControl>
  **
  ** See also:
  **  <HControl>
  ***/
HTextControl = HControl.extend({
  
  componentName: "textcontrol",

/** constructor: constructor
  *
  * Parameters:
  *   _rect - An <HRect> object that sets the position and dimensions of this control.
  *   _parentClass - The parent view that this control is to be inserted in.
  *   _options - (optional) All other parameters. See <HComponentDefaults>.
  **/
  constructor: function(_rect, _parentClass, _options) {
    
    if(this.isinherited) {
      this.base(_rect, _parentClass, _options);
    }
    else {
      this.isinherited = true;
      this.base(_rect, _parentClass, _options);
      this.isinherited = false;
    }
    
    this.type = '[HTextControl]';
    
    // When this is true, the component is always drawn with the theme that was
    // active at the creation of the component, not the current theme.
    this.preserveTheme = true;
    if(!this.isinherited) {
      this.draw();
    }
    
    this.setTextEnter(true);
    
  },
  
  draw: function(){
    if(!this.drawn){
      this.base();
      this.drawMarkup();
    } else {
      this.refresh();
    }
  },
  
/** method: setEnabled
  * 
  * Enables/disables the actual text control in addition to changing the look of
  * the field.
  * 
  * Parameters:
  *   _flag - True to enable, false to disable.
  *
  * See also:
  *  <HControl.setEnabled>
  **/
  setEnabled: function(_flag) {
    this.base(_flag);
    if(this['markupElemIds']===undefined){return;}
    if(this.markupElemIds.value) {
      ELEM.setAttr(this.markupElemIds.value,'disabled',!this.enabled);
    }
  },
  
  refreshValue: function(){
    if(this.markupElemIds){
      if(this.markupElemIds.value){
        ELEM.get(this.markupElemIds.value).value = this.value;
      }
    }
  },
  
  textEnter: function(){
    if(this['markupElemIds']===undefined){return;}
    var _value = ELEM.get(this.markupElemIds.value).value;
    //console.log('textEnter, this.value:',this.value,' elem value:',_value);
    if(_value!=this.value){
      this.setValue(_value);
    }
  }
  
});

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

/*** class: HTextArea
  **
  ** HTextArea is a scrollable multi-line area that displays editable plain
  ** text.
  **
  ** vars: Instance variables
  **  type - '[HTextArea]'
  **  value - The string that is currently held by this object.
  **
  ** Extends:
  **  <HTextControl>
  **
  ** See also:
  **  <HControl> <HTextControl>
  ***/
HTextArea = HTextControl.extend({
  
  componentName: "textarea",

/** constructor: constructor
  *
  * Parameters:
  *   _rect - An <HRect> object that sets the position and dimensions of this control.
  *   _parentClass - The parent view that this control is to be inserted in.
  *   _options - (optional) All other parameters. See <HComponentDefaults>.
  **/
  constructor: function(_rect, _parentClass, _options) {
    this.base(_rect, _parentClass, _options);
  }
  
});

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
    var _element = ELEM.get(this.elemId);
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
    var _elem = ELEM.get(this._knobElemId);
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
    ELEM.setStyle(this._knobElemId,_whichprop,_propval);
  }
  
});

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

/*** class: HVSlider
  **
  ** HVSlider (vertical version of the slider control) is a control unit that enables the user
  ** to choose a value in a range of values. Sliders support both dragging the handle and 
  ** clicking the mouse anywhere on the slider to move the handle towards the mouse, 
  ** as well as keyboard support after the handle is in active mode. 
  ** Naturally, sliders are commonly used as colour mixers, volume controls, 
  ** graphical equalizers and seekers in media applications. 
  ** A typical slider is a drag-able knob along vertical or horizontal line. 
  ** Slider view or theme can be changed; the helmiTheme is used by default.
  **
  ** vars: Instance variables
  **  type - '[HVSlider]'
  **  value - Numeric value currently set to this object.
  **  minValue - The minimum value that can be set to this object.
  **  maxValue - The maximum value that can be set to this object.
  **
  ** Extends:
  **  <HSlider>
  **
  ** See also:
  **  <HControl> <HSlider>
  ***/
HVSlider = HSlider.extend({
  
  packageName:   "sliders",
  componentName: "vslider",
  
/** constructor: constructor
  *
  * Parameters:
  *   _rect - An <HRect> object that sets the position and dimensions of this control.
  *   _parentClass - The parent view that this control is to be inserted in.
  *   _options - (optional) All other parameters. See <HComponentDefaults>.
  **/
  constructor: function(_rect,_parentClass,_options) {
    
    if(this.isinherited){
      this.base(_rect,_parentClass,_options);
    }
    else {
      this.isinherited = true;
      this.base(_rect,_parentClass,_options);
      this.isinherited = false;
    }

    
    this.type = '[HVSlider]';
    
    // These override the HSlider properties.
    this._knobPrefix = 'vsliderknob';
    this._isVertical = true;
    if(!this.isinherited){
      this.draw();
    }
  }
  
});

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

/*** class: HProgressBar
  **
  ** HProgressBar is a control unit used to convey the progress of a task, 
  ** such as a download or file transfer. In other words, it is a component 
  ** indicating a percentage of a total task has completed.
  **
  ** vars: Instance variables
  **  type - '[HProgressBar]'
  **  value - Numeric value currently set to this object.
  **  minValue - The minimum value that can be set to this object.
  **  maxValue - The maximum value that can be set to this object.
  **
  ** Extends:
  **  <HControl>
  **
  ** See also:
  **  <HControl> <HProgressIndicator>
  ***/

HProgressBar = HControl.extend({
  
  componentName: "progressbar",

/** constructor: constructor
  *
  * Parameters:
  *   _rect - An <HRect> object that sets the position and dimensions of this control.
  *   _parentClass - The parent view that this control is to be inserted in.
  *   _options - (optional) All other parameters. See <HComponentDefaults>.
  **/  
  constructor: function(_rect,_parentClass,_options) {  

    if(this.isinherited) {
      this.base(_rect,_parentClass,_options);
    }
    else {
      this.isinherited = true;
      this.base(_rect,_parentClass,_options);
      this.isinherited = false;
    }
    
    if (!_options) {
      _options = {};
    }
    
    // Default options.
    var _defaults = Base.extend({
      value: 0,
      minValue: 0,
      maxValue: 100
    });
    
    _defaults = _defaults.extend(_options);
    _options = new _defaults();

    this.value = _options.value;
    this.minValue = _options.minValue;
    this.maxValue = _options.maxValue;

    this.visibleWidth = this.rect.width - 2;
    
    this.type = '[HProgressBar]';
    this._progressbarPrefix = 'progressmark';
    
    if(!this.isinherited) {
      this.draw();
    }
    
    this.progressFrameHeight = 20;
    this.progressFrames      = 10;
    this.currProgressFrame   = 0;
  },
  
  setProgressFrameHeight: function(_px){
    this.progressFrameHeight = _px;
  },
  
  setProgressFrameNum: function(_num){
    this.progressFrames = _num;
  },
  
/** method: setValue
  * 
  * Sets the current value of the object and extends the progress mark to the correct position.
  * 
  * Parameters:
  *   _value - A numeric value to be set to the object.
  *
  * See also:
  *  <HControl.setValue>
  **/  
  setValue: function(_value) {  
    this.base(_value);       
    this.drawProgress();
  },
  
  onIdle: function(){
    if(this.progressbarElemId) {
      this.currProgressFrame++;
      if(this.currProgressFrame>=this.progressFrames){this.currProgressFrame=0;}
      var _px = this.currProgressFrame*this.progressFrameHeight;
      ELEM.setStyle(this.progressbarElemId,'background-position','0px -'+_px+'px');
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
    if (!this.drawn) {
      this.drawRect();
      this.drawMarkup();
      this._initProgress();
    }
  },

// private method  
  _initProgress: function() {
    this.progressbarElemId = this.bindDomElement(
      this._progressbarPrefix + this.elemId);
    this.drawProgress();
  },

// private method  
  _value2px: function() {   
    var _intvalue = this.visibleWidth * ((this.value - this.minValue) / (this.maxValue - this.minValue));
    var _pxvalue = parseInt(Math.round(_intvalue),10) + 'px';
    return _pxvalue; 
  },

// private method 
  drawProgress: function() {
    if (this.progressbarElemId) {
      var _propval   = this._value2px();
      ELEM.setStyle(this.progressbarElemId, 'width', _propval);
    }
  }
});
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

/*** class: HProgressIndicator
  **
  ** A progress indicator is the indeterminate progress bar, which is used in situations where the
  ** extent of the task is unknown or the progress of the task can not be determined in a way that could be
  ** expressed as a percentage. This bar uses motion or some other indicator to show that progress is taking
  ** place, rather than using the size of the filled portion to show the total amount of progress.
  **
  ** vars: Instance variables
  **  type - '[HProgressIndicator]'
  **  value - Boolean value currently set to this object (true - on, false - off).
  **  interval - The delay time (in ms) before the next iteration.
  **
  ** Extends:
  **  <HControl>
  **
  ** See also:
  **  <HControl> <HProgressBar>
  ***/

HProgressIndicator = HControl.extend({
  
  packageName:   "progress",
  componentName: "progressindicator",

/** constructor: constructor
  *
  * Parameters:
  *   _rect - An <HRect> object that sets the position and dimensions of this control.
  *   _parentClass - The parent view that this control is to be inserted in.
  *   _options - (optional) All other parameters. See <HComponentDefaults>.
  **/    
  constructor: function(_rect,_parentClass,_options) { 
   
    if(this.isinherited) {
      this.base(_rect,_parentClass,_options);
    }
    else {
      this.isinherited = true;
      this.base(_rect,_parentClass,_options);
      this.isinherited = false;
    }
    
    if (!_options) {
      _options = {};
    }
    
    // Default options.
    var _defaults = Base.extend({
      value: 0,
      interval: 20
    });
    _defaults = _defaults.extend(_options);
    _options = new _defaults();

  
    this.type = '[HProgressIndicator]';
    this._progressbarPrefix = 'progressmark'; 
    
    this.interval = _options.interval;
    this.value = _options.value;
    
    // The interval reference.
    this._counter = null;
    
    if(!this.isinherited) {
        this.draw();
    }
    
  },

/** method: setValue
  * 
  * Checks if the given value is true of false and serves as a toggle of the object. (to be changed..)
  * 
  * Parameters:
  *   _value - A boolean value to be set to the object.
  *
  **/ 
  setValue: function(_value) {
    
    if(this._progressbarElemId) {
      
      if (_value == true && !this._counter) {
        var temp = this;
        this._counter = setInterval(function() {
            temp.drawProgress();
          }, temp.interval
        );
      }
      else {
        clearInterval(this._counter);
        this._counter = null;
      }
      
    }
  },
  
  
/** method: die
  * 
  * Makes sure the progress indicator update interval gets cleaned up before the
  * component is destroyed.
  * 
  * See also:
  *  <HView.die>
  */
  die: function() {
    this.base();
    if (this._counter) {
      clearInterval(this._counter);
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
    if (!this.drawn) {
      this.drawRect();
      this.drawMarkup();
      this._initProgress();
    }
  },

// private method   
  _initProgress: function() {
    this._progressbarElemId = this.bindDomElement(
      this._progressbarPrefix + this.elemId);

    this.drawProgress();
  },

// private method 
  drawProgress: function() {
    this.progressPosition ++;
    if(this.progressPosition > this.positionLimit - 1) {
      this.progressPosition = 0;
    }
    
    if (this._progressbarElemId) {
      ELEM.setStyle(this._progressbarElemId, 'background-position', '0px -' +
        (this.progressPosition * this.rect.height) + 'px');
    }
    
  }
   
});

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

/*** class: HImageView
  **
  ** HImageView is a control unit intended to display images on the screen
  ** through the HTML <IMG> tag. The HImageView class is a container to visualize
  ** images loaded via URL. It supports scaling via two class methods, 
  ** scaleToFit and scaleToOriginal. If the image is unable to be loaded, 
  ** a default blank image will be rendered.
  **
  ** vars: Instance variables
  **  type - '[HImageView]'
  **  value - URL pointing to the image that is currently shown.
  **
  ** Extends:
  **  <HControl>
  **
  ** See also:
  **  <HControl>
  ***/
HImageView = HControl.extend({
  
/** constructor: constructor
  *
  * Parameters:
  *   _rect - An <HRect> object that sets the position and dimensions of this control.
  *   _parentClass - The parent view that this control is to be inserted in.
  *   _options - (optional) All other parameters. See <HComponentDefaults>.
  **/
  constructor: function(_rect, _parentClass, _options) {
    if(!_options) {
      _options={};
    }
    var _defaults = HClass.extend({
      scaleToFit: true
    });
    _options = new (_defaults.extend(_options))();
    if(this.isinherited) {
      this.base(_rect, _parentClass, _options);
    }
    else {
      this.isinherited = true;
      this.base(_rect, _parentClass, _options);
      this.isinherited = false;
    }
    if(!this.value) {
      // default to a blank image
      this.value = this.getThemeGfxPath() + "/blank.gif";
    }
    
    this.type = '[HImageView]';
    
    if(!this.isinherited) {
      this.draw();
    }
  },
  
  _makeScaleToFit: function(_parentId){
    this.elemId = ELEM.make(_parentId,'img');
    ELEM.setAttr(this.elemId,'src',this.value);
    ELEM.setAttr(this.elemId,'alt',this.label);
  },
  _makeScaleToOriginal: function(_parentId){
    this.elemId = ELEM.make(_parentId,'div');
    ELEM.setStyle(this.elemId,'background-image','url('+this.value+')');
    ELEM.setStyle(this.elemId,'background-position','0px 0px');
    ELEM.setStyle(this.elemId,'background-repeat','no-repeat');
  },
  _makeElem: function(_parentId){
    if(this.options.scaleToFit){
      this._makeScaleToFit(_parentId);
    }
    else {
      this._makeScaleToOriginal(_parentId);
    }
  },
  
  setValue: function(_value){
    this.base(_value);
    ELEM.setAttr(this.elemId,'src',_value);
  },
  
  setLabel: function(_label){
    this.base(_label);
    ELEM.setAttr(this.elemId,'alt',_label);
  },
  
/** method: scaleToFit
  * 
  * Changes the size of the image element so that it fits in the rectangle of
  * the view.
  *
  * See also:
  *  <scaleToOriginal>
  **/
  scaleToFit: function() {
    if(!this.options.scaleToFit){
      ELEM.del(this.elemId);
      this._makeScaleToFit(this._getParentElemId());
      this.options.scaleToFit=true;
    }
  },
  
  
/** method: scaleToOriginal
  * 
  * Resizes the image element to its original dimesions. If the image is larger
  * than the rectangle of this view, clipping will occur.
  *
  * See also:
  *  <scaleToFit>
  **/
  scaleToOriginal: function() {
    if(this.options.scaleToFit){
      ELEM.del(this.elemId);
      this._makeScaleToOriginal(this._getParentElemId());
      this.options.scaleToFit=false;
    }
  }


  
});
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

/*** class: HSplitView
  **
  ** An HSplitView object stacks several child views within one view so that the user can change their relative sizes.
  ** By default, the split bars between the views are horizontal, so the views are one on top of the other.
  **
  ** vars: Instance variables
  **  type - '[HSplitView]'
  **  vertical - Sets whether the split bars are vertical.
  **
  ** Extends:
  **  <HControl>
  **
  ** See also:
  **  <HControl>
  ***/
HSplitView = HControl.extend({
    
  componentName: "splitview",

  /** constructor: constructor
  *
  * Parameters:
  *   _rect - An <HRect> object that sets the position and dimensions of this
  *     control.
  *   _parentClass - The parent view that this control is to be inserted in.
  *   _options - (optional) All other parameters. See <HComponentDefaults>.
  **/
  constructor: function(_rect, _parentClass, _options) {
    
    _options = new (Base.extend({
      vertical: false
    }).extend(_options));
    
    if(this.isinherited) {
      this.base(_rect, _parentClass, _options);
    }
    else {
      this.isinherited = true;
      this.base(_rect, _parentClass, _options);
      this.isinherited = false;
    }
    
    this.type = '[HSplitView]';
    
    // When this is true, the component is always drawn with the theme that was
    // active at the creation of the component, not the current theme.
    this.preserveTheme = true;
    
    this.vertical = this.options.vertical;
    
    this.dividerWidth = 6;
    this.splitviews = [];
    this.dividers = [];
    
    this.setDraggable(true);
    
    if(!this.isinherited) {
      this.draw();
    }
  },
  startDrag: function(_x, _y, _dividerView) {
    if (!_dividerView) {
      return;
    }
    _x -= this.pageX();
    _y -= this.pageY();
    var _index = this.dividers.indexOfObject(_dividerView);
    
    this._startPointCRSR  = new HPoint( _x, _y );
    this._prevPointCRSR   = new HPoint( _x, _y );
    
    this._diffPoint = this._startPointCRSR.subtract(_dividerView.rect.leftTop);
    
    this._startView1  = this.splitviews[_index];
    this._startView2  = this.splitviews[_index + 1];
    this._dividerView = _dividerView;
    if (this.vertical == false) {
      this._limit1 = this._startView1.rect.top;
      this._limit2 = this._startView2.rect.bottom - this.dividerWidth;
    } else {
      this._limit1 = this._startView1.rect.left;
      this._limit2 = this._startView2.rect.right - this.dividerWidth;
    }
  },
  doDrag: function(_x, _y, _dividerView) {
    if (!_dividerView) {
      return;
    }
    _x -= this.pageX();
    _y -= this.pageY();
    if (this.vertical == false) {
      var _targetPoint = _y - this._diffPoint.y;
      if (_targetPoint < this._limit1 || _targetPoint > this._limit2) {
        return;
      }
      
      this._startView1.rect.setHeight(_targetPoint);
      this._startView1.rect.updateSecondaryValues();
      this._startView1.setStyle('height',this._startView1.rect.height+'px', true);
      
      this._dividerView.rect.setTop(_targetPoint);
      this._dividerView.rect.updateSecondaryValues();
      this._dividerView.setStyle('top',this._dividerView.rect.top+'px', true);
      
      this._startView2.rect.setTop(_targetPoint + this.dividerWidth);
      this._startView2.rect.updateSecondaryValues();
      this._startView2.setStyle('top',this._startView2.rect.top+'px', true);
      this._startView2.setStyle('height',this._startView2.rect.height+'px', true);
    } else {
      var _targetPoint = _x - this._diffPoint.x;
      if (_targetPoint < this._limit1 || _targetPoint > this._limit2) {
        return;
      }
      this._startView1.rect.setRight(_targetPoint);
      this._startView1.rect.updateSecondaryValues();
      this._startView1.setStyle('width',this._startView1.rect.width+'px', true);
      
      this._dividerView.rect.setLeft(_targetPoint);
      this._dividerView.rect.updateSecondaryValues();
      this._dividerView.setStyle('left',this._dividerView.rect.left+'px', true);
      
      this._startView2.rect.setLeft(_targetPoint + this.dividerWidth);
      this._startView2.rect.updateSecondaryValues();
      this._startView2.setStyle('left',this._startView2.rect.left+'px', true);
      this._startView2.setStyle('width',this._startView2.rect.width+'px', true);
    }
  },
  endDrag: function(_x, _y, _dividerView) {
    this.doDrag(_x, _y);
    delete this._startPointCRSR;
    delete this._prevPointCRSR;
    delete this._diffPoint;
    delete this._startView1;
    delete this._startView2;
    delete this._dividerView;
    delete this._limit1;
    delete this._limit2;
  },
  /** method: addSplitViewItem
  * 
  * Adds an item to the HSplitView at index - or, if no index is mentioned, to
  * the end of the list.
  * 
  * Parameters:
  *   _item - A [HView] object.
  *   _index - The index of the item, its ordinal position in the menu. Indices
  *     begin at 0.
  **/  
  addSplitViewItem: function(_item, _index) {
    if (_index !== undefined) {
      this.splitviews.splice(_index, 0, _item);
    } else {
      this.splitviews.push(_item);
    }
  },
  /** method: removeSplitViewItem
  * 
  * Removes the the specified item from the HSplitView.
  * 
  * Parameters:
  *   _item - A [HView] object.
  *
  **/ 
  removeSplitViewItem: function(_item) {
    if (typeof _item == "object") {
      var _index = this.splitviews.indexOfObject(_item);
      if (_index != -1) {
        this.splitviews.splice(_index, 1);
        _item.die();
        this.dividers.splice(_index, 1);
        this.dividers[_index].die();
      }
    }
  },
  /** method: setVertical
  * 
  * Sets whether the split bars are vertical.
  * 
  * Parameters:
  *   _flag - f flag is true, they're vertical (child views are side by side); if it's false, they're horizontal (child views are one on top of the other). Split bars are horizontal by default.
  **/
  setVertical: function(_flag) {
    this.vertical = _flag;
    this.options.vertical = _flag;
  },
  /** method: adjustViews
  * 
  * Adjusts the sizes of the receiver’s child views so they (plus the dividers) fill the receiver.
  * The child views are resized proportionally; the size of a child view relative to the other child views doesn’t change.
  * 
  **/
  adjustViews: function() {
    var _viewCount = this.splitviews.length;
    var _newTotal;
    var _oldTotal;
    var _scale;
    var _running;
    if (this.vertical == false) {
      _newTotal = this.rect.height - this.dividerWidth*(_viewCount - 1);
      _oldTotal = 0;
      for (var i = 0; i < _viewCount; i++) {
        _oldTotal += this.splitviews[i].rect.height;
      }
      // 
      _scale = _newTotal / _oldTotal;
      _running = 0;
      for (var i = 0; i < _viewCount; i++) {
        var _view = this.splitviews[i];
        var _newHeight = _view.rect.height*_scale;
        if (i == _viewCount - 1) {
          _newHeight = Math.floor(_newHeight);
        } else {
          _newHeight = Math.ceil(_newHeight);
        }
        _view.rect.offsetTo(0, _running);
        _view.rect.setSize(this.rect.width, _newHeight);
        _view.draw();
        _running += _newHeight + this.dividerWidth;
      }
    } else {
      _newTotal = this.rect.width - this.dividerWidth*(_viewCount - 1);
      _oldTotal = 0;
      for (var i = 0; i < _viewCount; i++) {
        _oldTotal += this.splitviews[i].rect.width;
      }
      _scale = _newTotal / _oldTotal;
      _running = 0;
      for (var i = 0; i < _viewCount; i++) {
        var _view = this.splitviews[i];
        var _newWidth = _view.rect.width*_scale;
        if (i == _viewCount - 1) {
          _newWidth = Math.floor(_newWidth);
        } else {
          _newWidth = Math.ceil(_newWidth);
        }
        _view.rect.offsetTo(_running, 0);
        _view.rect.setSize(_newWidth, this.rect.height);
        _view.draw();
        _running += _newWidth + this.dividerWidth;
      }
    }
    this.draw();
  },
  draw: function() {
    if(!this.drawn) {
      this.drawRect();
      this.drawMarkup();
      this.drawn = true;
    }
    this.refresh();
  },
  refresh: function() {
    // base method calls drawRect
    this.base();
    if (this.drawn) {
      var _viewCount = this.splitviews.length;
      var _divRect;
     // draws the dividers between the views
      for (var i = 0; i < (_viewCount -1); i++) {
        _divRect = new HRect(this.splitviews[i].rect);
        if (!this.vertical) {
          _divRect.offsetTo(_divRect.left, _divRect.bottom);
          _divRect.setHeight(this.dividerWidth);
        } else {
          _divRect.offsetTo(_divRect.right, _divRect.top);
          _divRect.setWidth(this.dividerWidth);
        }
        if (!this.dividers[i]) {
          this.dividers[i] = new HDivider(_divRect,this);
        } else {
          var _view = this.dividers[i];
          _view.rect.offsetTo(_divRect.left, _divRect.top);
          _view.rect.setSize(_divRect.width, _divRect.height);
          _view.draw();
        }
      }
    }
  }
});
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
    
    this.type = '[HStepper]';
    
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

/*** class: HRadiobutton
  **
  ** HRadiobutton is a control unit that allows the user to choose 
  ** one of a predefined set of options. Radio buttons can have two states, 
  ** selected and unselected. Radio buttons are arranged in groups of two or more units. 
  ** When the user selects a radio button, 
  ** any previously selected radio button in the same group becomes deselected. 
  ** Radio button view or theme can be changed; the helmiTheme is used by default.
  **
  ** vars: Instance variables
  **  type - '[HRadiobutton]'
  **  value - A boolean, true when the radiobutton is checked, false when it's not.
  **
  ** Extends:
  **  <HCheckbox>
  **
  ** See also:
  **  <HControl> <HCheckbox> <HToggleButton>
  ***/
HRadiobutton = HToggleButton.extend({
  
  componentName: "radiobutton",

/** constructor: constructor
  *
  * Parameters:
  *   _rect - An <HRect> object that sets the position and dimensions of this
  *           control.
  *   _parentClass - The parent view that this control is to be inserted in.
  *   _options - (optional) All other parameters. See <HComponentDefaults>.
  **/
  constructor: function(_rect, _parentClass, _options) {
    if(this.isinherited) {
      this.base(_rect, _parentClass, _options);
    }
    else {
      this.isinherited = true;
      this.base(_rect, _parentClass, _options);
      this.isinherited = false;
    }
    
    this.type = '[HRadiobutton]';
    
    if(!this.isinherited) {
      this.draw();
    }
  },

/** method: setValueMatrix
  *
  * Sets the component as a member of a value matrix.
  *
  * See also:
  *  <HValueMatrix>
  **/
  setValueMatrix: function(_aValueMatrix){
    this.valueMatrix = _aValueMatrix;
    this.valueMatrixIndex = this.valueMatrix.addValue(this.valueObj,this.value);
  },

/** method: click
  * 
  * Called when the user clicks the mouse button on this object.
  *
  * Parameters:
  *  _x - The horizonal coordinate units (px) of the mouse cursor position.
  *  _y - The vertical coordinate units (px) of the mouse cursor position.
  *  _leftButton - Flag, is false when the right mouse button was pressed. *Do
  *                not rely on it*
  *
  * See also:
  *  <HControl.mouseDown>
  **/
  click: function(x, y, _leftButton) {
    this.base(x, y, _leftButton);
    if (undefined !== this.valueMatrix && this.valueMatrix instanceof HValueMatrix) {
      this.valueMatrix.setValue( this.valueMatrixIndex );
    }
  }
  
});

// Backwards compatibility
HRadioButton = HRadiobutton;
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

/*** class: HPasswordControl
  **
  ** Just like HTextControl, but the typed characters are not shown.
  **
  ** vars: Instance variables
  **  type - '[HPasswordControl]'
  **  value - The string that is currently held by this object.
  **
  ** Extends:
  **  <HTextControl>
  **
  ** See also:
  **  <HControl> <HTextControl>
  ***/
HPasswordControl = HTextControl.extend({
  
  componentName: "passwordcontrol"

});

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

HDivider = HControl.extend({
    
  componentName: "divider",
    
  constructor: function(_rect, _parentClass, _options) {
    
    if(this.isinherited) {
      this.base(_rect, _parentClass, _options);
    }
    else {
      this.isinherited = true;
      this.base(_rect, _parentClass, _options);
      this.isinherited = false;
    }
    
    this.type = '[HDivider]';
    
    // When this is true, the component is always drawn with the theme that was
    // active at the creation of the component, not the current theme.
    this.preserveTheme = true;
    
    this.setDraggable(true);
    
    if(!this.isinherited) {
      this.draw();
    }
  },
  startDrag: function(_x, _y) {
    this.parent.startDrag(_x, _y, this);
  },
  doDrag: function(_x, _y) {
    this.parent.doDrag(_x, _y, this);
  },
  endDrag: function(_x, _y) {
    this.parent.endDrag(_x, _y, this);
  },
  draw: function() {
    if(!this.drawn) {
      this.drawRect();
      this.drawMarkup();
      this.drawn = true;
    }
    // Make sure the label gets drawn:
    this.refresh();
}
});
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

/*** class: HCheckbox
  **
  ** HCheckbox is a control unit that allows the user to make multiple selections 
  ** from a number of options. Checkboxes can have two states, checked and unchecked. 
  ** In contrast of radio button, checkbox can be presented as a single unit. 
  ** State transition of a checkbox is done by clicking the mouse on the button 
  ** or by using a keyboard shortcut. Checkbox view or theme can be changed; 
  ** the helmiTheme is used by default.
  **
  ** vars: Instance variables
  **  type - '[HCheckbox]'
  **  value - A boolean, true when the checkbox is checked, false when it's not.
  **
  ** Extends:
  **  <HControl>
  **
  ** See also:
  **  <HControl> <HRadioButton> <HToggleButton>
  ***/
HCheckbox = HToggleButton.extend({
  
  componentName: "checkbox",

/** constructor: constructor
  *
  * Parameters:
  *   _rect - An <HRect> object that sets the position and dimensions of this
  *           control.
  *   _parentClass - The parent view that this control is to be inserted in.
  *   _options - (optional) All other parameters. See <HComponentDefaults>.
  **/
  constructor: function(_rect, _parentClass, _options) {
    if(this.isinherited) {
      this.base(_rect, _parentClass, _options);
    }
    else {
      this.isinherited = true;
      this.base(_rect, _parentClass, _options);
      this.isinherited = false;
    }
    
    this.type = '[HCheckbox]';
    
    if(!this.isinherited) {
      this.draw();
    }
  }

});
/***  HIMLE RIA SYSTEM
  ** 
  **  Copyright (C) 2008 HIMLE GROUP http://himle.sorsacode.com/
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


HValidatorView = HControl.extend({

/** constructor: constructor
  *
  * Parameters:
  *   _rect - An <HRect> object that sets the position and dimensions of this control.
  *   _parent - The parent view that this control is to be inserted in.
  *   _options - (optional) All other parameters. See <HComponentDefaults>.
  **/
  constructor: function(_rect, _parent, _options) {
    
    if(_options !== undefined){
      if(_options.valueField !== undefined){
        _rect.offsetBy(
          _options.valueField.rect.right,
          _options.valueField.rect.top
        );
      }
    }
    
    if(this.isinherited) {
      this.base(_rect, _parent, _options);
    }
    else {
      this.isinherited = true;
      this.base(_rect, _parent, _options);
      this.isinherited = false;
    }
    
    this.type = '[HValidatorView]';
    
    if(!this.isinherited) {
      this.draw();
    }
  },
  
/** method: setValue
  * 
  * Sets the selected status of the validator.
  *
  * Parameters:
  *  _flag - True to set the status to selected, false to set to unselected.
  **/
  setValue: function(_flag) {
    if (null === _flag || undefined === _flag) {
      _flag = false;
    }
    this.base(_flag);
  },
  
  refresh: function(){
    this.base();
    this._updateValidatorState();
  },
  
  // Private method. Toggles the validator status.
  _updateValidatorState: function() {
    var _x=0, _y=0;
    
    this.setStyle('background-image',"url('"+this.getThemeGfxFile('validator.png')+"')");
    this.setStyle('background-repeat','no-repeat');
    
    if(this.enabled==false){ _y = -21; }
    if(this.value==true){
      _x = -21;
      _title = '';
    } else {
      _title = this.value;
    }
    
    ELEM.setAttr(this.elemId,'title',_title);
    
    this.setStyle('background-position',_x+'px '+_y+'px');
  }

  
});
/***
  ** Himle Client -- http://himle.org/
  **
  ** Copyright (C) 2008 Juha-Jarmo Heinonen
  **
  ** This file is part of Himle Client.
  **
  ** Himle Client is free software: you can redistribute it and/or modify
  ** it under the terms of the GNU General Public License as published by
  ** the Free Software Foundation, either version 3 of the License, or
  ** (at your option) any later version.
  **
  ** Himle Client is distributed in the hope that it will be useful,
  ** but WITHOUT ANY WARRANTY; without even the implied warranty of
  ** MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  ** GNU General Public License for more details.
  **
  ** You should have received a copy of the GNU General Public License
  ** along with this program.  If not, see <http://www.gnu.org/licenses/>.
  **
  ***/

/** class: HWindow
  *
  * Simple window component.
  *
  * Extends:
  *  <HDynControl>
  *
  * See Also:
  *  <HDynControl> <HControl> <HView>
  *
  **/
HWindow = HDynControl.extend({
  componentName:      'window',
  componentBehaviour: 'window',
  constructor: function(_rect,_parentApp,_options){
    if(_parentApp.componentBehaviour[0]!='app'){
      console.log(
        "Himle.ComponentParentError",
        "HWindow parent must be an HApplication instance!"
      );
    }
    this.base(_rect,_parentApp,_options);
    this.windowView = this; // backwards-compatibility, will go away!
    HSystem.windowFocus(this);
  },
  gainedActiveStatus: function(){
    HSystem.windowFocus(this);
  },
  windowFocus: function(){
    this.toggleCSSClass(this.elemId, 'inactive', false);
  },
  windowBlur: function(){
    this.toggleCSSClass(this.elemId, 'inactive', true);
  },
  refresh: function() {
    if(this.drawn){
      this.base();
      // Label
      if(this.markupElemIds.label){
        ELEM.setHTML(this.markupElemIds.label, this.label);
      }
    }
  }
});

/***
  ** Himle Client -- http://himle.org/
  **
  ** Copyright (C) 2008 Juha-Jarmo Heinonen
  **
  ** This file is part of Himle Client.
  **
  ** Himle Client is free software: you can redistribute it and/or modify
  ** it under the terms of the GNU General Public License as published by
  ** the Free Software Foundation, either version 3 of the License, or
  ** (at your option) any later version.
  **
  ** Himle Client is distributed in the hope that it will be useful,
  ** but WITHOUT ANY WARRANTY; without even the implied warranty of
  ** MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  ** GNU General Public License for more details.
  **
  ** You should have received a copy of the GNU General Public License
  ** along with this program.  If not, see <http://www.gnu.org/licenses/>.
  **
  ***/

/** class: HWindow
  *
  * Simple window component.
  *
  * Extends:
  *  <HDynControl>
  *
  * See Also:
  *  <HDynControl> <HControl> <HView>
  *
  **/
HWindow = HDynControl.extend({
  componentName:      'window',
  componentBehaviour: 'window',
  constructor: function(_rect,_parentApp,_options){
    if(_parentApp.componentBehaviour[0]!='app'){
      console.log(
        "Himle.ComponentParentError",
        "HWindow parent must be an HApplication instance!"
      );
    }
    this.base(_rect,_parentApp,_options);
    this.windowView = this; // backwards-compatibility, will go away!
    HSystem.windowFocus(this);
  },
  gainedActiveStatus: function(){
    HSystem.windowFocus(this);
  },
  windowFocus: function(){
    this.toggleCSSClass(this.elemId, 'inactive', false);
  },
  windowBlur: function(){
    this.toggleCSSClass(this.elemId, 'inactive', true);
  },
  refresh: function() {
    if(this.drawn){
      this.base();
      // Label
      if(this.markupElemIds.label){
        ELEM.setHTML(this.markupElemIds.label, this.label);
      }
    }
  }
});

