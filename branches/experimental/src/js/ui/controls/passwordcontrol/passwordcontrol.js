/*   Riassence Framework
 *   Copyright 2006 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

/*** class: HPasswordControl
  **
  ** Just like HTextControl, but the typed characters are not shown.
  **
  ** vars: Instance variables
  **  type - '[HPasswordControl]'
  **  value - The string that is currently held by this object.
  **
  ** Extends:
  **  <HTextControl>
  **
  ** See also:
  **  <HControl> <HTextControl>
  ***/
HPasswordControl = HTextControl.extend({
  // just change input type to password from the default input type=text
  drawSubviews: function(){
    this.base();
    ELEM.get(this.markupElemIds.value).type = 'password';
  },
  // disable value echoing for passwords,
  // one way only (the value entered in the password input)
  refreshValue: function(){
  }
});

