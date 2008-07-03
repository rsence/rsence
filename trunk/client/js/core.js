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
          _ancestor.valueOf() != _value.valueOf() && (/\bbase\b/).test(_value)) {
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
  };
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
};

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

is_ie = !(navigator.userAgent.toLowerCase().indexOf("opera") > -1) && navigator.appName == "Microsoft Internet Explorer";


Array.prototype.toQueryString = function() {
  var i, l = this.length,
      _array = [];
  for (i = 0; i < l; i++) {
    _array.push( encodeURIComponent(this[i].key) + "=" +
      encodeURIComponent(this[i].value) );
  }
  return _array.join("&");
};








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
      this.transport.onreadystatechange = function(){
        _obj.onStateChange();
      };
      this.setRequestHeaders();
      var _body = this.options.method == "post" ?
        (this.options.postBody || this.options.parameters.toQueryString()) : null;
      this.transport.send(_body);
      if (!this.options.asynchronous && this.transport.overrideMimeType) {
        this.onStateChange();
      }
    //} catch (e) {
    //  console.log('error:',e);
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
      //try {
        (this.options["on"+(this.success()?"Success":"Failure")]||(function(){console.log('aa');}))(this.transport);
      //} catch (e) {
        //console.log('error:',e);
      //}
    }
    
    if (_readyState == 4) { // Completed(Loaded in IE 7)
      this.transport.onreadystatechange = function(){};
    }
  },
  success: function() {
    //return !this.transport.status || (this.transport.status >= 200 && this.transport.status < 300);
    return (this.transport.status >= 200 && this.transport.status < 300);
  }
});
/***  HIMLE RIA SYSTEM
  ** 
  **  Copyright (C) 2008 HIMLE GROUP http://himle.sorsacode.com/
  **  Copyright (C) 2007 Juha-Jarmo Heinonen <o@sorsacode.com>
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

ELEMTickerInterval = 10;
BROWSER_TYPE = {
  ie:  false,
  ie6: false,
  ie7: false,
  opera: false,
  safari: false,
  firefox: false,
  firefox2: false
};
ELEM = {
  
  // stuff moved inside this function, because (surprise, surprise!) ie6 had some issues with it.
  _constructor: function(){
    var _this=ELEM;
    
    // pre-init queue
    _this._domLoadQueue = [];
    _this._domLoadTimer = null;
    
    // turns true when document is actually loaded:
    _this._domLoadStatus = false;
    
    // initial tasks
    _this._initDone = false;
    
    _this._makeCount = 0;
    
    _this._setStyleCount = 0; _this._setStyleDiffCount = 0;
    _this._getStyleCount = 0; _this._getStyleMissCount = 0;
    
    _this._flushLoopCount = 0;
    _this._flushLoopFlushedCount = 0;
    _this._flushStylCount = 0;
    
    _this._flushTime = 0;
    _this._flushCounter = 0;
    _this._idleDelay = 500;
    
    _this._timer = null;
    _this._minDelay = ELEMTickerInterval;
    _this._flushing = false;
    _this._needFlush = false;
    _this._slowness = 1;
    
    _this._elements =   [];
    _this._recycler =   {_tagNames:[]};
    _this._styleCache = {};
    _this._styleTodo =  {};
    _this._attrTodo =   {};
    _this._attrCache =  {};
    _this._elemTodo =   [];
    _this._elemTodoH =  {};
    _this._blockElems = ",ADDRESS,BLOCKQUOTE,CENTER,DIR,DIV,DL,FIELDSET,FORM,H1,H2,H3,H4,H5,H6,HR,ISINDEX,MENU,NOFRAMES,NOSCRIPT,OL,P,PRE,TABLE,UL,";
  },
  
  
  _fillTrash: function(_count,_tagName){
    var _this=ELEM,i=0,_toDel=[],_recycler=_this._initRecycler(_tagName),_trashId=_recycler._trashId;
    for(;i!=_count;i++){_toDel.push(_this.make(_trashId,_tagName));}
    for(i=0;i!=_count;i++){_this.del(_toDel[i]);}
  },
  
  // adds an element reference
  // returns its id
  _add: function(_elem){
    var _id, _this, _elements;
    _this = ELEM;
    _elements = _this._elements;
    
    // Adds the element to the cache
    _elements.push(_elem);
    // Get cache size == serial id
    _id = _elements.length-1;
    
    return _id;
  },
  
  // makes new style caches
  _initCache: function(_id){
    var _this = ELEM;
    _this._styleTodo[_id] = [];
    _this._styleCache[_id] = {};
    _this._attrTodo[_id] = [];
    _this._attrCache[_id] = {};
    _this._elemTodoH[_id] = false;
  },
  
  // binds a dom element by dom id property
  // returns id
  bindId: function(_domId){
    var _this=ELEM,_elem=document.getElementById(_domId),_elemId=_this._add(_elem);
    _this._initCache(_elemId);
    return _elemId;
  },
  
  // binds a dom element
  // returns id
  bind: function(_elem){
    var _id, _this=ELEM;
    _id = _this._add(_elem);
    _this._initCache(_id);
    return _id;
  },
  
  // deprecated; backwards-compatibility
  _replace: function(_id,_elem){
    var _this=ELEM;
    _this._elements[_id] = _elem;
  },
  
  // returns dom element by id
  get: function(_id){
    return ELEM._elements[_id];
  },
  
  // sets inner html of element
  setHTML: function(_id,_html){
    //try {
      var _this=ELEM;
      _this._elements[_id].innerHTML = _html;
    //} catch(e) {}
    //_this._initCache(_id);
  },
  
  _initRecycler: function(_tagName){
    var _this=ELEM,_recycler=_this._recycler;
    if(!_recycler[_tagName]){
      _recycler._tagNames.push(_tagName);
      _recycler[_tagName]=[];
      _recycler[_tagName]._countIn=1;
      _recycler[_tagName]._countOut=0;
      _recycler[_tagName]._trashId=_this.make(_this._trashId,'div');
    }
    return _recycler[_tagName]._trashId;
  },
  
  // deletes element and all its associated caches by id
  del: function(_id){
    var _this=ELEM,_elem=_this._elements[_id],_tagName=_elem.tagName,_trashId;
    _trashId=_this._initRecycler(_tagName);
    _this.append(_id,_trashId);
    
    var _elemTodoIdx=_this._elemTodo.indexOf(_id),_recycler=_this._recycler[_tagName];
    if(_elemTodoIdx!=-1){
      _this._elemTodo.splice(_elemTodoIdx,1);
    }
    
    try{_elem.innerHTML='';}catch(e){}
    _this.setCSS(_id,'display:none;');
    //_this.setAttr(_id,'id','',true);
    _this.delAttr(_id,'id');
    _this.delAttr(_id,'ctrl');
    
    _this._initCache(_id);
    _recycler._countIn++;
    _recycler.push(_id);
    
  },
  
  // places element inside another
  append: function(_sourceId,_targetId){
    var _source, _target, _this;
    _this   = ELEM;
    _source = _this._elements[_sourceId];
    _target = _this._elements[_targetId];
    _target.appendChild(_source);
  },
  
  setCSS: function(_id,_css){
    ELEM._elements[_id].style.cssText = _css;
  },
  
  getCSS: function(_id){
    return ELEM._elements[_id].style.cssText;
  },
  
  // returns element's size from the part that is not hidden by its parent elements with overflow property
  getVisibleSize: function(_id){
    var _this,_elem,w,h,_parent,_parentOverflow,
    _this=ELEM,_elem=_this._elements[_id],
    w=_elem.offsetWidth,h=_elem.offsetHeight,
    _parent=_elem.parentNode;
    while(_parent&&_parent.nodeName.toLowerCase()!='body'){
      if(!_this._is_ie){_parentOverflow=document.defaultView.getComputedStyle(_parent,null).getPropertyValue('overflow');}
      else{_parentOverflow=_parent.currentStyle.getAttribute('overflow');}
      _parentOverflow=_parentOverflow!='visible';
      if(w>_parent.clientWidth&&_parentOverflow){w=_parent.clientWidth-_elem.offsetLeft;}
      if(h>_parent.clientHeight&&_parentOverflow){h=_parent.clientHeight-_elem.offsetTop;}
      _elem=_elem.parentNode;_parent=_elem.parentNode;
    }
    return [w,h];
  },

  // returns element's full size
  getSize: function(_id){
    var _this,_elem,w,h,_parent,_parentOverflow,
    _this=ELEM,_elem=_this._elements[_id],
    w=_elem.offsetWidth,h=_elem.offsetHeight;
    return [w,h];
  },

  // returns element's full size
  getScrollSize: function(_id){
    var _this,_elem,w,h,_parent,_parentOverflow,
    _this=ELEM,_elem=_this._elements[_id],
    w=_elem.scrollWidth,h=_elem.scrollHeight;
    return [w,h];
  },

  getVisiblePosition: function(_id){
    var x,y,_elem,_this,_this=ELEM,
    x=0,y=0,_elem=_this._elements[_id];
    while(_elem!==document){
      x+=_elem.offsetLeft;y+=_elem.offsetTop;
      x-=_elem.scrollLeft;y-=_elem.scrollTop;
      _elem=_elem.parentNode;
      if(!_elem){break;}
    }
    return [x,y];
  },

  // these two are created in _init
  //getStyle: function(_id,_key,_bypass){},
  //_flushStyleCache: function(_id){},
  
  getOpacity: function(_id){
    var _this, _opacity, _try_opacity, _getStyle;
    _this = ELEM;
    _getStyle = _this.getStyle;
    // old safari (1.x):
    if (_opacity = _getStyle(_id,'-khtml-opacity')) {
      return parseFloat(_opacity);
    }
    // old mozilla (ff 1.0 and below):
    if (_opacity = _getStyle(_id,'-moz-opacity')) {
      return parseFloat(_opacity);
    }
    _try_opacity = _getStyle(_id,'opacity',true);
    if (_opacity = _try_opacity || (_try_opacity==0)) {
      return parseFloat(_opacity);
    }
    if (_opacity = (_this._elements[_id].currentStyle['filter'] || '').match(/alpha\(opacity=(.*)\)/)) {
      if(_opacity[1]) {
        return parseFloat(_opacity[1]) / 100;
      }
    }
    return 1.0;
  },
  
  setOpacity: function(_id, _value){
    var _this = ELEM;
    if (_value == 1 && _this._is_ie) {
      _this._elements[_id].style.setAttribute('filter',_this.getStyle(_id,'filter', true).replace(/alpha\([^\)]*\)/gi,''));
    } else {  
      if(_value < 0.00001){
        _value = 0;
      }
      if(_this._is_ie) {
        _this._elements[_id].style.setAttribute('filter',_this.getStyle(_id,'filter',true).replace(/alpha\([^\)]*\)/gi,'')+'alpha(opacity='+_value*100+')');
      } else {
        _this._elements[_id].style.setProperty('opacity',_value,'');
      }
    }
  },
  
  getIntStyle: function(_id,_key){
    var _value = ELEM.getStyle(_id,_key);
    return parseInt(_value,10);
  },
  setBoxCoords: function(_id,_coords){
    ELEM.setStyle(_id,'left',_coords[0]+'px');
    ELEM.setStyle(_id,'top',_coords[1]+'px');
    ELEM.setStyle(_id,'width',_coords[2]+'px');
    ELEM.setStyle(_id,'height',_coords[3]+'px');
  },
  
  getExtraWidth: function(_id){
    var _int = ELEM.getIntStyle;
    return _int(_id,'padding-left')+_int(_id,'padding-right')+_int(_id,'border-left-width')+_int(_id,'border-right-width');
  },
  
  getExtraHeight: function(_id){
    var _int = ELEM.getIntStyle;
    return _int(_id,'padding-top')+_int(_id,'padding-bottom')+_int(_id,'border-top-width')+_int(_id,'border-bottom-width');
  },
  
  setFPS: function(_fps){
    ELEM._minDelay = 1000/_fps;
    if(ELEM._minDelay<ELEMTickerInterval){
      ELEM._minDelay=ELEMTickerInterval;
    }
    /*
    if(ELEM._is_ie6){
      if(ELEM._minDelay<200){
        ELEM._minDelay=200;
      }
      if(ELEMTickerInterval<200){
        ELEMTickerInterval=200;
      }
    }
    */
  },
  setSlowness: function(_slowness){
    // we should replace this with an
    // actual browser speed benchmark
    ELEM._slowness = _slowness;
  },
  setIdleDelay: function(_idleDelay){
    ELEM._idleDelay = _idleDelay;
  },
  
  _ieFixesNeeded: false,
  flushLoop: function(_delay){
    //console.log('flushLoop('+_delay+')');
    var _this=ELEM; _this._flushLoopCount++;
    if(_this._is_ie6&&(_this._flushLoopCount%5==0)&&_this._ieFixesNeeded){
      //window.status = 'traversetree0:'+_this._flushLoopCount;
      iefix._traverseTree();
      _this._ieFixesNeeded=false;
    }
    clearTimeout(_this._timer);
    if(_this._flushing){
      _delay *= 2;
      _this._timer = setTimeout('ELEM.flushLoop('+_delay+');',_delay);
      return;
    } else {
      if(!_this._needFlush){
        // goto sleep mode
        if(_this._is_ie6&&_this._ieFixesNeeded){
          //window.status = 'traversetree1:'+_this._flushLoopCount;
          iefix._traverseTree();
          _this._ieFixesNeeded=false;
        }
        _this._timer = setTimeout('ELEM.flushLoop('+_delay+');',_this._idleDelay);
        return;
      }
      _delay = parseInt(_this._slowness*(_this._flushTime/_this._flushCounter), ELEMTickerInterval);
      if(_delay<_this._minDelay||!_delay){_delay=_this._minDelay;}
      _this._flushing = true;
      _this._timer = setTimeout('ELEM.flushLoop('+_delay+');',_delay);
    }
    _this._flushTime -= new Date().getTime();
    var _loopMaxL, _currTodo, i, _styleTodo;
    _elemTodo=_this._elemTodo;
    _loopMaxL=_elemTodo.length;
    _currTodo=_elemTodo.splice(0,_loopMaxL);
    //console.log('flushing:');
    var _flushStartTime = new Date().getTime();
    for(i=0;i<_loopMaxL;i++){
      _this._flushLoopFlushed++;
      var _id = _currTodo.pop();
      _this._elemTodoH[_id]=false;
      _this._flushStyleCache(_id);
      _this._flushAttrCache(_id);
    }
    /*
    if(_this._is_ie6&&_this._ieFixesNeeded){
      window.status = 'traversetree2:'+_this._flushLoopCount;
      iefix._traverseTree();
      _this._ieFixesNeeded=false;
    }*/
    _this._flushCounter++;
    _this._flushTime += new Date().getTime();
    if(_this._elemTodo.length==0&&_this._needFlush){
      _this._needFlush=false;
    }
    //console.log('flush took '+(new Date().getTime()-_flushStartTime));
    _this._flushing = false;
  },
  _flushAttrCache: function(_id){
    var _this=ELEM,_attrTodo=_this._attrTodo[_id],_attrCache=_this._attrCache[_id],
        _elem=_this._elements[_id],//_elemP=_elem.setAttribute,
        _key,_val,i,_iMax=_attrTodo.length,_currTodo=_attrTodo.splice(0,_iMax);
    for(i=0;i!=_iMax;i++){
      _key=_currTodo.pop();
      _val=_attrCache[_key];
      //console.log('id:'+_id+' key:'+_key+' val:'+_val);
      //console.log(_elem);
      //console.log('real val:'+_this.getAttr(_id,_key,true));
      _elem.setAttribute(_key,_val);
      //_elem[_key]=_val;
    }
  },
  getAttr: function(_id,_key,_bypass){
    var _this=ELEM,_attrVal=_this._attrCache[_id][_key],_val;
    //console.log('_attrVal:'+_attrVal);
    if(_attrVal!==undefined&&!_bypass){return _attrVal;}
    var _elem=_this._elements[_id];
    if(_elem.getAttribute(_key)==null){
      _elem[_key]='';
    }
    _val=_elem.getAttribute(_key);
    //console.log(_val+'=getAttr(id:'+_id+', key:'+_key+')');
    _this._attrCache[_id][_key]=_val;
    return _val;
  },
  setAttr: function(_id,_key,_value,_bypass){
    var _differs,_this=ELEM,_attrTodo=_this._attrTodo[_id],_attrCache=_this._attrCache[_id];
    _differs=_value!=_this.getAttr(_id,_key);
    if(_differs){
      _attrCache[_key]=_value;
      if(_bypass){_this._elements[_id].setAttribute(_key,_value);}
      else{
        if(_attrTodo.indexOf(_key)==-1){_attrTodo.push(_key);}
        if(!_this._elemTodoH[_id]){
          _this._elemTodo.push(_id);
          _this._elemTodoH[_id]=true;
          _this._checkNeedFlush();
        }
      }
    }
  },
  delAttr: function(_id,_key){
    var _differs,_this=ELEM,_attrTodo=_this._attrTodo[_id],_attrCache=_this._attrCache[_id];
    delete _attrCache[_key];
    _this._elements[_id].removeAttribute(_key);
    if(_attrTodo.indexOf(_key)!=-1){_attrTodo.splice(_attrTodo.indexOf(_key,1));}
    if(_this._elemTodoH[_id]){
      _this._elemTodo.splice(_this._elemTodo.indexOf(_id,1));
      _this._elemTodoH[_id]=false;
      _this._checkNeedFlush();
    }
  },
  
  // class name functions mostly ripped from moo.fx's prototype.lite.js
  hasClassName: function(_elemId, _className) {
    //_element = $(_element);
    var _element = ELEM.get(_elemId);
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
  
  addClassName: function(_elemId, _className) {
    //_element = $(_element);
    var _element = ELEM.get(_elemId);
    if (!_element) return;
    
    ELEM.removeClassName(_elemId, _className);
    _element.className += ' ' + _className;
  },
  
  removeClassName: function(_elemId, _className) {
    //_element = $(_element);
    var _element = ELEM.get(_elemId);
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
  },
  
  _checkNeedFlush: function(){
    var _this=ELEM;
    if(!_this._needFlush){
      _this._needFlush=true;
      if(!_this._flushing){
        clearTimeout(_this._timer);
        _this._timer = setTimeout('ELEM.flushLoop('+_this._minDelay+');',_this._minDelay);
      }
    }
  },
  // sets style key to value of id, bypass sets immediately
  printStats: function(){
    var _this=ELEM,_recycler=_this._recycler,i=0,_tagName,_tagLen,_countIn,_countOut;
    console.log('Recycler efficiency:');
    var _allCountOut=0;
    for(;i!=_recycler._tagNames.length;i++){
      _tagName=_recycler._tagNames[i];
      console.log(' tagName: '+_tagName);
      _tagLen=_recycler[_tagName].length;
      console.log('   length  : '+_tagLen);
      _countIn=_recycler[_tagName]._countIn;
      console.log('   countIn : '+_countIn);
      _countOut=_recycler[_tagName]._countOut;
      _allCountOut+=_countOut;
      console.log('   countOut: '+_countOut);
      console.log('--------------------------------');
    }
    console.log('================================');
    console.log('Flushing efficiency:');
    console.log('  total real time spent: '+_this._flushTime+'ms');
    console.log('  total times called:    '+_this._flushLoopCount);
    console.log('  total times flushed:   '+_this._flushCounter);
    console.log('  total items flushed:   '+_this._flushLoopFlushedCount);
    console.log('  total real style sets: '+_this._flushStylCount);
    console.log('================================');
    console.log('setStyle efficiency:');
    console.log('  total times called:    '+_this._setStyleCount);
    console.log('  total times non-cache: '+_this._setStyleDiffCount);
    console.log('================================');
    console.log('getStyle efficiency:');
    console.log('  total times called:    '+_this._getStyleCount);
    console.log('  total times non-cache: '+_this._getStyleMissCount);
    console.log('================================');
    console.log('Summary:');
    console.log('  recycler saved '+(_allCountOut)+' of '+_this._makeCount+' ('+Math.round(_allCountOut/_this._makeCount*100)+'%) document.createElement calls');
    console.log('  style buffer saved '+(_this._setStyleDiffCount-_this._flushStylCount)+' of '+_this._setStyleDiffCount+' ('+Math.round(((_this._setStyleDiffCount-_this._flushStylCount)/_this._setStyleDiffCount)*100)+'%) non-cached DOM style sets');
    console.log('  style cache saved '+(_this._setStyleCount-_this._setStyleDiffCount)+' of '+_this._setStyleCount+' ('+Math.round(((_this._setStyleCount-_this._setStyleDiffCount)/_this._setStyleCount)*100)+'%) DOM style sets');
    console.log('  style cache saved '+(_this._getStyleCount-_this._getStyleMissCount)+' of '+_this._getStyleCount+' ('+Math.round(((_this._getStyleCount-_this._getStyleMissCount)/_this._getStyleCount)*100)+'%) DOM style gets');
    console.log('  style buffer and cache saved '+(_this._setStyleCount-_this._flushStylCount)+' of '+_this._setStyleCount+' ('+Math.round(((_this._setStyleCount-_this._flushStylCount)/_this._setStyleCount)*100)+'%) total DOM style sets');
  },
  setStyle: function(_id,_key,_value,_bypass){
    var _this=ELEM,_cached=_this._styleCache[ _id ],
        _elems=_this._elements,_differs,_styleTodo;
    _this._setStyleCount++;
    //console.log('setStyle(id:',_id,',key:',_key,',value:',_value,')');
    _differs=_value!==_cached[_key];//;_this.getStyle(_id,_key);
    if(_differs){
      _this._setStyleDiffCount++;
      _cached[_key]=_value;
      if(_bypass){
        if(_key=='opacity'){_this.setOpacity(_id,_value);}
        else{_this._is_ie?(_elems[_id].style.setAttribute(_key.replace(/((-)([a-z])(\w))/g,function($0,$1,$2,$3,$4){return $3.toUpperCase()+$4;}),_cached[_key])):(_elems[_id].style.setProperty(_key,_cached[_key],''));}
        if(_this._is_ie6){if(iefix._traverseStyleProperties.indexOf(_key)!=-1){_this._ieFixesNeeded=true;}}
      } else {
        _elemTodoH=_this._elemTodoH;
        _styleTodo=_this._styleTodo[_id];
        if(_styleTodo.indexOf(_key)==-1){_styleTodo.push(_key);}
        if(!_elemTodoH[_id]){
          _this._elemTodo.push(_id);
          _elemTodoH[_id]=true;
          _this._checkNeedFlush();
        }
      }
    }
  },
  
  // creates a new dom node inside _targetId
  // _tagName is a string (eg 'div', 'span' or 'img'
  // returns id
  // _target defaults to document.body's id: 0
  // _tagName defaults to 'div'
  make: function(_targetId,_tagName){
    if( _targetId === undefined ){
      _targetId = 0;
    }
    if( _tagName === undefined ){
      _tagName = 'DIV';
    } else {
      _tagName = _tagName.toUpperCase();
    }
    var _this=ELEM,_elem,_id;
    _this._makeCount++;
    if(_this._recycler[_tagName]){
      if(_this._recycler[_tagName].length!=0){
        // Recycle the id of a previously deleted element
        _id = _this._recycler[_tagName].pop();
        _this._recycler[_tagName]._countOut++;
        _elem = _this._elements[_id];
        //_elem.innerHTML='';
        /*
        if(_elem.tagName!=_tagName){
          _elem.outerHTML='<'+_tagName+'></'+_tagName+'>';
        }
        */
        if(_this._blockElems.indexOf(','+_tagName+',')!=-1){
          _this.setCSS(_id,'display:block;');
        } else {
          _this.setCSS(_id,'display:inline;');
        }
        _this.append(_id,_targetId);
        return _id;
      }
    }
    _elem = document.createElement(_tagName);
    _this._elements[_targetId].appendChild(_elem);
    _id = _this._add(_elem);
    _this._initCache(_id);
    return _id;
  },
  
  windowSize: function(){
    var _w, _h;
    _w = (window.innerWidth) ? window.innerWidth : document.documentElement.clientWidth;
    _h = (window.innerHeight) ? window.innerHeight : document.documentElement.clientHeight;
    return [_w,_h];
  },
  
  _init: function(){
    var _this=ELEM,_cmdStr, _cmdResult;
    var _getStyleTmpl = [
      // idx   source
      /*  0 */ "ELEM.getStyle=function(_id,_key,_bypass){",
      /*  1 */   "var _this=ELEM,_cached=_this._styleCache[_id],_retval;_this._getStyleCount++;",
      /*  2 */   "if((_cached[_key]===undefined)||_bypass){",
      /*  3 */     "if(!_bypass){_this._getStyleMissCount++;}",
      /*  4 */     "if((_key=='opacity')&&_bypass){_retval=_this.getOpacity(_id);}",
      /*  5 */     "else{",
      
            /*  idx:6 for non-ie */
      /*  6 */       "_retval=document.defaultView.getComputedStyle(_this._elements[_id],null).getPropertyValue(_key);",
      
            /*  idx:7,8,9 for ie */
      /*  7 */       "_camelName=_key.replace(/((-)([a-z])(\\w))/g,function($0,$1,$2,$3,$4){",
      /*  8 */         "return $3.toUpperCase()+$4});",
      /*  9 */       "_retval=_this._elements[_id].currentStyle[_camelName];",
      
      /* 10 */     "}_cached[_key]=_retval;",
      /* 11 */   "}return _cached[_key];};"
    ];
    if(_this._is_ie){
      _getStyleTmpl.splice(6,1);
    } else {
      _getStyleTmpl.splice(7,3);
    }
    eval(_getStyleTmpl.join(''));
    
    var _flushStyleCacheTmpl = [
      // idx   source
      /*  0 */ "ELEM._flushStyleCache=function(_id){",
      /*  1 */   "var _this=ELEM,_styleTodo=_this._styleTodo[_id],_cached=_this._styleCache[_id],_elem=_this._elements[_id],_elemS,_loopMaxP,_cid,_key,_currTodo,_retval;",
      /*  2 */   "if(!_elem){return;}",
      /*  3 */   "_elemS=_elem.style;",
      /*  4 */   "_loopMaxP=_styleTodo.length;",
      /*  5 */   "_currTodo=_styleTodo.splice(0,_loopMaxP);",
      /*  6 */   "for(_cid=0;_cid!=_loopMaxP;_cid++){",
      /*  7 */     "_key=_currTodo.pop();_this._flushStylCount++;",
      /*  8 */     "if(_key=='opacity'){_retval=_this.getOpacity(_id,_cached[_key]);}else{",
            /*  idx:  9 for ie */

                     //"alert(_cached[_key]);eval('_elemS.'+_key.replace(/((-)([a-z])(\\w))/g,function($0,$1,$2,$3,$4){return $3.toUpperCase()+$4})+'=\"'+_cached[_key]+'\";');}}};",
                     //"_elemS.cssText+=_key+':'+_cached[_key]+';';}}};",
                     //"var _keyIE=_key.replace(/((-)([a-z])(\\w))/g,function($0,$1,$2,$3,$4){return $3.toUpperCase()+$4});\nalert(_keyIE);\n_elemS[_keyIE]=_cached[_key];}}};",
      /*  9 */       "if(_this._is_ie6){if(iefix._traverseStyleProperties.indexOf(_key)!=-1){_this._ieFixesNeeded=true;}}try{_elemS.setAttribute(_key.replace(/((-)([a-z])(\\w))/g,function($0,$1,$2,$3,$4){return $3.toUpperCase()+$4}),_cached[_key]);}catch(e){}}}};",

            /*  idx: 10 for non-ie */
      /* 10 */       "_elemS.setProperty(_key,_cached[_key],'');}}};"
    ];
    if(_this._is_ie){
      _flushStyleCacheTmpl.pop();
    } else {
      _flushStyleCacheTmpl.splice(9,1);
    }
    eval(_flushStyleCacheTmpl.join(''));
    
    _this.bind(document.body);
    
    // creates an 'trash' for div elements
    _this._trashId = _this.make(0,'div');
    
    _this.setCSS(_this._trashId,"display:none;visibility:hidden;");
    _this.setAttr(_this._trashId,'id','trashcan_'+_this._trashId);
    
    _this._timer = setTimeout('ELEM.flushLoop('+_this._minDelay+')',_this._minDelay);
    
    if(!_this._domLoadQueue){return;}
    
    while(_this._domLoadQueue.length!=0){
      _cmdStr = _this._domLoadQueue.shift();
      if(typeof _cmdStr == 'string'){
        _cmdResult = eval(_cmdStr);
        if(typeof _cmdResult == 'string'){
          _this._domLoadQueue.push( _cmdResult );
        }
      }
    }
    _this._initDone = true;
  },
  
  _warmup: function(){
    _this = ELEM;
    _this._is_ie=(document.all&&navigator.userAgent.indexOf("Opera")==-1)?true:false;
    _this._is_ie6=(_this._is_ie&&navigator.userAgent.indexOf("MSIE 6")!=-1)?true:false;
    _this._is_ie7=(_this._is_ie&&navigator.userAgent.indexOf("MSIE 7")!=-1)?true:false;
    _this._is_safari=(navigator.userAgent.indexOf("KHTML")!=-1)?true:false;
    _this._is_ff=(navigator.userAgent.indexOf("Firefox")!=-1)?true:false;
    _this._is_ff3=(navigator.userAgent.indexOf("Firefox/3.")!=-1)?true:false;
    _this._is_opera=(navigator.userAgent.indexOf("Opera")!=-1)?true:false;
    BROWSER_TYPE = {
      opera:    _this._is_opera,
      safari:   _this._is_safari,
      firefox:  _this._is_ff,
      ie:  _this._is_ie,
      ie6: _this._is_ie6,
      ie7: _this._is_ie7,
      firefox3: _this._is_ff3
    };
    _this._domWaiter();
  },
  // adds items to eval after the dom is done:
  _domLoader: function(_cmdStr){
    var _this = ELEM;
    if(typeof _cmdStr == 'string'){
      if(_this._initDone==true){
        eval(_cmdStr);
      } else {
        _this._domLoadQueue.push(_cmdStr);
      }
    }
  },
  _domWaiter: function(){
    var _isloaded = false;
    var _this = ELEM;
    // A hack for ie (ripped from DomLoaded.js)
    // http://www.cherny.com/demos/onload/domloaded.js
    if(_this._is_ie){
      var _ie_proto = "javascript:void(0)";
      if (location.protocol == "https:"){
        _ie_proto = "src=//0";
      }
      document.write("<scr"+"ipt id=__ie_onload defer src=" + _ie_proto + "><\/scr"+"ipt>");
      var _ie_script = document.getElementById("__ie_onload");
      _ie_script.onreadystatechange = function(){
        if(this.readyState == "complete"){
          ELEM._domLoadStatus = true;
          ELEM._init();
          delete ELEM._domLoadQueue;
          clearTimeout( ELEM._domLoadTimer );
          delete ELEM._domLoadTimer;
        }
      };
      // the event will trigger on ie, so we don't have to keep on polling:
      return;
    }
    
    // Safari / KHTML readyness detection:
    else if((/KHTML|WebKit/i.test(navigator.userAgent)) &&
            (/loaded|complete/.test(document.readyState))) {
      _this._domLoadStatus = true;
    }
    
    // Works for Mozilla:
    else if(document.body){
      _this._domLoadStatus = true;
    }
    
    if(!_this._domLoadStatus){
      _this._domLoadTimer = setTimeout('ELEM._domWaiter()',ELEMTickerInterval*10);
    } else {
      _this._init();
      delete _this._domLoadQueue;
      clearTimeout(_this._domLoadTimer);
      delete _this._domLoadTimer;
    }
  }
};
ELEM._constructor();
LOAD = ELEM._domLoader;
ELEM._warmup();

