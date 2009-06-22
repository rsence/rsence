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

Hasher = HClass.extend({
  constructor: function( hashValObj ){
    this.hashObj  = hashValObj;
  },
  
  setValueObj: function( sourceValObj ){
    this.valueObj = sourceValObj;
    this.setValue( sourceValObj.value );
  },
  
  setValue: function( unhashstr ){
    var hashstr = b64_sha1( unhashstr );
    this.hashObj.set( hashstr );
  }
  
});

PassHasher = HApplication.extend({
  
  constructor: function( hashPart1, hashPart2, targetPart, lenVal ){
    this.base( 5 );
    this.part1    = hashPart1;
    this.part2    = hashPart2;
    this.target   = targetPart;
    this.length   = lenVal;
    this.prevhash = '';
  },
  
  onIdle: function(){
    var newhash = b64_sha1( this.part1.value + this.part2.value ).slice(0,this.length.value);
    if( this.prevhash != newhash ){
      this.target.set( newhash );
    }
  }
  
});
