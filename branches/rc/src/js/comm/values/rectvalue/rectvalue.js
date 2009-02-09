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

/*** class: HRectValue
  **
  ** This is a special type of HValue. It works as a syncronized HRect class and can be used for automatic value syncronization between components.
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


HRectValue = HRect.extend({
/** constructor: constructor
  *
  * Parameters:
  *   _id - The source id (ideally set by server, should be unique)
  *   _value - The initial data 
  **/
  constructor: function(){
    this.type  = '[HRectValue]';
    var _id, _value; // Let's guess these later..
    var _args=arguments;
    
    if (_args.length === 0) {
      throw "Invalid number of arguments. HRectValue works as HRect, but needs an id as the first argument.";
    } else if (_args.length == 1) {
      _id = _args[0];
      this._constructorDefault();
    } else if (_args.length == 5) {
      _id = _args[0];
      this._constructorSides(_args[1],_args[2],_args[3],_args[4]);
    }
    else if (_args.length == 3) {
      _id = _args[0];
      this._constructorPoint(_args[1],_args[2]);
    }
    else if (_args.length == 2) {
      _id = _args[0];
      if((_args[1] instanceof HRect) || (args[1] instanceof HRectValue)){
        this._constructorRect(_args[1]);
      } else if (_args[1] instanceof Array){
        this._constructorArray(_args[1]);
      } else {
        throw "Invalid argument. Expected Array or Rect.";
      }
    }
    else {
      throw "Invalid number of arguments.";
    }
    _value = [this.left,this.top,this.right,this.bottom];
    
    this.id    = _id;
    this.value = _value;
    this.views = [];
    
    this.updateSecondaryValues();
    
    HValueManager.add(_id,this);
  },
  
  updateSecondaryValues: function(){
    this.base();
    if(this._checkChange()){
      this.value[0] = this.left;
      this.value[1] = this.top;
      this.value[2] = this.right;
      this.value[3] = this.bottom;
      this.refresh();
    }
  },
  
  _constructorArray: function(_arr) {
    this.left = _arr[0];
    this.top = _arr[1];
    this.right = _arr[2];
    this.bottom = _arr[3];
  },
  
  _checkChange: function(){
    if( (this.left != this.value[0]) || (this.top  != this.value[1]) || 
        (this.right != this.value[2]) || (this.bottom != this.value[3]) ){
      HValueManager.changed(this);
      this.refresh();
      return true;
    }
    return false;
  },
  
/** method: set
  * 
  * Replaces the data of the value. Extend this, if you need validation etc.
  *
  * Parameters:
  *  _value - The new data to replace the old data with.
  *
  * See also:
  *  <HRect.set> <HValue.set> <HView.setRect> <HValueManager.set>
  **/
  set: function(){
    var _args = arguments;
    if(_args.length == 1) {
      
      if((_args[0] instanceof HRect) || (_args[0] instanceof HRectValue)) {
        this._constructorRect(_args[0]);
      } else if (_args[0] instanceof Array) {
        this._constructorArray(_args[0]);
      }
      
    } else {
      this.base.apply(this, _args);
    }
    this._checkChange();
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
  * Bind a component to the value, use to attach HRectValues to components derived from HView.
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
    if(this.views.indexOf(_viewObj.elemId)==-1){
      this.views.push(_viewObj);
      if(_viewObj.rect !== this){
        _viewObj.setRect( this );
      }
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
  *  <HControl.drawRect>
  **/
  refresh: function(){
    for(var _viewNum=0;_viewNum<this.views.length;_viewNum++){
      var _viewObj = this.views[_viewNum];
      _viewObj.drawRect();
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
  * Sample output:
  * > <rect id="1000" order="34"><left>100</left><top>100</top><right>740</right><bottom>580</bottom></rect>
  **/
  toXML: function(_i){
    return '<rect id="'+this.id+'" order="'+_i+'"><left>'+this.left+'</left><top>'+this.top+'</top><right>'+this.right+'</right><bottom>'+this.bottom+'</bottom></rect>';
  }
  
});


