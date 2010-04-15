/*   Riassence Framework
 *   Copyright 2006 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

// Simple view for centering a view.
// The rect's left position is used as the minimum left position, the rects
// top and width are used as-is and the HCenterView itself is geometrically
// centered inside its parent by adjusting its "left" style property.
// Designed to be used as a root-level view, listens to the resize event and
// re-calculates the center position accordingly. Likely to evolve a lot still.
HCenterView = HControl.extend({
  defaultEvents: {
    resize: true
  },
  drawRect: function(_selfCalled){
    this.base();
    if(!_selfCalled){
      this.resize();
    }
  },
  minLeft: false,
  resize: function(){
    if(this.minLeft === false){
      this.minLeft = this.rect.left;
    }
    var
    _rect = this.rect,
    _winSize = ELEM.windowSize(),
    _winWidth = _winSize[0],
    _winHeight = _winSize[1],
    _rectWidth = _rect.width,
    _rectWidthHalf = Math.floor(_rectWidth/2),
    _winWidthHalf = Math.floor(_winWidth/2),
    _left = _winWidthHalf - _rectWidthHalf;
    if( _left < this.minLeft ){
      _left = this.minLeft;
    }
    _rect.offsetTo( _left, _rect.top );
    this.drawRect(true);
  }
});
