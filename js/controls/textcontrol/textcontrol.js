/*   RSence
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
var//RSence.Controls
HTextControl = HControl.extend({
  
  componentName: "textcontrol",
  
  defaultEvents: {
    textEnter: true,
    contextMenu: true
  },
  
  controlDefaults: (HControlDefaults.extend({
    refreshOnBlur: true,
    refreshOnInput: true,
    focusOnCreate: false
  })),
  
  drawSubviews: function(){
    ELEM.setStyle(this.elemId,'overflow','visible');
    this.base();
    if(this.options.focusOnCreate){
      this.getInputElement().focus();
      if( typeof this.value === 'string' ){
        this.setSelectionRange( this.value.length, this.value.length );
      }
    }
  },
  
/** = Description
  * The contextMenu event for text input components is not prevented by default.
  **/
  contextMenu: function(){
    return true;
  },
  
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

  lostActiveStatus: function(){
    ELEM.get( this.markupElemIds.value ).blur();
    this.textBlur();
  },
  
  setStyle: function(_name, _value, _cacheOverride) {
    if (!this['markupElemIds']||!this.markupElemIds['value']) {
      return;
    }
    this.setStyleOfPart('value', _name, _value, _cacheOverride);
  },
  
  setEnabled: function(_flag) {
    this.base(_flag);
    if(this['markupElemIds'] && this.markupElemIds.value) {
      ELEM.get(this.markupElemIds.value).disabled = !this.enabled;
    }
  },
  
/** This flag is true, when the text input field has focus.
  **/
  hasTextFocus: false,
  
  _getChangeEventFn: function(){
    var _this = this;
    return function(e){
      if(_this._clipboardEventTimer){
        clearTimeout( this._clipboardEventTimer );
      }
      _this._clipboardEventTimer = setTimeout( function(){_this.clipboardEvent();}, 200 );
      return true;
    };
  },
  
  _updateValueFromField: function(){
    this.setValue(
      this.validateText(
        this.getTextFieldValue()
      )
    );
  },
  
  _clipboardEventTimer: null,
  clipboardEvent: function(){
    this._updateValueFromField();
    clearTimeout( this._clipboardEventTimer );
    this._clipboardEventTimer = null;
  },
  
  _changeEventFn: null,
  _clearChangeEventFn: function(){
    if( this._changeEventFn ){
      Event.stopObserving( ELEM.get(this.markupElemIds.value), 'paste', this._changeEventFn );
      Event.stopObserving( ELEM.get(this.markupElemIds.value), 'cut', this._changeEventFn );
      this._changeEventFn = null;
    }
  },
  _setChangeEventFn: function(){
    if( this._changeEventFn ){
      this._clearChangeEventFn();
    }
    this._changeEventFn = this._getChangeEventFn();
    Event.observe( ELEM.get(this.markupElemIds.value), 'paste', this._changeEventFn );
    Event.observe( ELEM.get(this.markupElemIds.value), 'cut', this._changeEventFn );
  },
  
/** = Description
  * Special event for text entry components.
  * Called when the input field gains focus.
  *
  **/
  textFocus: function(){
    EVENT.changeActiveControl( this );
    this.hasTextFocus = true;
    this._setChangeEventFn();
    return true;
  },

/** = Description
  * Special event for text entry components.
  * Called when the input field loses focus.
  *
  **/
  textBlur: function(){
    this.hasTextFocus = false;
    this._clearChangeEventFn();
    this._updateValueFromField();
    if(this.options.refreshOnBlur){
      this.refreshValue();
    }
    return true;
  },
  
  onIdle: function(){
    this.hasTextFocus && this._updateValueFromField();
    try{
      this.base();
    }
    catch(e){
      console.error('HTextControl::onIdle error -> ',e);
      debugger;
      this.base();
    }
  },
  
/** = Description
  * refreshValue function
  *
  *
  **/
  refreshValue: function(){
    this.setTextFieldValue( this.value );
  },

/** = Description
  * Placeholder method for validation of the value.
  *
  **/
  validateText: function(_value){
    return _value;
  },
  
/** = Description
  * Returns the input element or null, if no input element created (yet).
  *
  **/
  getInputElement: function(){
    if( this.markupElemIds && this.markupElemIds.value ){
      return ELEM.get(this.markupElemIds.value);
    }
    return null;
  },
  
/** = Description
  * Returns the value of the input element.
  *
  **/
  getTextFieldValue: function(){
    var _inputElement = this.getInputElement();
    if( _inputElement === null ){
      return '';
    }
    return _inputElement.value;
  },
  
