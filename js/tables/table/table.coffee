HTable = HControl.extend({
  componentName: 'table'
  markupElemNames: ['bg','header','content','header-columns']
  _resetElements: ->
    if @_tableElements
      ELEM.del( _id ) for _id in @_tableElements
    @_tableElements = []
    @_rowElements = []
    @_colElements = []
  _createTableRow: ( _row, i )->
    console.log( 'row:', _row, ', i:',i )

  _refreshTableContents: ->
    _value = @value
    @_createTableRow( _row, i ) for _row, i in _value 
  refreshValue: ->
    @_refreshTableContents() if @drawn and ( @value.constructor == Array )
})

