/*   Riassence Framework
 *   Copyright 2006 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

/*** = Description
  ** Automatic event responder. Defines what events HControl listens to
  ** and actions to be taken.
  **
  ** = Pre-defined event handler methods, extend in component code.
  ** +focus+               Called when the component gets focus
  ** +blur+                Called when the component loses focus
  ** +mouseDown+           Called when the mouse button is pushed down
  ** +mouseUp+             Called when the mouse button is released
  ** +mouseWheel+          Called when the mouse wheel is used
  ** +startDrag+           Called when the mouse button 
  **                       is pressed (and item is draggable)
  ** +endDrag+             Called when the mouse button 
  **                       is released (and item is draggable)
  ** +doDrag+              Called when the mouse is moved and mouse button 
  **                       is down (and item is draggable)
  ** +onDrop+              Called when a draggable item is released 
  **                       on the droppable
  ** +onHoverStart+        Called when a draggable item is moved 
  **                       over the droppable
  ** +onHoverEnd+          Called when a draggable item is moved out 
  **                       of the droppable
  ** +keyDown+             Called when the user presses a key, and 
  **                       the control is active
  ** +keyUp+               Called when the user releases a key, and 
  **                       the control is active
  ** +gainedActiveStatus+  Called when the component gets activated.
  ** +lostActiveStatus+    Called when the component gets deactivated.
  ***/

