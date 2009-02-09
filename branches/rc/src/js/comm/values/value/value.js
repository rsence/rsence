/***  Riassence Core
  ** 
  **  Copyright (C) 2008 Riassence Inc http://rsence.org/
  **  Copyright (C) 2006-2007 Helmi Technologies Inc.
  ** 
  **  This program is free software; you can redistribute it and/or modify it under the terms
  **  of the GNU General Public License as published by the Free Software Foundation;
  **  either version 2 of the License, or (at your option) any later version. 
  **  This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
  **  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
  **  See the GNU General Public License for more details. 
  **  You should have received a copy of the GNU General Public License along with this program;
  **  if not, write to the Free Software Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
  ***/

/*** class: HValue
  **
  ** Data that needs to be syncronized between components or remote clients should be implemented as HValues.
  ** If client-side validation and type-checking is needed, it should be implemented by subclassing HValue.
  **
  ** vars: Instance variables
  **  id - Value Id, used by the whole value management system to identify individual values.
  **  type - '[HValue]'
  **  value - The container/"payload" data value itself.
  **  views - A list of Components that uses this value. 
  **          Used for automatic value syncronization between components.
  **
  ** Usage example:
  **  > var myApp = new HApplication(100);
  **  > var mySlider = new HSlider(new HRect(100,100,300,118),myApp,1.0,0.0,200.0);
  **  > mySlider.draw();
  **  > var myValue = new HValue(123,100.0);
  **  > myValue.bind(mySlider);
  **
  ** See also:
  **  <HValueManager> <HControl>
  ***/


