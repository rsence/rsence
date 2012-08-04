/*   RSence
 *   Copyright 2009 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */


/*** Constructs nodes from JSON structures as GUI
  ** tree structures. Lowers the learning curve of GUI
  ** development, because Javascript knowledge is not
  ** required to define user interfaces.
  ** The main purpose is to ease the development of
  ** user interfaces by defining them as data on the
  ** server, converting the data to JSON GUI trees and
  ** letting the client handle the rest. The end result
  ** is the same as defining the structures in
  ** JavaScript code.
  **
  ** This class is still in development, so expect more
  ** features and documentation as it matures.
***/
//var//RSence.Foundation
COMM.JSONRenderer = HClass.extend({
  
  version: 1.0,

/** = Description
  * Renders JSON structured data, see some of the demos for usage examples.
  *
  * = Parameters:
  * +_data+:   The data structure used for building.
  * +_parent+: The parent view (or app) (Optional)
  **/
  constructor: function(_data, _parent){
    if((_data['type'] === 'GUITree') && (this.version >= _data['version'])){
      this.data   = _data;
      this.parent = _parent;
      this.byId = {};
      this.byName = {};
      this.render();
      var _rndr = this;
      if( this.view.hasAncestor( HApplication ) ){
        this.view.getViewById = function(_id){ return _rndr.getViewById(_id); };
        this.view.getViewsByName = function(_id){ return _rndr.getViewsByName(_id); };
      }
      else if ( this.view.hasAncestor( HView ) ){
        this.view.app.getViewById = function(_id){ return _rndr.getViewById(_id); };
        this.view.app.getViewsByName = function(_id){ return _rndr.getViewsByName(_id); };
      }
    }
    else{
      throw("JSONRenderer: Only GUITree version "+this.version+" or older data can be handled.");
    }
  },
  getViewById: function(_id){
    if( this.byId[_id] !== undefined ){
      return this.byId[_id];
    }
    console.log('JSONRenderer; no such view Id: '+_id);
    return null;
  },
  addViewId: function(_id, _view){
    if( this.byId[_id] !== undefined ){
      console.log('JSONRenderer; already has id: '+_id+' (replacing)');
    }
    this.byId[_id] = _view;
  },
  getViewsByName: function(_name){
    if( this.byName[_id] !== undefined ){
      return this.byName[_name];
    }
    console.log('JSONRenderer; no views named: '+_name);
    return [];
  },
  addViewName: function(_name, _view){
    if( this.byName[_name] === undefined ){
      this.byName[_name] = [];
    }
    this.byName[_name].push(_view);
  },
  render: function(){
    this.scopes = [window];
    this.scopeDepth = 0;
    this.view = this.renderNode( this.data, this.parent );
  },
  die: function(){
    this.view.die();
  },
  defineInScope: function( _definition ){
    var
    _isArr = (_definition instanceof Array),
    _isObj = (_definition instanceof Object);
    if( _isArr || !_isObj ){
      console.log("JSONRenderer; definition must be an Object, got: '"+(typeof _definition)+"'. Definition: ",_definition);
      return;
    }
    var
    _extension = {},
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
      if( !~_reserved.indexOf( _key ) ){
        _value = _definition[_key];
        if( typeof _value === 'string' ){
          _value = this.extEval( _value );
        }
        _extension[_key] = _value;
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
    if(_className === undefined){
      return false;
    }
    if(~_className.indexOf('.')){
      var
      _splitClass = _className.split('.'),
      j = 1,
      _classPart = _splitClass[0],
      _classFull = this.findInScope( _classPart );
      if( !_classFull ){
        return false;
      }
      for( ; j < _splitClass.length ; j++ ){
        _classPart = _splitClass[j];
        _classFull = _classFull[ _classPart ];
        if( !_classFull ){
          return false;
        }
      }
      return _classFull;
    }
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
  initStraight: function( _class, _args ){
    if( _args instanceof Array ){
      return HClass.extend().nu.apply( _class, _args );
    }
    else {
      return (new _class(_args));
    }
  },
  _handleCall: function( _instance, _call ){
    if( _call instanceof Object ){
      var
      _methodName, _arguments;
      for( _methodName in _call ){
        // console.log('methodName:',_methodName);
        if( typeof _instance[_methodName] === 'function' ){
          // console.log('callArguments:',_call[_methodName]);
          try{
            _instance[_methodName].apply( _instance, _call[_methodName] );
          }
          catch(e){
            console.log('JSONRenderer handleCall error:',e.toString()+', method:',_instance[_methodName],', call args:', _call[_methodName],', e:',e);
          }
        }
        else {
          console.log('JSONRenderer handleCall error; undefined method: ',_methodName);
        }
      }
    }
    else {
      console.log('JSONRenderer handleCall error, unable to handle call format: ',_call);
    }
  },
  renderNode: function( _dataNode, _parent ){
    var
    _reserved = [ 'type', 'args', 'version', 'class', 'rect', 'bind', 'extend', 'options', 'subviews', 'define' ],
    _className, _class, _origNode, _straightParams = false, _rect, _hasRect, _hasSubviews, _subViews,
    _hasOptions, _options, _hasExtension, _extension, _hasBind, _bind,
    _hasName, _hasId,
    _isAppClass = false, _isViewClass = false,
    _autoOptionItems = [
      'label', 'style', 'visible', 'theme', 'html',
      'value', 'enabled', 'events', 'active', 'minValue', 'maxValue'
    ], _autoOptionItem, _hasCall, _call,
    _hasDefinition, _definition, _instance, i, _subView = null;

    // The name of the class:
    if( !_dataNode['class'] ){

      for( i in _dataNode ){
        if( !~_reserved.indexOf( i ) ){
          _className = i;
          _origNode = _dataNode;
          _dataNode = _dataNode[i];
          break;
        }
      }
      _straightParams = ( !(_dataNode instanceof Object) || (_dataNode instanceof Array) );
    }
    else {
      _className = _dataNode['class'];
    }

    _class = this.findInScope( _className );
    
    if (_class['hasAncestor'] !== undefined){
      _isAppClass = _class.hasAncestor( HApplication );
      _isViewClass = _class.hasAncestor( HView );
    }

    _hasId = ( _dataNode['id'] !== undefined ) && ( typeof _dataNode['id'] === 'string' );
    _hasName = ( _dataNode['name'] !== undefined ) && ( typeof _dataNode['name'] === 'string' );

    if( _straightParams ){
      _instance = this.initStraight( _class, _dataNode );
    }
    else if( _dataNode['args'] !== undefined ){
      _instance = this.initStraight( _class, _dataNode['args'] );
    }
    else if( _origNode && _origNode['args'] !== undefined ){
      _instance = this.initStraight( _class, _origNode['args'] );
    }
    if( _instance ){
      if( _hasId ){
        this.addViewId( _dataNode.id, _instance );
      }
      if( _hasName ){
        this.addViewName( _dataNode.id, _instance );
      }
      return _instance;
    }
    
    // Currently only HView -derived classes are supported, so
    // the rect is mandatory.
    _rect = _dataNode['rect'];
    _hasRect = (_rect !== undefined) && (_rect instanceof Array || typeof _rect === 'string');
    if( !_hasRect && _origNode){
      _hasRect = _origNode['rect'] !== undefined;
      _rect    = _hasRect?_origNode['rect']:null;
    }
    if( !_isViewClass ){
      if( _hasRect ){
        !this.isProduction && console.log( "renderNode warning; Supposedly rect-incompatible class supplied: "+_className );
      }
    }

    // Checks, if any sub-views are defined.
    _hasSubviews = _dataNode['subviews'] !== undefined;
    _subViews    = _hasSubviews?_dataNode['subviews']:null;
    if( !_hasSubviews && _origNode){
      _hasSubviews = _origNode['subviews'] !== undefined;
      _subViews    = _hasSubviews?_origNode['subviews']:null;
    }
    
    // Checks, if any options are defined.
    _hasOptions  = _dataNode['options'] !== undefined;
    _options     = _hasOptions?_dataNode['options']:null;
    if( !_hasOptions && _origNode){
      _hasOptions = _origNode['options'] !== undefined;
      _options    = _hasOptions?_origNode['options']:null;
    }
    for( i=0; i < _autoOptionItems.length; i++ ){
      _autoOptionItem = _autoOptionItems[i];
      if( _dataNode[ _autoOptionItem ] !== undefined ){
        if( !_hasOptions ){
          _hasOptions = true;
          _options = {};
        }
        _options[_autoOptionItem] = _dataNode[ _autoOptionItem ];
      }
    }
    
    // JS Extension block
    _hasExtension = _dataNode['extend'] !== undefined;
    _extension    = _hasExtension?_dataNode['extend']:null;
    if( !_hasExtension && _origNode){
      _hasExtension = _origNode['extend'] !== undefined;
      _extension    = _hasExtension?_origNode['extend']:null;
    }
    
    // JS Extension block
    _hasBind = _dataNode['bind'] !== undefined;
    _bind    = _hasBind?_dataNode['bind']:null;
    if( !_hasBind && _origNode){
      _hasBind = _origNode['bind'] !== undefined;
      _bind    = _hasBind?_origNode['bind']:null;
    }

    _hasCall = _dataNode['call'] !== undefined;
    if( _hasCall ){
      _call = _dataNode['call'];
    }
    
    // JS Definition block
    _hasDefinition = _dataNode['define'] !== undefined;
    _definitions   = _hasDefinition?_dataNode['define']:null;
    if( !_hasDefinition && _origNode){
      _hasDefinition  = _origNode['define'] !== undefined;
      _definitions    = _hasDefinition?_origNode['define']:null;
    }
    if( _rect === null && _class['hasAncestor'] && _class.hasAncestor( HView ) ) {
      console.log( 'Ancestors include HView, but no rect defined!' );
    }

    // The HView-derived class instance, instance is by default the parent
    _instance = _parent;
    
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
          if(_hasBind){
            if( _bind instanceof HValue ){
              _options.valueObj = _bind;
            }
            else if( COMM.Values.values[_bind] !== undefined ){
              _options.valueObj = COMM.Values.values[_bind];
            }
            else {
              console.log('renderNode warning; No such valueId:'+_bind);
            }
          }
          else{
            if(_options['valueObjId'] !== undefined){
              _options.valueObj = COMM.Values.values[_options['valueObjId']];
            }
          }
        }
        // For HApplication -derived classes
        if( _isAppClass ){
          if( _hasOptions ){
            _instance = _class.nu( _options );
          }
          else {
            _instance = _class.nu();
          }
        }
        else if ( _isViewClass ){
          _instance = _class.nu( _rect, _parent, _options );
        }
        else {
          if( _hasRect ){
            if( _hasOptions ){
              _instance = _class.nu(_rect,_parent,_options);
            }
            else {
              _instance = _class.nu(_rect,_parent);
            }
          }
          else if ( _hasOptions ){
            // console.log(_className,_parent,_options);
            _instance = _class.nu( _parent, _options );
          }
          else {
            // console.log('renderNode warning; unsure how to construct: '+_className+', rect:',_rect,', options:',_options);
            _instance = _class.nu( _parent );
          }
        }
        if(!_hasOptions){
          if(_hasBind){
            if( _bind instanceof HValue ){
              _bind.bind( _instance );
            }
            else if( COMM.Values.values[_bind] !== undefined ){
              COMM.Values.values[_bind].bind(_instance);
            }
            else {
              console.log('renderNode warning; No such valueId:'+_bind);
            }
          }
        }
      }
      else if(!(!_class && _hasSubviews)) {
        console.log('renderNode warning; No such class: '+_className+', node: ',_dataNode);
      }
      if( _hasId ){
        this.addViewId( _dataNode.id, _instance );
      }
      if( _hasName ){
        this.addViewName( _dataNode.id, _instance );
      }
      if(_hasCall){
        this._handleCall(_instance,_call);
      }
    }
    catch (e){
      var _optStr;
      console.log('err:',e);
      COMM.Queue.clientException(e,{name:'renderNode error',options:_options,className:_className,rect:_rect});
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

/** -- Global reference ++ **/
var//RSence.Foundation
JSONRenderer = COMM.JSONRenderer;


