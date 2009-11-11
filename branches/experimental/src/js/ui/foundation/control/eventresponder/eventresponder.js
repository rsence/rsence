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
  ** = Event handler methods
  ** Pre-defined event handler methods, extend these in your subclass.
  **
  ** +focus+::               Called when the component gets focus
  **
  ** +blur+::                Called when the component loses focus
  **
  ** +mouseDown+::           Called when the mouse button is pushed down
  **
  ** +mouseUp+::             Called when the mouse button is released
  **
  ** +mouseWheel+::          Called when the mouse wheel is used
  **
  ** +startDrag+::           Called when the mouse button 
  **                         is pressed (and item is draggable).
  **
  ** +endDrag+::             Called when the mouse button 
  **                         is released (and item is draggable).
  **
  ** +doDrag+::              Called when the mouse is moved and mouse button 
  **                         is down (and item is draggable).
  **
  ** +onDrop+::              Called when a draggable item is released 
  **                         on the droppable.
  **
  ** +onHoverStart+::        Called when a draggable item is moved 
  **                         over the droppable.
  **
  ** +onHoverEnd+::          Called when a draggable item is moved out 
  **                         of the droppable.
  **
  ** +keyDown+::             Called when the user presses a key, and 
  **                         the control is active.
  **
  ** +keyUp+::               Called when the user releases a key, and 
  **                         the control is active.
  **
  ** +textEnter+::           Called when the user releases a key regardless 
  **                         if the control is active or not.
  **
  ** +gainedActiveStatus+::  Called when the component gets activated.
  **
  ** +lostActiveStatus+::    Called when the component gets deactivated.
  **
