/*   Riassence Framework
 *   Copyright 2008 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

// Changes the documentElement properties of the web page.
ELEM.setStyle(0,'overflow','auto');

// Session Watcher class definition
SesWatcher = HApplication.extend({
  constructor: function( _timeoutSecs, _sesTimeoutValueId ){
    
    // onIdle is called when HSystem's ticker count % 100 == 0
    // this means it's 5 seconds with HSystemTickerInterval 50
    this.base(10, 'SesWatcher'); 
    
    // gets the HValue represented by
    // sesTimeoutValueId (:client_time in server)
    this.sesTimeoutValue = HVM.values[_sesTimeoutValueId];
    this.timeoutSecs = _timeoutSecs;
  },
  
  // Tells the server the client's current time
  onIdle: function(){
    if((new Date().getTime() - this.sesTimeoutValue.value) > this.timeoutSecs ){
      this.sesTimeoutValue.set( new Date().getTime() );
    }
  }
});

/*   Riassence Framework
 *   Copyright 2008 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

// URLResponder registers url responders to hide/show
// certain views automatically whenever the anchor
// part of the url is changed.
URLResponder = HApplication.extend({
  constructor: function(_url_val_id){
    this.label = 'URLResponder';
    // this.base();
    this.urlMatchers = [];
    this.urlCallBack = [];
    this.defaultCallBack = null;
    this.prevCallBack = false;
    this.prevMatchStr = '';
    // this.url_hvalue = HVM.values[_url_val_id];
    this.base(1);
    // this.valueObj = null;
    HVM.values[_url_val_id].bind( this );
    // this.valueObj = null;
  },
  
  // sets the view to show when there is
  // no matches (like a virtual 404)
  setDefaultResponder: function(_callBack){
    this.defaultCallBack = _callBack;
  },
  
  // Removes responder
  // - matchStr is an url that the callBack will
  //   respond to
  // - callBack is the component registered
  delResponder: function(_matchStr,_callBack){
    _callBack.hide();
    if(_callBack === this.prevCallBack){
      this.prevCallBack = false;
      this.prevMatchStr = '';
    }
    var i=0, _urlMatch, _urlCallBack;
    for(;i<this.urlMatchers.length;i++){
      _urlMatch = this.urlMatchers[i].test(_matchStr);
      if(_urlMatch){
        this.urlMatchers.splice(i,1);
        this.urlCallBack.splice(i,1);
        return 1;
      }
    }
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
    this.urlCallBack.push(_callBack);
    // this.checkMatch(this.valueObj.value);
    this.checkMatch(this.valueObj.value);
    if(_activate!==undefined){
      location.href=_activate;
    }
  },
  
  // Checks the matchStr agains regular expressions
  checkMatch: function(_matchStr){
    if(_matchStr === this.prevMatchStr){
      return 0;
    }
    var i=0, _urlMatch, _urlCallBack;
    for(;i<this.urlMatchers.length;i++){
      _urlMatch = this.urlMatchers[i].test(_matchStr);
      if(_urlMatch){
        _urlCallBack = this.urlCallBack[i];
        if(this.prevCallBack){
          this.prevCallBack.hide();
        }
        _urlCallBack.show();
        this.prevCallBack = _urlCallBack;
        this.prevmatchStr = _matchStr;
        return 1;
      }
    }
    if(this.defaultCallBack){
      if(this.prevCallBack){
        this.prevCallBack.hide();
      }
      this.defaultCallBack.show();
      this.prevCallBack = this.defaultCallBack;
    }
    return -1;
  },
  
//   // HValueManager compatibility method, just like in HControl
//   // setValueObj: function(_valueObj){
//   //   this.valueObj = _valueObj;
//   // },
//   
//   // HValueManager compatibility method, just like in HControl
//   // setValue: function(_value){
//   //   //this.valueObj.set(_value);
//   //   //var _matchStatus = 
//   //   this.checkMatch(_value);
//   // }
// });
// urlResponder = URLResponder.nu();
// 
// 
// // URLCatcher sets its associated valueObj to 
// // the current value of location.href
// //
// // - enables URLResponder
// // - enables client -> server url reporting
// URLCatcher = HApplication.extend({
  
  // constructor: function(_url_val_id){
  //   this.label = 'URLCatcher';
    // this.url_hvalue = HVM.values[_url_val_id];
    // this.base(1);
    // this.url_value.bind( this );
    // this.valueObj = null;
    //this.url_hvalue.bind(urlResponder);
  // },
  
  setValueObj: function(_valueObj){
    this.valueObj = _valueObj;
  },
  
  setValue: function(_value){
    if(_value !== this.valueObj.value){
      if(location.href !== _value){
        location.href = _value;
      }
      this.valueObj.set( _value );
      urlResponder.checkMatch( _value );
    }
  },
  
  onIdle: function(){
    if(!this['valueObj']){return;}
    var _href = location.href;
    if(_href!==this.valueObj.value){
      this.setValue(_href);
    }
  }
});


