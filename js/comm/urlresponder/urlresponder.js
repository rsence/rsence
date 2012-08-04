/*   RSence
 *   Copyright 2009 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

/*** = Description
  ** This application registers url responders to hide/show
  ** certain views automatically whenever the anchor
  ** part of the url is changed.
  **
  ** It is bound to the server HValue instance
  ** +msg.session[:main][:location_href]+ by
  ** the 'main' plugin. By default it runs with 
  ** a client-side-only HValue instance until then.
  **
***/
//var//RSence.COMM
COMM.URLResponder = HApplication.extend({
  constructor: function(){
    this.urlMatchers = [];
    this.urlCallBacks = [];
    this.defaultCallBacks = [];
    this.prevCallBacks = [];
    this.prevMatchStrs = [];
    this.base(1, 'URLResponder');
    this.value = 0;
  },
  
  // sets the view to show when there is
  // no matches (like a virtual 404)
  setDefaultResponder: function(_callBack){
    this.defaultCallBacks = [ _callBack ];
    this.refresh();
  },
  
  addDefaultResponder: function(_callBack){
    this.defaultCallBacks.push( _callBack );
    this.refresh();
  },
  
  delDefaultResponder: function(_callBack){
    this.defaultCallBacks.splice(this.defaultCallbacks.indexOf(_callBack),1);
    this.refresh();
  },
  
  // Removes responder
  // - matchStr is an url that the callBack will
  //   respond to
  // - callBack is the component registered
  delResponder: function(_matchStr,_callBack){
    _callBack.hide();
    if(~this.prevCallBacks.indexOf(_callBack)){
      this.prevCallBacks.splice(this.prevCallBacks.indexOf(_callBack),1);
      this.prevMatchStrs.splice(this.prevMatchStrs.indexOf(_matchStr),1);
    }
    var i=0, _urlMatch, _urlCallBack;
    for(;i<this.urlMatchers.length;i++){
      _urlMatch = this.urlMatchers[i].test(_matchStr);
      if(_urlMatch){
        this.urlMatchers.splice(i,1);
        this.urlCallBacks.splice(i,1);
        return 1;
      }
    }
    this.refresh();
    return 0;
  },
  
  // Adds responder
  // - matchRegExp is the regular expression
  //   that matches the anchor part of the uri
  // - callBack is the component that will receive hide/show calls
  // - activate is a flag that tells the view to be immediately 
  //   activate (and the previous one to deactivate)
  addResponder: function(_matchRegExp,_callBack,_activate){
    this.urlMatchers.push(new RegExp(_matchRegExp));
    this.urlCallBacks.push(_callBack);
    this.checkMatch(this.value);
    if(_activate!==undefined){
      window.location.href=_activate;
    }
    this.refresh();
  },
  
  // Checks the matchStr agains regular expressions
  checkMatch: function(_matchStr){
    if(~this.prevMatchStrs.indexOf( _matchStr )){
      return 0;
    }
    var i=0, _urlMatch, _urlCallBacks=[], _urlCallBack;
    for(;i<this.urlMatchers.length;i++){
      _urlMatch = this.urlMatchers[i].test(_matchStr);
      if(_urlMatch){
        _urlCallBacks.push(this.urlCallBacks[i]);
      }
    }
    if(_urlCallBacks.length !== 0){
      for(i=0;i<_urlCallBacks.length;i++){
        _urlCallBack = _urlCallBacks[i];
        _urlCallBack.show();
        if(~this.prevMatchStrs.indexOf(_matchStr)){
          this.prevMatchStrs.push( _matchStr );
        }
      }
      var _prevCallBack;
      for(i=0;i<this.prevCallBacks.length;i++){
        _prevCallBack = this.prevCallBacks[i];
        if(!~_urlCallBacks.indexOf(_prevCallBack)){
          this.prevCallBacks[i].hide();
        }
      }
      this.prevCallBacks = _urlCallBacks;
      return 1;
    }
    if(this.defaultCallBacks.length !== 0){
      if(this.prevCallBacks.length !== 0){
        for(i=0;i<this.prevCallBacks.length;i++){
          this.prevCallBacks[i].hide();
        }
      }
      this.prevCallBacks = [];
      for(i=0;i<this.defaultCallBacks.length;i++){
        this.defaultCallBacks[i].show();
        this.prevCallBacks.push( this.defaultCallBacks[i] );
      }
    }
    return -1;
  },
  
  refresh: function(){
    var _value = this.value;
    if(_value.length === 0){ return; }
    if(window.location.href !== _value){
      window.location.href = _value;
    }
    this.checkMatch( _value );
  },
  
  onIdle: function(){
    if(!this['valueObj']){return;}
    var _href = window.location.href;
    if(_href!==this.value){
      this.setValue(_href);
    }
  }
});
