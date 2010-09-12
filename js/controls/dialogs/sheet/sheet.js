/*   RSence
 *   Copyright 2009 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */


/*** = Description
  ** HSheet is a container component that toggles its visibility
  ** based on its value. When the value is 0, it's visible, otherwise 
  ** it's hidden. It expands to fill its parent view.
  ** 
  ** Its rect specifies the relative size and position of the centered inner
  ** sheet, which acts as a subview.
  ** 
  ** It's practical when combined with button values.
  ** 
  ** Also see HAlertSheet and HConfirmSheet components.
  ** 
  ***/
var//RSence.Controls
HSheet = HControl.extend({
  
  componentName: 'sheet',
  
/** = Description
  * Shows of hides HSheet depending on the value.
  * If the value is 0 the HSheet#show() will be called. 
  * Otherwise HSheet#hide() is called.
  *
  **/
  refreshValue: function(){
    if(this.value===0){
      this.show();
    }
    else{
      this.hide();
    }
  },
  
/** = Description
  * Draws the sheet rectangle once it has been created and 
  * if it has not been set as hidden by constructor.
  *
  * = Returns
  * +self+
  
  **/
  drawRect: function() {
    if (this.parent && this.rect.isValid) {
      var
      _this = this,
      _elemId = _this.elemId,
      _styl = ELEM.setStyle,
      _rect = _this.rect,
      _width = _rect.width,
      _top = _rect.top,
      _left = 0-Math.floor(_rect.width/2)+_rect.left,
      _height = _rect.height;
      
      _styl( _elemId, 'left', '0px');
      _styl( _elemId, 'top', '0px');
      _styl( _elemId, 'right', '0px');
      _styl( _elemId, 'bottom', '0px');
      _styl( _elemId, 'width', 'auto');
      _styl( _elemId, 'height', 'auto');
      _styl( _elemId, 'min-width', _width+'px');
      _styl( _elemId, 'min-height', _height+'px');
      
      if(_this['markupElemIds']){
        var _stateId = _this.markupElemIds['state'];
        _styl( _stateId, 'left', _left+'px' );
        _styl( _stateId, 'top', _top+'px' );
        _styl( _stateId, 'width', _width+'px' );
        _styl( _stateId, 'height', _height+'px' );
      }
      //-- Show the rectangle once it gets created, unless visibility was set to++
      //-- hidden in the constructor.++
      if(undefined === _this.isHidden || _this.isHidden === false) {
        _styl( _elemId, 'visibility', 'inherit');
      }
      _styl( _elemId, 'display', 'block');
      _this._updateZIndex();
      _this.drawn = true;
    }
    return this;
  }
});

