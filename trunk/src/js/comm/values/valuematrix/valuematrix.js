/*   Riassence Framework
 *   Copyright 2006 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

HValueMatrixComponentExtension = {
  componentBehaviour: ['view','control','matrix'],
  constructor: function(_rect, _parent, _options) {
    this.base(_rect, _parent, _options);
    this.setValueMatrix();
  },
  setValueMatrix: function(){
    if(this.parent['valueMatrix'] === undefined){
      this.parent.valueMatrix = new HValueMatrix();
    }
    this.valueMatrixIndex = this.parent.valueMatrix.addControl(this);
  },
  click: function(){
    if (this.parent.valueMatrix instanceof HValueMatrix) {
      this.parent.valueMatrix.setValue( this.valueMatrixIndex );
    }
  },
  die: function(){
    if(this['parent']){
      if(this.parent['valueMatrix']){
        this.parent.valueMatrix.release(this);
      }
    }
    this.base();
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
    if( _index !== this.value ){
      // Set the previous value object to false (reflects to its container component(s))
      if(this.value !== -1){
        if(this.ctrls[this.value]){
          this.ctrls[this.value].setValue(false);
        }
      }
      // Store the new index as the currently active value
      this.value = _index;
      if(_index !== -1){
        // Set the new value object to true (reflects to its container component(s))
        if(_index<this.ctrls.length){
          this.ctrls[_index].setValue(true);
        }
      }
      this.valueObj.set(_index);
    }
  },
  
  addControl: function(_ctrl) {
    this.ctrls.push(_ctrl);
    var _newIndex = this.ctrls.length-1;
    if(_ctrl.value){
      this.setValue(_newIndex);
    }
    return _newIndex;
  },
  
  release: function(_ctrl) {
    var _index = this.ctrls.indexOf(_ctrl);
    if(_index !== -1){
      this.ctrls.splice( _index, 1 );
      if(_index === this.value){
        this.setValue(-1);
      }
    }
  }
});

