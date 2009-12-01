/*   Riassence Framework
 *   Copyright 2009 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

/*** = Description
  ** Item class to be used with HTimeSheet.
  ***/
HTimeSheetItem = HControl.extend({
  componentName: 'timesheet_item',
  dragMode: 'create',
  prevXY: [0,0],
  prevXYTime: 0,
  
/** = Description
  * Dragging is used to change coordinates.
  *
  * = Parameters
  * +x+:: X coordinate at the start of drag.
  * +y+:: Y coordinate at the start of drag.
  *
  **/
  startDrag: function(x,y){
    this.origY = y-this.parent.pageY();
    if(this.dragMode === 'normal'){
      var _timeNow = new Date().getTime(),
          _xEquals = (Math.round(this.prevXY[0]/4) === Math.round(x/4)),
          _yEquals = (Math.round(this.prevXY[1]/4) === Math.round(y/4)),
          _noTimeout = ((_timeNow - this.prevXYTime) < 500);
      if( _xEquals && _yEquals && _noTimeout ) {
        if( this.parent['editor'] ){
          var _editor = this.parent.editor;
          _editor.setTimeSheetItem(this);
          _editor.bringToFront();
          _editor.show();
        }
      }
      else {
        var _diffTop = this.rect.top - this.origY,
            _diffBottom = this.rect.bottom - this.origY;
        if(0 >= _diffTop && _diffTop >= -3){
          this.dragMode = 'resize-top';
        }
        else if(0 <= _diffBottom && _diffBottom <= 4){
          this.dragMode = 'resize-bottom';
        }
        else {
          this.dragMode = 'move';
          this.moveDiff = this.origY - this.rect.top;
        }
        this.bringToFront();
      }
    }
    this.prevXY = [x,y];
    this.prevXYTime = _timeNow;
    return true;
  },
  
/** = Description
  * Label setter function.
  *
  * = Parameters
  * +_label+:: New label
  *
  **/
  setTimeSheetItemLabel: function(_label){
    this.label = _label;
    this.refreshLabel();
  },
  
/** = Description
  * Function used to calculate the right size for a new 
  * item created by dragging.
  *
  * = Parameters
  * +_y+:: Y coordinate at the start of drag.
  *
  **/
  dragCreate: function(_y){
    var _negative = (_y < this.origY),
        _lineHeight = Math.floor(this.parent.pxPerHour/2),
        _top, _bottom, _diff;
    if(_negative){
      var _floorY = Math.floor(_y/_lineHeight)*_lineHeight,
          _ceilYo = Math.ceil(this.origY/_lineHeight)*_lineHeight;
      if(_floorY<0){_floorY=0;}
      _diff = _floorY-_ceilYo;
      if( _diff <= 0-_lineHeight ){
        _top = _floorY;
        _bottom = _ceilYo;
      }
      else if( _diff === 0 ){
        _top = _floorY-_lineHeight;
        _bottom = _ceilYo;
      }
    }
    else {
      var _ceilY  = Math.ceil(_y/_lineHeight)*_lineHeight,
          _floorYo = Math.floor(this.origY/_lineHeight)*_lineHeight;
      if(_ceilY>(_lineHeight*48)){_ceilY=_lineHeight*48;}
      _diff = _ceilY-_floorYo;
      if( _diff >= _lineHeight ){
        _top = _floorYo;
        _bottom = _ceilY;
      }
      else if( _diff === 0 ){
        _top = _floorYo;
        _bottom = _ceilY+_lineHeight;
      }
    }
    this.rect.setTop(_top);
    this.rect.setBottom(_bottom);
  },
  
/** = Description
  * Resize top by dragging auxiliary function.
  *
  * = Parameters
  * +_y+:: Y coordinate at the start of drag.
  **/
  dragResizeTop: function(_y){
    var _lineHeight = Math.floor(this.parent.pxPerHour/2),
        _top = Math.floor( _y/_lineHeight )*_lineHeight;
    if(_top < 0){ _top = 0; }
    if(_top+_lineHeight > this.rect.bottom){
      _top = this.rect.bottom - _lineHeight;
    }
    this.rect.setTop( _top );
  },
  
/** = Description
  * Resize function for resizing the bottom of item.
  *
  * = Parameters
  * +_y+:: Y coordinate at the start of drag.
  *
  **/
  dragResizeBottom: function(_y){
    var _lineHeight = Math.floor(this.parent.pxPerHour/2),
        _bottom = Math.floor( _y/_lineHeight )*_lineHeight;
    if(_bottom > _lineHeight*48){ _bottom = _lineHeight*48; }
    if(_bottom-_lineHeight < this.rect.top){
      _bottom = this.rect.top + _lineHeight;
    }
    this.rect.setBottom( _bottom );
  },
  
/** = Description
  * Move function for item by dragging and dropping.
  *
  * = Parameters
  * +_y+:: Y coordinate at the start of drag.
  *
  **/
  dragMove: function(_y){
    var _lineHeight = Math.floor(this.parent.pxPerHour/2),
        _top = Math.floor( (0-this.moveDiff+_y)/_lineHeight )*_lineHeight;
    if(_top<0){_top = 0;}
    if(_top+this.rect.height>_lineHeight*48){
      _top = _lineHeight*48 - this.rect.height;
    }
    this.rect.offsetTo( this.rect.left, _top );
  },
  
/** = Description
  * Drag function for item. Decides whether the user wants to create a new
  * item, resize top, resize bottom or move an existing item.
  *
  * = Parameters
  * +x+:: X coordinate at the start of drag.
  * +y+:: Y coordinate at the start of drag.
  *
  **/
  drag: function(x,y){
    var _pageY  = this.parent.pageY(),
        _y = y - _pageY;
    if(this.dragMode === 'create'){
      this.dragCreate(_y);
    }
    else if(this.dragMode === 'resize-top'){
      this.dragResizeTop(_y);
    }
    else if(this.dragMode === 'resize-bottom'){
      this.dragResizeBottom(_y);
    }
    else if(this.dragMode === 'move'){
      this.dragMove(_y);
    }
    this.drawRect();
    return true;
  },
  
/** = Description
  * Modifies the existing item's coordinates or creates a new one.
  *
  * = Parameters
  * +x+:: X coordinate at the end of drag.
  * +y+:: Y coordinate at the end of drag.
  *
  **/
  endDrag: function(x,y){
    var _pxPerHour = Math.floor(this.parent.pxPerHour),
        _value;
    if(this.dragMode === 'create'){
      this.parent.listItemViews.push( this );
      _value = {
        'timeBegin': this.rect.top/_pxPerHour,
        'timeEnd': this.rect.bottom/_pxPerHour,
        'label': this.label
      };
      if(this.parent['editor']){
        this.parent.editor.createItem( _value );
      }
    }
    else {
      _value = COMM.Values.clone( this.value );
      _value['timeBegin'] = this.rect.top/_pxPerHour;
      _value['timeEnd'] = this.rect.bottom/_pxPerHour;
      if(this.parent['editor']){
        this.parent.editor.modifyItem( _value );
      }
    }
    this.setValue( _value );
    this.dragMode = 'normal';
    return true;
  },
  
/** = Description
  * Refreshes the object's label and place on the HTimeSheet.
  *
  **/
  refreshValue: function(){
    var _value = this.value,
        _pxPerHour = this.parent.pxPerHour;
    if((_value instanceof Object) && !(_value instanceof Array)){
      this.setLabel( _value['label'] );
      this.rect.setTop( _value['timeBegin'] * _pxPerHour );
      this.rect.setBottom( _value['timeEnd'] * _pxPerHour );
      this.drawRect();
    }
  }
});


