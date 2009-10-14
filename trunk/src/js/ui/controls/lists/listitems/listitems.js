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

/** HListItems is uses an array-packed list of "hash" objects as its value.
  * - Each item in the array should have a 'label' and a 'value' key.
  * - The 'label' key of each item is used as the label for the HRadiobutton in the list.
  * - The 'value' key of each item is the value used for the output.
  * The parent object of a HListItem needs to be a compatible hash, like HRadiobuttonList.
  **/
HListItems = HValueResponder.extend({
  constructor: function( _rect, _parent, _options ){
    this.parent = _parent;
    if (_options instanceof Object) {
      if (_options['valueObj'] !== undefined) {
        _options.valueObj.bind( this );
      }
    }
  },
  _warningMessage: function(_messageText){
    console.log("Warning; HListItems: "+_messageText);
  },
  refresh: function(){
    if ( this.value instanceof Array ) {
      var _listItems = [],
          _row,
          _label, _value,
          i = 0;
      for ( ; i < this.value.length ; i++ ){
        _row = this.value[i];
        if ( _row instanceof Object ) {
          _label = _row['label'];
          _value = _row['value'];
          if ( _label === undefined || _value === undefined ){
            this._warningMessage( "The value or label of row "+_row+" is undefined (ignored)" );
          }
          _listItems.push( [_value, _label] );
        }
        else {
          this._warningMessage( "The row "+_row+" is not an object (ignored)" );
        }
      }
      this.parent.setListItems( _listItems );
    }
  }
});


