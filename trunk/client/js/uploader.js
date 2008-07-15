
HUploader = HControl.extend({
  componentName: 'uploader',
  constructor: function(_rect,_parent,_options){
    this.base(_rect,_parent,_options);
  },
  draw: function(){
    var _isDrawn = this.drawn;
    this.base();
    if(!_isDrawn){
      this.drawMarkup();
    }
  }
});
