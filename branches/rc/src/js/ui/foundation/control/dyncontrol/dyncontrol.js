/*   Riassence Framework
 *   Copyright 2008 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

/*** = Description
  ** A +HControl+ extension that defines a draggable and
  ** resizable foundation box.
  **
  ** See +HWindow+ for an implementation example.
  **
***/
HDynControl = HControl.extend({
  
  componentBehaviour: ['view','control','window'],
  
/** = Description
  * Like the +HControl.constructor+, but defines the following extra
  * attributes to +_options+:
  *
  * +minX+::      The minimun x-coordinate (from parent's left edge).
  *               Defaults to 0.
  *
  * +minY+::      The minimun y-coordinate (from parent's top edge).
  *               Defaults to 0.
  *
  * +maxX+::      The minimun x-coordinate (from parent's left edge).
  *               Defaults to the current browser window width.
  *
  * +maxY+::      The minimun y-coordinate (from parent's top edge).
  *               Defaults to the current browser window height.
  *
  * +minSize+::   An array containing the minimum +[ width, height ]+.
  *               Defaults to +[ 24, 54 ]+.
  *
  * +maxSize+::   An array containing the maximum +[ width, height ]+.
  *               Defaults to the window dimensions.
  *
  * +resizeW+::   The west (left) resizable edge trigger size.
  *               Defaults to 1.
  *
  * +resizeE+::   The east (right) resizable edge trigger size.
  *               Defaults to 1.
  *
  * +resizeN+::   The north (top) resizable edge trigger size.
  *               Defaults to 1.
  *
  * +resizeS+::   The south (bottom) resizable edge trigger size.
  *               Defaults to 1.
  *
  * +resizeNW+::  The north-west (left top) resizable corner trigger size.
  *               Defaults to [ 1, 1 ].
  *
  * +resizeNE+::  The north-east (right top) resizable corner trigger size.
  *               Defaults to [ 1, 1 ].
  *
  * +resizeSW+::  The south-west (left bottom) resizable corner trigger size.
  *               Defaults to [ 1, 1 ].
  *
  * +resizeSE+::  The south-east (right bottom) resizable corner trigger size.
  *               Defaults to [ 1, 1 ].
  *
  * +noResize+::  A boolean flag toggling resizability. When true, disables
  *               resizing and causes all trigger areas respond to moving
  *               the offset of the view.
  *
  **/
  constructor: function( _rect, _parent, _options ){
    if(!_options) {
      _options={};
    }
    var _winSize = ELEM.windowSize(),
        _defaults = HClass.extend({
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
  
  /* Method for checking the change is within the limits */
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
  
  /* Method for returning the coordinate difference as a HPoint instance */
  _diffPoint: function(x,y){
    return this._startPoint.subtract(x,y);
  },
  
/** = Description
  * Sub-event method responder when the north-west (left-top) corner is being
  * moved to resize the view.
  *
  * By default calculates the dimensions and checks the constraints.
  *
  * = Parameters
  * +_this+:: The instance of the class it belongs to (+self+).
  * +x+::     The current x coordinate of the mouse cursor.
  * +y+::     The current y coordinate of the mouse cursor.
  *
  **/
  dynResizeNW: function(_this,x,y){
    var _dp = _this._diffPoint(x,y);
    _this.rect.setLeftTop(_this._startRect.leftTop.subtract(_dp));
    _this._checkConstraints(1,1);
  },
  
/** = Description
  * Sub-event method responder when the north-east (right-top) corner is being
  * moved to resize the view.
  *
  * By default calculates the dimensions and checks the constraints.
  *
  * = Parameters
  * +_this+:: The instance of the class it belongs to (+self+).
  * +x+::     The current x coordinate of the mouse cursor.
  * +y+::     The current y coordinate of the mouse cursor.
  *
  **/
  dynResizeNE: function(_this,x,y){
    var _dp = _this._diffPoint(x,y);
    _this.rect.setRightTop(_this._startRect.rightTop.subtract(_dp));
    _this._checkConstraints(0,1);
  },
  
/** = Description
  * Sub-event method responder when the south-west (left-bottom) corner is being
  * moved to resize the view.
  *
  * By default calculates the dimensions and checks the constraints.
  *
  * = Parameters
  * +_this+:: The instance of the class it belongs to (+self+).
  * +x+::     The current x coordinate of the mouse cursor.
  * +y+::     The current y coordinate of the mouse cursor.
  *
  **/
  dynResizeSW: function(_this,x,y){
    var _dp = _this._diffPoint(x,y);
    _this.rect.setLeftBottom(_this._startRect.leftBottom.subtract(_dp));
    _this._checkConstraints(1,0);
  },
  
/** = Description
  * Sub-event method responder when the south-east (right-bottom) corner is being
  * moved to resize the view.
  *
  * By default calculates the dimensions and checks the constraints.
  *
  * = Parameters
  * +_this+:: The instance of the class it belongs to (+self+).
  * +x+::     The current x coordinate of the mouse cursor.
  * +y+::     The current y coordinate of the mouse cursor.
  *
  **/
  dynResizeSE: function(_this,x,y){
    var _dp = _this._diffPoint(x,y);
    _this.rect.setRightBottom(_this._startRect.rightBottom.subtract(_dp));
    _this._checkConstraints(0,0);
  },
  
/** = Description
  * Sub-event method responder when the west (left) edge is being
  * moved to resize the view.
  *
  * By default calculates the dimensions and checks the constraints.
  *
  * = Parameters
  * +_this+:: The instance of the class it belongs to (+self+).
  * +x+::     The current x coordinate of the mouse cursor.
  * +y+::     The current y coordinate of the mouse cursor.
  *
  **/
  dynResizeW: function(_this,x,y){
    var _dp = _this._diffPoint(x,y);
    _this.rect.setLeft(_this._startRect.left-_dp.x);
    _this._checkConstraints(1,0);
  },
  
/** = Description
  * Sub-event method responder when the east (right) edge is being
  * moved to resize the view.
  *
  * By default calculates the dimensions and checks the constraints.
  *
  * = Parameters
  * +_this+:: The instance of the class it belongs to (+self+).
  * +x+::     The current x coordinate of the mouse cursor.
  * +y+::     The current y coordinate of the mouse cursor.
  *
  **/
  dynResizeE: function(_this,x,y){
    var _dp = _this._diffPoint(x,y);
    _this.rect.setRight(_this._startRect.right-_dp.x);
    _this._checkConstraints(0,0);
  },
  
/** = Description
  * Sub-event method responder when the north (top) edge is being
  * moved to resize the view.
  *
  * By default calculates the dimensions and checks the constraints.
  *
  * = Parameters
  * +_this+:: The instance of the class it belongs to (+self+).
  * +x+::     The current x coordinate of the mouse cursor.
  * +y+::     The current y coordinate of the mouse cursor.
  *
  **/
  dynResizeN: function(_this,x,y){
    var _dp = _this._diffPoint(x,y);
    _this.rect.setTop(_this._startRect.top-_dp.y);
    _this._checkConstraints(0,1);
  },
  
/** = Description
  * Sub-event method responder when the south (bottom) edge is being
  * moved to resize the view.
  *
  * By default calculates the dimensions and checks the constraints.
  *
  * = Parameters
  * +_this+:: The instance of the class it belongs to (+self+).
  * +x+::     The current x coordinate of the mouse cursor.
  * +y+::     The current y coordinate of the mouse cursor.
  *
  **/
  dynResizeS: function(_this,x,y){
    var _dp = _this._diffPoint(x,y);
    _this.rect.setBottom(_this._startRect.bottom-_dp.y);
    _this._checkConstraints(0,0);
  },
  
/** = Description
  * Sub-event method responder when moving the offset of the view.
  * This is called when no resize areas are triggered.
  *
  * By default calculates the dimensions and checks the constraints.
  *
  * = Parameters
  * +_this+:: The instance of the class it belongs to (+self+).
  * +x+::     The current x coordinate of the mouse cursor.
  * +y+::     The current y coordinate of the mouse cursor.
  *
  **/
  dynDrag: function(_this,x,y){
    var _dp = _this._diffPoint(x,y);
    _this.rect.offsetTo(_this._startRect.leftTop.subtract(_dp));
    _this._checkConstraints(1,1);
  },
  
  /* Method to initialize the rules */
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
  
  
/** Calculates the rectangles for all the active areas.
  **/
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
  
  /* Method used for initializing the action flags. */
  _initActionFlag: function(){
    this._actionFlag = -1;
    this._actionRects = [];
    var i=0,_rr,_rectRules = this.makeRectRules();
    for(;i<9;i++){
      _rr = _rectRules[i];
      this._actionRects.push( HRect.nu(_rr[0],_rr[1],_rr[2],_rr[3]) );
    }
  },
  
  /* Method used to detect the action flags. Also sets the cursor. */
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
  
/** = Description
  * Event method responder that decides and initializes
  * a resize or move operation on the drag events.
  *
  * = Parameters
  * +x+::              The current x coordinate of the mouse cursor.
  * +y+::              The current y coordinate of the mouse cursor.
  * +_isRightButton+:: A flag that is true when right (or contect) clicking.
  *
  * = Returns
  * +true+
  *
  **/
  startDrag: function(x,y,_isRightButton){
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
  
/** = Description
  * Event method responder that performs a resize or move recalculation
  * and redraw call when dragging one of the corners or edges to resize or
  * any other area to move.
  *
  * = Parameters
  * +x+::              The current x coordinate of the mouse cursor.
  * +y+::              The current y coordinate of the mouse cursor.
  *
  * = Returns
  * +true+
  *
  **/
  doDrag: function(x,y){
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

/** = Description
  * Event method responder that ends a resize or move operation.
  * Also restores the mouse cursor.
  *
  * = Parameters
  * +x+::              The current x coordinate of the mouse cursor.
  * +y+::              The current y coordinate of the mouse cursor.
  * +_isRightButton+:: A flag that is true when right (or contect) clicking.
  *
  * = Returns
  * +true+
  *
  **/
  endDrag: function(x,y,_isRightButton){
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