/***  HIMLE RIA SYSTEM
  ** 
  **  Copyright (C) 2008 HIMLE GROUP http://himle.sorsacode.com/
  **  Copyright (C) 2007 Juha-Jarmo Heinonen <o@sorsacode.com>
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

// Caching mid-level event listener abstraction
Event = {
  element: function(e){return e.target||e.srcElement;},
  pointerX: function(e){return e.pageX||e.clientX+document.documentElement.scrollLeft;},
  pointerY: function(e){return e.pageY||e.clientY+document.documentElement.scrollTop;},
  stop: function(e){
    if(e.preventDefault){e.preventDefault();e.stopPropagation();}
    else{e.returnValue=false;e.cancelBubble=true;}
  },
  isLeftClick: function(e){
    // IE: left 1, middle 4, right 2
    if(ELEM._is_ie||ELEM._is_safari){return(e.button==1);}
    else{return(e.button==0);}
  },
  observers: false,
  _observeAndCache: function(_elem,_name,_function,_useCapture){
    if(!Event.observers){Event.observers=[];}
    if(_elem.addEventListener){
      this.observers.push([_elem,_name,_function,_useCapture]);
      _elem.addEventListener(_name,_function,_useCapture);
    }
    else if(_elem.attachEvent){
      this.observers.push([_elem,_name,_function,_useCapture]);
      _elem.attachEvent("on"+_name,_function);
    }
  },
  unloadCache: function(){
    if(!Event.observers){return;}
    var i,l=Event.observers.length;
    for(i=0;i<l;i++){Event.stopObserving.apply(this,Event.observers[0]);}
    Event.observers=false;
  },
  observe: function(_elem,_name,_function,_useCapture){
    _useCapture=_useCapture||false;
    Event._observeAndCache(_elem,_name,_function,_useCapture);
  },
  stopObserving: function(_elem,_name,_function,_useCapture){
    _useCapture=_useCapture||false;
    if(_elem.removeEventListener){_elem.removeEventListener(_name,_function,_useCapture);}
    else if(detachEvent){_elem.detachEvent("on"+_name,_function);}
    var i=0; while(i<Event.observers.length){
      var eo=Event.observers[i];
      if(eo&&eo[0]==_elem&&eo[1]==_name&&eo[2]==_function&&eo[3]==_useCapture){Event.observers[i]=null;Event.observers.splice(i,1);}
      else{i++;}
    }
  },
  // ascii symbols:
  KEY_BACKSPACE:8,KEY_TAB:9,KEY_RETURN:13,KEY_ESC:27,KEY_LEFT:37,KEY_UP:38,KEY_RIGHT:39,
  KEY_DOWN:40,KEY_DELETE:46,KEY_HOME:36,KEY_END:35,KEY_PAGEUP:33,KEY_PAGEDOWN:34
};

// IE memory cleanup:
if(ELEM._is_ie){Event.observe(window,"unload",Event.unloadCache,false);}

_defaultFocusOptions = {
  mouseMove:  false,
  mouseDown:  false,
  click:      false,
  mouseUp:    false,
  draggable:  false,
  droppable:  false,
  keyDown:    false,
  keyUp:      false,
  mouseWheel: false,
  isDragged:  false,
  textEnter:  false
};

// "Event Manager"
EVENT = {
  status:[false,false,0,0,[],false,false,false],
  button1:0,button2:1,crsrX:2,crsrY:3,keysDown:4,
  altKeyDown:5,ctrlKeyDown:6,shiftKeyDown:7,
  start: function() {
    var _globalEventTargetElement, _eventMap, i, _this=EVENT;
    if(ELEM._is_ie){_globalEventTargetElement=document;}
    else{_globalEventTargetElement=window;}
    _eventMap = [
      ['mousemove',   EVENT.mouseMove],
      ['mouseup',     EVENT.mouseUp],
      ['mousedown',   EVENT.mouseDown],
      ['click',       EVENT.click],
      ['keyup',       EVENT.keyUp],
      ['keydown',     EVENT.keyDown],
      ['keypress',    EVENT.keyPress],
      ['contextmenu', EVENT.contextMenu],
      ['resize',      EVENT.resize],
      ['mousewheel',  EVENT.mouseWheel]
    ];
    for(i=0;i!=_eventMap.length;i++){Event.observe(_globalEventTargetElement,_eventMap[i][0],_eventMap[i][1]);}
    if(window.addEventListener){window.addEventListener('DOMMouseScroll',EVENT.mouseWheel,false);}
    //window.onmousewheel=document.onmousewheel=EVENT.mouseWheel;
    _this.listeners=[];      // keep elemId buffer of all listeners
    _this.focused=[];        // keep elemId buffer of all focused listeners
    _this.resizeListeners=[]; // list of resize-event listeners
    _this.coordListeners=[]; // global mouse movement listeners
    _this.focusOptions={};   // keep property lists by elemId
    _this.dragItems=[];      // elemId of currently dragged items
    _this.hovered=[];        // items currently under the mouse cursor
    _this.hoverInterval=50;  // 50 means send hover events at most with 50ms intervals
    _this.hoverTimer=new Date().getTime(); // Time since last hover event triggered
    _this.topmostDroppable=null; // the currently hovered element accepting droppable items
    _this.textEnterCtrls=[];  // ID of controls with textfields
    // position caching benefits performance, see coordCacheFlush
    _this._coordCache=[];
    _this._coordCacheFlag=true;
    _this._lastCoordFlushTimeout=null;
    
    _this.activeControl = null; // control that currently has the focus
    _this._lastKeyDown = null;  // the most recent keypress
  },
  // flushes the position cache by elemId, if no elemId is specified, everything is flushed
  coordCacheFlush: function(_elemId){
    if(_elemId){EVENT._coordCache[_elemId]=null;}
    else{EVENT._coordCache=[];}
  },
  // registers the View instance _ctrl by event listener flags in _focusOptions
  reg: function(_ctrl,_focusOptions){
    var _elemId,_elem,_this=EVENT,_propIn;
    // Binds the class to the element (so it can be called on the event)
    _elemId=_ctrl.elemId;
    _elem=ELEM.get(_elemId);
    if(ELEM._is_ie){_elem.setAttribute('ctrl',_ctrl);}
    else{_elem.ctrl=_ctrl;}
    _this.listeners[_elemId]=true;
    _this.focused[_elemId]=false;
    for(var _propIn in _defaultFocusOptions){
      if(_focusOptions[_propIn]===undefined){
        _focusOptions[_propIn] = _defaultFocusOptions[_propIn];
      }
    }
    _this.focusOptions[_elemId]=_focusOptions;
    var _coordListenIdx=_this.coordListeners.indexOf(_elemId);
    if(_focusOptions.mouseMove){
      if(_coordListenIdx==-1){
        _this.coordListeners.push(_elemId);
    } }
    else if(_coordListenIdx!=-1){
      _this.coordListeners.splice(_coordListenIdx,1);
    }
    //console.log('focusOptions:',_focusOptions);
    //console.log('focusOptions.textEnter: ',_focusOptions.textEnter);
    if(_focusOptions.textEnter){
      if(_this.textEnterCtrls.indexOf(_ctrl.viewId)==-1){
        _this.textEnterCtrls.push(_ctrl.viewId);
      }
    }
    if(_focusOptions.resize){
      if(_this.resizeListeners.indexOf(_ctrl.viewId)==-1){
        _this.resizeListeners.push(_ctrl.viewId);
      }
    }
    Event.observe(_elem,'mouseover',_this._mouseOver);
  },
  // unregisters the View instance _ctrl event listeners
  unreg: function(_ctrl){
    var _this=EVENT,_elemId,_elem;
    if(_ctrl===this.activeControl){_this.changeActiveControl(null);}
    _elemId=_ctrl.elemId;_elem=ELEM.get(_elemId);
    this.listeners[_elemId]=false;
    this.focused[_elemId]=false;
    this._coordCache[_elemId]=null;
    var _textEnterIndex=_this.textEnterCtrls.indexOf(_ctrl.viewId);
    if(_textEnterIndex!=-1){
      _this.textEnterCtrls.splice(_textEnterIndex,1);
    }
    
    var _resizeIndex=_this.resizeListeners.indexOf(_ctrl.viewId);
    if(_resizeIndex!=-1){
      _this.resizeListeners.splice(_resizeIndex,1);
    }
    Event.stopObserving(_elem,'mouseover',_this._mouseOver);
  },
  
  resize: function(e){
    var i=0,_this=EVENT,_ctrlID,_ctrl;
    for(;i<_this.resizeListeners.length;i++){
      _ctrlID=_this.resizeListeners[i];
      _ctrl=HSystem.views[_ctrlID];
      if(_ctrl.onResize){_ctrl.onResize();}
    }
  },
  
  // element-specific over/out handler
  _mouseOver: function(e) {
    if(!Event.element){return;}
    var _that=Event.element(e);
    while(_that&&_that.ctrl===undefined){_that=_that.parentNode;}
    if(!_that){return;}
    var _this=_that.ctrl;
    EVENT.focus(_this);
    Event.stop(e);
  },
  
  // element-specific over/out handler
  _mouseOut: function(e) {
    if(!Event.element){return;}
    var _that=Event.element(e);
    while(_that&&_that.ctrl===undefined){_that=_that.parentNode;}
    if(!_that){return;}
    var _this=_that.ctrl;
    EVENT.blur(_this);
    Event.stop(e);
  },
  
  // stops mouseover listening and starts mouseout listening,
  // sends a focus() call to the ctrl
  focus: function(_ctrl){
    var _this=EVENT,_elemId,_elem;
    _elemId=_ctrl.elemId;_elem=ELEM.get(_elemId);
    if(_this.focused[_elemId]==false&&_this.focusOptions[_elemId].isDragged==false){
      Event.stopObserving(_elem,'mouseover',_this._mouseOver);
      Event.observe(_elem,'mouseout',_this._mouseOut);
      _this.focused[_elemId]=true;
      if(_ctrl['focus']){_ctrl.focus();}
    }
  },
  // stops mouseout listening and starts mouseover listening,
  // sends a blur() call to the ctrl
  blur: function(_ctrl) {
    var _this=EVENT,_elemId,_elem;
    _elemId=_ctrl.elemId;_elem=ELEM.get(_elemId);
    if(_this.focused[_elemId]==true&&_this.focusOptions[_elemId].isDragged==false){
      Event.stopObserving(_elem,'mouseout',_this._mouseOut);
      Event.observe(_elem,'mouseover',_this._mouseOver);
      _this.focused[_elemId]=false;
      if(_ctrl['blur']){_ctrl.blur();}
    }
  },
  
  //// Event listeners:
  
  // tracks mouse movement,
  // sends doDrag, mouseMove, onHoverEnd, onHoverStart pseudo-events
  mouseMove: function(e) {
    var _this=EVENT,x,y,_currentlyDragging;
    // current position
    x=Event.pointerX(e);
    y=Event.pointerY(e);
    _this.status[_this.crsrX]=x;
    _this.status[_this.crsrY]=y;
    _currentlyDragging = _this.flushMouseMove(x,y);
    _this._modifiers(e); // might work
    if(_currentlyDragging){Event.stop(e);} // Only prevent default action when we are dragging something.
  },
  
  flushMouseMove: function(x,y){
    var _this=EVENT,x,y,_currentlyDragging,i,j,_elemId,_ctrl;
    clearTimeout(_this._lastCoordFlushTimeout);
    // drag detect flag
    _currentlyDragging=false;
    // send doDrag event to all drag-interested ctrls
    for(i=0;i!=_this.dragItems.length;i++){
      _elemId=_this.dragItems[i];
      _this.focusOptions[_elemId].ctrl.doDrag(x,y);
      _this.coordCacheFlush(_elemId);
      _currentlyDragging=true;
    }
    
    // Check which items are under the mouse coordinates now.
    if(new Date().getTime()>_this.hoverTimer+_this.hoverInterval) {
      // sends mouseMove pseudo-events to ctrls interested
      for(i=0;i!=_this.coordListeners.length;i++){
        _elemId=_this.coordListeners[i];_ctrl=_this.focusOptions[_elemId].ctrl;
        _ctrl.mouseMove(x,y);
      }
      _this._updateHoverItems();
      // sends drag&drop pseudo-events
      var _wasTopmostDroppable;
      for(i=0;i!=_this.dragItems.length;i++){
        // Find the current droppable while dragging.
        _wasTopmostDroppable=_this.topmostDroppable;
        _this.topmostDroppable=null;
        _elemId=_this.dragItems[i];_ctrl=_this.focusOptions[_elemId].ctrl;
        // Check for a drop target from the currently hovered items
        var _hoverIndex, _dropCtrl;
        for(j=0;j!=_this.hovered.length;j++){
          _hoverIndex=_this.hovered[j];
          if(_hoverIndex!=_elemId&&_this.focusOptions[_hoverIndex].ctrl){
            _dropCtrl=_this.focusOptions[_hoverIndex].ctrl;
            if(!_this.topmostDroppable|| // First time
              _dropCtrl.zIndex()>_this.topmostDroppable.zIndex() || // Z beaten
              _dropCtrl.supr===_this.topmostDroppable){ // subview
              if(_this.focusOptions[_dropCtrl.elemId].droppable){
                _this.topmostDroppable=_dropCtrl; // Finally, the item must accept drop events.
        } } } }
        
        // Topmost item has changed, send onHoverStart or onHoverEnd to the droppable.
        if(_wasTopmostDroppable!=_this.topmostDroppable){
          if(_wasTopmostDroppable){_wasTopmostDroppable.onHoverEnd(_ctrl);}
          if(_this.topmostDroppable){_this.topmostDroppable.onHoverStart(_ctrl);}
      } }
      _this.hoverTimer = new Date().getTime();
    }
    else {
      _this._lastCoordFlushTimeout=setTimeout('EVENT.flushMouseMove('+x+','+y+');',_this.hoverInterval);
    }
    return _currentlyDragging;
  },
  
  // Loop through all registered items and store indices of elements that are currenly under
  // the mouse cursor in .hovered array. Uses cached position and dimensions value when possible.
  _updateHoverItems: function() {
    var _this=EVENT,x,y,i,_ctrl,_elem,_pos,_size,_coords;
    _this.hovered=[];
    x=_this.status[_this.crsrX];
    y=_this.status[_this.crsrY];
    for(i=0;i!=_this.listeners.length;i++) {
      if(!_this.listeners[i]||!_this.focusOptions[i].ctrl){continue;}
      _ctrl=_this.focusOptions[i].ctrl;_elem=ELEM.get(i);
      if(!_this._coordCacheFlag||!_this._coordCache[i]){
        _pos=ELEM.getVisiblePosition(_ctrl.elemId);   // [x,y]
        _size=ELEM.getVisibleSize(_ctrl.elemId); // [w,h]
        _this._coordCache[i]=[_pos[0],_pos[1],_size[0],_size[1]];
      }
      _coords=_this._coordCache[i];
      // Is the mouse pointer inside the element's rectangle?
      if (x>=_coords[0]&&x<=_coords[0]+_coords[2]&&y>=_coords[1]&&y<=_coords[1]+_coords[3]){
        _this.hovered.push(i);
    } }
  },
  
  
  // tracks mouse clicks,
  // sends mouseDown and startDrag pseudo-events
  mouseDown: function(e,_isLeftButton){
    var _this=EVENT,_didStartDrag,x,y,i,_newActiveControl,_startDragElementIds,_mouseDownElementIds;
    _this._modifiers(e);
    _didStartDrag=false;
    if(_isLeftButton===undefined){_isLeftButton=Event.isLeftClick(e);}
    if(_isLeftButton){_this.status[_this.button1]=true;}
    else{_this.status[_this.button2]=true;} // bug??
    x=_this.status[_this.crsrX];y=_this.status[_this.crsrY];
    // Unset the active control when clicking on anything.
    _newActiveControl=null;
    // The startDrag and mouseDown event receivers are first collected into
    // these arrays and the events are sent after the active control status has
    // been changed.
    _startDragElementIds=[];
    _mouseDownElementIds=[];
    for(i=0;i!=_this.focused.length;i++){
      if(_this.focused[i]==true){
        // Set the active control to the currently focused item.
        if(_this.focusOptions[i].ctrl.enabled){_newActiveControl=_this.focusOptions[i].ctrl;}
        if((_this.focusOptions[i].draggable==true)&&_this.dragItems.indexOf(i)==-1){_startDragElementIds.push(i);}
        else if(_this.focusOptions[i].mouseDown==true){_mouseDownElementIds.push(i);}
    } }
    // Handle the active control selection.
    //console.log('EVENT.mouseDown, newActiveControl:',_newActiveControl.type,_newActiveControl.enabled);
    if(_newActiveControl){_this.changeActiveControl(_newActiveControl);}
    // Call the mouseDown and startDrag events after the active control change has been handled.
    for(i=0;i!=_startDragElementIds.length;i++){
      _this.dragItems.push(_startDragElementIds[i]);
      //console.log('_startDragElementIds',_startDragElementIds);
      //console.log('_this.focusOptions',_this.focusOptions);
      //console.log('_this.focusOptions['+_startDragElementIds[i]+']',_this.focusOptions[_startDragElementIds[i]]);
      _this.focusOptions[_startDragElementIds[i]].ctrl.startDrag(x,y);
      _didStartDrag=true;
    }
    
    var _stopEvent=_mouseDownElementIds.length;
    for(i=0;i!=_mouseDownElementIds.length;i++){
      if(_this.focusOptions[_mouseDownElementIds[i]].ctrl.mouseDown(x,y,_isLeftButton)){_stopEvent--;}
    }
    if(_didStartDrag){
      // Remove possible selections.
      document.body.focus();
      // Prevent text selection in MSIE when dragging starts.
      _this._storedOnSelectStart=document.onselectstart;
      document.onselectstart=function(){return false;};
    }
    // Stop the event only when we are hovering over some control, allows normal DOM events to co-exist.
    if((_stopEvent==0)&&(_this.hovered.length!=0)&&(_newActiveControl&&(_newActiveControl.textElemId===false))){Event.stop(e);}
    return true;
  },
  
  click: function(e,_isLeftButton){
    var _this=EVENT,x,y,i,_newActiveControl,_clickElementIds;
    _this._modifiers(e);
    if(_isLeftButton===undefined){_isLeftButton=Event.isLeftClick(e);}
    if(_isLeftButton){_this.status[_this.button1]=true;}
    else{_this.status[_this.button2]=true;} // bug???
    x=_this.status[_this.crsrX];y=_this.status[_this.crsrY];
    // Unset the active control when clicking on anything.
    _newActiveControl=null;
    // The startDrag and mouseDown event receivers are first collected into
    // these arrays and the events are sent after the active control status has
    // been changed.
    _clickElementIds=[];
    for(i=0;i!=_this.focused.length;i++){
      if(_this.focused[i]==true){
        //console.log('_this.focusOptions',_this.focusOptions);
        // Set the active control to the currently focused item.
        if(_this.focusOptions[i].ctrl.enabled){_newActiveControl=_this.focusOptions[i].ctrl;}
        else if(_this.focusOptions[i].click==true){_clickElementIds.push(i);}
    } }
    // Handle the active control selection.
    if(_newActiveControl){_this.changeActiveControl(_newActiveControl);}
    var _stopEvent=_clickElementIds.length;
    for(i=0;i!=_clickElementIds.length;i++){
      if(_this.focusOptions[_clickElementIds[i]].ctrl.click(x,y,_isLeftButton)){_stopEvent--;}
    }
    // Stop the event only when we are hovering over some control, allows normal DOM events to co-exist.
    if((_stopEvent==0)&&(_this.hovered.length!=0)&&(_newActiveControl&&(_newActiveControl.textElemId===false))){Event.stop(e);}
    //if(_this.hovered.length!=0){Event.stop(e);}
    return true;
  },
  
  // changes active ctrl,
  // previous active ctrl gets the _lostActiveStatus pseudo-event,
  // the new active ctrl gets the _gainedActiveStatus pseudo-event
  changeActiveControl: function(_ctrl){
    //console.log('EVENT.changeActiveControl: ',_ctrl);
    var _this=EVENT,_prevActiveCtrl;
    // Store the currently active control so we can inform it, if it no longer is the active control.
    _prevActiveCtrl=_this.activeControl;
    // Did the active control change?
    if(_ctrl!=_prevActiveCtrl){
      if(_prevActiveCtrl){
        // Previously active control just lost the active status.
        _prevActiveCtrl.active=false;
        _prevActiveCtrl._lostActiveStatus(_ctrl);
      }
      _this.activeControl=null;
      if(_ctrl){
        // A new control gained the active status.
        _ctrl.active = true;
        _this.activeControl = _ctrl;
        _ctrl._gainedActiveStatus(_prevActiveCtrl);
    } }
  },
  
  
  // tracks mouse up events,
  // sends onHoverEnd, onDrop, mouseUp, endDrag
  mouseUp: function(e){
    var _this=EVENT,_didEndDrag,x,y,_elemId,_ctrl,i;
    _this._modifiers(e);
    _didEndDrag=false;
    _isLeftButton=Event.isLeftClick(e); // might not work?
    _this.status[_this.button1]=false;
    _this.status[_this.button2]=false;
    x=_this.status[_this.crsrX];
    y=_this.status[_this.crsrY];
    // Send endDrag for the currently dragged items even when they don't have focus, and clear the drag item array.
    for(i=0;i!=_this.dragItems.length;i++){
      _elemId=_this.dragItems[i];
      _ctrl=_this.focusOptions[_elemId].ctrl;
      _ctrl.endDrag(x,y);
      _didEndDrag=true;
      // If the mouse slipped off the dragged item before the mouse button was released, blur the item manually
      _this._updateHoverItems();
      if (_this.hovered.indexOf(_elemId)==-1){_this.blur(_ctrl);}
      // If there is a drop target in the currently hovered items, send onDrop to it.
      if (_this.topmostDroppable) {
        // Droppable found at the release point.
        _this.topmostDroppable.onHoverEnd(_ctrl);
        _this.topmostDroppable.onDrop(_ctrl);
        _this.topmostDroppable=null;
    } }
    _this.dragItems=[];
    // Restore MSIE's ability to select text after dragging has ended.
    if(_didEndDrag){document.onselectstart=_this._storedOnSelectStart;}
    // Check for mouseUp listeners.
    for(i=0;i!=_this.focused.length;i++){
      if(_this.focused[i]==true){
        if(_this.focusOptions[i].mouseUp==true){
          _this.focusOptions[i].ctrl.mouseUp(x,y,_isLeftButton);
    } } }
    return true;
  },
  
  
  // tracks key presses,
  // sends keyDown pseudo-events to active items that are interested
  keyDown: function(e){
    var _this=EVENT,_theKeyCode;
    _this._modifiers(e);
    _theKeyCode=e.keyCode;
    if(_this.activeControl&&_this.focusOptions[_this.activeControl.elemId].keyDown==true){
      Event.stop(e);
      // Workaround for msie rapid fire keydown
      if(_this._lastKeyDown!=_theKeyCode){_this.activeControl.keyDown(_theKeyCode);}
    }
    // Insert key to the realtime array, remove in keyUp
    if(_this.status[_this.keysDown].indexOf(_theKeyCode)==-1){_this.status[_this.keysDown].push(_theKeyCode);}
    _this._lastKeyDown=_theKeyCode;
  },
  
  
  // tracks key releases,
  // sends keyUp pseudo-events to active items that are interested
  keyUp: function(e){
    var _this=EVENT,_theKeyCode,_keycodeindex;
    _this._modifiers(e);
    _theKeyCode=e.keyCode;
    _this._lastKeyDown=null;
    //console.log('EVENT.keyUp: ',_this.textEnterCtrls);
    //console.log(_this.textEnterCtrls);
    for(var i=0;i!=_this.textEnterCtrls.length;i++){
      var _ctrlID=_this.textEnterCtrls[i], _ctrl=HSystem.views[_ctrlID];
      if(_ctrl.textEnter){_ctrl.textEnter();}
    }
    if(_this.activeControl&&_this.focusOptions[_this.activeControl.elemId].keyUp==true){
      _this.activeControl.keyUp(_theKeyCode);
    }
    // Remove the key from the realtime array, inserted in keyDown
    _keyCodeIndex=_this.status[_this.keysDown].indexOf(_theKeyCode);
    if(_keyCodeIndex!=-1){_this.status[_this.keysDown].splice(_keyCodeIndex,1);}
  },
  
  // prevents this event (key being hold down; we don't want repetitions)
  keyPress: function(e){
    var _this=EVENT;
    if(_this.activeControl&&_this.focusOptions[_this.activeControl.elemId].keyDown==true){Event.stop(e);}
  },
  
  
  // tracks mouse wheel events,
  // sends mouseWheel pseudo-events
  mouseWheel: function(e) {
    var _this=EVENT,_delta,i;
    _delta=0;
    if(!e){e=window.event;}
    if(e.wheelDelta){
      _delta=e.wheelDelta/120; 
      if(window.opera){_delta=-_delta;}
    }
    else if(e.detail){
      _delta=-e.detail/3;
    }
    for(i=0;i!=_this.focused.length;i++){
      if(_this.focused[i]==true){
        if(_this.focusOptions[i].mouseWheel==true){
          Event.stop(e);_this.focusOptions[i].ctrl.mouseWheel(_delta);
    } } }
  },
  
  /// Alternative right button detection, wraps mousedown
  contextMenu: function(e){
    EVENT.mouseDown(e, false);
    Event.stop(e);
  },
  
  /// Handle the event modifiers.
  _modifiers: function(e){
    var _this=EVENT;
    _this.status[_this.altKeyDown] = e.altKey;
    _this.status[_this.ctrlKeyDown] = e.ctrlKey;
    _this.status[_this.shiftKeyDown] = e.shiftKey;
  }
  
};

/** Starts the only instance
  */
