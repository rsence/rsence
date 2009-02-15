/**
  * Riassence Core -- http://rsence.org/
  *
  * Copyright (C) 2008 Juha-Jarmo Heinonen <jjh@riassence.com>
  * Copyright (C) 2006 Helmi Technologies Inc.
  *
  * This file is part of Riassence Core.
  *
  * Riassence Core is free software: you can redistribute it and/or modify
  * it under the terms of the GNU General Public License as published by
  * the Free Software Foundation, either version 3 of the License, or
  * (at your option) any later version.
  *
  * Riassence Core is distributed in the hope that it will be useful,
  * but WITHOUT ANY WARRANTY; without even the implied warranty of
  * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  * GNU General Public License for more details.
  *
  * You should have received a copy of the GNU General Public License
  * along with this program.  If not, see <http://www.gnu.org/licenses/>.
  *
  **/

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
  values: {},
  tosync: [],
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
  
  s: function(_id,_value){
    this.values[_id].s(_value);
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
    var _thisVal  = this.values[_id],
        _valViews = _thisVal.views,
        _viewNum  = 0,
        _thisView = null;
    for(;_viewNum<_valViews.length;_viewNum++){
      _thisView = _valViews[_viewNum];
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
    if(this.tosync.indexOf(_theObj.id)===-1){
      this.tosync.push(_theObj.id);
      this.syncDone();
    }
  },
  
  syncDone: function(){
    var _t=HTransporter;
    if((this.tosync.length!=0)&&(!_t.pollMode)){
      _t.reSync();
    }
    //console.log('syncDone:',this.tosync);
  },
  
/*** method: toXML
  **
  ** Outputs all changed values to XML.
  **
  ** See also:
  **  <HTransporter>
  ***/
  toXML: function(){
    var _postBody = '&HSyncData=',
        _syncvalueArr = [],
        i = 0,
        _syncid,
        _syncobj,
        _syncvalues;
    if(this.tosync.length==0){
      return '';
    }
    for(;i<this.tosync.length;i++){
      _syncid = this.tosync.shift();
      _syncobj = this.values[_syncid];
      _syncvalueArr.push( _syncobj.toXML(i) );
    }
    _syncvalues = _syncvalueArr.join('');
    // version: 8000 + rsence.org svn revision at modification time
    _postBody += '<hsyncvalues version="8453">'+_syncvalues+'</hsyncvalues>';
    return _postBody;
  }
});

// HVM is a shortcut to HValueManager
HVM = HValueManager;

