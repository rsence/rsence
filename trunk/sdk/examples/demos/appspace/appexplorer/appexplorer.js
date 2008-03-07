/***  HIMLE RIA SYSTEM
  ** 
  **  Copyright (C) 2008 HIMLE GROUP http://himle.sorsacode.com/
  **  Copyright (C) 2007 Juha-Jarmo Heinonen <o@sorsacode.com>
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


AppExplorer = HLeechView.extend({
  componentName: 'appexplorer',
  flexRight: true,
  flexRightOffset: 60,
  flexBottom: true,
  flexBottomOffset: 72,
  constructor: function( _elem, _filterId, _parent ){
    this.base( _elem, _parent );
    this.hide();
    this.drawMarkup();
    this.categories = new CategoryList( this );
    this.appList = new AppList( this );
    var _filterValue = HVM.values[_filterId];
    this.searchBox = new SearchBox( this );
    _filterValue.bind( this.searchBox );
    this.show();
  }
});
