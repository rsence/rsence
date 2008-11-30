/***
  ** Himle Client -- http://himle.org/
  **
  ** Copyright (C) 2008 Juha-Jarmo Heinonen
  **
  ** This file is part of Himle Client.
  **
  ** Himle Client is free software: you can redistribute it and/or modify
  ** it under the terms of the GNU General Public License as published by
  ** the Free Software Foundation, either version 3 of the License, or
  ** (at your option) any later version.
  **
  ** Himle Client is distributed in the hope that it will be useful,
  ** but WITHOUT ANY WARRANTY; without even the implied warranty of
  ** MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  ** GNU General Public License for more details.
  **
  ** You should have received a copy of the GNU General Public License
  ** along with this program.  If not, see <http://www.gnu.org/licenses/>.
  **
  ***/

/** class: HRadioButton
  *
  * A HRadioButton is a labeled, two-state button that's displayed in a group along
  * with other similar buttons. The button itself is a round icon that has a filled
  * center when the HRadioButton is turned on, and is empty when it's off.
  * The label appears next to the icon.
  *
  * Only one radio button in the group can be on at a time; when the user clicks a
  * button to turn it on, the button that's currently on is turned off. One button
  * in the group must be on at all times; the user can turn a button off only by
  * turning another one on. The button that's on has a value of 1 (B_CONTROL_ON);
  * the others have a value of 0 (B_CONTROL_OFF).
  *
  * The BRadioButton class handles the interaction between radio buttons in the
  * following way: A direct user action can only turn on a radio button, not turn
  * it off. However, when the user turns a button on, the BRadioButton object turns
  * off all sibling BRadioButtons—that is, all BRadioButtons that have the same
  * parent as the one that was turned on.
  *
  * This means that a parent view should have no more than one group of radio buttons
  * among its children. Each set of radio buttons should be assigned a separate
  * parent—perhaps an empty BView that simply contains the radio buttons and does
  * no drawing of its own.
  *
  * Extends:
  *  <HCheckbox>
  *
  * See also:
  *  <HControl> <HCheckbox> <HToggleButton>
  **/

HRadioButton = ( HCheckbox.extend(HValueMatrixComponentExtension) ).extend({
  componentName: 'radiobutton'
});


// Backwards compatibility
HRadiobutton = HRadioButton;

