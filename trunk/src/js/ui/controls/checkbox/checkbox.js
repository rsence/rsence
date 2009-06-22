/***
  ** Riassence Core -- http://rsence.org/
  **
  ** Copyright (C) 2008 Juha-Jarmo Heinonen <jjh@riassence.com>
  **
  ** This file is part of Riassence Core.
  **
  ** Riassence Core is free software: you can redistribute it and/or modify
  ** it under the terms of the GNU General Public License as published by
  ** the Free Software Foundation, either version 3 of the License, or
  ** (at your option) any later version.
  **
  ** Riassence Core is distributed in the hope that it will be useful,
  ** but WITHOUT ANY WARRANTY; without even the implied warranty of
  ** MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  ** GNU General Public License for more details.
  **
  ** You should have received a copy of the GNU General Public License
  ** along with this program.  If not, see <http://www.gnu.org/licenses/>.
  **
  ***/

/** class: HCheckbox
  *
  * Simple checkbox component, toggles the value of
  * itself between true and false.
  *
  * Extends:
  *  <HButton>
  *
  * See Also:
  *  <HButton> <HControl> <HView>
  *
  **/
HCheckbox = HButton.extend({
  componentName: 'checkbox',
  constructor: function(_rect,_parent,_options){
    this.base(_rect,_parent,_options);
    this.setClickable(true);
  },
  
  // Toggles the value:
  click: function(){
    this.setValue(!this.value);
  },
  
  setStyle: function(_name,_value,_bypass){
    this.setStyleOfPart('label',_name,_value,_bypass);
  },
  
  // Toggles the checked/unchecked css-class status
  // according to the trueness of the value.
  refreshValue: function(){
    if(this.markupElemIds.control){
      if(this.value){
        this.toggleCSSClass(this.markupElemIds.control, 'checked', true);
        this.toggleCSSClass(this.markupElemIds.control, 'unchecked', false);
      }
      else{
        this.toggleCSSClass(this.markupElemIds.control, 'checked', false);
        this.toggleCSSClass(this.markupElemIds.control, 'unchecked', true);
      }
    }
  }
});
// Alias for some users:
HCheckBox = HCheckbox;
