/*   Riassence Framework
 *   Copyright 2009 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

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
      try {
        this.listItemViews[i].die();
      }
      catch(e) {
        console.log('HRadiobuttonList, setListItems item destruction error: ',e);
      }
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
      this.listItemViews[i] = _radioButton;
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
      if(_listItems[ this.value ] !== undefined){
        this.parent.setValue( _listItems[ this.value ][0] );
      }
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
          this.radioButtonResponder.setValue( -1 );
          this.radioButtonResponder.setValue( i );
          break;
        }
      }
    }
  }
});















