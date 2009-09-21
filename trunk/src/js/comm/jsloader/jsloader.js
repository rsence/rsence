/**
  * Riassence Core -- http://rsence.org/
  *
  * Copyright (C) 2007 Juha-Jarmo Heinonen <jjh@riassence.com>
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


JSLoader = HClass.extend({
  
  constructor: function(_uri){
    var _this = this;
    _this._loadedJS = [];
    _this.uri  = _uri;
    _this._okayed = false;
  },
  
  _fail: function(_this,_resp){
    console.log("failed to load js: "+_resp.url);
  },
  
  load: function(_jsName){
    COMM.Queue.pause();
    var _this = this;
    if((_this._loadedJS.indexOf(_jsName)!==-1)) {
      return;
    }
    _this._loadedJS.push(_jsName);
    _this._req = COMM.request(
      _this.uri+_jsName+'.js', {
        onSuccess: function(_resp){
          COMM.Queue.unshiftEval(_resp.X.responseText);
          COMM.Queue.resume();
        },
        onFailure: _this._fail,
        method: 'GET',
        async: true
      }
    );
  }
  
});

RUN("jsLoader = JSLoader.nu(HCLIENT_BASE+'/js/');");



