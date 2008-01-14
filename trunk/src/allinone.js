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

/***
 ***  Package: Element Manager
 ***
 ***  Handles the lowest levels of drawing via the Browser DOM.
 ***  Its structure is flat on purpose and it's optimized for speed,
 ***  not readability/mainentainability.
 ***
 ***/
 
 /*
  * int: frameskips
  *
  * Adjusts the target rendering frame rate
  *  - Bigger values spends less time drawing (larger intervals)
  *  - Smaller values draws smoother
  */
frameskips = 1;


/// No user configuration after this line
var _d      = document;
var _delay  = 0;
var quot    = '"';
var apos    = "'";

// Browser detection:
is_ie=(_d.all&&navigator.userAgent.indexOf("Opera")==-1);
is_ie6=(is_ie&&navigator.userAgent.indexOf("MSIE 6")!=-1);
is_ie7=(is_ie&&navigator.userAgent.indexOf("MSIE 7")!=-1);
is_safari=(navigator.userAgent.indexOf("KHTML")!=-1);

//// Load-Time initialization
/// Queue for methods to do on load-time
var _eventInitQueue = [];
var _eventInitDone  = false;

/**
 ** Function: onloader
 **
 ** Interface function to add code as strings to the "onload"-event buffer.
 **  - It will be evaluated, when the document.body is loaded
 **  - Multiple calls add later items to the end of the evaluation queue
 **
 ** Parameters:
 **  _string_to_evaluate - A string of valid, eval() -able js code
 ** 
 **/
onloader = function(_string_to_evaluate){
  if(_eventInitDone){
    eval(_string_to_evaluate);
  } else {
    _eventInitQueue.push(_string_to_evaluate);
  }
}

// onloader() part: The interval time variable that the timeout is bound to:
var _onloadwaitertimer = null;
// onloader() part: The evaluator itself; _isonloaded is true, when the document is ready
var _onloadwaiterlauncher = function(_isloaded){
  if(_isloaded){
    _eventInitDone = true;
    while(_eventInitQueue.length!=0){
      var _initItem = _eventInitQueue.shift();
      eval(_initItem);
    }
  } else {
    _onloadwaitertimer = setTimeout('_onloadwaiter()',5);
  }
}
// onloader() part: The checker for the document state, will call _onloaderwaiterlauncher()
var _onloadwaiter = function(){
  var _isloaded = false;
  
  // A hack for ie (ripped from DomLoaded.js)
  // http://www.cherny.com/demos/onload/domloaded.js
  if(is_ie){
    var _ie_proto = "javascript:void(0)";
    if (location.protocol == "https:"){
      _ie_proto = "src=//0";
    }
    _d.write("<scr"+"ipt id=__ie_onload defer src=" + _ie_proto + "><\/scr"+"ipt>");
    var _ie_script = _d.getElementById("__ie_onload");
    _ie_script.onreadystatechange = function(){
      if(this.readyState == "complete"){
        _onloadwaiterlauncher(true);
      }
    }
    return;
  }
  
  // Safari / KHTML readyness detection:
  else if((/KHTML|WebKit/i.test(navigator.userAgent)) &&
          (/loaded|complete/.test(_d.readyState))) {
    _isloaded = true;
  }
  
  // Works on Mozilla:
  else if(document.body){
    _isloaded = true;
  }
  
  _onloadwaiterlauncher(_isloaded);
}

// Starts checking:
_onloadwaiter();


/// The interval variable
var _prop_loop_interval;

// Cached Property Values
var _ElemIndex = [];    // Element Cache
var _PropCache = [];    // Cached elements, by serial id as key, property array as value
var _PropTodo  = [];    // Queue, adds element properties by serial id, removed when executed
var _ElemTodo  = [];    // Queue, adds elements by serial id, removed when executed
var _ElemTodoHash = {}; // Helps the _ElemTodo queue by keeping track of which elements are already queued
var _PropBusy  = false; // Don't re-process the queue when processing it
var _FreedIndices = []; // Re-use these indexes

// Prefer "style.cssText += ..." over "style.setProperty(...)"
// The speed difference is different on different browsers, but we default to
// not use it, as some browsers don't support it at all. Also, of the browsers
// tested, cssText is slower. We'll leave it here anyway just in case some
// future browsers do it faster.
var prop_do_csstext = false;

/***
  **  Function: elem_bind
  **
  **  Attaches an element to the element index by using the element id property.
  **
  **  Parameters:
  **    _divId - The "html" property id of an element
  **
  **  Returns:
  **    The element index id
  **
  **  See Also:
  **    <elem_get> <elem_add> <styl_get> <styl_set>
  ***/
elem_bind = function(_divId){
  var _elem = _d.getElementById(_divId); // Get the element by its id
  if(!_elem){return false;}          // Error, no such id
  
  var _id = _addNewElementToCache(_elem);
  
  // Initialize caches
  _PropTodo[_id] = [];
  _PropCache[_id] = [];
  return _id;
}

/***
  **  Function: elem_add
  **
  **  Attaches an element to the element index by using the element itself.
  **
  **  Parameters:
  **    _elem - An bound element reference.
  **
  **  Returns:
  **    The element index id
  **
  **  See Also:
  **    <elem_get> <elem_bind> <styl_get> <styl_set>
  ***/
elem_add = function(_elem){
  
  var _id = _addNewElementToCache(_elem);
  
  // Initialize caches
  _PropTodo[_id] = [];
  _PropCache[_id] = [];
  return _id;
}

/***
  **  Function: elem_get
  **
  **  Returns an element from the element index by the element index id.
  **
  **  Parameters:
  **    _id - The element index id
  **
  **  Returns:
  **    The element
  **
  **  See Also:
  **    <elem_get> <elem_bind> <elem_add> <elem_append> <elem_replace> <elem_del> <elem_mk> <styl_get> <styl_set>
  ***/
elem_get = function(_id){
  return _ElemIndex[_id];          // Return cached element by serial
}

/***
  **  Function: elem_set
  **
  **  Sets the contents of the element id with the piece of text/html given.
  **
  **
  **  Parameters:
  **    _id - Element index id referring to the element which contents will be replaced with..
  **    _html - A chunk of HTML or plain text to replace the inner content of the element with.
  **
  **  Returns:
  **    Nothing
  **
  **  See Also:
  **    <elem_get> <elem_bind> <styl_get> <styl_set>
  **
  ***/
elem_set = function(_id,_html){
  _ElemIndex[_id].innerHTML = _html;
}

/***
  **  Function: elem_del
  **
  **  Deletes the element by id both from the index and the document object.
  **
  **  Parameters:
  **   _id - Element index id, destroys the target item from the dom and caches
  **
  **  See Also:
  **    <elem_get> <elem_add> <elem_append> <elem_replace> <elem_mk>
  ***/
elem_del = function(_id){
  var _thisNode = _ElemIndex[_id];
  if (_thisNode) {
    var _parentNode = _thisNode.parentNode;
    if (_parentNode) {
      _parentNode.removeChild(_thisNode);
    }
  }
  // Free the cache position even when the element to be deleted or its parent
  // was already deleted.
  _ElemIndex[_id] = null;
  _PropTodo[_id] = [];
  _PropCache[_id] = [];
  _FreedIndices.push(_id);
}

/***
  **  Function: elem_replace
  **
  **  Replace an element in the cache. Note that elem_replace doesn't delete the
  **  possible existing element, but simply places the new element in the given
  **  position in the element cache.
  **
  **  Parameters:
  **   _id - Element index id to be replaced
  **   _elem - Element that replaces that index
  **
  **  See Also:
  **    <elem_get> <elem_add> <elem_append> <elem_del> <elem_mk>
  ***/
elem_replace = function(_id,_elem) {
  var _freeIndex = _FreedIndices.indexOf(_id);
  if (_freeIndex > -1) {
    _FreedIndices.splice(_freeIndex,1);
  }
  _ElemIndex[_id] = _elem;
}

/***
  **  Function: elem_append
  **
  **  Place an element inside another element
  **
  **  Parameters:
  **   _pid - Parent element index id
  **   _id - Element index id to be appended
  **
  **  See Also:
  **    <elem_get> <elem_add> <elem_del> <elem_replace> <elem_mk>
  ***/
elem_append = function(_pid,_id) {
  _ElemIndex[_pid].appendChild( _ElemIndex[_id] );
}

/***
  **  Function: elem_mk
  **
  **  Makes an element inside the parent element id given by the type given
  **
  **  Parameters:
  **   _pid - Parent element index id
  **   _type - Element type as string 'div' as default (optional)
  **
  **  Returns:
  **   Element index id of the newly created element.
  **
  **  See Also:
  **    <elem_get> <elem_add> <elem_append> <elem_replace> <elem_del>
  ***/
elem_mk = function(_pid,_type){
  if(_type===undefined){_type='div';}  // Defaults to 'div'
  var _elem = _d.createElement(_type);  // Create element by type ('div'..)
  _ElemIndex[_pid].appendChild(_elem); // Gets the parent element and append the child to it
  var _id = _addNewElementToCache(_elem);
  // Initialize caches
  _PropTodo[_id] = [];
  _PropCache[_id] = [];
  return _id;
}

/***
  **  Function: elem_count
  **
  **  Returns:
  **   The number of elements currently in the element cache.
  **
  ***/
elem_count = function() {
  var _elemCount = 0;
  for (var i = 0; i < _ElemIndex.length; i++) {
    if (_ElemIndex[i]) {
      _elemCount++;
    }
  }
  return _elemCount;
}

/***
  **  Private method.
  **  Updates the element cache.
  **
  **  Takes the element to be added
  **  Returns the index id of the added element
  **  This is called by elem_mk, elem_add and elem_bind to add a new element to
  **  the element cache. If there are indices free from deleted elements, those
  **  are reused, if there aren't any, the new element is appended to the array.
  ***/
_addNewElementToCache = function(_elem) {
  var _id;
  if (_FreedIndices.length > 0) {
    // Recycle previously deleted element id.
    var _firstFreeIndex = _FreedIndices[0];
    _FreedIndices.splice(0,1);
    _ElemIndex[_firstFreeIndex] = _elem;
    _id = _firstFreeIndex;
  }
  else {
    // Adds the element to the cache
    _ElemIndex.push(_elem);
    // Get cache size == serial id
    _id = _ElemIndex.length-1;
  }
  return _id;
}

/***
  **  Function: styl_get
  **
  **  Gets a style property quickly and by using the controlled DOM draw engine cache
  **
  **  Parameters:
  **   _id - An element index id
  **   _name - A style property name; css format, for example 'background-color'
  **
  **  Returns:
  **   The computed style value, for example 'rgb(255,204,0)'
  **
  **  See Also:
  **    <elem_get> <elem_add> <styl_set>
  ***/
styl_get = function(_id,_name){
  return prop_get(_id,_name);
}
/// NOTICE: Two modes (one for IE and another for others)
var _prop_get_tmpl = "\
prop_get = function(_id,_name,_direct){\
  var _cached = _PropCache[_id];\
  if((_cached[_name]===undefined)||(_direct!==undefined)){";
_prop_get_tmpl += "\
  if((_name == 'opacity') && (_direct != -1)) {\
    var _retval = prop_get_opacity(_id);\
  } else {"; // Note the open else...
if(!is_ie) {
  _prop_get_tmpl += "\
    var _retval = _d.defaultView.getComputedStyle(_ElemIndex[_id],null).getPropertyValue(_name);";
} else {
  _prop_get_tmpl += "\
    var _camelName = _name.replace(/((-)([a-z])(\\w))/g,function($0,$1,$2,$3,$4){return $3.toUpperCase()+$4});\
    var _retval = _ElemIndex[_id].currentStyle[_camelName];";
}
  // ... the open else is closed here.
  _prop_get_tmpl += "}\
    _cached[_name]=_retval;\
  }\
  return _cached[_name];\
}";
onloader(_prop_get_tmpl);

/***
  **  Function: styl_set
  **
  **  Sets a style property quickly by using the controlled DOM draw engine
  **
  **  Parameters:
  **   _id - An element index id
  **   _name - A style property name; css format, for example: 'background-image'
  **   _value - A style property value; css format, for example: "url('/img/blank.gif')"
  **
  **  Returns:
  **   true/false depending on the success condition of the change
  **
  **  See Also:
  **    <elem_get> <elem_add> <styl_get>
  ***/
styl_set = function(_id,_name,_value){
  try {
    prop_set(_id,_name,_value);
    return true;
  }
  catch(e) {
    return false;
  }
}
//// Style Property Value Setter
  // Triggers the manipulation of the queue/cache
prop_set = function(_id,_name,_value,_direct){
  var _cached=_PropCache[_id];
  // Checks and sets the value, if different from orig
  var _newValue = _cached[_name]!=_value;
  if(_newValue){
    _cached[_name]=_value;
    if(_direct){
      if (_name == 'opacity') {
        prop_set_opacity(_id, _value);
      }
      else {
        try {
          is_ie?(
              _ElemIndex[_id].style.setAttribute(_name.replace(/((-)([a-z])(\w))/g,function($0,$1,$2,$3,$4){return $3.toUpperCase()+$4}),_cached[_name])
            ):(
              _ElemIndex[_id].style.setProperty(_name,_cached[_name],'')
          );
        }
        catch(e) {
          _ElemIndex[_id].cssText += ';'+_name+': '+_cached[_name]+';';
        }
      }
    } else {
      var _cachedE=_ElemTodo;
      var _cachedP=_PropTodo[_id];
      // Adds itself to the property key name queue
      _cachedP.push(_name);
      // Adds a queue item, if not already added
      if ( !_ElemTodoHash[_id] ) {
        _cachedE.push(_id);
        _ElemTodoHash[_id] = true;
      }
    }
  }
}

//// Executes queued tasks
  // Takes serial id
  // Returns nothing
 /// NOTICE: It has three modes:
 ///         Two specific for properties (one for IE and another for others)
 ///         One generic: cssText += works on all browsers, but the speed is an issue
var _prop_do_tmpl = "\
var _prop_do=function(_id){\
  var _cachedP=_PropTodo[_id];\
  var _cached=_PropCache[_id];\
  var _elem=_ElemIndex[_id];\
  if(!_elem){return}\
  var _elemS=_elem.style;\
  var _loopMaxP=_cachedP.length;"
  if(prop_do_csstext){
  _prop_do_tmpl += "\
  var _cssTXTs=[];"
  }
  _prop_do_tmpl += "\
  for(var _cid=0;_cid<_loopMaxP;_cid++){\
    var _name=_cachedP.shift();";
if(prop_do_csstext){
  _prop_do_tmpl += "\
    _cssTXTs.push(_name+':'+_cached[_name]);\
  }\
  _elemS.cssText += ';'+_cssTXTs.join(';')+';';";
}else{
  // End the loop and function with calling setProperty's shortcut, IE wants it camelized
  _prop_do_tmpl += "if(_name == 'opacity') { _retval = prop_set_opacity(_id, _cached[_name]); } else {"; // Note the open else...
  if(is_ie){_prop_do_tmpl += 
    "_elemS.setAttribute(_name.replace(/((-)([a-z])(\\w))/g,function($0,$1,$2,$3,$4){return $3.toUpperCase()+$4}),_cached[_name]);}";}
  else{_prop_do_tmpl += 
    "_elemS.setProperty(_name,_cached[_name],'');}";}
  // ... the open else is closed here.
  _prop_do_tmpl += "}";

}
_prop_do_tmpl += "}";
//// Evaluate the above function at init-time
eval(_prop_do_tmpl);

var _pls = 'prop_loop_start(_delay)';
// Used to calculate the refresh interval
var _prop_do_calls = 1;
var _prop_do_time  = 1;
//// Queue Loop
var prop_loop_start = function(_delay){
  // Clear the previous timer
  clearTimeout(_prop_loop_interval);
  // Skip this loop, if the previous is still busy
  if(_PropBusy){
    // Double the current delay, as it clearly wasn't enough
    _delay *= 2;
    // Set a new timer, it should execute this function after it is ready
    _prop_loop_interval = setTimeout(_pls,_delay);
    // Stop here:
    return;
  } else {
    // Calculate the new target delay based on the previous execution time
    _delay = parseInt(frameskips*(_prop_do_time/_prop_do_calls), 10);
    // The delay shouldn't be less than a 25 fps target rate
    if(_delay<40){_delay = 40;}
    // Set a new timer, it should execute this function after it is ready
    // Prevent the next loop from executing while we are busy
    _PropBusy = true;
    // Set a new timer, it should execute this function after it is ready
    _prop_loop_interval = setTimeout(_pls,_delay);
    // Continue:
  }
  // Start the time taking for stats
  _prop_do_time -= now();
  // Execute cached items (loop vars aren't used)
  var _loopMaxL = _ElemTodo.length;
  for(var i=0; i<_loopMaxL; i++) {
    var _id = _ElemTodo.shift();
    _ElemTodoHash[_id] = false;
    _prop_do(_id);
  }
  // Update run time stats
  _prop_do_calls++;
  _prop_do_time += now();
  // Allow the next loop to execute
  _PropBusy = false;
  return;
}
// Stop the queue (manual)
var prop_loop_stop = function(){
  clearTimeout(_prop_loop_interval);
}
// Shortcut function for getting the current time in milliseconds.
var now = function(){
  return new Date().getTime();
}


// Always direct
var prop_get_opacity = function(_id){
  var _opacity;
  /* these two need tweaking to respond to the same opacity name as newer browsers  
  if (_opacity = prop_get(_id,'-khtml-opacity')) {
    return parseFloat(_opacity);  
  }
  if (_opacity = prop_get(_id,'-moz-opacity')) {
    return parseFloat(_opacity);  
  }*/
  
  var _try_opacity = prop_get(_id,'opacity',-1);
  
  if (_opacity = _try_opacity || (_try_opacity==0)) {
    return parseFloat(_opacity);
  }
  if (_opacity = (_ElemIndex[_id].currentStyle['filter'] || '').match(/alpha\(opacity=(.*)\)/)) {  
    if(_opacity[1]) {
      return parseFloat(_opacity[1]) / 100;
    }
  }
  return 1.0;  
}
// Always direct
var prop_set_opacity = function(_id, _value){
  if (_value == 1 && is_ie) {
    _ElemIndex[_id].style.setAttribute( 'filter',
      prop_get(_id, 'filter', true).replace(/alpha\([^\)]*\)/gi,'') );
  } else {  
    if(_value < 0.00001) _value = 0;  
    if(is_ie) {
      _ElemIndex[_id].style.setAttribute( 'filter',
        prop_get(_id, 'filter', true).replace(/alpha\([^\)]*\)/gi,'') + 'alpha(opacity='+_value*100+')');
    }
    else {
      _ElemIndex[_id].style.setProperty('opacity', _value, '');
    }
  }
}

/***
  **  Function: prop_get_extra_width
  **
  **  Gets combination of border and padding widths for an element in the
  **  element cache.
  **
  **  Parameters:
  **    _id - An element index id
  **
  **  Returns:
  **    The width of left and right border and padding added together.
  **
  ***/
var prop_get_extra_width = function(_id) {
  var _width = prop_get_int_value(_id, 'padding-left') +
    prop_get_int_value(_id, 'padding-right') +
    prop_get_int_value(_id, 'border-left-width') +
    prop_get_int_value(_id, 'border-right-width');
  return _width;
}
/***
  **  Function: prop_get_extra_height
  **
  **  Gets combination of border and padding heights for an element in the
  **  element cache.
  **
  **  Parameters:
  **    _id - An element index id
  **
  **  Returns:
  **    The width of top and bottom border and padding added together.
  **
  ***/
var prop_get_extra_height = function(_id) {
  var _height = prop_get_int_value(_id, 'padding-top') +
    prop_get_int_value(_id, 'padding-bottom') +
    prop_get_int_value(_id, 'border-top-width') +
    prop_get_int_value(_id, 'border-bottom-width');
  return _height;
}
/***
  **  Function: prop_get_int_value
  **
  **  Gets the value of a property as an integer. This is usable only for
  **  properties with pixel values.
  **
  **  Parameters:
  **    _id - An element index id
  **    _property - The name of the style property to retrieve
  **
  **  Returns:
  **    An integer value of the given property for the given element id.
  **
  ***/
var prop_get_int_value = function(_id, _property) {
  var _intValue = parseInt(prop_get(_id, _property, true), 10);
  if (isNaN(_intValue)) {
    _intValue = 0;
  }
  return _intValue;
}


// Start the queue (automatic)
onloader('elem_add(document.body);');
onloader('prop_loop_start();');


/** DOCUMENTED_BEGIN **/

/***  class: HEventManager
  **
  **  Handles the mid level event abstraction for components.
  **  The EventManager class is designed to be single-instance,
  **  use it via the static HEventManager instance.
  **   - Operates transparently and automatically when used via components
  **     derived from <HControl>
  ** 
  **  vars: Instance variables
  **   events - A real time event status array. 
  ***/
HEventManager = HClass.extend({
  
/**
  * Array: events
  *
  * Real-Time Event Status Array (not implemented fully yet)
  *
  * Event Array Index by constant:
  *  events[HStatusButton] -  Primary mouse button is held down (true/false)
  *  events[HStatusButton2] - Secondary mouse button is held down (true/false)
  *  events[HStatusCoordX] - The X-coordinate of the mouse cursor (int px)
  *  events[HStatusCoordY] - The Y-coordinate of the mouse cursor (int px)
  *  events[HStatusKeys] - Key Codes of keys currently held down (Array)
  *  events[HStatusDirection] - Mouse average direction in [float] degrees (Array; four last samples)
  *  events[HStatusSpeed] - Mouse average speed in [float] px/sec (Array; four last samples)
  *  events[HStatusAltKey] - <alt> key held down (true/false)
  *  events[HStatusCtrlKey] - <ctrl> key held down (true/false)
  *  events[HStatusShiftKey] - <shift> key held down (true/false)
  **/
  events: [
    false,  // Primary Mouse Button Pressed
    false,  // Secondary Mouse Button Pressed
    0,      // Mouse X Coordinate
    0,      // Mouse Y Coordinate
    [],     // Keys Pressed
    [],     // Mouse Avg Direction (using the last 4 samples)
    [],     // Mouse Avg Speed (using last 4 samples)
    false,  // Was the <alt> key pressed during the event.
    false,  // Was the <ctrl> key pressed during the event.
    false   // Was the <shift> key pressed when the event was fired.
  ],
  
  /// Index Constants for the Real-Time Event Status Array
  HStatusButton: 0,
  HStatusButton2: 1,
  HStatusCoordX: 2,
  HStatusCoordY: 3,
  HStatusKeys: 4,
  HStatusDirection: 5,
  HStatusSpeed: 6,
  HStatusAltKey: 7,
  HStatusCtrlKey: 8,
  HStatusShiftKey: 9,
  
  constructor: null,
  
/** Initializes internal structures
  */
  start: function() {
    
    var _globalEventTargetElement;
    
    // Explorer wants document body as the global event target:
    if(is_ie) {
      _globalEventTargetElement = document;
    }
    
    // window works fine on other browsers:
    else {
      _globalEventTargetElement = window;
    }
    
    // global onmousemove, is handled here, no bubbling please.
    Event.observe(
      _globalEventTargetElement,
      'mousemove',
      this.mouseMove
    );
    
    // global onmouseup, is handled here, no bubbling please.
    Event.observe(
      _globalEventTargetElement,
      'mouseup',
      this.mouseUp
    );
    
    // global onmousedown, is handled here, no bubbling please.
    Event.observe(
      _globalEventTargetElement,
      'mousedown',
      this.mouseDown
    );
    
    // global onkeyup.
    Event.observe(
      _globalEventTargetElement,
      'keyup',
      this.keyUp
    );
    
    // global onkeydown.
    Event.observe(
      _globalEventTargetElement,
      'keydown',
      this.keyDown
    );
    
    // global onkeypress.
    Event.observe(
      _globalEventTargetElement,
      'keypress',
      this.keyPress
    );
    
    // alternative right mouse button detection.
    Event.observe(
      _globalEventTargetElement,
      'contextmenu',
      this.contextMenu
    );
    
    // global mouse wheel
    if (window.addEventListener) {
      // XUL event, only for Mozillas
      window.addEventListener('DOMMouseScroll', this.mouseWheel, false);
    }
    // Rest of the browsers use this method
    window.onmousewheel = document.onmousewheel = this.mouseWheel;
    
    
    // this array holds all the focused items
    //  index (key) is the same as the elemId
    //  value is a boolean of the status
    this.focusItems = [];
    
    // this array holds all the registered items
    //  index (key) is the same as the elemId
    //  value is a boolean of the status
    this.eventItems = [];
    
    // this array holds the behaviour of the registered items
    //  index (key) is the same as the elemId
    //  value is a property list of the options
    this.focusOptions = [];
    
    // this array holds the currently dragged items
    //  there is only the elemId, that gets pushed and spliced
    this.dragItems = [];
    
    // items' indices currently under the mouse coordinates in no specific order
    this.hoverItems = [];
    // sampling rate of hover position in ms, bigger value means better
    // performance, but too big value may cause lagging in the UI
    this.hoverInterval = 100;
    this.hoverTimer = new Date().getTime();
    
    // The item that is currently under the mouse coordinates and as accepting
    // drop events. This is only set while dragging.
    this.topmostDroppable = null;
    
    // Caching element position's is a very good thing for performance, but it
    // might cause some issues in applications with lots of moving objects.
    // Controls are responsible for calling invalidatePositionCache when the
    // position of the element changes.
    
    // The cache is now enabled (since rev 1390) by default, and can be 
    // inactivated by calling HEventManager.disablePositionCache().
    
    // TODO: Cache size is now unlimited, this should be handled somehow to
    // prevent the array from growing infinitely.
    this._elemPositionCache = [];
    this._elemPositionCacheEnabled = true;
    
    // This is a reference to the control that the user has last activated by
    // clicking on it. Disabled controls can never be active.
    this.activeControl = null;
    // The keycode of the key that was last pressed down.
    this._lastKeyDown = null;
    
  },
  
/** method: enablePositionCache
  *
  * Enables the position cache.
  * - Speeds stuff up, but might have some side-effects. (Not throughly tested)
  *
  * See Also:
  *  <disablePositionCache> <invalidatePositionCache>
  **/
  enablePositionCache: function() {
    this._elemPositionCacheEnabled = true;
  },
  
/** method: disablePositionCache
  *
  * Disables the position cache.
  *
  * See Also:
  *  <enablePositionCache> <invalidatePositionCache>
  **/
  disablePositionCache: function() {
    this._elemPositionCacheEnabled = false;
  },
  
/** method: invalidatePositionCache
  *
  * Invalidates the position cache
  *
  * Parameters:
  *  _elemId - (optional) If an element ID is passed, only that element is
  *            invalidated, otherwise the whole cache is cleared.
  *
  * See Also:
  *  <enablePositionCache> <disablePositionCache>
  **/
  invalidatePositionCache: function(_elemId) {
    if (_elemId) {
      this._elemPositionCache[_elemId] = null;
    }
    else {
      this._elemPositionCache = [];
    }
  },
  
/**  method: register
  *
  *  Registers an item, starts to follow the mouse events of the component's element
  *
  *  Parameters:
  *    _theItem - 'this' in the caller; see <HControl>
  *    _focusOptions - A structure that defines what events will be bound on over/out; see <HControl>
  *
  *  See Also:
  *    <HControl> <unregister>
  **/
  register: function(_theItem, _focusOptions) {
    /// Binds the class to the element (so it can be called on the event)
    var _elemId = _theItem.elemId;
    var _elem = elem_get(_elemId);
    if(is_ie) {
      _elem.setAttribute('owner', _theItem);
    }
    else {
      _elem.owner = _theItem;
    }
    
    /// Update the internal element status (see constructor)
    this.eventItems[_elemId] = true;
    this.focusItems[_elemId] = false;
    this.focusOptions[_elemId] = _focusOptions;
    
    /// Starts the element specific observation, see control.js
    Event.observe(_elem, 'mouseover', _theItem._mouseOver);
  },
  
/**  method: unregister
  *
  *  Sets the element as disabled (won't listen to any events after this).
  *
  *  Parameters:
  *   _theItem - 'this' in the caller; see <HControl>
  *
  *  See Also:
  *    <HControl> <register>
  **/
  unregister: function(_theItem) {
    // If the element to be unregistered is currently the active control, unset
    // the active status so it doesn't receive keyboard events.
    if (_theItem == this.activeControl) {
      this.changeActiveControl(null);
    }
    
    var _elemId = _theItem.elemId;
    var _elem = elem_get(_elemId);
    this.eventItems[_elemId] = false;
    this.focusItems[_elemId] = false;
    this._elemPositionCache[_elemId] = null;
    try {
      Event.stopObserving(_elem, 'mouseover', _theItem._mouseOver);
    } catch(e) {
      window.status = e;
    }
  },
  
/*** method: focus
  **
  ** Stop listening to mouseover and start listening to mouseout,
  ** also sets the internal structures so it will get handled by
  ** the global handlers.
  **
  ** Parameters:
  **  _theItem - An element index id
  **
  ** See Also:
  **  <HControl> <blur>
  ***/
  focus: function(_theItem) {
    var _elemId = _theItem.elemId;
    var _elem = elem_get(_elemId);
    if(this.focusItems[_elemId] == false && _theItem.isDragged == false) {
      Event.stopObserving(_elem, 'mouseover', _theItem._mouseOver);
      Event.observe(_elem, 'mouseout', _theItem._mouseOut);
      this.focusItems[_elemId] = true;
      _theItem.focus();
    }
  },
  
/*** method: blur
  **
  ** Stop listening to mouseout and start listening to mouseover,
  ** also sets the internal structures so it will not get handled by
  ** the global handlers anymore.
  **
  ** Parameters:
  **  _theItem - An element index id
  **
  ** See Also:
  **  <HControl> <focus>
  ***/
  blur: function(_theItem) {
    var _elemId = _theItem.elemId;
    var _elem = elem_get(_elemId);
    if(this.focusItems[_elemId] == true && _theItem.isDragged == false) {
      Event.stopObserving(_elem, 'mouseout', _theItem._mouseOut);
      Event.observe(_elem, 'mouseover', _theItem._mouseOver);
      this.focusItems[_elemId] = false;
      _theItem.blur();
    }
  },
  
/*** method: mouseMove
  **
  ** Tracks mouse movement, updates the real time event status array and
  ** sends doDrag method calls to all active draggable items.
  **
  ** Note:
  **  Do not call, set it as an event receiver.
  **
  ** See Also:
  **  <HControl> <focus> <blur> <mouseUp> <mouseDown>
  ***/
  mouseMove: function(e) {
    var _this = HEventManager;
    var _x = Event.pointerX(e);
    var _y = Event.pointerY(e);
    var _currentlyDragging = false;
    _this.events[_this.HStatusCoordX] = _x;
    _this.events[_this.HStatusCoordY] = _y;
    for (var i = 0; i < _this.dragItems.length; i++) {
      var _elemId = _this.dragItems[i];
      _this.focusOptions[_elemId].owner.doDrag(_x, _y);
      _this.invalidatePositionCache(_elemId);
      _currentlyDragging = true;
    }
    
    // Check which items are under the mouse coordinates now.
    // TODO: Keep an eye on the performance. (hover interval added for speed)
    if (new Date().getTime() > _this.hoverTimer + _this.hoverInterval) {
      
      // Get the hover items every _this.hoverInterval milliseconds. Updates the
      // _this.hoverItems array.
      _this._updateHoverItems();
      
      for (var i = 0; i < _this.dragItems.length; i++) {
        // Find the current droppable while dragging.
        var _wasTopmostDroppable = _this.topmostDroppable;
        _this.topmostDroppable = null;
        
        var _elemId = _this.dragItems[i];
        var _owner = _this.focusOptions[_elemId].owner;
        
        // Check for a drop target from the currently hovered items
        for (var j = 0; j < _this.hoverItems.length; j++) {
          var _hoverIndex = _this.hoverItems[j];
          
          if (_hoverIndex != _elemId && _this.focusOptions[_hoverIndex].owner) {
            var _thisitem = _this.focusOptions[_hoverIndex].owner;
            
            // TODO: Not so sure about this, needs more testing.
            if (!_this.topmostDroppable || // First time
              _thisitem.zIndex() > _this.topmostDroppable.zIndex() || // Z beaten
              _thisitem.parent == _this.topmostDroppable) { // subview
              
              if(_thisitem.events.droppable) {
                // Finally, the item must accept drop events.
                _this.topmostDroppable = _thisitem;
              }
            }
          } // if: _hoverIndex
        } // for: j
        
        // Topmost item has changed, send onHoverStart or onHoverEnd to the
        // droppable.
        if (_wasTopmostDroppable != _this.topmostDroppable) {
          if (_wasTopmostDroppable) {
            _wasTopmostDroppable.onHoverEnd(_owner);
          }
          if (_this.topmostDroppable) {
            _this.topmostDroppable.onHoverStart(_owner);
          }
        }
      } // for: i
      
      /////////////////////////////////////////
      
      _this.hoverTimer = new Date().getTime();
    } // if: hover interval
    
    if (_currentlyDragging) {
      // Only prevent default action when we are dragging something.
      Event.stop(e);
    }
  },
  
  // Private method.
  // Loop through all registered items and store indices of those elements
  // that are currenly under the mouse cursor in the hoverItems array. Use
  // cached position and dimensions value when possible.
  _updateHoverItems: function() {
    var _this = HEventManager;
    _this.hoverItems = [];
    
    var x = _this.events[_this.HStatusCoordX];
    var y = _this.events[_this.HStatusCoordY];
    
    // View's rect doesn't get updated while dragging, this means that a dragged
    // item doesn't necessarily appear in hoverItems array. That's why the
    // actual DOM element's position and dimensions are considered here, and not
    // the control's rect property.
    for(var _fIndex = 0; _fIndex < _this.eventItems.length; _fIndex++) {
      if (!_this.eventItems[_fIndex] || !_this.focusOptions[_fIndex].owner) {
        // Skip dead items
        continue;
      }
      
      // Shortcut for the control.
      var _control = _this.focusOptions[_fIndex].owner;
      
      // Shortcut for the DOM element
      var _elem = elem_get(_fIndex);
      
      var _elemPosition;
      if (!_this._elemPositionCacheEnabled ||
          !_this._elemPositionCache[_fIndex]) {
          _this._elemPositionCache[_fIndex] = {
            // _location: helmi.Element.getVisiblePageLocation(_elem, true),
            _location: [_control.pageX(), _control.pageY()],
            _size: helmi.Element.getVisibleSize(_elem)
          };
      }
      _elemPosition = _this._elemPositionCache[_fIndex];
      
      // Is the mouse pointer inside the element's rectangle
      if (x >= _elemPosition._location[0] && 
          x <= _elemPosition._location[0] + _elemPosition._size[0] && 
          y >= _elemPosition._location[1] && 
          y <= _elemPosition._location[1] + _elemPosition._size[1]) {
        _this.hoverItems.push(_fIndex);
      }
    } // for: _fIndex
  },
  
/*** method: mouseDown
  **
  ** Tracks mouse button presses, updates the real time event status array and
  ** sends startDrag method calls to all active draggable items
  ** also sends mouseDown method calls to all active non-draggable items.
  ** 
  ** Handles setting the activeControl status, and sends lostActiveStatus calls
  ** to controls that just lost their active status, and gainedActiveStatus
  ** calls to controls that get activated.
  **
  ** Note:
  **  Do not call, set it as an event receiver.
  **
  ** See Also:
  **  <HControl> <HControl.mouseDown> <focus> <blur> <mouseUp> <mouseMove>
  ***/
  mouseDown: function(e, _isLeftButton) {
    var _this = HEventManager;
    _this._modifiers(e);
    var _didStartDrag = false;
    
    if(_isLeftButton === undefined) {
      _isLeftButton = Event.isLeftClick(e);
    }
    
    if(_isLeftButton) {
      _this.events[_this.HStatusButton] = true;
    } else {
      _this.events[_this.HStatusButton2] = true;
    }
    
    var _x = _this.events[_this.HStatusCoordX];
    var _y = _this.events[_this.HStatusCoordY];
    
    // Unset the active control when clicking on anything.
    var _newActiveControl = null;
    
    // The startDrag and mouseDown event receivers are first collected into
    // these arrays and the events are sent after the active control status has
    // been changed.
    var _startDragElementIds = [];
    var _mouseDownElementIds = [];
    
    for(var i = 0; i < _this.focusItems.length; i++) {
      if(_this.focusItems[i] == true) {
        
        // Set the active control to the currently focused item.
        if (_this.focusOptions[i].owner.enabled) {
          _newActiveControl =  _this.focusOptions[i].owner;
        }
        
        if((_this.focusOptions[i].draggable == true) &&
           (_this.dragItems.indexOf(i) == -1)) {
          _startDragElementIds.push(i);
        }
        else if(_this.focusOptions[i].mouseDown == true) {
          _mouseDownElementIds.push(i);
        }
      }
    }
    
    // Handle the active control selection.
    _this.changeActiveControl(_newActiveControl);
    
    // Call the mouseDown and startDrag events after the active control change
    // has been handled.
    for (var i = 0; i < _startDragElementIds.length; i++) {
      _this.dragItems.push(_startDragElementIds[i]);
      _this.focusOptions[_startDragElementIds[i]].owner.startDrag(_x, _y);
      _didStartDrag = true;
    }
    for (var i = 0; i < _mouseDownElementIds.length; i++) {
      _this.focusOptions[_mouseDownElementIds[i]].owner.mouseDown(
        _x, _y, _isLeftButton);
    }
    
    
    if (_didStartDrag) {
      // Remove possible selections.
      document.body.focus();
      // Prevent text selection in MSIE when dragging starts.
      _this._storedOnSelectStart = document.onselectstart;
      document.onselectstart = function () { return false; };
    }
    
    if (_this.hoverItems.length > 0) {
      // Stop the event only when we are hovering over some control. This way
      // normal HTML can be used on the page as well.
      Event.stop(e);
    }
    
    return true;
  },
  
/*** method: changeActiveControl
  **
  ** Changes the active control. The control that is currently active, is
  ** informed of this change by calling its <HControl.lostActiveStatus> method.
  ** The new element's <HControl.gainedActiveStatus> is called. You can also
  ** pass null to this method. That means that none of the controls is currently
  ** active. This method is automatically called by <mouseDown>.
  ** 
  ** Parameters:
  **  _newActiveControl - The control that should be made the active control.
  **
  ** See Also:
  **  <HControl.gainedActiveStatus> <HControl.lostActiveStatus> <mouseDown>
  ***/
  changeActiveControl: function(_newActiveControl) {
    var _this = HEventManager;
    // Store the currently active control so we can inform it if it is no longer
    // the active control.
    var _lastActiveControl = _this.activeControl;
    
    // Did the active control change?
    if (_newActiveControl != _lastActiveControl) {
      if (_lastActiveControl) {
        // Previously active control just lost the active status.
        _lastActiveControl.active = false;
        _lastActiveControl._lostActiveStatus(_newActiveControl);
      }
      _this.activeControl = null;
      if (_newActiveControl) {
        // A new control gained the active status.
        _newActiveControl.active = true;
        _this.activeControl = _newActiveControl;
        _newActiveControl._gainedActiveStatus(_lastActiveControl);
      }
    }
  },
  
/*** method: mouseUp
  **
  ** Tracks mouse button releases, updates the real time event status array and
  ** sends endDrag method calls to all active draggable items.
  ** Also sends mouseUp method calls to all active non-draggable items.
  **
  ** Note:
  **  Do not call, set it as an event receiver.
  **
  ** See Also:
  **  <HControl> <HControl.mouseUp> <focus> <blur> <mouseMove> <mouseDown>
  ***/
  mouseUp: function(e) {
    var _this = HEventManager;
    _this._modifiers(e);
    var _didEndDrag = false;
    
 /* _isLeftButton = Event.isLeftClick(e); */ // doesn't work..
    _this.events[_this.HStatusButton] = false;
    _this.events[_this.HStatusButton2] = false;
    
    var _x = _this.events[_this.HStatusCoordX];
    var _y = _this.events[_this.HStatusCoordY];
    
    // Send endDrag for the currently dragged items even when they don't have
    // focus, and clear the drag item array.
    for (var i = 0; i < _this.dragItems.length; i++) {
      var _elemId = _this.dragItems[i];
      var _owner = _this.focusOptions[_elemId].owner;
      _owner.endDrag(_x, _y);
      _didEndDrag = true;
      
      // If the mouse slipped off the dragged item before the mouse button was
      // released, blur the item manually
      _this._updateHoverItems();
      if (_this.hoverItems.indexOf(_elemId) < 0) {
        _this.blur(_owner);
      }
      
      // If there is a drop target in the currently hovered items, send onDrop
      // to it.
      if (_this.topmostDroppable) {
        // Droppable found at the release point.
        _this.topmostDroppable.onHoverEnd(_owner);
        _this.topmostDroppable.onDrop(_owner);
        _this.topmostDroppable = null;
      }
      
    }
    _this.dragItems = [];
    
    if (_didEndDrag) {
      // Restore MSIE's ability to select text after dragging has ended.
      document.onselectstart = _this._storedOnSelectStart;
    }
    
    // Check for mouseUp listeners.
    for(var _fIndex = 0; _fIndex < _this.focusItems.length; _fIndex++) {
      if(_this.focusItems[_fIndex] == true) {
        if(_this.focusOptions[_fIndex].mouseUp == true) {
          _this.focusOptions[_fIndex].owner.mouseUp(_x, _y, true);
        }
      }
    }
    
    return true;
  },
  
  
/*** method: keyDown
  **
  ** Tracks key presses, sends keyDown method calls to all active items that are
  ** registered to listen keyDown events.
  **
  ** Note:
  **  Do not call, set it as an event receiver.
  **
  ** See Also:
  **  <HControl> <HControl.keyDown> <HControl.gainedActiveStatus> <HControl.lostActiveStatus> <keyUp>
  ***/
  keyDown: function(e) {
    var _this = HEventManager;
    _this._modifiers(e);
    
    var _theKeyCode = e.keyCode;
    
    if (_this.activeControl &&
      _this.focusOptions[_this.activeControl.elemId].keyDown == true) {
      Event.stop(e);
      
      // Workaround for msie rapid fire keydown
      if(_this._lastKeyDown != _theKeyCode) {
        _this.activeControl.keyDown(_theKeyCode);
      }
    }
    
    // Insert key to the realtime array, remove in keyUp
    var _realTimeArr = _this.events[ _this.HStatusKeys ];
    if( _realTimeArr.indexOf( _theKeyCode ) == -1 ){
      _realTimeArr.push( _theKeyCode );
    }
    
    _this._lastKeyDown = _theKeyCode;
  },
  
  
/*** method: keyUp
  **
  ** Tracks key releases, sends keyUp method calls to all active items that are
  ** registered to listen keyUp events.
  **
  ** Note:
  **  Do not call, set it as an event receiver.
  **
  ** See Also:
  **  <HControl> <HControl.keyUp> <HControl.gainedActiveStatus> <HControl.lostActiveStatus> <keyDown>
  ***/
  keyUp: function(e) {
    var _this = HEventManager;
    _this._modifiers(e);
    var _theKeyCode = e.keyCode;
    
    _this._lastKeyDown = null;

    if (_this.activeControl &&
      _this.focusOptions[_this.activeControl.elemId].keyUp == true) {
      _this.activeControl.keyUp( _theKeyCode );
    }
    
    // Remove the key from the realtime array, inserted in keyDown
    var _realTimeArr = _this.events[ _this.HStatusKeys ];
    var _keyCodeIndex = _realTimeArr.indexOf( _theKeyCode );
    if( _keyCodeIndex != -1 ){
      _realTimeArr.splice( _keyCodeIndex, 1 );
    }
    
  },
  
  
  keyPress: function(e) {
    var _this = HEventManager;
    // Prevent default behaviour when a key is held down.
    if (_this.activeControl &&
      _this.focusOptions[_this.activeControl.elemId].keyDown == true) {
      Event.stop(e);
    }
  },
  
  
/*** method: mouseWheel
  **
  ** Tracks mouse wheel scrolling, sends mouseWheel method calls to focused
  ** items that are registered to listen mouseWheel events.
  **
  ** Note:
  **  Do not call, set it as an event receiver.
  **
  ** See Also:
  **  <HControl> <HControl.mouseWheel> <HControl.setMouseWheel>
  ***/
  mouseWheel: function(e) {
    var _this = HEventManager;
    
    var _delta = 0;
    if (!e) {e = window.event;}
    if (e.wheelDelta) {
      _delta = e.wheelDelta/120; 
      if (window.opera) _delta = -_delta;
    } else if (e.detail) {
      _delta = -e.detail/3;
    }
    
    for(var _fIndex = 0; _fIndex < _this.focusItems.length; _fIndex++) {
      if(_this.focusItems[_fIndex]==true) {
        if(_this.focusOptions[_fIndex].mouseWheel==true) {
          Event.stop(e);
          _this.focusOptions[_fIndex].owner.mouseWheel(_delta);
        }
      }
    }
    
  },
  
  
  /// Alternative right button detection, wraps mousedown
  contextMenu: function(e) {
    var _this = HEventManager;
    _this.mouseDown(e, false);
    Event.stop(e);
  },
  
  /// Handle the event modifiers.
  _modifiers: function(e) {
    var _this = HEventManager;
    _this.events[_this.HStatusAltKey] = e.altKey;
    _this.events[_this.HStatusCtrlKey] = e.ctrlKey;
    _this.events[_this.HStatusShiftKey] = e.shiftKey;
  }
  
});

/** Starts the only instance
  */
onloader('HEventManager.start();');

/** class: HPoint
  *
  * Point objects represent points on a two-dimensional coordinate grid. The
  * object's coordinates are stored as public x and y data members.
  *
  * vars: Instance Variables
  *  type - '[HPoint]'
  *  x - The X coordinate of the point
  *  y - The Y coordinate of the point
  *
  * See also:
  *  <HRect>
  **/
HPoint = HClass.extend({

/** constructor: constructor
  *
  * Creates a new Point object that corresponds to the point (x, y), or that's
  * copied from point. If no coordinate values are assigned, the Point's
  * location is indeterminate.
  *
  * Parameter (by using a <HPoint> instance):
  *  point - Another <HPoint> or other compatible structure.
  *
  * Parameters (by using separate numeric coordinates):
  *  x, y - Separate coordinates
  *
  * Initialization examlpes:
  * > var myPoint = new HPoint(100,200);
  * > var mySameCoordPoint = new HPoint( myPoint );
  **/
  constructor: function() {
    this.type = '[HPoint]';
    var _args=arguments;
    
    if (_args.length === 0) {
      this._constructorDefault();
    }
    else if (_args.length == 2) {
      this._constructorValues(_args[0],_args[1]);
    }
    else if (_args.length == 1) {
      this._constructorPoint(_args[0]);
    }
    else {
      throw "Invalid number of arguments.";
    }

  },
  _constructorDefault: function() {
    this.x = null;
    this.y = null;
  },
  _constructorValues: function(x, y) {
    this.x = x;
    this.y = y;
  },
  _constructorPoint: function(_point) {
    this.x = _point.x;
    this.y = _point.y;
  },
  
/** method: set
  *
  * Sets the Point's x and y coordinates.
  *
  * Parameters:
  *  x - The new X coordinate of the point
  *  y - The new Y coordinate of the point
  **/
  set: function() {
    var _args=arguments;
    
    if (_args.length === 0) {
      this._constructorDefault();
    }
    else if (_args.length == 2) {
      this._constructorValues(_args[0],_args[1]);
    }
    else if (_args.length == 1) {
      this._constructorPoint(_args[0]);
    }
    else {
      throw "Invalid number of arguments.";
    }
  },
  
/** method: constrainTo
  *
  * Ensures that the Point lies within rect. If it's already contained in the
  * rectangle, the Point is unchanged; otherwise, it's moved to the rect's
  * nearest edge.
  *
  * Parameter:
  *  _rect - A <HRect> instance to constrain to.
  *
  * See also:
  *  <HRect>
  **/
  constrainTo: function(_rect) {
    
    if (this.x < _rect.left) {
        this.x = _rect.left;
    }
    if (this.y < _rect.top) {
      this.y = _rect.top;
    }
    if (this.x > _rect.right) {
      this.x = _rect.right;
    }
    if (this.y > _rect.bottom) {
      this.y = _rect.bottom;
    }
    
  },
  
/** method: add
  *
  * Creates and returns a new Point that adds the given Point and this Point
  * together. The new object's x coordinate is the sum of the operands' x
  * values; its y value is the sum of the operands' y values.
  *
  * Parameter (with HPoint):
  *  _point - An <HPoint> to add to.
  *
  * Parameters (with coordinates):
  *  _x - An X-coordinate to add to.
  *  _y - An Y-coordinate to add to.
  *
  * Returns:
  *  A new <HPoint>.
  *
  * See also:
  *  <subtract> <equals>
  **/
  add: function(_point) {
    _args = arguments;
    if((_args.length==1)&&(_args[0].type==this.type)){
      _point = _args[0];
      return new HPoint( (this.x + _point.x), (this.y + _point.y) );
    }
    else if(_args.length==2){
      return new HPoint( (this.x + _args[0]), (this.y + _args[1]) );
    } else {
      return new HPoint( 0, 0 );
    }
  },
  
  
/** method: subtract
  *
  * Creates and returns a new Point that subtracts the given Point from this
  * Point. The new object's x coordinate is the difference between the
  * operands' x values; its y value is the difference between the operands'
  * y values.
  *
  * Parameter (with HPoint):
  *  _point - An <HPoint> to subtract from.
  *
  * Parameters (with coordinates):
  *  _x - An X-coordinate to subtract from.
  *  _y - An Y-coordinate to subtract from.
  *
  * Returns:
  *  A new <HPoint>.
  *
  * See also:
  *  <add> <equals>
  **/
  subtract: function(){
    _args = arguments;
    if((_args.length==1)&&(_args[0].type==this.type)){
      _point = _args[0];
      return new HPoint( this.x-_point.x, this.y-_point.y );
    }
    else if(_args.length==2){
      return new HPoint( this.x-_args[0], this.y-_args[1] );
    } else {
      return new HPoint( 0, 0 );
    }
  },
  
  
/** method: equals
  *
  * Returns true if the two objects' point exactly coincide.
  *
  * Parameter:
  *  _point - A <HPoint> to compare to.
  *
  * Returns:
  *  The result; true or false.
  *
  * See also:
  *  <subtract> <add>
  **/
  equals: function(_point) {
    return ( this.x == _point.x && this.y == _point.y );
  }


});


/** class: HRect
  *
  * A Rect object represents a rectangle. Rects are used throughout the
  * Components to define the frames of windows, views, bitmaps even the 
  * screen itself. A HRect is defined by its four sides, expressed as the public
  * data members left, top, right, and bottom.
  *
  * If you change a component's rect, you should call its <HView.drawRect> method.
  *
  * vars: Instance Variables
  *  type - '[HRect]'
  *  top - The position of the rect's top side (from parent top)
  *  left - The position of the rect's left side (from parent left)
  *  bottom - The position of the rect's bottom side (from parent top)
  *  right - The position of the rect's right side (from parent left)
  *  leftTop - A <HPoint> representing the coordinate of the rect's *left top corner*
  *  leftBottom - A <HPoint> representing the coordinate of the rect's *left bottom corner*
  *  rightTop - A <HPoint> representing the coordinate of the rect's *right top corner*
  *  rightBottom - A <HPoint> representing the coordinate of the rect's *right bottom corner*
  *  width - The width of the rect.
  *  height - The height of the rect.
  *
  * See also:
  *  <HPoint> <HView> <HView.drawRect>
  **/  
HRect = HClass.extend({

/** constructor: constructor
  *
  * Initializes a Rect as four sides, as two diametrically opposed corners,
  * or as a copy of some other Rect object. A rectangle that's not assigned
  * any initial values is invalid, until a specific assignment is made, either
  * through a set() function or by setting the object's data members directly.
  *
  * Parameter (using a <HRect> instance):
  *  rect - Another <HRect>.
  *
  * Parameters (using two <HPoint> instances):
  *  leftTop, rightBottom - Coordinates of the *left top corner* and *right bottom corner*.
  *
  * Parameters (using separate Numeric coordinates):
  *  left, top, right, bottom - Coordinates of the *sides*.
  *
  * Initialization examples:
  * > var myLeftTopPoint = new HPoint(100,200);
  * > var myBottomRightPoint = new HPoint(300,400);
  * > var myRectFromOppositeCornerPoints = new HRect( myLeftTopPoint, myBottomRightPoint );
  * > var myRectFromSideCoordinates = new HRect(100,200,300,400);
  * > var myRectFromAnotherRect = new HRect( myRectFromEdgeCoordinates );
  **/
  constructor: function() {
    this.type = '[HRect]';
    var _args=arguments;
    
    if (_args.length === 0) {
      this._constructorDefault();
    } else if (_args.length == 4) {
      this._constructorSides(_args[0],_args[1],_args[2],_args[3]);
    }
    else if (_args.length == 2) {
      this._constructorPoint(_args[0],_args[1]);
    }
    else if (_args.length == 1) {
      this._constructorRect(_args[0]);
    }
    else {
      throw "Invalid number of arguments.";
    }
    this.updateSecondaryValues();
  },
  _constructorDefault: function() {
    this.top = 0;
    this.left = 0;
    this.bottom = -1;
    this.right = -1;
  },
  _constructorSides: function(_left, _top, _right, _bottom) {
    this.top = _top;
    this.left = _left;
    this.bottom = _bottom;
    this.right = _right;
  },
  _constructorPoint: function(_leftTop, _rightBottom) {
    this.top = _leftTop.y;
    this.left = _leftTop.x;
    this.bottom = _rightBottom.y;
    this.right = _rightBottom.x;
  },
  _constructorRect: function(_rect) {
    this.top = _rect.top;
    this.left = _rect.left;
    this.bottom = _rect.bottom;
    this.right = _rect.right;
  },

/** method: updateSecondaryValues
  *
  * You should call this on the instance to update secondary values, like
  * width and height, if you change a primary (left/top/right/bottom) value
  * straight through the property.
  *
  * *Do not change properties other than the primaries through properties.*
  *
  * *Use the accompanied methods instead.*
  *
  * See also:
  *  <set> <setLeftTop> <setLeftBottom> <setRightTop> <setRightBottom> <setWidth> <setHeight> <setSize>
  **/
  updateSecondaryValues: function() {
    /**
      * isValid is true if the Rect's right side is greater than or equal to its left
      * and its bottom is greater than or equal to its top, and false otherwise.
      * An invalid rectangle can't be used to define an interface area (such as
      * the frame of a view or window).
      */
    this.isValid = ( this.right >= this.left && this.bottom >= this.top );
    
    /**
      *
      * The Point-returning functions return the coordinates of one of the
      * rectangle's four corners. 
      */
    this.leftTop = new HPoint(this.left, this.top);
    this.leftBottom = new HPoint(this.left, this.bottom);
    this.rightTop = new HPoint(this.right, this.top);
    this.rightBottom = new HPoint(this.right, this.bottom);
    
    /**
      * The width and height of a Rect's rectangle, as returned through these
      * properties.
      */
    this.width = (this.right - this.left);
    this.height = (this.bottom - this.top);
  },
  
/** method: set
  *
  * Sets the object's rectangle by defining the coordinates of all four
  * sides.
  *
  * The other set...() functions move one of the rectangle's corners to the
  * Point argument; the other corners and sides are modified concomittantly.
  *
  * *None of these methods prevents you from creating an invalid rectangle.*
  *
  * Parameters:
  *  _left - The coordinate of the left side.
  *  _top - The coordinate of the top side.
  *  _right - The coordinate of the right side.
  *  _bottom - The coordinate of the bottom side.
  *
  * See also:
  *  <setLeftTop> <setLeftBottom> <setRightTop> <setRightBottom> <setWidth> <setHeight> <setSize>
  **/
  set: function() {
    var _args=arguments;
    
    if (_args.length === 0) {
      this._constructorDefault();
    } else if (_args.length == 4) {
      this._constructorSides(_args[0],_args[1],_args[2],_args[3]);
    }
    else if (_args.length == 2) {
      this._constructorPoint(_args[0],_args[1]);
    }
    else if (_args.length == 1) {
      this._constructorRect(_args[0]);
    }
    else {
      throw "Invalid number of arguments.";
    }
    this.updateSecondaryValues();
  },
  
/** method: setLeft
  *
  * Moves the rect's left side to a new coordinate.
  *
  * Parameter:
  *  _left - The new left side coordinate (in px)
  *
  **/
  setLeft: function(_left){
    this.left = _left;
    this.updateSecondaryValues();
  },
  
/** method: setRight
  *
  * Moves the rect's right side to a new coordinate.
  *
  * Parameter:
  *  _right - The new right side coordinate (in px)
  *
  **/
  setRight: function(_right){
    this.right = _right;
    this.updateSecondaryValues();
  },
  
/** method: setTop
  *
  * Moves the rect's top side to a new coordinate.
  *
  * Parameter:
  *  _top - The new top side coordinate (in px)
  *
  **/
  setTop: function(_top){
    this.top = _top;
    this.updateSecondaryValues();
  },
  
/** method: setBottom
  *
  * Moves the rect's bottom side to a new coordinate.
  *
  * Parameter:
  *  _bottom - The new bottom side coordinate (in px)
  *
  **/
  setBottom: function(_bottom){
    this.bottom = _bottom;
    this.updateSecondaryValues();
  },
  
/** method: setLeftTop
  *
  * Moves the rects left and top sides to a new point. Affects the position,
  * width and height.
  *
  * Parameter:
  *  _point - A <HPoint> instance to mode the sides to.
  *
  * See also:
  *  <set> <setLeftBottom> <setRightTop> <setRightBottom> <setWidth> <setHeight> <setSize>
  **/
  setLeftTop: function(_point) {
    this.left=_point.x;
    this.top=_point.y;
    this.updateSecondaryValues();
  },
  
/** method: setLeftBottom
  *
  * Moves the rects left and bottom sides to a new point. Affects the left
  * position, width and height.
  *
  * Parameter:
  *  _point - A <HPoint> instance to mode the sides to.
  *
  * See also:
  *  <set> <setLeftTop> <setRightTop> <setRightBottom> <setWidth> <setHeight> <setSize>
  **/
  setLeftBottom: function(_point) {
    this.left=_point.x;
    this.bottom=_point.y;
    this.updateSecondaryValues();
  },
  
/** method: setRightTop
  *
  * Moves the rects right and top sides to a new point. Affects the top
  * position, width and height.
  *
  * Parameter:
  *  _point - A <HPoint> instance to mode the sides to.
  *
  * See also:
  *  <set> <setLeftTop> <setLeftBottom> <setRightBottom> <setWidth> <setHeight> <setSize>
  **/
  setRightTop: function(_point) {
    this.right=_point.x;
    this.top=_point.y;
    this.updateSecondaryValues();
  },
  
/** method: setRightBottom
  *
  * Moves the rects right and bottom sides to a new point. Affects the width
  * and height. Does not affect the position.
  *
  * Parameter:
  *  _point - A <HPoint> instance to mode the sides to.
  *
  * See also:
  *  <set> <setLeftTop> <setLeftBottom> <setRightTop> <setWidth> <setHeight> <setSize>
  **/
  setRightBottom: function(_point) {
    this.right=_point.x;
    this.bottom=_point.y;
    this.updateSecondaryValues();
  },
  
/** method: setWidth
  *
  * Moves the rects right side to a new coordinate. Does not affect the position.
  *
  * Parameter:
  *  _width - A numeric value representing the new target width of the rect.
  *
  * See also:
  *  <set> <setLeftTop> <setLeftBottom> <setRightTop> <setRightBottom> <setHeight> <setSize>
  **/
  setWidth: function(_width){
    this.right = this.left + _width;
    this.updateSecondaryValues();
  },

/** method: setHeight
  *
  * Moves the rects bottom side to a new coordinate. Does not affect the position.
  *
  * Parameter:
  *  _height - A numeric value representing the new target height of the rect.
  *
  * See also:
  *  <set> <setLeftTop> <setLeftBottom> <setRightTop> <setRightBottom> <setWidth> <setSize>
  **/
  setHeight: function(_height){
    this.bottom = this.top + _height;
    this.updateSecondaryValues();
  },

/** method: setSize
  *
  * Moves the rects right and bottom sides to new coordinates. Does not affect the position.
  *
  * Parameter (by separate numeric values):
  *  _width - A numeric value representing the new target width of the rect.
  *  _height - A numeric value representing the new target height of the rect.
  *
  * Parameter (by <HPoint> used as "HSize"):
  *  _point.x - A numeric value representing the new target width of the rect.
  *  _point.y - A numeric value representing the new target height of the rect.
  *
  * See also:
  *  <set> <setLeftTop> <setLeftBottom> <setRightTop> <setRightBottom> <setWidth> <setHeight>
  **/
  setSize: function(){
    var _args=arguments;
    // Using width and height:
    if (_args.length === 2) {
      _width = _args[0];
      _height = _args[1];
    }
    // Using a point:
    else if (_args.length === 1) {
      _width = _args.x;
      _height = _args.y;
    }
    this.right = this.left + _width;
    this.bottom = this.top + _height;
    this.updateSecondaryValues();
  },
  
/** method: intersects
  *
  * Returns true if the Rect has any area even a corner or part 
  * of a side in common with rect, and false if it doesn't.
  *
  * Parameter:
  *  _rect - A <HRect> instance to intersect this rect with
  *
  * Returns:
  *  A Boolean (true/false) depending on the result.
  *
  * See also:
  *  <contains> <equals> <intersection> <union>
  **/
  intersects: function(_rect) {
    return (
      ((_rect.left >= this.left && _rect.left <= this.right) ||
        (_rect.right >= this.left && _rect.right <= this.right)) && 
      ((_rect.top >= this.top && _rect.top <= this.bottom) ||
        (_rect.bottom >= this.top && _rect.bottom <= this.bottom)));
  },
  
/** method: contains
  *
  * Returns true if point or rect lies entirely within the Rect's
  * rectangle (and false if not). A rectangle contains the points that lie
  * along its edges; for example, two identical rectangles contain each other.
  * 
  * Also works with <HPoint> instances.
  *
  * Parameter:
  *  _obj - A <HRect> or <HPoint> to check the containment with.
  *
  * Returns:
  *  A Boolean (true/false) depending on the result.
  *
  * See also:
  *  <intersects> <equals> <intersection> <union>
  **/
  contains: function(_obj) {
    if(_obj instanceof HPoint) {
      return this._containsPoint(_obj);
    }
    else if(_obj instanceof HRect) {
      return this._containsRect(_obj);
    }
    else {
      throw "Wrong argument type.";
    }
  },
  _containsPoint: function(_point) {
    return ( _point.x >= this.left && _point.x <= this.right &&
             _point.y >= this.top && _point.y <= this.bottom );
  },
  _containsRect: function(_rect) {
    return ( _rect.left >= this.left && _rect.right <= this.right &&
             _rect.top >= this.top && _rect.bottom <= this.bottom );
  },
  
/** method: insetBy
  *
  * Insets the sides of the Rect's rectangle by x units (left and
  * right sides) and y units (top and bottom). Positive inset values shrink
  * the rectangle; negative values expand it. Note that both sides of each
  * pair moves the full amount. For example, if you inset a Rect by (4,4), the
  * left side moves (to the right) four units and the right side moves (to the
  * left) four units (and similarly with the top and bottom).
  *
  * Parameter (using a <HPoint>):
  *  point - A <HPoint> to inset by.
  *
  * Parameter (using separate x and y coordinates):
  *  x, y - Numeric coordinates to inset by.
  *
  * See also:
  *  <offsetBy> <offsetTo> <setLeftTop> <setRightTop> <setLeftBottom> <setLeftTop>
  **/
  insetBy: function() {
    var _args=arguments;
    if (_args.length === 1) {
      this._insetByPoint(_args[0]);
    } else if (_args.length == 2) {
      this._insetByXY(_args[0],_args[1]);
    } else {
      throw "Invalid number of arguments.";
    }
    this.updateSecondaryValues();
  },
  _insetByPoint: function(_point) {
    this._insetByXY(_point.x, _point.y);
  },
  _insetByXY: function(x, y) {
    this.left += x;
    this.top += y;
    this.right -= x;
    this.bottom -= y;
  },
  
/** method: offsetBy
  *
  * Moves the Rect horizontally by x units and vertically by y
  * units. The rectangle's size doesn't change.
  *
  * Parameter (using a <HPoint>):
  *  point - A <HPoint> to offset by.
  *
  * Parameter (using separate x and y coordinates):
  *  x, y - Numeric coordinates to offset by.
  *
  * See also:
  *  <insetBy> <offsetTo> <setLeftTop> <setRightTop> <setLeftBottom> <setLeftTop>
  **/
  offsetBy: function() {
    var _args=arguments;
    if (_args.length === 1) {
      this._offsetByPoint(_args[0]);
    } else if (_args.length == 2) {
      this._offsetByXY(_args[0],_args[1]);
    } else {
      throw "Invalid number of arguments.";
    }
    this.updateSecondaryValues();
  },
  _offsetByPoint: function(_point) {
    this._offsetByXY(_point.x, _point.y);
  },
  _offsetByXY: function(x, y) {
    this.left += x;
    this.top += y;
    this.right += x;
    this.bottom += y;
  },
  
/** method: offsetTo
  *
  * Moves the Rect to the location (x,y).
  *
  * Parameter (using a <HPoint>):
  *  point - A <HPoint> to offset to.
  *
  * Parameter (using separate x and y coordinates):
  *  x, y - Numeric coordinates to offset to.
  *
  * See also:
  *  <insetBy> <offsetBy> <setLeftTop> <setRightTop> <setLeftBottom> <setLeftTop>
  **/
  offsetTo: function() {
    var _args=arguments;
    if (_args.length === 1) {
      this._offsetToPoint(_args[0]);
    } else if (_args.length == 2) {
      this._offsetToXY(_args[0],_args[1]);
    } else {
      throw "Invalid number of arguments.";
    }
    this.updateSecondaryValues();
  },
  _offsetToPoint: function(_point) {
    this._offsetToXY(_point.x, _point.y);
  },
  _offsetToXY: function(x, y) {
    this.right += x-this.left;
    this.left = x;
    this.bottom += y-this.top;
    this.top = y;
  },
  
/** method: equals
  *
  * Returns true if the two objects' rectangles exactly coincide.
  *
  * Parameter:
  *  _rect - A <HRect> instance to compare to.
  *
  * Returns:
  *  A Boolean (true/false) depending on the result.
  *
  * See also:
  *  <intersects> <contains> <intersection> <union>
  **/
  equals: function(_rect) {
    return (this.left == _rect.left && this.top == _rect.top &&
            this.right == _rect.right && this.bottom == _rect.bottom);
  },
  
/** method: intersection
  *
  * Creates and returns a new Rect that's the intersection of this Rect and
  * the specified Rect. The new Rect encloses the area that the two Rects have
  * in common. If the two Rects don't intersect, the new Rect will be invalid.
  *
  * Parameter:
  *  _rect - A <HRect> instance to compare to.
  *
  * Returns:
  *  A new <HRect> instance.
  *
  * See also:
  *  <intersects> <contains> <equals> <union>
  **/
  intersection: function(_rect) {
    return new HRect(
       Math.max(this.left, _rect.left), Math.max(this.top, _rect.top),
       Math.min(this.right, _rect.right), Math.min(this.bottom, _rect.bottom)
    );
  },
  
/** method: union
  *
  * Creates and returns a new Rect that minimally but completely encloses the
  * area defined by this Rect and the specified Rect.
  *
  * Parameter:
  *  _rect - A <HRect> instance to compare to.
  *
  * Returns:
  *  A new <HRect> instance.
  *
  * See also:
  *  <intersects> <contains> <equals> <intersection>
  **/
  union: function(_rect) {
    return new HRect(
      Math.min(this.left, _rect.left), Math.min(this.top, _rect.top),
      Math.max(this.right, _rect.right), Math.max(this.bottom, _rect.bottom)
    );
  },
  
  // Compability with HRectValue (dummy methods)
  bind: function(_obj){},
  unbind: function(_obj){}
  
});


/** class: HSystem
  *
  * *Simple application householding system.*
  * 
  * Designed as single instance.
  *
  * HSystem is used to keep <HApplication> instances in order.
  * HApplication itself calls HSystem, so there is no real need to access
  * HSystem itself besides its <HSystem.stopApp>, <HSystem.startApp>, 
  * <HSystem.reniceApp> and <HSystem.killApp> methods.
  *
  * HSystem works as the root of the component hierachy and currently offers
  * only <HApplication> management. Useful for implementing taskbars/docks etc.
  *
  * var: HDefaultApplicationInterval
  *  - Defines the default ms interval of polling.
  *  - Defaults to 100 (ms)
  *  - Change it before <Element Manager.onloader> is started.
  *  - Has no effect after the system is initialized.
  *
  * vars: Instance variables
  *  type - '[HSystem]'
  *  apps - A list of Applications running. 
  *  defaultInterval - The default application priority.
  *
  * See Also:
  *  <HApplication>
  *
  * Usage example:
  *  > var MyApp = new HApplication();
  *  > myAppId = MyApp.appId;
  *  > HSystem.reniceApp(myAppId, 10);
  *  > HSystem.killApp(myAppId);
  **/


HDefaultApplicationInterval=100;
HSystem = HClass.extend({
  
  // Single instance; has no constructor
  constructor: null,
  
  type: '[HSystem]',
    
  // An array of HApplication instances, index is the appId
  apps: [],
  
  // An array (in the same order as apps): holds priority values
  appPriorities: [],
  
  // An array (in the same order as apps): holds busy statuses
  busyApps: [],
  
  // An array (in the same order as apps): holds Timeout values
  appTimers: [],
  
  // This array holds free app id:s
  freeAppIds: [],
  
  defaultInterval: HDefaultApplicationInterval,
  
  // The Z-order of applications. All the array handling is done by
  // HApplication and HView instances.
  viewsZOrder: [],
  
  // This is the internal "clock" counter. Gets updated on every process tick.
  ticks: 0,
  //fix_ie: false,
  
  // Time in milliseconds how long to wait for an application to finish before
  // terminating it when the application is killed.
  maxAppRunTime: 5000,
  
/*** method: scheduler
  **
  ** Calls applications, uses the divmod as a prioritizer.
  **
  ***/
  scheduler: function(){
    if ((this.ticks % 10) == 0 && this.fix_ie) {
      //_traverseTree();
    }
    // Loop through all applications:
    for( var _appId=0; _appId<this.apps.length; _appId++ ){
      // Check, if the application exists:
      if( this.apps[ _appId ] ){
        // Check, if the application is busy:
        if( !this.busyApps[ _appId ] ){
          // Check, if the tick count matches the priority of the app:
          if( (this.ticks % this.appPriorities[ _appId ]) == 0 ){
            // Set the app busy, the app itself should "unbusy" itself, when the idle call is done.
            // That happens in <HApplication._startIdle>
            
            // If the app is not busy, then make a idle call:
            this.appTimers[ _appId ] = setTimeout('if (HSystem.apps[' + _appId +
             ']) {HSystem.apps['+_appId+']._startIdle();}',0);
          }
        }
      }
    }
  },
  
  
/*** method: ticker
  **
  ** Calls the scheduler and then calls itself.
  **
  ***/
  ticker: function(){
    // Increment the tick counter:
    this.ticks++;
    this.scheduler();
    this._tickTimeout = setTimeout('HSystem.ticker();',0);
  },
  
  
/*** method: addApp
  **
  ** Called from inside the <HApplication> constructor.
  ** Binds an app and gives it a unique id.
  **
  ** Parameters:
  **  _appClass - Usually *this* inside the HApplication constructor, is the app namespace.
  **  _refreshInterval - The interval (in ms) to poll the app and its components.
  **
  ** Returns:
  **  The application unique id.
  **
  ** See also:
  **  <HApplication>
  ***/
  addApp: function(_appClass,_refreshInterval){
    
    if(this.freeAppIds.length > 200){
      var _appId = this.freeAppIds.shift();
      this.apps[_appId] = _appClass;
    } else {
      this.apps.push(_appClass);
      var _appId = this.apps.length-1;
    }
    
    // sets self as parent
    _appClass.parent  = this;
    _appClass.parents = [this];
    
    _appClass.appId = _appId;
    
    this.startApp(_appId, _refreshInterval);
    
    return _appId;
  },
  
/*** method: startApp
  **
  ** Starts polling an app instance (and its components).
  **
  ** Parameters:
  **  _appId - The unique id of the app.
  **  _refreshInterval - The interval (in ms) to poll the app and its components.
  **
  ** See also:
  **  <HApplication.start> <HSystem.stopApp> <HSystem.reniceApp>
  ***/
  startApp: function(_appId,_refreshInterval){
    if(_refreshInterval===undefined){
      _refreshInterval = this.defaultInterval;
    }
    this.appPriorities[ _appId ] = _refreshInterval;
    this.busyApps[_appId] = false;
  },
  
/*** method: stopApp
  **
  ** Stops polling an app instance (and its components).
  **
  ** Parameters:
  **  _appId - The unique id of the app.
  **
  ** See also:
  **  <HApplication.stop> <HSystem.startApp> <HSystem.reniceApp>
  ***/
  stopApp: function(_appId){
    this.busyApps[_appId] = true;
  },
  
/*** method: reniceApp
  **
  ** Changes the priority of the app. Calls <stopApp> and <startApp>.
  **
  ** Parameters:
  **  _appId - The unique id of the app.
  **  _refreshInterval - The interval (in ms) to poll the app and its components.
  **
  ** See also:
  **  <HSystem.stopApp> <HSystem.startApp>
  ***/
  reniceApp: function(_appId,_refreshInterval){
    this.appPriorities[ _appId ] = _refreshInterval;
  },
  
/*** method: killApp
  **
  ** Stops polling and deletes an app instance (and its components).
  **
  ** Parameters:
  **  _appId - The unique id of the app.
  **
  ** See also:
  **  <HApplication.die> <HSystem.stopApp>
  ***/
  killApp: function(_appId, _forced){
    if( !_forced ){
      var _startedWaiting = new Date().getTime();
      while( this.busyApps[ _appId ] == true ) {
        /* Waiting for the app to finish its idle loop... */
        if (new Date().getTime() > _startedWaiting + this.maxAppRunTime) {
          break;
        }
      }
    }
    this.busyApps[_appId] = true;
    
    this.apps[ _appId ].destroyAllViews();
    delete this.apps[ _appId ];
    this.apps[ _appId ] = null;
    
    this.freeAppIds.push( _appId );
  }
  
});

// Starts the ticking:
onloader('HSystem.ticker();');
/** class: HApplication
  *
  * *Simple application template.*
  *
  * Depends on <HSystem>
  *
  * HApplication instances are good namespaces to bind your client-side logic to.
  * Feel free to extend HApplication to suit your needs. The primary default
  * purpose is root-level component (<HView>) management and being the
  * root controller for <onIdle> events.
  *
  * vars: Instance variables
  *  type - '[HApplication]'
  *  views - A list of child components bound to it through <HView>
  *  parent - Usually <HSystem>
  *  parents - An array containing parents, usually just <HSystem>
  *  appId - The unique id of the app
  *  isBusy - A flag that is true when the app is doing <onIdle> events or stopped.
  *
  * See Also:
  *  <HSystem> <HView>
  *
  * Usage example:
  *  > var myApp = new HApplication(100);
  *  > var mySlider = new HSlider(new HRect(100,100,300,118),myApp,1.0,0.0,200.0);
  *  > mySlider.draw();
  *  > myApp.die();
  **/
HApplication = HClass.extend({
/** constructor: constructor
  *
  * Parameter (optional):
  *  _refreshInterval - An integer value (in ms) used for <onIdle> polling events.
  **/
  constructor: function(_refreshInterval){
    this.type = '[HApplication]';
    
    // storage for views
    this.views = [];
    // store views array gaps here, used for recycling when removing/adding views constantly 
    this.recycleableViewIds = [];
    
    // Views in Z order. The actual Z data is stored in HSystem, this is just a
    // reference to that array.
    this.viewsZOrder = HSystem.viewsZOrder;
    // Finalize initialization via HSystem
    HSystem.addApp(this,_refreshInterval);
  },
  
/** method: buildParents
  *
  * Used by addView to build a parents array of parent classes.
  *
  **/
  buildParents: function(_viewClass){
    _viewClass.parent = this;
    _viewClass.parents = [];
    for(var _parentNum = 0; _parentNum < this.parents.length; _parentNum++) {
      _viewClass.parents.push(this.parents[_parentNum]);
    }
    _viewClass.parents.push(this);
  },
  
/** method: addView
  *
  * Adds a view to the app, <HView> defines an indentical structure for subviews.
  *
  * Called from inside the HView constructor and should be automatic for all 
  * components that accept the 'parent' parameter, usually the second argument,
  * after the <HRect>.
  *
  * Parameter:
  *  _viewClass - Usually *this* inside <HView>-derivate components.
  *
  * Returns:
  *  The parent view specific view id.
  *
  * See also:
  *  <HView.addView> <removeView> <destroyView> <die>
  **/
  addView: function(_viewClass) {
    this.buildParents(_viewClass);
    this.viewsZOrder.push(_viewClass);
    if(this.recycleableViewIds.length > 100){
      var _viewId = this.recycleableViewIds.shift();
      this.views[_viewId] = _viewClass;
    } else {
      this.views.push(_viewClass);
      var _viewId = this.views.length - 1;
    }
    return _viewId;
  },
  
/** method: removeView
  *
  * Call this if you need to remove a child view from its parent without
  * destroying its element, making it in effect a view without parent.
  * Useful, for example, for moving a view from one parent component to another.
  *
  * Parameters:
  *  _viewId - The parent-specific view id. Actually an array index.
  *
  * See also:
  *  <addView> <HView.addView> <destroyView> <die>
  **/
  removeView: function(_viewId){
    if(this.views[_viewId]) {
      this.views[_viewId].remove();
    }
  },

/** method: destroyView
  *
  * Call this if you need to remove a child view from its parent, destroying its
  * child elements recursively and removing all DOM elements too.
  *
  * Parameters:
  *  _viewId - The parent-specific view id. Actually an array index.
  *
  * See also:
  *  <addView> <HView.addView> <removeView> <die>
  **/
  destroyView: function(_viewId){
    if(this.views[_viewId]) {
      this.views[_viewId].die();
    }
  },
  
/** method: die
  *
  * Stops this application and destroys all the views currently in this
  * application.
  *
  * See also:
  *  <HSystem.killApp> <destroyView>
  **/
  die: function(){
    HSystem.killApp(this.appId, false);
  },
  
  
/** method: destroyAllViews
  *
  * Deletes all the views added to this application but doesn't stop the
  * application itself.
  *
  * See also:
  *  <addView> <HView.addView> <removeView> <destroyView> <die>
  **/
  destroyAllViews: function(){
    for (var i = 0; i < this.views.length; i++) {
      if (this.views[i]) {
        this.views[i].die();
      }
    }
  },
  
  
  // calls the idle method of each view
  _pollViews: function(){
    for(var _viewNum=0;_viewNum<this.views.length;_viewNum++){
      // Don't poll dead views.
      if (this.views[_viewNum]) {
        this.views[_viewNum].onIdle();
      }
    }
  },
  
/** method: startIdle
  *
  * Gets called by HSystem, is a separate method to make onIdle() extensions more failure resistant.
  * Do not override or change!
  *
  **/
  _startIdle: function(){
    HSystem.busyApps[ this.appId ] = true;
    this.onIdle();
    this._pollViews();
    HSystem.busyApps[ this.appId ] = false;
  },
  
/** event: onIdle
  *
  * Extend this method, if you are going to perform regular actions in a app.
  * Polled with the 'priority' interval timer given to <start>.
  *
  * *Very useful for 'slow, infinite loops' that don't take all the client browser machine CPU cycles.*
  *
  * See also:
  *  <start> <renice> <HSystem.reniceApp>
  **/
  onIdle: function(){
    /* Your code here */
  }
});

/*** class: HThemeManager
  **
  ** A single instance class.
  **
  ** The theme manager knows the name of the currently loaded theme and handles
  ** the loading of theme specific markup snippets and style declarations.
  **
  ** vars: Instance variables
  **  themePath - Relative path to the components' top directory. 
  **  currentTheme - The name of the theme currently in use. Initially the
  **    default unnamed theme is used.
  **  usesComponentDir - True when the components are separated in their own
  **    directories, usually when using the source/development version. False
  **    when the components are all in same directory. This is the case in the
  **    release build.
  **
  ** See also:
  **  <HView> <HMarkupView>
  ***/

HDefaultThemePath = '../../';
HDefaultThemeName = 'helmiTheme';

/** HDefaultThemeMode:
  *
  *  0 = Pre-built mode
  *  1 = Post-built mode
  *
  */
HThemeMode = 1;

HThemeManager = HClass.extend({
  
  constructor: null,
  
  init: function(){
    
    // Default root path of the themes path, should contain at least the default theme.
    this.themePath = HDefaultThemePath;
    
    // Hash map of loaded template markup (html templates), by theme.
    // componentName is used as the secondary key.
    this._tmplCache = {};
    
    // Hash map of loaded css templates, by theme.
    // componentName is used as the secondary key.
    this._cssCache = {};
    
    // The currently selected default theme name.
    this.currentTheme = 'helmiTheme';
  },
  
  setThemePath: function( _path ){
    this.themePath = _path;
  },
  
  // Error messages, should be refined.
  _errTemplateNotFound: function( _url ) {
    alert( "ERROR: Template Not Found: '" + _url + "' ");
  },
  _errTemplateFailure: function( _url ) {
    alert( "ERROR: Template Failure: '" + _url + "' ");
  },
  _errTemplateException: function( _url ) {
    alert( "ERROR: Template Exception: '" + _url + "' ");
  },
  
/** method: fetch
  *
  * Loads a template file and returns its contents.
  * If errors occurred, calls the error management functions.
  *
  * Parameters:
  *  _url - A valid local file path or http url pointing to the resource to load.
  *  _contentType - An optional parameter, specifies the content type wanted, defaults to text/html.
  *
  * Returns:
  *  The contents of the path.
  */
  fetch: function( _url, _contentType ) {
    var _result;
    if( !_contentType ){
      var _contentType = 'text/html; charset=UTF-8';
    }
    var _req = new Ajax.Request(_url, {
      method:    'GET',
      
      onSuccess: function( _xhr ) {
        _result   = _xhr.responseText;
      },
      
      on404:        function(){ HThemeManager._errTemplateNotFound(  _url ); },
      onFailure:    function(){ HThemeManager._errTemplateFailure(   _url ); },
      onException:  function(){ HThemeManager._errTemplateException( _url ); },
      
      asynchronous: false,
      contentType:  _contentType
    });
    
    _req.onStateChange();
    
    return _result;
  },
  
  
/** method: getThemeGfxPath
  *
  * Returns the theme/component -specific path, called from inside css
  * themes, a bit kludgy approach to tell the theme grapics file paths. 
  */
  getThemeGfxPath: function() {
    var _themeName      = this._cssEvalParams[0];
    var _componentName  = this._cssEvalParams[1];
    var _themePath      = this._cssEvalParams[2];
    var _pkgName        = this._cssEvalParams[3];
    var _urlPrefix      = this._urlPrefix( _themeName, _componentName, _themePath, _pkgName );
    return this._joinPath( _urlPrefix, 'gfx/' );
  },
  
/** method: getCssFilePath
  *
  * Returns the theme/component -specific graphics file path with proper css wrappers.
  * Used from inside css themes, a bit kludgy approach to tell the file name path.
  *
  * Parameters:
  *  _fileName - The File name to load.
  *
  */
  getCssFilePath: function( _fileName ){
    return "url('"+this._joinPath( this.getThemeGfxPath(), _fileName );+"')";
  },
  
/** method: loadCSS
  *
  * Loads a css file based on the given url (or file path).
  * Evaluates the css data.
  * Makes sure the browser uses the data for component styles.
  *
  * Parameter:
  *  _url - A valid url that points to a valid css file.
  *
  * Returns:
  *  The source of the url.
  */
  loadCSS: function( _url ) {
    var _contentType = 'text/css';
    var _cssText = this.fetch( _url, _contentType );
    
    // Don't try to do anything with empty or invalid css data:
    if (!_cssText || _cssText == "") {
      return;
    }
    
    // Evaluate the css text
    _cssText = this._bindCSSVariables( _cssText );
    
    var _style, _styleSheet, _head;
    
    if(is_ie) {
      // Internet Explorer (at least 6.x; check what 7.x does)
      _style         = _d.createStyleSheet();
      _style.cssText = _cssText;
    }
    
    else {
      // Common, standard <style> tag generation in <head>
      _style        = _d.createElement( "style" );
      _style.type   = _contentType;
      _style.media  = "all";
      
      _head = _d.getElementsByTagName('head')[0];
      _head.appendChild(_style);
      
      if (navigator.userAgent.indexOf('KHTML') != -1) {
        // Work-around for safari
        var _cssTextElement = _d.createTextNode(_cssText);
        _style.appendChild(_cssTextElement);
      }
      else {
        // This works for others (add more checks, if problems with new browsers)
        _style.innerHTML = _cssText;
      }
    }
  },
  
  _addSlash: function( _str ){
    if( _str[ _str.length-1 ] != '/' ){
      _str += '/';
    }
    return _str;
  },
  
  _joinPath: function( _str1, _str2 ){
    return this._addSlash( _str1 ) + _str2;
  },
  
  // Makes a common url prefix for template files
  _urlPrefix: function( _themeName, _componentName, _themePath, _pkgName ) {
    
    var _path = _themePath;
    
    // Usually null
    if( _themePath === null ) {
      _path = this.themePath;
    }
    
    // Pre-Build Path Format
    if( HThemeMode == 0 ) {
      if( _pkgName ){
        _path = this._joinPath( _path, _pkgName );
      }
      // When using a component specific theme path, skip the standard directory
      // structure and use the path directly.
      if( _themePath === null ) {
        _path = this._joinPath( _path, _componentName );
        _path = this._joinPath( _path, 'themes' );
      }
      _path = this._joinPath( _path, _themeName );
    }
    
    // Post-Build Path Format
    else if( HThemeMode == 1 ) {
      _path = this._joinPath( _path, _themeName );
    }
    
    return _path;
  },
  
  // Makes a valid css template url
  _cssUrl: function( _themeName, _componentName, _themePath, _pkgName ) {
    this._cssEvalParams = [_themeName, _componentName, _themePath, _pkgName];
    var _cssPrefix = this._urlPrefix( _themeName, _componentName, _themePath, _pkgName );
    var _cssSuffix = this._joinPath( 'css', _componentName+'.css' );
    var _cssUrl = this._joinPath( _cssPrefix, _cssSuffix );
    return _cssUrl;
  },
  
  // Makes a valid html template url
  _markupUrl: function( _themeName, _componentName, _themePath, _pkgName ) {
    var _htmlPrefix = this._urlPrefix( _themeName, _componentName, _themePath, _pkgName );
    var _htmlSuffix = this._joinPath( 'html', _componentName+'.html' );
    var _htmlUrl = this._joinPath( _htmlPrefix, _htmlSuffix );
    return _htmlUrl;
  },
  
/** method: loadMarkup
  *
  * Loads HTML templates of components. Handles caching independently and intelligently.
  *
  * Parameters:
  *  _themeName     - The name of the template to use.
  *  _componentName - The name of the component template (css/html) to load.
  *  _themePath     - (Optional) parameter to override the global theme path.
  *  _pkgPath       - (Optional) parameter to specify the package of the component, useful only in pre-built mode.
  *
  * Returns:
  *  The Pre-Evaluated HTML Template.
  *
  **/
  loadMarkup: function( _themeName, _componentName, _themePath, _pkgName ) {
    if( !this._tmplCache[_themeName] ){
      this._tmplCache[_themeName] = {};
    }
    var _cached = this._tmplCache[_themeName][_componentName];
    
    if (null === _cached || undefined === _cached) { 
      var _markupUrl = this._markupUrl( _themeName, _componentName, _themePath, _pkgName );
      _cached = this.fetch( _markupUrl );
      // Save an empty string to template cache to prevent repeated failing
      // requests.
      if (null === _cached || undefined === _cached) {
        _cached = "";
      }
      this._tmplCache[_themeName][_componentName] = _cached;
    }
    return _cached;
  },
  
/** method: getMarkup
  *
  * Loads CSS and HTML templates of components. Called from <HView._loadMarkup>.
  * Returns the HTML Template as text.
  * Manages file caches independently and intelligently.
  *
  * Parameters:
  *  _themeName     - The name of the template to use.
  *  _componentName - The name of the component template (css/html) to load.
  *  _themePath     - (Optional) parameter to override the global theme path.
  *  _pkgPath       - (Optional) parameter to specify the package of the component, useful only in pre-built mode.
  *
  * Returns:
  *  The Pre-Evaluated HTML Template.
  *
  **/
  getMarkup: function( _themeName, _componentName, _themePath, _pkgName ) {
    
    /* Load Theme-Specific CSS: */
    if (!this._cssCache[_themeName]){
      var _commonCssUrl = this._cssUrl( _themeName, 'common', _themePath, null );
      this._cssCache[_themeName] = {};
      this.loadCSS( _commonCssUrl );
    }
    
    /* Load Component-Specific CSS: */
    if (!this._cssCache[_themeName][_componentName]){
      var _componentCssUrl = this._cssUrl( _themeName, _componentName, _themePath, _pkgName );
      this._cssCache[_themeName][_componentName] = true;
      this.loadCSS( _componentCssUrl );
    }
    
    /* Load/Return Component-Specific HTML: */
    return this.loadMarkup( _themeName, _componentName, _themePath, _pkgName );
  },
  
  
/** method: _componentGfxPath
  *
  * Called via HView to determine the valid path prefix to aid
  * finding theme- and component-specific image files.
  *
  * Returns:
  *   A valid path, for example: '/helmi/themes/helmiTheme/gfx/'
  *
  **/
  _componentGfxPath: function( _themeName, _componentName, _themePath, _pkgName ) {
    var _urlPrefix      = this._urlPrefix( _themeName, _componentName, _themePath, _pkgName );
    var _url = this._joinPath( _urlPrefix, 'gfx/' );
    return _url;
  },
  _componentGfxFile: function( _themeName, _componentName, _themePath, _pkgName, _fileName ){
    return this._joinPath( this._componentGfxPath(_themeName, _componentName, _themePath, _pkgName), _fileName );
  },
  
  
  getThemeGfxFile: function( _fileName ) {
    
    return this.getThemeGfxPath() + _fileName;
    
  },
  
  
/** method: setTheme
  * 
  * Sets the active theme.
  * 
  * Parameters:
  *  _theme - The name of the theme to be set as the active theme.
  *
  **/
  setTheme: function(_theme) {
    this.currentTheme = _theme;
  },
  
/** method: restoreDefaultTheme
  *
  * Sets the default theme ( HDefaultTheme ) to be the active theme.
  **/
  restoreDefaultTheme: function() {
    this.setTheme( HDefaultThemeName );
  },
  
/** regexp: _variable_match
  *
  * A regular expression to match the template evaluation syntax: #{stuff_to_evaluate}
  **/
  _variable_match: new RegExp(/#\{([^\}]*)\}/),
  
/** method: _bindCSSVariables
  *
  * Evaluates the _variable_match regular expression for the string _markup.
  *
  * Parameters:
  *  _cssTmpl - The css template file to be evaluated. 
  *
  * Returns:
  *  An evaluated CSS Template.
  **/
  _bindCSSVariables: function( _cssTmpl ) {
    while ( this._variable_match.test( _cssTmpl ) ) {  
      _cssTmpl = _cssTmpl.replace(  this._variable_match, eval( RegExp.$1 )  );
    }
    return _cssTmpl;
  }
  
});
/*** class: HMarkupView
  **
  ** Serves as a mixin class for classes that need to draw markup but don't
  ** inherit from the HView.
  **
  ** vars: Instance variables
  **  markup - The markup from the component's HTML template.
  **
  ** See also:
  **  <HView>
  ***/
HMarkupView = HClass.extend({

/** method: bindMarkupVariables
  * 
  * Evaluates the pieces of code defined in the markup template marked with
  * syntax #{}.
  * Can't use } characters in the code though. This might need another look...
  * 
  * Places the resulting markup in the instance variable.
  * 
  **/
  bindMarkupVariables: function() {
    
    var _markup = this.markup;
    
    var _ID     = this.elemId.toString();
    var _WIDTH  = this.rect.width;
    var _HEIGHT = this.rect.height;
    
    while ( HMarkupView._variable_match.test(_markup) ) {  
      _markup = _markup.replace( HMarkupView._variable_match, eval(RegExp.$1) );
    }
    
    this.markup = _markup;
  },
  
  
/** method: toggleCSSClass
  * 
  * Sets or unsets the _cssClass into a DOM element that goes by the ID
  * _elementId.
  * 
  * Parameters:
  *  _elementId - ID of the DOM element, or the element itself, to be modified.
  *  _cssClass - Name of the CSS class to be added or removed.
  *  _setOn - Boolean value that tells should the CSS class be added or removed.
  * 
  **/
  toggleCSSClass: function(_elementId, _cssClass, _setOn) {
    if(_elementId) {
      
      var _has_class = helmi.Element.hasClassName(_elementId, _cssClass);
      
      if (_setOn) {
        if (!_has_class) {
          helmi.Element.addClassName(_elementId, _cssClass);
        }
      }
      else {
        if (_has_class) {
          helmi.Element.removeClassName(_elementId, _cssClass);
        }
      }

    }

  }

},{
  _variable_match: new RegExp(/#\{([^\}]*)\}/)
});

/** class: HView
  *
  * Abstract foundation class for all visual components.
  *
  * Depends on <HApplication> <HMarkupView>
  *
  * HView instances are the simplest component type. HViews don't respond to 
  * events, they don't have a visible visual representation (just an invisible
  * '<div>' element), but offers the common visual methods of most components.
  *
  * Feel free to extend HView to suit your needs.
  * However, extend <HControl> instead if you are going to make an active component.
  *
  * vars: Instance variables (common for almost all components)
  *  type - '[HView]' normally, '[HSubview]' if the parent is also a HView
  *
  *  views - A list of child components bound.
  *  viewId - The view index id of this view (parent specific, will change to system-wide uniqueness)
  *  drawn  - A flag that is true after draw is called the first time (the DOM element exists after that)
  *  elemId - The <Element Manager> compatible element index id of the main <div> DOM element of the view. Exists after <draw> is called.
  *  parent - The parent of the view structure
  *  parents - An array containing parents, up to <HApplication> and <HSystem>
  *  appId - The unique id of the app that contains the view
  *  app - References the <HApplication> instance at the root of the view structure
  *
  *  rect - The <HRect> instance that defines the coordinates and dimensions of the view. Call <drawRect> for changes to a rect property to take effect.
  *
  *  theme - The theme chosen to render the component with.
  *  preserveTheme - Boolean, won't change the theme on the fly if true and the global theme changes. Defaults to false.
  *  optimizeWidthOnRefresh - Boolean, true (default) when <optimizeWidth> should be called whenever <refresh> gets called.
  *  
  *  isHidden - Boolean flag, true if set to hidden. Defaults to false (visible)
  *
  *  viewZOrder - The order of subviews in the Z-dimension.
  *
  * See Also:
  *  <HSystem> <HApplication> <HControl>
  *
  * Usage example:
  *  > var myApp = new HApplication(100);
  *  > var myView = new HView( new HRect(100,100,200,200), myApp );
  *  > myView.draw();
  *  > myView.setStyle('background-color','#660000');
  *  > var mySubview = new HView( new HRect(50,50,100,100), myView );
  *  > mySubview.draw();
  *  > mySubview.setStyle('background-color','#ffcc00');
  *  > mySubview.setStyle('border','1 px solid #ffffff');
  **/
HView = HClass.extend({
  
  // This property should be overridden in custom made components. It's like a
  // theme path, but points to the location of a component specific themes. The
  // directory structure must be the same as in the release version's themes
  // directory.
  themePath:   null,
  
  // In pre-build mode, this is the prefix of the directory that contains a set of components.
  packageName: null,

/** constructor: constructor
  *
  * Constructs the logic part of a <HView>.
  * The view still needs to be drawn on screen. To do that, call <draw> after
  * subcomponents of the view are initialized.
  *
  * Parameters:
  *  _rect - An instance of <HRect>, defines the position and size of views.
  *  _parentClass - Another <HView> -compatible instance, like <HApplication>, <HControl> and derived component classes.
  *
  * See also:
  *  <HApplication.addView> <draw> <drawRect> <refresh> <setRect> <drawMarkup> <HControl.draw>
  **/
  constructor: function(_rect, _parentClass) {
    // Moved these to the top to ensure safe themeing operation
    this.theme = HThemeManager.currentTheme;
    this.preserveTheme = false;
    
    // Used for smart template elements (resizing)
    // Use by making a call inside the template like this:
    //   #{this.addResizeableElement(["windowBgImg"+this.elemId,-4,-3])}
    this.resizeElements = [];
    this._resizeElementsInitialized = false;
    this._resizeElementIds = [];
    this.hasResizeElements = false;
    
    this.optimizeWidthOnRefresh = true;
    
    // adds the parentClass as a "super" object
    this.parent = _parentClass;
    
    this.viewId = this.parent.addView(this);
    // the parent addView method adds this.parents
    
    this.appId = this.parent.appId;
    this.app = HSystem.apps[this.appId];
    
    // subviews
    this.views = [];
    
    // store views array gaps here, used for recycling when removing/adding views constantly 
    this.recycleableViewIds = [];
    
    // Subviews in Z order.
    this.viewsZOrder = [];
    
    // Keep the view (and its subviews) hidden until its drawn.
    this._createElement();
    prop_set(this.elemId, 'display', 'none', true);
    prop_set(this.elemId, 'position', 'absolute', true);
    prop_set(this.elemId, 'overflow', 'hidden', true);
    
    // Set the geometry
    this.setRect(_rect);
    this.isHidden = false;
    if(this.parent.type == '[HView]') {
      this.type = '[HSubview]';
    } else {
      this.type = '[HView]';
    }
    
    this.drawn = false;
    
    this._cachedLeft = _rect.left;
    this._cachedTop = _rect.top;
    
    // Additional DOM element bindings are saved into this array so they can be
    // deleted from the element manager when the view gets destroyed.
    this._domElementBindings = [];
    
    if(!this.isinherited) {
      this.draw();
    }
  },
  
/** method: getThemeGfxPath
  *
  * Used by from html theme templates to get the theme-specific image path.
  *
  * Returns:
  *  The theme image directory of the current theme.
  *
  * See also:
  *  <HThemeManager._componentGfxPath>
  **/
  getThemeGfxPath: function() {
    if( this.preserveTheme ){
      _themeName = this.theme;
    } else {
      _themeName = HThemeManager.currentTheme;
    }
    return HThemeManager._componentGfxPath( _themeName,  this.componentName, this.themePath, this.packageName );
  },
  getThemeGfxFile: function( _fileName ) {
    if( this.preserveTheme ){
      _themeName = this.theme;
    } else {
      _themeName = HThemeManager.currentTheme;
    }
    return HThemeManager._componentGfxFile( _themeName,  this.componentName, this.themePath, this.packageName, _fileName );
  },
  
/** method: addResizeableElement
  *
  * Used mostly from html theme files to set a DOM element, such as a <img> to 
  * be resized at will when the component is resized.
  *
  * Parameter:
  *  _resizeElement - An array with three parts. First, the DOM id of the element, then the width and height offsets.
  *
  * Usage example (in a html template):
  *  > <img id="myImg#{this.elemId}" width="#{this.rect.width-4}" height="#{this.rect.height-3}" alt="" src="#{this.getThemeGfxPath()}groovy.gif" />
  *  > #{this.addResizeableElement(['myImg'+this.elemId,-4,-3])} 
  **/
  addResizeableElement: function(_resizeElement) {
    var _resizeElementId = _resizeElement[0];
    if(this._resizeElementIds.indexOf(_resizeElementId) == -1) {
      this._resizeElementIds.push(_resizeElementId);
      this.resizeElements.push(_resizeElement);
    }
    this.addResizeableElementCalled = true;
    // Returns an empty string to prevent 'undefined' eval results
    return '';
  },
  // Initializes the resize elements
  initResizeElements: function() {
    for(var _resizeElemNum = 0; _resizeElemNum < this.resizeElements.length; _resizeElemNum++) {
      
      var _elemId = this.bindDomElement(this._resizeElementIds[_resizeElemNum]);
      this.resizeElements[_resizeElemNum][0] = _elemId;
    }
    this._resizeElementsInitialized = true;
    if(this.resizeElements.length != 0) {
      this.hasResizeElements = true;
    }
  },
  // Resizes resize elements
  doResizeElements: function() {
    for(var _resizeElemNum = 0; _resizeElemNum < this.resizeElements.length; _resizeElemNum++) {
      var _ritem = this.resizeElements[_resizeElemNum];
      
      // Don't pass negative values to width or height.
      var _value = Math.max(this.rect.width + _ritem[1], 0);
      prop_set(_ritem[0], 'width', _value + 'px');
      
      _value = Math.max(this.rect.height + _ritem[2], 0);
      prop_set(_ritem[0], 'height', _value + 'px');
    }
  },
  // create the dom element
  _createElement: function() {
    if(!this.elemId) {
      var _parentElemId;
      if(this.parent.elemId === undefined) {
        _parentElemId = 0;
      }
      else {
        _parentElemId = this.parent.elemId;
      }
      this.elemId = elem_mk(_parentElemId);
      
      this.setStyle('visibility', 'hidden', true);
      
      // Theme name == CSS class name
      helmi.Element.addClassName(elem_get(this.elemId),
        HThemeManager.currentTheme);
      
    }
  },
  
/** method: drawRect
  *
  * Sets the correct properties for elements after changes in the <rect> instance object.
  * Effectively updates the visual representation to match the state of <rect>.
  *
  * See also:
  *  <draw> <drawMarkup> <refresh> <setRect> <HRect>
  **/
  drawRect: function() {
    if (!this.parent || !this.rect.isValid) {
      return;
    }
    
    if(!this._resizeElementsInitialized && this.addResizeableElementCalled) {
      this.initResizeElements();
    }
    if(this.hasResizeElements) {
      this.doResizeElements();
    }
    
    this.drawn = true;
    
    var _elemId = this.elemId;
    var _rect = this.rect;
    
    prop_set( _elemId, 'left',   _rect.left   + 'px', true);
    prop_set( _elemId, 'top',    _rect.top    + 'px', true);
    prop_set( _elemId, 'width',  _rect.width  + 'px', true);
    prop_set( _elemId, 'height', _rect.height + 'px', true);
    
    // Show the rectangle once it gets created, unless visibility was set to
    // hidden in the constructor.
    if (undefined === this.isHidden || this.isHidden == false) {
      prop_set( _elemId, 'visibility', 'inherit', true);
    }
    
    prop_set( _elemId, 'display', 'block', true);
    
    this._updateZIndex();
    
    if (this._cachedLeft != _rect.left || this._cachedTop != _rect.top) {
      this.invalidatePositionCache();
      this._cachedLeft = _rect.left;
      this._cachedTop = _rect.top;
    }
    
    // right, bottom, opacity and png-transparency
    if (is.ie6 && !this.ie_resizefixadded) {
      _traverseTree(elem_get(this.elemId));
      this.ie_resizefixadded = true;
      //HSystem.fix_ie = true;
    }
  },
  
  /**
    * These methods update the z-index property of the actual element(s).
    * _updateZIndex updates this object only and it is used when the object is
    * initially drawn. _updateZIndexAllSiblings updates this object and all its
    * siblings. This is useful when modifying this object's z-order affects
    * other elements too.
    */
  _updateZIndex: function() {
    prop_set(this.elemId, 'z-index',
      this.parent.viewsZOrder.indexOf(this), true);
  },
  _updateZIndexAllSiblings: function() {
    var _views = this.parent.viewsZOrder;
    for (var i = 0; i < _views.length; i++) {
      if(_views[i].elemId) {
        prop_set(_views[i].elemId, 'z-index', i, true);
      }
    }
  },
  
/** method: draw
  *
  * Initializes the visual representation of the object, should call at least <drawRect>.
  *
  * *When extending <HView>, override this method, don't extend it.*
  *
  * See also:
  *  <drawRect> <drawMarkup> <refresh> <HRect>
  **/
  draw: function() {
    this.drawRect();
  },
  
  // Loads the markup from theme manager. If this.preserveTheme is set to true,
  // the this.theme is used for loading the markup. Otherwise the currently
  // active theme is used.
  _loadMarkup: function() {
    var _themeName;
    if (this.preserveTheme) {
      _themeName = this.theme;
    }
    else {
      _themeName = HThemeManager.currentTheme;
    }
    this.markup = HThemeManager.getMarkup( _themeName, this.componentName, this.themePath, this.packageName );
  },
  
/** method: drawMarkup
  *
  * Replaces the *contents* of the view's DOM element with html from the theme specific html file.
  *
  * See also:
  *  <HThemeManager> <bindMarkupVariables> <drawRect> <draw> <refresh>
  **/
  drawMarkup: function() {
    prop_set(this.elemId, 'display', 'none', true);
    
    this._loadMarkup();
    
    this.bindMarkupVariables();
    elem_set(this.elemId, this.markup);
    
    this.markupElemIds = {};
    var _predefinedPartNames = ['bg', 'label', 'state', 'control', 'value', 'subview'];
    for( var i = 0; i < _predefinedPartNames.length; i++ ) {
      var _partName = _predefinedPartNames[ i ];
      var _elemName = _partName + this.elemId;
      var _htmlIdMatch = ' id="' + _elemName + '"';
      if( this.markup.indexOf( _htmlIdMatch ) != -1 ) {
        this.markupElemIds[ _partName ] = this.bindDomElement( _elemName );
      }
    }
    
    prop_set(this.elemId, 'display', 'block', true);
    // right, bottom, opacity and png-transparency
    if (is.ie6 && !this.ie_htmlresizefixadded) {
      _traverseTree(elem_get(this.elemId));
      this.ie_htmlresizefixadded = true;
      //HSystem.fix_ie = true;
    }
  },
  
/** method: setHTML
  *
  * Replaces the contents of the view's DOM element with custom html.
  *
  * Parameters:
  *  _html - The HTML (string-formatted) to replace the content with.
  **/
  setHTML: function( _html ) {
    elem_set( this.elemId, _html );
  },
  
/** method: refresh
  *
  * This method should be extended in order to redraw only specific parts. The
  * base implementation calls <optimizeWidth> when optimizeWidthOnRefresh is set
  * to true.
  *
  * See also:
  *  <HThemeManager> <drawRect> <drawMarkup> <draw>
  **/
  refresh: function() {
    if (this.drawn) {
      // this.drawn is checked here so the rectangle doesn't get drawn by the
      // constructor when setRect() is initially called.
      this.drawRect();
    }
    if (this.optimizeWidthOnRefresh) {
      this.optimizeWidth();
    }
  },

/** method: setRect
  *
  * Replaces the <rect> of the component with a new <HRect> instance and
  * then refreshes the display.
  *
  * Parameter:
  *  _rect - The new <HRect> instance to replace the old <rect> instance with.
  **/
  setRect: function(_rect) {
    if (this.rect) {
      this.rect.unbind(this);
    }
    this.rect = _rect;
    this.rect.bind(this);
    this.refresh();
  },
  
/** method: setStyle
  *
  * Sets any arbitary style of the main DOM element of the component.
  * Utilizes <Element Manager>'s drawing queue/cache to perform the action, 
  * thus working efficiently even when called frequently.
  *
  * Parameters:
  *  _name - The style name (css syntax, eg. 'background-color')
  *  _value - The style value (css syntax, eg. 'rgb(255,0,0)')
  *
  * See also:
  *  <Element Manager.styl_set> <style> <elemId>
  **/
  setStyle: function(_name, _value, _cacheOverride) {
    if (!this.elemId) {
      return;
    }
    prop_set(this.elemId, _name, _value, _cacheOverride);
  },

/** method: style
  *
  * Returns a style of the main DOM element of the component.
  * Utilizes <Element Manager>'s cache to perform the action, thus working
  * efficiently even when called frequently.
  *
  * Parameters:
  *  _name - The style name (css syntax, eg. 'background-color')
  *
  * Returns:
  *  The style property value (css syntax, eg. 'rgb(255,0,0)')
  *
  * See also:
  *  <Element Manager.styl_get> <setStyle> <elemId>
  **/
  style: function(_name) {
    if (!this.elemId) {
      return;
    }
    return prop_get(this.elemId, _name);
  },
  
/** method: setStyleForPart
  *
  * Sets a style for a specified markup element that has been bound to this
  * view.
  *
  * Parameters:
  *  _partName - The identifier of the markup element.
  *  _name - The style name
  *  _value - The style value
  *
  * See also:
  *  <setStyle> <styleForPart>
  **/
  setStyleForPart: function(_partName, _name, _value, _cacheOverride) {
    if (!this.markupElemIds[_partName]) {
      return;
    }
    prop_set(this.markupElemIds[_partName], _name, _value, _cacheOverride);
  },
  
/** method: styleForPart
  *
  * Returns a style of a specified markup element that has been bound to this
  * view.
  *
  * Parameters:
  *  _partName - The identifier of the markup element.
  *  _name - The style name
  *
  * See also:
  *  <style> <SetStyleForPart>
  **/
  styleForPart: function(_partName, _name) {
    if (!this.markupElemIds[_partName]) {
      return;
    }
    prop_get(this.markupElemIds[_partName], _name);
  },

/** method: hide
  *
  * Hides the component's main DOM element (and its children).
  *
  * See also:
  *  <show> <toggle>
  **/
  hide: function() {
    if(!this.isHidden) {
      this.setStyle('visibility', 'hidden');
      this.setStyle('display', 'none');
      this.isHidden = true;
    }
  },
  
/** method: show
  *
  * Restores the visibility of the component's main DOM element (and its children).
  *
  * See also:
  *  <hide> <toggle>
  **/
  show: function() {
    if(this.isHidden) {
      this.setStyle('visibility', 'inherit');
      this.setStyle('display', 'block');
      this.isHidden = false;
    }
  },
  
/** method: toggle
  *
  * Toggles between <hide> and <show>.
  *
  * See also:
  *  <hide> <show>
  **/
  toggle: function() {
    if(this.isHidden) {
      this.show();
    } else {
      this.hide();
    }
  },
  
/** method: remove
  *
  * Call this if you need to remove a component from its parent's <views> array without
  * destroying the DOM element itself, making it in effect a view without parent.
  * Useful, for example, for moving a view from one parent component to another.
  *
  * See also:
  *  <HApplication.removeView> <addView> <destroy> <die>
  **/
  remove: function() {
    if( this.parent ) {
      // Drop the z-order from the parent's array
      this.parent.viewsZOrder.splice( this.parent.viewsZOrder.indexOf(this), 1 );
        
      // Remove this object from the parent's views.
      // NOTE: The array isn't spliced here because it would mess up the view
      // structure, as the view's ID is the index of the parent's views array.
      var _parentIndexOfMe = this.parent.views.indexOf(this);
    
      this.parent.views[_parentIndexOfMe] = null;
      this.parent.recycleableViewIds.push(_parentIndexOfMe);

      // Make sure the z-order array stays solid.
      this._updateZIndexAllSiblings();
    
      // Since were not in the parent's array anymore, we don't need a reference
      // to that object.
      this.parent = null;
      this.parents = [];
    }
  },
  
/** method: die
  *
  * Deletes the component and all its children.
  * Should normally be called from the parent.
  *
  * See also:
  *  <HApplication.die> <addView> <remove> <die> <Element Manager.elem_del>
  **/
  die: function() {
    
    // Delete the children first.
    for (var i = 0; i < this.views.length; i++) {
      if (this.views[i]) {
        this.views[i].die();
      }
    }
    
    // Remove this object's DOM element.
    this.remove();
    
    // Remove the additional DOM element bindings.
    for (var i = 0; i < this._domElementBindings.length; i++) {
      elem_del(this._domElementBindings[i]);
    }
    this._domElementBindings = [];
    
    elem_del(this.elemId);
    this.elemId = null;
    this.drawn = false;
    
    delete this.rect;
    
  },
  
  // Idle poller (recursive)
  onIdle: function() {
    for(var _viewNum = 0; _viewNum < this.views.length; _viewNum++) {
      // Don't poll dead views.
      if (this.views[_viewNum]) {
        this.views[_viewNum].onIdle();
      }
    }
  },
  
/** method: buildParents
  *
  * Used by addView to build a parents array of parent classes.
  *
  **/
  buildParents: function(_viewClass){
    _viewClass.parent = this;
    _viewClass.parents = [];
    for(var _parentNum = 0; _parentNum < this.parents.length; _parentNum++) {
      _viewClass.parents.push(this.parents[_parentNum]);
    }
    _viewClass.parents.push(this);
  },
  
/** method: addView
  *
  * Adds a sub-view/component to the view.
  *
  * Called from inside the HView constructor and should be automatic for all 
  * components that accept the 'parent' parameter, usually the second argument,
  * after the <HRect>.
  *
  * May also be used to attach a freely floating component (removed with <remove>)
  * to another component.
  *
  * Parameter:
  *  _viewClass - Usually *this* inside <HView>-derivate components.
  *
  * Returns:
  *  The view id.
  *
  * See also:
  *  <HApplication.addView> <remove> <die>
  **/
  addView: function(_viewClass) {
    this.buildParents(_viewClass);
    this.viewsZOrder.push(_viewClass);
    if(this.recycleableViewIds.length > 100){
      var _viewId = this.recycleableViewIds.shift();
      this.views[_viewId] = _viewClass;
    } else {
      this.views.push(_viewClass);
      var _viewId = this.views.length - 1;
    }
    return _viewId;
  },
  
/** method: removeView
  *
  * Call this if you need to remove a child view from this view without
  * destroying its element, making it in effect a view without parent.
  * Useful, for example, for moving a view from one parent component to another.
  *
  * Parameters:
  *  _viewId - The parent-specific view id. Actually an array index.
  *
  * See also:
  *  <remove> <addView> <HApplication.removeView> <destroy> <destroyView> <die>
  **/
  removeView: function(_viewId) {
    if(this.views[_viewId]) {
      this.views[_viewId].remove();
    }
  },
  
/** method: destroyView
  *
  * Call this if you need to remove a child view from this view, destroying its
  * child elements recursively and removing all DOM elements too.
  *
  * Parameters:
  *  _viewId - The parent-specific view id. Actually an array index.
  *
  * See also:
  *  <remove> <removeView> <addView> <HApplication.removeView> <destroy> <destroyView> <die>
  **/
  destroyView: function(_viewId) {
    if(this.views[_viewId]) {
      this.views[_viewId].die();
    }
  },
  
/** method: bounds
  *
  *  Returns bounds rectangle that defines the size and coordinate system
  *  of the component. This should be identical to the rectangle used in
  *  constructing the object, unless it has been changed after construction.
  *
  * Returns:
  *  A new <HRect> instance with identical values to this component's rect.
  *
  * See also:
  *  <resizeTo> <resizeBy> <offsetTo> <offsetBy> <HRect> <rect>
  **/
  bounds: function() {
    // Could be cached.
    var _bounds = new HRect(this.rect);
    
    _bounds.right -= _bounds.left;
    _bounds.left = 0;
    _bounds.bottom -= _bounds.top;
    _bounds.top = 0;
    
    return _bounds;
  },
  
  
/** method: resizeBy
  *
  * This method resizes the view, without moving its left and top sides.
  * It adds horizontal coordinate units to the width and vertical units to
  * the height of the view.
  * 
  * Since a View's frame rectangle must be aligned on screen pixels, only
  * integral values should be passed to this method. Values with
  * fractional components will be rounded to the nearest whole integer.
  *
  * If the View is attached to a window, this method causes its parent view
  * to be updated, so the View is immediately displayed in its new size. If it
  * doesn't have a parent or isn't attached to a window, this method
  * merely alter its frame and bounds rectangle.
  *
  * Parameters:
  *  _horizonal - Horizonal units to add to the width (negative units subtract)
  *  _vertical - Vertical units to add to the height (negative units subtract)
  *
  * See also:
  *  <resizeTo> <offsetTo> <offsetBy> <HRect> <rect> <bounds>
  **/
  resizeBy: function(_horizontal, _vertical) {
    var _rect = this.rect;
    _rect.right += _horizontal;
    _rect.bottom += _vertical;
    _rect.updateSecondaryValues();
    this.drawRect();
  },

/** method: resizeTo
  *
  * This method makes the view width units wide
  * and height units high. This method adjust the right and bottom
  * components of the frame rectangle accordingly.
  * 
  * Since a View's frame rectangle must be aligned on screen pixels, only
  * integral values should be passed to this method. Values with
  * fractional components will be rounded to the nearest whole integer.
  * 
  * If the View is attached to a window, this method causes its parent view
  * to be updated, so the View is immediately displayed in its new size. If it
  * doesn't have a parent or isn't attached to a window, this method
  * merely alter its frame and bounds rectangle.
  *
  * Parameters:
  *  _width - The new width of the view.
  *  _height - The new height of the view.
  *
  * See also:
  *  <resizeBy> <offsetTo> <offsetBy> <HRect> <rect> <bounds>
  **/
  resizeTo: function(_width, _height) {
    var _rect = this.rect;
    _rect.right = _rect.left + _width;
    _rect.bottom = _rect.top + _height;
    _rect.updateSecondaryValues();
    this.drawRect();
  },

/** method: offsetTo
  *
  * This method moves the view to a new coordinate. It adjusts the 
  * left and top components of the frame rectangle accordingly.
  * 
  * Since a View's frame rectangle must be aligned on screen pixels, only
  * integral values should be passed to this method. Values with
  * fractional components will be rounded to the nearest whole integer.
  * 
  * If the View is attached to a window, this method causes its parent view
  * to be updated, so the View is immediately displayed in its new size. If it
  * doesn't have a parent or isn't attached to a window, this method
  * merely alter its frame and bounds rectangle.
  *
  * Parameters (using component numeric values):
  *  _x - The new x-coordinate of the view.
  *  _y - The new y-coordinate of the view.
  *
  * Parameters (using a <HPoint> instance):
  *  _point - The new coordinate point of the view.
  *
  * See also:
  *  <resizeBy> <resizeTo> <offsetBy> <HRect.offsetTo> <rect> <bounds>
  **/
  offsetTo: function() {
    this.rect.offsetTo.apply(this.rect, arguments);
    this.drawRect();
  },
  
/** method: moveTo
  *
  * Alias method for <offsetTo>
  *
  **/
  moveTo: function() {
    this.offsetTo.apply(this, arguments);
  },
  
/** method: offsetBy
  *
  * This method re-positions the view without changing its size.
  * It adds horizontal coordinate units to the x coordinate and vertical
  * units to the y coordinate of the view.
  * 
  * Since a View's frame rectangle must be aligned on screen pixels, only
  * integral values should be passed to this method. Values with
  * fractional components will be rounded to the nearest whole integer.
  *
  * If the View is attached to a window, this method causes its parent view
  * to be updated, so the View is immediately displayed in its new size. If it
  * doesn't have a parent or isn't attached to a window, this method
  * merely alter its frame and bounds rectangle.
  *
  * Parameters:
  *  _horizonal - Horizonal units to change the x coordinate (negative units subtract)
  *  _vertical - Vertical units to add to change the y coordinate (negative units subtract)
  *
  * See also:
  *  <resizeTo> <offsetTo> <resizeBy> <HRect> <rect> <bounds>
  **/
  offsetBy: function(_horizontal, _vertical) {
    this.rect.offsetBy(_horizontal, _vertical);
    this.drawRect();
  },
  
/** method: moveBy
  *
  * Alias method for <offsetBy>
  *
  **/
  moveBy: function() {
    this.offsetBy.apply(this, arguments);
  },

/** method: bringToFront
  *
  * Brings the view to the front by changing its Z-Index.
  *
  * See also:
  *  <sendToBack> <zIndex>
  **/
  bringToFront: function() {
    if (!this.parent) {
      return;
    }
    var _index = this.zIndex();
    this.parent.viewsZOrder.splice(_index, 1);
    this.parent.viewsZOrder.push(this);
    this._updateZIndexAllSiblings();
  },

/** method: sendToBack
  *
  * Sends the view to the back by changing its Z-Index.
  *
  * See also:
  *  <bringToFront> <zIndex>
  **/
  sendToBack: function() {
    if (!this.parent) {
      return;
    }
    var _index = this.zIndex();
    this.parent.viewsZOrder.splice(_index, 1);
    this.parent.viewsZOrder.splice(0, 0, this);
    this._updateZIndexAllSiblings();
  },

/** method: sendToBack
  *
  * Use this method to get the Z-Index of itself.
  *
  * Returns:
  *  The current Z-Index value.
  *
  * See also:
  *  <bringToFront> <sendToBack>
  **/
  zIndex: function() {
    if (!this.parent) {
      return;
    }
    // Returns the z-order of this item as seen by the parent.
    return this.parent.viewsZOrder.indexOf(this);
  },
  
/** method: stringWidth
  *
  * Measures the characters encoded in length bytes of the string - or,
  * if no length is specified, the entire string up to the null character,
  * '0', which terminates it. The return value totals the width of all the
  * characters in coordinate units; it's the length of the baseline required
  * to draw the string.
  *
  * Parameters:
  * _string - The string to measure.
  * _length - (optional) How many characters to count.
  * _elemId - (optional) The element ID where the temporary string is created
  *   in.
  *
  * Returns:
  * The width in pixels required to draw a string in the font.
  *
  */
  stringWidth: function(_string, _length, _elemId) {
    if (_length !== undefined && _length != null) {
      _string = _string.substring(0, _length);
    }
    if (_elemId === undefined || _elemId == null) {
      _elemId = this.elemId;
    }
    
    var _stringElem = elem_mk(_elemId);
    prop_set(_stringElem, "visibility", "hidden", true);
    prop_set(_stringElem, "position", "absolute", true);
    prop_set(_stringElem, "white-space", "nowrap", true);
    elem_set(_stringElem, _string);
    var _width;
    var _height;
    if (is_ie || is.opera) {
      _width = elem_get(_stringElem).offsetWidth;
      if (arguments[3]) {
        _height = elem_get(_stringElem).offsetHeight;
      }
    } else {
      _width = prop_get(_stringElem, "width");
      if (arguments[3]) {
        _height = prop_get(_stringElem, "height");
      }
    }
    elem_del(_stringElem);
    if (arguments[3]) {
      return new HPoint(parseInt(_width, 10), parseInt(_height, 10));
    } else {
      return parseInt(_width, 10);
    }
  },
  
/** method: pageX
  *
  * Returns:
  *  The X coordinate that has the scrolled position calculated.
  **/
  pageX: function() {
    var _x = 0;
    var _elem = this;
    while(_elem) {
      if(_elem.elemId && _elem.rect) {
        _x += elem_get(_elem.elemId).offsetLeft;
        _x -= elem_get(_elem.elemId).scrollLeft;
      }
      _elem = _elem.parent;
    }
    return _x;
  },
  
/** method: pageY
  *
  * Returns:
  *  The Y coordinate that has the scrolled position calculated.
  **/
  pageY: function() {
    var _y = 0;
    var _elem = this;
    while(_elem) {
      if(_elem.elemId && _elem.rect) {
        _y += elem_get(_elem.elemId).offsetTop;
        _y -= elem_get(_elem.elemId).scrollTop;
      }
      _elem = _elem.parent;
    }
    return _y;
  },
  
/** method: pageLocation
  *
  * Returns:
  *  The HPoint that has the scrolled position calculated.
  **/
  pageLocation: function() {
    return new HPoint(this.pageX(), this.pageY());
  },
  
/** method: optimizeWidth
  * 
  * An abstract method that derived classes may implement, if they are able to
  * resize themselves so that their content fits nicely inside.
  * 
  */
  optimizeWidth: function() {

  },
  
  
/** method: invalidatePositionCache
  * 
  * Invalidates event manager's element position cache for this view and its
  * subviews. Actual functionality is implemented in HControl.
  * 
  * See also:
  *   <HControl.invalidatePositionCache> <EventManager.invalidatePositionCache>
  * 
  */
  invalidatePositionCache: function() {
    for(var i = 0; i < this.views.length; i++) {
      if (this.views[i]) {
        // Don't invalidate dead views.
        this.views[i].invalidatePositionCache();
      }
    }
  },
  
  
/** method: bindDomElement
  * 
  * Binds a DOM element to the element manager's cache. This is a wrapper for
  * the <Element Manager.elem_bind> that keeps track of the bound elements and
  * frees them from the element manager when the view is destroyed.
  * 
  * Parameters:
  *   _domElementId - The value of the DOM element's id attribute that is to be
  *                   bound to the element cache.
  * 
  * Returns:
  *   The element index id of the bound element.
  * 
  * See also: 
  *   <unbindDomElement> <Element Manager.elem_bind>
  */
  bindDomElement: function(_domElementId) {
    var _cacheId = elem_bind(_domElementId);
    if (_cacheId) {
      this._domElementBindings.push(_cacheId);
    }
    return _cacheId;
  },
  
  
/** method: unbindDomElement
  * 
  * Removes a DOM element from the element manager's cache. This is a wrapper
  * for the <Element Manager.elem_del>. This is used for safely removing DOM
  * nodes from the cache.
  * 
  * Parameters:
  *   _elementId - The id of the element in the element manager's cache that is
  *                to be removed from the cache.
  * 
  * See also: 
  *   <bindDomElement> <Element Manager.elem_del>
  */
  unbindDomElement: function(_elementId) {
    var _indexOfElementId = this._domElementBindings.indexOf(_elementId);
    if (_indexOfElementId > -1) {
      elem_del(_elementId);
      this._domElementBindings.splice(_indexOfElementId, 1);
    }
  },
  
  
/** method: animateTo
  * 
  * Moves the view smoothly into another location and/or size. The
  * onAnimationStart event on the view gets called when the animation starts.
  * 
  * Parameters:
  *   _obj - An instance of <HPoint> or <HRect>, depending on the desired 
  *          animation result. When a point is passed, the view is moved in
  *          that position. When a rect is passed, the view can also be resized
  *          with or without moving to different coordinates.
  *   _duration - (optional) The duration of the animation in milliseconds. The
  *               default duration is 500 ms.
  *   _fps - (optional) The frame rate for the animation. The default fps is 50.
  * 
  * See also: 
  *   <stopAnimation> <onAnimationStart> <onAnimationEnd> <onAnimationCancel>
  */
  animateTo: function(_obj, _duration, _fps) {
    
    // Redirect the method call to _animateTo(HRect).
    if(_obj instanceof HPoint) {
      var _rect = new HRect(_obj, _obj);
      _rect.setSize(this.rect.width, this.rect.height);
      this._animateTo(_rect, _duration);
    }
    else if(_obj instanceof HRect) {
      this._animateTo(_obj, _duration);
    }
    else {
      throw "Wrong argument type.";
    }
    
  },
  
  
/** method: stopAnimation
  * 
  * Stops the current animation for this view. If the view is not being
  * animated, this method has no effect.  The onAnimationEnd event on the view
  * gets called when the animation finishes (reaches the end position/size), but
  * onAnimationCancel gets called when this method is called while the animation
  * is still in action.
  * 
  * See also: 
  *   <animateTo> <onAnimationStart> <onAnimationEnd> <onAnimationCancel>
  */
  stopAnimation: function() {
    if (this._animateInterval) {
      // Stop the animation interval only if it has been set.
      window.clearInterval(this._animateInterval);
      this._animateInterval = null;
      
      // Update the rect after the new position and size have been reached.
      var _left = parseInt(this.style('left'), 10);
      var _top = parseInt(this.style('top'), 10);
      var _width = parseInt(this.style('width'), 10);
      var _height = parseInt(this.style('height'), 10);
      this.rect.set(_left, _top, _left + _width, _top + _height);
      
      
      if (this._animationDone) {
        this.onAnimationEnd();
      }
      else {
        this.onAnimationCancel();
      }
      
    }
  },
  
  
  // Private method.
  // Starts the animation with the target _rect.
  _animateTo: function(_rect, _duration, _fps) {
    
    if (null === _duration || undefined === _duration) {
      _duration = 500; // default duration is half second
    }
    if (null === _fps || undefined === _fps || _fps < 1) {
      _fps = 50; // default fps
    }
    
    // Don't start another animation until the current animation has stopped.
    if (!this._animateInterval) {
      
      this._animationDone = false;
      this.onAnimationStart();
      
      var _startTime = new Date().getTime();
      
      var _that = this;
      // Start the animation interval. It will be cleared when the view reaches
      // its destination.
      this._animateInterval = window.setInterval(
        function() {
          _that._animateStep({
            startTime: _startTime,
            duration: _duration,
            // Linear transition effect.
            transition: function(t, b, c, d) { return c * t / d + b; },
            props: [{
              prop: 'left',
              from: _that.rect.left,
              to: _rect.left,
              unit: 'px'
            },{
              prop: 'top',
              from: _that.rect.top,
              to: _rect.top,
              unit: 'px'
            },{
              prop: 'width',
              from: _that.rect.width,
              to: _rect.width,
              unit: 'px'
            },{
              prop: 'height',
              from: _that.rect.height,
              to: _rect.height,
              unit: 'px'
            }]
          });
        }, Math.round(1000 / _fps)
      );
    }
    
  },
  
  
  // Private method.
  // Moves the view for one step. This gets called repeatedly when the animation
  // is happening.
  _animateStep: function(_obj) {
    
    var _time = new Date().getTime();
    if (_time < _obj.startTime + _obj.duration) {
      var _cTime = _time - _obj.startTime;
      
      // Handle all the defined properties.
      for (var i = 0; i < _obj.props.length; i++) {
        var _from = _obj.props[i].from;
        var _to = _obj.props[i].to;
        
        if (_from != _to) {
          // The value of the property at this time.
          var _propNow = _obj.transition(_cTime, _from, (_to - _from),
            _obj.duration);
          this.setStyle(_obj.props[i].prop, _propNow + _obj.props[i].unit);
        }
      }
      
    } else {
      // Animation is done, clear the interval and finalize the animation.
      for (var i = 0; i < _obj.props.length; i++) {
        this.setStyle(_obj.props[i].prop,
          _obj.props[i].to + _obj.props[i].unit);
      }
      this._animationDone = true;
      this.stopAnimation();
    }
    
  },
  
  
/** event: onAnimationStart
  *
  * Extend the onAnimationStart method, if you want to do something special 
  * when this view starts animating.
  *
  * See also:
  *  <onAnimationEnd> <onAnimationCancel>
  **/
  onAnimationStart: function() {
    
  },
  
  
/** event: onAnimationEnd
  *
  * Extend the onAnimationEnd method, if you want to do something special 
  * when an animation on this view is finished.
  *
  * See also:
  *  <onAnimationStart> <onAnimationCancel>
  **/
  onAnimationEnd: function() {
    
  },
  
  
/** event: onAnimationCancel
  *
  * Extend the onAnimationCancel method, if you want to do something special 
  * when an animation on this view gets cancelled.
  *
  * See also:
  *  <onAnimationStart> <onAnimationEnd>
  **/
  onAnimationCancel: function() {
    
  }
  
  
});

HView.implement(HMarkupView);
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
  *  refreshOnValueChange - A flag that tells components to call <refresh> automatically whenever the value changes, if true.
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
  
/** constructor: constructor
  *
  * The first two parameters are the same as with <HView>, but additionally
  * sets the label and events.
  *
  * Parameters:
  *  _rect - The rectangle of the component. See <HView.constructor>.
  *  _parentClass - The parent component of the component. See <HView.constructor>.
  *  _options - (optional) All other parameters. See <HComponentDefaults>.
  *
  **/
  constructor: function(_rect, _parentClass, _options) {
    
    // HView.constructor:
    if(this.isinherited) {
      this.base(_rect, _parentClass);
    }
    else {
      this.isinherited = true;
      this.base(_rect, _parentClass);
      this.isinherited = false;
    }
    
    // Use empty options if none supplied. Change this within components.
    if(!_options) {
      _options = {};
    }
    
    // Construct and extend the options object on the fly.
    var options = new (HComponentDefaults.extend(_options));
    this.options = options;
    
    // Assign these variables from options.
    // (Partially just for backwards compability)
    var _label = options.label;
    this.setLabel(_label);
    
    var _events = options.events;
    this.setEvents(_events);
    
    this.type = '[HControl]';
    this.refreshOnValueChange = true;
    
    // These are checked, because these might be overridden before the base is called.
    if(!this.valueObj) {
      this.setValueObj(new HDummyValue());
    }
    if(!this.value) {
      this.setValue(options.value);
    }
    
    // Check if a value range is defined
    var _isValueRange = (_options.minValue || _options.maxValue);
    // Also call setValueRange in that case.
    if(_isValueRange) {
      this.setValueRange(options.value, options.minValue, options.maxValue);
    }
    
    this.setEnabled(options.enabled);
    
    this.action = options.action;
    
    // Initial visibility.
    if (null !== options.visible && undefined !== options.visible) {
      if (options.visible) {
        this.show();
      }
      else {
        this.hide();
      }
    }
    
    if(!this.isinherited) {
      this.draw();
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
  },
  
/** method: die
  *
  * Unregisters events before destroying the view.
  *
  * See also:
  *  <HView.die>
  **/
  die: function() {
    if(this.valueObj){
      this.valueObj.unbind(this);
      delete this.valueObj;
    }
    HEventManager.unregister(this);
    this.base();
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
    this.label = _label;
    this.refresh();
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
  *  <events> <HEventManager.register> <HEventManager.unregister>
  *
  **/
  setEnabled: function(_flag) {
    
    // Enable/disable the children first.
    for (var i = 0; i < this.views.length; i++) {
      if (this.views[i]) {
        this.views[i].setEnabled(_flag);
      }
    }
    
    if (this.enabled == _flag) {
      // No change in enabled status, do nothing.
      return;
    }
    
    this.enabled = _flag;
    if(_flag) {
      HEventManager.register(this, this.events);
    }
    else {
      HEventManager.unregister(this);
    }
    
    // Toggle the CSS class: enabled/disabled
    this.toggleCSSClass(elem_get(this.elemId),
      HControl.CSS_ENABLED, this.enabled);
    this.toggleCSSClass(elem_get(this.elemId),
      HControl.CSS_DISABLED, !this.enabled);
  },
  
/** method: setValue
  *
  * Assigns the object a new value. Extend it, if your component needs to do
  * something whenever the value changes.
  *
  * Parameter:
  *  _value - The new value. Allowed values depend on the component type 
  *           and other usage of the bound <HValue> instance.
  *
  * See also:
  *  <setValueRange> <HValue> <HValueManager> <refresh>
  *
  **/
  setValue: function(_value) {
    if(_value == undefined){return}
    if(!this.valueObj){return}
    if(_value !== this.value) {
      this.value = _value;
      this.valueObj.set(this.value);
      if(this.refreshOnValueChange) {
        this.refresh();
      }
    }
  },
  
/** method: setValueObj
  *
  * Binds an <HValue>-compatible instance to the component's valueObj. Also 
  * calls <setValue>. It should not be called from user code, instead use <HValue.bind>.
  *
  * Parameter:
  *  _aValueObj - The new value object.
  *
  * See also:
  *  <setValue> <setValueRange> <HValue.bind> <HValue.unbind> <HValueManager>
  **/
  setValueObj: function(_aValueObj) {
    this.valueObj = _aValueObj;
    this.setValue(_aValueObj.value);
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
  },
  
/** method: setEvents
  *
  * Sets the events the control should listen to. Event bindings happen 
  * automatically through <HEventManager>.
  *
  * *NOTE* Currently, click and drag events conflict, if both are set simultaneously.
  *
  * Parameter:
  *  _events - A {key: flag} hash structure, sets events based on the keys and the flag.
  *
  * Pre-Defined event types (used as the key name):
  *  mouseDown - flag, start listening to mousedown events when the component has focus
  *  mouseUp   - flag, start listening to mouseup events when the component has focus
  *  mouseWheel   - flag, start listening to mousewheel events when the component has focus
  *  draggable - flag, start listening to dragging events when the component has focus
  *  droppable - flag, start listening to dropping events when the component has focus
  *  keyDown - flag, start listening to keydown events when the component has focus
  *  keyUp - flag, start listening to keyup events when the component has focus
  *
  * Pre-defined event handler methods, extend in component code:
  *   focus - Called when the component gets focus
  *   blur - Called when the component loses focus
  *   mouseDown - Called when the mouse button is pushed down
  *   mouseUp - Called when the mouse button is released
  *   mouseWheel - Called when the mouse wheel is used
  *   startDrag - Called when the mouse button is pressed (and item is draggable)
  *   endDrag - Called when the mouse button is released (and item is draggable)
  *   doDrag - Called when the mouse is moved and mouse button is down (and item is draggable)
  *   onDrop - Called when a draggable item is released on the droppable
  *   onHoverStart - Called when a draggable item is moved over the droppable
  *   onHoverEnd - Called when a draggable item is moved out of the droppable
  *   keyDown - Called when the user presses a key, and the control is active
  *   keyUp - Called when the user releases a key, and the control is active
  *   gainedActiveStatus - Called when the component gets activated.
  *   lostActiveStatus - Called when the component gets deactivated.
  *
  * See also:
  *  <HEventManager.focusOptions> <focus> <blur> <mouseDown> <mouseUp> <mouseWheel> <startDrag> <endDrag> <doDrag> <onDrop> <onHoverStart> <onHoverEnd>
  **/
  setEvents: function(_events) {
    if(!this.events) {
      var _eventsClass = HClass.extend({
        mouseDown: false,
        mouseUp:   false,
        draggable: false,
        droppable: false,
        keyDown: false,
        keyUp: false,
        mouseWheel: false
      });
      this.events = new _eventsClass;
    }
    if(_events) {
      this.events.extend( _events );
    }
    this.events.owner = this;
    HEventManager.focusOptions[this.elemId] = this.events;
    
    /// The following boolean must be set:
    this.isDragged = false;
  },

/** method: setMouseDown
  *
  * Alternative flag setter for the <mouseDown> event type. If set to true, 
  * starts listening to <mouseDown> events when the component has <focus>.
  *
  * Parameters:
  *  _flag - Set the <mouseDown> event listening on/off (true/false) for
  *          the component instance.
  *
  * See also:
  *  <mouseDown> <setEvents> <HEventManager>
  **/
  setMouseDown: function(_flag) {
    this.events.mouseDown = _flag;
    this.setEvents();
  },
  
/** method: setMouseUp
  *
  * Alternative flag setter for the <mouseUp> event type. If set to true, 
  * starts listening to <mouseUp> events when the component has <focus>.
  *
  * Parameters:
  *  _flag - Set the <mouseUp> event listening on/off (true/false) for
  *          the component instance.
  *
  * See also:
  *  <mouseUp> <setEvents> <HEventManager>
  **/
  setMouseUp: function(_flag) {
    this.events.mouseUp = _flag;
    this.setEvents();
  },
  
/** method: setMouseWheel
  *
  * Alternative flag setter for the <mouseWheel> event type. If set to true, 
  * starts listening to <mouseWheel> events when the component has <focus>.
  *
  * Parameters:
  *  _flag - Set the <mouseWheel> event listening on/off (true/false) for
  *          the component instance.
  *
  * See also:
  *  <setEvents> <HEventManager>
  **/
  setMouseWheel: function(_flag) {
    this.events.mouseWheel = _flag;
    this.setEvents();
  },
  
/** method: setDraggable
  *
  * Alternative flag setter for the <startDrag>, <onDrag> and <endDrag> event
  * types. If set to true, starts listening to these events when the component
  * has focus.
  *
  * Parameters:
  *  _flag - Set the <startDrag>, <doDrag> and <endDrag> event listening 
  *          on/off (true/false) for the component instance.
  *
  * See also:
  *  <startDrag> <doDrag> <endDrag> <setEvents> <HEventManager>
  **/
  setDraggable: function(_flag) {
    this.events.draggable = _flag;
    this.setEvents();
  },
  
/** method: setDroppable
  *
  * Alternative flag setter for the <onHoverStart>, <onDrop> and <onHoverEnd> event
  * types. If set to true, starts listening to these events when the component
  * has focus.
  *
  * Parameters:
  *  _flag - Set the <onHoverStart>, <onDrop> and <onHoverEnd> event listening 
  *          on/off (true/false) for the component instance.
  *
  * See also:
  *  <onHoverStart> <onDrop> <onHoverEnd> <setEvents> <HEventManager>
  **/
  setDroppable: function(_flag) {
    this.events.droppable = _flag;
    this.setEvents();
  },
  
  
/** method: setKeyDown
  *
  * Alternative flag setter for the <keyDown> event type. If set to true, 
  * starts listening to <keyDown> events when the component is active.
  *
  * Parameters:
  *  _flag - Set the <keyDown> event listening on/off (true/false) for
  *          the component instance.
  *
  * See also:
  *  <keyDown> <setKeyUp> <setEvents> <HEventManager>
  **/
  setKeyDown: function(_flag) {
    this.events.keyDown = _flag;
    this.setEvents();
  },
  
  
/** method: setKeyUp
  *
  * Alternative flag setter for the <keyUp> event type. If set to true, 
  * starts listening to <keyUp> events when the component is active.
  *
  * Parameters:
  *  _flag - Set the <keyUp> event listening on/off (true/false) for
  *          the component instance.
  *
  * See also:
  *  <keyUp> <setKeyDown> <setEvents> <HEventManager>
  **/
  setKeyUp: function(_flag) {
    this.events.keyUp = _flag;
    this.setEvents();
  },
  
  
/** event: focus
  *
  * Implement/extend the focus method, if you want to do something special when
  * the focus is gained.
  *
  * Called when the component gets focus.
  *
  * See also:
  *  <blur> <HEventManager> <setEvents>
  **/
  focus: function() {
   /* Example:
    this.hasFocus = true;
   */
  },
  
/** event: blur
  *
  * Implement/extend the blur method, if you want to do something special when
  * the focus is lost.
  *
  * Called when the component loses focus.
  *
  * See also:
  *  <focus> <HEventManager> <setEvents>
  **/
  blur: function() {
   /* Example:
    this.hasFocus = false;
   */
  },
  
  
/** event: gainedActiveStatus
  *
  * Implement/extend this if you want to do something special when the control gets
  * activated.
  *
  * Parameters:
  *  _lastActiveControl - A reference to the control that was active before this
  *                       control became active. Can be null if there was no
  *                       active control.
  *
  * See also:
  *  <lostActiveStatus> <HEventManager> <setEvents>
  **/
  gainedActiveStatus: function(_lastActiveControl) {
    
  },
  // A low-level handler, don't extend this.
  _gainedActiveStatus: function(_lastActiveControl) {
    if(this.enabled) {
      this.toggleCSSClass(elem_get(this.elemId), HControl.CSS_ACTIVE, true);
    }
    this.gainedActiveStatus(_lastActiveControl);
  },
  
  
/** event: lostActiveStatus
  *
  * Implement/extend this if you want to do something special when the control loses its
  * active status.
  *
  * Parameters:
  *  _newActiveControl - A reference to the control that became the currently
  *                      active control. Can be null if there is no active
  *                      control.
  *
  * See also:
  *  <gainedActiveStatus> <HEventManager> <setEvents>
  **/
  lostActiveStatus: function(_newActiveControl) {
    
  },
  // A low-level handler, don't extend this.
  _lostActiveStatus: function(_newActiveControl) {
    if(this.enabled) {
      this.toggleCSSClass(elem_get(this.elemId), HControl.CSS_ACTIVE, false);
    }
    this.lostActiveStatus(_newActiveControl);
  },
  
  
/** event: mouseDown
  *
  * Implement/extend the mouseDown method, if you want to do something special 
  * when the mouse button is pressed down and the component instance has focus.
  *
  * Parameters:
  *  _x - The horizonal coordinate units (px) of the mouse cursor position.
  *  _y - The vertical coordinate units (px) of the mouse cursor position.
  *  _leftButton - Flag, is false when the right mouse button was pressed. *Do not rely on it*
  *
  * See also:
  *  <setMouseDown> <mouseUp> <HEventManager> <setEvents>
  **/
  mouseDown: function(_x, _y, _leftButton) {
   /* Example:
    this.hasMouseDown = true;
    this.mouseDownCoords  = new HPoint(_x,_y);
   */
  },
  
/** event: mouseUp
  *
  * Implement/extend the mouseUp method, if you want to do something special 
  * when the mouse button is released and the component instance has focus.
  *
  * This is the preferred method to extend when you want click functionality
  * for a component.
  *
  * Parameters:
  *  _x - The horizonal coordinate units (px) of the mouse cursor position.
  *  _y - The vertical coordinate units (px) of the mouse cursor position.
  *  _leftButton - Flag, is false when the right mouse button was pressed. *Do not rely on it*
  *
  * See also:
  *  <setMouseUp> <mouseDown> <HEventManager> <setEvents>
  **/
  mouseUp: function(_x, _y, _leftButton) {
   /* Example:
    this.hasMouseDown = false;
    this.mouseUpCoords  = new HPoint(_x,_y);
   */
  },
  
/** event: mouseWheel
  *
  * Implement/extend the mouseWheel method, if you want to do something special 
  * when the mouse wheel is used and the component instance has focus.
  *
  * Parameters:
  *  _delta - Scrolling delta, the wheel angle change. If delta is positive,
  *   wheel was scrolled up. Otherwise, it was scrolled down.
  *
  * See also:
  *  <setMouseWheel> <HEventManager> <setEvents>
  **/
  mouseWheel: function(_delta) {
   /* Example:
    if (_delta > 0)
      msg = "Moving up!";
    else 
      msg = "Going down...";
   */
  },
  
/** event: startDrag
  *
  * Extend the startDrag method, if you want to do something special 
  * when the user starts a dragging event.
  *
  * This is the preferred method to extend if you want <mouseDown> functionality
  * for a draggable component.
  *
  * Parameters:
  *  x - The horizonal coordinate units (px) of the mouse cursor position.
  *  y - The vertical coordinate units (px) of the mouse cursor position.
  *
  * See also:
  *  <endDrag> <doDrag> <onDrop> <mouseDown> <HEventManager> <setEvents>
  **/
  startDrag: function(x, y) {
    this.isDragged = true; // must be set to work
   /* Example:
    this.originX = x-parseInt(prop_get(this.elemId,'left'));
    this.originY = y-parseInt(prop_get(this.elemId,'top'));
   */
  },
  
/** event: doDrag
  *
  * Extend the doDrag method, if you want to do something special 
  * when the user is performing a dragging event. Called whenever the 
  * mouse cursor moves.
  *
  * Parameters:
  *  x - The horizonal coordinate units (px) of the mouse cursor position.
  *  y - The vertical coordinate units (px) of the mouse cursor position.
  *
  * See also:
  *  <startDrag> <endDrag> <onDrop> <HEventManager> <setEvents>
  **/
  doDrag: function(x, y) {
   /* Example:
    prop_set(this.elemId,'left',(x-this.originX)+'px');
    prop_set(this.elemId,'top',(y-this.originY)+'px');
   */
  },
  
/** event: endDrag
  *
  * Extend the endDrag method, if you want to do something special 
  * when the user ends a dragging event.
  *
  * This is the preferred method to extend if you want <mouseUp> functionality
  * for a draggable component.
  *
  * Parameters:
  *  x - The horizonal coordinate units (px) of the mouse cursor position.
  *  y - The vertical coordinate units (px) of the mouse cursor position.
  *
  * See also:
  *  <startDrag> <doDrag> <onDrop> <mouseUp> <HEventManager> <setEvents>
  **/
  endDrag: function(x, y) {
    this.isDragged = false; // must be un-set to work
    this.invalidatePositionCache();
   /* Example:
   */
  },

/** event: onDrop
  *
  * Extend the onDrop method, if you want to do something special 
  * when the user is performing a drop event. Called when a dragged component instance
  * is dropped on another component instance.
  *
  * Parameter:
  *  obj - The dragged component object.
  *
  * See also:
  *  <onHoverStart> <onHoverEnd> <endDrag> <HEventManager> <setEvents>
  **/
  onDrop: function(obj) {
    
  },

/** event: onHoverStart
  *
  * Extend the onHoverStart method, if you want to do something special 
  * when a dragged component instance is dragged over a droppable component instance.
  *
  * Parameter:
  *  obj - The dragged component object.
  *
  * See also:
  *  <onDrop> <onHoverEnd> <doDrag> <HEventManager> <setEvents>
  **/
  onHoverStart: function(obj) {
    
  },
  
  
/** event: onHoverEnd
  *
  * Extend the onHoverEnd method, if you want to do something special 
  * when a dragged component instance is dragged from a droppable component instance.
  *
  * Parameter:
  *  obj - The dragged component object.
  *
  * See also:
  *  <onDrop> <onHoverStart> <doDrag> <HEventManager> <setEvents>
  **/
  onHoverEnd: function(obj) {
    
  },
  
  
/** event: keyDown
  *
  * Implement/extend the keyDown method, if you want to do something special 
  * when a key is pressed down and the component is active.
  *
  * Parameters:
  *  _keycode - The keycode of the key that was pressed down.
  *
  * See also:
  *  <setKeyDown> <keyUp> <HEventManager> <setEvents>
  **/
  keyDown: function(_keycode) {
    
  },
  
  
/** event: keyUp
  *
  * Implement/extend the keyUp method, if you want to do something special 
  * when a key is released and the component is active.
  *
  * Parameters:
  *  _keycode - The keycode of the key that was released.
  *
  * See also:
  *  <setKeyUp> <keyDown> <HEventManager> <setEvents>
  **/
  keyUp: function(_keycode) {
    
  },
  
  
  /***** DON'T TOUCH _mouseOver, IT IS A LOW-LEVEL HANDLER, use focus() instead *****/
  _mouseOver: function(e) {
    if (!Event.element) {
      return;
    }
    var _that = Event.element(e);
    while(_that && _that.owner === undefined) {
      _that = _that.parentNode;
    }
    if (!_that) {
      return;
    }
    var _this = _that.owner;

    HEventManager.focus(_this);
    Event.stop(e);
  },
  
  /***** DON'T TOUCH _mouseOut, IT IS A LOW-LEVEL HANDLER, use blur() instead *****/
  _mouseOut: function(e) {
    if (!Event.element) {
      return;
    }
    var _that = Event.element(e);
    while(_that && _that.owner === undefined) {
      _that = _that.parentNode;
    }
    if (!_that) {
      return;
    }
    var _this = _that.owner;
    
    HEventManager.blur(_this);
    Event.stop(e);
  },
  
  
/** method: invalidatePositionCache
  *
  * Forces retrieving this control's DOM element position directly rather than
  * using the cached version when the position is needed by the <HEventManager>.
  * Child controls are invalidated recursively by <HView>.
  *
  * See also:
  *   <HEventManager.invalidatePositionCache>
  * 
  **/
  invalidatePositionCache: function() {
    this.base();
    HEventManager.invalidatePositionCache(this.elemId);
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
  
  H_CONTROL_ON: 1,
  H_CONTROL_OFF: 0,
  
  // CSS class names for different statuses.
  CSS_DISABLED: "disabled",
  CSS_ENABLED:  "enabled",
  CSS_ACTIVE:   "active"
  
});

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
    this.type = '[HDummyValue]';
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


/** class: HComponentDefaults
  *
  * Define default setting here. Will be used, when no or invalid constructor options are supplied.
  *
  * vars: Settable Control-level defaults, override on construction
  *  label - The visual value of the component
  **/
HComponentDefaults = HClass.extend({
  
  // The visual value of a component:
  label:    "Untitled",
  
  // A structure that tells what events to bind.
  /*
  
  valid sample (the default): {
    mouseDown:  false,
    mouseUp:    false,
    draggable:  false,
    droppable:  false,
    keyDown:    false,
    keyUp:      false,
    mouseWheel: false
  }
  
  */
  // See <HControl.setEvents>.
  events:   {},
  
  // The default value. See <HControl.setValue>
  value:    0,
  
  // The default action, See <HControl.setAction>
  action:   function(){},
  
  // The enabled/disabled flag. See <HControl.setEnabled>
  enabled:  true,
  active:   false,
  
  // Value Range -related
  minValue: -2147483648, // signed 32bit
  maxValue:  2147483648 // signed 32bit
  
});

/*** class: HRectValue
  **
  ** This is a special type of HValue. It works as a syncronized HRect class and can be used for automatic value syncronization between components.
  **
  ** vars: Instance variables
  **  id - Value Id, used by the whole value management system to identify individual values.
  **  type - '[HValue]'
  **  value - The container/"payload" data value itself.
  **  views - A list of Components that uses this value. 
  **          Used for automatic value syncronization between components.
  **
  ** Usage example:
  **  > var myApp = new HApplication(100);
  **  > var mySlider = new HSlider(new HRect(100,100,300,118),myApp,1.0,0.0,200.0);
  **  > mySlider.draw();
  **  > var myValue = new HValue(123,100.0);
  **  > myValue.bind(mySlider);
  **
  ** See also:
  **  <HValueManager> <HControl>
  ***/


HRectValue = HRect.extend({
/** constructor: constructor
  *
  * Parameters:
  *   _id - The source id (ideally set by server, should be unique)
  *   _value - The initial data 
  **/
  constructor: function(){
    this.type  = '[HRectValue]';
    var _id, _value; // Let's guess these later..
    var _args=arguments;
    
    if (_args.length === 0) {
      throw "Invalid number of arguments. HRectValue works as HRect, but needs an id as the first argument.";
    } else if (_args.length == 1) {
      _id = _args[0];
      this._constructorDefault();
    } else if (_args.length == 5) {
      _id = _args[0];
      this._constructorSides(_args[1],_args[2],_args[3],_args[4]);
    }
    else if (_args.length == 3) {
      _id = _args[0];
      this._constructorPoint(_args[1],_args[2]);
    }
    else if (_args.length == 2) {
      _id = _args[0];
      if((_args[1] instanceof HRect) || (args[1] instanceof HRectValue)){
        this._constructorRect(_args[1]);
      } else if (_args[1] instanceof Array){
        this._constructorArray(_args[1]);
      } else {
        throw "Invalid argument. Expected Array or Rect.";
      }
    }
    else {
      throw "Invalid number of arguments.";
    }
    _value = [this.left,this.top,this.right,this.bottom];
    
    this.id    = _id;
    this.value = _value;
    this.views = [];
    
    this.updateSecondaryValues();
    
    HValueManager.add(_id,this);
  },
  
  updateSecondaryValues: function(){
    this.base();
    if(this._checkChange()){
      this.value[0] = this.left;
      this.value[1] = this.top;
      this.value[2] = this.right;
      this.value[3] = this.bottom;
      this.refresh();
    }
  },
  
  _constructorArray: function(_arr) {
    this.left = _arr[0];
    this.top = _arr[1];
    this.right = _arr[2];
    this.bottom = _arr[3];
  },
  
  _checkChange: function(){
    if( (this.left != this.value[0]) || (this.top  != this.value[1]) || 
        (this.right != this.value[2]) || (this.bottom != this.value[3]) ){
      HValueManager.changed(this);
      this.refresh();
      return true;
    }
    return false;
  },
  
/** method: set
  * 
  * Replaces the data of the value. Extend this, if you need validation etc.
  *
  * Parameters:
  *  _value - The new data to replace the old data with.
  *
  * See also:
  *  <HRect.set> <HValue.set> <HView.setRect> <HValueManager.set>
  **/
  set: function(){
    var _args = arguments;
    if(_args.length == 1) {
      
      if((_args[0] instanceof HRect) || (_args[0] instanceof HRectValue)) {
        this._constructorRect(_args[0]);
      } else if (_args[0] instanceof Array) {
        this._constructorArray(_args[0]);
      }
      
    } else {
      this.base.apply(this, _args);
    }
    this._checkChange();
  },
  
/** method: get
  *
  * Return the data, synonymous to the <value> instance variable
  *
  * Returns:
  *  The value instance variable (the data "payload")
  *
  * See also:
  *  <HValue.value>
  **/
  get: function(){
    return this.value;
  },
  
/** method: bind
  *
  * Bind a component to the value, use to attach HRectValues to components derived from HView.
  *
  * Parameters:
  *  _viewObj - Any component that is derived from HControl *or* any class 
  *             that responds to setValueObj and setValue methods.
  *
  * See also:
  *  <unbind> <HControl.setValueObj>
  *
  **/
  bind: function(_viewObj){
    if(this.views.indexOf(_viewObj.elemId)==-1){
      this.views.push(_viewObj);
      if(_viewObj.rect !== this){
        _viewObj.setRect( this );
      }
    }
  },
  
/** method: unbind
  *
  * Detach a component bound to this value.
  *
  * Parameters:
  *  _viewObj - Any component that is derived from HControl *or* any class 
  *             that responds to setValueObj and setValue methods.
  *
  * See also:
  *  <bind>
  *
  **/
  unbind: function(_viewObj){
    for(var _viewNum=0;_viewNum<this.views.length;_viewNum++){
      var _tryObj = this.views[_viewNum];
      if(_tryObj===_viewObj){
        this.views.splice(_viewNum);
        return;
      }
    }
  },
  
/** method: refresh
  *
  * Calls the setValue method all components bound to this HValue.
  *
  * See also:
  *  <HControl.drawRect>
  **/
  refresh: function(){
    for(var _viewNum=0;_viewNum<this.views.length;_viewNum++){
      var _viewObj = this.views[_viewNum];
      _viewObj.drawRect();
    }
  },
  
  
/** method: toXML
  *
  * Responsible for generating the xml representation of the value object.
  *
  * Parameter:
  *  _i - The sequence number of the item, generated by HValueManager.
  *
  * Returns:
  *  A XML string with meta-info about the object
  *
  * See Also:
  *  <HValueManager.toXML>
  *
  * Sample output:
  * > <rect id="1000" order="34"><left>100</left><top>100</top><right>740</right><bottom>580</bottom></rect>
  **/
  toXML: function(_i){
    return '<rect id="'+this.id+'" order="'+_i+'"><left>'+this.left+'</left><top>'+this.top+'</top><right>'+this.right+'</right><bottom>'+this.bottom+'</bottom></rect>';
  }
  
});


ie_namespace = {};
function $(_element) {
  if (typeof _element == 'string') _element = document.getElementById(_element);
  return _element;
}

helmi = {};
/*!
@function extend
@description Copies properties of object to another object
*/
Object.extend = function(destination, source) {
  for (property in source) {
    destination[property] = source[property];
  }
  return destination;
}
/*!
@function UserAgent
@description Tells what the browser is.
*/
helmi.UserAgent = function() {
  var b = navigator.appName;
  var v = navigator.appVersion;
  var ua = navigator.userAgent.toLowerCase();
  this.safari = ua.indexOf("safari") > -1;
  this.opera = ua.indexOf("opera") > -1;
  this.ns = !this.opera && !this.safari && (b == "Netscape");
  this.ie = !this.opera && (b == "Microsoft Internet Explorer");
  this.gecko = !this.safari && ua.indexOf("gecko") > -1;
  if (this.ns) {
    this.ns4 = (this.v == 4);
    this.v = parseInt(ua.substr(ua.indexOf("netscape") + 9, 1), 10);
    this.ns6 = (this.v == 6);
    this.ns7 = (this.v == 7);
  } else if(this.ie) {
    this.ie4 = (v.indexOf("MSIE 4") > 0);
    this.ie5 = (v.indexOf("MSIE 5") > 0);
    this.ie55 = (v.indexOf("MSIE 5.5") > 0);
    this.ie6 = (v.indexOf("MSIE 6") > 0);
    this.ie7 = (v.indexOf("MSIE 7") > 0);
  } else if(this.opera) {
    this.v = parseInt(ua.substr(ua.indexOf("opera") + 6, 1), 10);
    this.opera6 = (this.v == 6);
    this.opera7 = (this.v == 7);
    this.opera8 = (this.v == 8);
    this.opera9 = (this.v == 9);
  }
  this.win = ua.indexOf("win") > -1;
  this.mac = ua.indexOf("mac") > -1;
  
}
is = new helmi.UserAgent();


/*!
@function Element
@description Element includes browser element releated methods.
*/
helmi.Element = Base.extend({
  constructor: null,
  /*!
  @function getPageLocation
  @description Return element's border left top location relative to document area's
  left top location. Body and Html element returns always 0,0.
  */
  
  //TODO Check relative element inside scrolls
  
  // Safari's offsetLeft and offsetTop includes border.
  // Absolute and fixed positioned elements already include border
  // so we down't count it again in body element
  
  // Operas 9 's offsetLeft and offsetTop includes border
  // Body element returns wrong location
  // Opera 8
  // Form element's locations is counted from element's border to document body's border 
  
  getPageLocation: function(_element, _scroll) {
    var _pageX = 0, _pageY = 0;
    var _offsetParent;
    var _orig = _element;
    if (is.opera) {
      if (is.opera9) {
        do {
          _offsetParent = _element.offsetParent;
          _pageX += _element.offsetLeft;
          _pageY += _element.offsetTop;
          _element = _offsetParent;
        } while(_element);
      } else {
        if (_element.tagName.toLowerCase() == "body") {
          return [0, 0];
        }
        var _previous;
        do {
          _offsetParent = _element.offsetParent;
          if(_element.tagName.toLowerCase() == "body" &&
             _previous &&
             (_previous.style.position == "absolute" ||
              _previous.style.position == "relative" ||
              _previous.style.position == "fixed")) {
          } else {
            _pageX += _element.offsetLeft;
            _pageY += _element.offsetTop;
          }
          if (_offsetParent &&
              _offsetParent.tagName.toLowerCase() == "body" &&
              (_element.style.position == "absolute" ||
               _element.style.position == "relative" ||
               _element.style.position == "fixed" ||
               _element.tagName.toLowerCase() == "input" ||
               _element.tagName.toLowerCase() == "button" ||
               _element.tagName.toLowerCase() == "select" ||
               _element.tagName.toLowerCase() == "textarea")) {
          } else if (_offsetParent) {
            _pageX += _offsetParent.clientLeft;
            _pageY += _offsetParent.clientTop;
          }
          _previous = _element;
          _element = _offsetParent;
        } while(_element);
      }
    } else if (is.safari) {
      if (_element.tagName.toLowerCase() == "body") {
        return [0, 0];
      }
      var _previous;
      do {
        _offsetParent = _element.offsetParent;
        // We should have previous variable, because that way we can count also body location
        if(_element.tagName.toLowerCase() == "body" &&
           _previous &&
           (_previous.style.position == "absolute" ||
            _previous.style.position == "fixed")) {
        } else {
          _pageX += _element.offsetLeft;
          _pageY += _element.offsetTop;
        }
        _previous = _element;
        _element = _offsetParent;
      } while(_element);
    } else if (is.ns) {
      // Firefox doesn't count offsets right if container element has scrolls
      if (_scroll) {
        var _elementList = [];
        var x = _element.offsetLeft;
        var y = _element.offsetTop;
        var _element2 = null;
        do {
          _offsetParent = _element.offsetParent;
          if (_element == _orig &&
              _element.style.position != "absolute") {
            if (_offsetParent &&
                (_offsetParent.style.overflow == "scroll" ||
                 _offsetParent.style.overflow == "auto")) {
              _element2 = _offsetParent;
            }
          }
          if (_element.style.overflow == "scroll" ||
              _element.style.overflow == "auto") {
            _elementList.push([_element,_element.style.overflow,_element.scrollLeft,_element.scrollTop]);
            _element.style.overflow = "inherit";
          }
          _element = _offsetParent;
        } while(_element);
      }
      _element = _orig;
      do {
        _offsetParent = _element.offsetParent;
        if(_element.tagName.toLowerCase() == "body") {
        } else {
          if (_element == _orig &&
              _element.style.position != "absolute") {
            _pageX += x;
            _pageY += y;
          } else {
            _pageX += _element.offsetLeft;
            _pageY += _element.offsetTop;
          }
        }
        if (_offsetParent &&
            _offsetParent.tagName.toLowerCase() == "body" &&
            (_element.style.position == "absolute" ||
             _element.style.position == "fixed")) {
        } else if (_offsetParent) {
          _pageX += (_offsetParent.offsetWidth - _offsetParent.clientWidth) / 2;
          _pageY += (_offsetParent.offsetHeight - _offsetParent.clientHeight) / 2;
          if (_offsetParent == _element2) {
            _pageX += (_offsetParent.offsetWidth - _offsetParent.clientWidth) / 2;
            _pageY += (_offsetParent.offsetHeight - _offsetParent.clientHeight) / 2;    
          }
        }
        _element = _offsetParent;
      } while(_element);
      // Restore scrolls
      if (_scroll) {
        var l = _elementList.length;
        for (var i = 0; i < l; i++) {
          _elementList[i][0].style.overflow = _elementList[i][1];
          _elementList[i][0].scrollLeft = _elementList[i][2];
          _elementList[i][0].scrollTop = _elementList[i][3];
        }
      }
    } else if (is.ie) {
      if (_element.tagName.toLowerCase() == "body") {
        return [0, 0];
      }
      do {
        _offsetParent = _element.offsetParent;
        _pageX += _element.offsetLeft;
        _pageY += _element.offsetTop;
        if (_offsetParent &&
            _offsetParent.tagName.toLowerCase() == "html" &&
            _element.style.position == "relative") {
          _pageX -= 2;
          _pageY -= 2;
        }
        if(_offsetParent &&
           _offsetParent.tagName.toLowerCase() == "html" &&
           _element.style.position == "absolute") {
        } else if (_offsetParent) {
          _pageX += _offsetParent.clientLeft;
          _pageY += _offsetParent.clientTop;
        }
        _element = _offsetParent;
      } while(_element);
      
    }
    if (_scroll) {
      _element = _orig;
      do {
        if (!_element.tagName || _element.tagName.toLowerCase() == "body") {
          break;
        }
        if(_element.style.position == "fixed") {
          _pageX += window.pageXOffset || document.documentElement.scrollLeft;
          _pageY += window.pageYOffset || document.documentElement.scrollTop;
        }
        _offsetParent = _element.parentNode;
        if (_element != _orig) {
          if (is.opera && _element.tagName.toLowerCase() == "tr") {
            
          } else {
            _pageX -= _element.scrollLeft;
            _pageY -= _element.scrollTop;
          }
        }
        _element = _offsetParent;
      } while(_element);
    }
    return [_pageX, _pageY];
  },
  /*!
  @function getSize
  @description Returns element's size including border, padding and element's content size.
  */
  getSize: function(_element) {
    return [_element.offsetWidth, _element.offsetHeight];
  },
  /*!
  @function getVisibleWidth
  @description Returns element's size from the part that is not hidden by its parent elements with overflow property.
    TODO: There are some issues with relative positioning and paddings.
  */
  getVisibleSize: function(_element) {

    var w = _element.offsetWidth;
    var h = _element.offsetHeight;
    var _parent = _element.parentNode;
    while(_parent && _parent.nodeName.toLowerCase() != 'body') {
      
      var _parentOverflow;
      if(!is.ie) {
         _parentOverflow = document.defaultView.getComputedStyle(
          _parent,null).getPropertyValue('overflow');
      } else {
        _parentOverflow = _parent.currentStyle.getAttribute('overflow');
      }
      // To boolean:
      _parentOverflow = _parentOverflow != 'visible';
      
      if (w > _parent.clientWidth && _parentOverflow) {
        w = _parent.clientWidth - _element.offsetLeft;
      }
      if (h > _parent.clientHeight && _parentOverflow) {
        h = _parent.clientHeight - _element.offsetTop;
      }
      
      _element = _element.parentNode;
      _parent = _element.parentNode;
    }
    
    return [w, h];
  },
  /*!
  @function getVisiblePageLocation
  @description Works just like getPageLocation, but takes the element's parent's overflow property into consideration.
    TODO: There are some issues with relative positioning and paddings.
  */
  getVisiblePageLocation: function(_element, _scroll) {
    
    var _position = this.getPageLocation(_element, _scroll);
    var x = _position[0];
    var y = _position[1];
    
    var _parent = _element.parentNode;
    while(_parent && _parent.nodeName.toLowerCase() != 'body') {
      
      var _parentOverflow;
      if(!is.ie) {
         _parentOverflow = document.defaultView.getComputedStyle(
          _parent,null).getPropertyValue('overflow');
      } else {
        _parentOverflow = _parent.currentStyle.getAttribute('overflow');
      }
      // To boolean:
      _parentOverflow = _parentOverflow != 'visible';
      
      _position = this.getPageLocation(_parent, _scroll);
      
      if (x < _position[0] && _parentOverflow) {
        x = _position[0];
      }
      if (y < _position[1] && _parentOverflow) {
        y = _position[1];
      }
      
      _element = _element.parentNode;
      _parent = _element.parentNode;
    }
    
    return [x, y];
  },
  
  
  // class name functions mostly ripped from moo.fx's prototype.lite.js
  hasClassName: function(_element, _className) {
    _element = $(_element);
    if (!_element) return;
    
    var _hasClass = false;
    var _classNames = _element.className.split(' ');
    
    for(var i = 0; i < _classNames.length; i++) {
      if (_classNames[i] == _className) {
        _hasClass = true;
      }
    }
    
    return _hasClass;
  },

  addClassName: function(_element, _className) {
    _element = $(_element);
    if (!_element) return;
    
    helmi.Element.removeClassName(_element, _className);
    _element.className += ' ' + _className;
  },
  
  removeClassName: function(_element, _className) {
    _element = $(_element);
    if (!_element) return;
    
    var _newClassName = '';
    var _classNames = _element.className.split(' ');
    
    for(var i = 0; i < _classNames.length; i++) {
      if (_classNames[i] != _className){
        if (i > 0) _newClassName += ' ';
        _newClassName += _classNames[i];
      }
    }
    
    _element.className = _newClassName;
  }
  
  
});


/*!
@function Array
@description Extends Array with useful methods.
*/
Object.extend(Array.prototype, {
  /*!
  @function indexOfObject
  @description Searches all objects in the receiver for anObject and returns the lowest index whose corresponding array value is equal to anObject.
   
  Objects are considered equal if == returns true. If none of the specified objects is equal to anObject, returns -1.
  */
  indexOfObject: function(_anObject) {
    var i = 0, l = this.length;
    for (; i < l; i++) {
      if (this[i] == _anObject) {
        return i;
      }
    }
    return -1;
  },
  /*!
  @function indexOfObject
  @description Returns true if anObject is present in the array.
  */
  containsObject: function(_anObject) {
    return this.indexOfObject(_anObject) != -1;
  },
  /*!
  @function removeObject
  @description Removes all occurrences of anObject throughout the receiver.
  */
  removeObject: function(_anObject) {
    while((i = this.indexOfObject(object)) >= 0) {
      this.splice(i, 1);
    }
  },
  
  first: function() {
    return this[0];
  },

  last: function() {
    return this[this.length - 1];
  }

});

// Adds the indexOf method to Array for all browsers except recent mozillas.
if (!is.ns7) {
  Object.extend(Array.prototype, {
    indexOf: Array.prototype.indexOfObject
  });
}

/*!
@function Window
@description Window includes browser window releated methods.
*/

helmi.Window = Base.extend({
  constructor: null,
  /*!
  @function getInnerWidth
  @description Returns document area's width.
  */
  getInnerWidth: function() {
    // ? Safari, Opera and Firefox
    // : ie6 and ie7
    return (window.innerWidth) ? window.innerWidth : document.documentElement.clientWidth;
  },
  /*!
  @function getInnerHeight
  @description Returns document area's height.
  */
  getInnerHeight: function() {
    // ? Safari, Opera and Firefox
    // : ie6 and ie7
    return (window.innerHeight) ? window.innerHeight : document.documentElement.clientHeight;
  }
});


/*!
@function Event
@description Event includes browser event releated methods.
*/
helmi.Event = Base.extend({
  constructor: null,
  /*!
  @function getPageX 
  @description Returns event left location relative to document frame's left top location.
  */
  getPageX: function(e) {
    return e.pageX || e.clientX + document.documentElement.scrollLeft;
  },
  /*!
  @function getPageY
  @description Returns event top location relative to document frame's left top location.
  */
  getPageY: function(e) {
    return e.pageY || e.clientY + document.documentElement.scrollTop;
  },
  /*!
  @function getKeyCode 
  @description 
  Use when you have keydown or keyup listener
  */
  getKeyCode: function(e) {
    return e.keyCode;
  },
  /*!
  @function getCharCode
  @description 
  Use when you have keypress or keyup listener
  */
  getCharCode: function(e) {
    if (is.ns) {
      return e.charCode;
    } else {
      return e.keyCode;
    }
  }
});

/** class: HPath
*
* HPath
*
**/
HPath = HClass.extend({
  constructor: null,
  /** method: getRelativePath
  *
  * The _docURL is the url to source file relative to the document. The _includeDocURL is the url in the source file.
  * Sets the url of the _includeDocURL relative to to the document without the filename.
  *
  * Parameters:
  *   _docURL - The url of the _includeDocURL is made relative to the _docURL url.
  *   _includeDocURL - The url that is returned relative to the url of the _docURL.
  *   
  * Returns:
  *   Return the url of the _includeDocURL relative to the url of the _docURL without the filename.
  *
  * Example:
  *
  * > HPath.getRelativePath("company/images/ui/","../image1.png")
  * > // returns 'company/images/'
  * >
  * > HPath.getRelativePath("company/images/ui/","../../../image1.png")
  * > // returns ''
  * >
  * > HPath.getRelativePath("company/images/ui/","../../../../image1.png")
  * > // returns '../'
  * >
  * > HPath.getRelativePath("company/images/ui/","windowbar/image1.png")
  * > // returns 'company/images/ui/windowbar/'
  * >
  * > HPath.getRelativePath("/company/images/ui/","windowbar/image1.png")
  * > // returns '/company/images/ui/windowbar/'
  * >
  * > // two extra '../':s
  * > HPath.getRelativePath("/company/images/ui/","../../../../../windowbar/image1.png")
  * > // returns '/windowbar/'
  *
  **/
  getRelativePath: function(_docURL, _includeDocURL) {
    var _docURL = this.getRelativeFilePath(_docURL, _includeDocURL);
    return _docURL.slice(0, _docURL.lastIndexOf("/") + 1);
  },
  /** method: getRelativeFilePath
  *
  * The _docURL is the url to source file relative to the document. The _includeDocURL is the url in the source file.
  * Sets the url of the _includeDocURL relative to to the document including the filename.
  *
  * Parameters:
  *   _docURL - The url of the _includeDocURL is made relative to the _docURL url.
  *   _includeDocURL - The url that is returned relative to the url of the _docURL.
  *   
  * Returns:
  *   Return the url of the _includeDocURL relative to the url of the _docURL including the filename.
  *
  * Example:
  *
  * > HPath.getRelativeFilePath("company/images/ui/","../image1.png")
  * > // returns 'company/images/image1.png'
  * >
  * > HPath.getRelativeFilePath("company/images/ui/","../../../image1.png")
  * > // returns 'image1.png'
  * >
  * > HPath.getRelativeFilePath("company/images/ui/","../../../../image1.png")
  * > // returns '../image1.png'
  * >
  * > HPath.getRelativeFilePath("company/images/ui/","windowbar/image1.png")
  * > // returns 'company/images/ui/windowbar/image1.png'
  * >
  * > HPath.getRelativeFilePath("/company/images/ui/","windowbar/image1.png")
  * > // returns '/company/images/ui/windowbar/image1.png'
  * >
  * > // two extra '../':s
  * > HPath.getRelativeFilePath("/company/images/ui/","../../../../../windowbar/image1.png")
  * > // returns '/windowbar/image1.png'
  *
  **/
  getRelativeFilePath: function(_docURL, _includeDocURL) {
    _docURL = _docURL || "";
    // if path is absolute to domain
    // returns _includeDocURL itself
    if (_includeDocURL.charAt(0) == "/") {
      return _includeDocURL;
    }
    // _docURL can include file name too in the path
    var _docURL = _docURL.substring(0,_docURL.lastIndexOf("/")+1);
    var _dotDotSlash = _includeDocURL.indexOf("../");
    var _startIndex = _docURL.length;
    var _endIndex;
    while (_dotDotSlash == 0) {
      if ((_endIndex = _docURL.lastIndexOf("/",_startIndex)) != -1) {
        _startIndex = _docURL.lastIndexOf("/",_endIndex-1);
        _docURL = _docURL.substring(0,_startIndex+1);
      } else {
        break;
      }        
      _includeDocURL = _includeDocURL.substring(3);
      _dotDotSlash = _includeDocURL.indexOf("../");
    }
    return _docURL + _includeDocURL;
  }
});


/** method: _styleSheetLoaded
  *
  * Called whenever the StyleSheet is loaded (style or link tag). Applies the opacity, right and bottom behaviour and the png image
  * transparency. The opacity needs the width or the height to be defined.
  *
 * Example 1:
  *
  * > // partial document:
  * > // StyleSheet
  * > <style type="text/css">
  * > .test0 {
  * >   width: 10px;
  * >   opacity: 0.9;
  * >   background-color: #FFFF00;
  * > }
  * > </style>
  * > // Script
  * > <script type="text/javascript">
  * > function test() {
  * >   document.styleSheets[0].rules[0].style.opacity = "0.1";
  * >   stylesheet_refresh(document.styleSheets[0]);
  * > }
  * > window.onload = test;
  * > </script>
  * > // Body
  * > <body>
  * > <div id="div0" class="test0"></div>
  * > </body>
  *
  * Example 2:
  *
  * > // partial document:
  * > // StyleSheet
  * > <style type="text/css">
  * > .test0 {
  * >   position: absolute;
  * >   left: 10px;
  * >   top: 10px;
  * >   right: 10px;
  * >   bottom: 10px;
  * >   background-color: #FFFF00;
  * > }
  * > </style>
  * > // Script
  * > <script type="text/javascript">
  * > function test() {
  * >   document.styleSheets[0].rules[0].style.right = "50px";
  * >   stylesheet_refresh(document.styleSheets[0]);
  * > }
  * > window.onload = test;
  * > </script>
  * > // Body
  * > <body>
  * > <div id="div0" class="test0"></div>
  * > </body>
  *
  * Example 3:
  *
  * > // partial document:
  * > // StyleSheet
  * > <style type="text/css">
  * > .test0 {
  * >   position: absolute;
  * >   left: 10px;
  * >   top: 10px;
  * >   right: 10px;
  * >   bottom: 10px;
  * >   background-color: #FFFF00;
  * > }
  * > </style>
  * > // Script
  * > <script type="text/javascript">
  * > function test() {
  * >   document.styleSheets[0].cssText += "#div0 { right: 50px }";
  * > }
  * > window.onload = test;
  * > </script>
  * > // Body
  * > <body>
  * > <div id="div0" class="test0"></div>
  * > </body>
  *
  * Example 4:
  *
  * > // partial document:
  * > // StyleSheet
  * > <style type="text/css">
  * > .test0 {
  * >   position: absolute;
  * >   left: 10px;
  * >   top: 10px;
  * >   right: 10px;
  * >   bottom: 10px;
  * >   background-color: #FFFF00;
  * > }
  * > </style>
  * > // Script
  * > <script type="text/javascript">
  * > function test() {
  * >   var _styleSheet = document.createStyleSheet();
  * >   _styleSheet.cssText = "#div0 { right: 50px }";
  * > }
  * > window.onload = test;
  * > </script>
  * > // Body
  * > <body>
  * > <div id="div0" class="test0"></div>
  * > </body>
  *
  * Example 5:
  *
  * > // styleSheet
  * > <style type="text/css">
  * > .test0 {
  * >   position: absolute;
  * >   left: 10px;
  * >   top: 10px;
  * >   right: 10px;
  * >   bottom: 10px;
  * >   background-color: #FFFF00;
  * > }
  * > </style>
  * > //
  * > <script type="text/javascript">
  * > function test() {
  * >   var _link = document.createElement("link");
  * >   var _head = document.getElementsByTagName("head")[0];
  * >   _head.appendChild(_link);
  * >   _link.type = "text/css";
  * >   _link.rel = "Stylesheet";
  * >   _link.href = "css/testi2.css";
  * > }
  * > window.onload = test;
  * > </script>
  * >
  * > <body>
  * > <div id="div0" class="test0"></div>
  * > </body>
  *
  * // css/testi2.css:
  * > .test0 {
  * >   position: absolute;
  * >   left: 1px;
  * >   top: 1px;
  * >   right: 1px;
  * >   bottom: 1px;
  * >   background-color: #FFFF00;
  * > }
  *
  * Example 6:
  *
  * > // partial document:
  * > // StyleSheet
  * > <style type="text/css">
  * > .test0 {
  * >   position: absolute;
  * >   left: 10px;
  * >   top: 10px;
  * >   right: 10px;
  * >   bottom: 10px;
  * >   background-color: #FFFF00;
  * > }
  * > </style>
  * > <link REL=stylesheet type"text/css" href="css/testi2.css" />
  * > // Script
  * > <script type="text/javascript">
  * > function test() {
  * >   var _link = document.getElementsByTagName("link")[0];
  * >   _link.disabled = true;
  * > }
  * > window.onload = test;
  * > </script>
  * > // Body
  * > <body>
  * > <div id="div0" class="test0"></div>
  * > </body>
  *
  * // File source: css/testi2.css
  * > .test0 {
  * >   position: absolute;
  * >   left: 1px;
  * >   top: 1px;
  * >   right: 1px;
  * >   bottom: 1px;
  * >   background-color: #FFFF00;
  * > }
  *
  **/
// link and style tag
ie_namespace.iestyleSheetLoaded = function() {
//function iestyleSheetLoaded() {
  if (document.readyState == "complete" &&
  window.event.srcElement.readyState == "complete") {
  _traverseTree();
  }
}
/** method: stylesheet_refresh
  *
  * Forces the recalculation of the fixes of the Stylesheet.
  *
  * Parameters:
  *   _styleSheet - The Stylesheet for which the fixes are recalculated.
  *
  **/
stylesheet_refresh = function(_styleSheet) {
  _styleSheet.cssText += "";
}
/** method: _traverseTree
  *
  * Called when the document or the StyleSheet is loaded and when parameter of the StyleSheet or the property of the element node
  * changes. Recalculates the fixes for the _element and for its child element nodes.
  *
  * Parameters:
  *   _element - The element for which the fixes are recalculated.
  *
  **/
_traverseTree = function(_element) {
  var _element = _element || document.documentElement;
  while (_element) {
    if (_element.nodeType == 1) {
      HStyle._inlineStyleChanged(_element);
    }
    var _next = _element.firstChild;
    if (!_next) {
      _next = _element.nextSibling;
    }
    while (!_next && _element.parentNode) {
      _element = _element.parentNode;
      _next = _element.nextSibling;
    }
    _element = _next;
  }
}

/** method: _inlineStyleChanged
  *
  * Called when the property of the element node changes.
  * Recalculates the fixes for the _element and for its child element nodes.
  *
  **/
ie_namespace.ieinlineStyleChanged = function() {
//function ieinlineStyleChanged() {
  var _element = window.event.srcElement;
  if (window.event.propertyName == "style.opacity") {
  HOpacityFix._fixOpacity(_element);
  }
  else if (window.event.propertyName == "src" &&
    _element.tagName == "IMG" || (_element.tagName == "INPUT" && _element.type == "image")) {
  HOpacityFix._fixImg(_element);
  }
}

HStyle = HClass.extend({
  constructor: null,
  init: function() {
    this._AUTO = /^(auto|0cm)$/;
  },
  /** method: _inlineStyleChanged
    *
    * Called by the _traverseTree function when the document or the StyleSheet is loaded and when parameter of the StyleSheet or the property of the element node
    * changes. Recalculates the fixes for the _element and for its child element nodes.
    *
    * Parameters:
    *   _element - The element for which the fixes are recalculated.
    *
    **/
  _inlineStyleChanged: function(_element) {
  var _currentStyle = _element.currentStyle;
    // right
  if ((_currentStyle.position == "absolute" || _currentStyle.position == "fixed") &&
    _currentStyle.left != "auto" &&
    _currentStyle.right != "auto" &&
    _currentStyle.width == "auto") {
      HRighBottoFix._resizeRight(_element);
    //window.attachEvent("onresize",function() {HRighBottoFix._resizeRight(_element)})
    }/* else if (_element && _element.currentStyle && _element.currentStyle._width) {
    delete  _element.runtimeStyle._width
  }*/
  // bottom
  if ((_currentStyle.position == "absolute" || _currentStyle.position == "fixed") &&
    _currentStyle.top != "auto" &&
    _currentStyle.bottom != "auto" &&
    _currentStyle.height == "auto") {
      HRighBottoFix._resizeBottom(_element);
    //window.attachEvent("onresize",function() {HRighBottoFix._resizeBottom(_element)})
    }/* else if (_element && _element.currentStyle && _element.currentStyle._height) {
    delete  _element.runtimeStyle._height;
  }*/
  // opacity
  if (_element.currentStyle.opacity) {
    HOpacityFix._fixOpacity(_element);
  }
  // background-image png transparency
  if (_element.currentStyle.backgroundImage) {
    HOpacityFix._fixBackgroundImage(_element);
  }
  if (_element.tagName == "IMG" || (_element.tagName == "INPUT" && _element.type == "image")) {
    HOpacityFix._fixImg(_element);
  }
  }
});


HNumber = HClass.extend({
  constructor: null,
  init: function() {
  this._PIXEL = /^\d+(px)?$/i;
    this._PERCENT = /^\d+%$/;
  },
  /** method: getPixelValue
    *
    * Returns the given value in pixels.
    *
    * Parameters:
    *   _element - The element node that has the given CSS length value.
  *   _value - The CSS length value.
    *   
    * Returns:
    *   Returns the given value in pixels. Returns an Integer.
    *
    **/
  getPixelValue: function(_element, _value) {
    if (this._PIXEL.test(_value)) {
      return parseInt(_value);
    }
    // saves style in temp
    var _style = _element.style.left;
    var _runtimeStyle = _element.runtimeStyle.left;
    _element.runtimeStyle.left = _element.currentStyle.left;
  HRighBottoFix.resizing = true;
    _element.style.left = _value || 0;
    // has pixel value
    _value = _element.style.pixelLeft;
    _element.style.left = _style;
  HRighBottoFix.resizing = false;
    _element.runtimeStyle.left = _runtimeStyle;
    return _value;
  }
});

HOpacityFix = HClass.extend({
  constructor: null,
  init: function() {
  // check if the file end with .png
  // ignores the letter case
  this._pngTest = new RegExp(".png$", "i");
  },
  /** method: _fixOpacity
    *
    * Adds the DXImageTransform.Microsoft.Alpha filter to the _element.
    *
    * Parameters:
    *   _element - The element for which the fixes are recalculated.
    *
    **/
  _fixOpacity: function(_element) {
  // converter from [0  1] to [0 100]
  var _opacity = (parseFloat(_element.currentStyle.opacity) * 100) || 1;
  // access before filter is set makes an error
  var _filter = _element.filters["DXImageTransform.Microsoft.Alpha"];
  if (_filter) {
    _filter.Opacity = _opacity;
    _filter.Enabled = true;
  } else {
    _element.runtimeStyle.filter +=  "progid:DXImageTransform.Microsoft.Alpha(opacity="+_opacity+")";
  }
  },
  /** method: _fixBackgroundImage
    *
    * Adds the DXImageTransform.Microsoft.AlphaImageLoader filter to the _element if the element has
  * the png background image.
    *
    * Parameters:
    *   _element - The element for which the fixes are recalculated.
    *
    **/
  _fixBackgroundImage: function(_element) {
  
  var _url = _element.currentStyle.backgroundImage.match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/);
    if (!_url) {
      return;
    } else {
      _url = _url[1];
    }
  var _filter = _element.filters["DXImageTransform.Microsoft.AlphaImageLoader"];
  if (this._pngTest.test(_url)) {
    // access before filter is set makes error
    if (_filter) {
    _filter.sizingMethod = "scale";
    _filter.src = _url;
    _filter.Enabled = true;
    } else {
    _element.runtimeStyle.filter += "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+_url+"',sizingMethod='scale')";
    }
    _element.runtimeStyle.zoom = "1";
    _element.runtimeStyle.backgroundImage = "none";
  } else if (_filter) {
    _filter.Enabled = false;
  }
  },
   /** method: _fixImg
    *
    * Adds the DXImageTransform.Microsoft.AlphaImageLoader filter to the _element if the element has
  * the png image.
    *
    * Parameters:
    *   _element - The element for which the fixes are recalculated.
    *
    **/
  _fixImg: function(_element) {
  if (this._pngTest.test(_element.src)) {
    var _image = new Image(_element.width, _element.height);
    _image.onload = function() {
    _element.width = _image.width;
    _element.height = _image.height;
    _image = null;
    }
    this._addFilter(_element, _image);
  }
  },
   /** method: _addFilter
    *
    * Adds the DXImageTransform.Microsoft.AlphaImageLoader filter to the _element if the element has
  * the png image.
    *
    * Parameters:
    *   _element - The element for which the fixes are recalculated.
    *   _image - The Image object used for calculate the dimension of the _element.
    *
    **/
  _addFilter: function(_element, _image) {
  var _filter = _element.filters["DXImageTransform.Microsoft.AlphaImageLoader"];
  if (_filter) {
    _filter.src = _element.src;
    _filter.Enabled = true;
  } else {
    _element.runtimeStyle.filter +=  "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + _element.src + "',sizingMethod='scale')";
  }
  var _tempURL = _element.src;
  // blank.gir has to be in same place as the original image
  _element.src = HPath.getRelativeFilePath(_tempURL, "blank.gif");
  _image.src = _tempURL;
  }
});


HRighBottoFix = HClass.extend({
  constructor: null,
  init: function() {
  eval("this._getMarginWidth="+String(this._getPaddingWidth).replace(/padding/g, "margin"));
  eval("this._getPaddingHeight="+String(this._getPaddingWidth).replace(/Width/g, "Height").replace(/Left/g, "Top").replace(/Right/g, "Bottom"));
  eval("this._getMarginHeight="+String(this._getPaddingHeight).replace(/padding/g, "margin"));
  eval("this._getBorderHeight="+String(this._getBorderWidth).replace(/Width/g, "Height"));
  eval("this._layoutHeight="+String(this._layoutWidth).replace(/Width/g, "Height").replace(/width/g, "height").replace(/Right/g, "Bottom"));
  //alert(this._layoutHeight);
  eval("this._getPixelHeight="+String(this._getPixelWidth).replace(/Width/g, "Height"));
  eval("this._resizeBottom="+String(this._resizeRight).replace(/Width/g, "Height").replace(/width/g, "height").replace(/left/g, "top").replace(/right/g, "bottom"));
  this.resizing = false;
  },
  /** method: _hasLayout
    *
    * Retrieves a value that indicates whether the _element has layout.
    *
    * Parameters:
    *   _element - The element node which for the layout check is applied.
    *   
    * Returns:
    *   Returns a Boolean value that indicates whether the _element has layout.
    *
    **/
  _hasLayout: function(_element) {
  return _element.currentStyle.hasLayout;
  },
  /** method: _getPaddingWidth
    *
    * Retrieves the amount of space to insert between the left border of the object and the content summed to
  * the amount of space to insert between the right border of the object and the content.
    *
    * Parameters:
    *   _element - The element node which for the summed left and rigt margin width is calculated.
    *   
    * Returns:
    *   Returns the summed left and right margin width in pixels. Returns an Integer.
    *
    **/
  _getPaddingWidth: function(_element) {
     return this._getPixelWidth(_element, _element.currentStyle.paddingLeft) +
       this._getPixelWidth(_element, _element.currentStyle.paddingRight);
  },
  /** method: _getPaddingWidth
    *
    * Returns the summed left and right border width in pixels.
    *
    * Parameters:
    *   _element - The element node which for the summed left and right border width is calculated.
    *   
    * Returns:
    *   Returns the summed left and right border width in pixels. Returns an Integer.
    *
    **/
  _getBorderWidth: function(_element) {
  return _element.offsetWidth - _element.clientWidth;
  },
  /** method: _layoutWidth
    *
    * Retrieves the width of the layout parent object including padding, but not including margin, border, or scroll bar.
    *
    * Parameters:
    *   _element - The element node which for the width of the layout parent object is returned.
    *   
    * Returns:
    *   Returns the width of the layout parent object in pixels. Returns an Integer.
    *
    **/
  _layoutWidth: function(_element) {
  // gets the parent from which the width is calculated
  var _layoutParent = _element.offsetParent;
    while (_layoutParent && !this._hasLayout(_layoutParent)) {
      _layoutParent = _layoutParent.offsetParent;
    }
  
  if (!_layoutParent._resizewidthElements) {
    _layoutParent._resizewidthElements = [];
  }
  
  if (!_element._addedResizewidthFix) {
    _layoutParent._resizewidthElements.push(_element);
    var _parent = _layoutParent;
    while (_parent.offsetParent) {
    _parent = _parent.offsetParent;
    if (_parent._resizewidthElements) {
      _parent._resizewidthElements.push(_element);
    }
    if (_parent.style.position == "absolute" || _parent.style.position == "fixed") {
      break;
    }
    }
    _element._addedResizewidthFix = true;
  }
  
  if (!_layoutParent._resizewidth) {
    _layoutParent.attachEvent("onpropertychange", function() {
      if (window.event.propertyName == "style.width") {
      for (var i = 0; i < _layoutParent._resizewidthElements.length; i++) {
      HRighBottoFix._resizeRight(_layoutParent._resizewidthElements[i]);
      }
      }
    });
    _layoutParent._resizewidth = true;
  }
  
  return (_layoutParent || document.documentElement).clientWidth;
  },
  /** method: _getPixelWidth
    *
    * Returns the given value in pixels. A percent value is calculated from the layout width of the parent.
    *
    * Parameters:
    *   _element - The element node that has the given CSS length value.
  *   _value - The CSS length value.
    *   
    * Returns:
    *   Returns the given value in pixels. Returns an Integer.
    *
    **/
  _getPixelWidth: function(_element, _value) {
    if (HNumber._PERCENT.test(_value)) {
      return parseInt(parseFloat(_value) / 100 * this._layoutWidth(_element));
    }
    return HNumber.getPixelValue(_element, _value);
  },
  /** method: _resizeRight
    *
    * Sets the visual (runtime style) width so tha
    *
    * Parameters:
    *   _element - The element node which for the width is setted.
    *
    **/
  // whole width:
  // left + marginLeftWidth + borderLeftWidth + paddingLeftWidth + width + paddingRightWidth + borderRightWidth
  // marginRightWidth + right
  _resizeRight: function(_element) {
  // get first the left
  //var time1 = new Date().getTime();
  // gets style left in pixels. It is an Integer.
  // slower // var _left = this._getPixelWidth(_element, _element.currentStyle.left);
  var _left = parseInt(_element.currentStyle.left); // fast
  // _width is now calculated as (borderLeftWidth + paddingLeftWidth + width + paddingRightWidth + borderRightWidth)
  // which is same as offsetWidth
  var _width = this._layoutWidth(_element) - this._getPixelWidth(_element, _element.currentStyle.right) - _left - this._getMarginWidth(_element);
    var _width = this._layoutWidth(_element) - parseInt(_element.currentStyle.right) - _left;
    if (parseInt(_element.runtimeStyle.width) == _width) {
      return;
    }
    _element.runtimeStyle.width = "";
  //var time2 = new Date().getTime();
  //
  //alert(_width);
  if (_element.offsetWidth < _width) {
    if (_width < 0) {
    _width = 0;
    }
    // _width is now calculated as CSS width
    _width -= this._getBorderWidth(_element) + this._getPaddingWidth(_element);
  
  //alert(_width);
    _element.runtimeStyle.width = _width;
    // needed because we need left = "px", width = "auto", right = "px"
    //_element.runtimeStyle._width = "auto";
  }
  //_element.parentNode.onresize = function() {HRighBottoFix._resizeRight(_element)};
  //alert(time2 - time1);
  }
});
ie_complete = document.readyState == "complete";
ie_initialized = false;
ie_documentLoaded = function () {
  if (document.readyState == "complete") {
    _traverseTree();
  } 
}
ie_fixes = function () {
  if (is.ie6 && !ie_initialized) {
    if (ie_complete) {
      var _stylesheet = document.createStyleSheet();
      _stylesheet.cssText = 'style,link{behavior:url('+ie_htc_path+'ie_css_style.htc)}\n*{behavior:url('+ie_htc_path+'ie_css_element.htc)}';
      ie_documentLoaded();
    } else {
      document.write('<style type="text/css">style,link{behavior:url('+ie_htc_path+'ie_css_style.htc)}\n*{behavior:url('+ie_htc_path+'ie_css_element.htc)}</style>');
      document.onreadystatechange = ie_documentLoaded;
    }
    ie_initialized = true;
  }
}
ie_fixes();
/** class: HTransporter
  *
  * *Simple mid-level AJAX communication system.*
  *
  * Uses prototype.js to do the low-level work).
  *
  * Designed as single instance, depends on <HValueManager>.
  *
  * When implementing the server part:
  *  - feed it with raw javascript
  *  - override ses_id as early as possible with your own session id, this tells the clients apart.
  *  - change the syncDelay depending on how fast you want the client to poll the server (a value in ms)
  *  - you may refer to 't' as the HTransporter's namespace.
  *
  * Sample initialization sequence:
  * > t.ses_id = 'nhHOZ8Zo64Wfo';
  * > t.syncDelay = 400;
  * > t.url_base = '/phase2';
  *
  * See Also:
  *  <HValueManager.toXML>
  **/

/* int: HTransportURL
 *
 * Tells the <HTransporter> which url/path to start polling.
 * - "global"
 * - Override it with your server's path or url before the document is loaded.
 */
HTransportURL = false;

/* int: HTransportPoll
 *
 * Tells the <HTransporter> whether to use polling (true) or to sync values only
 * when there's something on the client-side to sync (false).
 * - "global"
 * - Defaults to true (polling), override it with false before the document is
 *   loaded if you don't want polling.
 */
HTransportPoll = true;

/* vars: Instance variables
 *  url_base  - The URL (or path) that the requests are sent to
 *  ses_id    - A value that is the reported in each request by the key 'ses_id'
 *  syncDelay - An integer value (in ms) that the client waits before starting the next request
 */

HTransporter = Base.extend({
  
  constructor: null,
  
  start: function(_url_base){
    this.url_base  = _url_base;
    this.ses_id    = 0;
    this.err_msg   = '';
    this.isBusy    = false;
    this.syncNum   = 0;
    this.syncDelay = 0;
    this.pollMode  = HTransportPoll;
    this.req_timeout = setTimeout('HTransporter.sync();',this.syncDelay);
  },
  
  setPollMode: function(_flag) {
    this.pollMode = _flag;
  },
  
  failure: function(resp){
    alert('HTTP ERROR! STOP.');
    clearTimeout(this.req_timeout);
    this.isBusy = true;
  },
  
  respond: function(resp){
    var t = HTransporter;
    try {
      t.err_msg = '';
      HVM.isGetting=true;
      eval(resp.responseText); 
      HVM.isGetting=false;
    } catch(e) {
      t.err_msg = '&err_msg='+e;
    }
    t.isBusy = false;
  },
  
  sync: function(){
    var valid_delay = ((this.syncDelay&&this.syncDelay>0)||this.syncDelay==0);
    // Negative syncDelay stops transporter.
    if(valid_delay && this.url_base){
      if(!this.isBusy){
        this.isBusy = true;
        var _syncData = HValueManager.toXML();
        
        if ("" != _syncData || this.pollMode) {
          
          this.syncNum++;
          req_args = {
            onSuccess: function(resp){HTransporter.respond(resp);},
            onFailure: function(resp){HTransporter.failure(resp);},
            method:    'post',
            postBody:  'ses_id='+HTransporter.ses_id+HTransporter.err_msg+_syncData
          };
          this.req  = new Ajax.Request( this.url_base, req_args );
        }
        else {
          this.isBusy = false;
        }

      }
      this.req_timeout = setTimeout('HTransporter.sync();',this.syncDelay);
    }
  },
  
  stop: function() {
    clearTimeout(this.req_timeout);
  }
  
});

onloader("HTransporter.start(HTransportURL);");

/** class: HValueManager
  *
  * *Simple value syncronization system.*
  * 
  * Designed as single instance, depends on <HValue> and <HControl>.
  *
  * The system relies heavily on <HValue> instances.
  * It allows easy value syncronization between the server and client components.
  * <HTransporter> makes <toXML> calls whenever it's making a server poll to send
  * changed data to the server as XML, accessable by the 'HSyncData' request key.
  *
  * See Also:
  *  <HValue> <HTransporter> <HControl>
  *
  * Simple usage example:
  *  > var myApp = new HApplication(100);
  *  > var myTextCtrl1 = new HTextControl(new HRect(100,100,356,118),myApp,'',"Hello, I'm a textcontrol!");
  *  > myTextCtrl1.draw();
  *  > var myTextCtrl2 = new HTextControl(new HRect(120,100,356,138),myApp,'',"Hi, I'm also a textcontrol!");
  *  > myTextCtrl2.draw();
  *  > var myNewHValue = new HValue('foo123', "Hi, I am an example value.");
  *  > myNewValue.bind( myTextCtrl1 );
  *  > myNewValue.bind( myTextCtrl2 );
  *  > HValueManager.set('foo123',"Hi, I am the new replacement value!");
  *  > var myXMLChanged = HValueManager.toXML();
  **/

HValueManager = HClass.extend({
  constructor: null,
  
/** vars: Instance variables
  *
  * values - Array, contains all values currently managed, accessible by <HValue> id:s
  * tosync - Array, contains changed values that need to be reported to the remote side via <HTransporter>
  * isSending - flag, is set to true when <HTransporter> is busy.
  *
  **/
  values: [],
  tosync: [],
  isSending: false,
  isGetting: false,
  
/*** method: add
  ** 
  ** Adds a new <HValue> bound to the value of id into the value index of <HValueManager>.
  ** These values will then then be automatically syncronized between components
  ** and other compatible instances, like server-side value management. Most
  ** likely to be called from inside a <HValue> constructor.
  **
  ** Parameters:
  **  _id - An id for the value, doesn't really matter at the client-side as long as it is unique. Matters for server-side. Could be int or str, depending on the server implementation.
  **  _obj - A <HValue> object instance, usually *this* inside constructors of <HValue>-compatible classes.
  **
  ** See also:
  **  <set> <del> <HValue.constructor>
  ***/
  add: function(_id,_obj){
    this.values[_id] = _obj;
  },
  
/*** method: set
  **
  ** Sets a new *container value* to the <HValue> object by calling the bound <HValue> by its id.
  **
  ** Parameters:
  **  _id - The <HValue>-instance id to be modified.
  **  _value - The container value (NOT a <HValue>)
  **
  ** See also:
  **  <add> <del> <HValue.set> <HControl.setValue>
  ***/
  set: function(_id,_value){
    this.values[_id].set(_value);
  },
  
/*** method: del
  **
  ** Deletes the <HValue> by id from the value management system.
  **
  ** Parameters:
  **  _id - The <HValue>-instance id to be deleted.
  **
  ** See also:
  **  <add> <set> <HValue>
  ***/
  del: function(_id){
    var _thisVal  = this.values[_id];
    var _valViews = _thisVal.views;
    for(var _viewNum=0;_viewNum<_valViews.length;_viewNum++){
      var _thisView = _valViews[_viewNum];
      _thisView.valueObj = new HDummyValue(0,_thisVal.value);
    }
    this.values[_id] = null;
  },
  
/*** method: changed
  **
  ** Reports the <HValue> to <HValueManager> as a changed object.
  ** It adds a reference to the <HValue>, unless the value is changed via <HTransporter>.
  ** 
  ** There is no need to call it manually, except when creating a new <HValue> -compatible
  ** object from the scratch. Value-classes call changed whenever the change needs
  ** to be reported elsewhere.
  **
  ** Parameters:
  **  _theObj - The <HValue> -instance object to list as changed.
  **
  ** See also:
  **  <isGetting> <tosync> <set>
  ***/
  changed: function(_theObj){
    if(this.isGetting==false){
      if(this.tosync.indexOf(_theObj.id)==-1){
        this.tosync.push(_theObj.id);
      }
    }
  },
  
/*** method: toXML
  **
  ** Outputs all changed values to XML.
  **
  ** See also:
  **  <HTransporter>
  ***/
  toXML: function(){
    var _postBody = '&HSyncData=';
    if(!this.isSending){
      this.isSending = true;
      var _synclen = this.tosync.length;
      if(_synclen==0){
        this.isSending = false;
        return '';
      }
      var _syncvalueArr = [];
      for(var _i=0;_i<_synclen;_i++){
        var _syncid = this.tosync.shift();
        var _syncobj = this.values[_syncid];
        _syncvalueArr.push( _syncobj.toXML(_i) );
      }
      var _syncvalues = _syncvalueArr.join('');
      _postBody += '<hsyncvalues version="2240" length="'+_synclen+'">'+_syncvalues+'</hsyncvalues>';
      this.isSending = false;
    }
    return _postBody;
  },
  
  // Backwards-compatibility:
  output: function(){
    return this.toXML();
  }
});

// HVM is a shortcut to HValueManager
HVM = HValueManager;
/*** class: HValue
  **
  ** Data that needs to be syncronized between components or remote clients should be implemented as HValues.
  ** If client-side validation and type-checking is needed, it should be implemented by subclassing HValue.
  **
  ** vars: Instance variables
  **  id - Value Id, used by the whole value management system to identify individual values.
  **  type - '[HValue]'
  **  value - The container/"payload" data value itself.
  **  views - A list of Components that uses this value. 
  **          Used for automatic value syncronization between components.
  **
  ** Usage example:
  **  > var myApp = new HApplication(100);
  **  > var mySlider = new HSlider(new HRect(100,100,300,118),myApp,1.0,0.0,200.0);
  **  > mySlider.draw();
  **  > var myValue = new HValue(123,100.0);
  **  > myValue.bind(mySlider);
  **
  ** See also:
  **  <HValueManager> <HControl>
  ***/


HValue = HClass.extend({
/** constructor: constructor
  *
  * Parameters:
  *   _id - The source id (ideally set by server, should be unique)
  *   _value - The initial data 
  **/
  constructor: function(_id,_value){
    this.id    = _id;
    this.type  = '[HValue]';
    this.value = _value;
    this.views = [];
    HValueManager.add(_id,this);
  },
  
/** method: set
  * 
  * Replaces the data of the value. Extend this, if you need validation etc.
  *
  * Parameters:
  *  _value - The new data to replace the old data with.
  *
  * See also:
  *  <HControl.setValue> <HValueManager.set>
  **/
  set: function(_value){
    if(_value != this.value){
      this.value = _value;
      HValueManager.changed(this);
      this.refresh();
    }
  },
  
/** method: get
  *
  * Return the data, synonymous to the <value> instance variable
  *
  * Returns:
  *  The value instance variable (the data "payload")
  *
  * See also:
  *  <HValue.value>
  **/
  get: function(){
    return this.value;
  },
  
/** method: bind
  *
  * Bind a component to the value, use to attach HValues to components derived from HControl.
  *
  * Parameters:
  *  _viewObj - Any component that is derived from HControl *or* any class 
  *             that responds to setValueObj and setValue methods.
  *
  * See also:
  *  <unbind> <HControl.setValueObj>
  *
  **/
  bind: function(_viewObj){
    if(_viewObj===undefined){
      throw("HValueBindError: _viewObj is undefined!");
    }
    if(this.views.indexOf(_viewObj.elemId)==-1){
      this.views.push(_viewObj);
      _viewObj.setValueObj( this );
    }
  },
  
/** method: unbind
  *
  * Detach a component bound to this value.
  *
  * Parameters:
  *  _viewObj - Any component that is derived from HControl *or* any class 
  *             that responds to setValueObj and setValue methods.
  *
  * See also:
  *  <bind>
  *
  **/
  unbind: function(_viewObj){
    for(var _viewNum=0;_viewNum<this.views.length;_viewNum++){
      var _tryObj = this.views[_viewNum];
      if(_tryObj===_viewObj){
        this.views.splice(_viewNum);
        return;
      }
    }
  },
  
/** method: refresh
  *
  * Calls the setValue method all components bound to this HValue.
  *
  * See also:
  *  <HControl.setValue>
  **/
  refresh: function(){
    for(var _viewNum=0;_viewNum<this.views.length;_viewNum++){
      var _viewObj = this.views[_viewNum];
      if(_viewObj.value != this.value){
        if(!_viewObj._valueIsBeingSet){
          _viewObj._valueIsBeingSet=true;
          _viewObj.setValue( this.value );
          _viewObj._valueIsBeingSet=false;
        }
      }
    }
  },
  
/** method: toXML
  *
  * Responsible for generating the xml representation of the value object.
  *
  * Parameter:
  *  _i - The sequence number of the item, generated by HValueManager.
  *
  * Returns:
  *  A XML string with meta-info about the object
  *
  * See Also:
  *  <HValueManager.toXML>
  *
  * Samples:
  * > <hvalue id="996" order="30" jstype="boolean" length="4">true</hvalue>'
  * > <hvalue id="997" order="31" jstype="number" length="7">123.321</hvalue>'
  * > <hvalue id="998" order="32" jstype="object" length="5">1,2,3</hvalue>'
  * > <hvalue id="999" order="33" jstype="string" length="16">&lt;b&gt;Bold Text&lt;/b&gt;</hvalue>'
  **/
  toXML: function(_i){
    var _syncid = this.id;
    var _synctype = this.type.slice(1,-1).toLowerCase();
    var _syncvalue = this.value;
    var _syncjstype = typeof _syncvalue;
    var _syncescvalue = _syncvalue.toString();
    
    _syncescvalue = _syncescvalue.replace( /&/g, '&amp;');
    _syncescvalue = _syncescvalue.replace( /</g, '&lt;' );
    _syncescvalue = _syncescvalue.replace( />/g, '&gt;' );
    
    
    // Percent sign must be escaped, otherwise it is used as an escape
    // character.
    _syncescvalue = _syncescvalue.replace( /%/g, '%25' );
    // Ampersand is the parameter separator in HTTP POST, so we need to encode
    // them in order to get the escaped characters to work.
    _syncescvalue = _syncescvalue.replace( /&/g, '%26' );
    
    
    /* if (_syncjstype == "string") {
      _syncescvalue = escape(_syncescvalue);
    } */
    
    return '<'+_synctype+' id="'+_syncid+'" order="'+_i+'" jstype="'+_syncjstype+'" length="'+_syncvalue.toString().length+'">'+_syncescvalue+'</'+_synctype+'>';
  }
  
});


/** class: HControlValue
  *
  **/
HControlValue = HValue.extend({
  
/** constructor: constructor
  *
  * Parameters:
  *  _id - See <HValue.constructor>
  *  _value - The value itself. See <HValue.constructor>
  *
  **/
  constructor: function(_id,_value){
    this.validate(_value);
    // default values
    this.label = (_value.label !== undefined) ? _value.label : "Untitled";
    if (_value.value === undefined) {
      _value.value = 0;
    }
    this.enabled = (_value.enabled !== undefined) ? _value.enabled : true;
    this.active = (_value.active !== undefined) ? _value.active : false;
    this.base(_id,_value.value);
    this.type = '[HControlValue]';
  },

  
/** method: validate
  *
  * Simple value validation
  *
  * Parameters:
  *  _value - The data to validate
  *
  **/
  validate: function(_value){
    //alert((typeof _value));
    if(typeof _value != "object"){
      throw('ControlValueError: ControlValue must be an object');
    }
  },
  
/** method: set
  *
  **/
  set: function(_value){
    // Fix to ValueMatrix --> better ideas?
    if (typeof _value == "boolean") {
      var _temp = _value;
      _value = {};
      _value.value = _temp;
      
    }
    this.validate(_value);
    // default values    
    this.label = (_value.label !== undefined) ? _value.label : this.label;
    if (_value.value === undefined) {
      _value.value = this.value;
    }
    this.enabled = (_value.enabled !== undefined) ? _value.enabled : this.enabled;
    this.active = (_value.active !== undefined) ? _value.active : this.active;
    
    this.base(_value.value);
  },
  
/** method: setLabel
  *
  **/
  setLabel:   function(_label){
     this.set({label:_label});
  },
  
/** method: setValue
  *
  **/
  setValue:   function(_value){
    this.set({value:_value});
  },
  
/** method: setEnabled
  *
  **/
  setEnabled:   function(_enabled){
    this.set({enabled:_enabled});
  },
  
/** method: setActive
  *
  **/
  setActive:   function(_active){
    this.set({active:_active});
  },
  
  bind: function(_viewObj){
    this.base(_viewObj);
    if(this.views.indexOf(_viewObj.elemId)==-1){
      this.views.push(_viewObj);
      _viewObj.setLabel( this.label );
      _viewObj.setEnabled( this.enabled );
      //_viewObj.setActive( this.active );
    }
  },
/** method: refresh
  *
  * Calls the setValue method all components bound to this HControlValue.
  *
  * See also:
  *  <HControl.setValue>
  **/
  refresh: function(){
    this.base();
    for(var _viewNum=0;_viewNum<this.views.length;_viewNum++){
      var _viewObj = this.views[_viewNum];
      if(_viewObj.value != this.value){
        if(!_viewObj._valueIsBeingSet){
          _viewObj._valueIsBeingSet=true;
          _viewObj.setLabel( this.label );
          _viewObj.setEnabled( this.enabled );
          //_viewObj.setActive( this.active );
          _viewObj._valueIsBeingSet=false;
        }
      }
    }
  },
  
/** method: toXML
  *
  * Generates an XML description of the menuitem.
  *
  * Parameter:
  *  _i - The sequence number of the item, generated by HValueManager.
  *
  * Returns:
  *  An XML string with the date as specified
  *
  * See Also:
  *  <HValue.toXML> <HValueManager.toXML>
  *
  * Sample:
  * > <menuitem id="menuitem:215" order="1"><label>hello</label><value>0</value><enabled>true</enabled><active>false</active></menuitem>
  **/
  toXML: function(_i){
    var _syncid = this.id;
    return '<controlvalue id="'+_syncid+'" order="'+_i+'"><label>'+this.label+'</label><value>'+this.value+'</value><enabled>'+this.enabled+'</enabled><active>'+this.active+'</active></controlvalue>';
  }
});

HValueMatrixComponentExtension = {
  setValueMatrix: function(_aValueMatrix){
    this.valueMatrix = _aValueMatrix;
    this.valueMatrixIndex = this.valueMatrix.addValue(this.valueObj,this.value);
  },
  
  mouseDown: function(_x,_y,_isLeftButton){
    if (this.valueMatrix instanceof HValueMatrix) {
      this.valueMatrix.setValue( this.valueMatrixIndex );
    } else {
      this.setValue(!this.value);
    }
  },
  
  mouseUp: function(_x,_y,_isLeftButton){
    if (this.valueMatrix instanceof HValueMatrix) {
      this.valueMatrix.setValue( this.valueMatrixIndex );
    } else {
      this.setValue(!this.value);
    }
  }
};

HValueMatrix = HClass.extend({
  constructor: function(){
    // An array to hold member components
    this.values = [];
    // The index of the value member chosen
    this.value = -1;
  },
  
  setValueObj: function(_aValueObj){
    this.valueObj = _aValueObj;
    this.setValue(this.valueObj.value);
  },
  
  setValue: function(_index){
    if(_index != this.value){
      // Set the previous value object to false (reflects to its container component(s))
      if(this.value != -1){
        this.values[this.value].set(false);
      }
    
      if(_index != -1){
        // Store the new index as the currently active value
        this.valueObj.set(_index);
        this.value = _index;
      
        // Set the new value object to true (reflects to its container component(s))
        this.values[this.value].set(true);
      }
    }
  },
  
  addValue: function(_aValueObject, _selectIt) {
    this.values.push(_aValueObject);
    var _newIndex = this.values.length-1;
    if(_selectIt){
      this.setValue(_newIndex);
    }
    return _newIndex;
  }
});
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
          prop_set( this.markupElemIds.label, 'line-height', _heightDiff+'px');
          if(is.ie6){
            var _widthDiff  = parseInt(_width + this._labelWidthDiff,  10);
            prop_set( this.markupElemIds.label, 'height', _heightDiff+'px');
            prop_set( this.markupElemIds.label, 'width', _widthDiff+'px');
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
        elem_set( this.markupElemIds.label, this.label );
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
      var _elem = elem_get(this.markupElemIds.control);
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
        elem_set(this.markupElemIds.label, this.label);
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
/*** class: HImageButton
  **
  ** HImageButton is the button that has an image. HImageButtons can have two states, checked and unchecked. 
  ** State transition of a button is done by clicking the mouse on the button 
  ** or by using a keyboard shortcut.
  ** 
  ** vars: Instance variables
  **  type - '[HImageButton]'
  **  value - A boolean, true when the button is checked, false when it's not.
  **  image - The url of an image that indicates false state.
  **  alternateImage - The url of an image that indicates true state.
  **
  ** Extends:
  **  <HControl>
  **
  ** See also:
  **  <HControl>
  ***/
HImageButton = HControl.extend({
  
  componentName: "imagebutton",

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
    this.styleButtonDefaults = new (Base.extend({
      image: this.getThemeGfxPath() + "blank.gif",
	  alternateImage: ""
    }).extend(_options));
	
	this._image = this.getThemeGfxPath() + this.styleButtonDefaults.image;
	this._alternateImage = this.getThemeGfxPath() + this.styleButtonDefaults.alternateImage;
	
    this.type = '[HImageButton]';

	this.preserveTheme = true;
	
    this.setMouseUp(true);
    
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
  _updateImageState: function() {
	if (!this.value) {
	  elem_get(this._imgElementId).src = this._image;
	} else {
	  if (this._alternateImage) {
	    elem_get(this._imgElementId).src = this._alternateImage;
	  }
	}
  },

/** method: refresh
  * 
  * Sets only the image that indicates the state, not the whole markup.
  *
  * See also:
  *  <HView.refresh>
  **/
  refresh: function() {
    if (this.drawn) {
      this.base();
      // Checks if this is the first refresh call:
      if(!this._imgElementId) {
        this._imgElementId = this.bindDomElement(
          HImageButton._tmplImgPrefix + this.elemId);
      }
      if(this._imgElementId) {
		this._updateImageState();
      }
    }
  },

/** event: mouseUp
  * 
  * Called when the user clicks the mouse button up on this object. Sets the state of the HImageButton.
  * It can be 0 or 1.
  *
  * Parameters:
  *  _x - The horizonal coordinate units (px) of the mouse cursor position.
  *  _y - The vertical coordinate units (px) of the mouse cursor position.
  *  _leftButton - Flag, is false when the right mouse button was pressed. *Do
  *                not rely on it*
  *
  * See also:
  *  <HControl.mouseUp>
  **/
  mouseUp: function(_x, _y, _isLeftButton) {
	this.setValue(!this.value);
  }
  
},{
  _tmplImgPrefix: "imagebutton"
});
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
    var _element = elem_get(this.elemId);
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
    var _elem = elem_get(this._knobElemId);
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
    prop_set(this._knobElemId,_whichprop,_propval);
  }
  
});

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
    if (this.drawn) {
      // Super takes care of calling optimizeWidth(), if required.
      this.base();
      if(!this._stringElemId) {
        this._stringElemId = this.bindDomElement("stringview" + this.elemId);
      }
      if(this._stringElemId) {
        elem_set(this._stringElemId, this.value);
      }
    }
  },
  
  
/** method: stringElementId
  * 
  * Returns:
  *   The element ID of the element that actually contains the string.
  *
  **/
  stringElementId: function() {
    return this._stringElemId;
  },
  
  
/** method: optimizeWidth
  * 
  * Sets the width of the view to match the width of the value string of this
  * object.
  *
  * See also:
  *  <HView.optimizeWidth>
  **/
  optimizeWidth: function() {
    if (this._stringElemId) {
      
      // Create a temporary clone of the string container and place it into the
      // document body. This is needed when the string view is used inside of a
      // tree node and it is not certain that the string view is yet displayed.
      // NOTE: This makes the method a bit slower, but for now it seems to be
      // necessary to make it work properly.
      var _tempElement = elem_get(this._stringElemId).cloneNode(true);
      var _tempElemId = elem_add(_tempElement);
      prop_set(_tempElemId, "visibility", "hidden", true);
      elem_append(0, _tempElemId);
      
      var _width = this.stringWidth(this.value, null, _tempElemId);
      
      if (!isNaN(_width)) {
        var _additionalWidth = prop_get_extra_width(this._stringElemId);
        this.resizeTo(_width + _additionalWidth, this.rect.height);
      }
      
      // Delete the temporary clone.
      elem_del(_tempElemId);

    }
  }
  
});

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
  
  componentName: "imageview",

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
    if (!this.value) {
      // default to a blank image
      this.value = this.getThemeGfxPath() + "blank.gif";
    }
    
    this.type = '[HImageView]';
    
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
  * Redraws only the image, not the whole markup.
  *
  * See also:
  *  <HView.refresh>
  **/
  refresh: function() {
    if (this.drawn) {
      this.base();
      // Checks if this is the first refresh call:
      if(!this._imgElementId) {
        this._imgElementId = this.bindDomElement(
          HImageView._tmplImgPrefix + this.elemId);
      }
  
      if(this._imgElementId) {
        elem_get(this._imgElementId).src = this.value;
      }
    }
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
    if(this._imgElementId) {
      prop_set(this._imgElementId, 'width', this.rect.width + 'px');
      prop_set(this._imgElementId, 'height', this.rect.height + 'px');
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
    if(this._imgElementId) {
      prop_set(this._imgElementId, 'width', 'auto');
      prop_set(this._imgElementId, 'height', 'auto');
    }
  }


  
},{
  _tmplImgPrefix: "imageview"
});
/*** class: HTreeNode
  **
  ** Node objects are used in a <HTreeControl>. Node displays a view, keeps track
  ** of its child nodes and handles expanding and collapsing of them.
  **
  ** constants: Static constants
  **  cssSelected - The CSS class name of a selected item ("selected").
  **  cssExpanded - The CSS class name of an item that has subitems and it is
  **      expanded ("expanded").
  **  cssCollapsed - The CSS class name of an item has subitems and it is
  **      collapsed ("collapsed").
  **  cssHover - The CSS class name to use when an item that may be dropped on
  **      this node is hovering above this item ("hovering").
  ** 
  ** vars: Instance variables
  **  type - '[HTreeNode]'
  **  childNodes - An array of nodes on the tree at the root level.
  **  tree - Reference to the <HTreeControl> that currently owns this node.
  **  expanded - True when the node is expanded, false when it's collapsed.
  **  selected - True when the node is selected, false when it's not.
  **  toggleControl - A reference to a <HTreeNodeToggleControl> object that
  **      handled user interaction for expanding and collapsing nodes.
  **  content - A reference to a content object currently held by this node. The
  **      content object must be derived from <HControl>.
  **  parent - A reference to the parent view of this node. It's the parent node
  **      of this node too.
  **
  ** Extends:
  **  <HControl>
  **
  ** See also:
  **  <HTreeControl>
  ***/
HTreeNode = HControl.extend({

  packageName:   "tree",
  componentName: "treenode",

/** constructor: constructor
  *
  * Parameters:
  *   _parentClass - The parent view that this control is to be inserted in.
  *       Currently, the _parentClass must always be a valid node or a tree.
  *   _content - The content object of this node. Must be derived from
  *       <HControl>.
  *   _options - See <HControl.constructor> and <HComponentDefaults>
  *
  **/
  constructor: function(_parentClass, _content, _options) {
    var _rect = new HRect();
    if (!_options) {
      _options = {};
    }
    if(this.isinherited) {
      this.base(_rect, _parentClass, _options);
    }
    else {
      this.isinherited = true;
      this.base(_rect, _parentClass, _options);
      this.isinherited = false;
    }
    this.setContent(_content);
    
    this.type = '[HTreeNode]';
    
    // When this is true, the component is always drawn with the theme that was
    // active at the creation of the component, not the current theme.
    this.preserveTheme = true;
    
    
    this.expanded = true;
    this.selected = false;
    
    // Toggle control responds to mouse clicks and collapses/expands this node.
    this.toggleControl = new HTreeNodeToggleControl(this);
    
    // The tree object that hosts this node
    this.tree = null;
    this.childNodes = [];
    
    
    this.parent.addChildNode(this);
    
    
    if(!this.isinherited) {
      this.draw();
    }
  },
  
  
/** method: setContent
  * 
  * Sets the content of this node, an object inherited from <HControl>.
  *
  * Parameters:
  *   _content - The new content object of this node.
  *
  * See also:
  *  <HControl>
  **/
  setContent: function(_content) {
    
    this.content = _content;
    if (this.content) {
      
      // The tree node's dragging functionality has been moved to its content
      // view. These methods are injected to the view here, overriding the
      // original ones.


      // TODO: Clean up, this looks quite bad now.
      // TODO: Move the drag logic to a lower level, maybe to HControl or event
      // manager.
      
      this.content.ownerNode = this;
      
      // this.content.setEnabled(false);
      this.content.setEvents( {
        mouseDown: false,
        mouseUp:   false,
        draggable: true,
        droppable: true
      } );
      
      var _that = this;
      this.content.startDrag = function(_x, _y) {
        this.actuallyDragging = false;
        this.canBeDropped = false;
        
        // Don't start the drag event if it's disabled in the tree control.
        if (this.ownerNode.tree.allowNodeDragging) {
          this.base(_x, _y);
          // Don't start the actual drag until the user has dragged the item for
          // a few pixels.
          this.originX = _x;
          this.originY = _y;
        }
      }; // // // startDrag
      
      this.content.doDrag = function(_x, _y) {
        // Do nothing when dragging is disabled in the tree control.
        if (this.ownerNode.tree.allowNodeDragging) {
          
          if (this.actuallyDragging) {
            // We are currently dragging, follow the mouse with the object.
            prop_set(this.dragElemId, 'left', (_x - this.originX) + 'px');
            prop_set(this.dragElemId, 'top', (_y - this.originY) + 'px');
          }
          else {
            // Not yet dragging, see if mouse has moved enough to drag.
            if (_x > this.originX + 4 || _x < this.originX - 4 ||
              _y > this.originY + 4 || _y < this.originY - 4) {
                
              this.actuallyDragging = true;
              this.canBeDropped = true;
              this.createDragClone(_x, _y);
            }
  
          }
          
        }
      }; // // // doDrag
      
      this.content.endDrag = function(_x, _y) {
        if (this.ownerNode.tree.allowNodeDragging) {
          this.base(_x, _y);
        }
        if (this.actuallyDragging) {
          this.deleteDragClone();
          this.actuallyDragging = false;
        }
        else if (this._focusOn) {
          this.mouseUp(_x, _y);
        }
      }; // // // endDrag
      
      // Focus and blur are used to make sure that the mouseUp is only called
      // when the mouse is still on the node.
      this.content.focus = function() {
        this.base();
        this._focusOn = true;
      };
      this.content.blur = function() {
        this.base();
        this._focusOn = false;
      };

      
      
      // This creates the drag clone when the dragging starts.
      this.content.createDragClone = function(_x, _y) {
        var _element = elem_get(this.ownerNode.elemId);
        
        // Get the node's original position
        var _originalPosition = helmi.Element.getPageLocation(_element, true);
        
        // Duplicate the node element, but hide it first so the raw markup
        // doesn't scare the user.
        this.dragElemId = elem_mk(this.appId);
        prop_set(this.dragElemId, 'visibility', 'hidden', true);
        var _dragClone = _element.cloneNode(true);
        
        // Anonymize the clone by removing all the id attributes in its markup.
        _dragClone.removeAttribute("id");
        _dragClone.innerHTML =
          _dragClone.innerHTML.replace(/\s+id="[^"]*"/g, "");
        this.dragContentElemId = elem_add(_dragClone);
        
        // Ghosting effect
        prop_set(this.dragElemId, 'opacity', 0.50);
        
        // Place the clone on the screen
        prop_set(this.dragElemId, 'position', 'absolute', true);
        prop_set(this.dragElemId, 'left', _originalPosition[0] + 'px', true);
        prop_set(this.dragElemId, 'top', _originalPosition[1] + 'px', true);
        elem_append(this.dragElemId, this.dragContentElemId);
        
        // Bring to temporary front
        prop_set(this.dragElemId, 'z-index', this.app.viewsZOrder.length);
        prop_set(this.dragElemId, 'visibility', 'visible', true);

        
        // Store the original position, used in doDrag()
        this.originX = this.originX - _originalPosition[0];
        this.originY = this.originY - _originalPosition[1];

      };
      // Removes the drag clone from the screen.
      this.content.deleteDragClone = function() {
        if(this.dragContentElemId) {
          elem_del(this.dragContentElemId);
          this.dragContentElemId = null;
        }
        if(this.dragElemId) {
          elem_del(this.dragElemId);
          this.dragElemId = null;
        }
      };
      
      
      this.content.mouseUp = function(_x, _y) {
        this.ownerNode.mouseUp(_x, _y);
      };
      
      this.content.onDrop = function(_object) {
        if (!this.isValidDroppable(_object) || !_object.canBeDropped) {
          return;
        }
        _object.canBeDropped = false;
        this.ownerNode.setHover(false);
        _object.ownerNode.moveUnder(this.ownerNode);
      };
  
      this.content.onHoverStart = function(_object) {
        if (!this.isValidDroppable(_object)) {
          return;
        }
        this.ownerNode.setHover(true);
      };
      this.content.onHoverEnd = function(_object) {
        if (!this.isValidDroppable(_object)) {
          return;
        }
        this.ownerNode.setHover(false);
      };
      this.content.isValidDroppable = function(_object) {
        // The droppable is always invalid when dragging has been disabled in
        // the tree control. This disables hovering too.
        if(!this.ownerNode.tree.allowNodeDragging ||
          this == _object || // drop on to itself, should never happen
          !this.ownerNode || !_object.ownerNode || // not inside of a node
          this.ownerNode == _object.ownerNode.parent || // own parent
          this.ownerNode.isDescendantOf(_object.ownerNode)) { // own descendant
          return false;
        }
        return true;
      }
      
    }
    
    // Content object's method injection ends.
  },
  
  
/** method: setHover
  * 
  * Sets the hover status of this node. When the _flag is true, the content
  * element of this node gets a CSS class attached to it, defined in a static
  * constant cssHover. When the _flag is false, the CSS class is removed.
  * This is called automatically by the drag event when the hover status
  * changes.
  *
  * Parameters:
  *   _flag - Boolean value of the hover status to be set.
  *
  **/
  setHover: function(_flag) {
  	this.toggleCSSClass(HTreeNode._tmplContentPrefix + this.elemId,
      HTreeNode.cssHover, _flag);
  },
  
  
/** method: isDescendantOf
  * 
  * Returns true when this node is found under _ancestor, at any depth, and
  * false if it doesn't.
  *
  * Parameters:
  *   _ancestor - The assumed ancestor node of this node.
  *
  **/
  isDescendantOf: function(_ancestor) {
    if(this.parent == _ancestor) {
      return true;
    }
    else if (!this.parent.isDescendantOf) {
      return false;
    }
    else {
      return this.parent.isDescendantOf(_ancestor);
    }
  },
  
  
/** method: hasChildren
  * 
  * Checks if the tree has child nodes.
  * 
  * Returns:
  *   True if the tree has child nodes and false if it doesn't.
  * 
  * See also:
  *  <HTreeNode.hasChildren>
  **/
  hasChildren: function() {
    return (this.childNodes.length > 0);
  },
  
  
/** method: addChildNode
  * 
  * Appends the _node into this nodes list of child nodes.
  *
  * Parameters:
  *   _node - The node to be added as a child node.
  *
  * See also:
  *  <HTreeNode.addChildNode> <HTreeControl.childNodeAdded>
  **/
  addChildNode: function(_node) {
    if (this.tree &&  this.tree != _node.tree) {
      _node.setTree(this.tree);
    }
    this.childNodes.push(_node);
    if (this.drawn) {
      _node.addDomNode();
      this._refreshToggler();
    }
    
    // Notify the tree about the change.
    this.tree.childNodeAdded(this, _node);
  },
  
  
  /**
    * Not for public API, use addChildNode.
    * Adds the DOM node of this tree node to the tree.
    */
  addDomNode: function() {
    if (!this.drawn) {
      
      // Kludge to keep MSIE happy. Move the element to document body before
      // drawing the markup with innerHTML, and then move it to the parent
      // element's child container.
      var _element = elem_get(this.elemId);
      elem_get(this.appId).appendChild(_element);
      
      this.draw();
      this.postDrawBindings();
      
      var _parentElem = elem_get(this.parent.childContainerId);
      // Element has changed after calling postDrawBindings
      _element = elem_get(this.elemId);
      _parentElem.appendChild(_element);
      
      this.tree.invalidatePositionCache();
    }
  },
  
  
/** method: setTree
  * 
  * Updates this node's and its children's tree property.
  * 
  * Parameters:
  *   _tree - New tree of this node, should be an instance of <HTreeControl>.
  *
  **/
  setTree: function(_tree) {
    this.tree = _tree;
    for(var i = 0; i < this.childNodes.length; i++) {
      this.childNodes[i].setTree(_tree);
    }
  },
  
  
/** method: removeChildNode
  * 
  * Removes the given child node from this node.
  * 
  * Parameters:
  *   _node - The child node to be removed from this node.
  * 
  * See also:
  *  <HTreeControl.removeChildNode> <HTreeControl.childNodeRemoved>
  **/
  removeChildNode: function(_node) {
    _node.deselect();
    _node.removeDomNode();
    _node.tree = null;
    this.childNodes.splice(this.childNodes.indexOf(_node), 1);
    this._refreshToggler();
    
    // Notify the tree about the change.
    this.tree.childNodeRemoved(this, _node);
  },


/** method: removeFromParent
  * 
  * Removes this node from its parent.
  * 
  * See also:
  *  <removeChildNode> <HTreeControl.childNodeRemoved>
  **/
  removeFromParent: function() {
    this.parent.removeChildNode(this);
  },
  
  
/** method: removeAllChildren
  * 
  * Removes all the child nodes of this node, but not this node.
  * 
  * See also:
  *  <HTreeControl.removeAllNodes> <HTreeControl.childNodeRemoved>
  **/
  removeAllChildren: function() {
    for(var i = this.childNodes.length - 1; i >= 0; i--) {
      this.childNodes[i].removeAllChildren();
      this.childNodes[i].removeFromParent();
    }
  },
  
  
  /**
    * Not for public API, use removeChildNode.
    * Removes the DOM node of this tree node from the tree.
    */
  removeDomNode: function() {
    if (this.drawn) {
      var _elem = elem_get(this.elemId);
      _elem.parentNode.removeChild(_elem);
      
      this.tree.invalidatePositionCache();
    }
  },
  
  
/** method: collapse
  * 
  * Collapses this node, hiding the child nodes.
  * 
  **/
  collapse: function() {
    if(!this.expanded) {
      return;
    }
    this.expanded = false;
    this._updateExpansionStatus();
  },
  
  
/** method: expand
  * 
  * Expands this node, exposing the child nodes.
  * 
  **/
  expand: function() {
    if(this.expanded) {
      return;
    }
    this.expanded = true;
    this._updateExpansionStatus();
  },
  
  
  // Private method
  // Handles showing and hiding the child nodes and refreshes the toggler
  // status. Called from collapse and expand.
  _updateExpansionStatus: function() {
    if (this.drawn) {
      if(this.expanded) {
        prop_set(this.childContainerId, 'display', 'block');
      }
      else {
        prop_set(this.childContainerId, 'display', 'none');
      }
      this._refreshToggler();
      
      this.tree.invalidatePositionCache();
    }
  },
  
  
/** method: collapseAllChildren
  * 
  * Collapses the child nodes of this node, but not this node.
  * 
  * See also:
  *  <HTreeControl.collapseAll>
  **/
  collapseAllChildren: function() {
    for(var i = 0; i < this.childNodes.length; i++) {
      this.childNodes[i].collapseAllChildren();
      this.childNodes[i].collapse();
    }
  },
  
  
/** method: expandAllChildren
  * 
  * Expands the child nodes of this node, but not this node.
  * 
  * See also:
  *  <HTreeControl.expandAll>
  **/
  expandAllChildren: function() {
    for(var i = 0; i < this.childNodes.length; i++) {
      this.childNodes[i].expandAllChildren();
      this.childNodes[i].expand();
    }
  },
  
  
/** method: toggle
  * 
  * Expand when collapsed, collapse when expanded.
  * 
  * See also:
  *  <collapse> <expand>
  **/
  toggle: function() {
    if(this.expanded) {
      this.collapse();
    }
    else {
      this.expand();
    }
  },
  
  
  // Private method
  // Updates the CSS class on the toggler control depending on whether the node
  // has child nodes and is expanded or collapsed.
  _refreshToggler: function() {
    var _hasChildren = this.hasChildren();
    this.toggleCSSClass(HTreeNode._tmplTogglerPrefix + this.elemId,
      HTreeNode.cssExpanded, this.expanded && _hasChildren);
    this.toggleCSSClass(HTreeNode._tmplTogglerPrefix + this.elemId,
      HTreeNode.cssCollapsed, !this.expanded && _hasChildren);
  },
  
  
/** method: select
  * 
  * Selects the node, setting a CSS class defined in cssSelected to the node's
  * DOM element indicating the selection status.
  * 
  * See also:
  *  <HTreeControl.selectNode> <HTreeControl.selectionChanged>
  **/
  select: function(_extendSelection, _ignoreSelectionChange) {
    this.tree.selectNode(this, _extendSelection, _ignoreSelectionChange);
  },
  
  
/** method: deselect
  * 
  * Unselects the node, removing the CSS class defined in cssSelected from the
  * node's DOM element.
  * 
  * See also:
  *  <HTreeControl.deselectNode> <HTreeControl.selectionChanged>
  **/
  deselect: function() {
    this.tree.deselectNode(this);
  },
  
  
  /**     
    * Not for public API.
    * 
    * Makes sure that the CSS class of the node's content element gets changed
    * when the selection status changes. Called from tree control too.
    * 
    **/
  refreshSelectionStatus: function() {
    if (this.drawn) {
      this.toggleCSSClass(HTreeNode._tmplContentPrefix + this.elemId,
        HTreeNode.cssSelected, this.selected);
    }
  },
  
  
/** method: selectAllChildren
  * 
  * Selects all the child nodes of this node, but not this node. Selecting all
  * nodes works only when the tree is in multiple selection mode.
  * 
  * Parameters:
  *   _ignoreSelectionChange - A boolean that indicates whether the hook method
  *     selectionChanged should be called if the selection does change. This is
  *     mostly used by internal methods.
  * 
  * See also:
  *  <HTreeControl.selectAllNodes> <HTreeControl.setTreeType>
  *  <HTreeControl.selectionChanged>
  **/
  selectAllChildren: function(_ignoreSelectionChange) {
    if (this.tree.treeType == HTreeControl.H_MULTIPLE_SELECTION_TREE) {
      for(var i = 0; i < this.childNodes.length; i++) {
        this.childNodes[i].selectAllChildren(_ignoreSelectionChange);
        this.childNodes[i].select(true, _ignoreSelectionChange);
      }
    }
  },
  
  
/** method: deselectAllChildren
  * 
  * Unselects all the child nodes of this node, but not this node.
  * 
  * See also:
  *  <HTreeControl.deselectAllNodes>  <HTreeControl.selectionChanged>
  **/
  deselectAllChildren: function() {
    for(var i = 0; i < this.childNodes.length; i++) {
      this.childNodes[i].deselectAllChildren();
      this.childNodes[i].deselect();
    }
  },
  
  
/** method: draw
  * 
  * The draw method is called by the tree that hosts this node. Calling this
  * after drawing the tree has no effect.
  *
  * See also:
  *  <HView.draw> <HTreeControl.draw>
  **/
  draw: function() {
    if (!this.drawn) {
      this.drawMarkup();
      this.drawn = true; // drawRect is not called, so set this manually.
    }
  },
  
  
/** method: drawChildren
  * 
  * Draws all the child nodes of this node. This should be automatically called
  * from the HTML-template when the node itself is drawn.
  * 
  * Returns:
  *  The markup of the complete child node hierarchy that was drawn.
  *
  * See also:
  *  <HTreeControl.drawChildren>
  **/
  drawChildren: function() {
    var _markupString = "";
    for(var i = 0; i < this.childNodes.length; i++) {
      
      this.childNodes[i].draw();
      _markupString += this.childNodes[i].markup;
      
    }
    
    return _markupString;
  },
  
  
/** method: moveUnder
  * 
  * Completely moves this node (and the child nodes) under the _newParent.
  * The node is first removed from its current parent's views array, and then
  * added to the new parent's views array, and finally the DOM node is moved
  * under the new parent's child container.
  * 
  * Parameters:
  *   _newParent - The target node that this node is to be moved under.
  *
  **/
  moveUnder: function(_newParent) {

    // Remove the node from its current parent and leave the DOM element to be
    // used in the new parent.
    this.deselect();
    this.parent.removeChildNode(this);
    if (this.parent._refreshToggler) {
      // The parent is not a tree.
      this.parent._refreshToggler();
    }
    
    this.remove();

    _newParent.addView(this);
    _newParent.addChildNode(this);
    
    if (_newParent.drawn) {
      elem_append(_newParent.childContainerId, this.elemId);
    }
    
    if (_newParent._refreshToggler) {
      // The parent is not a tree.
      _newParent._refreshToggler();
    }

  },
  
  
  /**
    * Not for public API.
    * 
    * Binds required DOM elements to the element manager. this.elemId will point
    * to the node element itself, and this.childContainerId will point to a 
    * container element which will hold the children of this node.
    * this.togglerId is the element containing the toggle button which is used
    * for expanding and collapsing nodes. this.contentId is the element that
    * contains the view that is displayed as the node content.
    * 
    * Also draws the content of the node and the toggler, and disables events.
    * All the actions that can be done with a node go through the content
    * element assigned to the node.
    */
  postDrawBindings: function() {
    
    elem_replace(this.elemId, $(HTreeNode._tmplElementPrefix + this.elemId));
    this.childContainerId =
      this.bindDomElement(HTreeNode._tmplChildrenPrefix + this.elemId);
    
    this.togglerId = this.bindDomElement(
      HTreeNode._tmplTogglerPrefix + this.elemId);
    this.contentId = this.bindDomElement(
      HTreeNode._tmplContentPrefix + this.elemId);

    
    if(this.content) {
      // Make the content relatively positioned and add it to this view's array
      // of subviews.
      this.content.remove();
      this.addView(this.content);
      
      // TODO: Should this be handled by the content object?
      if(this.content.drawn) {
        this.content.refresh();
      }
      else {
        this.content.draw();
      }
      
      prop_set(this.content.elemId, 'position', 'relative', true);
      elem_append(this.contentId, this.content.elemId);
      
      
      if (!this.tree.staticNodeWidth) {
        // Make the content as wide as it needs to be. Overrides the width set in
        // the rect of the element.
        this.content.optimizeWidth();
      }
      
    }
    
    // Toggler button
    this.toggleControl.draw();
    prop_set(this.toggleControl.elemId, 'position', 'relative', true);
    elem_append(this.togglerId, this.toggleControl.elemId);
    this._updateExpansionStatus();
    this.refreshSelectionStatus();

    // All the events for a node are handled by its content.
    this.setEnabled(false);
    
    for(var i = 0; i < this.childNodes.length; i++) {
      this.childNodes[i].postDrawBindings();
    }
    
  },
  
  
/** method: importJSON
  * 
  * Imports a set of structured data into the tree under this node. See 
  * <HTreeControl.importJSON> for details.
  * 
  * Parameters:
  *   _data - Array of data to be imported.
  *   _class - The class of the items to be imported (defaults to <HStringView>).
  *   _rect - A <HRect> object to be used when creating the content objects.
  * 
  * See also:
  *   <HTreeControl.importJSON>
  */
  importJSON: function(_data, _class, _rect) {
    if (!this.tree) {
      // The parent node must be in a tree.
      return;
    }
    this.tree.importJSON(_data, _class, _rect, this);
  },
  
  
  
  
/** event: mouseUp
  * 
  * This is called through the content object of this node when the item is
  * clicked. Handles selection of nodes.
  * 
  * Parameters:
  *   _x - The X coordinate of the point where the mouse button was released.
  *   _y - The Y coordinate of the point where the mouse button was released.
  *
  **/
  mouseUp: function(_x, _y) {
    var _toggleSelect = HEventManager.events[HEventManager.HStatusCtrlKey];
    var _extendSelection = (this.tree.treeType ==
      HTreeControl.H_MULTIPLE_SELECTION_TREE) && _toggleSelect;
    
      
    if (_extendSelection) {
      // Extending the selection while holding down the ctrl key.
      if (this.selected) {
        this.deselect();
      }
      else {
        this.select(true);
      }
    }
    else {
      // Plain old click, no selection extending.
      if (this.selected && _toggleSelect) {
        this.tree.deselectAllNodes();
      }
      else {
        this.select(false);
      }
    }

  }
  
},{

  // The name of the CSS class to be used when...
  
  // the item is selected.
  cssSelected: "selected",
  // the item has subitems and it is expanded.
  cssExpanded: "expanded",
  // the item has subitems and it is collapsed.
  cssCollapsed: "collapsed",
  // an item that may be dropped on this node is hovering above this item.
  cssHover: "hovering",
  
  // Template ID prefixes
  _tmplTogglerPrefix: "treenodetoggler",
  _tmplContentPrefix: "treenodecontent",
  _tmplChildrenPrefix: "treenodechildren",
  _tmplElementPrefix: "treenode"

});




/*** class: HTreeNodeToggleControl
  **
  ** Small helper class that acts as the expand/collapse toggler on the node.
  **
  ** Extends:
  **  <HControl>
  **
  ** See also:
  **  <HTreeControl> <HTreeNode>
  ***/
HTreeNodeToggleControl = HControl.extend({
  
/** constructor: constructor
  *
  * Parameters:
  *   _parentClass - The tree node that this control is to be inserted in.
  *
  **/
  constructor: function(_parentClass) {
    var _rect = new HRect();
    var _options = {
      events:{
        mouseDown: true,
        mouseUp:   false,
        draggable: false,
        droppable: false
      }
    };
    this.base(_rect, _parentClass, _options);
  },
  
  
/** event: mouseDown
  * 
  * Toggles the owner node's expanded/collapsed status.
  * 
  * Parameters:
  *   _x - The X coordinate of the point where the mouse button was clicked.
  *   _y - The Y coordinate of the point where the mouse button was clicked.
  *
  **/
  mouseDown: function(_x, _y) {
    if(this.parent.hasChildren()) {
      this.parent.toggle();
    }
  }
});

/*** class: HTreeControl
  **
  ** HTreeControl is a control unit that displays hierarchical data and allows the user
  ** to expand and collapse its nodes. The navigation interface is one of the most common and
  ** important parts of any application that lets users quickly get desired information.
  ** The HTreeControl offers functionality for selecting, deselecting, adding
  ** and removing nodes. HTreeControl view or theme can be changed; 
  ** the helmiTheme is used by default.
  **
  ** constants: Static constants
  **  H_SINGLE_SELECTION_TREE - A tree type that allows the user to select only
  **                            one item in the tree at a time. This is the
  **                            default setting.
  **  H_MULTIPLE_SELECTION_TREE - A tree type that allows the user to select any
  **                              number of items by holding down an Option key
  **                              or a Shift key.
  ** 
  ** vars: Instance variables
  **  type - '[HTreeControl]'
  **  childNodes - An array of nodes on the tree at the root level.
  **  selectedNodes - An array of currently selected nodes on the tree.
  **  treeType - The type of the tree, either
  **    HTreeControl.H_MULTIPLE_SELECTION_TREE or
  **    HTreeControl.H_SINGLE_SELECTION_TREE (default)
  **  staticNodeWidth - A boolean, false (default) when the nodes should adjust
  **     their width by their content, and true when they should follow the
  **     <HRect> object given in their constructor.
  **  allowNodeDragging - A boolean, false (default) when the nodes on this tree
  **     cannot be dragged, and true when the nodes are draggable.
  **
  ** Extends:
  **  <HControl>
  **
  ** See also:
  **  <HTreeNode>
  ***/
// TODO: Remove duplicate code between HTreeControl and HTreeNode by adding a
// special root node.
HTreeControl = HControl.extend({

  packageName:   "tree",
  componentName: "treecontrol",

/** constructor: constructor
  *
  * Parameters:
  *   _rect - An <HRect> object that sets the position and dimensions of this
  *     control.
  *   _parentClass - The parent view that this control is to be inserted in.
  *   _options - (optional) All other parameters. See <HComponentDefaults> and
  *     <_options> below.
  *
  * vars: _options
  *  allowNodeDragging - A boolean, should the nodes on this tree be draggable.
  *     Defaults to false.
  *  staticNodeWidth - A boolean, should the nodes' content obey the <HRect>
  *     object of the node. Defaults to false, the width is scaled to fit the
  *     content.
  *  treeType - The type of the tree, see <Instance variables> for details.
  *
  **/
  constructor: function(_rect, _parentClass, _options) {
    
    if (!_options) {
      _options = {};
    }
    _options.events = {
      mouseDown: false,
      mouseUp:   false,
      draggable: false
    };
    
    // Default options.
    var _defaults = Base.extend({
      staticNodeWidth: false,
      allowNodeDragging: false,
      treeType: HTreeControl.H_SINGLE_SELECTION_TREE
    });
    this.options = new (_defaults.extend(_options))();
    
    if(this.isinherited) {
      this.base(_rect, _parentClass, _options);
    }
    else {
      this.isinherited = true;
      this.base(_rect, _parentClass, _options);
      this.isinherited = false;
    }

    this.type = '[HTreeControl]';
    
    // When this is true, the component is always drawn with the theme that was
    // active at the creation of the component, not the current theme.
    this.preserveTheme = true;
    
    
    this.childNodes = [];
    
    this.setTreeType(this.options.treeType);
    this.selectedNodes = [];
    
    this.setStaticNodeWidth(this.options.staticNodeWidth);
    this.allowNodeDragging = this.options.allowNodeDragging;
    
    if(!this.isinherited) {
      this.draw();
    }
  },
  
  
/** method: expandAll
  * 
  * Expand all the nodes on this tree.
  *
  * See also:
  *  <HTreeNode.expand>
  **/
  expandAll: function() {
    for(var i = 0; i < this.childNodes.length; i++) {
      this.childNodes[i].expandAllChildren();
      this.childNodes[i].expand();
    }
  },
  
  
/** method: collapseAll
  * 
  * Collapse all the nodes on this tree.
  *
  * See also:
  *  <HTreeNode.collapse>
  **/
  collapseAll: function() {
    for(var i = 0; i < this.childNodes.length; i++) {
      this.childNodes[i].collapseAllChildren();
      this.childNodes[i].collapse();
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
      
      // Add the child nodes under the DOM element by the ID of
      // "treecontrol"+this.elemId
      this.childContainerId = this.bindDomElement(
        HTreeControl._tmplElementPrefix + this.elemId);
      
      // Loop through all the nodes and do some bindings that can't be done before
      // the nodes have been drawn.
      for(var i = 0; i < this.childNodes.length; i++) {
        this.childNodes[i].postDrawBindings();
      }
      
      
      // Add a scroll event to the tree control, otherwise the nodes will have
      // an incorrect position in the cache. The scroll event launches a timeout
      // that is restarted on each scroll event. This way the position cache is
      // not invalidated during scrolling, only when the scrolling stops
      // completely, or pauses for a while.
      var _that = this;
      Event.observe(elem_get(this.childContainerId), 'scroll',
        function(e) {
          if (_that._invalidateTimeout) {
            // Restart the timeout if we are currently scrolling.
            window.clearTimeout(_that._invalidateTimeout);
            _that._invalidateTimeout = null;
          }
          _that._invalidateTimeout = window.setTimeout(
            // 300 ms seems ok, feel free to adjust if necessary.
            function() {
              _that.invalidatePositionCache();
            }, 300);
        }, false);
      this.drawn = true;
    } // if (!this.drawn)
  },
  
  
/** method: drawChildren
  * 
  * Draws all the nodes on this tree. This should be automatically called from
  * the HTML-template when the tree itself is drawn.
  * 
  * Returns:
  *  The markup of the complete node hierarchy that was drawn.
  *
  * See also:
  *  <HTreeNode.drawChildren>
  **/
  drawChildren: function() {
    var _markupString = "";
    for(var i = 0; i < this.childNodes.length; i++) {
      
      this.childNodes[i].draw();
      _markupString += this.childNodes[i].markup;
      
    }
    
    return _markupString;
  },
  
  
/** method: setTreeType
  * 
  * Sets the tree type whether or not it permits multiple selections. The type
  * must be either H_SINGLE_SELECTION_TREE or H_MULTIPLE_SELECTION_TREE.
  * 
  * When converting a multiple selection tree into a single selection tree, the
  * last item that was selected is made the only selection.
  * 
  * Parameters:
  *   _type - The tree type to be set to the object.
  *
  **/
  setTreeType: function(_type) {
    if (this.treeType == HTreeControl.H_MULTIPLE_SELECTION_TREE &&
      _type == HTreeControl.H_SINGLE_SELECTION_TREE &&
      this.selectedNodes.length > 0) {
        
      var _lastSelection = this.selectedNodes[this.selectedNodes.length - 1];
      this.deselectAllNodes();
      this.selectNode(_lastSelection);
      
    }

    this.treeType = _type;
  },
  
  
/** method: selectNode
  * 
  * Selects the _node. If the extend flag is false, as it is by default, this
  * function removes the highlighting from the previously selected item(s) and
  * highlights the new selection. However, if the extend flag is true, the
  * newly selected items are added to the current selection. Selection
  * extending requires that the tree is in multiple selection mode.
  * 
  * If _ignoreSelectionChange is set to true, the hook function
  * selectionChanged() will not be called. This is important for the
  * functionality of internal methods.
  * 
  * Parameters:
  *   _node - The node on the tree that should be selected.
  *   _extendSelection - A boolean that indicates whether the current selection
  *     should be extended or not.
  *   _ignoreSelectionChange - A boolean that indicates whether the hook method
  *     selectionChanged should be called if the selection does change. This is
  *     mostly used by internal methods.
  *
  * See also:
  *  <HTreeNode.select> <selectionChanged>
  **/
  selectNode: function(_node, _extendSelection, _ignoreSelectionChange) {
    var _didChangeSelection = false;
    if (this.treeType == HTreeControl.H_SINGLE_SELECTION_TREE ||
      !_extendSelection) {
      _didChangeSelection = this.deselectAllNodesExcept(_node, true);
    }
    
    // Select the node only if it's not already selected.
    if (!this.isSelectedNode(_node)) {
      _node.selected = true;
      
      // temporary, for the HR demo
      _node.setValue("mouseUp");
      
      this.selectedNodes.push(_node);
      _node.refreshSelectionStatus();
      _didChangeSelection = true;
    }
    
    // Call the hook function if something actually changed.
    if (!_ignoreSelectionChange && _didChangeSelection) {
      this.selectionChanged();
    }
  },


/** method: deselectNode
  * 
  * Deselects _node.
  * 
  * If _ignoreSelectionChange is set to true, the hook function
  * selectionChanged() will not be called. This is important for the
  * functionality of internal methods.
  * 
  * Parameters:
  *   _node - The node on the tree that should be deselected.
  *     should be extended or not.
  *   _ignoreSelectionChange - A boolean that indicates whether the hook method
  *     selectionChanged should be called if the selection does change. This is
  *     mostly used by internal methods.
  *
  * See also:
  *  <HTreeNode.deselect> <selectionChanged>
  **/
  deselectNode: function(_node, _ignoreSelectionChange) {
    if (this.isSelectedNode(_node)) {
      _node.selected = false;
      
      // temporary, for the HR demo
      _node.setValue("");
      
      this.selectedNodes.splice(this.selectedNodes.indexOf(_node), 1);
      _node.refreshSelectionStatus();
    
      // Call the hook function if something actually changed.
      if (!_ignoreSelectionChange) {
        this.selectionChanged();
      }
    }
  },
  
  
/** method: selectAllNodes
  * 
  * Selects all the nodes on this tree. If the tree is in single selection
  * mode, this method doesn't do anything.
  * 
  * See also:
  *  <HTreeNode.selectAllChildren> <selectionChanged>
  **/
  selectAllNodes: function() {
    if (this.treeType == HTreeControl.H_MULTIPLE_SELECTION_TREE) {
      var _didChangeSelection = this.childNodes.length > 0 &&
        (this.selectedNodes.length != this.childNodes.length);
      
      // Ignore the selection change on all the child selects. This way the hook
      // function gets called only once for each selectAllNodes() call.
      for(var i = 0; i < this.childNodes.length; i++) {
        this.childNodes[i].selectAllChildren(true);
        this.childNodes[i].select(true, true);
      }

      // Call the hook function if something actually changed.
      if (_didChangeSelection) {
        this.selectionChanged();
      }
    }
  },
  
  
/** method: deselectAllNodes
  * 
  * Deselects all the nodes on this tree.
  * 
  * If _ignoreSelectionChange is set to true, the hook function
  * selectionChanged() will not be called. This is important for the
  * functionality of internal methods.
  * 
  * Parameters:
  *   _ignoreSelectionChange - A boolean that indicates whether the hook method
  *     selectionChanged should be called if the selection does change. This is
  *     mostly used by internal methods.
  * 
  * Returns:
  *   True if the selection on the tree changed, false if it didn't.
  *
  * See also:
  *  <HTreeNode.deselectAllChildren> <selectionChanged>
  **/
  deselectAllNodes: function(_ignoreSelectionChange) {
    var _didChangeSelection = (this.selectedNodes.length > 0);
    var _notifySelectionChange = !_ignoreSelectionChange && _didChangeSelection;
      
    // Ignore the selection change on all the child deselects. This way the hook
    // function gets called only once for each deselectAllNodes() call.
    while(this.selectedNodes.length > 0) {
      this.deselectNode(this.selectedNodes[0], true);
    }
    
    if (_notifySelectionChange) {
      this.selectionChanged();
    }
    return _didChangeSelection;
  },
  
  
/** method: deselectAllNodesExcept
  * 
  * Deselects all but _node on this tree.
  * 
  * If _ignoreSelectionChange is set to true, the hook function
  * selectionChanged() will not be called. This is important for the
  * functionality of internal methods.
  * 
  * Parameters:
  *   _node - The node that is _not_ to be deselected.
  *   _ignoreSelectionChange - A boolean that indicates whether the hook method
  *     selectionChanged should be called if the selection does change. This is
  *     mostly used by internal methods.
  * 
  * Returns:
  *   True if the selection on the tree changed, false if it didn't.
  *
  * See also:
  *   <selectionChanged>
  **/
  deselectAllNodesExcept: function(_node, _ignoreSelectionChange) {
    var _didChangeSelection = false;
    if (!this.isSelectedNode(_node)) {
      // If the _node is not selected, just call deselectAllNodes().
      _didChangeSelection = this.deselectAllNodes(_ignoreSelectionChange);
    }
    else {
      // Temporarily remove the _node from the array of selected items.
      this.selectedNodes.splice(this.selectedNodes.indexOf(_node), 1);
      _didChangeSelection = this.deselectAllNodes(_ignoreSelectionChange);
      this.selectedNodes.splice(0, 0, _node);
    }
    return _didChangeSelection;
  },
  
  
/** method: selectedNode
  * 
  * Returns the first selected node on the tree or null when nothing is
  * selected. Helpful when using a single select tree.
  * 
  * Returns:
  *   The node that is currently selected.
  *
  **/
  selectedNode: function() {
    if (this.selectedNodes.length > 0) {
      return this.selectedNodes[0];
    }
    return null;
  },
  
  
/** method: isSelectedNode
  * 
  * Returns true if the given node is selected on this tree, and false if it's
  * not.
  * 
  * Parameters:
  *   _node - The node that is being inspected.
  * 
  * Returns:
  *   A boolean, selection status of the _node.
  *
  **/
  isSelectedNode: function(_node) {
    return (this.selectedNodes.indexOf(_node) > -1);
  },
  
  
/** method: removeAllNodes
  * 
  * Removes all nodes from the tree recursively.
  * 
  * See also:
  *  <HTreeNode.removeAllChildren> <childNodeRemoved>
  **/
  removeAllNodes: function() {
    for(var i = this.childNodes.length - 1; i >= 0; i--) {
      this.childNodes[i].removeAllChildren();
      this.childNodes[i].removeFromParent();
    }
  },
  
  
/** method: importJSON
  * 
  * Imports a set of structured data into the tree.
  * 
  * Data might look something like this:
  *
  * > [
  * >   {
  * >     value:"item 0",
  * >     children:[
  * >       {value:"item 0-1", children:[]},
  * >       {value:"item 0-2", children:[]},
  * >       {value:"item 0-3", children:[]},
  * >       {value:"item 0-4", children:[
  * >         {value:"item 0-4-0", children:[]},
  * >         {value:"item 0-4-1", children:[]},
  * >         {value:"item 0-4-2", children:[]},
  * >         {value:"item 0-4-3", children:[]}
  * >       ]}
  * >     ]
  * >   }
  * > ]
  * 
  * The key 'children' has a special meaning, it contains the array of child
  * nodes of the node being handled. Other keys are treated as values, and
  * they are injected to the created node content after it has been
  * constructed. First, the import script tries to use a setter method for the
  * current value (eg. value has a setter setValue), and if that doesn't
  * exist, the value is assigned directly to that object.
  * Only single argument setters are supported.
  * 
  * Parameters:
  *   _data - Array of data to be imported.
  *   _class - The class of the items to be imported (defaults to <HStringView>).
  *   _rect - A <HRect> object to be used when creating the content objects.
  *   _parentNode - The node that the new nodes are to be imported under. When
  *     omitted, the nodes are created under the root.
  * 
  * See also:
  *  <HTreeNode.importJSON>
  **/
  importJSON: function(_data, _class, _rect, _parentNode) {
    if (typeof(_class) == "undefined" || _class == null) {
      _class = HStringView;
    }
    if (typeof(_rect) == "undefined" || _rect == null) {
      _rect = new HRect();
    }
    if (typeof(_parentNode) == "undefined" || _parentNode == null) {
      _parentNode = this;
    }
    this._insertItems(_data, _class, _parentNode, _rect);
  },
  /**
    * Private method.
    * Recursive import method called from importJSON.
    */
  _insertItems: function(_data, _class, _parent, _rect) {

    var l = _data.length;
    for (var i = 0; i < l; i++) {
      // We should use default constructor here to keep it general, but
      // currently our classes need a parent, and usually a rect too.
      var _item = new _class(_rect, this.app);
      
      for (var _key in _data[i]) {
        // Inject item's member variables from the data. For example the value
        // of _data[i].text is placed in _item.text. Children is a special
        // variable in the data set, thus skipped.
        if (_key != "children") {
          
          var _methodName = _key.substring(0, 1).toUpperCase() +
            _key.substring(1, _key.length);
          _methodName = "set" + _methodName;
          
          if (eval("_item." + _methodName)) {
            // Call setter method.
            eval("_item." + _methodName + "(_data[i][_key])");
          }
          else {
            // No properly named method found, place the value into a property.
            _item[_key] = _data[i][_key];
          }
        }
      }
      
      var _newNode = new HTreeNode(_parent, _item);
      this._insertItems(_data[i].children, _class, _newNode, _rect);
    }

  },
  
  
/** method: setStaticNodeWidth
  * 
  * Nodes' content objects need to implement the <HView.optimizeWidth> method in
  * order to make this effective.
  * 
  * Parameters:
  *   _flag - A boolean, false if the nodes should adjust their width by their
  *   content, and true when they should follow the <HRect> object given in
  *   their constructor.
  * 
  * See also:
  *  <HView.optimizeWidth>
  **/
  setStaticNodeWidth: function(_flag) {
    this.staticNodeWidth = _flag;
  },
  
  
  // TODO: Unnecessary code repetition with tree node. Maybe consider
  // implementing a root node.
/** method: hasChildren
  * 
  * Checks if the tree has child nodes.
  * 
  * Returns:
  *   True if the tree has child nodes and false if it doesn't.
  * 
  * See also:
  *  <HTreeNode.hasChildren>
  **/
  hasChildren: function() {
    return (this.childNodes.length > 0);
  },
  
  
/** method: addChildNode
  * 
  * Adds a node to the tree.
  * 
  * Parameters:
  *   _node - The node to be added into this tree.
  * 
  * See also:
  *  <HTreeNode.addChildNode> <childNodeAdded>
  **/
  addChildNode: function(_node) {
    _node.setTree(this);
    this.childNodes.push(_node);
    if (this.drawn) {
      _node.addDomNode();
    }
    
    this.childNodeAdded(this, _node);
  },
  
  
/** method: removeChildNode
  * 
  * Removes a node from the tree.
  * 
  * Parameters:
  *   _node - The node to be removed from this tree.
  * 
  * See also:
  *  <HTreeNode.removeChildNode> <childNodeRemoved>
  **/
  removeChildNode: function(_node) {
    _node.deselect();
    _node.removeDomNode();
    _node.tree = null;
    this.childNodes.splice(this.childNodes.indexOf(_node), 1);
    
    this.childNodeRemoved(this, _node);
  },
  // //
  
  
/** method: selectionChanged
  * 
  * Implemented by derived classes to do whatever they please when the selection
  * on the tree changes.
  * 
  **/
  selectionChanged: function() {
    // Intentionally left blank.
  },
  
  
/** method: childNodeAdded
  * 
  * Implemented by derived classes to do whatever they please when a node on
  * the tree gains child nodes.
  * 
  * Parameters:
  *   _parentNode - The node that gained a new child.
  *   _childNode - The node that was added to _parentNode.
  * 
  **/
  childNodeAdded: function(_parentNode, _childNode) {
    // TODO: Actually, the _parentNode can be a tree object as well... The root
    // node implementation seems to be the way to go.

    // Intentionally left blank.
  },
  
  
/** method: childNodeRemoved
  * 
  * Implemented by derived classes to do whatever they please when a node on
  * the tree loses child nodes.
  * 
  * Parameters:
  *   _parentNode - The node that lost a child.
  *   _childNode - The node that was removed from _parentNode.
  * 
  **/
  childNodeRemoved: function(_parentNode, _childNode) {
    // TODO: Actually, the _parentNode can be a tree object as well... The root
    // node implementation seems to be the way to go.

    // Intentionally left blank.
  }

},{
  // Class methods and properties
  
  // The user can select only one item in the tree at a time. This is the
  // default setting.
  H_SINGLE_SELECTION_TREE: 0,
  
  // The user can select any number of items by holding down an Option key (for
  // discontinuous selections) or a Shift key (for contiguous selections).
  H_MULTIPLE_SELECTION_TREE: 1,
  
  // Template ID prefixes
  _tmplElementPrefix: "treecontrol"
  
});

/** class: HWindowLabel
  *
  * HWindowLabel responds to drag passthrough drag events and is responsible for displaying the label of the <HWindowBar>.
  *
  * It's also used to show the themeable background for the content area of windows.
  * Use <HWindowControl> as the interface, don't use the HWindowLabel directly.
  *
  * vars: Instance variables
  *  type - '[HWindowLabel]'
  *
  * Extends:
  *  <HButton>
  *
  * See Also:
  *  <HWindowControl> <HWindowView> <HWindowBar> <HButton>
  *
  * NOTE:
  *  HWindow -components are still evolving.
  *
  **/
HWindowLabel = HButton.extend({
  
  packageName:   "window",
  componentName: "windowlabel",

/** constructor: constructor
  *
  * Basically just a passthrough for <HButton.constructor> it only differs by making sure drag events are registered.
  * Nothing special, constructed by <HWindowControl>
  *
  **/
  constructor: function(_rect,_parentClass,_options) {
    
    // Check the existence of _options
    if(!_options){
      _options={};
    }
    if(!_options.events){
      _options.events = {};
    }
    // Make sure the draggable event is set.
    if(!_options.events.draggable){
      _options.events.draggable=true;
    }
    
    if(this.isinherited){
      this.base(_rect,_parentClass,_options);
    }
    else {
      this.isinherited = true;
      this.base(_rect,_parentClass,_options);
      this.isinherited = false;
    }
    
    this.type = '[HWindowLabel]';
    
    if(!this.isinherited){
      this.draw();
    }
  },
  
 /** 
   * Sets the windowcontrol activated when the windowbar/label gets activated
   *
   **/  
  gainedActiveStatus: function(_lastActiveControl) {
    HEventManager.changeActiveControl(this.parent.parent);  
  },
  
  
/** event: startDrag
  *
  * Just a passthrough to <HWindowControl.startDrag>
  *
  **/
  startDrag: function(_x, _y){
    this.parent.parent.startDrag(_x, _y);
  },
 
/** event: doDrag
  *
  * Just a passthrough to <HWindowControl.doDrag>
  *
  **/
  doDrag: function(_x, _y){
    this.parent.parent.doDrag(_x, _y);
  },
  
/** event: endDrag
  *
  * Just a passthrough to <HWindowControl.endDrag>
  *
  **/
  endDrag: function(_x, _y){
    this.parent.parent.endDrag(_x, _y);
  }
  
});


/** class: HWindowBar
  *
  * HWindowBar responds to drag passthrough drag events and is responsible for 
  * displaying the <HWindowLabel> and misc window header stuff, like close, zoom and
  * minimize buttons.
  *
  * It's also used to show the themeable background for the title/header area of windows.
  * Use <HWindowControl> as the interface, don't use the HWindowBar directly.
  *
  * vars: Instance variables
  *  type - '[HWindowBar]'
  *
  * Extends:
  *  <HButton>
  *
  * See Also:
  *  <HWindowControl> <HWindowView> <HWindowLabel> <HButton>
  *
  * NOTE:
  *  HWindow -components are still evolving.
  *
  **/
HWindowBar = HButton.extend({
  
  packageName:   "window",
  componentName: "windowbar",

/** constructor: constructor
  *
  * Basically just a passthrough for <HButton.constructor> it only differs by making sure drag events are registered.
  * Nothing special, constructed by <HWindowControl>
  *
  **/
  constructor: function(_rect,_parentClass,_options) {
    // test if draggability is needed
    if(!_options){
      _options={};
    }
    if(!_options.events){
      _options.events = {};
    }
    if(!_options.events.draggable){
      _options.events.draggable=true;
    }
    
    if(this.isinherited){
      this.base(_rect,_parentClass,_options);
    }
    else {
      this.isinherited = true;
      this.base(_rect,_parentClass,_options);
      this.isinherited = false;
    }
    
    this.type = '[HWindowBar]';
    
    if(!this.isinherited){
      this.draw();
    }
  },
  /**
    * Forwards setLabel to this.parent.windowLabel
    */
  setLabel: function(_label) {
    this.label = _label;
    if(this.parent.windowLabel) {
      this.parent.windowLabel.setLabel(_label);
    }
  },
  
  startDrag: function(_x, _y){
    this.parent.startDrag(_x, _y);
  },
 
  doDrag: function(_x, _y){
    this.parent.doDrag(_x, _y);
  },
  
  endDrag: function(_x, _y){
    this.parent.endDrag(_x, _y);
  }
});


/** class: HWindowView
  *
  * HWindowView has no logic functionality at except basic View management inherited from <HView>.
  *
  * Its sole purpose is to act as a themeable background for the content area of windows.
  * Use <HWindowControl> as the interface, don't use the HWindowView directly.
  *
  * vars: Instance variables
  *  type - '[HWindowView]'
  *
  * Extends:
  *  <HView>
  *
  * See Also:
  *  <HWindowControl> <HWindowLabel> <HWindowBar> <HView>
  *
  * NOTE:
  *  HWindow -components are still evolving.
  *
  **/
HWindowView = HView.extend({
  
  packageName:   "window",
  componentName: "windowview",

/** constructor: constructor
  *
  * Basically just a passthrough for <HView.constructor> it only differs by defining theme
  * preservation and the instance type.
  * Nothing special, constructed by <HWindowControl>
  *
  **/
  constructor: function(_rect,_parentClass) {
    if(this.isinherited){
      this.base(_rect,_parentClass);
    }
    else {
      this.isinherited = true;
      this.base(_rect,_parentClass);
      this.isinherited = false;
    }
    
    this.type = '[HWindowView]';
    
    // When this is true, the component is always drawn with the theme that was
    // active at the creation of the component, not the current theme.
    this.preserveTheme = true;
    
    if(!this.isinherited){
      this.draw();
    }
  },
  
/** method: draw
  *
  * Nothing special, gets drawn by <HWindowControl>
  **/
  draw: function() {
    if(!this.drawn){
      this.drawMarkup();
      
      // Bind the element from the HTML template.
      var _temp_id = this.bindDomElement(
        HWindowView._tmplElementPrefix + this.elemId);
      
      if (!_temp_id) {
        throw("HWindowView: The HTML template must have an element with " +
          "the ID '" + HWindowView._tmplElementPrefix + " + this.elemId'.");
      }
      
      // Place the new element as this element's sibling.
      elem_append(this.parent.elemId, _temp_id);
      
      // Move the original element into the document body.
      elem_append(0, this.elemId);
      
      // Delete the original element.
      elem_del(this.elemId);
      
      // Place the new element into the element cache in the same position as
      // the original element was in.
      elem_replace(this.elemId, elem_get(_temp_id));
    }
    this.drawRect();
  }
  
},{
  _tmplElementPrefix: "windowview"
});
/** class: HWindowControl
  *
  * HWindowControl (with alias HWindow) is the main component of the HWindow classes.
  * HWindowControl is a control unit that represents an open window in the browser. 
  * A window component can contain a lot of different GUI components including other window
  * components. HWindow components support both dragging and resizing functionality. 
  * HWindow view or theme can be changed; the helmiTheme is used by default.
  * Use HWindow to have user-positionable views that contain other objects.
  *
  * vars: Instance variables
  *  type - '[HWindowControl]'
  *  options - Contains various window-related options.
  *  windowBar - The Window Titlebar and control button container view object.
  *  windowLabel - The Window Title label object.
  *  windowView - The Window component container view object. Has scrollbars visible by automatically.
  *
  * Extends:
  *  <HControl>
  *
  * See Also:
  *  <HWindowBar> <HWindowView> <HWindowLabel> <HControl>
  *
  * NOTE:
  *  HWindow -components are still evolving.
  *
  **/
HWindowControl = HControl.extend({
  
  packageName:   "window",
  componentName: "windowcontrol",
/** constructor: constructor
  *
  * The first two parameters are the same as with <HView>, but additionally
  * sets the label and events.
  *
  * Parameters:
  *  _rect - The rectangle of the component. See <HView.constructor>.
  *  _parentClass - The parent component of the component. See <HView.constructor>.
  *  _options - (optional) All other parameters. See <HComponentDefaults> and <_options> below.
  *
  * vars: _options
  *  label - The label to draw to the titlebar. Default: 'Untitled'
  *
  *  minSize - The minimum size allowed for the window - [width,height]. Default: [0,0]
  *  maxSize - The maximum size allowed for the window - [width,height]. Default: [4096,3072]
  *  barHeight - The window title bar height, in pixels. Default: 21
  *
  *  resizeW   - The left resizeable border area. Default: 4
  *  resizeE   - The right resizeable border area. Default: 4
  *  resizeN   - The top resizeable border area. Default: 4
  *  resizeS   - The bottom resizeable border area. Default: 4
  *
  *  resizeNW   - The top-left resizeable corner area. Default: [4,4]
  *  resizeNE   - The top-right resizeable corner area. Default: [4,4]
  *  resizeSW   - The bottom-left resizeable corner area. Default: [4,4]
  *  resizeSE   - The bottom-right resizeable corner area. Default: [16,16]
  *
  **/
  constructor: function(_rect, _parentClass, _options) {
    
    if(!_options) {
      _options={};
    }
    var _defaults = Base.extend({
      minSize:   [64,32],
      maxSize:   [4096,3072],
      barHeight: 21,
      resizeW:   4,
      resizeE:   4,
      resizeN:   4,
      resizeS:   4,
      resizeNW:  [ 4,  4],
      resizeNE:  [ 4,  4],
      resizeSW:  [ 4,  4],
      resizeSE:  [16, 16],
      menuBar: null
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
    
    this.type = '[HWindowControl]';
    
    this.preserveTheme = true;
    
    // Calculate sub-rectangle sizes
    this._resetWindowFlags();
    
    this.setDraggable(true);
    
    this.drawRect();
    this.drawMarkup();
    
    // Initialize specialized window views/controls:
    this._calcWindowPartRects();
    
    this.windowBar = new HWindowBar(
      this._windowFlags.windowBarRect,
      this,
      {label: this.label}
    );
    this.windowBar.draw();
    
    
    this.windowLabel = new HWindowLabel(
      this._windowFlags.windowLabelRect, this.windowBar, {label: this.label});
    this.windowLabel.draw();
    
    this.windowView = new HWindowView(
      this._windowFlags.windowViewRect,
      this
    );
    this.windowView.draw();
    this.setLabel(this.label);
    
    if (_options.menuBar) {
      this.setMenuBar(_options.menuBar);
    }
    
    if(!this.isinherited) {
      this.draw();
    }
  },

/** private: _resetWindowFlags
  *
  * Builds rectangles for coordinate calculation.
  *
  **/
  _resetWindowFlags: function() {
    
    // Used internally by the window to keep track of what modes it is in
    this._windowFlags = {
      dragWindow: false,
      resizeW:    false,
      resizeE:    false,
      resizeN:    false,
      resizeS:    false,
      resizeNW:   false,
      resizeNE:   false,
      resizeSW:   false,
      resizeSE:   false,
      
    /***
      ** Calculate rectangles that the mouse pointer should be inside of to respond to different events.
      ***/
      dragWindowRect: new HRect(
        this.options.resizeW,
        this.options.resizeN,
        this.rect.width        - this.options.resizeE,
        this.options.barHeight + this.options.resizeN
      ),
      
      resizeNRect:    new HRect(
        this.options.resizeW,
        0,
        this.rect.width - this.options.resizeE,
        this.options.resizeN
      ),
      resizeSRect:    new HRect(
        this.options.resizeW,
        this.rect.height - this.options.resizeS,
        this.rect.width  - this.options.resizeE,
        this.rect.height
      ),
      resizeWRect:    new HRect(
        0,
        this.options.resizeN,
        this.options.resizeW,
        this.rect.height - this.options.resizeS
      ),
      resizeERect:    new HRect(
        this.rect.width - this.options.resizeE,
        this.options.resizeN,
        this.rect.width,
        this.rect.height - this.options.resizeS
      ),
      
      resizeNWRect:   new HRect(
        0,
        0,
        this.options.resizeNW[0],
        this.options.resizeNW[1]
      ),
      resizeNERect:   new HRect(
        this.rect.width - this.options.resizeNE[0],
        0,
        this.rect.width,
        this.options.resizeNE[1]
      ),
      resizeSWRect:   new HRect(
        0,
        this.rect.height - this.options.resizeSW[1],
        this.options.resizeSW[0],
        this.rect.height
      ),
      resizeSERect:   new HRect(
        this.rect.width  - this.options.resizeSE[0],
        this.rect.height - this.options.resizeSE[1],
        this.rect.width,
        this.rect.height
      )
    };
  },
  
/** private: _checkWindowSizeConstrains
  *
  * Checks, that the window is in allowed position/size bounds.
  *
  **/
  _checkWindowSizeConstrains: function() {
    
    // Was the window resized using a drag handle on the west side or the north
    // side of the window.
    var _resizeWest = this._windowFlags.resizeW ||
      this._windowFlags.resizeSW || this._windowFlags.resizeNW;
    var _resizeNorth = this._windowFlags.resizeN ||
      this._windowFlags.resizeNE || this._windowFlags.resizeNW;
    
    // Min/max width
    // Since HRect.setWidth() changes only the rectangle's right property,
    // resizing by the west edge or corners should make sure that the left
    // property doesn't change.
    if(this.rect.width < this.options.minSize[0]) {
      // The width has fallen below the minimum width. Force the width to the
      // minimum value.
      
      if (_resizeWest) {
        this.rect.left = this.rect.right - this.options.minSize[0];
      }
      
      this.rect.setWidth(this.options.minSize[0]);
      
    } else if(this.rect.width > this.options.maxSize[0]) {
      // The width has exceeded the maximum width. Force the width to the
      // maximum value.
      
      if (_resizeWest) {
        this.rect.left = this.rect.right - this.options.maxSize[0];
      }
      
      this.rect.setWidth(this.options.maxSize[0]);
      
    }
    
    // Min/max height
    // Since HRect.setHeight() changes only the rectangle's bottom property,
    // resizing by the north edge or corners should make sure that the top
    // property doesn't change.
    if(this.rect.height < this.options.minSize[1]) {
      // The height has fallen below the minimum height. Force the height to the
      // minimum value.
      
      if (_resizeNorth) {
        this.rect.top = this.rect.bottom - this.options.minSize[1];
      }
      
      this.rect.setHeight(this.options.minSize[1]);
      
    } else if(this.rect.height > this.options.maxSize[1]) {
      // The height has exceeded the maximum height. Force the height to the
      // maximum value.
      
      if (_resizeNorth) {
        this.rect.top = this.rect.bottom - this.options.maxSize[1];
      }
      
      this.rect.setHeight(this.options.maxSize[1]);
      
    }
    
    // Inside window
    var _leftLimit = 0 - this.options.resizeW;
    if(this.rect.left < _leftLimit) {
      this.rect.left = _leftLimit;
      this.rect.right = this.rect.width + _leftLimit;
    }
    var _topLimit = 0 - this.options.resizeN;
    if(this.rect.top < _topLimit) {
      this.rect.top = _topLimit;
      this.rect.bottom = this.rect.height + _topLimit;
    }
  },
  
/** private: startDrag
  *
  * Sets starting/previous <HPoint> of the cursor and starting <HRect> of the window.
  * Checks what the dragging action should do, if anything.
  *
  **/
  startDrag: function(_x, _y) {
    
    this._startPointCRSR  = new HPoint( _x, _y );
    this._prevPointCRSR   = new HPoint( _x, _y );
    this._startRectOfWin  = new HRect( this.rect );
    
    // Choose the window resize/drag mode, only one of them will be selected.
    this._resetWindowFlags();
    var _pointInWin = this._startPointCRSR.subtract( this._startRectOfWin.leftTop );
    if(this._windowFlags.resizeNWRect.contains(_pointInWin)) {
      this._diffPoint = _pointInWin;
      this._windowFlags.resizeNW = true;
    } else if(this._windowFlags.resizeNERect.contains(_pointInWin)) {
      this._diffPoint = this._startPointCRSR.subtract(this._startRectOfWin.rightTop);
      this._windowFlags.resizeNE = true;
    } else if(this._windowFlags.resizeSWRect.contains(_pointInWin)) {
      this._diffPoint = this._startPointCRSR.subtract(this._startRectOfWin.leftBottom);
      this._windowFlags.resizeSW = true;
    } else if(this._windowFlags.resizeSERect.contains(_pointInWin)) {
      this._diffPoint = this._startPointCRSR.subtract(this._startRectOfWin.rightBottom);
      this._windowFlags.resizeSE = true;
    } else if(this._windowFlags.resizeNRect.contains(_pointInWin)) {
      this._diffPoint = _y-this.rect.top;
      this._windowFlags.resizeN = true;
    } else if(this._windowFlags.resizeSRect.contains(_pointInWin)) {
      this._diffPoint = _y-this.rect.bottom;
      this._windowFlags.resizeS = true;
    } else if(this._windowFlags.resizeWRect.contains(_pointInWin)) {
      this._diffPoint = _x-this.rect.left;
      this._windowFlags.resizeW = true;
    } else if(this._windowFlags.resizeERect.contains(_pointInWin)) {
      this._diffPoint = _x-this.rect.right;
      this._windowFlags.resizeE = true;
    } else if(this._windowFlags.dragWindowRect.contains(_pointInWin)) {
      this._diffPoint = this._startPointCRSR.subtract(this._startRectOfWin.leftTop);
      this._windowFlags.dragWindow = true;
    }
    this.bringToFront();
    
    this.doDrag(_x, _y);
  },
  
/** private: doDrag
  *
  * Sets previous <HPoint> of the cursor and calculates a new <HRect> for the window.
  * Performs rectangle calculation depending on where the <startDrag> coordinate was.
  *
  **/
  doDrag: function(_x, _y) {
    var _targetPoint;
    var _currPointCRSR = new HPoint( _x, _y );
    if(!this._prevPointCRSR.equals(_currPointCRSR)) {
      if(this._windowFlags.resizeNW == true) {
        _targetPoint = _currPointCRSR.subtract( this._diffPoint );
        this.rect.setLeftTop( _targetPoint );
      } else if(this._windowFlags.resizeNE == true) {
        _targetPoint = _currPointCRSR.subtract( this._diffPoint );
        this.rect.setRightTop( _targetPoint );
      } else if(this._windowFlags.resizeSW == true) {
        _targetPoint = _currPointCRSR.subtract( this._diffPoint );
        this.rect.setLeftBottom( _targetPoint );
      } else if(this._windowFlags.resizeSE == true) {
        _targetPoint = _currPointCRSR.subtract( this._diffPoint );
        this.rect.setRightBottom( _targetPoint );
      } else if(this._windowFlags.resizeN == true) {
        _targetPoint = _y - this._diffPoint;
        this.rect.top = _targetPoint;
        this.rect.updateSecondaryValues();
      } else if(this._windowFlags.resizeS == true) {
        _targetPoint = _y - this._diffPoint;
        this.rect.bottom = _targetPoint;
        this.rect.updateSecondaryValues();
      } else if(this._windowFlags.resizeW == true) {
        _targetPoint = _x - this._diffPoint;
        this.rect.left = _targetPoint;
        this.rect.updateSecondaryValues();
      } else if(this._windowFlags.resizeE == true) {
        _targetPoint = _x - this._diffPoint;
        this.rect.right = _targetPoint;
        this.rect.updateSecondaryValues();
      } else if(this._windowFlags.dragWindow == true) {
        _targetPoint = _currPointCRSR.subtract( this._diffPoint );
        this.rect.offsetTo( _targetPoint );
      }
      this._checkWindowSizeConstrains();
      
      this.setStyle('left', this.rect.left + 'px', true);
      this.setStyle('top', this.rect.top + 'px', true);
      this.setStyle('width', this.rect.width + 'px', true);
      this.setStyle('height', this.rect.height + 'px', true);
      
      if(this._windowFlags.dragWindow == false) {
        this._calcWindowPartRects();
      }
      this._prevPointCRSR = _currPointCRSR;
    }
  },
  
/** private: endDrag
  *
  * Same as <doDrag>. Drags end automatically through the <HEventManager>.
  *
  **/
  endDrag: function(_x, _y) {
    this.doDrag(_x, _y);
  },
  
/** private: _calcWindowPartRects
  *
  * Calculates sub-view rectangles. Decides where the windowBar, windowLabel and windowView goes.
  *
  **/
  _calcWindowPartRects: function() {
    
    // Indent by the amount of resize control border
    var _windowBarRect = new HRect(
      this.options.resizeW,
      this.options.resizeN,
      this.rect.width - this.options.resizeE,
      this.options.barHeight + this.options.resizeN
    );
    
    var _windowLabelRect = new HRect(
      0,
      0,
      _windowBarRect.width,
      _windowBarRect.height
    );
    
    // Indent by the amount of resize control border
    var _windowViewRect = new HRect(
      this.options.resizeW,
      this.options.resizeN + this.options.barHeight,
      this.rect.width - this.options.resizeE,
      this.rect.height - this.options.resizeS
    );
    
    // If there's a menu bar attached to this window, shrink the window view so
    // that it will fit inside the window.
    if (this.menuBar) {
      var _menuBarHeight = this.options.menuBarHeight;
      
      // If the window is resized so small that the menu bar does not fit in, 
      // decrease the height of the menu bar temporarily.
      if (_menuBarHeight + this.options.resizeN + this.options.barHeight >
        this.rect.height - this.options.resizeS) {
        _menuBarHeight = this.rect.height - this.options.barHeight -
          this.options.resizeS - this.options.resizeN;
      }
      
      _windowViewRect.setTop(_windowViewRect.top + _menuBarHeight);
      // Make the menu bar's as wide as the window view.
      this.menuBar.resizeTo(_windowViewRect.width, _menuBarHeight);
    }
    
    
    if(!this._windowFlags.windowBarRect) {
      
      this._windowFlags.windowBarRect = _windowBarRect;
      this._windowFlags.windowLabelRect = _windowLabelRect;
      this._windowFlags.windowViewRect = _windowViewRect;
      
    } else {
      
      this.windowBar.setRect(_windowBarRect);
      this.windowLabel.setRect(_windowLabelRect);
      this.windowView.setRect(_windowViewRect);
      
    }
  },
  
/** method: draw
  *
  * Just refreshes the rect.
  *
  **/
  draw: function() {
    this.drawRect();
  },
  
/** method: setLabel
  *
  * Sets the title bar label of the window.
  *
  * Parameters:
  *  _label - A new title label for the window.
  *
  * Hint:
  *  _label takes html, so you may also specify an icon or other custom content in the title bar.
  *
  **/
  setLabel: function(_label) {
    if(this.drawn) {
      this.windowLabel.setLabel(_label);
    }
    this.base(_label);
  },
  
/** method: refresh
  *
  * Sets the correct positions of this view and its subviews.
  *
  **/
  refresh: function() {
    if(this.windowBar) {
      this.windowBar.refresh();
    }
    this.drawRect();
  },
  
  
/** method: setMenuBar
  *
  * Attaches the given <HMenuBar> to this window so that it will be shown below
  * the window bar. If there already is a menu bar in this window, the old one
  * will be replaced by the new one. Pass a null to remove the current menu bar
  * without adding a new one.
  * 
  * Parameters:
  *  _menuBar - <HMenuBar> to be attached to this window, or null to remove the
  *             currently attached menu bar.
  *
  **/
  setMenuBar: function(_menuBar) {
    
    if (_menuBar == this.menuBar) {
      return;
    }
    
    // Delete the existing menu bar first.
    if (this.menuBar) {
      this.menuBar.die();
    }
    
    this.menuBar = _menuBar;
    
    if (_menuBar) {
    
      // Store the original menu bar height.
      this.options.menuBarHeight = this.menuBar.rect.height;
      
      // Move the menu bar from its original location into the window control.
      this.menuBar.remove();
      this.addView(this.menuBar);
      elem_append(this.elemId, this.menuBar.elemId);
      
      // Align the menu bar with the window view.
      this.menuBar.moveTo(this.windowView.rect.left,
        this.windowBar.rect.bottom);
      
    }
    
    this._calcWindowPartRects();
  }
  
});

/** class: HWindow
***
*** Alias for <HWindowControl>
**/
HWindow = HWindowControl;

/** class: HTabLabel
  *
  * HTabLabel displays the 'tab title button' above the tab view.
  * Use <HTabControl> as the interface, don't use HTabLabel directly.
  *
  * vars: Instance variables
  *  type - '[HTabControl]'
  *  highlight - The highlight status of the tab. True when tab is selected,
  *            otherwise false.
  *
  * Extends:
  *  <HControl>
  *
  * See Also:
  *  <HTabControl> <HTabBar> <HTabView> <HView>
  *
  * NOTE:
  *  HTab -components are still evolving.
  *
  **/
HTabLabel = HButton.extend({
  
  packageName:   "tab",
  componentName: "tablabel",

  constructor: function(_rect, _parentClass, _options) {
    
    if(!_options) {
      var _options = {};
    }
    
    // Throw some errors, if used incorrectly.
    // NOTE: Zero is a valid ID value, we cannot use if (!_options.tabId) to
    // check for errors.
    if(!_options.label) {
      throw("HTabLabelConstructionError: No label specified!");
    }
    if(null === _options.tabId || undefined === _options.tabId) {
      throw("HTabLabelConstructionError: No id specified!");
    }
    if(!_options.tabControl) {
      throw("HTabLabelConstructionError: No control specified!");
    }
    
    // This will default to false
    if(!_options.highlight) {
      _options.highlight = false;
    }
    
    // Should always listen to mouseDown (to activate itself)
    if(!_options.events) {
      _options.events = {
        mouseDown: true
      };
    }
    
    if(this.isinherited) {
      this.base(_rect, _parentClass, _options);
    }
    else {
      this.isinherited = true;
      this.base(_rect, _parentClass, _options);
      this.isinherited = false;
    }
    
    this.type = '[HTabLabel]';
    
    this._tmplHighlightPrefix = "tabhighlight";
    
    this.tabControl = _options.tabControl;
    this.tabId = _options.tabId;
    
    this.setHighlight(_options.highlight);
    
    if(!this.isinherited) {
      this.draw();
    }
  },
  
/** method: setHighlight
  *
  * Sets the tab 'highlighted' or not, depending on the flag parameter. Called
  * via <HTabControl.selectTab>. Actual functionality in <refresh>
  *
  * Parameters:
  *  _flag - A flag that tells the label to highlight when true and hide the
  *          highlight when false.
  *
  * See also:
  *  <HTabControl.selectTab> <refresh>
  **/
  setHighlight: function(_flag) {
    this.highlight = _flag;
    if(_flag) {
      this.tabControl.selectTab(this.tabId);
    }
    this.refresh();
  },
  
/** event: mouseDown
  * 
  * Performs tab selection/highlights.
  * Actual functionality in <HTabControl.selectTab> and <setHighlight>.
  * 
  * See also:
  *  <HTabControl.selectTab> <setHighlight>
  **/
  mouseDown: function(_x, _y, _button) {
    if(this.tabControl && !this.highlight) {
      this.setHighlight(true);
    }
  },
  
/** method: setValue
  *
  * Sets the highlight based on the value, use as a boolean flag.
  *
  * Parameters:
  *  _value - Same as the flag in in <setHighlight>
  *
  * See also:
  *  <setHighlight>
  *
  **/
  setValue: function(_value) {
    this.base(_value);
    if(this.value && this.tabControl) {
      this.tabControl.selectTab(this.tabId);
    }
  },
  
/** method: refresh
  * 
  * Updates visual properties of the tab label.
  * Specifically, sets the visibility of the highlight effect element, if
  * applicable.
  *
  * See also:
  *  <setHighlight>
  **/
  refresh: function() {
    if (this.drawn) {
      this.base();
      if(!this._highlightElementId) {
        this._highlightElementId = this.bindDomElement(
          this._tmplHighlightPrefix + this.elemId);
      }
      if (this._highlightElementId) {
        var _isInVisible = (prop_get(this._highlightElementId,
          'visibility') == 'hidden');
          
        // hide highlight-element:
        if(_isInVisible && this.highlight) {
          prop_set(this._highlightElementId, 'visibility', '', true);
        }
        
        // show highlight-element:
        else if (!_isInVisible && !this.highlight) {
          prop_set(this._highlightElementId, 'visibility', 'hidden', true);
        }
      }
    }
  }

});

/** class: HTabBar
  *
  * HTabBar has no logic functionality at all.
  * Its sole purpose is to act as a themeable background for <HTabLabel>:s.
  * Use <HTabControl> as the interface, don't use HTabBar directly.
  *
  * vars: Instance variables
  *  type - '[HTabBar]'
  *
  * Extends:
  *  <HView>
  *
  * See Also:
  *  <HTabControl> <HTabLabel> <HTabView> <HView>
  *
  * NOTE:
  *  HTab -components are still evolving.
  *
  **/
HTabBar = HView.extend({
  
  packageName:   "tab",
  componentName: "tabbar",

/** constructor: constructor
  *
  * Basically just a passthrough for <HView.constructor> it only differs by
  * defining theme preservation and the instance type.
  *
  **/
  constructor: function(_rect, _parentClass) {
    
    if(this.isinherited){
      this.base(_rect, _parentClass);
    }
    else {
      this.isinherited = true;
      this.base(_rect, _parentClass);
      this.isinherited = false;
    }
    
    this.type = '[HTabBar]';
    
    // When this is true, the component is always drawn with the theme that was
    // active at the creation of the component, not the current theme.
    this.preserveTheme = true;
    
    if(!this.isinherited) {
      this.draw();
    }
  },
  
  draw: function() {
    if(!this.drawn) {
      this.drawRect();
      this.drawMarkup();
      this.drawn = true;
    }
    this.drawRect();
  }
  
});

/** class: HTabView
  *
  * HTabBar has no logic functionality at all.
  * Its sole purpose is to act as a themeable background for the content area of
  * tabs. Use <HTabControl> as the interface, don't use HTabView directly.
  *
  * vars: Instance variables
  *  type - '[HTabView]'
  *
  * Extends:
  *  <HView>
  *
  * See Also:
  *  <HTabControl> <HTabLabel> <HTabBar> <HView>
  *
  * NOTE:
  *  HTab -components are still evolving.
  *
  **/
HTabView = HView.extend({
  
  packageName:   "tab",
  componentName: "tabview",

/** constructor: constructor
  *
  * Basically just a passthrough for <HView.constructor> it only differs by
  * defining theme preservation and the instance type.
  *
  **/
  constructor: function(_rect, _parentClass, _options) {
    if (!_options) {
      _options = {};
    }
    if(this.isinherited) {
      this.base(_rect, _parentClass, _options);
    }
    else {
      this.isinherited = true;
      this.base(_rect, _parentClass, _options);
      this.isinherited = false;
    }
    
    this.type = '[HTabView]';
    
    // When this is true, the component is always drawn with the theme that was
    // active at the creation of the component, not the current theme.
    this.preserveTheme = true;
    
    
    if(!this.isinherited) {
      this.draw();
    }
  },
  
  
/** method: draw
  *
  * Nothing special, gets drawn by <HTabControl>
  **/
  draw: function() {
    if(!this.drawn){
      this.drawMarkup();
      // Bind the element from the HTML template.
      var _temp_id = this.bindDomElement(
        HTabView._tmplElementPrefix + this.elemId);
      
      if (!_temp_id) {
        throw("HTabView: The HTML template must have an element with " +
          "the ID '" + HTabView._tmplElementPrefix + " + this.elemId'.");
      }
      
      // Place the new element as this element's sibling.
      elem_append(this.parent.elemId, _temp_id);
      
      // Move the original element into the document body.
      elem_append(0, this.elemId);
      
      // Delete the original element.
      elem_del(this.elemId);
      
      // Place the new element into the element cache in the same position as
      // the original element was in.
      elem_replace(this.elemId, elem_get(_temp_id));
    }
    this.drawRect();
  }
  
},{
  _tmplElementPrefix: "tabview"
});
/** class: HTabControl
  *
  * HTabControl is the main component of the <HTabBar> / <HTabLabel> /
  * <HTabControl> / <HTabView> collection. HTabControl is, in other words the
  * controlling part of the tab compound component. 
  * HTabControl is a control unit that allows multiple pages of information 
  * to be placed in one position. Above the tabcontrol, there is a row of tabs where the user may
  * select the page to be displayed. Tab's pages are called tab items. 
  * A tabcontrol component can contain a lot of different GUI components. 
  * TabControl view or theme can be changed; the helmiTheme is used by default.
  *
  * Use HTabControl whenever you need to implement a client-side tabbing interface.
  *
  * vars: Instance variables
  *  type - '[HTabControl]'
  *  tabs - A Hash of tabs. The key is the tab id and the value is the HView
  *         with all the component contents of the tab.
  *  labelViews - A <HTabBar> instance
  *  activeTab - The tab id of the currently selected tab.
  *
  * Extends:
  *  <HControl>
  *
  * See Also:
  *  <HTabBar> <HTabLabel> <HTabView> <HView>
  *
  * NOTE:
  *  HTab -components are still evolving.
  *
  **/
HTabControl = HControl.extend({

  packageName:   "tab",
  componentName: "tabcontrol",
  
/** constructor: constructor
  *
  * Constructs a new HTabControl and initializes subcomponents.
  * <HTabControl.draw> performs initialization phase2, the component is not
  * fully functional before that.
  *
  * Parameters:
  *  _rect - The rectangle of the component. See <HView.constructor>.
  *  _parentClass - The parent component of the component. See
  *                 <HView.constructor>.
  *  _options - (Object, optional)
  *
  * _options attributes:
  *  label - The default label for new tabs (default: 'Untitled')
  *  labelHeight - The default height (in px) for new tabs (default: 21)
  *  labelWidth - The default width (in px) for new tabs (default: 192)
  *
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
    
    // Some defaults
    this.tabDefaults = new (Base.extend({
      label: 'Untitled', // The default label
      labelHeight: 21,   // The height of the label bar
      labelWidth: 192    // The default width of a label item
    }).extend(_options));
    
    
    this.type = '[HTabControl]';
    this.preserveTheme = true;
    
    // Shortcuts for using tabs
    this.tabs = {};
    
    // Array that holds the tab IDs in the correct order.
    this._tabsInOrder = [];
    
    // Flag, switches to false after draw is called.
    this._notDone = true;
    
    if(!this.isinherited) {
      this.draw();
    }
  },
  
/** method: draw
  *
  * Performs tab initialization phase 2. Initializes structures and
  * subcomponents. Does nothing except what <HControl.draw> does after the first
  * time called.
  *
  * See also:
  *  <constructor> <HControl.draw>
  **/
  draw: function() {
    if(!this.drawn) {
      var _rect = this.rect;
      // Tab selection/label buttons here
      var _labelsRect = new HRect(0, 0, _rect.width,
        this.tabDefaults.labelHeight);
      this.labelViews = new HTabBar(_labelsRect, this);
      this.labelViews.draw();
      this._labelsRightMostPx = 0;
    
      // View items here
      var _viewXLeft = 0;
      var _viewYTop  = this.tabDefaults.labelHeight;
      var _viewXRight = _rect.width;
      var _viewYBottom = (_rect.height - this.tabDefaults.labelHeight);
      var _viewRect = new HRect(_viewXLeft, _viewYTop, _viewXRight,
        _viewYBottom);
      this.tabDefaults.rect = new HRect(0, 0, _viewRect.width,
        _viewRect.height);
      this.tabViews = new HView(_viewRect, this);
      this.tabViews.draw();
      // Mark the currently selected item here (-1 means N/A)
      this.activeTab = -1;
      this.drawn = true;
    }
    this.drawRect();
  },
  
/** method: addTab
  *
  * Makes a new tab. Parameters are optional, not supported and will change in a
  * later revision. 
  *
  * Parameters:
  *  _tabView - (optional) A <HView> or <HControl> -compatible object to attach
  *             to the tab. Default to create a new <HTabView> with defaults
  *             defined in the constructor. 
  *  _selectOnCreation - (optional) Selects the tab (brings it to 'front') after
  *             it's created.
  *  _label - (optional) The label to assign to the new tab.
  *  _labelWidth - (optional) The width of the tab label component.
  *
  * Returns:
  *  The tab id, use it to refer to <tabs>.
  *
  **/
  addTab: function(_tabView, _selectOnCreation, _label, _labelWidth) {
    if(this._notDone) {
      this.draw();
    }
    // The plain HView should be replaced with a more sophisticated HTabView
    if(!_tabView) {
      var _tabRect = this.tabDefaults.rect;
      // Modify the parameter _tabView.
      _tabView = new HTabView(_tabRect, this.tabViews);
      _tabView.draw();
    }
    if(!_label) {
      var _label = this.tabDefaults.label;
    }
    
    // Hide the TabView by default
    _tabView.hide();
    
    // Force the selection of the first tab that is created, so the tab control
    // doesn't end up showing nothing.
    if (this._tabsInOrder.length == 0) {
      _selectOnCreation = true;
    }
    
    var _tabViewId = _tabView.viewId;
    this.tabs[_tabViewId] = _tabView;
    
    this._tabsInOrder.push(_tabViewId);
    
    // The rightmost label pixel (the leftmost coordinate of this one)
    var _labelRectXLeft = this._labelsRightMostPx;
    
    // Append the specified width (should be made automatic later)
    this._labelsRightMostPx += _labelWidth;
    
    // It should now be correct for HRect usage:
    var _labelRectXRight = this._labelsRightMostPx;
    
    // avoid double borders:
    // TODO: Don't assume that the border width of the label is one pixel.
    this._labelsRightMostPx--;
    var _tabLabelRect = new HRect(_labelRectXLeft, 0, _labelRectXRight,
      this.tabDefaults.labelHeight);
      
    var _tabLabelOpts = {
      label:      _label,
      tabId:      _tabViewId,
      tabControl: this,
      highlight:    false
    };
    var _tabLabel = new HTabLabel(_tabLabelRect, this.labelViews,
      _tabLabelOpts);
    
    // The label id should match the view id
    var _tabLabelId = _tabLabel.viewId;
    _tabLabel.draw();
    
    if(_tabLabelId != _tabViewId) {
      throw("HTabControlAddTabError: tabId Mismatch (" + _tabLabelId + " vs. " +
        _tabViewId + ")");
    }
    
    if(_selectOnCreation) {
      this.selectTab(_tabViewId);
    }
    
    this.refresh();
    
    return _tabViewId;
  },
  
  // Private method.
  // Calculates and sets the rectangles for the tabs currently in this tab
  // control.
  _recalculateRectsForTabLabels: function() {
    if (this._tabsInOrder.length == 0) {
      // No tabs left, just reset the rightmost pixel value.
      this._labelsRightMostPx = 0;
    }
    
    var _labelRectXLeft = 0;
    for (var i = 0; i < this._tabsInOrder.length; i++) {
      // The tab label object.
      var _label = this.labelViews.views[this._tabsInOrder[i]];
      
      // Figure out the left and right edges of the rectangle and use the
      // existing top and bottom edges.
      this._labelsRightMostPx = _labelRectXLeft + _label.rect.width;
      
      var _tabLabelRect = new HRect(_labelRectXLeft, _label.rect.top,
        this._labelsRightMostPx, _label.rect.bottom);
        
      this.labelViews.views[this._tabsInOrder[i]].setRect(_tabLabelRect);
      
      // TODO: Don't assume that the border width of the label is one pixel.
      this._labelsRightMostPx--;
      _labelRectXLeft = this._labelsRightMostPx;
      
    }
  },
  
/** method: removeTab
  *
  * Removes a tab and the view that it holds. If a selected tab is removed, the
  * selection is moved to the previous tab (or to the next tab if the deleted
  * tab is the first one).
  *
  * Parameters:
  *  _tabId - The ID of the tab to be removed.
  *
  **/
  removeTab: function(_tabId) {
    if (this.tabs[_tabId] instanceof HTabView) {
      // If the tab to be deleted is currently selected, try to select the
      // previous tab first, and if that fails, select the next tab.
      if (this.activeTab == _tabId) {
        if (!this.selectPreviousTab()) {
          if (!this.selectNextTab()) {
            // If previous and next selection fail, this must be the last tab
            // on this tab control. When the last tab gets deleted, active tab
            // id is negative.
            this.activeTab = -1;
          }
        }
      }
      
      // Get rid of the view and the label of the removed tab.
      this.tabViews.destroyView(_tabId);
      this.labelViews.destroyView(_tabId);
      
      // Update the arrays that keep track of the tabs.
      this.tabs[_tabId] = null;
      var _tabIndex = this._tabsInOrder.indexOf(_tabId);
      this._tabsInOrder.splice(_tabIndex, 1);
      
      // When a tab gets removed, recalculate the positions of the remaining
      // tabs so there will be no blank space between tabs.
      this._recalculateRectsForTabLabels();
    }
  },
  
/** method: removeSelectedTab
  *
  * Removes the tab and its content that is currently selected.
  *
  **/
  removeSelectedTab: function() {
    this.removeTab(this.activeTab);
  },
  
/** method: selectNextTab
  *
  * Selects the next tab.
  *
  * Returns:
  *  True if there was a next tab, and the selected tab changed, false if the
  *  currently selected tab is the last one, and selection didn't change.
  *
  **/
  selectNextTab: function() {
    var _tabIndex = this._tabsInOrder.indexOf(this.activeTab);
    if (_tabIndex < this._tabsInOrder.length - 1) {
      return this.selectTab(this._tabsInOrder[_tabIndex + 1]);
    }
    
    return false;
  },
  
/** method: selectPreviousTab
  *
  * Selects the previous tab.
  *
  * Returns:
  *  True if there was a previous tab, and the selected tab changed, false if
  *  the currently selected tab is the first one, and selection didn't change.
  *
  **/
  selectPreviousTab: function() {
    var _tabIndex = this._tabsInOrder.indexOf(this.activeTab);
    if (_tabIndex > 0) {
      return this.selectTab(this._tabsInOrder[_tabIndex - 1]);
    }
    
    return false;
  },
  
/** method: selectTab
  *
  * Selects (brings to 'front' / 'shows' / 'activates') the selected tab id and
  * hides the previously active tab.
  *
  * Parameters:
  *  _tabId - A valid tab id.
  *
  * Returns:
  *  True if the active tab was changed, false if the given tab id was invalid
  *  or the same as the currently active tab.
  * 
  **/
  selectTab: function(_tabId) {
    // Don't reselect the active tab.
    if(this.activeTab != _tabId) {
      
      // Check for an invalid tab id.
      var _tabIndex = this._tabsInOrder.indexOf(_tabId);
      if (_tabIndex > -1) {
        
        if(this.activeTab != -1) {
          this.tabViews.views[this.activeTab].setStyle('display', 'none');
          this.tabViews.views[this.activeTab].hide();
          this.labelViews.views[this.activeTab].setHighlight(false);
        }
        this.activeTab = _tabId;
        this.tabViews.views[this.activeTab].setStyle('display', 'block');
        this.tabViews.views[this.activeTab].show();
        this.labelViews.views[this.activeTab].setHighlight(true);
        
        return true;
        
      }
    }
    return false;
  },
  
/** method: numberOfTabs
  *
  * Returns:
  *  The number of tabs currently on this tab control.
  *
  **/
  numberOfTabs: function() {
    return this._tabsInOrder.length;
  }
  
});

// Alias shortcut.
HTab = HTabControl;/*** class: HMenuItem
  **
  ** A HMenuItem object displays one item within a menu and contains the state
  ** associated with that item.
  **
  ** vars: Instance variables
  **  type - '[HMenuItem]'
  **  value - Boolean value (sets the marked status).
  **  label - The string that is shown as the label of this object.
  **  marked - Returns whether the item is currently marked.
  **
  ** Extends:
  **  <HControl>
  **
  ** See also:
  **  <HControl>
  ***/
HMenuItem = HControl.extend({
  
  packageName:   "menus",
  componentName: "menuitem",

/** constructor: constructor
  *
  * Parameters:
  *   _rect - An <HRect> object that sets the position and dimensions of this
  *     control.
  *   _parentClass - The parent view that this control is to be inserted in.
  *   _options - (optional) All other parameters. See <HComponentDefaults>.
  * 
  * Extra options:
  *   index - The index of the item, its ordinal position in the menu. Indices
  *     begin at 0.
  **/
  constructor: function(_rect, _parentClass, _options) {
    if (!_options) {
      _options = {};
    }
    if (typeof _options != "object") {
      throw('MenuItemConstructorError: _options must be an object');
    }
    var _hasValueObj = true;
    if (!_options.valueObj) {
      _hasValueObj = false;
    }
  
    if(this.isinherited) {
      this.base(_rect, _parentClass, _options);
    }
    else {
      this.isinherited = true;
      this.base(_rect, _parentClass, _options);
      this.isinherited = false;
    }
    
    
    // Is this used for something?
    /* if (_hasValueObj == false) {
      this._menuItemValue = new HControlValue(this.elemId, {
        value: this.value,
        label: this.label,
        enabled: this.enabled,
        active: this.active
      });
      
    } else {
      this._menuItemValue = _options.valueObj;
    }
    this._menuItemValue.bind(this); */
    
    
    // set values,labels,enabled,active
    
    this.type = '[HMenuItem]';
    
    // To help extension:
    this._tmplLeftImagePrefix  = "menuitemleftimage";
    this._tmplRightImagePrefix = "menuitemrightimage";
    
    // When this is true, the component is always drawn with the theme that was
    // active at the creation of the component, not the current theme.
    this.preserveTheme = true;
    this.marked = false;
    this.setMouseDown(true);
    this.setMouseUp(true);
    this.refreshOnValueChange = true;
    
    if (_parentClass.type == "[HMenu]" || _parentClass.type == "[HMenuBar]" ||
      _parentClass.type == "[HPopupMenu]") {
      if (!_options) {
        _options = {};
      }
      _parentClass.addItem(this, _options.index);
    }
    
    if(!this.isinherited) {
      this.draw();
    }
  },
  
  // Private method.
  _updateMenuItemLeftImage: function() {
    // Sets the leftimage background image
    if(this.value) {
      this.toggleCSSClass(elem_get(this._leftImageElementId),
        this.cssOn, true);
      this.toggleCSSClass(elem_get(this._leftImageElementId),
        this.cssOff, false);

    } else {
      this.toggleCSSClass(elem_get(this._leftImageElementId),
        this.cssOn, false);
      this.toggleCSSClass(elem_get(this._leftImageElementId),
        this.cssOff, true);
    }
  },
  
  // Private method.
  _updateMenuItemRightImage: function() {
    // Sets the leftimage background image
    if(this.leaf) {
      this.toggleCSSClass(elem_get(this._rightImageElementId),
        this.cssRightOn, true);
      this.toggleCSSClass(elem_get(this._rightImageElementId),
        this.cssRightOff, false);

    } else {
      this.toggleCSSClass(elem_get(this._rightImageElementId),
        this.cssRightOn, false);
      this.toggleCSSClass(elem_get(this._rightImageElementId),
        this.cssRightOff, true);
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
    this.refresh(); // Make sure the label gets drawn.
  },
  
  refresh: function() {
    if (this.drawn) {
      // Checks if we have a label element:
      if(this.markupElemIds.label) {
        // Sets the label's innerHTML:
        elem_set(this.markupElemIds.label, this.label);
      }
      
      // Checks if this is the first refresh call:
      if(!this._leftImageElementId) {
        // Gets the leftimage element based on the id specified in constructor and
        // template:
        this._leftImageElementId = this.bindDomElement(
          this._tmplLeftImagePrefix + this.elemId);
      }
      // Checks if we have a leftimage element:
      if(this._leftImageElementId && !this.leaf) {
        this._updateMenuItemLeftImage();
      }
      
          // Checks if this is the first refresh call:
      if(!this._rightImageElementId) {
        // Gets the leftimage element based on the id specified in constructor and
        // template:
        this._rightImageElementId = this.bindDomElement(
          this._tmplRightImagePrefix + this.elemId);
      }
      if(this._rightImageElementId && this.menu && this.menu.type == "[HMenu]") {
        this._updateMenuItemRightImage();
      }
    }
  },
  
   // this sets the sub menu
  _setLeaf: function(_leaf) {
    this.leaf = _leaf;
  },
  
/** method: stringWidth
  * 
  * Adds the total width of borders and paddings to the width of the string.
  * 
  * See <HView.stringWidth>.
  *
  */
  stringWidth: function(_string, _length) {
    return this.base(_string, _length) +
      prop_get_extra_width(this.markupElemIds.label);
  },
  
/** method: setMarked
  * 
  * Adds a check mark to the left of the item label if flag is true, or removes
  * an existing mark if flag is false. If the menu is visible on-screen it's
  * redisplayed with or without the mark.
  * 
  * Parameters:
  *   _value - A numeric value to be set to the object.
  *
  * See also:
  *  <HControl.setValue>
  **/  
  setMarked: function(_value) {
    this.marked = _value;
    this.setValue(_value);
  },
  
  
/** event: lostActiveStatus
  *
  * Hides the menu that this menu item belongs to when the user clicks outside
  * of it.
  *
  * Parameters:
  *  _newActiveControl - A reference to the control that became the currently
  *    active control. Can be null if there is no active control.
  *
  */
  lostActiveStatus: function(_newActiveControl) {
    if (this.menu.hideMenu) {
      this.menu.hideMenu();
    }
  },
  
  // The name of the CSS class to be used when...
  // the item is selected.
  cssOn: "leftimageOn",
  // the item not selected.
  cssOff: "leftimage",
  cssRightOn: "rightimageOn",
  cssRightOff: "rightimage"
}
).extend(HValueMatrixComponentExtension).extend({
  mouseDown: function(_x,_y,_isLeftButton) {
    if (this.menu.radioMode) {
      this.base(_x,_y,_isLeftButton);
    }
  },
  mouseUp: function(_x,_y,_isLeftButton) {
    // If there's an action added to this menu item, it gets called on mouse up.
    if (this.action) {
      this.action();
    }
    if (this.menu.radioMode) {
      this.base(_x,_y,_isLeftButton);
    }
    // If the menu that holds this menu item wishes to perform actions when the
    // mouse button is released on a menu item, it has to implement the method
    // mouseUpOnMenuItem.
    if (this.menu.mouseUpOnMenuItem) {
      this.menu.mouseUpOnMenuItem(this);
    }
  }
});

/*** class: HMenu
  **
  ** HMenu is a control unit that displays a pull-down or pop-up list of menu items. 
  ** A common use of menus is to provide convenient access to various operations 
  ** such as saving or opening a file, quitting a program, or manipulating data. 
  ** A menu can contain simple menu items or other menus (submenus). 
  ** A submenu is a menu item that, when selected, reveals still another menu.
  **
  ** vars: Instance variables
  **  type - '[HMenu]'
  **  value - Numeric value currently set to this object.
  **  label - The string that is shown as the label of this object.
  **  radioMode - Returns whether the HMenu is currently in radio mode. The
  **    default radio mode is false for ordinary HMenus, but true for HPopupMenus.
  **
  ** Extends:
  **  <HControl>
  **
  ** See also:
  **  <HControl>
  ***/
HMenu = HControl.extend({
  
  packageName:   "menus",
  componentName: "menu",

/** constructor: constructor
  *
  * Parameters:
  *   _rect - An <HRect> object that sets the position and dimensions of this
  *     control.
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
    
    this.type = '[HMenu]';
    
    // When this is true, the component is always drawn with the theme that was
    // active at the creation of the component, not the current theme.
    this.preserveTheme = true;
    
    this.menuItems = [];
    this._menuDefaults = {
      itemHeight: 21,
      menuOffset: -5
    };
    
    this.totalHeight = 0;
    
    if(!this.isinherited) {
      this.draw();
    }
  },
  
  draw: function() {
    this.base();
    this._arrangeMenuItems();
    this.drawRect();
  },
  
  hide: function() {
    var i, _item, l = this.menuItems.length;
    for (i = 0; i < l; i++) {
      _item = this.menuItems[i];
      if (_item != this && _item.leaf) {
        _item.leaf.hide();
      }
    }
    this.base();
  },
  
  _itemFocus: function() {
    var i, _item, l = this.menu.menuItems.length;
    var _index;
    // hide others and show curren item
    for (i = 0; i < l; i++) {
      _item = this.menu.menuItems[i];
      if (_item != this && _item.leaf) {
        _item.leaf.hide();
      } else if (_item == this) {
        _index = i;
      }
    }
    if (this.leaf) {
      this.leaf.rect.left = this.menu.rect.left + this.menu.rect.width +
        this.menu._menuDefaults.menuOffset;
      this.leaf.rect.top = this.menu.rect.top +
        (_index * this.menu._menuDefaults.itemHeight);
        
      this.leaf.setStyle("left", this.leaf.rect.left + "px");
      this.leaf.setStyle("top", this.leaf.rect.top + "px");
      this.leaf.bringToFront();
      this.leaf.show();
    }
  },
/** method: addItem
  * 
  * Adds an item to the menu list at index - or, if no index is mentioned, to
  * the end of the list.
  * If a submenu is specified rather than an item, addItem() constructs a
  * controlling HMenuItem for the submenu and adds the item to the menu.
  * 
  * Parameters:
  *   _item - A [HMenuItem] object.
  *   _index - The index of the item, its ordinal position in the menu. Indices
  *     begin at 0.
  **/  
  addItem: function(_item, _index) {
    if (_item.type == "[HMenu]") {
      var _menu = _item;
      // we down't want the submenu open
      _menu.hide();
      _item = new HMenuItem(new HRect(0, 0, 0, 0), this, _item.options);
      // super item for menu removal
      _menu.superitem = _item;
      // this sets the sub menu
      _item._setLeaf(_menu);
    } else {
      // sets menuitem's parent menu
      _item.menu = this;
      if (_index !== undefined) {
        this.menuItems.splice(_index, 0, _item);
      } else {
        this.menuItems.push(_item);
      }
    }
    _item.focus = this._itemFocus;
    
    if (this.valueMatrix) {
      this._setValueMatrix(_item);
    }
    // TODO: This call shouldn't be made when the menu hasn't been drawn the
    // first time yet. But somehow that breaks the menu bar, so it's left like
    // this for now.
    this.draw();
  },
  
  
  hideMenu: function() {
    // closes whole menu structure
    var _menu = this;
    while (_menu.superitem) {
      // down't hide menubar and make it not clicked
      if (_menu.superitem.menu.type == "[HMenuBar]") {
        _menu.superitem.menu._clicked = false;
        break;
      }
      _menu = _menu.superitem.menu;
    }
    _menu.hide();
  },
  
/** method: removeItem
  * 
  * Removes the item at index, or the specified item, or the item that controls
  * the specified submenu. Removing the item doesn't free it.
  * 
  * Parameters:
  *   _obj - The index of the item, A [HMenuItem] or a [HMenu] object.
  *
 * Returns:
  *   If passed an index, this function returns a pointer to the item so you can
  *     free it. It returns a NULL pointer if the item couldn't be removed.
  *   If passed an item, it returns true if the item was in the list and could
  *     be removed, and false if not.
  *   If passed a submenu, it returns true if the submenu is controlled by an
  *     item in the menu and that item could be removed, and false otherwise.
  *
  **/ 
  removeItem: function(_obj) {
    if (typeof _obj == "number") {
      var _item = this.menuItems[_obj];
      if (_item) {
        return (this.removeItem(_item)) ? _item : null;
      } else {
        return null;
      }
    } else if (_obj.type == "[HMenuItem]") {
      var _index = this.menuItems.indexOf(_obj);
      if (_index >= 0) {
        var _item = this.menuItems[_index];
        // unbind event handlers
        _item.focus = undefined;
        _item.menu = undefined;
        // valuematrix ???
        this.menuItems.splice(_index, 1);
        this.draw();
        return true;
      } else {
        return false;
      }
    } else if (_obj.type == "[HMenu]") {
      if (_obj.superitem) {
        return _obj.superitem.menu.removeItem(_obj.superitem);
      } else {
        return false;
      }
    }
  },
  
  // Private method.
  _arrangeMenuItems: function() {
    this.totalHeight = 0;
    var i, _item, l = this.menuItems.length;
    for (i = 0; i < l; i++) {
      var _item = this.menuItems[i];
      _item.rect.set(
        0,
        this.totalHeight,
        100,
        this.totalHeight + this._menuDefaults.itemHeight
      );
      this.totalHeight = this.totalHeight + this._menuDefaults.itemHeight;
      _item.draw();
    }
    // sets maximum string width
    var _maxWidth = 0;
    for (i = 0; i < l; i++) {
      var _item = this.menuItems[i];
      var _width = _item.stringWidth(_item.label)
      if (_width > _maxWidth) {
        _maxWidth = _width;
      }
    }
    for (i = 0; i < l; i++) {
      var _item = this.menuItems[i];
      _item.rect.setWidth(_maxWidth);
      _item.drawRect();
    }
    
    this.rect.set(
      this.rect.left,
      this.rect.top,
      this.rect.left + _maxWidth,
      this.rect.top + this.totalHeight
    );
  },
  
/** method: setRadioMode
  * 
  * Puts the HMenu in radio mode if flag is true and takes it out of radio mode
  * if flag is false.
  * In radio mode, only one item in the menu can be marked at a time.
  * If the user selects an item, a check mark is placed in front of it
  * automatically (you don't need to call HMenuItem's setMarked() function; it's
  * called for you).
  * If another item was marked at the time, its mark is removed.
  * Selecting a currently marked item retains the mark.
  * 
  * Parameters:
  *   _value - A numeric value to be set to the object.
  *
  * See also:
  *  <HControl.setValue>
  **/  
  setRadioMode: function(_mode, _valueObj) {
    this.radioMode = _mode;
    if(_mode) {
      this.valueMatrix = new HValueMatrix( );
      _valueObj = (_valueObj || new HValue('menuDummy' + this.elemId, -1));
      _valueObj.bind(this.valueMatrix);
      _valueObj.bind(this);
      var i, _item, l = this.menuItems.length;
      for (i = 0; i < l; i++) {
        var _item = this.menuItems[i];
        this._setValueMatrix(_item);
      }
    }
  },
  
  // Private method.
  _setValueMatrix: function(_item) {
    if (_item.type == "[HMenuItem]" && !_item.leaf) {
      // HMenuItemValue is defined in HMenuItem
      _item.setValueMatrix(this.valueMatrix);
    }
  },
  
  
/** method: indexOfItem
  * 
  * Returns the index of the given menu item in this menu.
  * 
  * Parameters:
  *   _item - The <HMenuItem> object that is being looked up.
  * 
  * Returns:
  *   The index of the location of _item. -1 is returned if the _item is not
  *   found in the menu.
  * 
  */
  indexOfItem: function(_item) {
    return this.menuItems.indexOf(_item);
  },
  
/** event: mouseUpOnMenuItem
  * 
  * This gets called whenever the mouseUp event occurs in a menu item added to
  * this menu.
  * 
  **/
  mouseUpOnMenuItem: function(_item) {
    this.hideMenu();
  }

});/*** class: HMenuBar
  **
  ** A HMenuBar is a menu that can stand at the root of a menu hierarchy.
  ** Typically, the root menu is the menu bar that's drawn across the top of the
  ** window.
  ** It's from this use that the class gets its name.
  ** 
  **
  ** vars: Instance variables
  **  type - '[HMenuBar]'
  **  value - Numeric value currently set to this object.
  **  label - The string that is shown as the label of this object.
  **
  ** Extends:
  **  <HControl>
  **
  ** See also:
  **  <HControl>
  ***/
HMenuBar = HControl.extend({
  
  packageName:   "menus",
  componentName: "menubar",

/** constructor: constructor
  *
  * Parameters:
  *   _rect - An <HRect> object that sets the position and dimensions of this
  *     control.
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
    
    this.type = '[HMenuBar]';
    
    // When this is true, the component is always drawn with the theme that was
    // active at the creation of the component, not the current theme.
    this.preserveTheme = true;
    
    this.menuItems = [];
    this._menuDefaults = {
      itemWidth: 100,
      itemHeight: 21
    };
    this.setMouseDown(true);
    this.totalWidth = 0;
    
    this._clicked = false;
    
    if(!this.isinherited) {
      this.draw();
    }
  },
  
  draw: function() {
    if (!this.drawn) {
      this.drawRect();
      this.drawMarkup();
      this.drawn = true;
    }
    this.arrangeMenuItems();
    this.drawRect();
  },
  
  hide: function() {
    var i, _item, l = this.menuItems.length;
    for (i = 0; i < l; i++) {
      _item = this.menuItems[i];
      if (_item != this && _item.leaf) {
        _item.leaf.hide();
      }
    }
    this.base();
  },
  
  // Private method.
  _itemFocus: function() {
    if (this.menu._clicked == false) {
      return;
    }
    var i, _item, l = this.menu.menuItems.length;
    var _index;
    // hide others and show curren item
    for (i = 0; i < l; i++) {
      _item = this.menu.menuItems[i];
      if (_item != this && _item.leaf) {
        _item.leaf.hide();
      } else if (_item == this) {
        _index = i;
      }
    }
    if (this.leaf) {
      var _width = 0;
      for (i = 0; i < _index; i++) {
        _width += this.menu.menuItems[i].rect.width;
      }      
      this.leaf.rect.left = this.menu.pageX() + _width;
      this.leaf.rect.top = this.menu.pageY() +
        this.menu._menuDefaults.itemHeight;
      
      this.leaf.setStyle("left", this.leaf.rect.left + "px");
      this.leaf.setStyle("top", this.leaf.rect.top + "px");
      this.leaf.bringToFront();
      this.leaf.show();
    }
  },
  
  // Private method.
  _itemDown: function() {
    if (this.leaf) {
      if (this.menu._clicked == false) {
        var _width = 0;
        for (i = 0; i < this.menu.menuItems.length; i++) {
          if (this.menu.menuItems[i] == this) {
            break;
          }
          _width += this.menu.menuItems[i].rect.width;
        }
        this.leaf.rect.left = this.menu.pageX() + _width;
        this.leaf.rect.top = this.menu.pageY() +
          this.menu._menuDefaults.itemHeight;
        
        this.leaf.setStyle("left", this.leaf.rect.left + "px");
        this.leaf.setStyle("top", this.leaf.rect.top + "px");
        this.leaf.bringToFront();
        this.leaf.show();
      } else {
        this.leaf.hide();
      }
    }
     if (this.menu._clicked == false) {
      this.menu._clicked = true;
    } else {
      this.menu._clicked = false;
    }
  },
  
/** method: addItem
  * 
  * Adds an item to the menu list at index - or, if no index is mentioned, to
  * the end of the list.
  * If a submenu is specified rather than an item, addItem() constructs a
  * controlling HMenuItem for the submenu and adds the item to the menu.
  * 
  * Parameters:
  *   _item - A [HMenuItem] object.
  *   _index - The index of the item, its ordinal position in the menu. Indices
  *     begin at 0.
  **/
  addItem: function(_item, _index) {
    if (_item.type == "[HMenu]") {
      var _menu = _item;
      // we down't want the submenu open
      _menu.hide();
      _item = new HMenuItem(new HRect(0, 0, 100, 48), this, _item.options);
      // super item for menu removal
      _menu.superitem = _item;
      // this sets the sub menu
      _item._setLeaf(_menu);
    } else {
      // sets menuitem's parent menu
      _item.menu = this;
      if (_index !== undefined) {
        this.menuItems.splice(_index, 0, _item);
      } else {
        this.menuItems.push(_item);
      }
    }
    
    _item.focus = this._itemFocus;
    _item.setMouseDown(true);
    _item.mouseDown = this._itemDown;
    this.draw();
  },
  
/** method: removeItem
  * 
  * Removes the item at index, or the specified item, or the item that controls
  * the specified submenu. Removing the item doesn't free it.
  * 
  * Parameters:
  *   _obj - The index of the item, A [HMenuItem] or a [HMenu] object.
  *
  * Returns:
  *   If passed an index, this function returns a pointer to the item so you can
  *     free it. It returns a NULL pointer if the item couldn't be removed.
  *   If passed an item, it returns true if the item was in the list and could
  *     be removed, and false if not.
  *   If passed a submenu, it returns true if the submenu is controlled by an
  *     item in the menu and that item could be removed, and false otherwise.
  *
  **/ 
  removeItem: function(_obj) {
    if (typeof _obj == "number") {
      var _item = this.menuItems[_obj];
      if (_item) {
        return (this.removeItem(_item)) ? _item : null;
      } else {
        return null;
      }
    } else if (_obj.type == "[HMenuItem]") {
      var _index = this.menuItems.indexOf(_obj);
      if (_index >= 0) {
        var _item = this.menuItems[_index];
        _item.die();
        // unbind event handlers
        _item.focus = undefined;
        _item.menu = undefined;
        // valuematrix ???
        this.menuItems.splice(_index, 1);
        this.draw();
        
        return true;
      } else {
        return false;
      }
    } else if (_obj.type == "[HMenu]") {
      if (_obj.superitem) {
        return _obj.superitem.menu.removeItem(_obj.superitem);
      } else {
        return false;
      }
    }
  },
  
  arrangeMenuItems: function() {
    this.totalWidth = 0;
    
    var i, l = this.menuItems.length;
    
    for (i = 0; i < l; i++) {
      var _menuItem = this.menuItems[i];
      var _menuItemRectLeft = this.totalWidth;
      var _menuItemRectRight = this.totalWidth + this._menuDefaults.itemWidth;
      var _menuItemRectBottom = this._menuDefaults.itemHeight;
      
      _menuItem.setRect(new HRect(
        _menuItemRectLeft,
        0,
        _menuItemRectRight,
        _menuItemRectBottom
      ));
        
      this.totalWidth = this.totalWidth + this._menuDefaults.itemWidth;
      _menuItem.draw();
    }
    
    // Set the maximum string width:
    var _stringWidth = 0, _itemWidth = 0;
    for (i = 0; i < l; i++) {
      var _menuItem = this.menuItems[i];
      _stringWidth = _menuItem.stringWidth(_menuItem.label);
      _menuItem.rect.setLeft(_itemWidth);
      _itemWidth += _stringWidth;
      _menuItem.rect.setWidth(_stringWidth);
      _menuItem.drawRect();
    }
    
    // Set the right and bottom sides of the rectangle and redraws it:
    var _right = this.rect.left + _itemWidth;
    this.rect.setRight(_right);
    
    var _bottom = this.rect.top + this._menuDefaults.itemHeight;
    this.rect.setBottom(_bottom);
    
    this.drawRect();
  }
  
});
/*** class: HPopupButton
  **
  ** A HPopupButton object displays a labeled pop-up menu.
  **
  ** vars: Instance variables
  **  type - '[HPopupButton]'
  **  value - Numeric value currently set to this object.
  **  label - The string that is shown as the label of this object.
  **
  ** Extends:
  **  <HButton>
  **
  ** See also:
  **  <HButton>
  ***/
HPopupButton = HButton.extend({
  
  packageName:   "menus",
  componentName: "popupbutton",

/** constructor: constructor
  *
  * Parameters:
  *   _rect - An <HRect> object that sets the position and dimensions of this
  *     control.
  *   _parentClass - The parent view that this control is to be inserted in.
  *   _options - (optional) All other parameters. See <HComponentDefaults>.
  * 
  * Extra options:
  *   popupMenu - An <HPopupMenu>
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
    
    this.type = '[HPopupButton]';
    
    if (_options.popupMenu) {
      this.popupmenu = _options.popupMenu;
      this.popupmenu.popupbutton = this;
      this.popupmenu.hide();
      this.popupmenu.setOwner(this);
    }
    this.setMouseDown(true);
    
    if(!this.isinherited) {
      this.draw();
    }
  },
  
  
/** event: mouseDown
  * 
  * Shows and hides the pop-up menu of the pop-up button.
  * 
  * Parameters:
  *   _x - The horizonal coordinate units (px) of the mouse cursor position.
  *   _y - The vertical coordinate units (px) of the mouse cursor position.
  *   _leftButton - Flag, is false when the right mouse button was pressed.
  *     *Do not rely on it*
  *
  * See also:
  *   <HControl.mouseDown>
  * 
  */
  mouseDown: function(x, y, _leftButton) {
    if (this.popupmenu.isHidden) {
      this.popupmenu.rect.left = this.pageX();
      this.popupmenu.rect.top = this.pageY() + this.rect.height;
      
      this.popupmenu.setStyle("left", this.popupmenu.rect.left + "px");
      this.popupmenu.setStyle("top", this.popupmenu.rect.top + "px");
      this.popupmenu.bringToFront();
      this.popupmenu.show();
    } else {
      this.popupmenu.hide();
    }
  },
  
  
/** event: lostActiveStatus
  *
  * Hides the pop-up menu of this combo box if the user clicked outside of it.
  *
  * Parameters:
  *  _newActiveControl - A reference to the control that became the currently
  *    active control. Can be null if there is no active control.
  *
  */
  lostActiveStatus: function(_newActiveControl) {
    if (!_newActiveControl ||
      this.popupmenu.indexOfItem(_newActiveControl) == -1) {
      // Clicked outside of the combo box, hide the menu.
      this.popupmenu.hide();
    }
  },
  
  
/** method: selectedIndexChanged
  * 
  * Implemented by derived classes to do whatever they please when the selection
  * on the popup button's popup menu changes.
  * 
  * See also:
  *   <HPopupMenu.selectedIndexChanged>
  **/
  selectedIndexChanged: function() {
    // Implement this in extended classes that wish to receive a notification
    // when the selection in the menu changes.
  }


  
});

// Alias for backwards-compatibility:
HPopUpButton = HPopupButton;


/*** class: HPopupMenu
  **
  ** HPopupMenu is a control unit that represents a menu typically used in isolation, 
  ** rather than as part of an extensive menu hierarchy. 
  ** By default, it operates in radio mode - the last item selected by the user, 
  ** and only that item, is marked in the menu.
  **
  ** vars: Instance variables
  **  type - '[HPopupMenu]'
  **  value - Numeric value currently set to this object.
  **  label - The string that is shown as the label of this object.
  **  selectedIndex - The index of the currently selected menu item. Negative
  **    number if nothing is selected.
  **  selectedItem - The menu item that is currently selected. A null value if
  **    nothing is selected.
  **  owner - A reference to the object that is set as the owner of this menu.
  **
  ** Extends:
  **  <HMenu>
  **
  ** See also:
  **  <HControl> <HMenu>
  ***/
HPopupMenu = HMenu.extend({
  
  packageName:   "menus",
  componentName: "popupmenu",

/** constructor: constructor
  *
  * Parameters:
  *   _rect - An <HRect> object that sets the position and dimensions of this control.
  *   _parentClass - The parent view that this control is to be inserted in.
  *   _options - (optional) All other parameters. See <HComponentDefaults>.
  **/
  constructor: function(_rect, _parentClass, _options) {
    if (!_options) {
      _options = {};
    }

    if(this.isinherited) {
      this.base(_rect, _parentClass, _options);
    }
    else {
      this.isinherited = true;
      this.base(_rect, _parentClass, _options);
      this.isinherited = false;
    }
    
    this.type = '[HPopupMenu]';
    
    // When this is true, the component is always drawn with the theme that was
    // active at the creation of the component, not the current theme.
    this.preserveTheme = true;
    
    this.selectedIndex = -1;
    this.selectedItem = null;
    this.owner = null;
    
    if(!this.isinherited) {
      this.draw();
    }
    
    
    
    // Initial item list can be passed in as an array named 'choices', for
    // example:
    // 
    // ... {choices: [{
    //        value: 123,
    //        enabled: true,
    //        label: "Test 1-2-3"
    //      },{
    //        ...
    //      }
    //     ]}
    if (_options.choices instanceof Array) {
      for (var i = 0; i < _options.choices.length; i++) {
        
        var _item = _options.choices[i];
        if (null === _item.enabled || undefined === _item.enabled) {
          _item.enabled = true;
        }
        
        var _newMenuItem = new HMenuItem(
          new HRect(0,0,0,18),
          this, {
            label: _item.label,
            value: _item.value,
            enabled: _item.enabled
          }
        );
        
        /* if (_item.checked) {
          _newMenuItem.setMarked(true);
        } */
        
      }
    }
    
  },
  
  
  // Private method.
  // Updates the button or the text field that displays the selection to the
  // user. This gets called whenever the selection on this menu changes.
  _updateSelection: function(_menuitem) {
    var _newLabel;
    if (!_menuitem) {
      _newLabel = "";
    }
    else {
      _newLabel = _menuitem.label;
    }
    
    if (this.popupbutton.type == "[HPopupButton]") {
      this.popupbutton.setLabel(_newLabel);
    } else if (this.popupbutton.type == "[HTextControl]") {
      this.popupbutton.setValue(_newLabel);
    }
    
    if (!this.radioMode) {
      this.setValue(_menuitem.value);
    }
    
  },
  
  
/** method: setOwner
  * 
  * Sets the owner object of this pop-up menu. The owner receives notification
  * from the menu when the selection changes on it. Usually this should not be
  * called by the user, as this is in most cases called by the owner component.
  * 
  * Parameters:
  *   _owner - The object that owns this pop-up menu.
  * 
  **/  
  setOwner: function(_owner) {
    this.owner = _owner;
  },
  
  
/** method: selectItem
  * 
  * Selects the given menu item in this pop-up menu.
  * 
  * Parameters:
  *   _item - A reference to a <HMenuItem> object that should be selected.
  **/  
  selectItem: function(_item) {
    this.selectedItem = _item;
    var _index = this.menuItems.indexOf(_item);
    this.selectItemAtIndex(_index);
  },
  
  
/** method: selectItemAtIndex
  * 
  * Selects a menu item that is placed in the given index in this pop-up menu.
  * 
  * Parameters:
  *   _index - The index of the menu item that should be selected.
  **/  
  selectItemAtIndex: function(_index) {
    if (_index != this.selectedIndex) {
      this.selectedIndex = _index;
      // if (_index >= 0 && _index < this.menuItems.length) {
        this._updateSelection(this.menuItems[_index]);
      // }
      this.selectedIndexChanged();
    }
  },
  
  
/** method: selectedIndexChanged
  * 
  * Informs the owner object of changes in the selection on the pop-up menu.
  * This method is called automatically by the HPopupMenu object.
  * 
  **/
  selectedIndexChanged: function() {
    if (this.owner && this.owner.selectedIndexChanged) {
      this.owner.selectedIndexChanged();
    }
  },
  
  
/** event: mouseUpOnMenuItem
  * 
  * This gets called whenever the mouseUp event occurs in a menu item added to
  * this pop up menu.
  * 
  **/
  mouseUpOnMenuItem: function(_item) {
    this.selectItem(_item);
    // this is also called from menu hideMenu
    this.hide();
  },
  
  
  setValue: function(_value) {
    this.base(_value);
    if (this.owner) {
      this.owner.setValue(_value);
    }
  }
  
});

// Alias for backwards-compatibility:
HPopUpMenu = HPopupMenu;

/*** class: HComboBox
  **
  ** HComboBox is a control unit that is a combination of a pop-up-menu, 
  ** a single-line textfield (textcontrol) and a combobox button. 
  ** A combobox allows the user type a value in the text field or 
  ** click on the button (displays a drop-down list of non-editable options) and
  ** choose one of the several options. 
  **
  ** vars: Instance variables
  **  type - '[HComboBox]'
  **  value - Numeric value currently set to this object.
  **  label - The string that is shown as the label of this object.
  **  popupMenu - A reference to the menu object that holds the items of this
  **    combo box.
  **  textControl - A reference to the text control of this combo box.
  **  comboBoxButton - A reference to the button that opens the pop-up menu.
  **
  ** Extends:
  **  <HControl>
  **
  ** See also:
  **  <HControl> <HTextControl> <HPopupMenu> <HComboBoxButton>
  ***/
HComboBox = HControl.extend({
  
  packageName:   "menus",
  componentName: "combobox",

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
    
    this.type = '[HComboBox]';
    
    // When this is true, the component is always drawn with the theme that was
    // active at the creation of the component, not the current theme.
    this.preserveTheme = true;
    
    
    this._initialized = false;
    this.setMouseDown(true);
    this.popupMenu = new HPopupMenu(
      new HRect(this.rect.left, this.rect.top + this.rect.height, 220, 200),
      this.app
    );
    this.popupMenu.setOwner(this);
    
    if(!this.isinherited) {
      this.draw();
    }
  },
  
  
/** method: die
  *
  * Destroys the pop-up menu before destroying the combo box.
  *
  * See also:
  *  <HControl.die>
  **/
  die: function() {
    // Text field and combo box button are placed inside the combo box
    // container. They don't need to be deleted explicitly in the die method.
    if (this.popupMenu) {
      this.popupMenu.die();
    }
    this.base();
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
      if(!this._initialized) {
        
        this.textControl = new HTextControl(
          this._rectForTextControl(),
          this, {
            value:"",
            enabled: this.enabled
          }
        );
      
        this.comboBoxButton = new HComboBoxButton(
          this._rectForComboBoxButton(),
          this, {
            label:"",
            enabled: this.enabled,
            popupMenu:this.popupMenu,
            textControl:this.textControl}
        );
      
        this._initialized = true;
      }
      this.drawn = true;
    } else {
      this.drawRect();
    }
  },
  
  
  // Private method. Returns a rectangle for the text control that fits the
  // current size of the combo box.
  _rectForTextControl: function() {
    var _right = this.rect.width - this.rect.height;
    return new HRect(0, 0, _right, this.rect.height);
  },
  
  
  // Private method. Returns a rectangle for the combo box button that fits the
  // current size of the combo box.
  _rectForComboBoxButton: function() {
    var _left = this.rect.width - this.rect.height;
    return new HRect(_left, 0, this.rect.width, this.rect.height);
  },
  
  
  drawRect: function() {
    this.base();
    
    // Resize the child elements also.
    if(this._initialized) {
      this.textControl.setRect(this._rectForTextControl());
      this.comboBoxButton.setRect(this._rectForComboBoxButton());
    }
  },
  
  
/** method: addItem
  * 
  * Adds an item to the combobox list at index - or, if no index is mentioned, to the end of the list.
  * 
  * Parameters:
  *   _label - A String object.
  *   _index - The index of the item, its ordinal position in the combobox. Indices begin at 0.
  **/  
  addItem: function(_label, _index) {
    new HMenuItem(
      new HRect(0, 0, 100, 18),
      this.popupMenu,
      {label:_label,
      index:_index}
    );
  },
/** method: removeItem
  * 
  * The index of the object to remove. All items beyond index are moved up one slot to fill the gap.
  * 
  * Parameters:
  *   _index - The index of the item, its ordinal position in the combobox. Indices begin at 0.
  **/  
  removeItem: function(_index) {
    this.popupMenu.removeItem(_index);
  },
  
/** method: selectItem
  * 
  * Selects the given menu item in this combo box.
  * 
  * Parameters:
  *   _item - A reference to a <HMenuItem> object that should be selected.
  * 
  * See also:
  *   <HPopupMenu.selectItem>
  **/  
  selectItem: function(_item) {
    this.popupMenu.selectItem(_item);
  },
  
  
/** method: selectItemAtIndex
  * 
  * Selects a menu item that is placed in the given index in this combo box.
  * 
  * Parameters:
  *   _index - The index of the menu item that should be selected.
  * 
  * See also:
  *   <HPopupMenu.selectItemAtIndex>
  **/  
  selectItemAtIndex: function(_index) {
    this.popupMenu.selectItemAtIndex(_index);
  },
  
  
/** method: selectedIndex
  * 
  * Returns the currently selected item's index.
  * 
  * Returns:
  *   The index of the menu item that is currently selected. A negative number
  *   is returned if nothing is selected.
  **/  
  selectedIndex: function() {
    return this.popupMenu.selectedIndex;
  },
  
  
/** method: selectedItem
  * 
  * Returns the currently selected menu item. It is an instance of <HMenuItem>.
  * 
  * Returns:
  *   The menu item that is currently selected. A null value is returned if
  *   nothing is selected.
  **/  
  selectedItem: function() {
    return this.popupMenu.selectedItem;
  },
  
  
/** method: selectedIndexChanged
  * 
  * Implemented by derived classes to do whatever they please when the selection
  * on the combo box's pop-up menu changes.
  * 
  * See also:
  *   <HPopupMenu.selectedIndexChanged>
  **/
  selectedIndexChanged: function() {
    // Implement this in extended classes that wish to receive a notification
    // when the selection in the menu changes.
  }
  
});

/*** class: HComboBoxButton
  **
  ** A HComboBoxButton object displays a labeled pop-up menu.
  ** Used in conjuction with HComboBox.
  **
  ** vars: Instance variables
  **  type - '[HComboBoxButton]'
  **  value - Numeric value currently set to this object.
  **  label - The string that is shown as the label of this object.
  **
  ** Extends:
  **  <HButton>
  **
  ** See also:
  **  <HButton>
  ***/
HComboBoxButton = HButton.extend({
  
  packageName:   "menus",
  componentName: "comboboxbutton",

/** constructor: constructor
  *
  * Parameters:
  *   _rect - An <HRect> object that sets the position and dimensions of this
  *     control.
  *   _parentClass - The parent view that this control is to be inserted in.
  *   _options - (optional) All other parameters. See <HComponentDefaults>.
  * 
  * Extra options:
  *   popupMenu - An <HPopupMenu>
  *   textControl - An <HTextControl>
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
    
    this.type = '[HComboBoxButton]';
    
    // To help extension:
    this._tmplLabelPrefix = "comboboxbuttonlabel";
    
    if (_options.popupMenu) {
      this.popupmenu = _options.popupMenu;
      this.popupmenu.popupbutton = _options.textControl;
      this.popupmenu.textcontrol = this;
      this.popupmenu.hide();
    }
    this.setMouseDown(true);
    
    if(!this.isinherited) {
      this.draw();
    }
  },


/** event: mouseDown
  * 
  * Shows and hides the pop-up menu of the combo box.
  * 
  * Parameters:
  *   _x - The horizonal coordinate units (px) of the mouse cursor position.
  *   _y - The vertical coordinate units (px) of the mouse cursor position.
  *   _leftButton - Flag, is false when the right mouse button was pressed.
  *     *Do not rely on it*
  *
  * See also:
  *   <HControl.mouseDown>
  * 
  */
  mouseDown: function(x, y, _leftButton) {
    if (this.popupmenu.isHidden) {
      
      this.popupmenu.rect.left = this.parent.pageX();
      this.popupmenu.rect.top = this.parent.pageY() +
        this.parent.rect.height;
      this.popupmenu.rect.right = this.popupmenu.rect.left +
        this.popupmenu.rect.width;
      this.popupmenu.rect.bottom = this.popupmenu.rect.top +
        this.popupmenu.rect.height;
        
      this.popupmenu.setStyle("left", this.popupmenu.rect.left + "px");
      this.popupmenu.setStyle("top", this.popupmenu.rect.top + "px");
      this.popupmenu.bringToFront();
      this.popupmenu.show();
    } else {
      this.popupmenu.hide();
    }
  },
  
  
/** event: lostActiveStatus
  *
  * Hides the pop-up menu of this combo box if the user clicked outside of it.
  *
  * Parameters:
  *  _newActiveControl - A reference to the control that became the currently
  *    active control. Can be null if there is no active control.
  *
  */
  lostActiveStatus: function(_newActiveControl) {
    if (!_newActiveControl ||
      this.popupmenu.indexOfItem(_newActiveControl) == -1) {
      // Clicked outside of the combo box, hide the menu.
      this.popupmenu.hide();
    }
  }
  
});

HLocalTableValue = HValue.extend({
  constructor: function(_id,_value){
    this.initTable(_id,_value);
    this.value = _value.value;
  },
  initTable: function(_id,_value){
  },
  set: function(_value){
  },
  updateBuffer: function(_startingRow,_endingRow){
  },
  setCell: function(_table, _value, _row, _column){
    if (!this.value[_row]) {
      return;
    }
    this.value[_row][_column] = _value;
  },
  getCell: function(_table, _row, _column){
    if (!this.value[_row]) {
      return "";
    }
    return this.value[_row][_column];
  },
  numberOfRows: function(){
    return 100;
  },
  toXML: function(){
  }
});





/** class: HTableValue
  *
  **/
HTableValue = HValue.extend({
  
/** constructor: constructor
  *
  * Parameters:
  *  _id - See <HValue.constructor>
  *  _value - See <HValue.constructor>
  *
  **/
  constructor: function(_id,_value){
    this.initTable(_id,_value);
    
  },
  initTable: function(_id,_value){
    // {value:datadata1,colums:["id","filename","name"]}
    if (typeof _value != "object") {
      throw "HTableValue error: value not an object";
    }
    if (typeof _value.value != "object") {
      throw "HTableValue error: object.value not an array";
    }
    if (typeof _value.length != "number") {
      throw "HTableValue error: object.length not a number";
    }
    if (typeof _value.startrow != "number") {
      throw "HTableValue error: object.startrow not a number";
    }
    if (typeof _value.endrow != "number") {
      throw "HTableValue error: object.endrow not a number";
    }
    if (typeof _value.columns != "object") {
      throw "HTableValue error: object.columns not an array";
    }
    this.value = _value.value;
    this.length = _value.length;
    this.columns = _value.columns;
    this.startrow = _value.startrow;
    this.endrow = _value.endrow;
    this.startrow1 = 0;
    this.endrow1 = 0;
    
    // same as in HValue
    this.id = _id;
    this.type = '[HTableValue]';
    this.views = [];
    
    this.startdatarow = this.startrow;
    this.enddatarow = this.endrow;
    this.datalength = this.endrow - (this.startrow-1);
    
    this.gettingData = false;
    this.gettingData1 = false;
    
    this.gettingDataInterrupted = false;
    this.gettingDataInterrupted1 = false;
    
    this.index1 = 0;
    this.index2 = 0;
    this.valueRequested = undefined;
    
    HValueManager.add(_id,this);
  },
/** method: set
  *
  **/
  set: function(_value){
    if (this.valueRequested == 1) {
      this.value1 = _value;
      this.gettingData1 = false;//Data got
    } else if (this.valueRequested == 0) {
      this.value = _value;
      this.gettingData = false;//Data got
    }
    if (this.gettingDataInterrupted) {
      // needs refresh
      //window.status = "gettingDataInterrupted" + this.tableControl;
      this.tableControl.reloadData();
      this.gettingDataInterrupted = false;
    }
    if (this.gettingDataInterrupted1) {
      // needs refresh
      //window.status = "gettingDataInterrupted1" + this.tableControl;
      this.tableControl.reloadData();
      this.gettingDataInterrupted1 = false;
    }
    if (this.reloading == true) {
      this.tableControl.reloadData();
      this.reloading = false;
    }
    //this.index1++;
    //window.status = "index1: " + this.index1 + " ";
  },
  updateBuffer: function(_startingRow,_endingRow){
    /*if (this.reloading) {
      return;
    }*/
    // this is the data block length
    var _length = this.datalength;
    // there are 2 data blocks that are switching together
    // tells if we are inside value (data block1) or value1 (data block2) 
    var _whichValue = undefined; // 0 or 1
    // is within buffer
   
    if (this.startdatarow-1 <= _startingRow && _endingRow <= this.enddatarow-1) {
        var _rowTopLimit;
        var _rowBottomLimit;
        if (this.startrow-1 <= _startingRow && _endingRow <= this.endrow-1) {
          _rowTopLimit = this.startrow-1 + parseInt(_length/4,10);
          _rowBottomLimit = this.endrow-1 - parseInt(_length/4,10);
          _whichValue = 0;
        } else if ((this.startrow1 && this.endrow1) && this.startrow1-1 <= _startingRow && _endingRow <= this.endrow1-1) {
          _rowTopLimit = this.startrow1-1 + parseInt(_length/4,10);
          _rowBottomLimit = this.endrow1-1 - parseInt(_length/4,10);
          _whichValue = 1;
        }
        // at the bottom
        if (_endingRow > _rowBottomLimit) {
          if (_whichValue == 0 && this.startrow1 < this.startrow) {
            //this.index2++;
            //  window.status = "index2: " + this.index2 + " " + (this.startrow1 < this.startrow);
            // check if already has buffer under
            var _newRowStart = this.endrow + 1;
            var _newRowEnd = this.endrow + _length;
            if (_newRowEnd > this.length) {
              _newRowEnd = this.length;
            }
            this.startrow1 = _newRowStart;
            this.endrow1 = _newRowEnd;
            this.startrow2 = this.startrow1;
            this.endrow2 = this.endrow1;
            
            window.status = "going down 0 " +
              "this.startrow " + this.startrow + " " +
              "this.endrow " + this.endrow + " " +
              "this.startrow1 " + this.startrow1 + " " +
              "this.endrow1 " + this.endrow1 + " ";
            
            this.startdatarow = this.startrow;
            this.enddatarow = this.endrow1;
            this.valueRequested = 1;
            this.gettingData1 = true;
            HValueManager.changed(this);
          }
          if (_whichValue == 1 && this.startrow < this.startrow1) {
            //this.index2++;
            //  window.status = "index3: " + this.index2 + " " + (this.startrow < this.startrow1);
            // check if already has buffer under
            var _newRowStart = this.endrow1 + 1;
            var _newRowEnd = this.endrow1 + _length;
            if (_newRowEnd > this.length) {
              _newRowEnd = this.length;
            }
            this.startrow = _newRowStart;
            this.endrow = _newRowEnd;
            this.startrow2 = this.startrow;
            this.endrow2 = this.endrow;
            
            window.status = "going down 1 " +
              "this.startrow1 " + this.startrow1+ " " +
              "this.endrow1 " + this.endrow1 + " " +
              "this.startrow " + this.startrow + " " +
              "this.endrow " + this.endrow + " ";
            
            //window.status = this.startrow + " " + this.endrow;
            
            this.startdatarow = this.startrow1;
            this.enddatarow = this.endrow;
            this.valueRequested = 0;
            this.gettingData = true;
            HValueManager.changed(this);
            
            
          }          
        }
        // at the top
        if (_startingRow < _rowTopLimit) {
          if (this.startrow-1 == 0 && _whichValue == 0) {
          } else {
            if (_whichValue == 0 && this.startrow < this.startrow1) {
              //this.index2++;
              //window.status = "index4: " + this.index2 + " " + (this.startrow < this.startrow1);
              // check if already has buffer over
              var _newRowStart = this.startrow - _length;
              var _newRowEnd = this.startrow - 1;
              if (_newRowStart < 1) {
                _newRowStart = 1;
              }
              //window.status = _newRowStart + " " + _newRowEnd;
              
              
              this.startrow1 = _newRowStart;
              this.endrow1 = _newRowEnd;
              this.startrow2 = this.startrow1;
              this.endrow2 = this.endrow1;
              this.startdatarow = this.startrow1;
              
             window.status ="going up 0 " +
              "this.startrow " + this.startrow + " " +
              "this.endrow " + this.endrow + " " +
              "this.startrow1 " + this.startrow1 + " " +
              "this.endrow1 " + this.endrow1 + " ";
              
              this.enddatarow = this.endrow;
              this.valueRequested = 1;//value [[...]
              this.gettingData1 = true;
              HValueManager.changed(this);
            }
            if (_whichValue == 1 && this.startrow1 < this.startrow) {
              //this.index2++;
              //window.status = "index5: " + this.index2 + " " + (this.startrow1 < this.startrow);
              // check if already has buffer over
              var _newRowStart = this.startrow1 - _length;
              var _newRowEnd = this.startrow1 - 1;
              if (_newRowStart < 1) {
                _newRowStart = 1;
              }
              
              //window.status = _newRowStart + " " + _newRowEnd;
              this.startrow = _newRowStart;
              this.endrow = _newRowEnd;
              this.startrow2 = this.startrow;
              this.endrow2 = this.endrow;
              this.startdatarow = this.startrow;
              this.enddatarow = this.endrow1;
              
                  window.status = "going up 1 " +
              "this.startrow " + this.startrow + " " +
              "this.endrow " + this.endrow + " " +
              "this.startrow1 " + this.startrow1 + " " +
              "this.endrow1 " + this.endrow1 + " ";
              
              this.valueRequested = 0;//value [[...]
              this.gettingData = true;
              HValueManager.changed(this);
            }
          }
        }
    } else {
      var _viewLength = _endingRow - _startingRow;
      var _newRowStart = _startingRow - parseInt(_length/2,10) + parseInt(_viewLength/2,10);
      
    
    
      //var _newRowStart = _startingRow - parseInt(_length/2,10) + parseInt((_endingRow - _startingRow) / 2) + 1;
      if (_newRowStart < 1) {
        _newRowStart = 1;
      }
      var _newRowEnd = _newRowStart + _length - 1;
      
      if (_newRowEnd > this.length) {
        _newRowEnd = this.length;
      }
      
      this.startrow = _newRowStart;
      this.endrow = _newRowEnd;
      
      this.startrow1 = undefined;
      this.endrow1 = undefined;
      
      this.startrow2 = this.startrow;
      this.endrow2 = this.endrow;
      
      this.startdatarow = _newRowStart;
      this.enddatarow = _newRowEnd;
      
      this.valueRequested = 0;//value [[...]
      this.gettingData = true;
      
      this.reloading = true;
      
      HValueManager.changed(this);
      
      
      
      //window.status = "outside buffer" + _startingRow +
      //" " + _newRowStart + " " + _newRowEnd;
      
      
      
      
    }
  },
/** method: setValue
  *
  **/
  setCell: function(_table, _value, _row, _column){
    
    
    this.value[_row][_column] = _value;
  },
  getCell: function(_table, _row, _column){
    /*if (_row > this.endrow) {
      this.startrow = _row;
      this.endrow = _row + 100;
      HValueManager.changed(this);
    }
    window.status = "_row: " + _row;*/
    //if (!this.value[_row]) {
    //  return "[ No Data ]";
    //}
    //window.status = _row-(this.startrow-1);
    if (this.startrow-1 <= _row && _row <= this.endrow-1) {
      if (this.gettingData) {
        this.gettingDataInterrupted = true;
      } else {
        if (this.value[_row-(this.startrow-1)]) {
          return this.value[_row-(this.startrow-1)][_column];
        }
      }
    } else if (this.startrow1-1 <= _row && _row <= this.endrow1-1) {
      if (this.gettingData1) {
        this.gettingDataInterrupted1 = true;
      } else {
        if (this.value1 && this.value1[_row-(this.startrow1-1)]) {
          return this.value1[_row-(this.startrow1-1)][_column];
        }
      }
    }
    //if (!this.value[_row]) {
      return "-";
    //}
  },
  numberOfRows: function(){
    return this.length;
  },
  
/** method: toXML
  *
  * Generates an XML description of the menuitem.
  *
  * Parameter:
  *  _i - The sequence number of the item, generated by HValueManager.
  *
  * Returns:
  *  An XML string with the date as specified
  *
  * See Also:
  *  <HValue.toXML> <HValueManager.toXML>
  *
  **/
  toXML: function(_i){
    var _syncid = this.id;
    var _rows = "";
    for (var _column = 0; _column < this.columns.length; _column++) {
      _rows += '<getrows column="'+this.columns[_column]+'" startrow="'+this.startrow2+'" endrow="'+this.endrow2+'" />';
    }
    return '<tablevalue length="'+this.columns.length+'" id="'+_syncid+'" order="'+_i+'">'+_rows+'</tablevalue>';
  }
});

/** class: HTableColumn
  *
  * An HTableColumn stores the display characteristics and index identifier for a column and determines the width of its column in the HTableControl.
  * It also stores two HView objects: the header view, which is used to draw the column header, and the data view, used to draw the values for each row.
  *
  * vars: Instance variables
  *  type - '[HTableColumn]'
  *  dataView - The data type of the table column
  *  headerView - The data type of the table header column
  *  index - The index identifier of the data column.
  *
  * Extends:
  *  <HControl>
  *
  * See Also:
  *  <HTableControl> <HTableHeaderView> <HTableHeaderColumn>
  *
  **/
HTableColumn = HControl.extend({
  
  packageName:   "table",
  componentName: "tablecolumn",
  
/** constructor: constructor
  *
  * Constructs a new HTableColumn and initializes subcomponents.
  *
  * Parameters:
  *  _rect - The rectangle of the component. See <HView.constructor>. The width of the _rect defines the width of the table column.
  *  _parentClass - The parent component of the component. See <HView.constructor>.
  *  _options - (Object, optional)
  *
  * _options attributes:
  * dataView - The data type of the table column
  * headerView - The data type of the table header column
  * index - The index identifier of the data column.
  *
  **/
  constructor: function(_rect, _parentClass, _options) {
  
    _options = new (Base.extend({
      dataView: "",   // The Data type of the table column
      headerView: ""    // The Data type of the table header column
    }).extend(_options));
    
    if(this.isinherited) {
      this.base(_rect, _parentClass, _options);
    }
    else {
      this.isinherited = true;
      this.base(_rect, _parentClass, _options);
      this.isinherited = false;
    }
    
    this.type = '[HTableColumn]';
    
    this.width = _rect.width;
    this.dataView = this.options.dataView;
    this.headerView = this.options.headerView;
    this.index = this.options.index;
    
    // When this is true, the component is always drawn with the theme that was
    // active at the creation of the component, not the current theme.
    this.preserveTheme = true;
    
    if(!this.isinherited) {
      this.draw();
    }
  }
});
/** class: HTableHeaderView
  *
  * An HTableHeaderView is used by an HTableControl to draw headers over its columns.
  *
  * vars: Instance variables
  *  type - '[HTableHeaderView]'
  *
  * Extends:
  *  <HControl>
  *
  * See Also:
  *  <HTableControl> <HTableColumn> <HTableHeaderColumn>
  *
  **/

HTableHeaderView = HControl.extend({
  
  packageName:   "table",
  componentName: "tableheaderview",

/** constructor: constructor
  *
  * Constructs a new HTableHeaderView and initializes subcomponents.
  *
  * Parameters:
  *  _rect - The rectangle of the component. See <HView.constructor>.
  *  _parentClass - The parent component of the component. See <HView.constructor>.
  *  _options - (Object, optional)
  *
  **/
  constructor: function(_rect,_parentClass, _options) {
    
    if(this.isinherited){
      this.base(_rect,_parentClass,_options);
    }
    else {
      this.isinherited = true;
      this.base(_rect,_parentClass,_options);
      this.isinherited = false;
    }
    
    this.type = '[HTableHeaderView]';
    
    // When this is true, the component is always drawn with the theme that was
    // active at the creation of the component, not the current theme.
    this.preserveTheme = true;
    if(!this.isinherited){
      this.draw();
    }
  },
  draw: function() {
    this.base();
    //this.drawMarkup();
  }
  
});/** class: HTableHeaderColumn
  *
  * An HTableHeaderColumn is used by an HTableHeaderView to draw its column headers.
  *
  * Extends:
  *  <HControl>
  *
  * See Also:
  *  <HTableControl> <HTableColumn> <HTableHeaderView>
  *
  **/
HTableHeaderColumn = HControl.extend({
  
  packageName:   "table",
  componentName: "tableheadercolumn",

/** constructor: constructor
  *
  * Constructs a new HTableHeaderColumn and initializes subcomponents.
  *
  * Parameters:
  *  _rect - The rectangle of the component. See <HView.constructor>. The width of the _rect defines the width of the table column.
  *  _parentClass - The parent component of the component. See <HView.constructor>.
  *  _options - (Object, optional)
  *
  **/
  constructor: function(_rect,_parentClass,_options) {

      this.isinherited = true;
      this.base(_rect,_parentClass,_options);
      this.isinherited = false;

    
    this.type = '[HTableHeaderColumn]';
    
    // To help extension:
    this._tmplLabelPrefix = "tableheadercolumnlabel";
    this._tmplSelectedPrefix = "tableheaderselected";
    this._tmplOrderArrowPrefix = "tableheaderorder";
    
    // When this is true, the component is always drawn with the theme that was
    // active at the creation of the component, not the current theme.
    this.preserveTheme = true;
    
    this.setMouseUp(true);
    this.setDraggable(true);
    //this.setDroppable(true);
    
    this.options = this.parent.parent.tableViewDefaults;
    this._resetColumnFlags();
    
    
  },
  
  draw: function() {
    if (!this.drawn) {
      this.drawRect();
      this.drawMarkup();
      this.drawn=true;
    }
    // Make sure the label gets drawn:
    this.refresh();
  },
  
  refresh: function() {
    // Checks if this is the first refresh call:
    if(!this._labelElementId){
      // Gets the label element based on the id specified in constructor and template:
      this._labelElementId = elem_bind(this._tmplLabelPrefix+this.elemId);
      this._selectedElementId = elem_bind(this._tmplSelectedPrefix+this.elemId);
      this._orderArrowElementId = elem_bind(this._tmplOrderArrowPrefix+this.elemId);
    }
    // Checks if we have a label element:
    if(this._labelElementId) {
      // Sets the label's innerHTML:
      elem_set(this._labelElementId,this.label);
    }
  },
  
  _sort: function() {
    _demo_sort.direction = !_demo_sort.direction;
    this.toggleCSSClass(elem_get(this._orderArrowElementId),'order-dn',!_demo_sort.direction);
    this.toggleCSSClass(elem_get(this._orderArrowElementId),'order-up',_demo_sort.direction);
    for(var _otherColId=0; _otherColId < this.parent.parent.tableHeaderColumns.length; _otherColId++){
      var _otherColSelectedElementId = this.parent.parent.tableHeaderColumns[_otherColId]._selectedElementId;
      if(_otherColSelectedElementId && (_otherColSelectedElementId != this._selectElementId)){
        prop_set(_otherColSelectedElementId,'visibility','hidden');
      }
      var _otherOrderArrowElementId = this.parent.parent.tableHeaderColumns[_otherColId]._orderArrowElementId;
      if(_otherOrderArrowElementId && (_otherOrderArrowElementId != this._orderArrowElementId)){
        prop_set(_otherOrderArrowElementId,'visibility','hidden');
      }
    }
    if(this._selectedElementId){
      prop_set(this._selectedElementId,'visibility','inherit');
    }
    if(this._orderArrowElementId){
      prop_set(this._orderArrowElementId,'visibility','inherit');
    }
    var _index = this.parent.parent.tableHeaderColumns.indexOf(this);
    _demo_sort.column = _index;
    this.parent.parent.data.value.sort(_demo_sort);
    this.parent.parent.reloadData();
    
  },
  
  startDrag: function(_x,_y){
    this.base(_x,_y);
    // can change when user uses tableview scrolls
    this._resetColumnFlags();
    
    // look this._startRectOfCol.leftTop
    // it moves the event location to current column
    _x -= this.parent.pageX();
    _y -= this.parent.pageY();
    this._startIndex = this.parent.parent.tableHeaderColumns.indexOf(this);
    
    this._doDrawRect = false;
    this._startPointCRSR  = new HPoint( _x, _y );
    this._prevPointCRSR   = new HPoint( _x, _y );
    this._startRectOfCol  = new HRect( this.rect );
    // Choose the column resize/drag mode, only one of them will be selected.
    this._resetColumnFlags();
    var _pointInCol = this._startPointCRSR.subtract( this._startRectOfCol.leftTop );
    if(this._columnFlags.resizeWRect.contains(_pointInCol)){
      this._diffPoint = _x-this.rect.left;
      this._columnFlags.resizeW=true;
    } else if(this._columnFlags.resizeERect.contains(_pointInCol)){
      this._diffPoint = _x-this.rect.right;
      this._columnFlags.resizeE=true;
    } else if(this._columnFlags.dragColumnRect.contains(_pointInCol)){
      this._diffPoint = this._startPointCRSR.subtract(this._startRectOfCol.leftTop);
      this._columnFlags.dragColumn=true;
    }
    this.bringToFront();
    this._dummy = true;
    this.doDrag(_x,_y);
    this._dummy = false;
  },
  
  
  doDrag: function(_x,_y){
    
    
    if (this._dummy == false) {
      _x -= this.parent.pageX();
      _y -= this.parent.pageY();
    }
    var _tableView = this.parent.parent;
    
    var _targetPoint;
    var _currPointCRSR = new HPoint( _x, _y );
    
    var _index = this.parent.parent.tableHeaderColumns.indexOf(this);
    var _column = this.parent.parent.tableColumns[ _index ];
    
    
    if(!this._prevPointCRSR.equals(_currPointCRSR)){
      if(this._columnFlags.resizeW==true){
        // disable left border of TableHeaderView
        if (_index == 0) {
          return;
        }
        // Resizing to the left
        _targetPoint = _x - this._diffPoint;
        this.rect.left = _targetPoint;
        this.rect.updateSecondaryValues();
        //this.setStyle('left',this.rect.left + "px");
        this.drawRect();
        
        
        _column.rect.left = _targetPoint + this.parent.parent.scrollLeft();
        _column.rect.updateSecondaryValues();
        _column.drawRect(); // optimize with the idle tweak..
        
        // also update _columnOrigins
        this.parent.parent._columnOrigins[_index] = _targetPoint + this.parent.parent.scrollLeft();
        
        // NOTE: The buffer needs to be updated, because on-demand generating depends on them (for example reload() )
        _tableView._tableColumns[_index].width = this.rect.width;
        var _prevColumn = this.parent.parent.tableColumns[(_index-1)];
        if(_prevColumn) {
          _prevColumn.rect.right = _targetPoint + this.parent.parent.scrollLeft();
          _prevColumn.rect.updateSecondaryValues();
          _prevColumn.drawRect();
          this.parent.parent._tableColumns[_index-1].width = _prevColumn.rect.width;
          _prevHeaderColumn = this.parent.parent.tableHeaderColumns[ _index-1 ];
          _prevHeaderColumn.rect.right = _targetPoint;
          _prevHeaderColumn.rect.updateSecondaryValues();
          _prevHeaderColumn.drawRect();
        }
      } else if(this._columnFlags.resizeE==true){
        // disable left border of TableHeaderView
        var l = this.parent.parent.tableColumns.length;
        if (_index == l - 1) {
          return;
        }
        // Resizing to the right
        _targetPoint = _x - this._diffPoint;
        this.rect.right = _targetPoint;
        this.rect.updateSecondaryValues();
        this.drawRect();
        _column.rect.right = _targetPoint + this.parent.parent.scrollLeft();
        _column.rect.updateSecondaryValues();
        _column.drawRect(); // optimize with the idle tweak..
        
        // also update _columnOrigins
        this.parent.parent._columnOrigins[_index+1] = _targetPoint + this.parent.parent.scrollLeft();
        
        // NOTE: The buffer needs to be updated, because on-demand generating depends on them (for example reload() )
        this.parent.parent._tableColumns[_index].width = this.rect.width;
        var _nextColumn = this.parent.parent.tableColumns[(_index+1)];
        if(_nextColumn) {
          _nextColumn.rect.left = _targetPoint + this.parent.parent.scrollLeft();
          _nextColumn.rect.updateSecondaryValues();
          _nextColumn.drawRect();
          this.parent.parent._tableColumns[_index+1].width = _nextColumn.rect.width;
          _nextHeaderColumn = this.parent.parent.tableHeaderColumns[ _index+1 ];
          _nextHeaderColumn.rect.left = _targetPoint;
          _nextHeaderColumn.rect.updateSecondaryValues();
          _nextHeaderColumn.drawRect();
        }
      } else if(this._columnFlags.dragColumn==true){
        _targetPoint = _currPointCRSR.subtract( this._diffPoint );
        this.setStyle('opacity',0.4);
        this.setStyle('left',_targetPoint.x + "px");
        _column.setStyle('opacity',0.4);
        _column.setStyle('left', _targetPoint.x + this.parent.parent.scrollLeft() + "px");     
      }
      this._doDrawRect = true;
      if(this._columnFlags.dragColumn==false){
        
      }
      this._prevPointCRSR = _currPointCRSR;
    }
  },  
  
  endDrag: function(_x, _y){
  
    
    this.base(_x, _y);
    this.doDrag(_x,_y);
    
    _x -= this.parent.pageX();
    _y -= this.parent.pageY();
    var _tableView = this.parent.parent;
    // restores the opacity
    this.setStyle('opacity',1.0);
    _tableView.tableColumns[this._startIndex].setStyle('opacity',1.0);
    
    var _flag = false;
    
    var i, l = _tableView.tableHeaderColumns.length;  
    for (i = 0; i < l; i++) {
      if (_tableView.tableHeaderColumns[i].rect.left <= _x &&
          _x <= _tableView.tableHeaderColumns[i].rect.right &&
          _tableView.tableHeaderColumns[i] != this) {
        if (this._columnFlags.dragColumn==true) {
          _tableView.moveColumn(
            this._startIndex,
            i
          );
          _flag = true;
        }
      }
    }
    // if we didn't move the column, restore the position
    if (_flag == false && this._columnFlags.dragColumn==true) {
      this.setStyle('left',this._startRectOfCol.left + "px");
      _tableView.tableColumns[this._startIndex].setStyle('left',this._startRectOfCol.left + "px");
      this._sort();
    }
  },
  
  /*onIdle: function(){
    if(this._doDrawRect){
      this.drawRect();
    }
    this.base();
  },*/
  
  drawRect: function(){
    this._doDrawRect = false;
    this.base();
  },

  _resetColumnFlags: function(){
    // Used internally by the column to keep track of what modes it is in
    this._columnFlags = {
      dragColumn: false,
      resizeW:    false,
      resizeE:    false,
      
      /***
        ** Calculate rectangles that the mouse pointer should be inside of to respond to different events.
        ***/
      dragColumnRect: new HRect(
        this.options.resizeW,
        0,
        this.rect.width - this.options.resizeE,
        this.rect.height
      ),
      resizeWRect:    new HRect(
        0,
        0,
        this.options.resizeW,
        this.rect.height
      ),
      resizeERect:    new HRect(
        this.rect.width - this.options.resizeE,
        0,
        this.rect.width,
        this.rect.height
      )
    };
  }
});

_demo_sort= function(a, b) {
  if (a[_demo_sort.column] < b[_demo_sort.column]) {
    return (_demo_sort.direction) ? -1 : 1;
  }
  if (a[_demo_sort.column] > b[_demo_sort.column]) {
    return (_demo_sort.direction) ? 1 : -1;
  }
  return 0;
}
_demo_sort.direction = true;
_demo_sort.column = 0;
_HTableColumn = function(_index,_width,_string,_dataView,_headerView) {
  this.index = _index;
  this.width = _width;
  this.string = _string;
  this.dataView = _dataView;
  this.headerView = _headerView;
  this.headerCreated = false;
  this.created = false;
}

/** class: HTableControl
  *
  * HTable is a control unit intended to display and organize record-oriented data 
  * in the table form. The HTable component allows the user to edit values (table fields),
  * resize and rearrange columns. 
  *
  * vars: Instance variables
  *  type - '[HTableControl]'
  * tableColumns - An array containing the the HTableColumn objects in the receiver.
  * tableHeaderColumns - An array containing the the HTableHeaderColumn objects in the receiver.
  * Extends:
  *  <HControl>
  *
  * See Also:
  *  <HTableColumn> <HTableHeaderView> <HTableHeaderColumn>
  *
  **/
HTableControl = HControl.extend({
  /*themePath:     IThemePath,*/
  packageName:   "table",
  componentName: "itablecontrol",
  
/** constructor: constructor
  *
  * Constructs a new HTableControl and initializes subcomponents.
  *
  * Parameters:
  *  _rect - The rectangle of the component. See <HView.constructor>. The width of the _rect defines the width of the table column.
  *  _parentClass - The parent component of the component. See <HView.constructor>.
  *  _options - (Object, optional)
  *
  * _options attributes:
  * rowHeight - The height of each row in the receiver.
  * headerViewHeight - The height of of the table header view.
  * bufferLength - Defines how many views to buffer.
  * resizeW - The resize portion from the right side of the table header column 
  * resizeE -  The resize portion from the left side of the table header column 
  *
  **/
  constructor: function(_rect,_parentClass, _options) {
  
    _options = new (Base.extend({
      rowHeight: 21,
      headerViewHeight: 21,
      bufferLength: 3,
      resizeW: 5,
      resizeE: 5
    }).extend(_options));
    
    if(this.isinherited){
      this.base(_rect,_parentClass,_options);
    }
    else {
      this.isinherited = true;
      this.base(_rect,_parentClass,_options);
      this.isinherited = false;
    }
    this.tableViewDefaults = _options;
    // TABLE DEFAULTS HERE!!!
    
    this.type = '[HTableControl]';
    
    // When this is true, the component is always drawn with the theme that was
    // active at the creation of the component, not the current theme.
    this.preserveTheme = true;
    
    this.tableColumns = [];//real HTableColumns
    this._columnOrigins = [];
    this.tableHeaderColumns = [];
    this._tableColumns = [];//buffer
    this._dataRowBufferInitialized = [];
    this._tableRows = [];//buffer
    this.numberOfRows = 0;
    this._dataRowBufferIndex = 0;//top row of the buffer
    this._dataRowBufferEndIndex = 0;//bottom row of the buffer
    
    this._dataStartBufferIndex = 0; // 0, 1, 2
    this._dataEndBufferIndex = 0; // 0, 1, 2
    
    this._dataBufferViewLength = 0;
    
    // create the HTableControl header view
    this.headerView = new HTableHeaderView(
      new HRect(0,0,this.rect.width,this.options.headerViewHeight),
      this
    );
    // this is the scrollview of the table control
    this.tableView = new HView(
      new HRect(0,this.options.headerViewHeight,this.rect.width,this.rect.height),
      this
    );
    this.tableView.setStyle("overflow","auto");
    // makes the sccollable content to real size
    this.columnsView = new HView(
      new HRect(0,0,this.rect.width,this.rect.height-this.options.headerViewHeight),
      this.tableView
    );
    var _cornerRect = new HRect(this.rect.width-18,0,this.rect.width,this.options.headerViewHeight); 
    
    this.cornerView = new HTableCornerView(
      _cornerRect,
      this
    );
    
    this._scrollRect=new HRect(this.tableView.rect);
    this._scrollRect.offsetTo(0,0);
    
    if(!this.isinherited){
      this.draw();
    }
  },
  onIdle: function() {
    this._buffer();
    this.base();
  },
  _updateColumns: function() {
    
    // data length and columns length
    if (this.numberOfRows == 0 || this._tableColumns.length == 0) {
      return;
    }
    
    // calculates first and last visible rows
    var _startingRow = this._rowAtPoint(new HPoint(0,this._scrollRect.top));
    var _endingRow = this._rowAtPoint(new HPoint(0,this._scrollRect.bottom));
    var _startingColumn, _endingColumn;
    var _xPos = this._scrollRect.left;
    var i = 0;
    // starting column
    while (i < this._tableColumns.length && _xPos > this._columnOrigins[i]) {
      i++;
    }
    _startingColumn = i-1;
    // happens when _xPos == 0
    if (_startingColumn==-1) {
      _startingColumn = 0;
    }
    var _xPos = this._scrollRect.right;
    // ending column
    while (i < this._tableColumns.length && _xPos > this._columnOrigins[i]) {
      i++;
    }
    _endingColumn = i-1;
        if (_endingColumn==-1) {
      _endingColumn = this._tableColumns.length-1;
    }
    
    var _partRowsUpdated = false;
    var _partUpRowsUpdated = false;
    var _allRowsUpdated = false;
    for (var i = _startingColumn; i <= _endingColumn; i++) {
        // creates visible HTableColumn it not created
        if ( this._tableColumns[i].created == false) {
          var _columnRect =  new HRect(
            this._columnOrigins[i],
            0,
            this._columnOrigins[i] + this._tableColumns[i].width,
            this.columnsView.rect.height
          );
          
          this.tableColumns[i] = new HTableColumn(
            _columnRect,
            this.columnsView,{
              label:this._tableColumns[i].string,
              dataView:this._tableColumns[i].dataView,
              headerView:this._tableColumns[i].headerView
          });
          //this.tableColumns[i].draw();
          
          this._tableColumns[i].created = true;
        }
        // creates visible HTableHeaderColumn it not created
        if ( this._tableColumns[i].headerCreated == false) {
          // synchronize also the scrolling
          var _headerColumnRect =  new HRect(
            this._columnOrigins[i] - this._scrollRect.left,
            0,
            this._columnOrigins[i] - this._scrollRect.left + this._tableColumns[i].width,
            this.options.headerViewHeight
          );
          this.tableHeaderColumns[i] = new HTableHeaderColumn(
            _headerColumnRect,
            this.headerView,
            {label:this._tableColumns[i].string}
          );
          this.tableHeaderColumns[i].draw();
          
          this._tableColumns[i].headerCreated = true;
        }
        var _tableColumn = this.tableColumns[i];
        var _tableHeaderColumn = this.tableHeaderColumns[i];
        
        
        if (this._dataRowBufferInitialized[i] == false) {
        
          this._initializeRows(i, _startingRow, _endingRow);
          this._dataRowBufferInitialized[i] = true;
        }
        
    }
    for (var i = 0; i < this._tableColumns.length; i++) {
      if (this._tableColumns[i].created == true) {
        
        
        
        var _tableColumn = this.tableColumns[i];
        var _tableHeaderColumn = this.tableHeaderColumns[i];
        _tableHeaderColumn.rect.offsetTo(
          this._columnOrigins[i] - this._scrollRect.left,
          0
        );
        _tableHeaderColumn.drawRect();
        _tableColumn.rect.set(
          this._columnOrigins[i],
          0,
          this._columnOrigins[i] + _tableColumn.width,
          this.columnsView.rect.height
        );
        _tableColumn.drawRect();
        
        
        
        // is within the buffer
        if (!this._reloading && this._dataRowBufferIndex <= _startingRow && _startingRow < this._dataRowBufferIndex + this.tableViewDefaults.bufferLength * this._dataBufferViewLength) {//check correct limits
          var _dataBuffer = new HDataBuffer(
            _startingRow,
            _endingRow,
            this._dataRowBufferIndex,
            this._dataRowBufferEndIndex,
            this._dataBufferViewLength
          );
          
          var _rowLowerLimit = _dataBuffer.lowerLimit();
          var _rowUpperLimit = _dataBuffer.upperLimit();
          // at the lower end
          // remember to handle other rows too
          if (_startingRow > _rowUpperLimit) {
            _partRowsUpdated = true;
            // rows are moved this location
            var _start = this._dataStartBufferIndex;
            var _yPos = _dataBuffer.getNewBottomRow() * this.options.rowHeight;
            var _newRowStart = _dataBuffer.getNewBottomRow();
            var _newRowEnd = _dataBuffer.getNewBottomRowEnd();
            // updates the values
            this._updateView(
              _start,
              _newRowStart,
              _newRowEnd,
              i,
              _yPos,
              _tableColumn
            );
            
            
            
            
          } else if (_startingRow <= _rowLowerLimit) {
            
            _partUpRowsUpdated = true;
            var _start = this._dataEndBufferIndex;
            var _yPos = _dataBuffer.getNewTopRow() * this.options.rowHeight;
            var _newRowStart = _dataBuffer.getNewTopRow();
            var _newRowEnd = _dataBuffer.getNewTopRowEnd();
            
            this._updateView(
              _start,
              _newRowStart,
              _newRowEnd,
              i,
              _yPos,
              _tableColumn
            );
            
            // scrolls up
          }
        } else {
          
          _allRowsUpdated = true;
          // lets reset things
          var _dataBuffer = new HDataBuffer(_startingRow, _endingRow,0,0,this._dataBufferViewLength);
          var _startingBufferRow = _dataBuffer.startingRow();
          var _endingBufferRow = _dataBuffer.endingRow();
          var _start = 0;
          var _yPos = _startingBufferRow * this.options.rowHeight;
          this._updateView(
            _start,
            _startingBufferRow,
            _startingBufferRow + this._dataBufferViewLength*3,
            i,
            _yPos,
            _tableColumn
          );
        }
         
      }
    }
    
      // below cannot be updated before all the columns have been handled
      // update the buffer index when all the rows have been updated
      if (_partRowsUpdated == true) {
        var _dataBuffer = new HDataBuffer(_startingRow, _endingRow,0,0,this._dataBufferViewLength);
        var _indexes = _dataBuffer.getNewDownBufferIndexes(this._dataStartBufferIndex);
        this._dataStartBufferIndex = _indexes[0];
        this._dataEndBufferIndex = _indexes[1];
        // updates the index by view length
        this._dataRowBufferIndex += this._dataBufferViewLength;
      }
      
      
      // update the buffer index when all the rows have been updated
      if (_partUpRowsUpdated == true) {
        var _dataBuffer = new HDataBuffer(_startingRow, _endingRow,0,0,this._dataBufferViewLength);
        var _indexes = _dataBuffer.getNewUpBufferIndexes(this._dataStartBufferIndex);
        this._dataStartBufferIndex = _indexes[0];
        this._dataEndBufferIndex = _indexes[1];
        // updates the index by view length
        this._dataRowBufferIndex -= this._dataBufferViewLength;
      }
      if (_allRowsUpdated == true) {
        var _dataBuffer = new HDataBuffer(_startingRow, _endingRow,0,0,this._dataBufferViewLength);
        this._dataStartBufferIndex = 0;
        this._dataEndBufferIndex = _dataBuffer.endBufferStartRow();
        this._dataRowBufferIndex = _startingRow - this._dataBufferViewLength;
      }
      // tells to the htablevalue where the view area and the buffer is
      this.data.updateBuffer(_startingRow,_endingRow);
  },
  _updateView: function(_start, _startRealRow, _endRealRow, _columnIndex, _locationY, _item) {
    var _value;
    for (var _rowIndex = _startRealRow; _rowIndex < _endRealRow; _rowIndex++) {
      _value = this.data.getCell(this,_rowIndex,this._tableColumns[_columnIndex].index);
      _value = (_value) ? _value : "1";
      this._tableRows[_columnIndex][_start].setValue(_value);
      this._tableRows[_columnIndex][_start].rect.offsetTo(
        0,
        _locationY
      );
      this._tableRows[_columnIndex][_start].drawRect();
      _locationY += this.options.rowHeight;
      _start++;
    }
  },
  _initializeRows: function(_columnIndex, _startingRow, _endingRow) {
    
    var _tableColumn = this.tableColumns[_columnIndex];
    if (!this._dataBufferViewLength) {
      this._dataBufferViewLength = _endingRow - _startingRow;
    }
    var _dataBuffer = new HDataBuffer(_startingRow, _endingRow,0,0,this._dataBufferViewLength);
    var _startingBufferRow = _dataBuffer.startingRow();
    var _endingBufferRow = _dataBuffer.endingRow();
    
    this._dataRowBufferIndex = _startingBufferRow;//buffer start
    this._dataRowBufferEndIndex = _endingBufferRow;//buffer end
    var _yPos = _startingBufferRow * this.options.rowHeight;
    
    // this._dataStartBufferIndex = 0;
    this._dataEndBufferIndex = _dataBuffer.endBufferStartRow();
    this._tableRows[_columnIndex] = new Array();
    var _dataView = _tableColumn.dataView
    // will be removed
    if (typeof _dataView == "string") {
      _dataView = ITextControl
    }
    var _view, _viewRect, _value;
    for (var _rowIndex=_startingBufferRow;_rowIndex<_endingBufferRow;_rowIndex++) {
      _value = this.data.getCell(this,_rowIndex,this._tableColumns[_columnIndex].index);
      _value = (_value) ? _value : "1";
      _viewRect = new HRect(0,_yPos,_tableColumn.rect.width,_yPos + this.options.rowHeight);
      _view = new _dataView(
        _viewRect,
        _tableColumn,
        {value:_value}
      );
      this._tableRows[_columnIndex].push(_view);
      _yPos += this.options.rowHeight;
    } 
  },
/** method: _calculateDimensions
  *
  * Calculates new dimensions whenever columns are added, or data is changed.
  * Makes scrolling very efficient, because you down't then calculate
  * any dimensions at that time.
  *
  **/
  _calculateDimensions: function() {
    var _tableWidth = 0, _tableHeight;
    // calculate table column origins and table view width
    if (this._tableColumns.length > 0) {
      var _width;
      this._columnOrigins[0] = 0;
      width = this._tableColumns[0].width;
      _tableWidth += width;
      for (var i = 1; i < this._tableColumns.length;i++) {
        this._columnOrigins[i] = this._columnOrigins[i-1] + width;
        width = this._tableColumns[i].width;
        _tableWidth += width;
      }
    }
    // this is the new table view height
    _tableHeight = this.numberOfRows * this.options.rowHeight;
    // updates the width and height of the content view
    this.columnsView.rect.setSize(_tableWidth,_tableHeight);
    this.columnsView.drawRect();
    // updates the header view
    if (this.headerView) {
      this.headerView.rect.setWidth(_tableWidth);
      this.headerView.drawRect();
    }
  },
  _rowAtPoint: function(_point) {
    return parseInt(_point.y / this.options.rowHeight, 10);
  },
  
  rowAtPoint: function(_point) {
    var _y =  _point.y;
    if (_y == 0) {
      return 0;
    }
    _y -= this.options.headerViewHeight;
    return parseInt(_y / this.options.rowHeight);
  },
/** method: addColumn
  * 
  * Adds a column as the last column of the receiver.
  * 
  * Parameters:
  *   _index - The index identifier of the data column
  *   _width - The width of the table header column
  *   _name - The name of the table header column
  *   _dataView - The data type of the table column
  *   _headerView - The data type of the table header column
  *
  **/ 
  addColumn: function(_index,_width,_name,_dataView,_headerView) {
    var _column = new _HTableColumn(_index,_width,_name,_dataView,_headerView);
    this._tableColumns.push(_column);//buffer
    this._dataRowBufferInitialized.push(false);
    
  },
/** method: setData
  * 
  * Sets the receiver's data source to a given object.
  *
  * Parameters:
  *   _data - The data source for the receiver. The Data source is a two dimensional array.
  *
  **/
  setData: function(_data) {
    this.data = _data;
    this.data.tableControl = this;
    this.numberOfRows = this.data.numberOfRows();
    this._calculateDimensions();
    //this.reloadData();
    
  },
/** method: reloadData
  * 
  * Reload the data for visible views and draw the new values.
  *
  **/ 
  reloadData: function(_data) {
    this._isUpdatingColumns=true;
    this._reloading = true;
    this._updateColumns();
    this._reloading = false;
    this._isUpdatingColumns=false;
  },
/** method: removeColumn
  * 
  * Removes a given column from the receiver.
  *
  * Parameters:
  *   _column - The column to remove from the receiver.
  *
  **/ 
  removeColumn: function(_column) {
    this._isUpdatingColumns=true;
    var _index = this.tableColumns.indexOf(_column);
    
    // removes all _column related data structures
    this._tableColumns.splice(_index,1);
    
    this.tableHeaderColumns[_index].die();
    this.tableHeaderColumns.splice(_index,1);
    
    this.tableColumns[_index].die();
    this.tableColumns.splice(_index,1);
    
    this._tableRows.splice(_index,1);
    this._dataRowBufferInitialized.splice(_index,1);
    
    this._calculateDimensions();
    this._updateColumns();
    this._isUpdatingColumns=false;
  },
/** method: moveColumn
  * 
  * Moves the column and heading at a given index to a new given index.
  *
  * Parameters:
  *   _columnIndex - The current index of the column to move.
  *   _newIndex - The new index for the moved column.
  *
  **/ 
  moveColumn: function(_columnIndex,_newIndex) {
    
    //alert(_columnIndex + " " + _newIndex);
    
    // onIdle runs asynchronous cycle, so we need lock columns when updating
    this._isUpdatingColumns=true;
    var _index1 = _columnIndex;
    var _index2 = _newIndex;
    if (_index1 < _index2) {
      var _temp = _index2;
      _index2 = _index1;
      _index1 = _temp;
    }
    // moves columnbuffer to right place
    var _column = this._tableColumns[_index1];
    this._tableColumns.splice(_index1,1);
    this._tableColumns.splice(_index2,0,_column);
    
    // moves table column views to right place
    _column = this.tableColumns[_index1];
    this.tableColumns.splice(_index1,1);
    this.tableColumns.splice(_index2,0,_column);
    
    // moves header column views to right place
    _column = this.tableHeaderColumns[_index1]
    this.tableHeaderColumns.splice(_index1,1);
    this.tableHeaderColumns.splice(_index2,0,_column);
    
    // moves row buffer initialized information to right place
    _column = this._dataRowBufferInitialized[_index1]
    this._dataRowBufferInitialized.splice(_index1,1);
    this._dataRowBufferInitialized.splice(_index2,0,_column);
    
    // moves row buffer to right place
    _column = this._tableRows[_index1]
    this._tableRows.splice(_index1,1);
    this._tableRows.splice(_index2,0,_column);
    this._calculateDimensions();
    this._updateColumns();
    
    this._isUpdatingColumns=false;
    
  },
  scrollLeft: function() {
    return this._scrollRect.left;
  },
  scrollTop: function() {
    return this._scrollRect.top;
  },
  _buffer: function() {
    var _tableElem = elem_get(this.tableView.elemId);
    if (!_tableElem) {
      throw("Error: HTableControl element not found");
    }
    var _prevScrollRect = new HRect(this._scrollRect);
    
    this._scrollRect.offsetTo(
      parseInt(_tableElem.scrollLeft,10),
      parseInt(_tableElem.scrollTop,10)
    );
    // updated if scrolled location differs from previous one
    if (!_prevScrollRect.equals(this._scrollRect)) {
      
      // we have here viewable area
      // onIdle runs asynchronous cycle, so we need lock columns when updating
      this._isUpdatingColumns=true;
      this._updateColumns();
      this._isUpdatingColumns=false;
    }
  }
});
Date.prototype.getWeek = function() {
  var _year = this.getFullYear();  
  var _newYear = new Date(_year,0,1);
  var _modDay = _newYear.getDay();
  var _daynum = ((Date.UTC(_year,this.getMonth(),this.getDate()) -
    Date.UTC(_year,0,1)) / (1000 * 60 * 60 * 24))/* + 1*/;
  if (_modDay == 0) {
    _modDay = 6;
  } else {
    _modDay--;
  }  
  // Monday is now 0 etc  
  var _weeknumDays = _daynum - (7 - _modDay);  
  var _fullWeeks = Math.floor(_weeknumDays / 7) + 1;
    
  // tuesday, wednesday tai thursday
  if (0 <= _modDay && _modDay <= 3) {
    _fullWeeks += 1;
  }
  _weeknum = _fullWeeks;
  if (_weeknum == 53) {
    // if year starts with thursday or
    // or karkausvuosi starts with wednesday or thursday
    if (_modDay == 3 ||
        ( (_modDay == 2 || _modDay == 3) &&
        ( (_year % 4 == 0 && _year % 100 != 0) || _year % 400 == 0) ) ) {
    } else {
      // next year's week 1
      _weeknum = 1;
    }
  }
  return _weeknum;
}
Date.prototype.getMonthLength = function() {
  var _month = this.getMonth();
  var _year = this.getFullYear();
  var _monthLength = [31,28,31,30,31,30,31,31,30,31,30,31];
  if (_month == 1 && ( (_year % 4 == 0 && _year % 100 != 0) || _year % 400 == 0) ) {
    return 29;
  } else {
    return _monthLength[_month];
  }
}
/** class: HDateValue
  *
  * HDateValues are <HValue> extensions used to support the special type of
  * value of dates/times with special xml output and internal representanion as a numeric value representing seconds since 1970-1-1
  * It has the accompanying methods to set date parts, like months and hours.
  *
  **/
HDateValue = HValue.extend({
  
/** constructor: constructor
  *
  * We just need the id and value, as usual.
  * However the value has to be a JavaScript Date object.
  *
  * Parameters:
  *  _id - See <HValue.constructor>
  *  _value - JavaScript Date object.
  *
  **/
  constructor: function(_id,_value){
    this.validate(_value);
    // default time zone
    this._dateFormat = "";
    this._timezone = 2;
    this.base(_id,_value);
    this.type = '[HDateValue]';
  },

  
/** method: validate
  *
  * Simple value validation
  *
  * Parameters:
  *  _value - JavaScript Date object.
  *
  **/
  validate: function(_value){
    
  },
  
/** method: set
  *
  * You should only set with values as arrays with three integers in range 0..255.
  *
  **/
  set: function(_value){
    this.base(_value);
  },
  
/** method: getYear
  *
  * Returns the year of the specified date according to local time.
  *
  * Returns:
  *  For dates between the years 1000 and 9999, getYear returns a four-digit number, for example, 1995.
  *
  **/
  getYear: function(){
    var _time = this._utcToLocal();
    return _time.getFullYear();
  },
  
/** method: getMonth
  *
  * Returns the month in the specified date according to local time.
  *
  * Returns:
  *  The value returned by getMonth is an integer between 1 and 12.
  *
  **/
  getMonth: function(){
    var _time = this._utcToLocal();
    return _time.getMonth() + 1;
  },
  
/** method: getWeek
  *
  * Returns the week in the specified date according to local time.
  *
  * Returns:
  *  The value returned by getWeek is an integer between 1 and 53.
  *
  **/
  getWeek: function(){
    var _time = this._utcToLocal();
    return _time.getWeek();
  },
  
  
/** method: getMDay
  *
  * Returns the day of the month for the specified date according to local time.
  *
  * Returns:
  *  The value returned by getMDay is an integer between 1 and 31.
  *
  **/
  getMDay: function(){
    var _time = this._utcToLocal();
    return _time.getDate();
  },
  
/** method: getHour
  *
  * Returns the hour for the specified date according to local time.
  *
  * Returns:
  *  The value returned by getHour is an integer between 0 and 23.
  *
  **/
  getHour: function(){
    var _time = this._utcToLocal();
    return _time.getHours();
  },
  
  _utcToLocal: function(){
    var _localTime = this.value.getTime();
    var _localOffset = this.value.getTimezoneOffset() * 60000;
    var _utc = _localTime + _localOffset; 
    var _time = new Date(_utc + (this._timezone * 3600000));
    return _time;
  },
  
/** method: getMinute
  *
  * Returns the minute for the specified date according to local time.
  *
  * Returns:
  *  The value returned by getMinute is an integer between 0 and 59.
  *
  **/
  getMinute: function(){
    var _time = this._utcToLocal();
    return _time.getUTCMinutes();
  },
  
/** method: getSecond
  *
  * Returns the second for the specified date according to local time.
  *
  * Returns:
  *  The value returned by getSecond is an integer between 0 and 59.
  *
  **/
  getSecond: function(){
    var _time = this._utcToLocal();
    return _time.getUTCSeconds();
  },
  
  getMilliSecond: function(){
    var _time = this._utcToLocal();
    return _time.getUTCMilliseconds();
  },
  
/** method: getTimeZone
  *
  * Returns:
  *  Returns the time-zone offset in hours for the current locale.
  *
  **/
  getTimeZone: function(){
    return this._timezone;
  },
  
/** method: setYear
  *
  * Sets the full year for a specified date according to local time.
  *
  * Parameters:
  *  _yearNum - An integer specifying the numeric value of the year, for example, 1995.
  *  _monthNum - An integer between 1 and 12 representing the months January through December.
  *  _mdayNum - An integer between 1 and 31 representing the day of the month. If you specify the dayValue parameter, you must also specify the monthValue.
  *
  **/
  setYear:   function(_yearNum, _monthNum, _mdayNum){
    if (_monthNum) {
      _monthNum -= 1;
    }
    this.value.setFullYear(_yearNum, _monthNum, _mdayNum);
    this.base(this.value);
  },
  
/** method: setMonth
  *
  * Set the month for a specified date according to local time.
  *
  * Parameters:
  *  _monthNum - An integer between 1 and 12.
  *  _mdayNum - An integer from 1 to 31, representing the day of the month.
  *
  **/
  setMonth:   function(_monthNum, _mdayNum){
    this.value.setMonth(_monthNum - 1, _mdayNum);
    this.base(this.value);
  },
  
/** method: setMDay
  *
  * Sets the day of the month for a specified date according to local time.
  *
  * Parameters:
  *  _mdayNum - An integer from 1 to 31, representing the day of the month.
  *
  **/
  setMDay:   function(_mdayNum){
    this.value.setDate(_mdayNum);
    this.base(this.value);
  },
  
/** method: setHour
  *
  * Sets the hour for a specified date according to local time.
  *
  * Parameters:
  *  _hourNum - An integer between 0 and 23, representing the hour.
  *  _minuteNum - An integer between 0 and 59, representing the minute.
  *  _secondNum - An integer between 0 and 59, representing the seconds. If you specify the _secondNum parameter, you must also specify the _minuteNum.
  *  _msNum - A number between 0 and 999, representing the milliseconds. If you specify the _msNum parameter, you must also specify the _minuteNum and _secondNum.
  *
  **/
  setHour:   function(_hourNum, _minuteNum, _secondNum, _msNum){
    this.value.setHours(_hourNum, _minuteNum, _secondNum, _msNum);
    this.base(this.value);
  },
  
/** method: setMinute
  *
  * Sets the minute for a specified date according to local time.
  *
  * Parameters:
  *  _minuteNum - An integer between 0 and 59, representing the minute.
  *  _secondNum - An integer between 0 and 59, representing the second. If you specify the _secondNum parameter, you must also specify the _minuteNum.
  *  _msNum - A number between 0 and 999, representing the millisecond. If you specify the _msNum parameter, you must also specify the _minuteNum and _secondNum.
  *
  **/
  setMinute:   function(_minuteNum, _secondNum, _msNum){
    this.value.setMinutes(_minuteNum, _secondNum, _msNum);
    this.base(this.value);
  },
  
/** method: setSecond
  *
  * Sets the second for a specified date according to local time.
  *
  * Parameters:
  *  _secondNum - An integer between 0 and 59.
  *  _msNum - A number between 0 and 999, representing the millisecond.
  *
  **/
  setSecond:   function(_secondNum, _msNum){
    this.value.setSeconds(_secondNum, _msNum);
    this.base(this.value);
  },
  
/** method: setTimeZone
  *
  * Parameters:
  *  _theTimeZoneNum - Negative or positive numeric value that represents
  *                    how many hours to add or subtract when making the 
  *                    value human-readable.
  *
  **/
  setTimeZone:   function(_theTimeZoneValue){
    this._timezone = _theTimeZoneValue;
  },
  
  
/** method: setDateFormat
  *
  * Parameters:
  *   _reprString - A string that represents date / time parts in the 
  *                 format the user wants them.
  *
  * See Also:
  *  <toDateString>
  **/
  setDateFormat: function(_reprString){
    this._dateFormat = _reprString;
  },
/** method: toDateString
  *
  * Format the value as a nice human-readable string.
  *
  * d - The day of the month. Single-digit days will not have a leading zero.
  * dd - The day of the month. Single-digit days will have a leading zero.
  * M - The numeric month. Single-digit months will not have a leading zero.
  * MM - The numeric month. Single-digit months will have a leading zero.
  * MMM - The abbreviated name of the month
  * MMMM - The full name of the month
  * y - The year without the century. If the year without the century is less than 10, the year is displayed with no leading zero.
  * yy - The year without the century. If the year without the century is less than 10, the year is displayed with a leading zero.
  * yyyy - The year in four digits, including the century.
  * h - The hour in a 12-hour clock. Single-digit hours will not have a leading zero.
  * hh - The hour in a 12-hour clock. Single-digit hours will have a leading zero.
  * H - The hour in a 24-hour clock. Single-digit hours will not have a leading zero.
  * HH - The hour in a 24-hour clock. Single-digit hours will have a leading zero.
  * m - The minute. Single-digit minutes will not have a leading zero.
  * mm - The minute. Single-digit minutes will have a leading zero.
  * s - The second. Single-digit seconds will not have a leading zero.
  * ss - The second. Single-digit seconds will have a leading zero.
  * t - The first character in the AM/PM designator
  * tt - The AM/PM designator
  * z - The time zone offset ("+" or "-" followed by the hour only). Single-digit hours will not have a leading zero.
  * zz - The time zone offset ("+" or "-" followed by the hour only). Single-digit hours will have a leading zero.
  *
  * See Also:
  *  <setDateFormat>
  **/
  toDateString: function(){
    var _monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var _abbpreviatedMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var _dateString = this._dateFormat;
    var _stringArray = [""];
    var _index = 0;
    var ch = "";
    var _day = this.getMDay().toString();
    var _month = this.getMonth().toString();
    var _year = this.getYear().toString();
    var _year2Digits = (_year.length == 1?"0"+_year:(_year.charAt(_year.length-2)+_year.charAt(_year.length-1)));
    var _24hour = this.getHour().toString();
    var _hour = this.getHour(); // temp
    var _12hour = (_hour > 12)?_hour-12:_hour;
    _12hour = (_12hour == 0)?12:_12hour;
    var _minute = this.getMinute().toString();
    var _second = this.getSecond().toString();
    var _timezone = this.getTimeZone();
    var _timezoneS = _timezone.toString();
    var _milliseconds = this.getHour() * 60 * 60 * 1000 +
      this.getMinute() * 60 * 1000 +
      this.getSecond() * 1000 +
      this.getMilliSecond();
    var _designator = (0 < _milliseconds && _milliseconds <= 12 * 60 * 60 * 1000)?"AM":"PM";
    
    var regexpArray = [
      [/dd/g,(_day.length == 1?"0":"")+_day],       // dd
      [/d/g,_day],                                  // d
      [/MMMM/g,"'"+_monthNames[parseInt(_month)-1]+"'"],  // MMMM
      [/MMM/g,"'"+_abbpreviatedMonthNames[parseInt(_month)-1]+"'"],  // MMM
      [/MM/g,(_month.length == 1?"0":"")+_month],   // MM
      [/M/g,_month],                                // M
      [/yyyy/g,_year],                              // yyyy
      [/yy/g,_year2Digits],                         // yy
      [/y/g,parseInt(_year2Digits)],                // y,
      [/HH/g,(_24hour.length == 1?"0":"")+_24hour], // HH
      [/H/g,_24hour],                               // H
      [/hh/g,(_12hour.length == 1?"0":"")+_12hour], // hh
      [/h/g,_12hour],                               // h
      [/mm/g,(_minute.length == 1?"0":"")+_minute], // mm
      [/m/g,_minute],                               // m
      [/ss/g,(_second.length == 1?"0":"")+_second], // ss
      [/s/g,_second],                               // s
      [/zz/g,((_timezone > 0) ? "+" : "")+(_timezoneS.length == 1?"0":"")+_timezone], // zz
      [/z/g,((_timezone > 0) ? "+" : "")+_timezone],                                  // z
      [/tt/g,"'"+_designator+"'"],                          // tt
      [/t/g,"'"+_designator.charAt(0)+"'"]                 // t
    ];
    
    for (var i = 0; i < _dateString.length; i++) {
      ch = _dateString.charAt(i);
      if (ch == "'") {
        if (i > 0) {
          _index++;
          _stringArray[_index] = "";
        }
        _stringArray[_index] += ch;
        i++;
        ch = _dateString.charAt(i);
        while (ch != "'" && i < _dateString.length) {
          _stringArray[_index] += ch;
          i++;
          ch = _dateString.charAt(i);
        }
        if (i < _dateString.length) {
          _stringArray[_index] += ch;
          _index++;
          _stringArray[_index] = "";
        }
      } else {
        _stringArray[_index] += ch;
      }
    }
    for (var i = 0; i < _stringArray.length; i++) {
      if (_stringArray[i].charAt(0) != "'") {
        for (var j = 0; j < regexpArray.length; j++) {
          _stringArray[i] = _stringArray[i].replace(regexpArray[j][0],regexpArray[j][1]);
          if (_stringArray[i].indexOf("'") >= 0) { // text replace
            var k = _stringArray[i].indexOf("'");
            var k2 = _stringArray[i].indexOf("'",k+1);
            var _split = _stringArray[i];
            var _split1 = _split.substring(0,k);
            var _split2 = _split.substring(k,k2+1);
            var _split3 = _split.substring(k2+1,_split.length);
            _stringArray.splice(i,1,_split1,_split2,_split3);
            i++;
            break;
          }
        }
      }
    }
    
    return _stringArray.join("").replace(/'/g,"");
  },
  
/** method: toXML
  *
  * Generates an XML description of the date.
  *
  * Parameter:
  *  _i - The sequence number of the item, generated by HValueManager.
  *
  * Returns:
  *  An XML string with the date as specified
  *
  * See Also:
  *  <HValue.toXML> <HValueManager.toXML>
  *
  * Sample:
  * > <date id="date:215" order="1" epochvalue="1163153913.33" timezone="+2"><year>2006</year><month>11</month><mday>10</mday><hour>10</hour><minute>20</minute><second>23</second><timezone>+2</timezone></date>
  **/
  toXML: function(_i){
    var _syncid = this.id;
    var _timezone = this.getTimeZone();
    _timezone = ((_timezone > 0) ? "+" : "") +_timezone;
    return '<date id="'+_syncid+'" order="'+_i+'" epochvalue="'+this.value.getTime()+'" timezone="'+_timezone+'"><year>'+this.getYear()+'</year><month>'+this.getMonth()+'</month><mday>'+this.getMDay()+'</mday><hour>'+this.getHour()+'</hour><minute>'+this.getMinute()+'</minute><second>'+this.getSecond()+'</second></date>';
  }
});


HCalendarButton = HControl.extend({
  
  packageName:   "calendar",
  componentName: "calendarbutton",

  constructor: function(_rect,_parentClass,_options) {
    if(this.isinherited){
      this.base(_rect,_parentClass,_options);
    }
    else {
      this.isinherited = true;
      this.base(_rect,_parentClass,_options);
      this.isinherited = false;
    }
    
    this.type = '[HCalendarButton]';
    
    this._tmplLabelPrefix = "calendarbuttonlabel";
    
    this.setMouseDown(true);
    this.setKeyDown(true);
    
    if(!this.isinherited){
      this.draw();
    }
  },
  
  keyDown: function(_keycode) {
    this.parent.keyDown(_keycode);
  },
  
  
  // Private method.
  _updateCheckBoxImage: function(){
    // Sets the checkbox background image
    if (this.value == 0) {
      this.toggleCSSClass(elem_get(this._labelElementId),
        "shaded", false);
      this.toggleCSSClass(elem_get(this._labelElementId),
        HCalendarButton.cssOn, false);
      this.toggleCSSClass(elem_get(this._labelElementId),
        HCalendarButton.cssOff, true);
    } else if (this.value == 1) {
      this.toggleCSSClass(elem_get(this._labelElementId),
        "shaded", false);
      this.toggleCSSClass(elem_get(this._labelElementId),
        HCalendarButton.cssOn, true);
      this.toggleCSSClass(elem_get(this._labelElementId),
        HCalendarButton.cssOff, false);
    } else if (this.value == 2) {
      this.toggleCSSClass(elem_get(this._labelElementId),
        "shaded", true);
      this.toggleCSSClass(elem_get(this._labelElementId),
        HCalendarButton.cssOn, false);
      this.toggleCSSClass(elem_get(this._labelElementId),
        HCalendarButton.cssOff, false);
    }
    /*if(this.value){
      this.toggleCSSClass(elem_get(this._labelElementId),
        HCalendarButton.cssOn, true);
      this.toggleCSSClass(elem_get(this._labelElementId),
        HCalendarButton.cssOff, false);

    } else {
      this.toggleCSSClass(elem_get(this._labelElementId),
        HCalendarButton.cssOn, false);
      this.toggleCSSClass(elem_get(this._labelElementId),
        HCalendarButton.cssOff, true);
    }*/
  },
  
  
  // HControl seems to call refresh too.
  /* setValue: function(_value){
    this.base(_value);
    this.refresh();
  }, */
  
  // setValue calls refresh that calls _updateCheckBoxImage.
  /* onIdle: function(){
    this._updateCheckBoxImage();
    this.base();
  }, */
  
  
  draw: function() {
    if(!this.drawn){
      this.drawRect();
      this.drawMarkup();
      this.drawn = true;
    }
    this.refresh();
  },
  
  

  refresh: function() {
    if(this.drawn) {
      // Checks if this is the first refresh call:
      if(!this._labelElementId){
        // Gets the label element based on the id specified in constructor and template:
        this._labelElementId = elem_bind(this._tmplLabelPrefix+this.elemId);
      }
      // Checks if we have a label element:
      if(this._labelElementId) {
        elem_set(this._labelElementId,this.label);
        this._updateCheckBoxImage();
      }
      this.drawRect();
    }
  },
  setShaded: function(){
    this.value = 0;
  },
  setSelected: function(){
    
  },
  setNormal: function(){
    
  },
 
  mouseDown: function(_x,_y,_isLeftButton){
    this.parent.selectDay(this.index);
    //this.setValue(!this.value);
  }
  
},{

  // The name of the CSS class to be used when...
  
  // the item is selected.
  cssOn: "on",
  // the item not selected.
  cssOff: "off"
});

HCalendarControl = HControl.extend({
  
  packageName:   "calendar",
  componentName: "calendarcontrol",

  constructor: function(_rect, _parentClass, _options) {
    if(this.isinherited) {
      this.base(_rect, _parentClass, _options);
    }
    else {
      this.isinherited = true;
      this.base(_rect, _parentClass, _options);
      this.isinherited = false;
    }
    
    this.type = '[HCalendarControl]';
    
    // When this is true, the component is always drawn with the theme that was
    // active at the creation of the component, not the current theme.
    this.preserveTheme = true;
    
    // Show 2 years back and 5 years to the future in the year selector by
    // default.
    var _thisYear = new Date().getFullYear();
    var _defaultYears = [];
    for (var i = _thisYear - 2; i < _thisYear + 6; i++) {
      _defaultYears.push(i);
    }
    this._calendarDefaults = {
      hSpace: 26,
      vSpace: 20,
      selectToday: true,
      switchMonths: true,
      dayList: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      startDay: 0,
      monthList: ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"],
      yearList: _defaultYears,
      barHeight: 25
    };
    
    this._initialized = false;
    
    if(!this.isinherited) {
      this.draw();
    }
  },
  
  
  // Key events redirected from calendar buttons
  keyDown: function(_keycode) {
    if ( _keycode == Event.KEY_LEFT) {
      this.previousDay();
    }
    else if (_keycode == Event.KEY_RIGHT) {
      this.nextDay();
    }
    else if (_keycode == Event.KEY_UP) {
      this.previousWeek();
    }
    else if (_keycode == Event.KEY_DOWN) {
      this.nextWeek();
    }
    else if (_keycode == Event.KEY_PAGEUP) {
      this.previousMonth();
    }
    else if (_keycode == Event.KEY_PAGEDOWN) {
      this.nextMonth();
    }


  },
  
  // Helpers for moving around in the calendar
  previousDay: function() {
    var _day = this.day - 1;
    if (_day < 1) {
      this.previousMonth();
      _day = new Date(this.year, this.month, 1).getMonthLength();
    }
    this.setDate(this.year, this.month, _day);
  },
  
  nextDay: function() {
    var _day = this.day + 1;
    if (_day > new Date(this.year, this.month, 1).getMonthLength()) {
      this.nextMonth();
      _day = 1;
    }
    this.setDate(this.year, this.month, _day);
  },
  
  previousWeek: function() {
    var _day = this.day - 7;
    if (_day < 1) {
      this.previousMonth();
      _day = new Date(this.year, this.month, 1).getMonthLength() +
        (this.day - 7);
    }
    this.setDate(this.year, this.month, _day);
  },
  
  nextWeek: function() {
    var _day = this.day + 7;
    var _monthLen = new Date(this.year, this.month, 1).getMonthLength();
    if (_day > _monthLen) {
      this.nextMonth();
      _day = _day - _monthLen;
    }
    this.setDate(this.year, this.month, _day);
  },
  
  previousMonth: function() {
    var _month = this.month - 1;
    var _year = this.year;
    if (_month < 0) {
      _year--;
      _month = this._calendarDefaults.monthList.length - 1;
    }
    this.setDate(_year, _month, this.day);
  },
  
  nextMonth: function() {
    var _month = this.month + 1;
    var _year = this.year;
    if (_month > this._calendarDefaults.monthList.length - 1) {
      _year++;
      _month = 0;
    }
    this.setDate(_year, _month, this.day);
  },
  
  
  draw: function() {
    if(!this._initialized) {
      this.rect.width = this._calendarDefaults.hSpace * 8;
      this.rect.right = this.rect.left + this.rect.width;
      this.rect.height = this._calendarDefaults.barHeight +
        this._calendarDefaults.vSpace * 7;
      this.rect.bottom = this.rect.top + this.rect.height;
    }
    
    this.base();
    
    if(!this._initialized) {
      this.drawMarkup();
      
      var _left, _top, _right, _bottom;
      
      this._useDate();
      this.monthControl = new HComboBox(new HRect(4,3,86,23), this, {
        enabled: this.enabled
      });
      for (var i = 0; i < this._calendarDefaults.monthList.length; i++) {
        this.monthControl.addItem(this._calendarDefaults.monthList[i]);
      }
      
      this.monthControl.selectedIndexChanged = this._selectedIndexChanged;
      this.yearControl = new HComboBox(new HRect(89,3,146,23), this, {
        enabled: this.enabled
      });
      for (var i = 0; i < this._calendarDefaults.yearList.length; i++) {
        this.yearControl.addItem(this._calendarDefaults.yearList[i]);
      }
      
      this.yearControl.selectedIndexChanged = this._selectedIndexChanged2;
      
      this.closeButton = new HButton(
        new HRect(150, 7, 164, 21),
        this,
        {label: '', enabled: this.enabled}
      );
      
      this.closeButton.setMouseUp(true);
      this.closeButton.mouseUp = this._close;
      var i, j, _item;
      var k = 0;
      i = 0;
      
      
      // Create weekday names for the header row.
      for (j = 0; j < 7 - this._calendarDefaults.startDay; j++) { // rows
        
        _left = this._calendarDefaults.hSpace * (j + 1);
        _top = this._calendarDefaults.barHeight +
          this._calendarDefaults.vSpace * (i);
        _right = _left + this._calendarDefaults.hSpace;
        _bottom = _top + this._calendarDefaults.vSpace;
        
        _item = new HCalendarHeaderButton(
          new HRect(_left, _top, _right, _bottom),
          this, {
            label: this._calendarDefaults.dayList[
              j + this._calendarDefaults.startDay
            ],
            enabled: this.enabled
          }
        );  
        
      }
      
      
      // If monday is the first day of the week, create header for sunday here.
      if (this._calendarDefaults.startDay == 1) {
        
        _left = this._calendarDefaults.hSpace * (j + 1);
        _top = this._calendarDefaults.barHeight +
          this._calendarDefaults.vSpace * (i);
        _right = _left + this._calendarDefaults.hSpace;
        _bottom = _top + this._calendarDefaults.vSpace;
        
        _item = new HCalendarHeaderButton(
          new HRect(_left, _top, _right, _bottom),
          this, {
            label: this._calendarDefaults.dayList[0],
            enabled: this.enabled
          }
        );  
        
      }
      
      
      // Create the left-top corner square for the header.
      _left = 0;
      _top = this._calendarDefaults.barHeight +
        this._calendarDefaults.vSpace * (i);
      _right = _left + this._calendarDefaults.hSpace;
      _bottom = _top + this._calendarDefaults.vSpace;
      
      _item = new HCalendarHeaderButton(
        new HRect(_left, _top, _right, _bottom),
        this, {
          label: '',
          enabled: this.enabled
        }
      );  
      
      
      
      // Create week numbers in the leftmost column.
      this.spot2 = [];
      for (i = 0; i < 6; i++) {
        
        _left = 0;
        _top = this._calendarDefaults.barHeight +
          this._calendarDefaults.vSpace * (i + 1);
        _right = _left + this._calendarDefaults.hSpace;
        _bottom = _top + this._calendarDefaults.vSpace;
        
        _item = new HCalendarHeaderButton(
          new HRect( _left, _top, _right, _bottom),
          this, {
            label: this.spotstr2[i],
            enabled: this.enabled
          }
        );
        
        this.spot2[i] = _item;
      }
      
      
      // Create the day numbers for the calendar grid.
      this.spot = [];
      for (i = 0; i < 6; i++) { // rows
        for (j = 0; j < 7; j++) { // columns
          
          _left = this._calendarDefaults.hSpace * (j + 1);
          _top = this._calendarDefaults.barHeight +
            this._calendarDefaults.vSpace * (i + 1);
          _right = _left + this._calendarDefaults.hSpace;
          _bottom = _top + this._calendarDefaults.vSpace;
          
          _item = new HCalendarButton(
            new HRect(_left, _top, _right, _bottom),
            this, {
              label: this.spotstr[k].day,
              enabled: this.enabled
            }
          );
          _item.index = k;
          _item.setValue(this.spotstr[k].shade);

          this.spot[k] = _item;
          k++;
        }
      }
      
      this._updateMonth();
      this._updateYear();
      
      this._initialized = true;
    }
  },
  
  _close: function(_x, _y) {
    this.parent.hide();
    this.base(_x, _y);
  },
  
  _selectedIndexChanged: function() {
    if (this.parent.updating2) {
      return;
    }
    this.parent.setDate(this.parent.year, this.selectedIndex(),
      this.parent.day);
  },
  
  _selectedIndexChanged2: function() {
    if (this.parent.updating) {
      return;
    }
    this.parent.setDate(this.selectedItem().label, this.parent.month,
      this.parent.day);
  },
  
  _updateYear: function() {
    this.updating = true;
    for (var i = 0; i < this._calendarDefaults.yearList.length; i++) {
      if (this._calendarDefaults.yearList[i] == this.year) {
        this.yearControl.selectItemAtIndex(i);
        break;
      }
    }
    this.updating = false;
  },
  
  _updateMonth: function() {
    this.updating2 = true;
    this.monthControl.selectItemAtIndex(this.month);
    this.updating2 = false;
  },
  
  _updateWeek: function() {
    for (var i = 0; i < 6; i++) {
      this.spot2[i].setLabel(this.spotstr2[i]);
    }
  },
  
  _updateDate: function() {
    for (var i = 0; i < 42; i++) {
      this.spot[i].setLabel(this.spotstr[i].day);
      this.spot[i].setValue(this.spotstr[i].shade);
    }
  },
  
  _calendarGetString: function(day, which) {
    if (which == 0) {
      return {shade:2, day:day};
    }
    if (which == 1) {
      return {shade:0, day:day};
    }
    if (which == 2) {
      return {shade:1, day:day};
    }
  },
  
  setDate: function(_year, _month, _day, _fromSetValue) {
    if (_year == this.year && _month == this.month &&  _day == this.day) {
      return;
    }
    if (!_fromSetValue) {
      this.setValue(new Date(_year, _month, _day));
    }
    this._useDate(_year, _month, _day);
    this._updateDate();
    this._updateWeek();
    this._updateMonth();
    this._updateYear();
  },
  
  setValue: function(_dateValue) {
    this.base(_dateValue);
    if(this.valueObj instanceof HDateValue && !this._updatingSetValue) {
      this.setDate(_dateValue.getFullYear(), _dateValue.getMonth(),
        _dateValue.getDate(),true);
    }
  },
  
  selectDay: function(i) {
    if (i == this.todayspot) {
      return;
    }
    if (i < this.firstspot && this._calendarDefaults.switchMonths) {
      this.setDate(this.year, this.month - 1, this.spotday[i]);
    } else if (i >= this.lastspot && this._calendarDefaults.switchMonths) {
      this.setDate(this.year, this.month + 1, this.spotday[i]);
    } else {
      if (this.todayspot != null) {
        this.spotstr[this.todayspot] = this._calendarGetString(
          this.spotday[this.todayspot], 1);
          
        this.spot[this.todayspot].setValue(this.spotstr[this.todayspot].shade);
      }
      this.todayspot = i;
      this._useDate(this.year, this.month, this.spotday[i]);
      this.spot[i].setValue(this.spotstr[i].shade);
      this._updateMonth();
      this._updateYear();
      this._updatingSetValue = true;
      this.setValue(new Date(this.year, this.month, this.spotday[i]));
      this._updatingSetValue = false;
    }
    
  },
  
  // Private method.
  // If the parameters are omitted, current date will be used.
  _useDate: function(_year, _month, _day) {
    
    // Validate the parameters.
    var d = new Date();
    if (!_month && _month != 0) {
      _month = d.getMonth();
    }
    if (!_day) {
      _day = d.getDate();
    }
    if (!_year) {
      _year = d.getFullYear();
    }
    if (_year < 100) {
      _year += 1900;
    }
    if (_month < 0) {
      _month = 11;
      _year -= 1;
    } else if (_month > 11) {
      _month = 0;
      _year += 1;
    }
    var l = new Date(_year, _month, 1).getMonthLength();
    if (_day > l || _day < 0) {
      _day = l;
    }
    
    this.year = _year;
    this.month = _month;
    this.day = _day;
    
    
    // The first day of the month as a Date object.
    var date = new Date(this.year, this.month, this.day);
    date.setDate(1);
    
    
    // _calshift tells how many days of the last month is to be showed in the
    // current month view.
    var _calshift = date.getDay() - this._calendarDefaults.startDay;
    if (_calshift == -(this._calendarDefaults.startDay) || _calshift == 0) {
      _calshift += 7;
    }
    
    
    this.spotstr2 = new Array();
    
    var thisMonth_length = new Date(this.year, this.month, 1).getMonthLength();
    var lastMonth = (this.month == 0) ? 11 : this.month -1;
    var lastMonth_length = new Date(this.year, lastMonth, 1).getMonthLength();
    var calstart = lastMonth_length - _calshift + 1;
    var which,c;
    _day = 0;
    this.spotday = new Array();
    this.spotstr = new Array();
    for (var i = 0; i < _calshift; i++) {
      // first week number
      if (i == 0) {
        var year1 = (this.month == 0) ? this.year - 1 : this.year;
        this.spotstr2[0] = new Date(year1, lastMonth, calstart + i).getWeek();
      }
      this.spotday[i] = calstart + i;
      this.spotstr[i] = this._calendarGetString(this.spotday[i], 0);
    }
    this.firstspot = _calshift;
    
    for (var i = _calshift; i < thisMonth_length + _calshift; i++) {
      if (i == 7) {
        this.spotstr2[1] = new Date(
          this.year, this.month, i - _calshift + 1).getWeek();
      } else if (i == 14) {
        this.spotstr2[2] = new Date(
          this.year, this.month, i - _calshift + 1).getWeek();
      } else if (i == 21) {
        this.spotstr2[3] = new Date(
          this.year, this.month, i - _calshift + 1).getWeek();
      } else if (i == 28) {
        this.spotstr2[4] = new Date(
          this.year, this.month, i - _calshift + 1).getWeek();
      }
      
      // last week number
      if (i == 35) {
        if (c < 15) {
          
          var year1 = (this.month == 11) ? this.year + 1 : this.year;
          var month1 = (this.month == 11) ? 0 : this.month + 1;
          this.spotstr2[5] = new Date(
            year1, month1, i - _calshift + 1).getWeek();
            
        } else {
          
          this.spotstr2[5] = new Date(
            this.year, this.month, i - _calshift + 1).getWeek();
            
        }
      }
      
      this.spotday[i] = i - _calshift + 1;
      if (this.spotday[i] == this.day && this._calendarDefaults.selectToday) {
        which = 2;
        this.todayspot = i;
      } else {
        which = 1;
      }
      this.spotstr[i] = this._calendarGetString(this.spotday[i], which);
    }
    
    c = 1;
    this.lastspot = thisMonth_length + _calshift;
    
    for (var i = thisMonth_length + _calshift; i < 42; i++) {
      // last week number
      if (i == 35) {
        if (c < 15) {
          var year1 = (this.month == 11) ? this.year + 1 : this.year;
          var month1 = (this.month == 11) ? 0 : this.month + 1;
          this.spotstr2[5] = new Date(year1, month1, c).getWeek();
        } else {
          this.spotstr2[5] = new Date(this.year, this.month, c).getWeek();
        }
      }
      this.spotday[i] = c++;
      this.spotstr[i] = this._calendarGetString(this.spotday[i], 0);
      
    }
  }
  
});



HCalendarHeaderButton = HControl.extend({
  
  packageName:   "calendar",
  componentName: "calendarheaderbutton",

  constructor: function(_rect,_parentClass,_options) {
    if(this.isinherited){
      this.base(_rect,_parentClass,_options);
    }
    else {
      this.isinherited = true;
      this.base(_rect,_parentClass,_options);
      this.isinherited = false;
    }
    
    this.type = '[HCalendarHeaderButton]';
    
    this._tmplLabelPrefix = "calendarheaderbuttonlabel";
    
    this.setKeyDown(true);
    
    if(!this.isinherited){
      this.draw();
    }
  },
  
  keyDown: function(_keycode) {
    this.parent.keyDown(_keycode);
  },
  
  
  // HControl seems to call refresh too.
  /* setValue: function(_value){
    this.base(_value);
    this.refresh();
  }, */
  
  // setValue calls refresh that calls _updateCheckBoxImage.
  /* onIdle: function(){
    this._updateCheckBoxImage();
    this.base();
  }, */
  
  
  draw: function() {
    if(!this.drawn){
      this.drawRect();
      this.drawMarkup();
      this.drawn = true;
    }
    this.refresh();
  },
  
  refresh: function() {
    if(this.drawn) {
      // Checks if this is the first refresh call:
      if(!this._labelElementId){
        // Gets the label element based on the id specified in constructor and template:
        this._labelElementId = elem_bind(this._tmplLabelPrefix+this.elemId);
      }
      // Checks if we have a label element:
      if(this._labelElementId) {
        elem_set(this._labelElementId,this.label);
      }
      this.drawRect();
    }
  }
  
});

/** class: HColorValue
  *
  * ColorValues are <HValue> extensions used to support the special type of
  * value with special xml output and internal representanion as a fixed size array.
  * It has the accompanying methods to set part-colors.
  *
  **/
HColorValue = HValue.extend({
  
/** constructor: constructor
  *
  * We just need the id and value, as usual.
  * However the value has to be a array with excactly three items.
  *
  * Parameters:
  *  _id - See <HValue.constructor>
  *  _value - A valid three-part color array, see <validate>
  *
  **/
  constructor: function(_id,_value){
    this.validate(_value);
    this.base(_id,_value);
    this.type = '[ColorValue]';
  },

  
/** method: validate
  *
  * Simple value validation
  *
  * Parameters:
  *  _value - Must be Array with excactly three numbers: [R,G,B]. Nothing else is supported.
  *
  **/
  validate: function(_value){
    if(!_value instanceof Array){
      throw('ColorValueError: ColorValue must be array');
    }
    if(_value.length != 3){
      throw('ColorValueError: ColorValues need three parts');
    }
  },
  
/** method: set
  *
  * You should only set with values as arrays with three integers in range 0..255.
  *
  **/
  set: function(_value){
    if(_value == this.value){
      return;
    }
    if(_value === undefined){
      throw('ColorValueError: Tried to set '+_value);
    }
    this.validate(_value);
    var _rgbval = new Array(3);
    for(_colorPart=0;_colorPart<3;_colorPart++){
      var _colorVal = _value[_colorPart];
      if((_colorVal<0)||(_colorVal>255)){
        _rgbval[_colorPart] = this.value[_colorPart];
      } else {
        _rgbval[_colorPart] = _colorVal;
      }
    }
    this.base(_rgbval);
  },
  
/** method: getRed
  *
  * Returns:
  *  The Red color part as an integer number.
  *
  **/
  getRed:   function(){
    return this.value[0];
  },
  
/** method: getGreen
  *
  * Returns:
  *  The Green color part as an integer number.
  *
  **/
  getGreen: function(){
    return this.value[1];
  },
  
/** method: getBlue
  *
  * Returns:
  *  The Blue color part as an integer number.
  *
  **/
  getBlue:  function(){
    return this.value[2];
  },
  
  
  
/** method: setRed
  *
  * Parameters:
  *  _redVal - Set Red color part as an valid (0...255) integer number.
  *
  **/
  setRed:   function(_redVal){
    this.set([Math.round(_redVal),-1,-1]);
  },
  
/** method: setGreen
  *
  * Parameters:
  *  _grnVal - Set Green color part as an valid (0...255) integer number.
  *
  **/
  setGreen: function(_grnVal){
    this.set([-1,Math.round(_grnVal),-1]);
  },
  
/** method: setBlue
  *
  * Parameters:
  *  _bluVal - Set Blue color part as an valid (0...255) integer number.
  *
  **/
  setBlue:  function(_bluVal){
    this.set([-1,-1,Math.round(_bluVal)]);
  },
  
  // Format the value as a nice rgb value usable in css or something similar.
  toRGBString: function(){
    return 'rgb('+this.value[0]+', '+this.value[1]+', '+this.value[2]+')';
  },
  
  // Initialize an array of 256 items with each having a hexadecimal value.
  _initHexArr: function(){
    this._hexArr = new Array(256);
    var _hexStr = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F'];
    for(var _majorBit=0;_majorBit<16;_majorBit++){
      for(var _minorBit=0;_minorBit<16;_minorBit++){
        var _decVal = (_majorBit*16)+_minorBit;
        var _hexVal = _hexStr[_majorBit]+_hexStr[_minorBit];
        this._hexArr[_decVal] = _hexVal;
      }
    }
  },
  
  // Format the value as a nice #RRGGBB hexadecimal value usable in css or something similar.
  toHexString: function(_toLowerCase){
    if(!this._hexArr){
      this._initHexArr();
    }
    var _redHex = this._hexArr[this.getRed()];
    var _grnHex = this._hexArr[this.getGreen()];
    var _bluHex = this._hexArr[this.getBlue()];
    var _hexString = '#'+_redHex+_grnHex+_bluHex;
    if(_toLowerCase){
      _hexString = _hexString.toLowerCase();
    }
    return _hexString;
  },
  
/** method: toXML
  *
  * Generates an XML description of the color.
  *
  * Parameter:
  *  _i - The sequence number of the item, generated by HValueManager.
  *
  * Returns:
  *  An XML string with the 3 RGB colorparts
  *
  * See Also:
  *  <HValue.toXML> <HValueManager.toXML>
  *
  * Sample:
  * > <color id="996" order="30" hexvalue="#ffcc33"><red>255</red><green>204</green><blue>51</blue></color>'
  **/
  toXML: function(_i){
    var _syncid = this.id;
    var _syncRed = this.getRed();
    var _syncGrn = this.getGreen();
    var _syncBlu = this.getBlue();
    var _syncHex = this.toHexString();
    return '<color id="'+_syncid+'" order="'+_i+'" hexvalue="'+_syncHex+'"><red>'+_syncRed+'</red><green>'+_syncGrn+'</green><blue>'+_syncBlu+'</blue></color>';
  }
});

/*** class: HColorView
  **
  ** HColorView is a simple box component that display its <HColorValue> as the 
  ** color of the box.
  ** Its default usage model is to specify an function reference with <setAction>.
  ** That function will be called with the <HColorValue> bound to the HColorView
  ** whenever the HColorView is clicked.
  **
  ** Extends:
  **  <HControl>
  ***/
HColorView = HControl.extend({
  
  componentName: "colorview",	
  
  constructor: function(_rect,_parentClass,_options) {
    if(!_options){
      _options = {};
    }
    if(!_options.events){
      _options.events = {
        mouseDown: true
      }
    }
    if(this.isinherited){
      this.base(_rect,_parentClass,_options);
    }
    else {
      this.isinherited = true;
      this.base(_rect,_parentClass,_options);
      this.isinherited = false;
    }
    
    this.type = '[HColorView]';
    this.preserveTheme = true;
    
    if(!this.isinherited){
      this.draw();
    }
  },

  draw: function() {
    this.drawRect();
    if(!this.drawn){
      this.drawMarkup();
      this.drawn = true;
    }
  },

/** event: mouseDown
  *
  * Call the action of the component with the valueObj as an parameter.
  * The purpose is to give the selected color to a function that actually does 
  * something with it.
  * The receiving action could be, for example, a setValueObj method of a component 
  * that handles colors.
  *
  * See also:
  *  <HControl.action> <HControl.setAction>
  *
  **/
  mouseDown: function(_x,_y,_rightButton){
    if(this.action){
      this.action(this.valueObj);
    }
  },
  
/** method: setValue
  *
  * If a <HColorValue> object is given as the value, the background is set accordingly.
  *
  **/
  setValue: function(_colorArr){
    this.base(_colorArr);
    if(this.valueObj instanceof HColorValue){
      this.setStyle('background-color',this.valueObj.toHexString());
    }
  }
});


// Alias for backwards-compatibility
HColorSwatchItem = HColorView;




/** class: HColorValueMixer
  *
  * HColorValueMixer is a simple value responder utility class 
  * that mixes a single integer value to affect several part colors of 
  * the target class's <HColorValue>.
  *
  * vars: Intance Variables
  *  target - The target object. Usually a parent or similar, it should be a class instance with at least a <HColorValue> valueObj.
  *  mixRed - A multiplier that tells the mixer to mix [multiplier] red part colors.
  *  mixGrn - A multiplier that tells the mixer to mix [multiplier] green part colors.
  *  mixBlu - A multiplier that tells the mixer to mix [multiplier] blue part colors.
  *  valueObj - The value object to mix.
  *
  **/
HColorValueMixer = Base.extend({

/** constructor: constructor
  *
  * Parameters:
  *  _target - The target <HColorValue> valueObj holder instance whose color value will be mixed.
  *  _red    - The amount of red to mix (should be a multiplier, preferrably 0.0 to 1.0)
  *  _grn    - The amount of green to mix (should be a multiplier, preferrably 0.0 to 1.0)
  *  _blu    - The amount of blue to mix (should be a multiplier, preferrably 0.0 to 1.0)
  *
  **/
  constructor: function(_target,_red,_grn,_blu){
    this.target      = _target;
    if( (typeof _red == 'number') &&
        (typeof _grn == 'number') &&
        (typeof _blu == 'number') ){
      this.mixRed      = _red;
      this.mixGrn      = _grn;
      this.mixBlu      = _blu;
    } else {
      throw("HColorValueMixerConstructorError: The mixable color parts have to be numerics, usually floating point values in the range 0.0 - 1.0.");
    }
  },

/** method: setValue
  *
  * Performs the mixing based on the value given and part color multipliers set.
  *
  * Parameters:
  *  _value - A numeric value, preferrably in the range 0 to 255.
  *
  **/
  setValue: function(_value){
    var _valueInt = Math.round(_value);
    if(this.target.valueObj instanceof HColorValue){
      var _colorValueObj = this.target.valueObj;
    } else {
      return
    }
    if(this.mixRed){
      _colorValueObj.setRed(_valueInt * this.mixRed);
    }
    if(this.mixGrn){
      _colorValueObj.setGreen(_valueInt * this.mixGrn);
    }
    if(this.mixBlu){
      _colorValueObj.setBlue(_valueInt * this.mixBlu);
    }
    this.valueObj.set(_valueInt);
  },
  
/** method: setValueObj
  *
  * Nothing special; see <HControl.setValueObj>
  *
  **/
  setValueObj: function(_valueObj){
    this.valueObj = _valueObj;
    this.setValue(_valueObj.value);
  }
});


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
  
  packageName: "progress",
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
    //this._progressbarPrefix = 'progressbarmark';
    this._progressbarPrefix = 'label';    
    
    if(!this.isinherited) {
        this.draw();
    }
        
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
    if(this.progressbarElemId) {
      this.drawProgress();
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
    var _intvalue = this.visibleWidth * (
      (this.value - this.minValue) / (this.maxValue - this.minValue));
    var _pxvalue = parseInt(Math.round(_intvalue)) + 'px';
    return _pxvalue; 
  },

// private method 
  drawProgress: function() {
    if (this.progressbarElemId) {
      var _propval   = this._value2px();
      prop_set(this.progressbarElemId, 'width', _propval);
    }
  }
});
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
      prop_set(this._progressbarElemId, 'background-position', '0px -' +
        (this.progressPosition * this.rect.height) + 'px');
    }
    
  }
   
});

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
    this._textElemNamePrefix = "textcontrol";
    
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
  },
  
  
/** method: die
  *
  * Unregisters some text control specific events before destroying the view.
  *
  * See also:
  *  <HView.die> <HControl.die>
  **/
  die: function() {
    if(this.drawn) {
      var _domElementId = this._textElemNamePrefix + this.elemId;
      Event.stopObserving(_domElementId, 'mousedown', this._stopPropagation);
      Event.stopObserving(_domElementId, 'mousemove', this._stopPropagation);
      Event.stopObserving(_domElementId, 'focus', this._activateControl);
      Event.stopObserving(_domElementId, 'blur', this._deactivateControl);
    }
    this.base();
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
    if(this._inputElementId) {
      elem_get(this._inputElementId).disabled = (!this.enabled);
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
      
      this._inputElementId = this.bindDomElement(
        this._textElemNamePrefix + this.elemId);
      
      if(this._inputElementId) {
        // Prevents errors in FF when setting the value programmatically.
        elem_get(this._inputElementId).setAttribute("autocomplete", "off");
        this.setEnabled(this.enabled);
      }
      
      this._setLowLevelEventListeners();
      
      this.drawn = true;
    }

    this.refresh(); // Make sure the value gets drawn.
  },
  
  
  // Private method.
  // Overrides the event manager's mouseDown and mouseMove events in order to
  // get the text field to work in an intuitive way. Also the focus and blur
  // listeners are added to handle the active control management, which the
  // event manager cannot do when the mouseDown is overridden.
  //
  // The methods are set as member variables so that we can get rid of them when
  // the text control is destroyed.
  _setLowLevelEventListeners: function() {
    var _domElementId = this._textElemNamePrefix + this.elemId;
    // Allow focusing by mouse click. Only do this once per control. This is
    // handled by the draw method with the this.drawn boolean.
    this._stopPropagation = function(_event) {
      HControl.stopPropagation(_event);
    };

    Event.observe(_domElementId, 'mousedown', this._stopPropagation, false);
    Event.observe(_domElementId, 'mousemove', this._stopPropagation, false);
      
    // Set the focus listener to the text field so the text control can get
    // informed when it gains the active status. Also the lostActiveStatus
    // needs this to work so the event manager knows the correct active
    // control.
    var _that = this;
    this._activateControl = function(event) {
      // When the text field gets focus, make this control active.
      HEventManager.changeActiveControl(_that);
    };
    Event.observe(_domElementId, 'focus', this._activateControl, false);
      
    // The blur listener unsets the active control. It is used when the user
    // moves the focus out of the document (clicks on the browser's address bar
    // for example).
    this._deactivateControl = function(event) {
      // Explicitly update the value when the field loses focus.
      _that._updateValue();
      HEventManager.changeActiveControl(null);
    };
    Event.observe(_domElementId, 'blur', this._deactivateControl, false);
  },
  
  
/** method: refresh
  * 
  * Redraws only the value, not the whole markup.
  *
  * See also:
  *  <HView.refresh>
  **/
  refresh: function() {
    this.base();
    if (this._inputElementId) {
      if (elem_get(this._inputElementId).value != this.value) {
        elem_get(this._inputElementId).value = this.value;
      }
    }
  },
  
  
/** event: onIdle
  * 
  * Save typed in or pasted text into the member variable. This is called
  * automatically by the application.
  *
  * See also:
  *  <HApplication>
  **/
  onIdle: function() {
    if (this.active) {
      this._updateValue();
    }
  },
  
  
  // Private method.
  // Updates the component's value from the typed in text.
  _updateValue: function() {
    if (this.drawn) {
      
      if (elem_get(this._inputElementId).value != this.value) {
        this.setValue(elem_get(this._inputElementId).value);
      }
      
    }
  },
  
  
/** event: lostActiveStatus
  * 
  * Makes sure that the focus is removed from the text field when another
  * component is activated.
  *
  * See also:
  *  <HControl.lostActiveStatus>
  **/
  lostActiveStatus: function(_newActiveControl) {
    if (this._inputElementId) {
      elem_get(this._inputElementId).blur();
    }
  }
  
});

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
  
  componentName: "passwordcontrol",

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

/*!
@function HTextEdit
@description Enables contentEditable attribute in Netscape and Firefox.
*/

HTextEdit = Base.extend({
  constructor: null,
  /*!
  @function execCommand
  @description Executes execCommand of browser. Makes some modifications to command
  so that command works correctly.
  */
	// BackColor, Bold, (contentReadOnly), copy, CreateLink, cut, (decreasefontsize), delete, (findstring - safari),
	// FontName, FontSize, (fontsizedelta - safari), ForeColor, FormatBlock, (heading), HiliteColor, (increasefontsize)
	// Indent, InsertHorizontalRule, InsertHTML, (InsertLineBrake - safari), InsertOrderedList, (InsertParagraph - safari),
	// (InsertNewLineInQuotedContent - safari), (InsertText - safari), InsertUnorderedList, Italic, JustifyCenter,
	// JustifyFull, JustifyLeft, JustifyRight, Outdent, RemoveFormat, SelectAll, StrikeThrough, (styleWithCSS),
	// Subscript, Superscript, (Transpose - Safari), Underline, Unlink, (Unselect - safari)
	
	// copy -> check Opera and Firefox
	// cut -> check Opera and Firefox
	
	// CreateLink - > Safari -> doesn't work
	// FormatBlock - > Safari -> doesn't work (should)- > IE -> doesn't work (should)
	// heading - > Safari -> doesn't work,  - > Opera -> doesn't work
	// HiliteColor - > Safari -> doesn't work (should)- > IE -> doesn't work
	// InsertUnorderedList - > Safari -> doesn't work (should)
	// Indent - > Safari -> doesn't work (should)
	// InsertHorizontalRule - > Safari -> doesn't work (should)
	// InsertHTML - > Safari -> doesn't work (should)
	// InsertImage - > Safari -> doesn't work (should)
	// InsertOrderedList - > Safari -> doesn't work (should)
	// Outdent - > Safari -> doesn't work (should)
	// RemoveFormat - > Safari -> doesn't work (should)
	// SelectAll - > Safari -> should select only the editable earea
	// StrikeThrough - > Safari -> doesn't work (should) -> Internet Explorer doesn't work
	
	// Subscript  -> Internet Explorer doesn't work
	// Superscript  -> Internet Explorer doesn't work
	
	execCommand: function(_command, _userInterface, _value, _doc) {
		_doc = _doc || document;
		var _lowerCasedCommand = _command.toLowerCase();
		if ((_lowerCasedCommand == "hilitecolor" ||
		     _lowerCasedCommand == "inserthtml") && is.ie) {
		  return;
		}
		if ((_lowerCasedCommand == "backcolor" ||
				 _lowerCasedCommand == "forecolor" ||
				 _lowerCasedCommand == "hilitecolor") &&
				_userInterface == true) {
			// show color panel
		} else if (_lowerCasedCommand == "copy" &&
		           !is.ns && !is.opera) {
		  _doc.execCommand(_command, _userInterface, _value);
		} else if (_lowerCasedCommand == "createlink" &&
							 _userInterface == true) {
			// show link panel
		/*} else if (_lowerCasedCommand == "fontname" &&
							 _userInterface == true) {
			// show font name panel*/
		} else if (_lowerCasedCommand == "fontsize") {
			if (is.safari) {
				switch (parseInt(_value)) {
					case 1: _value = "x-small"; break;
					case 2: _value = "small"; break;
					case 3: _value = "medium"; break;
					case 4: _value = "large"; break;
					case 5: _value = "x-large"; break;
					case 6: _value = "xx-large"; break;
					case 7: _value = "48px"; break;
				}
			}
			_doc.execCommand(_command, _userInterface, _value);
		} else if (_lowerCasedCommand == "formatblock" &&
							 _userInterface == true) {
			// show font name panel
		} else if (_lowerCasedCommand == "inserthtml" &&
							 _userInterface == true) {
			// show font name panel
		} else if (_lowerCasedCommand == "insertimage" &&
							 _userInterface == true) {
			// show font name panel
		} else if(is.safari && _lowerCasedCommand == "createlink") {
			// 2006 august release should work
			if (this._execCreateLink) {
			  this._execCreateLink(_value);
			}
		} else {
			 _doc.execCommand(_command, _userInterface, _value);
		}
	},
  /*!
  @function enableSelectionListeners
  @description Populates the _selection object every time when mouse or key goes up.
  */
	enableSelectionListeners: function() {
		var obj = this;
		if (!this._enabled) {
		  if (is.ie) {
		    document.attachEvent("onkeydown", function(e) {obj._selectionChanged(e);});
		    document.attachEvent("onkeyup", function(e) {obj._selectionChanged(e);});
		    //document.attachEvent("onkeypress", function(e) {obj._selectionChanged(e);});
		    document.attachEvent("onmouseup", function(e) {obj._selectionChanged(e);});
		  } else {
		    document.addEventListener("keydown", function(e) {obj._selectionChanged(e);}, false);
		    document.addEventListener("keyup", function(e) {obj._selectionChanged(e);}, false);
		    document.addEventListener("mouseup", function(e) {obj._selectionChanged(e);}, false);
		  }
		  this._enabled = true;
		}
	},
  /*!
  @function saveSelection
  @description Saves current _selection object to _savedSelection object.
  */
	// call before losing focus to text selection
	// mouseover for edit button would be good
	saveSelection: function() {
	  if (is.ie) {
	    this._savedSelection.range = this._selection.range;
	  } else {
		  this._savedSelection.anchorNode = this._selection.anchorNode;
		  this._savedSelection.anchorOffset = this._selection.anchorOffset;
		  this._savedSelection.focusNode = this._selection.focusNode;
		  this._savedSelection.focusOffset = this._selection.focusOffset;
		  this._savedSelection.isCollapsed = this._selection.isCollapsed;
		  if (is.safari) {
			  this._savedSelection.baseNode = this._selection.baseNode;
			  this._savedSelection.baseOffset = this._selection.baseOffset;
			  this._savedSelection.extentNode = this._selection.extentNode;
			  this._savedSelection.extentOffset = this._selection.extentOffset;
		  } else {
			  this._savedSelection.range = this._selection.range;
		  }
		}
	},
  /*!
  @function loadSelection
  @description Makes real browser selection object to _savedSelection object.
  */
	// load selection that was saved with saveSelection method
	// that we can get situation that was before we pressed button
	// that edited the selection and got focus
	loadSelection: function(_window) {
	  var _window = _window || window;
	  if (is.ie) {
	    this._savedSelection.range.select();
	  } else {
		  var _selection = _window.getSelection();
		  if (is.ns || is.opera) {
			  if (_selection.rangeCount > 0) {
			  	_selection.removeAllRanges();
			  }
			  // bug: opera collapses selection if focusnode is left from anchornode
			  if (is.opera) {
			    var _element = this._savedSelection.anchorNode;
			    do {
			    	if (_element.nodeType == 1 && _element.getAttribute("contentEditable") == "true") {
			    		_element.setAttribute("contentEditable","false");
		  	  		_element.setAttribute("contentEditable","true")
			    	}
		  	  	_element = _element.parentNode;
		  	  } while(_element);
			  }
			  
			  var _range = document.createRange();
			  //alert(this._savedSelection.isCollapsed);
			  //alert(this._savedSelection.anchorNode + " " + this._savedSelection.anchorOffset);
			  //window.status = this._savedSelection.anchorNode + " " + this._savedSelection.anchorOffset;
			  _range.setStart(this._savedSelection.anchorNode, this._savedSelection.anchorOffset);
			  _selection.addRange(_range);
			  // we want right focus
			  // isCollapsed can't be true if extend method is used.
			  if (this._savedSelection.isCollapsed == false) {
			    _selection.extend(this._savedSelection.focusNode, this._savedSelection.focusOffset);
			  }
		  } else if (is.safari) {
			  _selection.empty();
			  _selection.setBaseAndExtent(this._savedSelection.baseNode, this._savedSelection.baseOffset,
			  													  this._savedSelection.extentNode, this._savedSelection.extentOffset);
		  }
		}
	},
  /*!
  @function populateSelection
  @description Populates _selection object with real browser selection object.
  */
	// save selection on keyup event and on mouseup event
	// called by _selectionChanged
	populateSelection: function(e, _window) {
	  var _window = _window || window;
	  if (is.ie) {
	    var _selection = _window.document.selection;
	    //type can be none, text or control
	    if (_selection.type.toLowerCase() != "control") {
	      var _textRange = _selection.createRange();
	      this._selection.range = _textRange;
	      //alert("toimii" + textRange + "dd");
	    }
	  } else {
		  var _selection = _window.getSelection();
		  this._selection.anchorNode = _selection.anchorNode;
		  this._selection.anchorOffset = _selection.anchorOffset;
		  this._selection.focusNode = _selection.focusNode;
		  this._selection.focusOffset = _selection.focusOffset;
		  this._selection.isCollapsed = _selection.isCollapsed;
		  if (is.safari) {
			  this._selection.baseNode = _selection.baseNode;
			  this._selection.baseOffset = _selection.baseOffset;
			  this._selection.extentNode = _selection.extentNode;
			  this._selection.extentOffset = _selection.extentOffset;
		  } else {
			  this._selection.range = _selection.getRangeAt(0);
		  }
		}
		if (!this._index) {
		  this._index = 0;
		}
		if (e) {
		  if (e.type == "keydown" || e.type == "keyup"/* || e.type == "keypress"*/) {
		    //this._index ++;
		    //window.status = this._index;
		    this.saveSelection();
		  }
		}
	},
  /*!
  @function _selectionChanged
  @description Populates the _selection object every time when mouse or key goes up.
  */
	// save selection on keyup event and on mouseup event
	_selectionChanged: function(e) {
	  if (is.ie) {
	    this.populateSelection(e);
	  } else {
		  var _selection = window.getSelection();
		  // Firefox, Opera 9
		  if (_selection.rangeCount > 0) {
			  this.populateSelection(e);
		  // Safari 2
		  } else if (is.safari) {
			  this.populateSelection(e);
		  }
		}
	},
	_selection: {
		anchorNode: null,
		anchorOffset: -1,
		focusNode: null,
		focusOffset: -1,
		isCollapsed: undefined
	},
	_savedSelection: {
		anchorNode: null,
		anchorOffset: -1,
		focusNode: null,
		focusOffset: -1,
		isCollapsed: undefined
	},
	_enabled: false
});
/*** class: HStyleButton
  **
  ** HStyleButton is the button that has an image. HStyleButtons can have two states, checked and unchecked.
  ** It inherits these properties from the HImageButton.
  ** State transition of a button is done by clicking the mouse on the button 
  ** or by using a keyboard shortcut. Also applies the command to the richtextview when the mouse button goes up.
  ** 
  ** vars: Instance variables
  **  type - '[HImageButton]'
  **  value - A boolean, true when the button is checked, false when it's not.
  **  image - The url of an image that indicates false state.
  **  alternateImage - The url of an image that indicates true state.
  **  command - The command to be applied for the HRichTextView.
  **  richtextview - The HRichTextView for which the command is applied.
  **
  ** Extends:
  **  <HControl>
  **
  ** See also:
  **  <HControl> <HImageButton>
  ***/
HStyleButton = HImageButton.extend({
  
  packageName:   "richtext",
  componentName: "stylebutton",

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
    
    this.type = '[HStyleButton]';

	this.preserveTheme = true;
    
    if(!this.isinherited) {
      this.draw();
    }
  },

/** event: mouseUp
  * 
  * Called when the user clicks the mouse button up on this object. Sets the state of the HImageButton.
  * It can be 0 or 1. Also executes the "command" for the richtextview.
  *
  * Parameters:
  *  _x - The horizonal coordinate units (px) of the mouse cursor position.
  *  _y - The vertical coordinate units (px) of the mouse cursor position.
  *  _leftButton - Flag, is false when the right mouse button was pressed. *Do
  *                not rely on it*
  *
  * See also:
  *  <HControl.mouseUp>
  **/
  mouseUp: function() {
	if (this.styleButtonDefaults.richtextview) {
	  HTextEdit.execCommand(this.styleButtonDefaults.command, false, null, this.styleButtonDefaults.richtextview.iframe().contentWindow.document);
	}
	this.base();
  }
  
},{
  _tmplImgPrefix: "imageview"
});
/*** class: HRichTextView
  **
  ** HTextControl is a control unit that represents an editable rich text. 
  ** HTextControl view or theme can be changed; the helmiTheme is used by default.
  **
  ** vars: Instance variables
  **  type - '[HRichTextView]'
  **  value - The string that is currently held by this object.
  **
  ** Extends:
  **  <HControl>
  **
  ** See also:
  **  <HControl>
  ***/
HRichTextView = HControl.extend({
  
  packageName:   "richtext",
  componentName: "richtextview",

/** constructor: constructor
  *
  * Parameters:
  *   _rect - An <HRect> object that sets the position and dimensions of this control.
  *   _parentClass - The parent view that this control is to be inserted in.
  *   _options - (optional) All other parameters. See <HComponentDefaults>.
  **/
  constructor: function(_rect, _parentClass, _options) {
    if (this.isinherited) {
      this.base(_rect, _parentClass, _options);
    } else {
      this.isinherited = true;
      this.base(_rect, _parentClass, _options);
      this.isinherited = false;
    }
    
    this.type = '[HRichTextView]';
    this.preserveTheme = true;
    
    this._designMode = false;
	this._installed = false;
    
    if (!this.isinherited) {
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
    this.base();
  },


/** event: onIdle
  * 
  * Save typed in or pasted text into the member variable. This is called
  * automatically by the application.
  *
  * See also:
  *  <HApplication>
  **/
  onIdle: function() {
    if (this.drawn) {
      var _iFrame = elem_get( this.markupElemIds.control );
      if (!this._designMode && _iFrame.contentWindow && _iFrame.contentWindow.document) {
        _iFrame.contentWindow.document.designMode = "on";
        this._designMode = true;
      }
      // Needed for IE: _iFrame.contentWindow.document.body
      if (this._designMode && _iFrame.contentWindow.document.body) {
        if (!this._installed) {
          _iFrame.contentWindow.document.body.innerHTML = this.value;
          this._installed = true;
        }
        var _html = _iFrame.contentWindow.document.body.innerHTML;
        if (this.value != _html) {
          this._editingValue = true;
          this.setValue(_html);
          this._editingValue = false;
        }
      }
    }
  },
 /** method: setValue
  *
  *	Sets the content of the HRichTextView. Accepts a plain text or an html markup.
  *
  * Parameters:
  *   _value - The _value can be a plain text or an html markup.
  **/
  setValue: function(_value) {
    if (!this._editingValue) {
      if (this._designMode) {
        var _iFrame = elem_get( this.markupElemIds.control );
		if (_iFrame.contentWindow.document.body) {
          _iFrame.contentWindow.document.body.innerHTML = _value;
		}
      }
    }
    this.base(_value);
  },
  iframe: function() {
	return elem_get( this.markupElemIds.control );
  }
});
/*** class: HRichTextControl
  **
  ** HRichTextControl is a rich, robust and powerful control unit 
  ** that allows the user type and edit formatted text. 
  ** In addition, among other features that the rich text editor
  ** provides, it can be easily extended for specialized editing tasks.
  **
  ***/

HRichTextControl = HControl.extend({
  
  packageName:   "richtext",
  componentName: "richtextcontrol",

  constructor: function(_rect,_parentClass,_options) {
    if(this.isinherited){
      this.base(_rect,_parentClass,_options);
    }
    else {
      this.isinherited = true;
      this.base(_rect,_parentClass,_options);
      this.isinherited = false;
    }
    
    this.type = '[HRichTextControl]';
    
    // When this is true, the component is always drawn with the theme that was
    // active at the creation of the component, not the current theme.
    this.preserveTheme = true;
    
    this._initialized = false;
    
    if(!this.isinherited){
      this.draw();
    }
  },
  
  draw: function() {
    if(!this.drawn){
      this.base();
    
      this.drawRect();
      this.drawMarkup();
      if(!this._initialized){
    //richtext1 = new HRichTextBar( new HRect(100,100,380,121), application, 'Slaves' );
    //windowbar1.setStyle("border","1px dotted pink");
    //windowbar1.setStyle("overflow","visible");
    //richtext1.draw();
        this.barView = new HRichTextBar(
          new HRect(0,0,this.rect.width,20),
          this,
          {value:this.value}
        );
        this.barView.draw();
        this.richTextView = new HRichTextView(
          new HRect(0,20,this.rect.width,this.rect.height),
          this,
          {value:(this.value||"editable text")}
        );
        this.richTextView.draw();
      }
      this.drawn=true;
    }
    this.drawRect();
    //this.refresh(); // Make sure the label gets drawn.
  }
  
});

// Some aliases.
HRichTextArea = HRichTextControl;
HRichTextEditor = HRichTextControl;
