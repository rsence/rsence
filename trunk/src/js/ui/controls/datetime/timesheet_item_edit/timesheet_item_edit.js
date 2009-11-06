/*   Riassence Framework
 *   Copyright 2009 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

HTimeSheetEditor = HControl.extend({
  timeSheetItem: false,
  createId: 0,
  setTimeSheetItem: function(_timeSheetItem){
    this.timeSheetItem = _timeSheetItem;
    this.textField.setValue( _timeSheetItem.label );
  },
  show: function(){
    if(this.timeSheetItem!==false){
      var _newRect = HRect.nu(this.timeSheetItem.rect);
      if(_newRect.height < 40){
        _newRect.setHeight( 40 );
      }
      if(_newRect.width < 200){
        _newRect.setWidth( 200 );
      }
      var _timeSheetItemParentRect = this.timeSheetItem.parent.rect;
      _newRect.offsetBy( _timeSheetItemParentRect.left, _timeSheetItemParentRect.top );
      this.setRect( _newRect );
      this.drawRect();
    }
    this.base();
  },
  hide: function(){
    this.base();
  },
  origParent: null,
  createItem: function( _properties ){
    if(_properties['id'] === undefined){
      this.createId--;
      _properties['id'] = this.createId;
    }
    var _value = COMM.Values.clone( this.value ),
        _create = _value['create'],
        i = 0,
        _item = false;
    for(;i<_create.length;i++){
      if(_create[i]['id'] === _properties['id']){
        _item = _create[i];
        break;
      }
    }
    if(!_item){
      _create.push( _properties );
    }
    else {
      for( var _key in _properties ){
        _item[_key] = _properties[_key];
      }
    }
    this.setValue( _value );
  },
  modifyItem: function( _properties ){
    if(_properties['id'] < 0){
      this.createItem( _properties );
    }
    else {
      var _value = COMM.Values.clone( this.value ),
          _modify = _value['modify'],
          i = 0,
          _item = false;
      for(;i<_modify.length;i++){
        if(_modify[i]['id'] === _properties['id']){
          _item = _modify[i];
          break;
        }
      }
      if(!_item){
        _modify.push( _properties );
      }
      else {
        for( var _key in _properties ){
          _item[_key] = _properties[_key];
        }
      }
      this.setValue( _value );
    }
  },
  deleteItem: function( _itemId ){
    var _value = COMM.Values.clone( this.value );
    if(_value['delete'].indexOf( _itemId ) === -1){
      _value['delete'].push( _itemId );
      this.setValue( _value );
    }
  },
  refreshValue: function(){
    var _value = COMM.Values.clone( this.value ),
        i = 0,
        _parent = this.origParent?this.origParent:this.parent,
        _listItemViews = _parent.listItemViews,
        _response = _value['response'],
        _item,
        _itemValue,
        _responseItem,
        j, k;
    for( ; i < _response.length; i++ ){
      for( j = 0; j < _listItemViews.length; j++ ){
        _responseItem = _response[i];
        _item = _listItemViews[j];
        if( _item.value['id'] === _responseItem['id'] ){
          _itemValue = COMM.Values.clone( _item.value );
          if(_responseItem['modify'] !== undefined){
            for( k in _responseItem['modify'] ){
              _itemValue[k] = _responseItem['modify'][k];
            }
            _item.setValue( _itemValue );
          }
        }
      }
    }
    _value['response'] = [];
    this.setValue( _value );
  },
  drawSubviews: function(){
    this.origParent = this.parent;
    this.remove();
    this.origParent.parent.addView( this );
    ELEM.append( this.elemId, this.parent.elemId );
    this.textField = HTextArea.nu(
      [0,0,null,20,0,26],
      this, {
        value: ''
      }
    );
    this.delButton = HButton.extend({
      click: function(){
        this.parent.hide();
        var _sheetItem = this.parent.timeSheetItem;
        if(_sheetItem!==false){
          this.parent.deleteItem( _sheetItem.value['id'] );
          _sheetItem.die();
          var _parent = this.parent.origParent?this.parent.origParent:this.parent.parent;
          var _sheetIdx = _parent.listItemViews.indexOf( _sheetItem );
          _parent.listItemViews.splice( _sheetIdx, 1 );
          this.parent.timeSheetItem = false;
        }
      }
    }).nu(
      [2,null,60,24,null,0],
      this, {
        label: 'Delete',
        events: {
          click: true
        }
      }
    );
    this.okButton = HButton.extend({
      click: function(){
        this.parent.hide();
        if(this.parent.timeSheetItem!==false){
          var _label = this.parent.textField.getTextFieldValue(),
              _id = this.parent.timeSheetItem.value['id'],
              _data = this.parent.timeSheetItem.value;
          _data['label'] = _label;
          this.parent.modifyItem( _data );
          this.parent.timeSheetItem.setTimeSheetItemLabel( _label );
          this.parent.timeSheetItem = false;
        }
      }
    }).nu(
      [null,null,60,24,2,0],
      this, {
        label: 'Save',
        events: {
          click: true
        }
      }
    );
    this.cancelButton = HButton.extend({
      click: function(){
        this.parent.hide();
        if(this.timeSheetItem!==false){
          this.parent.timeSheetItem = false;
        }
      }
    }).nu(
      [null,null,60,24,66,0],
      this, {
        label: 'Cancel',
        events: {
          click: true
        }
      }
    );
    this.textField.setStyle('text-align','center');
    this.textField.setStyle('line-height','12px');
    this.textField.setStyle('font-size','12px');
    this.textField.setStyle('font-family','Arial, sans-serif');
    this.origParent.setEditor( this );
  }
});

