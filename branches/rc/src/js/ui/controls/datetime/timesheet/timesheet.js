/*   Riassence Framework
 *   Copyright 2009 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

HTimeSheet = HControl.extend({
  componentName: 'timesheet',
  pxPerHour: 24,
  itemOffsetLeft: 36,
  itemOffsetRight: 0,
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
  refreshLabel: function(){
    var hour = 1,
        hours = [],
        rowHeight = this.pxPerHour;
        lineHeight = Math.round(this.pxPerHour/2);
    for(; hour < 24; hour++){
      hours.push('<div style="line-height:'+rowHeight+'px;height:'+rowHeight+'px;top:'+Math.round((hour*rowHeight)-lineHeight)+'px" class="timesheet_hours_row">'+hour+':00</div>');
    }
    ELEM.setHTML(this.markupElemIds.label,hours.join(''));
    this.refreshState();
  },
  refreshState: function(){
    var line = 0,
        lines = [],
        lineHeight = Math.round(this.pxPerHour/2);
    for(; line < 48; line++){
      lines.push('<div style="top:'+(line*lineHeight)+'px" class="timesheet_lines_row'+(line%2)+'"></div>');
    }
    ELEM.setHTML(this.markupElemIds.state,lines.join(''));
  },
  dragItem: false,
  createItem: function(origY){
    var _lineHeight = Math.round(this.pxPerHour/2);
    origY = Math.floor( origY / _lineHeight )*_lineHeight;
    var maxY = _lineHeight*48,
        lineHeight = Math.round(this.pxPerHour/2);
    if(origY>maxY){
      origY = maxY;
    }
    var item = HTimeSheetItem.nu(
      this.createItemRect(origY,lineHeight),
      this, {
        label: 'New Item',
        events: {
          draggable: true
        }
      }
    );
    this.dragItem = item;
  },
  startDrag: function(x,y){
    this.createItem(y-this.pageY());
    EVENT.startDragging( this.dragItem );
  },
  listItemViews: false,
  setEditor: function( _editor ){
    this.editor = _editor;
  },
  createItemRect: function(_origY, _lineHeight){
    var _left = this.itemOffsetLeft,
        _top = _origY,
        _right = this.rect.width - this.itemOffsetRight,
        _bottom = _origY + _lineHeight;
    return HRect.nu( _left, _top, _right, _bottom );
  },
  die: function(){
    this.editor.die();
    this.base();
  },
  refreshValue: function(){
    var _data = this.value, i;
    if(this.listItemViews === false){
      this.listItemViews = [];
    }
    if(this.listItemViews.length !== 0){
      for( i=0; i<this.listItemViews.length; i++){
        this.listItemViews[i].die();
      }
      this.listItemViews = [];
    }
    if(_data instanceof Array){
      var _value, _label, _item;
      for( i=0; i<_data.length; i++){
        _value = _data[i];
        _label = _value['label'];
        _item = HTimeSheetItem.nu(
          this.createItemRect( 0, 12 ),
          this, {
            label: _label,
            value: _value,
            events: {
              draggable: true
            }
          }
        );
        _item.dragMode = 'normal';
        this.listItemViews.push( _item );
      }
    }
  }
});

