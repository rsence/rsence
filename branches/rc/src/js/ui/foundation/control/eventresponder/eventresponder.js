/**
  * Riassence Core -- http://rsence.org/
  *
  * Copyright (C) 2008 Juha-Jarmo Heinonen <jjh@riassence.com>
  * Copyright (C) 2006 Helmi Technologies Inc.
  *
  * This file is part of Riassence Core.
  *
  * Riassence Core is free software: you can redistribute it and/or modify
  * it under the terms of the GNU General Public License as published by
  * the Free Software Foundation, either version 3 of the License, or
  * (at your option) any later version.
  *
  * Riassence Core is distributed in the hope that it will be useful,
  * but WITHOUT ANY WARRANTY; without even the implied warranty of
  * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  * GNU General Public License for more details.
  *
  * You should have received a copy of the GNU General Public License
  * along with this program.  If not, see <http://www.gnu.org/licenses/>.
  *
  **/
HEventResponder = HClass.extend({
  
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
        textEnter:  false,
        click:      false
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
  *  <setEvents> <HEventManager>
  **/
  setMouseMove: function(_flag) {
    this.events.mouseMove = _flag;
    this.setEvents();
  },

/** method: setClickable
  *
  * Alternative flag setter for the <click> event type. If set to true, 
  * starts listening to <click> events when the component has <focus>.
  *
  * Parameters:
  *  _flag - Set the <click> event listening on/off (true/false) for
  *          the component instance.
  *
  * See also:
  *  <setEvents> <HEventManager>
  **/
  setClickable: function(_flag) {
    this.events.click = _flag;
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
    
    if ( (HWindowFocusBehaviour === 1) && ( this.parents.length > 2 ) ) {
      if ( this.parents[2].componentBehaviour.indexOf('window') !== -1 ) {
        this.parents[2].gainedActiveStatus();
      }
    }
    
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
  
});