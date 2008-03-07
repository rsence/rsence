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

/*** class: HStringView
  **
  ** HStringView is a view component that represents a non-editable line of text. 
  ** Commonly, stringview is used as a label to control elements 
  ** that do not have implicit labels (text fields, checkboxes and radio buttons, and menus). 
  ** Some form controls automatically have labels associated with them (press buttons) 
  ** while most do not have (text fields, checkboxes and radio buttons, and sliders etc.).  
  ** HStringView view or theme can be changed; the helmiTheme is used by default.
  **
  ** vars: Instance variables
  **  type - '[HStringView]'
  **  value - The string that this string view displays when drawn.
  **
  ** Extends:
  **  <HControl>
  **
  ** See also:
  **  <HControl>
  ***/
HStringView = HControl.extend({

  componentName: "stringview",

/** constructor: constructor
  *
  * Parameters:
  *   _rect - An <HRect> object that sets the position and dimensions of this control.
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
    
    this.type = '[HStringView]';
    
    // When this is true, the component is always drawn with the theme that was
    // active at the creation of the component, not the current theme.
    this.preserveTheme = true;
    
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
  
  

/** method: refresh
  * 
  * Redraws only the value, not the whole markup.
  *
  * See also:
  *  <HView.refresh>
  **/
  refresh: function() {
    if (this.drawn) {
      // Super takes care of calling optimizeWidth(), if required.
      this.base();
      if(!this._stringElemId) {
        this._stringElemId = this.bindDomElement("stringview" + this.elemId);
      }
      if(this._stringElemId) {
        elem_set(this._stringElemId, this.value);
      }
    }
  },
  
  
/** method: stringElementId
  * 
  * Returns:
  *   The element ID of the element that actually contains the string.
  *
  **/
  stringElementId: function() {
    return this._stringElemId;
  },
  
  
/** method: optimizeWidth
  * 
  * Sets the width of the view to match the width of the value string of this
  * object.
  *
  * See also:
  *  <HView.optimizeWidth>
  **/
  optimizeWidth: function() {
    if (this._stringElemId) {
      
      // Create a temporary clone of the string container and place it into the
      // document body. This is needed when the string view is used inside of a
      // tree node and it is not certain that the string view is yet displayed.
      // NOTE: This makes the method a bit slower, but for now it seems to be
      // necessary to make it work properly.
      var _tempElement = elem_get(this._stringElemId).cloneNode(true);
      var _tempElemId = elem_add(_tempElement);
      prop_set(_tempElemId, "visibility", "hidden", true);
      elem_append(0, _tempElemId);
      
      var _width = this.stringWidth(this.value, null, _tempElemId);
      
      if (!isNaN(_width)) {
        var _additionalWidth = prop_get_extra_width(this._stringElemId);
        this.resizeTo(_width + _additionalWidth, this.rect.height);
      }
      
      // Delete the temporary clone.
      elem_del(_tempElemId);

    }
  }
  
});

