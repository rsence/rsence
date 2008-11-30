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

/*** class: HMenuItem
  **
  ** A HMenuItem object displays one item within a menu and contains the state
  ** associated with that item.
  **
  ** vars: Instance variables
  **  type - '[HMenuItem]'
  **  value - Boolean value (sets the marked status).
  **  label - The string that is shown as the label of this object.
  **  marked - Returns whether the item is currently marked.
  **
  ** Extends:
  **  <HControl>
  **
  ** See also:
  **  <HControl>
  ***/
HMenuItem = HControl.extend({
  
  packageName:   "menus",
  componentName: "menuitem",

/** constructor: constructor
  *
  * Parameters:
  *   _rect - An <HRect> object that sets the position and dimensions of this
  *     control.
  *   _parentClass - The parent view that this control is to be inserted in.
  *   _options - (optional) All other parameters. See <HComponentDefaults>.
  * 
  * Extra options:
  *   index - The index of the item, its ordinal position in the menu. Indices
  *     begin at 0.
  **/
  constructor: function(_rect, _parentClass, _options) {
    if (!_options) {
      _options = {};
    }
    if (typeof _options != "object") {
      throw('MenuItemConstructorError: _options must be an object');
    }
    var _hasValueObj = true;
    if (!_options.valueObj) {
      _hasValueObj = false;
    }
  
    if(this.isinherited) {
      this.base(_rect, _parentClass, _options);
    }
    else {
      this.isinherited = true;
      this.base(_rect, _parentClass, _options);
      this.isinherited = false;
    }
    
    
    // Is this used for something?
    /* if (_hasValueObj == false) {
      this._menuItemValue = new HControlValue(this.elemId, {
        value: this.value,
        label: this.label,
        enabled: this.enabled,
        active: this.active
      });
      
    } else {
      this._menuItemValue = _options.valueObj;
    }
    this._menuItemValue.bind(this); */
    
    
    // set values,labels,enabled,active
    
    this.type = '[HMenuItem]';
    
    // To help extension:
    this._tmplLeftImagePrefix  = "menuitemleftimage";
    this._tmplRightImagePrefix = "menuitemrightimage";
    
    // When this is true, the component is always drawn with the theme that was
    // active at the creation of the component, not the current theme.
    this.preserveTheme = true;
    this.marked = false;
    this.setMouseDown(true);
    this.setMouseUp(true);
    this.refreshOnValueChange = true;
    
    if (_parentClass.type == "[HMenu]" || _parentClass.type == "[HMenuBar]" ||
      _parentClass.type == "[HPopupMenu]") {
      if (!_options) {
        _options = {};
      }
      _parentClass.addItem(this, _options.index);
    }
    
    if(!this.isinherited) {
      this.draw();
    }
  },
  
  // Private method.
  _updateMenuItemLeftImage: function() {
    // Sets the leftimage background image
    if(this.value) {
      this.toggleCSSClass(ELEM.get(this._leftImageElementId),
        this.cssOn, true);
      this.toggleCSSClass(ELEM.get(this._leftImageElementId),
        this.cssOff, false);

    } else {
      this.toggleCSSClass(ELEM.get(this._leftImageElementId),
        this.cssOn, false);
      this.toggleCSSClass(ELEM.get(this._leftImageElementId),
        this.cssOff, true);
    }
  },
  
  // Private method.
  _updateMenuItemRightImage: function() {
    // Sets the leftimage background image
    if(this.leaf) {
      this.toggleCSSClass(ELEM.get(this._rightImageElementId),
        this.cssRightOn, true);
      this.toggleCSSClass(ELEM.get(this._rightImageElementId),
        this.cssRightOff, false);

    } else {
      this.toggleCSSClass(ELEM.get(this._rightImageElementId),
        this.cssRightOn, false);
      this.toggleCSSClass(ELEM.get(this._rightImageElementId),
        this.cssRightOff, true);
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
    this.refresh(); // Make sure the label gets drawn.
  },
  
  refresh: function() {
    if (this.drawn) {
      // Checks if we have a label element:
      if(this.markupElemIds.label) {
        // Sets the label's innerHTML:
        ELEM.setHTML(this.markupElemIds.label, this.label);
      }
      
      // Checks if this is the first refresh call:
      if(!this._leftImageElementId) {
        // Gets the leftimage element based on the id specified in constructor and
        // template:
        this._leftImageElementId = this.bindDomElement(
          this._tmplLeftImagePrefix + this.elemId);
      }
      // Checks if we have a leftimage element:
      if(this._leftImageElementId && !this.leaf) {
        this._updateMenuItemLeftImage();
      }
      
          // Checks if this is the first refresh call:
      if(!this._rightImageElementId) {
        // Gets the leftimage element based on the id specified in constructor and
        // template:
        this._rightImageElementId = this.bindDomElement(
          this._tmplRightImagePrefix + this.elemId);
      }
      if(this._rightImageElementId && this.menu && this.menu.type == "[HMenu]") {
        this._updateMenuItemRightImage();
      }
    }
  },
  
   // this sets the sub menu
  _setLeaf: function(_leaf) {
    this.leaf = _leaf;
  },
  
/** method: stringWidth
  * 
  * Adds the total width of borders and paddings to the width of the string.
  * 
  * See <HView.stringWidth>.
  *
  */
  stringWidth: function(_string, _length) {
    return this.base(_string, _length) +
      ELEM.getExtraWidth(this.markupElemIds.label);
  },
  
/** method: setMarked
  * 
  * Adds a check mark to the left of the item label if flag is true, or removes
  * an existing mark if flag is false. If the menu is visible on-screen it's
  * redisplayed with or without the mark.
  * 
  * Parameters:
  *   _value - A numeric value to be set to the object.
  *
  * See also:
  *  <HControl.setValue>
  **/  
  setMarked: function(_value) {
    this.marked = _value;
    this.setValue(_value);
  },
  
  
/** event: lostActiveStatus
  *
  * Hides the menu that this menu item belongs to when the user clicks outside
  * of it.
  *
  * Parameters:
  *  _newActiveControl - A reference to the control that became the currently
  *    active control. Can be null if there is no active control.
  *
  */
  lostActiveStatus: function(_newActiveControl) {
    if (this.menu.hideMenu) {
      this.menu.hideMenu();
    }
  },
  
  // The name of the CSS class to be used when...
  // the item is selected.
  cssOn: "leftimageOn",
  // the item not selected.
  cssOff: "leftimage",
  cssRightOn: "rightimageOn",
  cssRightOff: "rightimage"
}
).extend(HValueMatrixComponentExtension).extend({
  mouseDown: function(_x,_y,_isLeftButton) {
    if (this.menu.radioMode) {
      this.base(_x,_y,_isLeftButton);
    }
  },
  mouseUp: function(_x,_y,_isLeftButton) {
    // If there's an action added to this menu item, it gets called on mouse up.
    if (this.action) {
      this.action();
    }
    if (this.menu.radioMode) {
      this.base(_x,_y,_isLeftButton);
    }
    // If the menu that holds this menu item wishes to perform actions when the
    // mouse button is released on a menu item, it has to implement the method
    // mouseUpOnMenuItem.
    if (this.menu.mouseUpOnMenuItem) {
      this.menu.mouseUpOnMenuItem(this);
    }
  }
});

