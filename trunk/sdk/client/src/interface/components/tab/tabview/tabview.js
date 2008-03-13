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

/** class: HTabView
  *
  * HTabBar has no logic functionality at all.
  * Its sole purpose is to act as a themeable background for the content area of
  * tabs. Use <HTabControl> as the interface, don't use HTabView directly.
  *
  * vars: Instance variables
  *  type - '[HTabView]'
  *
  * Extends:
  *  <HView>
  *
  * See Also:
  *  <HTabControl> <HTabLabel> <HTabBar> <HView>
  *
  * NOTE:
  *  HTab -components are still evolving.
  *
  **/
HTabView = HView.extend({
  
  packageName:   "tab",
  componentName: "tabview",

/** constructor: constructor
  *
  * Basically just a passthrough for <HView.constructor> it only differs by
  * defining theme preservation and the instance type.
  *
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
    
    this.type = '[HTabView]';
    
    // When this is true, the component is always drawn with the theme that was
    // active at the creation of the component, not the current theme.
    this.preserveTheme = true;
    
    
    if(!this.isinherited) {
      this.draw();
    }
  },
  
  
/** method: draw
  *
  * Nothing special, gets drawn by <HTabControl>
  **/
  draw: function() {
    if(!this.drawn){
      this.drawMarkup();
      // Bind the element from the HTML template.
      var _temp_id = this.bindDomElement( HTabView._tmplElementPrefix + this.elemId);
      
      if (!_temp_id) {
        throw("HTabView: The HTML template must have an element with " + "the ID '" + HTabView._tmplElementPrefix + " + this.elemId'.");
      }
      
      // Place the new element as this element's sibling.
      ELEM.append( _temp_id, this.parent.elemId );
      
      // Move the original element into the document body.
      ELEM.append(this.elemId, 0);
      
      // Delete the original element.
      ELEM.del(this.elemId);
      
      // Place the new element into the element cache in the same position as
      // the original element was in.
      //elem_replace(this.elemId, elem_get(_temp_id));
      this.elemId = _temp_id;
    }
    this.drawRect();
  }
  
},{
  _tmplElementPrefix: "tabview"
});
