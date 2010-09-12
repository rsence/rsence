/*   RSence
 *   Copyright 2010 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */


/*** = Description
  ** Menu item for the HMiniMenu component.
  ***/
var//RSence.Menus
HMiniMenuItem = HRadioButton.extend({
  
  componentName: 'minimenuitem',
  
  defaultEvents: {
    click: true,
    mouseUp: true
  },
  
  click: function(){
    this.base();
    EVENT.changeActiveControl(this.parent.parent);
  },
  
  mouseUp: function(){
    this.base();
    this.click();
  }
  
});
