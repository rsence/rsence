/*   RSence
 *   Copyright 2009 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

/*** = Description
  ** COMM.Session is the session key manager.
  **
  ** COMM.Session is used by COMM.Transporter to generate key hashes for
  ** the session management of COMM.Transporter's keys.
  **
  ** The server expects this exact algorithm and refuses to serve unless
  ** the SHA1 hash sum of the keys matches.
  **
  ** Uses a +SHA+ instance for generation.
  **
  ** +COMM.Queue+ runs as a single instance, don't try to reconstruct it.
***/
//var//RSence.COMM
COMM.Session = HClass.extend({
  
/** The constructor takes no arguments.
  **/
  constructor: function(){
    var _this = this;
    _this.sha = SHA.nu(8);
    _this.sha_key = _this.sha.hexSHA1(((new Date().getTime())*Math.random()*1000).toString());
    _this.ses_key = '0:1:'+_this.sha_key;
    _this.req_num = 0;
  },
  
/** = Description
  * Generates a new SHA1 sum using a combination of
  * the previous sum and the +_newKey+ given.
  *
  * Sets +self.ses_key+ and +self.sha_key+
  *
  * = Parameters:
  * +_newKey+:: A key set by the server.
  *
  **/
  newKey: function(_sesKey){
    var _this = this,
        _shaKey = _this.sha.hexSHA1(_sesKey+_this.sha_key);
    _this.req_num++;
    _this.ses_key = _this.req_num+':1:'+_shaKey;
    _this.sha_key = _shaKey;
  }
}).nu();
