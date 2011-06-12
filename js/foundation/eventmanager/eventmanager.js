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
    textEnter: false,
    doubleClick: false,
    contextMenu: false
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
  status: [false, false, -1, -1, [], false, false, false, false, false],
  
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
    _this.hoverInterval = 200;
    // 50 means send hover events at most with 50ms intervals
    _this.hoverTimer = new Date().getTime();
    // Time since last hover event triggered
  },
  
/** Starts event listening.
  **/
  start: function() {
    var _globalEventTargetElement = (BROWSER_TYPE.ie && !BROWSER_TYPE.ie9)?document:window,
        _this = EVENT;
        // _eventMap = [
    Event.observe( _globalEventTargetElement, 'mousemove', _this.mouseMove );
    Event.observe( _globalEventTargetElement, 'mouseup', _this.mouseUp );
    Event.observe( _globalEventTargetElement, 'mousedown', _this.mouseDown );
    Event.observe( _globalEventTargetElement, 'click', _this.click );
    Event.observe( _globalEventTargetElement, 'keyup', _this.keyUp );
    Event.observe( _globalEventTargetElement, 'keydown', _this.keyDown );
    // IE and WebKit browsers don't need keyPress for repeat
    if( !BROWSER_TYPE.safari && !BROWSER_TYPE.ie){
      Event.observe( _globalEventTargetElement, 'keypress', _this.keyPress );
    }
    Event.observe( _globalEventTargetElement, 'contextmenu', _this.contextMenu );
    Event.observe( _globalEventTargetElement, 'resize', _this.resize );
    Event.observe( _globalEventTargetElement, 'mousewheel', _this.mouseWheel );
    Event.observe( _globalEventTargetElement, 'dblclick', _this.doubleClick );
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
    var
    // Binds the class to the element (so it can be called on the event)
    _elemId = _ctrl.elemId,
    _elem = ELEM.get(_elemId),
    _this = EVENT,
    _propIn,
    _init = ( _this.listeners[_elemId] === undefined ||  _this.listeners[_elemId] === false );
    if (BROWSER_TYPE.ie && !BROWSER_TYPE.ie9) {
      _elem.setAttribute('ctrl', _ctrl);
    }
    else {
      _elem.ctrl = _ctrl;
    }
    if(_init){
      _this.listeners[_elemId] = true;
      _this.focused[_elemId] = false;
    }
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
    if(_init){
      Event.observe(_elem, 'mouseover', _this._mouseOver);
    }
    if(_ctrl.drawn){
      _this._updateHoverItems();
      (_this.hovered.length !== 0) && (_this.hovered.indexOf(_ctrl.elemId) === _this.hovered.length-1) && _this.focus(_ctrl);
    }
  },
  
/** Unregisters the  _ctrl object event listeners
  **/
  unreg: function(_ctrl) {
    var
    _this = EVENT,
    _elemId,
    _elem;
    if (_ctrl === this.activeControl) {
      _this.changeActiveControl(null);
    }
    _elemId = _ctrl.elemId;
    if (_this.focused[_elemId]){
      _this.blur(_ctrl);
    }
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
      Event.stopObserving(_elem, 'mouseout', _this._mouseOut);
    }
  },

