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
  componentName: "tablecontrol",
  
  calculateDimensions: function(){this._calculateDimensions();},
  updateColumns: function(){this._updateColumns();},
  
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
