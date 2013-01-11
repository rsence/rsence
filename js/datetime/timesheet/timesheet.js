/*   RSence
 *   Copyright 2009 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

HLocale.components.HTimeSheet = {
  strings: {
    newItemLabel: 'New item'
  }
};


var//RSence.DateTime
HTimeSheet = HControl.extend({
  
  debug: false,
  
  localeStrings: HLocale.components.HTimeSheet.strings,
  componentName: 'timesheet',
  markupElemNames: [
    'label', 'value', 'timeline'
  ],
  
  defaultEvents: {
    draggable: true,
    click: true,
    doubleClick: true,
    resize: true
  },
  
  controlDefaults: HControlDefaults.extend({
    timeStart: 0,      // 1970-01-01 00:00:00
    timeEnd:   86399,  // 1970-01-01 23:59:59
    tzOffset:  0,      // timezone offset in seconds; eg: 7200 => UTC+2
    itemMinHeight: 16,
    hideHours: false,
    autoLabel: false,  // automatically set the label to the date
    autoLabelFn: 'formatDate',
    autoLabelFnOptions: { longWeekDay: true },
    notchesPerHour: 4,    // by default 1/4 of an hour precision (15 minutes)
    itemOffsetLeft: 64,   // Theme settings; don't enter in options
    itemOffsetRight: 0,   // Theme settings; don't enter in options
    itemOffsetTop: 20,    // Theme settings; don't enter in options
    itemOffsetBottom: 0,  // Theme settings; don't enter in options
    itemDisplayTime: true,
    allowClickCreate: false,
    allowDoubleClickCreate: true,
    minDragSize: 5,       // minimum amount of pixels dragged required for accepting a drag
    hourOffsetTop: -4,    // Theme settings; don't enter in options
    constructor: function( _ctrl ){
      if( this.defaultLabel === undefined ){
        this.defaultLabel = _ctrl.localeStrings.newItemLabel;
      }
    }
  }),
  
  themeSettings: function( _itemOffsetLeft, _itemOffsetTop, _itemOffsetRight, _itemOffsetBottom, _hourOffsetTop ){
    if( this.options.hideHours ){
      ELEM.addClassName( this.elemId, 'nohours' );
      this.options.itemOffsetLeft = 0;
    }
    else if( _itemOffsetLeft !== undefined ) {
      this.options.itemOffsetLeft = _itemOffsetLeft;      
    }
    if( _itemOffsetTop !== undefined ) {
      this.options.itemOffsetTop = _itemOffsetTop;      
    }
    if( _itemOffsetRight !== undefined ) {
      this.options.itemOffsetRight = _itemOffsetRight;      
    }
    if( _itemOffsetBottom !== undefined ) {
      this.options.itemOffsetBottom = _itemOffsetBottom;      
    }
    if( _hourOffsetTop !== undefined ) {
      this.options.hourOffsetTop = _hourOffsetTop;      
    }
  },
  
  autoLabel: function(){
    var
    _locale = HLocale.dateTime,
    _label  = _locale[this.options.autoLabelFn]( this.options.timeStart, this.options.autoLabelFnOptions );
    if( this.label !== _label ){
      this.label = _label;
      this.refreshLabel();
    }
  },
  
  clearHours: function(){
    for( var i = 0; i < this.hourItems.length; i++ ){
      ELEM.del( this.hourItems[i] );
    }
  },
  
  drawHours: function(){
    
    var
    _parentElemId = this.markupElemIds.timeline,
    _dateStart  = new Date( this.options.timeStart * 1000 ),
    _dateEnd    = new Date( this.options.timeEnd * 1000 ),
    _hourStart  = _dateStart.getUTCHours(),
    _hourEnd    = _dateEnd.getUTCHours(),
    _hours      = (_hourEnd - _hourStart) + 1,
    _rectHeight = ELEM.getSize( _parentElemId )[1],
    _topOffset  = this.options.itemOffsetTop,
    _height     = _rectHeight - _topOffset - this.options.itemOffsetBottom,
    _pxPerHour  = _height / _hours,
    _notchesPerHour = this.options.notchesPerHour,
    _pxPerLine  = _pxPerHour / _notchesPerHour,
    _hour       = _hourStart,
    _bottomPos  = _rectHeight-_height-_topOffset-2,
    _hourItem,
    _lineItem,
    _hourTop,
    _lineTop,
    i,
    _pxPerNotch = _pxPerHour / _notchesPerHour,
    _notchItem,
    _notchTop;
    
    ELEM.setStyle( _parentElemId, 'visibility', 'hidden', true );
    
    ELEM.setStyle( this.markupElemIds.value, 'bottom', _bottomPos+'px' );
    
    if( this['hourItems'] !== undefined ){
      this.clearHours();
    }
    this.itemOptions = {
      notchHeight: _pxPerNotch,
      notches: (_hours * _notchesPerHour),
      offsetTop: _topOffset,
      offsetBottom: _bottomPos,
      height: _height
    };
    this.hourItems = [];
    for( ; _hour < (_hourEnd+1); _hour++ ){
      _hourItem = ELEM.make( this.markupElemIds.timeline, 'div' );
      _lineTop  = Math.round(_topOffset + (_hour*_pxPerHour));
      if( _hour !== _hourStart ){
        _hourTop  = _lineTop + this.options.hourOffsetTop;
        ELEM.setStyle( _hourItem, 'top', _hourTop+'px' );
        ELEM.addClassName( _hourItem, 'timesheet_timeline_hour' );
        ELEM.setHTML( _hourItem, _hour+':00' );
        this.hourItems.push( _hourItem );
        _lineItem = ELEM.make( _parentElemId, 'div' );
        ELEM.addClassName( _lineItem, 'timesheet_timeline_line' );
        ELEM.setStyle( _lineItem, 'top', _lineTop + 'px' );
        this.hourItems.push( _lineItem );
      }
      for( i=1; i < _notchesPerHour; i++ ){
        _notchItem = ELEM.make( _parentElemId, 'div' );
        ELEM.addClassName( _notchItem, 'timesheet_timeline_notch' );
        _notchTop = Math.round(_lineTop + (_pxPerNotch*i));
        ELEM.setStyle( _notchItem, 'top', _notchTop+'px' );
        this.hourItems.push( _notchItem );
      }
    }
    
    ELEM.setStyle( this.markupElemIds.timeline, 'visibility', 'inherit' );
    
  },
  
  // extra hook for refreshing; updates label and hours before doing common things
  refresh: function(){
    if( this.drawn ){
      if( this.options.autoLabel ){
        this.autoLabel();
      }
      this.drawHours();
    }
    this.base();
  },
  
  // set the timezone offset (in seconds)
  setTzOffset: function( _tzOffset ){
    this.options.tzOffset = _tzOffset;
    this.refresh();
  },
  
  // set the start timestamp of the timesheet
  setTimeStart: function( _timeStart ){
    this.options.timeStart = _timeStart;
    this.refresh();
  },
  
  // set the end timestamp of the timesheet
  setTimeEnd: function( _timeEnd ){
    this.options.timeEnd = _timeEnd;
    this.refresh();
  },
  
  // sets the range of timestams of the timesheet
  setTimeRange: function( _timeRange ){
    if( (_timeRange instanceof Array) && (_timeRange.length === 2) ){
      this.setTimeStart( _timeRange[0] );
      this.setTimeEnd(   _timeRange[1] );
    }
    else if(
      (_timeRange instanceof Object) &&
      (_timeRange['timeStart'] !== undefined) &&
      (_timeRange['timeEnd'] !== undefined)
    ){
      this.setTimeStart( _timeRange.timeStart );
      this.setTimeEnd(   _timeRange.timeEnd   );
    }
  },
  
  // sets the timestamp of the timesheet
  setDate: function( _date ){
    var
    _range = (this.options.timeEnd - this.options.timeStart),
    _newTimeRange = [
      _date,
      _date + _range
    ];
    this.setTimeRange( _newTimeRange );
    this.refresh();
  },
  
  // draw decorations
  drawSubviews: function(){
    this.drawHours();
    var
    _options = this.options,
    _minDuration = Math.round(3600/_options.notchesPerHour),
    _dummyValue = {
      // id: 'new',
      label: '',
      start: 0,
      duration: _minDuration,
      // locked: false,
      color: '#cc0000'
    };
    this.dragPreviewRect = this.rectFromValue({start:_options.timeStart,duration:_minDuration});
    this.minDuration = _minDuration;
    this.dragPreview = HTimeSheetItem.nu(
      this.dragPreviewRect,
      this, {
        value: _dummyValue,
        visible: false,
        displayTime: this.options.itemDisplayTime
      }
    );
    this.dragPreview.setStyleOfPart('state','color','#fff');
  },
  
  // event listener for clicks, simulates double clicks in case of not double click aware browser
  click: function( x, y, b ){
    var
    prevClickTime = false,
    notCreated = !this.clickCreated && !this.doubleClickCreated && !this.dragCreated;
    // this.doubleClickSimCreated = false;
    if( !this.startDragTime && this.prevClickTime ){
      prevClickTime = this.prevClickTime;
    }
    else if (this.startDragTime){
      prevClickTime = this.startDragTime;
    }
    if( notCreated && this.options.allowClickCreate ){
      // console.log('click create');
      this.clickCreate( x,y );
      this.clickCreated = true;
      this.doubleClickCreated = false;
      this.prevClickTime = false;
    }
    else if( notCreated && this.options.allowDoubleClickCreate ){
      var
      currTime = new Date().getTime(),
      timeDiff = prevClickTime?(currTime - prevClickTime):-1;
      if( timeDiff > 150 && timeDiff < 500 && !this.doubleClickCreated ){
        // console.log('click double create');
        this.clickCreate( x, y );
        this.clickCreated = false;
        this.doubleClickCreated = true;
        this.doubleClickSimCreated = true;
      }
      else {
        this.doubleClickCreated = false;
      }
      this.prevClickTime = currTime;
    }
    else {
      this.clickCreated = false;
      this.doubleClickCreated = false;
      this.prevClickTime = false;
    }
  },
  
  // creates an item on click
  clickCreate: function(x,y){
    var
    _startTime = this.pxToTime( y-this.pageY() ),
    _endTime = _startTime + this.minDuration;
    this.refreshDragPreview( _startTime, _endTime );
    this.dragPreview.bringToFront();
    this.dragPreview.show();
    if( this.activateEditor( this.dragPreview ) ){
      this.editor.createItem( HVM.clone( this.dragPreview.value ) );
    }
    else {
      this.dragPreview.hide();
    }
  },
  
  // event listener for double clicks
  doubleClick: function(x,y){
    this.prevClickTime = false;
    this.doubleClickCreated = false;
    var notCreated = !this.clickCreated && !this.doubleClickCreated && !this.doubleClickSimCreated && !this.dragCreated;
    if( !this.options.allowDoubleClickCreate && this.options.allowClickCreate && notCreated ){
      this.click(x,y);
    }
    else if ( this.options.allowDoubleClickCreate && !this.options.allowClickCreate && notCreated ){
      // console.log('double click create');
      this.clickCreate( x, y );
      this.clickCreated = false;
      this.doubleClickCreated = true;
    }
    else {
      // console.log('no double click create');
      this.clickCreated = false;
    }
    this.doubleClickSimCreated = false;
  },
  
  // update the preview area
  refreshDragPreview: function( _startTime, _endTime ){
    this.dragPreviewRect.setTop( this.timeToPx( _startTime, true ) );
    this.dragPreviewRect.setBottom( this.timeToPx( _endTime, true ) );
    if( this.dragPreviewRect.height < this.options.itemMinHeight ){
      this.dragPreviewRect.setHeight( this.options.itemMinHeight );
    }
    this.dragPreview.drawRect();
    this.dragPreview.value.start = _startTime;
    this.dragPreview.value.duration = _endTime - _startTime;
    this.dragPreview.refreshValue();
  },
  
  // drag & drop event listeners, used for dragging new timesheet items
  startDrag: function( x, y, b ){
    // console.log('st');
    this._startDragY = y;
    this.startDragTime = this.pxToTime( y-this.pageY() );
    this.refreshDragPreview( this.startDragTime, this.startDragTime + this.minDuration );
    this.dragPreview.bringToFront();
    this.dragPreview.show();
    return true;
  },
  
  drag: function( x, y, b ){
    // console.log('dr');
    var
    _dragTime = this.pxToTime( y-this.pageY() ),
    _startTime,
    _endTime;
    if( _dragTime < this.startDragTime ){
      _startTime = _dragTime;
      _endTime = this.startDragTime;
    }
    else {
      _endTime = _dragTime;
      _startTime = this.startDragTime;
    }
    this.refreshDragPreview( _startTime, _endTime );
    return true;
  },
  
  endDrag: function( x, y, b ){
    // console.log('ed');
    var
    _dragTime = this.pxToTime( y-this.pageY() ),
    _minDistanceSatisfied = Math.abs( this._startDragY - y ) >= this.options.minDragSize;
    // if( this.options.allowClickCreate ){
    //   _minDistanceSatisfied = true;
    // }
    this.dragPreview.hide();
    if( _dragTime !== this.startDragTime ){
      if( _minDistanceSatisfied ){
        if( this.activateEditor( this.dragPreview ) ){
          // console.log('drag create');
          this.dragCreated = true;
          this.editor.createItem( HVM.clone( this.dragPreview.value ) );
          return true;
        }
      }
      this.dragCreated = false;
    }
    else {
      this.dragCreated = false;
      this.clickCreated = false;
      this.startDragTime = false;
      this.click( x, y, b );
      return true;
    }
    return false;
  },
  
  // a resize triggers refresh, of which the important part is refreshValue, which triggers redraw of the time sheet items
  resize: function(){
    this.base();
    this.refresh();
  },

  // snaps the time to grid
  snapTime: function( _timeSecs ){
    var
    _options = this.options,
    _pxDate = new Date( Math.round(_timeSecs) * 1000 ),
    _snapSecs = Math.round( 3600 / _options.notchesPerHour ),
    _halfSnapSecs = _snapSecs * 0.5,
    _hourSecs = (_pxDate.getUTCMinutes()*60) + _pxDate.getUTCSeconds(),
    _remSecs  = _hourSecs % _snapSecs;
    if( _remSecs > _halfSnapSecs ){
      _timeSecs += _snapSecs-_remSecs;
    }
    else {
      _timeSecs -= _remSecs;
    }
    return _timeSecs;
  },

  // snaps the pixel to grid
  snapPx: function( _px ){
    var
    _timeSecs = this.pxToTime( _px );
    _timeSecs = this.snapTime( _timeSecs );
    return this.timeToPx( _timeSecs );
  },

  // activates the editor; _item is the timesheet item to edit
  activateEditor: function( _item ){
    if( this['editor'] ){
      var _editor = this.editor;
      _editor.setTimeSheetItem( _item );
      _item.bringToFront();
      _editor.bringToFront();
      _editor.show();
      return true;
    }
    return false;
  },
  
/** = Description
  * Sets the editor given as parameter as the editor of instance.
  *
  * = Parameters
  * +_editor+:: 
  *
  **/
  setEditor: function( _editor ){
    this.editor = _editor;
  },

