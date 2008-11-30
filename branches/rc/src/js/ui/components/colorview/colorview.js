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

/*** class: HColorView
  **
  ** HColorView is a simple box component that display its <HColorValue> as the 
  ** color of the box.
  ** Its default usage model is to specify an function reference with <setAction>.
  ** That function will be called with the <HColorValue> bound to the HColorView
  ** whenever the HColorView is clicked.
  **
  ** Extends:
  **  <HControl>
  ***/
HColorView = HControl.extend({
  
  componentName: "colorview",	
  
  constructor: function(_rect,_parentClass,_options) {
    if(!_options){
      _options = {};
    }
    if(!_options.events){
      _options.events = {
        mouseDown: true
      }
    }
    if(this.isinherited){
      this.base(_rect,_parentClass,_options);
    }
    else {
      this.isinherited = true;
      this.base(_rect,_parentClass,_options);
      this.isinherited = false;
    }
    
    this.type = '[HColorView]';
    this.preserveTheme = true;
    
    if(!this.isinherited){
      this.draw();
    }
  },

  draw: function() {
    this.drawRect();
    if(!this.drawn){
      this.drawMarkup();
      this.drawn = true;
    }
  },

/** event: mouseDown
  *
  * Call the action of the component with the valueObj as an parameter.
  * The purpose is to give the selected color to a function that actually does 
  * something with it.
  * The receiving action could be, for example, a setValueObj method of a component 
  * that handles colors.
  *
  * See also:
  *  <HControl.action> <HControl.setAction>
  *
  **/
  mouseDown: function(_x,_y,_rightButton){
    if(this.action){
      this.action(this.valueObj);
    }
  },
  
/** method: setValue
  *
  * If a <HColorValue> object is given as the value, the background is set accordingly.
  *
  **/
  setValue: function(_colorArr){
    this.base(_colorArr);
    if(this.valueObj instanceof HColorValue){
      this.setStyle('background-color',this.valueObj.toHexString());
    }
  }
});


// Alias for backwards-compatibility
HColorSwatchItem = HColorView;