/** Receiver of the onResize event.
  * Delegates calls to the high-level event receivers of all
  * controls registered for the event.
  **/
  resize: function(e) {
    var
    i = 0,
    _this = EVENT,
    _ctrlID,
    _ctrl;
    HSystem._updateFlexibleRects();
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
    HSystem._updateFlexibleRects();
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
              if (
                // First time
                !_this.topmostDroppable ||
                // Z beaten
                _dropCtrl.zIndex() > _this.topmostDroppable.zIndex() ||
                // subview
                _dropCtrl.parent === _this.topmostDroppable
              ) {
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
        _rect,
        _pos,
        _size,
        _coords,
        _hovered = [];
    for (; i !== _this.listeners.length; i++) {
      if (!_this.listeners[i] || !_this.focusOptions[i].ctrl) {
        continue;
      }
      _ctrl = _this.focusOptions[i].ctrl;
      if(_ctrl.drawn){
        if(ELEM.getStyle(i,'visibility',true) === 'hidden'){
          continue;
        }
        _elem = ELEM.get(i);
        if (!_this._coordCacheFlag || !_this._coordCache[i]) {
          _rect = _ctrl.rect;
          _pos = [_ctrl.pageX(),_ctrl.pageY()];
          _size = [_rect.width,_rect.height];
          _this._coordCache[i] = [_pos[0], _pos[1], _size[0], _size[1]];
        }
        _coords = _this._coordCache[i];
      
        // Is the mouse pointer inside the element's rectangle?
        if (x >= _coords[0] && x <= _coords[0] + _coords[2] && y >= _coords[1] && y <= _coords[1] + _coords[3]) {
          _hovered.push(i);
        }
      }
    }
    _this.hovered = _hovered;
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
    var
    _this = EVENT,
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
        if (_this.focusOptions[i].mouseDown === true) {
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
    if (_this.enableDroppableChecks) {
      // console.log('stopEvent:',_stopEvent,', hoverlen:',(_this.hovered.length !== 0),', newActive:',_newActiveControl);
      if ( (_mouseDownElementIds.length !== 0) && (_stopEvent === 0) && (_this.hovered.length !== 0) && _newActiveControl) {
        Event.stop(e);
      }
    }
    // else {
    //   console.log('not enableDroppableChecks');
    // }
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
    if (BROWSER_TYPE.ie && !BROWSER_TYPE.ie9) {
      _isLeftButton = true; // IE only supports click on left button
    }
    // Prevent right-click event from triggering click.
    // Only firefox seems to fire the click-event with the
    // right mouse button, so this prevents it from happening
    // in the name of uniform behavior.
    if(!_isLeftButton){
      return true;
    }
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
    if( _stopEvent === 0 ){
      Event.stop(e);
    }
    return true;
  },
  
  focusTrace: false,
  prevActiveCtrl: null,
  
/** Changes active ctrl.
  * The previous active ctrl gets the _lostActiveStatus pseudo-event,
  * The new active ctrl gets the _gainedActiveStatus pseudo-event
  **/
  changeActiveControl: function(_ctrl) {
    var
    _this = EVENT,
    // Store the currently active control so we can inform it,
    // if it's no longer the active control.
    _prevActiveCtrl = _this.activeControl;
    // Did the active control change?
    if (_ctrl && (_ctrl !== _prevActiveCtrl) && (_ctrl._gainedActiveStatus || _prevActiveCtrl._lostActiveStatus)) {
      if (_prevActiveCtrl && _prevActiveCtrl._lostActiveStatus) {
        // Previously active control just lost the active status.
        _prevActiveCtrl.active = false;
        _prevActiveCtrl._lostActiveStatus(_ctrl);
        if(_this.focusTrace){
          _prevActiveCtrl.setStyle('border','2px solid green');
          _this.prevActiveCtrl && _this.prevActiveCtrl.setStyle('border','2px solid blue');
        }
        _this.prevActiveCtrl = _prevActiveCtrl;
      }
      if (_ctrl && _ctrl._gainedActiveStatus) {
        // A new control gained the active status.
        _ctrl.active = true;
        _this.activeControl = _ctrl;
        _ctrl._gainedActiveStatus(_prevActiveCtrl);
        if(_this.focusTrace){
          _ctrl.setStyle('border','2px solid red');
        }
      }
      else {
        _this.activeControl = null;
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
    var
    _this = EVENT,
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
      _ctrl.endDrag(x, y, _isLeftButton);
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
    for (i = 0; i < _this.focused.length; i++) {
      if (_this.focused[i] === true) {
        _ctrl = _this.focusOptions[i].ctrl;
        if (_this.focusOptions[i].mouseUp === true) {
          if( _ctrl.mouseUp(x, y, _isLeftButton) ){
            // Event.stop(e);
          }
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

/** Mid-level double-click manager.
  * Gets called on the onDoubleClick event.
  * Delegates the following call to the high-level event receivers of all
  * enabled controls registered, depending on the events they registered:
  * - doubleClick
  *
  **/
  doubleClick: function(e) {
    var _this = EVENT,
        x = _this.status[_this.crsrX],
        y = _this.status[_this.crsrY],
        _elemId,
        _ctrl,
        i = 0;
    _this._modifiers(e);
    // Check for doubleClick listeners.
    for (i = 0; i !== _this.focused.length; i++) {
      if (_this.focused[i] === true) {
        if (_this.focusOptions[i].doubleClick === true) {
          _this.focusOptions[i].ctrl.doubleClick(x, y, true);
        }
      }
    }
    return true;
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
    if (BROWSER_TYPE.opera || BROWSER_TYPE.safari || BROWSER_TYPE.ie) {
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
  
/** Mid-level context menu manager.
  * Gets called on the onContextMenu event.
  * Delegates the following call to the high-level event receivers of all
  * enabled controls registered, depending on the events they registered:
  * - contextMenu
  *
  * Just make a component return true to allow the browser's default action.
  *
  **/
  contextMenu: function(e) {
    var _this = EVENT,
        x = _this.status[_this.crsrX],
        y = _this.status[_this.crsrY],
        _preventDefault = true,
        _elemId,
        _ctrl,
        i = 0;
    _this._modifiers(e);
    // Check for contextMenu listeners.
    for (i = 0; i !== _this.focused.length; i++) {
      if (_this.focused[i] === true) {
        if (_this.focusOptions[i].contextMenu === true) {
          if( _this.focusOptions[i].ctrl.contextMenu() ){
            _preventDefault = false;
          }
        }
      }
    }
    if( _preventDefault ){
      Event.stop( e );
    }
    return true;
  },


/** Mid-level key press manager.
  * Gets called on the onKeyDown event.
  * Delegates keyDown calls to the high-level event receivers of all
  * controls registered for that event.
  **/
  keyDown: function(e) {
    var
    _this = EVENT,
    _keyCode = _this.translateKeyCodes(e.keyCode),
    _keyDownStateForActiveControl = _this.activeControl?(_this.focusOptions[_this.activeControl.elemId]?_this.focusOptions[_this.activeControl.elemId].keyDown:false):false,
    _repeat = (_keyDownStateForActiveControl === 'repeat'),
    _stopEvent = false;
    _this._modifiers(e);
    _this._lastKeyPressTime = new Date().getTime();
    if(!_this.status[_this.cmdKeyDown] && _this._detectCmdKey(_keyCode)){
      _this.status[_this.cmdKeyDown] = true;
    }
    if (_this.activeControl && _keyDownStateForActiveControl) {
      if ((_this._lastKeyDown !== _keyCode) || _repeat) {
        if(_this.activeControl.keyDown(_keyCode)){
          _stopEvent = true;
        }
      }
    }
    // Insert key to the realtime array, remove in keyUp
    if (_this.status[_this.keysDown].indexOf(_keyCode) === -1) {
      _this.status[_this.keysDown].push(_keyCode);
    }
    if (!_this.status[_this.cmdKeyDown] && _stopEvent){
      Event.stop(e);
    }
    _this._lastKeyDown = _keyCode;
  },


/** Mid-level key release manager.
  * Gets called on the onKeyUp event.
  * Delegates keyUp calls to the high-level event receivers of all
  * controls registered for that event.
  * Also delegates the textEnter calls to all controls
  * registered for that event.
  **/
  keyUp: function(e) {
    var
    _this = EVENT,
    _keyCode = _this.translateKeyCodes(e.keyCode),
    _keyCodeIndex,
    i = 0,
    _stopEvent = false,
    _ctrlId,
    _ctrl;
    _this._modifiers(e);
    _this._lastKeyDown = null;
    if (_this.activeControl && _this.activeControl.elemId && _this.focusOptions[_this.activeControl.elemId].keyUp === true) {
      if(_this.activeControl.keyUp(_keyCode)){
        _stopEvent = true;
      }
    }
    for (; i < _this.textEnterCtrls.length; i++) {
      _ctrlId = _this.textEnterCtrls[i];
      _ctrl = HSystem.views[_ctrlId];
      if (_ctrl.textEnter) {
        if(_ctrl.textEnter()){
          _stopEvent = true;
        }
      }
    }
    if (!_this.status[_this.cmdKeyDown] && _stopEvent){
      Event.stop(e);
    }
    if(_this.status[_this.cmdKeyDown] && _this._detectCmdKey(_keyCode)){
      _this.status[_this.cmdKeyDown] = false;
    }
    // Remove the key from the realtime array, inserted in keyDown
    _keyCodeIndex = _this.status[_this.keysDown].indexOf(_keyCode);
    if (_keyCodeIndex !== -1) {
      _this.status[_this.keysDown].splice(_keyCodeIndex, 1);
    }
  },

  /* The keyPress itself is ignored per se and used only as a repetition event for the last keyDown. */
  keyPress: function(e) {
    var
    _this = EVENT,
    _timeNow = new Date().getTime();
    _this._modifiers(e);
    // Prevent non-repeat behaviour by waiting at least 100ms before repeating
    if(_this._lastKeyPressTime > (_timeNow-100)){
      return;
    }
    if(_this._lastKeyDown !== null){
      var
      _keyCode = _this.translateKeyCodes(_this._lastKeyDown),
      _keyDownStateForActiveControl = _this.activeControl?(_this.focusOptions[_this.activeControl.elemId]?_this.focusOptions[_this.activeControl.elemId].keyDown:false):false,
      _repeat = (_keyDownStateForActiveControl === 'repeat'),
      _stopEvent = false;
      if (_this.activeControl && _keyDownStateForActiveControl && _repeat) {
        if(_this.activeControl.keyDown(_keyCode)){
          _stopEvent = true;
        }
      }
      if(_stopEvent){
        Event.stop(e);
      }
    }
  },
  
  
  // Normalization map of keyCodes for Opera specifically
  _operaKeyCodeTranslations: {
    
    // Symbol keys:
    59: 186, // [;:]
    61: 187, // [=+]
    44: 188, // [,<]
    45: 189, // [-_]
    46: 190, // [.>]
    47: 191, // [/?]
    96: 192, // [`~]
    91: 219, // [[{]
    92: 220, // [\|]
    93: 221, // []}]
    39: 222, // ['"]
    
    // Numeric keypad keys can't be mapped on Opera, because Opera 
    // doesn't differentiate between the keys on the numeric keypad
    // versus the functionally same keys elsewhere on the keyboard.
    
    // Branded keys:
    // Apple Command keys are same as ctrl, but ctrl is 0; Can't be re-mapped reliably.
    // The Windows Menu key also return 0, so it can't be re-mapped either.
    219: 91, // Left Windows key (Start)
    220: 92  // Right Windows key (Start)
  },
  
  // Normalization map of keyCodes for Gecko (Mozilla) browsers specifically
  _mozillaKeyCodeTranslations: {
    
    // Symbol keys:
    59: 186, // [;:]
    61: 187, // [=+]
    109: 189, // [-_]
    
    // Branded keys:
    224: 91 // Apple Command key to left windows key mapping
    
  },
  
/** Translates keyCodes to the normalized pseudo-ascii used by IE and WebKit browsers.
  * Opera and Mozilla browsers use different codes, so they'll need translations.
  **/
  translateKeyCodes: function(_keyCode){
    var
    _this = EVENT,
    _transCode;
    
    // We use the WebKit and IE browsers as the normalization base, because
    // there is no variance between in these. Returns the keyCode as-is for
    // browsers in this category.
    if(BROWSER_TYPE.safari || BROWSER_TYPE.ie){
      return _keyCode;
    }
    // Opera has its own keyCodes, which are different from all others.
    else if(BROWSER_TYPE.opera){
      _transCode = _this._operaKeyCodeTranslations[_keyCode];
    }
    // The assumption is that the other browsers do what mozille does.
    else {
      _transCode = _this._mozillaKeyCodeTranslations[_keyCode];
    }
    if(_transCode === undefined || _transCode === null){
      return _keyCode;
    }
    // else {
    //   console.log('key map from:',_keyCode,' to:',_transCode);
    // }
    return _transCode;
  },
  
  _cmdKeys: [
    17,  // Ctrl
    91,  // Others (Left Start Key or Left Command Key)
    92,  // Others (Right Start Key)
    93   // Others (Menu Key or Right Command Key)
  ],
  _detectCmdKey: function( _keyCode ) {
    
    // On Opera, return true on any of the keycodes
    if(BROWSER_TYPE.opera){
      return (EVENT._cmdKeys.indexOf(_keyCode) !== -1);
    }
    // Any mac browser (except opera, above) uses left or right windows key
    // equivalent as the Command key.
    else if(BROWSER_TYPE.mac){
      return ((_keyCode === 91) || (_keyCode === 93));
    }
    // Other platforms use CTRL as the command key.
    else {
      return (_keyCode === 17);
    }
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

