/***  HIMLE RIA SYSTEM
  ** 
  **  Copyright (C) 2008 HIMLE GROUP http://himle.sorsacode.com/
  **  Copyright (C) 2006-2007 Helmi Technologies Inc.
  ** 
  **  This program is free software; you can redistribute it and/or modify it under the terms
  **  of the GNU General Public License as published by the Free Software Foundation;
  **  either version 2 of the License, or (at your option) any later version. 
  **  This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
  **  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
  **  See the GNU General Public License for more details. 
  **  You should have received a copy of the GNU General Public License along with this program;
  **  if not, write to the Free Software Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
  ***/

/*** class: HCheckbox
  **
  ** HCheckbox is a control unit that allows the user to make multiple selections 
  ** from a number of options. Checkboxes can have two states, checked and unchecked. 
  ** In contrast of radio button, checkbox can be presented as a single unit. 
  ** State transition of a checkbox is done by clicking the mouse on the button 
  ** or by using a keyboard shortcut. Checkbox view or theme can be changed; 
  ** the helmiTheme is used by default.
  **
  ** vars: Instance variables
  **  type - '[HCheckbox]'
  **  value - A boolean, true when the checkbox is checked, false when it's not.
  **
  ** Extends:
  **  <HControl>
  **
  ** See also:
  **  <HControl> <HRadioButton> <HToggleButton>
  ***/
HCheckbox = HToggleButton.extend({
  
  componentName: "checkbox",

/** constructor: constructor
  *
  * Parameters:
  *   _rect - An <HRect> object that sets the position and dimensions of this
  *           control.
  *   _parentClass - The parent view that this control is to be inserted in.
  *   _options - (optional) All other parameters. See <HComponentDefaults>.
  **/
  constructor: function(_rect, _parentClass, _options) {
    if(this.isinherited) {
      this.base(_rect, _parentClass, _options);
    }
    else {
      this.isinherited = true;
      this.base(_rect, _parentClass, _options);
      this.isinherited = false;
    }
    
    this.type = '[HCheckbox]';
    
    if(!this.isinherited) {
      this.draw();
    }
  }

});
