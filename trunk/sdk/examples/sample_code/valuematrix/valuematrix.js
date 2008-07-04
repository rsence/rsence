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

HValueMatrixComponentExtension = {
  setValueMatrix: function(_aValueMatrix){
    this.valueMatrix = _aValueMatrix;
    this.valueMatrixIndex = this.valueMatrix.addValue(this.valueObj,this.value);
  },
  
  mouseDown: function(_x,_y,_isLeftButton){
    if (this.valueMatrix instanceof HValueMatrix) {
      this.valueMatrix.setValue( this.valueMatrixIndex );
    } else {
      this.setValue(!this.value);
    }
  },
  
  mouseUp: function(_x,_y,_isLeftButton){
    if (this.valueMatrix instanceof HValueMatrix) {
      this.valueMatrix.setValue( this.valueMatrixIndex );
    } else {
      this.setValue(!this.value);
    }
  }
};

HValueMatrix = HClass.extend({
  constructor: function(){
    // An array to hold member components
    this.values = [];
    // The index of the value member chosen
    this.value = -1;
  },
  
  setValueObj: function(_aValueObj){
    this.valueObj = _aValueObj;
    this.setValue(this.valueObj.value);
  },
  
  setValue: function(_index){
    if(_index != this.value){
      // Set the previous value object to false (reflects to its container component(s))
      if(this.value != -1){
        this.values[this.value].set(false);
      }
    
      if(_index != -1){
        // Store the new index as the currently active value
        this.valueObj.set(_index);
        this.value = _index;
      
        // Set the new value object to true (reflects to its container component(s))
        this.values[this.value].set(true);
      }
    }
  },
  
  addValue: function(_aValueObject, _selectIt) {
    this.values.push(_aValueObject);
    var _newIndex = this.values.length-1;
    if(_selectIt){
      this.setValue(_newIndex);
    }
    return _newIndex;
  }
});
