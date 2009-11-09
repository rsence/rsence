/*   Riassence Framework
 *   Copyright 2006 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

/*** class: HStringView
  **
  ** HStringView is a view component that represents a non-editable line of text. 
  ** Commonly, stringview is used as a label to control elements 
  ** that do not have implicit labels (text fields, checkboxes and radio buttons, and menus). 
  ** Some form controls automatically have labels associated with them (press buttons) 
  ** while most do not have (text fields, checkboxes and radio buttons, and sliders etc.).  
  ** HStringView view or theme can be changed; the helmiTheme is used by default.
  **
  ** vars: Instance variables
  **  type - '[HStringView]'
  **  value - The string that this string view displays when drawn.
  **
  ** Extends:
  **  <HControl>
  **
  ** See also:
  **  <HControl>
  ***/
HStringView = HControl.extend({

  componentName: "stringview",
  componentBehaviour: ['view','control','text'],
  
  setStyle: function(_name, _value, _cacheOverride) {
    if (!this['markupElemIds']||!this.markupElemIds['value']) {
      return;
    }
    ELEM.setStyle(this.markupElemIds.value, _name, _value, _cacheOverride);
  },
  refreshLabel: function() {
    if(this.markupElemIds) {
      if(this.markupElemIds.value) {
        ELEM.setAttr(this.markupElemIds.value, 'title', this.label);
      }
    }
  }

  
});

