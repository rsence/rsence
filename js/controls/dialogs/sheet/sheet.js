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
      _rect = _this.rect,
      _width = _rect.width,
      _top = _rect.top,
      _left = 0-Math.floor(_rect.width/2)+_rect.left,
      _height = _rect.height,
      _styles = [
        'left', '0px',
        'top', '0px',
        'right', '0px',
        'bottom', '0px',
        'width', 'auto',
        'height', 'auto',
        'min-width', _width+'px',
        'min-height', _height+'px'
      ],
      i = 0, _len;;
      for( _len = _styles.length; i < _len; i+=2 ){
        ELEM.setStyle( _elemId, _styles[i], _styles[i+1] );
      }
      if(_this['markupElemIds']){
        var _stateId = _this.markupElemIds['state'];
        _styles = [
          'left', _left+'px',
          'top', _top+'px',
          'width', _width+'px',
          'height', _height+'px'
        ];
        i = 0;
        for( _len = _styles.length; i < _len; i+=2 ){
          ELEM.setStyle( _stateId, _styles[i], _styles[i+1] );
        }
      }
      //-- Show the rectangle once it gets created, unless visibility was set to++
      //-- hidden in the constructor.++
      if(undefined === _this.isHidden || _this.isHidden === false) {
        ELEM.setStyle( _elemId, 'visibility', 'inherit');
      }
      ELEM.setStyle( _elemId, 'display', 'block');
      _this._updateZIndex();
      _this.drawn = true;
    }
    return this;
  }
});

