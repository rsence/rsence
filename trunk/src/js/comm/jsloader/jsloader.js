/*   Riassence Framework
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
JSLoader = HClass.extend({
  
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

// Makes the standard jsLoader instance based on the client base url 
// of the server when the page is loaded.
RUN("jsLoader = JSLoader.nu(HCLIENT_BASE+'/js/');");



