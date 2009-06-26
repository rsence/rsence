/**
  * Riassence Core -- http://rsence.org/
  *
  * Copyright (C) 2008 Juha-Jarmo Heinonen <jjh@riassence.com>
  * Copyright (C) 2006 Helmi Technologies Inc.
  *
  * This file is part of Riassence Core.
  *
  * Riassence Core is free software: you can redistribute it and/or modify
  * it under the terms of the GNU General Public License as published by
  * the Free Software Foundation, either version 3 of the License, or
  * (at your option) any later version.
  *
  * Riassence Core is distributed in the hope that it will be useful,
  * but WITHOUT ANY WARRANTY; without even the implied warranty of
  * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  * GNU General Public License for more details.
  *
  * You should have received a copy of the GNU General Public License
  * along with this program.  If not, see <http://www.gnu.org/licenses/>.
  *
  **/

/** class: HView
  *
  * Abstract foundation class for all visual components.
  *
  * Depends on <HApplication> <HMarkupView>
  *
  * HView instances are the simplest component type. HViews don't respond to 
  * events, they don't have a visible visual representation (just an invisible
  * '<div>' element), but offers the common visual methods of most components.
  *
  * Feel free to extend HView to suit your needs.
  * However, extend <HControl> instead if you are going to make an active component.
  *
  * vars: Instance variables (common for almost all components)
  *  type - '[HView]' normally, '[HSubview]' if the parent is also a HView
  *
  *  views - A list of child components bound.
  *  viewId - The view index id of this view (parent specific, will change to system-wide uniqueness)
  *  drawn  - A flag that is true after draw is called the first time (the DOM element exists after that)
  *  elemId - The <Element Manager> compatible element index id of the main <div> DOM element of the view. Exists after <draw> is called.
  *  parent - The parent of the view structure
  *  parents - An array containing parents, up to <HApplication> and <HSystem>
  *  appId - The unique id of the app that contains the view
  *  app - References the <HApplication> instance at the root of the view structure
  *
  *  rect - The <HRect> instance that defines the coordinates and dimensions of the view. Call <drawRect> for changes to a rect property to take effect.
  *
  *  theme - The theme chosen to render the component with.
  *  preserveTheme - Boolean, won't change the theme on the fly if true and the global theme changes. Defaults to false.
  *  optimizeWidthOnRefresh - Boolean, true (default) when <optimizeWidth> should be called whenever <refresh> gets called.
  *  
  *  isHidden - Boolean flag, true if set to hidden. Defaults to false (visible)
  *
  *  viewsZOrder - The order of subviews in the Z-dimension.
  *
  * See Also:
  *  <HSystem> <HApplication> <HControl>
  *
  * Usage example:
  *  > var myApp = new HApplication(100);
  *  > var myView = new HView( new HRect(100,100,200,200), myApp );
  *  > myView.draw();
  *  > myView.setStyle('background-color','#660000');
  *  > var mySubview = new HView( new HRect(50,50,100,100), myView );
  *  > mySubview.draw();
  *  > mySubview.setStyle('background-color','#ffcc00');
  *  > mySubview.setStyle('border','1 px solid #ffffff');
  **/

