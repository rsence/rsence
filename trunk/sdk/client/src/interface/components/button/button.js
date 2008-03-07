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

/*** class: HButton
  **
  ** HButton is a control unit that provides the user a simple way to trigger an event 
  ** and responds to mouse clicks and keystrokes by calling a proper action method 
  ** on its target class. A typical button is a rectangle with a label in its centre. 
  ** Button view or theme can be changed; the helmiTheme is used by default. 
  ** 
  ** vars: Instance variables
  **  type - '[HButton]'
  **  label - The string that is shown as the label of this object.
  **
  ** Extends:
  **  <HControl>
  **
  ** See also:
  **  <HControl> <HClickButton>
  ***/
HButton = HControl.extend({
  
  componentName: "button",

/** constructor: constructor
  *
  * Parameters:
  *   _rect - An <HRect> object that sets the position and dimensions of this control.
  *   _parentClass - The parent view that this control is to be inserted in.
  *   _options - See <HControl.constructor> and <HComponentDefaults>
  **/
  constructor: function(_rect, _parentClass, _options) {
    if(this.isinherited) {
      this.base(_rect, _parentClass, _options);
    }
    else {
      this.isinherited = true;
      this.base(_rect, _parentClass, _options);
      this.isinherited = false;
    }
    
    this.type = '[HButton]';
    
    // When this is true, the component is always drawn with the theme that was
    // active at the creation of the component, not the current theme.
    this.preserveTheme = true;
    
    if(!this.isinherited) {
      this.draw();
    }
    
    this._drawnSize = [this.rect.width, this.rect.height];
  },
  
  setLabelHeightDiff: function( _newHeightDiff ) {
    this._labelHeightDiff = _newHeightDiff;
    return '';
  },
  
  setLabelWidthDiff: function( _newWidthDiff ) {
    this._labelWidthDiff = _newWidthDiff;
    return '';
  },
  
  onIdle: function() {
    if(this.drawn){
      var _width  = this.rect.width;
      var _height = this.rect.height;
      if( (_width != this._drawnSize[0]) || (_height != this._drawnSize[1]) ) {
        this._drawnSize[0] = _width;
        this._drawnSize[1] = _height;
        if( this.markupElemIds.label ) {
          var _heightDiff = parseInt( _height+this._labelHeightDiff, 10);
          prop_set( this.markupElemIds.label, 'line-height', _heightDiff+'px');
          if(is.ie6){
            var _widthDiff  = parseInt(_width + this._labelWidthDiff,  10);
            prop_set( this.markupElemIds.label, 'height', _heightDiff+'px');
            prop_set( this.markupElemIds.label, 'width', _widthDiff+'px');
          }
        }
      }
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
    if(!this.drawn) {
      this.drawRect();
      this._labelHeightDiff=0;
      this._labelWidthDiff=0;
      this.drawMarkup();
    }
    // Make sure the label gets drawn:
    this.refresh();
  },
  
  
/** method: refresh
  * 
  * Redraws only the label, not the whole markup.
  *
  * See also:
  *  <HView.refresh>
  **/
  refresh: function() {
    if(this.drawn) {
      this.base();
      if( this.markupElemIds.label ) {
        // Sets the label's innerHTML:
        elem_set( this.markupElemIds.label, this.label );
      }
    }
  }
  
});

/*** class: HClickButton
  **
  ** Identical to <HButton>, except has the default action of incrementing its
  ** value by one whenever clicked.
  **
  ** Bind to a <HValue> to enable begin monitoring click actions at the
  ** server side.
  **
  ** Enables mouseup/down listening automatically, enables the
  ** <click> method to be extended.
  **
  ** See also:
  **  <HButton>
  ***/
HClickButton = HButton.extend({

/*** constructor: constructor
  **
  ** Parameters:
  **   _rect - An <HRect> object that sets the position and dimensions of this control.
  **   _parentClass - The parent view that this control is to be inserted in.
  **   _label - The string that is shown as the label of this object.
  **
  ***/
  constructor: function(_rect, _parentClass, _options) {
    if(this.isinherited) {
      this.base(_rect, _parentClass, _options);
    }
    else {
      this.isinherited = true;
      this.base(_rect, _parentClass, _options);
      this.isinherited = false;
    }
    
    this.type = '[HClickButton]';
    
    this.setMouseDown(true);
    this.setMouseUp(true);
    this._clickOn = false;
    this._focusOn = false;
    
    if(!this.isinherited) {
      this.draw();
    }
  },
  focus: function() {
    if(!this._clickOn && !this._focusOn) {
      this._focusOn = true;
      this._clickOn = false;
    }
    this.base();
  },
  blur: function() {
    if(!this._clickOn) {
      this._focusOn = false;
    }
    this.base();
  },
  mouseDown: function(x, y, _leftButton) {
    if(this._focusOn) {
      this._clickOn = true;
    }
    this.base(x, y, _leftButton);
  },
  mouseUp: function(x, y, _leftButton) {
    if(this._focusOn && this._clickOn) {
      this._clickOn = false;
      this.click(x, y, _leftButton);
    }
    this.base(x, y, _leftButton);
  },
  
/** event: click
  *
  * Extend to implement your own js-side click actions.
  *
  **/
  click: function(x, y, _leftButton) {
    
    this.setValue(this.value + 1);
    
    if(this.action) {
      this.action();
    }
  }
});


/*** class: HToggleButton
  ** 
  ** A button with a selected status which changes when the button gets clicked.
  ** 
  ** constants: Static constants
  **  cssOn - The CSS class name of a selected item ("on").
  **  cssOff - The CSS class name of an unselected item ("off").
  ** 
  ** vars: Instance variables
  **  type - '[HToggleButton]'
  **  value - A boolean, true when the button is on, false when it's off.
  **
  ** See also:
  **  <HButton> <HClickButton>
  ***/
HToggleButton = HClickButton.extend({

/*** constructor: constructor
  **
  ** Parameters:
  **   _rect - An <HRect> object that sets the position and dimensions of this control.
  **   _parentClass - The parent view that this control is to be inserted in.
  **   _label - The string that is shown as the label of this object.
  **
  ***/
  constructor: function(_rect, _parentClass, _options) {
    if(this.isinherited) {
      this.base(_rect, _parentClass, _options);
    }
    else {
      this.isinherited = true;
      this.base(_rect, _parentClass, _options);
      this.isinherited = false;
    }
    
    this.type = '[HToggleButton]';
    
    if(!this.isinherited) {
      this.draw();
    }
  },
  
  click: function(x, y, _leftButton) {
    this.setValue(!this.value);
  },
  
/** method: setValue
  * 
  * Sets the selected status of the button.
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
  
  
  // Private method. Toggles the button status.
  _updateToggleState: function() {
    if (this.markupElemIds.control) {
      var _elem = elem_get(this.markupElemIds.control);
      this.toggleCSSClass(_elem, HToggleButton.cssOn, this.value);
      this.toggleCSSClass(_elem, HToggleButton.cssOff, !this.value);
    }
  },


/** method: refresh
  * 
  * Redraws only the label and button state, not the whole markup.
  *
  * See also:
  *  <HView.refresh>
  **/
  refresh: function() {
    if(this.drawn) {
      this.base();

      // Label
      if(this.markupElemIds.label) {
        elem_set(this.markupElemIds.label, this.label);
      }

      // Button's toggle element
      if(this.markupElemIds.control) {
        this._updateToggleState();
      }

    }
  }

},{
  cssOn: "on",
  cssOff: "off"
});
