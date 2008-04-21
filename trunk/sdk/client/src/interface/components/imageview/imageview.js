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

/*** class: HImageView
  **
  ** HImageView is a control unit intended to display images on the screen
  ** through the HTML <IMG> tag. The HImageView class is a container to visualize
  ** images loaded via URL. It supports scaling via two class methods, 
  ** scaleToFit and scaleToOriginal. If the image is unable to be loaded, 
  ** a default blank image will be rendered.
  **
  ** vars: Instance variables
  **  type - '[HImageView]'
  **  value - URL pointing to the image that is currently shown.
  **
  ** Extends:
  **  <HControl>
  **
  ** See also:
  **  <HControl>
  ***/
HImageView = HControl.extend({
  
/** constructor: constructor
  *
  * Parameters:
  *   _rect - An <HRect> object that sets the position and dimensions of this control.
  *   _parentClass - The parent view that this control is to be inserted in.
  *   _options - (optional) All other parameters. See <HComponentDefaults>.
  **/
  constructor: function(_rect, _parentClass, _options) {
    if(!_options) {
      _options={};
    }
    var _defaults = HClass.extend({
      scaleToFit: true
    });
    _options = new (_defaults.extend(_options))();
    if(this.isinherited) {
      this.base(_rect, _parentClass, _options);
    }
    else {
      this.isinherited = true;
      this.base(_rect, _parentClass, _options);
      this.isinherited = false;
    }
    if(!this.value) {
      // default to a blank image
      this.value = this.getThemeGfxPath() + "/blank.gif";
    }
    
    this.type = '[HImageView]';
    
    if(!this.isinherited) {
      this.draw();
    }
  },
  
  _makeScaleToFit: function(_parentId){
    this.elemId = ELEM.make(_parentId,'img');
    ELEM.setAttr(this.elemId,'src',this.value);
    ELEM.setAttr(this.elemId,'alt',this.label);
  },
  _makeScaleToOriginal: function(_parentId){
    this.elemId = ELEM.make(_parentId,'div');
    ELEM.setStyle(this.elemId,'background-image','url('+this.value+')');
  },
  _makeElem: function(_parentId){
    if(this.options.scaleToFit){
      this._makeScaleToFit(_parentId);
    }
    else {
      this._makeScaleToOriginal(_parentId);
    }
  },
  
  setValue: function(_value){
    this.base(_value);
    ELEM.setAttr(this.elemId,'src',_value);
  },
  
  setLabel: function(_label){
    this.base(_label);
    ELEM.setAttr(this.elemId,'alt',_label);
  },
  
/** method: scaleToFit
  * 
  * Changes the size of the image element so that it fits in the rectangle of
  * the view.
  *
  * See also:
  *  <scaleToOriginal>
  **/
  scaleToFit: function() {
    if(!this.options.scaleToFit){
      ELEM.del(this.elemId);
      this._makeScaleToFit(this._getParentElemId());
      this.options.scaleToFit=true;
    }
  },
  
  
/** method: scaleToOriginal
  * 
  * Resizes the image element to its original dimesions. If the image is larger
  * than the rectangle of this view, clipping will occur.
  *
  * See also:
  *  <scaleToFit>
  **/
  scaleToOriginal: function() {
    if(this.options.scaleToFit){
      ELEM.del(this.elemId);
      this._makeScaleToOriginal(this._getParentElemId());
      this.options.scaleToFit=false;
    }
  }


  
});
