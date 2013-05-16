HThemeManager = HClass.extend
  
  allInOneCSS: true # temporary solution until new theme is crafted

  currentTheme: 'default'

  constructor: null
  
  # Properties by theme name
  currentThemePath: null
  themePaths: {}
  themes: []
  
  # Set the graphics loading path of the the themeName
  setThemePath: (_clientPrefix)->
    @currentThemePath = _clientPrefix
    for _themeName in @themes
      @setupThemePath( _themeName )

  setupAllInOneCSS: (_themeName)->
    _cssText = ''
    for _componentName of @themeCSSTemplates[_themeName]
      _cssText += @buildCSSTemplate(@, _themeName, _componentName)
    _style = @useCSS( _cssText )
    _cssTitle = 'rsence/'+_themeName
    _style.title = _cssTitle

  setupThemePath: (_themeName)->
    return unless @currentThemePath?
    return if @themePaths[_themeName]?
    _clientThemePath = [ @currentThemePath, _themeName ].join('/') + '/gfx/'
    @themePaths[_themeName] = _clientThemePath
    @setupAllInOneCSS(_themeName) if @allInOneCSS
  
  # CSS Templates and CSS Template methods per theme name
  themeCSSTemplates: {}

  # Sets the css template data per theme, all at once
  setThemeCSSTemplates: (_themeName, _themeCSS)->
    @themeCSSTemplates[_themeName] = _themeCSS 

  # HTML Templates and HTML Template methods per theme name
  themeHTMLTemplates: {}

  # Sets the css template data per theme, all at once
  setThemeHTMLTemplates: (_themeName, _themeHTML)->
    @themeHTMLTemplates[_themeName] = _themeHTML 

  # Set the theme data, this is called by the serverside client_pkg suite
  installThemeData: (_themeName, _themeCSS, _themeHTML)->
    @themes << _themeName unless ~@themes.indexOf(_themeName)
    @setThemeCSSTemplates(_themeName, _themeCSS)
    @setThemeHTMLTemplates(_themeName, _themeHTML)
    @setupThemePath(_themeName)

  # Simple reference counting by theme name and component name, when 0, clear the style sheet
  cssCountUsedBy: {}
  cssByThemeAndComponentName: {}
  incrementCSSUseCount: (_themeName, _componentName)->
    @cssCountUsedBy[_themeName] = {} unless @cssCountUsedBy[_themeName]?
    _themeCollection = @cssCountUsedBy[_themeName]
    if _themeCollection[_componentName]?
      _themeCollection[_componentName] += 1
    else
      _themeCollection[_componentName] = 1

  decrementCSSUseCount: (_themeName, _componentName)->
    unless @cssCountUsedBy[_themeName]?
      console.log("Warning in decrementCSSUseCount; the theme #{_themeName} wasn't initialized (called with componentName: #{_componentName})")
      return
    _themeCollection = @cssCountUsedby[_themeName]
    unless _themeCollection[_componentName]?
      console.log("Warning in decrementCSSUseCount; the componentName #{_componentName} wasn't initialized (called with themeName: #{_themeName})")
      return
    if _themeCollection[_componentName] == 1
      _style = @cssByThemeAndComponentName[_themeName][_componentName]
      _style.parentNode.removeChild( _style )
      delete _themeCollection[_componentName]
    else
      _themeCollection[_componentName] -= 1

  _buildThemePath: (_fileName,_themeName)->
    _fileName = _fileName.substring(1) while _fileName[0] == '/'
    @themePaths[_themeName]+_fileName
  _variableMatch: /#\{([a-z0-9]+?)\}/
  _assignmentMatch: /\$\{([a-z0-9]+?)\}/
  buildHTMLTemplate: ( _view, _themeName, _componentName )->
    unless @themeHTMLTemplates[_themeName]?
      console.log('Theme not installed:',_themeName)
      return ''
    return '' unless @themeHTMLTemplates[_themeName][_componentName]?
    [_tmplJS, _tmplHTML] = @themeHTMLTemplates[_themeName][_componentName]
    # console.log( 'tmplJS:', _tmplJS )
    # console.log( 'tmplHTML:', _tmplHTML )
    _rect   = _view.rect
    _callArgs = [_view.elemId.toString(), _rect.width, _rect.height]
    _tmplHTML = _tmplHTML.replace(/\]I\[/g,_callArgs[0]).replace(/\]W\[/g,_callArgs[1]).replace(/\]H\[/g,_callArgs[2])
    return _tmplHTML if _tmplJS.length == 0
    [_variableMatch, _assignmentMatch] = [@_variableMatch, @_assignmentMatch]
    # _ID     = _view.elemId.toString()
    # _WIDTH  = _rect.width
    # _HEIGHT = _rect.height
    _callValue = (_id,_isAssign)->
      _id = parseInt(_id,36)-10
      try
        _out = _tmplJS[_id].apply(_view,_callArgs)
        return '' if _isAssign
        return _out
      catch e
        console.log "HTML Template error(#{e}) in #{_themeName}/#{_componentName}: #{_tmplJS[_id]}"
        return ''
    while _assignmentMatch.test(_tmplHTML)
      _tmplHTML = _tmplHTML.replace( _assignmentMatch, _callValue( RegExp.$1, true ) )
    while _variableMatch.test(_tmplHTML)
      _tmplHTML = _tmplHTML.replace( _variableMatch, _callValue( RegExp.$1 ) )
    # console.log('tmplHTML:',_tmplHTML) if _componentName == 'tab'
    return _tmplHTML

  buildCSSTemplate: ( _context, _themeName, _componentName )->
    unless @themeCSSTemplates[_themeName]?
      console.log('Theme not installed:',_themeName)
      return ''
    return '' unless @themeCSSTemplates[_themeName][_componentName]?
    [_tmplJS, _tmplCSS] = @themeCSSTemplates[_themeName][_componentName]
    return _tmplCSS if _tmplJS.length == 0
    [_variableMatch, _assignmentMatch] = [@_variableMatch, @_assignmentMatch]
    # console.log( 'tmplJS:', _tmplJS )
    # console.log( 'tmplCSS:', _tmplCSS )
    @getThemeGfxFile = (_fileName)-> @_buildThemePath(_fileName,_themeName)
    @getCssFilePath = (_fileName)->
      "url(#{@_buildThemePath(_fileName,_themeName)})"
    _callValue = (_id,_isAssign)->
      _oid = _id
      _id = parseInt(_id,36)-10
      try
        _out = _tmplJS[_id].apply(_context)
        return '' if _isAssign
      catch e
        console.log "CSS Template error(#{e}) in #{_themeName}/#{_componentName}: #{_tmplJS[_id]}"
        _out = ''
      return _out
    while _assignmentMatch.test(_tmplCSS)
      _tmplCSS = _tmplCSS.replace( _assignmentMatch, _callValue( RegExp.$1, false ) )
    while _variableMatch.test(_tmplCSS)
      _tmplCSS = _tmplCSS.replace( _variableMatch, _callValue( RegExp.$1 ) )
    delete @getCssFilePath
    delete @getThemeGfxFile
    # console.log('tmplCSS:',_tmplCSS)
    return _tmplCSS

  resourcesFor: (_view, _themeName, _noHTML)->
    @setupThemePath(_themeName) unless @themePaths[_themeName]?
    _themeName = @currentTheme unless _themeName?
    return '' unless _view.componentName?
    _componentName = _view.componentName
    unless @allInOneCSS # temporarily disabled until theme refactored
      @cssByThemeAndComponentName[_themeName] = {} unless @cssByThemeAndComponentName[_themeName]?
      _themeCollection = @cssByThemeAndComponentName[_themeName]
      unless _themeCollection[_componentName]?
        _style = @useCSS( @buildCSSTemplate(@, _themeName, _componentName) )
        _cssTitle = 'rsence/'+_themeName+'/'+_componentName
        _style.title = _cssTitle
        _themeCollection[_componentName] = _style
      @incrementCSSUseCount(_themeName, _componentName)
      return if _noHTML
      for _ancestor in _view.ancestors
        break unless _ancestor.componentName?
        @resourcesFor( _ancestor, _themeName, true )
    return @buildHTMLTemplate( _view, _themeName, _componentName )

  freeResourcesFor: (_view, _themeName, _noRecursion)->
    _themeName = @currentTheme unless _themeName?
    return unless _view.componentName?
    _componentName = _view.componentName
    @decrementCSSUseCount( _themeName, _componentName )
    return if _noRectursion
    for _ancestor in _view.ancestors
      break unless _ancestor.componentName?
      @freeResourcesFor( _ancestor, _themeName )

  # Creates a new cascading style sheet element and set its content with css. Returns the element.
  useCSS: (_cssText)->
    if BROWSER_TYPE.ie
      # Internet Explorer (at least 6.x; check what 7.x does)
      _style         = document.createStyleSheet()
      _style.cssText = _cssText
    else
      # Common, standard <style> tag generation in <head>
      _style        = document.createElement('style')
      _style.type   = 'text/css'
      _style.media  = 'all'
      
      _head = document.getElementsByTagName('head')[0]
      _head.appendChild(_style)
      
      if BROWSER_TYPE.safari
        # This is how to do it in KHTML browsers
        _style.appendChild( document.createTextNode(_cssText) )
      else
        # This works for others (add more checks, if problems with new browsers)
        _style.textContent = _cssText

      _style
