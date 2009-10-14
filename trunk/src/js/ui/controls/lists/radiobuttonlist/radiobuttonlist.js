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

/** HRadiobuttonList expects the setListItems to be set. See HListItems.
  * The value of the instance is the selected key in the listItems.
  **/
HRadiobuttonList = HControl.extend({
  drawSubviews: function(){
    this.setStyle('border','1px solid #999');
    this.setStyle('overflow-y','auto');
  },
  listItems: [],
  listItemViews: [],
  /* listItems is an array-packed array, where each index in the
   * surrounding array contains a [ value, label ] pair.
   * The value is mapped to the value of the HRadiobuttonList
   * instance when its HRadiobutton instance is selected.
   */
  setListItems: function(_listItems){
    var _listItem,
        _value,
        _label,
        _radioButton,
        i = 0;
    for ( ; i < this.listItemViews.length; i++ ) {
      this.listItemViews[i].die();
    }
    this.listItems = _listItems;
    this.listItemViews = [];
    for ( i = 0 ; i < _listItems.length; i++ ){
      _listItem = _listItems[i];
      _value = _listItem[0];
      _label = _listItem[1];
      _radioButton = HRadiobutton.nu(
        [ 4, (i*23)+4, null, 23, 4, null ],
        this, {
          label: _label
        }
      );
    }
    this.refreshValue();
  },
  die: function(){
    this.listItems = null;
    this.listItemViews = null;
    this.radioButtonIndexValue.die();
    this.base();
  },
  radioButtonIndexValue: false,
  radioButtonResponder: false,
  RadioButtonIndexResponder: HValueResponder.extend({
    constructor: function( _parent, _valueObj ){
      this.parent = _parent;
    },
    refresh: function(){
      var _listItems = this.parent.listItems;
      this.parent.setValue( _listItems[ this.value ][0] );
    }
  }),
  refreshValue: function(){
    var _value = this.value;
    if ( this.listItems.length !== 0 && this['valueMatrix'] !== undefined ) {
      if ( this.radioButtonResponder === false ){
        this.radioButtonIndexValue = HValue.nu( false, 0 );
        this.radioButtonIndexValue.bind( this.valueMatrix );
        this.radioButtonResponder = this.RadioButtonIndexResponder.nu( this );
        this.radioButtonIndexValue.bind( this.radioButtonResponder );
      }
      for ( var i = 0; i < this.listItems.length; i++ ) {
        if ( this.listItems[i][0] === _value ) {
          this.radioButtonResponder.setValue( i );
          break;
        }
      }
    }
  }
});















