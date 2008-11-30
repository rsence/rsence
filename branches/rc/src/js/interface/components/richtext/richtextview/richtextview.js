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

/*** class: HRichTextView
  **
  ** HTextControl is a control unit that represents an editable rich text. 
  ** HTextControl view or theme can be changed; the helmiTheme is used by default.
  **
  ** vars: Instance variables
  **  type - '[HRichTextView]'
  **  value - The string that is currently held by this object.
  **
  ** Extends:
  **  <HControl>
  **
  ** See also:
  **  <HControl>
  ***/
HRichTextView = HControl.extend({
  
  packageName:   "richtext",
  componentName: "richtextview",

/** constructor: constructor
  *
  * Parameters:
  *   _rect - An <HRect> object that sets the position and dimensions of this control.
  *   _parentClass - The parent view that this control is to be inserted in.
  *   _options - (optional) All other parameters. See <HComponentDefaults>.
  **/
  constructor: function(_rect, _parentClass, _options) {
    if (this.isinherited) {
      this.base(_rect, _parentClass, _options);
    } else {
      this.isinherited = true;
      this.base(_rect, _parentClass, _options);
      this.isinherited = false;
    }
    
    this.type = '[HRichTextView]';
    this.preserveTheme = true;
    
    this._designMode = false;
	this._installed = false;
    
    if (!this.isinherited) {
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
    this.base();
  },


/** event: onIdle
  * 
  * Save typed in or pasted text into the member variable. This is called
  * automatically by the application.
  *
  * See also:
  *  <HApplication>
  **/
  onIdle: function() {
    if (this.drawn) {
      var _iFrame = ELEM.get( this.markupElemIds.control );
      if (!this._designMode && _iFrame.contentWindow && _iFrame.contentWindow.document) {
        _iFrame.contentWindow.document.designMode = "on";
        this._designMode = true;
      }
      // Needed for IE: _iFrame.contentWindow.document.body
      if (this._designMode && _iFrame.contentWindow.document.body) {
        if (!this._installed) {
          _iFrame.contentWindow.document.body.innerHTML = this.value;
          this._installed = true;
        }
        var _html = _iFrame.contentWindow.document.body.innerHTML;
        if (this.value != _html) {
          this._editingValue = true;
          this.setValue(_html);
          this._editingValue = false;
        }
      }
    }
  },
 /** method: setValue
  *
  *	Sets the content of the HRichTextView. Accepts a plain text or an html markup.
  *
  * Parameters:
  *   _value - The _value can be a plain text or an html markup.
  **/
  setValue: function(_value) {
    if (!this._editingValue) {
      if (this._designMode) {
        var _iFrame = ELEM.get( this.markupElemIds.control );
		if (_iFrame.contentWindow.document.body) {
          _iFrame.contentWindow.document.body.innerHTML = _value;
		}
      }
    }
    this.base(_value);
  },
  iframe: function() {
	return ELEM.get( this.markupElemIds.control );
  }
});
