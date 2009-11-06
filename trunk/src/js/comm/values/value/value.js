/*   Riassence Framework
 *   Copyright 2006 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

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
    if(_id){
      HVM.add(_id,this);
    }
  },
  
  die: function(){
    for(var _viewNum=0;_viewNum<this.views.length;_viewNum++){
      var _tryObj = this.views[_viewNum];
      _tryObj.setValueObj( HDummyValue.nu() );
      this.views.splice(_viewNum,1);
    }
    if(this.id){
      HVM.del(this.id);
    }
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
    if(this.differs(_value)){
      this.value = _value;
      if(this.id){
        COMM.Values.changed(this);
      }
      this.refresh();
    }
  },
  
  differs: function(_value){
    return (COMM.Values.encode(_value) !== COMM.Values.encode(this.value));
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
    if(this.views.indexOf(_viewObj)===-1){
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
        this.views.splice(_viewNum,1);
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
      if(_viewObj.value !== this.value){
        if(!_viewObj._valueIsBeingSet){
          _viewObj._valueIsBeingSet=true;
          _viewObj.setValue( this.value );
          _viewObj._valueIsBeingSet=false;
        }
      }
    }
  }
  
});


