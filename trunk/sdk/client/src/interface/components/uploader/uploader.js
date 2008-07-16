
HUploader = HControl.extend({
  componentName: 'uploader',
  constructor: function(_rect,_parent,_options){
    this.base(_rect,_parent,_options);
  },
  refreshValue: function(){
    console.log('HUploader value: ',this.value);
    if(!(this.value instanceof String)){return;}
    var _statusAndKey = this.value.split(':::');
    if(_statusAndKey.length!=2){
      return;
    }
    var _status = parseInt(_statusAndKey[0],10),
        _key    = _statusAndKey[1];
    if(_status==0){
      ELEM.setAttr(this.markupElemIds.control,'action','/U/'+_key,true);
      ELEM.setAttr(this.markupElemIds.state,'value','',true);
    }
    ELEM.get(this.markupElemIds.value).value=this.valueObj.id;
    if(this.value!==this.label){
      this.setLabel(this.value);
    }
  },
  upload: function(){
    ELEM.setStyle(this.markupElemIds.control,'visibility','hidden');
    ELEM.get(this.markupElemIds.control).submit();
    this.setValue('1:::Upload Started');
    this.setLabel('Uploading...');
  }
});
