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
