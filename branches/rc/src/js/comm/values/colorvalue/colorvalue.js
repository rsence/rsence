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

/** class: HColorValue
  *
  * ColorValues are <HValue> extensions used to support the special type of
  * value with special xml output and internal representanion as a fixed size array.
  * It has the accompanying methods to set part-colors.
  *
  **/
HColorValue = HValue.extend({
  
/** constructor: constructor
  *
  * We just need the id and value, as usual.
  * However the value has to be a array with excactly three items.
  *
  * Parameters:
  *  _id - See <HValue.constructor>
  *  _value - A valid three-part color array, see <validate>
  *
  **/
  constructor: function(_id,_value){
    this.validate(_value);
    this.base(_id,_value);
    this.type = '[ColorValue]';
  },

  
/** method: validate
  *
  * Simple value validation
  *
  * Parameters:
  *  _value - Must be Array with excactly three numbers: [R,G,B]. Nothing else is supported.
  *
  **/
  validate: function(_value){
    if(!_value instanceof Array){
      throw('ColorValueError: ColorValue must be array');
    }
    if(_value.length != 3){
      throw('ColorValueError: ColorValues need three parts');
    }
  },
  
/** method: set
  *
  * You should only set with values as arrays with three integers in range 0..255.
  *
  **/
  set: function(_value){
    if(_value == this.value){
      return;
    }
    if(_value === undefined){
      throw('ColorValueError: Tried to set '+_value);
    }
    this.validate(_value);
    var _rgbval = new Array(3);
    for(_colorPart=0;_colorPart<3;_colorPart++){
      var _colorVal = _value[_colorPart];
      if((_colorVal<0)||(_colorVal>255)){
        _rgbval[_colorPart] = this.value[_colorPart];
      } else {
        _rgbval[_colorPart] = _colorVal;
      }
    }
    this.base(_rgbval);
  },
  
/** method: getRed
  *
  * Returns:
  *  The Red color part as an integer number.
  *
  **/
  getRed:   function(){
    return this.value[0];
  },
  
/** method: getGreen
  *
  * Returns:
  *  The Green color part as an integer number.
  *
  **/
  getGreen: function(){
    return this.value[1];
  },
  
/** method: getBlue
  *
  * Returns:
  *  The Blue color part as an integer number.
  *
  **/
  getBlue:  function(){
    return this.value[2];
  },
  
  
  
/** method: setRed
  *
  * Parameters:
  *  _redVal - Set Red color part as an valid (0...255) integer number.
  *
  **/
  setRed:   function(_redVal){
    this.set([Math.round(_redVal),-1,-1]);
  },
  
/** method: setGreen
  *
  * Parameters:
  *  _grnVal - Set Green color part as an valid (0...255) integer number.
  *
  **/
  setGreen: function(_grnVal){
    this.set([-1,Math.round(_grnVal),-1]);
  },
  
/** method: setBlue
  *
  * Parameters:
  *  _bluVal - Set Blue color part as an valid (0...255) integer number.
  *
  **/
  setBlue:  function(_bluVal){
    this.set([-1,-1,Math.round(_bluVal)]);
  },
  
  // Format the value as a nice rgb value usable in css or something similar.
  toRGBString: function(){
    return 'rgb('+this.value[0]+', '+this.value[1]+', '+this.value[2]+')';
  },
  
  // Initialize an array of 256 items with each having a hexadecimal value.
  _initHexArr: function(){
    this._hexArr = new Array(256);
    var _hexStr = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F'];
    for(var _majorBit=0;_majorBit<16;_majorBit++){
      for(var _minorBit=0;_minorBit<16;_minorBit++){
        var _decVal = (_majorBit*16)+_minorBit;
        var _hexVal = _hexStr[_majorBit]+_hexStr[_minorBit];
        this._hexArr[_decVal] = _hexVal;
      }
    }
  },
  
  // Format the value as a nice #RRGGBB hexadecimal value usable in css or something similar.
  toHexString: function(_toLowerCase){
    if(!this._hexArr){
      this._initHexArr();
    }
    var _redHex = this._hexArr[this.getRed()];
    var _grnHex = this._hexArr[this.getGreen()];
    var _bluHex = this._hexArr[this.getBlue()];
    var _hexString = '#'+_redHex+_grnHex+_bluHex;
    if(_toLowerCase){
      _hexString = _hexString.toLowerCase();
    }
    return _hexString;
  },
  
/** method: toXML
  *
  * Generates an XML description of the color.
  *
  * Parameter:
  *  _i - The sequence number of the item, generated by HValueManager.
  *
  * Returns:
  *  An XML string with the 3 RGB colorparts
  *
  * See Also:
  *  <HValue.toXML> <HValueManager.toXML>
  *
  * Sample:
  * > <color id="996" order="30" hexvalue="#ffcc33"><red>255</red><green>204</green><blue>51</blue></color>'
  **/
  toXML: function(_i){
    var _syncid = this.id;
    var _syncRed = this.getRed();
    var _syncGrn = this.getGreen();
    var _syncBlu = this.getBlue();
    var _syncHex = this.toHexString();
    return '<color id="'+_syncid+'" order="'+_i+'" hexvalue="'+_syncHex+'"><red>'+_syncRed+'</red><green>'+_syncGrn+'</green><blue>'+_syncBlu+'</blue></color>';
  }
});
