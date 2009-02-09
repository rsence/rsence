/***  Riassence Core
  ** 
  **  Copyright (C) 2008 Riassence Inc http://rsence.org/
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

/*** class: HPopupButton
  **
  ** A HPopupButton object displays a labeled pop-up menu.
  **
  ** vars: Instance variables
  **  type - '[HPopupButton]'
  **  value - Numeric value currently set to this object.
  **  label - The string that is shown as the label of this object.
  **
  ** Extends:
  **  <HButton>
  **
  ** See also:
  **  <HButton>
  ***/
HPopupButton = HButton.extend({
  
  packageName:   "menus",
  componentName: "popupbutton",

/** constructor: constructor
  *
  * Parameters:
  *   _rect - An <HRect> object that sets the position and dimensions of this
  *     control.
  *   _parentClass - The parent view that this control is to be inserted in.
  *   _options - (optional) All other parameters. See <HComponentDefaults>.
  * 
  * Extra options:
  *   popupMenu - An <HPopupMenu>
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
    
    this.type = '[HPopupButton]';
    
    if (_options.popupMenu) {
      this.popupmenu = _options.popupMenu;
      this.popupmenu.popupbutton = this;
      this.popupmenu.hide();
      this.popupmenu.setOwner(this);
    }
    this.setMouseDown(true);
    
    if(!this.isinherited) {
      this.draw();
    }
  },
  
  
/** event: mouseDown
  * 
  * Shows and hides the pop-up menu of the pop-up button.
  * 
  * Parameters:
  *   _x - The horizonal coordinate units (px) of the mouse cursor position.
  *   _y - The vertical coordinate units (px) of the mouse cursor position.
  *   _leftButton - Flag, is false when the right mouse button was pressed.
  *     *Do not rely on it*
  *
  * See also:
  *   <HControl.mouseDown>
  * 
  */
  mouseDown: function(x, y, _leftButton) {
    if (this.popupmenu.isHidden) {
      this.popupmenu.rect.left = this.pageX();
      this.popupmenu.rect.top = this.pageY() + this.rect.height;
      
      this.popupmenu.setStyle("left", this.popupmenu.rect.left + "px");
      this.popupmenu.setStyle("top", this.popupmenu.rect.top + "px");
      this.popupmenu.bringToFront();
      this.popupmenu.show();
    } else {
      this.popupmenu.hide();
    }
  },
  
  
/** event: lostActiveStatus
  *
  * Hides the pop-up menu of this combo box if the user clicked outside of it.
  *
  * Parameters:
  *  _newActiveControl - A reference to the control that became the currently
  *    active control. Can be null if there is no active control.
  *
  */
  lostActiveStatus: function(_newActiveControl) {
    if (!_newActiveControl ||
      this.popupmenu.indexOfItem(_newActiveControl) == -1) {
      // Clicked outside of the combo box, hide the menu.
      this.popupmenu.hide();
    }
  },
  
  
/** method: selectedIndexChanged
  * 
  * Implemented by derived classes to do whatever they please when the selection
  * on the popup button's popup menu changes.
  * 
  * See also:
  *   <HPopupMenu.selectedIndexChanged>
  **/
  selectedIndexChanged: function() {
    // Implement this in extended classes that wish to receive a notification
    // when the selection in the menu changes.
  }


  
});

// Alias for backwards-compatibility:
HPopUpButton = HPopupButton;


