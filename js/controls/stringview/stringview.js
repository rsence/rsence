/*   RSence
 *   Copyright 2006 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

/*** = Description
  ** HStringView is a view component that represents a non-editable line of text. 
  ** Commonly, stringview is used as a label to control elements 
  ** that do not have implicit labels (text fields, checkboxes and radio buttons, and menus). 
  ** Some form controls automatically have labels associated with them (press buttons) 
  ** while most do not have (text fields, checkboxes and radio buttons, and sliders etc.).  
  **
  ** = Instance variables
  ** +type+::   '[HStringView]'
  ** +value+::  The string that this string view displays when drawn.
  ***/
var//RSence.Controls
HStringView = HControl.extend({

  componentName: "stringview",
  
  defaultEvents: {
    contextMenu: true
  },
  
/** = Description
  * HStringView allows the default contextMenu action.
  *
  **/
  contextMenu: function(){
    return true;
  },
  
/** = Description
  * The setStyle method of HStringView applies only to the value 
  * element (not the whole component).
  *
  **/
  setStyle: function(_name, _value, _cacheOverride) {
    if (!this['markupElemIds']||!this.markupElemIds['value']) {
      return this;
    }
    ELEM.setStyle(this.markupElemIds.value, _name, _value, _cacheOverride);
    return this;
  },
  
/** = Description
  * The refreshLabel of HStringView sets a tool tip.
  * Applied by the setLabel method and the label attribute of options.
  *
  **/
  refreshLabel: function() {
    if(this.markupElemIds) {
      if(this.markupElemIds.value) {
        ELEM.setAttr(this.markupElemIds.value, 'title', this.label);
      }
    }
  }
});

