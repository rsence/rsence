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

});

