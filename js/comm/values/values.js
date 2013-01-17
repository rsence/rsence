
/*** = Description
  ** Manages data value synchronization.
  **
  ** Keeps track of all +HValue+ instances present.
***/
//var//RSence.COMM
COMM.Values = HClass.extend({
  
/** No constructor, singleton class.
  **/
  constructor: null,
  
/** An +Object+ containing all values by key.
  **/
  values: {},
  
/** A list of value keys whose value has changed. To be synchronized asap.
  **/
  tosync: [],
  
/** = Description
  * Creates a new +HValue+ instance. Its main purpose is to act as the main
  * client-side value creation interface for the server representation of
  * +HValue+.
  *
  * = Parameters
  * +_id+::     The unique id of the +HValue+ instance (set by the server)
  * +_data::    The initial data of the +HValue+ instance (set by the server)
  *
  **/
  create: function(_id,_data){
    HValue.nu(_id,_data);
  },
  
/** = Description
  * Binds a +HValue+ instance created externally to +self.values+.
  * Called from +HValue+ upon construction.
  *
  * = Parameters
  * +_id+::     The unique id of the +HValue+ instance (set by the server)
  * +_value+::  The +HValue+ instance itself.
  *
  **/
  add: function(_id,_value){
    this.values[_id] = _value;
  },
  
/** = Description
  * Sets the data of the +HValue+ instance by +_Id+.
  *
  * = Parameters
  * +_id+::     The unique id of the +HValue+ instance (set by the server)
  * +_data+::   The new data, any Object type supported by JSON.
  *
  **/
  set: function(_id,_data){
    this.values[_id].set(_data);
  },
  
/** = Description
  * Sets and decodes the +_data+. Main value setter interface
  * for the server representation of +HValue+.
  *
  * = Parameters
  * +_id+::     The unique id of the +HValue+ instance (set by the server)
  * +_data+::   The new data from the server, to be decoded.
  *
  **/
  s: function(_id,_data){
    var _this = this;
    _data = _this.decode(_data);
    _this.values[_id].s(_data);
  },
  
/** = Description
  * Deletes a +HValue+ instance by +_id+.
  *
  * = Parameters
  * +_id+::     The unique id of the +HValue+ instance (set by the server)
  *
  **/
  del: function(_id){
    var _this = this,
        _values = _this.values,
        _value = _values[_id],
        _views = _value.views,
        _viewsLen = _views.lengt,
        i = 0,
        _view;
    for(;i<_viewsLen;i++){
      _view = _views[i];
      _view.valueObj = HDummyValue.nu(0,_value.value);
    }
    _value.views = [];
    delete _values[_id];
  },
  
/** = Description
  * Marks the +HValue+ instance as changed and tries to send it
  * immediately, unless COMM.Transporter has an ongoing transfer.
  * Usually called by the +HValue+ instance internally.
  *
  * = Parameters
  * +_value+::     The +HValue+ instanche that changed.
  *
  **/
  changed: function(_value){
    var _this = this;
    if(!~_this.tosync.indexOf(_value.id)){
      _this.tosync.push(_value.id);
      var _transporter = COMM.Transporter;
      if(!_transporter.busy){
        _transporter.sync();
      }
    }
  },
  
  // List of primitive object types.
  _builtins: [
    'b', // boolean
    'n', // number
    's'  // string
  ],
  
/** = Description
  * Use this method to detect the type of the object given.
  *
  * Returns the type of the object given as a character code. Returns false,
  * if unknown or unsupported objcet type.
  *
  * = Returns
  * _One of the following:_
  * - 'a': Array
  * - 'h': Hash (Generic Object)
  * - 'd': Date
  * - 'b': Boolean (true/false)
  * - 'n': Number (integers and floats)
  * - 's': String
  * - '~': Null
  * - '-': Undefined
  *
  **/
  type: function(_obj){
    if(_obj === null){
      return '~';
    }
    else if (_obj === undefined){
      return '-';
    }
    var _type = (typeof _obj).slice(0,1);
    if(~this._builtins.indexOf(_type)){
      return _type;
    }
    else if(_type==='o'){
      if(_obj.constructor === Array){
        return 'a'; // array
      }
      else if(_obj.constructor === Object){
        return 'h'; // hash
      }
      else if(_obj.constructor === Date){
        return 'd'; // date
      }
      return false;
    }
    return false;
  },
  
  // Returns an encoded version of the array _arr as a string
  _encodeArr: function(_arr){
    var _str = '[',
        _output = [],
        _len = _arr.length,
        _this = this,
        _item,
        i = 0;
    for(;i<_len;i++){
      _item = _this.encode(_arr[i]);
      _output.push( _item );
    }
    _str += _output.join(',')+']';
    return _str;
  },
  
  // Returns a decoded array with decoded content of array _arr
  _decodeArr: function(_arr){
    var _output = [],
        _len = _arr.length,
        _this = this,
        _item,
        i = 0;
    for(;i<_len;i++){
      _item = _this.decode(_arr[i]);
      _output.push( _item );
    }
    return _output;
  },
  
  // Returns an encoded version of the Hash (Object) _hash as a string
  _encodeHash: function(_hash){
    var _str = '{',
        _output = [],
        _this = this,
        _key,
        _value;
    for(_key in _hash){
      _value = _hash[_key];
      _output.push( _this.encode( _key ) + ':' + _this.encode( _value ) );
    }
    _str += _output.join(',')+'}';
    return _str;
  },
  
  // Returns a decoded version of the Hash (Object) _hash
  _decodeHash: function(_hash){
    var _output = {},
        _this = this,
        _key,
        _value;
    for(_key in _hash){
      _value = _hash[_key];
      _output[_this.decode(_key)] = _this.decode(_value);
    }
    return _output;
  },
  
  // Regular expression match/replace pairs for string escaping.
  _stringSubstitutions: [
    [(/\\/g), '\\\\'],
    //[(/\b/g), '\\b'],
    [(/\t/g), '\\t'],
    [(/\n/g), '\\n'],
    [(/\f/g), '\\f'],
    [(/\r/g), '\\r'],
    [(/"/g),  '\\"']
  ],
  
  // Quotes a string (escapes quotation marks and places quotes around)
  _quoteString: function(_str){
    var _this = this,
        _substitutions = _this._stringSubstitutions,
        i = 0, _len = _substitutions.length,
        _line, _from, _to, _output = '';
    for(;i<_len;i++){
      _line = _substitutions[i];
      _from = _line[0];
      _to = _line[1];
      _str = _str.replace( _from, _to );
    }
    return '"' + _str + '"';
  },
  
  // Encodes the native character set to url-encoded unicode.
  // Likely causes issues with non-ascii strings, shouldn't be called (for now).
  _encodeString: function(_str){
    console.log( 'WARNING: encodeString called with string: ',_str );
    var _outStr;
    try {
      _outStr = unescape( encodeURIComponent( _str ) );
    }
    catch(e) {
      _outStr = _str;
    }
    return _outStr;
  },
  
  // Decodes the url-encoded unicode to the native character set
  _decodeString: function(_str){
    var _outStr;
    try {
      _outStr = decodeURIComponent( escape( _str ) );
    }
    catch(e) {
      _outStr = _str;
    }
    return _outStr;
  },
  
/** = Description
  * Encodes an object to a ascii string (special characters url-encoded).
  *
  * = Parameters
  * +_obj+::  Any object
  *
  * = Returns
  * A +String+ representation of the +_obj+
  *
  **/
  encode: function(_obj){
    var _str, _type, _this = this;
    if(_obj === null){
      return 'null';
    }
    else if(_obj !== undefined){
      _type = _this.type(_obj);
      if(!_type){
        return 'null';
      }
      switch(_type){
        case 'b': _str = String(_obj); break;
        case 'n': _str = String(_obj); break;
        case 's': _str = _this._quoteString(_obj); break;
        // Might need further investigation, but _encodeString is disabled for now:
        // case 's': _str = _this._quoteString(_this._encodeString(_obj)); break;
        case 'd': _str = '"@'+String(_obj.getTime()/1000)+'"'; break;
        case 'a': _str = _this._encodeArr(_obj); break;
        case 'h': _str = _this._encodeHash(_obj); break;
        default:  _str = 'null'; break;
      }
    }
    else {
      return 'null';
    }
    return _str;
  },
  
  _nativeEncode: function(_obj){
    try{
      return JSON.stringify( _obj );
    }
    catch(e){
      console.log('invalid json:',_obj);
      return "{}";
    }
  },
  
  
/** = Description
  * Decodes a JSON object. Decodes url-encoded strings contained.
  *
  * = Parameters
  * +_ibj+::  A raw object with special characters url-encoded.
  *
  * = Returns
  * An version of the object with the contained strings decoded to unicode.
  *
  **/
  decode: function(_ibj){
    var _obj, _type, _this = this;
    if(_ibj !== null && _ibj !== undefined){
      _type = _this.type(_ibj);
      if(!_type){
        return null;
      }
      switch(_type){
        case 'b': _obj = _ibj; break;
        case 'n': _obj = _ibj; break;
        case 's': _obj = _this._decodeString(_ibj); break;
        case 'd': _obj = _ibj; break;
        case 'a': _obj = _this._decodeArr(_ibj); break;
        case 'h': _obj = _this._decodeHash(_ibj); break;
        default: _obj = null; break;
      }
    }
    else {
      return null;
    }
    return _obj;
  },
  
  _nativeDecode: function(_ibj){
    var _obj, _type, _this = this;
    if(_ibj !== null && _ibj !== undefined){
      _type = _this.type(_ibj);
      if(!_type){
        return null;
      }
      switch(_type){
        case 'b': _obj = _ibj; break;
        case 'n': _obj = _ibj; break;
        case 's': _obj = _this._decodeString(_ibj); break;
        case 'd': _obj = _ibj; break;
        case 'a': _obj = JSON.parse(_ibj); break;
        case 'h': _obj = JSON.parse(_ibj); break;
        default: _obj = null; break;
      }
    }
    else {
      return null;
    }
    return _obj;
  },
  
/** = Description
  * Makes a deep copy of the object.
  *
  * When you use assignment of a js object, only primitive object types
  * (strings, numbers and booleans) are copied. This method makes a deep
  * (nested) clone of the input object.
  *
  * = Parameters
  * +_obj+:: Any object.
  *
  * = Returns
  * A copy of the object.
  *
  **/
  clone: function( _obj, _shallow ){
    if(_obj === null){
      return null;
    }
    else if (_obj === undefined){
      console.log('Undefined object, supplementing with null.');
      return null;
    }
    var _item,
        _cloned;
    if( _obj instanceof Array ){
      _cloned = [];
      for( _item = 0; _item < _obj.length; _item ++ ){
        if(_shallow){
          _cloned[ _item ] = _obj[ _item ];
        }
        else {
          _cloned[ _item ] = this.clone( _obj[ _item ] );
        }
      }
      return _cloned;
    }
    else if( _obj instanceof Object ){
      _cloned = {};
      for( _item in _obj ){
        if(_shallow){
          _cloned[ _item ] = _obj[ _item ];
        }
        else {
          _cloned[ _item ] = this.clone( _obj[ _item ] );
        }
      }
      return _cloned;
    }
    else {
      return _obj;
    }
  },
  
  _nativeClone: function( _obj ){
    if(_obj === null){
      return null;
    }
    else if (_obj === undefined){
      console.log('Undefined object, supplementing with null.');
      return null;
    }
    if( (_obj instanceof Array) || (_obj instanceof Object) ){
      // conversion via encoding/decoding via JSON string.
      return JSON.parse( JSON.stringify( _obj ) );
    }
    else {
      // no conversion needed (numbers, strings, booleans etc..)
      return _obj;
    }
  },
  
/** = Description
  * Returns an URI-encoded string representation of all the changed values to
  * synchronize to the server.
  *
  * = Returns
  * An encoded string representation of values to synchronize.
  **/
  sync: function(){
    var
    _this = this,
    _response = [ COMM.Session.ses_key,{},[] ],
    _error = COMM.Transporter._clientEvalError;

    if( _error ){
      _response[2].push({'err_msg':_error});
    }

    // new implementation, symmetric with the server response format
    if( this.tosync.length > 0 ){
      _response[1].set=[];
      var
      _syncValues = _response[1].set,
      _values = _this.values,
      _tosync = _this.tosync,
      i = _tosync.length,
      _id, _value;
      while(i--){
        _id = _tosync.shift();
        _value = _values[_id].value;
        _syncValues.push( [ _id, _value ] );
      }
    }
    // console.log('response:',_response);
    // console.log('encoded:',_this.encode(_response));
    return _this.encode(_response);
  },

  // Old sync implementation:
  // sync: function(){
  //   if(this.tosync.length===0){
  //     return false;
  //   }
  //   var
  //   _syncValues = {},
  //   _this = this,
  //   _values = _this.values,
  //   _tosync = _this.tosync,
  //   _len = _tosync.length,
  //   i = 0, _id, _value;
  //   for(;i<_len;i++){
  //     _id = _tosync.shift();
  //     _value = _values[_id].value;
  //     _syncValues[_id] = _value;
  //   }
  //   return encodeURIComponent(_this.encode(_syncValues));
  // },
  
  _detectNativeJSONSupport: function(){
    if(window['JSON']){
      var
      _JSON = window.JSON,
      _fun = 'function';
      if((typeof _JSON['parse'] === _fun) && (typeof _JSON['stringify'] === _fun)){
        // console.log('Has native JSON support. Re-routing encode, decode and clone methods of COMM.Values...');
        this.clone = this._nativeClone;
        this.encode = this._nativeEncode;
        // this.decode = this._nativeDecode;
      }
    }
  }
});

COMM.Values._detectNativeJSONSupport();

// Backwards compatibility assignment for code that still
// uses HVM as a reference of the Value Manager:
HVM = COMM.Values;
