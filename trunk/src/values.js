/**
  *  Helmi RIA Platform
  *  Copyright (C) 2006-2007 Helmi Technologies Inc.
  *  
  *  This program is free software; you can redistribute it and/or modify it under the terms
  *  of the GNU General Public License as published by the Free Software Foundation;
  *  either version 2 of the License, or (at your option) any later version. 
  *  This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
  *  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
  *  See the GNU General Public License for more details. 
  *  You should have received a copy of the GNU General Public License along with this program;
  *  if not, write to the Free Software Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
  **/

/** class: HTransporter
  *
  * *Simple mid-level AJAX communication system.*
  *
  * Uses prototype.js to do the low-level work).
  *
  * Designed as single instance, depends on <HValueManager>.
  *
  * When implementing the server part:
  *  - feed it with raw javascript
  *  - override ses_id as early as possible with your own session id, this tells the clients apart.
  *  - change the syncDelay depending on how fast you want the client to poll the server (a value in ms)
  *  - you may refer to 't' as the HTransporter's namespace.
  *
  * Sample initialization sequence:
  * > t.ses_id = 'nhHOZ8Zo64Wfo';
  * > t.syncDelay = 400;
  * > t.url_base = '/phase2';
  *
  * See Also:
  *  <HValueManager.toXML>
  **/

/* int: HTransportURL
 *
 * Tells the <HTransporter> which url/path to start polling.
 * - "global"
 * - Override it with your server's path or url before the document is loaded.
 */
HTransportURL = false;

/* int: HTransportPoll
 *
 * Tells the <HTransporter> whether to use polling (true) or to sync values only
 * when there's something on the client-side to sync (false).
 * - "global"
 * - Defaults to true (polling), override it with false before the document is
 *   loaded if you don't want polling.
 */
HTransportPoll = true;

/* vars: Instance variables
 *  url_base  - The URL (or path) that the requests are sent to
 *  ses_id    - A value that is the reported in each request by the key 'ses_id'
 *  syncDelay - An integer value (in ms) that the client waits before starting the next request
 */

HTransporter = Base.extend({
  
  constructor: null,
  
  start: function(_url_base){
    this.url_base  = _url_base;
    this.ses_id    = 0;
    this.err_msg   = '';
    this.isBusy    = false;
    this.syncNum   = 0;
    this.syncDelay = 0;
    this.pollMode  = HTransportPoll;
    this.req_timeout = setTimeout('HTransporter.sync();',this.syncDelay);
  },
  
  setPollMode: function(_flag) {
    this.pollMode = _flag;
  },
  
  failure: function(resp){
    alert('HTTP ERROR! STOP.');
    clearTimeout(this.req_timeout);
    this.isBusy = true;
  },
  
  respond: function(resp){
    var t = HTransporter;
    try {
      t.err_msg = '';
      HVM.isGetting=true;
      eval(resp.responseText); 
      HVM.isGetting=false;
    } catch(e) {
      t.err_msg = '&err_msg='+e;
    }
    t.isBusy = false;
  },
  
  sync: function(){
    var valid_delay = ((this.syncDelay&&this.syncDelay>0)||this.syncDelay==0);
    // Negative syncDelay stops transporter.
    if(valid_delay && this.url_base){
      if(!this.isBusy){
        this.isBusy = true;
        var _syncData = HValueManager.toXML();
        
        if ("" != _syncData || this.pollMode) {
          
          this.syncNum++;
          req_args = {
            onSuccess: function(resp){HTransporter.respond(resp);},
            onFailure: function(resp){HTransporter.failure(resp);},
            method:    'post',
            postBody:  'ses_id='+HTransporter.ses_id+HTransporter.err_msg+_syncData
          };
          this.req  = new Ajax.Request( this.url_base, req_args );
        }
        else {
          this.isBusy = false;
        }

      }
      this.req_timeout = setTimeout('HTransporter.sync();',this.syncDelay);
    }
  },
  
  stop: function() {
    clearTimeout(this.req_timeout);
  }
  
});

onloader("HTransporter.start(HTransportURL);");

