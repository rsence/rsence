/*   Riassence Framework
 *   Copyright 2006 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

/*** = Description
  ** An HSplitView object stacks several child views within one view so that the user can change their relative sizes.
  ** By default, the split bars between the views are horizontal, so the views are one on top of the other.
  **
  ** = Instance variables
  ** +type+::     '[HSplitView]'
  ** +vertical+::  Sets whether the split bars are vertical.
  ***/
HSplitView = HControl.extend({
    
  componentName: "splitview",

/** = Description
  * HSplitView constructor
  *
  * = Parameters
  * +_rect+::         An HRect object that sets the position and 
  *                   dimensions of this control.
  * +_parentClass+::  The parent view that this control is to be inserted in.
  * +_options+::      (optional) All other parameters. See HComponentDefaults
  *
  **/
  constructor: function(_rect, _parentClass, _options) {
    
    _options = new (Base.extend({
      vertical: false
    }).extend(_options));
    
    if(this.isinherited) {
      this.base(_rect, _parentClass, _options);
    }
    else {
      this.isinherited = true;
      this.base(_rect, _parentClass, _options);
      this.isinherited = false;
    }
    // -- When this is true, the component is always drawn with the theme that was ++
    // -- active at the creation of the component, not the current theme. ++
    this.preserveTheme = true;
    
    this.vertical = this.options.vertical;
    
    this.dividerWidth = 6;
    this.splitviews = [];
    this.dividers = [];
    
    this.setDraggable(true);
    
    if(!this.isinherited) {
      this.draw();
    }
  },
  
/** = Description
  * StartDrag function
  *
  * = Parameters
  * +_x+:: 
  * +_y+:: 
  * +_dividerView+::
  *
  **/
  startDrag: function(_x, _y, _dividerView) {
    if (!_dividerView) {
      return;
    }
    _x -= this.pageX();
    _y -= this.pageY();
    var _index = this.dividers.indexOfObject(_dividerView);
    
    this._startPointCRSR  = new HPoint( _x, _y );
    this._prevPointCRSR   = new HPoint( _x, _y );
    
    this._diffPoint = this._startPointCRSR.subtract(_dividerView.rect.leftTop);
    
    this._startView1  = this.splitviews[_index];
    this._startView2  = this.splitviews[_index + 1];
    this._dividerView = _dividerView;
    if (this.vertical === false) {
      this._limit1 = this._startView1.rect.top;
      this._limit2 = this._startView2.rect.bottom - this.dividerWidth;
    } else {
      this._limit1 = this._startView1.rect.left;
      this._limit2 = this._startView2.rect.right - this.dividerWidth;
    }
  },

/** = Description
  * Drag function
  *
  * = Parameters
  * +_x+:: 
  * +_y+:: 
  * +_dividerView+::
  *
  **/
  drag: function(_x, _y, _dividerView) {
    if (!_dividerView) {
      return;
    }
    _x -= this.pageX();
    _y -= this.pageY();
    var _targetPoint;
    if (this.vertical === false) {
      _targetPoint = _y - this._diffPoint.y;
      if (_targetPoint < this._limit1 || _targetPoint > this._limit2) {
        return;
      }
      
      this._startView1.rect.setHeight(_targetPoint);
      this._startView1.rect.updateSecondaryValues();
      this._startView1.setStyle('height',this._startView1.rect.height+'px', true);
      
      this._dividerView.rect.setTop(_targetPoint);
      this._dividerView.rect.updateSecondaryValues();
      this._dividerView.setStyle('top',this._dividerView.rect.top+'px', true);
      
      this._startView2.rect.setTop(_targetPoint + this.dividerWidth);
      this._startView2.rect.updateSecondaryValues();
      this._startView2.setStyle('top',this._startView2.rect.top+'px', true);
      this._startView2.setStyle('height',this._startView2.rect.height+'px', true);
    } else {
      _targetPoint = _x - this._diffPoint.x;
      if (_targetPoint < this._limit1 || _targetPoint > this._limit2) {
        return;
      }
      this._startView1.rect.setRight(_targetPoint);
      this._startView1.rect.updateSecondaryValues();
      this._startView1.setStyle('width',this._startView1.rect.width+'px', true);
      
      this._dividerView.rect.setLeft(_targetPoint);
      this._dividerView.rect.updateSecondaryValues();
      this._dividerView.setStyle('left',this._dividerView.rect.left+'px', true);
      
      this._startView2.rect.setLeft(_targetPoint + this.dividerWidth);
      this._startView2.rect.updateSecondaryValues();
      this._startView2.setStyle('left',this._startView2.rect.left+'px', true);
      this._startView2.setStyle('width',this._startView2.rect.width+'px', true);
    }
  },
  
/** = Description
  * endDrag function
  *
  * = Parameters
  * +_x+:: 
  * +_y+:: 
  * +_dividerView+::
  *
  **/
  endDrag: function(_x, _y, _dividerView) {
    this.drag(_x, _y);
    delete this._startPointCRSR;
    delete this._prevPointCRSR;
    delete this._diffPoint;
    delete this._startView1;
    delete this._startView2;
    delete this._dividerView;
    delete this._limit1;
    delete this._limit2;
  },
/** = Description
  * Adds an item to the HSplitView at index - or, if no index is mentioned, to
  * the end of the list.
  * 
  * = Parameters
  * +_item+::    A [HView] object.
  * +_index+::   The index of the item, its ordinal position in the menu. 
  *              Indices begin at 0.
  *
  **/  
  addSplitViewItem: function(_item, _index) {
    if (_index !== undefined) {
      this.splitviews.splice(_index, 0, _item);
    } else {
      this.splitviews.push(_item);
    }
  },
  
/** = Description
  * Removes the the specified item from the HSplitView.
  * 
  * = Parameters
  * +_item+::  A [HView] object.
  *
  **/ 
  removeSplitViewItem: function(_item) {
    if (typeof _item === "object") {
      var _index = this.splitviews.indexOfObject(_item);
      if (_index !== -1) {
        this.splitviews.splice(_index, 1);
        _item.die();
        this.dividers.splice(_index, 1);
        this.dividers[_index].die();
      }
    }
  },
  
/** = Description
  * Sets whether the split bars are vertical.
  * 
  * = Parameters
  * +_flag+:: if flag is true, they're vertical (child views are side by side);
  *           if it's false, they're horizontal (child views are one on top 
  *           of the other). Split bars are horizontal by default.
  *
  **/
  setVertical: function(_flag) {
    this.vertical = _flag;
    this.options.vertical = _flag;
  },
  
/** = Description
  * Adjusts the sizes of the receiver’s child views so they (plus the dividers)
  * fill the receiver. The child views are resized proportionally; 
  * the size of a child view relative to the other child views doesn’t change.
  * 
  **/
  adjustViews: function() {
    var _viewCount = this.splitviews.length,
        _newTotal,
        _oldTotal,
        _scale,
        _running,
        i,
        _view,
        _newHeight,
        _newWidth;
    if (this.vertical === false) {
      _newTotal = this.rect.height - this.dividerWidth*(_viewCount - 1);
      _oldTotal = 0;
      for (i = 0; i < _viewCount; i++) {
        _oldTotal += this.splitviews[i].rect.height;
      }
      // 
      _scale = _newTotal / _oldTotal;
      _running = 0;
      for (i = 0; i < _viewCount; i++) {
        _view = this.splitviews[i];
        _newHeight = _view.rect.height*_scale;
        if (i === _viewCount - 1) {
          _newHeight = Math.floor(_newHeight);
        } else {
          _newHeight = Math.ceil(_newHeight);
        }
        _view.rect.offsetTo(0, _running);
        _view.rect.setSize(this.rect.width, _newHeight);
        _view.draw();
        _running += _newHeight + this.dividerWidth;
      }
    } else {
      _newTotal = this.rect.width - this.dividerWidth*(_viewCount - 1);
      _oldTotal = 0;
      for (i = 0; i < _viewCount; i++) {
        _oldTotal += this.splitviews[i].rect.width;
      }
      _scale = _newTotal / _oldTotal;
      _running = 0;
      for (i = 0; i < _viewCount; i++) {
        _view = this.splitviews[i];
        _newWidth = _view.rect.width*_scale;
        if (i === _viewCount - 1) {
          _newWidth = Math.floor(_newWidth);
        } else {
          _newWidth = Math.ceil(_newWidth);
        }
        _view.rect.offsetTo(_running, 0);
        _view.rect.setSize(_newWidth, this.rect.height);
        _view.draw();
        _running += _newWidth + this.dividerWidth;
      }
    }
    this.draw();
  },
/** = Description
  * refresh function
  *
  *
  **/
  refresh: function() {
    // base method calls drawRect
    this.base();
    if (this.drawn) {
      var _viewCount = this.splitviews.length;
      var _divRect;
     // draws the dividers between the views
      for (var i = 0; i < (_viewCount -1); i++) {
        _divRect = new HRect(this.splitviews[i].rect);
        if (!this.vertical) {
          _divRect.offsetTo(_divRect.left, _divRect.bottom);
          _divRect.setHeight(this.dividerWidth);
        } else {
          _divRect.offsetTo(_divRect.right, _divRect.top);
          _divRect.setWidth(this.dividerWidth);
        }
        if (!this.dividers[i]) {
          this.dividers[i] = new HDivider(_divRect,this);
        } else {
          var _view = this.dividers[i];
          _view.rect.offsetTo(_divRect.left, _divRect.top);
          _view.rect.setSize(_divRect.width, _divRect.height);
          _view.draw();
        }
      }
    }
  }
});
