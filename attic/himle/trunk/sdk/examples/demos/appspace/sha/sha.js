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

// Encoder / Decoder facility

/** IMPROVED FROM: **/
/*
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.1 Copyright (C) Paul Johnston 1999 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.

 * vBulletin Usage: md5hash(input,output)
 * Recommend: input = password input field; output = hidden field

 */


SHA = HClass.extend({
  constructor: null,

  /* hex output format. 0 - lowercase; 1 - uppercase        */
  _hexcase: 0,
  hexCase: function(){
    return this._hexcase;
  },
  setHexCase: function(_case){
    this._hexcase = _case;
  },
  
  /* base-64 pad character. "=" for strict RFC compliance   */
  _b64pad: "=",
  base64Pad: function(){
    return this._b64pad;
  },
  setBase64Pad: function(_pad){
    this._b64pad = _pad;
  },
  
  /* bits per input character. 8 - ASCII; 16 - Unicode      */
  _chrsz: 8,
  chrsz: function(){
    return this._chrsz;
  },
  setChrsz: function(_bits){
    this._chrsz = _bits;
  },

/*
 * These are the functions you'll usually want to call
 * They take string arguments and return either hex or base-64 encoded strings
 */
  _hex_sha1: function(_s){
    return this._binb2hex(
      this._core_sha1(
        this._str2binb(_s),
        _s.length * this._chrsz
      )
    );
  },
  _b64_sha1: function(_s){
    return this._binb2b64(
      this._core_sha1(
        this._str2binb(_s),
        _s.length * this._chrsz
      )
    );
  },
  _str_sha1: function(_s){
    return this._binb2str(
      this._core_sha1(
        this._str2binb(_s),
        _s.length * this._chrsz
      )
    );
  },
  _hex_hmac_sha1: function(_key, _data){
    return this._binb2hex(
      this._core_hmac_sha1(_key, _data)
    );
  },
  _b64_hmac_sha1: function(_key, _data){
    return this._binb2b64(
      this._core_hmac_sha1(_key, _data)
    );
  },
  _str_hmac_sha1: function(_key, _data){
    return this._binb2str(
      this._core_hmac_sha1(_key, _data)
    );
  },

  /*
   * Perform a simple self-test to see if the VM is working
   */
  test: function(){
    return this._hex_sha1("abc") == "a9993e364706816aba3e25717850c26c9cd0d89d";
  },

  /*
   * Calculate the SHA-1 of an array of big-endian words, and a bit length
   */
  _core_sha1: function(_x, _len){
    /* append padding */
    _x[_len >> 5] |= 0x80 << (24 - _len % 32);
    _x[((_len + 64 >> 9) << 4) + 15] = _len;

    var _w = new Array(80);
    var _a =  1732584193;
    var _b = -271733879;
    var _c = -1732584194;
    var _d =  271733878;
    var _e = -1009589776;

    for(var _i = 0; _i < _x.length; _i += 16){
      var _olda = _a;
      var _oldb = _b;
      var _oldc = _c;
      var _oldd = _d;
      var _olde = _e;

      for(var _j = 0; _j < 80; _j++){
        if(_j < 16) _w[_j] = _x[_i + _j];
        else _w[_j] = this._rol(_w[_j-3] ^ _w[_j-8] ^ _w[_j-14] ^ _w[_j-16], 1);
        var _t = this._safe_add(this._safe_add(this._rol(_a, 5), this._sha1_ft(_j, _b, _c, _d)),
                 this._safe_add(this._safe_add(_e, _w[_j]), this._sha1_kt(_j)));
        _e = _d;
        _d = _c;
        _c = this._rol(_b, 30);
        _b = _a;
        _a = _t;
      }

      _a = this._safe_add(_a, _olda);
      _b = this._safe_add(_b, _oldb);
      _c = this._safe_add(_c, _oldc);
      _d = this._safe_add(_d, _oldd);
      _e = this._safe_add(_e, _olde);
    }
    return new Array(_a, _b, _c, _d, _e);

  },

  /*
   * Perform the appropriate triplet combination function for the current
   * iteration
   */
  _sha1_ft: function(_t, _b, _c, _d) {
    if(_t < 20) return (_b & _c) | ((~_b) & _d);
    if(_t < 40) return _b ^ _c ^ _d;
    if(_t < 60) return (_b & _c) | (_b & _d) | (_c & _d);
    return _b ^ _c ^ _d;
  },

  /*
   * Determine the appropriate additive constant for the current iteration
   */
  _sha1_kt: function(_t){
    return (_t < 20) ?  1518500249 : (_t < 40) ?  1859775393 :
           (_t < 60) ? -1894007588 : -899497514;
  },

  /*
   * Calculate the HMAC-SHA1 of a key and some data
   */
  _core_hmac_sha1: function(_key, _data){
    var _bkey = this._str2binb(_key);
    if(_bkey.length > 16) _bkey = this._core_sha1(_bkey, _key.length * this._chrsz);

    var _ipad = new Array(16), _opad = new Array(16);
    for(var _i = 0; _i < 16; _i++){
      _ipad[_i] = _bkey[_i] ^ 0x36363636;
      _opad[_i] = _bkey[_i] ^ 0x5C5C5C5C;
    }

    var _hash = this._core_sha1(_ipad.concat(this._str2binb(_data)), 512 + _data.length * this._chrsz);
    return this._core_sha1(_opad.concat(_hash), 512 + 160);
  },

  /*
   * Add integers, wrapping at 2^32. This uses 16-bit operations internally
   * to work around bugs in some JS interpreters.
   */
  _safe_add: function(_x, _y){
    var _lsw = (_x & 0xFFFF) + (_y & 0xFFFF);
    var _msw = (_x >> 16) + (_y >> 16) + (_lsw >> 16);
    return (_msw << 16) | (_lsw & 0xFFFF);
  },

  /*
   * Bitwise rotate a 32-bit number to the left.
   */
  _rol: function(_num, _cnt){
    return (_num << _cnt) | (_num >>> (32 - _cnt));
  },

  /*
   * Convert an 8-bit or 16-bit string to an array of big-endian words
   * In 8-bit function, characters >255 have their hi-byte silently ignored.
   */
  _str2binb: function(_str){
    var _bin = new Array();
    var _mask = (1 << this._chrsz) - 1;
    for(var _i = 0; _i < _str.length * this._chrsz; _i += this._chrsz)
      _bin[_i>>5] |= (_str.charCodeAt(_i / this._chrsz) & _mask) << (32 - this._chrsz - _i%32);
    return _bin;
  },

  /*
   * Convert an array of big-endian words to a string
   */
  _binb2str: function(_bin){
    var _str = "";
    var _mask = (1 << this._chrsz) - 1;
    for(var _i = 0; _i < _bin.length * 32; _i += this._chrsz)
      _str += String.fromCharCode((_bin[_i>>5] >>> (32 - this._chrsz - _i%32)) & _mask);
    return _str;
  },

  /*
   * Convert an array of big-endian words to a hex string.
   */
  _binb2hex: function(_binarray){
    var _hex_tab = this._hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
    var _str = "";
    for(var _i = 0; _i < _binarray.length * 4; _i++){
      _str += _hex_tab.charAt((_binarray[_i>>2] >> ((3 - _i%4)*8+4)) & 0xF) +
              _hex_tab.charAt((_binarray[_i>>2] >> ((3 - _i%4)*8  )) & 0xF);
    }
    return _str;
  },

  /*
   * Convert an array of big-endian words to a base-64 string
   */
  _binb2b64: function(_binarray){
    var _tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var _str = "";
    for(var _i = 0; _i < _binarray.length * 4; _i += 3){
      var _triplet = (((_binarray[_i   >> 2] >> 8 * (3 -  _i   %4)) & 0xFF) << 16)
                   | (((_binarray[_i+1 >> 2] >> 8 * (3 - (_i+1)%4)) & 0xFF) << 8 )
                   |  ((_binarray[_i+2 >> 2] >> 8 * (3 - (_i+2)%4)) & 0xFF);
      for(var _j = 0; _j < 4; _j++){
        if(_i * 8 + _j * 6 > _binarray.length * 32) _str += this._b64pad;
        else _str += _tab.charAt((_triplet >> 6*(3-_j)) & 0x3F);
      }
    }
    return _str;
  }
});
