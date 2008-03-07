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


// These buttons are at the bottom of the view, used to select actions
_dbCommandButton = SmallButton.extend({
  flexTop: false,
  flexBottom: true,
  flexBottomOffset: 0,
  constructor: function(_posL,_posR,_parent,_label,_actionVal){
    var _rect = new HRect(_posL,0,_posR,21);
    var _options = {
      label: _label,
      events: {mouseDown:true},
      actionVal: _actionVal
    };
    this.base(_rect,_parent,_options);
  },
  setDefaultResponder: function(_flag){
    if(_flag){
      this.setStyle('border-top','2px solid #fc0');
    } else {
      this.setStyle('border-top','0px');
    }
  }
});

// This is a textfield used for entering field names
_dbFieldNameEditor = SmallTextField.extend({
  flexTop: false,
  flexBottom: true,
  flexBottomOffset: 26,
  //flexRight: true,
  //flexRightOffset: 384,
  constructor: function(_left,_right,_parent){
    var _rect = new HRect(_left,0,_right,21);
    this.base(_rect,_parent);
  }
});



//// Field viewer

/// Columns and rows..

// This is a row in the column, as simple as possible,
// builds its position, size and even/odd stripe based on the itemnum
_dbFieldViewerRow = HControl.extend({
  componentName: 'fieldviewer_row',
  constructor: function(_width,_itemNum,_parent,_label,_rowId){
    var _top = (_itemNum*19)+_itemNum+1; // 20px offset to make 1px vertical spacers
    var _rect = new HRect(0,_top,_width,_top+19);
    this.base(_rect,_parent);
    this.rowId = _rowId;
    if((_itemNum%2)==0){
      this.origBgColor = '#f6f8fa';
    } else {
      this.origBgColor = '#f0f2f4';
    }
    var _style = [
      ['padding-left',  '8px'],
      ['white-space',   'nowrap'],
      ['font-family',   'Futura, Trebuchet MS, Arial, sans-serif'],
      ['font-size',     '11px'],
      ['line-height',   '21px'],
      ['cursor',        'pointer'],
      ['vertical-align','middle'],
      ['color',         '#666']
    ];
    if(_parent.colNum==0){
      _style[0][1] = '20px';
      _style.push(
        ['background-image',
        "url('"+this.getThemeGfxFile("fieldviewer_row_checkmark.png")+"')"]
      );
      _style.push(['background-repeat','no-repeat']);
      _style.push(['background-position','0px 0px']);
    }
    for(var i=0;i<_style.length;i++){
      this.setStyle(_style[i][0],_style[i][1]);
    }
    this.setHTML(_label);
    this.setMouseDown(true);
    this.hiliteRow(false);
  },
  mouseDown: function(_x,_y,_b){
    this.parent.selectRow(this.rowId);
  },
  hiliteRow: function(_flag){
    if(_flag){
      if(this.parent.colNum==0){
        this.setStyle('background-position','0px -19px');
      }
      this.setStyle('background-color','#fff');
      this.setStyle('border-bottom','1px solid #fc0');
      this.setStyle('margin-top','-1px');
      this.setStyle('border-top','1px solid #fc0');
    } else {
      if(this.parent.colNum==0){
        this.setStyle('background-position','0px 0px');
      }
      this.setStyle('background-color',this.origBgColor);
      this.setStyle('border-bottom','0');
      this.setStyle('margin-top','0');
      this.setStyle('border-top','0');
    }
  }
});

// these columns contain rows
_dbFieldViewerColumn = HControl.extend({
  constructor: function(_posL,_posR,_parent,_colNum){
    var _rect = new HRect(_posL,0,_posR,20);
    this.base(_rect,_parent);
    this.colNum = _colNum;
  },
  setValue: function(_rows){
    if(_rows!=this.value){
      this.parent.clearRows(this.colNum);
      for (var i = 0; i < this.views.length; i++) {
        if (this.views[i]) {
          this.views[i].die();
        }
      }
      this.rect.setHeight((20*_rows.length)+1);
      this.drawRect();
      var _width = this.rect.width;
      var _rowId, _label, _rowItem;
      for (var _itemNum = 0; _itemNum < _rows.length; _itemNum++) {
        _rowId = _rows[_itemNum][0];
        _label = _rows[_itemNum][1];
        _rowItem = new _dbFieldViewerRow(_width,_itemNum,this,_label,_rowId);
        this.parent.addRow(_rowId,_label,this.colNum,_rowItem);
      }
    }
    this.base(_rows);
  },
  selectRow: function(_rowId){
    this.parent.setValue(_rowId);
  }
});