HEventResponder = HClass.extend({
  
/** = Description
  * Registers the events defined by boolean properties of 
  * the events object to the control instance. The event manager 
  * handles the event mapping and abstraction itself.
  *
  * NOTE startDrag vs mouseDown and endDrag vs mouseUp events 
  * conflict, if both are set simultaneously.
  *
  * = Parameter
  *  +_events+::  A {key: flag} hash structure, sets events based on the 
  *               keys and the flag.
  *
  * = Pre-Defined event types:
  * +mouseMove+::   flag, start listening to global mousemove events
  * +mouseDown+::   flag, start listening to mousedown events when the 
  *                 component has focus
  * +mouseUp+::     flag, start listening to mouseup events when the 
  *                 component has focus
  * +mouseWheel+::  flag, start listening to mousewheel events when the 
  *                 component has focus
  * +draggable+::   flag, start listening to dragging events when the 
  *                 component has focus
  * +droppable+::   flag, start listening to dropping events when the 
  *                 component has focus
  * +keyDown+::     flag, start listening to keydown events when the 
  *                 component has focus
  * +keyUp+::       flag, start listening to keyup events when the 
  *                 component has focus
  *
  * = Returns
  * +self+
  *
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
    if (_mmoveStatus && (_mmoveIndex===-1)){
      EVENT.coordListeners.push(this.elemId);
    } else if ((!_mmoveStatus) && (_mmoveIndex!==-1)){
      EVENT.coordListeners.splice(_mmoveIndex,1);
    }
    
    /// The following boolean must be set:
    this.isDragged = false;
    
    
    return this;
  },

/** = Description
  * Alternative flag setter for the mouseDown event type. If set to true, 
  * starts listening to mouseDown events when the component has focus.
  *
  * = Parameters
  *  +_flag+:: Set the mouseDown event listening on/off (true/false) for
  *            the component instance.
  *
  **/
  setMouseMove: function(_flag) {
    this.events.mouseMove = _flag;
    this.setEvents();
    return this;
  },

/** = Description
  * Alternative flag setter for the click event type. If set to true, 
  * starts listening to click events when the component has focus.
  *
  * = Parameters
  * +_flag+::  Set the click event listening on/off (true/false) for
  *             the component instance.
  * = Returns
  * +self+
  *
  **/
  setClickable: function(_flag) {
    this.events.click = _flag;
    this.setEvents();
    return this;
  },
  
/** = Description
  * Registers or releases event listening for mouseDown events depending on 
  * the value of the flag argument.
  *
  * = Parameters
  * +_flag+:: Set the mouseDown event listening on/off (true/false) for
  *            the component instance.
  *
  * = Returns
  * +self+
  *
  **/
  setMouseDown: function(_flag) {
    this.events.mouseDown = _flag;
    this.setEvents();
    return this;
  },
  
/** = Description
  * Registers or releases event listening for mouseUp events depending on the 
  * value of the flag argument.
  *
  * = Parameters
  * +_flag+:: Set the mouseUp event listening on/off (true/false) for
  *            the component instance.
  *
  * = Returns
  * +self+
  *
  **/
  setMouseUp: function(_flag) {
    this.events.mouseUp = _flag;
    this.setEvents();
    return this;
  },
  
/** = Description
  * Alternative flag setter for the mouseWheel event type. If set to true, 
  * starts listening to mouseWheel events when the component has focus.
  *
  * = Parameters
  *  +_flag+::  Set the mouseWheel event listening on/off (true/false) for
  *             the component instance.
  *
  * = Returns
  *  +self+
  *
  **/
  setMouseWheel: function(_flag) {
    this.events.mouseWheel = _flag;
    this.setEvents();
    return this;
  },
  
/** = Description
  * Registers or releases event listening for startDrag, doDrag and 
  * endDrag -events depending on the value of the flag argument.
  *
  * = Parameters
  *  +_flag+:: Set the startDrag, doDrag and endDrag event listening 
  *            on/off (true/false) for the component instance.
  *
  * = Returns
  * +self+
  *
  **/
  setDraggable: function(_flag) {
    this.events.draggable = _flag;
    this.setEvents();
    return this;
  },
  
/** = Description
  * Registers or releases event listening for onHoverStart, onDrop and 
  * onHoverEnd -events depending on the value of the flag argument.
  *
  * = Parameters
  *  +_flag+::  Set the onHoverStart, onDrop and onHoverEnd event listening 
  *             on/off (true/false) for the component instance.
  *
  * = Returns
  *  +self+
  *
  **/
  setDroppable: function(_flag) {
    this.events.droppable = _flag;
    this.setEvents();
    return this;
  },
  
  
/** = Description
  * Registers or releases event listening for keyDown events depending on the 
  * value of the flag argument.
  *
  * = Parameters
  *  +_flag+:: Set the keyDown event listening on/off (true/false) for
  *            the component instance.
  *
  * = Returns
  *  +self+
  **/
  setKeyDown: function(_flag) {
    this.events.keyDown = _flag;
    this.setEvents();
    return this;
  },
  
  
/** = Description
  * Registers or releases event listening for keyUp events depending on 
  * the value of the flag argument.
  *
  * = Parameters
  *  +_flag+::  Set the keyUp event listening on/off (true/false) for
  *             the component instance.
  *
  * = Returns
  *  +self+
  *
  **/
  setKeyUp: function(_flag) {
    this.events.keyUp = _flag;
    this.setEvents();
    return this;
  },
  
  /** = Description
    * Registers or releases event listening for textEnter events 
    * depending on the value of the flag argument.
    *
    * = Returns
    * +self+
    *
    **/
  setTextEnter: function(_flag) {
    this.events.textEnter = _flag;
    this.setEvents();
    return this;
  },
  /** Text enter functionality. No functionality as default.
    **/
  textEnter: function() {
    
  },
  
  /** = Description
    * Registers or releases event listening for click events 
    * depending on the value of the flag argument.
    *
    * = Returns
    * +self+
    *
    **/
  setClick: function(_flag) {
    this.events.click = _flag;
    this.setEvents();
    return this;
  },
  
  /** Click functionality
    **/
  click: function(x,y,_isRightButton){},
  
/** = Description
  * Implement/extend the focus method, if you want to do something special when
  * the focus is gained.
  *
  * Called when the component gets focus.
  *
  * = Usage
  *  this.hasFocus = true
  *
  **/
  focus: function() {
    
  },
  
/** = Description
  * Implement/extend the blur method, if you want to do something special when
  * the focus is lost.
  *
  * Called when the component loses focus.
  *
  * = Usage
  *  this.hasFocus = false;
  **/
  blur: function() {
    
  },
  
  
/** = Description
  * Implement/extend this if you want to do something special when the control gets
  * activated.
  *
  * = Parameters
  *  +_lastActiveControl+::  A reference to the control that was active
  *                          before this control became active. Can
  *                          be null if there was no active control.
  *
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
  
  
/** = Description
  * Implement/extend this if you want to do something special when the control loses its
  * active status. No functionality as default.
  *
  * +Parameters+::
  *  +_newActiveControl+:: A reference to the control that became the currently
  *                        active control. Can be null if there is no active
  *                        control.
  *
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
  
  
/** = Description
  * Implement/extend the mouseDown method, if you want to do something special 
  * when the mouse button is pressed down and the component instance has focus.
  * No functionality as default.
  *
  * = Parameters
  *  +_x+::           The horizonal coordinate units (px) of the 
  *                   mouse cursor position.
  *  +_y+::           The vertical coordinate units (px) of the 
  *                   mouse cursor position.
  *  +_leftButton+::  Flag, is false when the right mouse button was pressed.  
  *
  * = Usage:
  *       this.hasMouseDown = true;
  *       this.mouseDownCoords  = new HPoint(_x,_y);
  *
  **/
  mouseMove: function(_x, _y) {
    
  },
  
  
/** = Description
  * Implement/extend the mouseDown method, if you want to do something special 
  * when the mouse button is pressed down and the component instance has focus.
  * No functionality as default.
  *
  * = Parameters
  *  +_x+::           The horizonal coordinate units (px) of the 
  *                   mouse cursor position.
  *  +_y+::           The vertical coordinate units (px) of the 
  *                   mouse cursor position.
  *  +_leftButton+::  Flag, is false when the right mouse button 
  *                   was pressed. *Do not rely on it*
  *
  * = Usage
  *       this.hasMouseDown = true;
  *       this.mouseDownCoords  = new HPoint(_x,_y);
  *
  **/
  mouseDown: function(_x, _y, _leftButton) {
    
  },
  
  
/** = Description
  * Implement/extend the mouseUp method, if you want to do something special 
  * when the mouse button is released and the component instance has focus.
  *
  * This is the preferred method to extend when you want click functionality
  * for a component.
  *
  * = Parameters
  *  +_x+::           The horizonal coordinate units (px) of 
  *                   the mouse cursor position.
  *  +_y+::           The vertical coordinate units (px) of 
  *                   the mouse cursor position.
  *  +_leftButton+::  Flag, is false when the right mouse button 
  *                   was pressed. *Do not rely on it*
  *
  * = Usage
  *      this.hasMouseDown = false;
  *      this.mouseUpCoords  = new HPoint(_x,_y);
  *
  **/
  mouseUp: function(_x, _y, _leftButton) {
    
  },
  
/** = Description
  * Implement/extend the mouseWheel method, if you want to do something special 
  * when the mouse wheel is used and the component instance has focus.
  * Has no functionality as default.
  *
  * = Parameters
  *  +_delta+::  Scrolling delta, the wheel angle change. If delta is positive,
  *              wheel was scrolled up. Otherwise, it was scrolled down.
  *
  * = Usage
  *  if (_delta > 0)
  *    msg = "Moving up!";
  *  else 
  *    msg = "Going down...";
  *
  **/
  mouseWheel: function(_delta) {
    
  },
  
/** = Description
  * Extend the startDrag method, if you want to do something special 
  * when the user starts a dragging event.
  *
  * This is the preferred method to extend if you want <mouseDown> functionality
  * for a draggable component.
  *
  * = Parameters
  *  +x+:: - The horizonal coordinate units (px) of the mouse cursor position.
  *  +y+:: - The vertical coordinate units (px) of the mouse cursor position.
  *
  * = Usage
  *     this.originX = x-parseInt(prop_get(this.elemId,'left'));
  *     this.originY = y-parseInt(prop_get(this.elemId,'top'));
  *
  **/
  startDrag: function(x, y) {
    this.isDragged = true; // must be set to work
    
  },
  
/** = Description
  * Extend the doDrag method, if you want to do something special 
  * when the user is performing a dragging event. Called whenever the 
  * mouse cursor moves.
  *
  * = Parameters
  *  +x+:: The horizonal coordinate units (px) of the mouse cursor position.
  *  +y+:: The vertical coordinate units (px) of the mouse cursor position.
  *
  * = Usage
  *       prop_set(this.elemId,'left',(x-this.originX)+'px');
  *       prop_set(this.elemId,'top',(y-this.originY)+'px');
  *
  **/
  doDrag: function(x, y) {
    
  },
  
/** = Description
  * Extend the endDrag method, if you want to do something special 
  * when the user ends a dragging event.
  *
  * This is the preferred method to extend if you want <mouseUp> functionality
  * for a draggable component.
  *
  * = Parameters
  *  +x+::  The horizonal coordinate units (px) of the mouse cursor position.
  *  +y+::  The vertical coordinate units (px) of the mouse cursor position.
  *  
  **/
  endDrag: function(x, y) {
    this.isDragged = false; // must be un-set to work
    this.invalidatePositionCache();
   /* Example:
   */
  },

/** = Description
  * Extend the onDrop method, if you want to do something special 
  * when the user is performing a drop event. Called when a dragged 
  * component instance is dropped on another component instance.
  * Has no functionality as default.
  *
  * = Parameters
  *  +obj+::  The dragged component object.
  *
  **/
  onDrop: function(obj) {
    
  },

/** = Description
  * Extend the onHoverStart method, if you want to do something special 
  * when a dragged component instance is dragged over a droppable component instance.
  * Has no functionality as default.
  *
  * = Parameters
  *  +obj+::  The dragged component object.
  *
  **/
  onHoverStart: function(obj) {
    
  },
  
  
/** = Description
  * Extend the onHoverEnd method, if you want to do something special 
  * when a dragged component instance is dragged from a droppable component instance.
  *
  * = Parameters
  *  +obj+::  The dragged component object.
  *
  **/
  onHoverEnd: function(obj) {
    
  },
  
  
/** = Description
  * Implement/extend the keyDown method, if you want to do something special 
  * when a key is pressed down and the component is active.
  *
  * = Parameters
  *  +_keycode+::  The keycode of the key that was pressed down.
  *
  **/
  keyDown: function(_keycode) {
    
  },
  
  
/** = Description
  * Implement/extend the keyUp method, if you want to do something special 
  * when a key is released and the component is active.
  * No functianality as default.
  *
  * = Parameters
  *  +_keycode+::  The keycode of the key that was released.
  *
  **/
  keyUp: function(_keycode) {
    
  },
  
  
  /***** -- DON'T TOUCH _mouseOver, IT IS A LOW-LEVEL HANDLER, use focus() instead ++ *****/
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
  
  /***** -- DON'T TOUCH _mouseOut, IT IS A LOW-LEVEL HANDLER, use blur() instead ++*****/
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
  
  
/** = Description
  * Forces retrieving this control's DOM element position directly rather than
  * using the cached version when the position is needed by the HEventManager.
  * Child controls are invalidated recursively by HView.
  *
  * = Returns
  * +self+
  * 
  **/
  invalidatePositionCache: function() {
    this.base();
    EVENT.coordCacheFlush(this.elemId);
    return this;
}
  
});