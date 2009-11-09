/*   Riassence Framework
 *   Copyright 2009 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */


/**
  *  The current purpose of JSONRenderer is to render JSON hashes to GUI views.
  *
  *  It's currently considered being as pre-alpha quality and will later
  *  greatly expand to cover most situations.
  *
  **/

JSONRenderer = HClass.extend({

/** consturctor parameters:
  *  - _data:   The data structure used for building.
  *  - _parent: The parent view (or app)
  **/
  version: 0.4,
  constructor: function(_data, _parent){
    if((_data['type'] === 'GUITree') && (this.version >= _data['version'])){
      this.data   = _data;
      this.parent = _parent;
      this.render();
    }
    else{
      throw("JSONRenderer: Only GUITree version "+this.version+" or older data can be handled.");
    }
  },
  render: function(){
    this.scopes = [window];
    this.scopeDepth = 0;
    this.view = this.renderNode( this.data, this.parent );
  },
  defineInScope: function( _definition ){
    var _isArr = (_definition instanceof Array),
        _isObj = (_definition instanceof Object);
    if( _isArr || !_isObj ){
      console.log("JSONRenderer; definition must be an Object, got: '"+(typeof _definition)+"'. Definition: ",_definition);
      return;
    }
    var _extension = {},
        _reserved = ['class','extend','implement'],
        _className = _definition[_reserved[0]],
        _extendName = _definition[_reserved[1]],
        _implementName = _definition[_reserved[2]],
        _extend = _extendName?this.findInScope(_extendName):false,
        _implement = _implementName?this.findInScope(_implementName):false,
        _scope = this.scopes[ this.scopeDepth ],
        _key, _value;
    if( _className === undefined ) {
      console.log("JSONRenderer; class name missing in definition scope.");
      return;
    }
    if( !_extend ){
      _extend = HClass;
    }
    for( _key in _definition ){
      if( _reserved.indexOf( _key ) === -1 ){
        _value = _definition[_key];
        _extension[_key] = this.extEval( _value );
      }
    }
    _scope[ _className ] = _extend.extend( _extension );
    if( _implement ){
      _scope[ _className ].implement( _implement );
    }
  },
  undefineInScope: function( ){
    
  },
  findInScope: function( _className ){
    var _class = false,
        _scopes = this.scopes,
        i = _scopes.length-1,
        _scope;
    for( ; i > -1 ; i-- ){
      _scope = _scopes[i];
      if( _scope[ _className ] !== undefined ){
        return _scope[ _className ];
      }
    }
    return _class;
  },
  extEval: function(_block){
    if( _block.indexOf("function(") === 0 ){
      eval( '_block = '+_block );
    }
    return _block;
  },
  renderNode: function( _dataNode, _parent ){
    var // Currently only window-level classes are supported
        _className = _dataNode['class'],
        _class = this.findInScope( _className ),
        
        // Currently only HView -derived classes are supported, so 
        // the rect is mandatory.
        _rect = _dataNode['rect'],
        _hasRect = (_rect !== undefined) && (_rect instanceof Array),
        
        // Checks, if any sub-views are defined.
        _hasSubviews = _dataNode['subviews'] !== undefined,
        _subViews    = _hasSubviews?_dataNode['subviews']:null,
        
        // Checks, if any options are defined.
        _hasOptions  = _dataNode['options'] !== undefined,
        _options     = _hasOptions?_dataNode['options']:null,
        
        // JS Extension block
        _hasExtension = _dataNode['extend'] !== undefined,
        _extension    = _hasExtension?_dataNode['extend']:null,
        
        // JS Definition block
        _hasDefinition = _dataNode['define'] !== undefined,
        _definitions   = _hasDefinition?_dataNode['define']:null,
        
        // The HView-derived class instance, instance is by default the parent
        _instance = _parent,
        
        i,
        
        _subView;
    this.scopeDepth ++;
    this.scopes.push({});
    try{
      if(_hasDefinition){
        if(_definitions instanceof Array){
          for( i = 0; i < _definitions.length; i++ ){
            this.defineInScope( _definitions[i] );
          }
        }
        else {
          console.log('renderNode definitions not Array, definitions:',_definitions);
        }
      }
      if(_class){
        if(_hasExtension){
          var _extBlock = {},
              _name,
              _block;
          for(_name in _extension){
            _block = _extension[_name];
            if( typeof _block === 'string' ){
              try {
                _block = this.extEval( _block );
              }
              catch(e){
                console.log('renderNode ext eval error:',e,', name:',_name,', block:',_block);
              }
            }
            _extBlock[_name] = _block;
          }
          _class = _class.extend( _extBlock );
        }
        if(_hasOptions){
          if(_options['valueObjId'] !== undefined){
            var _valueObjId = _options['valueObjId'];
            _options['valueObj'] = COMM.Values.values[_options['valueObjId']];
          }
        }
        // For HApplication -derived classes
        if(!_hasRect && _hasOptions){
          _instance = _class.nu(_options);
        }
        // For HView and HControl -derived classes
        else if(_hasRect){
          _instance = _class.nu(_rect,_parent,_options);
        }
      }
      else if(!(!_class && _hasSubviews)) {
        console.log('renderNode warning; No such class: '+_className+', node: ',_dataNode);
      }
    }
    catch(e){
      console.log('renderNode error:',e,', rect:',_rect,', class:',_dataNode['class'],', options:', _options);
    }
    // Iterates recursively through all subviews, if specified.
    if(_hasSubviews){
      for( i = 0; i < _subViews.length; i++ ){
        _subView = this.renderNode( _subViews[i], _instance );
      }
    }
    
    this.scopes.pop();
    this.scopeDepth --;
    
    // Returns the main view (or subview when recursively called).
    return _instance;
  }
});

