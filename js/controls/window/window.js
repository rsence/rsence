/*   Riassence Framework
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
  *               moving.
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
  * +zoomButton+:: A flag (when true) enables the zoom (or maximize)
  *                button of the HWindow instance. By default it's
  *                disabled. When enabled, extend the 
  *                HWindow#windowZoom method, which by default zooms the
  *                contents of the HWindow to fit or the +maxSize+ depending
  *                on which is smaller.
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
        this.resizeSE = [ 16, 16 ];
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
    zoomButton: false
  })),
  
  draw: function(){
    var _drawn = this.drawn;
    this.base();
    if(!_drawn){
      HSystem.windowFocus(this);
    }
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
      if(_opts.zoomButton){
        _leftPx = 61;
      }
      else if(_opts.collapseButton){
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
    var _rect = this.base();
    if(_rect[2]<this.options.minSize[0]){
      _rect[2] = this.options.minSize[0];
    }
    else if(_rect[2]>this.options.maxSize[0]){
      _rect[2] = this.options.maxSize[0];
    }
    if(_rect[3]<this.options.minSize[1]){
      _rect[3] = this.options.minSize[1];
    }
    else if(_rect[3]>this.options.maxSize[1]){
      _rect[3] = this.options.maxSize[1];
    }
    return _rect;
  },
  
/** Reports to HSystem that this window has the focus and the 
  * previously active window needs to blur 
  **/
  gainedActiveStatus: function(){
    HSystem.windowFocus(this);
  },
  
/** HSystem calls this method, whenever this window is allowed to be focused
  **/
  windowFocus: function(){
    this.toggleCSSClass(this.elemId, 'inactive', false);
  },
  
/** HSystem calls this method, whenever this window needs to lose its 
  * focus (another window focused) 
  **/
  windowBlur: function(){
    this.toggleCSSClass(this.elemId, 'inactive', true);
    this.setStyle('cursor','default');
  },
  
/** This method gets called, whenever the close button has been clicked
  **/
  windowClose: function(){
    this.die(); // extend this to this.app.die(), if your app needs to die instead of just the window
  },
  
/** This method gets called, whenever the collapse (minimize) button has 
  * been clicked
  **/
  windowCollapse: function(){
    var _minRect = HRect.nu(
      this.rect.leftTop,
      this.rect.leftTop.subtract(
        0-this.options.minSize[0],
        0-this.options.minSize[1]
      )
    );
    _minRect.setHeight(26);
    if(this.rect.equals(_minRect)){
      if(this.prevRect !== undefined && !this.prevRect.equals(_minRect)){
        this.animateTo( HRect.nu( this.prevRect ) );
      }
      else {
        this.windowZoom();
      }
    }
    else {
      this.prevRect = HRect.nu(_minRect);
      this.animateTo( _minRect );
    }
  },
  
/** This method gets called, whenever the zoom (maximize/restore) 
  * button has been clicked
  **/
  windowZoom: function(){
    var _maxSize = this.options.maxSize === 'auto' ? this.parentSize() : this.options.maxSize,
        _maxRect = HRect.nu(
          this.options.minX,
          this.options.minY,
          _maxSize[0],
          _maxSize[1]
        ),
        _fitsRect = HRect.nu( this.rect ),
        i = 0,
        _views = this.views,
        _view, _size, _right, _bottom;
    for( ; i < _views.length; i++ ){
      _view = HSystem.views[_views[i]];
      _size = ELEM.getVisibleSize(_view.elemId);
      _pos  = ELEM.getVisiblePosition(_view.elemId);
      _right = _size[0]+_pos[0];
      _bottom = _size[1]+_pos[1];
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
    if(this.rect.equals(_fitsRect)){
      if(this.prevRect !== undefined && !this.prevRect.equals(_fitsRect)){
        this.animateTo( HRect.nu(this.prevRect) );
      }
      else {
        this.prevRect = HRect.nu( this.rect );
        this.animateTo( _maxRect );
      }
    }
    else {
      this.prevRect = HRect.nu(_fitsRect);
      this.animateTo( _fitsRect );
    }
  }
});

