/***  HIMLE RIA SYSTEM
  ** 
  **  Copyright (C) 2008 HIMLE GROUP http://himle.sorsacode.com/
  **  Copyright (C) 2007 Juha-Jarmo Heinonen <o@sorsacode.com>
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


JSLoader = HClass.extend({
  
  constructor: function(_uri){
    var _this = this;
    _this._loadedJS = [];
    _this.uri  = _uri;
    _this._req = null;
    _this._okayed = false;
  },
  
  _okay: function(_resp){
    var _this = this;
    if(_this._okayed){
      return;
    }
    eval(_resp.responseText);
    _this._okayed = true;
  }, 
  
  load: function(_jsName,_fullURL){
    var _this = this;
    if((_this._loadedJS.indexOf(_jsName)!=-1) && (_fullURL === undefined)) {
      return;
    }
    if (_fullURL) {
      document.write('<scr'+'ipt type="text/javascript" src="'+_jsName+'"><'+'/scr'+'ipt>');
    } else {
      var _req_args = {
        onSuccess:    function(resp){_this._okay(resp);},
        onFailure:    function(resp){window.status="failed to load js: "+_this.uri+_jsName+'.js';},
        method:       'get',
        asynchronous: false
      };
      var _url = this.uri+_jsName+'.js';
      _this._req = new Ajax.Request( _url, _req_args );
      _this._loadedJS.push(_jsName);
      _this._okayed = false;
    }
  }
  
});

RUN("jsLoader = new JSLoader('/H/js/');");



