/*   Riassence Framework
 *   Copyright 2008 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

HUploader = HControl.extend({
  componentName: 'uploader',
  uploadState: false,
  uploadKey: false,
  uploadStateLabels: {
    
    //Upload success states:
     '0': "Select file...",
     '1': "Uploading...",
     '2': "Processing data...",
     '3': "Upload Complete",
     '4': "Preparing upload",
    
    //Upload failure states:
     '-1': "Error: Invalid request",
     '-2': "Error: Invalid upload key",
     '-3': "Error: Invalid data format",
     '-4': "Error: File too big",
     '-6': "Error: Post-processing failed"
  },
  markupElemNames: [
    'form',
    'file',
    'iframe',
    'upload_progress',
    'progress_label',
    'progress_indicator',
    'button',
    'button_label',
    'value',
    'ack_button'
  ],
  setUploadState: function(_state,_uploadKey){
    if(_state!==this.uploadState){
      this.uploadState = _state;
      var _stateKey = _state.toString();
      //console.log('stateKey:',_stateKey);
      if(this.uploadStateLabels[_stateKey]!==undefined){
        ELEM.get(this.markupElemIds.value).value=this.valueObj.id;
        var _label = this.uploadStateLabels[_stateKey];
        //console.log('stateLabel:',_label);
        if(_state===0){
          ELEM.setStyle(this.markupElemIds.upload_progress,'visibility','hidden');
          ELEM.setStyle(this.markupElemIds.progress_indicator,'visibility','hidden');
          ELEM.setStyle(this.markupElemIds.ack_button,'visibility','hidden');
          ELEM.setHTML(this.markupElemIds.button_label,_label);
          ELEM.setStyle(this.markupElemIds.button,'visibility','inherit');
          ELEM.setStyle(this.markupElemIds.form,'visibility','inherit');
          ELEM.setAttr(this.markupElemIds.form,'action','/U/'+_uploadKey,true);
          //console.log('uploadKey:',ELEM.getAttr(this.markupElemIds.form,'action',true));
          ELEM.get(this.markupElemIds.file).value='';
          this.uploadKey = _uploadKey;
        }
        else if(_state===1||_state===2||_state===3||_state===4){
          ELEM.setStyle(this.markupElemIds.upload_progress,'visibility','inherit');
          if(_state===1||_state===2||_state===4){
            ELEM.setStyle(this.markupElemIds.progress_indicator,'visibility','inherit');
            ELEM.setStyle(this.markupElemIds.ack_button,'visibility','hidden');
          }
          else {
            ELEM.setStyle(this.markupElemIds.progress_indicator,'visibility','hidden');
            ELEM.setStyle(this.markupElemIds.ack_button,'visibility','inherit');
          }
          ELEM.setHTML(this.markupElemIds.progress_label,_label);
          ELEM.setStyle(this.markupElemIds.button,'visibility','hidden');
          ELEM.setStyle(this.markupElemIds.form,'visibility','hidden');
          if(_state===1){
            ELEM.get(this.markupElemIds.form).submit();
          }
        }
        else if(_state < 0){
          ELEM.setStyle(this.markupElemIds.progress_indicator,'visibility','hidden');
          ELEM.setStyle(this.markupElemIds.ack_button,'visibility','inherit');
          ELEM.setHTML(this.markupElemIds.progress_label,'<span style="color:red;">'+_label+'</span>');
          ELEM.setStyle(this.markupElemIds.button,'visibility','hidden');
          ELEM.setStyle(this.markupElemIds.form,'visibility','hidden');
        }
      }
    }
  },
  refreshValue: function(){
    if(typeof this.value !== 'string'){return;}
    if(this.value.indexOf(':::')<1){return;}
    var _stateAndKey = this.value.split(':::');
    if(_stateAndKey.length!==2){
      return;
    }
    var _state = parseInt(_stateAndKey[0],10),
        _uploadKey    = _stateAndKey[1];
    this.setUploadState(_state,_uploadKey);
  },
  upload: function(){
    this.setValue('1:::'+this.uploadKey);
  },
  getNewUploadKey: function(){
    this.setValue('4:::'+this.uploadKey);
  },
  click: function(){
    //console.log('click');
    if((this.uploadState===3)||(this.uploadState<0)){
      //console.log('clicked, state=',this.uploadState);
      this.getNewUploadKey();
    }
  }
});
