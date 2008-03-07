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

/** class: HTabBar
  *
  * HTabBar has no logic functionality at all.
  * Its sole purpose is to act as a themeable background for <HTabLabel>:s.
  * Use <HTabControl> as the interface, don't use HTabBar directly.
  *
  * vars: Instance variables
  *  type - '[HTabBar]'
  *
  * Extends:
  *  <HView>
  *
  * See Also:
  *  <HTabControl> <HTabLabel> <HTabView> <HView>
  *
  * NOTE:
  *  HTab -components are still evolving.
  *
  **/
HTabBar = HView.extend({
  
  packageName:   "tab",
  componentName: "tabbar",

/** constructor: constructor
  *
  * Basically just a passthrough for <HView.constructor> it only differs by
  * defining theme preservation and the instance type.
  *
  **/
  constructor: function(_rect, _parentClass) {
    
    if(this.isinherited){
      this.base(_rect, _parentClass);
    }
    else {
      this.isinherited = true;
      this.base(_rect, _parentClass);
      this.isinherited = false;
    }
    
    this.type = '[HTabBar]';
    
    // When this is true, the component is always drawn with the theme that was
    // active at the creation of the component, not the current theme.
    this.preserveTheme = true;
    
    if(!this.isinherited) {
      this.draw();
    }
  },
  
  draw: function() {
    if(!this.drawn) {
      this.drawRect();
      this.drawMarkup();
      this.drawn = true;
    }
    this.drawRect();
  }
  
});

