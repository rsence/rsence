HSearchField = HTextControl.extend
  componentName: 'searchfield'
  markupElemNames: HTextControl.prototype.markupElemNames.concat( ['help'] )
  controlDefaults: HTextControl.prototype.controlDefaults.extend
    helpText: 'Search...'
  
  textFocus: ->
    @base()
    @setStyleOfPart( 'help', 'display', 'none' )
    
  drawSubviews: ->
    if @typeChr( @value ) == 's' and @value.length > 0
      @setStyleOfPart( 'help', 'display', 'none' )
