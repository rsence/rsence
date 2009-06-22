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

/** class: HDummyValue
  *
  * A HDummyValue is just a placeholder for <HValue> values. HDummyValue
  * is a light-weight alternative that doesn't implement any actual <HValue>
  * functionality, but implements the essential methods that keep <HControl> happy.
  * It's the default value type for components not bound to real <HValue> instances.
  *
  * See also:
  *  <HValue> <HControl> <HValueManager>
  *
  **/
HDummyValue = HClass.extend({
/** constructor: constructor
  *
  * HDummyValue is initialized just like a real <HValue>.
  *
  * Parameters:
  *  _id - Any string or integer, just a placeholder for <HValue.id>
  *  _value - Any valid js object, just as for <HValue.value>
  *
  **/
  constructor: function(_id, _value) {
    this.id = _id;
    this.value = _value;
  },

/** method: set
  *
  * Parameter:
  *  _value - Sets a new instance payload value.
  *
  **/
  set: function(_value) {
    this.value = _value;
  },

/** method: get
  *
  * Returns:
  *  The instance payload value.
  *
  **/
  get: function() {
    return this.value;
  },
  
  bind: function( _theObj ){
  },
  
  unbind: function( _theObj ){
  }
});
