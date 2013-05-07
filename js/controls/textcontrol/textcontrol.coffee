#### = Description
  ## HTextControl is a control unit that represents an editable input 
  ## line of text. Commonly, textcontrol is used as a single text field in 
  ## the request forms. HTextControl view or theme can be changed; the 
  ## default_theme is used by default.
  ##
  ## = Instance variables
  ## +type+::   '[HTextControl]'
  ## +value+::  The string that is currently held by this object.
  ####
HTextControl = HControl.extend

  componentName: 'textcontrol'

  # allows text selection
  textSelectable: true
  
  defaultEvents:
    textEnter: true
    contextMenu: true
  
  controlDefaults: HControlDefaults.extend
    labelStyle:
      textIndent: 0
      fontSize: '10px'
      color: '#666'
    refreshAfter:   0.2 # 200ms
    refreshOnBlur:  true
    refreshOnInput: true
    refreshOnIdle:  true
    focusOnCreate:  false

  ## This flag is true, when the text input field has focus.
  hasTextFocus: false
  
  ### = Description
  ## The contextMenu event for text input components is not prevented by default.
  ###
  contextMenu: -> true

  ### = Description
  ## The refreshLabel method sets the title property of the text
  ## field, essentially creating a tooltip using the label.
  ###
  refreshLabel: ->
    return unless @label
    if @markupElemIds? and @markupElemIds.label?
      @setAttrOfPart( 'label', 'title', @label )
    else
      return
    if @_labelView?
      @_labelView.setLabel( @label )
    else
      @_labelView = HLabel.new( [ 2, 2, 2000, 28 ], @,
        label: @label
        style: @options.labelStyle
      )
    _labelWidth = @_labelView.stringWidth( @label, null, @_labelView.markupElemIds.value )+4
    @_labelView.rect.setWidth( _labelWidth )
    @_labelView.drawRect()
    if @componentName == 'textarea'
      @setStyleOfPart('value','textIndent',_labelWidth+'px')
    else
      @setStyleOfPart('label','left',_labelWidth+'px')
  
  drawSubviews: ->
    ELEM.setStyle(@elemId,'overflow','visible')
    @base()
    if @options.focusOnCreate
      @getInputElement().focus()
      @setSelectionRange( @value.length, @value.length ) if @typeChr(@value) == 's'
  
  lostActiveStatus: ->
    if @markupElemIds? && @markupElemIds.value?
      ELEM.get( @markupElemIds.value ).blur()
      @textBlur()
  
  setStyle: (_name, _value, _cacheOverride)->
    @base(_name, _value, _cacheOverride)
    return unless @markupElemIds? && @markupElemIds.value?
    @setStyleOfPart('value', _name, _value, _cacheOverride)
  
  setEnabled: (_flag)->
    @base(_flag)
    if @markupElemIds? and @markupElemIds.value?
      ELEM.get(@markupElemIds.value).disabled = !@enabled
  
  _clipboardEventTimer: null
  _getChangeEventFn: ->
    _this = @
    return (e)->
      clearTimeout( _this._clipboardEventTimer ) if _this._clipboardEventTimer
      _this._clipboardEventTimer = setTimeout( ( -> _this.clipboardEvent() ), 200 )
      return true
  _changedFieldValue: (_value1,_value2)-> _value1 != _value2
  _updateValueFromField: ->
    _validatedValue = @validateText( @getTextFieldValue() )
    if @_changedFieldValue( _validatedValue, @value )
      @setValue( _validatedValue )
  
  clipboardEvent: ->
    @_updateValueFromField()
    clearTimeout( @_clipboardEventTimer )
    @_clipboardEventTimer = null
  
  _changeEventFn: null
  _clearChangeEventFn: ->
    if @_changeEventFn
      Event.stopObserving( ELEM.get(@markupElemIds.value), 'paste', @_changeEventFn )
      Event.stopObserving( ELEM.get(@markupElemIds.value), 'cut', @_changeEventFn )
      @_changeEventFn = null

  _setChangeEventFn: ->
    @_clearChangeEventFn() if @_changeEventFn
    @_changeEventFn = @_getChangeEventFn()
    Event.observe( ELEM.get(@markupElemIds.value), 'paste', @_changeEventFn )
    Event.observe( ELEM.get(@markupElemIds.value), 'cut', @_changeEventFn )
  
  ### = Description
  ## Special event for text entry components.
  ## Called when the input field gains focus.
  ##
  ###
  textFocus: ->
    EVENT.changeActiveControl( @ )
    @hasTextFocus = true
    @_setChangeEventFn()
    true

  ### = Description
  ## Special event for text entry components.
  ## Called when the input field loses focus.
  ###
  textBlur: ->
    @hasTextFocus = false
    @_clearChangeEventFn()
    if @options.refreshOnBlur
      @_updateValueFromField()
      @refreshValue()
    true
  
  idle: ->
    @refreshAfter() if @hasTextFocus and @options.refreshOnIdle and @options.refreshOnInput
  
  refreshValue: ->
    @setTextFieldValue( @value )

  ### = Description
  ## Placeholder method for validation of the value.
  ##
  ###
  validateText: (_value)->
    @fieldToValue(_value)
  
  ### = Description
  ## Returns the input element or null, if no input element created (yet).
  ###
  getInputElement: ->
    return ELEM.get( @markupElemIds.value ) if @markupElemIds and @markupElemIds.value
    null
  
  ### = Description
  ## Returns the value of the input element.
  ###
  getTextFieldValue: ->
    _inputElement = @getInputElement()
    if _inputElement?
      return _inputElement.value
    else
      return ''
  
  valueToField: (_value)-> _value
  fieldToValue: (_value)-> _value

  ### = Description
  ## Sets the value of the input element.
  ##
  ## = Parameters
  ## +_value+::  The value to set.
  ###
  setTextFieldValue: (_value)->
    _inputElement = @getInputElement()
    return unless _inputElement?
    [ _selectionStart, _selectionEnd ] = @getSelectionRange()
    _value = @valueToField(_value)
    _inputElement.value = _value if _inputElement.value != _value.toString()
    @setSelectionRange( _selectionStart, _selectionEnd )
  
  # returns a random number prefixed and suffixed with '---'
  _randomMarker: -> '---'+Math.round((1+Math.random())*10000)+'---'
  
  die: ->
    @getInputElement().blur() if @hasTextFocus
    clearTimeout(@_refreshTimer) if @_refreshTimer
    @_refreshTimer = null
    @_clearChangeEventFn()
    @base()
  
  ### = Description
  ## Returns the selection (or text cursor position) of the input element
  ## as an +Array+ like +[ startOffset, endOffset ]+.
  ###
  getSelectionRange: ->
    _inputElement = @getInputElement()
    if _inputElement == null or @hasTextFocus == false
      _rangeArr = [ 0, 0 ]
    ## Other browsers
    else if _inputElement.selectionStart
      _rangeArr = [ _inputElement.selectionStart, _inputElement.selectionEnd ]
    ## Internet Explorer:
    else if document.selection
      # create a range object
      _range = document.selection.createRange()
      # original range text
      _rangeText = _range.text
      _rangeLength = _rangeText.length
      # make a copy of the text and replace \r\n with \n
      _origValue = _inputElement.value.replace(/\r\n/g, "\n")
      # create random marker to replace the text with
      _marker = @_randomMarker()
      # re-generate marker if it's found in the text.
      _marker = @_randomMarker() while ~_origValue.indexOf( _marker )
      _markerLength = _marker.length
      # temporarily set the text of the selection to the unique marker
      _range.text = _marker
      _markerValue = _inputElement.value.replace(/\r\n/g, "\n")
      _range.text = _rangeText
      _markerIndex = _markerValue.indexOf( _marker )
      _rangeArr = [ _markerIndex, _markerIndex + _rangeLength ]
    ## No support:
    else
      _rangeArr = [ 0, 0 ]
    return _rangeArr
  
  _refreshTimer: null
  _lastFieldValue: null
  refreshAfter: ->
    _fieldValue = @getTextFieldValue()
    if @_lastFieldValue == null or _fieldValue != @_lastFieldValue
      @_lastFieldValue = _fieldValue
      if @_refreshTimer
        clearTimeout( @_refreshTimer )
        @_refreshTimer = null
      if @options.refreshAfter and @options.refreshAfter > 0
        _this = @
        @_refreshTimer = setTimeout( (->
          _this._updateValueFromField()
        ), @options.refreshAfter*1000 )
      else
        @_updateValueFromField()
    # @setValue( @validateText( @getTextFieldValue() ) )
    # @refreshValue()

  ### = Description
  ## Sets the selection (or text cursor position) of the input element.
  ##
  ## = Parameters
  ## +_selectionStart+::   The start of the selection (or an Array containing
  ##                       both start and end offset, see below).
  ## +_selectionEnd+::     The end offset of the selection.
  ##
  ## = Note
  ## - +_selectionStart+ can also be given as an +Array+
  ##   like +[ startOffset, endOffset ]+.
  ## - If the +_selectionEnd+ is omitted, no selection is made; the text 
  ##   cursor is positioned at the startOffset instead.
  ###
  setSelectionRange: ( _selectionStart, _selectionEnd )->
    if @typeChr( _selectionStart ) == 'a'
      _selectionEnd = _selectionStart[1];
      _selectionStart = _selectionStart[0];
    unless _selectionEnd?
      _selectionEnd = _selectionStart
    _inputElement = @getInputElement()
    return if _inputElement == null or @hasTextFocus == false
    # Internet Explorer
    if _inputElement.createTextRange
      _range = _inputElement.createTextRange()
      _range.move( 'character', _selectionStart, _selectionEnd )
      _range.select()
    # Other browsers:
    else if _inputElement.selectionStart
      _inputElement.setSelectionRange( _selectionStart, _selectionEnd )
  
  ### = Description
  ## Receives the +textEnter+ event to update the value
  ## based on what's (potentially) entered in the text input field.
  ###
  textEnter: ->
    @refreshAfter() if @options.refreshOnInput
    return false
