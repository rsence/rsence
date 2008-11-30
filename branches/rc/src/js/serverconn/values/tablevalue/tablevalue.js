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

