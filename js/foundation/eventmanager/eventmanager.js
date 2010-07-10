/*   RSence
 *   Copyright 2007 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

/*** = Description
  ** Mid-level event abstraction manager.
  **
  ** This engine serves the HControl classes, so usually the existence of it
  ** is not obvious. The main interface to use it is the methods in HControl.
***/
var//RSence.Foundation
EVENT = {
  
  // Default options for focus (all false)
  _defaultFocusOptions: {
    mouseMove: false,
    mouseDown: false,
    click: false,
    mouseUp: false,
    draggable: false,
    droppable: false,
    keyDown: false,
    keyUp: false,
    mouseWheel: false,
    resize: false,
    textEnter: false
  },
  
/** = Description
  * Array that keeps the last known global event status type.
  *
  * The format is an array with an index per "interesting" event value.
  *
  * = Indexes
  * +EVENT.status[ EVENT.button1 ]+::  The state of the left mouse button.
  *                                    false when not pressed
  *                                    true when pressed.
  *
  * +EVENT.status[ EVENT.button2 ]+::  The state of the right mouse button.
  *                                    false when not pressed
  *                                    true when pressed.
  *
  * +EVENT.status[ EVENT.crsrX ]+::    The x-coordinate of the mouse cursor.
  *
  * +EVENT.status[ EVENT.crsrY ]+::    The y-coordinate of the mouse cursor.
  *
  * +EVENT.status[ EVENT.keysDown ]+:: A list of keycodes of all the keys
  *                                    currently held down in the order of
  *                                    occurrence (first pressed comes first,
  *                                    last pressed last).
  *
  * +EVENT.status[ EVENT.altKeyDown ]+::    The boolean status of the Alt
  *                                         modifier key being held down.
  *
  * +EVENT.status[ EVENT.ctrlKeyDown ]+::   The boolean status of the Ctrl
  *                                         modifier key being held down.
  *
  * +EVENT.status[ EVENT.shiftKeyDown ]+::  The boolean status of the Shift
  *                                         modifier key being held down.
  *
  * +EVENT.status[ EVENT.metaKeyDown ]+::    The boolean status of the Meta
  *                                          modifier key being held down.
  *
  * +EVENT.status[ EVENT.cmdKeyDown ]+::     The boolean status of any of the system-specific
  *                                          Command, Menu or Start modifier keys being held down.
  *
  **/
  status: [false, false, 0, 0, [], false, false, false, false, false],
  
/** The index in the status array for the left mouse button.
  **/
  button1: 0,

/** The index in the status array for the right mouse button.
  **/
  button2: 1,

/** The index in the status array for the mouse cursor x coordinate.
  **/
  crsrX: 2,

/** The index in the status array for the mouse cursor y coordinate.
  **/
  crsrY: 3,
  
/** The index in the status array for the list of keycodes of all the
  * keys currently held down in the order of occurrence (first pressed
  * comes first, last pressed last).
  *
  **/
  keysDown: 4,

/** The index in the status array for the state of the Alt modifier key.
  **/
  altKeyDown: 5,

/** The index in the status array for the state of the Ctrl modifier key.
  **/
  ctrlKeyDown: 6,

/** The index in the status array for the state of the Shift modifier key.
  **/
  shiftKeyDown: 7,

/** The index in the status array for the state of the Meta modifier key.
  **/
  metaKeyDown: 8,

/** The index in the status array for the state of the Command modifier key.
  **/
  cmdKeyDown: 9,
  
/** A flag to disable, if your applications don't need drop events.
  * Setting this to false when not needed improves overall performance,
  * because the drop events need constant calculation of the mouse cursor
  * location against all possible drop targets.
  *
  **/
  enableDroppableChecks: true,
  
/** Initializes the members used by the drop -related events.
  * This method is called from within EVENT and is never called,
  * if enableDroppableChecks is false.
  **/
  startDroppable: function() {
    var _this = EVENT;
    _this.hovered = [];
    // items currently under the mouse cursor
    _this.hoverInterval = 50;
    // 50 means send hover events at most with 50ms intervals
    _this.hoverTimer = new Date().getTime();
    // Time since last hover event triggered
  },
  
/** Starts event listening.
  **/
  start: function() {
    var _globalEventTargetElement = BROWSER_TYPE.ie?document:window,
        _this = EVENT;
        // _eventMap = [
    Event.observe( _globalEventTargetElement, 'mousemove', _this.mouseMove );
    Event.observe( _globalEventTargetElement, 'mouseup', _this.mouseUp );
    Event.observe( _globalEventTargetElement, 'mousedown', _this.mouseDown );
    Event.observe( _globalEventTargetElement, 'click', _this.click );
    Event.observe( _globalEventTargetElement, 'keyup', _this.keyUp );
    Event.observe( _globalEventTargetElement, 'keydown', _this.keyDown );
    Event.observe( _globalEventTargetElement, 'keypress', _this.keyPress );
    Event.observe( _globalEventTargetElement, 'contextmenu', _this.contextMenu );
    Event.observe( _globalEventTargetElement, 'resize', _this.resize );
    Event.observe( _globalEventTargetElement, 'mousewheel', _this.mouseWheel );
        // ],
        // i = 0;
    // for (; i !== _eventMap.length; i++) {
    // Event.observe(_globalEventTargetElement, _eventMap[i][0], _eventMap[i][1]);
    // }
    if (window.addEventListener) {
      window.addEventListener('DOMMouseScroll', EVENT.mouseWheel, false);
      window.addEventListener('resize', EVENT.resize, false);
    }
    //window.onmousewheel=document.onmousewheel=EVENT.mouseWheel;
    _this.listeners = [];
    // keep elemId buffer of all listeners
    _this.focused = [];
    // keep elemId buffer of all focused listeners
    _this.resizeListeners = [];
    // list of resize-event listeners
    _this.coordListeners = [];
    // global mouse movement listeners
    _this.focusOptions = {};
    // keep property lists by elemId
    _this.dragItems = [];
    // elemId of currently dragged items
    if (_this.enableDroppableChecks) {
      _this.startDroppable();
    }

    _this.topmostDroppable = null;
    // the currently hovered element accepting droppable items
    _this.textEnterCtrls = [];
    // ID of controls with textfields
    // position caching benefits performance, see coordCacheFlush
    _this._coordCache = [];
    _this._coordCacheFlag = true;
    _this._lastCoordFlushTimeout = null;

    _this.activeControl = null;
    // control that currently has the focus
    _this._lastKeyDown = null;
    // the most recent keypress
  },
  
/** Flushes the position cache by elemId, if no elemId is specified,
  * everything is flushed.
  **/
  coordCacheFlush: function(_elemId) {
    if (_elemId) {
      EVENT._coordCache[_elemId] = null;
    }
    else {
      EVENT._coordCache = [];
    }
  },
  
/** Registers the _ctrl object by event listener flags in _focusOptions.
  **/
  reg: function(_ctrl, _focusOptions) {
    var _elemId,
        _elem,
        _this = EVENT,
        _propIn;
    // Binds the class to the element (so it can be called on the event)
    _elemId = _ctrl.elemId;
    _elem = ELEM.get(_elemId);
    if (BROWSER_TYPE.ie) {
      _elem.setAttribute('ctrl', _ctrl);
    }
    else {
      _elem.ctrl = _ctrl;
    }
    _this.listeners[_elemId] = true;
    _this.focused[_elemId] = false;
    for (_propIn in _this._defaultFocusOptions) {
      if (_focusOptions[_propIn] === undefined) {
        _focusOptions[_propIn] = _defaultFocusOptions[_propIn];
      }
    }
    _this.focusOptions[_elemId] = _focusOptions;
    var _coordListenIdx = _this.coordListeners.indexOf(_elemId);
    if (_focusOptions.mouseMove) {
      if (_coordListenIdx === -1) {
        _this.coordListeners.push(_elemId);
      }
    }
    else if (_coordListenIdx !== -1) {
      _this.coordListeners.splice(_coordListenIdx, 1);
    }
    //console.log('focusOptions:',_focusOptions);
    //console.log('focusOptions.textEnter: ',_focusOptions.textEnter);
    if (_focusOptions.textEnter) {
      if (_this.textEnterCtrls.indexOf(_ctrl.viewId) === -1) {
        _this.textEnterCtrls.push(_ctrl.viewId);
      }
    }
    else {
      var _textEnterIndex = _this.textEnterCtrls.indexOf(_ctrl.viewId);
      if (_textEnterIndex !== -1) {
        _this.textEnterCtrls.splice(_textEnterIndex,1);
      }
    }
    if (_focusOptions.resize) {
      if (_this.resizeListeners.indexOf(_ctrl.viewId) === -1) {
        _this.resizeListeners.push(_ctrl.viewId);
      }
    }
    else {
      var _resizeIndex = _this.resizeListeners.indexOf(_ctrl.viewId);
      if (_resizeIndex !== -1) {
        _this.resizeListeners.splice(_resizeIndex,1);
      }
    }
    Event.observe(_elem, 'mouseover', _this._mouseOver);
  },
  
/** Unregisters the  _ctrl object event listeners
  **/
  unreg: function(_ctrl) {
    var _this = EVENT,
        _elemId,
        _elem;
    if (_ctrl === this.activeControl) {
      _this.changeActiveControl(null);
    }
    _elemId = _ctrl.elemId;
    _elem = ELEM.get(_elemId);
    
    _this._coordCache[_elemId] = null;
    
    _this.listeners[_elemId] = false;
    _this.focused[_elemId] = false;
    _this.focusOptions[_elemId] = { ctrl: _ctrl };
    var _coordListenIdx = _this.coordListeners.indexOf(_elemId);
    if (_coordListenIdx !== -1) {
      _this.coordListeners.splice(_coordListenIdx, 1);
    }
    
    var _textEnterIndex = _this.textEnterCtrls.indexOf(_ctrl.viewId);
    if (_textEnterIndex !== -1) {
      _this.textEnterCtrls.splice(_textEnterIndex, 1);
    }
    var _resizeIndex = _this.resizeListeners.indexOf(_ctrl.viewId);
    if (_resizeIndex !== -1) {
      _this.resizeListeners.splice(_resizeIndex, 1);
    }
    if (_elem !== undefined) {
      Event.stopObserving(_elem, 'mouseover', _this._mouseOver);
    }
  },

/** Receiver of the onResize event.
  * Delegates calls to the high-level event receivers of all
  * controls registered for the event.
  **/
  resize: function(e) {
    var i = 0,
        _this = EVENT,
        _ctrlID,
        _ctrl;
    for (; i < _this.resizeListeners.length; i++) {
      _ctrlID = _this.resizeListeners[i];
      _ctrl = HSystem.views[_ctrlID];
      if (_ctrl['resize']) {
        _ctrl.resize();
      }
      if (_ctrl['onResize']) {
        _ctrl.onResize();
      }
    }
  },

  /* Element-specific mouse over/out event receiver. */
  _mouseOver: function(e) {
    if (!Event.element) {
      return;
    }
    var _that = Event.element(e);
    while (_that && _that.ctrl === undefined) {
      _that = _that.parentNode;
    }
    if (!_that) {
      return;
    }
    var _this = _that.ctrl;
    EVENT.focus(_this);
    Event.stop(e);
  },

  /* Element-specific mouse over/out event receiver. */
  _mouseOut: function(e) {
    if (!Event.element) {
      return;
    }
    var _that = Event.element(e);
    while (_that && _that.ctrl === undefined) {
      _that = _that.parentNode;
    }
    if (!_that) {
      return;
    }
    var _this = _that.ctrl;
    EVENT.blur(_this);
    Event.stop(e);
  },

/** Mid-level focus manager.
  * Gets called on the onMouseOver event.
  * Starts listening for onMouseOut to blur.
  * Delegates focus calls to the high-level event receivers of all
  * enabled controls registered.
  **/
  focus: function(_ctrl) {
    var _this = EVENT,
        _elemId = _ctrl.elemId,
        _elem = ELEM.get(_elemId);
    if (_this.focused[_elemId] === false ){ // && _this.dragItems.indexOf(_elemId) === -1) {
      Event.stopObserving(_elem, 'mouseover', _this._mouseOver);
      Event.observe(_elem, 'mouseout', _this._mouseOut);
      _this.focused[_elemId] = true;
      if (_ctrl['focus']) {
        _ctrl.focus();
      }
    }
  },
  
/** Mid-level blur (focus lost) manager.
  * Gets called on the onMouseOut event.
  * Starts listening for onMouseOver to (re)focus.
  * Delegates blur calls to the high-level event receivers of all
  * enabled controls registered.
  **/
  blur: function(_ctrl) {
    var _this = EVENT,
        _elemId = _ctrl.elemId,
        _elem = ELEM.get(_elemId);
    if (_this.focused[_elemId] === true ){ // && _this.dragItems.indexOf(_elemId) === -1) {
      Event.stopObserving(_elem, 'mouseout', _this._mouseOut);
      Event.observe(_elem, 'mouseover', _this._mouseOver);
      _this.focused[_elemId] = false;
      if (_ctrl['blur']) {
        _ctrl.blur();
      }
    }
  },

/** Mid-level mouse movement manager.
  * Gets called on the onMouseMove event.
  * Delegates the following calls to the high-level event receivers of all
  * enabled controls registered, depending on the events they registered:
  * - drag
  * - mouseMove
  * - endHover
  * - startHover
  *
  **/
  mouseMove: function(e) {
    var _this = EVENT,
        x = Event.pointerX(e),
        y = Event.pointerY(e),
        _currentlyDragging = _this.flushMouseMove(x, y);
    _this.status[_this.crsrX] = x;
    _this.status[_this.crsrY] = y;
    _this._modifiers(e);
    // might work
    if (_currentlyDragging) {
      Event.stop(e);
    }
    // Only prevent default action when we are dragging something.
  },
  
/** Processes dragging calculations, triggered by mouseMove.
  **/
  flushMouseMove: function(x, y) {
    var _this = EVENT,
        _currentlyDragging = false,
        i = 0,
        j,
        _elemId,
        _ctrl;
    
    clearTimeout(_this._lastCoordFlushTimeout);
    
    // send drag event to all drag-interested ctrls
    for (; i !== _this.dragItems.length; i++) {
      _elemId = _this.dragItems[i];
      _this.focusOptions[_elemId].ctrl.drag(x, y);
      _this.coordCacheFlush(_elemId);
      _currentlyDragging = true;
    }

    if (_this.enableDroppableChecks) {
      // Check which items are under the mouse coordinates now.
      if (new Date().getTime() > _this.hoverTimer + _this.hoverInterval) {
        // sends mouseMove pseudo-events to ctrls interested
        for (i = 0; i !== _this.coordListeners.length; i++) {
          _elemId = _this.coordListeners[i];
          _ctrl = _this.focusOptions[_elemId].ctrl;
          _ctrl.mouseMove(x, y);
        }
        if (_this.enableDroppableChecks) {
          _this._updateHoverItems();
        }
        // sends drag&drop pseudo-events
        var _wasTopmostDroppable;
        for (i = 0; i !== _this.dragItems.length; i++) {
          // Find the current droppable while dragging.
          _wasTopmostDroppable = _this.topmostDroppable;
          _this.topmostDroppable = null;
          _elemId = _this.dragItems[i];
          _ctrl = _this.focusOptions[_elemId].ctrl;

          // Check for a drop target from the currently hovered items
          var _hoverIndex,
          _dropCtrl;
          for (j = 0; j !== _this.hovered.length; j++) {
            _hoverIndex = _this.hovered[j];
            if (_hoverIndex !== _elemId && _this.focusOptions[_hoverIndex].ctrl) {
              _dropCtrl = _this.focusOptions[_hoverIndex].ctrl;
              if (!_this.topmostDroppable ||
              // First time
              _dropCtrl.zIndex() > _this.topmostDroppable.zIndex() ||
              // Z beaten
              _dropCtrl.supr === _this.topmostDroppable) {
                // subview
                if (_this.focusOptions[_dropCtrl.elemId].droppable) {
                  _this.topmostDroppable = _dropCtrl;
                  // Finally, the item must accept drop events.
                }
              }
            }
          }

          // Topmost item has changed, send startHover or endHover to the droppable.
          if (_wasTopmostDroppable !== _this.topmostDroppable) {
            if (_wasTopmostDroppable) {
              _wasTopmostDroppable.endHover(_ctrl);
            }
            if (_this.topmostDroppable) {
              _this.topmostDroppable.startHover(_ctrl);
            }
          }
        }
        _this.hoverTimer = new Date().getTime();
      }
      else {
        _this._lastCoordFlushTimeout = setTimeout(
          function(){
            EVENT.flushMouseMove(x,y);
          }, _this.hoverInterval
        );
      }
    }
    return _currentlyDragging;
  },

  // Loops through all registered items and store indices of elements
  // that are currenly under the mouse cursor in .hovered array. Uses
  // cached position and dimensions value when possible.
  _updateHoverItems: function() {
    var _this = EVENT,
        x = _this.status[_this.crsrX],
        y = _this.status[_this.crsrY],
        i = 0,
        _ctrl,
        _elem,
        _pos,
        _size,
        _coords;
    _this.hovered = [];
    for (; i !== _this.listeners.length; i++) {
      if (!_this.listeners[i] || !_this.focusOptions[i].ctrl) {
        continue;
      }
      _ctrl = _this.focusOptions[i].ctrl;
      _elem = ELEM.get(i);
      if (!_this._coordCacheFlag || !_this._coordCache[i]) {
        _pos = ELEM.getVisiblePosition(_ctrl.elemId);
        // [x,y]
        _size = ELEM.getVisibleSize(_ctrl.elemId);
        // [w,h]
        _this._coordCache[i] = [_pos[0], _pos[1], _size[0], _size[1]];
      }
      _coords = _this._coordCache[i];
      
      // Is the mouse pointer inside the element's rectangle?
      if (x >= _coords[0] && x <= _coords[0] + _coords[2] && y >= _coords[1] && y <= _coords[1] + _coords[3]) {
        _this.hovered.push(i);
      }
    }
  },

/** = Description
  * Starts dragging the control given.
  *
  * Call this method to start dragging another component.
  *
  * = Parameters
  * +_ctrl+::   An object that uses the HControl API, becomes new drag target.
  *
  **/
  startDragging: function(_ctrl, _isLeftButton) {
    var _this = EVENT;
    _this.dragItems = [_ctrl.elemId];
    _this.focus(_ctrl);
    _this.changeActiveControl(_ctrl);
    _ctrl.startDrag( _this.status[_this.crsrX], _this.status[_this.crsrY], _isLeftButton );
  },

/** Mid-level mouse button press manager.
  * Gets called on the onMouseDown event.
  * Delegates the following calls to the high-level event receivers of all
  * enabled controls registered, depending on the events they registered:
  * - mouseDown
  * - startDrag
  *
  **/
  mouseDown: function(e, _isLeftButton) {
    var _this = EVENT,
        _didStartDrag = false,
        x = _this.status[_this.crsrX],
        y = _this.status[_this.crsrY],
        i = 0,
        
        // Unset the active control when clicking on anything.
        _newActiveControl = null,
        
        // The startDrag and mouseDown event receivers are first collected into
        // these arrays and the events are sent after the active control status has
        // been changed.
        _startDragElementIds = [],
        _mouseDownElementIds = [];
    
    _this._modifiers(e);
    if (_isLeftButton === undefined) {
      _isLeftButton = Event.isLeftClick(e);
    }
    if (_isLeftButton) {
      _this.status[_this.button1] = true;
    }
    else {
      _this.status[_this.button2] = true;
    }
    
    for (; i !== _this.focused.length; i++) {
      if (_this.focused[i] === true) {
        // Set the active control to the currently focused item.
        if (_this.focusOptions[i].ctrl.enabled) {
          _newActiveControl = _this.focusOptions[i].ctrl;
        }
        if ((_this.focusOptions[i].draggable === true) && _this.dragItems.indexOf(i) === -1) {
          _startDragElementIds.push(i);
        }
        else if (_this.focusOptions[i].mouseDown === true) {
          _mouseDownElementIds.push(i);
        }
      }
    }
    // Handle the active control selection.
    if (_newActiveControl) {
      _this.changeActiveControl(_newActiveControl);
    }
    // Call the mouseDown and startDrag events after the active control change has been handled.
    for (i = 0; i !== _startDragElementIds.length; i++) {
      _this.dragItems.push(_startDragElementIds[i]);
      _this.focusOptions[_startDragElementIds[i]].ctrl.startDrag(x, y, _isLeftButton);
      _didStartDrag = true;
    }

    var _stopEvent = _mouseDownElementIds.length;
    for (i = 0; i !== _mouseDownElementIds.length; i++) {
      if (_this.focusOptions[_mouseDownElementIds[i]].ctrl.mouseDown(x, y, _isLeftButton)) {
        _stopEvent--;
      }
    }
    if (_didStartDrag) {
      // Remove possible selections.
      document.body.focus();
      // Prevent text selection in MSIE when dragging starts.
      _this._storedOnSelectStart = document.onselectstart;
      document.onselectstart = function() {
        return false;
      };
      Event.stop(e);
    }
    // Stop the event only when we are hovering over some control, allows normal DOM events to co-exist.
    if (this.enableDroppableChecks) {
      if ((_stopEvent === 0) && (_this.hovered.length !== 0) && _newActiveControl) {
        Event.stop(e);
      }
    }
    return true;
  },

/** Mid-level mouse click manager.
  * Gets called on the onClick event.
  * Delegates click calls to the high-level event receivers of all
  * controls registered for that event.
  *
  **/
  click: function(e, _isLeftButton) {
    var _this = EVENT,
        x = _this.status[_this.crsrX],
        y = _this.status[_this.crsrY],
        i = 0,
        // Unset the active control when clicking on anything.
        _newActiveControl = null,
        // The startDrag and mouseDown event receivers are first collected into
        // these arrays and the events are sent after the active control status has
        // been changed.
        _clickElementIds = [];
    _this._modifiers(e);
    if (_isLeftButton === undefined) {
      _isLeftButton = Event.isLeftClick(e);
    }
    if (BROWSER_TYPE.ie) {
      _isLeftButton = true; // IE only supports click on left button
    }
    // Prevent right-click event from triggering click.
    // Only firefox seems to fire the click-event with the
    // right mouse button, so this prevents it from happening
    // in the name of uniform behavior.
    if(!_isLeftButton){
      return true;
    }
    _this.status[_this.button1] = true;
    for (; i !== _this.focused.length; i++) {
      if (_this.focused[i] === true) {
        // Set the active control to the currently focused item.
        if (_this.focusOptions[i].ctrl.enabled) {
          _newActiveControl = _this.focusOptions[i].ctrl;
        }
        if (_this.focusOptions[i].click === true) {
          _clickElementIds.push(i);
        }
      }
    }
    // Handle the active control selection.
    if (_newActiveControl) {
      _this.changeActiveControl(_newActiveControl);
    }
    var _stopEvent = _clickElementIds.length;
    for (i = 0; i !== _clickElementIds.length; i++) {
      if (_this.focusOptions[_clickElementIds[i]].ctrl.click(x, y, _isLeftButton)) {
        _stopEvent--;
      }
    }
    // Stop the event only when we are hovering over some control, allows normal DOM events to co-exist.
    if (_this.enableDroppableChecks) {
      if ((_stopEvent === 0) && (_this.hovered.length !== 0) && _newActiveControl) {
        Event.stop(e);
      }
    }
    //if(_this.hovered.length!==0){Event.stop(e);}
    _this.status[_this.button1] = false;
    return true;
  },

/** Changes active ctrl.
  * The previous active ctrl gets the _lostActiveStatus pseudo-event,
  * The new active ctrl gets the _gainedActiveStatus pseudo-event
  **/
  changeActiveControl: function(_ctrl) {
    //console.log('EVENT.changeActiveControl: ',_ctrl);
    var _this = EVENT,
        // Store the currently active control so we can inform it, if it no longer is the active control.
        _prevActiveCtrl = _this.activeControl;
    // Did the active control change?
    if (_ctrl !== _prevActiveCtrl) {
      if (_prevActiveCtrl) {
        // Previously active control just lost the active status.
        _prevActiveCtrl.active = false;
        _prevActiveCtrl._lostActiveStatus(_ctrl);
      }
      _this.activeControl = null;
      if (_ctrl) {
        // A new control gained the active status.
        _ctrl.active = true;
        _this.activeControl = _ctrl;
        _ctrl._gainedActiveStatus(_prevActiveCtrl);
      }
    }
  },


/** Mid-level mouse button release manager.
  * Gets called on the onMouseUp event.
  * Delegates the following calls to the high-level event receivers of all
  * enabled controls registered, depending on the events they registered:
  * - mouseUp
  * - endHover
  * - drop
  * - endDrag
  *
  **/
  mouseUp: function(e) {
    var _this = EVENT,
        _didEndDrag = false,
        _isLeftButton = Event.isLeftClick(e),
        x = _this.status[_this.crsrX],
        y = _this.status[_this.crsrY],
        _elemId,
        _ctrl,
        i = 0;
    _this._modifiers(e);
    // Send endDrag for the currently dragged items even when they don't have focus, and clear the drag item array.
    for (; i !== _this.dragItems.length; i++) {
      _elemId = _this.dragItems[i];
      _ctrl = _this.focusOptions[_elemId].ctrl;
      _ctrl.endDrag(x, y,_isLeftButton);
      _didEndDrag = true;
      // If the mouse slipped off the dragged item before the mouse button was released, blur the item manually
      if (_this.enableDroppableChecks) {
        _this._updateHoverItems();
        if (_this.hovered.indexOf(_elemId) === -1) {
          _this.blur(_ctrl);
        }
      }
      // If there is a drop target in the currently hovered items, send drop to it.
      if (_this.topmostDroppable) {
        // Droppable found at the release point.
        _this.topmostDroppable.endHover(_ctrl);
        _this.topmostDroppable.drop(_ctrl);
        _this.topmostDroppable = null;
      }
    }
    _this.dragItems = [];
    // Restore MSIE's ability to select text after dragging has ended.
    if (_didEndDrag) {
      document.onselectstart = _this._storedOnSelectStart;
    }
    // Check for mouseUp listeners.
    for (i = 0; i !== _this.focused.length; i++) {
      if (_this.focused[i] === true) {
        if (_this.focusOptions[i].mouseUp === true) {
          _this.focusOptions[i].ctrl.mouseUp(x, y, _isLeftButton);
        }
      }
    }
    if(_isLeftButton){
      _this.status[_this.button1] = false;
    }
    else {
      _this.status[_this.button2] = false;
    }
    return true;
  },


/** Mid-level key press manager.
  * Gets called on the onKeyDown event.
  * Delegates keyDown calls to the high-level event receivers of all
  * controls registered for that event.
  **/
  keyDown: function(e) {
    var _this = EVENT,
        _theKeyCode = e.keyCode;
    _this._modifiers(e);
    if(!_this.status[_this.cmdKeyDown] && _this._detectCmdKey(e.keyCode)){
      _this.status[_this.cmdKeyDown] = true;
    }
    if (_this.activeControl && _this.focusOptions[_this.activeControl.elemId].keyDown === true) {
      Event.stop(e);
      // Workaround for msie rapid fire keydown
      if (_this._lastKeyDown !== _theKeyCode) {
        _this.activeControl.keyDown(_theKeyCode);
      }
    }
    // Insert key to the realtime array, remove in keyUp
    if (_this.status[_this.keysDown].indexOf(_theKeyCode) === -1) {
      _this.status[_this.keysDown].push(_theKeyCode);
    }
    _this._lastKeyDown = _theKeyCode;
  },


/** Mid-level key release manager.
  * Gets called on the onKeyUp event.
  * Delegates keyUp calls to the high-level event receivers of all
  * controls registered for that event.
  * Also delegates the textEnter calls to all controls
  * registered for that event.
  **/
  keyUp: function(e) {
    var _this = EVENT,
        _theKeyCode = e.keyCode,
        _keyCodeIndex,
        i = 0,
        _ctrlId,
        _ctrl;
    _this._modifiers(e);
    _this._lastKeyDown = null;
    if (_this.activeControl && _this.focusOptions[_this.activeControl.elemId].keyUp === true) {
      _this.activeControl.keyUp(_theKeyCode);
    }
    for (; i < _this.textEnterCtrls.length; i++) {
      _ctrlId = _this.textEnterCtrls[i];
      _ctrl = HSystem.views[_ctrlId];
      if (_ctrl.textEnter) {
        _ctrl.textEnter();
      }
    }
    if(_this.status[_this.cmdKeyDown] && _this._detectCmdKey(e.keyCode)){
      _this.status[_this.cmdKeyDown] = false;
    }
    // Remove the key from the realtime array, inserted in keyDown
    _keyCodeIndex = _this.status[_this.keysDown].indexOf(_theKeyCode);
    if (_keyCodeIndex !== -1) {
      _this.status[_this.keysDown].splice(_keyCodeIndex, 1);
    }
  },

  /* Prevents the onKeyPress event (key being hold down; we don't need that event) */
  keyPress: function(e) {
    var _this = EVENT;
    if (_this.activeControl && _this.focusOptions[_this.activeControl.elemId].keyDown === true) {
      Event.stop(e);
    }
  },


/** Mid-level mouse scroll wheel event manager.
  * Delegates mouseWheel calls to the high-level event receivers of all
  * controls registered for that event.
  **/
  mouseWheel: function(e) {
    var _this = EVENT,
        _delta = 0,
        i = 0;
    if (!e) {
      e = window.event;
    }
    if (e.wheelDelta) {
      _delta = 0 - (e.wheelDelta / 120);
    }
    else if (e.detail) {
      _delta = 0 - (e.detail / 3);
    }
    if (BROWSER_TYPE.opera || BROWSER_TYPE.safari) {
      _delta = 0 - _delta;
    }
    for (; i !== _this.focused.length; i++) {
      if (_this.focused[i] === true) {
        if (_this.focusOptions[i].mouseWheel === true) {
          Event.stop(e);
          _this.focusOptions[i].ctrl.mouseWheel(_delta);
        }
      }
    }
  },
  
  /* Alternative right button detection, wrapper for the mouseDown method */
  contextMenu: function(e) {
    // EVENT.mouseDown(e, false);
    Event.stop(e);
    
    /***
    
    IMPLEMENT SEPARATE CONTEXT-MENU EVENT HANDLING HERE
    
    ***/
    
    // if(Event.isLeftClick(e)){
    //   EVENT.status[EVENT.button2] = false;
    // }
  },
  
  _cmdKeys: [
    224, // Mozilla Left or Right Command Key
    219, // Opera Left Windows Key
    220, // Opera Right Windows Key
    0,   // Opera Menu Key or Linux Gecko: any Windows Key
    17,  // Opera
    91,  // Others (Left Start Key or Left Command Key)
    92,  // Others (Right Start Key)
    93   // Others (Menu Key or Right Command Key)
  ],
  _detectCmdKey: function( _keyCode ) {
    return (EVENT._cmdKeys.indexOf(_keyCode) !== -1);
  },
  
  /* Handle the event modifiers. */
  _modifiers: function(e) {
    var _this = EVENT;
    _this.status[_this.altKeyDown] = e.altKey;
    _this.status[_this.ctrlKeyDown] = e.ctrlKey;
    _this.status[_this.shiftKeyDown] = e.shiftKey;
    _this.status[_this.metaKeyDown] = e.metaKey;
  }
  
};

var//RSence.Foundation
EventManager = EVENT;


/** Starts the only instance
  */
LOAD(
  function() {
    EVENT.start();
  }
);

