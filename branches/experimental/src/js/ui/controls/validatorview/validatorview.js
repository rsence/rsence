/*   Riassence Framework
 *   Copyright 2008 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

HValidatorView = HControl.extend({

/** constructor: constructor
  *
  * Parameters:
  *   _rect - An <HRect> object that sets the position and dimensions of this control.
  *   _parent - The parent view that this control is to be inserted in.
  *   _options - (optional) All other parameters. See <HComponentDefaults>.
  **/
  constructor: function(_rect, _parent, _options) {
    if(_options !== undefined){
      if(_options.valueField && _options.valueField.componentBehaviour[1] === 'control'){
        _rect.offsetTo(
          _options.valueField.rect.right,
          _options.valueField.rect.top
        );
      }
    }
    this.base(_rect, _parent, _options);
  },
  
  drawSubviews: function(){
    this.setStyle('background-image',"url('"+this.getThemeGfxFile('validator.png')+"')");
  },
  
/** method: setValue
  * 
  * Sets the selected status of the validator.
  *
  * Parameters:
  *  _flag - True to set the status to selected, false to set to unselected.
  **/
  setValue: function(_flag) {
    if (!_flag && _flag !== false) {
      _flag = false;
    }
    this.base(_flag);
  },
  
  refreshValue: function(){
    var _this = this,
        _value = _this.value,
        _trueValue = _value === true,
        _x = _trueValue?-21:0,
        _y = _this.enabled?0:-21,
        _title = _trueValue?'':_value,
        _setStyle = ELEM.setStyle,
        _elemId = _this.elemId;
    _setStyle(_elemId,'background-repeat','no-repeat');
    ELEM.setAttr(_elemId,'title',_title);
    _setStyle(_elemId,'background-position',_x+'px '+_y+'px');
  }

  
});
