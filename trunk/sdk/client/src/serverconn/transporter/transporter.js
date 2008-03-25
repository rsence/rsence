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

/** class: HTransporter
  *
  * *Simple mid-level AJAX communication system.*
  *
  * Designed as single instance, depends on <HValueManager>.
  *
  * When implementing the server part:
  *  - feed it with raw javascript
  *  - override ses_id as early as possible with your own session id, this tells the clients apart.
  *  - change the syncDelay depending on how fast you want the client to poll the server (a value in ms)
  *  - you may refer to 't' as the HTransporter's namespace.
  *
  * Sample initialization sequence:
  * > t.ses_id = 'nhHOZ8Zo64Wfo';
  * > t.syncDelay = 400;
  * > t.url_base = '/phase2';
  *
  * See Also:
  *  <HValueManager.toXML>
  **/

/* int: HTransportURL
 *
 * Tells the <HTransporter> which url/path to start polling.
 * - "global"
 * - Override it with your server's path or url before the document is loaded.
 */
HTransportURL = false;

/* int: HTransportPoll
 *
 * Tells the <HTransporter> whether to use polling (true) or to sync values only
 * when there's something on the client-side to sync (false).
 * - "global"
 * - Defaults to true (polling), override it with false before the document is
 *   loaded if you don't want polling.
 */
HTransportPoll = true;

/* vars: Instance variables
 *  url_base  - The URL (or path) that the requests are sent to
 *  ses_id    - A value that is the reported in each request by the key 'ses_id'
 *  syncDelay - An integer value (in ms) that the client waits before starting the next request
 */

HTransporter = Base.extend({
  
  constructor: null,
  
  start: function(_url_base){
    this.url_base  = _url_base;
    this.ses_id    = 0;
    this.err_msg   = '';
    this.isBusy    = false;
    this.syncNum   = 0;
    this.syncDelay = 0;
    this.pollMode  = HTransportPoll;
    this.req_timeout = setTimeout('HTransporter.sync();',this.syncDelay);
  },
  
  setPollMode: function(_flag) {
    this.pollMode = _flag;
  },
  
  failure: function(resp){
    alert('HTTP ERROR! STOP.');
    clearTimeout(this.req_timeout);
    this.isBusy = true;
  },
  
  respond: function(resp){
    var _respText = resp.responseText;
    //console.log( _respText );
    //var t = HTransporter;
    //try {
      //t.err_msg = '';
      eval(_respText); 
    //} catch(e) {
    //  t.err_msg = '&err_msg='+e;
    //}
    HTransporter.isBusy = false;
    //HTransporter.isBusy = true;
  },
  
  sync: function(){
    var valid_delay = ((this.syncDelay&&this.syncDelay>0)||this.syncDelay==0);
    // Negative syncDelay stops transporter.
    if(valid_delay && this.url_base){
      if(!this.isBusy){
        this.isBusy = true;
        var _syncData = HValueManager.toXML();
        
        if ("" != _syncData || this.pollMode) {
          
          this.syncNum++;
          HVM.isGetting=true;
          req_args = {
            onSuccess: function(resp){HTransporter.respond(resp);},
            onFailure: function(resp){HTransporter.failure(resp);},
            method:    'post',
            postBody:  'ses_id='+HTransporter.ses_id+_syncData
          };
          this.req  = new Ajax.Request( this.url_base, req_args );
          HVM.isGetting=false;
        }
        else {
          this.isBusy = false;
        }
        
      }
      this.req_timeout = setTimeout('HTransporter.sync();',this.syncDelay);
    }
  },
  
  stop: function() {
    clearTimeout(this.req_timeout);
  }
  
});

LOAD("HTransporter.start(HTransportURL);");

