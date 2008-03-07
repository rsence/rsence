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

/** class: HTableColumn
  *
  * An HTableColumn stores the display characteristics and index identifier for a column and determines the width of its column in the HTableControl.
  * It also stores two HView objects: the header view, which is used to draw the column header, and the data view, used to draw the values for each row.
  *
  * vars: Instance variables
  *  type - '[HTableColumn]'
  *  dataView - The data type of the table column
  *  headerView - The data type of the table header column
  *  index - The index identifier of the data column.
  *
  * Extends:
  *  <HControl>
  *
  * See Also:
  *  <HTableControl> <HTableHeaderView> <HTableHeaderColumn>
  *
  **/
HTableColumn = HControl.extend({
  
  packageName:   "table",
  componentName: "tablecolumn",
  
/** constructor: constructor
  *
  * Constructs a new HTableColumn and initializes subcomponents.
  *
  * Parameters:
  *  _rect - The rectangle of the component. See <HView.constructor>. The width of the _rect defines the width of the table column.
  *  _parentClass - The parent component of the component. See <HView.constructor>.
  *  _options - (Object, optional)
  *
  * _options attributes:
  * dataView - The data type of the table column
  * headerView - The data type of the table header column
  * index - The index identifier of the data column.
  *
  **/
  constructor: function(_rect, _parentClass, _options) {
  
    _options = new (Base.extend({
      dataView: "",   // The Data type of the table column
      headerView: ""    // The Data type of the table header column
    }).extend(_options));
    
    if(this.isinherited) {
      this.base(_rect, _parentClass, _options);
    }
    else {
      this.isinherited = true;
      this.base(_rect, _parentClass, _options);
      this.isinherited = false;
    }
    
    this.type = '[HTableColumn]';
    
    this.width = _rect.width;
    this.dataView = this.options.dataView;
    this.headerView = this.options.headerView;
    this.index = this.options.index;
    
    // When this is true, the component is always drawn with the theme that was
    // active at the creation of the component, not the current theme.
    this.preserveTheme = true;
    
    if(!this.isinherited) {
      this.draw();
    }
  }
});
