/****
HIMLE RIA Framework
Copyright (C) 2008 HIMLE GROUP http://himle.sorsacode.com/
Copyright (C) 2006-2007 Helmi Technologies Inc.

This program is free software; you can redistribute it and/or modify it under the terms
of the GNU General Public License as published by the Free Software Foundation;
either version 2 of the License, or (at your option) any later version. 
This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
See the GNU General Public License for more details. 
You should have received a copy of the GNU General Public License along with this program;
if not, write to the Free Software Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA


****/



HValidatorView = HControl.extend({
  
  componentName: "validatorview",

/** constructor: constructor
  *
  * Parameters:
  *   _rect - An <HRect> object that sets the position and dimensions of this control.
  *   _parentClass - The parent view that this control is to be inserted in.
  *   _options - (optional) All other parameters. See <HComponentDefaults>.
  **/
  constructor: function(_rect, _parentClass, _options) {
    
    var _left = _parentClass.rect.right + 5;
    var _top = _parentClass.rect.top;
    var _right = _left + _rect.width;
    var _bottom = _top + _rect.height;
    _newRect = new HRect(_left,_top,_right,_bottom);
    
    if(this.isinherited) {
      this.base(_newRect, _parentClass.parent, _options);
    }
    else {
      this.isinherited = true;
      this.base(_newRect, _parentClass.parent, _options);
      this.isinherited = false;
    }
    
    this.type = '[HValidatorView]';
    
    if(!this.isinherited) {
      this.draw();
    }
  },
  
  
/** method: draw
  * 
  * Draws the rectangle and the markup of this object on the screen.
  *
  * See also:
  *  <HView.draw>
  **/
  draw: function() {
    if (!this.drawn) {
      this.drawRect();
      this.drawMarkup();
      this.drawn = true;
    }
    this.refresh();    
  },
  
  
/** method: refresh
  * 
  * Redraws only the image, not the whole markup.
  *
  * See also:
  *  <HView.refresh>
  **/
  refresh: function() {
    if (this.drawn) {
      this.base();
      
      // Validator's status
      if(this.markupElemIds.control) {
        this._updateToggleState();
      }
      
    }
  },
  
  
/** method: setValue
  * 
  * Sets the selected status of the validator.
  *
  * Parameters:
  *  _flag - True to set the status to selected, false to set to unselected.
  **/
  setValue: function(_flag) {
    if (null === _flag || undefined === _flag) {
      _flag = false;
    }
    this.base(_flag);
  },
  
  
  // Private method. Toggles the validator status.
  _updateValidatorState: function() {
    if (this.markupElemIds.control) {
      var _elem = elem_get(this.markupElemIds.control);
      this.toggleCSSClass(_elem, HValidatorView.cssValid, this.value);
      this.toggleCSSClass(_elem, HValidatorView.cssInvalid, !this.value);
    }
  }

  
},{
  cssValid: "valid",
  cssInvalid: "invalid",
  _tmplImgPrefix: "validatorview"
});
