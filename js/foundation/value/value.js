/*   RSence
 *   Copyright 2006 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

/*** = Description
  ** Data value synchonization container object.
  **
  ** +HValue+ is the default class to use for data syrchronization purposes.
  ** It's smart enough to tell COMM.Values (Value Manager) that it has
  ** been changed.
  **
  ** A single HValue instance can be bound to any number of responders, the
  ** main client-side responder class is +HControl+.
  **
  ** When you change the value in one of the instances bound to the HValue
  ** instances, all other instances get notified too and the server is also
  ** notified and can be further bound on the server side to any number of
  ** responders there too.
  **
  ** An instance constructed with "false" (Boolean) as its id is not reported
  ** to the server. Such an instance can be used for client-side responder
  ** synchronization.
  **
  ** Priority-wise, only the server can create a value id. If a value id is
  ** created on the client, the server won't recognize nor accept it.
  **
  ** If a value is changed on the server, it overrides the changes on
  ** the client, so no server-client lock is needed in this model.
  **
  ** = Instance variables:
  **  +id+::     Value Id, used by the whole value management system to identify individual values.
  **  +type+::   '[HValue]'
  **  +value+::  The container/"payload" data value itself.
  **  +views+::  A list of Components that uses this value. 
  **             Used for automatic value syncronization between responders.
***/
var//RSence.Foundation
HValue = HClass.extend({
  
/** = Description
  * Constructs a value with the initial value +_value+ and the unique id +_id+.
  *
  * Only the server can create value id's, so use false when constructing
  * from the client. A value with a false id is not reported to the server.
  *
  * = Parameters
  * +_id+::     The source id (ideally set by server, should be unique)
  * +_value+::  The initial data 
  *
  **/
  constructor: function(_id,_value){
    this.id    = _id;
    this.value = _value;
    this.views = [];
    if(_id){
      COMM.Values.add(_id,this);
    }
  },
  
/** Destructor method. Releases all bindings.
  **/
  die: function(){
    for(var _viewNum=0;_viewNum<this.views.length;_viewNum++){
      var _tryObj = this.views[_viewNum];
      _tryObj.setValueObj( HDummyValue.nu() );
      this.views.splice(_viewNum,1);
    }
    if(this.id){
      COMM.Values.del(this.id);
    }
  },
  
/** = Description
  * Replaces the data of the value.
  *
  * Extend this method, if you want client-side validation in the value itself.
  *
  * = Parameters
  * +_value+::  The new data to replace the old data with.
  *
  **/
  set: function(_value){
    if(this.differs(_value)){
      this.value = _value;
      if(this.id){
        COMM.Values.changed(this);
      }
      this.refresh();
    }
  },
  
/** Compares +_value+ with +self.value+.
  * = Returns
  * true or false, depending on the equality
  **/
  differs: function(_value){
    return (COMM.Values.encode(_value) !== COMM.Values.encode(this.value));
  },
  
/** = Description
  * Setter for the server.
  * 
  * Just as +self.set+, but doesn't re-notify the server about the change.
  **/
  s: function(_value){
    this.value = _value;
    this.refresh();
  },
  
/** = Description
  * Return the data, returns the +self.value+ instance variable
  *
  * Returns:
  *  The value instance variable (the data "payload")
  **/
  get: function(){
    return this.value;
  },
  
/** = Description
  * Bind a responder to the value, use to attach HValues to responders derived from HControl.
  *
  * = Parameters
  * +_responder+::   Any responder that is derived from HControl or any other 
  *                  class instance that implements HValueResponder or has
  *                  compatible typing.
  **/
  bind: function(_responder){
    if(_responder===undefined){
      throw("HValueBindError: responder is undefined!");
    }
    if(!~this.views.indexOf(_responder)){
      this.views.push(_responder);
      _responder.setValueObj( this );
    }
  },
  
/** = Description
  * Release a responder bound to the HValue instance itself.
  *
  * = Parameters
  * +_responder+::   Any responder that is derived from HControl or any other 
  *                  class instance that implements HValueResponder or has
  *                  compatible typing.
  **/
  unbind: function(_responder){
    for(var _viewNum=0;_viewNum<this.views.length;_viewNum++){
      var _tryObj = this.views[_viewNum];
      if(_tryObj===_responder){
        this.views.splice(_viewNum,1);
        return;
      }
    }
  },

/** Alias of +self.unbind+, opposite of +bind+.
  **/
  release: function(_responder){
    return this.unbind(_responder);
  },
  
/** Calls the setValue method all responders bound to this HValue.
  **/
  refresh: function(){
    for(var _viewNum=0;_viewNum<this.views.length;_viewNum++){
      var _responder = this.views[_viewNum];
      if(_responder.value !== this.value){
        if(!_responder._valueIsBeingSet){
          _responder._valueIsBeingSet=true;
          _responder.setValue( this.value );
          _responder._valueIsBeingSet=false;
        }
      }
    }
  }
  
});