/** class: HValueManager
  *
  * *Simple value syncronization system.*
  * 
  * Designed as single instance, depends on <HValue> and <HControl>.
  *
  * The system relies heavily on <HValue> instances.
  * It allows easy value syncronization between the server and client components.
  * <HTransporter> makes <toXML> calls whenever it's making a server poll to send
  * changed data to the server as XML, accessable by the 'HSyncData' request key.
  *
  * See Also:
  *  <HValue> <HTransporter> <HControl>
  *
  * Simple usage example:
  *  > var myApp = new HApplication(100);
  *  > var myTextCtrl1 = new HTextControl(new HRect(100,100,356,118),myApp,'',"Hello, I'm a textcontrol!");
  *  > myTextCtrl1.draw();
  *  > var myTextCtrl2 = new HTextControl(new HRect(120,100,356,138),myApp,'',"Hi, I'm also a textcontrol!");
  *  > myTextCtrl2.draw();
  *  > var myNewHValue = new HValue('foo123', "Hi, I am an example value.");
  *  > myNewValue.bind( myTextCtrl1 );
  *  > myNewValue.bind( myTextCtrl2 );
  *  > HValueManager.set('foo123',"Hi, I am the new replacement value!");
  *  > var myXMLChanged = HValueManager.toXML();
  **/

HValueManager = HClass.extend({
  constructor: null,
  
/** vars: Instance variables
  *
  * values - Array, contains all values currently managed, accessible by <HValue> id:s
  * tosync - Array, contains changed values that need to be reported to the remote side via <HTransporter>
  * isSending - flag, is set to true when <HTransporter> is busy.
  *
  **/
  values: [],
  tosync: [],
  isSending: false,
  isGetting: false,
  
/*** method: add
  ** 
  ** Adds a new <HValue> bound to the value of id into the value index of <HValueManager>.
  ** These values will then then be automatically syncronized between components
  ** and other compatible instances, like server-side value management. Most
  ** likely to be called from inside a <HValue> constructor.
  **
  ** Parameters:
  **  _id - An id for the value, doesn't really matter at the client-side as long as it is unique. Matters for server-side. Could be int or str, depending on the server implementation.
  **  _obj - A <HValue> object instance, usually *this* inside constructors of <HValue>-compatible classes.
  **
  ** See also:
  **  <set> <del> <HValue.constructor>
  ***/
  add: function(_id,_obj){
    this.values[_id] = _obj;
  },
  
/*** method: set
  **
  ** Sets a new *container value* to the <HValue> object by calling the bound <HValue> by its id.
  **
  ** Parameters:
  **  _id - The <HValue>-instance id to be modified.
  **  _value - The container value (NOT a <HValue>)
  **
  ** See also:
  **  <add> <del> <HValue.set> <HControl.setValue>
  ***/
  set: function(_id,_value){
    this.values[_id].set(_value);
  },
  
/*** method: del
  **
  ** Deletes the <HValue> by id from the value management system.
  **
  ** Parameters:
  **  _id - The <HValue>-instance id to be deleted.
  **
  ** See also:
  **  <add> <set> <HValue>
  ***/
  del: function(_id){
    var _thisVal  = this.values[_id];
    var _valViews = _thisVal.views;
    for(var _viewNum=0;_viewNum<_valViews.length;_viewNum++){
      var _thisView = _valViews[_viewNum];
      _thisView.valueObj = new HDummyValue(0,_thisVal.value);
    }
    this.values[_id] = null;
  },
  
/*** method: changed
  **
  ** Reports the <HValue> to <HValueManager> as a changed object.
  ** It adds a reference to the <HValue>, unless the value is changed via <HTransporter>.
  ** 
  ** There is no need to call it manually, except when creating a new <HValue> -compatible
  ** object from the scratch. Value-classes call changed whenever the change needs
  ** to be reported elsewhere.
  **
  ** Parameters:
  **  _theObj - The <HValue> -instance object to list as changed.
  **
  ** See also:
  **  <isGetting> <tosync> <set>
  ***/
  changed: function(_theObj){
    if(this.isGetting==false){
      if(this.tosync.indexOf(_theObj.id)==-1){
        this.tosync.push(_theObj.id);
      }
    }
  },
  
/*** method: toXML
  **
  ** Outputs all changed values to XML.
  **
  ** See also:
  **  <HTransporter>
  ***/
  toXML: function(){
    var _postBody = '&HSyncData=';
    if(!this.isSending){
      this.isSending = true;
      var _synclen = this.tosync.length;
      if(_synclen==0){
        this.isSending = false;
        return '';
      }
      var _syncvalueArr = [];
      for(var _i=0;_i<_synclen;_i++){
        var _syncid = this.tosync.shift();
        var _syncobj = this.values[_syncid];
        _syncvalueArr.push( _syncobj.toXML(_i) );
      }
      var _syncvalues = _syncvalueArr.join('');
      _postBody += '<hsyncvalues version="2240" length="'+_synclen+'">'+_syncvalues+'</hsyncvalues>';
      this.isSending = false;
    }
    return _postBody;
  },
  
  // Backwards-compatibility:
  output: function(){
    return this.toXML();
  }
});

