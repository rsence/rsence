/*   Riassence Framework
 *   Copyright 2008 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */


/** class: HButton
  *
  * Simple button component, designed to be extended for any
  * actual functionality above regular <HControl>.
  * It's limited to 24px height by the default theme, because
  * it's much simpler to render that way.
  *
  * Extends:
  *  <HControl>
  *
  * See Also:
  *  <HControl> <HView>
  *
  **/
HButton = HControl.extend({
  componentName: 'button',
  setStyle: function(_name, _value){
    ELEM.setStyle(this.markupElemIds.label,_name,_value);
  }
});

/** class: HClickValueButton
  *
  * Simple HButton extension, operates on its value so it's useful
  * for sending button clicks to the server and the like.
  * For the value responder, reset the value to 0 when read to make
  * the button clickable again.
  *
  * Value states:
  *  0: Enabled, clickable
  *  1: Disabled, clicked
  *  Other: Disabled, not clickable, not clicked
  *
  **/
HClickValueButton = HButton.extend({
  refreshValue: function(){
    this.setEnabled( this.value === 0 );
  },
  click: function(){
    if(this.enabled){
      this.setValue(1);
    }
  }
});

