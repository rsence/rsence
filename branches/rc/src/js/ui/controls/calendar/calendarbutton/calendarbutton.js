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

HCalendarButton = HControl.extend({
  
  packageName:   "calendar",
  componentName: "calendarbutton",

  constructor: function(_rect,_parentClass,_options) {
    if(this.isinherited){
      this.base(_rect,_parentClass,_options);
    }
    else {
      this.isinherited = true;
      this.base(_rect,_parentClass,_options);
      this.isinherited = false;
    }
    
    this.type = '[HCalendarButton]';
    
    this._tmplLabelPrefix = "calendarbuttonlabel";
    
    this.setMouseDown(true);
    this.setKeyDown(true);
    
    if(!this.isinherited){
      this.draw();
    }
  },
  
  keyDown: function(_keycode) {
    this.parent.keyDown(_keycode);
  },
  
  
  // Private method.
  _updateCheckBoxImage: function(){
    // Sets the checkbox background image
    if (this.value == 0) {
      this.toggleCSSClass(ELEM.get(this._labelElementId),
        "shaded", false);
      this.toggleCSSClass(ELEM.get(this._labelElementId),
        HCalendarButton.cssOn, false);
      this.toggleCSSClass(ELEM.get(this._labelElementId),
        HCalendarButton.cssOff, true);
    } else if (this.value == 1) {
      this.toggleCSSClass(ELEM.get(this._labelElementId),
        "shaded", false);
      this.toggleCSSClass(ELEM.get(this._labelElementId),
        HCalendarButton.cssOn, true);
      this.toggleCSSClass(ELEM.get(this._labelElementId),
        HCalendarButton.cssOff, false);
    } else if (this.value == 2) {
      this.toggleCSSClass(ELEM.get(this._labelElementId),
        "shaded", true);
      this.toggleCSSClass(ELEM.get(this._labelElementId),
        HCalendarButton.cssOn, false);
      this.toggleCSSClass(ELEM.get(this._labelElementId),
        HCalendarButton.cssOff, false);
    }
    /*if(this.value){
      this.toggleCSSClass(elem_get(this._labelElementId),
        HCalendarButton.cssOn, true);
      this.toggleCSSClass(elem_get(this._labelElementId),
        HCalendarButton.cssOff, false);

    } else {
      this.toggleCSSClass(elem_get(this._labelElementId),
        HCalendarButton.cssOn, false);
      this.toggleCSSClass(elem_get(this._labelElementId),
        HCalendarButton.cssOff, true);
    }*/
  },
  
  
  // HControl seems to call refresh too.
  /* setValue: function(_value){
    this.base(_value);
    this.refresh();
  }, */
  
  // setValue calls refresh that calls _updateCheckBoxImage.
  /* onIdle: function(){
    this._updateCheckBoxImage();
    this.base();
  }, */
  
  
  draw: function() {
    if(!this.drawn){
      this.drawRect();
      this.drawMarkup();
      this.drawn = true;
    }
    this.refresh();
  },
  
  

  refresh: function() {
    if(this.drawn) {
      // Checks if this is the first refresh call:
      if(!this._labelElementId){
        // Gets the label element based on the id specified in constructor and template:
        this._labelElementId = ELEM.bindId(this._tmplLabelPrefix+this.elemId);
      }
      // Checks if we have a label element:
      if(this._labelElementId) {
        ELEM.setHTML(this._labelElementId,this.label);
        this._updateCheckBoxImage();
      }
      this.drawRect();
    }
  },
  setShaded: function(){
    this.value = 0;
  },
  setSelected: function(){
    
  },
  setNormal: function(){
    
  },
 
  mouseDown: function(_x,_y,_isLeftButton){
    this.parent.selectDay(this.index);
    //this.setValue(!this.value);
  }
  
},{

  // The name of the CSS class to be used when...
  
  // the item is selected.
  cssOn: "on",
  // the item not selected.
  cssOff: "off"
});

