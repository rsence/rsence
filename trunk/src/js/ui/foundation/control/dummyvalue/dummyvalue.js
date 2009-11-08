/*   Riassence Framework
 *   Copyright 2006 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

/*** = Description
  ** A HDummyValue is just a placeholder for HValue values. HDummyValue
  ** is a light-weight alternative that doesn't implement any actual HValue
  ** functionality, but implements the essential methods that keep HControl happy.
  ** It's the default value type for components not bound to real HValue instances.
  ***/
HDummyValue = HClass.extend({
/** = Description
  * HDummyValue is initialized just like a real HValue.
  *
  * = Parameters
  *  +_id+::     Any string or integer, just a placeholder for HValue.id
  *  +_value+::  Any valid js object, just as for HValue.value
  *
  **/
  constructor: function(_id, _value) {
    this.id = _id;
    this.value = _value;
  },

/** Sets a new instance payload value.
  **/
  set: function(_value) {
    this.value = _value;
  },

/** Returns the instance payload value.
  **/
  get: function() {
    return this.value;
  },
  
  /** Binds HControl
    **/
  bind: function( _theObj ){
  },
  
  /** Unbinds HControl
    **/
  unbind: function( _theObj ){
  }
});
