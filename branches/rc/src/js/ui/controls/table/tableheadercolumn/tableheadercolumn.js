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

/** class: HTableHeaderColumn
  *
  * An HTableHeaderColumn is used by an HTableHeaderView to draw its column headers.
  *
  * Extends:
  *  <HControl>
  *
  * See Also:
  *  <HTableControl> <HTableColumn> <HTableHeaderView>
  *
  **/
HTableHeaderColumn = HControl.extend({
  
  packageName:   "table",
  componentName: "tableheadercolumn",

/** constructor: constructor
  *
  * Constructs a new HTableHeaderColumn and initializes subcomponents.
  *
  * Parameters:
  *  _rect - The rectangle of the component. See <HView.constructor>. The width of the _rect defines the width of the table column.
  *  _parentClass - The parent component of the component. See <HView.constructor>.
  *  _options - (Object, optional)
  *
  **/
  constructor: function(_rect,_parentClass,_options) {

      this.isinherited = true;
      this.base(_rect,_parentClass,_options);
      this.isinherited = false;

    
    this.type = '[HTableHeaderColumn]';
    
    // To help extension:
    this._tmplLabelPrefix = "tableheadercolumnlabel";
    this._tmplSelectedPrefix = "tableheaderselected";
    this._tmplOrderArrowPrefix = "tableheaderorder";
    
    // When this is true, the component is always drawn with the theme that was
    // active at the creation of the component, not the current theme.
    this.preserveTheme = true;
    
    this.setMouseUp(true);
    this.setDraggable(true);
    //this.setDroppable(true);
    
    this.options = this.parent.parent.tableViewDefaults;
    this._resetColumnFlags();
    
    
  },
  
  draw: function() {
    if (!this.drawn) {
      this.drawRect();
      this.drawMarkup();
      this.drawn=true;
    }
    // Make sure the label gets drawn:
    this.refresh();
  },
  
  refresh: function() {
    // Checks if this is the first refresh call:
    if(!this._labelElementId){
      // Gets the label element based on the id specified in constructor and template:
      this._labelElementId = ELEM.bindId(this._tmplLabelPrefix+this.elemId);
      this._selectedElementId = ELEM.bindId(this._tmplSelectedPrefix+this.elemId);
      this._orderArrowElementId = ELEM.bindId(this._tmplOrderArrowPrefix+this.elemId);
    }
    // Checks if we have a label element:
    if(this._labelElementId) {
      // Sets the label's innerHTML:
      ELEM.setHTML(this._labelElementId,this.label);
    }
  },
  
  _sort: function() {
    _demo_sort.direction = !_demo_sort.direction;
    this.toggleCSSClass(ELEM.get(this._orderArrowElementId),'order-dn',!_demo_sort.direction);
    this.toggleCSSClass(ELEM.get(this._orderArrowElementId),'order-up',_demo_sort.direction);
    for(var _otherColId=0; _otherColId < this.parent.parent.tableHeaderColumns.length; _otherColId++){
      var _otherColSelectedElementId = this.parent.parent.tableHeaderColumns[_otherColId]._selectedElementId;
      if(_otherColSelectedElementId && (_otherColSelectedElementId != this._selectElementId)){
        ELEM.setStyle(_otherColSelectedElementId,'visibility','hidden');
      }
      var _otherOrderArrowElementId = this.parent.parent.tableHeaderColumns[_otherColId]._orderArrowElementId;
      if(_otherOrderArrowElementId && (_otherOrderArrowElementId != this._orderArrowElementId)){
        ELEM.setStyle(_otherOrderArrowElementId,'visibility','hidden');
      }
    }
    if(this._selectedElementId){
      ELEM.setStyle(this._selectedElementId,'visibility','inherit');
    }
    if(this._orderArrowElementId){
      ELEM.setStyle(this._orderArrowElementId,'visibility','inherit');
    }
    var _index = this.parent.parent.tableHeaderColumns.indexOf(this);
    _demo_sort.column = _index;
    this.parent.parent.data.value.sort(_demo_sort);
    this.parent.parent.reloadData();
    
  },
  
  startDrag: function(_x,_y){
    this.base(_x,_y);
    // can change when user uses tableview scrolls
    this._resetColumnFlags();
    
    // look this._startRectOfCol.leftTop
    // it moves the event location to current column
    _x -= this.parent.pageX();
    _y -= this.parent.pageY();
    this._startIndex = this.parent.parent.tableHeaderColumns.indexOf(this);
    
    this._doDrawRect = false;
    this._startPointCRSR  = new HPoint( _x, _y );
    this._prevPointCRSR   = new HPoint( _x, _y );
    this._startRectOfCol  = new HRect( this.rect );
    // Choose the column resize/drag mode, only one of them will be selected.
    this._resetColumnFlags();
    var _pointInCol = this._startPointCRSR.subtract( this._startRectOfCol.leftTop );
    if(this._columnFlags.resizeWRect.contains(_pointInCol)){
      this._diffPoint = _x-this.rect.left;
      this._columnFlags.resizeW=true;
    } else if(this._columnFlags.resizeERect.contains(_pointInCol)){
      this._diffPoint = _x-this.rect.right;
      this._columnFlags.resizeE=true;
    } else if(this._columnFlags.dragColumnRect.contains(_pointInCol)){
      this._diffPoint = this._startPointCRSR.subtract(this._startRectOfCol.leftTop);
      this._columnFlags.dragColumn=true;
    }
    this.bringToFront();
    this._dummy = true;
    this.doDrag(_x,_y);
    this._dummy = false;
  },
  
  
  doDrag: function(_x,_y){
    
    
    if (this._dummy == false) {
      _x -= this.parent.pageX();
      _y -= this.parent.pageY();
    }
    var _tableView = this.parent.parent;
    
    var _targetPoint;
    var _currPointCRSR = new HPoint( _x, _y );
    
    var _index = this.parent.parent.tableHeaderColumns.indexOf(this);
    var _column = this.parent.parent.tableColumns[ _index ];
    
    
    if(!this._prevPointCRSR.equals(_currPointCRSR)){
      if(this._columnFlags.resizeW==true){
        // disable left border of TableHeaderView
        if (_index == 0) {
          return;
        }
        // Resizing to the left
        _targetPoint = _x - this._diffPoint;
        this.rect.left = _targetPoint;
        this.rect.updateSecondaryValues();
        //this.setStyle('left',this.rect.left + "px");
        this.drawRect();
        
        
        _column.rect.left = _targetPoint + this.parent.parent.scrollLeft();
        _column.rect.updateSecondaryValues();
        _column.drawRect(); // optimize with the idle tweak..
        
        // also update _columnOrigins
        this.parent.parent._columnOrigins[_index] = _targetPoint + this.parent.parent.scrollLeft();
        
        // NOTE: The buffer needs to be updated, because on-demand generating depends on them (for example reload() )
        _tableView._tableColumns[_index].width = this.rect.width;
        var _prevColumn = this.parent.parent.tableColumns[(_index-1)];
        if(_prevColumn) {
          _prevColumn.rect.right = _targetPoint + this.parent.parent.scrollLeft();
          _prevColumn.rect.updateSecondaryValues();
          _prevColumn.drawRect();
          this.parent.parent._tableColumns[_index-1].width = _prevColumn.rect.width;
          _prevHeaderColumn = this.parent.parent.tableHeaderColumns[ _index-1 ];
          _prevHeaderColumn.rect.right = _targetPoint;
          _prevHeaderColumn.rect.updateSecondaryValues();
          _prevHeaderColumn.drawRect();
        }
      } else if(this._columnFlags.resizeE==true){
        // disable left border of TableHeaderView
        var l = this.parent.parent.tableColumns.length;
        if (_index == l - 1) {
          return;
        }
        // Resizing to the right
        _targetPoint = _x - this._diffPoint;
        this.rect.right = _targetPoint;
        this.rect.updateSecondaryValues();
        this.drawRect();
        _column.rect.right = _targetPoint + this.parent.parent.scrollLeft();
        _column.rect.updateSecondaryValues();
        _column.drawRect(); // optimize with the idle tweak..
        
        // also update _columnOrigins
        this.parent.parent._columnOrigins[_index+1] = _targetPoint + this.parent.parent.scrollLeft();
        
        // NOTE: The buffer needs to be updated, because on-demand generating depends on them (for example reload() )
        this.parent.parent._tableColumns[_index].width = this.rect.width;
        var _nextColumn = this.parent.parent.tableColumns[(_index+1)];
        if(_nextColumn) {
          _nextColumn.rect.left = _targetPoint + this.parent.parent.scrollLeft();
          _nextColumn.rect.updateSecondaryValues();
          _nextColumn.drawRect();
          this.parent.parent._tableColumns[_index+1].width = _nextColumn.rect.width;
          _nextHeaderColumn = this.parent.parent.tableHeaderColumns[ _index+1 ];
          _nextHeaderColumn.rect.left = _targetPoint;
          _nextHeaderColumn.rect.updateSecondaryValues();
          _nextHeaderColumn.drawRect();
        }
      } else if(this._columnFlags.dragColumn==true){
        _targetPoint = _currPointCRSR.subtract( this._diffPoint );
        this.setStyle('opacity',0.4);
        this.setStyle('left',_targetPoint.x + "px");
        _column.setStyle('opacity',0.4);
        _column.setStyle('left', _targetPoint.x + this.parent.parent.scrollLeft() + "px");     
      }
      this._doDrawRect = true;
      if(this._columnFlags.dragColumn==false){
        
      }
      this._prevPointCRSR = _currPointCRSR;
    }
  },  
  
  endDrag: function(_x, _y){
  
    
    this.base(_x, _y);
    this.doDrag(_x,_y);
    
    _x -= this.parent.pageX();
    _y -= this.parent.pageY();
    var _tableView = this.parent.parent;
    // restores the opacity
    this.setStyle('opacity',1.0);
    _tableView.tableColumns[this._startIndex].setStyle('opacity',1.0);
    
    var _flag = false;
    
    var i, l = _tableView.tableHeaderColumns.length;  
    for (i = 0; i < l; i++) {
      if (_tableView.tableHeaderColumns[i].rect.left <= _x &&
          _x <= _tableView.tableHeaderColumns[i].rect.right &&
          _tableView.tableHeaderColumns[i] != this) {
        if (this._columnFlags.dragColumn==true) {
          _tableView.moveColumn(
            this._startIndex,
            i
          );
          _flag = true;
        }
      }
    }
    // if we didn't move the column, restore the position
    if (_flag == false && this._columnFlags.dragColumn==true) {
      this.setStyle('left',this._startRectOfCol.left + "px");
      _tableView.tableColumns[this._startIndex].setStyle('left',this._startRectOfCol.left + "px");
      this._sort();
    }
  },
  
  /*onIdle: function(){
    if(this._doDrawRect){
      this.drawRect();
    }
    this.base();
  },*/
  
  drawRect: function(){
    this._doDrawRect = false;
    this.base();
  },

  _resetColumnFlags: function(){
    // Used internally by the column to keep track of what modes it is in
    this._columnFlags = {
      dragColumn: false,
      resizeW:    false,
      resizeE:    false,
      
      /***
        ** Calculate rectangles that the mouse pointer should be inside of to respond to different events.
        ***/
      dragColumnRect: new HRect(
        this.options.resizeW,
        0,
        this.rect.width - this.options.resizeE,
        this.rect.height
      ),
      resizeWRect:    new HRect(
        0,
        0,
        this.options.resizeW,
        this.rect.height
      ),
      resizeERect:    new HRect(
        this.rect.width - this.options.resizeE,
        0,
        this.rect.width,
        this.rect.height
      )
    };
  }
});

_demo_sort= function(a, b) {
  if (a[_demo_sort.column] < b[_demo_sort.column]) {
    return (_demo_sort.direction) ? -1 : 1;
  }
  if (a[_demo_sort.column] > b[_demo_sort.column]) {
    return (_demo_sort.direction) ? 1 : -1;
  }
  return 0;
};
_demo_sort.direction = true;
_demo_sort.column = 0;
