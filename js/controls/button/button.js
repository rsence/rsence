/*   RSence
 *   Copyright 2008 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */


/*** = Description
  ** Simple button component, designed to be extended for any
  ** actual functionality above regular HControl.
  ** It's limited to 24px height by the default theme, because
  ** it's much simpler to render that way.
  ***/
var//RSence.Controls
HButton = HControl.extend({
  
  componentName: 'button',
  
/** = Description
  * setStyle function for button.
  *
  **/
  setStyle: function(_name, _value){
    ELEM.setStyle(this.markupElemIds.label,_name,_value);
    return this;
  }
  
});


/*** = Description
  ** Simple HButton extension, operates on its value so it's useful
  ** for sending button clicks to the server and the like.
  ** For the value responder, reset the value to 0 when read to make
  ** the button clickable again.
  **
  ** = Value states
  ** +0+::     Enabled, clickable
  ** +1+::     Disabled, clicked
  ** +Other+:: Disabled, not clickable, not clicked
  ***/
var//RSence.Controls
HClickButton = HButton.extend({
  
  defaultEvents: {
    click: true
  },
  
/** = Description
  * Sets the button enabled if this.value is 0.
  *
  **/
  refreshValue: function(){
    if( this.options.inverseValue ){
      this.setEnabled( this.value === 1 );
    }
    else {
      this.setEnabled( this.value === 0 );
    }
  },
/** = Description
  * Click method, sets the value to disabled if the button is enabled.
  *
  **/
  click: function(){
    if(this.enabled){
      if( this.options.inverseValue ){
        this.setValue(0);
      }
      else {
        this.setValue(1);
      }
    }
  }
  
});

var//RSence.Controls
HClickValueButton = HClickButton;

