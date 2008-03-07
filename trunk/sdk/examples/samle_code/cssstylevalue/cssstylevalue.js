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


/** class: HCSSStyleValue
  *
  * Totally HValue-compatible, but does not actually involve component values.
  * It works as a style setter. The format is:
  *  HCSSStyleValue.set( 'background-color: #ffffff' )
  *
***/
HCSSStyleValue = HValue.extend({
  constructor: function(_id, _value ){
    this.base( _id, _value );
    this.type  = '[HCSSStyleValue]';
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
    var _style_name = this.value.split(':')[0];
    var _style_value = this.value.split(':')[1];
    for(var _viewNum=0;_viewNum<this.views.length;_viewNum++){
      var _viewObj = this.views[_viewNum];
      if(_viewObj.elemId !== undefined){
        if(!_viewObj._valueIsBeingSet){
          _viewObj._valueIsBeingSet=true;
          _viewObj.setStyle(_style_name, _style_value);
          _viewObj._valueIsBeingSet=false;
        }
      }
    }
  }
  
});
