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


/***
 *** Riassence Core Communications Collection
 ***/
COMM = {
  // this does nothing yet, but will be extended to
  // handle cases where no XMLHttpRequest is available
  _FakeHttpRequest: function(){}
};

// Returns a new instance of the XMLHttpRequest
// object supported by the browser. eval:ed only once,
// after that does its things without any extra statements
eval(
  'COMM._XMLHttpRequest = function(){return new '+(
  (window['XMLHttpRequest']!==undefined)?
    'XMLHttpRequest()':(
    BROWSER_TYPE.ie?
      'ActiveXObject("Msxml2.XMLHTTP")':
      'COMM._FakeHttpRequst()'
    )
  )+';}'
);

// converts arrays to valid query strings.
// example:
//    ['productId',100,'customerName','J-J Heinonen']
// -> 'productId=100&customerName=J-J%20Heinonen'
COMM._arrayToQueryString = function(_params){
  var i = 0,
      _length = _params.length,
      _queryString = '';
  for(;i<_length;i++){
    _queryString += encodeURIComponent(_params[i]);
    _queryString += (i===_length-1)?'':(i%2==0)?'=':'&';
  }
  return _queryString;
};

COMM._stateChange = function(_this){
  if(_this.X.readyState == 4){
    var _status = _this.X.status,
        _responderName = 'on'+_status,
        _success = (_status >= 200 && _status < 300);
    _this[_responderName]?_this[_responderName](_this):_success?_this.onSuccess(_this):_this.onFailure(_this);
  }
};

/**
  * The main Request-handling object.
  * Optimized for speed and small size, not readability :)
  *
  * Constructor parameters:
  *  - url: Full or relative url of the response handler
  *  - options:
  *    - onSuccess: function callback for successful response (takes one param: the request object)
  *    - onFailure: function callback for unsuccessful response (takes one param: the request object)
  *    - method(*: The HTTP Request Method, usually 'POST' 
  *                or 'GET' but will handle DAV and other extensions.
  *                Defaults to 'POST'.
  *    - async(*: Boolean; Uses asyncronous requests when true.
  *               Defaults to true.
  *    - params(*: Extra parameters to send, format: Array, see COMM._arrayToQueryString()
  *    - headers(*: Extra HTTP headers to send for POST requests, format: Hash.
  *    - body(*: The HTTP POST Body
  *    - username(*: Username for basic authentication
  *    - password(*: Password for basic authentication
  *    - contentType(*: The 'content-type' -header to send.
  *                     Defaults to 'application/x-www-form-urlencoded'.
  *    - charset(*: The charset type to use. Defaults to 'UTF-8'.
  *
  *    *) denotes optional parameter
**/
COMM.request = function(_url,_options){
  //_success,_failure,_method,_async,_params,_headers,_body,_username,_password,_contentType,_charset){
  var _comm = COMM,
      
      _url = _url,
      
      _this = _options?_options:{},
      
      _method = _options.method?_options.method.toUpperCase():'GET',
      _async = _options.async?true:false,
      _params = _options.params?_options.params:[],
      _headers = _options.headers?_options.headers:{},
      _contentType = _options.contentType?_options.contentType:'application/x-www-form-urlencoded',
      _charset = _options.charset?_options.charset:'UTF-8',
      _username = _options.username?_options.username:null,
      _password = _options.username?_options.password:null;
  if(!_options.onFailure){
    _this.onFailure = function(resp){console.log('No failure handler specified, response: ',resp);};
  }
  if(!_options.onSuccess){
    _this.onSuccess = function(resp){console.log('No success handler specified, response: ',resp);};
  }
  _this.url = _url;
  _this.X   = _comm._XMLHttpRequest();
  if(_method == 'GET' && _params.length !== 0){
    _url += ((_url.indexOf('?')!==-1)?'&':'?')+_comm._arrayToQueryString(_params);
  }
  _this.X.open(
    _method,
    _url,
    _async,
    _username,
    _password
  );
  _this.X.onreadystatechange = function(){
    _comm._stateChange(_this);
  };
  if(_method == 'POST'){
    _headers['Content-Type'] = _contentType + '; charset=' + _charset;
    var _body = _options.body?_options.body:'';
    _headers['Content-Length'] = _body.length.toString();
    for(var _header in _headers){
      _this.X.setRequestHeader(_header,_headers[_header]);
    }
    _this.X.send(_body);
  }
  else if(_method == 'GET'){
    _this.X.send(null);
  }
  if(!_async){
    _comm._stateChange(_this);
  }
  return _this;
};









