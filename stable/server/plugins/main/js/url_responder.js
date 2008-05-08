
/* Sets the location.href of the _url_val_id value whenever location.href changes.
 */
URLResponder = HApplication.extend({
  
  constructor: function(_url_val_id){
    this.url_hvalue = HVM.values[_url_val_id];
    this.base();
  },
  
  onIdle: function(){
    var _href = location.href;
    if(_href!=this.url_hvalue.value){
      this.url_hvalue.set(_href);
    }
  }
});