LOAD('EVENT.start();');

/***  HIMLE RIA SYSTEM
  ** 
  **  Copyright (C) 2008 HIMLE GROUP http://himle.sorsacode.com/
  **  Copyright (C) 2007 Juha-Jarmo Heinonen <o@sorsacode.com>
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

/**
*** This File is a part of AppSpace
***
*** Copyright (c) 2007 Juha-Jarmo Heinonen
***                    juha-jarmo.heinonen@sorsacode.com
**/

// Encoder / Decoder facility

/** IMPROVED FROM: **/
/*
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.1 Copyright (C) Paul Johnston 1999 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.

 * vBulletin Usage: md5hash(input,output)
 * Recommend: input = password input field; output = hidden field

 */


SHA = {
  /* hex output format. 0 - lowercase; 1 - uppercase        */
  _hexcase: 0,
  hexCase: function(){
    return SHA._hexcase;
  },
  setHexCase: function(_case){
    SHA._hexcase = _case;
  },
  
  /* base-64 pad character. "=" for strict RFC compliance   */
  _b64pad: "=",
  base64Pad: function(){
    return SHA._b64pad;
  },
  setBase64Pad: function(_pad){
    SHA._b64pad = _pad;
  },
  
  /* bits per input character. 8 - ASCII; 16 - Unicode      */
  _chrsz: 8,
  chrsz: function(){
    return SHA._chrsz;
  },
  setChrsz: function(_bits){
    SHA._chrsz = _bits;
  },
  
/*
 * These are the functions you'll usually want to call
 * They take string arguments and return either hex or base-64 encoded strings
 */
  hexSHA1: function(_s){
    var _this=SHA;
    return _this._binb2hex(
      _this._coreSHA1(
        _this._str2binb(_s),
        _s.length * _this._chrsz
      )
    );
  },
  b64SHA1: function(_s){
    var _this=SHA;
    return _this._binb2b64(
      _this._coreSHA1(
        _this._str2binb(_s),
        _s.length * _this._chrsz
      )
    );
  },
  strSHA1: function(_s){
    var _this=SHA;
    return _this._binb2str(
      _this._coreSHA1(
        _this._str2binb(_s),
        _s.length * _this._chrsz
      )
    );
  },
  hexHmacSHA1: function(_key, _data){
    var _this=SHA;
    return _this._binb2hex(
      _this._coreHmacSHA1(_key, _data)
    );
  },
  b64HmacSHA1: function(_key, _data){
    var _this=SHA;
    return _this._binb2b64(
      _this._coreHmacSHA1(_key, _data)
    );
  },
  strHmacSHA1: function(_key, _data){
    var _this=SHA;
    return _this._binb2str(
      _this._coreHmacSHA1(_key, _data)
    );
  },
  
  str2Base64: function(_str){
    var _this=SHA;
    return _this._binb2b64(_this._str2binb(_str));
  },
  
  /*
   * Perform a simple self-test to see if the VM is working
   */
  test: function(){
    return SHA.hexSHA1("abc") == "a9993e364706816aba3e25717850c26c9cd0d89d";
  },

  /*
   * Calculate the SHA-1 of an array of big-endian words, and a bit length
   */
  _coreSHA1: function(_x, _len){
    var _this=SHA;
    /* append padding */
    _x[_len >> 5] |= 0x80 << (24 - _len % 32);
    _x[((_len + 64 >> 9) << 4) + 15] = _len;

    var _w = new Array(80),
        _a =  1732584193,
        _b = -271733879,
        _c = -1732584194,
        _d =  271733878,
        _e = -1009589776,
        i, _olda, _oldb, _oldc, _oldd, _olde,
        j, _t;

    for(i = 0; i < _x.length; i += 16){
      _olda = _a;
      _oldb = _b;
      _oldc = _c;
      _oldd = _d;
      _olde = _e;

      for(j = 0; j < 80; j++){
        if(j < 16){
          _w[j] = _x[i + j];
        }
        else {
          _w[j] = _this._rol(_w[j-3] ^ _w[j-8] ^ _w[j-14] ^ _w[j-16], 1);
        }
        _t = _this._safeAdd(_this._safeAdd(_this._rol(_a, 5), _this._sha1FT(j, _b, _c, _d)),
             _this._safeAdd(_this._safeAdd(_e, _w[j]), _this._sha1KT(j)));
        _e = _d;
        _d = _c;
        _c = _this._rol(_b, 30);
        _b = _a;
        _a = _t;
      }

      _a = _this._safeAdd(_a, _olda);
      _b = _this._safeAdd(_b, _oldb);
      _c = _this._safeAdd(_c, _oldc);
      _d = _this._safeAdd(_d, _oldd);
      _e = _this._safeAdd(_e, _olde);
    }
    return [_a, _b, _c, _d, _e];

  },

  /*
   * Perform the appropriate triplet combination function for the current
   * iteration
   */
  _sha1FT: function(_t, _b, _c, _d) {
    if(_t < 20){
      return (_b & _c) | ((~_b) & _d);
    }
    if(_t < 40){
      return _b ^ _c ^ _d;
    }
    if(_t < 60){
      return (_b & _c) | (_b & _d) | (_c & _d);
    }
    return _b ^ _c ^ _d;
  },

  /*
   * Determine the appropriate additive constant for the current iteration
   */
  _sha1KT: function(_t){
    return (_t < 20) ?  1518500249 : (_t < 40) ?  1859775393 :
           (_t < 60) ? -1894007588 : -899497514;
  },

  /*
   * Calculate the HMAC-SHA1 of a key and some data
   */
  _coreHmacSHA1: function(_key, _data){
    var _this=SHA,
        _bkey = _this._str2binb(_key),
        _ipad = new Array(16),
        _opad = new Array(16),
        i, _hash;
    if(_bkey.length > 16){
      _bkey = _this._coreSHA1(_bkey, _key.length * _this._chrsz);
    }
    for(i = 0; i  < 16; i++){
      _ipad[i] = _bkey[i] ^ 0x36363636;
      _opad[i] = _bkey[i] ^ 0x5C5C5C5C;
    }
    
    _hash = _this._coreSHA1(_ipad.concat(_this._str2binb(_data)), 512 + _data.length * _this._chrsz);
    return _this._coreSHA1(_opad.concat(_hash), 512 + 160);
  },

  /*
   * Add integers, wrapping at 2^32. This uses 16-bit operations internally
   * to work around bugs in some JS interpreters.
   */
  _safeAdd: function(_x, _y){
    var _lsw = (_x & 0xFFFF) + (_y & 0xFFFF),
        _msw = (_x >> 16) + (_y >> 16) + (_lsw >> 16);
    return (_msw << 16) | (_lsw & 0xFFFF);
  },

  /*
   * Bitwise rotate a 32-bit number to the left.
   */
  _rol: function(_num, _cnt){
    return (_num << _cnt) | (_num >>> (32 - _cnt));
  },
  
  /*
   * Convert an 8-bit or 16-bit string to an array of big-endian words
   * In 8-bit function, characters >255 have their hi-byte silently ignored.
   */
  _str2binb: function(_str){
    var _this=SHA,
        _bin = [],
        _mask = (1 << _this._chrsz) - 1,
        _strLenChrSZ = _str.length * _this._chrsz,
        i;
    for(i = 0; i < _strLenChrSZ; i += _this._chrsz){
      _bin[i>>5] |= (_str.charCodeAt(i / _this._chrsz) & _mask) << (32 - _this._chrsz - i%32);
    }
    return _bin;
  },

  /*
   * Convert an array of big-endian words to a string
   */
  _binb2str: function(_bin){
    var _this=SHA,
        _str = "",
        _mask = (1 << _this._chrsz) - 1,
        i,
        _binLen32 = _bin.length * 32,
        _32chrsz = 32 - _this._chrsz;
    for(i = 0; i < _binLen32; i += _this._chrsz){
      _str += String.fromCharCode((_bin[i>>5] >>> (_32chrsz - i%32)) & _mask);
    }
    return _str;
  },

  /*
   * Convert an array of big-endian words to a hex string.
   */
  _binb2hex: function(_binarray){
    var _this=SHA,
        _hexTab = _this._hexcase ? "0123456789ABCDEF" : "0123456789abcdef",
        _str = "",
        i,
        _binLen = _binarray.length * 4;
    for(i = 0; i < _binLen; i++){
      _str += _hexTab.charAt((_binarray[i>>2] >> ((3 - i%4)*8+4)) & 0xF) +
              _hexTab.charAt((_binarray[i>>2] >> ((3 - i%4)*8  )) & 0xF);
    }
    return _str;
  },

  /*
   * Convert an array of big-endian words to a base-64 string
   */
  _binb2b64: function(_binarray){
    var _this=SHA,
        _tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
        _str = "",
        i,
        _binLen = _binarray.length * 4,
        _t1, _t2, _3,
        _triplet,
        j,
        _binLen32 = _binarray.length * 32;
    for(i = 0; i < _binLen; i += 3){
      _t1 = (((_binarray[i   >> 2] >> 8 * (3 -  i   %4)) & 0xFF) << 16);
      _t2 = (((_binarray[i+1 >> 2] >> 8 * (3 - (i+1)%4)) & 0xFF) << 8 );
      _t3 = ((_binarray[i+2 >> 2] >> 8 * (3 - (i+2)%4)) & 0xFF);
      _triplet = (_t1 | _t2 | _t3);
      for(j = 0; j < 4; j++){
        if(i * 8 + j * 6 > _binLen32){
          _str += _this._b64pad;
        }
        else {
          _str += _tab.charAt((_triplet >> 6*(3-j)) & 0x3F);
        }
      }
    }
    return _str;
  }
};
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

