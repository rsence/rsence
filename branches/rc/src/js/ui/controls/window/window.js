/***
  ** Himle Client -- http://himle.org/
  **
  ** Copyright (C) 2008 Juha-Jarmo Heinonen
  **
  ** This file is part of Himle Client.
  **
  ** Himle Client is free software: you can redistribute it and/or modify
  ** it under the terms of the GNU General Public License as published by
  ** the Free Software Foundation, either version 3 of the License, or
  ** (at your option) any later version.
  **
  ** Himle Client is distributed in the hope that it will be useful,
  ** but WITHOUT ANY WARRANTY; without even the implied warranty of
  ** MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  ** GNU General Public License for more details.
  **
  ** You should have received a copy of the GNU General Public License
  ** along with this program.  If not, see <http://www.gnu.org/licenses/>.
  **
  ***/

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
    
    // the parent of HWindow has to be an HApplication instance
    if(_parentApp.componentBehaviour[0]!='app'){
      throw( "Himle.ComponentParentError: HWindow parent must be an HApplication instance!" );
    }
    
    
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

