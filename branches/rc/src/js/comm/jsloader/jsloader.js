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
  
  _okay: function(_resp){
    var _this = this;
    if(_this._okayed){
      return;
    }
    eval(_resp.X.responseText);
    _this._okayed = true;
  }, 
  
  _fail: function(_resp){
    var _this = this;
    console.log("failed to load js: "+_resp.url);
  },
  
  load: function(_jsName){
    var _this = this;
    if((_this._loadedJS.indexOf(_jsName)!=-1)) {
      return;
    }
    COMM.request(
      _this.uri+_jsName+'.js', {
        onSuccess: _this._okay,
        onFailure: _this._fail,
        method: 'GET',
        async: false
      }
    );
    _this._loadedJS.push(_jsName);
    _this._okayed = false;
  }
  
});

RUN("jsLoader = JSLoader.nu('/H/'+HCLIENT_REV+'/js/');");



