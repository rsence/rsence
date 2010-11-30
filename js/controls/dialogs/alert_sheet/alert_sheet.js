/*   RSence
 *   Copyright 2009 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

/*** = Description
  ** HAlertSheet is a simple alert notification control.
  ***/

var//RSence.Controls
HAlertSheet = HSheet.extend({

/** = Description
  * Refreshes the label of text if this['alertText'] is set.
  *
  **/
  refreshLabel: function(){
    this.base();
    if(this['alertText']){
      this.alertText.setValue( this.label );
    }
  },
  
/** = Description
  * Draws the warning text (this.label) as a HStringView and a warning image 
  * and an alert button.
  **/
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

/** = Description
  * Draws an alert button.
  *
  **/
  alertButtons: function(){
    this.okButton = HClickButton.nu(
      [ null, null, 60, 23, 8, 8 ],
      this, {
        label: 'OK',
        valueObj: this.valueObj,
        events: {
          click: true
        }
      }
    );
  },

/** = Description
  * Binds the same value to okButton.
  *
  **/  
  setValueObj: function( valueObj ){
    this.base( valueObj );
    if ( this['okButton'] ) {
      valueObj.bind( this.okButton ); 
    }
  }
  
});
