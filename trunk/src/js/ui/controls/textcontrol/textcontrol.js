/*   Riassence Framework
 *   Copyright 2006 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

/*** = Description
  ** HTextControl is a control unit that represents an editable input 
  ** line of text. Commonly, textcontrol is used as a single text field in 
  ** the request forms. HTextControl view or theme can be changed; the 
  ** default_theme is used by default.
  **
  ** = Instance variables
  ** +type+::   '[HTextControl]'
  ** +value+::  The string that is currently held by this object.
  ***/
HTextControl = HControl.extend({
  
  componentName: "textcontrol",
  
  controlDefaults: (HControlDefaults.extend({
    constructor: function(_ctrl){
      if(!this.events){
        this.events = {
          textEnter: true
        };
      }
    }
  })),
  
/** = Description
  * The refreshLabel method sets the title property of the text
  * field, essentially creating a tooltip using the label.
  *
  **/
  refreshLabel: function(){
    if(this['markupElemIds']!==undefined){
      if(this.markupElemIds['label']!==undefined){
        ELEM.setAttr(this.markupElemIds.label,'title',this.label);
      }
    }
  },

/** = Description
  * Tweaks the input element to fit the match the size properly
  * in different browsers.
  *
  **/
  drawSubviews: function(){
    if(this['markupElemIds']!==undefined){
      if(this.markupElemIds['label']!==undefined) {
        var _input  = this.markupElemIds.value,
            _label  = this.markupElemIds.label;
        if(BROWSER_TYPE.firefox){
          if(this.componentName === 'textarea'){
            ELEM.setStyle(_input,'padding-top','0px');
          }
          else {
            ELEM.setStyle(_input,'margin-top','1px');
          }
          ELEM.setStyle(_input,'padding-left','0px');
          ELEM.setStyle(_label,'left','2px');
          ELEM.setStyle(_label,'top','0px');
          ELEM.setStyle(_label,'right','2px');
          ELEM.setStyle(_label,'bottom','2px');
        }
        else if(BROWSER_TYPE.ie){
          ELEM.flushLoop();
          var _size   = ELEM.getVisibleSize( this.elemId ),
              _width  = _size[0],
              _height = _size[1];
          ELEM.setStyle(_input,'left','2px');
          ELEM.setStyle(_input,'top','1px');
          ELEM.setStyle(_input,'padding-top','0px');
          ELEM.setStyle(_input,'padding-left','0px');
          ELEM.setStyle(_input,'padding-right','8px');
          ELEM.setStyle(_input,'padding-bottom','0px');
          ELEM.setStyle(_input,'width',(_width-10)+'px');
          ELEM.setStyle(_input,'height',(_height-2)+'px');
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
    this.setEnabled(this.enabled);
  },

  setStyle: function(_name, _value, _cacheOverride) {
    if (!this['markupElemIds']||!this.markupElemIds['value']) {
      return;
    }
    this.setStyleOfPart('value', _name, _value, _cacheOverride);
  },
  
  setEnabled: function(_flag) {
    this.base(_flag);
    if(this['markupElemIds']===undefined){return;}
    if(this.markupElemIds.value) {
      ELEM.get(this.markupElemIds.value).disabled = !this.enabled;
    }
  },
  hasTextFocus: false,

/** = Description
  * textFocus function
  *
  *
  **/
  textFocus: function(){
    this.hasTextFocus = true;
    return true;
  },

/** = Description
  * textBlur function
  *
  *
  **/
  textBlur: function(){
    this.hasTextFocus = false;
    return true;
  },

/** = Description
  * refreshValue function
  *
  *
  **/
  refreshValue: function(){
    if(this.markupElemIds){
      if(this.markupElemIds.value){
        ELEM.get(this.markupElemIds.value).value = this.value;
      }
    }
  },

/** = Description
  * validateText function
  *
  *
  **/
  validateText: function(_value){
    return _value;
  },

/*** = Description
  ** getTextFieldValue function
  **
  **
  ***/
  getTextFieldValue: function(){
    return ELEM.get(this.markupElemIds.value).value;
  },

/** = Description
  * Receives the textEnter event to update the value
  * based on what's (potentially) entered in the text input field.
  *
  **/
  textEnter: function(){
    if(this['markupElemIds']===undefined){return;}
    var _value = this.validateText( this.getTextFieldValue() );
    if(_value !== this.value.toString()){
      this.setValue(_value);
    }
  }
  
});

/** = Description
  * HNumericTextControl is an extension of HTextControl that
  * validates the input as a number. It supports value ranges.
  *
  * If you need decimal numbers (floating-point), pass the 
  * decimalNumber: true option to the constructor.
  **/
HNumericTextControl = HTextControl.extend({
  
/** Uses the mouseWheel event to step up/down the value.
  **/
  mouseWheel: function(_delta){
    var _value = this.value;
    _value = _value-((_delta<0)?1:-1);
    this.setValue(Math.round(this.validateText(_value)));
  },

/** = Description
  * Extends the validateText method to ensure the
  * input is a number.
  *
  **/
  validateText: function(_value){
    if(isNaN(_value)){
      _value = this.value;
    }
    if(this.options.decimalNumber){
      _value = parseFloat(_value);
    }
    else{
      _value = parseInt(_value,10);
    }
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

/** = Description
  * When changing the value, passes it on to the validateText method
  * before setting the value itself.
  *
  **/
  setValue: function(_value){
    this.base(this.validateText(_value));
  }
});



