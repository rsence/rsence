/*   RSence
 *   Copyright 2006 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

/*** = Description
  ** An interface to implement for classes that are members of +HValueMatrix+.
  **
  ** A HRadioButton is an example of an class that implements
  ** the HValueMatrixInterface.
***/
var//RSence.Foundation
HValueMatrixInterface = {
  
/** = Description
  * Standard +HControl+ constructor model.
  * Passes parameters through to its base class's constructor,
  * then calls +self.setValueMatrix+.
  *
  **/
  constructor: function(_rect, _parent, _options) {
    this.base(_rect, _parent, _options);
    this.setValueMatrix();
  },
  
/** = Description
  * Binds itself to the parent's HValueMatrix instance.
  *
  * Creates a valueMatrix member into the parent of itself, if none is present yet.
  * Sets the +self.value+ to true or false depending on the parent's valueMatrix value.
  *
  **/
  setValueMatrix: function(){
    if(this.parent['valueMatrix'] === undefined){
      this.parent.valueMatrix = HValueMatrix.nu();
    }
    this.valueMatrixIndex = this.parent.valueMatrix.addControl(this);
  },
  
/** Sets itself active using the parent's valueMatrix on the click event.
  **/
  click: function(){
    if (this.parent.valueMatrix instanceof HValueMatrix) {
      this.parent.valueMatrix.setValue( this.valueMatrixIndex );
    }
  },
  
/** The destructor makes sure +self+ is released from the parent's valueMatrix
  * upon destruction.
  **/
  die: function(){
    if(this['parent']){
      if(this.parent['valueMatrix']){
        this.parent.valueMatrix.release(this);
      }
    }
    this.base();
  }
};

/*** = Description
  ** A HValueMatrix operates a number of components that operate on boolean
  ** values, like the HRadioButton using a separate value for selecting the
  ** index of selected items.
***/
var//RSence.Foundation
HValueMatrix = HClass.extend({
  
/** The constructor doesn't take parameters.
  **/
  constructor: function(){
    // An array to hold member components
    this.ctrls = [];
    // The index of the value member chosen
    this.value = -1;
    this.valueObj = new HDummyValue();
  },
  
/** Method for value interfaces, called by the HValue instance when bound.
  **/
  setValueObj: function(_valueObj){
    this.valueObj = _valueObj;
    this.setValue(_valueObj.value);
  },
  
/** Method for value interfaces, the +_index+ is the 
  * index of the item to select.
  **/
  setValue: function(_index){
    if( _index !== this.value ){
      // Set the previous value object to false (reflects to its container component(s))
      if(~this.value){
        if(this.ctrls[this.value]){
          this.ctrls[this.value].setValue(false);
        }
      }
      // Store the new index as the currently active value
      this.value = _index;
      if(~_index){
        // Set the new value object to true (reflects to its container component(s))
        if(_index<this.ctrls.length){
          this.ctrls[_index].setValue(true);
        }
      }
      this.valueObj.set(_index);
    }
  },
  
/** A method for attaching a +HControl+ -derived class to the matrix.
  **/
  addControl: function(_ctrl) {
    this.ctrls.push(_ctrl);
    var _newIndex = this.ctrls.length-1;
    if(_ctrl.value){
      this.setValue(_newIndex);
    }
    return _newIndex;
  },
  
/** A method for releasing a +HControl+ -derived class from the matrix.
  **/
  release: function(_ctrl) {
    var _index = this.ctrls.indexOf(_ctrl);
    if(~_index){
      this.ctrls.splice( _index, 1 );
      if(_index === this.value){
        this.setValue(-1);
      }
    }
  }
});

