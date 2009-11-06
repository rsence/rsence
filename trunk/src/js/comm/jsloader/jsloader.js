/*   Riassence Framework
 *   Copyright 2007 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */


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
    var _this = this;
    if((_this._loadedJS.indexOf(_jsName)!==-1)) {
      return;
    }
    COMM.Queue.pause();
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



