HDatePicker = HTextControl.extend
  controlDefaults: HTextControl.prototype.controlDefaults.extend
    fieldFormat: 'YYYY-MM-DD'
    refreshAfter: 3
    preserveTime: true
    preserveDate: false
    calendarPicker: false
  valueToField: (_value)->
    _date = moment.unix(_value).utc()
    @_timePreserve = [ _date.hours(), _date.minutes(), _date.seconds() ] if @options.preserveTime
    @_datePreserve = [ _date.year(), _date.month(), _date.date() ] if @options.preserveDate
    _date.format(@options.fieldFormat)
  fieldToValue: (_value)->
    _date = moment.utc(_value,@options.fieldFormat)
    return @value unless _date.isValid()
    if @_datePreserve? and @options.preserveDate
      [ _year, _month, _mday ] = @_datePreserve
      _date.year( _year )
      _date.month( _month )
      _date.date( _mday )
      until _date.isValid()
        _mday = _mday - 1
        _date.date( _mday )
    if @_timePreserve? and @options.preserveTime
      [ _hours, _minutes, _seconds ] = @_timePreserve
      _date.hours( _hours )
      _date.minutes( _minutes )
      _date.seconds( _seconds )
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
        style:
          borderLeft: '1px dotted #666'
      )
      @calendar.bringToFront()
