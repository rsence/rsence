HChatPanel = HScrollView.extend
  textSelectable: true
  controlDefaults: HScrollView.prototype.controlDefaults.extend
    scrollX: false
    scrollY: 'auto'
    selfOrientation: 'right'
    otherOrientation: 'left'
  defaultEvents:
    resize: true
  resize: ->
    @refreshValue()
  refreshValue: ->
    return unless @typeChr(@value) == 'h'
    if @speechBubbles
      for _bubble in @speechBubbles
        _bubble.die()
    if @userIcons
      for _userIcon in @userIcons
        _userIcon.die()
    @speechBubbles = []
    @userIcons = []
    _users = @value.users
    _themeUser = {}
    _defaultBubble = @cloneObject( HSpeechBubble.prototype.controlDefaults.prototype.colors )
    for _userId, _user of _users
      _colors = @cloneObject( _defaultBubble )
      if _user.color_bg?
        _gradientStart = _user.color_bg
        _gradientStep1 = @hexColorSubtract( _gradientStart, '#111' )
        _gradientStep2 = @hexColorSubtract( _gradientStep1, '#030303' )
        _gradientEnd   = @hexColorAdd( _gradientStep2, '#111' )
        _colors.start = _gradientStart
        _colors.end = _gradientEnd
        _colors.steps = [
          [ 9, _gradientStep1 ]
          [ 91, _gradientStep2 ]
        ]
      if _user.color_fg?
        _colors.text = _user.color_fg
      _themeUser[_userId] = _colors
    _topPx = 3
    _prevDate = new Date().getTime()/1000
    _minWidth = @rect.width - 80
    for [ _userId, _text, _date ], i in @value.lines
      _nextLine = @value.lines[i+1]
      if _nextLine?
        _nextSame = ( _userId == _nextLine[0] )
      else
        _nextSame = false
      _prevLine = @value.lines[i-1]
      if _prevLine?
        _prevSame = ( _userId == _prevLine[0] )
      else
        _nextSame = false
      if _date?
        # _date = new Date(_date*1000)
        _prevDate = _date
      else
        _date = _prevDate
      _userInfo = _users[_userId]
      if _userInfo.self
        _orientation = @options.selfOrientation
      else
        _orientation = @options.otherOrientation
      if _orientation == 'right'
        _rectBubble = [ 120, _topPx, null, 40, 40, null ]
      else
        _rectBubble = [ 40, _topPx, null, 40, 120, null ]
      _bubble = HSpeechBubble.new( _rectBubble, @,
        autoHeight: true
        autoWidth: true
        colors: _themeUser[_userId]
        orientation: _orientation
        value: _text
      )
      @speechBubbles.push( _bubble )
      _bottomPx = _bubble.rect.bottom
      _bottomDiff = _bottomPx - _topPx
      if _bottomDiff < 48 and not _prevSame
        _bubble.offsetBy( 0, 48 - _bottomDiff )
      _bottomPx = _bubble.rect.bottom
      _topPx = _bottomPx+3
      if _nextSame
        _bubble.setStyleOfPart('directionbg','display','none')
        _bubble.setStyleOfPart('directionupperfg','display','none')
        _bubble.setStyleOfPart('directionlowerfg','display','none')
      else
        _dateStr = HLocale.dateTime.formatDateTime( _date )
        if _userInfo.name?
          _name = _userInfo.name
        else
          _name = _userId
        if _orientation == 'right'
          _rectLabel = [ 120, _topPx, null, 18, 4, null ]
          _rectIcon  = [ null, _topPx-34, 32, 32, 2, null ]
          _styleLabel = { textAlign: 'right' }
          _labelText = _dateStr+'&nbsp;&bull;&nbsp;<b>'+_name+'</b>'
        else
          _rectLabel = [ 4, _topPx, null, 18, 120, null ]
          _rectIcon = [ 2, _topPx-34, 32, 32 ]
          _styleLabel = { textAlign: 'left' }
          _labelText = '<b>'+_name+'</b>&nbsp;&bull;&nbsp;'+_dateStr
        _iconStyle =
          border: '2px solid black'
          borderRadius: '5px'
        if _userInfo.icon?
          _iconSrc = _userInfo.icon
        else
          _iconSrc = @getThemeGfxFile('user_anon.png')
        _icon = HImageView.new( _rectIcon, @,
          style: _iconStyle
          value: _iconSrc
        )
        @userIcons.push( _icon )
        _label = HLabel.new( _rectLabel, @,
          style: _styleLabel
          label: _labelText
        )
        @userIcons.push( _label )
      @scrollToBottom()
