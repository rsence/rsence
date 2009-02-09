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

/*** class: HMenuBar
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
