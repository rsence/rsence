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