***/
HEventResponder = HClass.extend({
  
/** = Description
  * The event responder interface for +HControl+.
  *
  * Registers the events defined by boolean properties of 
  * the events object to the control instance. The event manager 
  * handles the event mapping and abstraction itself.
  *
  * NOTE startDrag vs mouseDown and endDrag vs mouseUp events 
  * conflict, if both are set simultaneously.
  *
  * = Parameters
  * +_events+::  A {key: flag} hash structure, sets events based on the 
  *              keys and the flag. See the Event types below:
  *
  * = Event types
  * +mouseMove+::   flag, start listening to global mousemove events.
  *
  * +mouseDown+::   flag, start listening to mouseDown events when the 
  *                 component has focus.
  *
  * +mouseUp+::     flag, start listening to mouseUp events when the 
  *                 component has focus.
  *
  * +mouseWheel+::  flag, start listening to mouseWheel events when the 
  *                 component has focus.
  *
  * +draggable+::   flag, start listening to drag events when the 
  *                 component has focus.
  *
  * +droppable+::   flag, start listening to drop events when the 
  *                 component has focus.
  *
  * +keyDown+::     flag, start listening to keyDown events when the 
  *                 component has focus.
  *
  * +keyUp+::       flag, start listening to keyUp events when the 
  *                 component has focus.
  *
  * = Usage
  *   HControl.new(
  *     [0,0,100,20],
  *     HApplication.nu()
  *   ).setEvents({
  *     mouseUp: true,
  *     mouseDown: true
  *   });
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
  * Alternative flag setter for the mouseMove event type. If set to true, 
  * starts listening to mouseDown events when the component has focus.
  *
  * = Parameters
  * +_flag+:: Set the mouseDown event listening on/off (true/false) for
  *           the component instance.
  *
  * = Returns
  * +self+
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
  *            the component instance.
  *
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
  *           the component instance.
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
  *           the component instance.
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
  * +_flag+::  Set the mouseWheel event listening on/off (true/false) for
  *            the component instance.
  *
  * = Returns
  * +self+
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
  * +_flag+:: Set the startDrag, doDrag and endDrag event listening 
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
  * +_flag+::  Set the onHoverStart, onDrop and onHoverEnd event listening 
  *            on/off (true/false) for the component instance.
  *
  * = Returns
  * +self+
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
  * +_flag+:: Set the keyDown event listening on/off (true/false) for
  *           the component instance.
  *
  * = Returns
  * +self+
  *
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
  * +_flag+::  Set the keyUp event listening on/off (true/false) for
  *            the component instance.
  *
  * = Returns
  * +self+
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
  
/** Same as +setClickable+
  **/
  setClick: function(_flag) {
    return this.setClickable(_flag);
  },
  
/** = Description
  * Default focus event responder method. Does nothing by default.
  *
  * Called when the component gets focus.
  *
  **/
  focus: function() {
    
  },
  
/** = Description
  * Default blur event responder method. Does nothing by default.
  *
  * Called when the component loses focus.
  *
  **/
  blur: function() {
    
  },
  
  
/** = Description
  * Default gainedActiveStatus event responder method. Does nothing by default.
  *
  * Called when the component gains active status; both focused and clicked.
  *
  * = Parameters
  * +_lastActiveControl+::  A reference to the control that was active
  *                         before this control became active. Can
  *                         be null if there was no active control.
  *
  **/
  gainedActiveStatus: function(_lastActiveControl) {
    
    if ( (HSystem.windowFocusBehaviour === 1) && ( this.parents.length > 2 ) ) {
      if ( this.parents[2].componentBehaviour.indexOf('window') !== -1 ) {
        this.parents[2].gainedActiveStatus();
      }
    }
    
  },
  
  // A low-level handler for active status, don't extend this.
  _gainedActiveStatus: function(_lastActiveControl) {
    if(this.enabled) {
      this.toggleCSSClass(this.elemId, HControl.CSS_ACTIVE, true);
    }
    this.gainedActiveStatus(_lastActiveControl);
  },
  
  
/** = Description
  * Default lostActiveStatus event responder method. Does nothing by default.
  *
  * Called when the component loses active status; another component was
  * focused and clicked.
  *
  * = Parameters
  * +_newActiveControl+:: A reference to the control that became the currently
  *                       active control. Can be null if there is no active
  *                       control.
  *
  **/
  lostActiveStatus: function(_newActiveControl) {
    
  },
  
  // A low-level handler for lost active status, don't extend this.
  _lostActiveStatus: function(_newActiveControl) {
    if(this.enabled) {
      this.toggleCSSClass(this.elemId, HControl.CSS_ACTIVE, false);
    }
    this.lostActiveStatus(_newActiveControl);
  },
  
  
/** = Description
  * Default mouseMove event responder method. Does nothing by default.
  *
  * Called whenever the mouse cursor is moved regardless if the
  * component is active or has focus.
  *
  * = Parameters
  * +x+::           The horizonal coordinate units (px) of the 
  *                 mouse cursor position.
  * +y+::           The vertical coordinate units (px) of the 
  *                 mouse cursor position.
  *
  **/
  mouseMove: function(x,y) {},
  
  
/** = Description
  * Default click event responder method. Does nothing by default.
  *
  * = Parameters
  * +x+::              The horizonal coordinate units (px) of the 
  *                    mouse cursor position.
  * +y+::              The vertical coordinate units (px) of the 
  *                    mouse cursor position.
  * +_isRightButton+:: Boolean flag; true if the right(context) mouse
  *                    button is pressed.
  *
  **/
  click: function(x,y,_isRightButton){},
  
/** = Description
  * Default mouseDown event responder method. Does nothing by default.
  *
  * = Parameters
  * +x+::              The horizonal coordinate units (px) of the 
  *                    mouse cursor position.
  * +y+::              The vertical coordinate units (px) of the 
  *                    mouse cursor position.
  * +_isRightButton+:: Boolean flag; true if the right(context) mouse
  *                    button is pressed.
  *
  **/
  mouseDown: function(x,y,_isRightButton) {},
  
  
/** = Description
  * Default mouseDown event responder method. Does nothing by default.
  *
  * = Parameters
  * +x+::              The horizonal coordinate units (px) of the 
  *                    mouse cursor position.
  * +y+::              The vertical coordinate units (px) of the 
  *                    mouse cursor position.
  * +_isRightButton+:: Boolean flag; true if the right(context) mouse
  *                    button is pressed.
  *
  **/
  mouseUp: function(x,y,_isRightButton) {},
  
/** = Description
  * Default mouseWheel event responder method. Does nothing by default.
  *
  * = Parameters
  * +_delta+::  Scrolling delta, the wheel angle change. If delta is positive,
  *             wheel was scrolled up. Otherwise, it was scrolled down.
  *
  **/
  mouseWheel: function(_delta) {},
  
/** = Description
  * Default startDrag event responder method. Sets internal flags by default.
  *
  * This is the preferred method to extend if you want to do something
  * when a drag event starts. If you extend, remember to call +this.base();+
  *
  * = Parameters
  * +x+::    The horizonal coordinate units (px) of the mouse cursor position.
  * +y+::    The vertical coordinate units (px) of the mouse cursor position.
  *
  **/
  startDrag: function(x, y) {
    this.isDragged = true; // must be set to work?
  },
  
/** = Description
  * Default doDrag event responder method. Does nothing by default.
  *
  * This is the preferred method to extend while a drag method is ongoing.
  * Called whenever the mouse cursor moves and a drag event has been started.
  *
  * = Parameters
  * +x+:: The horizonal coordinate units (px) of the mouse cursor position.
  * +y+:: The vertical coordinate units (px) of the mouse cursor position.
  *
  **/
  doDrag: function(x, y) {},
  
/** = Description
  * Default startDrag event responder method. Sets internal flags by default.
  *
  * This is the preferred method to extend if you want to do something
  * when a drag event ends. If you extend, remember to call +this.base();+
  *
  * = Parameters
  * +x+::  The horizonal coordinate units (px) of the mouse cursor position.
  * +y+::  The vertical coordinate units (px) of the mouse cursor position.
  *
  **/
  endDrag: function(x, y) {
    this.isDragged = false; // must be un-set to work?
    this.invalidatePositionCache();
  },

/** = Description
  * Default onDrop event responder method. Does nothing by default.
  *
  * Extend the onDrop method, if you want to do something 
  * when this instance is the target of another instance's endDrag event.
  * Called when a dragged component instance is dropped on the target instance.
  *
  * = Parameters
  * +obj+::  The dragged component object.
  *
  **/
  onDrop: function(obj) {},

/** = Description
  * Default onHoverStart event responder method. Does nothing by default.
  *
  * Extend the onDrop method, if you want to do something 
  * when this instance is the target of another instance's doDrag event.
  * Called when a dragged component instance is dragged over
  * the target instance.
  *
  * = Parameters
  * +obj+::  The dragged component object.
  *
  **/
  onHoverStart: function(obj) {},
  
/** = Description
  * Default onHoverStart event responder method. Does nothing by default.
  *
  * Extend the onDrop method, if you want to do something 
  * when this instance is no longer the target of another instance's
  * doDrag event.
  * Called when a dragged component instance is dragged away from
  * the target instance.
  *
  * = Parameters
  * +obj+::  The dragged component object.
  *
  **/
  onHoverEnd: function(obj) {},
  
/** = Description
  * Default keyDown event responder method. Does nothing by default.
  *
  * Extend the keyDown method, if you want to do something
  * when a key is pressed and the component is active.
  *
  * = Parameters
  * +_keycode+::  The keycode of the key that was pressed.
  *
  **/
  keyDown: function(_keycode) {},
  
/** = Description
  * Default keyUp event responder method. Does nothing by default.
  *
  * Extend the keyUp method, if you want to do something
  * when a key is released and the component is active.
  *
  * = Parameters
  * +_keycode+::  The keycode of the key that was released.
  *
  **/
  keyUp: function(_keycode) {},
  
/** = Description
  * Default textEnter event responder method. Does nothing by default.
  *
  * Extend the textEnter method, if you want to do something
  * when a key is released regardless if the component is active,
  * has focus or not.
  *
  * = Parameters
  * +_keycode+::  The keycode of the key that was released.
  *
  **/
  textEnter: function() {},
  
  /** -- DON'T TOUCH _mouseOver, IT IS A LOW-LEVEL HANDLER, use focus() instead ++ **/
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
  
  /** -- DON'T TOUCH _mouseOut, IT IS A LOW-LEVEL HANDLER, use blur() instead ++ **/
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
  * using the cached version when the position is needed by +EVENT+.
  * Child controls are invalidated recursively by +HView+.
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