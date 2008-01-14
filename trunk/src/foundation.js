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


