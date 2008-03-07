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

SmallButton = HControl.extend({
  componentName: 'smallbutton',
  constructor: function(_rect,_parent,_options){
    this.base(_rect,_parent,_options);
  },
  setLabel: function(_label){
    this.label = _label;
  },
  refresh: function(){
    if(this.drawn) {
      this.base();
      var _labelId = this.markupElemIds.label;
      if( _labelId ) {
        // Sets the label's innerHTML:
        elem_set( _labelId, this.label );
      }
    }
  },
  mouseDown: function(_x,_y,_z){
    this.setValue(this.options.actionVal);
  },
  draw: function() {
    if(!this.drawn) {
      this.drawRect();
      this.drawMarkup();
    }
    // Make sure the label gets drawn:
    this.refresh();
  }
});