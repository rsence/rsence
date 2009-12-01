/*   Riassence Framework
 *   Copyright 2008 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

/** class: HWindow
  *
  * Simple window component.
  *
  * Extends:
  *  <HDynControl>
  *
  * See Also:
  *  <HDynControl> <HControl> <HView>
  *
  **/
HWindow = HDynControl.extend({
  
  componentName:      'window',
  
  // HWindow has a few extra options, like the close/collapse/zoom buttons, see below
  constructor: function(_rect,_parentApp,_options){
    
    if(!_options) {
      _options={};
    }
    
    var _defaults = HClass.extend({
      minSize:   [96,54],
      maxSize:   [16000,9000],
      resizeW:   4,
      resizeE:   4,
      resizeN:   4,
      resizeS:   4,
      resizeNW:  [ 6, 6 ],
      resizeNE:  [ 6, 6 ],
      resizeSW:  [ 6, 6 ],
      resizeSE:  [ 16, 16 ],
      noResize:  false,
      
      // set to true, if you want all of the window area to be draggable.
      // false means only the titlebar is draggable
      fullWindowMove: false,
      
      // set to true, if you want a close box for the window
      closeButton: false,
      
      // set to true, if you want a collapse (minimize) button for the window
      collapseButton: false,
      
      // set to true, if you want a zoom (maximize/restore) button for the window
      zoomButton: false
    });
    _options = new (_defaults.extend(_options))();
    if(_options.noResize){
      _options.minSize = [_rect.width,_rect.height];
      _options.maxSize = [_rect.width,_rect.height];
      _options.resizeW = 0;
      resizeE = 0;
      resizeN = 0;
      resizeS = 0;
      resizeNW = [0,0];
      resizeNE = [0,0];
      resizeSW = [0,0];
      resizeSE = [0,0];
    }
    this.base(_rect,_parentApp,_options);
    HSystem.windowFocus(this);
  },
  
  // overrides the drag rules to adapt to the !fullWindowMove as well
  // as disabling draggability in window button areas.
  makeRectRules: function(){
    var _this = this,
        _rectRules = _this.base(),
        _rect = _this.rect,
        _opts = _this.options,
        _leftPx=_opts.resizeW;
    if(!_opts.fullWindowMove){
      if(_opts.zoomButton){
        _leftPx = 61;
      }
      else if(_opts.collapseButton){
        _leftPx = 46;
      }
      else if(_opts.closeButton){
        _leftPx = 27;
      }
      _rectRules[8] = [_leftPx,_opts.resizeN,_rect.width-_opts.resizeE,25];
    }
    return _rectRules;
  },
  
  // Reports to HSystem that this window has the focus and the previously active window needs to blur
  gainedActiveStatus: function(){
    HSystem.windowFocus(this);
  },
  
  // HSystem calls this method, whenever this window is allowed to be focused
  windowFocus: function(){
    this.toggleCSSClass(this.elemId, 'inactive', false);
  },
  
  // HSystem calls this method, whenever this window needs to lose its focus (another window focused)
  windowBlur: function(){
    this.toggleCSSClass(this.elemId, 'inactive', true);
    this.setStyle('cursor','default');
  },
  
  // This method gets called, whenever the close button has been clicked
  windowClose: function(){
    this.die(); // extend this to this.app.die(), if your app needs to die instead of just the window
  },
  
  // This method gets called, whenever the collapse (minimize) button has been clicked
  windowCollapse: function(){
    // extend with your app-specific behaviour
  },
  
  // This method gets called, whenever the zoom (maximize/restore) button has been clicked
  windowZoom: function(){
    // extend with your app-specific behaviour
  }
});

