/**
  *  Helmi RIA Platform
  *  Copyright (C) 2006-2007 Helmi Technologies Inc.
  *  
  *  This program is free software; you can redistribute it and/or modify it under the terms
  *  of the GNU General Public License as published by the Free Software Foundation;
  *  either version 2 of the License, or (at your option) any later version. 
  *  This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
  *  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
  *  See the GNU General Public License for more details. 
  *  You should have received a copy of the GNU General Public License along with this program;
  *  if not, write to the Free Software Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
  **/

HLocalTableValue = HValue.extend({
  constructor: function(_id,_value){
    this.initTable(_id,_value);
    this.value = _value.value;
  },
  initTable: function(_id,_value){
  },
  set: function(_value){
  },
  updateBuffer: function(_startingRow,_endingRow){
  },
  setCell: function(_table, _value, _row, _column){
    if (!this.value[_row]) {
      return;
    }
    this.value[_row][_column] = _value;
  },
  getCell: function(_table, _row, _column){
    if (!this.value[_row]) {
      return "";
    }
    return this.value[_row][_column];
  },
  numberOfRows: function(){
    return 100;
  },
  toXML: function(){
  }
});





/** class: HTableValue
  *
  **/
HTableValue = HValue.extend({
  
/** constructor: constructor
  *
  * Parameters:
  *  _id - See <HValue.constructor>
  *  _value - See <HValue.constructor>
  *
  **/
  constructor: function(_id,_value){
    this.initTable(_id,_value);
    
  },
  initTable: function(_id,_value){
    // {value:datadata1,colums:["id","filename","name"]}
    if (typeof _value != "object") {
      throw "HTableValue error: value not an object";
    }
    if (typeof _value.value != "object") {
      throw "HTableValue error: object.value not an array";
    }
    if (typeof _value.length != "number") {
      throw "HTableValue error: object.length not a number";
    }
    if (typeof _value.startrow != "number") {
      throw "HTableValue error: object.startrow not a number";
    }
    if (typeof _value.endrow != "number") {
      throw "HTableValue error: object.endrow not a number";
    }
    if (typeof _value.columns != "object") {
      throw "HTableValue error: object.columns not an array";
    }
    this.value = _value.value;
    this.length = _value.length;
    this.columns = _value.columns;
    this.startrow = _value.startrow;
    this.endrow = _value.endrow;
    this.startrow1 = 0;
    this.endrow1 = 0;
    
    // same as in HValue
    this.id = _id;
    this.type = '[HTableValue]';
    this.views = [];
    
    this.startdatarow = this.startrow;
    this.enddatarow = this.endrow;
    this.datalength = this.endrow - (this.startrow-1);
    
    this.gettingData = false;
    this.gettingData1 = false;
    
    this.gettingDataInterrupted = false;
    this.gettingDataInterrupted1 = false;
    
    this.index1 = 0;
    this.index2 = 0;
    this.valueRequested = undefined;
    
    HValueManager.add(_id,this);
  },
/** method: set
  *
  **/
  set: function(_value){
    if (this.valueRequested == 1) {
      this.value1 = _value;
      this.gettingData1 = false;//Data got
    } else if (this.valueRequested == 0) {
      this.value = _value;
      this.gettingData = false;//Data got
    }
    if (this.gettingDataInterrupted) {
      // needs refresh
      //window.status = "gettingDataInterrupted" + this.tableControl;
      this.tableControl.reloadData();
      this.gettingDataInterrupted = false;
    }
    if (this.gettingDataInterrupted1) {
      // needs refresh
      //window.status = "gettingDataInterrupted1" + this.tableControl;
      this.tableControl.reloadData();
      this.gettingDataInterrupted1 = false;
    }
    if (this.reloading == true) {
      this.tableControl.reloadData();
      this.reloading = false;
    }
    //this.index1++;
    //window.status = "index1: " + this.index1 + " ";
  },
  updateBuffer: function(_startingRow,_endingRow){
    /*if (this.reloading) {
      return;
    }*/
    // this is the data block length
    var _length = this.datalength;
    // there are 2 data blocks that are switching together
    // tells if we are inside value (data block1) or value1 (data block2) 
    var _whichValue = undefined; // 0 or 1
    // is within buffer
   
    if (this.startdatarow-1 <= _startingRow && _endingRow <= this.enddatarow-1) {
        var _rowTopLimit;
        var _rowBottomLimit;
        if (this.startrow-1 <= _startingRow && _endingRow <= this.endrow-1) {
          _rowTopLimit = this.startrow-1 + parseInt(_length/4,10);
          _rowBottomLimit = this.endrow-1 - parseInt(_length/4,10);
          _whichValue = 0;
        } else if ((this.startrow1 && this.endrow1) && this.startrow1-1 <= _startingRow && _endingRow <= this.endrow1-1) {
          _rowTopLimit = this.startrow1-1 + parseInt(_length/4,10);
          _rowBottomLimit = this.endrow1-1 - parseInt(_length/4,10);
          _whichValue = 1;
        }
        // at the bottom
        if (_endingRow > _rowBottomLimit) {
          if (_whichValue == 0 && this.startrow1 < this.startrow) {
            //this.index2++;
            //  window.status = "index2: " + this.index2 + " " + (this.startrow1 < this.startrow);
            // check if already has buffer under
            var _newRowStart = this.endrow + 1;
            var _newRowEnd = this.endrow + _length;
            if (_newRowEnd > this.length) {
              _newRowEnd = this.length;
            }
            this.startrow1 = _newRowStart;
            this.endrow1 = _newRowEnd;
            this.startrow2 = this.startrow1;
            this.endrow2 = this.endrow1;
            
            window.status = "going down 0 " +
              "this.startrow " + this.startrow + " " +
              "this.endrow " + this.endrow + " " +
              "this.startrow1 " + this.startrow1 + " " +
              "this.endrow1 " + this.endrow1 + " ";
            
            this.startdatarow = this.startrow;
            this.enddatarow = this.endrow1;
            this.valueRequested = 1;
            this.gettingData1 = true;
            HValueManager.changed(this);
          }
          if (_whichValue == 1 && this.startrow < this.startrow1) {
            //this.index2++;
            //  window.status = "index3: " + this.index2 + " " + (this.startrow < this.startrow1);
            // check if already has buffer under
            var _newRowStart = this.endrow1 + 1;
            var _newRowEnd = this.endrow1 + _length;
            if (_newRowEnd > this.length) {
              _newRowEnd = this.length;
            }
            this.startrow = _newRowStart;
            this.endrow = _newRowEnd;
            this.startrow2 = this.startrow;
            this.endrow2 = this.endrow;
            
            window.status = "going down 1 " +
              "this.startrow1 " + this.startrow1+ " " +
              "this.endrow1 " + this.endrow1 + " " +
              "this.startrow " + this.startrow + " " +
              "this.endrow " + this.endrow + " ";
            
            //window.status = this.startrow + " " + this.endrow;
            
            this.startdatarow = this.startrow1;
            this.enddatarow = this.endrow;
            this.valueRequested = 0;
            this.gettingData = true;
            HValueManager.changed(this);
            
            
          }          
        }
        // at the top
        if (_startingRow < _rowTopLimit) {
          if (this.startrow-1 == 0 && _whichValue == 0) {
          } else {
            if (_whichValue == 0 && this.startrow < this.startrow1) {
              //this.index2++;
              //window.status = "index4: " + this.index2 + " " + (this.startrow < this.startrow1);
              // check if already has buffer over
              var _newRowStart = this.startrow - _length;
              var _newRowEnd = this.startrow - 1;
              if (_newRowStart < 1) {
                _newRowStart = 1;
              }
              //window.status = _newRowStart + " " + _newRowEnd;
              
              
              this.startrow1 = _newRowStart;
              this.endrow1 = _newRowEnd;
              this.startrow2 = this.startrow1;
              this.endrow2 = this.endrow1;
              this.startdatarow = this.startrow1;
              
             window.status ="going up 0 " +
              "this.startrow " + this.startrow + " " +
              "this.endrow " + this.endrow + " " +
              "this.startrow1 " + this.startrow1 + " " +
              "this.endrow1 " + this.endrow1 + " ";
              
              this.enddatarow = this.endrow;
              this.valueRequested = 1;//value [[...]
              this.gettingData1 = true;
              HValueManager.changed(this);
            }
            if (_whichValue == 1 && this.startrow1 < this.startrow) {
              //this.index2++;
              //window.status = "index5: " + this.index2 + " " + (this.startrow1 < this.startrow);
              // check if already has buffer over
              var _newRowStart = this.startrow1 - _length;
              var _newRowEnd = this.startrow1 - 1;
              if (_newRowStart < 1) {
                _newRowStart = 1;
              }
              
              //window.status = _newRowStart + " " + _newRowEnd;
              this.startrow = _newRowStart;
              this.endrow = _newRowEnd;
              this.startrow2 = this.startrow;
              this.endrow2 = this.endrow;
              this.startdatarow = this.startrow;
              this.enddatarow = this.endrow1;
              
                  window.status = "going up 1 " +
              "this.startrow " + this.startrow + " " +
              "this.endrow " + this.endrow + " " +
              "this.startrow1 " + this.startrow1 + " " +
              "this.endrow1 " + this.endrow1 + " ";
              
              this.valueRequested = 0;//value [[...]
              this.gettingData = true;
              HValueManager.changed(this);
            }
          }
        }
    } else {
      var _viewLength = _endingRow - _startingRow;
      var _newRowStart = _startingRow - parseInt(_length/2,10) + parseInt(_viewLength/2,10);
      
    
    
      //var _newRowStart = _startingRow - parseInt(_length/2,10) + parseInt((_endingRow - _startingRow) / 2) + 1;
      if (_newRowStart < 1) {
        _newRowStart = 1;
      }
      var _newRowEnd = _newRowStart + _length - 1;
      
      if (_newRowEnd > this.length) {
        _newRowEnd = this.length;
      }
      
      this.startrow = _newRowStart;
      this.endrow = _newRowEnd;
      
      this.startrow1 = undefined;
      this.endrow1 = undefined;
      
      this.startrow2 = this.startrow;
      this.endrow2 = this.endrow;
      
      this.startdatarow = _newRowStart;
      this.enddatarow = _newRowEnd;
      
      this.valueRequested = 0;//value [[...]
      this.gettingData = true;
      
      this.reloading = true;
      
      HValueManager.changed(this);
      
      
      
      //window.status = "outside buffer" + _startingRow +
      //" " + _newRowStart + " " + _newRowEnd;
      
      
      
      
    }
  },
/** method: setValue
  *
  **/
  setCell: function(_table, _value, _row, _column){
    
    
    this.value[_row][_column] = _value;
  },
  getCell: function(_table, _row, _column){
    /*if (_row > this.endrow) {
      this.startrow = _row;
      this.endrow = _row + 100;
      HValueManager.changed(this);
    }
    window.status = "_row: " + _row;*/
    //if (!this.value[_row]) {
    //  return "[ No Data ]";
    //}
    //window.status = _row-(this.startrow-1);
    if (this.startrow-1 <= _row && _row <= this.endrow-1) {
      if (this.gettingData) {
        this.gettingDataInterrupted = true;
      } else {
        if (this.value[_row-(this.startrow-1)]) {
          return this.value[_row-(this.startrow-1)][_column];
        }
      }
    } else if (this.startrow1-1 <= _row && _row <= this.endrow1-1) {
      if (this.gettingData1) {
        this.gettingDataInterrupted1 = true;
      } else {
        if (this.value1 && this.value1[_row-(this.startrow1-1)]) {
          return this.value1[_row-(this.startrow1-1)][_column];
        }
      }
    }
    //if (!this.value[_row]) {
      return "-";
    //}
  },
  numberOfRows: function(){
    return this.length;
  },
  
/** method: toXML
  *
  * Generates an XML description of the menuitem.
  *
  * Parameter:
  *  _i - The sequence number of the item, generated by HValueManager.
  *
  * Returns:
  *  An XML string with the date as specified
  *
  * See Also:
  *  <HValue.toXML> <HValueManager.toXML>
  *
  **/
  toXML: function(_i){
    var _syncid = this.id;
    var _rows = "";
    for (var _column = 0; _column < this.columns.length; _column++) {
      _rows += '<getrows column="'+this.columns[_column]+'" startrow="'+this.startrow2+'" endrow="'+this.endrow2+'" />';
    }
    return '<tablevalue length="'+this.columns.length+'" id="'+_syncid+'" order="'+_i+'">'+_rows+'</tablevalue>';
  }
});

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
/** class: HTableHeaderView
  *
  * An HTableHeaderView is used by an HTableControl to draw headers over its columns.
  *
  * vars: Instance variables
  *  type - '[HTableHeaderView]'
  *
  * Extends:
  *  <HControl>
  *
  * See Also:
  *  <HTableControl> <HTableColumn> <HTableHeaderColumn>
  *
  **/

