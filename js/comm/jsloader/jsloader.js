/*   RSence
 *   Copyright 2007 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

/*** = Description
  ** A class for asynchronously fetching Javascript libraries from the server.
  **
  ** Loads and evalueates the code returned as a string from the server.
  ** Use the jsLoader instance to get packaged Javascript libraries from the
  ** standard package url.
***/

COMM.JSLoader = HClass.extend({
  
/** = Description
  * Construct with the base url.
  *
  * The this is the base url used by the +load+ method.
  *
  **/
  constructor: function(_uri){
    var _this = this;
    _this._loadedJS = [];
    _this.uri  = _uri;
    _this._okayed = false;
  },
  
  // Error catcher for failed requests.
  _fail: function(_this,_resp){
    console.log("failed to load js: "+_resp.url);
  },
  
/** = Description
  * Loads a js package using the name.
  *
  * The base url given in the constructor is used as the prefix.
  * Omit the '.js' suffix, because it's appended automatically.
  *
  * = Parameters
  * +_jsName+::   The name of the js file to load (without the .js suffix)
  *
  * = Usage:
  * Uses the main instance set to the base path of the server's
  * js package url. Loads a package containing list components.
  *   jsLoader.load('lists');
  *
  **/
  load: function(_jsName){
    var _this = this,
        _isFullUrl = _jsName.slice(0,7) === 'http://' || _jsName.slice(0,8) === 'https://',
        _url = _isFullUrl?_jsName:_this.uri+_jsName+'.js';
    if((_this._loadedJS.indexOf(_url)!==-1)) {
      return;
    }
    COMM.Queue.pause();
    _this._loadedJS.push(_url);
    if(BROWSER_TYPE.symbian && _isFullUrl){
      alert('Sorry, this browser does not support loading external scripts!');
      return;
    }
    else if(BROWSER_TYPE.symbian){
      _this._req = COMM.request(
        _url, {
          onSuccess: function(_resp){
            _this._req = null;
            COMM.Queue.unshiftEval(_resp.X.responseText);
            COMM.Queue.resume();
          },
          onFailure: _this._fail,
          method: 'GET',
          async: true
        }
      );
      return;
    }
    var _script = document.createElement('script');
    if(BROWSER_TYPE.ie){
      _script.onreadystatechange = function(){
        if(this.readyState === 'loaded' || this.readyState === 'complete'){
          COMM.Queue.resume();
          _script.onload = _script.readystatechange = null;
        }
      };
    }
    else {
      _script.onload = function(){
        COMM.Queue.resume();
      };
    }
    _script.src = _url;
    _script.type = 'text/javascript';
    document.getElementsByTagName('head')[0].appendChild(_script);
  }
});

/** -- Global reference ++ **/
JSLoader = COMM.JSLoader;

// Makes the standard jsLoader instance based on the client base url 
// of the server when the page is loaded.
LOAD(
  function(){
    COMM.jsLoader = COMM.JSLoader.nu( HCLIENT_BASE + '/js/' );
    // backwards compatibility aliases:
    jsLoader = COMM.jsLoader;
  }
);



