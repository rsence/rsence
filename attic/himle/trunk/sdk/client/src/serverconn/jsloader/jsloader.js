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


JSLoader = Base.extend({
  
  constructor: function(_uri){
    this._loadedJS = [];
    this.uri  = _uri;
    this._req = null;
    //this._currJS = [];
  },
  
  _okay: function(_resp){
    //var _loadedJS = jsLoader._currJS.shift();
    //console.log('resp: ',_resp);
    //console.log('loadedJS: ',_loadedJS);
    //console.log('jsLoader.loadedJS: ',jsLoader._loadedJS);
    //console.log('jsLoader.currJS: ',jsLoader._currJS);
    eval(_resp.responseText);
  }, 
  
  load: function(_jsName,_fullURL){
    if((jsLoader._loadedJS.indexOf(_jsName)!=-1) && (_fullURL === undefined)) {
      return;
    }

    if (_fullURL) {
      document.write('<script type="text/javascript" src="'+_jsName+'"><'+'/script>');
    } else {
      req_args = {
        onSuccess:    function(resp){jsLoader._okay(resp);},
        onFailure:    function(resp){window.status="failed to load js: "+jsLoader._currJS;},
        method:       'get',
        asynchronous: false
      };
      var _url = this.uri+_jsName+'.js';
      this._req = new Ajax.Request( _url, req_args );
      this._loadedJS.push(_jsName);
    }
  }
  
});

LOAD("jsLoader = new JSLoader('/H/js/');");



