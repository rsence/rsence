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
  ** it's hidden. It expands to fill its parent view, the rect 
  ** specifies the size of the sheet inside. The sheet is 
  ** centered. It's practical when combined with button 
  ** values. Also see HAlertSheet and HConfirmSheet components.
  **
  ***/
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
      var _this = this,
          _elemId = _this.elemId,
          _styl = ELEM.setStyle,
          _rect = _this.rect,
          _width = _rect.width,
          _left = 0-Math.floor(_rect.width/2),
          _height = _rect.height;
      
      _styl( _elemId, 'left', '0px', true);
      _styl( _elemId, 'top', '0px', true);
      _styl( _elemId, 'right', '0px', true);
      _styl( _elemId, 'bottom', '0px', true);
      _styl( _elemId, 'width', 'auto', true);
      _styl( _elemId, 'height', 'auto', true);
      _styl( _elemId, 'min-width', _width+'px', true);
      _styl( _elemId, 'min-height', _height+'px', true);
      
      if(_this['markupElemIds']){
        var _stateId = _this.markupElemIds['state'];
        _styl( _stateId, 'left', _left+'px', true );
        _styl( _stateId, 'top', '0px', true );
        _styl( _stateId, 'width', _width+'px', true );
        _styl( _stateId, 'height', _height+'px', true );
      }
      //-- Show the rectangle once it gets created, unless visibility was set to++
      //-- hidden in the constructor.++
      if(undefined === _this.isHidden || _this.isHidden === false) {
        _styl( _elemId, 'visibility', 'inherit', true);
      }
      _styl( _elemId, 'display', 'block', true);
      _this._updateZIndex();
      _this.drawn = true;
    }
    return this;
  }
});

