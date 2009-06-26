/**
  * Riassence Core -- http://rsence.org/
  *
  * Copyright (C) 2009 Juha-Jarmo Heinonen <jjh@riassence.com>
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

COMM.Values = HClass.extend({
  constructor: function(){
    var _this = this;
    _this.values = {};
    _this.tosync = [];
  },
  create: function(_id,_data){
    HValue.nu(_id,_data);
  },
  add: function(_id,_value){
    this.values[_id] = _value;
  },
  set: function(_id,_data){
    this.values[_id].set(_data);
  },
  s: function(_id,_data){
    var _this = this;
    _data = _this.decode(_data);
    _this.values[_id].set(_data);
  },
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
  changed: function(_value){
    var _this = this;
    if(_this.tosync.indexOf(_value.id)===-1){
      _this.tosync.push(_value.id);
      var _transporter = COMM.Transporter;
      if(!_transporter.busy){
        _transporter.sync();
      }
    }
  },
  _builtins: [
    'b', // boolean
    'n', // number
    's'  // string
    /** invalid:
    'o'  // object
    'f'  // function
    'u'  // undefined
    **/
  ],
  type: function(_obj){
    var _type = (typeof _obj)[0];
    if(this._builtins.indexOf(_type)!==-1){
      return _type;
    }
    else if(_type==='o'){
      if(_obj.constructor == Array){
        return 'a'; // array
      }
      else if(_obj.constructor == Object){
        return 'h'; // hash
      }
      else if(_obj.constructor == Date){
        return 'd'; // date
      }
      return false;
    }
    return false;
  },
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
  _stringSubstitutions: [
    [(/\\/g), '\\\\'],
    //[(/\b/g), '\\b'],
    [(/\t/g), '\\t'],
    [(/\n/g), '\\n'],
    [(/\f/g), '\\f'],
    [(/\r/g), '\\r'],
    [(/"/g),  '\\"']
  ],
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
  _encodeString: function(_str){
    return unescape( encodeURIComponent( _str ) );
  },
  _decodeString: function(_str){
    return decodeURIComponent( escape( _str ) );
  },
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
        case 's': _str = _this._quoteString(_this._encodeString(_obj)); break;
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
  sync: function(){
    if(this.tosync.length===0){
      return false;
    }
    var _syncValues = {},
        _this = this,
        _values = _this.values,
        _tosync = _this.tosync,
        _len = _tosync.length,
        i = 0, _id, _value;
    for(;i<_len;i++){
      _id = _tosync.shift();
      _value = _values[_id].value;
      _syncValues[_id] = _value;
    }
    return encodeURIComponent(_this.encode(_syncValues));
  }
}).nu();

HVM = COMM.Values;

