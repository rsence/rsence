/*   RSence
 *   Copyright 2009 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

/*** = Description
  ** Simple confirm sheet control. Acts like HAlertSheet but has a cancel 
  ** button as well.
  ***/

var//RSence.Controls
HConfirmSheet = HAlertSheet.extend({
/** = Description
  * Creates a cancel button.
  *
  **/
  alertButtons: function(){
    this.cancelButton = HClickValueButton.extend({
      click: function(){
        this.setValue( -1 );
      }
    }).nu(
      [ null, null, 60, 23, 76, 8 ],
      this, {
        label: 'Cancel',
        valueObj: this.valueObj,
        events: {
          click: true
        }
      }
    );
    this.base();
  }
});