HTableHeaderView = HControl.extend({
  
  packageName:   "table",
  componentName: "tableheaderview",

/** constructor: constructor
  *
  * Constructs a new HTableHeaderView and initializes subcomponents.
  *
  * Parameters:
  *  _rect - The rectangle of the component. See <HView.constructor>.
  *  _parentClass - The parent component of the component. See <HView.constructor>.
  *  _options - (Object, optional)
  *
  **/
  constructor: function(_rect,_parentClass, _options) {
    
    if(this.isinherited){
      this.base(_rect,_parentClass,_options);
    }
    else {
      this.isinherited = true;
      this.base(_rect,_parentClass,_options);
      this.isinherited = false;
    }
    
    this.type = '[HTableHeaderView]';
    
    // When this is true, the component is always drawn with the theme that was
    // active at the creation of the component, not the current theme.
    this.preserveTheme = true;
    if(!this.isinherited){
      this.draw();
    }
  },
  draw: function() {
    this.base();
    //this.drawMarkup();
  }
  
});/** class: HTableHeaderColumn
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
      this._labelElementId = elem_bind(this._tmplLabelPrefix+this.elemId);
      this._selectedElementId = elem_bind(this._tmplSelectedPrefix+this.elemId);
      this._orderArrowElementId = elem_bind(this._tmplOrderArrowPrefix+this.elemId);
    }
    // Checks if we have a label element:
    if(this._labelElementId) {
      // Sets the label's innerHTML:
      elem_set(this._labelElementId,this.label);
    }
  },
  
  _sort: function() {
    _demo_sort.direction = !_demo_sort.direction;
    this.toggleCSSClass(elem_get(this._orderArrowElementId),'order-dn',!_demo_sort.direction);
    this.toggleCSSClass(elem_get(this._orderArrowElementId),'order-up',_demo_sort.direction);
    for(var _otherColId=0; _otherColId < this.parent.parent.tableHeaderColumns.length; _otherColId++){
      var _otherColSelectedElementId = this.parent.parent.tableHeaderColumns[_otherColId]._selectedElementId;
      if(_otherColSelectedElementId && (_otherColSelectedElementId != this._selectElementId)){
        prop_set(_otherColSelectedElementId,'visibility','hidden');
      }
      var _otherOrderArrowElementId = this.parent.parent.tableHeaderColumns[_otherColId]._orderArrowElementId;
      if(_otherOrderArrowElementId && (_otherOrderArrowElementId != this._orderArrowElementId)){
        prop_set(_otherOrderArrowElementId,'visibility','hidden');
      }
    }
    if(this._selectedElementId){
      prop_set(this._selectedElementId,'visibility','inherit');
    }
    if(this._orderArrowElementId){
      prop_set(this._orderArrowElementId,'visibility','inherit');
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
}
_demo_sort.direction = true;
_demo_sort.column = 0;
_HTableColumn = function(_index,_width,_string,_dataView,_headerView) {
  this.index = _index;
  this.width = _width;
  this.string = _string;
  this.dataView = _dataView;
  this.headerView = _headerView;
  this.headerCreated = false;
  this.created = false;
}

/** class: HTableControl
  *
  * HTable is a control unit intended to display and organize record-oriented data 
  * in the table form. The HTable component allows the user to edit values (table fields),
  * resize and rearrange columns. 
  *
  * vars: Instance variables
  *  type - '[HTableControl]'
  * tableColumns - An array containing the the HTableColumn objects in the receiver.
  * tableHeaderColumns - An array containing the the HTableHeaderColumn objects in the receiver.
  * Extends:
  *  <HControl>
  *
  * See Also:
  *  <HTableColumn> <HTableHeaderView> <HTableHeaderColumn>
  *
  **/
