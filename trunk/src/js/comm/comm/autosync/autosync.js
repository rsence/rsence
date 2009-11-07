/*   Riassence Framework
 *   Copyright 2009 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

/*** = Description
  ** COMM.Queue executes javascript blocks in a managed queue.
  **
  ** COMM.Queue is used by COMM.Transporter and JSLoader to continue
  ** javascript command execution after a XMLHttpRequest finishes.
  **
  ** COMM.Queue runs as a single instance, dan't try to reconstruct it.
***/
COMM.Queue = HApplication.extend({
  
/** The constructor takes no arguments and starts queue flushing automatically.
  **/
  constructor: function(){
    
    // The queue itself, is packed with anonymous functions
    this.commandQueue = [];
    
    // Flag to signal the pause and resume status.
    this.paused = false;
    
    // Run with priority 10; not too demanding but not too sluggish either
    this.base(10);
  },
  
/** Checks periodically, if the queue needs flushing.
  **/
  onIdle: function(){
    // Runs the flush operation, if the queue is not
    // empty and the state is not resumed:
    !this.paused && this.commandQueue.length !== 0 && this.flush();
  },
  
/** = Description
  * Pauses the queue.
  *
  * Use to stop execution, if some data or code needs to be loaded that the
  * rest of the queue depends on.
  * Typically called before an +XMLHttpRequest+ with the +onSuccess+
  * event defined to call +resume+ when the request is done.
  *
  **/
  pause: function(){
    this.paused = true;
  },
  
/** = Description
  * Resumes queue flushing.
  *
  * Use to resume execuption, when some depending code for the rest
  * of the queue has been loaded.
  * Typically on an +XMLHttpRequest+ +onSuccess+ event.
  *
  **/
  resume: function(){
    this.paused = false;
    this.flush();
  },
  
/** A Group of localizable strings; errors and warnings.
  **/
  STRINGS: {
    ERR: 'COMM.Queue Error: ',
    JS_EXEC_FAIL: 'Failed to execute the Javascript function: ',
    REASON: ' Reason:'
  },
  
/** = Description
  * Flushes the queue until stopped.
  *
  * Iterates through the +commandQueue+ and calls each function.
  * Removes items from the queue after execution.
  *
  **/
  flush: function(){
    var i = 0, // current index in the for-loop.
        _item, // the current item to execute
        _function, // the function to run
        _arguments, // the arguments of the function
        _len = this.commandQueue.length; // the length of the queue
    
    // Iterates through the items.
    for(;i<_len;i++){
      
      // Checks that the queue hasn't been paused.
      if(this.paused){
        break; // stops flushing, if paused.
      }
      
      // The first item in the queue is removed from the queue.
      _item = this.commandQueue.shift();
      
      // Execute the item, with arugments if the item
      try{
        if(typeof _item === 'function'){
          _item.call();
        }
        else {
          _function = _item[0];
          _arguments = _item[1];
          _function.call(_arg);
        }
      }
      
      // Displays an error message in the Javascript console, if failure.
      catch(e){
        var _itemSrc = BROWSER_TYPE.ie?_item:_item.toSource(),
            _strs = this.STRINGS;
        console.log([
          _strs.ERR_PREFIX,
          _strs.JS_EXEC_FAIL,
          _itemSrc,
          _strs.REASON,
          e
        ].join(''));
      }
    }
  },
  
/** = Description
  * Adds an item to the beginning of the queue.
  *
  * Use to make the given +_function+ with its 
  * optional +_arguments+ the next item to flush.
  *
  * = Parameters:
  * +_function+::  An anonymous function. Contains the code to execute.
  *
  * +_arguments+:: _Optional_ arguments to pass on to the +_function+
  **/
  unshift: function(_function,_arguments){
    if(_arguments!==undefined){
      this.commandQueue.unshift([_function,_arguments]);
    }
    else {
      this.commandQueue.unshift(_function);
    }
  },
  
/** = Description
  * Adds an item to the end of the queue.
  *
  * Use to make the given +_function+ with its 
  * optional +_arguments+ the last item to flush.
  *
  * = Parameters:
  * +_function+::  An anonymous function. Contains the code to execute.
  *
  * +_arguments+:: _Optional_ arguments to pass on to the +_function+
  **/
  push: function(_function,_arguments){
    if(_arguments!==undefined){
      this.commandQueue.push([_function,_arguments]);
    }
    else {
      this.commandQueue.push(_function);
    }
  },
  
/** Like +unshift+, but uses the code block as a string to be
  * passed on as an evaluated anonymous function.
  **/
  unshiftEval: function(_evalStr,_arguments){
    var _function;
    eval('_function = function(){'+_evalStr+'}');
    this.unshift(_function);
  },
  
/** Like +push+, but uses the code block as a string to be
  * passed on as an evaluated anonymous function.
  **/
  pushEval: function(_evalStr){
    var _function;
    eval('_function = function(){'+_evalStr+'}');
    this.push(_function);
  }
}).nu();


