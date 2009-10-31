/**
  * Riassence Core -- http://rsence.org/
  *
  * Copyright (C) 2009 Juha-Jarmo Heinonen <jjh@riassence.com>
  *
  * This file is part of Riassence Core.
  *
  * Riassence Core is free software: you can redistribute it and/or modify
  * it under the terms of the GNU General Public License as published by
  * the Free Software Foundation, either version 3 of the License, or
  * (at your option) any later version.
  *
  * Riassence Core is distributed in the hope that it will be useful,
  * but WITHOUT ANY WARRANTY; without even the implied warranty of
  * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  * GNU General Public License for more details.
  *
  * You should have received a copy of the GNU General Public License
  * along with this program.  If not, see <http://www.gnu.org/licenses/>.
  *
  **/

HTimeSheetItem = HControl.extend({
  componentName: 'timesheet_item',
  dragMode: 'create',
  startDrag: function(x,y){
    this.origY = y-this.parent.pageY();
    if(this.dragMode === 'normal'){
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
    }
    this.bringToFront();
  },
  createDrag: function(_y){
    var _negative = (_y < this.origY),
        _top, _bottom, _diff;
    if(_negative){
      var _floorY = Math.floor(_y/12)*12,
          _ceilYo = Math.ceil(this.origY/12)*12;
      if(_floorY<0){_floorY=0;}
      _diff = _floorY-_ceilYo;
      if( _diff <= -12 ){
        _top = _floorY;
        _bottom = _ceilYo;
      }
      else if( _diff === 0 ){
        _top = _floorY-12;
        _bottom = _ceilYo;
      }
    }
    else {
      var _ceilY  = Math.ceil(_y/12)*12,
          _floorYo = Math.floor(this.origY/12)*12;
      if(_ceilY>(12*48)){_ceilY=12*48;}
      _diff = _ceilY-_floorYo;
      if( _diff >= 12 ){
        _top = _floorYo;
        _bottom = _ceilY;
      }
      else if( _diff === 0 ){
        _top = _floorYo;
        _bottom = _ceilY+12;
      }
    }
    this.rect.setTop(_top);
    this.rect.setBottom(_bottom);
  },
  resizeTop: function(_y){
    var _top = Math.round( _y/12 )*12;
    if(_top < 0){ _top = 0; }
    if(_top+12 > this.rect.bottom){
      _top = this.rect.bottom - 12;
    }
    this.rect.setTop( _top );
  },
  resizeBottom: function(_y){
    var _bottom = Math.round( _y/12 )*12;
    if(_bottom > 12*48){ _bottom = 12*48; }
    if(_bottom-12 < this.rect.top){
      _bottom = this.rect.top + 12;
    }
    this.rect.setBottom( _bottom );
  },
  move: function(_y){
    var _top = Math.round( (0-this.moveDiff+_y)/12 )*12;
    if(_top<0){_top = 0;}
    if(_top+this.rect.height>12*48){
      _top = 12*48 - this.rect.height;
    }
    this.rect.offsetTo( this.rect.left, _top );
  },
  doDrag: function(x,y){
    var _pageY  = this.parent.pageY(),
        _y = y - _pageY;
    if(this.dragMode === 'create'){
      this.createDrag(_y);
    }
    else if(this.dragMode === 'resize-top'){
      this.resizeTop(_y);
    }
    else if(this.dragMode === 'resize-bottom'){
      this.resizeBottom(_y);
    }
    else if(this.dragMode === 'move'){
      this.move(_y);
    }
    this.drawRect();
  },
  endDrag: function(x,y){
    this.dragMode = 'normal';
    this.setValue( [ Math.round(this.rect.top/12), Math.round(this.rect.bottom/12) ] );
  }
});


