/**
  * Riassence Core -- http://rsence.org/
  *
  * Copyright (C) 2008 Juha-Jarmo Heinonen <jjh@riassence.com>
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

HDynControl = HControl.extend({
  componentBehaviour: ['view','control','window'],
  constructor: function( _rect, _parent, _options ){
    if(!_options) {
      _options={};
    }
    var _winSize = ELEM.windowSize();
    var _defaults = HClass.extend({
      minX:      0,
      minY:      0,
      maxX:      _winSize[0],
      maxY:      _winSize[1],
      minSize:   [24,54],
      maxSize:   [_winSize[0],_winSize[1]],
      resizeW:   1,
      resizeE:   1,
      resizeN:   1,
      resizeS:   1,
      resizeNW:  [ 1, 1 ],
      resizeNE:  [ 1, 1 ],
      resizeSW:  [ 1, 1 ],
      resizeSE:  [ 1, 1 ],
      noResize:  false
    });
    _options = new (_defaults.extend(_options))();
    if(_options.noResize){
      _options.minSize = [_rect.width,_rect.height];
      _options.maxSize = [_rect.width,_rect.height];
      _options.resizeW = 0;
      resizeE = 0;
      resizeN = 0;
      resizeS = 0;
      resizeNW = [0,0];
      resizeNE = [0,0];
      resizeSW = [0,0];
      resizeSE = [0,0];
    }
    if(this.isinherited) {
      this.base(_rect, _parent, _options);
    }
    else {
      this.isinherited = true;
      this.base(_rect, _parent, _options);
      this.isinherited = false;
    }
    this.preserveTheme = true;
    this.setDraggable(true);
    this._initActionFns();
    this._initActionFlag();
    if(!this.isinherited) {
      this.draw();
    }
  },
  _checkConstraints: function(_leftChange,_topChange){
    var _this = this, _rect = _this.rect,
        _options = _this.options,
        _dw, _dh;
    if(_rect.width < _options.minSize[0]){
      _dw=0-(_options.minSize[0]-_rect.width);
      _rect.setWidth( _options.minSize[0]);
      if(_leftChange){
        _rect.offsetBy( _dw, 0 );
      }
    }
    else if(_rect.width > _options.maxSize[0]){
      _dw=0-(_options.maxSize[0]-_rect.width);
      _rect.setWidth( _options.maxSize[0]);
      if(_leftChange){
        _rect.offsetBy( _dw, 0 );
      }
    }
    if(_rect.height < _options.minSize[1]){
      _dh=0-(_options.minSize[1]-_rect.height);
      _rect.setHeight(_options.minSize[1]);
      if(_topChange){
        _rect.offsetBy( 0, _dh );
      }
    }
    else if(_rect.height > _options.maxSize[1]){
      _dh=0-(_options.maxSize[1]-_rect.height);
      _rect.setHeight(_options.maxSize[1]);
      if(_topChange){
        _rect.offsetBy( 0, _dh );
      }
    }
    _this.drawRect();
  },
  _diffPoint: function(x,y){
    return this._startPoint.subtract(x,y);
  },
  
  dynResizeNW: function(_this,x,y){
    var _dp = _this._diffPoint(x,y);
    _this.rect.setLeftTop(_this._startRect.leftTop.subtract(_dp));
    _this._checkConstraints(1,1);
  },
  dynResizeNE: function(_this,x,y){
    var _dp = _this._diffPoint(x,y);
    _this.rect.setRightTop(_this._startRect.rightTop.subtract(_dp));
    _this._checkConstraints(0,1);
  },
  dynResizeSW: function(_this,x,y){
    var _dp = _this._diffPoint(x,y);
    _this.rect.setLeftBottom(_this._startRect.leftBottom.subtract(_dp));
    _this._checkConstraints(1,0);
  },
  dynResizeSE: function(_this,x,y){
    var _dp = _this._diffPoint(x,y);
    _this.rect.setRightBottom(_this._startRect.rightBottom.subtract(_dp));
    _this._checkConstraints(0,0);
  },
  dynResizeW: function(_this,x,y){
    var _dp = _this._diffPoint(x,y);
    _this.rect.setLeft(_this._startRect.left-_dp.x);
    _this._checkConstraints(1,0);
  },
  dynResizeE: function(_this,x,y){
    var _dp = _this._diffPoint(x,y);
    _this.rect.setRight(_this._startRect.right-_dp.x);
    _this._checkConstraints(0,0);
  },
  dynResizeN: function(_this,x,y){
    var _dp = _this._diffPoint(x,y);
    _this.rect.setTop(_this._startRect.top-_dp.y);
    _this._checkConstraints(0,1);
  },
  dynResizeS: function(_this,x,y){
    var _dp = _this._diffPoint(x,y);
    _this.rect.setBottom(_this._startRect.bottom-_dp.y);
    _this._checkConstraints(0,0);
  },
  dynDrag: function(_this,x,y){
    var _dp = _this._diffPoint(x,y);
    _this.rect.offsetTo(_this._startRect.leftTop.subtract(_dp));
    _this._checkConstraints(1,1);
  },
  _initActionFns: function(){
    this._actionFns = [];
    this._actionCrsr = [
      'nw-resize', 'ne-resize', 'sw-resize', 'se-resize',
      'w-resize', 'e-resize', 'n-resize', 's-resize', 'move'
    ];
    var i, _this = this,
    _resizeNW=0,_resizeNE=1,_resizeSW=2,_resizeSE=3,
    _resizeW =4, _resizeE=5, _resizeN=6, _resizeS=7, _drag=8,
    _actionFns=this._actionFns;
    _actionFns[_resizeNW] = _this.dynResizeNW;
    _actionFns[_resizeNE] = _this.dynResizeNE;
    _actionFns[_resizeSW] = _this.dynResizeSW;
    _actionFns[_resizeSE] = _this.dynResizeSE;
    
    _actionFns[_resizeW] = _this.dynResizeW;
    _actionFns[_resizeE] = _this.dynResizeE;
    _actionFns[_resizeN] = _this.dynResizeN;
    _actionFns[_resizeS] = _this.dynResizeS;
    
    _actionFns[_drag] = _this.dynDrag;
    
  },
  makeRectRules: function(){
    var _opts=this.options, _rect=this.rect;
    return [
      // corners:
      [0,0,_opts.resizeNW[0],_opts.resizeNW[1]], // NW
      [_rect.width-_opts.resizeNE[0],0,_rect.width,_opts.resizeNE[1]], // NE
      [0,_rect.height-_opts.resizeSW[1],_opts.resizeSW[0],_rect.height], // SW
      [_rect.width-_opts.resizeSE[0],_rect.height-_opts.resizeSE[1],_rect.width,_rect.height], // SE
      // borders:
      [0,_opts.resizeN,_opts.resizeW,_rect.height-_opts.resizeS], // W
      [_rect.width-_opts.resizeE,_opts.resizeN,_rect.width,_rect.height-_opts.resizeS], // E
      [_opts.resizeW,0,_rect.width-_opts.resizeE,_opts.resizeN], // N
      [_opts.resizeW,_rect.height-_opts.resizeS,_rect.width-_opts.resizeE,_rect.height], // S
      // drag-area:
      [_opts.resizeW,_opts.resizeN,_rect.width-_opts.resizeE,_rect.height-_opts.resizeS]
    ];
  },
  _initActionFlag: function(){
    this._actionFlag = -1;
    this._actionRects = [];
    var i,_rr,_rectRules = this.makeRectRules();
    for(i=0;i!==9;i++){
      _rr = _rectRules[i];
      this._actionRects.push( new HRect(_rr[0],_rr[1],_rr[2],_rr[3]) );
    }
  },
  _detectActionFlag: function(){
    var i,
    _actionPoint = this._startPoint.subtract(this.rect.left,this.rect.top),
    _actionRects = this._actionRects;
    for(i=0;i!==9;i++){
      if(_actionRects[i].contains(_actionPoint)){
        this._actionFlag=i;
        this.setStyle('cursor',this._actionCrsr[i]);
        return;
      }
    }
  },
  startDrag: function(x,y,_isLeft){
    var _parent = this.parent;
    if(_parent.elemId){
      x-=_parent.pageX();
      y-=_parent.pageY();
    }
    this._startPoint = new HPoint(x,y);
    this._startRect  = new HRect( this.rect );
    this._detectActionFlag();
    if(this._actionFlag!==-1){
      this._actionFns[this._actionFlag](this,x,y);
    }
    return true; // prevents text selection
  },
  doDrag: function(x,y,_isLeft){
    var _parent = this.parent;
    if(_parent.elemId){
      x-=_parent.pageX();
      y-=_parent.pageY();
    }
    if(this._actionFlag!==-1){
      this._actionFns[this._actionFlag](this,x,y);
    }
    return true; // prevents text selection
  },
  endDrag: function(x,y,_isLeft){
    var _parent = this.parent;
    if(_parent.elemId){
      x-=_parent.pageX();
      y-=_parent.pageY();
    }
    if(this._actionFlag!==-1){
      this._actionFns[this._actionFlag](this,x,y);
    }
    this.setStyle('cursor','default');
    this._initActionFlag();
    return true; // prevents text selection
  }
});
