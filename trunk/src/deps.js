/**
  *  Helmi RIA Platform
  *  Copyright (C) 2006-2007 Helmi Technologies Inc.
  *  
  *  This program is free software; you can redistribute it and/or modify it under the terms
  *  of the GNU General Public License as published by the Free Software Foundation;
  *  either version 2 of the License, or (at your option) any later version. 
  *  This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
  *  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
  *  See the GNU General Public License for more details. 
  *  You should have received a copy of the GNU General Public License along with this program;
  *  if not, write to the Free Software Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
  **/

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
ie_htc_path = null;
function ie_early_fixes() {
  var b = navigator.appName;
  var ua = navigator.userAgent.toLowerCase();
  var _opera = ua.indexOf("opera") > -1;
  if (!_opera && b == "Microsoft Internet Explorer") {
	var _script = document.scripts[document.scripts.length - 1];
	var _src = _script.src;
	ie_htc_path = _src.substring(0, _src.lastIndexOf("/") + 1);
  }
}
ie_early_fixes();

is_safari = navigator.userAgent.toLowerCase().indexOf("safari") > -1;
is_ie = !(navigator.userAgent.toLowerCase().indexOf("opera") > -1) && navigator.appName == "Microsoft Internet Explorer";


Event = HClass.extend({
  constructor: null,
  
  element: function(e) {
    return e.target || e.srcElement;
  },
  
  pointerX: function(e) {
    return e.pageX || e.clientX + document.documentElement.scrollLeft;
  },
  
  pointerY: function(e) {
    return e.pageY || e.clientY + document.documentElement.scrollTop;
  },
  
  stop: function(e) {
    if (e.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    } else {
      e.returnValue = false;
      e.cancelBubble = true;
    }
  },
  
  isLeftClick: function(e) {
     // IE: left 1, middle 4, right 2
    if (is_ie || is_safari) {
      return (e.button == 1);
    } else {
      return (e.button == 0);
    }
  },
  
  observers: false,
  
  // caches events that they can be removed easely
  _observeAndCache: function(_elem, _name, _function, _useCapture) {
    if (!Event.observers) {
      Event.observers = [];
    }
    if (_elem.addEventListener) {
      this.observers.push([_elem, _name, _function, _useCapture]);
      _elem.addEventListener(_name, _function, _useCapture);
      
    } else if (_elem.attachEvent) {
      this.observers.push([_elem, _name, _function, _useCapture]);
      _elem.attachEvent("on" + _name, _function);
    }
  },
  
  unloadCache: function() {
    if (!Event.observers) {
      return;
    }
    var i, l = Event.observers.length;
    for (i = 0; i < l; i++) {
      Event.stopObserving.apply(this, Event.observers[0]);
    }
    Event.observers = false;
  },
  
  observe: function(_elem, _name, _function, _useCapture) {
    if (typeof _elem == "string") {
      _elem = document.getElementById(_elem);
    }
    _useCapture = _useCapture || false;
    Event._observeAndCache(_elem, _name, _function, _useCapture);
  },
  
  stopObserving: function(_elem, _name, _function, _useCapture) {
    if (typeof _elem == "string") {
      _elem = document.getElementById(_elem);
    }
    _useCapture = _useCapture || false;
    if (_elem.removeEventListener) {
      _elem.removeEventListener(_name, _function, _useCapture);
    } else if (detachEvent) {
      try {
        element.detachEvent("on" + name, _function);
      } catch (e) {
        
      }
    }
    
    // Remove the observer from the cache too.
    var i = 0;
    while (i < Event.observers.length) {
      var eo = Event.observers[i];
      if (eo && eo[0] == _elem && eo[1] == _name && eo[2] == _function &&
        eo[3] == _useCapture) {
        Event.observers[i] = null;
        Event.observers.splice(i, 1);
      } else {
        i++;
      }
    }
    
  },
  
  KEY_BACKSPACE: 8,
  KEY_TAB: 9,
  KEY_RETURN: 13,
  KEY_ESC: 27,
  KEY_LEFT: 37,
  KEY_UP: 38,
  KEY_RIGHT: 39,
  KEY_DOWN: 40,
  KEY_DELETE: 46,
  KEY_HOME: 36,
  KEY_END: 35,
  KEY_PAGEUP: 33,
  KEY_PAGEDOWN: 34
});
if (is_ie) {
  Event.observe(window, "unload", Event.unloadCache, false);
}
is_ie = !(navigator.userAgent.toLowerCase().indexOf("opera") > -1) && navigator.appName == "Microsoft Internet Explorer";


