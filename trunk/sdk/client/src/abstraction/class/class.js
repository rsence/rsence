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

// all properties should be installed in constructor because otherwise those
// are iterated unnecessary

// super keyword conflicts for example with Safari
// cannot be used

// Safari leaves copies of prototype properties and methods to parent class
// in for (var in this) structure

/** class: HClass
  *
  * HClass class is a simple JavaScript class that eases the pain of JavaScript OO. 
  * It is intended for the following main purposes:
  *   -	to easily create classes without the MyClass.prototype cruft,
  *   -	method overriding with intuitive access to the overridden method (like Java's super),
  *   -	to avoid calling a class' constructor function during the prototyping phase,
  *   -	to easily add static (class) properties and methods,
  *   -	to achieve the above without resorting to global functions to build prototype chains,
  *   -	to achieve the above without affecting Object.prototype. 
  *
  *
  * The HClass class extends the 'Object' object by adding one instance method (base) 
  * and two class methods (extend, implement). Instance method extend can be also called directly.
  *
  **/
var HClass = function() {
  if (arguments.length) {
    var _1stArg = arguments[0];
    if (this == window) {
      HClass.prototype.extend.call(_1stArg, arguments.callee.prototype);
    } else {
      this.extend(_1stArg);
    }
  }
};

HClass.prototype = {
  
  // basically internal methods event if can be called safely
  extend: function(_source, _value) {
    var _extend = HClass.prototype.extend;
    if (arguments.length == 2) {
      var _ancestor = this[_source];
      // only methods are inherited
      if ((_ancestor instanceof Function) && (_value instanceof Function) &&
          _ancestor.valueOf() != _value.valueOf() && /\bbase\b/.test(_value)) {
        var _method = _value;
        _value = function() {
          // saves the this.base that is the this.base method of this child
          var _previous = this.base;
          // copies previous this.base from the direction from HClass
          this.base = _ancestor;
          // current class's method is called
          // now inside the function when called this.base points to parent method
          var _returnValue = _method.apply(this, arguments);
          // then because event this function can be called from child method
          // resets the base to as is was before calling this function
          this.base = _previous;
          return _returnValue;
        };
        _value.valueOf = function() {
          return _method;
        };
        _value.toString = function() {
          return String(_method);
        };
      }
      return this[_source] = _value;
    // this is called when called by HClass.extend
    } else if (_source) {
      var _prototype = {toSource: null};
      var _protected = ["toString", "valueOf"];
      // we want default constructor function
      if (HClass._prototyping) {
        // 3. index
        _protected.push("constructor");
      }
      for (var i = 0; (_name = _protected[i]); i++) {
        if (_source[_name] != _prototype[_name]) {
          _extend.call(this, _name, _source[_name]);
        }
      }
      for (var _name in _source) {
        if (!_prototype[_name]) {
          _extend.call(this, _name, _source[_name]);
        }
      }
    }
    return this;
  },
  /** method: base
    *
    * If a method has been overridden then the base method provides access to the overridden method. 
    * Call this method from any other method to invoke that method's ancestor.
    * It is also possible to call the base method from within a constructor function.
    *
    **/
  base: function() {
    // this method can be called from any other method to invoke that method's parent
  }
};

/** method: extend
  *
  * Enables the inheritance. If the method name constructor is defined null in _instance parameter returns a single instance.
  *
  * Parameters:
  *   _instance - An object that has properties and methods of inherited class.
  *   _static - An object that has properties and methods of inherited class's class methods if the method named constructor
  *     is defined null in _instance parameter.
  *   
  * Returns:
  *   Return value is inherited class.
  *
  * Example:
  *
  * > Point = HClass.extend({
  * > constructor: function(x, y) {
  * >   this.x = x;
  * >   this.y = y;
  * > }
  * > });
  * > Rectangle = Point.extend({
  * > constructor: function(x, y, width, height) {
  * >   this.base(x, y);
  * >   this.width = width;
  * >   this.height = height;
  * > },
  * > getWidth: function() {
  * >   return this.width;
  * > },
  * > getHeight: function() {
  * >   return this.height;
  * > }
  * > },
  * > {
  * > // class methods
  * > description: "this is a Rectangle",
  * > getClass: function() {
  * >   return this;
  * > }
  * > });
  *
  **/
HClass.extend = function(_instance, _static) {
  // reference to HClass's prototype extend method (HClass's class structure extend method)
  var _extend = HClass.prototype.extend;
  // if _instance is undefined,null,"" etc. creates object so that code below works
  if (!_instance) {
    _instance = {};
  }
  HClass._prototyping = true;
  // this is base for single instance or prototype (class structure) for object that are created
  // from this class
  var _prototype = new this;
  // copies properties and methods from _instance to _prototype (class structure)
  _extend.call(_prototype, _instance);
  // this constructor came from _instance
  var _constructor = _prototype.constructor;
  _prototype.constructor = this;
  delete HClass._prototyping;
  
  var _klass = function() {
    if (!HClass._prototyping) {
      _constructor.apply(this, arguments);
    }
    this.constructor = _klass;
  };
  // this is the new class's prototype (class structure)
  _klass.prototype = _prototype;
  // copies static method (class method)
  // acts like HClass.extend
  _klass.extend = this.extend;
  // copies static method (class method)
  // acts like HClass.implement
  _klass.implement = this.implement;
  _klass.toString = function() {
    return String(_constructor);
  }
  // copies properties and methods from _static directly to statc methods (class methods)
  // of new class
  _extend.call(_klass, _static);
  // if _constructor is marked as null returns the created instance (that is also class structure for
  // instances if class is returned
  var _object = _constructor ? _klass : _prototype;
  if (_object.init instanceof Function) {
    _object.init();
  }
  return _object;
};

/** method: implement
  *
  * Copies the prototype properties and methods from _interface or if it is an object it's properties and functions
  * to HClass or class inherited from HClass. Mimics the interface behaviour of ordinary programming languages.
  *
  * Example:
  *
  * > // Mimics the interface
  * > 
  * > AreaInterface = HClass.extend({
  * > constructor: null,
  * >   // implement
  * >   // don't define here
  * >   //getWidth: function() {},
  * >   //getHeight: function() {},
  * > area: function() {
  * >   return this.getWidth() * this.getHeight();
  * > }
  * > });
  * > 
  * > Rectangle = HClass.extend({
  * > constructor: function(x, y, width, height) {
  * >   this.x = x;
  * >   this.y = y;
  * >   this.width = width;
  * >   this.height = height;
  * > },
  * > getWidth: function() {
  * >   return this.width;
  * > },
  * > getHeight: function() {
  * >   return this.height;
  * > }
  * > });
  * > 
  * > Rectangle.implement(AreaInterface);
  *
  **/
HClass.implement = function(_interface) {
  // copies prototype fields and methods (class structures properties and methods)
  if (_interface instanceof Function) {
    _interface = _interface.prototype;
  }
  this.prototype.extend(_interface);
}

var Base = HClass;


if ([].indexOf===undefined) {
  Object.extend = function(destination, source) {
    for (property in source) {
      destination[property] = source[property];
    }
    return destination;
  };
  Object.extend(Array.prototype, {
    indexOf: function(_anObject){
      var i = 0, l = this.length;
      for (; i < l; i++) {
        if (this[i] == _anObject) {
          return i;
        }
      }
      return -1;
    }
  });
}

