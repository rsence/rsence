HCalendarPulldown = HMiniMenu.extend
  componentName: 'calendar_pulldown'
  defaultEvents:
    click: true
    resize: true
    preserveTime: true
  controlDefaults: HMiniMenu.prototype.controlDefaults.extend
    calendarHorizontalAlign: 'right'
    calendarVerticalAlign: 'top'
    label: ''
  calendarRect: ->
    [ x, y ] = [ @pageX(), @pageY() ]
    if @options.calendarHorizontalAlign == 'right'
      x = x - 200 + 15
    else
      x = x + @rect.width - 7
    if @options.calendarVerticalAlign == 'bottom'
      y = y - 200 + 2
    else
      y = y + 7
    return [ x, y, 200, 200 ]
  repositionMenuItems: ->
    @menuItemView.setRect( @calendarRect() )
    @menuItemView.drawRect()
  menuShow: ->
    @base()
    @setLabel( @options.labelHide )
  menuHide: ->
    @base()
    @setLabel( @options.labelShow )
  setValueObj: (_valueObj)->
    @base(_valueObj)
    if @calendar?
      @calendar.valueObj.release( @calendar )
      @valueObj.bind(@calendar)
  refreshValue: ->
    _date = moment(@value).utc()
    @_timePreserve = [ _date.hours(), _date.minutes(), _date.seconds() ] if @options.preserveTime
    @calendar.setValue(@value)
  drawSubviews: ->
    @menuItemView = HView.new( @calendarRect(), @app,
      visible: false
      logicParent: @
      style:
        overflow: 'visible'
    )
    HControl.extend(
      defaultEvents:
        click: true
      click: ->
        @parent.options.logicParent.menuHide()
        true
    ).new( [ 0, 0, 200, 20 ], @menuItemView )
    @calendar = HCalendar.extend(
      refreshValue: ->
        @base()
        @parent.options.logicParent.setValue(@value)
    ).new( [ 0, 20, 200, 180 ], @menuItemView,
      value: @value
      valueObj: @valueObj
      preserveTime: @options.preserveTime
      todayStart: @options.todayStart
      style:
        boxShadow: '0 0 5px #333'
        borderRadius: '5px'
    )
HCalendarPullDown = HCalendarPulldown
HCalendarMenu = HCalendarPulldown
HCalenderButton = HCalendarPulldown
