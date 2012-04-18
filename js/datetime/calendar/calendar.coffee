##   RSence
 #   Copyright 2009-2011 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##

#### = Description
  ## Use HCalendar to display a month calendar that displays days as columns
  ## and weeks as rows. Its value is a date/time number specified in seconds
  ## since or before epoch (1970-01-01 00:00:00 UTC).
  ####
HCalendar = HControl.extend
  
  componentName: 'calendar'
  markupElemNames: [ 'control', 'state', 'label', 'value', 'prevMonth', 'nextMonth' ]

  ## Disable the mouseWheel event to prevent prev/next -month switching with
  ## the mouse wheel or equivalent content-scrolling user interface gesture
  defaultEvents:
    mouseWheel: true
    # click: true
  
  ## Calls HCalendar#nextMonth or HCalendar#prevMonth based on delta change
  ## of the mouseWheel event
  mouseWheel: (_delta)->
    if _delta < 0
      @nextMonth()
    else
      @prevMonth()
  
  ## Simple click-through for the themed hyperlinks
  click: ->
    false
  
  drawSubviews: ->
    _this = @
    Event.observe( @elemOfPart( 'prevMonth' ), 'click', ->
      _this.prevMonth()
    )
    Event.observe( @elemOfPart( 'nextMonth' ), 'click', ->
      _this.nextMonth()
    )

  ## Returns an array of week day names starting with the short name of the word "week".
  ## The default locale returns: ['Wk','Mon','Tue','Wed','Thu','Fri','Sat','Sun']
  ## See HLocale for more details
  localizedDays: ->
    _str = HLocale.dateTime.strings
    _arr = HVM.clone( _str.weekDaysShort )
    _arr.push( _arr.shift() )
    _arr.unshift( _str.weekShort )
    _arr
  
  _destroyWeekDayElems: ->
    if @_weekDayElems?
      for _elemId in @_weekDayElems
        ELEM.del( _elemId )
      @_weekDayElems = null

  ## Refreshes the week days header
  refreshWeekDays: ->
    @_destroyWeekDayElems()
    _dayNames = @localizedDays()
    _availWidth = @rect.width-2
    _dayWidth = Math.floor( _availWidth/8 )
    _leftOffset = ( _availWidth % 8 ) - 1
    _parentElem = @markupElemIds.label
    _dayElems = []
    for _dayName, i in _dayNames
      _dayElem = ELEM.make( _parentElem )
      ELEM.setHTML( _dayElem, _dayName )
      ELEM.setStyle( _dayElem, 'width', _dayWidth+'px' )
      _left = i * _dayWidth + _leftOffset
      ELEM.setStyle( _dayElem, 'left', _left+'px' )
    @_weekDayElems = _dayElems
  
  ## Calls #refreshWeekDays when theme is applied
  refreshLabel: ->
    @refreshWeekDays() if @markupElemIds? and not @_weekDayElems?
  
  ## Calculates the first and last week of the month of the _date
  ##
  ## Params:
  ## - _date:  A Date instance to check date range from
  ##
  ## Returns:
  ## [Object]: {
  ##   week: {
  ##     firstDate: [Date]
  ##     lastDate:  [Date]
  ##     firstNum:  [Number]
  ##     lastNum:   [Number]
  ##     count:     [Number]
  ##   }
  ##   month: {
  ##     firstDate: [Date]
  ##     lastDate:  [Date]
  ##   }
  ## }
  calendarDateRange: (_date)->
    _monthFirst = @firstDateOfMonth( _date )
    _monthLast  = @lastDateOfMonth( _date )
    _weekFirst  = @firstDateOfWeek( _monthFirst )
    _weekLast   = @lastDateOfWeek( _monthLast )
    _firstWeekNum = @week( _weekFirst )
    _lastWeekNum  = @week( _weekLast )
    _weeks = _firstWeekNum - _lastWeekNum
    if _weeks == 5 
      if _weekFirst.getDate() == 1
        _weekFirst = new Date( _weekFirst.getTime() - @msWeek )
      else
        _weekLast = new Date( _weekLast.getTime() + @msWeek )
    else if _weeks == 4
      _weekFirst = new Date( _weekFirst.getTime() - @msWeek )
    return {
      week: {
        firstDate: _weekFirst
        lastDate:  _weekLast
        firstNum: _firstWeekNum
        lastNum: _lastWeekNum
        count: _weeks
      }
      month: {
        firstDate: _monthFirst
        lastDate:  _monthLast
      }
    }

  ## Calls #drawCalendar when the value is changed
  refreshValue: ->
    @drawCalendar( @date() )
  
  ## Draws the next month
  nextMonth: ->
    _dateNext = new Date( @viewMonth[0], @viewMonth[1]+1, 1 )
    _dateMs = _dateNext.getTime() - @tzMs(_dateNext)
    @drawCalendar( new Date(_dateMs) )
  
  ## Drows the prev month
  prevMonth: ->
    _datePrev = new Date( @viewMonth[0], @viewMonth[1]-1, 1 )
    _dateMs = _datePrev.getTime() - @tzMs(_datePrev)
    @drawCalendar( new Date(_dateMs) )
  
  ## Stores the currently viewed year and month
  viewMonth: [ 1970, 0 ]

  ## Shows a pulldown menu for month selection
  monthMenu: ->
    return unless HMiniMenu?
    _calendar = this
    _monthValues = []
    for _monthName, i in HLocale.dateTime.strings.monthsLong
      _monthValues.push( [ i, _monthName ] )
    _rect = ELEM.getBoxCoords( @_monthMenu )
    _rect[0] += 20
    _rect[2] = 80 if _rect[2] < 80
    HMiniMenu.extend(
      _killAfterRefresh: false
      menuHide: ->
        @base()
        _menu = @
        _menu._killAfterRefresh = true
        COMM.Queue.push( ->
          if _menu._killAfterRefresh
            _menu.refreshValue()
        )
        return true;
      refreshValue: ->
        @base()
        if @_killAfterRefresh
          @_killAfterRefresh = false
          _calendar.setValue( _calendar.setMonth( @value ) )
          if _calendar.month() != @value
            _calendar.setValue( _calendar.setMday( 30 ) )
            _calendar.setValue( _calendar.setMonth( this.value ) )
          if _calendar.month() != @value
            _calendar.setValue( _calendar.setMday( 29 ) )
            _calendar.setValue( _calendar.setMonth( @value ) )
          if _calendar.month() != this.value
            _calendar.setValue( _calendar.setMday( 28 ) )
            _calendar.setValue( _calendar.setMonth( @value ) )
          _menu = this
          COMM.Queue.push( ->
            _menu.die()
          )
    ).new( _rect, @,
      value: @month()
      initialVisibility: true
    ).setListItems( _monthValues )
  
  ## Shows a text field for year selection
  yearMenu: ->
    _calendar = @
    _rect = ELEM.getBoxCoords( @_yearMenu )
    _rect[0] += 20
    _rect[2] = 40 if _rect[2] < 40
    _rect[3] = 20
    HNumericTextControl.extend(
      refreshValue: ->
        @base()
        _calendar.setValue( _calendar.setYear( @value ) )
      textBlur: ->
        @base()
        _year = this
        COMM.Queue.push( ->
          _year.die() if _year.markupElemIds?
        )
      textEnter: ->
        @base()
        _returnKeyPressed = EVENT.status[ EVENT.keysDown ].indexOf( 13 ) != -1
        _noKeysPressed = EVENT.status[ EVENT.keysDown ].length == 0
        if _returnKeyPressed or _noKeysPressed
          ELEM.get( @markupElemIds.value ).blur()
    ).new( _rect, @,
      value: @year()
      minValue: -38399
      maxValue: 38400
      focusOnCreate: true
      refreshOnInput: false
    )
  
  _destroyCalendarElems: ->
    if @_drawCalendarElems?
      for _elemId in @_drawCalendarElems
        ELEM.del( _elemId )
      @_drawCalendarElems = null
  
  die: ->
    @_destroyWeekDayElems()
    @_destroyCalendarElems()
    @base()

  ## Draws the calendar with the date open given as input.
  ##
  ## Params:
  ## - _date: The date on which calendar UI is opened at.
  drawCalendar: (_date)->
    @_destroyCalendarElems()
    _date = @date() unless ( _date instanceof Date )
    _calendarDateRange = @calendarDateRange( _date )
    _monthFirst = _calendarDateRange.month.firstDate
    _monthLast  = _calendarDateRange.month.lastDate
    _firstDate  = _calendarDateRange.week.firstDate
    _lastDate   = _calendarDateRange.week.lastDate
    _availWidth = @rect.width - 2
    _availHeight = @rect.height - 36
    _leftPlus = ( _availWidth % 8 ) - 2
    _topPlus  = ( _availHeight % 6 )
    _colWidth = Math.floor( _availWidth / 8 )
    _rowHeight = Math.floor( _availHeight / 6 )
    _parentElem = @markupElemIds.value
    ELEM.setStyle( _parentElem, 'visibility', 'hidden', true )
    _elems = []
    _this = @
    for _row in [0..5]
      _weekElem = ELEM.make( _parentElem )
      _elems.push( _weekElem )
      ELEM.addClassName( _weekElem, 'calendar_weeks_week_row' )
      ELEM.setStyle( _weekElem, 'width', _availWidth+'px' )
      ELEM.setStyle( _weekElem, 'height', _availHeight+'px' )
      _top = (_row*_rowHeight)+_topPlus
      ELEM.setStyle( _weekElem, 'top', _top+'px' )
      for _col in [0..7]
        if _col == 0
          _colDate = new Date( _firstDate.getTime() + (_row*@msWeek) + (_col*@msDay) )
          _colMs   = _colDate.getTime()
          _colElem = ELEM.make( _weekElem )
          _elems.push( _colElem )
          ELEM.addClassName( _colElem, 'calendar_weeks_week_col_wk' )
          ELEM.setStyle( _colElem, 'left', '0px' )
          ELEM.setStyle( _colElem, 'width', _colWidth+'px' )
          ELEM.setStyle( _colElem, 'height', _rowHeight+'px' )
          ELEM.setStyle( _colElem, 'line-height', _rowHeight+'px' )
          ELEM.setHTML( _colElem, @week( _colDate ) )
        else
          _colDate = new Date( _firstDate.getTime() + (_row*@msWeek) + ((_col-1)*@msDay) )
          _colMs   = _colDate.getTime()
          _colSecs = Math.round( _colMs/1000 )
          _colElem = ELEM.make( _weekElem, 'a' )
          _elems.push( _colElem )
          if @value >= _colSecs and @value < _colSecs+86400
            ELEM.addClassName( _colElem, 'calendar_weeks_week_col_sel' )
          else if _colDate < _monthFirst or _colDate > _monthLast
            ELEM.addClassName( _colElem, 'calendar_weeks_week_col_no' )
          else
            ELEM.addClassName( _colElem, 'calendar_weeks_week_col_yes' )
          ELEM.setAttr( _colElem, '_colSecs', _colSecs )
          Event.observe( ELEM.get( _colElem ), 'click', ->
            _this.setValue( @_colSecs )
          )
          # ELEM.setAttr( _colElem, 'href', "javascript:HSystem.views[#{@viewId}].setValue(#{_colSecs})" )
          _left = (_col*_colWidth+_leftPlus)
          ELEM.setStyle( _colElem, 'left', _left+'px' )
          ELEM.setStyle( _colElem, 'width', (_colWidth-1)+'px' )
          ELEM.setStyle( _colElem, 'height', (_rowHeight-1)+'px' )
          ELEM.setStyle( _colElem, 'line-height', _rowHeight+'px' )
          ELEM.setHTML( _colElem, @mday( _colDate ) )
    ELEM.setStyle( _parentElem, 'visibility', 'inherit' )
    _stateElem = @markupElemIds.state

    @_monthMenu = ELEM.make( _stateElem, 'span' )#, 'a' )
    _elems.push( @_monthMenu )
    # ELEM.setAttr( @_monthMenu, 'href', "javascript:HSystem.views[#{@viewId}].monthMenu()" )
    Event.observe( ELEM.get( @_monthMenu ), 'click', ( -> _this.monthMenu() ), false )
    ELEM.setHTML( @_monthMenu, @monthName( _date ) )

    _spacer = ELEM.make( _stateElem, 'span' )
    _elems.push( _spacer )
    ELEM.setHTML( _spacer, '&nbsp;' )

    @_yearMenu = ELEM.make( _stateElem, 'span' )#, 'a' )
    _elems.push( @_yearMenu )
    Event.observe( ELEM.get( @_yearMenu ), 'click', ( -> _this.yearMenu() ), false )
    # ELEM.setAttr( @_yearMenu, 'href', "javascript:HSystem.views[#{@viewId}].yearMenu()" )
    ELEM.setHTML( @_yearMenu, @year( _date ) )

    @viewMonth = [ _monthFirst.getUTCFullYear(), _monthFirst.getUTCMonth() ]
    @_drawCalendarElems = _elems

HCalendar.implement( HDateTime )
