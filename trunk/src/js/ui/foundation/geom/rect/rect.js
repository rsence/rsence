/**
  * Riassence Core -- http://rsence.org/
  *
  * Copyright (C) 2008 Juha-Jarmo Heinonen <jjh@riassence.com>
  * Copyright (C) 2006 Helmi Technologies Inc.
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

/** class: HRect
  *
  * A Rect object represents a rectangle. Rects are used throughout the
  * Components to define the frames of windows, views, bitmaps even the 
  * screen itself. A HRect is defined by its four sides, expressed as the public
  * data members left, top, right, and bottom.
  *
  * If you change a component's rect, you should call its <HView.drawRect> method.
  *
  * vars: Instance Variables
  *  type - '[HRect]'
  *  top - The position of the rect's top side (from parent top)
  *  left - The position of the rect's left side (from parent left)
  *  bottom - The position of the rect's bottom side (from parent top)
  *  right - The position of the rect's right side (from parent left)
  *  leftTop - A <HPoint> representing the coordinate of the rect's *left top corner*
  *  leftBottom - A <HPoint> representing the coordinate of the rect's *left bottom corner*
  *  rightTop - A <HPoint> representing the coordinate of the rect's *right top corner*
  *  rightBottom - A <HPoint> representing the coordinate of the rect's *right bottom corner*
  *  width - The width of the rect.
  *  height - The height of the rect.
  *
  * See also:
  *  <HPoint> <HView> <HView.drawRect>
  **/  
