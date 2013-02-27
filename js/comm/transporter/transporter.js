
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
//var//RSence.COMM
COMM.Transporter = HApplication.extend({
  
/** Sets up the default settings upon construction.
  **/
  constructor: function(){
    var _this = this;
    _this._detectNativeJSONSupport();
    _this.serverLostMessage = 'Server Connection Lost: Reconnecting...';
    _this.label = 'Transporter';
    _this.url = false;
    _this.busy = false;
    _this.stop = true;
    _this._serverInterruptView = false;
    _this._clientEvalError = false;
    _this._busyFlushTimeout = false;
    _this.base(1);
  },

  _detectNativeJSONSupport: function(){
    if(window.JSON){
      var
      _JSON = window.JSON,
      _fun = 'function';
      if((typeof _JSON.parse === _fun) && (typeof _JSON.stringify === _fun)){
        this.parseResponseArray = this._nativeParseResponseArray;
      }
    }
  },
  
/** Tries to (re)connect to the server as often as possible,
  * mandated essentially by the priority of its
  * HApplication instance.
  **/
  onIdle: function(){
    this.sync();
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
  // getClientEvalError: function(){
  //   var _this = COMM.Transporter;
  //   return _this._clientEvalError?'&err_msg=' +
  //          COMM.Values._encodeString(_this._clientEvalError):'';
  // },
  
  parseResponseArray: function( _responseText ){
    return this.decodeObject( _responseText );
  },
  
  _nativeParseResponseArray: function( _responseText ){
    return JSON.parse( _responseText );
  },
  
  setValues: function( _values ){
    if(!_values instanceof Object){
      console.log("Invalid values block: ", _values );
      return;
    }
    var
    i = 0,
    _valueManager = COMM.Values,
    _itemtype,
    _valueId,
    _valueData;
    if(_values['new'] instanceof Array){
      for(i=0;i<_values['new'].length;i++){
        _valueId = _values['new'][i][0];
        _valueData = _values['new'][i][1];
        _valueManager.create( _valueId, _valueData );
      }
    }
    if(_values.set instanceof Array){
      for(i=0;i<_values.set.length;i++){
        _valueId = _values.set[i][0];
        _valueData = _values.set[i][1];
        _valueManager.s( _valueId, _valueData );
      }
    }
    if(_values.del instanceof Array){
      for(i=0;i<_values.del.length;i++){
        _valueId = _values.del[i];
        _valueManager.del( _valueId );
      }
    }
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
    var _this = COMM.Transporter;
    if(!resp.X.responseText){
      _this.failure(resp);
      return;
    }
    var
    _responseArray = _this.parseResponseArray(resp.X.responseText),
    i = 2,
    _responseArrayLen = _responseArray.length,
    _sesKey = _responseArray[0],
    _values = _responseArray[1],
    _session = COMM.Session,
    _queue = COMM.Queue,
    _errorText;
    if(_sesKey === ''){
      console.log('Invalid session, error message should follow...');
    }
    else {
      _session.newKey(_sesKey);
    }
    _this.setValues( _values );
    _outputScript = '(function(_queue){';
    for(;i<_responseArrayLen;i++){
      _outputScript += '_queue.push( (function(){';
      _outputScript += _responseArray[i];
      _outputScript += '}) );';
      // try {
      //   console.log(_responseArray[i]);
      //   _queue.pushEval( _responseArray[i] );
      // }
      // catch(e) {
      //   console.log('clientEvalError:',_queue.clientException( e, _responseArray[i] ));
      //   _this._clientEvalError = _queue.clientException( e, _responseArray[i] );
      // }
    }
    _outputScript += '_queue.push( (function(){COMM.Transporter.flushBusy();}) );';
    _outputScript += '_queue.push( (function(){_queue.delScript("'+_sesKey+'");}) );';
    _outputScript += '_queue.flush();';
    _outputScript += '})(COMM.Queue);';
    _queue.addScript(_sesKey,_outputScript);
    if(_this._serverInterruptView && _sesKey !== '' ){
      _this._serverInterruptView.die();
      _this._serverInterruptView = false;
    }
  },
  
/** Sets the +busy+ flag to false and resynchronizes immediately,
  * if COMM.Values contain any unsynchronized values.
  **/
  flushBusy: function(){
    var _this = COMM.Transporter;
    _this.busy = false;
    if( COMM.Values.tosync.length !== 0 ){
      _this.sync();
    }
  },
  failMessage: function(_title,_message){
    var _this = COMM.Transporter,
        _queue = COMM.Queue;
    console.log('failMessage title:',_title,', message:',_message);
    _this.stop = true;
    _queue.push(function(){jsLoader.load('default_theme');});
    _queue.push(function(){jsLoader.load('controls');});
    _queue.push(function(){jsLoader.load('servermessage');});
    _queue.push(function(){ReloadApp.nu(_title,_message);});
  },

  setInterruptAnim: function(_customMessage,_customColor){
    var _this = COMM.Transporter;
    if(!_this._serverInterruptView){
      _this._serverInterruptView = HView.extend({
        _setCustomMessage: function(_text){
          ELEM.setHTML(this._messageDiv,_text);
        },
        _setCustomColor: function(_color){
          this.setStyle('background-color',_color);
        },
        _setFailedResp: function(_resp){
          if( _resp !== undefined && typeof _resp !== 'string' ){
            this._failedResp = _resp;
          }
          this._errorIndex++;
          return this;
        },
        _retry: function(){
          this._retryIndex++;
          var _resp = this._failedResp;
          COMM.request(
            _resp.url,
            _resp.options
          );
        },
        onIdle: function(){
          var _currentDate = new Date().getTime();
          this.bringToFront();
          if( this._errorIndex > 0 &&
              (this._retryIndex !== this._errorIndex) &&
              (this._lastError + 2000 < _currentDate) &&
              this._failedResp ){
            this._lastError = _currentDate;
            this._retry();
          }
          this.base();
        },
        _errorIndex: 0,
        _retryIndex: 0,
        _lastError: new Date().getTime(),
        die: function(){
          var _app = this.app;
          HSystem.reniceApp(_app.appId,this._origPriority);
          this.base();
          _app.sync();
        },
        drawSubviews: function(){
          var _style = [
            ['padding-left', '8px'],
            ['background-color', '#600'],
            ['text-align','center'],
            ['color', '#fff'],
            ['font-size', '16px'],
            ['opacity', 0.85]
          ], i = 0;
          for( ; i<_style.length; i++ ){
            this.setStyle( _style[i][0], _style[i][1] );
          }
          this._messageDiv = ELEM.make(this.elemId);
          ELEM.setHTML(this._messageDiv,this.app.serverLostMessage);
          this._origPriority = HSystem.appPriorities[this.appId];
          if(HSystem.appPriorities[this.appId]<10){
            HSystem.reniceApp(this.appId,10);
          }
          this._anim = HView.extend({
            _animIndex: 0,
            _anim: function(){
              var _targetRect,
                  _width = ELEM.getSize(this.parent.elemId)[0];
              this._animIndex++;
              if(this._animIndex%2===0){
                _targetRect = HRect.nu(0,0,80,20);
              }
              else {
                _targetRect = HRect.nu(_width-80,0,_width,20);
              }
              this.animateTo(_targetRect,2000);
            },
            onAnimationEnd: function(){
              if(this.drawn){
                this._anim();
              }
            }
          }
        ).nu( [0,0,80,20], this ).setStyle('background-color','#fff').setStyle('opacity',0.8)._anim();
        }
      }).nu([0,0,200,20,0,null],_this);
      if( typeof _customMessage !== 'string' ){
        _this._serverInterruptView._setFailedResp(_customMessage);
      }
    }
    if( _customMessage !== undefined ) {
      if( typeof _customMessage === 'string' ){
        _this._serverInterruptView._setCustomMessage(_customMessage);
      }
    }
    if( !_this.stop ){
      _this._serverInterruptView._setFailedResp();
    }
    if( _customColor !== undefined ){
      _this._serverInterruptView._setCustomColor(_customColor);
    }
  },
  
/** Called by the XMLHttpRequest, when there was a failure in communication.
  **/
  failure: function(_resp){
    var _this = COMM.Transporter;
    // server didn't respond, likely network issue.. retry.
    if(_resp.X.status===0){
      console.log(_this.serverLostMessage);
      _this.setInterruptAnim(_resp);
    }
    else {
      _this.failMessage('Transporter Error','Transporter was unable to complete the synchronization request.');
    }
  },
  
/** Starts requests.
  **/
  sync: function(){
    if(this.stop){
      // console.log('sync stop');
      return;
    }
    if(this.busy){
      // console.log('sync busy');
      return;
    }
    // console.log('sync.');
    this.busy = true;
    var _now = new Date().getTime();
    if(window.sesWatcher && window.sesWatcher.sesTimeoutValue){
      // Sets the value of the session watcher to the current time. It could cause an unnecessary re-sync poll immediately after this sync otherwise.
      sesWatcher.sesTimeoutValue.set( _now );
    }
    var
    _this = this,
    // _values = HVM.sync(),
    // _boundary = _now.toString(36)+(Math.random()*10000).toString(36)+(Math.random()*10000).toString(36),
    // _separator = '--'+_boundary,
    // _errorMessage = _this.getClientEvalError(),
    _body = COMM.Values.sync();
    // _body = _separator+
    //   '\r\nContent-Disposition: form-data; name="ses_key"\r\nContent-Type: text/plain\r\n'+
    //   '\r\n'+COMM.Session.ses_key+'\r\n'+_separator;
    // if( _values ){
    //   _body += '\r\nContent-Disposition: form-data; name="values"\r\nContent-Type: application/json; charset=UTF-8\r\n'+
    //   '\r\n'+_values+'\r\n'+_separator+'--\r\n';
    // }
    // else {
    //   _body += '--\r\n';
    // }
    // _body = [_sesKey,_errorMessage,_values?'&values='+_values:''].join('');
    COMM.request(
      _this.url, {
        _this: _this,
        // contentType: 'multipart/form-data; boundary='+_boundary,
        contentType: 'application/json',
        onSuccess: COMM.Transporter.success,
        onFailure: COMM.Transporter.failure,
        method: 'POST',
        async: true,
        body: _body
      }
    );
  }
}).nu();
