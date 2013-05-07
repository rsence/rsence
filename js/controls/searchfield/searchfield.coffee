HSearchField = HTextControl.extend
  componentName: 'searchfield'
  markupElemNames: HTextControl.prototype.markupElemNames.concat( ['help'] )
  controlDefaults: HTextControl.prototype.controlDefaults.extend
    helpText: 'Search...'
  
  textFocus: ->
    @base()
    @setStyleOfPart( 'help', 'visibility', 'hidden' )
