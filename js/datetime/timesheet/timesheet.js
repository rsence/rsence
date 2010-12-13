/*   RSence
 *   Copyright 2009 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

/*** = Description
  ** HTimesheet is a simple timesheet control. 
  ***/
var//RSence.DateTime
HTimeSheet = HControl.extend({
  
  componentName: 'timesheet',
  
  /* Default amount of pixels per hour. Override with options when necessary. */
  pxPerHour: 24,
  
  /* Default amount of pixels from left. Override with options when necessary. */
  itemOffsetLeft: 36,
  
  /* Default amount of pixels from right. Override with options when necessary. */
  itemOffsetRight: 0,
  
  defaultEvents: {
    draggable: true
  },
  
  controlDefaults: HControlDefaults.extend({
    pxPerHour: null,
    itemOffsetLeft: null,
    itemOffsetRight: null,
    newItemLabel: 'New Item',
    constructor: function(_ctrl){
      if(this.pxPerHour !== null){
        _ctrl.pxPerHour = this.pxPerHour;
      }
      if(this.itemOffsetLeft !== null){
        _ctrl.itemOffsetLeft = this.itemOffsetLeft;
      }
      if(this.itemOffsetRight !== null){
        _ctrl.itemOffsetRight = this.itemOffsetRight;
      }
    }
  }),
  
/** = Description
  * Redraws the timesheet.
  *
  **/
  refresh: function(){
    if(this.drawn){
      var _areaHeight = this.rect.height;
      this.pxPerHour = (_areaHeight-(_areaHeight%48)) / 24;
      if(this.options['hideLabel']){
        this.setStyleOfPart( 'label', 'display', 'none' );
        this.setStyleOfPart( 'state', 'left', '0px' );
        this.itemOffsetLeft = 0;
      }
      else{
        this.setStyleOfPart( 'label', 'height', (this.pxPerHour*24)+'px' );
      }
      this.setStyleOfPart( 'state', 'height', (this.pxPerHour*24)+'px' );
    }
    this.base();
  },
  
/** = Description
  * Refreshes the hour labels.
  *
  **/
  refreshLabel: function(){
    var hour = 1,
        hours = [],
        rowHeight = this.pxPerHour;
        lineHeight = Math.round(this.pxPerHour/2);
    for(; hour < 24; hour++){
      hours.push('<div style="line-height:'+rowHeight+'px;height:'+rowHeight+'px;top:'+Math.round((hour*rowHeight)-lineHeight)+'px" class="timesheet_hours_row">'+hour+':00</div>');
    }
    this.markupElemIds && this.markupElemIds.label && ELEM.setHTML(this.markupElemIds.label,hours.join(''));
    this.refreshState();
  },
  
/** = Description
  * Refreshes the lines which mark hours and half-hours.
  *
  **/
  refreshState: function(){
    var line = 0,
        lines = [],
        lineHeight = Math.round(this.pxPerHour/2);
    for(; line < 48; line++){
      lines.push('<div style="top:'+(line*lineHeight)+'px" class="timesheet_lines_row'+(line%2)+'"></div>');
    }
    this.markupElemIds && this.markupElemIds.label && ELEM.setHTML(this.markupElemIds.state,lines.join(''));
  },
  dragItem: false,
  
/** = Description
  * Creates an item into timesheet with default label 'New Item'.
  *
  * = Parameters
  * +origY+:: Y coordinate of the new item.
  *
  **/
  createItem: function(origY){
    var _lineHeight = Math.round(this.pxPerHour/2);
    origY = Math.floor( origY / _lineHeight )*_lineHeight;
    var maxY = _lineHeight*48,
        lineHeight = Math.round(this.pxPerHour/2);
    if(origY>maxY){
      origY = maxY;
    }
    this.dragItem = this.createTimeSheetItem( { label: this.options.newItemLabel }, origY, lineHeight, 'create' );
  },
  
/** = Description
  * Dragging is used to mark items on the timesheet.
  * 
  * = Parameters
  * +x+:: x coordinate of the origin of drag
  * +y+:: y coordinate of the origin of drag
  *
  **/
  startDrag: function(x,y){
    this._startDragTime = new Date().getTime();
    this._startDragCoords = [x,y];
    return true;
  },
  
  drag: function(x,y){
    if(((new Date().getTime()) - this._startDragTime) < 200){
      // only create when 200 ms has elapsed to enable clicking
      return true;
    }
    if(this._startDragCoords[0]!==x && this._startDragCoords[1]!==y){
      this.createItem(this._startDragCoords[1]-this.pageY());
      EVENT.startDragging( this.dragItem );
      return true;
    }
  },
  
  click: function(x,y){
    // deactivate all items
    EVENT.changeActiveControl(this);
    return true;
  },
  
  listItemViews: false,
  
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
  * Returns HRect the size of given parameters and suitable for timesheet.
  *
  * = Parameters
  * +_origY+::      Y coordinate.
  * +_lineHeight+:: The height of item on time sheet.
  *
  **/
  createItemRect: function(_origY, _lineHeight){
    var _left = this.itemOffsetLeft+1,
        _top = _origY+1,
        _right = this.rect.width - this.itemOffsetRight - 1,
        _bottom = _origY + _lineHeight - 2;
    return HRect.nu( _left, _top, _right, _bottom );
  },

/** = Description
  * Destructor; destroys the editor first and commences inherited die.
  *
  **/
  die: function(){
    this.editor.die();
    this.base();
  },
  
/** = Description
  * Returns a new time sheet item control. By default returns an instance
  * of HTimeSheetItem. Extend to use custom time sheet controls customized
  * for application specific purposes.
  *
  * = Parameters
  * *_value*::      A value object for the item.
  * *_top*::        Top position, 0 by default.
  * *_height*::     Height, same as half of +#pxPerHour+ by default.
  * *_drogMode*::   Dragging mode. 'normal' or 'create'. Is 'normal' by default.
  *
  **/
  createTimeSheetItem: function( _value, _top, _height, _dragMode ) {
    if(_dragMode===undefined){
      _dragMode = 'normal';
    }
    if(_top===undefined){
      _top = 0;
    }
    if(_height===undefined){
      _height = Math.round(this.pxPerHour/2);
    }
    var
    _label = _value['label'],
    _item = HTimeSheetItem.nu(
      this.createItemRect( _top, _height ),
      this, {
        label: _label,
        value: _value,
        events: {
          draggable: true
        }
      }
    );
    _item.dragMode = _dragMode;    
    return _item;
  },
  
/** = Description
  * Redraws and refreshes the values on timesheet.
  *
  **/
  refreshValue: function(){
    var
    _data = this.value,
    i;
    if(this.listItemViews === false){
      this.listItemViews = [];
    }
    else if(this.listItemViews.length > 0){
      for( i=0; i<this.listItemViews.length; i++){
        this.listItemViews[i].die();
      }
      this.listItemViews = [];
    }
    if(_data instanceof Array && _data.length > 0){
      var
      _value,
      _item;
      for( i=0; i<_data.length; i++){
        _value = _data[i];
        _item = this.createTimeSheetItem( _value );
        this.listItemViews.push( _item );
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
    _itemWidth = ( this.rect.width - this.itemOffsetRight - this.itemOffsetLeft ),
    _width = Math.floor( _itemWidth / _overlapCount),
    _left = this.itemOffsetLeft;
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

