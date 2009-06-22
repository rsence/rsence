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

/** class: HWindowView
  *
  * HWindowView has no logic functionality at except basic View management inherited from <HView>.
  *
  * Its sole purpose is to act as a themeable background for the content area of windows.
  * Use <HWindowControl> as the interface, don't use the HWindowView directly.
  *
  * vars: Instance variables
  *  type - '[HWindowView]'
  *
  * Extends:
  *  <HView>
  *
  * See Also:
  *  <HWindowControl> <HWindowLabel> <HWindowBar> <HView>
  *
  * NOTE:
  *  HWindow -components are still evolving.
  *
  **/
HWindowView = HView.extend({
  
  packageName:   "window",
  //componentName: "windowview",
  
  flexTop: true,
  flexLeft: true,
  flexRight: true,
  flexBottom: true,
  flexTopOffset: 24,
  flexLeftOffset: 4,
  flexRightOffset: 4,
  flexBottomOffset: 4,
  
  
/** constructor: constructor
  *
  * Basically just a passthrough for <HView.constructor> it only differs by defining theme
  * preservation and the instance type.
  * Nothing special, constructed by <HWindowControl>
  *
  **/
  constructor: function(_rect,_parentClass) {
    if(this.isinherited){
      this.base(_rect,_parentClass);
    }
    else {
      this.isinherited = true;
      this.base(_rect,_parentClass);
      this.isinherited = false;
    }
    
    this.type = '[HWindowView]';
    
    // When this is true, the component is always drawn with the theme that was
    // active at the creation of the component, not the current theme.
    this.preserveTheme = true;
    
    if(!this.isinherited){
      this.draw();
    }
  },
  
/** method: draw
  *
  * Nothing special, gets drawn by <HWindowControl>
  **/
  draw: function() {
    if(!this.drawn){
      
      //this.addResizeableElement(["windowview"+this.elemId,-2,-1])
      
      ELEM.setCSS( this.elemId, 'position:absolute;border:1px solid #ccc;border-top: 0;background-color: #f7f7f7;overflow:auto;' );
      
      //this.drawMarkup();
      
      // Bind the element from the HTML template.
      //var _temp_id = this.bindDomElement(HWindowView._tmplElementPrefix + this.elemId);
      
      //if (!_temp_id) {
      //  throw("HWindowView: The HTML template must have an element with " +
      //    "the ID '" + HWindowView._tmplElementPrefix + " + this.elemId'.");
      //}
      
      // Place the new element as this element's sibling.
      //elem_append(this.parent.elemId, _temp_id);
      
      // Move the original element into the document body.
      //elem_append(0, this.elemId);
      
      // Delete the original element.
      //elem_del(this.elemId);
      
      // Place the new element into the element cache in the same position as
      // the original element was in.
      //elem_replace(this.elemId, elem_get(_temp_id));
    }
    this.drawRect();
  }
  
},{
  _tmplElementPrefix: "windowview"
});