HView = HClass.extend({
  
  // This property should be overridden in custom made components. It's like a
  // theme path, but points to the location of a component specific themes. The
  // directory structure must be the same as in the release version's themes
  // directory.
  themePath:   null,
  
  // In pre-build mode, this is the prefix of the directory that contains a set of components.
  packageName: null,
  
  // Uses absolute positioning by default
  isAbsolute: true,
  
  // flags, sets positioning mode
  flexRight:  false,
  flexLeft:   true,
  flexTop:    true,
  flexBottom: false,
  
  // ints, positioning mode offsets
  flexRightOffset:  0,
  //rect.left: flexLeftOffset:   0,
  //rect.top:  flexTopOffset:    0,
  flexBottomOffset: 0,
  
  // Component behaviour tells other classes what to expect of the component's api and visual behaviour.
  componentBehaviour: ['view'],
  
/** constructor: constructor
  *
  * Constructs the logic part of a <HView>.
  * The view still needs to be drawn on screen. To do that, call <draw> after
  * subcomponents of the view are initialized.
  *
  * Parameters:
  *  _rect - An instance of <HRect>, defines the position and size of views.
  *  _parent - Another <HView> -compatible instance, like <HApplication>, <HControl> and derived component classes.
  *
  * See also:
  *  <HApplication.addView> <draw> <drawRect> <refresh> <setRect> <drawMarkup> <HControl.draw>
  **/
  constructor: function(_rect, _parent) {
    // Moved these to the top to ensure safe themeing operation
    if(this.theme===undefined){
      this.theme = HThemeManager.currentTheme;
      this.preserveTheme = false;
    }
    else {
      this.preserveTheme = true;
    }
    
    
    // Used for smart template elements (resizing)
    
    this.optimizeWidthOnRefresh = true;
    
    // adds the parentClass as a "super" object
    this.parent = _parent;
    
    this.viewId = this.parent.addView(this);
    // the parent addView method adds this.parents
    
    this.appId = this.parent.appId;
    this.app = HSystem.apps[this.appId];
    
    // subview-ids, index of HView-derived objects that are found in HSystem.views[viewId]
    this.views = [];
    
    // Subviews in Z order.
    this.viewsZOrder = [];
    
    // Keep the view (and its subviews) hidden until its drawn.
    this._createElement();
    
    // Set the geometry
    this.setRect(_rect);
    this.isHidden = true;
    
    this.drawn = false;
    
    this._cachedLeft = _rect.left;
    this._cachedTop = _rect.top;
    
    // Additional DOM element bindings are saved into this array so they can be
    // deleted from the element manager when the view gets destroyed.
    this._domElementBindings = [];
    
    if(!this.isinherited) {
      this.draw();
      this.show();
    }
  },
  
  setFlexRight: function(_flag,_px){
    if(_flag===undefined){_flag=true;}
    this.flexRight = _flag;
    if(_px===undefined){_px=0;}
    this.flexRightOffset = _px;
  },
  setFlexLeft: function(_flag,_px){
    if(_flag===undefined){_flag=true;}
    this.flexLeft = _flag;
    if(_px!==undefined){
      this.rect.setLeft(_px);
    }
  },
  setFlexTop: function(_flag,_px){
    if(_flag===undefined){_flag=true;}
    this.flexTop = _flag;
    if(_px!==undefined){
      this.rect.setTop(_px);
    }
  },
  setFlexBottom: function(_flag,_px){
    if(_flag===undefined){_flag=true;}
    this.flexBottom = _flag;
    if(_px===undefined){_px=0;}
    this.flexBottomOffset = _px;
  },
  setAbsolute: function(_flag){
    if(_flag===undefined){_flag=true;}
    this.isAbsolute = _flag;
  },
  setRelative: function(_flag){
    if(_flag===undefined){_flag=true;}
    this.isAbsolute = (!_flag);
  },
  
/** method: getThemeGfxPath
  *
  * Used by from html theme templates to get the theme-specific image path.
  *
  * Returns:
  *  The theme image directory of the current theme.
  *
  * See also:
  *  <HThemeManager._componentGfxPath>
  **/
  getThemeGfxPath: function() {
    if( this.preserveTheme ){
      _themeName = this.theme;
    } else {
      _themeName = HThemeManager.currentTheme;
    }
    return HThemeManager._componentGfxPath( _themeName,  this.componentName, this.themePath, this.packageName );
  },
  getThemeGfxFile: function( _fileName ) {
    if( this.preserveTheme ){
      _themeName = this.theme;
    } else {
      _themeName = HThemeManager.currentTheme;
    }
    return HThemeManager._componentGfxFile( _themeName,  this.componentName, this.themePath, this.packageName, _fileName );
  },
  
  // provided solely for component extendability:
  _makeElem: function(_parentElemId){
    this.elemId = ELEM.make(_parentElemId,'div');
  },
  // provided solely for component extendability:
  _setCSS: function(_additional){
      var _cssStyle = 'display:none;overflow:hidden;visibility:hidden;';
      if(this.isAbsolute){
        _cssStyle += 'position:absolute;';
      } else {
        _cssStyle += 'position:relative;';
      }
      _cssStyle += _additional;
      ELEM.setCSS(this.elemId,_cssStyle);
  },
  
  _getParentElemId: function(){
    var _parentElemId;
    // if the parent does not have an element:
    if(this.parent.elemId === undefined) {
      _parentElemId = 0;
    }
    // if a subview element is defined in the template, use it:
    else if(this.parent.markupElemIds&&this.parent.markupElemIds['subview']){
      _parentElemId = this.parent.markupElemIds['subview'];
    }
    // otherwise, use main elemId
    else {
      _parentElemId = this.parent.elemId;
    }
    return _parentElemId;
  },
  
  // create the dom element
  _createElement: function() {
    if(!this.elemId) {
      
      this._makeElem(this._getParentElemId());
      this._setCSS('');
      
      // Theme name == CSS class name
      if(this.preserveTheme){
        ELEM.addClassName( this.elemId, this.theme );
      }
      else {
        ELEM.addClassName( this.elemId, HThemeManager.currentTheme );
      }
    }
  },
  
/** method: drawRect
  *
  * Sets the correct properties for elements after changes in the <rect> instance object.
  * Effectively updates the visual representation to match the state of <rect>.
  *
  * See also:
  *  <draw> <drawMarkup> <refresh> <setRect> <HRect>
  **/
  drawRect: function() {
    if (!this.parent || !this.rect.isValid) {
      return;
    }
    
    var _this = this,
        _elemId = _this.elemId,
        _styl = ELEM.setStyle,
        _rect = _this.rect;
    
    _styl( _elemId, 'left', _this.flexLeft?(_rect.left+'px'):'auto', true);
    _styl( _elemId, 'top', _this.flexTop?(_rect.top+'px'):'auto', true);
    _styl( _elemId, 'right', _this.flexRight?(_this.flexRightOffset+'px'):'auto', true);
    _styl( _elemId, 'bottom', _this.flexBottom?(_this.flexBottomOffset+'px'):'auto', true);
    _styl( _elemId, 'width', (_this.flexLeft&&_this.flexRight)?'auto':(_rect.width+'px'), true);
    _styl( _elemId, 'height', (_this.flexTop&&_this.flexBottom)?'auto':(_rect.height+'px'), true);
    
    if(_this.flexLeft&&_this.flexRight){
      _styl( _elemId, 'min-width', _rect.width+'px', true);
    }
    if(_this.flexTop&&_this.flexBottom){
      _styl( _elemId, 'min-height', _rect.height+'px', true);
    }
    
    // Show the rectangle once it gets created, unless visibility was set to
    // hidden in the constructor.
    if(undefined === _this.isHidden || _this.isHidden == false) {
      _styl( _elemId, 'visibility', 'inherit', true);
    }
    
    _styl( _elemId, 'display', 'block', true);
    
    _this._updateZIndex();
    
    if (_this._cachedLeft != _rect.left || _this._cachedTop != _rect.top) {
      _this.invalidatePositionCache();
      _this._cachedLeft = _rect.left;
      _this._cachedTop = _rect.top;
    }
    
    _this.drawn = true;
    
    // right, bottom, opacity and png-transparency
    /*
    if (ELEM._is_ie6 && !this.ie_resizefixadded) {
      iefix._traverseTree(ELEM.get(this.elemId));
      this.ie_resizefixadded = true;
      HSystem.fix_ie = true;
    }
    */
  },
  
  /**
    * These methods update the z-index property of the actual element(s).
    * _updateZIndex updates this object only and it is used when the object is
    * initially drawn. _updateZIndexAllSiblings updates this object and all its
    * siblings. This is useful when modifying this object's z-order affects
    * other elements too.
    */
  _updateZIndex: function() {
    // doing this via HSystem shaves 10% off the view creation time
    //ELEM.setStyle(this.elemId, 'z-index',this.parent.viewsZOrder.indexOf(this.viewId));
    HSystem.updateZIndexOfChildren(this.viewId);
  },
  
  /**
    * This function was really slow, that's why it's moved off to the system scheduler.
    *
    * According to benchmarking, with 1000 views, deletion
    * took over 2000 ms on average before, versus 50 ms after.
    *
    **/
  _updateZIndexAllSiblings: function() {
    HSystem.updateZIndexOfChildren(this.parent.viewId);
  },
  
/** method: draw
  *
  * Initializes the visual representation of the object, should call at least <drawRect>.
  *
  * *When extending <HView>, override this method, don't extend it.*
  *
  * See also:
  *  <drawRect> <drawMarkup> <refresh> <HRect>
  **/
  draw: function() {
    var _isDrawn = this.drawn;
    this.drawRect();
    if(!_isDrawn){
      if(this['componentName']!==undefined){
        this.drawMarkup();
      }
      this.drawSubviews();
    }
    this.refresh();
  },
  
/** method: drawSubviews
  *
  * Called once, when the layout of the view is initially drawn.
  *
  * Doesn't do anything by itself, but provides an extension point for making
  * subviews.
  *
  **/
  drawSubviews: function(){
  },
  
  // Loads the markup from theme manager. If this.preserveTheme is set to true,
  // the this.theme is used for loading the markup. Otherwise the currently
  // active theme is used.
  _loadMarkup: function() {
    var _themeName;
    if (this.preserveTheme) {
      _themeName = this.theme;
    }
    else {
      _themeName = HThemeManager.currentTheme;
    }
    this.markup = HThemeManager.getMarkup( _themeName, this.componentName, this.themePath, this.packageName );
  },
  
/** method: drawMarkup
  *
  * Replaces the *contents* of the view's DOM element with html from the theme specific html file.
  *
  * See also:
  *  <HThemeManager> <bindMarkupVariables> <drawRect> <draw> <refresh>
  **/
  markupElemNames: ['bg', 'label', 'state', 'control', 'value', 'subview'],
  drawMarkup: function() {
    ELEM.setStyle(this.elemId, 'display', 'none', true);
    
    this._loadMarkup();
    
    this.bindMarkupVariables();
    ELEM.setHTML(this.elemId, this.markup);
    
    this.markupElemIds = {};
    for(var i=0; i < this.markupElemNames.length; i++ ) {
      var _partName = this.markupElemNames[ i ],
          _elemName = _partName + this.elemId,
          _htmlIdMatch = ' id="' + _elemName + '"';
      if( this.markup.indexOf( _htmlIdMatch ) != -1 ) {
        this.markupElemIds[ _partName ] = this.bindDomElement( _elemName );
      }
    }
    
    ELEM.setStyle(this.elemId, 'display', 'block' );
    
    // right, bottom, opacity and png-transparency
    //  - commented out, because the thing (IE6) is slow
    //  - enabled in ELEM at regular intervals, makes 
    //    advanced layout a little choppier, but overall
    //    much faster on IE6
    /*
    if (ELEM._is_ie6 && !this.ie_htmlresizefixadded) {
      iefix._traverseTree(ELEM.get(this.elemId));
      this.ie_htmlresizefixadded = true;
      HSystem.fix_ie = true;
    }
    */
  },
  
/** method: setHTML
  *
  * Replaces the contents of the view's DOM element with custom html.
  *
  * Parameters:
  *  _html - The HTML (string-formatted) to replace the content with.
  **/
  setHTML: function( _html ) {
    ELEM.setHTML( this.elemId, _html );
  },
  
/** method: refresh
  *
  * This method should be extended in order to redraw only specific parts. The
  * base implementation calls <optimizeWidth> when optimizeWidthOnRefresh is set
  * to true.
  *
  * See also:
  *  <HThemeManager> <drawRect> <drawMarkup> <draw>
  **/
  refresh: function() {
    if(this.drawn) {
      // this.drawn is checked here so the rectangle doesn't get drawn by the
      // constructor when setRect() is initially called.
      this.drawRect();
    }
    if(this.optimizeWidthOnRefresh) {
      this.optimizeWidth();
    }
  },

/** method: setRect
  *
  * Replaces the <rect> of the component with a new <HRect> instance and
  * then refreshes the display.
  *
  * Parameter:
  *  _rect - The new <HRect> instance to replace the old <rect> instance with.
  **/
  setRect: function(_rect) {
    if (this.rect) {
      this.rect.release(this);
    }
    this.rect = _rect;
    this.rect.bind(this);
    this.refresh();
  },
  
/** method: setStyle
  *
  * Sets any arbitary style of the main DOM element of the component.
  * Utilizes <Element Manager>'s drawing queue/cache to perform the action, 
  * thus working efficiently even when called frequently.
  *
  * Parameters:
  *  _name - The style name (css syntax, eg. 'background-color')
  *  _value - The style value (css syntax, eg. 'rgb(255,0,0)')
  *
  * See also:
  *  <Element Manager.styl_set> <style> <elemId>
  **/
  setStyle: function(_name, _value, _cacheOverride) {
    if (!this.elemId) {
      return;
    }
    ELEM.setStyle(this.elemId, _name, _value, _cacheOverride);
  },

/** method: style
  *
  * Returns a style of the main DOM element of the component.
  * Utilizes <Element Manager>'s cache to perform the action, thus working
  * efficiently even when called frequently.
  *
  * Parameters:
  *  _name - The style name (css syntax, eg. 'background-color')
  *
  * Returns:
  *  The style property value (css syntax, eg. 'rgb(255,0,0)')
  *
  * See also:
  *  <Element Manager.styl_get> <setStyle> <elemId>
  **/
  style: function(_name) {
    if (!this.elemId) {
      return;
    }
    return ELEM.getStyle(this.elemId, _name);
  },
  
/** method: setStyleForPart
  *
  * Sets a style for a specified markup element that has been bound to this
  * view.
  *
  * Parameters:
  *  _partName - The identifier of the markup element.
  *  _name - The style name
  *  _value - The style value
  *
  * See also:
  *  <setStyle> <styleForPart>
  **/
  setStyleOfPart: function(_partName, _name, _value, _cacheOverride) {
    if (!this.markupElemIds[_partName]) {
      console.log('Warning, setStyleOfPart: partName "'+_partName+'" does not exist for viewId '+this.viewId+'.');
      return;
    }
    ELEM.setStyle(this.markupElemIds[_partName], _name, _value, _cacheOverride);
  },
  setStyleForPart: function(_partName, _name, _value, _cacheOverride ){
    console.log('Warning: setStyleForPart is deprecated. Use setStyleOfPart instead.');
    this.styleOfPart( _partName, _name, _value, _cacheOverride );
  },
  
/** method: styleForPart
  *
  * Returns a style of a specified markup element that has been bound to this
  * view.
  *
  * Parameters:
  *  _partName - The identifier of the markup element.
  *  _name - The style name
  *
  * See also:
  *  <style> <SetStyleForPart>
  **/
  styleOfPart: function(_partName, _name) {
    if (!this.markupElemIds[_partName]) {
      console.log('Warning, styleOfPart: partName "'+_partName+'" does not exist for viewId '+this.viewId+'.');
      return '';
    }
    return ELEM.getStyle(this.markupElemIds[_partName], _name);
  },
  styleForPart: function(_partName, _name){
    console.log('Warning: styleForPart is deprecated. Use styleOfPart instead.');
    return this.styleOfPart( _partName, _name );
  },
  
  setMarkupOfPart: function( _partName, _value ) {
    if (!this.markupElemIds[_partName]) {
      console.log('Warning, setMarkupOfPart: partName "'+_partName+'" does not exist for viewId '+this.viewId+'.');
      return;
    }
    ELEM.setHTML( this.markupElemIds[_partName], _value );
  },
  
/** method: styleForPart
  *
  * Returns a style of a specified markup element that has been bound to this
  * view.
  *
  * Parameters:
  *  _partName - The identifier of the markup element.
  *  _name - The style name
  *
  * See also:
  *  <style> <SetStyleForPart>
  **/
  markupOfPart: function(_partName) {
    if (!this.markupElemIds[_partName]) {
      console.log('Warning, markupOfPart: partName "'+_partName+'" does not exist for viewId '+this.viewId+'.');
      return '';
    }
    ELEM.getHTML(this.markupElemIds[_partName]);
  },

/** method: hide
  *
  * Hides the component's main DOM element (and its children).
  *
  * See also:
  *  <show> <toggle>
  **/
  hide: function() {
    if(!this.isHidden) {
      var _setStyl = ELEM.setStyle,
          _elemId  = this.elemId;
      _setStyl(_elemId,'visibility', 'hidden');
      _setStyl(_elemId,'display', 'none');
      this.isHidden = true;
    }
  },
  
/** method: show
  *
  * Restores the visibility of the component's main DOM element (and its children).
  *
  * See also:
  *  <hide> <toggle>
  **/
  show: function() {
    if(this.isHidden) {
      var _setStyl = ELEM.setStyle,
          _elemId  = this.elemId;
      _setStyl(_elemId,'visibility', 'inherit');
      _setStyl(_elemId,'display', 'block');
      this.isHidden = false;
    }
  },
  
/** method: toggle
  *
  * Toggles between <hide> and <show>.
  *
  * See also:
  *  <hide> <show>
  **/
  toggle: function() {
    if(this.isHidden) {
      this.show();
    } else {
      this.hide();
    }
  },
  
/** method: remove
  *
  * Call this if you need to remove a component from its parent's <views> array without
  * destroying the DOM element itself, making it in effect a view without parent.
  * Useful, for example, for moving a view from one parent component to another.
  *
  * See also:
  *  <HApplication.removeView> <addView> <destroy> <die>
  **/
  remove: function() {
    if( this.parent ) {
      
      var _viewZIdx = this.parent.viewsZOrder.indexOf(this.viewId),
          _viewPIdx = this.parent.views.indexOf(this.viewId);
      
      this.parent.views.splice(_viewPIdx,1);
      HSystem.delView(this.viewId);
      
      // Drop the z-order from the parent's array
      this.parent.viewsZOrder.splice( _viewZIdx, 1 );
      
      // frees this view from zindex re-ordering, if added
      var _sysUpdateZIndexOfChildrenBufferIndex = HSystem._updateZIndexOfChildrenBuffer.indexOf( this.viewId );
      if(_sysUpdateZIndexOfChildrenBufferIndex != -1){
        HSystem._updateZIndexOfChildrenBuffer.splice( _sysUpdateZIndexOfChildrenBufferIndex, 1 );
      }
      
      // Make sure the z-order array stays solid.
      this._updateZIndexAllSiblings();
      
      // Since were not in the parent's array anymore, we don't need a reference
      // to that object.
      this.parent  = null;
      this.parents = [];
    }
  },
  
/** method: die
  *
  * Deletes the component and all its children.
  * Should normally be called from the parent.
  *
  * See also:
  *  <HApplication.die> <addView> <remove> <die> <Element Manager.elem_del>
  **/
  die: function() {
    // hide self, makes destruction seem faster
    this.hide();
    // Delete the children first.
    var _childViewId;
    while (this.views.length != 0) {
      _childViewId = this.views[0];
      this.destroyView(_childViewId);
    }
    // Remove this object's bindings, except the DOM element.
    this.remove();
    // Remove the DOM element bindings.
    for (var i = 0; i < this._domElementBindings.length; i++) {
      ELEM.del(this._domElementBindings[i]);
    }
    this._domElementBindings = [];
    
    this.drawn = false;
    
    // Remove the DOM object itself
    ELEM.del(this.elemId);
    
    delete this.rect;
    var _this = this;
    for( var i in _this ){
      _this[i] = null;
      delete _this[i];
    }
  },
  
  // Idle poller (recursive)
  onIdle: function() {
    for(var i = 0; i < this.views.length; i++) {
      HSystem.views[this.views[i]].onIdle();
    }
  },
  
/** method: buildParents
  *
  * Used by addView to build a parents array of parent classes.
  *
  **/
  buildParents: function(_viewId){
    var _view = HSystem.views[_viewId];
    _view.parent = this;
    _view.parents = [];
    for(var _parentNum = 0; _parentNum < this.parents.length; _parentNum++) {
      _view.parents.push(this.parents[_parentNum]);
    }
    _view.parents.push(this);
  },
  
/** method: addView
  *
  * Adds a sub-view/component to the view.
  *
  * Called from inside the HView constructor and should be automatic for all 
  * components that accept the 'parent' parameter, usually the second argument,
  * after the <HRect>.
  *
  * May also be used to attach a freely floating component (removed with <remove>)
  * to another component.
  *
  * Parameter:
  *  _view - Usually *this* inside <HView>-derivate components.
  *
  * Returns:
  *  The view id.
  *
  * See also:
  *  <HApplication.addView> <remove> <die>
  **/
  addView: function(_view) {
    var _viewId = HSystem.addView(_view);
    this.views.push(_viewId);
    
    this.buildParents(_viewId);
    this.viewsZOrder.push(_viewId);
    
    return _viewId;
  },
  
/** method: removeView
  *
  * Call this if you need to remove a child view from this view without
  * destroying its element, making it in effect a view without parent.
  * Useful, for example, for moving a view from one parent component to another.
  *
  * Parameters:
  *  _viewId - The parent-specific view id. Actually an array index.
  *
  * See also:
  *  <remove> <addView> <HApplication.removeView> <destroy> <destroyView> <die>
  **/
  removeView: function(_viewId) {
    HSystem.views[_viewId].remove();
  },
  
/** method: destroyView
  *
  * Call this if you need to remove a child view from this view, destroying its
  * child elements recursively and removing all DOM elements too.
  *
  * Parameters:
  *  _viewId - The parent-specific view id. Actually an array index.
  *
  * See also:
  *  <remove> <removeView> <addView> <HApplication.removeView> <destroy> <destroyView> <die>
  **/
  destroyView: function(_viewId) {
    HSystem.views[_viewId].die();
  },
  
/** method: bounds
  *
  *  Returns bounds rectangle that defines the size and coordinate system
  *  of the component. This should be identical to the rectangle used in
  *  constructing the object, unless it has been changed after construction.
  *
  * Returns:
  *  A new <HRect> instance with identical values to this component's rect.
  *
  * See also:
  *  <resizeTo> <resizeBy> <offsetTo> <offsetBy> <HRect> <rect>
  **/
  bounds: function() {
    // Could be cached.
    var _bounds = new HRect(this.rect);
    
    _bounds.right -= _bounds.left;
    _bounds.left = 0;
    _bounds.bottom -= _bounds.top;
    _bounds.top = 0;
    
    return _bounds;
  },
  
  
/** method: resizeBy
  *
  * This method resizes the view, without moving its left and top sides.
  * It adds horizontal coordinate units to the width and vertical units to
  * the height of the view.
  * 
  * Since a View's frame rectangle must be aligned on screen pixels, only
  * integral values should be passed to this method. Values with
  * fractional components will be rounded to the nearest whole integer.
  *
  * If the View is attached to a window, this method causes its parent view
  * to be updated, so the View is immediately displayed in its new size. If it
  * doesn't have a parent or isn't attached to a window, this method
  * merely alter its frame and bounds rectangle.
  *
  * Parameters:
  *  _horizonal - Horizonal units to add to the width (negative units subtract)
  *  _vertical - Vertical units to add to the height (negative units subtract)
  *
  * See also:
  *  <resizeTo> <offsetTo> <offsetBy> <HRect> <rect> <bounds>
  **/
  resizeBy: function(_horizontal, _vertical) {
    var _rect = this.rect;
    _rect.right += _horizontal;
    _rect.bottom += _vertical;
    _rect.updateSecondaryValues();
    this.drawRect();
  },

/** method: resizeTo
  *
  * This method makes the view width units wide
  * and height units high. This method adjust the right and bottom
  * components of the frame rectangle accordingly.
  * 
  * Since a View's frame rectangle must be aligned on screen pixels, only
  * integral values should be passed to this method. Values with
  * fractional components will be rounded to the nearest whole integer.
  * 
  * If the View is attached to a window, this method causes its parent view
  * to be updated, so the View is immediately displayed in its new size. If it
  * doesn't have a parent or isn't attached to a window, this method
  * merely alter its frame and bounds rectangle.
  *
  * Parameters:
  *  _width - The new width of the view.
  *  _height - The new height of the view.
  *
  * See also:
  *  <resizeBy> <offsetTo> <offsetBy> <HRect> <rect> <bounds>
  **/
  resizeTo: function(_width, _height) {
    var _rect = this.rect;
    _rect.right = _rect.left + _width;
    _rect.bottom = _rect.top + _height;
    _rect.updateSecondaryValues();
    this.drawRect();
  },

/** method: offsetTo
  *
  * This method moves the view to a new coordinate. It adjusts the 
  * left and top components of the frame rectangle accordingly.
  * 
  * Since a View's frame rectangle must be aligned on screen pixels, only
  * integral values should be passed to this method. Values with
  * fractional components will be rounded to the nearest whole integer.
  * 
  * If the View is attached to a window, this method causes its parent view
  * to be updated, so the View is immediately displayed in its new size. If it
  * doesn't have a parent or isn't attached to a window, this method
  * merely alter its frame and bounds rectangle.
  *
  * Parameters (using component numeric values):
  *  _x - The new x-coordinate of the view.
  *  _y - The new y-coordinate of the view.
  *
  * Parameters (using a <HPoint> instance):
  *  _point - The new coordinate point of the view.
  *
  * See also:
  *  <resizeBy> <resizeTo> <offsetBy> <HRect.offsetTo> <rect> <bounds>
  **/
  offsetTo: function() {
    this.rect.offsetTo.apply(this.rect, arguments);
    this.drawRect();
  },
  
/** method: moveTo
  *
  * Alias method for <offsetTo>
  *
  **/
  moveTo: function() {
    this.offsetTo.apply(this, arguments);
  },
  
/** method: offsetBy
  *
  * This method re-positions the view without changing its size.
  * It adds horizontal coordinate units to the x coordinate and vertical
  * units to the y coordinate of the view.
  * 
  * Since a View's frame rectangle must be aligned on screen pixels, only
  * integral values should be passed to this method. Values with
  * fractional components will be rounded to the nearest whole integer.
  *
  * If the View is attached to a window, this method causes its parent view
  * to be updated, so the View is immediately displayed in its new size. If it
  * doesn't have a parent or isn't attached to a window, this method
  * merely alter its frame and bounds rectangle.
  *
  * Parameters:
  *  _horizonal - Horizonal units to change the x coordinate (negative units subtract)
  *  _vertical - Vertical units to add to change the y coordinate (negative units subtract)
  *
  * See also:
  *  <resizeTo> <offsetTo> <resizeBy> <HRect> <rect> <bounds>
  **/
  offsetBy: function(_horizontal, _vertical) {
    this.rect.offsetBy(_horizontal, _vertical);
    this.drawRect();
  },
  
/** method: moveBy
  *
  * Alias method for <offsetBy>
  *
  **/
  moveBy: function() {
    this.offsetBy.apply(this, arguments);
  },

/** method: bringToFront
  *
  * Brings the view to the front by changing its Z-Index.
  *
  * See also:
  *  <sendToBack> <zIndex>
  **/
  bringToFront: function() {
    if (!this.parent) {
      return;
    }
    var _index = this.zIndex();
    this.parent.viewsZOrder.splice(_index, 1);
    this.parent.viewsZOrder.push(this.viewId);
    this._updateZIndexAllSiblings();
  },
  
/** method: bringToFrontOf
  *
  * Brings itself to the front of the given view by changing its Z-Index.
  * Only works on sibling views.
  *
  * Parameters:
  *  _view - The view to bring to the front of.
  *
  * Returns:
  *  Success code. (true for success, false for no success)
  *
  **/
  bringToFrontOf: function(_view){
    if(this.parent.viewId != _view.parent.viewId){
      return false;
    }
    this.parent.viewsZOrder.splice( this.zIndex(), 1 ); // removes selfs index from the array
    this.parent.viewsZOrder.splice( _view.zIndex()+1, 0, this.viewId); // sets itself in front of to _view
    this._updateZIndexAllSiblings();
    return true;
  },
  
/** method: sendToBackOf
  *
  * Sends itself to the back of the given view by changing its Z-Index.
  * Only works on sibling views.
  *
  * Parameters:
  *  _view - The view to send to the back of.
  *
  * Returns:
  *  Success code. (true for success, false for no success)
  *
  **/
  sendToBackOf: function(_view){
    if(this.parent.viewId != _view.parent.viewId){
      return false;
    }
    this.parent.viewsZOrder.splice( this.zIndex(), 1 ); // removes selfs index from the array
    this.parent.viewsZOrder.splice( _view.zIndex(), 0, this.viewId); // sets itself in back of to _view
    this._updateZIndexAllSiblings();
    return true;
  },
  
/** method: sendBackward
  *
  * Sends itself one step backward by changing its Z-Index.
  *
  * Returns:
  *  Success code. (true for success, false for no success)
  *
  **/
  sendBackward: function(){
    var _index = this.zIndex();
    if(_index===0){
      return false;
    }
    this.parent.viewsZOrder.splice( _index, 1 ); // removes selfs index from the array
    this.parent.viewsZOrder.splice( _index-1, 0, this.viewId); // moves selfs position to one step less than where it was
    this._updateZIndexAllSiblings();
    return true;
  },
  
/** method: bringForward
  *
  * Brings itself one step forward by changing its Z-Index.
  *
  * Returns:
  *  Success code. (true for success, false for no success)
  *
  **/
  bringForward: function(){
    var _index = this.zIndex();
    if(_index===this.parent.viewsZOrder.length-1){
      return false;
    }
    this.parent.viewsZOrder.splice( _index, 1 ); // removes selfs index from the array
    this.parent.viewsZOrder.splice( _index+1, 0, this.viewId); // moves selfs position to one step more than it was
    this._updateZIndexAllSiblings();
    return true;
  },
  

/** method: sendToBack
  *
  * Sends the view to the back by changing its Z-Index.
  *
  * See also:
  *  <bringToFront> <zIndex>
  **/
  sendToBack: function() {
    if (!this.parent) {
      return;
    }
    var _index = this.zIndex();
    this.parent.viewsZOrder.splice(_index, 1); // removes this index from the arr
    this.parent.viewsZOrder.splice(0, 0, this.viewId); // unshifts viewId
    this._updateZIndexAllSiblings();
  },

/** method: sendToBack
  *
  * Use this method to get the Z-Index of itself.
  *
  * Returns:
  *  The current Z-Index value.
  *
  * See also:
  *  <bringToFront> <sendToBack>
  **/
  zIndex: function() {
    if (!this.parent) {
      return;
    }
    // Returns the z-order of this item as seen by the parent.
    return this.parent.viewsZOrder.indexOf(this.viewId);
  },
  
/** method: stringWidth
  *
  * Measures the characters encoded in length bytes of the string - or,
  * if no length is specified, the entire string up to the null character,
  * '0', which terminates it. The return value totals the width of all the
  * characters in coordinate units; it's the length of the baseline required
  * to draw the string.
  *
  * Parameters:
  * _string - The string to measure.
  * _length - (optional) How many characters to count.
  * _elemId - (optional) The element ID where the temporary string is created
  *   in.
  *
  * Returns:
  * The width in pixels required to draw a string in the font.
  *
  */
  stringSize: function(_string, _length, _elemId, _wrap, _extraCss) {
    if (_length || _length === 0) {
      _string = _string.substring(0, _length);
    }
    if (!_elemId && _elemId !== 0) {
      _elemId = this.elemId;
    }
    if (!_extraCss) {
      _extraCss = '';
    }
    if (!_wrap){
      _extraCss += 'white-space:nowrap;';
    }
    
    var _stringElem = ELEM.make(_elemId);
    ELEM.setCSS(_stringElem, "visibility:hidden;position:absolute;"+_extraCss);
    ELEM.setHTML(_stringElem, _string);
    var _visibleSize=ELEM.getVisibleSize(_stringElem);
    ELEM.del(_stringElem);
    return _visibleSize;
  },
  
  stringWidth: function(_string, _length, _elemId, _extraCss){
    return this.stringSize(_string, _length, _elemId, false, _extraCss)[0];
  },
  
  stringHeight: function(_string, _length, _elemId, _extraCss){
    return this.stringSize(_string, _length, _elemId, true, _extraCss)[1];
  },
  
/** method: pageX
  *
  * Returns:
  *  The X coordinate that has the scrolled position calculated.
  **/
  pageX: function() {
    var _x = 0;
    var _elem = this;
    while(_elem) {
      if(_elem.elemId && _elem.rect) {
        _x += ELEM.get(_elem.elemId).offsetLeft;
        _x -= ELEM.get(_elem.elemId).scrollLeft;
      }
      if(_elem.markupElemIds&&_elem.markupElemIds.subview){
        _x += ELEM.get(_elem.markupElemIds.subview).offsetLeft;
        _x -= ELEM.get(_elem.markupElemIds.subview).scrollLeft;
      }
      _elem = _elem.parent;
    }
    return _x;
  },
  
/** method: pageY
  *
  * Returns:
  *  The Y coordinate that has the scrolled position calculated.
  **/
  pageY: function() {
    var _y = 0;
    var _elem = this;
    while(_elem) {
      if(_elem.elemId && _elem.rect) {
        _y += ELEM.get(_elem.elemId).offsetTop;
        _y -= ELEM.get(_elem.elemId).scrollTop;
      }
      if(_elem.markupElemIds&&_elem.markupElemIds.subview){
        _y += ELEM.get(_elem.markupElemIds.subview).offsetTop;
        _y -= ELEM.get(_elem.markupElemIds.subview).scrollTop;
      }
      _elem = _elem.parent;
    }
    return _y;
  },
  
/** method: pageLocation
  *
  * Returns:
  *  The HPoint that has the scrolled position calculated.
  **/
  pageLocation: function() {
    return new HPoint(this.pageX(), this.pageY());
  },
  
/** method: optimizeWidth
  * 
  * An abstract method that derived classes may implement, if they are able to
  * resize themselves so that their content fits nicely inside.
  * 
  */
  optimizeWidth: function() {

  },
  
  
/** method: invalidatePositionCache
  * 
  * Invalidates event manager's element position cache for this view and its
  * subviews. Actual functionality is implemented in HControl.
  * 
  * See also:
  *   <HControl.invalidatePositionCache> <EventManager.invalidatePositionCache>
  * 
  */
  invalidatePositionCache: function() {
    for(var i=0; i<this.views.length; i++) {
      HSystem.views[this.views[i]].invalidatePositionCache();
    }
  },
  
  
/** method: bindDomElement
  * 
  * Binds a DOM element to the element manager's cache. This is a wrapper for
  * the <Element Manager.elem_bind> that keeps track of the bound elements and
  * frees them from the element manager when the view is destroyed.
  * 
  * Parameters:
  *   _domElementId - The value of the DOM element's id attribute that is to be
  *                   bound to the element cache.
  * 
  * Returns:
  *   The element index id of the bound element.
  * 
  * See also: 
  *   <unbindDomElement> <Element Manager.elem_bind>
  */
  bindDomElement: function(_domElementId) {
    var _cacheId = ELEM.bindId(_domElementId);
    if (_cacheId) {
      this._domElementBindings.push(_cacheId);
    }
    return _cacheId;
  },
  
  
/** method: unbindDomElement
  * 
  * Removes a DOM element from the element manager's cache. This is a wrapper
  * for the <Element Manager.elem_del>. This is used for safely removing DOM
  * nodes from the cache.
  * 
  * Parameters:
  *   _elementId - The id of the element in the element manager's cache that is
  *                to be removed from the cache.
  * 
  * See also: 
  *   <bindDomElement> <Element Manager.elem_del>
  */
  unbindDomElement: function(_elementId) {
    var _indexOfElementId = this._domElementBindings.indexOf(_elementId);
    if (_indexOfElementId > -1) {
      ELEM.del(_elementId);
      this._domElementBindings.splice(_indexOfElementId, 1);
    }
  }
  
  
});

HView.implement(HMarkupView);
HView.implement(HMorphAnimation);