/** = Description
  * Sets the value of the input element.
  *
  * = Parameters
  * +_value+::  The value to set.
  *
  **/
  setTextFieldValue: function(_value){
    var _inputElement = this.getInputElement(),
        _selectionRange = this.getSelectionRange();
    if( _inputElement === null ){
      return;
    }
    if( _inputElement.value !== String(_value) ){
      _inputElement.value = _value;
    }
    this.setSelectionRange( _selectionRange[0], _selectionRange[1] );
  },
  
  // returns a random number prefixed and suffixed with '---'
  _randomMarker: function(){
    return '---'+Math.round((1+Math.random())*10000)+'---';
  },
  
  die: function(){
    if( this.hasTextFocus ){
      this.getInputElement().blur();
    }
    this._clearChangeEventFn();
    this.base();
  },
  
/** = Description
  * Returns the selection (or text cursor position) of the input element
  * as an +Array+ like +[ startOffset, endOffset ]+.
  *
  **/
  getSelectionRange: function(){
    var _inputElement = this.getInputElement();
    if( _inputElement === null || this.hasTextFocus === false ){
      return [ 0, 0 ];
    }
    if(document.selection){
      // Internet Explorer
      
      var
      
      // create a range object
      _range = document.selection.createRange(),
      
      // original range text
      _rangeText = _range.text,
      _rangeLength = _rangeText.length,
      
      // make a copy of the text and replace \r\n with \n
      _origValue = _inputElement.value.replace(/\r\n/g, "\n"),
      
      _markerValue,
      _markerLength,
      _markerIndex,
      
      // create random marker to replace the text with
      _marker = this._randomMarker();
      
      // re-generate marker if it's found in the text.
      while( _origValue.indexOf( _marker ) !== -1){
        _marker = this._randomMarker();
      }
      
      _markerLength = _marker.length;
      
      // temporarily set the text of the selection to the unique marker
      _range.text = _marker;
      
      _markerValue = _inputElement.value.replace(/\r\n/g, "\n");
      
      _range.text = _rangeText;
      
      _markerIndex = _markerValue.indexOf( _marker );
      
      return [
        _markerIndex,
        _markerIndex + _rangeLength
      ];
    }
    else if (_inputElement.selectionStart){
      // Mozilla - Gecko
      return [
        _inputElement.selectionStart,
        _inputElement.selectionEnd
      ];
    }
    else {
      // no support
      return [ 0, 0 ];
    }
  },
  
/** = Description
  * Sets the selection (or text cursor position) of the input element.
  *
  * = Parameters
  * +_selectionStart+::   The start of the selection (or an Array containing
  *                       both start and end offset, see below).
  * +_selectionEnd+::     The end offset of the selection.
  *
  * = Note
  * - +_selectionStart+ can also be given as an +Array+
  *   like +[ startOffset, endOffset ]+.
  * - If the +_selectionEnd+ is omitted, no selection is made; the text 
  *   cursor is positioned at the startOffset instead.
  **/
  setSelectionRange: function( _selectionStart, _selectionEnd ){
    if( _selectionStart instanceof Array ){
      _selectionEnd = _selectionStart[1];
      _selectionStart = _selectionStart[0];
    }
    if( _selectionEnd === undefined ){
      _selectionEnd = _selectionStart;
    }
    var _inputElement = this.getInputElement();
    if( _inputElement === null || this.hasTextFocus === false ){
      return;
    }
    if(_inputElement.createTextRange){
      // Internet Explorer
      var _range = _inputElement.createTextRange();
      _range.move( 'character', _selectionStart, _selectionEnd );
      _range.select();
    }
    else if (_inputElement.selectionStart){
      // Mozilla - Gecko
      _inputElement.setSelectionRange( _selectionStart, _selectionEnd );
    }
  },
  
/** = Description
  * Receives the +textEnter+ event to update the value
  * based on what's (potentially) entered in the text input field.
  *
  **/
  textEnter: function(){
    this.setValue(
      this.validateText(
        this.getTextFieldValue()
      )
    );
    if(this.options.refreshOnInput){
      this.refreshValue();
    }
    return false;
  }
  
});

/** = Description
  * HNumericTextControl is an extension of HTextControl that
  * validates the input as a number. It supports value ranges.
  *
  * If you need decimal numbers (floating-point), pass the 
  * decimalNumber: true option to the constructor.
  **/
var//RSence.Controls
HNumericTextControl = HTextControl.extend({
  
  defaultEvents: {
    mouseWheel: true,
    textEnter: true,
    contextMenu: true
  },
  
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
    if(this.options.decimalNumber){
      _value = parseFloat(_value);
    }
    else{
      _value = parseInt(_value,10);
    }
    if(isNaN(_value)){
      _value = this.value;
    }
    if(_value>this.options.maxValue){
      _value = this.options.maxValue;
    }
    else if(_value<this.options.minValue){
      _value = this.options.minValue;
    }
    return _value;
  }
  
});



