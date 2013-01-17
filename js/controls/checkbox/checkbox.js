
/*** = Description
  ** Simple checkbox component, toggles the value of
  ** itself between true and false.
  ***/
var//RSence.Controls
HCheckbox = HButton.extend({

  componentName: 'checkbox',
  
  defaultEvents: {
    click: true
  },
  
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
var//RSence.Controls
HCheckBox = HCheckbox;
