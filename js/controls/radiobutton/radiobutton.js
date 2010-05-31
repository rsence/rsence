/*   RSence
 *   Copyright 2008 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

/*** = Description
  ** A HRadioButton is a labeled, two-state button that's displayed in a group along
  ** with other similar buttons. The button itself is a round icon that has a filled
  ** center when the HRadioButton is turned on, and is empty when it's off.
  ** The label appears next to the icon.
  **
  ** Only one radio button in the group can be on at a time; when the user clicks a
  ** button to turn it on, the button that's currently on is turned off. One button
  ** in the group must be on at all times; the user can turn a button off only by
  ** turning another one on. The button that's on has a value of 1 (H_CONTROL_ON);
  ** the others have a value of 0 (H_CONTROL_OFF).
  **
  ** The HRadioButton class handles the interaction between radio buttons in the
  ** following way: A direct user action can only turn on a radio button, not turn
  ** it off. However, when the user turns a button on, the HRadioButton object turns
  ** off all sibling HRadioButtons—that is, all HRadioButtons that have the same
  ** parent as the one that was turned on.
  **
  ** This means that a parent view should have no more than one 
  ** group of radio buttons among its children. Each set of radio buttons 
  ** should be assigned a separate parent—perhaps an empty HView that 
  ** simply contains the radio buttons and does no drawing of its own.
  ***/

var//RSence.Controls
HRadioButton = HCheckbox.extend(
  HValueMatrixInterface
);
HRadioButton.prototype.componentName = 'radiobutton';


// Backwards compatibility
var//RSence.Controls
HRadiobutton = HRadioButton;