HValue = HClass.extend({
/** constructor: constructor
  *
  * Parameters:
  *   _id - The source id (ideally set by server, should be unique)
  *   _value - The initial data 
  **/
  constructor: function(_id,_value){
    this.id    = _id;
    this.type  = '[HValue]';
    this.value = _value;
    this.views = [];
    HValueManager.add(_id,this);
  },
  
/** method: set
  * 
  * Replaces the data of the value. Extend this, if you need validation etc.
  *
  * Parameters:
  *  _value - The new data to replace the old data with.
  *
  * See also:
  *  <HControl.setValue> <HValueManager.set>
  **/
  set: function(_value){
    if(_value != this.value){
      this.value = _value;
      HValueManager.changed(this);
      this.refresh();
    }
  },
  
/** method: s
  * 
  * Just as <set>, but doesn't re-notify the server about the change.
  *
  **/
  s: function(_value){
    this.value = _value;
    this.refresh();
  },
  
/** method: get
  *
  * Return the data, synonymous to the <value> instance variable
  *
  * Returns:
  *  The value instance variable (the data "payload")
  *
  * See also:
  *  <HValue.value>
  **/
  get: function(){
    return this.value;
  },
  
/** method: bind
  *
  * Bind a component to the value, use to attach HValues to components derived from HControl.
  *
  * Parameters:
  *  _viewObj - Any component that is derived from HControl *or* any class 
  *             that responds to setValueObj and setValue methods.
  *
  * See also:
  *  <unbind> <HControl.setValueObj>
  *
  **/
  bind: function(_viewObj){
    if(_viewObj===undefined){
      throw("HValueBindError: _viewObj is undefined!");
    }
    //if(this.views.indexOf(_viewObj)==-1){
      this.views.push(_viewObj);
      _viewObj.setValueObj( this );
    //}
  },
  
/** method: unbind
  *
  * Detach a component bound to this value.
  *
  * Parameters:
  *  _viewObj - Any component that is derived from HControl *or* any class 
  *             that responds to setValueObj and setValue methods.
  *
  * See also:
  *  <bind>
  *
  **/
  unbind: function(_viewObj){
    for(var _viewNum=0;_viewNum<this.views.length;_viewNum++){
      var _tryObj = this.views[_viewNum];
      if(_tryObj===_viewObj){
        this.views.splice(_viewNum);
        return;
      }
    }
  },
  
  release: function(_viewObj){
    return this.unbind(_viewObj);
  },
  
/** method: refresh
  *
  * Calls the setValue method all components bound to this HValue.
  *
  * See also:
  *  <HControl.setValue>
  **/
  refresh: function(){
    for(var _viewNum=0;_viewNum<this.views.length;_viewNum++){
      var _viewObj = this.views[_viewNum];
      if(_viewObj.value != this.value){
        if(!_viewObj._valueIsBeingSet){
          _viewObj._valueIsBeingSet=true;
          _viewObj.setValue( this.value );
          _viewObj._valueIsBeingSet=false;
        }
      }
    }
  },
  
  _formatType: function(_sync_value){
    var _syncjstype = (typeof _sync_value).slice(0,1);
    if (_syncjstype == 's'){ // string
      return ['s', SHA.str2Base64( _sync_value )];
    }
    else if (_syncjstype == 'n'){ // number
      if (Math.ceil(_sync_value) === Math.floor(_sync_value)) {
        return ['i',parseInt(_sync_value,10).toString()];
      }
      else {
        return ['f',parseFloat(_sync_value).toString()];
      }
    }
    return [ _syncjstype, _sync_value ];
  },
  
/** method: toXML
  *
  * Responsible for generating the xml representation of the value object.
  *
  * Parameter:
  *  _i - The sequence number of the item, generated by HValueManager.
  *
  * Returns:
  *  A XML string with meta-info about the object
  *
  * See Also:
  *  <HValueManager.toXML>
  *
  * Samples:
  * > <b id="xyz">1</b>'
  * > <b id="xyz">0</b>'
  * > <f id="xyz">123.321</f>'
  * > <i id="xyz">123</i>'
  * > <s id="xyz">c3RyaW5nAAA=</s>'
  * > <a id="xyz">WzEsImZvbyIse2ZvbzoiYmFyIn1d</a>
  **/
  toXML: function(_i){
    var _syncid = this.id.toString(),
        _sync_value = this.value,
        _formatted = this._formatType( _sync_value ),
        _syncjstype = _formatted[0],
        _extra_attr = '',
        _sync_esc_value = _formatted[1];
    
    if (_syncjstype == 'b'){ // boolean
      if(_sync_value){
        _sync_esc_value='1';
      }
      else{
        _sync_esc_value='0';
      }
    }
    else if (_syncjstype == 'o' && (_sync_value instanceof Array)){ // array (only flat arrays supported)
      _syncjstype = 'a';
      _extra_attr = ' len="'+_sync_value.length+'"';
      _sync_esc_value = '[';
      var i = 0,
          _data_at_idx,
          _data,
          _type;
      for(;i<_sync_value.length;i++){
        _data_at_idx = this._formatType(_sync_value[i]);
        _type = _data_at_idx[0];
        _data = _data_at_idx[1];
        if( _type == 'i' || _type == 'f' || _type == 'b' ){
          _sync_esc_value += _data;
        }
        else if(_type == 's'){
          _sync_esc_value += '"'+_data+'"';
        }
        else {
          try{
            console.log('unsupported array value error');
            console.log('  syncid:',_syncid);
            console.log('  typeof:',(typeof _data));
            console.log('  syncvalue:',_data);
          }
          catch(e){
            alert('unsupported array value error, syncid:'+_syncid+' typeof:'+(typeof _data)+' syncvalue:'+_data);
          }
          return '';
        }
        if( i+1 != _sync_value.length ){
          _sync_esc_value += ',';
        }
      }
      _sync_esc_value += ']';
    }
    else if (_syncjstype != 'i' && _syncjstype != 'f' && _syncjstype != 's') {
      try{
        console.log('syncvalue type error');
        console.log('  syncid:',_syncid);
        console.log('  syncjstype:',_syncjstype);
        console.log('  typeof:',(typeof _sync_value));
        console.log('  syncvalue:',_sync_value);
      }
      catch(e){
        alert('value error, syncid:'+_syncid+' syncjstype:'+_syncjstype+' typeof:'+(typeof _sync_value)+' syncvalue:'+_sync_value);
      }
      return '';
    }
    
    return '<'+_syncjstype+' id="'+_syncid+'"'+_extra_attr+'>'+_sync_esc_value+'</'+_syncjstype+'>';
  }
  
});