/** = Description
  * Destructor; destroys the editor first and commences inherited die.
  *
  **/
  die: function(){
    this.editor && this.editor.die();
    this.editor = null;
    this.base();
  },
  
  // converts pixels to time
  pxToTime: function( _px, _noSnap ){
    var
    _options = this.options,
    _timeStart = _options.timeStart,
    _timeEnd   = _options.timeEnd,
    _timeRange = _timeEnd - _timeStart,
    _itemOptions = this.itemOptions,
    _top       = _itemOptions.offsetTop+1,
    _height    = _itemOptions.height,
    _pxPerSec  = _height / _timeRange,
    _timeSecs;
    _px -= _top;
    _timeSecs  = _timeStart + ( _px / _pxPerSec );
    if( !_noSnap ){
      _timeSecs = this.snapTime( _timeSecs );
    }
    if( _timeSecs > _options.timeEnd ){
      _timeSecs = _options.timeEnd;
    }
    else if ( _timeSecs < _options.timeStart ) {
      _timeSecs = _options.timeStart;
    }
    return Math.round( _timeSecs );
  },

  // converts time to pixels
  timeToPx: function( _time, _snap ){
    
    if( _snap ){
      _time = this.snapTime( _time );
    }
    
    var
    _options = this.options,
    _timeStart = _options.timeStart,
    _timeEnd   = _options.timeEnd;
    
    if( _time < _timeStart ){
      _time = _timeStart;
    }
    if( _time > _timeEnd ){
      _time = _timeEnd;
    }
    
    var
    _timeRange = _timeEnd - _timeStart,
    _itemOptions = this.itemOptions,
    _top       = _itemOptions.offsetTop,
    _height    = _itemOptions.height,
    _pxPerSec  = _height / _timeRange,
    _timeSecs  = _time - _timeStart,
    _px        = _top + ( _timeSecs * _pxPerSec );
    return Math.round( _px );
  },

  // converts time to pixels for the rect
  rectFromValue: function( _value ){
    var
    _topPx = this.timeToPx( _value.start ),
    _bottomPx = this.timeToPx( _value.start + _value.duration ),
    _leftPx = this.options.itemOffsetLeft,
    _rightPx = this.rect.width - this.options.itemOffsetRight - 2,
    _rect;
    if( _topPx === 'underflow' ){
      _topPx = _itemOptions.offsetTop;
    }
    else if( _topPx === 'overflow' ){
      return false;
    }
    if( _bottomPx === 'underflow' ){
      return false;
    }
    else if( _bottomPx === 'overflow' ){
      _bottomPx = _itemOptions.offsetTop + _itemOptions.height;
    }
    _rect = HRect.nu( _leftPx, _topPx, _rightPx, _bottomPx );
    if( _rect.height < this.options.itemMinHeight ){
      _rect.setHeight( this.options.itemMinHeight );
    }
    return _rect;
  },

  // creates a single time sheet item component
  createTimeSheetItem: function( _value ){
    var
    _rect = this.rectFromValue( _value ),
    _item;
    if( _rect === false ){
      return false;
    }
    _item = HTimeSheetItem.nu(
      _rect,
      this, {
        value: _value,
        displayTime: this.options.itemDisplayTime,
        events: {
          draggable: true,
          // click: true,
          doubleClick: true
        }
      }
    );
    return _item;
  },

  // calls createTimeSheetItem with each value of the timesheet value array
  drawTimeSheetItems: function(){
    
    var
    _data = this.value,
    i = 0,
    _value,
    _item,
    _items = this.timeSheetItems;

    if((_data instanceof Array) && (_data.length > 0)){
      for( ; i < _data.length; i++){
        _value = _data[i];
        _item = this.createTimeSheetItem( _value );
        if(_item){
          _items.push( _item );
        }
      }
    }
  },


