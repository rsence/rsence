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

/*** class: HRadiobutton
  **
  ** HRadiobutton is a control unit that allows the user to choose 
  ** one of a predefined set of options. Radio buttons can have two states, 
  ** selected and unselected. Radio buttons are arranged in groups of two or more units. 
  ** When the user selects a radio button, 
  ** any previously selected radio button in the same group becomes deselected. 
  ** Radio button view or theme can be changed; the helmiTheme is used by default.
  **
  ** vars: Instance variables
  **  type - '[HRadiobutton]'
  **  value - A boolean, true when the radiobutton is checked, false when it's not.
  **
  ** Extends:
  **  <HCheckbox>
  **
  ** See also:
  **  <HControl> <HCheckbox> <HToggleButton>
  ***/
HRadiobutton = HToggleButton.extend({
  
  componentName: "radiobutton",

/** constructor: constructor
  *
  * Parameters:
  *   _rect - An <HRect> object that sets the position and dimensions of this
  *           control.
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
    
    this.type = '[HRadiobutton]';
    
    if(!this.isinherited) {
      this.draw();
    }
  },

/** method: setValueMatrix
  *
  * Sets the component as a member of a value matrix.
  *
  * See also:
  *  <HValueMatrix>
  **/
  setValueMatrix: function(_aValueMatrix){
    this.valueMatrix = _aValueMatrix;
    this.valueMatrixIndex = this.valueMatrix.addValue(this.valueObj,this.value);
  },

/** method: click
  * 
  * Called when the user clicks the mouse button on this object.
  *
  * Parameters:
  *  _x - The horizonal coordinate units (px) of the mouse cursor position.
  *  _y - The vertical coordinate units (px) of the mouse cursor position.
  *  _leftButton - Flag, is false when the right mouse button was pressed. *Do
  *                not rely on it*
  *
  * See also:
  *  <HControl.mouseDown>
  **/
  click: function(x, y, _leftButton) {
    this.base(x, y, _leftButton);
    if (undefined !== this.valueMatrix && this.valueMatrix instanceof HValueMatrix) {
      this.valueMatrix.setValue( this.valueMatrixIndex );
    }
  }
  
});

// Backwards compatibility
HRadioButton = HRadiobutton;
