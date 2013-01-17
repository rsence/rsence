
# The EventManager is a proxy between the DOM-level
# events and the higher-lever GUI API's.
EventManagerApp = HApplication.extend
  #
  # Warning wrapper, only active in development mode
  warn: ->
    console.warn.apply( console, arguments ) unless @isProduction
  #
  # The default options array, each flag corresponds to events received.
  _defaultEventOptions:
    #
    # The recipient's #mouseMove(x,y) method gets called,
    # whether it has focus or not
    mouseMove: false
    #
    # The recipient's #mouseDown(x,y,button) method gets called,
    # if focused.
    mouseDown: false
    #
    # The recipient's #click(x,y,button) method gets called,
    # if focused.
    click: false
    #
    # The recipient's #mouseUp(x,y,button) method gets called,
    # if focused.
    mouseUp: false
    #
    # The recipient's #startDrag( x, y ), #drag( x, y ) and
    # #endDrag( x, y ) methods get called, if focused and
    # a draging operation is done with the pointing device.
    draggable: false
    #
    # The recipient's #startHover( dragObj ), #hover( dragObj ) and
    # #endHover( dragObj ) methods get called, when a dragged object
    # is hovered over it. See the rectHover option to set the topmost
    # vs any mode.
    droppable: false
    #
    # The drop modes define how the hover area responds to dragged objects
    #  false: point; the [x,y] point of the pointer
    #  true: area; the [l,t,r,b] contains rectangle of the dragged object
    #  'contains': for areas; same as true
    #  'intersects': for areas; intersection instead of containment
    rectHover: false
    #
    # Allows multiple (other than the non-topmost drop target).
    # Set on both the draggable as well as the drop target object.
    multiDrop: false
    #
    # The recipient's #keyDown( keyCode ) method gets called,
    # if active and a keyboard key is pressed.
    keyDown: false
    #
    # The recipient's #keyUp( keyCode ) method gets called,
    # if active and a keyboard key is released.
    keyUp: false
    #
    # The recipient's #mouseWheel( delta) method gets called,
    # if active and a scroll device is used.
    mouseWheel: false
    #
    # The recipient's #resize() method gets called, when the
    # browser's window or a HWindow (and similar components) are
    # resized, this event is triggered on all recipients.
    resize: false
    #
    # The recipient's #textEnter() method gets called, when a keyboard key
    # has been pressed and released, whether it has focus or not.
    textEnter: false
    #
    # The recipient's #doubleClick(x,y) method gets called, when
    # the pointing device is double-clicked, if focused.
    doubleClick: false
    #
    # The recipient's #contextMenu() method gets called, when the
    # pointing device's or keyboard's context button (usually the
    # right mouse button) has been pressed, if focused.
    contextMenu: false
  #
  # The status object has a list of the most recent HID events by id and name.
  # Each id and name and states are booleans.
  #   button1      =>  The state of the left mouse button.
  #   button2      =>  The state of the right mouse button.
  #   crsrX        =>  The X-coordinate of the mouse cursor (or last point of touch).
  #   crsrY        =>  The Y-coordinate of the mouse cursor (or last point of touch).
  #   keysDown     =>  An Array of the key codes of keys being held down.
  #   altKeyDown   =>  The state of the Alt key (or equivalent, like Option).
  #   ctrlKeyDown  =>  The state of the Ctrl key.
  #   shiftKeyDown => The state of the Shift key.
  #   metaKeyDown  =>  The state of the Meta key.
  #   cmdKeyDown   =>  The state of the Command key (or equivalent, like the Windows key).
  # Note: Will be deprecated in favor of an hash with keys instead of numeric indexes.
  status: 
    0: false
    button1: false
    setButton1: (f)->
      @button1 = f
      @[0] = f
    1: false
    button2: false
    setButton2: (f)->
      @button2 = f
      @[1] = f
    2: -1
    crsrX: -1
    setCrsrX: (x)->
      @crsr[0] = x
      @crsrX = x
      @[2] = x
    3: -1
    crsrY: -1
    crsr: [ -1, -1 ]
    setCrsrY: (y)->
      @crsr[1] = y
      @crsrY = y
      @[3] = y
    setCrsr: (x,y)->
      @setCrsrX(x)
      @setCrsrY(y)
    4: []
    keysDown: []
    hasKeyDown: (k)->
      !!~@keysDown.indexOf(k)
    addKeyDown: (k)->
      if !@hasKeyDown(k)
        @keysDown.push( k )
        @[4] = @keysDown
    delKeyDown: (k)->
      i = @keysDown.indexOf(k)
      if ~i
        @keysDown.splice( i, 1 )
        @[4] = @keysDown
    resetKeysDown: ->
      @keysDown = []
      @[4] = @keysDown
    5: false
    altKeyDown: false
    setAltKey: (f)->
      @altKeyDown = f
      @[5] = f
    6: false
    ctrlKeyDown: false
    setCtrlKey: (f)->
      @ctrlKeyDown = f
      @[6] = f
    7: false
    shiftKeyDown: false
    setShiftKey: (f)->
      @shiftKeyDown = f
      @[7] = f
    8: false
    metaKeyDown: false
    setMetaKey: (f)->
      @metaKeyDown = f
      @[8] = f
    9: false
    cmdKeyDown: false
    setCmdKey: (f)->
      @cmdKeyDown = f
      @[9] = f
    length: 10
  button1: 0
  button2: 1
  crsrX: 2
  crsrY: 3
  keysDown: 4
  altKeyDown: 5
  ctrlKeyDown: 6
  shiftKeyDown: 7
  metaKeyDown: 8
  cmdKeyDown: 9
  #
  # Cleans up events that would be lost, when the browser window is blurred.
  _domWindowBlur: ->
    @status.resetKeysDown()
    @status.setAltKey(false)
    @status.setCtrlKey(false)
    @status.setShiftKey(false)
    @status.setMetaKey(false)
    @status.setCmdKey(false)
    @_origDroppableChecks = @enableDroppableChecks
    @enableDroppableChecks = false
    if HSystem.defaultInterval != HSystem._blurredInterval
      @_sysDefaultInterval = HSystem.defaultInterval
      COMM.Queue.push( (->
        HSystem.defaultInterval = HSystem._blurredInterval
      ) )
  #
  # Restores system poll frequency
  _domWindowFocus: ->
    @enableDroppableChecks = @_origDroppableChecks
    if HSystem.defaultInterval == HSystem._blurredInterval and @_sysDefaultInterval
      _this = @
      COMM.Queue.push( (->
        HSystem.defaultInterval = _this._sysDefaultInterval
      ) )
  #
  # List of used event methods for global purposes:
  _eventMethods: [
    'resize', 'mouseMove', 'doubleClick', 'contextMenu', 'click', 'mouseUp',
    'mouseDown', 'keyUp', 'keyDown', 'mouseWheel'
  ]
  #
  # This structure keeps track of registered elem/event/object/method; see #observe and #stopObserving
  _observerMethods: {}
  #
  # Observe event, cache anon function; eventName => elem => anonFn
  observe: (_elem, _eventName, _targetMethodName, _targetObj, _capture)->
    _targetObj = @ unless _targetObj?
    _capture = false unless _capture?
    _anonFn = (e)->
      _targetObj[_targetMethodName](e)
    unless @_observerMethods[_eventName]?
      @_observerMethods[_eventName] = {
        elems:   []
        fns:     []
        capture: []
      }
    _cache = @_observerMethods[_eventName]
    _elemIdx = _cache.elems.indexOf( _elem )
    if ~_elemIdx
      _prevFn = _cache.fns[_elemIdx]
      _prevCapture = _cache.capture[_elemIdx]
      Event.stopObserving( _elem, _eventName, _prevFn, _prevCapture )
      _cache.elems.splice( _elemIdx, 1 )
      _cache.fns.splice( _elemIdx, 1 )
      _cache.capture.splice( _elemIdx, 1 )
    Event.observe( _elem, _eventName, _anonFn, _capture )
    _cache.elems.unshift( _elem )
    _cache.fns.unshift( _anonFn )
    _cache.capture.unshift( _capture )
    true
  #
  # Stop observing event
  stopObserving: (_elem, _eventName)->
    return false unless @_observerMethods[_eventName]?
    if @_observerMethods[_eventName].elems.length == 0
      delete @_observerMethods[_eventName]
      return false
    _cache = @_observerMethods[_eventName]
    _elemIdx = _cache.elems.indexOf(_elem)
    return false unless ~_elemIdx
    _prevFn = _cache.fns[_elemIdx]
    _prevCapture = _cache.capture[_elemIdx]
    Event.stopObserving( _elem, _eventName, _prevFn, _prevCapture )
    _cache.elems.splice( _elemIdx, 1 )
    _cache.fns.splice( _elemIdx, 1 )
    _cache.capture.splice( _elemIdx, 1 )
    return true
  #
  # This structure keeps track of view-event bindings:
  _listeners: {
    byId: {} # viewId => [ eventName, eventName, .. ]
    _rectHoverIntersectMode: []
    byEvent: # event names by viewId
      mouseMove:    [] # viewIds
      mouseDown:    [] # viewIds
      mouseUp:      [] # viewIds
      draggable:    [] # viewIds
      droppable:    [] # viewIds
      rectHover:    [] # viewIds
      multiDrop:    [] # viewIds
      keyDown:      [] # viewIds
      keyUp:        [] # viewIds
      mouseWheel:   [] # viewIds
      textEnter:    [] # viewIds
      click:        [] # viewIds
      resize:       [] # viewIds
      doubleClick:  [] # viewIds
      contextMenu:  [] # viewIds
    focused:  [] # viewIds
    enabled:  [] # viewIds
    dragged:  [] # viewIds
    selected: [] # viewIds
    hovered:  [] # viewIds
    active:   [] # viewIds
  }
  #
  # Returns the global target element based on browser type
  _getGlobalTargetElem: ->
    if BROWSER_TYPE.ie and !BROWSER_TYPE.ie9
      return window.document
    else
      return window
  #
  # Starts EventManager
  start: ->
    @_views = HSystem.views # shortcut to system views
    _targetElem = @_getGlobalTargetElem()
    _methods = @_eventMethods
    _methods.push( 'keyPress' ) unless BROWSER_TYPE.safari or BROWSER_TYPE.ie
    for _methodName in _methods
      if _methodName == 'doubleClick'
        _eventName = 'dblclick' 
      else
        _eventName = _methodName.toLowerCase()
      @observe( _targetElem, _eventName, _methodName )
    if window.addEventListener?
      @observe( window, 'DOMMouseScroll', 'mouseWheel' )
      @observe( window, 'resize', 'resize' )
    @observe( window, 'blur', '_domWindowBlur' )
    @observe( window, 'focus', '_domWindowFocus' )
    # @_legacyStart()
  #
  # Stops EventManager
  stop: ->
    delete @_views
    _targetElem = @_getGlobalTargetElem()
    _methods = @_eventMethods
    _methods.push( 'keyPress' ) unless BROWSER_TYPE.safari or BROWSER_TYPE.ie
    for _methodName in _methods
      if _methodName == 'doubleClick'
        _eventName = 'dblclick'
      else
        _eventName = _methodName.toLowerCase()
      @stopObserving( _targetElem, _eventName, _methodName )
    if window.addEventListener?
      @stopObserving( window, 'DOMMouseScroll', 'mouseWheel' )
      @stopObserving( window, 'resize', 'resize' )
    @stopObserving( window, 'blur', '_domWindowBlur' )
    @stopObserving( window, 'focus', '_domWindowFocus' )
  #
  ## LEGACY; to be removed
  #
  # Set to false, if your app don't need drop events.
  # Setting this to false, when not needed, improves over-all performance,
  # because the drop events need constant calculation of where the mouse
  # curser (or last touch) was against all possible drop targets.
  enableDroppableChecks: true
  #
  # Initializes the members used by the drop-related events.
  # This method is called from within the EventMangaer and is never called,
  # if @enableDroppableChecks is false
  # startDroppable: ->
  #   @warn "EventManager#startDroppable is deprecated"
  #   @hovered = [] # Drop-eligible items under the mouse cursor
  #   @hoverInterval = 200 # Milliseconds between checks
  #   @hoverTimer = new Date().getTime() # Time since last check was triggered
  #
  # Legacy startup, semi-compatible
  # _legacyStart: ->
  #   @warn "EventManager#"+'_'+"legacyStart is deprecated"
  #   @listeners = [] # NOT SUPPORTED
  #   @focused = @_listeners.focused # DEPRECATED
  #   @resizeListeners = @_listeners.byEvent.resize # DEPRECATED
  #   @eventOptions = @_listeners.byId # DEPRECATED
  #   @dragItems = @_listeners.dragged # DEPRECATED
  #   @topmostDroppable = null # NOT SUPPORTED
  #   @textEnterCtrls = @_listeners.byEvent.textEnter # DEPRECATED
  #   @_coordCache = [] # NOT SUPPORTED
  #   @_coordCacheFlag = true # NOT SUPPORTED
  #   @_lastCoordFlushTimeout = null # NOT SUPPORTED
  #   @activeControl = null # NOT SUPPORTED
  #   @_lastKeyDown = null # NOT SUPPORTED
  #   @_origDroppableChecks = @enableDroppablechecks # DEPRECATED
  #   @startDroppable() if @enableDroppableChecks # DEPRECATED
  #
  # Flushes the position cache by elemId. If no elemId is specified,
  # everything is flushed.
  coordCacheFlush: (_elemId)->
    @warn "EventManager#coordCacheFlush is deprecated"
    if _elemId
      @_coordCache[_elemId] = null
    else
      @_coordCache = []
  #
  # Flushed mouseMove timers, actually did more or less all the mouseMove work:
  flushMouseMove: (x,y)->
    @warn( "EventManager#flushMouseMove => Unsupported call, don't call it!", _ctrl )
    return false
  ## /LEGACY
  #
  # Ensures the type of the object is a HControl
  _ensureValidControl: (_ctrl,_warnMethodName)->
    _warnMethodName = '[unknown]' unless _warnMethodName
    unless _ctrl.hasAncestor?
      @warn( "EventManager##{_warnMethodName} => Not a HClass: ", _ctrl )
      return false
    unless _ctrl.hasAncestor( HView ) and _ctrl.isCtrl
      @warn( "EventManager##{_warnMethodName} => Not a HControl: ", _ctrl )
      return false
    return true
  #
  # Ensure valid eventOptions
  _ensureValidEventOptions: (_eventOptions,_warnMethodName)->
    _warnMethodName = '[unknown]' unless _warnMethodName
    if !( typeof _eventOptions == 'object' )
      @warn( "EventManager##{_warnMethodName} => Invalid eventOptions: ", _eventOptions )
      return false
    return true
  #
  # Converts eventOptions into a list of enabled event names
  _setEventOptions: (_ctrl,_eventOptions,_warnMethodName)->
    _warnMethodName = '[unknown]' unless _warnMethodName
    _viewId = _ctrl.viewId
    _eventsOn = []
    for _key of @_defaultEventOptions
      continue if _key == 'base' or _key == 'constructor'
      if @_listeners.byEvent[_key]? and _eventOptions[_key]?
        _value = _eventOptions[_key]
        if _value
          _eventsOn.push( _key )
          @_listeners.byEvent[_key].unshift( _viewId ) unless ~@_listeners.byEvent[_key].indexOf(_viewId)
          if _key == 'rectHover' and _value == 'intersects' and not ~@_listeners._rectHoverIntersectMode.indexOf( _viewId )
            @_listeners._rectHoverIntersectMode.unshift( _viewId )
        else
          _idx = @_listeners.byEvent[_key].indexOf(_viewId)
          @_listeners.byEvent[_key].splice( _idx, 1 ) if ~_idx
      else
        @warn( "EventManager##{_warnMethodName} => Invalid event type: #{_key}" )
    _this = @
    @_listeners.byId[_viewId] = _eventsOn
    if _ctrl.enabled
      @_listeners.enabled.unshift( _viewId ) unless ~@_listeners.enabled.indexOf(_viewId)
      _elem = ELEM.get( _ctrl.elemId )
      @observe( _elem, 'mouseover', '_mouseOver' )
  #
  # Releases bindings done by #_setEventOptions
  _unsetEventOptions: (_ctrl,_warnMethodName)->
    _warnMethodName = '[unknown]' unless _warnMethodName
    _viewId = _ctrl.viewId
    if @_listeners.byId[_viewId]?
      delete @_listeners.byId[_viewId]
    else
      @warn( "EventManager##{_warnMethodName} => viewId not registered: #{_viewId}" )
    for _key, _value of @_listeners.byEvent
      _viewIdx = _value.indexOf(_viewId)
      _value.splice(_viewIdx,1) if ~_viewIdx
      if _key == 'rectHover'
        _intersectHoverIdx = @_listeners._rectHoverIntersectMode.indexOf( _viewId )
        if ~_intersectHoverIdx
          @_listeners._rectHoverIntersectMode.splice( _intersectHoverIdx, 1 )
    _wasFocused = false
    _elem = ELEM.get( _ctrl.elemId )
    for _statusItem in [ 'dragged', 'selected', 'hovered', 'active', 'focused', 'enabled' ]
      _viewIdx = @_listeners[_statusItem].indexOf(_viewId)
      if ~_viewIdx
        if _statusItem == 'dragged'
          _ctrl.endDrag( @status.crsrX, @status.crsrY )
        else if _statusItem == 'selected'
          _ctrl.deSelect()
        else if _statusItem == 'hovered'
          _ctrl.endHover( null )
        else if _statusItem == 'active'
          _ctrl._lostActiveStatus( null )
        else if _statusItem == 'focused'
          # _ctrl._mouseOut()
          @stopObserving( _elem, 'mouseout', '_mouseOut' )
          _wasFocused = true
        else if _statusItem == 'enabled'
          unless _wasFocused
            @stopObserving( _elem, 'mouseover', '_mouseOver' )
          _ctrl.setEnabled( false ) if _ctrl.enabled
        @_listeners[_statusItem].splice(_viewIdx,1)
  #
  # Registers the HControl -derived object _ctrl by event listener flags
  # in _eventOptions.
  reg: (_ctrl, _eventOptions)->
    return false unless @_ensureValidControl( _ctrl, 'reg' )
    return false unless @_ensureValidEventOptions( _eventOptions, 'reg' )
    @_setEventOptions( _ctrl, _eventOptions, 'reg' )
    return true
  #
  # Returns status of registration
  _isreg: (_ctrl)->
    return @_listeners.byId[_ctrl.viewId]?
  #
  # Unregisters the HControl -derived object from all its bindings
  unreg: (_ctrl)->
    return false unless @_ensureValidControl( _ctrl, 'unreg' )
    return false unless @_isreg( _ctrl )
    @_unsetEventOptions(_ctrl,'unreg')
  #
  #
  ## Event responders; mid-level handlers.
  ## These all receive the global events and check where to delegate them.
  #
  # Handle event modifiers
  _modifiers: (e)->
    [ _x, _y ] = ELEM.getScrollPosition(0)
    [ x, y ] = [ Event.pointerX(e) - _x, Event.pointerY(e) - _y ]
    unless isNaN(x) or isNaN(y)
      @status.setCrsr( x, y )
    @status.setAltKey( e.altKey )
    @status.setCtrlKey( e.ctrlKey )
    @status.setShiftKey( e.shiftKey )
    @status.setMetaKey( e.metaKey )
  #
  # Resize is an event triggered by resizing the browser window
  # (as well as the HWindow component, as a special case)
  #
  # The HSystem._updateFlexibleRects call may not be neccessary to call
  # both before and after in all circumstances, but better be safe than sure.
  resize: (e)->
    HSystem._updateFlexibleRects()
    for _viewId in @_listeners.byEvent.resize
      _ctrl = @_views[_viewId]
      _ctrl.resize() if _ctrl.resize?
      ## Deprecate this:
      if _ctrl.onResize?
        @warn( "EventManager#resize => The 'onResize' event responder is deprecated. Please rename it to 'resize'." )
        _ctrl.onResize()
      ## /Deprecate
    HSystem._updateFlexibleRects()
  #
  # Finds the next elem with a view_id attribute
  _findViewId: (_elem)->
    until _elem.view_id? or _elem == document.body
      _elem = _elem.parentNode
    return _elem
  #
  # Finds the ctrl based on the element by getting the view_id attribute
  _findEventControl: (e,_warnMethodName,_stop)->
    _warnMethodName = '[unknown]' unless _warnMethodName
    _elem = Event.element(e)
    _ctrl = null
    until _ctrl
      _elem = @_findViewId( _elem )
      return false if _elem == document.body
      unless _elem.view_id?
        @warn( "EventManager##{_warnMethodName} => The element doesn't have an 'view_id' attribute.")
        return false
      _viewId = _elem.view_id
      unless @_views[_viewId]?
        @warn( "EventManager##{_warnMethodName} => The viewId:#{_viewId} doesn't have a view.")
        return false
      _ctrl = @_views[_viewId]
      unless _ctrl.isCtrl #@_ensureValidControl(_ctrl,_warnMethodName)
        _ctrl = null
        _elem = _elem.parentNode
    Event.stop(e) if _stop
    return _ctrl
  #
  # Enables focused state of enabled HControls by listening to the
  # view-element-specific mouseover event.
  _mouseOver: (e)->
    _ctrl = @_findEventControl(e, '_'+'mouseOver')
    @focus(_ctrl) if _ctrl
  #
  # Disables focused state of enabled HControls by listening to the
  # view-element-specific mouseout event.
  _mouseOut: (e)->
    _ctrl = @_findEventControl(e, '_'+'mouseOut')
    @blur(_ctrl) if _ctrl
  #
  # Focuses a control, triggered based on the view-element-specific
  # mouseover event.
  focus: (_ctrl)->
    _viewId = _ctrl.viewId
    unless ~@_listeners.focused.indexOf(_viewId)
      _elem = ELEM.get( _ctrl.elemId )
      @observe( _elem, 'mouseout', '_mouseOut' )
      @stopObserving( _elem, 'mouseover', '_mouseOver' )
      @_listeners.focused.unshift(_viewId)
      unless _ctrl.focus?
        @warn( "EventManager#focus => The viewId:#{_viewId} doesn't have a 'focus' method.")
        return false
      _ctrl.focus()
  #
  # Blurs a control, triggered based on the view-element-specific
  # mouseout event.
  blur: (_ctrl)->
    _viewId = _ctrl.viewId
    _viewIdx = @_listeners.focused.indexOf(_viewId)
    if ~_viewIdx
      _elem = ELEM.get( _ctrl.elemId )
      @observe( _elem, 'mouseover', '_mouseOver' )
      @stopObserving( _elem, 'mouseout', '_mouseOut' )
      @_listeners.focused.splice(_viewIdx,1)
      unless _ctrl.blur?
        @warn( "EventManager#blur => The viewId:#{_viewId} doesn't have a 'blur' method.")
        return false
      ## Should probably perform additional de-registration on active events
      ## dependant on focus here.
      ##
      ##
      _ctrl.blur()
  #
  # Mouse movement manager. Triggered by the global mousemove event.
  # Delegates the following event responder methods to focused HControl instances:
  # - drag
  # - mouseMove
  # - endHover
  # - startHover
  mouseMove: (e)->
    @_modifiers(e) # fetch event modifiers
    [ x, y ] = @status.crsr
    Event.stop(e) if @_handleMouseMove( x, y )
  #
  # Just split to gain namespace:
  _handleMouseMove: ( x, y )->
    @_delegateMouseMove(x,y)
    _currentlyDragging = @_delegateDrag(x,y)
    return _currentlyDragging
  #
  # Handle items being dragged, sending #drag(x,y) calls to them
  _delegateDrag: (x, y)->
    _dragItems = @_listeners.dragged
    return false if _dragItems.length == 0
    for _viewId in _dragItems
      _ctrl = @_views[_viewId]
      _ctrl.drag(x,y)
      @_delegateHover( _ctrl, x, y )
    return true
  #
  # Handle items wanting #mouseMove(x,y) calls
  _delegateMouseMove: (x,y)->
    _mouseMoveItems = @_listeners.byEvent.mouseMove
    return false if _mouseMoveItems.length == 0
    for _viewId in _mouseMoveItems
      _ctrl = @_views[_viewId]
      _ctrl.mouseMove(x,y)
    return true
  #
  # Handle items wanting #startHover( _dragObj ),
  # #hover( _dragObj ) and #endHover( _dragObj ) calls
  _delegateHover: (_ctrl, x, y)->
    _byEvent = @_listeners.byEvent
    _findPoint     = not ~_byEvent.rectHover.indexOf( _ctrl.viewId )
    _findTopmost   = not ~_byEvent.multiDrop.indexOf( _ctrl.viewId )
    _findIntersect = true
    if _findPoint
      _area = HPoint.new( x, y )
      _matchMethod = 'contains'
    else
      _rect = _ctrl.rect
      _area = HRect.new( x, y, _rect.width, _rect.height )
      if not ~@_listeners._rectHoverIntersectMode.indexOf( _viewId )
        _matchMethod = 'intersects'
      else
        _matchMethod = 'contains'
    if _findTopmost
      _hoverItems = @_findTopmostDroppable(_area,_matchMethod,_ctrl.viewId)
    else
      _hoverItems = @_findAllDroppable(_area,_matchMethod,_ctrl.viewid)
    _endHover = []
    for _hoverId in @_listeners.hovered
      unless ~_hoverItems.indexOf( _hoverId )
        _endHover.push( _hoverId )
    _startHover = []
    for _hoverId in _hoverItems
      unless ~@_listeners.hovered.indexOf( _hoverId )
        _startHover.push( _hoverId )
    for _viewId in _startHover
      @_views[_viewId].startHover(_ctrl)
    for _viewId in _endHover
      @_views[_viewId].endHover(_ctrl)
    for _viewId in _hoverItems
      @_views[_viewId].hover(_ctrl)
    @_listeners.hovered = _hoverItems
  #
  # Finds the topmost drop/hover target within the area specified by rectHover
  _findTopmostDroppable: (_area,_matchMethod,_selfId)->
    _views = @_views
    _droppable = @_listeners.byEvent.droppable
    _search = (_parentIds)->
      for _viewId in _parentIds
        continue if _viewId == _selfId
        _view = _views[_viewId]
        if _view.parent.hasAncestor( HView )
          if _area.offsetTo?
            _searchArea = HRect.nu(_area).offsetTo( _area.left-_view.parent.pageX(), _area.top-_view.parent.pageY() )
          else
            _searchArea = HPoint.nu( _area.x-_view.parent.pageX(), _area.y-_view.parent.pageY() )
        else
          _searchArea = _area
        if _view.hasAncestor? and _view.hasAncestor( HView )
          if _view.rect[_matchMethod](_searchArea)
            if ~_droppable.indexOf( _viewId )
              _dropId = _search( _view.viewsZOrder.slice().reverse() )
              return _dropId if _dropId
              return _viewId
            else
              _result = _search( _view.viewsZOrder.slice().reverse() )
              return _result if _result
      return false
    _dropId = _search( HSystem.viewsZOrder.slice().reverse() )
    return [ _dropId ] if _dropId
    return []
  #
  # Finds all drop/hover targets within the area specified by rectHover
  _findAllDroppable: (_area,_matchMethod,_selfId)->
    _views = @_views
    _droppable = @_listeners.byEvent.droppable
    _found = []
    _search = (_parentIds)->
      for _viewId in _parentIds
        continue if _viewId == _selfId
        _view = _views[_viewId]
        if _view.hasAncestor? and _view.hasAncestor( HView ) and _view.rect[_matchMethod](_area)
          _found.push( _viewId ) if ~_droppable.indexOf( _viewId )
          _search( _view.viewsZOrder.slice().reverse() )
    _search( HSystem.viewsZOrder.slice().reverse() )
    return _found
  #
  # Removes the active control
  delActiveControl: (_newActive)->
    _active = @_listeners.active
    _focused = @_listeners.focused
    _dragged = @_listeners.dragged
    _hovered = @_listeners.hovered
    return null if _active.length == 0
    _prevActive = @_views[_active[0]]
    if _active.length != 1
      @warn "Danger, too many active items: #{JSON.stringify(_active)}"
    for _viewId in _active.slice()
      continue if _newActive != null and _viewId == _newActive.viewId
      _ctrl = @_views[_viewId]
      _ctrl.active = false
      _idx = _active.indexOf( _viewId )
      _dragIdx = _dragged.indexOf(_viewId)
      # console.log('dragIdx:',~_dragIdx)
      if ~_dragIdx
        _dragged.splice( _dragIdx, 1 )
        for _dropViewId in _hovered
          _dropCtrl = @_views[_dropViewId]
          _dropCtrl.endHover(_ctrl) if _dropCtrl.endHover?
          _dropCtrl.drop(_ctrl) if _dropCtrl.drop?
        [ x, y ] = @status.crsr
        _ctrl.endDrag( x, y )
      _active.splice( _idx, 1 )
      # console.log('lost:',_viewId)
      @blur(_ctrl) if ~_focused.indexOf(_viewId)
      _ctrl.lostActiveStatus(_newActive)
      # _ctrl.setStyle('border','1px dotted red')
      # if @prevActiveCtrl
      #   @prevActiveCtrl.setStyle('border','1px dotted gray')
      #   @prevActiveCtrl = null
      # @prevActiveCtrl = _ctrl
    _prevActive
  #
  # Adds the active control
  addActiveControl: (_ctrl,_prevActive)->
    _active = @_listeners.active
    _focused = @_listeners.focused
    _idx = _active.indexOf( _ctrl.viewId )
    unless ~_idx
      _active.unshift(_ctrl.viewId)
      # console.log('gained:',_ctrl.viewId)
      @focus(_ctrl) unless ~_focused.indexOf(_ctrl.viewId)
      _ctrl.active = true
      _ctrl.gainedActiveStatus(_prevActive)
      # _ctrl.setStyle('border','1px dotted blue')
  #
  # Sets the active control
  changeActiveControl: (_ctrl)->
    _prevActive = @delActiveControl(_ctrl)
    @addActiveControl(_ctrl, _prevActive) if _ctrl != null
  #
  # Method to be called, when you want to make an item draggable from outside of the EventManager
  startDragging: (_ctrl)->
    return if !_ctrl.enabled
    _viewId = _ctrl.viewId
    @focus( _viewId )
    @changeActiveControl(_ctrl)
    @_listeners.dragged.unshift( _viewId ) unless ~@_listeners.dragged.indexOf( _viewId )
    _ctrl.startDrag( @status.crsrX, @status.crsrY, @status.button2 )
  #
  # Cancels text selections, which happen by 
  _cancelTextSelection: ->
    # Remove possible selections.
    ELEM.get(0).focus()
  #
  # Mouse button press manager. Triggered by the global mouseDown event.
  # Delegates the following event responder methods to active HControl instances:
  # - mouseDown
  # - startDrag
  mouseDown: (e)->
    @_modifiers(e)
    _leftClick = Event.isLeftClick(e)
    if _leftClick
      @status.setButton1( true )
    else
      @status.setButton2( true )
    _focused = @_listeners.focused
    _active  = @_listeners.active
    _dragged = @_listeners.dragged
    _mouseDownable = @_listeners.byEvent.mouseDown
    _draggable = @_listeners.byEvent.draggable
    _newActive = []
    _mouseDownIds = []
    _startDragIds = []
    _stop = false
    for _viewId in _focused
      _newActive.push( _viewId ) unless ~_active.indexOf(_viewId)
      _eventOptions = @_listeners.byId[_viewId]
      if ~_mouseDownable.indexOf( _viewId )
        _mouseDownIds.push( _viewId )
      if ~_draggable.indexOf( _viewId ) and not ~_dragged.indexOf( _viewId )
        _startDragIds.push( _viewId )
    for _viewId in _newActive
      _ctrl = @_views[_viewId]
      @changeActiveControl( _ctrl )
    [ x, y ] = @status.crsr
    @_handleMouseMove(x,y)
    for _viewId in _mouseDownIds
      _ctrl = @_views[_viewId]
      _stop = true if _ctrl.mouseDown( x, y, _leftClick )
    for _viewId in _startDragIds
      unless ~_dragged.indexOf( _viewId )
        _ctrl = @_views[_viewId]
        _dragged.unshift( _viewId )
        _stop = true if _ctrl.startDrag( x, y, _leftClick )
    @_cancelTextSelection() unless _startDragIds.length == 0 and _mouseDownIds.length == 0
    Event.stop(e) if _stop
  #
  # Mouse button press manager. Triggered by the global mouseDown event.
  # Delegates the following event responder methods to active HControl instances:
  # - mouseUp
  # - endDrag
  # - endHover
  # - drop
  mouseUp: (e)->
    @_modifiers(e)
    _leftClick = Event.isLeftClick(e)
    @status.setButton1( false )
    @status.setButton2( false )
    return false unless _leftClick
    _focused = @_listeners.focused
    _active  = @_listeners.active
    _dragged = @_listeners.dragged
    _hovered = @_listeners.hovered
    _mouseUppable = @_listeners.byEvent.mouseUp
    _draggable = @_listeners.byEvent.draggable
    _newActive = []
    _mouseUpIds = []
    _endDragIds = []
    _stop = false
    for _viewId in _focused
      _newActive.push( _viewId ) unless ~_active.indexOf(_viewId)
      _eventOptions = @_listeners.byId[_viewId]
      if ~_mouseUppable.indexOf( _viewId )
        _mouseUpIds.push( _viewId )
    for _viewId in _dragged
      _endDragIds.push( _viewId )
    [ x, y ] = @status.crsr
    @_handleMouseMove(x,y)
    for _viewId in _mouseUpIds
      _ctrl = @_views[_viewId]
      _stop = true if _ctrl.mouseUp( x, y, _leftClick )
    for _viewId in _endDragIds
      _dragIdx = _dragged.indexOf( _viewId )
      if ~_dragIdx
        _ctrl = @_views[_viewId]
        _dragged.splice( _dragIdx, 1 )
        for _dropViewId in _hovered
          _dropCtrl = @_views[_dropViewId]
          _dropCtrl.endHover(_ctrl) if _dropCtrl.endHover?
          _dropCtrl.drop(_ctrl) if _dropCtrl.drop?
        _stop = true if _ctrl.endDrag( x, y, _leftClick )
    for _viewId in _newActive
      _ctrl = @_views[_viewId]
      @changeActiveControl( _ctrl )
    @_listeners.hovered = []
    @_listeners.dragged = []
    @_cancelTextSelection() unless _endDragIds.length == 0 and _mouseUpIds.length == 0
    Event.stop(e) if _stop
    ## /jatka
  #
  # Handles mouse button clicks
  # It's different from mouseUp/mouseDown, because it's a different event,
  # and is supported by touch screen devices
  click: (e)->
    @_modifiers(e)
    _leftClick = Event.isLeftClick(e)
    if _leftClick
      @status.setButton1( false )
    else
      # there is a separate event for context menu, and only
      # Firefox fires click separately
      return true
    _focused = @_listeners.focused
    _active  = @_listeners.active
    _clickable = @_listeners.byEvent.click
    _doubleClickable = @_listeners.byEvent.doubleClick
    _doubleClickWait = []
    _newActive = []
    _clickIds = []
    _stop = false
    for _viewId in _focused
      _newActive.push( _viewId ) unless ~_active.indexOf(_viewId)
      if ~_clickable.indexOf(_viewId) and ~_doubleClickable.indexOf(_viewId)
        _doubleClickWait.push( _viewId )
      else if ~_clickable.indexOf(_viewId)
        _clickIds.push( _viewId )
    for _viewId in _newActive
      _ctrl = @_views[_viewId]
      @changeActiveControl( _ctrl )
    [ x, y ] = @status.crsr
    @_handleMouseMove(x,y)
    for _viewId in _clickIds
      _ctrl = @_views[_viewId]
      unless _ctrl.click? and typeof _ctrl.click == 'function'
        @warn( 'no click:', _ctrl, _ctrl.click?, typeof _ctrl.click )
        continue
      _stop = true if _ctrl.click( x, y, _leftClick )
    if _doubleClickWait.length
      _this = @
      @dblClickWait = setTimeout( (->
          for _viewId in _doubleClickWait
            _ctrl = _this._views[_viewId]
            unless _ctrl.click? and typeof _ctrl.click == 'function'
              _this.warn( 'no click:', _ctrl, _ctrl.click?, typeof _ctrl.click )
              continue
            _stop = true if _ctrl.click( x, y, _leftClick )
          Event.stop(e) if _stop
        ), 50
      )
    Event.stop(e) if _stop
  #
  # Handles doubleClick events
  doubleClick: (e)->
    if @dblClickWait
      clearTimeout( @dblClickWait )
      delete this['dblClickWait']
    @_modifiers(e)
    _leftClick = Event.isLeftClick(e)
    @status.setButton1( false )
    @status.setButton2( false )
    [ x, y ] = @status.crsr
    @_handleMouseMove(x,y)
    _focused = @_listeners.focused
    _doubleClicks = []
    _doubleClickable = @_listeners.byEvent.doubleClick
    _stop = false
    # console.log('focused:',_focused)
    for _viewId in _focused
      if ~_doubleClickable.indexOf(_viewId)
        _doubleClicks.push( _viewId )
    for _viewId in _doubleClicks
      _ctrl = @_views[_viewId]
      if _ctrl.doubleClick?
        # console.log _ctrl.componentName
        _stop = true if _ctrl.doubleClick(x,y,true)
    Event.stop(e) if _stop
  #
  # Handles mouseWheel events (any HID scroll event)
  mouseWheel: (e)->
    e = window.event unless e
    @_modifiers(e)
    if e.wheelDelta
      _delta = 0-(e.wheelDelta/120)
    else if e.detail
      _delta = 0-(e.detail/3)
    if BROWSER_TYPE.opera or BROWSER_TYPE.safari or BROWSER_TYPE.ie
      _delta = 0-_delta
    _focused = @_listeners.focused
    _mouseWheels = []
    _mouseWheelable = @_listeners.byEvent.mouseWheel
    _stop = false
    for _viewId in _focused
      if ~_mouseWheelable.indexOf(_viewId)
        _mouseWheels.push( _viewId )
    for _viewId in _mouseWheels
      _ctrl = @_views[_viewId]
      if _ctrl.mouseWheel?
        _stop = true if _ctrl.mouseWheel( _delta )
    Event.stop(e) if _stop
  #
  # Handles the contextMenu event
  contextMenu: (e)->
    @_modifiers(e)
    _stop = true
    @status.setButton1( false )
    @status.setButton2( false )
    _focused = @_listeners.focused
    _contextMenuable = @_listeners.byEvent.contextMenu
    for _viewId in _focused
      if ~_contextMenuable.indexOf(_viewId)
        _ctrl = @_views[_viewId]
        _stop = false if _ctrl.contextMenu? and _ctrl.contextMenu()
    Event.stop(e) if _stop
  #
  # Keycode translation tables
  _keyTrans:
    opera:
      # Symbol keys:
      59: 186 # [;:]
      61: 187 # [=+]
      44: 188 # [,<]
      45: 189 # [-_]
      46: 190 # [.>]
      47: 191 # [/?]
      96: 192 # [`~]
      91: 219 # [[{]
      92: 220 # [\|]
      93: 221 # []}]
      39: 222 # ['"]
      
      # Numeric keypad keys can't be mapped on Opera, because Opera 
      # doesn't differentiate between the keys on the numeric keypad
      # versus the functionally same keys elsewhere on the keyboard.
      
      # Branded keys:
      # Apple Command keys are same as ctrl, but ctrl is 0; Can't be re-mapped reliably.
      # The Windows Menu key also return 0, so it can't be re-mapped either.
      219: 91 # Left Windows key (Start)
      220: 92 # Right Windows key (Start)
    mozilla:
      # Symbol keys:
      59: 186  # [;:]
      61: 187  # [=+]
      109: 189 # [-_]
      
      # Branded keys:
      224: 91 # Apple Command key to left windows key mapping
  #
  # Translates keyCodes to the normalized pseudo-ascii used by IE and WebKit browsers.
  # Opera and Mozilla browsers use different codes, so they'll need translations.
  translateKeyCodes: (_keyCode)->
    # We use the WebKit and IE browsers as the normalization base, because
    # there is no variance between in these. Returns the keyCode as-is for
    # browsers in this category.
    if BROWSER_TYPE.safari or BROWSER_TYPE.ie
      return _keyCode
    # Opera has its own keyCodes, which are different from all others.
    else if BROWSER_TYPE.opera
      _transCode = @_keyTrans.opera[_keyCode]
    # The assumption is that the other browsers do what mozille does.
    else
      _transCode = @_keyTrans.mozilla[_keyCode]
    # No translation needed:
    return _keyCode if not _transCode? or _transCode == null
    # Return translated:
    return _transCode
  #
  # List of keycodes considered command keys
  _cmdKeys: [
    17, # Ctrl
    91, # Others (Left Start Key or Left Command Key)
    92, # Others (Right Start Key)
    93  # Others (Menu Key or Right Command Key)
  ]
  _detectCmdKey: ( _keyCode )->
    # On Opera, return true on any of the keycodes
    if BROWSER_TYPE.opera
      return !!~@_cmdKeys.indexOf(_keyCode)
    # Any mac browser (except opera, above) uses left or right windows key
    # equivalent as the Command key.
    else if BROWSER_TYPE.mac
      return _keyCode == 91 or _keyCode == 93
    # Other platforms use CTRL as the command key.
    return _keyCode == 17
  #
  # Handles the keyDown event
  keyDown: (e)->
    @_modifiers(e)
    _keyCode = @translateKeyCodes( e.keyCode )
    _stop = false
    if !@status.cmdKeyDown and @_detectCmdKey( _keyCode )
      @status.setCmdKey( true )
      _stop = true
    _active = @_listeners.active
    _keyDowners = @_listeners.byEvent.keyDown
    _keyDowns = []
    unless @status.hasKeyDown( _keyCode ) and @_lastKeyDown != _keyCode
      for _viewId in _active
        _keyDowns.push( _viewId ) if ~_keyDowners.indexOf( _viewId )
      @status.addKeyDown( _keyCode )
    # repeat not implemented yet
    for _viewId in _keyDowns
      _ctrl = @_views[_viewId]
      if _ctrl.keyDown?
        _stop = true if _ctrl.keyDown(_keyCode)
    @_lastKeyDown = _keyCode
    Event.stop(e) if _stop
  keyUp: (e)->
    @_modifiers(e)
    _keyCode = @translateKeyCodes( e.keyCode )
    _stop = false
    if @status.cmdKeyDown and @_detectCmdKey( _keyCode )
      @status.setCmdKey( false )
      _stop = true
    _active = @_listeners.active
    _enabled = @_listeners.enabled
    _keyUppers = @_listeners.byEvent.keyUp
    _keyUps = []
    _textEnterers = @_listeners.byEvent.textEnter
    _textEnters = []
    for _viewId in _textEnterers
      _textEnters.push( _viewId ) if ~_enabled.indexOf( _viewId )
    for _viewId in _textEnters
      _ctrl = @_views[_viewId]
      if _ctrl.textEnter?
        _stop = true if _ctrl.textEnter( _keyCode )
    if @status.hasKeyDown( _keyCode )
      for _viewId in _active
        _keyUps.push( _viewId ) if ~_keyUppers.indexOf( _viewId )
      @status.delKeyDown( _keyCode )
    for _viewId in _keyUppers
      _ctrl = @_views[_viewId]
      if _ctrl.keyUp?
        _stop = true if _ctrl.keyUp( _keyCode )
    Event.stop(e) if _stop
  keyPress: (e)->
    @warn('EventManager#keyPress not implemented')
  isKeyDown: (_keyCode)->
    @warn('EventManager#isKeyDown() is deprecated, use #status.hasKeyDown() instead')
    @status.hasKeyDown( _keyCode )
  isKeyUp: (_keyCode)->
    @warn('EventManager#isKeyUp() is deprecated, use !#status.hasKeyDown() instead')
    (not @status.hasKeyDown( _keyCode ))
  isAltKeyDown: ->
    @warn('EventManager#isAltKeyDown is deprecated, use #status.altKeyDown instead')
    @status.altKeyDown
  isCtrlKeyDown: ->
    @warn('EventManager#isCtrlKeyDown is deprecated, use #status.ctrlKeyDown instead')
    @status.ctrlKeyDown
  isShiftKeyDown: ->
    @warn('EventManager#isShiftKeyDown is deprecated, use #status.shiftKeyDown instead')
    @status.shiftKeyDown
  isMetaKeyDown: ->
    @warn('EventManager#isMetaKeyDown is deprecated, use #status.metaKeyDown instead')
    @status.metaKeyDown
  isCmdKeyDown: ->
    @warn('EventManager#isCmdKeyDown is deprecated, use #status.cmdKeyDown instead')
    @status.altKeyDown
  #
  # Debug output
  # idle: ->
  #   console.log( 'focused: ',
  #     JSON.stringify(@_listeners.focused),'active:',
  #     JSON.stringify(@_listeners.active),'dragged:',
  #     JSON.stringify(@_listeners.dragged),'hovered:',
  #     JSON.stringify(@_listeners.hovered) )
  #
  # Cleans up structures
  die: ->
    @stop()
    @base()

LOAD( ->
  window.EventManager = EventManagerApp.new( 500, 'EventManager' )
  # Alias:
  window.EVENT = EventManager
  EventManager.start()
)
