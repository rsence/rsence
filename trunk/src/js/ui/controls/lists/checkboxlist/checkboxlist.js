/**
  * Riassence Core -- http://rsence.org/
  *
  * Copyright (C) 2009 Juha-Jarmo Heinonen <jjh@riassence.com>
  *
  * This file is part of Riassence Core.
  *
  * Riassence Core is free software: you can redistribute it and/or modify
  * it under the terms of the GNU General Public License as published by
  * the Free Software Foundation, either version 3 of the License, or
  * (at your option) any later version.
  *
  * Riassence Core is distributed in the hope that it will be useful,
  * but WITHOUT ANY WARRANTY; without even the implied warranty of
  * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  * GNU General Public License for more details.
  *
  * You should have received a copy of the GNU General Public License
  * along with this program.  If not, see <http://www.gnu.org/licenses/>.
  *
  **/

HCheckboxList = HControl.extend({
  drawSubviews: function(){
    this.setStyle('border','1px solid #999');
    this.setStyle('overflow','auto');
  },
  listItems: [],
  listItemViews: [],
  ListCheckbox: HCheckbox.extend({
    refreshValue: function(){
      this.base();
      if(this.value === true){
        this.parent.addItem( this.options.listValue );
      }
      else{
        this.parent.delItem( this.options.listValue );
      }
    }
  }),
  addItem: function( _listValue ){
    if(this.value.indexOf(_listValue) === -1){
      var _newValue = [], i = 0;
      for( ; i < this.value.length; i++ ){
        _newValue.push( this.value[i] );
      }
      _newValue.push( _listValue );
      this.setValue( _newValue );
    }
  },
  delItem: function( _listValue ){
    var _listIndex = this.value.indexOf(_listValue);
    if(_listIndex !== -1){
      var _newValue = [], i = 0;
      for( ; i < this.value.length; i++ ){
        if(this.value[i] !== _listValue){
          _newValue.push( this.value[i] );
        }
      }
      this.setValue( _newValue );
    }
  },
  /* listItems is an array-packed array, where each index in the
   * surrounding array contains a [ value, label ] pair.
   * The value is mapped to the value of the HRadiobuttonList
   * instance when its HRadiobutton instance is selected.
   */
  setListItems: function(_listItems){
    var _listItem,
        _value,
        _label,
        _checked,
        _checkbox,
        i = 0;
    for ( ; i < this.listItemViews.length; i++ ) {
      try {
        this.listItemViews[i].die();
      }
      catch(e) {
        console.log('HCheckboxList, setListItems item destruction error: ',e);
      }
    }
    this.listItems = _listItems;
    this.listItemViews = [];
    for ( i = 0 ; i < _listItems.length; i++ ){
      _listItem = _listItems[i];
      _value = _listItem[0];
      _label = _listItem[1];
      _checked = (this.value.indexOf( _value ) !== -1);
      _checkbox = this.ListCheckbox.nu(
        [ 4, (i*23)+4, null, 23, 4, null ],
        this, {
          label: _label,
          value: _checked,
          listValue: _value
        }
      );
      this.listItemViews[i] = _checkbox;
    }
    this.refreshValue();
  },
  die: function(){
    this.listItems = null;
    this.listItemViews = null;
    this.base();
  },
  refreshValue: function(){
    if(this.listItemViews.length === 0){
      return this;
    }
    var _value = this.value,
        _listItems = this.listItems,
        _listItemValue,
        _selectedItems = [],
        i = 0,
        _isSelected;
    for( ; i < _listItems.length; i++ ){
      _listItemValue = _listItems[i][0];
      _isSelected = (_value.indexOf( _listItemValue ) !== -1);
      this.listItemViews[i].setValue( _isSelected );
      if(_isSelected){
        _selectedItems.push( _listItemValue );
      }
    }
    return this;
  }
});