/*** = Description
  ** COMM.Session is the session key manager.
  **
  ** COMM.Session is used by COMM.Transporter to generate key hashes for
  ** the session management of COMM.Transporter's keys.
  **
  ** The server expects this exact algorithm and refuses to serve unless
  ** the SHA1 hash sum of the keys matches.
  **
  ** Uses a +SHAClass+ instance for generation.
  **
  ** +COMM.Queue+ runs as a single instance, dan't try to reconstruct it.
***/
COMM.Session = HClass.extend({
  
/** The constructor takes no arguments.
  **/
  constructor: function(){
    var _this = this;
    _this.sha = SHAClass.nu(8);
    _this._hexSHA1 = sha.hexSHA1;
    _this.sha_key = _this._hexSHA1(((new Date().getTime())*Math.random()*1000).toString());
    _this.ses_key = '0:.o.:'+_this.sha_key;
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
        _shaKey = _this._hexSHA1(_sesKey+_this.sha_key);
    _this.req_num++;
    _this.ses_key = _this.req_num+':.o.:'+_shaKey;
    _this.sha_key = _shaKey;
  }
}).nu();

/*** = Description
  ** Implements the client-server interface.
  **
  ** COMM.Transporter manages the client side of the server-client-server
  ** data synchronization and the server-client command channel.
  **
  ** It uses COMM.Session for session key handling, COMM.Queue for command
  ** queuing and COMM.Values for data value management.
  **
  ** COMM.Transporter operates in a fully automatic mode and starts when
  ** the document has been loaded.
  **
  ** Don't call any of its methods from your code.
***/
COMM.Transporter = HApplication.extend({
  
/** Sets up the default settings upon construction.
  **/
  constructor: function(){
    var _this = this;
    this.serverLostMessage = 'Server Connection Lost. Retrying.';
    _this.label = 'Transporter';
    _this.url = false;
    _this.busy = false;
    _this.stop = true;
    _this._serverInterruptElemId = false;
    _this._clientEvalError = false;
    _this._busyFlushTimeout = false;
    _this.base(1);
  },
  
/** Tries to (re)connect to the server as often as possible,
  * mandated essentially by the priority of its
  * HApplication instance.
  **/
  onIdle: function(){
    !this.busy && this.sync();
  },
  
/** (Re)sets the priority of itself, effects how
  * frequently +onIdle+ is called.
  * Usually set by the server.
  **/
  poll: function(_pri){
    HSystem.reniceApp(this.appId,_pri);
  },
  
/** Returns the last transaction error of itself. Used by +sync+
  * to report js errors to the server.
  * If no error, returns an empty string.
  **/
  getClientEvalError: function(){
    var _this = COMM.Transporter;
    return _this._clientEvalError?'&err_msg=' +
           COMM.Values._encodeString(_this._clientEvalError):'';
  },
  
/** = Description
  * Handles synchronization responses.
  *
  * Upon a successful request, this method is called by
  * the onSuccess event of the XMLHttpRequest.
  *
  * It splits up the response string and passes the response
  * messages to COMM.Queue for execution.
  *
  * Parameters:
  * +resp+:: The response object.
  *
  **/
  success: function(resp){
    var _this = COMM.Transporter,
        _responseArray = eval(resp.X.responseText),
        i = 1,
        _responseArrayLen = _responseArray.length,
        _sesKey = _responseArray[0],
        _sesssion = COMM.Session,
        _queue = COMM.Queue;
    if(_sesKey === ''){
      console.log('Invalid session, error message should follow...');
    }
    else {
      _sesssion.newKey(_sesKey);
    }
    for(;i<_responseArrayLen;i++){
      try {
        _queue.pushEval( _responseArray[i] );
      }
      catch(e) {
        console.log( 'clientError:'+e+" - "+e.description+' - '+_responseArray[i]);
        _this._clientEvalError = e+" - "+e.description+' - '+_responseArray[i];
      }
    }
    if(_this._serverInterruptElemId){
      ELEM.del(_this._serverInterruptElemId);
      _this._serverInterruptElemId = false;
    }
    _queue.push( function(){COMM.Transporter.flushBusy();} );
    _queue.flush();
  },
  
/** Sets the +busy+ flag to false and resynchronizes immediately,
  * if COMM.Values contain any unsynchronized values.
  **/
  flushBusy: function(){
    var _this = COMM.Transporter;
    _this.busy = false;
    COMM.Values.tosync.length !== 0 && _this.sync();
  },
  failMessage: function(_title,_message){
    var _this = COMM.Transporter,
        _queue = COMM.Queue;
    console.log('failMessage?');
    _this.stop = true;
    _queue.push(function(){jsLoader.load('default_theme');});
    _queue.push(function(){jsLoader.load('controls');});
    _queue.push(function(){jsLoader.load('servermessage');});
    _queue.push(function(){ReloadApp.nu(_title,_message);});
  },
  
/** Called by the XMLHttpRequest, when there was a failure in communication.
  **/
  failure: function(_resp){
    var _this = COMM.Transporter;
    // server didn't respond, likely network issue.. retry.
    if(_resp.X.status===0){
      console.log(_this.serverLostMessage);
      if(HSystem.appPriorities[_this.appId]<10){
        HSystem.reniceApp(_this.appId,10);
      }
      if(!_this._serverInterruptElemId){
        _this._serverInterruptElemId = ELEM.make(0);
        ELEM.setCSS(_this._serverInterruptElemId,'position:absolute;z-index:1000;padding-left:8px;left:0px;top:0px;height:28px;width:100%;background-color:#600;color:#fff;font-family:Arial,sans-serif;font-size:20px;');
        ELEM.setStyle(_this._serverInterruptElemId,'opacity',0.85);
        ELEM.setHTML(_this._serverInterruptElemId,_this.serverLostMessage);
      }
      else {
        ELEM.get(_this._serverInterruptElemId).innerHTML += '.';
      }
      _this.busy = false;
    }
    else {
      _this.failMessage('Transporter Error','Transporter was unable to complete the synchronization request.');
    }
  },
  
/** Starts requests.
  **/
  sync: function(){
    if(this.stop){
      return;
    }
    if(this.busy){
      return;
    }
    this.busy = true;
    var _this = this,
        _values = COMM.Values.sync(),
        _sesKey = 'ses_key='+COMM.Session.ses_key,
        _errorMessage = _this.getClientEvalError(),
        _body = [_sesKey,_errorMessage,_values?'&values='+_values:''].join('');
    COMM.request(
      _this.url, {
        _this: _this,
        onSuccess: COMM.Transporter.success,
        onFailure: COMM.Transporter.failure,
        method: 'POST',
        async: true,
        body: _body
      }
    );
  }
}).nu();

// Starts the synchronization upon page load.
LOAD('COMM.Transporter.url=HCLIENT_HELLO;COMM.Transporter.stop=false;COMM.Transporter.sync();');

