HTransporter.syncDelay = 10;

HThemeManager.setThemePath('/H/themes');

ELEM.del(ELEM.bindId('loading'));

SesWatcher = HApplication.extend({
  constructor: function( _timeoutSecs, _sesTimeoutValueId ){
    this.base(240);
    this.sesTimeoutValue = HVM.values[_sesTimeoutValueId];
    this.timeoutSecs = _timeoutSecs;
  },
  onIdle: function(){
    if((new Date().getTime() - this.sesTimeoutValue.value) > this.timeoutSecs ){
      this.sesTimeoutValue.set( new Date().getTime() );
    }
  }
});

