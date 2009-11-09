/*   Riassence Framework
 *   Copyright 2008 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

/** class: HCheckbox
  *
  * Simple checkbox component, toggles the value of
  * itself between true and false.
  *
  * Extends:
  *  <HButton>
  *
  * See Also:
  *  <HButton> <HControl> <HView>
  *
  **/
HCheckbox = HButton.extend({
  componentName: 'checkbox',
  constructor: function(_rect,_parent,_options){
    this.base(_rect,_parent,_options);
    this.setClickable(true);
  },
  
  // Toggles the value:
  click: function(){
    this.setValue(!this.value);
  },
  
  setStyle: function(_name,_value,_bypass){
    this.setStyleOfPart('label',_name,_value,_bypass);
  },
  
  // Toggles the checked/unchecked css-class status
  // according to the trueness of the value.
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
// Alias for some users:
HCheckBox = HCheckbox;
