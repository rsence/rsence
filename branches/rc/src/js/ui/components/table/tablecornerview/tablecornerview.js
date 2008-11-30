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

/** class: HTableCornerView
  *
  * The HTableCornerView is the decoration of the vertical HTableControl scroll.
  *
  * Extends:
  *  <HControl>
  *
  * See Also:
  *  <HTableControl> <HTableHeaderView> <HTableHeaderColumn> <HTableColumn>
  *
  **/
HTableCornerView = HView.extend({
  
  packageName:   "table",
  componentName: "tablecornerview",

  /** constructor: constructor
  *
  * Constructs a new HTableColumn and initializes subcomponents.
  *
  * Parameters:
  *  _rect - The rectangle of the component. See <HView.constructor>. The width of the _rect defines the width of the table column.
  *  _parentClass - The parent component of the component. See <HView.constructor>.
  *  _options - (Object, optional)
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
    
    this.type = '[HTableCornerView]';
    
    // When this is true, the component is always drawn with the theme that was
    // active at the creation of the component, not the current theme.
    this.preserveTheme = true;
    if(!this.isinherited){
      this.draw();
    }
  },
  draw: function() {
    if(!this.drawn){
      this.drawMarkup();
    }
    this.drawRect();
  }
});
