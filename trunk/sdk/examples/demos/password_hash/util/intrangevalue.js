/***  HIMLE RIA SYSTEM
  ** 
  **  Copyright (C) 2008 HIMLE GROUP http://himle.sorsacode.com/
  **  Copyright (C) 2006-2007 Helmi Technologies Inc.
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

IntRangeValue = HValue.extend({
  constructor: function( _id, _value, _minValue, _maxValue ){
    this.minValue = _minValue;
    this.maxValue = _maxValue;
    this.base( _id, _value );
  },
  
  
  set: function( _value ){
    var _ord, _cleanInt = true;
    for( var i = 0; i < _value.length; i++ ){
      _ord = _value.charCodeAt(i);
      if( !((_ord >= 48) && (_ord <= 57)) ){
        _cleanInt = false;
      }
    }
    var _value = parseInt( _value, 10 );
    var _isValid = false;
    if( (_value != NaN) && _cleanInt && (_value >= this.minValue) && (_value <= this.maxValue) ){
      _isValid = true;
    }
    if( _isValid ){
      this.base( _value );
    } else {
      this.refresh();
    }
    
  }
});
