/*   Riassence Framework
 *   Copyright 2006 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

/** = Description
  * The foundation class for all active visual components that 
  * implement events and values.
  * 
  * Extend +HControl+ to suit your needs. See any component 
  * for extension reference.
  *
  * = Instance variables
  * +label+::       The visual value of a component. See setLabel.
  * +action+::      A function reference to call in certain situations.
  * +events+::      A structure that tells what events to bind.
  * +enabled+::     The enabled/disabled flag. See setEnabled.
  * +value+::       The current value of a component. See setValue.
  * +valueObj+::    The current HValue compatible object. Do not set directly.
  *                 Holds reference to the bound HValue instance.
  *                 Set with HValue.bind.
  * +minValue+::    The minimum allowed value, when the component
  *                 utilizes value ranges. See <setValueRange>.
  * +maxValue+::    The maximum allowed value, when the component
  *                 utilizes value ranges. See <setValueRange>.
  * +active+::      A boolean value that shows whether this control is currently 
  *                 active or not. Control gets active when the user clicks on it.
  **/
HControl = HView.extend({
  
  componentBehaviour: ['view','control'],
  
/** A flag: when true, calls the +refreshValue+ method whenever
  * +self.value+ is changed.
  **/
  refreshOnValueChange: true,
  
/** A flag: when true, calls the +refreshLabel+ method whenever
  * +self.label+ is changed.
  **/
  refreshOnLabelChange: true,
  
/** Use this object to specify class-specific default settings. **/
  controlDefaults: HControlDefaults,
  
/** = Description
  * The constructor of HControl implements the same model as HView, 
  * but accepts a third parameter: the options object, that contain 
  * optional properties, like the value, label and events.
  *
  * = Parameters
  * +_rect+::     The rectangle of the component. See +HView.constructor+.
  * +_parent+::   The parent component of the component. See +HView.constructor+.
  * +_options+::  Optional, all other parameters as object attributes.
  *               Defaults to an instance of +HControlDefaults+.
  *
  **/
  constructor: function(_rect, _parent, _options) {
    // Use empty options if none supplied. Change this within components.
    if(!_options) {
      _options = {};
    }
    _options = (this.controlDefaults.extend(_options)).nu();
    var _isValueRange = (_options.minValue || _options.maxValue),
        _label = _options.label,
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
    else if(!_this.valueObj) {
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
  
/** = Description
  * The destructor of +HControl+ instances. 
  * Releases events and values before passing through to the base HView.die.
  * Extend it, you you allocate new instance members that need to be
  * deallocated upon destruction.
  *
  **/
  die: function() {
    var _this = this;
    if(_this.valueObj){
      _this.valueObj.unbind(_this);
      _this.valueObj = null;
    }
    EVENT.unreg(_this);
    _this.base();
  },
  
/** = Description
  * Sets the label on a control component: the text that's displayed in 
  * HControl extensions. Visual functionality is implemented in component 
  * theme templates and refreshLabel method extensions.
  *
  * Avoid extending directly, extend +refreshLabel+ instead.
  *
  * = Parameters
  * +_label+::  The text the component should display.
  *
  * = Returns
  * +self+
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
  
/** = Description
  * Enables the HControl instance, if the enabled flag is true, and disables 
  * it if enabled is false. A disabled HControl won't respond events. 
  * Component themes reflect the disabled state typically with 
  * a dimmer appearance.
  *
  * = Parameters
  * +_flag+::    Boolean; true enables, false disables.
  *
  * = Returns
  * +this+
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
  
  
/** = Description
  * Assigns the object a new value range. Used for sliders, steppers etc. Calls
  * setValue with the value given.
  *
  * = Parameters
  * +_value+::     The new value to be set to the component's 
  *                HValue compatible instance.
  *
  * +_minValue+::  The new minimum value limit. See minValue.
  *
  * +_maxValue+::  The new maximum value limit. See maxValue.
  *
  * = Returns
  * +self+
  *
  **/
  setValueRange: function(_value, _minValue, _maxValue) {
    this.minValue = _minValue;
    this.maxValue = _maxValue;
    _value = (_value < _minValue) ? _minValue : _value;
    _value = (_value > _maxValue) ? _maxValue : _value;
    this.setValue(_value);
    return this;
  },
  
/** = Description
  * Called when the +self.value+ has been changed. By default
  * tries to update the value element defined in the theme of
  * the component. Of course, the HControl itself doesn't
  * define a theme, so without a theme doesn't do anything.
  *
  * = Returns
  * +self+
  *
  **/
  refreshValue: function(){
    if(this.markupElemIds){
      if(this.markupElemIds['value']){
        ELEM.setHTML(this.markupElemIds.value,this.value);
      }
    }
    return this;
  },
  
/** = Description
  * Called when the +self.label+ has been changed. By default
  * tries to update the label element defined in the theme of
  * the component. Of course, the HControl itself doesn't
  * define a theme, so without a theme doesn't do anything.
  *
  * = Returns
  * +self+
  *
  **/
  refreshLabel: function(){
    if(this.markupElemIds){
      if(this.markupElemIds['label']){
        ELEM.setHTML(this.markupElemIds.label,this.label);
      }
    }
    return this;
  },
  
/** = Description
  * Called mostly internally whenever a property change requires usually visual
  * action. It's called by methods like setLabel and setValue. 
  * Extends HView.refresh. The boolean properties refreshOnValueChange and 
  * refreshOnLabelChange control whether refreshValue or refreshLabel 
  * should be called. It's used as-is in most components. If you implement 
  * your class extension with properties similar to value or label, 
  * you are adviced to extend the refresh method.
  *
  * = Returns
  * +self+
  *
  **/
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
},


// Class methods and properties (not class intance, like above)

{
  
/** Stops event propagation.
  **/
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
