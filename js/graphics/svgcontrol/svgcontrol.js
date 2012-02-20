/*   RSence
 *   Copyright 2009 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

var//RSence.Graphics
SVGControl = HControl.extend({
  isSVGContainer: true,
  _svgNS: 'http://www.w3.org/2000/svg',
  _pictElemStyle: [
    // 'width:100%',
    // 'height:100%',
    'position:absolute',
    'top:0px',
    'left:0px',
    'right:0px',
    'bottom:0px'
  ].join(';'),
  getPictElem: function(){
    return ELEM.get( this.pictId );
  },
  getPictElemById: function( _pictElemId ){
    return this._pictElemIds[ _pictElemId ];
  },
  _pictElemIds: null,
  _freePictElemIds: null,
  
  _nextPictElemId: function(){
    var
    _this = this,
    _nodeId = ( _this._freePictElemIds.length === 0 )?_this._pictElemIds.length:_this._freePictElemIds.shift();
    // console.log( 'nodeId:', _nodeId );
    return _nodeId;
  },
  
  _makePictElem: function( _parentId, _type ){
    _parentId = _parentId?_parentId:0;
    var
    _this = this,
    _nodeId = _this._nextPictElemId(),
    _objectNode = document.createElementNS( _this._svgNS, _type ),
    _parentNode = _this._pictElemIds[_parentId];
    if(_parentNode === undefined || _parentNode === null){
      // console.log('invalid parent',_parentNode,', parentId:',_parentId,', type:',_type,', nodeId:',_nodeId,', pictElemIds:',_this._pictElemIds);
      _parentNode = _this._pictElemIds[0];
    }
    _this._pictElemIds[_nodeId] = _objectNode;
    // if ( !_parentNode ) {
    //   console.log('no parent', _parentNode);
    //   _parentNode = _this._pictElemIds[0];
    // }
    _parentNode.appendChild( _objectNode );
    return _nodeId;
  },
  
  _deletePictElem: function(_nodeId){
    var
    _this = this,
    _objectNode = _this._pictElemIds[_nodeId],
    _parentNode = _objectNode.parentNode; 
    _parentNode.removeChild(_objectNode);
    _this._pictElemIds[_nodeId] = null;
    _this._freePictElemIds.push(_nodeId);
  },
  
  makeGroupElem: function( _rect, _parentId, _options ){
    var
    _this = this,
    _nodeId = _this._makePictElem( _parentId, 'g' );
    _this.setAttrsOfPictElem(
      _nodeId,
      _this._attrParse(
        _options.attr, {
          // x: _rect[0],
          // y: _rect[1],
          // width: _rect[2],
          // height: _rect[3]
        },
        _options.style
      )
    );
    return _nodeId;
  },
  
  // rect: [0,10,100,200] => [x=0,y=10,w=100,h=200]
  // parentId: pictIds[n] || null => 0
  // options: {
  //   style: { fill: 'rgb(0,0,255)', 'stroke-width': 1, stroke: 'rgb(0,0,0)' }
  //   attrs: { x: 0, y: 10, width: 100, height: 200 }
  makeRectElem: function( _rect, _parentId, _options ){
    var
    _this = this,
    _nodeId = _this._makePictElem( _parentId, 'rect' );
    _this.setAttrsOfPictElem(
      _nodeId,
      _this._attrParse(
        _options.attr, {
          x: _rect[0],
          y: _rect[1],
          width: _rect[2],
          height: _rect[3]
        },
        _options.style
      )
    );
    return _nodeId;
  },
  // circle: [50,60,100] => [centerX=50,centerY=60,radius=100]
  makeCircleElem: function( _circle, _parentId, _options ){
    var
    _this = this,
    _nodeId = _this._makePictElem( _parentId, 'circle' );
    _this.setAttrsOfPictElem(
      _nodeId,
      _this._attrParse(
        _options.attr, {
          cx: _circle[0],
          cy: _circle[1],
          r: _circle[2]
        },
        _options.style
      )
    );
    return _nodeId;
  },
  // _ellipse: [ 50, 60, 25, 40 ] => [centerX=50,centerY=60,radiusX=25,radiusY=40]
  makeEllipseElem: function( _ellipse, _parentId, _options ){
    var
    _this = this,
    _nodeId = _this._makePictElem( _parentId, 'ellipse' );
    _this.setAttrsOfPictElem(
      _nodeId,
      _this._attrParse(
        _options.attr, {
          cx: _ellipse[0],
          cy: _ellipse[1],
          rx: _ellipse[2],
          ry: _ellipse[3]
        },
        _options.style
      )
    );
    return _nodeId;
  },
  // _line: [ 50, 60, 25, 40 ] => [x1=50,y1=60,x2=25,y2=40]
  makeLineElem: function( _line, _parentId, _options ){
    var
    _this = this,
    _nodeId = _this._makePictElem( _parentId, 'line' );
    _this.setAttrsOfPictElem(
      _nodeId,
      _this._attrParse(
        _options.attr, {
          x1: _line[0],
          y1: _line[1],
          x2: _line[2],
          y2: _line[3]
        },
        _options.style
      )
    );
    return _nodeId;
  },
  // _points: [ [50, 60], [25, 40] ] => [point1=[x:50,y1:60],point2=[x:25,y:40]]
  makePolylineElem: function( _points, _parentId, _options ){
    var
    _this = this,
    _nodeId = _this._makePictElem( _parentId, 'polyline' ),
    _pointsArr = [],
    i = 0;
    for(;i<_points.length;i++){
      _pointsArr.push( _points[i].join(',') );
    }
    _this.setAttrsOfPictElem(
      _nodeId,
      _this._attrParse(
        _options.attr, {
          points: _pointsArr.join(' ')
        },
        _options.style
      )
    );
    return _nodeId;
  },
  makePolyLineElem: function( _points, _parentId, _options ){
    return this.makePolylineElem( _points, _parentId, _options );
  },
  // _points: [ [50, 60], [25, 40] ] => [point1=[x:50,y1:60],point2=[x:25,y:40]]
  makePolygonElem: function( _points, _parentId, _options ){
    var
    _this = this,
    _nodeId = _this._makePictElem( _parentId, 'polygon' ),
    _pointsArr = [],
    i = 0;
    for(;i<_points.length;i++){
      _pointsArr.push( _points[i].join(',') );
    }
    _this.setAttrsOfPictElem(
      _nodeId,
      _this._attrParse(
        _options.attr, {
          points: _pointsArr.join(' ')
        },
        _options.style
      )
    );
    return _nodeId;
  },
  // _path: "M0.208,16.918c0,0,126.866-58.208,126.866,132.836"
  makePathElem: function( _path, _parentId, _options ){
    var
    _this = this,
    _nodeId = _this._makePictElem( _parentId, 'path' );
    
    _this.setAttrsOfPictElem(
      _nodeId,
      _this._attrParse(
        _options.attr, {
          d: _path
        },
        _options.style
      )
    );
    return _nodeId;
  },
  _styleAttrParse: function( _style, _optStyle ) {
    if ( !_style ) {
      _style = {};
    }
    if ( !_optStyle ) {
      _optStyle = {};
    }
    var _styleList = [],
        i;
    for( i in _optStyle ) {
      if( _optStyle[i] !== null && _optStyle[i] !== undefined ){
        _style[i] = _optStyle[i];
      }
    }
    for( i in _style ) {
      if( _style[i] !== null && _style[i] !== undefined ){
        _styleList.push( [ i, _style[i] ].join(':') );
      }
    }
    return _styleList.join(';');
  },
  _attrParse: function( _attrs, _defaultAttrs, _styleAttrs ) {
    if ( !_attrs ) {
      _attrs = {};
    }
    for( var i in _defaultAttrs ){
      if( _attrs[i] === null ||
          _attrs[i] === undefined ) {
        _attrs[i] = _defaultAttrs[i];
      }
    }
    _attrs.style = this._styleAttrParse( _attrs.style, _styleAttrs );
    return _attrs;
  },
  setAttrsOfPictElem: function( _pictElemId, _attrs ) {
    for ( i in _attrs ) {
      if( _attrs[i] !== null && _attrs[i] !== undefined ){
        this.setAttrOfPictElem( _pictElemId, i, _attrs[i] );
      }
    }
  },
  setAttrOfPictElem: function( _pictElemId, _pictAttrName, _pictAttrValue ) {
    this._pictElemIds[_pictElemId].setAttributeNS( null, _pictAttrName, _pictAttrValue );
  },
  drawRect: function(){
    if(!this.drawn){
      this.makeSvgElem();
    }
    this.base();
    // this.setViewBox( 0, 0, this.rect.width, this.rect.height );
  },
  // setViewBox: function( left, top, right, bottom ){
  //   ELEM.get(this.pictId).setAttribute( 'viewBox', '0 0 '+this.rect.width+' '+this.rect.height );
  // },
  makeSvgElem: function(){
    var _this = this,
        _pict = document.createElementNS( _this._svgNS, 'svg' ),
        _pictElemId = ELEM._add( _pict );
    _this._pictElemIds = [];
    _this._freePictElemIds = [];
    
    // parentId not used as elemId elsewhere
    _this.pictId = _pictElemId;
    
    _this._pictElemIds[0] = _pict;
    ELEM.append( _pictElemId, _this.elemId );
    _pict.setAttribute( 'xmlns', _this._svgNS );
    // console.log('options:',this.options);
    if(this.options['viewBox'] !== undefined){
      this.viewBox = this.options.viewBox.join(' ');
    }
    else {
      this.viewBox = '0 0 '+this.rect.width+' '+this.rect.height;
    }
    if(this.options['preserveAspectRatio'] !== undefined){
      this.preserveAspectRatio = this.options.preserveAspectRatio;
    }
    else {
      this.preserveAspectRatio = 'xMidYMid slice';
    }
    _pict.setAttribute( 'viewBox', this.viewBox );
    _pict.setAttribute( 'preserveAspectRatio', this.preserveAspectRatio );
    _pict.setAttribute( 'version', '1.1' );
    _pict.style.cssText = _this._pictElemStyle;
    _this.setAttrsOfPictElem(
      0, {
        // viewBox: '0 0 320 240',
        // width: '100%',
        // height: '100%'
      }
    );
  }
}),
HPict = SVGControl; // Compatibility for legacy code.

var//RSence.Graphics
SVGItemBase = HClass.extend({
  constructor: function( _shape, _parent, _options ){
    this.shape = _shape;
    this.parent = _parent;
    this.options = _options;
    this.parents = [];
    var i = 0;
    for( ; i < this.parent.parents.length; i++ ){
      this.parents.push( this.parent.parents[i] );
    }
    this.parents.push( this.parent );
    for( i = this.parents.length-1; i > -1; i-- ){
      if( this.parents[i].isSVGContainer ){
        this.pict = this.parents[i];
        break;
      }
    }
    
    // parentId not used as elemId elsewhere
    this.pictId = this.makeItem( _shape, _parent.pictId, _options );
    
    //console.log(_parent.pictId);
    this.extAction();
  },
  pictItemType: '',
  makeItem: function( _shape, _parentId, _options ){
    return this.pict['make'+this.pictItemType+'Elem']( _shape, _parentId, _options );
  },
  extAction: function(){}
}, {
  factory: function(_pictItemType){
    var _ext = {};
    _ext['pictItemType'] = _pictItemType;
    return SVGItemBase.extend(_ext);
  }
}),
HPictItem = SVGItemBase; // Compatibility for legacy code.

var//RSence.Graphics
SVGRect = SVGItemBase.factory('Rect'),
HPictRect = SVGRect; // Compatibility for legacy code.

var//RSence.Graphics
SVGCircle = SVGItemBase.factory('Circle'),
HPictCircle = SVGCircle; // Compatibility for legacy code.

var//RSence.Graphics
SVGEllipse = SVGItemBase.factory('Ellipse'),
HPictEllipse = SVGEllipse; // Compatibility for legacy code.

var//RSence.Graphics
SVGOval = HPictEllipse,
HPictOval = SVGOval; // Compatibility for legacy code.

var//RSence.Graphics
SVGLine = SVGItemBase.factory('Line'),
HPictLine = SVGLine; // Compatibility for legacy code.

var//RSence.Graphics
SVGPolyLine = SVGItemBase.factory('Polyline'),
HPictPolyLine = SVGPolyLine, // Compatibility for legacy code.
SVGPolyline = SVGPolyLine,   // Aliases
HPictPolyline = SVGPolyLine; // Aliases

var//RSence.Graphics
SVGPolygon = SVGItemBase.factory('Polygon'),
HPictPolygon = SVGPolygon; // Compatibility for legacy code.

var//RSence.Graphics
SVGGroup = SVGItemBase.factory('Group'),
HPictGroup = SVGGroup; // Compatibility for legacy code.

var//RSence.Graphics
SVGPath = SVGItemBase.factory('Path'),
HPictPath = SVGPath; // Compatibility for legacy code.

