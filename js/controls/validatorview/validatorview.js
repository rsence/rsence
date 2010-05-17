/*   Riassence Framework
 *   Copyright 2008 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

HValidatorView = HControl.extend({

  controlDefaults: (HControlDefaults.extend({
    value: false
  })),

  constructor: function(_rect, _parent, _options) {
    if(_options){
      if(_options.valueField && _options.valueField.componentBehaviour[1] === 'control'){
        _rect.offsetTo(
          _options.valueField.rect.right,
          _options.valueField.rect.top
        );
      }
    }
    this.base(_rect, _parent, _options);
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
