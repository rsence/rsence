/***  HIMLE RIA SYSTEM
  ** 
  **  Copyright (C) 2008 HIMLE GROUP http://himle.sorsacode.com/
  **  Copyright (C) 2007 Juha-Jarmo Heinonen <o@sorsacode.com>
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

SmallPasswdField = HTextControl.extend({
  componentName: 'smallpasswdfield',
  constructor: function(_rect,_parent,_saltId){
    this.base(_rect,_parent);
    this._saltVal = HVM.values[_saltId];
    this._clearText = '';
  },
  _crypt: function(_val){
    var _salt = this._saltVal.value;
    var _cryptpass = SHA._hex_sha1( _val );
    var _saltpass  = SHA._hex_sha1( _cryptpass + _salt );
  },
  setValue: function(_val){
    var _t = this;
    if(_value === undefined){return;}
    if(!_t.valueObj){return;}
    var _value = _t._crypt(_val);
    if(_value !== this.value) {
      _t.value = _value;
      _t.valueObj.set(_value);
    }
  },
  refresh: function() {
  },
  _updateValue: function() {
    if (this.drawn) {
      var _clearText = elem_get(this._inputElementId).value;
      if (_clearText != this._clearText) {
        this._clearText = _clearText;
        this.setValue(_clearText);
      }
    }
  }
});