Array.prototype.toQueryString = function() {
  var i, l = this.length;
  var _array = [];
  for (i = 0; i < l; i++) {
    _array.push( encodeURIComponent(this[i].key) + "=" +
      encodeURIComponent(this[i].value) );
  }
  return _array.join("&");
}








Ajax = HClass.extend({
  constructor: null,
  getTransport: function() {
    if (window.XMLHttpRequest) {
      return new XMLHttpRequest();
    } else if (is_ie) {
      // checks the Microsoft Internet Explorer script engine version
      if (ScriptEngineMajorVersion() >= 5) {
        return new ActiveXObject("Msxml2.XMLHTTP");
      } else {
        return new ActiveXObject("Microsoft.XMLHTTP");
      }
    } else {
      return false;
    }
  }
});

Ajax.Request = HClass.extend({
  constructor: function(_url, _options) {
    this.transport = Ajax.getTransport();
    if(!_options){
      _options = {};
    }
    var _defaults = HClass.extend({
      method: "post",
      asynchronous: true,
      contentType: "application/x-www-form-urlencoded",
      encoding: "UTF-8",
      parameters: ""
    });
    _defaults = _defaults.extend(_options);
    this.options = new _defaults();
    this.request(_url);
  },
  request: function(_url) {
    this.url = _url;
    if (this.options.method == "get" && this.options.parameters.length) {
      // if already has ? puts &
      this.url += (this.url.indexOf("?") >= 0 ? "&" : "?") + this.options.parameters.toQueryString();
    }
    //try {
      this.transport.open(
        this.options.method.toUpperCase(),
        this.url,
        this.options.asynchronous,
        this.options.username,
        this.options.password
      );
      var _obj = this;
      this.transport.onreadystatechange = function() {_obj.onStateChange()};
      this.setRequestHeaders();
      var _body = this.options.method == "post" ?
        (this.options.postBody || this.options.parameters.toQueryString()) : null;
      this.transport.send(_body);
      if (!this.options.asynchronous && this.transport.overrideMimeType) {
        this.onStateChange();
      }
    //} catch (e) {
    
    //}
  },
  setRequestHeaders: function() {
    var headers = {};
    
    if (this.options.method == "post") {
      headers["Content-type"] = this.options.contentType +
        (this.options.encoding ? "; charset=" + this.options.encoding : "");
        
      if (this.transport.overrideMimeType &&
        (navigator.userAgent.match(/Gecko\/(\d{4})/) || [0,2005])[1] < 2005) {
        headers["Connection"] = "close";
      }
    }
    var o;
    for (o in headers) {
      this.transport.setRequestHeader(o, headers[o]);
    }
  },
  /*
  Firefox
  0 UNINITIALIZED open() has not been called yet.
  1 LOADING send() has not been called yet.
  2 LOADED send() has been called, headers and status are available.
  3 INTERACTIVE Downloading, responseText holds the partial data.
  4 COMPLETED Finished with all operations.
  IE
  0 (Uninitialized) The object has been created, but not initialized (the open method has not been called).
  1 (Open) The object has been created, but the send method has not been called.
  2 (Sent) The send method has been called, but the status and headers are not yet available.
  3 (Receiving) Some data has been received. Calling the responseBody and responseText properties at this state to obtain partial results will return an error, because status and response headers are not fully available.
  4 (Loaded) All the data has been received, and the complete data is available.
  */
  onStateChange: function() {
    var _readyState = this.transport.readyState;
    if (_readyState > 1) {
      this.respondToReadyState(_readyState);
    }
  },
  respondToReadyState: function(_readyState) {
    if (_readyState == 4) { // Completed(Loaded in IE 7)
      try {
        (this.options["on" + (this.success() ? "Success" : "Failure")] ||
          (function() {}))(this.transport);
      } catch (e) {
        
      }
    }
    
    if (_readyState == 4) { // Completed(Loaded in IE 7)
      this.transport.onreadystatechange = function() {};
    }
  },
  success: function() {
    return !this.transport.status ||
      (this.transport.status >= 200 && this.transport.status < 300);
  }
});
