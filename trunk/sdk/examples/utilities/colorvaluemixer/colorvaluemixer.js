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

/** class: HColorValueMixer
  *
  * HColorValueMixer is a simple value responder utility class 
  * that mixes a single integer value to affect several part colors of 
  * the target class's <HColorValue>.
  *
  * vars: Intance Variables
  *  target - The target object. Usually a parent or similar, it should be a class instance with at least a <HColorValue> valueObj.
  *  mixRed - A multiplier that tells the mixer to mix [multiplier] red part colors.
  *  mixGrn - A multiplier that tells the mixer to mix [multiplier] green part colors.
  *  mixBlu - A multiplier that tells the mixer to mix [multiplier] blue part colors.
  *  valueObj - The value object to mix.
  *
  **/
HColorValueMixer = Base.extend({

/** constructor: constructor
  *
  * Parameters:
  *  _target - The target <HColorValue> valueObj holder instance whose color value will be mixed.
  *  _red    - The amount of red to mix (should be a multiplier, preferrably 0.0 to 1.0)
  *  _grn    - The amount of green to mix (should be a multiplier, preferrably 0.0 to 1.0)
  *  _blu    - The amount of blue to mix (should be a multiplier, preferrably 0.0 to 1.0)
  *
  **/
  constructor: function(_target,_red,_grn,_blu){
    this.target      = _target;
    if( (typeof _red == 'number') &&
        (typeof _grn == 'number') &&
        (typeof _blu == 'number') ){
      this.mixRed      = _red;
      this.mixGrn      = _grn;
      this.mixBlu      = _blu;
    } else {
      throw("HColorValueMixerConstructorError: The mixable color parts have to be numerics, usually floating point values in the range 0.0 - 1.0.");
    }
  },

/** method: setValue
  *
  * Performs the mixing based on the value given and part color multipliers set.
  *
  * Parameters:
  *  _value - A numeric value, preferrably in the range 0 to 255.
  *
  **/
  setValue: function(_value){
    var _valueInt = Math.round(_value);
    if(this.target.valueObj instanceof HColorValue){
      var _colorValueObj = this.target.valueObj;
    } else {
      return
    }
    if(this.mixRed){
      _colorValueObj.setRed(_valueInt * this.mixRed);
    }
    if(this.mixGrn){
      _colorValueObj.setGreen(_valueInt * this.mixGrn);
    }
    if(this.mixBlu){
      _colorValueObj.setBlue(_valueInt * this.mixBlu);
    }
    this.valueObj.set(_valueInt);
  },
  
/** method: setValueObj
  *
  * Nothing special; see <HControl.setValueObj>
  *
  **/
  setValueObj: function(_valueObj){
    this.valueObj = _valueObj;
    this.setValue(_valueObj.value);
  }
});


