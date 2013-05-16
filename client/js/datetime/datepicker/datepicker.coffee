HDatePicker = HTextControl.extend
  controlDefaults: HTextControl.prototype.controlDefaults.extend
    fieldFormat: 'YYYY-MM-DD'
    refreshAfter: 3
    preserveTime: true
    preserveDate: false
    calendarPicker: false
    calendarHorizontalAlign: 'right'
    calendarVerticalAlign: 'top'
  valueToField: (_value)->
    _date = moment.unix(_value).utc()
    @_datePreserve = [ _date.year(), _date.month(), _date.date() ] if @options.preserveDate
    if @options.preserveTime and @_timePreserve? and @calendar? and not @calendar.menuItemView.isHidden
      @_dateRestore(_date)
      @setValue(_date.unix())
    else if @options.preserveTime
      @_timePreserve = [ _date.hours(), _date.minutes(), _date.seconds() ] if @options.preserveTime
    _date.format(@options.fieldFormat)
  _dateRestore: (_date)->
    if @_datePreserve? and @options.preserveDate
      [ _year, _month, _mday ] = @_datePreserve
      _date.year( _year )
      _date.month( _month )
      _date.date( _mday )
      until _date.isValid()
        _mday = _mday - 1
        _date.date( _mday )
    else if _date.year() == 0 and _date.month() == 0 and _date.date() == 1
      _date.year(1970)
      _date.month(0)
      _date.date(1)
    if @_timePreserve? and @options.preserveTime
      [ _hours, _minutes, _seconds ] = @_timePreserve
      _date.hours( _hours )
      _date.minutes( _minutes )
      _date.seconds( _seconds )
  fieldToValue: (_value)->
    _date = moment.utc(_value,@options.fieldFormat)
    return @value unless _date.isValid()
    @_dateRestore(_date)
    _date.unix()
  refreshValue: ->
    @base()
    @calendar.setValue(@value) if @calendar?
    @setStyleOfPart('value','textAlign','right')
  drawSubviews: ->
    @base()
    if @options.calendarPicker
      @setStyleOfPart('label','right','26px')
      @calendar = HCalendarPulldown.extend(
        refreshValue: ->
          @base()
          @parent.setValue(@value)
      ).new( [null,0,24,24,1,null], @,
        value: @value
        valueObj: @valueObj
        todayStart: @options.todayStart
        calendarHorizontalAlign: @options.calendarHorizontalAlign
        calendarVerticalAlign: @options.calendarVerticalAlign
        preserveTime: @options.preserveTime
        style:
          borderLeft: '1px dotted #666'
      )
      @calendar.bringToFront()
