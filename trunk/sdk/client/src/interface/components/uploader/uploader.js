
HUploader = HControl.extend({
  refreshOnValueChange: true,
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
  },
  refreshValue: function(){
    ELEM.setAttr(this.markupElemIds.control,'action','/U/'+this.value);
    ELEM.get(this.markupElemIds.value).value=this.valueObj.id;
  }
});
