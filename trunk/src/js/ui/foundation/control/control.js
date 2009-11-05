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


/** class: HControl
  *
  * Abstract foundation class for all active visual components that implement events and values.
  *
  * Feel free to extend HControl to suit your needs. See any component for extension reference.
  *
  * vars: Instance variables (common for almost all components)
  *  type - '[HControl]'
  *  label - The visual value of a component. See <setLabel>.
  *  action - A function reference to call in certain situations.
  *  events - A structure that tells what events to bind.
  *  enabled - The enabled/disabled flag. See <setEnabled>.
  *  value - The current value of a component. See <setValue>.
  *  valueObj - The current <HValue>-compatible object. Do not set directly. Holds reference to the bound <HValue> instance. Set with <HValue.bind>.
  *  minValue - The minimum allowed value, when the component utilizes value ranges. See <setValueRange>.
  *  maxValue - The maximum allowed value, when the component utilizes value ranges. See <setValueRange>.
  *  active - A boolean value that shows whether this control is currently active or not. Control gets active when the user clicks on it.
  *
  * Extends:
  *  <HView>
  *
  * See Also:
  *  <HSystem> <HApplication> <HView> <HValue> <HEventManager>
  *
  **/
HControl = HView.extend({
  
  componentBehaviour: ['view','control'],
/** constructor: constructor
  *
  * The first two parameters are the same as with <HView>, but additionally
  * sets the label and events.
  *
  * Parameters:
  *  _rect - The rectangle of the component. See <HView.constructor>.
  *  _parent - The parent component of the component. See <HView.constructor>.
  *  _options - (optional) All other parameters. See <HComponentDefaults>.
  *
  **/
  refreshOnValueChange: true,
  refreshOnLabelChange: true,
  constructor: function(_rect, _parent, _options) {
    
    // Use empty options if none supplied. Change this within components.
    if(!_options) {
      _options = {};
    }
    
    var _isValueRange = (_options.minValue || _options.maxValue);
    _options = HComponentDefaults.extend(_options).nu();
    var _label = _options.label,
        _events = _options.events,
        _this = this;
    
    _this.options = _options;
    
    // HView.constructor:
    if(_this.isinherited) {
      _this.base(_rect, _parent);
    }
    else {
      _this.isinherited = true;
      _this.base(_rect, _parent);
      _this.isinherited = false;
    }
    
    // Initial visibility.
    if(_options.visible) {
      _this.show();
    }
    else {
      _this.hide();
    }
    
    _this.setLabel(_label);
    _this.setEvents(_events);
    _this.setEnabled(_options.enabled);
    
    if(_options.valueObj){
      _options.valueObj.bind(_this);
    }
    if(!_this.valueObj) {
      _this.valueObj = HDummyValue.nu();
    }
    if((_this.value===undefined)&&(_options.value!==undefined)) {
      _this.setValue(_options.value);
    }
    if(_isValueRange) {
      _this.setValueRange(this.value, _options.minValue, _options.maxValue);
    }
    
    if(!_this.isinherited) {
      _this.draw();
    }
  },
  
/** method: setAction
  *
  * Actions are specified as function calls to components. These are usually used as defineable external function calls.
  *
  * Parameters:
  *  _action - A function reference, the number of parameters the receiver function should take depends on the component.
  *
  * Examples:
  *  > myComponent.setAction(alert);
  *  > myComponent.setAction(function(param){window.status='param given: '+param});
  *
  **/
  setAction: function(_action) {
    this.action = _action;
    return this;
  },
  
/** method: die
  *
  * Unregisters events before destroying the view.
  *
  * See also:
  *  <HView.die>
  **/
  die: function() {
    var _this = this;
    if(_this.valueObj){
      _this.valueObj.unbind(_this);
      delete _this.valueObj;
    }
    EVENT.unreg(_this);
    _this.base();
  },
  
/** method: setLabel
  *
  * Sets the label on a control component: the text that's displayed, for
  * example, in the <HButton>. Actual functionality is implemented in component
  * templates and component <refresh> method extensions.
  *
  * Parameters:
  *  _label - The text the component should display.
  *
  **/
  setLabel: function(_label) {
    var _this = this,
        _differs = (_label !== _this.label);
    if(_differs){
      _this.label = _label;
      _this.options.label = _label;
      _this.refresh();
    }
    return this;
  },
  
/** method: setEnabled
  *
  * Enables the Control if the enabled flag is true, and disables
  * it if enabled is false.
  * Typically, a disabled Control also won't post messages or respond
  * to mouse and keyboard manipulation.
  *
  * Parameters:
  *  _flag - Boolean; true enables, false disables.
  *
  * See also:
  *  <events> <HEventManager.register> <HEventManager.unreg>
  *
  **/
  setEnabled: function(_flag) {
    
    var _this = this,
        _elemId = this.elemId,
        _sysViews = HSystem.views,
        i = 0,
        _views = _this.views,
        _viewsLen = _views.length;
    
    // Enable/disable the children first.
    for (; i < _viewsLen; i++) {
      _sysViews[_views[i]].setEnabled(_flag);
    }
    
    if (_this.enabled === _flag) {
      // No change in enabled status, do nothing.
      return this;
    }
    
    _this.enabled = _flag;
    
    if(_flag) {
      EVENT.reg(_this, _this.events);
    }
    else {
      EVENT.unreg(this);
    }
    
    // Toggle the CSS class: enabled/disabled
    _this.toggleCSSClass(_elemId, HControl.CSS_ENABLED, _flag);
    _this.toggleCSSClass(_elemId, HControl.CSS_DISABLED, !_flag);
    return this;
  },
  
  
/** method: setValueRange
  *
  * Assigns the object a new value range. Used for sliders etc. Calls 
  * <setValue> with the value given.
  *
  * Parameters:
  *  _value - The new <value> to be set to the component's <HValue>-compatible instance.
  *  _minValue - The new minimum <value> limit. See <minValue>.
  *  _maxValue - The new maximum <value> limit. See <maxValue>.
  *
  * See also:
  *  <setValue> <HValue> <minValue> <maxValue> <HValueManager> <refresh>
  **/
  setValueRange: function(_value, _minValue, _maxValue) {
    this.minValue = _minValue;
    this.maxValue = _maxValue;
    _value = (_value < _minValue) ? _minValue : _value;
    _value = (_value > _maxValue) ? _maxValue : _value;
    this.setValue(_value);
    this.refresh();
    return this;
  },
  
  refreshValue: function(){
    if(this.markupElemIds){
      if(this.markupElemIds.value){
        ELEM.setHTML(this.markupElemIds.value,this.value);
      }
    }
    return this;
  },
  refreshLabel: function(){
    if(this.markupElemIds){
      if(this.markupElemIds.label){
        ELEM.setHTML(this.markupElemIds.label,this.label);
      }
    }
    return this;
  },
  refresh: function(){
    this.base();
    if(this.drawn){
      if(this.refreshOnValueChange){
        this.refreshValue();
      }
      if(this.refreshOnLabelChange){
        this.refreshLabel();
      }
    }
    return this;
  }
},{
  
  
  // Class methods and properties
  
  stopPropagation: function(event) {
    if (event.stopPropagation) { 
      event.stopPropagation(); 
    } else {
      event.cancelBubble = true;
    }
  },
  
  H_CONTROL_ON:  1,
  H_CONTROL_OFF: 0,
  
  // CSS class names for different statuses.
  CSS_DISABLED: "disabled",
  CSS_ENABLED:  "enabled",
  CSS_ACTIVE:   "active"
  
});

HControl.implement( HValueResponder );
HControl.implement( HEventResponder );
