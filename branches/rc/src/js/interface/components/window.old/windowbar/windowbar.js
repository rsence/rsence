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

/** class: HWindowBar
  *
  * HWindowBar responds to drag passthrough drag events and is responsible for 
  * displaying the <HWindowLabel> and misc window header stuff, like close, zoom and
  * minimize buttons.
  *
  * It's also used to show the themeable background for the title/header area of windows.
  * Use <HWindowControl> as the interface, don't use the HWindowBar directly.
  *
  * vars: Instance variables
  *  type - '[HWindowBar]'
  *
  * Extends:
  *  <HButton>
  *
  * See Also:
  *  <HWindowControl> <HWindowView> <HWindowLabel> <HButton>
  *
  * NOTE:
  *  HWindow -components are still evolving.
  *
  **/
HWindowBar = HButton.extend({
  
  packageName:   "window",
  componentName: "windowbar",

/** constructor: constructor
  *
  * Basically just a passthrough for <HButton.constructor> it only differs by making sure drag events are registered.
  * Nothing special, constructed by <HWindowControl>
  *
  **/
  constructor: function(_rect,_parentClass,_options) {
    // test if draggability is needed
    if(!_options){
      _options={};
    }
    if(!_options.events){
      _options.events = {};
    }
    if(!_options.events.draggable){
      _options.events.draggable=true;
    }
    
    if(this.isinherited){
      this.base(_rect,_parentClass,_options);
    }
    else {
      this.isinherited = true;
      this.base(_rect,_parentClass,_options);
      this.isinherited = false;
    }
    
    this.type = '[HWindowBar]';
    
    if(!this.isinherited){
      this.draw();
    }
  },
  /**
    * Forwards setLabel to this.parent.windowLabel
    */
  setLabel: function(_label) {
    this.label = _label;
    if(this.parent.windowLabel) {
      this.parent.windowLabel.setLabel(_label);
    }
  },
  
  startDrag: function(_x, _y){
    this.parent.startDrag(_x, _y);
  },
 
  doDrag: function(_x, _y){
    this.parent.doDrag(_x, _y);
  },
  
  endDrag: function(_x, _y){
    this.parent.endDrag(_x, _y);
  }
});