HRect = HClass.extend({
/** constructor: constructor
  *
  * Initializes a Rect as four sides, as two diametrically opposed corners,
  * or as a copy of some other Rect object. A rectangle that's not assigned
  * any initial values is invalid, until a specific assignment is made, either
  * through a set() function or by setting the object's data members directly.
  *
  * Parameter (using a <HRect> instance):
  *  rect - Another <HRect>.
  *
  * Parameters (using two <HPoint> instances):
  *  leftTop, rightBottom - Coordinates of the *left top corner* and *right bottom corner*.
  *
  * Parameters (using separate Numeric coordinates):
  *  left, top, right, bottom - Coordinates of the *sides*.
  *
  * Initialization examples:
  * > var myLeftTopPoint = new HPoint(100,200);
  * > var myBottomRightPoint = new HPoint(300,400);
  * > var myRectFromOppositeCornerPoints = new HRect( myLeftTopPoint, myBottomRightPoint );
  * > var myRectFromSideCoordinates = new HRect(100,200,300,400);
  * > var myRectFromAnotherRect = new HRect( myRectFromEdgeCoordinates );
  **/
  constructor: function() {
    this.type = '[HRect]';
    var _args=arguments;
    
    if (_args.length === 0) {
      this._constructorDefault();
    } else if (_args.length == 4) {
      this._constructorSides(_args[0],_args[1],_args[2],_args[3]);
    }
    else if (_args.length == 2) {
      this._constructorPoint(_args[0],_args[1]);
    }
    else if (_args.length == 1) {
      this._constructorRect(_args[0]);
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

/** method: updateSecondaryValues
  *
  * You should call this on the instance to update secondary values, like
  * width and height, if you change a primary (left/top/right/bottom) value
  * straight through the property.
  *
  * *Do not change properties other than the primaries through properties.*
  *
  * *Use the accompanied methods instead.*
  *
  * See also:
  *  <set> <setLeftTop> <setLeftBottom> <setRightTop> <setRightBottom> <setWidth> <setHeight> <setSize>
  **/
  updateSecondaryValues: function() {
    /**
      * isValid is true if the Rect's right side is greater than or equal to its left
      * and its bottom is greater than or equal to its top, and false otherwise.
      * An invalid rectangle can't be used to define an interface area (such as
      * the frame of a view or window).
      */
    this.isValid = ( this.right >= this.left && this.bottom >= this.top );
    
    /**
      *
      * The Point-returning functions return the coordinates of one of the
      * rectangle's four corners. 
      */
    this.leftTop = new HPoint(this.left, this.top);
    this.leftBottom = new HPoint(this.left, this.bottom);
    this.rightTop = new HPoint(this.right, this.top);
    this.rightBottom = new HPoint(this.right, this.bottom);
    
    /**
      * The width and height of a Rect's rectangle, as returned through these
      * properties.
      */
    this.width = (this.right - this.left);
    this.height = (this.bottom - this.top);
  },
  
/** method: set
  *
  * Sets the object's rectangle by defining the coordinates of all four
  * sides.
  *
  * The other set...() functions move one of the rectangle's corners to the
  * Point argument; the other corners and sides are modified concomittantly.
  *
  * *None of these methods prevents you from creating an invalid rectangle.*
  *
  * Parameters:
  *  _left - The coordinate of the left side.
  *  _top - The coordinate of the top side.
  *  _right - The coordinate of the right side.
  *  _bottom - The coordinate of the bottom side.
  *
  * See also:
  *  <setLeftTop> <setLeftBottom> <setRightTop> <setRightBottom> <setWidth> <setHeight> <setSize>
  **/
  set: function() {
    var _args=arguments;
    
    if (_args.length === 0) {
      this._constructorDefault();
    } else if (_args.length == 4) {
      this._constructorSides(_args[0],_args[1],_args[2],_args[3]);
    }
    else if (_args.length == 2) {
      this._constructorPoint(_args[0],_args[1]);
    }
    else if (_args.length == 1) {
      this._constructorRect(_args[0]);
    }
    else {
      throw "Invalid number of arguments.";
    }
    this.updateSecondaryValues();
  },
  
/** method: setLeft
  *
  * Moves the rect's left side to a new coordinate.
  *
  * Parameter:
  *  _left - The new left side coordinate (in px)
  *
  **/
  setLeft: function(_left){
    this.left = _left;
    this.updateSecondaryValues();
  },
  
/** method: setRight
  *
  * Moves the rect's right side to a new coordinate.
  *
  * Parameter:
  *  _right - The new right side coordinate (in px)
  *
  **/
  setRight: function(_right){
    this.right = _right;
    this.updateSecondaryValues();
  },
  
/** method: setTop
  *
  * Moves the rect's top side to a new coordinate.
  *
  * Parameter:
  *  _top - The new top side coordinate (in px)
  *
  **/
  setTop: function(_top){
    this.top = _top;
    this.updateSecondaryValues();
  },
  
/** method: setBottom
  *
  * Moves the rect's bottom side to a new coordinate.
  *
  * Parameter:
  *  _bottom - The new bottom side coordinate (in px)
  *
  **/
  setBottom: function(_bottom){
    this.bottom = _bottom;
    this.updateSecondaryValues();
  },
  
/** method: setLeftTop
  *
  * Moves the rects left and top sides to a new point. Affects the position,
  * width and height.
  *
  * Parameter:
  *  _point - A <HPoint> instance to mode the sides to.
  *
  * See also:
  *  <set> <setLeftBottom> <setRightTop> <setRightBottom> <setWidth> <setHeight> <setSize>
  **/
  setLeftTop: function(_point) {
    this.left=_point.x;
    this.top=_point.y;
    this.updateSecondaryValues();
  },
  
/** method: setLeftBottom
  *
  * Moves the rects left and bottom sides to a new point. Affects the left
  * position, width and height.
  *
  * Parameter:
  *  _point - A <HPoint> instance to mode the sides to.
  *
  * See also:
  *  <set> <setLeftTop> <setRightTop> <setRightBottom> <setWidth> <setHeight> <setSize>
  **/
  setLeftBottom: function(_point) {
    this.left=_point.x;
    this.bottom=_point.y;
    this.updateSecondaryValues();
  },
  
/** method: setRightTop
  *
  * Moves the rects right and top sides to a new point. Affects the top
  * position, width and height.
  *
  * Parameter:
  *  _point - A <HPoint> instance to mode the sides to.
  *
  * See also:
  *  <set> <setLeftTop> <setLeftBottom> <setRightBottom> <setWidth> <setHeight> <setSize>
  **/
  setRightTop: function(_point) {
    this.right=_point.x;
    this.top=_point.y;
    this.updateSecondaryValues();
  },
  
/** method: setRightBottom
  *
  * Moves the rects right and bottom sides to a new point. Affects the width
  * and height. Does not affect the position.
  *
  * Parameter:
  *  _point - A <HPoint> instance to mode the sides to.
  *
  * See also:
  *  <set> <setLeftTop> <setLeftBottom> <setRightTop> <setWidth> <setHeight> <setSize>
  **/
  setRightBottom: function(_point) {
    this.right=_point.x;
    this.bottom=_point.y;
    this.updateSecondaryValues();
  },
  
/** method: setWidth
  *
  * Moves the rects right side to a new coordinate. Does not affect the position.
  *
  * Parameter:
  *  _width - A numeric value representing the new target width of the rect.
  *
  * See also:
  *  <set> <setLeftTop> <setLeftBottom> <setRightTop> <setRightBottom> <setHeight> <setSize>
  **/
  setWidth: function(_width){
    this.right = this.left + _width;
    this.updateSecondaryValues();
  },

/** method: setHeight
  *
  * Moves the rects bottom side to a new coordinate. Does not affect the position.
  *
  * Parameter:
  *  _height - A numeric value representing the new target height of the rect.
  *
  * See also:
  *  <set> <setLeftTop> <setLeftBottom> <setRightTop> <setRightBottom> <setWidth> <setSize>
  **/
  setHeight: function(_height){
    this.bottom = this.top + _height;
    this.updateSecondaryValues();
  },

/** method: setSize
  *
  * Moves the rects right and bottom sides to new coordinates. Does not affect the position.
  *
  * Parameter (by separate numeric values):
  *  _width - A numeric value representing the new target width of the rect.
  *  _height - A numeric value representing the new target height of the rect.
  *
  * Parameter (by <HPoint> used as "HSize"):
  *  _point.x - A numeric value representing the new target width of the rect.
  *  _point.y - A numeric value representing the new target height of the rect.
  *
  * See also:
  *  <set> <setLeftTop> <setLeftBottom> <setRightTop> <setRightBottom> <setWidth> <setHeight>
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
  
/** method: intersects
  *
  * Returns true if the Rect has any area even a corner or part 
  * of a side in common with rect, and false if it doesn't.
  *
  * Parameter:
  *  _rect - A <HRect> instance to intersect this rect with
  *
  * Returns:
  *  A Boolean (true/false) depending on the result.
  *
  * See also:
  *  <contains> <equals> <intersection> <union>
  **/
  intersects: function(_rect) {
    return (
      ((_rect.left >= this.left && _rect.left <= this.right) ||
        (_rect.right >= this.left && _rect.right <= this.right)) && 
      ((_rect.top >= this.top && _rect.top <= this.bottom) ||
        (_rect.bottom >= this.top && _rect.bottom <= this.bottom)));
  },
  
/** method: contains
  *
  * Returns true if point or rect lies entirely within the Rect's
  * rectangle (and false if not). A rectangle contains the points that lie
  * along its edges; for example, two identical rectangles contain each other.
  * 
  * Also works with <HPoint> instances.
  *
  * Parameter:
  *  _obj - A <HRect> or <HPoint> to check the containment with.
  *
  * Returns:
  *  A Boolean (true/false) depending on the result.
  *
  * See also:
  *  <intersects> <equals> <intersection> <union>
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
  
/** method: insetBy
  *
  * Insets the sides of the Rect's rectangle by x units (left and
  * right sides) and y units (top and bottom). Positive inset values shrink
  * the rectangle; negative values expand it. Note that both sides of each
  * pair moves the full amount. For example, if you inset a Rect by (4,4), the
  * left side moves (to the right) four units and the right side moves (to the
  * left) four units (and similarly with the top and bottom).
  *
  * Parameter (using a <HPoint>):
  *  point - A <HPoint> to inset by.
  *
  * Parameter (using separate x and y coordinates):
  *  x, y - Numeric coordinates to inset by.
  *
  * See also:
  *  <offsetBy> <offsetTo> <setLeftTop> <setRightTop> <setLeftBottom> <setLeftTop>
  **/
  insetBy: function() {
    var _args=arguments;
    if (_args.length === 1) {
      this._insetByPoint(_args[0]);
    } else if (_args.length == 2) {
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
  
/** method: offsetBy
  *
  * Moves the Rect horizontally by x units and vertically by y
  * units. The rectangle's size doesn't change.
  *
  * Parameter (using a <HPoint>):
  *  point - A <HPoint> to offset by.
  *
  * Parameter (using separate x and y coordinates):
  *  x, y - Numeric coordinates to offset by.
  *
  * See also:
  *  <insetBy> <offsetTo> <setLeftTop> <setRightTop> <setLeftBottom> <setLeftTop>
  **/
  offsetBy: function() {
    var _args=arguments;
    if (_args.length === 1) {
      this._offsetByPoint(_args[0]);
    } else if (_args.length == 2) {
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
  
/** method: offsetTo
  *
  * Moves the Rect to the location (x,y).
  *
  * Parameter (using a <HPoint>):
  *  point - A <HPoint> to offset to.
  *
  * Parameter (using separate x and y coordinates):
  *  x, y - Numeric coordinates to offset to.
  *
  * See also:
  *  <insetBy> <offsetBy> <setLeftTop> <setRightTop> <setLeftBottom> <setLeftTop>
  **/
  offsetTo: function() {
    var _args=arguments;
    if (_args.length === 1) {
      this._offsetToPoint(_args[0]);
    } else if (_args.length == 2) {
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
  
/** method: equals
  *
  * Returns true if the two objects' rectangles exactly coincide.
  *
  * Parameter:
  *  _rect - A <HRect> instance to compare to.
  *
  * Returns:
  *  A Boolean (true/false) depending on the result.
  *
  * See also:
  *  <intersects> <contains> <intersection> <union>
  **/
  equals: function(_rect) {
    return (this.left == _rect.left && this.top == _rect.top &&
            this.right == _rect.right && this.bottom == _rect.bottom);
  },
  
/** method: intersection
  *
  * Creates and returns a new Rect that's the intersection of this Rect and
  * the specified Rect. The new Rect encloses the area that the two Rects have
  * in common. If the two Rects don't intersect, the new Rect will be invalid.
  *
  * Parameter:
  *  _rect - A <HRect> instance to compare to.
  *
  * Returns:
  *  A new <HRect> instance.
  *
  * See also:
  *  <intersects> <contains> <equals> <union>
  **/
  intersection: function(_rect) {
    return new HRect(
       Math.max(this.left, _rect.left), Math.max(this.top, _rect.top),
       Math.min(this.right, _rect.right), Math.min(this.bottom, _rect.bottom)
    );
  },
  
/** method: union
  *
  * Creates and returns a new Rect that minimally but completely encloses the
  * area defined by this Rect and the specified Rect.
  *
  * Parameter:
  *  _rect - A <HRect> instance to compare to.
  *
  * Returns:
  *  A new <HRect> instance.
  *
  * See also:
  *  <intersects> <contains> <equals> <intersection>
  **/
  union: function(_rect) {
    return new HRect(
      Math.min(this.left, _rect.left), Math.min(this.top, _rect.top),
      Math.max(this.right, _rect.right), Math.max(this.bottom, _rect.bottom)
    );
  },
  
  // HValue and HView support
  valueObj: null,
  viewIds: [],
  bind: function(_view){
    if(this.viewIds.indexOf(_view.viewId) != -1){
      this.viewIds.push( _view.viewId );
    }
  },
  release: function(_view){
    var _viewIdx = this.viewIds.indexOf(_view.viewId);
    if(_viewIdx != -1){
      this.viewIds.splice( _viewIdx, 1 );
    }
  },
  setValueObj: function(_valueObj){
    this.valueObj = _valueObj;
  },
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
  }
  
});


