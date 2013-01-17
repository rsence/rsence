
/*** = Description
  ** Item class to be used with HTimeSheet.
  ***/
var//RSence.DateTime
HTimeSheetItem = HControl.extend({
  
  componentName: 'timesheet_item',
  markupElemNames: ['bg', 'label', 'state', 'icons', 'value', 'subview'],
  
  controlDefaults: HControlDefaults.extend({
    displayTime: true
  }),
  
  drawIcon: function( _iconOrder, _iconId ){
    var
    _iconElemId = ELEM.make( this.markupElemIds.icons, 'div' );
    ELEM.addClassName( _iconElemId, 'timesheet_item_icon' );
    ELEM.setStyle( _iconElemId, 'right', ((_iconOrder*16)+_iconOrder)+'px' );
    ELEM.setStyle( _iconElemId, 'background-position', '0px '+(_iconId*-16)+'px' );
    return _iconElemId;
  },
  
  clearAllIcons: function(){
    if(this.icons instanceof Array){
      for( var i=0; i < this.icons.length; i++ ){
        ELEM.del( this.icons[i] );
      }
    }
    this.icons = [];
  },
  
  die: function(){
    this.clearAllIcons();
    this.icons = null;
    this.base();
  },
  
  refreshState: function( _start, _duration ){
    if(!this.options.displayTime){
      return;
    }
    var
    _startTime = _start || this.value.start,
    _endTime   = _startTime + ( _duration || this.value.duration ),
    _locale    = HLocale.dateTime,
    _stateText = _locale.formatTime( _startTime ) + _locale.strings.rangeDelimitter + _locale.formatTime( _endTime );
    ELEM.setHTML( this.markupElemIds.state, _stateText );
  },
  
  refreshValue: function(){
    if ( !(this.value instanceof Object) ){
      return;
    }
    this.drawRect();
    if ( this.value.color ) {
      this.setStyleOfPart( 'bg', 'background-color', this.value.color );
    }
    else {
      this.setStyleOfPart( 'bg', 'background-color', '#999' );
    }
    if ( this.value.label ) {
      this.setLabel( this.value.label );
    }
    if ( this.value.locked ) {
      ELEM.addClassName( this.elemId, 'locked' );
    }
    else {
      ELEM.delClassName( this.elemId, 'locked' );
    }
    this.refreshState();
    this.clearAllIcons();
    if( this.value.icons instanceof Array ){
      for( var i = 0; i < this.value.icons.length; i++ ){
        this.icons.push( this.drawIcon( i, this.value.icons[i] ) );
      }
    }
  },
  
  click: function(){
    this.bringToFront();
  },
  
  doubleClick: function( x, y ){
    this.bringToFront();
    var _time = this.parent.pxToTime( y-this.parent.pageY() );
    this.parent.activateEditor( this );
  },
  
  dragMode: 0, // none
  _isValueValidForDrag: function(){
    return (this.value instanceof Object) && (!this.value.locked);
  },
  startDrag: function( x, y ){
    this.bringToFront();
    if( this._isValueValidForDrag() ){
      var
      _topY = y-this.pageY(),
      _bottomY = this.rect.height - _topY,
      _resizeTop = ( _topY >= 0 && _topY <= 6 ),
      _resizeBottom = ( _bottomY >= 0 && _bottomY <= 6 ),
      _move = ( _topY > 6 && _bottomY > 6 );
      if( _resizeTop ){
        this.dragMode = 2; // resize-top
      }
      else if ( _resizeBottom ){
        this.dragMode = 3; // resize-bottom
      }
      else if ( _move ){
        this.dragMode = 1; // move
      }
      else {
        this.dragMode = 0; // none
      }
      if( this.dragMode === 0 ){
        this.originY = false;
      }
      else {
        var
        _originY   = y-this.parent.pageY(),
        _parentY   = this.parent.pageY(),
        _originTimeStart = this.value.start,
        _originTimeEnd   = _originTimeStart + this.value.duration;
        this.originY = _originY;
        this.originTopPx = this.rect.top;
        this.originBottomPx = this.rect.bottom;
        this.originTimeStart = _originTimeStart;
        this.originTimeEnd   = _originTimeEnd;
        this.originDuration  = _originTimeEnd - _originTimeStart;
        this.dragTimeStart = _originTimeStart;
        this.dragDuration  = this.originDuration;
      }
    }
  },
  
  drag: function( x, y ){
    if( this._isValueValidForDrag() && (this.dragMode !== 0) ){
      y -= this.parent.pageY();
      var
      _movePx    = y - this.originY,
      _topPx     = this.parent.snapPx( this.originTopPx + _movePx ),
      _parentY   = this.parent.pageY(),
      _bottomPx, _minBottomPx, _maxBottomPx, _maxTopPx, _timeStart, _timeEnd, _duration;
      if( this.dragMode === 1 ){ // move
        _maxTopPx  = this.parent.timeToPx( this.parent.options.timeEnd ) - this.rect.height;
        if( _topPx > _maxTopPx ){
          _topPx = _maxTopPx;
        }
        _timeStart = this.parent.pxToTime(_topPx);
        _duration  = this.originDuration;
        this.rect.offsetTo( this.rect.left, _topPx );
        this.drawRect();
        this.dragTimeStart = _timeStart;
        this.dragDuration  = _duration;
      }
      else if( this.dragMode === 2 ){ // resize-top
        _maxTopPx  = this.parent.timeToPx( this.originTimeEnd - this.parent.minDuration );
        if( _topPx > _maxTopPx ){
          _topPx = _maxTopPx;
        }
        _timeStart = this.parent.pxToTime(_topPx);
        _timeEnd   = this.originTimeEnd;
        if( (this.rect.bottom - _topPx) < this.parent.options.itemMinHeight ){
          _topPx = this.rect.bottom - this.parent.options.itemMinHeight;
        }
        this.rect.setTop( _topPx );
        this.drawRect();
        this.dragTimeStart = _timeStart;
        this.dragDuration  = _timeEnd - _timeStart;
      }
      else if( this.dragMode === 3 ){ // resize-top
        _minBottomPx  = this.parent.timeToPx( this.originTimeStart + this.parent.minDuration  );
        _bottomPx     = this.parent.snapPx( this.originBottomPx + _movePx );
        if( _bottomPx < _minBottomPx ){
          _bottomPx = _minBottomPx;
        }
        _timeStart = this.originTimeStart;
        _timeEnd   = this.parent.pxToTime(_bottomPx);
        if( _bottomPx - this.rect.top < this.parent.options.itemMinHeight ){
          _bottomPx = this.rect.top + this.parent.options.itemMinHeight;
        }
        this.rect.setBottom( _bottomPx );
        this.drawRect();
        this.dragTimeStart = _timeStart;
        this.dragDuration  = _timeEnd - _timeStart;
      }
      this.refreshState( this.dragTimeStart, this.dragDuration );
    }
  },
  
  endDrag: function( x, y ){
    if( this._isValueValidForDrag() && (this.dragMode !== 0) ){
      var
      _startChanged = ( this.dragTimeStart !== this.originTimeStart ) && ( this.dragTimeStart !== this.value.start ),
      _durationChanged = ( this.dragDuration !== this.originDuration ) && ( this.dragDuration !== this.value.duration );
      if( _startChanged || _durationChanged ){
        if( this.parent['editor'] ){
          var _modValue = { id: this.value.id, start: this.dragTimeStart, duration: this.dragDuration, label: this.value.label };
          this.parent.editor.modifyItem( _modValue );
        }
      }
    }
  }
  
});
