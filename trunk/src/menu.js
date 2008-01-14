/**
  *  Helmi RIA Platform
  *  Copyright (C) 2006-2007 Helmi Technologies Inc.
  *  
  *  This program is free software; you can redistribute it and/or modify it under the terms
  *  of the GNU General Public License as published by the Free Software Foundation;
  *  either version 2 of the License, or (at your option) any later version. 
  *  This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
  *  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
  *  See the GNU General Public License for more details. 
  *  You should have received a copy of the GNU General Public License along with this program;
  *  if not, write to the Free Software Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
  **/

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
      this.toggleCSSClass(elem_get(this._leftImageElementId),
        this.cssOn, true);
      this.toggleCSSClass(elem_get(this._leftImageElementId),
        this.cssOff, false);

    } else {
      this.toggleCSSClass(elem_get(this._leftImageElementId),
        this.cssOn, false);
      this.toggleCSSClass(elem_get(this._leftImageElementId),
        this.cssOff, true);
    }
  },
  
  // Private method.
  _updateMenuItemRightImage: function() {
    // Sets the leftimage background image
    if(this.leaf) {
      this.toggleCSSClass(elem_get(this._rightImageElementId),
        this.cssRightOn, true);
      this.toggleCSSClass(elem_get(this._rightImageElementId),
        this.cssRightOff, false);

    } else {
      this.toggleCSSClass(elem_get(this._rightImageElementId),
        this.cssRightOn, false);
      this.toggleCSSClass(elem_get(this._rightImageElementId),
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
        elem_set(this.markupElemIds.label, this.label);
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
      prop_get_extra_width(this.markupElemIds.label);
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

/*** class: HMenu
  **
  ** HMenu is a control unit that displays a pull-down or pop-up list of menu items. 
  ** A common use of menus is to provide convenient access to various operations 
  ** such as saving or opening a file, quitting a program, or manipulating data. 
  ** A menu can contain simple menu items or other menus (submenus). 
  ** A submenu is a menu item that, when selected, reveals still another menu.
  **
  ** vars: Instance variables
  **  type - '[HMenu]'
  **  value - Numeric value currently set to this object.
  **  label - The string that is shown as the label of this object.
  **  radioMode - Returns whether the HMenu is currently in radio mode. The
  **    default radio mode is false for ordinary HMenus, but true for HPopupMenus.
  **
  ** Extends:
  **  <HControl>
  **
  ** See also:
  **  <HControl>
  ***/
HMenu = HControl.extend({
  
  packageName:   "menus",
  componentName: "menu",

/** constructor: constructor
  *
  * Parameters:
  *   _rect - An <HRect> object that sets the position and dimensions of this
  *     control.
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
    
    this.type = '[HMenu]';
    
    // When this is true, the component is always drawn with the theme that was
    // active at the creation of the component, not the current theme.
    this.preserveTheme = true;
    
    this.menuItems = [];
    this._menuDefaults = {
      itemHeight: 21,
      menuOffset: -5
    };
    
    this.totalHeight = 0;
    
    if(!this.isinherited) {
      this.draw();
    }
  },
  
  draw: function() {
    this.base();
    this._arrangeMenuItems();
    this.drawRect();
  },
  
  hide: function() {
    var i, _item, l = this.menuItems.length;
    for (i = 0; i < l; i++) {
      _item = this.menuItems[i];
      if (_item != this && _item.leaf) {
        _item.leaf.hide();
      }
    }
    this.base();
  },
  
  _itemFocus: function() {
    var i, _item, l = this.menu.menuItems.length;
    var _index;
    // hide others and show curren item
    for (i = 0; i < l; i++) {
      _item = this.menu.menuItems[i];
      if (_item != this && _item.leaf) {
        _item.leaf.hide();
      } else if (_item == this) {
        _index = i;
      }
    }
    if (this.leaf) {
      this.leaf.rect.left = this.menu.rect.left + this.menu.rect.width +
        this.menu._menuDefaults.menuOffset;
      this.leaf.rect.top = this.menu.rect.top +
        (_index * this.menu._menuDefaults.itemHeight);
        
      this.leaf.setStyle("left", this.leaf.rect.left + "px");
      this.leaf.setStyle("top", this.leaf.rect.top + "px");
      this.leaf.bringToFront();
      this.leaf.show();
    }
  },
/** method: addItem
  * 
  * Adds an item to the menu list at index - or, if no index is mentioned, to
  * the end of the list.
  * If a submenu is specified rather than an item, addItem() constructs a
  * controlling HMenuItem for the submenu and adds the item to the menu.
  * 
  * Parameters:
  *   _item - A [HMenuItem] object.
  *   _index - The index of the item, its ordinal position in the menu. Indices
  *     begin at 0.
  **/  
  addItem: function(_item, _index) {
    if (_item.type == "[HMenu]") {
      var _menu = _item;
      // we down't want the submenu open
      _menu.hide();
      _item = new HMenuItem(new HRect(0, 0, 0, 0), this, _item.options);
      // super item for menu removal
      _menu.superitem = _item;
      // this sets the sub menu
      _item._setLeaf(_menu);
    } else {
      // sets menuitem's parent menu
      _item.menu = this;
      if (_index !== undefined) {
        this.menuItems.splice(_index, 0, _item);
      } else {
        this.menuItems.push(_item);
      }
    }
    _item.focus = this._itemFocus;
    
    if (this.valueMatrix) {
      this._setValueMatrix(_item);
    }
    // TODO: This call shouldn't be made when the menu hasn't been drawn the
    // first time yet. But somehow that breaks the menu bar, so it's left like
    // this for now.
    this.draw();
  },
  
  
  hideMenu: function() {
    // closes whole menu structure
    var _menu = this;
    while (_menu.superitem) {
      // down't hide menubar and make it not clicked
      if (_menu.superitem.menu.type == "[HMenuBar]") {
        _menu.superitem.menu._clicked = false;
        break;
      }
      _menu = _menu.superitem.menu;
    }
    _menu.hide();
  },
  
/** method: removeItem
  * 
  * Removes the item at index, or the specified item, or the item that controls
  * the specified submenu. Removing the item doesn't free it.
  * 
  * Parameters:
  *   _obj - The index of the item, A [HMenuItem] or a [HMenu] object.
  *
 * Returns:
  *   If passed an index, this function returns a pointer to the item so you can
  *     free it. It returns a NULL pointer if the item couldn't be removed.
  *   If passed an item, it returns true if the item was in the list and could
  *     be removed, and false if not.
  *   If passed a submenu, it returns true if the submenu is controlled by an
  *     item in the menu and that item could be removed, and false otherwise.
  *
  **/ 
  removeItem: function(_obj) {
    if (typeof _obj == "number") {
      var _item = this.menuItems[_obj];
      if (_item) {
        return (this.removeItem(_item)) ? _item : null;
      } else {
        return null;
      }
    } else if (_obj.type == "[HMenuItem]") {
      var _index = this.menuItems.indexOf(_obj);
      if (_index >= 0) {
        var _item = this.menuItems[_index];
        // unbind event handlers
        _item.focus = undefined;
        _item.menu = undefined;
        // valuematrix ???
        this.menuItems.splice(_index, 1);
        this.draw();
        return true;
      } else {
        return false;
      }
    } else if (_obj.type == "[HMenu]") {
      if (_obj.superitem) {
        return _obj.superitem.menu.removeItem(_obj.superitem);
      } else {
        return false;
      }
    }
  },
  
  // Private method.
  _arrangeMenuItems: function() {
    this.totalHeight = 0;
    var i, _item, l = this.menuItems.length;
    for (i = 0; i < l; i++) {
      var _item = this.menuItems[i];
      _item.rect.set(
        0,
        this.totalHeight,
        100,
        this.totalHeight + this._menuDefaults.itemHeight
      );
      this.totalHeight = this.totalHeight + this._menuDefaults.itemHeight;
      _item.draw();
    }
    // sets maximum string width
    var _maxWidth = 0;
    for (i = 0; i < l; i++) {
      var _item = this.menuItems[i];
      var _width = _item.stringWidth(_item.label)
      if (_width > _maxWidth) {
        _maxWidth = _width;
      }
    }
    for (i = 0; i < l; i++) {
      var _item = this.menuItems[i];
      _item.rect.setWidth(_maxWidth);
      _item.drawRect();
    }
    
    this.rect.set(
      this.rect.left,
      this.rect.top,
      this.rect.left + _maxWidth,
      this.rect.top + this.totalHeight
    );
  },
  
/** method: setRadioMode
  * 
  * Puts the HMenu in radio mode if flag is true and takes it out of radio mode
  * if flag is false.
  * In radio mode, only one item in the menu can be marked at a time.
  * If the user selects an item, a check mark is placed in front of it
  * automatically (you don't need to call HMenuItem's setMarked() function; it's
  * called for you).
  * If another item was marked at the time, its mark is removed.
  * Selecting a currently marked item retains the mark.
  * 
  * Parameters:
  *   _value - A numeric value to be set to the object.
  *
  * See also:
  *  <HControl.setValue>
  **/  
  setRadioMode: function(_mode, _valueObj) {
    this.radioMode = _mode;
    if(_mode) {
      this.valueMatrix = new HValueMatrix( );
      _valueObj = (_valueObj || new HValue('menuDummy' + this.elemId, -1));
      _valueObj.bind(this.valueMatrix);
      _valueObj.bind(this);
      var i, _item, l = this.menuItems.length;
      for (i = 0; i < l; i++) {
        var _item = this.menuItems[i];
        this._setValueMatrix(_item);
      }
    }
  },
  
  // Private method.
  _setValueMatrix: function(_item) {
    if (_item.type == "[HMenuItem]" && !_item.leaf) {
      // HMenuItemValue is defined in HMenuItem
      _item.setValueMatrix(this.valueMatrix);
    }
  },
  
  
/** method: indexOfItem
  * 
  * Returns the index of the given menu item in this menu.
  * 
  * Parameters:
  *   _item - The <HMenuItem> object that is being looked up.
  * 
  * Returns:
  *   The index of the location of _item. -1 is returned if the _item is not
  *   found in the menu.
  * 
  */
  indexOfItem: function(_item) {
    return this.menuItems.indexOf(_item);
  },
  
/** event: mouseUpOnMenuItem
  * 
  * This gets called whenever the mouseUp event occurs in a menu item added to
  * this menu.
  * 
  **/
  mouseUpOnMenuItem: function(_item) {
    this.hideMenu();
  }

});/*** class: HMenuBar
  **
  ** A HMenuBar is a menu that can stand at the root of a menu hierarchy.
  ** Typically, the root menu is the menu bar that's drawn across the top of the
  ** window.
  ** It's from this use that the class gets its name.
  ** 
  **
  ** vars: Instance variables
  **  type - '[HMenuBar]'
  **  value - Numeric value currently set to this object.
  **  label - The string that is shown as the label of this object.
  **
  ** Extends:
  **  <HControl>
  **
  ** See also:
  **  <HControl>
  ***/
HMenuBar = HControl.extend({
  
  packageName:   "menus",
  componentName: "menubar",

/** constructor: constructor
  *
  * Parameters:
  *   _rect - An <HRect> object that sets the position and dimensions of this
  *     control.
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
    
    this.type = '[HMenuBar]';
    
    // When this is true, the component is always drawn with the theme that was
    // active at the creation of the component, not the current theme.
    this.preserveTheme = true;
    
    this.menuItems = [];
    this._menuDefaults = {
      itemWidth: 100,
      itemHeight: 21
    };
    this.setMouseDown(true);
    this.totalWidth = 0;
    
    this._clicked = false;
    
    if(!this.isinherited) {
      this.draw();
    }
  },
  
  draw: function() {
    if (!this.drawn) {
      this.drawRect();
      this.drawMarkup();
      this.drawn = true;
    }
    this.arrangeMenuItems();
    this.drawRect();
  },
  
  hide: function() {
    var i, _item, l = this.menuItems.length;
    for (i = 0; i < l; i++) {
      _item = this.menuItems[i];
      if (_item != this && _item.leaf) {
        _item.leaf.hide();
      }
    }
    this.base();
  },
  
  // Private method.
  _itemFocus: function() {
    if (this.menu._clicked == false) {
      return;
    }
    var i, _item, l = this.menu.menuItems.length;
    var _index;
    // hide others and show curren item
    for (i = 0; i < l; i++) {
      _item = this.menu.menuItems[i];
      if (_item != this && _item.leaf) {
        _item.leaf.hide();
      } else if (_item == this) {
        _index = i;
      }
    }
    if (this.leaf) {
      var _width = 0;
      for (i = 0; i < _index; i++) {
        _width += this.menu.menuItems[i].rect.width;
      }      
      this.leaf.rect.left = this.menu.pageX() + _width;
      this.leaf.rect.top = this.menu.pageY() +
        this.menu._menuDefaults.itemHeight;
      
      this.leaf.setStyle("left", this.leaf.rect.left + "px");
      this.leaf.setStyle("top", this.leaf.rect.top + "px");
      this.leaf.bringToFront();
      this.leaf.show();
    }
  },
  
  // Private method.
  _itemDown: function() {
    if (this.leaf) {
      if (this.menu._clicked == false) {
        var _width = 0;
        for (i = 0; i < this.menu.menuItems.length; i++) {
          if (this.menu.menuItems[i] == this) {
            break;
          }
          _width += this.menu.menuItems[i].rect.width;
        }
        this.leaf.rect.left = this.menu.pageX() + _width;
        this.leaf.rect.top = this.menu.pageY() +
          this.menu._menuDefaults.itemHeight;
        
        this.leaf.setStyle("left", this.leaf.rect.left + "px");
        this.leaf.setStyle("top", this.leaf.rect.top + "px");
        this.leaf.bringToFront();
        this.leaf.show();
      } else {
        this.leaf.hide();
      }
    }
     if (this.menu._clicked == false) {
      this.menu._clicked = true;
    } else {
      this.menu._clicked = false;
    }
  },
  
/** method: addItem
  * 
  * Adds an item to the menu list at index - or, if no index is mentioned, to
  * the end of the list.
  * If a submenu is specified rather than an item, addItem() constructs a
  * controlling HMenuItem for the submenu and adds the item to the menu.
  * 
  * Parameters:
  *   _item - A [HMenuItem] object.
  *   _index - The index of the item, its ordinal position in the menu. Indices
  *     begin at 0.
  **/
  addItem: function(_item, _index) {
    if (_item.type == "[HMenu]") {
      var _menu = _item;
      // we down't want the submenu open
      _menu.hide();
      _item = new HMenuItem(new HRect(0, 0, 100, 48), this, _item.options);
      // super item for menu removal
      _menu.superitem = _item;
      // this sets the sub menu
      _item._setLeaf(_menu);
    } else {
      // sets menuitem's parent menu
      _item.menu = this;
      if (_index !== undefined) {
        this.menuItems.splice(_index, 0, _item);
      } else {
        this.menuItems.push(_item);
      }
    }
    
    _item.focus = this._itemFocus;
    _item.setMouseDown(true);
    _item.mouseDown = this._itemDown;
    this.draw();
  },
  
/** method: removeItem
  * 
  * Removes the item at index, or the specified item, or the item that controls
  * the specified submenu. Removing the item doesn't free it.
  * 
  * Parameters:
  *   _obj - The index of the item, A [HMenuItem] or a [HMenu] object.
  *
  * Returns:
  *   If passed an index, this function returns a pointer to the item so you can
  *     free it. It returns a NULL pointer if the item couldn't be removed.
  *   If passed an item, it returns true if the item was in the list and could
  *     be removed, and false if not.
  *   If passed a submenu, it returns true if the submenu is controlled by an
  *     item in the menu and that item could be removed, and false otherwise.
  *
  **/ 
  removeItem: function(_obj) {
    if (typeof _obj == "number") {
      var _item = this.menuItems[_obj];
      if (_item) {
        return (this.removeItem(_item)) ? _item : null;
      } else {
        return null;
      }
    } else if (_obj.type == "[HMenuItem]") {
      var _index = this.menuItems.indexOf(_obj);
      if (_index >= 0) {
        var _item = this.menuItems[_index];
        _item.die();
        // unbind event handlers
        _item.focus = undefined;
        _item.menu = undefined;
        // valuematrix ???
        this.menuItems.splice(_index, 1);
        this.draw();
        
        return true;
      } else {
        return false;
      }
    } else if (_obj.type == "[HMenu]") {
      if (_obj.superitem) {
        return _obj.superitem.menu.removeItem(_obj.superitem);
      } else {
        return false;
      }
    }
  },
  
  arrangeMenuItems: function() {
    this.totalWidth = 0;
    
    var i, l = this.menuItems.length;
    
    for (i = 0; i < l; i++) {
      var _menuItem = this.menuItems[i];
      var _menuItemRectLeft = this.totalWidth;
      var _menuItemRectRight = this.totalWidth + this._menuDefaults.itemWidth;
      var _menuItemRectBottom = this._menuDefaults.itemHeight;
      
      _menuItem.setRect(new HRect(
        _menuItemRectLeft,
        0,
        _menuItemRectRight,
        _menuItemRectBottom
      ));
        
      this.totalWidth = this.totalWidth + this._menuDefaults.itemWidth;
      _menuItem.draw();
    }
    
    // Set the maximum string width:
    var _stringWidth = 0, _itemWidth = 0;
    for (i = 0; i < l; i++) {
      var _menuItem = this.menuItems[i];
      _stringWidth = _menuItem.stringWidth(_menuItem.label);
      _menuItem.rect.setLeft(_itemWidth);
      _itemWidth += _stringWidth;
      _menuItem.rect.setWidth(_stringWidth);
      _menuItem.drawRect();
    }
    
    // Set the right and bottom sides of the rectangle and redraws it:
    var _right = this.rect.left + _itemWidth;
    this.rect.setRight(_right);
    
    var _bottom = this.rect.top + this._menuDefaults.itemHeight;
    this.rect.setBottom(_bottom);
    
    this.drawRect();
  }
  
});
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


/*** class: HPopupMenu
  **
  ** HPopupMenu is a control unit that represents a menu typically used in isolation, 
  ** rather than as part of an extensive menu hierarchy. 
  ** By default, it operates in radio mode - the last item selected by the user, 
  ** and only that item, is marked in the menu.
  **
  ** vars: Instance variables
  **  type - '[HPopupMenu]'
  **  value - Numeric value currently set to this object.
  **  label - The string that is shown as the label of this object.
  **  selectedIndex - The index of the currently selected menu item. Negative
  **    number if nothing is selected.
  **  selectedItem - The menu item that is currently selected. A null value if
  **    nothing is selected.
  **  owner - A reference to the object that is set as the owner of this menu.
  **
  ** Extends:
  **  <HMenu>
  **
  ** See also:
  **  <HControl> <HMenu>
  ***/
HPopupMenu = HMenu.extend({
  
  packageName:   "menus",
  componentName: "popupmenu",

/** constructor: constructor
  *
  * Parameters:
  *   _rect - An <HRect> object that sets the position and dimensions of this control.
  *   _parentClass - The parent view that this control is to be inserted in.
  *   _options - (optional) All other parameters. See <HComponentDefaults>.
  **/
  constructor: function(_rect, _parentClass, _options) {
    if (!_options) {
      _options = {};
    }

    if(this.isinherited) {
      this.base(_rect, _parentClass, _options);
    }
    else {
      this.isinherited = true;
      this.base(_rect, _parentClass, _options);
      this.isinherited = false;
    }
    
    this.type = '[HPopupMenu]';
    
    // When this is true, the component is always drawn with the theme that was
    // active at the creation of the component, not the current theme.
    this.preserveTheme = true;
    
    this.selectedIndex = -1;
    this.selectedItem = null;
    this.owner = null;
    
    if(!this.isinherited) {
      this.draw();
    }
    
    
    
    // Initial item list can be passed in as an array named 'choices', for
    // example:
    // 
    // ... {choices: [{
    //        value: 123,
    //        enabled: true,
    //        label: "Test 1-2-3"
    //      },{
    //        ...
    //      }
    //     ]}
    if (_options.choices instanceof Array) {
      for (var i = 0; i < _options.choices.length; i++) {
        
        var _item = _options.choices[i];
        if (null === _item.enabled || undefined === _item.enabled) {
          _item.enabled = true;
        }
        
        var _newMenuItem = new HMenuItem(
          new HRect(0,0,0,18),
          this, {
            label: _item.label,
            value: _item.value,
            enabled: _item.enabled
          }
        );
        
        /* if (_item.checked) {
          _newMenuItem.setMarked(true);
        } */
        
      }
    }
    
  },
  
  
  // Private method.
  // Updates the button or the text field that displays the selection to the
  // user. This gets called whenever the selection on this menu changes.
  _updateSelection: function(_menuitem) {
    var _newLabel;
    if (!_menuitem) {
      _newLabel = "";
    }
    else {
      _newLabel = _menuitem.label;
    }
    
    if (this.popupbutton.type == "[HPopupButton]") {
      this.popupbutton.setLabel(_newLabel);
    } else if (this.popupbutton.type == "[HTextControl]") {
      this.popupbutton.setValue(_newLabel);
    }
    
    if (!this.radioMode) {
      this.setValue(_menuitem.value);
    }
    
  },
  
  
/** method: setOwner
  * 
  * Sets the owner object of this pop-up menu. The owner receives notification
  * from the menu when the selection changes on it. Usually this should not be
  * called by the user, as this is in most cases called by the owner component.
  * 
  * Parameters:
  *   _owner - The object that owns this pop-up menu.
  * 
  **/  
  setOwner: function(_owner) {
    this.owner = _owner;
  },
  
  
/** method: selectItem
  * 
  * Selects the given menu item in this pop-up menu.
  * 
  * Parameters:
  *   _item - A reference to a <HMenuItem> object that should be selected.
  **/  
  selectItem: function(_item) {
    this.selectedItem = _item;
    var _index = this.menuItems.indexOf(_item);
    this.selectItemAtIndex(_index);
  },
  
  
/** method: selectItemAtIndex
  * 
  * Selects a menu item that is placed in the given index in this pop-up menu.
  * 
  * Parameters:
  *   _index - The index of the menu item that should be selected.
  **/  
  selectItemAtIndex: function(_index) {
    if (_index != this.selectedIndex) {
      this.selectedIndex = _index;
      // if (_index >= 0 && _index < this.menuItems.length) {
        this._updateSelection(this.menuItems[_index]);
      // }
      this.selectedIndexChanged();
    }
  },
  
  
/** method: selectedIndexChanged
  * 
  * Informs the owner object of changes in the selection on the pop-up menu.
  * This method is called automatically by the HPopupMenu object.
  * 
  **/
  selectedIndexChanged: function() {
    if (this.owner && this.owner.selectedIndexChanged) {
      this.owner.selectedIndexChanged();
    }
  },
  
  
/** event: mouseUpOnMenuItem
  * 
  * This gets called whenever the mouseUp event occurs in a menu item added to
  * this pop up menu.
  * 
  **/
  mouseUpOnMenuItem: function(_item) {
    this.selectItem(_item);
    // this is also called from menu hideMenu
    this.hide();
  },
  
  
  setValue: function(_value) {
    this.base(_value);
    if (this.owner) {
      this.owner.setValue(_value);
    }
  }
  
});

// Alias for backwards-compatibility:
HPopUpMenu = HPopupMenu;

/*** class: HComboBox
  **
  ** HComboBox is a control unit that is a combination of a pop-up-menu, 
  ** a single-line textfield (textcontrol) and a combobox button. 
  ** A combobox allows the user type a value in the text field or 
  ** click on the button (displays a drop-down list of non-editable options) and
  ** choose one of the several options. 
  **
  ** vars: Instance variables
  **  type - '[HComboBox]'
  **  value - Numeric value currently set to this object.
  **  label - The string that is shown as the label of this object.
  **  popupMenu - A reference to the menu object that holds the items of this
  **    combo box.
  **  textControl - A reference to the text control of this combo box.
  **  comboBoxButton - A reference to the button that opens the pop-up menu.
  **
  ** Extends:
  **  <HControl>
  **
  ** See also:
  **  <HControl> <HTextControl> <HPopupMenu> <HComboBoxButton>
  ***/
HComboBox = HControl.extend({
  
  packageName:   "menus",
  componentName: "combobox",

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
    
    this.type = '[HComboBox]';
    
    // When this is true, the component is always drawn with the theme that was
    // active at the creation of the component, not the current theme.
    this.preserveTheme = true;
    
    
    this._initialized = false;
    this.setMouseDown(true);
    this.popupMenu = new HPopupMenu(
      new HRect(this.rect.left, this.rect.top + this.rect.height, 220, 200),
      this.app
    );
    this.popupMenu.setOwner(this);
    
    if(!this.isinherited) {
      this.draw();
    }
  },
  
  
/** method: die
  *
  * Destroys the pop-up menu before destroying the combo box.
  *
  * See also:
  *  <HControl.die>
  **/
  die: function() {
    // Text field and combo box button are placed inside the combo box
    // container. They don't need to be deleted explicitly in the die method.
    if (this.popupMenu) {
      this.popupMenu.die();
    }
    this.base();
  },
  
  
/** method: draw
  * 
  * Draws the rectangle and the markup of this object on the screen.
  *
  * See also:
  *  <HView.draw>
  **/
  draw: function() {
    if(!this.drawn) {
      this.drawRect();
      if(!this._initialized) {
        
        this.textControl = new HTextControl(
          this._rectForTextControl(),
          this, {
            value:"",
            enabled: this.enabled
          }
        );
      
        this.comboBoxButton = new HComboBoxButton(
          this._rectForComboBoxButton(),
          this, {
            label:"",
            enabled: this.enabled,
            popupMenu:this.popupMenu,
            textControl:this.textControl}
        );
      
        this._initialized = true;
      }
      this.drawn = true;
    } else {
      this.drawRect();
    }
  },
  
  
  // Private method. Returns a rectangle for the text control that fits the
  // current size of the combo box.
  _rectForTextControl: function() {
    var _right = this.rect.width - this.rect.height;
    return new HRect(0, 0, _right, this.rect.height);
  },
  
  
  // Private method. Returns a rectangle for the combo box button that fits the
  // current size of the combo box.
  _rectForComboBoxButton: function() {
    var _left = this.rect.width - this.rect.height;
    return new HRect(_left, 0, this.rect.width, this.rect.height);
  },
  
  
  drawRect: function() {
    this.base();
    
    // Resize the child elements also.
    if(this._initialized) {
      this.textControl.setRect(this._rectForTextControl());
      this.comboBoxButton.setRect(this._rectForComboBoxButton());
    }
  },
  
  
/** method: addItem
  * 
  * Adds an item to the combobox list at index - or, if no index is mentioned, to the end of the list.
  * 
  * Parameters:
  *   _label - A String object.
  *   _index - The index of the item, its ordinal position in the combobox. Indices begin at 0.
  **/  
  addItem: function(_label, _index) {
    new HMenuItem(
      new HRect(0, 0, 100, 18),
      this.popupMenu,
      {label:_label,
      index:_index}
    );
  },
/** method: removeItem
  * 
  * The index of the object to remove. All items beyond index are moved up one slot to fill the gap.
  * 
  * Parameters:
  *   _index - The index of the item, its ordinal position in the combobox. Indices begin at 0.
  **/  
  removeItem: function(_index) {
    this.popupMenu.removeItem(_index);
  },
  
/** method: selectItem
  * 
  * Selects the given menu item in this combo box.
  * 
  * Parameters:
  *   _item - A reference to a <HMenuItem> object that should be selected.
  * 
  * See also:
  *   <HPopupMenu.selectItem>
  **/  
  selectItem: function(_item) {
    this.popupMenu.selectItem(_item);
  },
  
  
/** method: selectItemAtIndex
  * 
  * Selects a menu item that is placed in the given index in this combo box.
  * 
  * Parameters:
  *   _index - The index of the menu item that should be selected.
  * 
  * See also:
  *   <HPopupMenu.selectItemAtIndex>
  **/  
  selectItemAtIndex: function(_index) {
    this.popupMenu.selectItemAtIndex(_index);
  },
  
  
/** method: selectedIndex
  * 
  * Returns the currently selected item's index.
  * 
  * Returns:
  *   The index of the menu item that is currently selected. A negative number
  *   is returned if nothing is selected.
  **/  
  selectedIndex: function() {
    return this.popupMenu.selectedIndex;
  },
  
  
/** method: selectedItem
  * 
  * Returns the currently selected menu item. It is an instance of <HMenuItem>.
  * 
  * Returns:
  *   The menu item that is currently selected. A null value is returned if
  *   nothing is selected.
  **/  
  selectedItem: function() {
    return this.popupMenu.selectedItem;
  },
  
  
/** method: selectedIndexChanged
  * 
  * Implemented by derived classes to do whatever they please when the selection
  * on the combo box's pop-up menu changes.
  * 
  * See also:
  *   <HPopupMenu.selectedIndexChanged>
  **/
  selectedIndexChanged: function() {
    // Implement this in extended classes that wish to receive a notification
    // when the selection in the menu changes.
  }
  
});

/*** class: HComboBoxButton
  **
  ** A HComboBoxButton object displays a labeled pop-up menu.
  ** Used in conjuction with HComboBox.
  **
  ** vars: Instance variables
  **  type - '[HComboBoxButton]'
  **  value - Numeric value currently set to this object.
  **  label - The string that is shown as the label of this object.
  **
  ** Extends:
  **  <HButton>
  **
  ** See also:
  **  <HButton>
  ***/
HComboBoxButton = HButton.extend({
  
  packageName:   "menus",
  componentName: "comboboxbutton",

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
  *   textControl - An <HTextControl>
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
    
    this.type = '[HComboBoxButton]';
    
    // To help extension:
    this._tmplLabelPrefix = "comboboxbuttonlabel";
    
    if (_options.popupMenu) {
      this.popupmenu = _options.popupMenu;
      this.popupmenu.popupbutton = _options.textControl;
      this.popupmenu.textcontrol = this;
      this.popupmenu.hide();
    }
    this.setMouseDown(true);
    
    if(!this.isinherited) {
      this.draw();
    }
  },


/** event: mouseDown
  * 
  * Shows and hides the pop-up menu of the combo box.
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
      
      this.popupmenu.rect.left = this.parent.pageX();
      this.popupmenu.rect.top = this.parent.pageY() +
        this.parent.rect.height;
      this.popupmenu.rect.right = this.popupmenu.rect.left +
        this.popupmenu.rect.width;
      this.popupmenu.rect.bottom = this.popupmenu.rect.top +
        this.popupmenu.rect.height;
        
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
  }
  
});

