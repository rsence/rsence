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

/** class: HPoint
  *
  * Point objects represent points on a two-dimensional coordinate grid. The
  * object's coordinates are stored as public x and y data members.
  *
  * vars: Instance Variables
  *  type - '[HPoint]'
  *  x - The X coordinate of the point
  *  y - The Y coordinate of the point
  *
  * See also:
  *  <HRect>
  **/
HPoint = HClass.extend({

/** constructor: constructor
  *
  * Creates a new Point object that corresponds to the point (x, y), or that's
  * copied from point. If no coordinate values are assigned, the Point's
  * location is indeterminate.
  *
  * Parameter (by using a <HPoint> instance):
  *  point - Another <HPoint> or other compatible structure.
  *
  * Parameters (by using separate numeric coordinates):
  *  x, y - Separate coordinates
  *
  * Initialization examlpes:
  * > var myPoint = new HPoint(100,200);
  * > var mySameCoordPoint = new HPoint( myPoint );
  **/
  constructor: function() {
    this.type = '[HPoint]';
    var _args=arguments;
    
    if (_args.length === 0) {
      this._constructorDefault();
    }
    else if (_args.length == 2) {
      this._constructorValues(_args[0],_args[1]);
    }
    else if (_args.length == 1) {
      this._constructorPoint(_args[0]);
    }
    else {
      throw "Invalid number of arguments.";
    }

  },
  _constructorDefault: function() {
    this.x = null;
    this.y = null;
  },
  _constructorValues: function(x, y) {
    this.x = x;
    this.y = y;
  },
  _constructorPoint: function(_point) {
    this.x = _point.x;
    this.y = _point.y;
  },
  
/** method: set
  *
  * Sets the Point's x and y coordinates.
  *
  * Parameters:
  *  x - The new X coordinate of the point
  *  y - The new Y coordinate of the point
  **/
  set: function() {
    var _args=arguments;
    
    if (_args.length === 0) {
      this._constructorDefault();
    }
    else if (_args.length == 2) {
      this._constructorValues(_args[0],_args[1]);
    }
    else if (_args.length == 1) {
      this._constructorPoint(_args[0]);
    }
    else {
      throw "Invalid number of arguments.";
    }
  },
  
/** method: constrainTo
  *
  * Ensures that the Point lies within rect. If it's already contained in the
  * rectangle, the Point is unchanged; otherwise, it's moved to the rect's
  * nearest edge.
  *
  * Parameter:
  *  _rect - A <HRect> instance to constrain to.
  *
  * See also:
  *  <HRect>
  **/
  constrainTo: function(_rect) {
    
    if (this.x < _rect.left) {
        this.x = _rect.left;
    }
    if (this.y < _rect.top) {
      this.y = _rect.top;
    }
    if (this.x > _rect.right) {
      this.x = _rect.right;
    }
    if (this.y > _rect.bottom) {
      this.y = _rect.bottom;
    }
    
  },
  
/** method: add
  *
  * Creates and returns a new Point that adds the given Point and this Point
  * together. The new object's x coordinate is the sum of the operands' x
  * values; its y value is the sum of the operands' y values.
  *
  * Parameter (with HPoint):
  *  _point - An <HPoint> to add to.
  *
  * Parameters (with coordinates):
  *  _x - An X-coordinate to add to.
  *  _y - An Y-coordinate to add to.
  *
  * Returns:
  *  A new <HPoint>.
  *
  * See also:
  *  <subtract> <equals>
  **/
  add: function(_point) {
    _args = arguments;
    if((_args.length==1)&&(_args[0].type==this.type)){
      _point = _args[0];
      return new HPoint( (this.x + _point.x), (this.y + _point.y) );
    }
    else if(_args.length==2){
      return new HPoint( (this.x + _args[0]), (this.y + _args[1]) );
    } else {
      return new HPoint( 0, 0 );
    }
  },
  
  
/** method: subtract
  *
  * Creates and returns a new Point that subtracts the given Point from this
  * Point. The new object's x coordinate is the difference between the
  * operands' x values; its y value is the difference between the operands'
  * y values.
  *
  * Parameter (with HPoint):
  *  _point - An <HPoint> to subtract from.
  *
  * Parameters (with coordinates):
  *  _x - An X-coordinate to subtract from.
  *  _y - An Y-coordinate to subtract from.
  *
  * Returns:
  *  A new <HPoint>.
  *
  * See also:
  *  <add> <equals>
  **/
  subtract: function(){
    _args = arguments;
    if((_args.length==1)&&(_args[0].type==this.type)){
      _point = _args[0];
      return new HPoint( this.x-_point.x, this.y-_point.y );
    }
    else if(_args.length==2){
      return new HPoint( this.x-_args[0], this.y-_args[1] );
    } else {
      return new HPoint( 0, 0 );
    }
  },
  
  
/** method: equals
  *
  * Returns true if the two objects' point exactly coincide.
  *
  * Parameter:
  *  _point - A <HPoint> to compare to.
  *
  * Returns:
  *  The result; true or false.
  *
  * See also:
  *  <subtract> <add>
  **/
  equals: function(_point) {
    return ( this.x == _point.x && this.y == _point.y );
  }


});


