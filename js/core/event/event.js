/*   RSence
 *   Copyright 2007 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */


/*** = Description
  ** Abstracts the DOM Event differences between browsers.
***/
var//RSence.Core
Event = {
  
/** Returns the element of the event.
  **/
  element: function(e) {
    return e.target || e.srcElement;
  },
  
/** Returns the mouse cursor x -coordinate of the event.
  **/
  pointerX: function(e) {
    return e.pageX || e.clientX + document.documentElement.scrollLeft;
  },

/** Returns the mouse cursor y -coordinate of the event.
  **/
  pointerY: function(e) {
    return e.pageY || e.clientY + document.documentElement.scrollTop;
  },

/** Stops event propagation
  **/
  stop: function(e) {
    if (e.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }
    else {
      e.returnValue = false;
      e.cancelBubble = true;
    }
  },
  
/** Returns true if the left mouse butten was clicked.
  **/
  isLeftClick: function(e) {
    // IE: left 1, middle 4, right 2
    if (BROWSER_TYPE.ie) {
      return (e.button === 1);
    }
    else {
      return (e.button === 0);
    }
  },
  
/** List of event observers
  **/
  observers: false,
  
  /* Implementation of observe */
  _observeAndCache: function(_elem, _name, _function, _useCapture) {
    if (!Event.observers) {
      Event.observers = [];
    }
    if (_elem.addEventListener) {
      this.observers.push([_elem, _name, _function, _useCapture]);
      _elem.addEventListener(_name, _function, _useCapture);
    }
    else if (_elem.attachEvent) {
      this.observers.push([_elem, _name, _function, _useCapture]);
      _elem.attachEvent("on" + _name, _function);
    }
  },
  
/** Flushes the event observer cache.
  **/
  unloadCache: function() {
    if (!Event.observers) {
      return;
    }
    var i,
        l = Event.observers.length;
    for (i = 0; i < l; i++) {
      Event.stopObserving.apply(this, Event.observers[0]);
    }
    Event.observers = false;
  },
  
/** Starts observing the named event of the element and 
  * specifies a callback function.
  **/
  observe: function(_elem, _name, _function, _useCapture) {
    _useCapture = _useCapture || false;
    Event._observeAndCache(_elem, _name, _function, _useCapture);
  },
  
/** Stops observing the named event of the element and
  * removes the callback function.
  **/
  stopObserving: function(_elem, _name, _function, _useCapture) {
    if (_elem === undefined) {
      console.log('Warning Event.stopObserving of event name: "' + _name + '" called with an undefined elem!');
      return;
    }
    _useCapture = _useCapture || false;
    if (_elem['removeEventListener']) {
      _elem.removeEventListener(_name, _function, _useCapture);
    }
    else if (detachEvent) {
      _elem.detachEvent("on" + _name, _function);
    }
    var i = 0;
    while (i < Event.observers.length) {
      var eo = Event.observers[i];
      if (eo && eo[0] === _elem && eo[1] === _name && eo[2] === _function && eo[3] === _useCapture) {
        Event.observers[i] = null;
        Event.observers.splice(i, 1);
      }
      else {
        i++;
      }
    }
  },
  
  // List of ASCII "special characters":
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
  
};

// Activates the garbage collector of Internet Explorer 
// when the document is unloaded:
if (BROWSER_TYPE.ie) {
  Event.observe(window, "unload", Event.unloadCache, false);
}