_dbFieldViewerColumns = HControl.extend({
  flexBottom: true,
  constructor: function(_colPos,_parent,_nameColId,_typeColId){
    var _width = _parent.rect.width;
    var _height = _parent.rect.height;
    var _rect = new HRect(0,22,_width,_height);
    this.base(_rect,_parent);
    this.setStyle('overflow','auto');
    this.nameRows = [];
    this.nameColumn = new _dbFieldViewerColumn(0,_colPos,this,0);
    var _nameColVal = HVM.values[_nameColId];
    _nameColVal.bind(this.nameColumn);
    this.typeRows = [];
    this.typeColumn = new _dbFieldViewerColumn(_colPos+1,_width,this,1);
    var _typeColVal = HVM.values[_typeColId];
    _typeColVal.bind(this.typeColumn);
    this._prevSelected = -1;
  },
  clearRows: function(_colId){
    if(_colId == 0){
      this.nameRows = [];
    } else if (_colId == 1){
      this.typeRows = [];
    }
  },
  addRow: function(_rowId,_label,_colNum,_rowItem){
    if(_colNum==0){
      var _colRows = this.nameRows;
    } else {
      var _colRows = this.typeRows;
    }
    _colRows[_rowId] = _rowItem;
  },
  setValue: function(_rowId){
    if(this.value!=_rowId && this.nameRows){
      if(this.previouslyHilited){
        this.nameRows[this.previouslyHilited].hiliteRow(false);
        this.typeRows[this.previouslyHilited].hiliteRow(false);
      }
      if(this.nameRows[_rowId]){
        this.nameRows[_rowId].hiliteRow(true);
        this.typeRows[_rowId].hiliteRow(true);
        this.previouslyHilited = _rowId;
      }
    }
    this.base(_rowId);
  }
});

_dbFieldViewer = HControl.extend({
  flexBottom: true,
  flexBottomOffset: 51,
  constructor: function(_colPos,_parent,_selectedRowId,_nameColId,_typeColId){
    var _rect = new HRect(0,0,_parent.rect.width,100);
    this.base(_rect,_parent);
    this.cols = new _dbFieldViewerColumns(_colPos,this,_nameColId,_typeColId);
    HVM.values[_selectedRowId].bind(this.cols);
    // make divider lines
    var _divLineId;
    var _divLines = [
      // Label for field names
      [  'Field Name',
        ['left',      '0px'],
        ['padding-left','20px'],
        ['top',       '0px'],
        ['font-size', '11px'],
        ['width',     _colPos+'px'],
        ['height',    '21px'],
        ['line-height','21px'],
        ['vertical-align','middle'],
        ['color','#666'],
        ['border-bottom','1px solid #eee']
      ],
      // Label for field types
      [  'Field Type',
        ['left',      _colPos+'px'],
        ['padding-left','8px'],
        ['font-size', '11px'],
        ['top',       '0px'],
        ['right',     '0px'],
        ['height',    '21px'],
        ['line-height','21px'],
        ['vertical-align','middle'],
        ['color','#666'],
        ['border-left','1px solid #eee'],
        ['border-bottom','1px solid #eee']
      ]
    ];
    for(var i=0;i<_divLines.length;i++){
      _divLineId = elem_mk(this.elemId);
      prop_set(_divLineId,'position','absolute',true);
      elem_set(_divLineId,_divLines[i][0]);
      for(var j=1;j<_divLines[i].length;j++){
        prop_set(_divLineId,_divLines[i][j][0],_divLines[i][j][1]);
      }
    }
  }
});

