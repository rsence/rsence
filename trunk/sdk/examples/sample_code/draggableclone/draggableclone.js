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

/*
  A simple mixin class to help the creation of draggables with a nice opacity
  effect.
*/
DraggableClone = HClass.extend({
  // The default opacity of the drag clone
  cloneOpacity: 0.50,
  // How much the mouse must move in pixels before it's considered a drag
  dragStartDistance: 4,
  
  startDrag: function(_x, _y) {
    this.base(_x,_y);
    // Don't start the actual drag until the user has dragged the item for
    // a few pixels.
    this.actuallyDragging = false;
    this.originX = _x;
    this.originY = _y;
  }, // // // startDrag
  
  doDrag: function(_x, _y) {
    
    if (this.actuallyDragging) {
      // We are currently dragging, follow the mouse with the object.
      prop_set(this.dragElemId, 'left', (_x - this.originX) + 'px');
      prop_set(this.dragElemId, 'top', (_y - this.originY) + 'px');
    }
    else {
      // Not yet dragging, see if mouse has moved enough to drag.
      var _distance = this.dragStartDistance;
      if (_x > this.originX+_distance || _x < this.originX-_distance ||
        _y > this.originY+_distance || _y < this.originY-_distance) {
          
        this.actuallyDragging = true;
        this._createDragClone(_x, _y);
      }

    }
  }, // // // doDrag
  
  endDrag: function(_x, _y) {
    this.base(_x,_y);
    if (this.actuallyDragging) {
      this._deleteDragClone();
      this.actuallyDragging = false;
    }
  }, // // // endDrag
  
  _createDragClone: function(_x, _y) {
    var _element = elem_get(this.elemId);
    
    // Get the node's original position
    var _originalPosition = helmi.Element.getPageLocation(_element, true);
    
    
    // Duplicate the node element, but hide it first so the raw markup
    // doesn't scare the user.
    var _clone = _element.cloneNode(true);
    this.dragElemId = elem_add(_clone);
    prop_set(this.dragElemId, 'visibility', 'hidden', true);
    elem_append(0, this.dragElemId);
    
    // Ghosting effect
    prop_set(this.dragElemId, 'opacity', this.cloneOpacity);
    
    // Place the clone on the screen
    prop_set(this.dragElemId, 'position', 'absolute', true);
    prop_set(this.dragElemId, 'left', _originalPosition[0]+'px', true);
    prop_set(this.dragElemId, 'top', _originalPosition[1]+'px', true);
    
    // Bring to temporary front
    prop_set(this.dragElemId, 'z-index', this.app.viewsZOrder.length);
    prop_set(this.dragElemId, 'visibility', 'visible', true);

    
    // Store the original position, used in doDrag()
    this.originX = this.originX - _originalPosition[0];
    this.originY = this.originY - _originalPosition[1];

  },
      
  // Removes the drag clone from the screen.
  _deleteDragClone: function() {
    if(this.dragElemId) {
      elem_del(this.dragElemId);
      this.dragElemId = null;
    }
  }
  
});

