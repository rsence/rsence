/***  HIMLE RIA SYSTEM
  ** 
  **  Copyright (C) 2008 HIMLE GROUP http://himle.sorsacode.com/
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


/** class: HInnerHTMLValue
  *
  * Totally HValue-compatible, but does not actually involve component values,
  * the effective thing is just the html content of the element of the receiver.
  *
  * Also, when constructing, use the source html element reference instead of raw html data.
  * (Might be changed in the future, depending on the feedback..)
  *
***/
HInnerHTMLValue = HValue.extend({
  constructor: function(_id, _elem){
    // Support for the element manager's id's (serial number elemId's)
    if ( typeof _elem == 'number' ){
      this.elemId = _elem;
      _elem = elem_get(this.elemId);
    }
    // Support for strings (gets dom element by the id attribute)
    else if ( typeof _elem == 'string' ){
      this.elemId = elem_bind( _elem );
      _elem = elem_get(this.elemId);
    }
    
    // Support for elemens as is
    else if ( typeof _elem == 'object' ) {
      this.elemId = elem_add( _elem );
    }
    
    var _value = _elem.innerHTML;
    
    this.base( _id, _value );
    this.type  = '[HInnerHTMLValue]';
  },
  
  bind: function(_viewObj){
    if(_viewObj===undefined){
      throw("HValueBindError: _viewObj is undefined!");
    }
    if(this.views.indexOf(_viewObj.elemId)==-1){
      this.views.push(_viewObj);
    }
  },
  
  refresh: function(){
    for(var _viewNum=0;_viewNum<this.views.length;_viewNum++){
      var _viewObj = this.views[_viewNum];
      if(_viewObj.elemId !== undefined){
        if(!_viewObj._valueIsBeingSet){
          _viewObj._valueIsBeingSet=true;
          elem_set( _viewObj.elemId, this.value );
          _viewObj._valueIsBeingSet=false;
        }
      }
    }
  }
  
});
