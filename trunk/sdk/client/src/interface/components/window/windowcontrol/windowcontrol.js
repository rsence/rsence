/***  HIMLE RIA SYSTEM
  ** 
  **  Copyright (C) 2008 HIMLE GROUP http://himle.sorsacode.com/
  **  Copyright (C) 2006-2007 Helmi Technologies Inc.
  ** 
  **  This program is free software; you can redistribute it and/or modify it under the terms
  **  of the GNU General Public License as published by the Free Software Foundation;
  **  either version 2 of the License, or (at your option) any later version. 
  **  This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
  **  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
  **  See the GNU General Public License for more details. 
  **  You should have received a copy of the GNU General Public License along with this program;
  **  if not, write to the Free Software Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
  ***/

/** class: HWindowControl
  *
  * HWindowControl (with alias HWindow) is the main component of the HWindow classes.
  * HWindowControl is a control unit that represents an open window in the browser. 
  * A window component can contain a lot of different GUI components including other window
  * components. HWindow components support both dragging and resizing functionality. 
  * HWindow view or theme can be changed; the helmiTheme is used by default.
  * Use HWindow to have user-positionable views that contain other objects.
  *
  * vars: Instance variables
  *  type - '[HWindowControl]'
  *  options - Contains various window-related options.
  *  windowBar - The Window Titlebar and control button container view object.
  *  windowLabel - The Window Title label object.
  *  windowView - The Window component container view object. Has scrollbars visible by automatically.
  *
  * Extends:
  *  <HControl>
  *
  * See Also:
  *  <HWindowBar> <HWindowView> <HWindowLabel> <HControl>
  *
  * NOTE:
  *  HWindow -components are still evolving.
  *
  **/
