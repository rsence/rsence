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