DBEditor = HControl.extend({
  constructor: function(_parent,
      _cmdId,_rowNameId,_rowTypeId,        // for editor
      _selectedRowId,_nameColId,_typeColId // for viewer
    ){
    var _cmdVal = HVM.values[_cmdId];
    var _rowNameVal = HVM.values[_rowNameId];
    var _rowTypeVal = HVM.values[_rowTypeId];
    var _rect = new HRect(_parent.rect);
    _rect.offsetTo(0,0);
    _rect.insetBy(8,8);
    this.base(_rect,_parent);
    this.setStyle('overflow','visible');
    this.setStyle('border','1px solid #fcfcfc');
    // make buttons for commands:
    var _cmdButtons = [
      ['Create',     1, true  ],
      ['Modify',     2, false ],
      ['Delete',     3, false ],
      ['Options...', 4, false ]
    ];
    var _posL = 0;
    var _avgW = parseInt((this.rect.width/4),10);
    var _btnW = parseInt((this.rect.width/5),10);
    var _btnSpc = (_avgW - _btnW)/3;
    var _posR = _posL + _btnW;
    var _label, _actionVal, _defaultResponder, _cmdButton;
    for(var i=0;i<4;i++){
      _label = _cmdButtons[i][0];
      _actionVal = _cmdButtons[i][1];
      _defaultResponder = _cmdButtons[i][2];
      _cmdButton = new _dbCommandButton(_posL,_posR,this,_label,_actionVal);
      _cmdButton.setDefaultResponder(_defaultResponder);
      _cmdVal.bind(_cmdButton);
      _posL += _avgW + _btnSpc;
      _posR = _posL + _btnW;
    }
    // make divider lines
    var _divLineId;
    var _divLines = [
      // Horiz line between buttons and text fields:
      [ ['left',      '0px'],
        ['bottom',    '23px'],
        ['right',     '0px'],
        ['height',    '1px'],
        ['background-color','#eee']
      ],
      // Horiz line between text fields :
      [ ['left',      '0px'],
        ['bottom',    '49px'],
        ['right',     '0px'],
        ['height',    '1px'],
        ['background-color','#eee']
      ]
    ];
    for(var i=0;i<_divLines.length;i++){
      _divLineId = elem_mk(this.elemId);
      prop_set(_divLineId,'position','absolute',true);
      for(var j=0;j<_divLines[i].length;j++){
        prop_set(_divLineId,_divLines[i][j][0],_divLines[i][j][1]);
      }
    }
    
    
    // make name editing text field:
    var _nameEditLabelPref = [
      ['position','absolute'],
      ['left',  '8px'],
      ['white-space','nowrap'],
      ['font-family','Futura, Trebuchet MS, Arial, sans-serif'],
      ['font-size','11px'],
      ['bottom', '26px'],
      ['height', '21px'],
      ['line-height','21px'],
      ['vertical-align','middle'],
      ['color', '#666']
    ];
    var _nameEditLabelElemId = elem_mk(this.elemId);
    for(var i=0;i<_nameEditLabelPref.length;i++){
      prop_set(_nameEditLabelElemId,_nameEditLabelPref[i][0],_nameEditLabelPref[i][1],true);
    }
    elem_set(_nameEditLabelElemId,'Field Name:');
    var _left = parseInt(prop_get(_nameEditLabelElemId,'width',true),10)+16;
    var _right = this.rect.width-200;
    this.nameEdit = new _dbFieldNameEditor(_left,_right,this);
    _rowNameVal.bind(this.nameEdit);
    var _colPos = _right + 8;
    // make type editing field:
    var _typeEditLabelPref = [
      ['position','absolute'],
      ['left',  (_right+16)+'px'],
      ['white-space','nowrap'],
      ['font-family','Futura, Trebuchet MS, Arial, sans-serif'],
      ['font-size','11px'],
      ['bottom', '27px'],
      ['height', '21px'],
      ['line-height','21px'],
      ['vertical-align','middle'],
      ['color', '#666']
    ];
    var _typeEditLabelElemId = elem_mk(this.elemId);
    for(var i=0;i<_typeEditLabelPref.length;i++){
      prop_set(_typeEditLabelElemId,_typeEditLabelPref[i][0],_typeEditLabelPref[i][1],true);
    }
    elem_set(_typeEditLabelElemId,'Field Type:');
    _left =  _right + parseInt(prop_get(_typeEditLabelElemId,'width',true),10)+24;
    _right = this.rect.width;
    this.typeEdit = new _dbFieldNameEditor(_left,_right,this);
    _rowTypeVal.bind(this.typeEdit);
    // field viewer:
    this.fieldView = new _dbFieldViewer(_colPos,this,_selectedRowId,_nameColId,_typeColId);
  }
});