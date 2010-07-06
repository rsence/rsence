/*   RSence
 *   Copyright 2010 Riassence Inc.
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
var//RSence.Views
HCenterView = HControl.extend({
  defaultEvents: {
    resize: true
  },
  controlDefaults: HControlDefaults.extend({
    centerX: true,
    centerY: false
  }),
  drawRect: function(_selfCalled){
    this.base();
    if(!_selfCalled){
      this.resize();
    }
  },
  minLeft: false,
  minTop: false,
  resize: function(){
    if(this.minLeft === false){
      this.minLeft = this.rect.left;
    }
    if(this.minTop === false){
      this.minTop = this.rect.top;
    }
    var
    _rect = this.rect,
    _winSize = ELEM.windowSize(),
    _winWidth = _winSize[0],
    _winHeight = _winSize[1],
    _rectWidth = _rect.width,
    _rectWidthHalf = Math.floor(_rectWidth/2),
    _winWidthHalf = Math.floor(_winWidth/2),
    _left = _winWidthHalf - _rectWidthHalf,
    _rectHeight = _rect.height,
    _rectHeightHalf = Math.floor(_rectHeight/2),
    _winHeightHalf = Math.floor(_winHeight/2),
    _top = _winHeightHalf - _rectHeightHalf;
    if (!this.options.centerX){
      _left = _rect.left;
    }
    else if( _left < this.minLeft ){
      _left = this.minLeft;
    }
    if (!this.options.centerY){
      _top = _rect.top;
    }
    else if( _top < this.minTop ){
      _top = this.minTop;
    }
    _rect.offsetTo( _left, _top );
    this.drawRect(true);
  }
});

var//RSence.Views
HMiddleView = HCenterView.extend({
  controlDefaults: HControlDefaults.extend({
    centerX: false,
    centerY: true
  })
});
