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
    this.base(_rect, _parentClass, _options);
    this.setTextEnter(true);
  },
  
  refreshLabel: function(){
    if(this['markupElemIds']!==undefined){
      if(this.markupElemIds['label']!==undefined){
        ELEM.setAttr(this.markupElemIds.label,'title',this.label);
      }
    }
  },
  
  drawSubviews: function(){
    if(this['markupElemIds']!==undefined){
      if(this.markupElemIds['label']!==undefined) {
        var _size   = ELEM.getVisibleSize( this.elemId ),
            _width  = _size[0],
            _height = _size[1],
            _input  = this.markupElemIds.value,
            _label  = this.markupElemIds.label;
        if(BROWSER_TYPE.firefox){
          ELEM.setStyle(_input,'padding-top','0px');
          ELEM.setStyle(_input,'padding-left','0px');
          ELEM.setStyle(_label,'left','2px');
          ELEM.setStyle(_label,'top','2px');
          ELEM.setStyle(_label,'right','2px');
          ELEM.setStyle(_label,'bottom','2px');
        }
        else if(BROWSER_TYPE.ie7){
          ELEM.setStyle(_input,'left','2px');
          ELEM.setStyle(_input,'top','2px');
          ELEM.setStyle(_input,'padding-top','0px');
          ELEM.setStyle(_input,'padding-left','0px');
          ELEM.setStyle(_input,'padding-right','8px');
          ELEM.setStyle(_input,'padding-bottom','0px');
          ELEM.setStyle(_input,'width',(_width-4)+'px');
          ELEM.setStyle(_input,'height',(_height-4)+'px');
          ELEM.setStyle(_label,'left','0px');
          ELEM.setStyle(_label,'top','0px');
          ELEM.setStyle(_label,'right','0px');
          ELEM.setStyle(_label,'bottom','0px');
        }
        else if(BROWSER_TYPE.safari||BROWSER_TYPE.chrome){
          ELEM.setStyle(_input,'width','auto');
          ELEM.setStyle(_input,'height','auto');
          ELEM.setStyle(_input,'left','-2px');
          ELEM.setStyle(_input,'top','-2px');
          if (BROWSER_TYPE.chrome) {
            ELEM.setStyle(_input,'right','0px');
            ELEM.setStyle(_input,'bottom','0px');
          }
          else {
            ELEM.setStyle(_input,'right','-2px');
            ELEM.setStyle(_input,'bottom','-2px');
          }
          ELEM.setStyle(_label,'left','0px');
          ELEM.setStyle(_label,'top','0px');
          ELEM.setStyle(_label,'right','0px');
          ELEM.setStyle(_label,'bottom','0px');
        }
      }
    }
  },
  
  setStyle: function(_name, _value, _cacheOverride) {
    if (!this['markupElemIds']||!this.markupElemIds['value']) {
      return;
    }
    this.setStyleOfPart('value', _name, _value, _cacheOverride);
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
  hasTextFocus: false,
  textFocus: function(){
    this.hasTextFocus = true;
  },
  textBlur: function(){
    this.hasTextFocus = false;
  },
  refreshValue: function(){
    if(this.markupElemIds){
      if(this.markupElemIds.value){
        ELEM.get(this.markupElemIds.value).value = this.value;
      }
    }
  },
  validateText: function(_value){
    return _value;
  },
  textEnter: function(){
    if(this['markupElemIds']===undefined){return;}
    var _value = this.validateText(ELEM.get(this.markupElemIds.value).value);
    if(_value !== this.value.toString()){
      this.setValue(_value);
    }
  }
  
});

HNumericTextControl = HTextControl.extend({
  mouseWheel: function(_delta){
    var _value = this.value;
    _value = _value-((_delta<0)?1:-1);
    this.setValue(Math.round(this.validateText(_value)));
  },
  validateText: function(_value){
    if(isNaN(_value)){
      _value = this.value;
    }
    _value = parseInt(_value,10);
    if(_value>this.options.maxValue){
      _value = this.options.maxValue;
    }
    else if(_value<this.options.minValue){
      _value = this.options.minValue;
    }
    if(this['markupElemIds'] && this.markupElemIds['value']){
      var _elem = ELEM.get(this.markupElemIds.value);
      if(_elem.value != _value){
        _elem.value = _value;
      }
    }
    return _value;
  },
  setValue: function(_value){
    this.base(this.validateText(_value));
  }
});



