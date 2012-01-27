/*   RSence
 *   Copyright 2009 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */


/*** = Description
  ** HListItems is uses an array-packed list of hash objects as its value.
  **
  ** == Value as Array of Hashes:
  ** Each item in the array should have a 'label' and a 'value' key.
  ** The 'label' key of each item is used as the label for the HRadiobutton in the list.
  ** The 'value' key of each item is the value used for the output.
  **
  ** == Value as Array of strings or numerals
  ** Each Item like with hash, except the item is both label and value. Each item should
  ** be unique.
  **
  ** == Important
  ** The parent object of a HListItem needs to be a compatible component, like HRadioButtonList.
  **
  ***/
var//RSence.Lists
HListItems = HValueResponder.extend({
  
  constructor: function( _rect, _parent, _options ){
    if( _rect.hasAncestor && _rect.hasAncestor( HView ) ){
      _options = _parent;
      _parent = _rect;
    }
    else {
      console.warn && console.warn( "Warning: the rect constructor argument of HListItems is deprecated." );
    }
    this.parent = _parent;
    if ( this.parent.setListItemResponder ){
      this.parent.setListItemResponder( this );
    }
    else {
      console.log('Warning; parent does not respond to setListItemResponder');
    }
    if (_options instanceof Object) {
      if (_options.valueObj !== undefined) {
        _options.valueObj.bind( this );
      }
      else if(_options.value !== undefined) {
        this.value = _options.value;
        this.refresh();
      }
    }
  },
  
  die: function() {
    var _this = this;
    if(_this.valueObj){
      _this.valueObj.unbind(_this);
      _this.valueObj = null;
    }
    _this.value = null;
  },
  
/** = Description
  * Iterates through this.value array and calls
  * the setListItems function of the parent class.
  *
  **/
  refresh: function(){
    if ( this.value instanceof Array ) {
      this.parent.setListItems( this.value );
    }
  }
});

var
HListItemControl = HControl.extend({

  _cleanListItems: function(_listItemsIn){
    var _listItems = [],
        _row, _rowType,
        _label, _value,
        i = 0;
    for ( ; i < _listItemsIn.length ; i++ ){
      _row = _listItemsIn[i];
      _rowType = COMM.Values.type( _row );
      // console.log('row:',_row,' rowType:',_rowType);
      // hashes
      if ( _rowType === 'h' ) {
        _label = _row.label;
        _value = _row.value;
        if ( _label === undefined || _value === undefined ){
          console.log( "The value or label of row "+_row+" is undefined (ignored)" );
        }
        _listItems.push( [_value, _label] );
      }
      // Arrays as-is
      else if ( _rowType == 'a' ){
        _listItems.push( _row );
      }
      // strings and integers
      else if ( ['s','n'].indexOf(_rowType) !== -1 ){
        _label = _row.toString();
        _value = _row;
        _listItems.push( [_value, _label] );
      }
      else {
        console.log( "The row "+_row+" has an unsupported row type: '"+_rowType+"' (ignored)" );
      }
    }
    return _listItems;
  },

  setListItems: function( _listItems ){
    _listItems = this._cleanListItems(_listItems);
  }

});