/** =Description
  * Create a new timeSheetItems if it hasn't been done already,
  * otherwise destroy the items of the old one before proceeding.
  **/
  _initTimeSheetItems: function(){
    if(this.timeSheetItems === undefined){
      this.timeSheetItems = [];
    }
    else if(this.timeSheetItems.length > 0){
      for( var i=0; i<this.timeSheetItems.length; i++){
        this.timeSheetItems[i].die();
      }
      this.timeSheetItems = [];
    }
  },

  // finds the index in the array which contains most sequential items
  _findLargestSequence: function( _arr ){
    var
    i = 1,
    _index = 0,
    _length = 1,
    _maxLength = 1,
    _bestIndex = 0;
    for( ; i < _arr.length; i++ ){
      // grow:
      if( ( _arr[i] - _arr[i-1] === 1 ) && ( _index === i-_length ) ){
        _length += 1;
      }
      // reset:
      else {
        _index = i;
        _length = 1;
      }
      if( _length > _maxLength ){
        _bestIndex = _index;
        _maxLength = _length;
      }
    }
    return [ _bestIndex, _maxLength ];
  },

  // find the amount of overlapping time sheet items
  _findOverlapCount: function( _items ){
    var
    _overlaps = [],
    _testRects = this._getTestRects( _items ),
    i,j;
    
    for( i = 0; i < _items.length; i++){
      _overlaps[i] = 0;
    }
    
    for( i = 0; i < _items.length - 1; i++ ){
      for( j = i + 1; j < _items.length; j++ ){
        if( _items[i].rect.intersects( _testRects[j] ) ){
          _overlaps[i] += 1;
          _overlaps[j] += 1;
        }
      }
    }
    return Math.max.apply( Math, _overlaps );
  },
  
  _getTestRects: function( _items ){
    var _rects = [];
    for( var i = 0; i < _items.length; i++){
      _rects[i] = HRect.nu( _items[i].rect );
      _rects[i].insetBy( 1, 1 );
    }
    return _rects;
  },

  // returns a sorted copy of the timeSheetItems array
  _sortedTimeSheetItems: function( _sortFn ){
    if( _sortFn === undefined ){
      _sortFn = function(a,b){
        return ( b.rect.height - a.rect.height);
      };
    }
    var
    i = 0,
    _arr = [],
    _items = this.timeSheetItems;
    for( ; i < _items.length; i++ ){
      _arr.push( _items[i] );
    }
    _arr = _arr.sort(_sortFn);
    return _arr;
  },


  // Optimizes the left and right position of each timesheet item to fit
  _updateTimelineRects: function(){
    var
    // loop indexes:
    i, j, k, l,
    _options = this.options,
    _rect = this.rect,
    _availWidth = ( _rect.width - _options.itemOffsetRight - _options.itemOffsetLeft ),
    _left = _options.itemOffsetLeft,
    // get a list of timesheet items sorted by height (larger to smaller order)
    _items = this._sortedTimeSheetItems(),
    _itemCount = _items.length,
    // amount of items ovelapping (max, actual number might be smaller after optimization)
    _overlapCount = this._findOverlapCount( _items ),
    _width = Math.floor( _availWidth / (_overlapCount+1) ),
    _itemRect,
    _testRect,
    _leftPos,
    _rightPos,
    _maxCol = 0,
    _origCol,
    _origColById = [],
    _overlapCols,
    _vacantCols,
    _optimalColAndLength,
    _col,
    _colWidth,
    _overlaps,
    _testRects;
    
    // No overlapping; nothing to do
    if( _overlapCount === 0 ){
      return false;
    }

    // move all items initially to one column right of the max overlaps
    _leftPos = _left+(_width*(_overlapCount+1));
    for( i = 0; i < _itemCount; i++ ){
      _itemRect = _items[i].rect;
      _itemRect.setLeft( _leftPos );
      _itemRect.setRight( _leftPos+_width );
    }

    // optimize gaps by traversing each combination
    // and finding the first column with no gaps
    // the top-level loops three times in the following modes:
    // 0: place items into the first vacant column and find the actual max columns
    // 1: stretch columns to final column width
    // 2: stretch columns to fit multiple columns, if space is vacant
    for( l = 0; l < 3; l++ ){
      for( i = 0; i < _itemCount; i++){
        _itemRect = _items[i].rect;
        // in mode 1, just the column widths are changed
        if( l === 1 ){
          _leftPos = _left + (_origColById[i]*_width);
          _itemRect.setLeft( _leftPos );
          _itemRect.setRight( _leftPos + _width );
          continue;
        }
        _overlapCols = [];
        _vacantCols = [];
        _testRects = this._getTestRects( _items );
        _testRect = HRect.nu( _itemRect );
        // test each column position (modes 0 and 2)
        for( k = 0; k < _overlapCount+1; k++ ){
          _leftPos = _left + (k*_width);
          _testRect.setLeft( _leftPos );
          _testRect.setRight( _leftPos + _width );
          for( j = 0; j < _itemCount; j++){
            if( i !==j && _testRect.intersects( _testRects[j] ) ){
              if( !~_overlapCols.indexOf( k ) ){
                _overlapCols.push( k );
              }
            }
          }
          if( !~_vacantCols.indexOf( k ) && !~_overlapCols.indexOf( k ) ){
            _vacantCols.push( k );
          }
        }

        // on the first run (mode 0) place items into the first column:
        if( l === 0 ){
          _origCol = _vacantCols[0];
          _origColById.push( _origCol );
          _leftPos = _left+(_origCol*_width);
          _rightPos = _leftPos + _width;
          if( _maxCol < _origCol ){
            _maxCol = _origCol;
          }
        }
        else {
          // on mode 2: stretch to fill multiple column widths,
          // because no item moving is done anymore at this stage, so we know what's free and what's not
          if( _vacantCols.length > 0 ){
            _optimalColAndLength = this._findLargestSequence( _vacantCols );
            _col = _vacantCols[ _optimalColAndLength[0] ];
            _colWidth = _optimalColAndLength[1];
          }
          else {
            _origCol = _origColById[i];
            _col = _origCol;
            _colWidth = 1;
          }
          _leftPos = _left+(_col*_width);
          _rightPos = _leftPos+(_colWidth*_width);
        }
        _itemRect.setLeft( _leftPos );
        _itemRect.setRight( _rightPos );
      }
      // afther the first run (mode 0) we know the actual amount of columns, so adjust column width accordingly
      if( l === 0 ){
        _overlapCount = _maxCol;
        _width = Math.floor( _availWidth / (_maxCol+1) );
      }
    }
    return true;
  },

  // draws the timeline (sub-routine of refreshValue)
  drawTimeline: function(){
    this._initTimeSheetItems();
    this.drawTimeSheetItems();
    this._updateTimelineRects();
    // use the dimensions of the views
    for( var i = 0; i < this.timeSheetItems.length; i++){
      this.timeSheetItems[i].drawRect();
    }
  },

  _sha: SHA.nu(8),

/*

Each item looks like this, any extra attributes are allowed,
but not used and not guaranteed to be preserved:

{
  id: 'abcdef1234567890', // identifier, used in server to map id's
  label: 'Event title',   // label of event title
  start: 1299248619,      // epoch timestamp of event start
  duration: 3600,           // duration of event in seconds
  locked: true,           // when false, prevents editing the item
  icons: [ 1, 3, 6 ],     // icon id's to display
  color: '#ffffff'        // defaults to '#ffffff' if undefined
}


*/
/** = Description
  * Redraws and refreshes the values on timesheet.
  *
  **/
  refreshValue: function(){
    
    if(!this.itemOptions){
      return;
    }

    // optimization that ensures the rect and previous value are different before redrawing
    var
    _valueStr = COMM.Values.encode( this.value ),
    _rectStr = this.rect.toString(),
    _timeRangeStr = this.options.timeStart+':'+this.options.timeEnd,
    _shaSum = this._sha.strSHA1( _valueStr+_rectStr+_timeRangeStr );
    if( this._prevSum !== _shaSum ){
      // the preview timesheet item is hidden when new data arrives (including what it created)
      this.dragPreview.hide();
      this._prevSum = _shaSum;
      this.drawTimeline();
    }
  }
  
});

