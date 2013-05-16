HTable = HControl.extend
  componentName: 'table'
  markupElemNames: [ 'header', 'subview', 'grid' ]
  defaultEvents:
    resize: true
  controlDefaults: HControlDefaults.extend
    tableType: 'rows' # 'cols' not supported yet
    constructor: (_view)->
      @headerCols = false unless @headerCols? # array of strings 
      @sortDescending = [] unless @sortDescending? # column sorting by index; true for descending; false for ascending
      @colWidths = [] unless @colWidths? # widths by column index; default 'auto'
      @colClasses = {} unless @colClasses? # class by column index
      @defaultColOptions = {} unless @defaultColOptions? # fallback default column options
      @colOptions = {} unless @colOptions? # column class constructor options by column index
      @defaultColClass = HStringView unless @defaultColClass? # fallback default column class
    sortCol: 0 # the default sort column
    useCellGrid: false # whether to use colored cells or not
    cellBgColor: '#eee' # the average bg color
    cellBgColorDiff: '#080808' # color to add/subtract for even/odd col/row
    cellBorderWidth: 1 # cell border width in pixels
    cellBorderColor: '#fff' # cell border color
  _destroyHeader: ->
    if @headerCols?
      _table = @
      for _elemId, i in @headerCols
        Event.stopObserving(ELEM.get(_elemId),'click',@sortFns[i])
        ELEM.del(_elemId)
      delete @headerCols
      delete @headerSizes
      delete @sortFns
  sortByCol: (_col)->
    if @options.sortCol == _col
      if @options.sortDescending[_col]?
        @options.sortDescending[_col] = !@options.sortDescending[_col]
      else
        @options.sortDescending[_col] = false
    else
      @options.sortCol = _col
    @drawHeader()
    @refreshTable()
    # if @colViews?
    #   for _size, i in @headerSizes
    #     _colView = @colViews[i]
    #     _colView.rect.setLeft(_size[0])
    #     _colView.rect.setWidth(_size[1])
    #     _colView.drawRect()
  _initCellBgColors: ->
    _color1 = @options.cellBgColor
    _colorDiff = @options.cellBgColorDiff
    if _color1 == 'transparent'
      @_cellBgColors = [ 'transparent', 'transparent', 'transparent' ]
      return
    else if not _colorDiff
      @_cellBgColors = [ _color1, _color1, _color1 ]
      return
    _color0 = @hexColorSubtract( _color1, _colorDiff )
    _color2 = @hexColorAdd( _color1, _colorDiff )
    @_cellBgColors = [ _color0, _color1, _color2 ]
  _cellBgColorOf: (_row, _col)->
    _colorIndex = (_row%2) + (1-_col%2)
    @_cellBgColors[_colorIndex]
  _drawCellStyles: ->
    if @_bgCells?
      for _bgCellId in @_bgCells
        ELEM.del( _bgCellId )
      delete @_bgCells
    return unless @colViews?
    # the border width offset calculations are fubar; refactor when time available
    @_bgCells = []
    _parent = @markupElemIds.grid
    _leftOffset = @headerSizes[0][0]
    @_initCellBgColors()
    _borderSize = @options.cellBorderWidth
    _borderColor = @options.cellBorderColor
    _borderStyle = _borderSize+'px solid '+_borderColor
    _heightOffset = _borderSize
    _height = 24-_heightOffset
    _topAdd = 24
    _halfBorderWidth = Math.floor(_borderSize*0.5)
    _widthOffset = 6-_borderSize-_halfBorderWidth
    _borderLeftOffset = 0-_halfBorderWidth
    for _colView, _colNum in @colViews
      [ _left, _width ] = @headerSizes[_colNum]
      if _colNum == 0
        _left = _borderLeftOffset
        _width += _leftOffset+_borderLeftOffset
        _width -= _halfBorderWidth if _borderSize % 2 == 1
      else
        _left += _borderLeftOffset-_widthOffset
        _left -= _borderSize if _borderSize > 1
        _width += _widthOffset
        _width += _halfBorderWidth
      _top = _borderLeftOffset
      for _row, _rowNum in @_rows
        @_bgCells << ELEM.make(
          _parent, 'div',
          styles:
            backgroundColor: @_cellBgColorOf(_rowNum,_colNum)
            border: _borderStyle
            top: _top+'px'
            left: _left+'px'
            width: _width+'px'
            height: _height+'px'
        )
        _top += _topAdd
  drawHeader: ->
    _elemIds = []
    _sizes = []
    _autoWidths = []
    _sortFns = []
    _left = 6
    _table = @
    for _headerCol, i in @options.headerCols
      _left += 6
      _elemId = ELEM.make( @markupElemIds.header, 'div' )
      @options.sortDescending[i] = false unless @options.sortDescending[i]?
      ELEM.addClassName(_elemId,'table_header_column')
      ELEM.flush()
      if @options.sortCol == i
        _headerCol += '<div class="sort">'
        if @options.sortDescending[i]
          _headerCol += '&#9660;'
        else
          _headerCol += '&#9650;'
        _headerCol += '</div>'
        _width = -6 #26
      else
        _width = -6 #26
        # ELEM.setStyle(_elemId,'font-weight','normal',true)
      if @options.colWidths[i]?
        if @options.colWidths[i] == 'auto'
          _autoWidths.push(i)
        else
          _width += @options.colWidths[i]
      else
        _width += @stringWidth(_headerCol, null, _elemId)
      _sizes.push([_left,_width])
      ELEM.setAttr(_elemId,'sortcol',i)
      ELEM.setHTML(_elemId,_headerCol)
      _sortFns.push((e)->
        _table.sortByCol(@sortcol)
        e.preventDefault()
        true
      )
      Event.observe(ELEM.get(_elemId),'click',_sortFns[i])
      _left += _width
      _elemIds.push( _elemId )
    if _autoWidths.length > 0
      _autoWidth = Math.floor(( @rect.width - _left )/_autoWidths.length)
    _plusLeft = 0
    for [_left, _width], i in _sizes
      _elemId = _elemIds[i]
      ELEM.setStyle(_elemId,'left',_left+_plusLeft+'px')
      _sizes[i][0] = _left+_plusLeft
      if _autoWidths.indexOf(i) != -1
        _width = _autoWidth - 6
        # _width += 20 if i == @options.sortCol
        _sizes[i][1] = _width
        _plusLeft += _autoWidth
      ELEM.setStyle(_elemId,'width',_width+'px')
    @_destroyHeader()
    ELEM.flush()
    @headerCols = _elemIds
    @headerSizes = _sizes
    @sortFns = _sortFns
  resize: ->
    @drawHeader()
    for _colNum in [0..@headerCols.length-1]
      _left = @headerSizes[_colNum][0]
      _width = @headerSizes[_colNum][1]
      @colViews[_colNum].rect.offsetTo( _left, 0 )
      @colViews[_colNum].rect.setWidth( _width )
      @colViews[_colNum].drawRect()
    @_drawCellStyles()
  drawSubviews: ->
    if @options.headerCols
      @drawHeader()
    else
      @setStyleOfPart('body','top',0)
  _findClassInNameSpace: (_className)->
    if typeof _className == 'function' and _className.hasAncestor? and _className.hasAncestor( HControl )
      return _className
    else if typeof _className == 'string' and window[_className]?
      return window[_className] # should have more elegant lookup
    console.warn( 'HTable#'+'_'+'findClassNameInNamespace: No such className => ', _className, ', using default => ',@options.defaultColClass )
    return @options.defaultColClass
  _getClassNameAndValueOfCol: (_col, _colNum)->
    if @options.colOptions[_colNum]?
      _colOption = @options.colOptions[_colNum]
    else
      _colOption = @cloneObject( @options.defaultColOptions )
    if @options.colClasses[_colNum]?
      _colClass = @options.colClasses[_colNum]
      if typeof _colClass == 'function' and _colClass.hasAncestor? and _colClass.hasAncestor( HControl )
        return [ _colClass, _colOption ]
      else if _colClass instanceof Object and not _colClass.hasAncestor?
        for _className of _colClass
          return [ @_findClassInNameSpace( _className ), _colClass[_className] ] if @typeChr(_className) == 's'
      else if @typeChr(_colClass) == 's'
        return [ @_findClassInNameSpace( _colClass ), _colOption ]
    return [ @_findClassInNameSpace( @options.defaultColClass ), _colOption ]
  _destroyRows: ->
    for _row, _rowNum in @_rows
      for _col, _colNum in _row
        _col.die()
        _row[_colNum]
    @_rows = []
    @_rowsDrawn = false
  filterRow: (_value)->
    return false
  sortTableRows: ->
    _rowsVisible = 0
    _col = @options.sortCol
    _sortDescending = @options.sortDescending
    _desc = _sortDescending[_col]
    _rowSort = []
    for _row, i in @_rows
      _rowSort.push( [ @value[i], _row ] )
    _nextCols = []
    if @options.sortOrder? and @options.sortOrder[_col]?
      if @typeChr( @options.sortOrder[_col] ) == 'a'
        _nextCols = @cloneObject( @options.sortOrder[_col] )
      else
        _nextCols = [ @options.sortOrder[_col] ]
    else
      _nextCols = []
    _rowSorter = (_row1, _row2, _col, _nextCols, _desc)->
      _r1 = _row1[0][_col]
      _r2 = _row2[0][_col]
      while _r1 == _r2 and _nextCols.length > 0
        _nextCol = _nextCols.shift()
        _desc = _sortDescending[_nextCol]
        _r1 = _row1[0][_nextCol]
        _r2 = _row2[0][_nextCol]
      return 0 if _r1 == _r2
      if _desc
        return 1 if _r1 < _r2
      else
        return 1 if _r1 > _r2
      return -1
    _rowSort.sort( (_row1,_row2)->
      _rowSorter(_row1, _row2, _col, HVM.clone(_nextCols), _desc)
    )
    _top = 0
    _rowHeight = 24
    for [ _value, _row ], _rowNum in _rowSort
      if @filterRow(_value)
        for _col in _row
          _col.hide()
      else
        _rowsVisible += 1
        for _col, _colNum in _row
          _col.show()
          _col.rect.offsetTo( 0, _top )
          _col.drawRect()
        _top += _rowHeight
    @_rowsVisible = _rowsVisible
  refreshTableRows: (_newData)->
    return unless @headerCols?
    _top = 0
    _rowHeight = 24
    if @colViews?
      _colViews = @colViews
    else
      _colViews = []
      for _colNum in [0..@headerCols.length-1]
        _left = @headerSizes[_colNum][0]
        _width = @headerSizes[_colNum][1]
        _colViews[_colNum] = HView.nu( [ _left, 0, _width, 1 ], @ )
      @colViews = _colViews
    if @_rowsDrawn and not _newData
      @sortTableRows()
    else if @_rowsDrawn and _newData and @_rows.length == @value.length
      for _row, _rowNum in @value
        for _col, _colNum in _row
          _ctrl = @_rows[_rowNum][_colNum]
          _ctrl.setValue( _col )
      @sortTableRows()
    else
      if @_rowsDrawn
        @_destroyRows()
      _rows = []
      for _row, _rowNum in @value
        _rows[_rowNum] = []
        for _col, _colNum in _row
          [ _colClass, _colOpts ] = @_getClassNameAndValueOfCol(_col, _colNum)
          _colOpts.value = _col
          _colOpts.tableRow = _rowNum
          _colOpts.tableCol = _colNum
          _ctrl = _colClass.new(
            [ 0, _top, null, _rowHeight, 0, null ],
            @colViews[_colNum],
            _colOpts
          )
          _rows[_rowNum][_colNum] = _ctrl
        _top += _rowHeight
      for _colView in _colViews
        _colView.rect.setHeight(_top)
        _colView.drawRect()
      @_rows = _rows
      @_rowsDrawn = true
      @sortTableRows()
  refreshTableCols: (_newData)->
    console.warn('HTable#refreshTableCols is not implemented yet!')
  refreshTable: (_newData)->
    if @options.tableType == 'rows'
      @refreshTableRows(_newData)
    else if @options.tableType == 'cols'
      console.log('ERROR; refreshTable: tableType \'cols\' not supported!')
      @refreshTableCols(_newData)
    @_drawCellStyles() if @options.useCellGrid and _newData
  refreshValue: ->
    if @value instanceof Array
      @refreshTable( true )
