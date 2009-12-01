/*   Riassence Framework
 *   Copyright 2009 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */


/*** = Description
  ** Low-level XMLHttpRequest abstractor.
***/
COMM = {
  
/** Displays an error alert, if the browser doesn't support XMLHttpRequests
  **/
  _FakeHttpRequest: function(){
    alert("'ERROR: This web browser doesn't support XMLHttpRequest. Please upgrade; unable to continue.");
  }
};

/** = Description
  * Creates a new instance of the XMLHttpRequest
  * object supported by the browser. Evaluated only once,
  * after that does its things without any extra statements
  *
  **/
if(window['XMLHttpRequest']!==undefined){
  COMM._XMLHttpRequest = function(){
    return new XMLHttpRequest();
  };
}
else if(BROWSER_TYPE.ie){
  COMM._XMLHttpRequest = function(){
    return new ActiveXObject("Msxml2.XMLHTTP");
  };
}
else {
  COMM._XMLHttpRequest = function(){
    console.log("No XMLHttpRequest object types known. Can't Communicate.");
    return new COMM._FakeHttpRequst();
  };
}

/** = Description
  * Converts arrays to valid query strings.
  *
  * = Usage
  * Returns 'productId=100&customerName=J-J%20Heinonen'
  *   COMM._arrayToQueryString(['productId',100,'customerName','J-J Heinonen'])
  *
  **/
COMM._arrayToQueryString = function(_params){
  var i = 0,
      _length = _params.length,
      _queryString = '';
  for(;i<_length;i++){
    _queryString += encodeURIComponent(_params[i]);
    _queryString += (i===_length-1)?'':(i%2===0)?'=':'&';
  }
  return _queryString;
};

/** = Description
  * Finds and calls the state responder method upon a readyState change to 4.
  * - On readyStates other than 4 does nothing.
  * - The default responder for a successful response code (between 200 to 299) is onSuccess.
  * - The default responder for unsuccessful response codes is onFailure.
  * - The responders are called with the request object as the parameter.
  * - Custom response code handling is implemented as 'on' + status code,
  *   eg. 'on404' for a 404 not found error.
  **/
COMM._stateChange = function(_this){
  if(_this.X.readyState === 4){
    var _status = _this.X.status,
        _responderName = 'on'+_status,
        _success = ((_status >= 200 && _status < 300) || (_status === 0));
    _this[_responderName]?_this[_responderName](_this):_success?_this.onSuccess(_this):_this.onFailure(_this);
  }
};

/** = Description
  * The main Request-handling object.
  *
  * = Parameters
  *
  * +_url+::        Full or relative url of the response handler
  *
  * +_options+::    An +Object+, see below for content:
  *
  *
  * == Required properties for +_options+:
  *
  * +onSuccess+::   A function that is called on a successful response.
  *                 Must accept one parameter: the request object.
  *
  * +onFailure+::   A function that is called on an unsuccessful response.
  *                 Must accept one parameter: the request object.
  *
  *
  * == Optional properties for +_options+:
  *
  * +method+::      The HTTP Request Method, usually 'POST' or 'GET', but will handle
  *                 DAV and other extensions if the server supports them.
  *                 Defaults to 'POST'.
  *
  * +async+::       Boolean; Uses asyncronous requests when true.
  *                 Defaults to true.
  *
  * +params+::      Extra parameters to send, format: Array, see COMM._arrayToQueryString()
  *
  * +headers+::     Extra HTTP headers to send for POST requests, format: Hash.
  *
  * +body+::        The HTTP POST Body
  *
  * +username+::    Username for basic authentication
  *
  * +password+::    Password for basic authentication
  *
  * +contentType+:: The 'content-type' -header to send.
  *                 Defaults to 'application/x-www-form-urlencoded'.
  *
  * +charset+::     The charset type to use. Defaults to 'UTF-8'.
  *
  * = Returns
  *  An +Object+ extended from the +_options+ given in the input.
  *
  **/
COMM.request = function(_url,_options){
  var _comm = COMM,
      
      _this = _options?_options:{},
      
      _method = _options.method?_options.method.toUpperCase():'GET',
      _async = (_options.async===undefined)?true:_options.async,
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
  _this.options = _options;
  _this.X   = _comm._XMLHttpRequest();
  if(_method === 'GET' && _params.length !== 0){
    _url += ((_url.indexOf('?')!==-1)?'&':'?')+_comm._arrayToQueryString(_params);
  }
  if(!_async){
    console.log("WARNING: Synchronous "+_method+" request to "+_url+", these will fail on the Symbian web browser.");
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
  if(_method === 'POST'){
    _headers['Content-Type'] = _contentType + '; charset=' + _charset;
    var _body = _options.body?_options.body:'';
    for(var _header in _headers){
      _this.X.setRequestHeader(_header,_headers[_header]);
    }
    _this.X.send(_body);
  }
  else if(_method === 'GET'){
    _this.X.send(null);
  }
  if(!_async){
    _comm._stateChange(_this);
  }
  return _this;
};









