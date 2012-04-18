/*   RSence
 *   Copyright 2006 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

/*** = Description
  ** HView is the foundation class for all views. HView is useful for
  ** any type of view and control grouping. It is designed for easy extension
  ** and it's the foundation for HControl and all other controls.
  ** 
  ** The major differences between HView and HControl is that HView handles
  ** only visual representation and structurization. In addition to HView's
  ** features, HControl handles labels, values, events, states and such.
  ** However, HControl is more complex, so use HView instead whenever you don't
  ** need the additional features of HControl. HView implements the HMarkupView
  ** interface for template-related task.
  **
  ** = Usage
  **  var myAppInstance = HApplication.nu();
  **  var rect1 = [10, 10, 100, 100];
  **  var myViewInstance = HView.nu( rect1, myAppInstance );
  **  var myViewInstance.setStyle('background-color','#ffcc00');
  **  var rect2 = [10, 10, 70, 70];
  **  var mySubView1 = HView.nu( rect2, myViewIntance );
  **  var rect3 [20, 20, 50, 50];
  **  var mySubView2 = HView.nu( rect3, mySubView1 );
  **
***/
var//RSence.Foundation
HView = HClass.extend({
  
/** Component specific theme path.
  **/
  themePath:   null,
  
/** True, if the component using absolute positioning.
  * False, if the component is using relative positioning.
  **/
  isAbsolute: true,
  
/** The display mode to use.
  * Defaults to 'block'.
  * The other sane alternative is 'inline'.
  **/
  displayMode: 'block',
  
/** The visual value of a component, usually a String.
  * See +#setLabel+.
  **/
  label: null,
  
/** When true, calls the +refreshLabel+ method whenever
  * +self.label+ is changed.
  **/
  refreshOnLabelChange: true,
  
/** Escapes HTML in the label when true.
  **/
  escapeLabelHTML: false,
  
/** True, if the coordinates are right-aligned.
  * False, if the coordinates are left-aligned.
  * Uses flexRightOffset if true. Defined with 6-item arrays
  * for the _rect parameter of setRect or the constructor.
  * Can be set directly using the setFlexRight method.
  **/
  flexRight:  false,
  
/** True, if the coordinates are left-aligned.
  * False, if the coordinates are right-aligned.
  * Uses the X-coordinate of rect, if true.
  * Disabled using 6-item arrays with null x-coordinate
  * for the _rect parameter of setRect or the constructor.
  * Can be set directly using the setFlexLeft method.
  **/
  flexLeft:   true,
  
/** True, if the coordinates are top-aligned.
  * False, if the coordinates are bottom-aligned.
  * Uses the Y-coordinate of rect, if true.
  * Disabled using 6-item arrays with null x-coordinate
  * for the _rect parameter of setRect or the constructor.
  * Can be set directly using the setFlexTop method.
  **/
  flexTop:    true,
  
/** True, if the coordinates are bottom-aligned.
  * False, if the coordinates are top-aligned.
  * Uses flexBottomOffset if true. Defined with 6-item arrays
  * for the _rect parameter of setRect or the constructor.
  * Can be set directly using the setFlexRight method.
  **/
  flexBottom: false,
  
/** The amount of pixels to offset from the right edge when
  * flexRight is true. Defined with 6-item arrays
  * for the _rect parameter of setRect or the constructor.
  * Can be set directly using the setFlexRight method.
  **/
  flexRightOffset:  0,
  
/** The amount of pixels to offset from the bottom edge when
  * flexBottom is true.Defined with 6-item arrays
  * for the _rect parameter of setRect or the constructor.
  * Can be set directly using the setFlexBottom method.
  **/
  flexBottomOffset: 0,
  
/** The drawn flag is false before the component is visually
  * drawn, it's true after it's drawn.
  **/
  drawn: false,
  
/** The theme the component is constructed with. By default,
  * uses the HThemeManager.currentTheme specified at the time
  * of construction.
  **/
  theme: null,
  
/** The preserveTheme flag prevents the view from being redrawn
  * if HThemeManager.currentTheme is changed after the view
  * has been drawn. Is true, if theme has been set.
  **/
  preserveTheme: false,
  
/** The optimizeWidthOnRefresh flag, when enabled, allows
  * automatic width calculation for components that support
  * that feature.
  **/
  optimizeWidthOnRefresh: true,
  
/** The parent is the +_parent+ supplied to the constructor.
  * This is a complete object reference to the parent's namespace.
  **/
  parent: null,
  
/** The parents is an array containing parent instances up to
  * the root controller level. The root controller is almost
  * always an instance of HApplication.
  **/
  parents: null,
  
/** The viewId is the unique ID (serial number) of this view.
  * This means the view can be looked up globally based on its
  * id by using the +HSystem.views+ array.
  **/
  viewId: null,
  
/** The appId is the unique ID (serial number) of the app process
  * acting as the root controller of the view tree of which this
  * view is a member.
  * This means the app can be looked up globally based on this
  * id by using the +HSystem.apps+ array.
  **/
  appId: null,
  
/** The app is the reference of the app process acting as
  * the root controller of the view tree of which this view is a
  * member.
  * This is a complete object reference to the app's namespace.
  **/
  app: null,
  
/** The views array contains a list of subviews of this view
  * by id. To access the object reference, use the +HSystem.views+
  * array with the id.
  **/
  views: null,
  
/** The viewsZOrder array contains a list of subviews ordered by
  * zIndex. To change the order, use the bringToFront,
  * sendToBack, bringForwards, sendBackwards, bringToFrontOf and
  * sentToBackOf methods.
  **/
  viewsZOrder: null,
  
/** The isHidden flog reflects the visibility of the view.
  **/
  isHidden: false,
  
/** The +HRect+ instance bound to +self+ using the +constructor+ or +setRect+.
  **/
  rect: null,
  
/** An reference to the options block given as the constructor
  * parameter _options.
  **/
  options: null,
  
/** The viewDefaults is a HViewDefaults object that is extended
  * in the constructor with the options block given. The format of
  * it is an Object.
  * It's only used when not extended via HControl, see HControl#controlDefaults.
  **/
  viewDefaults: HViewDefaults,
  
/** = Description
  * Constructs the logic part of a HView.
  * The view still needs to be drawn on screen. To do that, call draw after
  * subcomponents of the view are initialized.
  *
  * = Parameters
  * +_rect+::     An instance of +HRect+, defines the position and size of views.
  *               It can be also defined with an array, see below.
  * +_parent+::   The parent instance this instance will be contained within.
  *               A valid parent can be another HView compatible instance,
  *               an HApplication instance, a HControl or a similar extended
  *               HView instance. The origin of the +_rect+ is the same as the
  *               parent's offset. For HApplication instances, the web browser's
  *               window's left top corner is the origin.
  *
  * == The +_rect+ dimensions as arrays
  * Instead of an instance of +HRect+, dimensions can also be supplied as arrays.
  * The array length must be either 4 or 6. If the length is 4, the dimensions are
  * specified as follows: +[ x, y, width, height ]+. Note that this is different
  * from the construction parameters of +HRect+ that takes the coordinates as two
  * points, like: +( left, top, right, bottom )+.
  * Arrays with 6 items are a bit more complex (and powerful) as they can specify
  * the flexible offsets too.
  * 
  * === The array indexes for a +_rect+ configured as an 4-item array:
  * Always left/top aligned, all items must be specified.
  * Index::            Description
  * +0+::              The X-coordinate (measured from the parent's left edge)
  * +1+::              The Y-coordinate (measured from the parent's top edge)
  * +2+::              The width.
  * +3+::              The height.
  *
  * === The array indexes a +_rect+ configured as an 6-item array:
  * Can be any configuration of left/top/right/bottom alignment and supports
  * flexible widths. At least 4 items must be specified.
  * Index::            Description
  * +0+::              The left-aligned X-coordinate or +null+ if the view is
  *                    right-aligned and using a right-aligned X-coordinate at
  *                    index +4+ as well as the width specified at index +2+.
  * +1+::              The top-aligned Y-coordinate or +null+ if the view is
  *                    bottom-aligned and using a right-aligned X-coordinate at
  *                    index +5+ as well as the height specified at index +3+.
  * +2+::              The width, if only one X-coordinate specifies the
  *                    position (at indexes +0+ or +4+).
  *                    If both X-coordinates (at indexes +0+ and +4+) are
  *                    specified, the width can be specified with a +null+ for
  *                    automatic (flexible) width. If the width is specified,
  *                    it's used as the minimum width.
  * +3+::              The height, if only one Y-coordinate specifies the
  *                    position (at indexes +1+ or +5+).
  *                    If both Y-coordinates (at indexes +1+ and +5+) are
  *                    specified, the height can be specified with a +null+ for
  *                    automatic (flexible) height. if the height is specified,
  *                    it's used as the minimum height.
  * +4+::              The right-aligned X-coordinate or +null+ if the view is
  *                    left-aligned and using a left-aligned X-coordinate at
  *                    index +0+ as well as the width specified at index +2+.
  * +5+::              The bottom-aligned Y-coordinate or +null+ if the view is
  *                    top-aligned and using a top-aligned X-coordinate at
  *                    index +1+ as well as the height specified at index +3+.
  * == Usage examples of +_rect+:
  * Specified as two instances of +HPoint+,
  * x: 23, y: 75, width: 200, height: 100:
  *  HRect.nu( HPoint.nu( 23, 75 ), HPoint.nu( 223, 175 ) )
  *
  * The same as above, but without +HPoint+ instances:
  *  HRect.nu( 23, 75, 223, 175 )
  *
  * The same as above, but with an array as the constructor
  * parameter for +HRect+:
  *  HRect.nu( [ 23, 75, 223, 175 ] )
  *
  * The same as above, but with an array instead of a +HRect+ instance:
  *  [ 23, 75, 200, 100 ]
  *
  * The same as above, but with a 6-item array:
  *  [ 23, 75, 200, 100, null, null ]
  *
  * The same as above, but aligned to the right instead of left:
  *  [ null, 75, 200, 100, 23, null ]
  *
  * The same as above, but aligned to the right/bottom edges:
  *  [ null, null, 200, 100, 23, 75 ]
  *
  * The same as above, but aligned to the left/bottom edges:
  *  [ 23, null, 200, 100, null, 75 ]
  *
  * Flexible width (based on the parent's dimensions):
  *  [ 23, 75, null, 100, 23, null ]
  *
  * Flexible height (based on the parent's dimensions):
  *  [ 23, 75, 200, null, null, 75 ]
  *
  * Flexible width and height (based on the parent's dimensions):
  *  [ 23, 75, null, null, 23, 75 ]
  *
  * Flexible width and height, but limited to a minimum width
  * of 200 and a minimum height of 100 (based on the parent's dimensions):
  *  [ 23, 75, 200, 100, 23, 75 ]
  *
  **/
  constructor: function(_rect, _parent, _options) {
    if( !_options ){
      _options = {};
    }
    if(!this.isinherited){
      _options = (this.viewDefaults.extend(_options)).nu(this);
    }
    
    this.options = _options;
    this.label = _options.label;
    
    // Moved these to the top to ensure safe theming operation
    if( _options.theme ){
      this.theme = _options.theme;
      this.preserveTheme = true;
    }
    else if(!this.theme){
      this.theme = HThemeManager.currentTheme;
      this.preserveTheme = false;
    }
    else {
      this.preserveTheme = true;
    }
    
    if(_options.visible === false) {
      this.isHidden = true;
    }
    
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
    
    this._cachedLeft = _rect.left;
    this._cachedTop = _rect.top;
    
    // Additional DOM element bindings are saved into this array so they can be
    // deleted from the element manager when the view gets destroyed.
    this._domElementBindings = [];
    
    if(!this.isinherited) {
      this.draw();
    }
  },
  
/** = Description
  * When the +_flag+ is true, the view will be aligned to the right.
  * The +_px+ offset defines how many pixels from the parent's right
  * edge the right edge of this view will be. If both setFlexRight
  * and setFlexLeft are set, the width is flexible.
  * Use the constructor or setRect instead of calling this method
  * directly.
  *
  * = Parameters
  * +_flag+::    Boolean flag (true/false). Enables
  *              right-alignment when true.
  * +_px+::      The amount of pixels to offset from the right
  *              edge of the parent's right edge.
  *
  * = Returns
  * +self+
  **/
  setFlexRight: function(_flag,_px){
    if(_flag===undefined){_flag=true;}
    this.flexRight = _flag;
    if(_px===undefined){_px=0;}
    this.flexRightOffset = _px;
    return this;
  },
  
/** = Description
  * When the +_flag+ is true, the view will be aligned to the left (default).
  * The +_px+ offset defines how many pixels from the parent's left
  * edge the left edge of this view will be. If both setFlexLeft
  * and setFlexRight are set, the width is flexible.
  * Use the constructor or setRect instead of calling this method
  * directly.
  *
  * = Parameters
  * +_flag+::    Boolean flag (true/false). Enables
  *              left-alignment when true.
  * +_px+::      The amount of pixels to offset from the left
  *              edge of the parent's left edge.
  *
  * = Returns
  * +self+
  **/
  setFlexLeft: function(_flag,_px){
    if(_flag===undefined){_flag=true;}
    this.flexLeft = _flag;
    if((_px || _px === 0) && this.rect){
      this.rect.setLeft(_px);
    }
    return this;
  },
  
/** = Description
  * When the +_flag+ is true, the view will be aligned to the top (default).
  * The +_px+ offset defines how many pixels from the parent's top
  * edge the top edge of this view will be. If both setFlexTop
  * and setFlexBottom are set, the height is flexible.
  * Use the constructor or setRect instead of calling this method
  * directly.
  *
  * = Parameters
  * +_flag+::    Boolean flag (true/false). Enables
  *              top-alignment when true.
  * +_px+::      The amount of pixels to offset from the top
  *              edge of the parent's top edge.
  *
  * = Returns
  * +self+
  **/
  setFlexTop: function(_flag,_px){
    if(_flag===undefined){_flag=true;}
    this.flexTop = _flag;
    if((_px || _px === 0) && this.rect){
      this.rect.setTop(_px);
    }
    return this;
  },
  
/** = Description
  * When the +_flag+ is true, the view will be aligned to the bottom.
  * The +_px+ offset defines how many pixels from the parent's bottom
  * edge the bottom edge of this view will be. If both setFlexBottom
  * and setFlexTop are set, the height is flexible.
  * Use the constructor or setRect instead of calling this method
  * directly.
  *
  * = Parameters
  * +_flag+::    Boolean flag (true/false). Enables
  *              bottom-alignment when true.
  * +_px+::      The amount of pixels to offset from the bottom
  *              edge of the parent's bottom edge.
  *
  * = Returns
  * +self+
  **/
  setFlexBottom: function(_flag,_px){
    if(_flag===undefined){_flag=true;}
    this.flexBottom = _flag;
    if(_px===undefined){_px=0;}
    this.flexBottomOffset = _px;
    return this;
  },
  
/** = Description
  * The +_flag+ enables or disables the absolute positioning mode.
  * (It's enabled by default). If absolute positioning mode is 
  * off, the coordinate system has little or no effect.
  *
  * = Parameters
  * +_flag+::    Boolean flag (true/false). Enables
  *              absolute positioning when true.
  *              Enables relative positioning when false.
  *
  * = Returns
  * +self+
  **/
  setAbsolute: function(_flag){
    if(_flag===undefined){_flag=true;}
    this.isAbsolute = _flag;
    return this;
  },
  
/** = Description
  * The +_flag+ enables or disables the relative positioning mode.
  * (It's disabled by default). If relative positioning mode is 
  * on, the coordinate system has little or no effect.
  *
  * = Parameters
  * +_flag+::    Boolean flag (true/false). Enables
  *              absolute relative when true.
  *              Enables absolute positioning when false.
  *
  * = Returns
  * +self+
  **/
  setRelative: function(_flag){
    if(_flag===undefined){_flag=true;}
    this.isAbsolute = (!_flag);
    return this;
  },
  
/** = Description
  * Used by html theme templates to get the theme-specific full image path.
  *
  * = Returns
  * The full path of the theme-specific gfx path as a string.
  **/
  getThemeGfxPath: function() {
    var _themeName;
    if( this.preserveTheme ){
      _themeName = this.theme;
    } else {
      _themeName = HThemeManager.currentTheme;
    }
    return HThemeManager._componentGfxPath( _themeName,  this.componentName, this.themePath );
  },
  
/** = Description
  * Used by html theme templates to get the theme-specific full path
  * of the _fileName given.
  *
  * = Returns
  * The full path of the file.
  **/
  getThemeGfxFile: function( _fileName ) {
    if( this.preserveTheme ){
      _themeName = this.theme;
    } else {
      _themeName = HThemeManager.currentTheme;
    }
    return HThemeManager._componentGfxFile( _themeName,  this.componentName, this.themePath, _fileName );
  },
  
/** --
  * = Description
  * The _makeElem method does the ELEM.make call to create
  * the <div> element of the component. It assigns the elemId.
  * It's a separate method to ease creating component that require
  * other element types.
  * ++
  **/
  _makeElem: function(_parentElemId){
    this.elemId = ELEM.make(_parentElemId,'div');
  },
  
/** --
  * = Description
  * The _setCSS method does the initial styling of the element.
  * It's a separate method to ease creating component that require
  * other initial styles.
  * ++
  **/
  _setCSS: function(_additional){
    var _cssStyle = 'overflow:hidden;visibility:hidden;';
    if(this.isAbsolute){
      _cssStyle += 'position:absolute;';
    } else {
      _cssStyle += 'position:relative;';
    }
    _cssStyle += _additional;
    ELEM.setCSS(this.elemId,_cssStyle);
  },
  
/** --
  * = Description
  * The _getParentElemId method returns the ELEM ID of the parent.
  * ++
  **/
  _getParentElemId: function(){
    var _parent = this.parent;
    return ((_parent.elemId === undefined)?0:((_parent._getSubviewId===undefined)?0:_parent._getSubviewId()));
  },
  
  _getSubviewId: function(){
    if(this.markupElemIds&&this.markupElemIds.subview!==undefined){
      return this.markupElemIds.subview;
    }
    else if(this.elemId !== undefined) {
      return this.elemId;
    }
    return 0;
  },
  
/** --
  * = Description
  * The _createElement method calls the methods required to initialize the
  * main DOM element of the view.
  * ++
  **/
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
  
/** = Description
  * The +drawRect+ method refreshes the dimensions of the view.
  * It needs to be called to affect changes in the rect.
  * It enables the drawn flag.
  *
  * = Returns
  * +self+
  *
  **/
  drawRect: function() {
    if(!this.rect.isValid){
      console.log('invalid rect:',this.rect);//,ELEM.get(this.elemId));
    }
    if(!this.parent){
      console.log('no parent:',ELEM.get(this.elemId));
    }
    if (this.parent && this.rect.isValid) {
      var
      i = 0,
      _this = this,
      _elemId = _this.elemId,
      _rect = _this.rect,
      _auto = 'auto',
      _left = _this.flexLeft?_rect.left:_auto,
      _top  = _this.flexTop?_rect.top:_auto,
      _right = _this.flexRight?_this.flexRightOffset:_auto,
      _bottom = _this.flexBottom?_this.flexBottomOffset:_auto,
      _width = (_this.flexLeft&&_this.flexRight)?_auto:_rect.width,
      _height = (_this.flexTop&&_this.flexBottom)?_auto:_rect.height,
      _styles = [
        [ 'left',   _left   ],
        [ 'top',    _top    ],
        [ 'right',  _right  ],
        [ 'bottom', _bottom ],
        [ 'width',  _width  ],
        [ 'height', _height ],
        [ 'display', _this.displayMode ]
      ],
      _key, _value;
      // Show the rectangle once it gets created, unless visibility was set to
      // hidden in the constructor.
      if(!_this.isHidden) {
        _styles.push( [ 'visibility', 'inherit' ] );
      }
      for(;i<_styles.length;i++){
        _key = _styles[i][0];
        _value = _styles[i][1];
        if( i < 6 && _value !== _auto ){
          _value += 'px';
        }
        ELEM.setStyle(_elemId,_key,_value,true);
      }
      if(this.drawn === false){
        _this._updateZIndex();
      }
      
      if ( _this._cachedLeft !== _rect.left || _this._cachedTop !== _rect.top) {
        _this.invalidatePositionCache();
        _this._cachedLeft = _rect.left;
        _this._cachedTop = _rect.top;
      }
    
      _this.drawn = true;
    }
    return this;
  },
  
/** --
  * This method updates the z-index property of the children of self.
  * It's essentially a wrapper for HSystem.updateZIndexOfChildren passed
  * with the viewId of self.
  * ++
  **/
  _updateZIndex: function() {
    HSystem.updateZIndexOfChildren(this.viewId);
  },
  
/** --
  * This method updates the z-index property of the siblings of self.
  * It's essentially a wrapper for HSystem.updateZIndexOfChildren passed
  * with the parent's viewId of self.
  * ++
  **/
  _updateZIndexAllSiblings: function() {
    HSystem.updateZIndexOfChildren(this.parent.viewId);
  },
  
/** = Description
  * The higher level draw wrapper for drawRect, drawMarkup and drawSubviews.
  * Finally calls refresh.
  * 
  * = Returns
  * +self+
  *
  **/
  _ieNoThrough: null,
  draw: function() {
    var _isDrawn = this.drawn;
    this.drawRect();
    if(!_isDrawn){
      this.firstDraw();
      if(this['componentName']!==undefined){
        this.drawMarkup();
      }
      else if(BROWSER_TYPE.ie && this._ieNoThrough === null){
        this._ieNoThrough = ELEM.make( this.elemId );
        ELEM.setCSS( this._ieNoThrough, 'position:absolute;left:0;top:0;bottom:0;right:0;background-color:#ffffff;font-size:0;line-height:0' );
        ELEM.setStyle( this._ieNoThrough, 'opacity', 0.01 );
      }
      this.drawSubviews();
      if(this.options.style){
        this.setStyles( this.options.style );
      }
      if(this.options.html){
        this.setHTML(this.options.html);
      }
      if(!this.isHidden){
        this.show();
      }
    }
    this.refresh();
    return this;
  },
  
/** = Description
  * Called once, before the layout of the view is initially drawn.
  * Doesn't do anything by itself, but provides an extension point.
  *
  **/
  firstDraw: function(){
  },
  
/** = Description
  * Called once, when the layout of the view is initially drawn.
  * Doesn't do anything by itself, but provides an extension point for making
  * subviews.
  *
  **/
  drawSubviews: function(){
  },
  
/** --
  * Loads the markup from theme manager. If this.preserveTheme is set to true,
  * the this.theme is used for loading the markup. Otherwise the currently
  * active theme is used.
  * ++
  **/
  _loadMarkup: function() {
    var _themeName, _markup;
    if (this.preserveTheme) {
      _themeName = this.theme;
    }
    else {
      _themeName = HThemeManager.currentTheme;
    }
    _markup = HThemeManager.getMarkup( _themeName, this.componentName, this.themePath );
    if(_markup === false){
      console.log('Warning: Markup template for "'+this.componentName+'" using theme "'+_themeName+'" not loaded.');
    }
    this.markup = _markup;
    return (_markup !== false);
  },
  
/** = Description
  * Replaces the contents of the view's DOM element with html from the theme specific html file.
  *
  * = Returns
  * +self+
  **/
  markupElemNames: ['bg', 'label', 'state', 'control', 'value', 'subview'],
  drawMarkup: function() {
    // ELEM.setStyle(this.elemId, 'display', 'none', true);
    
    // continue processing from here on:
    var _markupStatus = this._loadMarkup();
    
    this.bindMarkupVariables();
    ELEM.setHTML(this.elemId, this.markup);
    
    this.markupElemIds = {};
    for(var i=0; i < this.markupElemNames.length; i++ ) {
      var _partName = this.markupElemNames[ i ],
          _elemName = _partName + this.elemId,
          _htmlIdMatch = ' id="' + _elemName + '"';
      if( this.markup.indexOf( _htmlIdMatch ) !== -1 ) {
        this.markupElemIds[ _partName ] = this.bindDomElement( _elemName );
      }
    }
    
    // ELEM.setStyle(this.elemId, 'display', this.displayMode );
    return this;
  },
  
/** = Description
  * Replaces the contents of the view's DOM element with custom html.
  *
  * = Parameters
  * +_html+:: The HTML (string-formatted) to replace the content with.
  *
  * = Returns
  * +self+
  *
  **/
  setHTML: function( _html ) {
    ELEM.setHTML( this.elemId, _html );
    return this;
  },
  
/** = Description
  * Wrapper for setHTML, sets escaped html, if tags and such are present.
  *
  * = Parameters
  * +_text+:: The text to set. If it contains any html, it's escaped.
  *
  * = Returns
  * +self+
  **/
  setText: function( _text ) {
    return this.setHTML( this.escapeHTML( _text ) );
  },
  
/** = Description
  * Method to escape HTML from text.
  *
  * Converts < to &lt; and > to &gt; and & to &amp;
  *
  * = Parameters
  * +_html+:: The html to escape.
  *
  * = Returns
  * A string with the html escaped.
  **/
  escapeHTML: function( _html ) {
    if( typeof _html !== 'string' ) {
      return _html.toString();
    }
    for( var i=0, _reFrom, _reTo, _reArr = this._escapeHTMLArr; i < _reArr.length; i++ ){
      _reFrom = _reArr[i][0];
      _reTo = _reArr[i][1];
      _html = _html.replace( _reFrom, _reTo );
    }
    return _html;
  },
  _escapeHTMLArr: [
    [ new RegExp( /&/gmi ), '&amp;' ],
    [ new RegExp( />/gmi ), '&gt;' ],
    [ new RegExp( /</gmi ), '&lt;' ],
    [ new RegExp( /\n/gmi ), '<br>' ]
  ],
  
/** = Description
  *
  * This method should be extended in order to redraw only specific parts. The
  * base implementation calls optimizeWidth when optimizeWidthOnRefresh is set
  * to true.
  *
  * = Returns
  * +self+
  *
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
    if(this.refreshOnLabelChange){
      this.refreshLabel();
    }
    return this;
  },
  
/** Gets the size of the parent. If the parent is the document body, uses the browser window size.
  **/
  parentSize: function(){
    if(!this.parent){
      return [ 0, 0 ];
    }
    if(this.parent.elemId === 0){
      var
      _winSize = ELEM.windowSize(),
      _docSize = ELEM.getScrollSize(0);
      // console.log('winSize:',JSON.stringify(_winSize),', docSize:',JSON.stringify(_docSize));
      if( _docSize[0] > _winSize[0] || _docSize[1] > _winSize[1] ){
        _winSize = _docSize;
      }
      return [ _winSize[0], _winSize[1] ];
    }
    else {
      var
      _rect = this.parent.rect,
      _width, // = _rect.width,
      _height, // = _rect.height;
      _parentElemId = ( this.parent.markupElemIds && this.parent.markupElemIds.subview ) ? this.parent.markupElemIds.subview : this.parent.elemId;
      if (this.parent.flexLeft && this.parent.flexRight){
        _width = parseInt( ELEM.getStyle( _parentElemId, 'width', true ), 10 );
      }
      else {
        _width = _rect.width;
      }
      if (this.parent.flexBottom && this.parent.flexTop){
        _height = parseInt( ELEM.getStyle( _parentElemId, 'height', true ), 10 );
      }
      else {
        _height = _rect.height;
      }
      return [ _width, _height ];
    }
  },
  
/** Returns the maximum rect using the #parentSize.
  **/
  maxRect: function(){
    var _parentSize = this.parentSize();
    return [ 0, 0, _parentSize[0], _parentSize[1] ];
  },
  
  minWidth: 0,
  setMinWidth: function(_minWidth){
    if( typeof _minWidth === 'number' ){
      this.minWidth = _minWidth;
      ELEM.setStyle( this.elemId, 'min-width', this.minWidth+'px', true);
    }
    else {
      console.log('warning: setMinWidth( '+(typeof _minWidth)+' '+_minWidth+' ) should be a number; value ignored!');
    }
  },
  minHeight: 0,
  setMinHeight: function(_minHeight){
    if( typeof _minHeight === 'number' ){
      this.minHeight = _minHeight;
      ELEM.setStyle( this.elemId, 'min-height', this.minHeight+'px', true);
    }
    else {
      console.log('warning: setMinHeight( '+(typeof _minHeight)+' '+_minHeight+' ) should be a number; value ignored!');
    }
  },
  
/** = Description
  * Replaces the rect of the component with a new HRect instance and
  * then refreshes the display.
  *
  * = Parameters
  * +_rect+:: The new HRect instance to replace the old rect instance with.
  * +_rect+:: Array format, see HView#constructor for further details.
  *
  * = Returns
  * +self+
  *
  **/
  setRect: function(_rect) {
    if (this.rect) {
      this.rect.release(this);
    }
    if(typeof _rect === 'string'){
      _rect = this[_rect]();
    }
    if(_rect instanceof Array){
      var _arrLen = _rect.length,
          _throwPrefix = 'HView.setRect: If the HRect instance is replaced by an array, ';
      if((_arrLen === 4) || (_arrLen === 6)){
        var
        _leftOffset   = _rect[0],
        _topOffset    = _rect[1],
        _width        = _rect[2],
        _height       = _rect[3],
        _rightOffset  = ((_arrLen === 6)?_rect[4]:null),
        _bottomOffset = ((_arrLen === 6)?_rect[5]:null),
        _validLeftOffset    = (typeof _leftOffset    === 'number'),
        _validTopOffset     = (typeof _topOffset     === 'number'),
        _validRightOffset   = (typeof _rightOffset   === 'number'),
        _validBottomOffset  = (typeof _bottomOffset  === 'number'),
        _validWidth   = (typeof _width   === 'number'),
        _validHeight  = (typeof _height  === 'number'),
        _right,
        _bottom,
        _parentSize,
        _parentWidth,
        _parentHeight;
        if(_arrLen === 6){
          _parentSize = this.parentSize();
          _parentWidth = _parentSize[0];
          _parentHeight = _parentSize[1];
        }
        
        if( (!_validLeftOffset && !_validRightOffset) ||
            (!_validTopOffset && !_validBottomOffset) ){
          console.log(_throwPrefix + '(left or top) and (top or bottom) must be specified.');
        }
        else if( (!_validWidth   && !(_validLeftOffset && _validRightOffset)) ||
                 (!_validHeight  && !(_validTopOffset  && _validBottomOffset)) ){
          console.log(_throwPrefix + 'the (height or width) must be specified unless both (left and top) or (top and bottom) are specified.');
        }
        
        if(_validLeftOffset && _validWidth && !_validRightOffset){
          _right = _leftOffset + _width;
        }
        else if(!_validLeftOffset && _validWidth && _validRightOffset){
          _right = _parentWidth-_validRightOffset;
          _leftOffset = _right-_width;
          this.setMinWidth( _width );
        }
        else if(_validLeftOffset && _validRightOffset){
          _right = _parentWidth - _rightOffset;
          if( _validWidth ){
            this.setMinWidth( _width );
            if( _right - _leftOffset < _width ){
              _right = _leftOffset+_width;
              console.log('warning: the min-width('+
                _width+
                ') is less than available width('+
                (_parentWidth-_leftOffset-_rightOffset)+
                '). flexRightOffset yields to: '+_right+'!');
            }
          }
          else if ( _right < _leftOffset ) {
            console.log('warning: there is not enough width ('+
              _parentWidth+') to fit flexRightOffset ('+
              _rightOffset+
              ') and left ('+
              _leftOffset+
              '). right yields to ('+
              _leftOffset+') and flexRightOffset yields to ('+
              (_parentWidth-_leftOffset)+')!');
            _rightOffset = _parentWidth-_leftOffset;
            _right = _leftOffset;
          }
        }
        
        if(_validTopOffset && _validHeight && !_validBottomOffset){
          _bottom = _topOffset + _height;
        }
        else if(!_validTopOffset && _validHeight && _validBottomOffset){
          _bottom = _parentHeight-_validBottomOffset;
          _topOffset = _bottom-_height;
          this.setMinHeight( _height );
        }
        else if(_validTopOffset && _validBottomOffset){
          _bottom = _parentHeight - _bottomOffset;
          if( _validHeight ){
            this.setMinHeight( _height );
            if( _bottom - _topOffset < _height ){
              _bottom = _topOffset + _height;
              console.log('warning: the min-height('+
                _height+
                ') is less than available width('+
                (_parentHeight-_topOffset-_bottomOffset)+
                '). flexBottomOffset yields to: '+_bottom+'!');
            }
          }
          else if ( _bottom < _topOffset ) {
            console.log('warning: there is not enough height ('+
              _parentHeight+') to fit flexBottomOffset ('+
              _bottom+
              ') and bottom ('+
              _bottomOffset+
              '). bottom yields to ('+
              _topOffset+') and flexBottomOffset yields to ('+
              (_parentHeight-_topOffset)+')!');
            _bottomOffset = _parentHeight-_topOffset;
            _bottom = _topOffset;
          }
        }
        if( _leftOffset > _right ){
          _right = _leftOffset;
        }
        if( _topOffset > _bottom ){
          _bottom = _topOffset;
        }
        this.setMinWidth(this.minWidth);
        this.setMinHeight(this.minHeight);
        this.setFlexLeft(_validLeftOffset,_leftOffset);
        this.setFlexTop(_validTopOffset,_topOffset);
        this.setFlexRight(_validRightOffset,_rightOffset);
        this.setFlexBottom(_validBottomOffset,_bottomOffset);
        this.rect = HRect.nu(_leftOffset,_topOffset,_right,_bottom);
        if(!this.rect.isValid){
          console.log('---------------------------------------------');
          console.log('invalid rect:', this.rect.left, ',', this.rect.top, ',', this.rect.width, ',', this.rect.height, ',', this.rect.right, ',', this.rect.bottom );
          console.log(' parent size:', this.parentSize() );
          console.log('  rect array:', _rect );
          console.log('---------------------------------------------');
        }
        
      }
      else {
        console.log(_throwPrefix + 'the length has to be either 4 or 6.');
      }
    }
    else {
      this.rect = _rect;
    }
    this.rect.bind(this);
    this.refresh();
    return this;
  },
  
/** = Description
  * Sets any arbitary style of the main DOM element of the component.
  * Utilizes Element Manager's drawing queue/cache to perform the action.
  *
  * = Parameters
  * +_name+::          The style name (css syntax, eg. 'background-color')
  * +_value+::         The style value (css syntax, eg. 'rgb(255,0,0)')
  * +_cacheOverride+:: Cache override flag.
  *
  * = Returns
  * +self+
  *
  **/
  setStyle: function(_name, _value, _cacheOverride) {
    if (this.elemId) {
      ELEM.setStyle(this.elemId, _name, _value, _cacheOverride);
    }
    return this;
  },
  
  setStyles: function(_styles){
    var _stylesObjType = COMM.Values.type(_styles);
    if(_stylesObjType==='a'){
      this.setStylesArray(_styles);
    }
    else if(_stylesObjType==='h'){
      this.setStylesHash(_styles);
    }
    else {
      console.log('HView#setStyles: Invalid data, expected array or hash; type: '+h+', data:',_styles);
    }
    return this;
  },
  
  setStylesArray: function(_styles){
    var
    _styleItem, _styleKey, _styleValue, i = 0;
    for(;i<_styles.length;i++){
      _styleItem  = _styles[i];
      _styleKey   = _styleItem[0];
      _styleValue = _styleItem[1];
      this.setStyle(_styleKey,_styleValue);
    }
    return this;
  },
  
  setStylesHash: function(_styles){
    var
    _styleKey, _styleValue;
    for(_styleKey in _styles){
      _styleValue  = _styles[_styleKey];
      this.setStyle(_styleKey,_styleValue);
    }
    return this;
  },
  
/** = Description
  * Returns a style of the main DOM element of the component.
  * Utilizes +ELEM+ cache to perform the action.
  *
  * = Parameters
  * +_name+:: The style name (css syntax, eg. 'background-color')
  *
  * = Returns
  * The style property value (css syntax, eg. 'rgb(255,0,0)')
  *
  **/
  style: function(_name) {
    if (this.elemId) {
      return ELEM.getStyle(this.elemId, _name);
    }
    return '';
  },
  
/** = Description
  * Sets a style for a specified markup element that has been bound to this
  * view.
  *
  * = Parameters
  * +_partName+:: The identifier of the markup element.
  * +_name+::     The style name
  * +_value+::    The style value
  *
  * = Returns
  * +self+
  *
  **/
  setStyleOfPart: function(_partName, _name, _value, _force) {
    if (!this['markupElemIds']){
      console.log('Warning, setStyleOfPart: no markupElemIds');
    }
    else if (this.markupElemIds[_partName]===undefined) {
      console.log('Warning, setStyleOfPart: partName "'+_partName+'" does not exist for viewId '+this.viewId+'.');
    }
    else {
      ELEM.setStyle(this.markupElemIds[_partName], _name, _value, _force);
    }
    return this;
  },
  
/** = Description
  * Returns a style of a specified markup element that has been bound to this
  * view.
  *
  * = Parameters
  * +_partName+::  The identifier of the markup element.
  * +_name+::      The style name
  *
  * = Returns
  * The style of a specified markup element.
  *
  **/
  styleOfPart: function(_partName, _name, _force) {
    if (this.markupElemIds[_partName]===undefined) {
      console.log('Warning, styleOfPart: partName "'+_partName+'" does not exist for viewId '+this.viewId+'.');
      return '';
    }
    return ELEM.getStyle(this.markupElemIds[_partName], _name, _force);
  },
  
/** = Description
  * Sets a style of a specified markup element that has been bound to this
  * view.
  *
  * = Parameters
  * +_partName+::  The identifier of the markup element.
  * +_value+::     Value for markup element.
  *
  * = Returns
  * +self+
  *
  **/
  setMarkupOfPart: function( _partName, _value ) {
    if (this.markupElemIds[_partName]===undefined) {
      console.log('Warning, setMarkupOfPart: partName "'+_partName+'" does not exist for viewId '+this.viewId+'.');
    }
    else {
      ELEM.setHTML( this.markupElemIds[_partName], _value );
    }
    return this;
  },
  
/** = Description
  * Returns a style of a specified markup element that has been bound to this
  * view.
  *
  * = Parameters
  * +_partName+::  The identifier of the markup element.
  *
  * = Returns
  * The markup of a specified markup element.
  *
  **/
  markupOfPart: function(_partName) {
    if (this.markupElemIds[_partName]===undefined) {
      console.log('Warning, markupOfPart: partName "'+_partName+'" does not exist for viewId '+this.viewId+'.');
      return '';
    }
    return ELEM.getHTML(this.markupElemIds[_partName]);
  },
  
/** = Description
  * Sets a element attribute of the view's cell.
  *
  * = Parameters
  * +_key+::       The attribute key to set.
  * +_value+::     Value for markup element.
  * +_force+::     Optional force switch, defaults to false
  *
  * = Returns
  * +self+
  *
  **/
  setAttr: function( _key, _value, _force ){
    ELEM.setAttr( this.elemId, _key, _value, _force );
    return this;
  },

/** = Description
  * Gets a element attribute of the view's cell.
  *
  * = Parameters
  * +_key+::       The attribute key to get.
  * +_force+::     Optional force switch, defaults to false
  *
  * = Returns
  * The attribute value.
  *
  **/
  attr: function( _key, _force ){
    return ELEM.getAttr( this.elemId, _key, _force );
  },

/** = Description
  * Sets a element attribute of a specified markup element that has been bound to this
  * view.
  *
  * = Parameters
  * +_partName+::  The identifier of the markup element.
  * +_key+::       The attribute key to set
  * +_value+::     Value for markup element.
  * +_force+::     Optional force switch, defaults to false
  *
  * = Returns
  * +self+
  *
  **/
  setAttrOfPart: function( _partName, _key, _value, _force ) {
    if (this.markupElemIds[_partName]===undefined) {
      console.log('Warning, setAttrOfPart: partName "'+_partName+'" does not exist for viewId '+this.viewId+'.');
    }
    else {
      ELEM.setAttr( this.markupElemIds[_partName], _key, _value, _force );
    }
    return this;
  },
  
/** = Description
  * Returns a element attribute of a specified markup element that has been bound to this
  * view.
  *
  * = Parameters
  * +_partName+::  The identifier of the markup element.
  * +_key+::       The attribute key to get.
  * +_force+::     Optional force switch, defaults to false
  *
  * = Returns
  * The attribute of a specified markup element.
  *
  **/
  attrOfPart: function(_partName, _key, _force) {
    if (this.markupElemIds[_partName]===undefined) {
      console.log('Warning, attrOfPart: partName "'+_partName+'" does not exist for viewId '+this.viewId+'.');
      return '';
    }
    return ELEM.getAttr(this.markupElemIds[_partName], _key, _force);
  },

/** = Description
  * Returns a element itself of a specified markup element that has been bound to this
  * view.
  *
  * = Parameters
  * +_partName+::  The identifier of the markup element.
  *
  * = Returns
  * The element of a specified markup element.
  *
  **/
  elemOfPart: function(_partName) {
    if (this.markupElemIds[_partName]===undefined) {
      console.log('Warning, elemOfPart: partName "'+_partName+'" does not exist for viewId '+this.viewId+'.');
      return '';
    }
    return ELEM.get( this.markupElemIds[_partName] );
  },

/** = Description
  * Hides the component's main DOM element (and its children).
  *
  * = Returns
  * +self+
  *
  **/
  hide: function() {
    ELEM.setStyle(this.elemId,'visibility', 'hidden', true);
    // Required for the old, buggy Mozilla engines ( Firefox versions below 3.0 )
    // At least text fields would show through from hidden parent elements.
    // Disabled, because keeping the display as none causes hidden views to have no dimensions at all.
    // ELEM.setStyle(this.elemId,'display', 'none');
    this.isHidden = true;
    return this;
  },
  
/** = Description
  * Restores the visibility of the component's main DOM element (and its children).
  *
  * = Return
  * +self+
  *
  **/
  show: function() {
    ELEM.setStyle(this.elemId,'display', this.displayMode, true);
    ELEM.setStyle(this.elemId,'visibility', 'inherit', true);
    this.isHidden = false;
    return this;
  },
  
/** = Description
  * Toggles between hide and show.
  *
  * = Returns
  * +self+
  *
  **/
  toggle: function() {
    if(this.isHidden) {
      this.show();
    } else {
      this.hide();
    }
    return this;
  },
  
/** = Description
  * Call this if you need to remove a component from its parent's views array without
  * destroying the DOM element itself, making it in effect a view without parent.
  * Useful, for example, for moving a view from one parent component to another.
  *
  * = Returns
  * +self+
  *
  **/
  remove: function() {
    if( this.parent ) {
      
      var _viewZIdx = this.parent.viewsZOrder.indexOf(this.viewId),
          _viewPIdx = this.parent.views.indexOf(this.viewId);
      
      this.parent.views.splice(_viewPIdx,1);
      HSystem.delView(this.viewId);
      this.parent.viewsZOrder.splice( _viewZIdx, 1 );
      var _sysUpdateZIndexOfChildrenBufferIndex = HSystem._updateZIndexOfChildrenBuffer.indexOf( this.viewId );
      if(_sysUpdateZIndexOfChildrenBufferIndex !== -1){
        HSystem._updateZIndexOfChildrenBuffer.splice( _sysUpdateZIndexOfChildrenBufferIndex, 1 );
      }
      
      this._updateZIndexAllSiblings();
      this.parent  = null;
      this.parents = [];
    }
    return this;
  },
  
/** = Description
  * Deletes the component and all its children.
  * Should normally be called from the parent.
  *
  **/
  die: function() {
    // hide self, makes destruction seem faster
    this.hide();
    this.drawn = false;
    this.stopAnimation();
    // Delete the children first.
    var _childViewId, i;
    if(!this.views){
      console.log('HView#die: no subviews for component name: ',this.componentName,', self:',this);
    }
    while (this.views.length !== 0) {
      _childViewId = this.views[0];
      this.destroyView(_childViewId);
    }
    // Remove this object's bindings, except the DOM element.
    this.remove();
    // Remove the DOM element bindings.
    if( this._domElementBindings ){
      for ( i = 0; i < this._domElementBindings.length; i++) {
        ELEM.del(this._domElementBindings.pop());
      }
      // this._domElementBindings = [];
    }
    
    if( this._ieNoThrough !== null ){
      ELEM.del( this._ieNoThrough );
    }
    // Remove the DOM object itself
    ELEM.del(this.elemId);

    this.rect = null;
    var _this = this;
    for( i in _this ){
      _this[i] = null;
      delete _this[i];
    }
  },
  
/** Recursive idle poller. Should be extended if functionality is desired.
  **/
  // onIdle: function() {
  //   for(var i = 0; i < this.views.length; i++) {
  //     HSystem.views[this.views[i]].onIdle();
  //   }
  //},
  
/** Used by addView to build a parents array of parent classes.
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
  
/** = Description
  * Adds a sub-view/component to the view. Called from inside the 
  * HView#constructor and should be automatic for all components that accept 
  * the 'parent' parameter, usually the second argument, after the HRect. May 
  * also be used to attach a freely floating component (removed with remove) 
  * to another component.
  *
  * = Parameter
  * +_view+:: Usually this inside HView derivate components.
  *
  * = Returns
  * The view id.
  *
  **/
  addView: function(_view) {
    var _viewId = HSystem.addView(_view);
    this.views.push(_viewId);
    
    this.buildParents(_viewId);
    this.viewsZOrder.push(_viewId);
    
    return _viewId;
  },
  
/** = Description
  * Call this if you need to remove a child view from this view without
  * destroying its element, making it in effect a view without parent.
  * Useful, for example, for moving a view from one parent component to another.
  *
  * = Parameters
  * +_viewId+:: The parent-specific view id. Actually an array index.
  *
  * = Returns
  * +self+
  *
  **/
  removeView: function(_viewId) {
    this.app.removeView( _viewId ); // no reason to duplicate this functionality here
    return this;
  },
  
/** = Description
  * Call this if you need to remove a child view from this view, destroying its
  * child elements recursively and removing all DOM elements too.
  *
  * = Parameters
  * +_viewId+::  The parent-specific view id. Actually an array index.
  *
  * = Returns
  * +self+
  **/
  destroyView: function(_viewId) {
    HSystem.views[_viewId].die();
    return this;
  },
  
/** = Description
  * Returns bounds rectangle that defines the size and coordinate system
  * of the component. This should be identical to the rectangle used in
  * constructing the object, unless it has been changed after construction.
  *
  * = Returns
  * A new <HRect> instance with identical values to this component's rect.
  *
  **/
  bounds: function() {
    // Could be cached.
    var _bounds = new HRect(this.rect);
    
    _bounds.offsetTo(0,0);
    
    return _bounds;
  },
  
  
/** = Description
  * This method resizes the view, without moving its left and top sides.
  * It adds horizontal coordinate units to the width and vertical units to
  * the height of the view.
  * Since a View's frame rectangle must be aligned on screen pixels, only
  * integral values should be passed to this method. Values with
  * fractional components will be rounded to the nearest whole integer.
  * If the View is attached to a window, this method causes its parent view
  * to be updated, so the View is immediately displayed in its new size. If it
  * doesn't have a parent or isn't attached to a window, this method
  * merely alter its frame and bounds rectangle.
  *
  * = Parameters
  * +_horizonal+:: Horizonal units to add to the width (negative units subtract)
  * +_vertical+::  Vertical units to add to the height (negative units subtract)
  *
  * = Returns
  * +self+
  *
  **/
  resizeBy: function(_horizontal, _vertical) {
    var _rect = this.rect;
    _rect.right += _horizontal;
    _rect.bottom += _vertical;
    _rect.updateSecondaryValues();
    this.drawRect();
    return this;
  },

/** = Description
  * This method makes the view width units wide
  * and height units high. This method adjust the right and bottom
  * components of the frame rectangle accordingly.
  * Since a View's frame rectangle must be aligned on screen pixels, only
  * integral values should be passed to this method. Values with
  * fractional components will be rounded to the nearest whole integer.
  * If the View is attached to a window, this method causes its parent view
  * to be updated, so the View is immediately displayed in its new size. If it
  * doesn't have a parent or isn't attached to a window, this method
  * merely alter its frame and bounds rectangle.
  *
  * = Parameters
  * +_width+::  The new width of the view.
  * +_height+:: The new height of the view.
  *
  * = Returns
  * +self+
  *
  **/
  resizeTo: function(_width, _height) {
    var _rect = this.rect;
    _rect.right = _rect.left + _width;
    _rect.bottom = _rect.top + _height;
    _rect.updateSecondaryValues();
    this.drawRect();
    return this;
  },

/** = Descripion
  * This method moves the view to a new coordinate. It adjusts the 
  * left and top components of the frame rectangle accordingly.
  * Since a View's frame rectangle must be aligned on screen pixels, only
  * integral values should be passed to this method. Values with
  * fractional components will be rounded to the nearest whole integer.
  * If the View is attached to a window, this method causes its parent view
  * to be updated, so the View is immediately displayed in its new size. If it
  * doesn't have a parent or isn't attached to a window, this method
  * merely alter its frame and bounds rectangle.
  *
  * = Parameters
  * +_x+:: The new x-coordinate of the view.
  * +_y+:: The new y-coordinate of the view.
  *
  * +_point+:: The new coordinate point of the view.
  *
  * = Returns
  * +self+
  *
  **/
  offsetTo: function() {
    this.rect.offsetTo.apply(this.rect, arguments);
    this.drawRect();
    return this;
  },
  
/** = Description
  * Alias method for offsetTo.
  * 
  * = Returns
  * +self+
  *
  **/
  moveTo: function() {
    this.offsetTo.apply(this, arguments);
    return this;
  },
  
/** = Description
  * This method re-positions the view without changing its size.
  * It adds horizontal coordinate units to the x coordinate and vertical
  * units to the y coordinate of the view.
  * Since a View's frame rectangle must be aligned on screen pixels, only
  * integral values should be passed to this method. Values with
  * fractional components will be rounded to the nearest whole integer.
  * If the View is attached to a window, this method causes its parent view
  * to be updated, so the View is immediately displayed in its new size. If it
  * doesn't have a parent or isn't attached to a window, this method
  * merely alter its frame and bounds rectangle.
  *
  * = Parameters
  * +_horizonal+::  Horizonal units to change the x coordinate (negative units subtract)
  * +_vertical+::   Vertical units to add to change the y coordinate (negative units subtract)
  *
  * = Returns
  * +self+
  *
  **/
  offsetBy: function(_horizontal, _vertical) {
    this.rect.offsetBy(_horizontal, _vertical);
    this.drawRect();
    return this;
  },
  
/** = Description
  * Alias method for offsetBy.
  *
  * = Returns
  * +self+
  *
  **/
  moveBy: function() {
    this.offsetBy.apply(this, arguments);
    return this;
  },

/** = Description
  * Brings the view to the front by changing its Z-Index.
  *
  * = Returns
  * +self+
  *
  **/
  bringToFront: function() {
    if (this.parent) {
      var _index = this.zIndex();
      this.parent.viewsZOrder.splice(_index, 1);
      this.parent.viewsZOrder.push(this.viewId);
      this._updateZIndexAllSiblings();
    }
    return this;
  },
  
/** = Description
  * Brings itself to the front of the given view by changing its Z-Index.
  * Only works on sibling views.
  *
  * = Parameters
  * +_view+::  The view to bring to the front of.
  *
  * = Returns
  * +self+
  *
  **/
  bringToFrontOf: function(_view){
    if(this.parent.viewId === _view.parent.viewId){
      this.parent.viewsZOrder.splice( this.zIndex(), 1 ); // removes selfs index from the array
      this.parent.viewsZOrder.splice( _view.zIndex()+1, 0, this.viewId); // sets itself in front of to _view
      this._updateZIndexAllSiblings();
    }
    return this;
  },
  
/** = Description
  * Sends itself to the back of the given view by changing its Z-Index.
  * Only works on sibling views.
  *
  * = Parameters
  * +_view+::  The view to send to the back of.
  *
  * = Returns
  * +self+
  *
  **/
  sendToBackOf: function(_view){
    if(this.parent.viewId === _view.parent.viewId){
      this.parent.viewsZOrder.splice( this.zIndex(), 1 ); // removes selfs index from the array
      this.parent.viewsZOrder.splice( _view.zIndex(), 0, this.viewId); // sets itself in back of to _view
      this._updateZIndexAllSiblings();
    }
    return this;
  },
  
/** = Description
  * Sends itself one step backward by changing its Z-Index.
  *
  * = Returns
  * +self+
  *
  **/
  sendBackward: function(){
    var _index = this.zIndex();
    if(_index!==0){
      this.parent.viewsZOrder.splice( _index, 1 ); // removes selfs index from the array
      this.parent.viewsZOrder.splice( _index-1, 0, this.viewId); // moves selfs position to one step less than where it was
      this._updateZIndexAllSiblings();
    }
    return this;
  },
  
/** = Description
  * Brings itself one step forward by changing its Z-Index.
  *
  * = Returns
  * +self+
  *
  **/
  bringForward: function(){
    var _index = this.zIndex();
    if(_index!==this.parent.viewsZOrder.length-1){
      this.parent.viewsZOrder.splice( _index, 1 ); // removes selfs index from the array
      this.parent.viewsZOrder.splice( _index+1, 0, this.viewId); // moves selfs position to one step more than it was
      this._updateZIndexAllSiblings();
    }
    return this;
  },
  

/** = Description
  * Sends the view to the back by changing its Z-Index.
  *
  * = Returns
  * +self+
  *
  **/
  sendToBack: function() {
    if (this.parent) {
      var _index = this.zIndex();
      this.parent.viewsZOrder.splice(_index, 1); // removes this index from the arr
      this.parent.viewsZOrder.splice(0, 0, this.viewId); // unshifts viewId
      this._updateZIndexAllSiblings();
    }
    return this;
  },

/** = Description
  * Use this method to get the Z-Index of itself.
  *
  * = Returns
  * The current Z-Index value.
  *
  **/
  zIndex: function() {
    if (!this.parent) {
      return -1;
    }
    // Returns the z-order of this item as seen by the parent.
    return this.parent.viewsZOrder.indexOf(this.viewId);
  },
  
/** = Description
  * Measures the characters encoded in length bytes of the string - or,
  * if no length is specified, the entire string up to the null character,
  * '0', which terminates it. The return value totals the width of all the
  * characters in coordinate units; it's the length of the baseline required
  * to draw the string.
  *
  * = Parameters
  * +_string+::   The string to measure.
  * +_length+::   Optional, How many characters to count.
  * +_elemId+::   Optional, The element ID where the temporary string is created
  *               in.
  * +_wrap+::     Optional boolean value, wrap whitespaces?
  * +_extraCss+:: Optional, extra css to add.
  *
  * = Returns
  * The width in pixels required to draw a string in the font.
  *
  **/
  stringSize: function(_string, _length, _elemId, _wrap, _extraCss) {
    if (_length || _length === 0) {
      _string = _string.substring(0, _length);
    }
    if (!_elemId && _elemId !== 0) {
      _elemId = 0; //this.elemId;
    }
    if (!_extraCss) {
      _extraCss = '';
    }
    if (!_wrap){
      _extraCss += 'white-space:nowrap;';
    }
    
    var _stringElem = ELEM.make(_elemId,'span');
    ELEM.setCSS(_stringElem, "visibility:hidden;"+_extraCss);
    ELEM.setHTML(_stringElem, _string);
    // ELEM.flushLoop();
    var _visibleSize=ELEM.getSize(_stringElem);
    // console.log('visibleSize',_visibleSize);
    ELEM.del(_stringElem);
    return [_visibleSize[0]+_visibleSize[0]%2,_visibleSize[1]+_visibleSize[1]%2];
  },
  
/** Returns the string width
  **/
  stringWidth: function(_string, _length, _elemId, _extraCss){
    return this.stringSize(_string, _length, _elemId, false, _extraCss)[0];
  },
  
  /** Returns the string height.
    **/
  stringHeight: function(_string, _length, _elemId, _extraCss){
    return this.stringSize(_string, _length, _elemId, true, _extraCss)[1];
  },
  
/** Returns the X coordinate that has the scrolled position calculated.
  **/
  pageX: function() {
    return ELEM._getVisibleLeftPosition( this.elemId );
  },
  
/** Returns the Y coordinate that has the scrolled position calculated.
  **/
  pageY: function() {
    return ELEM._getVisibleTopPosition( this.elemId );
  },
  
/** = Description
  * Sets the label on a control component: the text that's displayed in 
  * HControl extensions. Visual functionality is implemented in component 
  * theme templates and refreshLabel method extensions.
  *
  * Avoid extending directly, extend +refreshLabel+ instead.
  *
  * = Parameters
  * +_label+:: The text the component should display.
  *
  * = Returns
  * +self+
  *
  **/
  setLabel: function(_label) {
    if(this.escapeLabelHTML){
      _label = this.escapeHTML( _label );
    }
    var _this = this,
        _differs = (_label !== _this.label);
    if(_differs){
      _this.label = _label;
      _this.options.label = _label;
      _this.refresh();
    }
    return this;
  },
  
/** = Description
  * Called when the +self.label+ has been changed. By default
  * tries to update the label element defined in the theme of
  * the component. Of course, the HControl itself doesn't
  * define a theme, so without a theme doesn't do anything.
  *
  * = Returns
  * +self+
  *
  **/
  refreshLabel: function(){
    if(this.markupElemIds){
      if(this.markupElemIds['label']){
        ELEM.setHTML(this.markupElemIds.label,this.label);
      }
    }
    return this;
  },
  
/** Returns the HPoint that has the scrolled position calculated.
  **/
  pageLocation: function() {
    return new HPoint(this.pageX(), this.pageY());
  },
  
/** = Description
  * An abstract method that derived classes may implement, if they are able to
  * resize themselves so that their content fits nicely inside.
  * Similar to pack, might be renamed when components are written to
  * be savvy of this feature.
  **/
  optimizeWidth: function() {

  },
  
  
/** = Description
  * Invalidates event manager's element position cache for this view and its
  * subviews. Actual functionality is implemented in HControl.
  * 
  * = Returns
  * +self+
  * 
  **/
  invalidatePositionCache: function() {
    for(var i=0; i<this.views.length; i++) {
      if( typeof HSystem.views[this.views[i]]['invalidatePositionCache'] === 'function' ){
        HSystem.views[this.views[i]].invalidatePositionCache();
      }
    }
    return this;
  },
  
  
/** = Description
  * Binds a DOM element to the +ELEM+ cache. This is a wrapper for
  * the ELEM#elem_bind that keeps track of the bound elements and
  * frees them from the element manager when the view is destroyed.
  * 
  * = Parameters
  * +_domElementId+:: The value of the DOM element's id attribute that is
  *                   to be bound to the element cache.
  * 
  * = Returns
  * The element index id of the bound element.
  * 
  **/
  bindDomElement: function(_domElementId) {
    var _cacheId = ELEM.bindId(_domElementId);
    if (_cacheId) {
      this._domElementBindings.push(_cacheId);
    }
    return _cacheId;
  },
  
  
/** = Description
  * Removes a DOM element from the +ELEM+ cache. This is a wrapper
  * for the ELEM#elem_del. This is used for safely removing DOM
  * nodes from the cache.
  * 
  * = Parameters
  * +_elementId+:: The id of the element in the element manager's cache 
  *                that is to be removed from the cache.
  * 
  **/
  unbindDomElement: function(_elementId) {
    var _indexOfElementId = this._domElementBindings.indexOf(_elementId);
    if (_indexOfElementId > -1) {
      ELEM.del(_elementId);
      this._domElementBindings.splice(_indexOfElementId, 1);
    }
  },
  
  
/** = Description
  * Finds a string from the locale of the component.
  * The attrPath is a string or array to find an object.
  * For instance, if a component has a structure like this defined:
  *   HLocale.components.FooComponent = {
  *     strings: {
  *       defaultLabel: 'Default Label',
  *       otherLabel: 'Other Label',
  *     }
  *   };
  * 
  * To get the defaultLabel, call getLocaleString like this:
  *   this.getLocaleString( 'FooComponent', 'strings.defaultLabel' );
  * ..or:
  *   this.getLocaleString( 'FooComponent', ['strings','defaultLabel'] );
  * ..or:
  *   this.getLocaleString( 'FooComponent.strings.defaultLabel' );
  *
  * = Parameters
  * +_componentClassName+:: The name of the item in HLocale.components
  * +_attrPath+::     The object path to the string. String or Array.
  * +_default+::      The default object to return if nothing matched.
  * 
  **/
  getLocaleString: function( _componentClassName, _attrPath, _default ){
    if( _default === undefined ){
      _default = '';
    }
    var
    _searchTarget = HLocale.components[_componentClassName],
    i = 0,
    _key;
    if( _searchTarget === undefined && (typeof _componentClassName === 'string') ){
      _searchTarget = HLocale.components;
      _attrPath = _componentClassName;
      _default = _attrPath;
    }
    if( typeof _attrPath === 'string' ){
      if( _attrPath.indexOf( '.' ) > 0 ){
        _attrPath = _attrPath.split('.');
      }
      else {
        _attrPath = [ _attrPath ];
      }
    }
    if( _searchTarget[ _attrPath[0] ] === undefined ){
      _searchTarget = HLocale;
    }
    if( _searchTarget[ _attrPath[0] ] === undefined ){
      return _default;
    }
    for( ; i < _attrPath.length; i++ ){
      _key = _attrPath[i];
      if( typeof _searchTarget[_key] === 'object' ){
        _searchTarget = _searchTarget[_key];
      }
      else if( typeof _searchTarget[_key] === 'string' ){
        return _searchTarget[_key];
      }
      else {
        return _default;
      }
    }
    return _default;
  },

  isParentOf: function( _obj ){
    if( !_obj ){
      return false;
    }
    if( typeof _obj['hasAncestor'] === 'function' ){
      if( _obj.parents.indexOf( this ) !== -1 ){
        return true;
      }
    }
    return false;
  },

  isChildOf: function( _obj ){
    if( !_obj ){
      return false;
    }
    if( typeof _obj['isParentOf'] === 'function' ){
      return _obj.isParentOf( this );
    }
    return false;
  },

  isSiblingOf: function( _obj ){
    if( !_obj ){
      return false;
    }
    if( typeof _obj['parents'] === 'object' && _obj.parents instanceof Array ){
      if( _obj.parents.length !== this.parents.length ){
        return false;
      }
      var i = this.parents.length-1;
      return _obj.parents[i] === this.parents[i];
    }
    return false;
  }
  
  
});

HView.implement(HMarkupView);
HView.implement(HMorphAnimation);

