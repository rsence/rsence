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
  constructor: function(){
    this.label = 'URLResponder';
    this.base();
    this.urlMatchers = [];
    this.urlCallBack = [];
    this.defaultCallBack = null;
    this.prevCallBack = false;
    this.prevMatchStr = '';
    this.valueObj = null;
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
  
  // HValueManager compatibility method, just like in HControl
  setValueObj: function(_valueObj){
    this.valueObj = _valueObj;
  },
  
  // HValueManager compatibility method, just like in HControl
  setValue: function(_value){
    this.valueObj.set(_value);
    var _matchStatus = this.checkMatch(_value);
  }
});
urlResponder = URLResponder.nu();


// URLCatcher sets its associated valueObj to 
// the current value of location.href
//
// - enables URLResponder
// - enables client -> server url reporting
URLCatcher = HApplication.extend({
  
  constructor: function(_url_val_id){
    this.label = 'URLCatcher';
    this.url_hvalue = HVM.values[_url_val_id];
    this.base(1);
    this.url_hvalue.bind(urlResponder);
  },
  
  onIdle: function(){
    var _href = location.href;
    if(_href!==this.url_hvalue.value){
      this.url_hvalue.set(_href);
    }
  }
});


