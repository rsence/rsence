
HUploader = HControl.extend({
  constructor: function(_rect,_parent,_options){
    this.base(_rect,_parent,_options);
  },
  draw: function(){
    this.base();
    this.uploadIframe = ELEM.make(this.elemId,'iframe');
    this.uploadButton = ELEM.make(this.elemId,'input');
    ELEM.setAttr(this.uploadButton,'type','file');
  }
});

