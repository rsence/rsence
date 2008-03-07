HTransporter.syncDelay = 10;

HThemeManager.setThemePath('/gz?themes=');

var _load_elem = elem_bind('loading');
elem_del(_load_elem);
delete _load_elem;

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

