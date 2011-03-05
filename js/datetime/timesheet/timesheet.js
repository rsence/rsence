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
    notchesPerHour: 4, // by default 1/4 of an hour precision (15 minutes)
    itemOffsetLeft: 64,   // Theme settings; don't enter in options
    itemOffsetRight: 0,   // Theme settings; don't enter in options
    itemOffsetTop: 20,    // Theme settings; don't enter in options
    itemOffsetBottom: 0,  // Theme settings; don't enter in options
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
  
  refresh: function(){
    if( this.drawn ){
      if( this.options.autoLabel ){
        this.autoLabel();
      }
      this.drawHours();
    }
    this.base();
  },
  
  setTzOffset: function( _tzOffset ){
    this.options.tzOffset = _tzOffset;
    this.refresh();
  },
  
  setTimeStart: function( _timeStart ){
    this.options.timeStart = _timeStart;
    this.refresh();
  },
  
  setTimeEnd: function( _timeEnd ){
    this.options.timeEnd = _timeEnd;
    this.refresh();
  },
  
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
      color: '#c00'
    };
    this.dragPreviewRect = this.rectFromValue({start:_options.timeStart,duration:_minDuration});
    this.minDuration = _minDuration;
    this.dragPreview = HTimeSheetItem.nu(
      this.dragPreviewRect,
      this, {
        value: _dummyValue,
        visible: false
      }
    );
    this.dragPreview.setStyleOfPart('state','color','#fff');
  },
  
  click: function( x, y, b ){
    // console.log('click');
    if( !this.startDragTime ){
      this.clickCreate( x,y );
      this.clickCreated = true;
    }
    this.clickCreated = false;
  },
  
  clickCreate: function(x,y){
    // console.log('clickCreate');
    y -= this.pageY();
    var
    _startTime = this.pxToTime( y ),
    _endTime = _startTime + this.minDuration;
    this.refreshDragPreview( _startTime, _endTime );
    this.dragPreview.bringToFront();
    this.dragPreview.show();
    if( this.activateEditor( this.dragPreview ) ){
      // console.log('create!');
      this.editor.createItem( HVM.clone( this.dragPreview.value ) );
    }
    else {
      // console.log('no create');
      this.dragPreview.hide();
    }
  },
  
  doubleClick: function(x,y){
    // console.log('doubleClick');
    if( !this.clickCreated ){
      this.click(x,y);
    }
    this.clickCreated = false;
  },
  
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
  
  startDrag: function( x, y, b ){
    y -= this.pageY();
    this.startDragTime = this.pxToTime( y );
    this.refreshDragPreview( this.startDragTime, this.startDragTime + this.minDuration );
    this.dragPreview.bringToFront();
    this.dragPreview.show();
    return true;
  },
  
  drag: function( x, y, b ){
    y -= this.pageY();
    var
    _dragTime = this.pxToTime( y ),
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
    y -= this.pageY();
    var _dragTime = this.pxToTime( y );
    if( _dragTime !== this.startDragTime ){
      if( this.activateEditor( this.dragPreview ) ){
        this.editor.createItem( HVM.clone( this.dragPreview.value ) );
        return true;
      }
    }
    this.clickCreated = false;
    this.dragPreview.hide();
    this.startDragTime = false;
    return false;
  },
  
  resize: function(){
    this.base();
    this.refresh();
  },
  debugPos: function( _px, color ){
    var _debugPosId = ELEM.make(this.elemId,'div');
    ELEM.setCSS(_debugPosId,'position:absolute;left:0px;top:'+_px+'px;right:0px;background-color:'+color+';height:1px;');
    setTimeout( function(){ ELEM.del( _debugPosId ); }, 1000 );
  },
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
  snapPx: function( _px ){
    var
    _timeSecs = this.pxToTime( _px );
    _timeSecs = this.snapTime( _timeSecs );
    return this.timeToPx( _timeSecs );
  },
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
      // this.debug && console.log('time:',_time,' is less than timeStart:',_timeStart);
      // return 'underflow';
    }
    if( _time > _timeEnd ){
      _time = _timeEnd;
      // this.debug && console.log('time:',_time,' is more than timeEnd:',_timeEnd);
      // return 'overflow';
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
      this.debug && console.log('item out of range:',_value);
      return false;
    }
    if( _bottomPx === 'underflow' ){
      this.debug && console.log('item out of range:',_value);
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
  createTimeSheetItem: function( _value ){
    var
    _rect = this.rectFromValue( _value ),
    _item;
    if( _rect === false ){
      this.debug && console.log('invalid item:',_value);
      return false;
    }
    _item = HTimeSheetItem.nu(
      _rect,
      this, {
        value: _value,
        events: {
          draggable: true,
          // click: true,
          doubleClick: true
        }
      }
    );
    return _item;
  },
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
    this.dragPreview.hide();
    var
    _data = this.value,
    i;
    if(this.listItemViews === undefined){
      this.listItemViews = [];
    }
    else if(this.listItemViews.length > 0){
      for( i=0; i<this.listItemViews.length; i++){
        this.listItemViews[i].die();
      }
      this.listItemViews = [];
    }
    if((_data instanceof Array) && (_data.length > 0)){
      var
      _value,
      _item;
      for( i=0; i<_data.length; i++){
        _value = _data[i];
        _item = this.createTimeSheetItem( _value );
        if(_item){
          this.listItemViews.push( _item );
        }
      }
    }
    var
    _overlaps = [],
    j;
    for(i=0;i<this.listItemViews.length;i++){
      for(j=0;j<this.listItemViews.length;j++){
        if((i !== j) && (_overlaps.indexOf(i)===-1) && (_overlaps.indexOf(j)===-1)){
          if(this.listItemViews[i].rect.intersects(this.listItemViews[j].rect)){
            _overlaps.push(i);
          }
        }
      }
    }
    var
    _overlapCount = _overlaps.length+1,
    _overlapLefts = {},
    _itemWidth = ( this.rect.width - this.options.itemOffsetRight - this.options.itemOffsetLeft ),
    _width = Math.floor( _itemWidth / _overlapCount),
    _left = this.options.itemOffsetLeft;
    for(j=0;j<_overlapCount;j++){
      _overlapLefts[_overlaps[j]] = _left + (j*_width) + _width;
    }
    for(i=0;i<this.listItemViews.length;i++){
      if(_overlaps.indexOf(i)===-1){
        this.listItemViews[i].rect.setLeft(_left);
      }
      else {
        this.listItemViews[i].rect.setLeft(_overlapLefts[i]);
      }
      this.listItemViews[i].rect.setWidth(_width);
    }
    for(i=0;i<this.listItemViews.length;i++){
      this.listItemViews[i].drawRect();
    }
  }
  
});

