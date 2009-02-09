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

HGrid = HControl.extend({
    
  componentName: "grid",
    
  constructor: function(_rect, _parentClass, _options) {
    
    if(this.isinherited) {
      this.base(_rect, _parentClass, _options);
    }
    else {
      this.isinherited = true;
      this.base(_rect, _parentClass, _options);
      this.isinherited = false;
    }
    
    this.type = '[HGrid]';
    this._maxCols = 0;
    this._maxRows = 0;
    this.cells = []; // two dimensional array
    this.selectedCells = []; // two dimensional array
    this.cellClass = HView;
    this.autosizesCells = true;
    this.interCell = new HPoint(1,1);
    this.cellSize = new HPoint(0,0);
    
    // When this is true, the component is always drawn with the theme that was
    // active at the creation of the component, not the current theme.
    this.preserveTheme = true;
    this.gridviews = null;
    if(!this.isinherited) {
      this.draw();
    }
  },
  setCellClass: function(_class) {
    this.cellClass = _class;
  },
  addColumn: function() {
    
  },
  addRow: function() {
    
  },
  setSpacing: function() {
    
  },
  select: function() {
    
  },
  autoScale: function() {
    this._autoScale();
  },
  _autoScale: function() {
    if (this.autosizesCells) {
      if (this._numRows > 1) {
        this.cellSize.y = this.rect.height - ( (this._numRows - 1) * this.interCell.y);
        this.cellSize.y = this.cellSize.y / this._numRows;
        if (this.cellSize.y < 0) {
          this.cellSize.y = 0;
        }
      } else {
        this.cellSize.y = this.rect.height;
      }
      if (this._numCols > 1) {
        this.cellSize.x = this.rect.width - ( (this._numCols - 1) * this.interCell.x);
        this.cellSize.x = this.cellSize.x / this._numCols;
        if (this.cellSize.x < 0) {
          this.cellSize.x = 0;
        }
      } else {
        this.cellSize.x = this.rect.width;
      }
    }
  },
  addRowsAndColumns: function(_rows, _columns) {
    this._addRowsAndColumns(_rows, _columns, 0, 0);
  },
  _addRowsAndColumns: function(_row, _col, _rowSpace, _colSpace) {
    var i,j;
    var _oldMaxC = this._maxCols;
    this._numCols = _col;
    if (_col > this._maxCols) {
      this._maxCols = _col;
    }
    var _oldMaxR = this._maxRows;
      this._numRows = _row;
    if (_row > this._maxRows) {
      this._maxRows = _row;
    }
    // adds new rows if needed 
    if (_col > _oldMaxC) {
      var _end = _col - 1;
      for (i = 0; i < _oldMaxR; i++) {
        // adds the empty column cells to row
        // this.cells[i].length = _col;
        // this.selectedCells[i].length = _col;
        for (j = _oldMaxC; j < _col; j++) {
          this.cells[i][j] = null;
          this.selectedCells[i][j] = false;
          if (j == _end && _colSpace > 0) {
            _colSpace--;
          } else {
            this.makeCellAtRowAndColumn(i,j);
          }
        }
      }
    }
    if (_row > _oldMaxR) {
      var _end = _row - 1;
      for (i = _oldMaxR; i < _row; i++) {
        this.cells[i] = new Array(this._maxCols);
        this.selectedCells[i] = new Array(this._maxCols);
        if (i == _end) {
          for (j = 0; j < this._maxCols; j++) {
            this.cells[i][j] = null;
            this.selectedCells[i][j] = false;
            if (_rowSpace > 0) {
              _rowSpace--;
            } else {
              this.makeCellAtRowAndColumn(i,j);
            }
          }
        } else {
          for (j = 0; j < this._maxCols; j++) {
            this.cells[i][j] = null;
            this.selectedCells[i][j] = false;
            this.makeCellAtRowAndColumn(i,j);
          }
        }
      }
    }
  },
  makeCellAtRowAndColumn: function(_row, _col) {
    var _cell = new this.cellClass(
                          new HRect(),
                          this
                          );
    this.cells[_row][_col] = _cell;
    return _cell;
  },
  draw: function() {
    if(!this.drawn) {
      this.drawRect();
      this.drawMarkup();
      this.drawn = true;
    }
    // Make sure the label gets drawn:
    this.refresh();
  },
  _cellRect: function(_row, _col) {
    var _rect = new HRect(_col * (this.cellSize.x + this.interCell.x),
                          _row * (this.cellSize.y + this.interCell.y),
                          0,
                          0);
    //_rect.setSize(this.cellSize);
    _rect.setWidth(Math.floor(this.cellSize.x));
    _rect.setHeight(Math.floor(this.cellSize.y));
    return _rect;
  },
  setSelection: function() {
    
  },
  _drawCellAndColumn: function(_row, _col) {
    var _cell = this.cells[_row][_col];
    var _rect = this._cellRect(_row, _col);
    _cell.rect.offsetTo(_rect.left,_rect.top);
    _cell.rect.setSize(_rect.width,_rect.height);
    _cell.draw();
  },
  refresh: function() {
    if (this.drawn) {
      this.drawRect();
      var i,j;
      var _row1 = 0;
      var _row2 = this._numRows;
      var _col1 = 0;
      var _col2 = this._numCols;
      for (i = _row1; i < _row2; i++) {
        for (j = _col1; j < _col2; j++) {
          this._drawCellAndColumn(i, j);
        }
      }
    }
  }
});