HWindowControl = HControl.extend({
  
  packageName:   "window",
  componentName: "windowcontrol",
/** constructor: constructor
  *
  * The first two parameters are the same as with <HView>, but additionally
  * sets the label and events.
  *
  * Parameters:
  *  _rect - The rectangle of the component. See <HView.constructor>.
  *  _parentClass - The parent component of the component. See <HView.constructor>.
  *  _options - (optional) All other parameters. See <HComponentDefaults> and <_options> below.
  *
  * vars: _options
  *  label - The label to draw to the titlebar. Default: 'Untitled'
  *
  *  minSize - The minimum size allowed for the window - [width,height]. Default: [0,0]
  *  maxSize - The maximum size allowed for the window - [width,height]. Default: [4096,3072]
  *  barHeight - The window title bar height, in pixels. Default: 21
  *
  *  resizeW   - The left resizeable border area. Default: 4
  *  resizeE   - The right resizeable border area. Default: 4
  *  resizeN   - The top resizeable border area. Default: 4
  *  resizeS   - The bottom resizeable border area. Default: 4
  *
  *  resizeNW   - The top-left resizeable corner area. Default: [4,4]
  *  resizeNE   - The top-right resizeable corner area. Default: [4,4]
  *  resizeSW   - The bottom-left resizeable corner area. Default: [4,4]
  *  resizeSE   - The bottom-right resizeable corner area. Default: [16,16]
  *
  **/
  constructor: function(_rect, _parentClass, _options) {
    
    if(!_options) {
      _options={};
    }
    var _defaults = Base.extend({
      minSize:   [64,32],
      maxSize:   [4096,3072],
      barHeight: 21,
      resizeW:   4,
      resizeE:   4,
      resizeN:   4,
      resizeS:   4,
      resizeNW:  [ 4,  4],
      resizeNE:  [ 4,  4],
      resizeSW:  [ 4,  4],
      resizeSE:  [16, 16],
      menuBar: null
    });
    _options = new (_defaults.extend(_options))();
    
    if(this.isinherited) {
      this.base(_rect, _parentClass, _options);
    }
    else {
      this.isinherited = true;
      this.base(_rect, _parentClass, _options);
      this.isinherited = false;
    }
    
    this.type = '[HWindowControl]';
    
    this.preserveTheme = true;
    
    // Calculate sub-rectangle sizes
    this._resetWindowFlags();
    
    this.setDraggable(true);
    
    this.drawRect();
    this.drawMarkup();
    
    this.buildWinParts();
    
    this.setLabel(this.label);
    
    if (_options.menuBar) {
      this.setMenuBar(_options.menuBar);
    }
    
    if(!this.isinherited) {
      this.draw();
    }
  },
  
  buildWinParts: function() {
    // Initialize specialized window views/controls:
    this.calcWindowPartRects();
    
    this.windowBar = new HWindowBar(
      this._windowFlags.windowBarRect,
      this,
      {label: this.label}
    );
    this.windowBar.draw();
    
    
    this.windowLabel = new HWindowLabel(
      this._windowFlags.windowLabelRect, this.windowBar, {label: this.label});
    this.windowLabel.draw();
    
    this.windowView = new HWindowView(
      this._windowFlags.windowViewRect,
      this
    );
    this.windowView.draw();
  },

/** private: _resetWindowFlags
  *
  * Builds rectangles for coordinate calculation.
  *
  **/
  _resetWindowFlags: function() {
    
    // Used internally by the window to keep track of what modes it is in
    this._windowFlags = {
      dragWindow: false,
      resizeW:    false,
      resizeE:    false,
      resizeN:    false,
      resizeS:    false,
      resizeNW:   false,
      resizeNE:   false,
      resizeSW:   false,
      resizeSE:   false,
      
    /***
      ** Calculate rectangles that the mouse pointer should be inside of to respond to different events.
      ***/
      dragWindowRect: new HRect(
        this.options.resizeW,
        this.options.resizeN,
        this.rect.width        - this.options.resizeE,
        this.options.barHeight + this.options.resizeN
      ),
      
      resizeNRect:    new HRect(
        this.options.resizeW,
        0,
        this.rect.width - this.options.resizeE,
        this.options.resizeN
      ),
      resizeSRect:    new HRect(
        this.options.resizeW,
        this.rect.height - this.options.resizeS,
        this.rect.width  - this.options.resizeE,
        this.rect.height
      ),
      resizeWRect:    new HRect(
        0,
        this.options.resizeN,
        this.options.resizeW,
        this.rect.height - this.options.resizeS
      ),
      resizeERect:    new HRect(
        this.rect.width - this.options.resizeE,
        this.options.resizeN,
        this.rect.width,
        this.rect.height - this.options.resizeS
      ),
      
      resizeNWRect:   new HRect(
        0,
        0,
        this.options.resizeNW[0],
        this.options.resizeNW[1]
      ),
      resizeNERect:   new HRect(
        this.rect.width - this.options.resizeNE[0],
        0,
        this.rect.width,
        this.options.resizeNE[1]
      ),
      resizeSWRect:   new HRect(
        0,
        this.rect.height - this.options.resizeSW[1],
        this.options.resizeSW[0],
        this.rect.height
      ),
      resizeSERect:   new HRect(
        this.rect.width  - this.options.resizeSE[0],
        this.rect.height - this.options.resizeSE[1],
        this.rect.width,
        this.rect.height
      )
    };
  },
  
/** private: checkWindowSizeConstrains
  *
  * Checks, that the window is in allowed position/size bounds.
  *
  **/
  checkWindowSizeConstrains: function() {
    
    // Was the window resized using a drag handle on the west side or the north
    // side of the window.
    var _resizeWest = this._windowFlags.resizeW ||
      this._windowFlags.resizeSW || this._windowFlags.resizeNW;
    var _resizeNorth = this._windowFlags.resizeN ||
      this._windowFlags.resizeNE || this._windowFlags.resizeNW;
    
    // Min/max width
    // Since HRect.setWidth() changes only the rectangle's right property,
    // resizing by the west edge or corners should make sure that the left
    // property doesn't change.
    if(this.rect.width < this.options.minSize[0]) {
      // The width has fallen below the minimum width. Force the width to the
      // minimum value.
      
      if (_resizeWest) {
        this.rect.left = this.rect.right - this.options.minSize[0];
      }
      
      this.rect.setWidth(this.options.minSize[0]);
      
    } else if(this.rect.width > this.options.maxSize[0]) {
      // The width has exceeded the maximum width. Force the width to the
      // maximum value.
      
      if (_resizeWest) {
        this.rect.left = this.rect.right - this.options.maxSize[0];
      }
      
      this.rect.setWidth(this.options.maxSize[0]);
      
    }
    
    // Min/max height
    // Since HRect.setHeight() changes only the rectangle's bottom property,
    // resizing by the north edge or corners should make sure that the top
    // property doesn't change.
    if(this.rect.height < this.options.minSize[1]) {
      // The height has fallen below the minimum height. Force the height to the
      // minimum value.
      
      if (_resizeNorth) {
        this.rect.top = this.rect.bottom - this.options.minSize[1];
      }
      
      this.rect.setHeight(this.options.minSize[1]);
      
    } else if(this.rect.height > this.options.maxSize[1]) {
      // The height has exceeded the maximum height. Force the height to the
      // maximum value.
      
      if (_resizeNorth) {
        this.rect.top = this.rect.bottom - this.options.maxSize[1];
      }
      
      this.rect.setHeight(this.options.maxSize[1]);
      
    }
    
    // Inside window
    var _leftLimit = 0 - this.options.resizeW;
    if(this.rect.left < _leftLimit) {
      this.rect.left = _leftLimit;
      this.rect.right = this.rect.width + _leftLimit;
    }
    var _topLimit = 0 - this.options.resizeN;
    if(this.rect.top < _topLimit) {
      this.rect.top = _topLimit;
      this.rect.bottom = this.rect.height + _topLimit;
    }
  },
  
/** private: startDrag
  *
  * Sets starting/previous <HPoint> of the cursor and starting <HRect> of the window.
  * Checks what the dragging action should do, if anything.
  *
  **/
  startDrag: function(_x, _y) {
    
    this._startPointCRSR  = new HPoint( _x, _y );
    this._prevPointCRSR   = new HPoint( _x, _y );
    this._startRectOfWin  = new HRect( this.rect );
    
    // Choose the window resize/drag mode, only one of them will be selected.
    this._resetWindowFlags();
    var _pointInWin = this._startPointCRSR.subtract( this._startRectOfWin.leftTop );
    if(this._windowFlags.resizeNWRect.contains(_pointInWin)) {
      this._diffPoint = _pointInWin;
      this._windowFlags.resizeNW = true;
    } else if(this._windowFlags.resizeNERect.contains(_pointInWin)) {
      this._diffPoint = this._startPointCRSR.subtract(this._startRectOfWin.rightTop);
      this._windowFlags.resizeNE = true;
    } else if(this._windowFlags.resizeSWRect.contains(_pointInWin)) {
      this._diffPoint = this._startPointCRSR.subtract(this._startRectOfWin.leftBottom);
      this._windowFlags.resizeSW = true;
    } else if(this._windowFlags.resizeSERect.contains(_pointInWin)) {
      this._diffPoint = this._startPointCRSR.subtract(this._startRectOfWin.rightBottom);
      this._windowFlags.resizeSE = true;
    } else if(this._windowFlags.resizeNRect.contains(_pointInWin)) {
      this._diffPoint = _y-this.rect.top;
      this._windowFlags.resizeN = true;
    } else if(this._windowFlags.resizeSRect.contains(_pointInWin)) {
      this._diffPoint = _y-this.rect.bottom;
      this._windowFlags.resizeS = true;
    } else if(this._windowFlags.resizeWRect.contains(_pointInWin)) {
      this._diffPoint = _x-this.rect.left;
      this._windowFlags.resizeW = true;
    } else if(this._windowFlags.resizeERect.contains(_pointInWin)) {
      this._diffPoint = _x-this.rect.right;
      this._windowFlags.resizeE = true;
    } else if(this._windowFlags.dragWindowRect.contains(_pointInWin)) {
      this._diffPoint = this._startPointCRSR.subtract(this._startRectOfWin.leftTop);
      this._windowFlags.dragWindow = true;
    }
    this.bringToFront();
    
    this.doDrag(_x, _y);
  },
  
/** private: doDrag
  *
  * Sets previous <HPoint> of the cursor and calculates a new <HRect> for the window.
  * Performs rectangle calculation depending on where the <startDrag> coordinate was.
  *
  **/
  doDrag: function(_x, _y) {
    var _targetPoint;
    var _currPointCRSR = new HPoint( _x, _y );
    if(!this._prevPointCRSR.equals(_currPointCRSR)) {
      if(this._windowFlags.resizeNW == true) {
        _targetPoint = _currPointCRSR.subtract( this._diffPoint );
        this.rect.setLeftTop( _targetPoint );
      } else if(this._windowFlags.resizeNE == true) {
        _targetPoint = _currPointCRSR.subtract( this._diffPoint );
        this.rect.setRightTop( _targetPoint );
      } else if(this._windowFlags.resizeSW == true) {
        _targetPoint = _currPointCRSR.subtract( this._diffPoint );
        this.rect.setLeftBottom( _targetPoint );
      } else if(this._windowFlags.resizeSE == true) {
        _targetPoint = _currPointCRSR.subtract( this._diffPoint );
        this.rect.setRightBottom( _targetPoint );
      } else if(this._windowFlags.resizeN == true) {
        _targetPoint = _y - this._diffPoint;
        this.rect.top = _targetPoint;
        this.rect.updateSecondaryValues();
      } else if(this._windowFlags.resizeS == true) {
        _targetPoint = _y - this._diffPoint;
        this.rect.bottom = _targetPoint;
        this.rect.updateSecondaryValues();
      } else if(this._windowFlags.resizeW == true) {
        _targetPoint = _x - this._diffPoint;
        this.rect.left = _targetPoint;
        this.rect.updateSecondaryValues();
      } else if(this._windowFlags.resizeE == true) {
        _targetPoint = _x - this._diffPoint;
        this.rect.right = _targetPoint;
        this.rect.updateSecondaryValues();
      } else if(this._windowFlags.dragWindow == true) {
        _targetPoint = _currPointCRSR.subtract( this._diffPoint );
        this.rect.offsetTo( _targetPoint );
      }
      this.checkWindowSizeConstrains();
      
      this.setStyle('left', this.rect.left + 'px', true);
      this.setStyle('top', this.rect.top + 'px', true);
      this.setStyle('width', this.rect.width + 'px', true);
      this.setStyle('height', this.rect.height + 'px', true);
      
      if(this._windowFlags.dragWindow == false) {
        this.calcWindowPartRects();
      }
      this._prevPointCRSR = _currPointCRSR;
    }
  },
  
/** private: endDrag
  *
  * Same as <doDrag>. Drags end automatically through the <HEventManager>.
  *
  **/
  endDrag: function(_x, _y) {
    this.doDrag(_x, _y);
  },
  
/** private: _calcWindowPartRects
  *
  * Calculates sub-view rectangles. Decides where the windowBar, windowLabel and windowView goes.
  *
  **/
  calcWindowPartRects: function() {
    
    // Indent by the amount of resize control border
    var _windowBarRect = new HRect(
      this.options.resizeW,
      this.options.resizeN,
      this.rect.width - this.options.resizeE,
      this.options.barHeight + this.options.resizeN
    );
    
    var _windowLabelRect = new HRect(
      0,
      0,
      _windowBarRect.width,
      _windowBarRect.height
    );
    
    // Indent by the amount of resize control border
    var _windowViewRect = new HRect(
      this.options.resizeW,
      this.options.resizeN + this.options.barHeight,
      this.rect.width - this.options.resizeE,
      this.rect.height - this.options.resizeS
    );
    
    // If there's a menu bar attached to this window, shrink the window view so
    // that it will fit inside the window.
    if (this.menuBar) {
      var _menuBarHeight = this.options.menuBarHeight;
      
      // If the window is resized so small that the menu bar does not fit in, 
      // decrease the height of the menu bar temporarily.
      if (_menuBarHeight + this.options.resizeN + this.options.barHeight >
        this.rect.height - this.options.resizeS) {
        _menuBarHeight = this.rect.height - this.options.barHeight -
          this.options.resizeS - this.options.resizeN;
      }
      
      _windowViewRect.setTop(_windowViewRect.top + _menuBarHeight);
      // Make the menu bar's as wide as the window view.
      this.menuBar.resizeTo(_windowViewRect.width, _menuBarHeight);
    }
    
    
    if(!this._windowFlags.windowBarRect) {
      
      this._windowFlags.windowBarRect = _windowBarRect;
      this._windowFlags.windowLabelRect = _windowLabelRect;
      this._windowFlags.windowViewRect = _windowViewRect;
      
    } else {
      
      this.windowBar.setRect(_windowBarRect);
      this.windowLabel.setRect(_windowLabelRect);
      this.windowView.setRect(_windowViewRect);
      
    }
  },
  
/** method: draw
  *
  * Just refreshes the rect.
  *
  **/
  draw: function() {
    this.drawRect();
  },
  
/** method: setLabel
  *
  * Sets the title bar label of the window.
  *
  * Parameters:
  *  _label - A new title label for the window.
  *
  * Hint:
  *  _label takes html, so you may also specify an icon or other custom content in the title bar.
  *
  **/
  setLabel: function(_label) {
    if(this.drawn && this.windowLabel) {
      this.windowLabel.setLabel(_label);
    }
    this.base(_label);
  },
  
/** method: refresh
  *
  * Sets the correct positions of this view and its subviews.
  *
  **/
  refresh: function() {
    if(this.windowBar) {
      this.windowBar.refresh();
    }
    this.drawRect();
  },
  
  
/** method: setMenuBar
  *
  * Attaches the given <HMenuBar> to this window so that it will be shown below
  * the window bar. If there already is a menu bar in this window, the old one
  * will be replaced by the new one. Pass a null to remove the current menu bar
  * without adding a new one.
  * 
  * Parameters:
  *  _menuBar - <HMenuBar> to be attached to this window, or null to remove the
  *             currently attached menu bar.
  *
  **/
  setMenuBar: function(_menuBar) {
    
    if (_menuBar == this.menuBar) {
      return;
    }
    
    // Delete the existing menu bar first.
    if (this.menuBar) {
      this.menuBar.die();
    }
    
    this.menuBar = _menuBar;
    
    if (_menuBar) {
    
      // Store the original menu bar height.
      this.options.menuBarHeight = this.menuBar.rect.height;
      
      // Move the menu bar from its original location into the window control.
      this.menuBar.remove();
      this.addView(this.menuBar);
      ELEM.append(this.menuBar.elemId, this.elemId);
      
      // Align the menu bar with the window view.
      this.menuBar.moveTo(this.windowView.rect.left,
        this.windowBar.rect.bottom);
      
    }
    
    this.calcWindowPartRects();
  },
  
  stopAnimation: function() {
    this.base();
    this.calcWindowPartRects();
    this.refresh();
  }
  
});

/** class: HWindow
***
*** Alias for <HWindowControl>
**/
HWindow = HWindowControl;

