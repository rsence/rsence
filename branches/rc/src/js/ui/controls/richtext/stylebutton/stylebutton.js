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

/*** class: HStyleButton
  **
  ** HStyleButton is the button that has an image. HStyleButtons can have two states, checked and unchecked.
  ** It inherits these properties from the HImageButton.
  ** State transition of a button is done by clicking the mouse on the button 
  ** or by using a keyboard shortcut. Also applies the command to the richtextview when the mouse button goes up.
  ** 
  ** vars: Instance variables
  **  type - '[HImageButton]'
  **  value - A boolean, true when the button is checked, false when it's not.
  **  image - The url of an image that indicates false state.
  **  alternateImage - The url of an image that indicates true state.
  **  command - The command to be applied for the HRichTextView.
  **  richtextview - The HRichTextView for which the command is applied.
  **
  ** Extends:
  **  <HControl>
  **
  ** See also:
  **  <HControl> <HImageButton>
  ***/
HStyleButton = HImageButton.extend({
  
  packageName:   "richtext",
  componentName: "stylebutton",

/** constructor: constructor
  *
  * Parameters:
  *   _rect - An <HRect> object that sets the position and dimensions of this control.
  *   _parentClass - The parent view that this control is to be inserted in.
  *   _options - See <HControl.constructor> and <HComponentDefaults>
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
    
    this.type = '[HStyleButton]';

	this.preserveTheme = true;
    
    if(!this.isinherited) {
      this.draw();
    }
  },

/** event: mouseUp
  * 
  * Called when the user clicks the mouse button up on this object. Sets the state of the HImageButton.
  * It can be 0 or 1. Also executes the "command" for the richtextview.
  *
  * Parameters:
  *  _x - The horizonal coordinate units (px) of the mouse cursor position.
  *  _y - The vertical coordinate units (px) of the mouse cursor position.
  *  _leftButton - Flag, is false when the right mouse button was pressed. *Do
  *                not rely on it*
  *
  * See also:
  *  <HControl.mouseUp>
  **/
  mouseUp: function() {
	if (this.styleButtonDefaults.richtextview) {
	  HTextEdit.execCommand(this.styleButtonDefaults.command, false, null, this.styleButtonDefaults.richtextview.iframe().contentWindow.document);
	}
	this.base();
  }
  
},{
  _tmplImgPrefix: "imageview"
});
