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

HValueMatrixComponentExtension = {
  componentBehaviour: ['view','control','matrix'],
  constructor: function(_rect, _parent, _options) {
    this.base(_rect, _parent, _options);
    this.setValueMatrix();
  },
  setValueMatrix: function(){
    if(!this.parent.valueMatrix){
      this.parent.valueMatrix = new HValueMatrix();
    }
    this.valueMatrixIndex = this.parent.valueMatrix.addControl(this);
  },
  click: function(){
    if (this.parent.valueMatrix instanceof HValueMatrix) {
      this.parent.valueMatrix.setValue( this.valueMatrixIndex );
    }
  }
};

HValueMatrix = HClass.extend({
  constructor: function(){
    // An array to hold member components
    this.ctrls = [];
    // The index of the value member chosen
    this.value = -1;
    this.valueObj = new HDummyValue();
  },
  
  setValueObj: function(_valueObj){
    this.valueObj = _valueObj;
    this.setValue(_valueObj.value);
  },
  
  setValue: function(_index){
    if(_index!==this.value){
      // Set the previous value object to false (reflects to its container component(s))
      if(this.value !== -1){
        this.ctrls[this.value].setValue(false);
      }
      if(_index !== -1){
        this.valueObj.set(_index);
        // Store the new index as the currently active value
        this.value = _index;
        // Set the new value object to true (reflects to its container component(s))
        if(_index<this.ctrls.length){
          this.ctrls[_index].setValue(true);
        }
      }
    }
  },
  
  addControl: function(_ctrl) {
    this.ctrls.push(_ctrl);
    var _newIndex = this.ctrls.length-1;
    if(_ctrl.value){
      this.setValue(_newIndex);
    }
    return _newIndex;
  }
});

