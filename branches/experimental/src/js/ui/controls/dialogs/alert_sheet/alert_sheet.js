/*   Riassence Framework
 *   Copyright 2009 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

HAlertSheet = HSheet.extend({
  drawSubviews: function(){
    this.icon = HImageView.nu(
      [ 16, 16, 48, 48 ],
      this, {
        value: this.getThemeGfxFile('sheet_warning.png')
      }
    );
    this.alertText = HStringView.nu(
      [ 80, 16, null, null, 8, 48 ],
      this, {
        value: this.label
      }
    );
    this.alertButtons();
  },
  alertButtons: function(){
    this.okButton = HClickValueButton.nu(
      [ null, null, 60, 23, 8, 8 ],
      this, {
        label: 'OK',
        valueObj: this.valueObj,
        events: {
          click: true
        }
      }
    );
  }
});