HTableControl = HControl.extend({
  /*themePath:     IThemePath,*/
  packageName:   "table",
  componentName: "itablecontrol",
  
/** constructor: constructor
  *
  * Constructs a new HTableControl and initializes subcomponents.
  *
  * Parameters:
  *  _rect - The rectangle of the component. See <HView.constructor>. The width of the _rect defines the width of the table column.
  *  _parentClass - The parent component of the component. See <HView.constructor>.
  *  _options - (Object, optional)
  *
  * _options attributes:
  * rowHeight - The height of each row in the receiver.
  * headerViewHeight - The height of of the table header view.
  * bufferLength - Defines how many views to buffer.
  * resizeW - The resize portion from the right side of the table header column 
  * resizeE -  The resize portion from the left side of the table header column 
  *
  **/
  constructor: function(_rect,_parentClass, _options) {
  
    _options = new (Base.extend({
      rowHeight: 21,
      headerViewHeight: 21,
      bufferLength: 3,
      resizeW: 5,
      resizeE: 5
    }).extend(_options));
    
    if(this.isinherited){
      this.base(_rect,_parentClass,_options);
    }
    else {
      this.isinherited = true;
      this.base(_rect,_parentClass,_options);
      this.isinherited = false;
    }
    this.tableViewDefaults = _options;
    // TABLE DEFAULTS HERE!!!
    
    this.type = '[HTableControl]';
    
    // When this is true, the component is always drawn with the theme that was
    // active at the creation of the component, not the current theme.
    this.preserveTheme = true;
    
    this.tableColumns = [];//real HTableColumns
    this._columnOrigins = [];
    this.tableHeaderColumns = [];
    this._tableColumns = [];//buffer
    this._dataRowBufferInitialized = [];
    this._tableRows = [];//buffer
    this.numberOfRows = 0;
    this._dataRowBufferIndex = 0;//top row of the buffer
    this._dataRowBufferEndIndex = 0;//bottom row of the buffer
    
    this._dataStartBufferIndex = 0; // 0, 1, 2
    this._dataEndBufferIndex = 0; // 0, 1, 2
    
    this._dataBufferViewLength = 0;
    
    // create the HTableControl header view
    this.headerView = new HTableHeaderView(
      new HRect(0,0,this.rect.width,this.options.headerViewHeight),
      this
    );
    // this is the scrollview of the table control
    this.tableView = new HView(
      new HRect(0,this.options.headerViewHeight,this.rect.width,this.rect.height),
      this
    );
    this.tableView.setStyle("overflow","auto");
    // makes the sccollable content to real size
    this.columnsView = new HView(
      new HRect(0,0,this.rect.width,this.rect.height-this.options.headerViewHeight),
      this.tableView
    );
    var _cornerRect = new HRect(this.rect.width-18,0,this.rect.width,this.options.headerViewHeight); 
    
    this.cornerView = new HTableCornerView(
      _cornerRect,
      this
    );
    
    this._scrollRect=new HRect(this.tableView.rect);
    this._scrollRect.offsetTo(0,0);
    
    if(!this.isinherited){
      this.draw();
    }
  },
  onIdle: function() {
    this._buffer();
    this.base();
  },
  _updateColumns: function() {
    
    // data length and columns length
    if (this.numberOfRows == 0 || this._tableColumns.length == 0) {
      return;
    }
    
    // calculates first and last visible rows
    var _startingRow = this._rowAtPoint(new HPoint(0,this._scrollRect.top));
    var _endingRow = this._rowAtPoint(new HPoint(0,this._scrollRect.bottom));
    var _startingColumn, _endingColumn;
    var _xPos = this._scrollRect.left;
    var i = 0;
    // starting column
    while (i < this._tableColumns.length && _xPos > this._columnOrigins[i]) {
      i++;
    }
    _startingColumn = i-1;
    // happens when _xPos == 0
    if (_startingColumn==-1) {
      _startingColumn = 0;
    }
    var _xPos = this._scrollRect.right;
    // ending column
    while (i < this._tableColumns.length && _xPos > this._columnOrigins[i]) {
      i++;
    }
    _endingColumn = i-1;
        if (_endingColumn==-1) {
      _endingColumn = this._tableColumns.length-1;
    }
    
    var _partRowsUpdated = false;
    var _partUpRowsUpdated = false;
    var _allRowsUpdated = false;
    for (var i = _startingColumn; i <= _endingColumn; i++) {
        // creates visible HTableColumn it not created
        if ( this._tableColumns[i].created == false) {
          var _columnRect =  new HRect(
            this._columnOrigins[i],
            0,
            this._columnOrigins[i] + this._tableColumns[i].width,
            this.columnsView.rect.height
          );
          
          this.tableColumns[i] = new HTableColumn(
            _columnRect,
            this.columnsView,{
              label:this._tableColumns[i].string,
              dataView:this._tableColumns[i].dataView,
              headerView:this._tableColumns[i].headerView
          });
          //this.tableColumns[i].draw();
          
          this._tableColumns[i].created = true;
        }
        // creates visible HTableHeaderColumn it not created
        if ( this._tableColumns[i].headerCreated == false) {
          // synchronize also the scrolling
          var _headerColumnRect =  new HRect(
            this._columnOrigins[i] - this._scrollRect.left,
            0,
            this._columnOrigins[i] - this._scrollRect.left + this._tableColumns[i].width,
            this.options.headerViewHeight
          );
          this.tableHeaderColumns[i] = new HTableHeaderColumn(
            _headerColumnRect,
            this.headerView,
            {label:this._tableColumns[i].string}
          );
          this.tableHeaderColumns[i].draw();
          
          this._tableColumns[i].headerCreated = true;
        }
        var _tableColumn = this.tableColumns[i];
        var _tableHeaderColumn = this.tableHeaderColumns[i];
        
        
        if (this._dataRowBufferInitialized[i] == false) {
        
          this._initializeRows(i, _startingRow, _endingRow);
          this._dataRowBufferInitialized[i] = true;
        }
        
    }
    for (var i = 0; i < this._tableColumns.length; i++) {
      if (this._tableColumns[i].created == true) {
        
        
        
        var _tableColumn = this.tableColumns[i];
        var _tableHeaderColumn = this.tableHeaderColumns[i];
        _tableHeaderColumn.rect.offsetTo(
          this._columnOrigins[i] - this._scrollRect.left,
          0
        );
        _tableHeaderColumn.drawRect();
        _tableColumn.rect.set(
          this._columnOrigins[i],
          0,
          this._columnOrigins[i] + _tableColumn.width,
          this.columnsView.rect.height
        );
        _tableColumn.drawRect();
        
        
        
        // is within the buffer
        if (!this._reloading && this._dataRowBufferIndex <= _startingRow && _startingRow < this._dataRowBufferIndex + this.tableViewDefaults.bufferLength * this._dataBufferViewLength) {//check correct limits
          var _dataBuffer = new HDataBuffer(
            _startingRow,
            _endingRow,
            this._dataRowBufferIndex,
            this._dataRowBufferEndIndex,
            this._dataBufferViewLength
          );
          
          var _rowLowerLimit = _dataBuffer.lowerLimit();
          var _rowUpperLimit = _dataBuffer.upperLimit();
          // at the lower end
          // remember to handle other rows too
          if (_startingRow > _rowUpperLimit) {
            _partRowsUpdated = true;
            // rows are moved this location
            var _start = this._dataStartBufferIndex;
            var _yPos = _dataBuffer.getNewBottomRow() * this.options.rowHeight;
            var _newRowStart = _dataBuffer.getNewBottomRow();
            var _newRowEnd = _dataBuffer.getNewBottomRowEnd();
            // updates the values
            this._updateView(
              _start,
              _newRowStart,
              _newRowEnd,
              i,
              _yPos,
              _tableColumn
            );
            
            
            
            
          } else if (_startingRow <= _rowLowerLimit) {
            
            _partUpRowsUpdated = true;
            var _start = this._dataEndBufferIndex;
            var _yPos = _dataBuffer.getNewTopRow() * this.options.rowHeight;
            var _newRowStart = _dataBuffer.getNewTopRow();
            var _newRowEnd = _dataBuffer.getNewTopRowEnd();
            
            this._updateView(
              _start,
              _newRowStart,
              _newRowEnd,
              i,
              _yPos,
              _tableColumn
            );
            
            // scrolls up
          }
        } else {
          
          _allRowsUpdated = true;
          // lets reset things
          var _dataBuffer = new HDataBuffer(_startingRow, _endingRow,0,0,this._dataBufferViewLength);
          var _startingBufferRow = _dataBuffer.startingRow();
          var _endingBufferRow = _dataBuffer.endingRow();
          var _start = 0;
          var _yPos = _startingBufferRow * this.options.rowHeight;
          this._updateView(
            _start,
            _startingBufferRow,
            _startingBufferRow + this._dataBufferViewLength*3,
            i,
            _yPos,
            _tableColumn
          );
        }
         
      }
    }
    
      // below cannot be updated before all the columns have been handled
      // update the buffer index when all the rows have been updated
      if (_partRowsUpdated == true) {
        var _dataBuffer = new HDataBuffer(_startingRow, _endingRow,0,0,this._dataBufferViewLength);
        var _indexes = _dataBuffer.getNewDownBufferIndexes(this._dataStartBufferIndex);
        this._dataStartBufferIndex = _indexes[0];
        this._dataEndBufferIndex = _indexes[1];
        // updates the index by view length
        this._dataRowBufferIndex += this._dataBufferViewLength;
      }
      
      
      // update the buffer index when all the rows have been updated
      if (_partUpRowsUpdated == true) {
        var _dataBuffer = new HDataBuffer(_startingRow, _endingRow,0,0,this._dataBufferViewLength);
        var _indexes = _dataBuffer.getNewUpBufferIndexes(this._dataStartBufferIndex);
        this._dataStartBufferIndex = _indexes[0];
        this._dataEndBufferIndex = _indexes[1];
        // updates the index by view length
        this._dataRowBufferIndex -= this._dataBufferViewLength;
      }
      if (_allRowsUpdated == true) {
        var _dataBuffer = new HDataBuffer(_startingRow, _endingRow,0,0,this._dataBufferViewLength);
        this._dataStartBufferIndex = 0;
        this._dataEndBufferIndex = _dataBuffer.endBufferStartRow();
        this._dataRowBufferIndex = _startingRow - this._dataBufferViewLength;
      }
      // tells to the htablevalue where the view area and the buffer is
      this.data.updateBuffer(_startingRow,_endingRow);
  },
  _updateView: function(_start, _startRealRow, _endRealRow, _columnIndex, _locationY, _item) {
    var _value;
    for (var _rowIndex = _startRealRow; _rowIndex < _endRealRow; _rowIndex++) {
      _value = this.data.getCell(this,_rowIndex,this._tableColumns[_columnIndex].index);
      _value = (_value) ? _value : "1";
      this._tableRows[_columnIndex][_start].setValue(_value);
      this._tableRows[_columnIndex][_start].rect.offsetTo(
        0,
        _locationY
      );
      this._tableRows[_columnIndex][_start].drawRect();
      _locationY += this.options.rowHeight;
      _start++;
    }
  },
  _initializeRows: function(_columnIndex, _startingRow, _endingRow) {
    
    var _tableColumn = this.tableColumns[_columnIndex];
    if (!this._dataBufferViewLength) {
      this._dataBufferViewLength = _endingRow - _startingRow;
    }
    var _dataBuffer = new HDataBuffer(_startingRow, _endingRow,0,0,this._dataBufferViewLength);
    var _startingBufferRow = _dataBuffer.startingRow();
    var _endingBufferRow = _dataBuffer.endingRow();
    
    this._dataRowBufferIndex = _startingBufferRow;//buffer start
    this._dataRowBufferEndIndex = _endingBufferRow;//buffer end
    var _yPos = _startingBufferRow * this.options.rowHeight;
    
    // this._dataStartBufferIndex = 0;
    this._dataEndBufferIndex = _dataBuffer.endBufferStartRow();
    this._tableRows[_columnIndex] = new Array();
    var _dataView = _tableColumn.dataView
    // will be removed
    if (typeof _dataView == "string") {
      _dataView = ITextControl
    }
    var _view, _viewRect, _value;
    for (var _rowIndex=_startingBufferRow;_rowIndex<_endingBufferRow;_rowIndex++) {
      _value = this.data.getCell(this,_rowIndex,this._tableColumns[_columnIndex].index);
      _value = (_value) ? _value : "1";
      _viewRect = new HRect(0,_yPos,_tableColumn.rect.width,_yPos + this.options.rowHeight);
      _view = new _dataView(
        _viewRect,
        _tableColumn,
        {value:_value}
      );
      this._tableRows[_columnIndex].push(_view);
      _yPos += this.options.rowHeight;
    } 
  },
/** method: _calculateDimensions
  *
  * Calculates new dimensions whenever columns are added, or data is changed.
  * Makes scrolling very efficient, because you down't then calculate
  * any dimensions at that time.
  *
  **/
  _calculateDimensions: function() {
    var _tableWidth = 0, _tableHeight;
    // calculate table column origins and table view width
    if (this._tableColumns.length > 0) {
      var _width;
      this._columnOrigins[0] = 0;
      width = this._tableColumns[0].width;
      _tableWidth += width;
      for (var i = 1; i < this._tableColumns.length;i++) {
        this._columnOrigins[i] = this._columnOrigins[i-1] + width;
        width = this._tableColumns[i].width;
        _tableWidth += width;
      }
    }
    // this is the new table view height
    _tableHeight = this.numberOfRows * this.options.rowHeight;
    // updates the width and height of the content view
    this.columnsView.rect.setSize(_tableWidth,_tableHeight);
    this.columnsView.drawRect();
    // updates the header view
    if (this.headerView) {
      this.headerView.rect.setWidth(_tableWidth);
      this.headerView.drawRect();
    }
  },
  _rowAtPoint: function(_point) {
    return parseInt(_point.y / this.options.rowHeight, 10);
  },
  
  rowAtPoint: function(_point) {
    var _y =  _point.y;
    if (_y == 0) {
      return 0;
    }
    _y -= this.options.headerViewHeight;
    return parseInt(_y / this.options.rowHeight);
  },
/** method: addColumn
  * 
  * Adds a column as the last column of the receiver.
  * 
  * Parameters:
  *   _index - The index identifier of the data column
  *   _width - The width of the table header column
  *   _name - The name of the table header column
  *   _dataView - The data type of the table column
  *   _headerView - The data type of the table header column
  *
  **/ 
  addColumn: function(_index,_width,_name,_dataView,_headerView) {
    var _column = new _HTableColumn(_index,_width,_name,_dataView,_headerView);
    this._tableColumns.push(_column);//buffer
    this._dataRowBufferInitialized.push(false);
    
  },
/** method: setData
  * 
  * Sets the receiver's data source to a given object.
  *
  * Parameters:
  *   _data - The data source for the receiver. The Data source is a two dimensional array.
  *
  **/
  setData: function(_data) {
    this.data = _data;
    this.data.tableControl = this;
    this.numberOfRows = this.data.numberOfRows();
    this._calculateDimensions();
    //this.reloadData();
    
  },
/** method: reloadData
  * 
  * Reload the data for visible views and draw the new values.
  *
  **/ 
  reloadData: function(_data) {
    this._isUpdatingColumns=true;
    this._reloading = true;
    this._updateColumns();
    this._reloading = false;
    this._isUpdatingColumns=false;
  },
/** method: removeColumn
  * 
  * Removes a given column from the receiver.
  *
  * Parameters:
  *   _column - The column to remove from the receiver.
  *
  **/ 
  removeColumn: function(_column) {
    this._isUpdatingColumns=true;
    var _index = this.tableColumns.indexOf(_column);
    
    // removes all _column related data structures
    this._tableColumns.splice(_index,1);
    
    this.tableHeaderColumns[_index].die();
    this.tableHeaderColumns.splice(_index,1);
    
    this.tableColumns[_index].die();
    this.tableColumns.splice(_index,1);
    
    this._tableRows.splice(_index,1);
    this._dataRowBufferInitialized.splice(_index,1);
    
    this._calculateDimensions();
    this._updateColumns();
    this._isUpdatingColumns=false;
  },
/** method: moveColumn
  * 
  * Moves the column and heading at a given index to a new given index.
  *
  * Parameters:
  *   _columnIndex - The current index of the column to move.
  *   _newIndex - The new index for the moved column.
  *
  **/ 
  moveColumn: function(_columnIndex,_newIndex) {
    
    //alert(_columnIndex + " " + _newIndex);
    
    // onIdle runs asynchronous cycle, so we need lock columns when updating
    this._isUpdatingColumns=true;
    var _index1 = _columnIndex;
    var _index2 = _newIndex;
    if (_index1 < _index2) {
      var _temp = _index2;
      _index2 = _index1;
      _index1 = _temp;
    }
    // moves columnbuffer to right place
    var _column = this._tableColumns[_index1];
    this._tableColumns.splice(_index1,1);
    this._tableColumns.splice(_index2,0,_column);
    
    // moves table column views to right place
    _column = this.tableColumns[_index1];
    this.tableColumns.splice(_index1,1);
    this.tableColumns.splice(_index2,0,_column);
    
    // moves header column views to right place
    _column = this.tableHeaderColumns[_index1]
    this.tableHeaderColumns.splice(_index1,1);
    this.tableHeaderColumns.splice(_index2,0,_column);
    
    // moves row buffer initialized information to right place
    _column = this._dataRowBufferInitialized[_index1]
    this._dataRowBufferInitialized.splice(_index1,1);
    this._dataRowBufferInitialized.splice(_index2,0,_column);
    
    // moves row buffer to right place
    _column = this._tableRows[_index1]
    this._tableRows.splice(_index1,1);
    this._tableRows.splice(_index2,0,_column);
    this._calculateDimensions();
    this._updateColumns();
    
    this._isUpdatingColumns=false;
    
  },
  scrollLeft: function() {
    return this._scrollRect.left;
  },
  scrollTop: function() {
    return this._scrollRect.top;
  },
  _buffer: function() {
    var _tableElem = elem_get(this.tableView.elemId);
    if (!_tableElem) {
      throw("Error: HTableControl element not found");
    }
    var _prevScrollRect = new HRect(this._scrollRect);
    
    this._scrollRect.offsetTo(
      parseInt(_tableElem.scrollLeft,10),
      parseInt(_tableElem.scrollTop,10)
    );
    // updated if scrolled location differs from previous one
    if (!_prevScrollRect.equals(this._scrollRect)) {
      
      // we have here viewable area
      // onIdle runs asynchronous cycle, so we need lock columns when updating
      this._isUpdatingColumns=true;
      this._updateColumns();
      this._isUpdatingColumns=false;
    }
  }
});
