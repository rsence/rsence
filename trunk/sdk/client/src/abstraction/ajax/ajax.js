/***  HIMLE RIA SYSTEM
  ** 
  **  Copyright (C) 2008 HIMLE GROUP http://himle.sorsacode.com/
  **  Copyright (C) 2006-2007 Helmi Technologies Inc.
  ** 
  **  This program is free software; you can redistribute it and/or modify it under the terms
  **  of the GNU General Public License as published by the Free Software Foundation;
  **  either version 2 of the License, or (at your option) any later version. 
  **  This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
  **  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
  **  See the GNU General Public License for more details. 
  **  You should have received a copy of the GNU General Public License along with this program;
  **  if not, write to the Free Software Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
  ***/

is_ie = !(navigator.userAgent.toLowerCase().indexOf("opera") > -1) && navigator.appName == "Microsoft Internet Explorer";


Array.prototype.toQueryString = function() {
  var i, l = this.length,
      _array = [];
  for (i = 0; i < l; i++) {
    _array.push( encodeURIComponent(this[i].key) + "=" +
      encodeURIComponent(this[i].value) );
  }
  return _array.join("&");
};








Ajax = HClass.extend({
  constructor: null,
  getTransport: function() {
    if (window.XMLHttpRequest) {
      return new XMLHttpRequest();
    } else if (is_ie) {
      // checks the Microsoft Internet Explorer script engine version
      if (ScriptEngineMajorVersion() >= 5) {
        return new ActiveXObject("Msxml2.XMLHTTP");
      } else {
        return new ActiveXObject("Microsoft.XMLHTTP");
      }
    } else {
      return false;
    }
  }
});

Ajax.Request = HClass.extend({
  constructor: function(_url, _options) {
    this.transport = Ajax.getTransport();
    if(!_options){
      _options = {};
    }
    var _defaults = HClass.extend({
      method: "post",
      asynchronous: true,
      contentType: "application/x-www-form-urlencoded",
      encoding: "UTF-8",
      parameters: ""
    });
    _defaults = _defaults.extend(_options);
    this.options = new _defaults();
    this.request(_url);
  },
  request: function(_url) {
    this.url = _url;
    if (this.options.method == "get" && this.options.parameters.length) {
      // if already has ? puts &
      this.url += (this.url.indexOf("?") >= 0 ? "&" : "?") + this.options.parameters.toQueryString();
    }
    try {
      this.transport.open(
        this.options.method.toUpperCase(),
        this.url,
        this.options.asynchronous,
        this.options.username,
        this.options.password
      );
      var _obj = this;
      this.transport.onreadystatechange = function(){
        _obj.onStateChange();
      };
      this.setRequestHeaders();
      var _body = this.options.method == "post" ?
        (this.options.postBody || this.options.parameters.toQueryString()) : null;
      this.transport.send(_body);
      if (!this.options.asynchronous && this.transport.overrideMimeType) {
        this.onStateChange();
      }
    } catch (e) {
      console.log('error:',e);
    }
  },
  setRequestHeaders: function() {
    var headers = {}, o;
    
    if (this.options.method == "post") {
      headers["Content-type"] = this.options.contentType +
        (this.options.encoding ? "; charset=" + this.options.encoding : "");
        
      if (this.transport.overrideMimeType &&
        (navigator.userAgent.match(/Gecko\/(\d{4})/) || [0,2005])[1] < 2005) {
        headers["Connection"] = "close";
      }
    }
    for (o in headers) {
      this.transport.setRequestHeader(o, headers[o]);
    }
  },
  /*
  Firefox
  0 UNINITIALIZED open() has not been called yet.
  1 LOADING send() has not been called yet.
  2 LOADED send() has been called, headers and status are available.
  3 INTERACTIVE Downloading, responseText holds the partial data.
  4 COMPLETED Finished with all operations.
  IE
  0 (Uninitialized) The object has been created, but not initialized (the open method has not been called).
  1 (Open) The object has been created, but the send method has not been called.
  2 (Sent) The send method has been called, but the status and headers are not yet available.
  3 (Receiving) Some data has been received. Calling the responseBody and responseText properties at this state to obtain partial results will return an error, because status and response headers are not fully available.
  4 (Loaded) All the data has been received, and the complete data is available.
  */
  onStateChange: function() {
    var _readyState = this.transport.readyState;
    if (_readyState > 1) {
      this.respondToReadyState(_readyState);
    }
  },
  respondToReadyState: function(_readyState) {
    if (_readyState == 4) { // Completed(Loaded in IE 7)
      //try {
        (this.options["on"+(this.success()?"Success":"Failure")]||(function(){console.log('aa');}))(this.transport);
      //} catch (e) {
        //console.log('error:',e);
      //}
    }
    
    if (_readyState == 4) { // Completed(Loaded in IE 7)
      this.transport.onreadystatechange = function(){};
    }
  },
  success: function() {
    //return !this.transport.status || (this.transport.status >= 200 && this.transport.status < 300);
    return (this.transport.status >= 200 && this.transport.status < 300);
  }
});
