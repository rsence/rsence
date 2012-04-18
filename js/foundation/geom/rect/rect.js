/*   RSence
 *   Copyright 2006 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

/*** = Description
  ** A Rect object represents a rectangle. Rects are used throughout the
  ** Components to define the frames of windows, views, bitmaps even the
  ** screen itself. A HRect is defined by its four sides, expressed as the public
  ** data members left, top, right, and bottom.
  **
  ** If you change a component's rect, you should call its HView.drawRect method.
  **
  ** = Instance Variables
  ** +type+::         '[HRect]'
  ** +top+::          The position of the rect's top side (from parent top)
  ** +left+::         The position of the rect's left side (from parent left)
  ** +bottom+::       The position of the rect's bottom side (from parent top)
  ** +right+::        The position of the rect's right side (from parent left)
  ** +leftTop+::      A HPoint representing the coordinate of the rect's left top corner
  ** +leftBottom+::   A HPoint representing the coordinate of the rect's left bottom corner
  ** +rightTop+::     A HPoint representing the coordinate of the rect's right top corner
  ** +rightBottom+::  A HPoint representing the coordinate of the rect's right bottom corner
  ** +width+::        The width of the rect.
  ** +height+::       The height of the rect.
  ***/
var//RSence.Foundation.Geom
HRect = HClass.extend({
/** = Description
  * Initializes a Rect as four sides, as two diametrically opposed corners,
  * or as a copy of some other Rect object. A rectangle that's not assigned
  * any initial values is invalid, until a specific assignment is made, either
  * through a set() function or by setting the object's data members directly.
  *
  * = Parameters
  * using a HRect instance:
  * +rect+::  Another HRect.
  *
  * using two HPoint instances:
  * +leftTop+::       Coordinates of the left top corner.
  * +rightBottom+::   Coordinates of the right bottom corner.
  *
  * using separate numeric coordinates:
  * +left+::    The coordinate of left side.
  * +top+::     The coordinate of top side.
  * +right+::   The coordinate of right side.
  * +bottom+::  The coordinate of bottom side.
  *
  * = Usage
  *  var myLeftTopPoint = new HPoint(100,200);
  *  var myBottomRightPoint = new HPoint(300,400);
  *  var myRectFromOppositeCornerPoints = new HRect( myLeftTopPoint, myBottomRightPoint );
  *  var myRectFromSideCoordinates = new HRect(100,200,300,400);
  *  var myRectFromAnotherRect = new HRect( myRectFromEdgeCoordinates );
  *
  **/
  constructor: function() {
    this.viewIds = [];
    var _args=arguments;
    
    if (_args.length === 0) {
      this._constructorDefault();
    } else if (_args.length === 4) {
      this._constructorSides(_args[0],_args[1],_args[2],_args[3]);
    }
    else if (_args.length === 2) {
      this._constructorPoint(_args[0],_args[1]);
    }
    else if (_args.length === 1) {
      if(_args[0] instanceof Array){
        this._constructorSides(_args[0][0],_args[0][1],_args[0][2],_args[0][3]);
      }
      else{
        this._constructorRect(_args[0]);
      }
    }
    else {
      throw "Invalid number of arguments.";
    }
    this.updateSecondaryValues();
  },
  _constructorDefault: function() {
    this.top = 0;
    this.left = 0;
    this.bottom = -1;
    this.right = -1;
  },
  _constructorSides: function(_left, _top, _right, _bottom) {
    this.top = _top;
    this.left = _left;
    this.bottom = _bottom;
    this.right = _right;
  },
  _constructorPoint: function(_leftTop, _rightBottom) {
    this.top = _leftTop.y;
    this.left = _leftTop.x;
    this.bottom = _rightBottom.y;
    this.right = _rightBottom.x;
  },
  _constructorRect: function(_rect) {
    this.top = _rect.top;
    this.left = _rect.left;
    this.bottom = _rect.bottom;
    this.right = _rect.right;
  },
  
  _updateFlexibleDimensions: function(){
    var
    _this = this,
    _viewIds = _this.viewIds,
    _parentElemId,
    _parentSize,
    _parentWidth,
    _parentHeight,
    _virtualWidth,
    _virtualHeight,
    _viewId,
    _view,
    i = 0;
    for(;i<_viewIds.length;i++){
      _viewId = _viewIds[i];
      _view = HSystem.views[_viewId];
      if(_view.flexRight || _view.flexBottom){
        ELEM.flush();
        _parentSize = _view.parentSize();
        if( _view.flexRight && _view.flexLeft ){ // calculate width and right
          _virtualWidth = _parentSize[0] - _this.left - _view.flexRightOffset;
          if( _view.minWidth !== null && _virtualWidth < _view.minWidth ){
            _this.width = _view.minWidth;
          }
          else{
            _this.width = _virtualWidth;
          }
          _this.right = _this.left+_this.width;
        }
        else if( _view.flexRight ){ // calculate left and right
          _this.width = _view.minWidth;
          _this.left = _parentSize[0] - _this.width - _view.flexRightOffset;
          _this.right = _this.width + _this.left;
        }
        else { // calculate width
          _this.width = _this.right - _this.left;
        }
        if( _view.flexTop && _view.flexBottom ){ // calculate height and bottom
          _virtualHeight = _parentSize[1] - _this.top - _view.flexBottomOffset;
          if( _view.minHeight !== null && _virtualHeight < _view.minHeight ){
            _this.height = _view.minHeight;
          }
          else{
            _this.height = _virtualHeight;
          }
          _this.bottom = _this.top+_this.height;
        }
        else if( _view.flexBottom ){ // calculate top and bottom
          _this.height = _view.minHeight;
          _this.top = _parentSize[1] - _this.height - _view.flexBottomOffset;
          _this.bottom = _this.height + _this.top;
        }
        else { // calculate height
          _this.height = _this.bottom - _this.top;
        }
        _this.updateSecondaryValues( true );
      }
    }
  },

/** = Description
  * You should call this on the instance to update secondary values, like
  * width and height, if you change a primary (left/top/right/bottom) value
  * straight through the property.
  *
  * Do not change properties other than the primaries through properties.
  *
  * Use the accompanied methods instead.
  *
  **/
  updateSecondaryValues: function(_noSize) {
    
    // this._updateFlexibleDimensions();
    
    /**
      * isValid is true if the Rect's right side is greater than or equal to its left
      * and its bottom is greater than or equal to its top, and false otherwise.
      * An invalid rectangle can't be used to define an interface area (such as
      * the frame of a view or window).
      **/
    this.isValid = ( this.right >= this.left && this.bottom >= this.top );
    
    /**
      *
      * The Point-returning functions return the coordinates of one of the
      * rectangle's four corners.
      **/
    this.leftTop = new HPoint(this.left, this.top);
    this.leftBottom = new HPoint(this.left, this.bottom);
    this.rightTop = new HPoint(this.right, this.top);
    this.rightBottom = new HPoint(this.right, this.bottom);
    
    /**
      * The width and height of a Rect's rectangle, as returned through these
      * properties.
      **/
    if(!_noSize){
      this.width = (this.right - this.left);
      this.height = (this.bottom - this.top);
    }
  },
  
/** = Description
  * Sets the object's rectangle by defining the coordinates of all four
  * sides.
  *
  * The other set...() functions move one of the rectangle's corners to the
  * Point argument; the other corners and sides are modified concomittantly.
  *
  * None of these methods prevents you from creating an invalid rectangle.
  *
  * = Parameters
  * +_left+::     The coordinate of the left side.
  * +_top+::      The coordinate of the top side.
  * +_right+::    The coordinate of the right side.
  * +_bottom+::   The coordinate of the bottom side.
  *
  **/
  set: function() {
    var _args=arguments;
    
    if (_args.length === 0) {
      this._constructorDefault();
    } else if (_args.length === 4) {
      this._constructorSides(_args[0],_args[1],_args[2],_args[3]);
    }
    else if (_args.length === 2) {
      this._constructorPoint(_args[0],_args[1]);
    }
    else if (_args.length === 1) {
      this._constructorRect(_args[0]);
    }
    else {
      throw "Invalid number of arguments.";
    }
    this.updateSecondaryValues();
  },
  
/** = Description
  * Moves the rect's left side to a new coordinate.
  *
  * = Parameters
  * +_left+::  The new left side coordinate (in px)
  *
  **/
  setLeft: function(_left){
    this.left = _left;
    this.updateSecondaryValues();
  },
  
/** = Description
  * Moves the rect's right side to a new coordinate.
  *
  * = Parameters
  * +_right+::  The new right side coordinate (in px)
  *
  **/
  setRight: function(_right){
    this.right = _right;
    this.updateSecondaryValues();
  },
  
/** = Description
  * Moves the rect's top side to a new coordinate.
  *
  * = Parameters
  * +_top+::  The new top side coordinate (in px)
  *
  **/
  setTop: function(_top){
    this.top = _top;
    this.updateSecondaryValues();
  },
  
/** = Description
  * Moves the rect's bottom side to a new coordinate.
  *
  * = Parameters
  * +_bottom+::  The new bottom side coordinate (in px)
  *
  **/
  setBottom: function(_bottom){
    this.bottom = _bottom;
    this.updateSecondaryValues();
  },
  
/** = Description
  * Moves the rects left and top sides to a new point. Affects the position,
  * width and height.
  *
  * = Parameters
  * +_point+::  A HPoint instance to mode the sides to.
  *
  **/
  setLeftTop: function(_point) {
    this.left=_point.x;
    this.top=_point.y;
    this.updateSecondaryValues();
  },
  
/** = Description
  * Moves the rects left and bottom sides to a new point. Affects the left
  * position, width and height.
  *
  * = Parameters
  * +_point+::  A HPoint instance to mode the sides to.
  *
  **/
  setLeftBottom: function(_point) {
    this.left=_point.x;
    this.bottom=_point.y;
    this.updateSecondaryValues();
  },
  
/** = Description
  * Moves the rects right and top sides to a new point. Affects the top
  * position, width and height.
  *
  * = Parameters
  * +_point+::  A HPoint instance to mode the sides to.
  *
  **/
  setRightTop: function(_point) {
    this.right=_point.x;
    this.top=_point.y;
    this.updateSecondaryValues();
  },
  
/** = Description
  * Moves the rects right and bottom sides to a new point. Affects the width
  * and height. Does not affect the position.
  *
  * = Parameters
  * +_point+::  A HPoint instance to mode the sides to.
  *
  **/
  setRightBottom: function(_point) {
    this.right=_point.x;
    this.bottom=_point.y;
    this.updateSecondaryValues();
  },
  
/** = Description
  * Moves the rects right side to a new coordinate. Does not affect the position.
  *
  * = Parameters
  * +_width+::  A numeric value representing the new target width of the rect.
  *
  **/
  setWidth: function(_width){
    this.right = this.left + _width;
    this.updateSecondaryValues();
  },

/** = Description
  * Moves the rects bottom side to a new coordinate. Does not affect the position.
  *
  * = Parameters
  * +_height+::   A numeric value representing the new target height of the rect.
  *
  **/
  setHeight: function(_height){
    this.bottom = this.top + _height;
    this.updateSecondaryValues();
  },

/** = Description
  * Moves the rects right and bottom sides to new coordinates. Does not affect the position.
  *
  * = Parameters
  * by separate numeric values:
  * +_width+::   A numeric value representing the new target width of the rect.
  * +_height+::  A numeric value representing the new target height of the rect.
  *
  * by HPoint used as "HSize":
  * +_point.x+::   A numeric value representing the new target width of the rect.
  * +_point.y+::   A numeric value representing the new target height of the rect.
  *
  **/
  setSize: function(){
    var _args=arguments;
    // Using width and height:
    if (_args.length === 2) {
      _width = _args[0];
      _height = _args[1];
    }
    // Using a point:
    else if (_args.length === 1) {
      _width = _args.x;
      _height = _args.y;
    }
    this.right = this.left + _width;
    this.bottom = this.top + _height;
    this.updateSecondaryValues();
  },
  
/** = Description
  * Returns true if the Rect has any area even a corner or part
  * of a side in common with rect, and false if it doesn't.
  *
  * = Parameters
  * +_rect+::      A HRect instance to intersect this rect with
  * +_insetByX+::  Insets +_rect+ by +_insetBy+ pixels, optional
  * +_insetByY+::  Insets +_rect+ by +_insetBy+ pixels, optional. If omitted, but +_insetByX+ is defined, then +_insetByY+ equals +_insetByX+.
  *
  * = Returns
  * A Boolean (true/false) depending on the result.
  *
  **/
  intersects: function( _rect, _insetByX, _insetByY ) {
    if( _insetByX !== undefined ){
      _rect = HRect.nu( _rect );
      if( _insetByY === undefined ){
        _insetByY = _insetByX;
      }
      _rect.insetBy( _insetByX, _insetByY );
    }
    return (
      ( ( _rect.left >= this.left && _rect.left <= this.right ) ||
        ( _rect.right >= this.left && _rect.right <= this.right )
      ) &&
      ( ( _rect.top >= this.top && _rect.top <= this.bottom) ||
        ( _rect.bottom >= this.top && _rect.bottom <= this.bottom)
      )
    );
  },

  overlaps: function( _rect, _insetbyX, _insetByY ){
    return this.intersects( _rect, _insetbyX, _insetByY );
  },
  
/** = Description
  * Returns true if point or rect lies entirely within the Rect's
  * rectangle (and false if not). A rectangle contains the points that lie
  * along its edges; for example, two identical rectangles contain each other.
  * 
  * Also works with HPoint instances.
  *
  * = Parameters
  * +_obj+::  A HRect or HPoint to check the containment with.
  *
  * = Returns
  * A Boolean (true/false) depending on the result.
  *
  **/
  contains: function(_obj) {
    if(_obj instanceof HPoint) {
      return this._containsPoint(_obj);
    }
    else if(_obj instanceof HRect) {
      return this._containsRect(_obj);
    }
    else {
      throw "Wrong argument type.";
    }
  },
  _containsPoint: function(_point) {
    return ( _point.x >= this.left && _point.x <= this.right &&
             _point.y >= this.top && _point.y <= this.bottom );
  },
  _containsRect: function(_rect) {
    return ( _rect.left >= this.left && _rect.right <= this.right &&
             _rect.top >= this.top && _rect.bottom <= this.bottom );
  },
  
/** = Description
  * Insets the sides of the Rect's rectangle by x units (left and
  * right sides) and y units (top and bottom). Positive inset values shrink
  * the rectangle; negative values expand it. Note that both sides of each
  * pair moves the full amount. For example, if you inset a Rect by (4,4), the
  * left side moves (to the right) four units and the right side moves (to the
  * left) four units (and similarly with the top and bottom).
  *
  * = Parameters
  * using a HPoint:
  * +point+::  A HPoint to inset by.
  *
  * using separate x and y coordinates:
  * +x+::  x Coordinate
  * +y+::  y Coordinate
  *
  **/
  insetBy: function() {
    var _args=arguments;
    if (_args.length === 1) {
      this._insetByPoint(_args[0]);
    } else if (_args.length === 2) {
      this._insetByXY(_args[0],_args[1]);
    } else {
      throw "Invalid number of arguments.";
    }
    this.updateSecondaryValues();
  },
  _insetByPoint: function(_point) {
    this._insetByXY(_point.x, _point.y);
  },
  _insetByXY: function(x, y) {
    this.left += x;
    this.top += y;
    this.right -= x;
    this.bottom -= y;
  },
  
/** = Description
  * Moves the Rect horizontally by x units and vertically by y
  * units. The rectangle's size doesn't change.
  *
  * = Parameters
  * using a HPoint:
  * +point+::  A HPoint to offset by.
  *
  * using separate x and y coordinates
  * +x+::  X coordinate
  * +y+::  Y coordinate
  *
  **/
  offsetBy: function() {
    var _args=arguments;
    if (_args.length === 1) {
      this._offsetByPoint(_args[0]);
    } else if (_args.length === 2) {
      this._offsetByXY(_args[0],_args[1]);
    } else {
      throw "Invalid number of arguments.";
    }
    this.updateSecondaryValues();
  },
  _offsetByPoint: function(_point) {
    this._offsetByXY(_point.x, _point.y);
  },
  _offsetByXY: function(x, y) {
    this.left += x;
    this.top += y;
    this.right += x;
    this.bottom += y;
  },
  
/** = Description
  * Moves the Rect to the location (x,y).
  *
  * = Parameters
  * using a HPoint:
  * +point+::  A HPoint to offset to.
  *
  * using separate x and y coordinates):
  * +x+::  X coordinate
  * +y+::  Y coordinate
  *
  **/
  offsetTo: function() {
    var _args=arguments;
    if (_args.length === 1) {
      this._offsetToPoint(_args[0]);
    } else if (_args.length === 2) {
      this._offsetToXY(_args[0],_args[1]);
    } else {
      throw "Invalid number of arguments.";
    }
    this.updateSecondaryValues();
  },
  _offsetToPoint: function(_point) {
    this._offsetToXY(_point.x, _point.y);
  },
  _offsetToXY: function(x, y) {
    this.right += x-this.left;
    this.left = x;
    this.bottom += y-this.top;
    this.top = y;
  },
  
/** = Description
  * Returns true if the two objects' rectangles exactly coincide.
  *
  * = Parameters
  * +_rect+::  A HRect instance to compare to.
  *
  * = Returns
  * A Boolean (true/false) depending on the result.
  *
  **/
  equals: function(_rect) {
    return (this.left === _rect.left && this.top === _rect.top &&
            this.right === _rect.right && this.bottom === _rect.bottom);
  },
  
/** = Description
  * Creates and returns a new Rect that's the intersection of this Rect and
  * the specified Rect. The new Rect encloses the area that the two Rects have
  * in common. If the two Rects don't intersect, the new Rect will be invalid.
  *
  * = Parameters
  * +_rect+::   A HRect instance to compare to.
  *
  * = Returns
  * A new HRect instance.
  *
  **/
  intersection: function(_rect) {
    return new HRect(
       Math.max(this.left, _rect.left), Math.max(this.top, _rect.top),
       Math.min(this.right, _rect.right), Math.min(this.bottom, _rect.bottom)
    );
  },
  
/** = Description
  * Creates and returns a new Rect that minimally but completely encloses the
  * area defined by this Rect and the specified Rect.
  *
  * = Parameters
  * +_rect+::   A HRect instance to compare to.
  *
  * = Returns
  * A new HRect instance.
  *
  **/
  union: function(_rect) {
    return new HRect(
      Math.min(this.left, _rect.left), Math.min(this.top, _rect.top),
      Math.max(this.right, _rect.right), Math.max(this.bottom, _rect.bottom)
    );
  },
  
  // HValue and HView support
  valueObj: null,
  
/** = Description
  * Bind function
  *
  * = Parameters
  * +_view+::  view
  *
  **/
  bind: function(_view){
    if(this.viewIds.indexOf( _view.viewId ) === -1){
      this.viewIds.push( _view.viewId );
    }
    this._updateFlexibleDimensions();
  },
  
/** = Description
  * Release function
  **/
  release: function(_view){
    var _viewIdx = this.viewIds.indexOf(_view.viewId);
    if(_viewIdx !== -1){
      this.viewIds.splice( _viewIdx, 1 );
    }
  },
  
/** = Description
  * Sets valueObj for this component given as parameter.
  *
  * = Parameters
  * +_valueObj+::   valueObj to use
  *
  **/
  setValueObj: function(_valueObj){
    this.valueObj = _valueObj;
  },
  
/** = Description
  * setValue function
  *
  * = Parameters
  * +_value+::      value
  * +_srcViewId+::  srcViewId
  *
  **/
  setValue: function(_value,_srcViewId){
    if(this.valueObj){
      this.valueObj.set(_value);
    }
    this.set(_value[0],_value[1],_value[2],_value[3]);
    var i=0, _viewId;
    for(;i<this.viewIds.length;i++){
      _viewId = this.viewIds[i];
      HSystem.views[_viewId].drawRect();
    }
  },

  toString: function(){
    return ('[object Rect left='+this.left+' top='+this.top+' width='+this.width+' height='+this.height+' right='+this.right+' bottom='+this.bottom+']');
  }
  
});


