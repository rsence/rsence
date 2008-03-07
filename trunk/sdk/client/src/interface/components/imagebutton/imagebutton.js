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

/*** class: HImageButton
  **
  ** HImageButton is the button that has an image. HImageButtons can have two states, checked and unchecked. 
  ** State transition of a button is done by clicking the mouse on the button 
  ** or by using a keyboard shortcut.
  ** 
  ** vars: Instance variables
  **  type - '[HImageButton]'
  **  value - A boolean, true when the button is checked, false when it's not.
  **  image - The url of an image that indicates false state.
  **  alternateImage - The url of an image that indicates true state.
  **
  ** Extends:
  **  <HControl>
  **
  ** See also:
  **  <HControl>
  ***/
HImageButton = HControl.extend({
  
  componentName: "imagebutton",

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
    this.styleButtonDefaults = new (Base.extend({
      image: this.getThemeGfxPath() + "blank.gif",
      alternateImage: ""
    }).extend(_options));
    
    this._image = this.getThemeGfxPath() + this.styleButtonDefaults.image;
    this._alternateImage = this.getThemeGfxPath() + this.styleButtonDefaults.alternateImage;
    
    this.type = '[HImageButton]';

    this.preserveTheme = true;
    
    this.setMouseUp(true);
    
    if(!this.isinherited) {
      this.draw();
    }
  },

/** method: draw
  * 
  * Draws the rectangle and the markup of this object on the screen.
  *
  * See also:
  *  <HView.draw>
  **/
  draw: function() {
    if (!this.drawn) {
      this.drawRect();
      this.drawMarkup();
      this.drawn = true;
    }
    this.refresh();    
  },
  _updateImageState: function() {
	if (!this.value) {
	  elem_get(this._imgElementId).src = this._image;
	} else {
	  if (this._alternateImage) {
	    elem_get(this._imgElementId).src = this._alternateImage;
	  }
	}
  },

/** method: refresh
  * 
  * Sets only the image that indicates the state, not the whole markup.
  *
  * See also:
  *  <HView.refresh>
  **/
  refresh: function() {
    if (this.drawn) {
      this.base();
      // Checks if this is the first refresh call:
      if(!this._imgElementId) {
        this._imgElementId = this.bindDomElement(
          HImageButton._tmplImgPrefix + this.elemId);
      }
      if(this._imgElementId) {
        this._updateImageState();
      }
    }
  },

/** event: mouseUp
  * 
  * Called when the user clicks the mouse button up on this object. Sets the state of the HImageButton.
  * It can be 0 or 1.
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
  mouseUp: function(_x, _y, _isLeftButton) {
    this.setValue(!this.value);
  }
  
},{
  _tmplImgPrefix: "imagebutton"
});
