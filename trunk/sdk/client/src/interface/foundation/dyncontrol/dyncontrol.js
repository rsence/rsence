/***  HIMLE RIA SYSTEM
  ** 
  **  Copyright (C) 2008 HIMLE GROUP http://himle.sorsacode.com/
  ** 
  **  This program is free software; you can redistribute it and/or modify it under the terms
  **  of the GNU General Public License as published by the Free Software Foundation;
  **  either version 2 of the License, or (at your option) any later version. 
  **  This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
  **  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
  **  See the GNU General Public License for more details. 
  **  You should have received a copy of the GNU General Public License along with this program;
  **  if not, write to the Free Software Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
  ***/

HDynControl = HControl.extend({
  componentName: 'dyncontrol',
  componentBehaviour: ['view','control','window'],
  constructor: function( _rect, _parentClass, _options ){
    if(!_options) {
      _options={};
    }
    var _defaults = HClass.extend({
      minSize:   [24,54],
      maxSize:   [16000,9000],
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
      this.base(_rect, _parentClass, _options);
    }
    else {
      this.isinherited = true;
      this.base(_rect, _parentClass, _options);
      this.isinherited = false;
    }
    this.presrveTheme = true;
    this.setDraggable(true);
    this.type = "[HDynControl]";
    this._initActionFns();
    this._initActionFlag();
    if(!this.isinherited) {
      this.draw();
    }
  },
  drawRect: function(_leftChange,_topChange){
    if(this.rect.width <this.options.minSize[0]){
      var _dw=0-(this.options.minSize[0]-this.rect.width);
      this.rect.setWidth( this.options.minSize[0]);
      if(_leftChange){
        this.rect.offsetBy( _dw, 0 );
      }
    }
    else if(this.rect.width >this.options.maxSize[0]){
      var _dw=0-(this.options.maxSize[0]-this.rect.width);
      this.rect.setWidth( this.options.maxSize[0]);
      if(_leftChange){
        this.rect.offsetBy( _dw, 0 );
      }
    }
    if(this.rect.height<this.options.minSize[1]){
      var _dh=0-(this.options.minSize[1]-this.rect.height);
      this.rect.setHeight(this.options.minSize[1]);
      if(_topChange){
        this.rect.offsetBy( 0, _dh );
      }
    }
    else if(this.rect.height>this.options.maxSize[1]){
      var _dh=0-(this.options.maxSize[1]-this.rect.height);
      this.rect.setHeight(this.options.maxSize[1]);
      if(_topChange){
        this.rect.offsetBy( 0, _dh );
      }
    }
    this.base();
  },
  draw: function(){
    var _isDrawn = _this.drawn;
    this.base();
    this.drawRect();
    if(!_isDrawn){
      this.drawMarkup();
      this.buildStructure();
    }
  },
  buildStructure: function(){
    
  },
  _diffPoint: function(_x,_y){
    return this._prevPoint.subtract(_x,_y);
  },
  
  dynResizeNW: function(_this,_x,_y){
    var _dp = _this._diffPoint(_x,_y);
    _this.rect.setLeftTop(_this.rect.leftTop.subtract(_dp));
    _this.drawRect(1,1);
    _this._prevPoint.set(_x,_y);
  },
  dynResizeNE: function(_this,_x,_y){
    var _dp = _this._diffPoint(_x,_y);
    _this.rect.setRightTop(_this.rect.rightTop.subtract(_dp));
    _this.drawRect(0,1);
    _this._prevPoint.set(_x,_y);
  },
  dynResizeSW: function(_this,_x,_y){
    var _dp = _this._diffPoint(_x,_y);
    _this.rect.setLeftBottom(_this.rect.leftBottom.subtract(_dp));
    _this.drawRect(1,0);
    _this._prevPoint.set(_x,_y);
  },
  dynResizeSE: function(_this,_x,_y){
    var _dp = _this._diffPoint(_x,_y);
    _this.rect.setRightBottom(_this.rect.rightBottom.subtract(_dp));
    _this.drawRect(0,0);
    _this._prevPoint.set(_x,_y);
  },
  dynResizeW: function(_this,_x,_y){
    var _dp = _this._diffPoint(_x,_y);
    _this.rect.setLeft(_this.rect.left-_dp.x);
    _this.drawRect(1,0);
    _this._prevPoint.set(_x,_y);
  },
  dynResizeE: function(_this,_x,_y){
    var _dp = _this._diffPoint(_x,_y);
    _this.rect.setRight(_this.rect.right-_dp.x);
    _this.drawRect(0,0);
    _this._prevPoint.set(_x,_y);
  },
  dynResizeN: function(_this,_x,_y){
    var _dp = _this._diffPoint(_x,_y);
    _this.rect.setTop(_this.rect.top-_dp.y);
    _this.drawRect(0,1);
    _this._prevPoint.set(_x,_y);
  },
  dynResizeS: function(_this,_x,_y){
    var _dp = _this._diffPoint(_x,_y);
    _this.rect.setBottom(_this.rect.bottom-_dp.y);
    _this.drawRect(0,0);
    _this._prevPoint.set(_x,_y);
  },
  dynDrag: function(_this,_x,_y){
    var _dp = _this._diffPoint(_x,_y);
    _this.rect.offsetTo(_this.rect.leftTop.subtract(_dp));
    _this.drawRect(1,1);
    _this._prevPoint.set(_x,_y);
  },
  _initActionFns: function(){
    this._actionFns = [];
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
  _initActionFlag: function(){
    this._actionFlag = -1;
    this._actionRects = [];
    var i,_rr,
    _opts=this.options, _rect=this.rect,
    _rectRules = [
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
    for(i=0;i!=9;i++){
      _rr = _rectRules[i];
      this._actionRects.push( new HRect(_rr[0],_rr[1],_rr[2],_rr[3]) );
    }
  },
  _detectActionFlag: function(){
    var i,
    _actionPoint = this._startPoint.subtract(this.rect.left,this.rect.top),
    _actionRects = this._actionRects;
    for(i=0;i!=9;i++){
      if(_actionRects[i].contains(_actionPoint)){
        this._actionFlag=i;
        return;
      }
    }
  },
  startDrag: function(_x,_y,_isLeft){
    this._startPoint = new HPoint(_x,_y);
    this._prevPoint  = new HPoint(_x,_y);
    this._startRect  = new HRect( this.rect );
    this._detectActionFlag();
    if(this._actionFlag==8){
      this.setStyle('cursor','move');
    }
    this.bringToFront();
    this.doDrag(_x,_y,_isLeft);
  },
  doDrag: function(_x,_y,_isLeft){
    if(this._actionFlag!=-1){
      this._actionFns[this._actionFlag](this,_x,_y);
    }
  },
  endDrag: function(_x,_y,_isLeft){
    this.doDrag(_x,_y,_isLeft);
    if(this._actionFlag==8){
      this.setStyle('cursor','default');
    }
    this._initActionFlag();
  }
});
