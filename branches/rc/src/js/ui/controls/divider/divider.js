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

HDivider = HControl.extend({
    
  componentName: "divider",
    
  constructor: function(_rect, _parentClass, _options) {
    
    if(this.isinherited) {
      this.base(_rect, _parentClass, _options);
    }
    else {
      this.isinherited = true;
      this.base(_rect, _parentClass, _options);
      this.isinherited = false;
    }
    
    this.type = '[HDivider]';
    
    // When this is true, the component is always drawn with the theme that was
    // active at the creation of the component, not the current theme.
    this.preserveTheme = true;
    
    this.setDraggable(true);
    
    if(!this.isinherited) {
      this.draw();
    }
  },
  startDrag: function(_x, _y) {
    this.parent.startDrag(_x, _y, this);
  },
  doDrag: function(_x, _y) {
    this.parent.doDrag(_x, _y, this);
  },
  endDrag: function(_x, _y) {
    this.parent.endDrag(_x, _y, this);
  },
  draw: function() {
    if(!this.drawn) {
      this.drawRect();
      this.drawMarkup();
      this.drawn = true;
    }
    // Make sure the label gets drawn:
    this.refresh();
}
});
