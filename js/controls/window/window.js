/*   RSence
 *   Copyright 2008 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

/*** = Description
  ** The HWindow component can contain subviews and its position and size
  ** is modifiable by the user (within limits).
  ** Its label is the title of the HWindow and its constructor support a
  ** few additions to the set of HDynControl#controlDefaults.
  ** See #controlDefaults
  **
  ***/
var//RSence.Controls
HWindow = HDynControl.extend({
  
  componentName:      'window',
  
/** = Description
  * In addition to the standard HControl#constructor options,
  * the following properties can be set:
  * 
  * Key::         Description
  * +minX+::      The minimum X-coordinate allowed to be dragged or resized to.
  *               Defaults to +0+.
  * +minY+::      The minimum Y-coordinate allowed to be dragged or resized to.
  *               Defaults to +0+.
  * +maxX+::      The maximum X-coordinate allowed to be dragged or resized to.
  *               Defaults to the browser window width.
  * +maxY+::      The maximum Y-coordinate allowed to be dragged or resized to.
  *               Defaults to the browser window height.
  * +minSize+::   An array containing exactly two values: +[ width, height ]+.
  *               Defines the minimum size allowed for resizing.
  *               Defaults to +[ 96, 54 ]+
  * +maxSize+::   An array containing exactly two values: +[ width, height ]+.
  *               Defines the maximum size allowed for resizing.
  *               Defaults to the browser window size.
  * +resizeW+::   The size of the west (left) resizable edge. Defaults to +6+.
  * +resizeE+::   The size of the east (right) resizable edge. Defaults to +6+.
  * +resizeN+::   The size of the north (top) resizable edge. Defaults to +6+.
  * +resizeS+::   The size of the south (bottom) resizable edge. Default to +6+.
  * +resizeNW+::  The size of the north-west (left top) resizable corner.
  *               Defaults to +[ 6, 6 ]+
  * +resizeNE+::  The size of the north-east (right top) resizable corner.
  *               Defaults to +[ 6, 6 ]+
  * +resizeSW+::  The size of the south-west (left bottom) resizable corner.
  *               Defaults to +[ 6, 6 ]+
  * +resizeSE+::  The size of the south-east (right bottom) resizable corner.
  *               Defaults to +[ 16, 16 ]+
  * +noResize+::  A flag (when true) disables all resizing and only allows
  *               moving. Does not disable the (-) and (+) buttons.
  * +fullWindowMove+:: A flag (when true) enables the full HWindow area 
  *                    responds to drag events. By default it's false,
  *                    meaning only the title bar is draggable.
  * +closeButton+:: A flag (when true) enables the close button of HWindow.
  *                 By default, it's disabled. When enabled, extend the
  *                 HWindow#windowClose method. By default it destructs
  *                 the HWindow instance.
  * +collapseButton+:: A flag (when true) enables the collapse (or minimize)
  *                    button of the HWindow instance. By default it's
  *                    disabled. When enabled, extend the 
  *                    HWindow#windowCollapse method, which by default
  *                    zooms the window to its +minSize+.
  * +minimizeButton+:: An alias for +collapseButton+
  * +zoomButton+:: A flag (when true) enables the zoom (or maximize)
  *                button of the HWindow instance. By default it's
  *                disabled. When enabled, extend the 
  *                HWindow#windowZoom method, which by default zooms the
  *                contents of the HWindow to fit or the +maxSize+ depending
  *                on which is smaller.
  * +resizeButton+:: An alias for +zoomButton+
  * +maximizeButton+:: An alias for +zoomButton+
  *
  **/
  controlDefaults: (HDynControl.prototype.controlDefaults.extend({
    constructor: function(_ctrl){
      var _winSize = ELEM.windowSize(),
          _winWidth = _winSize[0],
          _winHeight = _winSize[1];
      if(!this.minSize){
        this.minSize = [96,54];
      }
      if(!this.maxSize){
        this.maxSize = _winSize;
      }
      if(!this.maxX){
        this.maxX = _winWidth-this.minSize[0];
      }
      if(!this.maxY){
        this.maxY = _winHeight-this.minSize[1];
      }
      if(!this.events){
        this.events = {
          draggable: true
        };
      }
      if(!this.resizeNW){
        this.resizeNW = [ 6, 6 ];
      }
      if(!this.resizeNE){
        this.resizeNE = [ 6, 6 ];
      }
      if(!this.resizeSW){
        this.resizeSW = [ 6, 6 ];
      }
      if(!this.resizeSE){
        this.resizeSE = [ 25, 25 ];
      }
    },
    maxX: 'auto',
    maxY: 'auto',
    maxSize: 'auto',
    resizeW:   4,
    resizeE:   4,
    resizeN:   4,
    resizeS:   4,
    fullWindowMove: false,
    closeButton: false,
    collapseButton: false,
    minimizeButton: false,
    zoomButton: false,
    resizeButton: false,
    maximizeButton: false
  })),
  
  draw: function(){
    var _drawn = this.drawn;
    this.base();
    if(!_drawn){
      HSystem.windowFocus(this);
    }
  },

  markupElemNames: [
    'label', 'control', 'subview', 'close', 'collapse', 'zoom', 'resize'
  ],

  refreshWidgetStates: function(){
    if(!this.drawn){ return; }
    var
    _this = this,
    _opts = _this.options,
    _elemId, _elem,
    // _elemId = _this.markupElemIds.zoom,
    // _elem = ELEM.get(_elemId),
    _enablePrefix = 'enable_', _disablePrefix = 'disable_',
    _listenEvent = 'click',
    _addClass, _delClass,
    _widgets = [
      [ 'zoom', (_this.enabled && (_opts.zoomButton || _opts.maximizeButton || _opts.resizeButton)), function(){_this.windowZoom();} ],
      [ 'collapse', (_this.enabled && (_opts.collapseButton || _opts.minimizeButton)), function(){_this.windowCollapse();} ],
      [ 'close', (_this.enabled && _opts.closeButton), function(){_this.windowClose();} ]
    ],
    _elemName, _enabled, _callback,
    _item, i = 0;
    for(;i<_widgets.length;i++){
      _item = _widgets[i];
      _elemName = _item[0];
      _enabled = _item[1];
      _callback = _item[2];
      _elemId = _this.markupElemIds[_elemName];
      _elem = ELEM.get(_elemId);
      Event.stopObserving( _elem, _listenEvent, _callback );
      if(_enabled){
        Event.observe( _elem, _listenEvent, _callback );
        _addClass = _enablePrefix+_elemName;
        _delClass = _disablePrefix+_elemName;
      }
      else {
        _delClass = _enablePrefix+_elemName;
        _addClass = _disablePrefix+_elemName;
      }
      ELEM.addClassName( _elemId, _addClass );
      ELEM.delClassName( _elemId, _delClass );
    }
    _this.setStyleOfPart('resize','visibility',(_opts.noResize?'hidden':'inherit'));
  },

  drawSubviews: function(){
    this.base();
    this.refreshWidgetStates();
  },

  setEnabled: function(_state){
    this.base(_state);
    this.refreshWidgetStates();
  },
  
  // -- overrides the drag rules to adapt to the !fullWindowMove as well
  // as disabling draggability in window button areas. ++

/** = Description
  * makeRectRules function
  *
  *
  **/
  makeRectRules: function(){
    var _this = this,
        _rectRules = _this.base(),
        _rect = _this.rect,
        _opts = _this.options,
        _leftPx=_opts.resizeW;
    if(!_opts.fullWindowMove){
      if(_opts.zoomButton || _opts.maximizeButton || _opts.resizeButton){
        _leftPx = 61;
      }
      else if(_opts.collapseButton || _opts.minimizeButton){
        _leftPx = 46;
      }
      else if(_opts.closeButton){
        _leftPx = 27;
      }
      _rectRules[8] = [_leftPx,_opts.resizeN,_rect.width-_opts.resizeE,25];
    }
    return _rectRules;
  },
  
  maxRect: function(){
    var _rect = this.base(), _opts = this.options;
    if(_rect[2]<_opts.minSize[0]){
      _rect[2] = _opts.minSize[0];
    }
    else if(_rect[2]>_opts.maxSize[0]){
      _rect[2] = _opts.maxSize[0];
    }
    if(_rect[3]<_opts.minSize[1]){
      _rect[3] = _opts.minSize[1];
    }
    else if(_rect[3]>_opts.maxSize[1]){
      _rect[3] = _opts.maxSize[1];
    }
    return _rect;
  },

  hasWindowFocus: false,

/** Reports to HSystem that this window has the focus and the 
  * previously active window needs to blur 
  **/
  gainedActiveStatus: function(){
    HSystem.windowFocus(this);
  },
  
/** HSystem calls this method, whenever this window is allowed to be focused
  **/
  windowFocus: function(){
    this.hasWindowFocus = true;
    this.toggleCSSClass(this.elemId, 'inactive', false);
  },
  
/** HSystem calls this method, whenever this window needs to lose its 
  * focus (another window focused) 
  **/
  windowBlur: function(){
    this.hasWindowFocus = false;
    this.toggleCSSClass(this.elemId, 'inactive', true);
    this.setStyle('cursor','default');
  },
  
/** This method gets called, whenever the close button has been clicked
  **/
  windowClose: function(){
    this.die(); // extend this to this.app.die(), if your app needs to die instead of just the window
  },

  setLabel: function(_label){
    this.base(_label);
    var
    _labelWidth = 128 + _win.stringWidth( _win.label );
    if(this._origMinWidth === undefined){
      this._origMinWidth = this.options.minSize[0];
    }
    if(this._origMinWidth<_labelWidth){
      this.options.minSize[0] = _labelWidth;
    }
    else{
      this.options.minSize[0] = this._origMinWidth;
    }
    this.makeRectRules();
  },
  
/** This method gets called, whenever the collapse (minimize) button has 
  * been clicked
  **/
  windowCollapse: function(_rectOnly){
    var
    _win = this, _opts = _win.options;
    if(HSystem.globalCollapseHandler && !_rectOnly && HSystem.globalCollapseHandler( _win )){
      return;
    }
    if(_opts.collapseUsing && !_rectOnly){
      _opts.collapseUsing( this );
    }
    else {
      var
      _labelSize = 128 + _win.stringWidth( _win.label ),
      _minWidth = (_opts.minSize[1] > _labelSize)?_opts.minSize[0]:_labelSize,
      _minRect = HRect.nu(
        _win.rect.leftTop,
        _win.rect.leftTop.subtract(
          0-_minWidth,
          0-_opts.minSize[1]
        )
      );
      if(_rectOnly){
        return _minRect;
      }
      if(!_win.rect.equals(_minRect)){
        _win.prevRect = HRect.nu(_minRect);
        _win.animateTo( _minRect );
      }
    }
    this.makeRectRules();
  },
  
/** This method gets called, whenever the zoom (maximize/restore) 
  * button has been clicked
  **/
  windowZoom: function(){
    var
    _maxSize = this.options.maxSize === 'auto' ? this.parentSize() : this.options.maxSize,
    _maxRect = HRect.nu(
      this.options.minX,
      this.options.minY,
      _maxSize[0],
      _maxSize[1]
    ),
    _fitsRect = HRect.nu( this.rect ),
    _newRect,
    i = 0,
    _views = this.views,
    _view, _size, _right, _bottom;
    for( ; i < _views.length; i++ ){
      _view = HSystem.views[_views[i]];
      _size = ELEM.getSize(_view.elemId);
      _pos  = ELEM.getVisiblePosition(_view.elemId);
      _right = _size[0]+_pos[0]-this.pageX();
      _bottom = _size[1]+_pos[1]-this.pageY();
      if(_right > _fitsRect.width){
        _fitsRect.setWidth(_right);
      }
      if(_bottom > _fitsRect.height){
        _fitsRect.setHeight(_bottom);
      }
    }
    if(_fitsRect.width > _maxSize[0]){
      _fitsRect.setWidth( _maxSize[0] );
    }
    else if(_fitsRect.width < this.options.minSize[0]){
      _fitsRect.setWidth( this.options.minSize[0] );
    }
    if(_fitsRect.height > _maxSize[1]){
      _fitsRect.setHeight( _maxSize[1] );
    }
    else if(_fitsRect.height < this.options.minSize[1]){
      _fitsRect.setHeight( this.options.minSize[1] );
    }
    // doesn't fit or right-clicked or alt-clicked, maximize:
    if (!_fitsRect.equals(_maxRect) && (EVENT.status[ EVENT.button2 ] || EVENT.status[ EVENT.altKeyDown ]) ){
      // console.log('force-max');
      this.animateTo( _maxRect );
      this.prevRect = HRect.nu( this.rect );
      this.animateTo( _maxRect );
    }
    // already fits content
    else if(this.rect.contains(_fitsRect)){
      // restore previous
      if(this.prevRect && !this.prevRect.equals(_fitsRect) && !this.prevRect.equals(this.windowCollapse(true))){
        // restore previous size and position:
        if( this.rect.equals( _maxRect ) ){
          // console.log('restore');
          this.animateTo( HRect.nu(this.prevRect) );
          // this.prevRect = HRect.nu( this.rect );
        }
        else if( this.prevRect.equals( this.rect ) && !this.prevRect.equals(_fitsRect) ){
          // console.log('smart-down');
          this.animateTo( _fitsRect );
          // this.prevRect = HRect.nu( this.rect );
        }
        else if( this.prevRect.equals( this.rect ) && this.prevRect.equals(_fitsRect) ){
          // console.log('smart-max');
          this.animateTo( _maxRect );
          this.prevRect = HRect.nu( this.rect );
        }
        else{
          // console.log('prev-size');
          _newRect = HRect.nu( this.prevRect );
          _newRect.offsetTo(this.rect.leftTop);
          this.animateTo( _newRect );
          this.prevRect = HRect.nu( _newRect );
        }
      }
      // restore previous size only:
      else if( this.rect.equals( _fitsRect ) && this.prevRect && !this.prevRect.equals(this.rect) ){
        // console.log('restore-smart');
        this.animateTo( this.prevRect );
        // this.prevRect = HRect.nu( this.rect );
      }
      // maximize
      else {
        // console.log('max');
        this.prevRect = HRect.nu( this.rect );
        this.animateTo( _maxRect );
      }
    }
    // smart-resize to fit content:
    else {
      // console.log('smart-up');
      // this.prevRect = HRect.nu(_fitsRect);
      this.animateTo( _fitsRect );
    }
  }
});

