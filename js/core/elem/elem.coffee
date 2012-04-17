
###
BROWSER_TYPE contains browser types.
Used for quick checks mostly in layout code
###
BROWSER_TYPE =
  mac: false
  win: false
  ie:  false
  ie6: false
  ie7: false
  ie8: false
  ie9: false
  ie10: false
  opera: false
  safari: false
  symbian: false
  chrome: false
  firefox: false
  firefox2: false
  firefox3: false
  firefox4: false # version 4 or newer

###
The DOM Element abstraction engine
###
ELEM = HClass.extend
  
  constructor: null

  ###
  Main control for refresh speed
  ###
  ELEMTickerInterval: 33

  ###
  Sets up object members
  ###
  reset: ->

    # Startup queue stuff
    @_domLoadQueue = []
    @_domLoadTimer = null

    # Flag which turns to true, when the document body is detected as loaded
    @_domLoadStatus = false

    @_flushTime = 0
    @_flushCounter = 0
    @_idleDelay = 500

    @_timer = null
    @_minDelay = @ELEMTickerInterval
    @_flushing = false
    @_needFlush = false
    @_slowness = 1

    @_elements = {}
    @_nextElemId = 0
    @_freeElemIds = []

    @_styleCache = {}
    @_styleTodo = {}
    @_attrTodo = {}
    @_attrCache = {}
    @_elemTodo = []
    @_elemTodoH = {}
    @_blockElems = ",ADDRESS,BLOCKQUOTE,CENTER,DIR,DIV,DL,FIELDSET,FORM,H1,H2,H3,H4,H5,H6,HR,ISINDEX,MENU,NOFRAMES,NOSCRIPT,OL,P,PRE,TABLE,UL,"
    null

  ###
  Adds an element reference
  Returns the element id
  ###
  _add: (_elem)->
    if @_freeElemIds.length != 0
      _id = @_freeElemIds.shift()
    else
      _id = @_nextElemId
      @_nextElemId++
    @_elements[_id] = _elem
    _id
  
  ###
  Initializes cache object helpers
  ###
  _initCache: (_id)->
    @_styleTodo[_id] = []
    @_styleCache[_id] = {}
    @_attrTodo[_id] = []
    @_attrCache[_id] = {}
    @_elemTodoH[_id] = false
    null
  
  ###
  Adds an existing document element by its id attribute
  ###
  bindId: (_attrId)->
    _elem = document.getElementById( _attrId )
    _id   = @_add( _elem )
    @_initCache( _id )
    _id
  
  ###
  Binds the document element
  ###
  bind: (_elem)->
    _id = @_add( _elem )
    @_initCache( _id )
    _id
  
  ###
  Returns an element by its id
  ###
  get: (_id)->
    @_elements[_id]
  
  ###
  Sets the innerHTML contents of the element
  ###
  setHTML: (_id, _html)->
    @_elements[_id].innerHTML = _html unless @_elements[_id].innerHTML == _html
    null
  
  ###
  Returns the innerHTML of the element
  ###
  getHTML: (_id)->
    @_elements[_id].innerHTML
  
  ###
  Deletes an element and its associated metadata
  ###
  del: (_id)->
    _elem = @_elements[_id]
    i = @_elemTodo.indexOf( _id )
    @_elemTodo.splice( i, 1 ) unless i == -1
    delete @_attrTodo[_id]
    delete @_styleCache[_id]
    delete @_attrCache[_id]
    delete @_elemTodoH[_id]
    delete @_elements[_id]
    @_freeElemIds.push(_id)
    _elem.parentNode.removeChild( _elem )
    null
  
  ###
  Places the source element inside the target element
  ###
  append: (_srcId, _tgtId)->
    @_elements[_tgtId].appendChild @_elements[_srcId]
  
  ###
  Replaces all styles of an element with a block of css text 
  ###
  setCSS: (_id, _css)->
    @_elements[_id].style.cssText = _css
    null
  
  ###
  Returns the current css text of an element
  ###
  getCSS: (_id)->
    @_elements[_id].style.cssText
  
  ###
  Returns the visible size of an element as a [ width, height ] tuple
  ###
  getVisibleSize: (_id)->
    _elem = @_elements[_id]
    [ _body, _visible, _overflow ] = [ 'body', 'visible', 'overflow' ]
    [ w, h ] = [ _elem.offsetWidth, _elem.offsetHeight ]
    _parent = _elem.parentNode
    while _parent and _parent.nodeName.toLowerCase() != _body
      if _visible == @_getComputedStyle( _parent, _overflow )
        [ _parentClientWidth, _parentClientHeight ] = [ _parent.clientWidth, _parent.clientHeight ]
        w = _parentClientWidth - _elem.offsetLeft if w > _parentClientWidth
        h = _parentClientWidth - _elem.offsetTop  if h > _parentClientHeight
      _elem = _elem.parentNode
      break unless _parent.parentNode
      _parent = _parent.parentNode
    [ w, h ]
  
  ###
  Returns the full offset size of the element as a [ width, height ] tuple
  ###
  getSize: (_id)->
    _elem = @_elements[_id]
    [ _elem.offsetWidth, _elem.offsetHeight ]
  
  ###
  Returns the position of the element as a [ x, y ] tuple
  ###
  getPosition: (_id)->
    _elem = @_elements[_id]
    [ _elem.offsetLeft, _elem.offsetTop ]

  ###
  Returns the scroll position of the element as a [ x, y ] tuple
  ###
  getScrollPosition: (_id)->
    _elem = @_elements[_id]
    [ _elem.scrollLeft, _elem.scrollTop ]

  ###
  Returns the scroll size of the element as a [ width, height ] tuple
  ###
  getScrollSize: (_id)->
    _elem = @_elements[_id]
    [ _elem.scrollWidth, _elem.scrollHeight ]
  
  ###
  Calculates the visible left position of an element
  ###
  _getVisibleLeftPosition: (_id)->
    _elem = @_elements[_id]
    x = 0
    while _elem != document
      x += _elem.offsetLeft - _elem.scrollLeft
      _elem = _elem.parentNode
    x

  ###
  Calculates the visible top position of an element
  ###
  _getVisibleTopPosition: (_id)->
    _elem = @_elements[_id]
    y = 0
    while _elem != document
      y += _elem.offsetTop - _elem.scrollTop
      _elem = _elem.parentNode
    y

  ###
  Returns the visible position of the element as a [ left, top ] tuble
  ###
  getVisiblePosition: (_id)->
    [ @_getVisibleLeftPosition(_id), @_getVisibleTopPosition(_id) ]
  
  ###
  Returns the opacity on the element as a number equaling or between 0 and 1
  ###
  getOpacity: (_id)->
    _elem = @_elements[_id]
    _opacity = @_getComputedStyle( _elem, 'opacity' )
    parseFloat( _opacity )
  
  ###
  Sets ActiveX alpha filter for IE6-8
  ###
  _setOpacityIE: (_id, _opacity)->
    _prevFilter = @getStyle( _id, 'filter', true )
    if _opacity == 1
      @_elements[_id].style.setAttribute('filter', _prevFilter.replace(/alpha([^)]*)/gi, '') )
    else
      @_elements[_id].style.setAttribute('filter', _prevFilter.replace(/alpha([^)]*)/gi, '') + 'alpha(opacity='+(_opacity*100)+')')
    null

  ###
  Sets the opcity of the element as a number equaling or between 0 and 1
  ###
  setOpacity: (_id, _opacity)->
    if BROWSER_TYPE.ie6 or BROWSER_TYPE.ie7 or BROWSER_TYPE.ie8
      @_setOpacityIE( _id, _opacity)
    else
      @_elements[_id].style.setProperty('opacity', _opacity.toString(), '')
    null
  
  ###
  Wrapper for getStyle, returns an integer number instead of a string
  ###
  getIntStyle: (_id, _key)->
    parseInt( @getStyle(_id, _key), 10 )
  
  ###
  Sets box coordinates [ x, y, width, height ]
  ###
  setBoxCoords: (_id, _coords)->
    [ x, y, w, h ] = _coords
    @setStyle( _id, 'left', x+'px' )
    @setStyle( _id, 'top', y+'px' )
    @setStyle( _id, 'width', w+'px' )
    @setStyle( _id, 'height', h+'px' )
    null
  
  ###
  Gets box coordinates [ x, y, width, height )
  ###
  getBoxCoords: (_id)->
    [ x, y ] = @getPosition( _id )
    [ w, h ] = @getSize( _id )
    [ x, y, w, h ]
  
  ###
  Computes extra size (padding and border size) of element
  ###
  _getExtraSize: (_id, _side)->
    @getIntStyle( _id, 'padding-'+_side ) + @getIntStyle( _id, 'border-'+_side+'-width' )

  ###
  Returns left-side padding and border size
  ###
  _getExtraLeftWidth: (_id)->
    @_getExtraSize( _id, 'left' )
  
  ###
  Returns right-side padding and border size
  ###
  _getExtraRightWidth: (_id)->
    @_getExtraSize( _id, 'right' )

  ###
  Returns top-side padding and border size
  ###
  _getExtraTopWidth: (_id)->
    @_getExtraSize( _id, 'top' )
  
  ###
  Returns right-side padding and border size
  ###
  _getExtraBottomWidth: (_id)->
    @_getExtraSize( _id, 'bottom' )
  
  ###
  Returns extra width of element (caused by padding and borders)
  ###
  getExtraWidth: (_id)->
    @_getExtraSize( _id, 'left' ) + @_getExtraSize( _id, 'right' )
  
  ###
  Returns extra height of element (caused by padding and borders)
  ###
  getExtraHeight: (_id)->
    @_getExtraSize( _id, 'top' ) + @_getExtraSize( _id, 'bottom' )
  
  ###
  Sets delay between refreshes based on the target frame rate
  ###
  setFPS: (_fps)->
    @_minDelay = 1000/_fps
    @_minDelay = @ELEMTickerInterval if @_minDelay < @ELEMTickerInterval
    null
  
  ###
  Sets slowness (weighted additional multiplier for slow browsers; frame-skip)
  The d-efault 1.0 does not change the FPS, larger numbers gives more time for logic by skipping frames
  ###
  setSlowness: (_slow)->
    @_slowness = _slow
    null
  
  ###
  Sets the idle delay in ms
  This is the maximum time between setting a style or property into the buffer and flushing the buffer to the DOM
  ###
  setIdleDelay: (_idleDelay)->
    @_idleDelay = _idleDelay
    null
  
  ###
  A flag that signals iefix (for IE6) if it needs to re-run or not
  ###
  _ieFixesNeeded: false

  ###
  Applies fixes for IE6
  ###
  _ieFixes: ->
    iefix._traverseTree()
    @_ieFixesNeeded = false
    null

  ###
  Re-sets the flushLoop
  ###
  _resetFlushLoop: (_delay, _timeDelay)->
    _timeDelay = _delay unless _timeDelay
    @_timer = setTimeout( ->
      ELEM.flushLoop( _delay )
    , _timeDelay )
    null
  
  ###
  Computes a default delay time based on various params
  ###
  _defaultDelay: ->
    _delay = Math.round( @_slowness * (@_flushTime / @_flushCounter) ) # + @ELEMTickerInterval ??
    _delay = @_minDelay if _delay < @_minDelay or !_delay
    _delay

  ###
  Flushes buffered styles and properties into the DOM
  ###
  flushLoop: (_delay)->
    _delay = @_defaultDelay() unless _delay?
    @_ieFixes() if BROWSER_TYPE.ie6 and @_ieFixesNeeded
    clearTimeout(@_timer)
    if @_flushing
      _delay *= 2
      @_resetFlushLoop( _delay )
    else
      unless @_needFlush
        # go into 'sleep mode'
        @_ieFixes() if BROWSER_TYPE.ie6 and @_ieFixesNeeded
        @_resetFlushLoop( _delay, @_idleDelay )
        return
      _delay = @_defaultDelay()
      @_flushing = true
      @_resetFlushLoop( _delay )
    @_performFlush()
    @_flushing = false
    null
  
  # Alias for flushLoop
  flush: ->
    @flushLoop()
  
  ###
  Performs the flush of flushLoop
  ###
  _performFlush: ->
    _flushStartTime = new Date().getTime()
    @_flushTime -= _flushStartTime
    _loopMaxL = @_elemTodo.length
    if _loopMaxL > 0
      _currTodo = @_elemTodo.splice( 0, _loopMaxL )
      for i in [ 1.._loopMaxL ]
        @_flushLoopFlushed++
        _id = _currTodo.shift()
        if _id == null
          console.log('no id:',_id)
          continue
        @_elemTodoH[_id] = false
        @_flushStyleCache( _id )
        @_flushAttrCache( _id )
    @_flushCounter++
    @_flushTime += new Date().getTime()
    @_needFlush = @_elemTodo.length != 0 # unless @_needFlush
    null
  
  ###
  Flushes the attribute cache
  ###
  _flushAttrCache: (_id)->
    _attrTodo = @_attrTodo[_id]
    return null if _attrTodo.length == 0
    _attrCache = @_attrCache[_id]
    _elem = @_elements[_id]
    _loopMaxL = _attrTodo.length
    _currTodo = _attrTodo.splice( 0, _loopMaxL )
    for i in [ 1.._loopMaxL ]
      _key = _currTodo.shift()
      _val = _attrCache[_key]
      _elem[_key] = _val
    null
  
  ###
  Gets an element attribute directly from the element
  ###
  _getAttrDirect: (_id, _key)->
    _elem = @_elements[_id]
    _elem[_key]

  ###
  Gets a named element attribute from the cache or selectively direct
  ###
  getAttr: (_id, _key, _noCache)->
    return null if not @_attrCache[_id]?
    _val = @_attrCache[_id][_key]
    if _noCache or not _val?
      _val = @_getAttrDirect( _id, _key )
      @_attrCache[_id][_key] = _val
    _val
  
  ###
  Sets a named element attribute into the cache and buffer or selectively direct
  ###
  setAttr: (_id, _key, _value, _noCache)->
    return null unless @_elements[_id]? # item is deleted
    _attrTodo = @_attrTodo[_id]
    _attrCache = @_attrCache[_id]
    @_elements[_id][_key] = _value if _noCache
    _reCache = ( _value != @getAttr( _id, _key ) )
    if _reCache or _noCache
      _attrCache[_key] = _value
      unless _noCache
        _attrTodo.push( _key ) if _attrTodo.indexOf( _key ) == -1
        unless @_elemTodoH[_id]
          @_elemTodo.push( _id )
          @_elemTodoH[ _id ] = true
          @_checkNeedFlush()
    true
  
  ###
  Deletes a named element attribute
  ###
  delAttr: (_id, _key)->
    return null unless @_elements[_id]? # item is deleted
    _attrTodo = @_attrTodo[_id]
    _attrCache = @_attrCache[_id]
    delete _attrCache[_key]
    @_elements[_id].removeAttribute( _key )
    _todoIndex = _attrTodo.indexOf( _key )
    _attrTodo.splice( _todoIndex, 1 ) unless _todoIndex == -1
    @_checkNeedFlush()
    true

  ###
  Checks if the element has a named CSS className
  ###
  hasClassName: (_id, _className)->
    return null unless @_elements[_id]? # item is deleted
    _classNames = @_elements[_id].className.split(' ')
    return _classNames.indexOf( _className ) != -1
  
  ###
  Adds a named CSS className to the element
  ###
  addClassName: (_id, _className)->
    return null unless @_elements[_id]? # item is deleted
    unless @hasClassName( _id, _className )
      _elem = @_elements[_id]
      if _elem.className.trim() == ''
        _elem.className = _className
      else
        _classNames = _elem.className.trim().split(' ')
        _classNames.push(_className)
        _elem.className = _classNames.join(' ')
    null
  
  ###
  Removes a named CSS className of the element
  ###
  delClassName: (_id, _className)->
    return null unless @_elements[_id]? # item is deleted
    if @hasClassName( _id, _className )
      _elem = @_elements[_id]
      _classNames = _elem.className.split(' ')
      _classNames.splice( _classNames.indexOf( _className ), 1 )
      _elem.className = _classNames.join(' ')
    null

  removeClassName: (_id, _className)->
    console.log( 'ELEM.removeClassName is deprecated. Use ELEM.delClassName instead.' )
    return @delClassName( _id, _className )

  ###
  Checks if buffers need to be flushed
  ###
  _checkNeedFlush: ->
    unless @_needFlush
      @_needFlush = true
      unless @_flushing
        clearTimeout( @_timer)
        @_resetFlushLoop( @_minDelay )
    null
  
  ###
  Low-level style property setter
  ###
  _setElementStyle: (_elem, _key, _value)->
    _elem.style.setProperty( _key, _value, '' )
    null
  
  ###
  Camelizes string (mostly used for IE attribute name conversions)
  ###
  _camelize: (_str)->
    _str.replace( /((-)([a-z])(\w))/g, ($0, $1, $2, $3, $4)->
      $3.toUpperCase()+$4
    )
  
  ###
  Decamelizes string (used for js property to css property conversion)
  ###
  _deCamelize: (_str)->
    _str.replace( /(([A-Z])(\w))/g, ($0, $1, $2, $3)->
      '-'+$2.toLowerCase()+$3
    )
  
  ###
  IE version of _setElementStyle
  ###
  _setElementStyleIE: (_elem, _key, _value)->
    _elem.style[@_camelize(_key)] = _value
    if BROWSER_TYPE.ie6
      unless iefix._traverseStyleProperties.indexOf(_key) == -1
        @_ieFixesNeeded = true
    null

  ###
  Sets and buffers the named style attribute value or selectively direct
  ###
  setStyle: (_id, _key, _value, _noCache)->
    return null unless @_elements[_id]? # item is deleted
    if _id == undefined
      console.log('ERROR; undefined id in ELEM#setStyle(',_id, _key, _value, _noCache,')')
    _noCache = true if BROWSER_TYPE.ie9
    try
      _cached = @_styleCache[_id]
    catch e
      console.error( e, this )
    _elem = @_elements[_id]
    if _cached == undefined
      @_initCache( _id )
      _cached = @_styleCache[_id]
    _key = @_deCamelize( _key )
    unless _value == _cached[_key]
      _cached[_key] = _value
      if _noCache
        if _key == 'opacity'
          @setOpacity( _id, _value )
        else
          @_setElementStyle( _elem, _key, _value )
      else
        _styleTodo = @_styleTodo[_id]
        _styleTodo.push( _key ) if _styleTodo.indexOf( _key ) == -1
        unless @_elemTodoH[_id]
          @_elemTodo.push( _id )
          @_elemTodoH[_id] = true
          @_checkNeedFlush()
    null
  
  ###
  Creates a new element inside another element
  ###
  make: (_targetId, _tagName, _options)->
    _targetId = 0 if _targetId == undefined
    if _tagName == undefined
      _tagName = 'DIV'
    else
      _tagName = _tagName.toUpperCase()
    _elem = document.createElement( _tagName )
    _id = @_add( _elem )
    @_initCache( _id )
    unless _options == undefined
      if _options.attrs
        for _attr in _options.attrs
          @setAttr( _id, _attr[0], _attr[1], true )
    @_elements[_targetId].appendChild(_elem)
    _id

  ###
  Returns inner size of the browser window as [ width, height ]
  ###
  windowSize: ->
    _size = [ window.innerWidth, window.innerHeight ]
    if _size[0] == undefined or _size[1] == undefined
      _docElem = document.documentElement
      _size = [ _docElem.clientWidth, _docElem.clientHeight ]
    _size
  
  ###
  Returns computed style of element
  ###
  _getComputedStyle: (_elem, _key)->
    document.defaultView.getComputedStyle( _elem, null ).getPropertyValue( _key )
  
  ###
  IE version of _getComputedStyle
  ###
  _getComputedStyleIE: (_elem, _key)->
    return _elem.clientWidth if _key == 'width'
    return _elem.clientHeight if _key == 'height'
    _elem.currentStyle[@_camelize(_key)]
  
  ###
  Gets the named element style attribute value.
  ###
  getStyle: (_id, _key, _noCache)->
    return null unless @_styleCache[_id]?
    _cached = @_styleCache[_id]
    _key = @_deCamelize(_key)
    if _cached[_key] == undefined or _noCache
      if _key == 'opacity'
        _value = @getOpacity(_id)
      else
        _value = @_getComputedStyle( @_elements[_id], _key )
        _value = -1 if _key == 'z-index' and _value == 'auto'
      _cached[_key] = _value
    else
      _value = _cached[_key]
    _value

  ###
  Style buffer flushing method
  ###
  _flushStyleCache: (_id)->
    _elem = @_elements[_id]
    return unless _elem
    _styleTodo = @_styleTodo[_id]
    _cached = @_styleCache[_id]
    _loopMaxP = _styleTodo.length
    return null if _loopMaxP == 0
    _currTodo = _styleTodo.splice( 0, _loopMaxP )
    for i in [ 1.._loopMaxP ]
      _key = _currTodo.shift()
      if _key == 'opacity'
        @setOpacity( _id, _cached[_key] )
      else
        console.log( 'invalid style key:',_elem, _key, _cached) unless _key
        @_setElementStyle( _elem, _key, _cached[_key] )
    null
  
  ###
  Final phase of startup, when document is loaded
  ###
  _init: ->
    RSenceInit() if RSenceInit?
    if BROWSER_TYPE.ie
      @_getComputedStyle = @_getComputedStyleIE
      @_setElementStyle = @_setElementStyleIE
    @bind( document.body ) unless @_timer
    if BROWSER_TYPE.symbian
      TestClass = HClass.extend({test:true, constructor:null})
      # The Symbian JS implementation gets corrupted if the page is reloaded (loaded from cache), this tests that:
      unless TestClass.test
        if confirm('Your Web Browser fails. Please restart the S60 Web Browser or install a better browser.\nDo you want to download and install Opera Mobile now?')
          location.href = 'http://www.opera.com/download/get.pl?sub=++++&id=32792&location=270&nothanks=yes'
        # Can't do anything with such badly broken js engine
        return
    @_flushDomLoadQueue() until @_initDone
    @_resetFlushLoop( @_minDelay )
    null
  
  ###
  Runs a cmd
  ###
  _runCmd: (_cmd)->
    _type = ( typeof _cmd )
    if _type == 'function'
      _cmd.call()
    else if _type == 'string'
      console.log("Evaluation of LOAD strings no longer supported. Please convert to anonymous function: "+_cmd)
    null

  ###
  Processes the queue for tasks to run upon completion of document load
  ###
  _flushDomLoadQueue: ->
    if @_domLoadQueue.length == 0
      @_initDone = true
      return
    else
      @_runCmd( @_domLoadQueue.shift() )
    null
  
  ###
  Does browser version checks and starts the document loaded check poll
  ###
  _warmup: ->
    _ua = navigator.userAgent
    _browserType = BROWSER_TYPE
    _browserType.opera    = _ua.indexOf('Opera') != -1
    _browserType.safari   = _ua.indexOf('KHTML') != -1
    _browserType.symbian  = _ua.indexOf('SymbianOS') != -1
    _browserType.chrome   = _ua.indexOf('Chrome') != -1
    _isIE = document.all and not _browserType.opera
    if _isIE
      _browserType.ie  = _isIE
      _browserType.ie6 = _ua.indexOf('MSIE 6') != -1
      _browserType.ie7 = _ua.indexOf('MSIE 7') != -1
      _browserType.ie8 = _ua.indexOf('MSIE 8') != -1
      _browserType.ie9 = _ua.indexOf('MSIE 9') != -1
      _browserType.ie10 = _ua.indexOf('MSIE 10') != -1
      unless _browserType.ie9
        _browserType.ie9 = _browserType.ie10 # IE 10 is treated like IE 9
    _browserType.mac = _ua.indexOf('Macintosh') != -1
    _browserType.win = _ua.indexOf('Windows') != -1
    _browserType.firefox = _ua.indexOf('Firefox') != -1
    _browserType.firefox2 = _ua.indexOf('Firefox/2.') != -1
    _browserType.firefox3 = _ua.indexOf('Firefox/3.') != -1
    _browserType.firefox4 = _browserType.firefox and not _browserType.firefox2 and not _browserType.firefox3
    @_domWaiter()
    null
  
  ###
  Adds tasks to run when the document load check is completed
  ###
  _domLoader: (_cmd)->
    if ELEM._initDone
      ELEM._runCmd( _cmd )
    else
      ELEM._domLoadQueue.push( _cmd )
    null

  ###
  Checks if the document is fully loaded
  ###
  _domWaiter: ->
    if BROWSER_TYPE.ie6 or BROWSER_TYPE.ie7 or BROWSER_TYPE.ie8
      if location.protocol == 'https:'
        _ie_proto = 'src=//0'
      else
        _ie_proto = 'javascript:void(0)'
      _s1 = '<scr'
      _s2 = 'ipt id=__ie_onload defer src='
      _s3 = '></scr'
      _s4 = 'ipt>'
      document.write(_s1+_s2+_ie_proto+_s3+_s4)
      document.getElementById('__ie_onload').onreadystatechange = ->
        if this.readyState == 'complete'
          clearTimeout( ELEM._domLoadTimer )
          ELEM._domLoadStatus = true
          ELEM._init()
      return
    else if BROWSER_TYPE.safari and document.readyState == 'complete'
      ELEM._domLoadStatus = true
    else if document.body
      ELEM._domLoadStatus = true
    
    if ELEM._domLoadStatus
      clearTimeout( @_domLoadTimer )
      BROWSER_TYPE.symbian = document.body.innerHTML == 'fastinnerhtml!' if BROWSER_TYPE.symbian
      @_init()
    else
      ELEM._domLoadTimer = setTimeout( =>
        ELEM._domWaiter()
      , 10 )
    null
ELEM.reset()

ElementManager = ELEM

LOAD = ELEM._domLoader

ELEM._warmup()