/** class: HTransporter
  *
  * *Simple mid-level AJAX communication system.*
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
  * > HTransporter.ses_id    = 'nhHOZ8Zo64Wfo';
  * > HTransporter.syncDelay = 400;
  * > HTransporter.url_base = '/ui';
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

/* str: HFailPageUrl
 *
 * Url or uri where the the client goes, if a communication error is encountered.
 */
HFailPageUrl = '/';
HTransporterMaxRetryCount = 60;     // 60 retries
HTransporterMaxRetryTime  = 60000; // 60 seconds
HTransporterRetryDelay    = 1000; // 1 second

/* vars: Instance variables
 *  url_base  - The URL (or path) that the requests are sent to
 *  ses_id    - A value that is the reported in each request by the key 'ses_id'
 *  syncDelay - An integer value (in ms) that the client waits before starting the next request
 */
HTransporter = Base.extend({
  
  constructor: null,
  
  start: function(_url_base){
    var _this = HTransporter;
    _this.url_base  = _url_base;
    _this.ses_id    = 0;
    _this.err_msg   = '';
    _this.isBusy    = false;
    _this.syncNum   = 0;
    _this.syncDelay = 100;
    
    _this.prevData  = '';
    _this.failCount = 0;
    _this.firstFail = 0;
    
    _this.pollMode  = HTransportPoll;
    _this.req_timeout = setTimeout('HTransporter.sync();',_this.syncDelay);
  },
  
  setPollMode: function(_flag) {
    HTransporter.pollMode = _flag;
  },
  
  failure: function(resp){
    //console.log('failure');
    var _currFailAge = HTransporterMaxRetryTime+(new Date().getTime()),
        _this = HTransporter;
    clearTimeout(_this.req_timeout);
    if(_this.firstFail==0){
      _this.isBusy = false;
      _this.firstFail=(new Date().getTime());
      _this.failCount++;
      window.status = 'Communications error, retry attempt '+_this.failCount+' of '+HTransporterMaxRetryCount+'...';
    }
    else if((_this.failCount<HTransporterMaxRetryCount)&&(_this.firstFail<_currFailAge)){
      _this.isBusy = false;
      _this.failCount++;
      window.status = 'Communications error, retry attempt '+_this.failCount+' of '+HTransporterMaxRetryCount+'...';
    }
    else {
      // If the connection fails, automatically try to reload the page.
      window.status = 'Communications error, reloading page...';
      location.href = HFailPageUrl;
      _this.isBusy = true;
    }
    //console.log('fail..retry');
    _this.req_timeout = setTimeout('HTransporter.sync();',HTransporterRetryDelay);
  },
  
  respond: function(resp){
    var _respText = resp.responseText,
        _this = HTransporter;
    try {
      _this.err_msg = '';
      eval(_respText); 
    }
    catch(e) {
      _this.err_msg = '&err_msg='+e+" - "+e.description;
      _this.failure(resp);
    }
    _this.prevData  = '';
    if(_this.failCount!=0){window.status='';}
    _this.failCount = 0;
    _this.firstFail = 0;
    _this.isBusy = false;
    if(_this.pollMode){
      _this.req_timeout = setTimeout('HTransporter.sync();',_this.syncDelay);
    }
  },
  
  sync: function(){
    var _this = HTransporter,
        _valid_delay = ((_this.syncDelay>0)||(_this.syncDelay==0));
    // Negative syncDelay stops transporter.
    if(_valid_delay && _this.url_base){
      if(!_this.isBusy){
        _this.isBusy = true;
        if(_this.prevData!=''){
          _syncData = _this.prevData;
          //console.log('syncData0:',_syncData);
        }
        else {
          _syncData = HValueManager.toXML();
          _this.prevData = _syncData;
          //console.log('syncData1:',_syncData);
        }
        if(""!=_syncData || _this.pollMode) {
          _this.syncNum++;
          HVM.isGetting=true;
          req_args = {
            onSuccess: function(resp){_this.respond(resp);},
            onFailure: function(resp){_this.failure(resp);},
            method:    'post',
            postBody:  'ses_id='+_this.ses_id+_this.err_msg+_syncData
          };
          try{
            _this.req  = new Ajax.Request( _this.url_base, req_args );
            HVM.isGetting=false;
          }
          catch(e){
            window.status = 'conn error:'+e;
            HVM.isGetting=false;
            _this.failure(null);
          }
        }
        else {
          _this.isBusy = false;
        }
      }
    }
  },
  
  stop: function() {
    clearTimeout(_this.req_timeout);
  }
  
});

