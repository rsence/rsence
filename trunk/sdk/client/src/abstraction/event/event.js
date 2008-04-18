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
      ['contextmenu', EVENT.contextMenu]
    ];
    for(i=0;i!=_eventMap.length;i++){Event.observe(_globalEventTargetElement,_eventMap[i][0],_eventMap[i][1]);}
    if(window.addEventListener){window.addEventListener('DOMMouseScroll',EVENT.mouseWheel,false);}
    window.onmousewheel=document.onmousewheel=EVENT.mouseWheel;
    _this.listeners=[];      // keep elemId buffer of all listeners
    _this.focused=[];        // keep elemId buffer of all focused listeners
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
    Event.stopObserving(_elem,'mouseover',_this._mouseOver);
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

