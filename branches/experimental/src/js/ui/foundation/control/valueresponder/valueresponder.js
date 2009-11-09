/*   Riassence Framework
 *   Copyright 2006 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

/*** = Description
  **  Value responder class.
  ***/

HValueResponder = HClass.extend({
  
/** = Description
  * Binds an HValue compatible instance to the component's valueObj. Also 
  * calls setValue. It should not be called from user code, instead use HValue.bind.
  *
  * = Parameter
  *  +_aValueObj+::  The new value object.
  *
  * = Returns
  *  +self+
  *
  **/
  setValueObj: function(_valueObj) {
    this.valueObj = _valueObj;
    this.setValue(_valueObj.value);
    return this;
  },
  
/** = Description
  * Checks if the value given as parameter differs from this.value.
  *
  * = Parameters
  * +_value+::  The value to be tested.
  *
  **/
  valueDiffers: function(_value){
    return (COMM.Values.encode(_value) !== COMM.Values.encode(this.value));
  },
  
/** = Description
  * Assigns the object a new value. Extend it, if your component needs to do
  * something whenever the value changes.
  *
  * = Parameter
  *  +_value+::   The new value. Allowed values depend on the component type
  *               and other usage of the bound HValue instance.
  *
  * = Returns
  * +self+
  *
  **/
  setValue: function(_value) {
    if(_value === undefined){return this;}
    if(!this.valueObj){return this;}
    if(this.valueDiffers(_value)) {
      var _valueManager = COMM.Values;
      this.value = _value;
      if( _valueManager._builtins.indexOf( _valueManager.type(_value) ) === -1 ){
        _valueClone = _valueManager.clone( _value );
        this.valueObj.set( _valueClone );
      }
      else {
        this.valueObj.set( _value );
      }
      this.refresh();
    }
    return this;
  }

});