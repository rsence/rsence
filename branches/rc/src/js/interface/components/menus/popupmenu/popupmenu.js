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

