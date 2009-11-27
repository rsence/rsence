/*   Riassence Framework
 *   Copyright 2008 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

/*** = Description
  ** Simple checkbox component, toggles the value of
  ** itself between true and false.
  ***/
HCheckbox = HButton.extend({
  componentName: 'checkbox',
  
  controlDefaults: (HControlDefaults.extend({
    constructor: function(){
      if(!this.events){
        this.events = {
          click: true
        }
      }
    }
  })),
  
/** Toggles the value checked / unchecked.
  **/
  click: function(){
    this.setValue(!this.value);
  },
/** SetStyle function for HCheckBox
  **/
  setStyle: function(_name,_value,_bypass){
    this.setStyleOfPart('label',_name,_value,_bypass);
  },
  
/**Toggles the checked/unchecked css-class status 
  according to the trueness of the value.**/
  refreshValue: function(){
    if(this.markupElemIds.control){
      if(this.value){
        this.toggleCSSClass(this.markupElemIds.control, 'checked', true);
        this.toggleCSSClass(this.markupElemIds.control, 'unchecked', false);
      }
      else{
        this.toggleCSSClass(this.markupElemIds.control, 'checked', false);
        this.toggleCSSClass(this.markupElemIds.control, 'unchecked', true);
      }
    }
  }
});
//-- Alias for some users:++
HCheckBox = HCheckbox;
