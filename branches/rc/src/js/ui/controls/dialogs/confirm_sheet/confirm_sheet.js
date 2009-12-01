/*   Riassence Framework
 *   Copyright 2009 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

HConfirmSheet = HAlertSheet.extend({
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
