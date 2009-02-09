/***  Riassence Core
  ** 
  **  Copyright (C) 2008 Riassence Inc http://rsence.org/
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
  * > HTransporter.ses_id    = 'nhHOZ8Zo64Wfo';
  * > HTransporter.syncDelay = 400;
  * > HTransporter.url_base = '/ui';
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

/* str: HFailPageUrl
 *
 * Url or uri where the the client goes, if a communication error is encountered.
 */
HFailPageUrl = '/';
HTransporterMaxRetryCount = 60;     // 60 retries
HTransporterMaxRetryTime  = 60000; // 60 seconds
HTransporterRetryDelay    = 1000; // 1 second

// Retarded debug mode for "special" browsers
HTransporterDebug = false;

/* vars: Instance variables
 *  url_base  - The URL (or path) that the requests are sent to
 *  ses_id    - A value that is the reported in each request by the key 'ses_id'
 *  syncDelay - An integer value (in ms) that the client waits before starting the next request
 */
HTransporter = HClass.extend({
  
  constructor: null,
  
  start: function(_url_base){
    var _this = HTransporter;
    _this.url_base  = _url_base;
    _this.ses_id    = 0;
    _this.err_msg   = '';
    _this.isBusy    = false;
    _this.syncNum   = 0;
    _this.syncDelay = 100;
    
    _this.prevData  = '';
    _this.failCount = 0;
    _this.firstFail = 0;
    
    _this.pollMode  = HTransportPoll;
    _this.req_timeout = setTimeout('HTransporter.sync();',_this.syncDelay);
  },
  
  setPollMode: function(_flag) {
    HTransporter.pollMode = _flag;
  },
  
  failure: function(resp){
    //console.log('failure');
    var _currFailAge = HTransporterMaxRetryTime+(new Date().getTime()),
        _this = HTransporter;
    clearTimeout(_this.req_timeout);
    if(_this.firstFail==0){
      _this.isBusy = false;
      _this.firstFail=(new Date().getTime());
      _this.failCount++;
      window.status = 'Communications error, retry attempt '+_this.failCount+' of '+HTransporterMaxRetryCount+'...';
    }
    else if((_this.failCount<HTransporterMaxRetryCount)&&(_this.firstFail<_currFailAge)){
      _this.isBusy = false;
      _this.failCount++;
      window.status = 'Communications error, retry attempt '+_this.failCount+' of '+HTransporterMaxRetryCount+'...';
    }
    else {
      // If the connection fails, automatically try to reload the page.
      window.status = 'Communications error, reloading page...';
      location.href = HFailPageUrl;
      _this.isBusy = true;
    }
    //console.log('fail..retry');
    _this.req_timeout = setTimeout('HTransporter.sync();',HTransporterRetryDelay);
  },
  
  respond: function(resp){
    var _respText = resp.responseText,
        _this = HTransporter;
    try {
      _this.err_msg = '';
      eval(_respText); 
    }
    catch(e) {
      if(HTransporterDebug){
        console.log(e);
        console.log(e.description);
      }
      _this.err_msg = '&err_msg='+e+" - "+e.description;
      _this.failure(resp);
    }
    _this.prevData  = '';
    if(_this.failCount!=0){window.status='';}
    _this.failCount = 0;
    _this.firstFail = 0;
    _this.isBusy = false;
    if(_this.pollMode){
      _this.req_timeout = setTimeout('HTransporter.sync();',_this.syncDelay);
    }
  },
  
  sync: function(){
    var _this = HTransporter,
        _valid_delay = ((_this.syncDelay>0)||(_this.syncDelay==0));
    // Negative syncDelay stops transporter.
    if(_valid_delay && _this.url_base){
      if(!_this.isBusy){
        _this.isBusy = true;
        if(_this.prevData!=''){
          _syncData = _this.prevData;
          //console.log('syncData0:',_syncData);
        }
        else {
          _syncData = HValueManager.toXML();
          _this.prevData = _syncData;
          //console.log('syncData1:',_syncData);
        }
        if(""!=_syncData || _this.pollMode) {
          _this.syncNum++;
          HVM.isGetting=true;
          req_args = {
            onSuccess: function(resp){_this.respond(resp);},
            onFailure: function(resp){_this.failure(resp);},
            method:    'post',
            postBody:  'ses_id='+_this.ses_id+_this.err_msg+_syncData
          };
          try{
            _this.req  = new Ajax.Request( _this.url_base, req_args );
            HVM.isGetting=false;
          }
          catch(e){
            window.status = 'conn error:'+e;
            HVM.isGetting=false;
            _this.failure(null);
          }
        }
        else {
          _this.isBusy = false;
        }
      }
    }
  },
  
  stop: function() {
    clearTimeout(_this.req_timeout);
  }
  
});

LOAD("HTransporter.start(HTransportURL);");

