
/*** = Description
  ** This class is still at experimental phase.
  ** Please assume that the API _will_ change later. 
  ** HCheckboxList is a combined list of HCheckboxes.
  **
  ***/
var//RSence.Lists
HCheckboxList = HListItemControl.extend({
  
/** = Description
  * Draws borders with 1px and sets 'overflow' to 'auto'.
  *
  **/
  drawSubviews: function(){
    this.setStyle('border','1px solid #999');
    this.setStyle('border-radius','3px');
    this.setStyle('overflow','auto');
  },
  listItems: [],
  listItemViews: [],
  ListCheckbox: HCheckbox.extend({

  /** = Description
    * Adds listValues to the parent if they are true otherwise deletes them.
    *
    **/
    refreshValue: function(){
      this.base();
      if(this.value === true){
        this.parent.addItem( this.options.listValue );
      }
      else{
        this.parent.delItem( this.options.listValue );
      }
    }
  }), // End ListCheckbox

  setEnabled: function(_state){
    this.base(_state);
    if(!this['listItemViews']){ return; }
    for(var i=0;i<this.listItems.length;i++){
      this.listItemViews[i].setEnabled(_state)
    }
  },

/** = Description
  * Checks if +_listValue+ can be found from the values. Adds the value
  * if it can't be found.
  * 
  * = Parameters
  * +_listValue+:: listValue to add.
  *
  **/
  addItem: function( _listValue ){
    if(!~this.value.indexOf(_listValue)){
      var _newValue = [], i = 0;
      for( ; i < this.value.length; i++ ){
        _newValue.push( this.value[i] );
      }
      _newValue.push( _listValue );
      this.setValue( _newValue );
    }
  },
  
/** = Description
  * Checks if the item can be found from this.value and deletes it
  * in case it can be found.
  *
  * = Parameters
  * +_listValue+:: A listValue to delete.
  *
  **/
  delItem: function( _listValue ){
    var _listIndex = this.value.indexOf(_listValue);
    if(~_listIndex){
      var _newValue = [], i = 0;
      for( ; i < this.value.length; i++ ){
        if(this.value[i] !== _listValue){
          _newValue.push( this.value[i] );
        }
      }
      this.setValue( _newValue );
    }
  },
  
/** = Description
  * Setter function for listItems and listImetViews. Destroys 
  * the old ListCheckboxes before creating the new ones based on the
  * listItems given as an parameter.
  * 
  * = Parameters
  * +_listItems+:: listItems is an array-packed array, where each index in the
  *                surrounding array contains a [ value, label ] pair.
  *                The value is mapped to the value of the HRadiobuttonList
  *                instance when its HRadiobutton instance is selected.
  *
  **/
  setListItems: function(_listItems){
    _listItems = this._cleanListItems(_listItems);
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
      _checked = !!~this.value.indexOf( _value );
      _checkbox = this.ListCheckbox.nu(
        [ 4, (i*23)+4, null, 23, 4, null ],
        this, {
          label: _label,
          value: _checked,
          listValue: _value,
          enabled: this.enabled
        }
      );
      this.listItemViews[i] = _checkbox;
    }
    this.refreshValue();
  },
  
  _listItemResponder: null,
  setListItemResponder: function(_listItemResponder){
    this._listItemResponder = _listItemResponder;
  },
  
/** = Description
  * Sets listItems and ListItemViews to null and calls 
  * the inherited destructor.
  *
  **/
  die: function(){
    if(this._listItemResponder){
      this._listItemResponder.die();
      this._listItemResponder = null;
    }
    this.listItems = null;
    this.listItemViews = null;
    this.base();
  },

/** = Description
  * Checks whether there are listItemViews and if there are, 
  * refreshes their state.
  *
  * = Returns
  * +self+
  * 
  **/
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
      _isSelected = !!~_value.indexOf( _listItemValue );
      this.listItemViews[i].setValue( _isSelected );
      if(_isSelected){
        _selectedItems.push( _listItemValue );
      }
    }
    return this;
  }
});