LOAD("HTransporter.start(HTransportURL);");

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
  values: {},
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
  
  s: function(_id,_value){
    this.values[_id].s(_value);
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
      var _t=HTransporter;
      if(!_t.pollMode){
        clearTimeout(_t.req_timeout);
        _t.req_timeout = setTimeout('HTransporter.sync();',_t.syncDelay);
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
      var _syncvalueArr = [],_i;
      for(_i=0;_i<_synclen;_i++){
        var _syncid = this.tosync.shift();
        var _syncobj = this.values[_syncid];
        _syncvalueArr.push( _syncobj.toXML(_i) );
      }
      var _syncvalues = _syncvalueArr.join('');
      // version: 8000 + himle svn revision at modification time
      _postBody += '<hsyncvalues version="8118">'+_syncvalues+'</hsyncvalues>';
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
  
/** method: s
  * 
  * Just as <set>, but doesn't re-notify the server about the change.
  *
  **/
  s: function(_value){
    this.value = _value;
    this.refresh();
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
    //if(this.views.indexOf(_viewObj)==-1){
      this.views.push(_viewObj);
      _viewObj.setValueObj( this );
    //}
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
  
  release: function(_viewObj){
    return this.unbind(_viewObj);
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
  * > <b id="996">1</b>'
  * > <b id="996">0</b>'
  * > <f id="997">123.321</f>'
  * > <i id="997">123</i>'
  * > <s id="PnG_aXSutjPoeqgi02mXOVA9HQWREvprkkeW">c3RyaW5nAAA=</s>'
  **/
  toXML: function(_i){
    var _syncid = this.id.toString();
    //var _synctype = this.type.slice(1,-1).toLowerCase();
    var _syncvalue = this.value;
    var _syncjstype = (typeof _syncvalue).slice(0,1);
    var _syncescvalue;
    
    if (_syncjstype == 's'){ // string
      _syncescvalue = _syncvalue.toString();
      _syncescvalue = SHA.str2Base64( _syncescvalue );
    }
    else if (_syncjstype == 'n'){ // number
      if (Math.ceil(_syncvalue) === Math.floor(_syncvalue) === _syncvalue) {
        _syncjstype = 'i'; // integer
        _syncescvalue = parseInt(_syncvalue,10).toString();
      }
      else {
        _syncjstype = 'f'; // float
        _syncescvalue = parseFloat(_syncvalue).toString();
      }
    }
    else if (_syncjstype == 'b'){ // boolean
      if(_syncvalue){_syncescvalue='1';}
      else{_syncescvalue='0';}
    }
    else {
      try{
        if(console&&console.log){
          console.log('syncvalue type error');
          console.log('  syncid:',_syncid);
          console.log('  syncjstype:',_syncjstype);
          console.log('  typeof:',(typeof _syncvalue));
          console.log('  syncvalue:',_syncvalue);
        }
      }
      catch(e){
        alert('value error, syncid:'+_syncid+' syncjstype:'+_syncjstype+' typeof:'+(typeof _syncvalue)+' syncvalue:'+_syncvalue);
      }
      return '';
    }
    
    return '<'+_syncjstype+' id="'+_syncid+'">'+_syncescvalue+'</'+_syncjstype+'>';
  }
  
});


/***  HIMLE RIA SYSTEM
  ** 
  **  Copyright (C) 2008 HIMLE GROUP http://himle.sorsacode.com/
  **  Copyright (C) 2007 Juha-Jarmo Heinonen <o@sorsacode.com>
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


JSLoader = Base.extend({
  
  constructor: function(_uri){
    this._loadedJS = [];
    this.uri  = _uri;
    this._req = null;
    //this._currJS = [];
  },
  
  _okay: function(_resp){
    //var _loadedJS = jsLoader._currJS.shift();
    //console.log('resp: ',_resp);
    //console.log('loadedJS: ',_loadedJS);
    //console.log('jsLoader.loadedJS: ',jsLoader._loadedJS);
    //console.log('jsLoader.currJS: ',jsLoader._currJS);
    eval(_resp.responseText);
  }, 
  
  load: function(_jsName){
    if(jsLoader._loadedJS.indexOf(_jsName)!=-1){
      return;
    }
    //this._currJS.push(_jsName);
    req_args = {
      onSuccess:    function(resp){jsLoader._okay(resp);},
      onFailure:    function(resp){window.status="failed to load js: "+jsLoader._currJS;},
      method:       'get',
      asynchronous: false
    };
    this._req = new Ajax.Request( this.uri+_jsName+'.js', req_args );
    this._loadedJS.push(_jsName);
    
    //document.write('<script type="text/javascript" src="'+this._basePath+_jsName+'"><'+'/script>');
    //this._loaded_js.push(_jsName);
  }
  
});

LOAD("jsLoader = new JSLoader('/H/js/');");



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


HDefaultApplicationInterval=20;
HSystemTickerInterval=10;
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
             ']) {HSystem.apps['+_appId+']._startIdle();}',10);
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
    this._tickTimeout = setTimeout('HSystem.ticker();',HSystemTickerInterval);
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
    
    if(this.freeAppIds.length > 1024){
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
  },
  
  views: [],
  _freeViewIds: [],
  addView: function(_view){
    var _newId;
    if(this._freeViewIds.length==0){
      _newId = this.views.length;
      this.views.push(_view);
    }
    else {
      _newId = this._freeViewIds.pop();
      this.views[_newId] = _view;
    }
    return _newId;
  },
  delView: function(_viewId){
    this.views[_viewId] = null;
    this._freeViewIds.push(_viewId);
  },
  
  activeWindowId: 0,
  windowFocus: function(_view){
    var _activeWindowId = this.activeWindowId,
        _views = this.views,
        _viewId = _view.viewId;
    if(_activeWindowId != 0){
      _views[_activeWindowId].windowBlur();
    }
    this.activeWindowId=_viewId;
    _view.bringToFront();
    _view.windowFocus();
  }
  
});

// Starts the ticking:
LOAD('HSystem.ticker();');
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
  componentBehaviour: ['app'],
/** constructor: constructor
  *
  * Parameter (optional):
  *  _refreshInterval - An integer value (in ms) used for <onIdle> polling events.
  **/
  constructor: function(_refreshInterval){
    this.type = '[HApplication]';
    
    // storage for views
    this.views = [];
    
    // storage for dom element id's in view, not utilized in HApplication by default
    this.markupElemIds = [];
    
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
  buildParents: function(_viewId){
    var _view = HSystem.views[_viewId];
    _view.parent = this;
    _view.parents = [];
    for(var _parentNum = 0; _parentNum < this.parents.length; _parentNum++) {
      _view.parents.push(this.parents[_parentNum]);
    }
    _view.parents.push(this);
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
  *  _view - Usually *this* inside <HView>-derivate components.
  *
  * Returns:
  *  The parent view specific view id.
  *
  * See also:
  *  <HView.addView> <removeView> <destroyView> <die>
  **/
  addView: function(_view) {

    var _viewId = HSystem.addView(_view);
    this.views.push(_viewId);
    
    this.buildParents(_viewId);
    this.viewsZOrder.push(_viewId);
    
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
    HSystem.views[_viewId].remove();
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
    HSystem.views[_viewId].die();
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
    var i, _viewId;
    for (i = 0; i < this.views.length; i++) {
      _viewId = this.views[i];
      HSystem.views[_viewId].die();
    }
  },
  
  
  // calls the idle method of each view
  _pollViews: function(){
    var i, _viewId;
    for(i=0;i<this.views.length;i++){
      _viewId = this.views[i];
      HSystem.views[i].onIdle();
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
HDefaultThemeName = 'default';
HNoComponentCSS = [];
HThemeHasIE6GifsInsteadOfPng = [];

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
    this.currentTheme = HDefaultThemeName;
  },
  
  setThemePath: function( _path ){
    this.themePath = _path;
  },
  
  // Error messages, should be refined.
  _errTemplateNotFound: function( _url ) {
    console.log( "ERROR: Template Not Found: '" + _url + "' ");
  },
  _errTemplateFailure: function( _url ) {
    console.log( "ERROR: Template Failure: '" + _url + "' ");
  },
  _errTemplateException: function( _url ) {
    console.log( "ERROR: Template Exception: '" + _url + "' ");
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
    var _themeName      = this._cssEvalParams[0],
        _componentName  = this._cssEvalParams[1],
        _themePath      = this._cssEvalParams[2],
        _pkgName        = this._cssEvalParams[3],
        _urlPrefix      = this._urlPrefix( _themeName, _componentName, _themePath, _pkgName );
    return this._joinPath( _urlPrefix, 'gfx' );
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
    var _themeName      = this._cssEvalParams[0];
    if((HThemeHasIE6GifsInsteadOfPng.indexOf(_themeName)!=-1) && ELEM._is_ie6){
      return "url('"+this._joinPath( this.getThemeGfxPath(), _fileName.replace('.png','-ie6.gif') )+"')";
    }
    else {
      return "url('"+this._joinPath( this.getThemeGfxPath(), _fileName )+"')";
    }
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
    
    if(ELEM._is_ie) {
      // Internet Explorer (at least 6.x; check what 7.x does)
      _style         = document.createStyleSheet();
      _style.cssText = _cssText;
    }
    
    else {
      // Common, standard <style> tag generation in <head>
      _style        = document.createElement( "style" );
      _style.type   = _contentType;
      _style.media  = "all";
      
      _head = document.getElementsByTagName('head')[0];
      _head.appendChild(_style);
      
      if (navigator.userAgent.indexOf('KHTML') != -1) {
        // Work-around for safari
        var _cssTextElement = document.createTextNode(_cssText);
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
    
    /* Load Component-Specific CSS, unless configured to only load the common css: */
    if(HNoComponentCSS.indexOf(_themeName)==-1){
      //console.log('HNoComponentCSS:',HNoComponentCSS,',  indexOf:',HNoComponentCSS.indexOf(_themeName),',  themeName:',_themeName, ',  componentName:', _componentName, ',  themePath:',_themePath,',  pkgName:',_pkgName);
      if (!this._cssCache[_themeName][_componentName]){
        var _componentCssUrl = this._cssUrl( _themeName, _componentName, _themePath, _pkgName );
        this._cssCache[_themeName][_componentName] = true;
        this.loadCSS( _componentCssUrl );
      }
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
    var _url = this._joinPath( _urlPrefix, 'gfx' );
    return _url;
  },
  _componentGfxFile: function( _themeName, _componentName, _themePath, _pkgName, _fileName ){
    if((HThemeHasIE6GifsInsteadOfPng.indexOf(_themeName)!=-1) && ELEM._is_ie6){
      return this._joinPath( this._componentGfxPath(_themeName, _componentName, _themePath, _pkgName), _fileName.replace('.png','-ie6.gif') );
    }
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
    
    while ( HMarkupView._assignment_match.test(_markup) ) {  
      _markup = _markup.replace( HMarkupView._assignment_match, this.evalMarkupVariable(RegExp.$1,true) );
    }
    while ( HMarkupView._variable_match.test(_markup) ) {  
      _markup = _markup.replace( HMarkupView._variable_match, this.evalMarkupVariable(RegExp.$1) );
    }
    
    this.markup = _markup;
  },
  
  evalMarkupVariable: function(_strToEval,_isAssignment){
    try {
      var _ID     = this.elemId.toString(),
          _WIDTH  = this.rect.width,
          _HEIGHT = this.rect.height,
          _result = eval(_strToEval);
      if(_isAssignment){
        return '';
      }
      if(_result===undefined){
        return '';
      }
      else {
        return _result;
      }
    }
    catch(e) {
      return '';
    }
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
      
      var _has_class = ELEM.hasClassName(_elementId, _cssClass);
      
      if (_setOn) {
        if (!_has_class) {
          ELEM.addClassName(_elementId, _cssClass);
        }
      }
      else {
        if (_has_class) {
          ELEM.removeClassName(_elementId, _cssClass);
        }
      }

    }

  }

},{
  _variable_match: new RegExp(/#\{([^\}]*)\}/),
  _assignment_match: new RegExp(/\$\{([^\}]*)\}/)
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
  
  // Uses absolute positioning by default
  isAbsolute: true,
  
  // flags, sets positioning mode
  flexRight:  false,
  flexLeft:   true,
  flexTop:    true,
  flexBottom: false,
  
  // ints, positioning mode offsets
  flexRightOffset:  0,
  //rect.left: flexLeftOffset:   0,
  //rect.top:  flexTopOffset:    0,
  flexBottomOffset: 0,
  
  // Component behaviour tells other classes what to expect of the component's api and visual behaviour.
  componentBehaviour: ['view'],
  
/** constructor: constructor
  *
  * Constructs the logic part of a <HView>.
  * The view still needs to be drawn on screen. To do that, call <draw> after
  * subcomponents of the view are initialized.
  *
  * Parameters:
  *  _rect - An instance of <HRect>, defines the position and size of views.
  *  _parent - Another <HView> -compatible instance, like <HApplication>, <HControl> and derived component classes.
  *
  * See also:
  *  <HApplication.addView> <draw> <drawRect> <refresh> <setRect> <drawMarkup> <HControl.draw>
  **/
  constructor: function(_rect, _parent) {
    // Moved these to the top to ensure safe themeing operation
    if(this.theme===undefined){
      this.theme = HThemeManager.currentTheme;
      this.preserveTheme = false;
    }
    else {
      this.preserveTheme = true;
    }
    
    
    // Used for smart template elements (resizing)
    
    this.optimizeWidthOnRefresh = true;
    
    // adds the parentClass as a "super" object
    this.parent = _parent;
    
    this.viewId = this.parent.addView(this);
    // the parent addView method adds this.parents
    
    this.appId = this.parent.appId;
    this.app = HSystem.apps[this.appId];
    
    // subview-ids, index of HView-derived objects that are found in HSystem.views[viewId]
    this.views = [];
    
    // Subviews in Z order.
    this.viewsZOrder = [];
    
    // Keep the view (and its subviews) hidden until its drawn.
    this._createElement();
    
    // Set the geometry
    this.setRect(_rect);
    this.isHidden = true;
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
      this.show();
    }
  },
  
  setFlexRight: function(_flag,_px){
    if(_flag===undefined){_flag=true;}
    this.flexRight = _flag;
    if(_px===undefined){_px=0;}
    this.flexRightOffset = _px;
  },
  setFlexLeft: function(_flag,_px){
    if(_flag===undefined){_flag=true;}
    this.flexLeft = _flag;
    if(_px!==undefined){
      this.rect.setLeft(_px);
    }
  },
  setFlexTop: function(_flag,_px){
    if(_flag===undefined){_flag=true;}
    this.flexTop = _flag;
    if(_px!==undefined){
      this.rect.setTop(_px);
    }
  },
  setFlexBottom: function(_flag,_px){
    if(_flag===undefined){_flag=true;}
    this.flexBottom = _flag;
    if(_px===undefined){_px=0;}
    this.flexBottomOffset = _px;
  },
  setAbsolute: function(_flag){
    if(_flag===undefined){_flag=true;}
    this.isAbsolute = _flag;
  },
  setRelative: function(_flag){
    if(_flag===undefined){_flag=true;}
    this.isAbsolute = (!_flag);
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
  
  // provided solely for component extendability:
  _makeElem: function(_parentElemId){
    this.elemId = ELEM.make(_parentElemId,'div');
  },
  // provided solely for component extendability:
  _setCSS: function(_additional){
      var _cssStyle = 'display:none;overflow:hidden;visibility:hidden;';
      if(this.isAbsolute){
        _cssStyle += 'position:absolute;';
      } else {
        _cssStyle += 'position:relative;';
      }
      _cssStyle += _additional;
      ELEM.setCSS(this.elemId,_cssStyle);
  },
  
  _getParentElemId: function(){
    var _parentElemId;
    // if the parent does not have an element:
    if(this.parent.elemId === undefined) {
      _parentElemId = 0;
    }
    // if a subview element is defined in the template, use it:
    else if(this.parent.markupElemIds&&this.parent.markupElemIds['subview']){
      _parentElemId = this.parent.markupElemIds['subview'];
    }
    // otherwise, use main elemId
    else {
      _parentElemId = this.parent.elemId;
    }
    return _parentElemId;
  },
  
  // create the dom element
  _createElement: function() {
    if(!this.elemId) {
      
      this._makeElem(this._getParentElemId());
      this._setCSS('');
      
      // Theme name == CSS class name
      if(this.preserveTheme){
        ELEM.addClassName( this.elemId, this.theme );
      }
      else {
        ELEM.addClassName( this.elemId, HThemeManager.currentTheme );
      }
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
    
    this.drawn = true;
    
    var _elemId = this.elemId;
    var _rect = this.rect;
    
    ELEM.setStyle( _elemId, 'left', this.flexLeft?(_rect.left+'px'):'auto', true);
    ELEM.setStyle( _elemId, 'top', this.flexTop?(_rect.top+'px'):'auto', true);
    ELEM.setStyle( _elemId, 'right', this.flexRight?(this.flexRightOffset+'px'):'auto', true);
    ELEM.setStyle( _elemId, 'bottom', this.flexBottom?(this.flexBottomOffset+'px'):'auto', true);
    ELEM.setStyle( _elemId, 'width', (this.flexLeft&&this.flexRight)?'auto':(_rect.width+'px'), true);
    ELEM.setStyle( _elemId, 'height', (this.flexTop&&this.flexBottom)?'auto':(_rect.height+'px'), true);
    
    if(this.flexLeft&&this.flexRight){
      ELEM.setStyle( _elemId, 'min-width', _rect.width+'px', true);
    }
    if(this.flexTop&&this.flexBottom){
      ELEM.setStyle( _elemId, 'min-height', _rect.height+'px', true);
    }
    
    // Show the rectangle once it gets created, unless visibility was set to
    // hidden in the constructor.
    if(undefined === this.isHidden || this.isHidden == false) {
      ELEM.setStyle( _elemId, 'visibility', 'inherit', true);
    }
    
    ELEM.setStyle( _elemId, 'display', 'block', true);
    
    this._updateZIndex();
    
    if (this._cachedLeft != _rect.left || this._cachedTop != _rect.top) {
      this.invalidatePositionCache();
      this._cachedLeft = _rect.left;
      this._cachedTop = _rect.top;
    }
    
    // right, bottom, opacity and png-transparency
    /*
    if (ELEM._is_ie6 && !this.ie_resizefixadded) {
      iefix._traverseTree(ELEM.get(this.elemId));
      this.ie_resizefixadded = true;
      HSystem.fix_ie = true;
    }
    */
  },
  
  /**
    * These methods update the z-index property of the actual element(s).
    * _updateZIndex updates this object only and it is used when the object is
    * initially drawn. _updateZIndexAllSiblings updates this object and all its
    * siblings. This is useful when modifying this object's z-order affects
    * other elements too.
    */
  _updateZIndex: function() {
    ELEM.setStyle(this.elemId, 'z-index',this.parent.viewsZOrder.indexOf(this.viewId));
  },
  _updateZIndexAllSiblings: function() {
    var _views = this.parent.viewsZOrder;
    for (var i = 0; i < _views.length; i++) {
      ELEM.setStyle(HSystem.views[_views[i]].elemId, 'z-index', i);
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
    ELEM.setStyle(this.elemId, 'display', 'none', true);
    
    this._loadMarkup();
    
    this.bindMarkupVariables();
    ELEM.setHTML(this.elemId, this.markup);
    
    this.markupElemIds = {};
    var _predefinedPartNames = ['bg', 'label', 'state', 'control', 'value', 'subview'], i=0;
    for(; i < _predefinedPartNames.length; i++ ) {
      var _partName = _predefinedPartNames[ i ],
          _elemName = _partName + this.elemId,
          _htmlIdMatch = ' id="' + _elemName + '"';
      if( this.markup.indexOf( _htmlIdMatch ) != -1 ) {
        this.markupElemIds[ _partName ] = this.bindDomElement( _elemName );
      }
    }
    
    ELEM.setStyle(this.elemId, 'display', 'block', true);
    
    // right, bottom, opacity and png-transparency
    /*
    if (ELEM._is_ie6 && !this.ie_htmlresizefixadded) {
      iefix._traverseTree(ELEM.get(this.elemId));
      this.ie_htmlresizefixadded = true;
      HSystem.fix_ie = true;
    }
    */
  },
  
/** method: setHTML
  *
  * Replaces the contents of the view's DOM element with custom html.
  *
  * Parameters:
  *  _html - The HTML (string-formatted) to replace the content with.
  **/
  setHTML: function( _html ) {
    ELEM.setHTML( this.elemId, _html );
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
    if(this.drawn) {
      // this.drawn is checked here so the rectangle doesn't get drawn by the
      // constructor when setRect() is initially called.
      this.drawRect();
    }
    if(this.optimizeWidthOnRefresh) {
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
    ELEM.setStyle(this.elemId, _name, _value, _cacheOverride);
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
    return ELEM.getStyle(this.elemId, _name);
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
    ELEM.setStyle(this.markupElemIds[_partName], _name, _value, _cacheOverride);
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
    ELEM.getStyle(this.markupElemIds[_partName], _name);
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
      
      var _viewZIdx = this.parent.viewsZOrder.indexOf(this.viewId),
          _viewPIdx = this.parent.views.indexOf(this.viewId);
      
      this.parent.views.splice(_viewPIdx,1);
      HSystem.delView(this.viewId);
      
      // Drop the z-order from the parent's array
      this.parent.viewsZOrder.splice( _viewZIdx, 1 );
      
      // Make sure the z-order array stays solid.
      this._updateZIndexAllSiblings();
      
      // Since were not in the parent's array anymore, we don't need a reference
      // to that object.
      this.parent  = null;
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
      HSystem.views[this.views[i]].die();
    }
    
    // Remove this object's bindings, except the DOM element.
    this.remove();
    
    // Remove the DOM element bindings.
    for (var i = 0; i < this._domElementBindings.length; i++) {
      ELEM.del(this._domElementBindings[i]);
    }
    this._domElementBindings = [];
    
    // Remove the DOM object itself
    ELEM.del(this.elemId);
    
    this.elemId = null;
    this.drawn = false;
    
    delete this.rect;
    
  },
  
  // Idle poller (recursive)
  onIdle: function() {
    for(var i = 0; i < this.views.length; i++) {
      HSystem.views[this.views[i]].onIdle();
    }
  },
  
/** method: buildParents
  *
  * Used by addView to build a parents array of parent classes.
  *
  **/
  buildParents: function(_viewId){
    var _view = HSystem.views[_viewId];
    _view.parent = this;
    _view.parents = [];
    for(var _parentNum = 0; _parentNum < this.parents.length; _parentNum++) {
      _view.parents.push(this.parents[_parentNum]);
    }
    _view.parents.push(this);
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
  *  _view - Usually *this* inside <HView>-derivate components.
  *
  * Returns:
  *  The view id.
  *
  * See also:
  *  <HApplication.addView> <remove> <die>
  **/
  addView: function(_view) {
    var _viewId = HSystem.addView(_view);
    this.views.push(_viewId);
    
    this.buildParents(_viewId);
    this.viewsZOrder.push(_viewId);
    
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
    HSystem.views[_viewId].remove();
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
    HSystem.views[_viewId].die();
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
    this.parent.viewsZOrder.push(this.viewId);
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
    this.parent.viewsZOrder.splice(0, 0, this.viewId); // Hmmm?
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
    return this.parent.viewsZOrder.indexOf(this.viewId);
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
    
    var _stringElem = ELEM.make(_elemId);
    ELEM.setCSS(_stringElem, "visibility:hidden;position:absolute;white-space:nowrap;");
    ELEM.setHTML(_stringElem, _string);
    var _width=0,_height=0;
    if (ELEM._is_ie6 || ELEM._is_ie7 || ELEM._is_opera) {
      _width = parseInt( ELEM.get(_stringElem).offsetWidth, 10 );
      if (arguments[3]) {
        _height = parseInt( ELEM.get(_stringElem).offsetHeight, 10 );
      }
    } else {
      _width = parseInt( ELEM.get(_stringElem).clientWidth, 10 );
      // for some reason, firefox 3 text wrapping rules seem to
      // differ for the same text widths from time to time, so
      // let's add a 1px safety margin for it.
      if(ELEM._is_ff3){
        _width += 1;
      }
      if (arguments[3]) {
        _height = parseInt( ELEM.get(_stringElem).clientHeight, 10 );
      }
    }
    ELEM.del(_stringElem);
    if (arguments[3]) {
      return [_width, _height];
    } else {
      return _width;
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
        _x += ELEM.get(_elem.elemId).offsetLeft;
        _x -= ELEM.get(_elem.elemId).scrollLeft;
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
        _y += ELEM.get(_elem.elemId).offsetTop;
        _y -= ELEM.get(_elem.elemId).scrollTop;
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
    for(var i=0; i<this.views.length; i++) {
      HSystem.views[this.views[i]].invalidatePositionCache();
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
    var _cacheId = ELEM.bindId(_domElementId);
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
      ELEM.del(_elementId);
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
      var _left   = parseInt(this.style('left'), 10),
          _top    = parseInt(this.style('top'), 10),
          _width  = parseInt(this.style('width'), 10),
          _height = parseInt(this.style('height'), 10);
      this.rect.set(_left, _top, _left + _width, _top + _height);
      this.drawRect();
      
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
  *  _parentClass - The parent component of the component. See <HView.constructor>.
  *  _options - (optional) All other parameters. See <HComponentDefaults>.
  *
  **/
  refreshOnValueChange: true,
  refreshOnLabelChange: true,
  constructor: function(_rect, _parentClass, _options) {
    
    // Use empty options if none supplied. Change this within components.
    if(!_options) {
      _options = {};
    }
    
    // Construct and extend the options object on the fly.
    var options = new (HComponentDefaults.extend(_options));
    this.options = options;
    
    // HView.constructor:
    if(this.isinherited) {
      this.base(_rect, _parentClass);
    }
    else {
      this.isinherited = true;
      this.base(_rect, _parentClass);
      this.isinherited = false;
    }
    
    // Assign these variables from options.
    var _label = options.label;
    this.setLabel(_label);
    
    var _events = options.events;
    this.setEvents(_events);
    
    this.type = '[HControl]';
    
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
    if(options.visible) {
      this.show();
    }
    else {
      this.hide();
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
    EVENT.unreg(this);
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
    this.options.label = _label;
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
  *  <events> <HEventManager.register> <HEventManager.unreg>
  *
  **/
  setEnabled: function(_flag) {
    
    // Enable/disable the children first.
    for (var i = 0; i < this.views.length; i++) {
      HSystem.views[this.views[i]].setEnabled(_flag);
    }
    
    if (this.enabled === _flag) {
      // No change in enabled status, do nothing.
      return;
    }
    
    this.enabled = _flag;
    
    if(_flag) {
      EVENT.reg(this, this.events);
    }
    else {
      EVENT.unreg(this);
    }
    
    // Toggle the CSS class: enabled/disabled
    this.toggleCSSClass(this.elemId, HControl.CSS_ENABLED, this.enabled);
    this.toggleCSSClass(this.elemId, HControl.CSS_DISABLED, !this.enabled);
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
    if(_value === undefined){return;}
    if(!this.valueObj){return;}
    if(_value !== this.value) {
      this.value = _value;
      this.valueObj.set(this.value);
      this.refresh();
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
  
  refreshValue: function(){
    if(this.markupElemIds){
      if(this.markupElemIds.value){
        ELEM.setHTML(this.markupElemIds.value,this.value);
      }
    }
  },
  refreshLabel: function(){
    if(this.markupElemIds){
      if(this.markupElemIds.label){
        ELEM.setHTML(this.markupElemIds.label,this.label);
      }
    }
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
  *  mouseMove - flag, start listening to global mousemove events
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
        mouseMove:  false,
        mouseDown:  false,
        mouseUp:    false,
        draggable:  false,
        droppable:  false,
        keyDown:    false,
        keyUp:      false,
        mouseWheel: false,
        textEnter:  false
      });
      this.events = new _eventsClass;
    }
    if(_events) {
      this.events.extend( _events );
    }
    this.events.ctrl = this;
    EVENT.focusOptions[this.elemId] = this.events;
    var _mmoveStatus = this.events.mouseMove;
    var _mmoveIndex  = EVENT.coordListeners.indexOf(this.elemId);
    if (_mmoveStatus && (_mmoveIndex==-1)){
      EVENT.coordListeners.push(this.elemId);
    } else if ((!_mmoveStatus) && (_mmoveIndex!=-1)){
      EVENT.coordListeners.splice(_mmoveIndex,1);
    }
    //if(this.events.textEnter){
    //  EVENT.
    //}
    
    /// The following boolean must be set:
    this.isDragged = false;
  },

/** method: setMouseMove
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
  setMouseMove: function(_flag) {
    this.events.mouseMove = _flag;
    this.setEvents();
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
  
  
  setTextEnter: function(_flag) {
    this.events.textEnter = _flag;
    this.setEvents();
  },
  textEnter: function() {
    
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
      this.toggleCSSClass(this.elemId, HControl.CSS_ACTIVE, true);
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
      this.toggleCSSClass(this.elemId, HControl.CSS_ACTIVE, false);
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
  mouseMove: function(_x, _y) {
   /* Example:
    this.hasMouseDown = true;
    this.mouseDownCoords  = new HPoint(_x,_y);
   */
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
    while(_that && _that.ctrl === undefined) {
      _that = _that.parentNode;
    }
    if (!_that) {
      return;
    }
    var _this = _that.ctrl;

    EVENT.focus(_this);
    Event.stop(e);
  },
  
  /***** DON'T TOUCH _mouseOut, IT IS A LOW-LEVEL HANDLER, use blur() instead *****/
  _mouseOut: function(e) {
    if (!Event.element) {
      return;
    }
    var _that = Event.element(e);
    while(_that && _that.ctrl === undefined) {
      _that = _that.parentNode;
    }
    if (!_that) {
      return;
    }
    var _this = _that.owner;
    
    EVENT.blur(_this);
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
    EVENT.coordCacheFlush(this.elemId);
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
  visible:  true,
  
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

HDynControl = HControl.extend({
  componentName: 'dyncontrol',
  componentBehaviour: ['view','control','window'],
  constructor: function( _rect, _parentClass, _options ){
    if(!_options) {
      _options={};
    }
    var _defaults = HClass.extend({
      minSize:   [24,54],
      maxSize:   [16000,9000],
      resizeW:   1,
      resizeE:   1,
      resizeN:   1,
      resizeS:   1,
      resizeNW:  [ 1, 1 ],
      resizeNE:  [ 1, 1 ],
      resizeSW:  [ 1, 1 ],
      resizeSE:  [ 1, 1 ],
      noResize:  false
    });
    _options = new (_defaults.extend(_options))();
    if(_options.noResize){
      _options.minSize = [_rect.width,_rect.height];
      _options.maxSize = [_rect.width,_rect.height];
      _options.resizeW = 0;
      resizeE = 0;
      resizeN = 0;
      resizeS = 0;
      resizeNW = [0,0];
      resizeNE = [0,0];
      resizeSW = [0,0];
      resizeSE = [0,0];
    }
    if(this.isinherited) {
      this.base(_rect, _parentClass, _options);
    }
    else {
      this.isinherited = true;
      this.base(_rect, _parentClass, _options);
      this.isinherited = false;
    }
    this.presrveTheme = true;
    this.setDraggable(true);
    this.type = "[HDynControl]";
    this._initActionFns();
    this._initActionFlag();
    if(!this.isinherited) {
      this.draw();
    }
  },
  drawRect: function(_leftChange,_topChange){
    if(this.rect.width <this.options.minSize[0]){
      var _dw=0-(this.options.minSize[0]-this.rect.width);
      this.rect.setWidth( this.options.minSize[0]);
      if(_leftChange){
        this.rect.offsetBy( _dw, 0 );
      }
    }
    else if(this.rect.width >this.options.maxSize[0]){
      var _dw=0-(this.options.maxSize[0]-this.rect.width);
      this.rect.setWidth( this.options.maxSize[0]);
      if(_leftChange){
        this.rect.offsetBy( _dw, 0 );
      }
    }
    if(this.rect.height<this.options.minSize[1]){
      var _dh=0-(this.options.minSize[1]-this.rect.height);
      this.rect.setHeight(this.options.minSize[1]);
      if(_topChange){
        this.rect.offsetBy( 0, _dh );
      }
    }
    else if(this.rect.height>this.options.maxSize[1]){
      var _dh=0-(this.options.maxSize[1]-this.rect.height);
      this.rect.setHeight(this.options.maxSize[1]);
      if(_topChange){
        this.rect.offsetBy( 0, _dh );
      }
    }
    this.base();
  },
  draw: function(){
    var _isDrawn = _this.drawn;
    this.base();
    this.drawRect();
    if(!_isDrawn){
      this.drawMarkup();
      this.buildStructure();
    }
  },
  buildStructure: function(){
    
  },
  _diffPoint: function(_x,_y){
    return this._prevPoint.subtract(_x,_y);
  },
  
  dynResizeNW: function(_this,_x,_y){
    var _dp = _this._diffPoint(_x,_y);
    _this.rect.setLeftTop(_this.rect.leftTop.subtract(_dp));
    _this.drawRect(1,1);
    _this._prevPoint.set(_x,_y);
  },
  dynResizeNE: function(_this,_x,_y){
    var _dp = _this._diffPoint(_x,_y);
    _this.rect.setRightTop(_this.rect.rightTop.subtract(_dp));
    _this.drawRect(0,1);
    _this._prevPoint.set(_x,_y);
  },
  dynResizeSW: function(_this,_x,_y){
    var _dp = _this._diffPoint(_x,_y);
    _this.rect.setLeftBottom(_this.rect.leftBottom.subtract(_dp));
    _this.drawRect(1,0);
    _this._prevPoint.set(_x,_y);
  },
  dynResizeSE: function(_this,_x,_y){
    var _dp = _this._diffPoint(_x,_y);
    _this.rect.setRightBottom(_this.rect.rightBottom.subtract(_dp));
    _this.drawRect(0,0);
    _this._prevPoint.set(_x,_y);
  },
  dynResizeW: function(_this,_x,_y){
    var _dp = _this._diffPoint(_x,_y);
    _this.rect.setLeft(_this.rect.left-_dp.x);
    _this.drawRect(1,0);
    _this._prevPoint.set(_x,_y);
  },
  dynResizeE: function(_this,_x,_y){
    var _dp = _this._diffPoint(_x,_y);
    _this.rect.setRight(_this.rect.right-_dp.x);
    _this.drawRect(0,0);
    _this._prevPoint.set(_x,_y);
  },
  dynResizeN: function(_this,_x,_y){
    var _dp = _this._diffPoint(_x,_y);
    _this.rect.setTop(_this.rect.top-_dp.y);
    _this.drawRect(0,1);
    _this._prevPoint.set(_x,_y);
  },
  dynResizeS: function(_this,_x,_y){
    var _dp = _this._diffPoint(_x,_y);
    _this.rect.setBottom(_this.rect.bottom-_dp.y);
    _this.drawRect(0,0);
    _this._prevPoint.set(_x,_y);
  },
  dynDrag: function(_this,_x,_y){
    var _dp = _this._diffPoint(_x,_y);
    _this.rect.offsetTo(_this.rect.leftTop.subtract(_dp));
    _this.drawRect(1,1);
    _this._prevPoint.set(_x,_y);
  },
  _initActionFns: function(){
    this._actionFns = [];
    var i, _this = this,
    _resizeNW=0,_resizeNE=1,_resizeSW=2,_resizeSE=3,
    _resizeW =4, _resizeE=5, _resizeN=6, _resizeS=7, _drag=8,
    _actionFns=this._actionFns;
    _actionFns[_resizeNW] = _this.dynResizeNW;
    _actionFns[_resizeNE] = _this.dynResizeNE;
    _actionFns[_resizeSW] = _this.dynResizeSW;
    _actionFns[_resizeSE] = _this.dynResizeSE;
    
    _actionFns[_resizeW] = _this.dynResizeW;
    _actionFns[_resizeE] = _this.dynResizeE;
    _actionFns[_resizeN] = _this.dynResizeN;
    _actionFns[_resizeS] = _this.dynResizeS;
    
    _actionFns[_drag] = _this.dynDrag;
  },
  _initActionFlag: function(){
    this._actionFlag = -1;
    this._actionRects = [];
    var i,_rr,
    _opts=this.options, _rect=this.rect,
    _rectRules = [
      // corners:
      [0,0,_opts.resizeNW[0],_opts.resizeNW[1]], // NW
      [_rect.width-_opts.resizeNE[0],0,_rect.width,_opts.resizeNE[1]], // NE
      [0,_rect.height-_opts.resizeSW[1],_opts.resizeSW[0],_rect.height], // SW
      [_rect.width-_opts.resizeSE[0],_rect.height-_opts.resizeSE[1],_rect.width,_rect.height], // SE
      // borders:
      [0,_opts.resizeN,_opts.resizeW,_rect.height-_opts.resizeS], // W
      [_rect.width-_opts.resizeE,_opts.resizeN,_rect.width,_rect.height-_opts.resizeS], // E
      [_opts.resizeW,0,_rect.width-_opts.resizeE,_opts.resizeN], // N
      [_opts.resizeW,_rect.height-_opts.resizeS,_rect.width-_opts.resizeE,_rect.height], // S
      // drag-area:
      [_opts.resizeW,_opts.resizeN,_rect.width-_opts.resizeE,_rect.height-_opts.resizeS]
    ];
    for(i=0;i!=9;i++){
      _rr = _rectRules[i];
      this._actionRects.push( new HRect(_rr[0],_rr[1],_rr[2],_rr[3]) );
    }
  },
  _detectActionFlag: function(){
    var i,
    _actionPoint = this._startPoint.subtract(this.rect.left,this.rect.top),
    _actionRects = this._actionRects;
    for(i=0;i!=9;i++){
      if(_actionRects[i].contains(_actionPoint)){
        this._actionFlag=i;
        return;
      }
    }
  },
  startDrag: function(_x,_y,_isLeft){
    this._startPoint = new HPoint(_x,_y);
    this._prevPoint  = new HPoint(_x,_y);
    this._startRect  = new HRect( this.rect );
    this._detectActionFlag();
    if(this._actionFlag==8){
      this.setStyle('cursor','move');
    }
    this.bringToFront();
    this.doDrag(_x,_y,_isLeft);
  },
  doDrag: function(_x,_y,_isLeft){
    if(this._actionFlag!=-1){
      this._actionFns[this._actionFlag](this,_x,_y);
    }
  },
  endDrag: function(_x,_y,_isLeft){
    this.doDrag(_x,_y,_isLeft);
    if(this._actionFlag==8){
      this.setStyle('cursor','default');
    }
    this._initActionFlag();
  }
});
