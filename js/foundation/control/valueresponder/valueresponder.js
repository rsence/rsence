
/*** = Description
  ** Defines a minimal +HValue+ responder interface.
  ** It's implemented by default by +HControl+.
***/
var//RSence.Foundation
HValueResponder = HClass.extend({
  
/** = Description
  * Binds an HValue compatible instance to the component's valueObj. Also 
  * calls +setValue+. It should not be called from user code, instead
  * use the +HValue+ instance method +bind+.
  *
  * = Parameter
  * +_aValueObj+:: The HValue instance object to bind.
  *
  * = Returns
  * +self+
  *
  **/
  setValueObj: function(_valueObj) {
    this.valueObj = _valueObj;
    this.setValue(_valueObj.value);
    return this;
  },
  
/** = Description
  * Checks, if the value given as parameter differs from +value+.
  *
  * = Parameters
  * +_value+:: The value to be tested.
  *
  * = Returns
  * A boolean true (different) or false (same).
  *
  **/
  valueDiffers: function(_value){
    return (COMM.Values.encode(_value) !== COMM.Values.encode(this.value));
  },
  
/** = Description
  * Assigns the object a new value.
  * Extend it, if your component needs to do validation of the new value.
  * For +HControl+ instances, extend HControl#refreshValue to do something when
  * the +value+ has been set.
  *
  * = Parameter
  * +_value+::  The new value. Allowed values depend on the component type
  *             and other usage of the bound +HValue+ instance +self.valueObj+.
  *
  * = Returns
  * +self+
  *
  **/
  setValue: function(_value) {
    if(_value !== undefined && this['valueObj'] && this.valueDiffers(_value)) {
      var _valueManager = COMM.Values;
      this.value = _value;
      if( !~_valueManager._builtins.indexOf( _valueManager.type(_value) ) ){
        this.valueObj.set( _valueManager.clone( _value ) );
      }
      else {
        this.valueObj.set( _value );
      }
      (this['refresh'] !== undefined) && (typeof this.refresh === 'function') && this.refresh();
    }
    return this;
  }
  
});

