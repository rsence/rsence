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

/*** class: HTextControl
  **
  ** HTextControl is a control unit that represents an editable input line of text. 
  ** Commonly, textcontrol is used as a single text field in the request forms. 
  ** HTextControl view or theme can be changed; the helmiTheme is used by default.
  **
  ** vars: Instance variables
  **  type - '[HTextControl]'
  **  value - The string that is currently held by this object.
  **
  ** Extends:
  **  <HControl>
  **
  ** See also:
  **  <HControl>
  ***/
HTextControl = HControl.extend({
  
  componentName: "textcontrol",

/** constructor: constructor
  *
  * Parameters:
  *   _rect - An <HRect> object that sets the position and dimensions of this control.
  *   _parentClass - The parent view that this control is to be inserted in.
  *   _options - (optional) All other parameters. See <HComponentDefaults>.
  **/
  constructor: function(_rect, _parentClass, _options) {
    this.styleDefaults();
    this.base(_rect, _parentClass, _options);
    this.setTextEnter(true);
  },
  
  styleDefaults: function(){
    // replace with integer pixel offsets in the template, if used.
    // [-2,-2,-2,-2] for -2px offsets on each edge (left, top, right, bottom)
    // these are used for re-calculating the size of the input element
    this.inputFieldOffsets = false;
    
  },
  
  onIdle: function(){
    this.base();
    if(this['markupElemIds']!==undefined){
      if(this.markupElemIds.value) {
        if(this.inputFieldOffsets){
          var _size   = ELEM.getSize(this.elemId),
              _width  = _size[0],
              _height = _size[1],
              _left   = this.inputFieldOffsets[0],
              _top    = this.inputFieldOffsets[1],
              _right  = this.inputFieldOffsets[2],
              _bottom = this.inputFieldOffsets[3],
              _input  = this.markupElemIds.value,
              _inputWidth = (_width-_right-_left),
              _inputHeight = (_height-_bottom-_top);
          
          ELEM.setStyle(_input,'left',_left+'px');
          ELEM.setStyle(_input,'top',_right+'px');
          ELEM.setStyle(_input,'width',_inputWidth+'px');
          ELEM.setStyle(_input,'height',_inputHeight+'px');
          
          if(BROWSER_TYPE.safari){
            ELEM.setStyle(_input,'line-height',(_inputHeight)+'px');
          }
          
        }
      }
    }
    
  },
  
/** method: setEnabled
  * 
  * Enables/disables the actual text control in addition to changing the look of
  * the field.
  * 
  * Parameters:
  *   _flag - True to enable, false to disable.
  *
  * See also:
  *  <HControl.setEnabled>
  **/
  setEnabled: function(_flag) {
    this.base(_flag);
    if(this['markupElemIds']===undefined){return;}
    if(this.markupElemIds.value) {
      ELEM.setAttr(this.markupElemIds.value,'disabled',!this.enabled);
    }
  },
  
  refreshValue: function(){
    if(this.markupElemIds){
      if(this.markupElemIds.value){
        ELEM.get(this.markupElemIds.value).value = this.value;
      }
    }
  },
  
  textEnter: function(){
    if(this['markupElemIds']===undefined){return;}
    var _value = ELEM.get(this.markupElemIds.value).value;
    if(_value != this.value){
      this.setValue(_value);
    }
  }
  
});

