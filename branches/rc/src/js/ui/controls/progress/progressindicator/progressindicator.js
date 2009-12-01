/*   Riassence Framework
 *   Copyright 2006 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

/*** = Description
  ** A progress indicator is the indeterminate progress bar, which is used in 
  ** situations where the extent of the task is unknown or the progress of 
  ** the task can not be determined in a way that could be expressed as a 
  ** percentage. This bar uses motion or some other indicator to show that 
  ** progress is taking place, rather than using the size of the filled portion
  ** to show the total amount of progress.
  ***/
HProgressIndicator = HView.extend({
  _indicator: null,
  _animDirection: 0,
  drawSubviews: function(){
    var _this = this;
    _this.setStyle( 'border', '1px solid #999' );
    _this.setStyle( 'background-color', '#ccc' );
    var _height = _this.rect.height,
        _width = ELEM.getVisibleSize( _this.elemId )[0]-2;
    _this['_rect'+0] = HRect.nu( 0,0,_height,_height );
    _this['_rect'+1] = HRect.nu( _width-_height, 0, _width, _height );
    _this._indicator = HView.nu( HRect.nu( _this['_rect'+0] ), _this );
    _this._indicator.setStyle('background-color','#333');
    _this._indicator.onAnimationEnd = function(){
      this.parent._toggleDirection();
    };
    _this._toggleDirection();
  },
  _toggleDirection: function(){
    this._animDirection = this._animDirection===1?0:1;
    var _directionRect = HRect.nu( this['_rect'+this._animDirection] );
    this._indicator.animateTo(_directionRect);
  }
});