// HVM is a shortcut to HValueManager
HVM = HValueManager;
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
    if(this.views.indexOf(_viewObj.elemId)==-1){
      this.views.push(_viewObj);
      _viewObj.setValueObj( this );
    }
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
  * > <hvalue id="996" order="30" jstype="boolean" length="4">true</hvalue>'
  * > <hvalue id="997" order="31" jstype="number" length="7">123.321</hvalue>'
  * > <hvalue id="998" order="32" jstype="object" length="5">1,2,3</hvalue>'
  * > <hvalue id="999" order="33" jstype="string" length="16">&lt;b&gt;Bold Text&lt;/b&gt;</hvalue>'
  **/
  toXML: function(_i){
    var _syncid = this.id;
    var _synctype = this.type.slice(1,-1).toLowerCase();
    var _syncvalue = this.value;
    var _syncjstype = typeof _syncvalue;
    var _syncescvalue = _syncvalue.toString();
    
    _syncescvalue = _syncescvalue.replace( /&/g, '&amp;');
    _syncescvalue = _syncescvalue.replace( /</g, '&lt;' );
    _syncescvalue = _syncescvalue.replace( />/g, '&gt;' );
    
    
    // Percent sign must be escaped, otherwise it is used as an escape
    // character.
    _syncescvalue = _syncescvalue.replace( /%/g, '%25' );
    // Ampersand is the parameter separator in HTTP POST, so we need to encode
    // them in order to get the escaped characters to work.
    _syncescvalue = _syncescvalue.replace( /&/g, '%26' );
    
    
    /* if (_syncjstype == "string") {
      _syncescvalue = escape(_syncescvalue);
    } */
    
    return '<'+_synctype+' id="'+_syncid+'" order="'+_i+'" jstype="'+_syncjstype+'" length="'+_syncvalue.toString().length+'">'+_syncescvalue+'</'+_synctype+'>';
  }
  
});


/** class: HControlValue
  *
  **/
