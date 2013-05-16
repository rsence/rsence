
var//RSence.Controls
HValidatorView = HControl.extend({

  controlDefaults: (HControlDefaults.extend({
    value: false,
    valueField: false
  })),

  setRect: function(_rect) {
    var _options = this.options;
    if(_options){
      if(_options.valueField){
        _rect.offsetTo(
          _options.valueField.rect.right,
          _options.valueField.rect.top
        );
      }
    }
    this.base(_rect);
  },
  
/** = Description
  * Ensures the value set is a Boolean.
  *
  * = Parameters
  * +_flag+::   True to set the status to selected, false to set to unselected.
  *
  **/
  setValue: function(_flag) {
    if (!_flag && _flag !== false) {
      _flag = false;
    }
    this.base(_flag);
  },

/** = Description
  * Updates the graphics to match the Boolean value.
  *
  **/
  refreshValue: function(){
    var _this = this,
        _value = _this.value,
        _trueValue = _value === true,
        _x = _trueValue?-21:0,
        _y = _this.enabled?0:-21,
        _title = _trueValue?'':_value,
        _elemId = _this.elemId;
    ELEM.setStyle(_elemId,'background-image',"url("+_this.getThemeGfxFile('validator.png')+")");
    ELEM.setStyle(_elemId,'background-repeat','no-repeat');
    ELEM.setStyle(_elemId,'background-position',_x+'px '+_y+'px');
  }

  
});
