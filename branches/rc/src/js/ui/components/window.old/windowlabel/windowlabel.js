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

/** class: HWindowLabel
  *
  * HWindowLabel responds to drag passthrough drag events and is responsible for displaying the label of the <HWindowBar>.
  *
  * It's also used to show the themeable background for the content area of windows.
  * Use <HWindowControl> as the interface, don't use the HWindowLabel directly.
  *
  * vars: Instance variables
  *  type - '[HWindowLabel]'
  *
  * Extends:
  *  <HButton>
  *
  * See Also:
  *  <HWindowControl> <HWindowView> <HWindowBar> <HButton>
  *
  * NOTE:
  *  HWindow -components are still evolving.
  *
  **/
HWindowLabel = HButton.extend({
  
  packageName:   "window",
  componentName: "windowlabel",

/** constructor: constructor
  *
  * Basically just a passthrough for <HButton.constructor> it only differs by making sure drag events are registered.
  * Nothing special, constructed by <HWindowControl>
  *
  **/
  constructor: function(_rect,_parentClass,_options) {
    
    // Check the existence of _options
    if(!_options){
      _options={};
    }
    if(!_options.events){
      _options.events = {};
    }
    // Make sure the draggable event is set.
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
    
    this.type = '[HWindowLabel]';
    
    if(!this.isinherited){
      this.draw();
    }
  },
  
 /** 
   * Sets the windowcontrol activated when the windowbar/label gets activated
   *
   **/  
  gainedActiveStatus: function(_lastActiveControl) {
    EVENT.changeActiveControl(this.parent.parent);  
  },
  
  
/** event: startDrag
  *
  * Just a passthrough to <HWindowControl.startDrag>
  *
  **/
  startDrag: function(_x, _y){
    this.parent.parent.startDrag(_x, _y);
  },
 
/** event: doDrag
  *
  * Just a passthrough to <HWindowControl.doDrag>
  *
  **/
  doDrag: function(_x, _y){
    this.parent.parent.doDrag(_x, _y);
  },
  
/** event: endDrag
  *
  * Just a passthrough to <HWindowControl.endDrag>
  *
  **/
  endDrag: function(_x, _y){
    this.parent.parent.endDrag(_x, _y);
  }
  
});