HControlValue = HValue.extend({
  
/** constructor: constructor
  *
  * Parameters:
  *  _id - See <HValue.constructor>
  *  _value - The value itself. See <HValue.constructor>
  *
  **/
  constructor: function(_id,_value){
    this.validate(_value);
    // default values
    this.label = (_value.label !== undefined) ? _value.label : "Untitled";
    if (_value.value === undefined) {
      _value.value = 0;
    }
    this.enabled = (_value.enabled !== undefined) ? _value.enabled : true;
    this.active = (_value.active !== undefined) ? _value.active : false;
    this.base(_id,_value.value);
    this.type = '[HControlValue]';
  },

  
/** method: validate
  *
  * Simple value validation
  *
  * Parameters:
  *  _value - The data to validate
  *
  **/
  validate: function(_value){
    //alert((typeof _value));
    if(typeof _value != "object"){
      throw('ControlValueError: ControlValue must be an object');
    }
  },
  
/** method: set
  *
  **/
  set: function(_value){
    // Fix to ValueMatrix --> better ideas?
    if (typeof _value == "boolean") {
      var _temp = _value;
      _value = {};
      _value.value = _temp;
      
    }
    this.validate(_value);
    // default values    
    this.label = (_value.label !== undefined) ? _value.label : this.label;
    if (_value.value === undefined) {
      _value.value = this.value;
    }
    this.enabled = (_value.enabled !== undefined) ? _value.enabled : this.enabled;
    this.active = (_value.active !== undefined) ? _value.active : this.active;
    
    this.base(_value.value);
  },
  
/** method: setLabel
  *
  **/
  setLabel:   function(_label){
     this.set({label:_label});
  },
  
/** method: setValue
  *
  **/
  setValue:   function(_value){
    this.set({value:_value});
  },
  
/** method: setEnabled
  *
  **/
  setEnabled:   function(_enabled){
    this.set({enabled:_enabled});
  },
  
/** method: setActive
  *
  **/
  setActive:   function(_active){
    this.set({active:_active});
  },
  
  bind: function(_viewObj){
    this.base(_viewObj);
    if(this.views.indexOf(_viewObj.elemId)==-1){
      this.views.push(_viewObj);
      _viewObj.setLabel( this.label );
      _viewObj.setEnabled( this.enabled );
      //_viewObj.setActive( this.active );
    }
  },
/** method: refresh
  *
  * Calls the setValue method all components bound to this HControlValue.
  *
  * See also:
  *  <HControl.setValue>
  **/
  refresh: function(){
    this.base();
    for(var _viewNum=0;_viewNum<this.views.length;_viewNum++){
      var _viewObj = this.views[_viewNum];
      if(_viewObj.value != this.value){
        if(!_viewObj._valueIsBeingSet){
          _viewObj._valueIsBeingSet=true;
          _viewObj.setLabel( this.label );
          _viewObj.setEnabled( this.enabled );
          //_viewObj.setActive( this.active );
          _viewObj._valueIsBeingSet=false;
        }
      }
    }
  },
  
/** method: toXML
  *
  * Generates an XML description of the menuitem.
  *
  * Parameter:
  *  _i - The sequence number of the item, generated by HValueManager.
  *
  * Returns:
  *  An XML string with the date as specified
  *
  * See Also:
  *  <HValue.toXML> <HValueManager.toXML>
  *
  * Sample:
  * > <menuitem id="menuitem:215" order="1"><label>hello</label><value>0</value><enabled>true</enabled><active>false</active></menuitem>
  **/
  toXML: function(_i){
    var _syncid = this.id;
    return '<controlvalue id="'+_syncid+'" order="'+_i+'"><label>'+this.label+'</label><value>'+this.value+'</value><enabled>'+this.enabled+'</enabled><active>'+this.active+'</active></controlvalue>';
  }
});

HValueMatrixComponentExtension = {
  setValueMatrix: function(_aValueMatrix){
    this.valueMatrix = _aValueMatrix;
    this.valueMatrixIndex = this.valueMatrix.addValue(this.valueObj,this.value);
  },
  
  mouseDown: function(_x,_y,_isLeftButton){
    if (this.valueMatrix instanceof HValueMatrix) {
      this.valueMatrix.setValue( this.valueMatrixIndex );
    } else {
      this.setValue(!this.value);
    }
  },
  
  mouseUp: function(_x,_y,_isLeftButton){
    if (this.valueMatrix instanceof HValueMatrix) {
      this.valueMatrix.setValue( this.valueMatrixIndex );
    } else {
      this.setValue(!this.value);
    }
  }
};

HValueMatrix = HClass.extend({
  constructor: function(){
    // An array to hold member components
    this.values = [];
    // The index of the value member chosen
    this.value = -1;
  },
  
  setValueObj: function(_aValueObj){
    this.valueObj = _aValueObj;
    this.setValue(this.valueObj.value);
  },
  
  setValue: function(_index){
    if(_index != this.value){
      // Set the previous value object to false (reflects to its container component(s))
      if(this.value != -1){
        this.values[this.value].set(false);
      }
    
      if(_index != -1){
        // Store the new index as the currently active value
        this.valueObj.set(_index);
        this.value = _index;
      
        // Set the new value object to true (reflects to its container component(s))
        this.values[this.value].set(true);
      }
    }
  },
  
  addValue: function(_aValueObject, _selectIt) {
    this.values.push(_aValueObject);
    var _newIndex = this.values.length-1;
    if(_selectIt){
      this.setValue(_newIndex);
    }
    return _newIndex;
  }
});
