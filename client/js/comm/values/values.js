
/*** = Description
  ** Manages data value synchronization.
  **
  ** Keeps track of all +HValue+ instances present.
***/
//var//RSence.COMM
COMM.Values = UtilMethods.extend({
  
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
    return this.typeChr( _obj );
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
    return _this.encode(_response);
  },

  encode: function(_obj){
    return this.encodeObject(_obj);
  },

  decode: function(_obj){
    return this.decodeObject(_obj);
  },

  clone: function(_obj){
    return this.cloneObject(_obj);
  }
  
});

// Backwards compatibility assignment for code that still
// uses HVM as a reference of the Value Manager:
HVM = COMM.Values;
