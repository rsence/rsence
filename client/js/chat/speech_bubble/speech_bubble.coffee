HSpeechBubble = HControl.extend
  textSelectable: true
  componentName: 'speech_bubble'
  markupElemNames: [
    'bg'
    'subview'
    'value'
    'directionbg'
    'directionupperfg'
    'directionlowerfg'
  ]
  controlDefaults: HControlDefaults.extend
    orientation: 'left'
    colors:
      start: '#ffffff'
      steps: [
        [ 9, '#efefef' ]
        [ 91, '#e0e0e0' ]
      ]
      end:   '#efefef'
      text: '#333'
    autoHeight: false
    autoWidth:  false
  adjustHeight: ->
    if @options.autoHeight or @options.autoWidth
      _size = ELEM.getScrollSize( @markupElemIds.value ) 
    if @options.autoHeight
      _height = _size[1] + 3
      @rect.setHeight( _height )
    if @options.autoWidth
      _width = _size[0] + 25
      @rect.setWidth( _width )
    @drawRect() if @options.autoHeight or @options.autoWidth
  setOrientationClass: (_orientation)->
    if _orientation == 'left'
      ELEM.addClassName( @elemId, 'orientation_left' )
      ELEM.delClassName( @elemId, 'orientation_right' )
    else
      ELEM.addClassName( @elemId, 'orientation_right' )
      ELEM.delClassName( @elemId, 'orientation_left' )
  refreshProperties: ->
    _colors = @options.colors
    [ _bgKey, _bgVal ] = ELEM._linearGradientStyle(_colors)
    @setOrientationClass(@options.orientation)
    @setStyleOfPart( 'directionbg', 'borderColor', "transparent transparent #{_colors.text} transparent" )
    @setStyleOfPart( 'directionupperfg', 'borderColor', "transparent transparent #{_colors.steps[_colors.steps.length-1][1]} transparent" )
    @setStyleOfPart( 'directionlowerfg', 'borderColor', "transparent transparent #{_colors.end} transparent" )
    @setStyleOfPart( 'bg', _bgKey, _bgVal )
    @setStyleOfPart( 'bg', 'borderColor', _colors.text )
    @setStyleOfPart( 'value', 'color', _colors.text )
  refresh: ->
    @base()
    @refreshProperties() if @markupElemIds?
  refreshValue: ->
    @base()
    @adjustHeight() if @options.autoHeight
