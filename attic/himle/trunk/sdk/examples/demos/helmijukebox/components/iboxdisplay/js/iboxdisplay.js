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

IBoxDisplay = HControl.extend({
  
  themePath:     IThemePath,
  componentName: "iboxdisplay",
  constructor: function(_rect, _parentClass, _options) {
    if(this.isinherited) {
      this.base(_rect, _parentClass, _options);
    }
    else {
      this.isinherited = true;
      this.base(_rect, _parentClass, _options);
      this.isinherited = false;
    }
    
    this.type = '[IBoxDisplay]';
    
    // To help extension:
    this._tmplLabelPrefix = "buttonlabel";
    
    // When this is true, the component is always drawn with the theme that was
    // active at the creation of the component, not the current theme.
    this.preserveTheme = true;
    
    if(!this.isinherited) {
      this.draw();
    }
  },
  draw: function() {
    if(!this.drawn) {
      this.drawRect();
      this.drawMarkup();
    }
    // Make sure the label gets drawn:
    this.refresh();
  },
  refresh: function() {
    if(this.drawn) {
      this.base();
      // Checks if this is the first refresh call:
      if(!this._labelElementId) {
        // Gets the label element based on the id specified in constructor and
        // template:
        this._labelElementId = this.bindDomElement(
          this._tmplLabelPrefix + this.elemId);
      }
      // Checks if we have a label element:
      if(this._labelElementId) {
        // Sets the label's innerHTML:
        elem_set(this._labelElementId, this.value);
      }
    }
  }
  
});

