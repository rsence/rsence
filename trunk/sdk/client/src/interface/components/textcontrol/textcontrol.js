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

/*** class: HTextControl
  **
  ** HTextControl is a control unit that represents an editable input line of text. 
  ** Commonly, textcontrol is used as a single text field in the request forms. 
  ** HTextControl view or theme can be changed; the helmiTheme is used by default.
  **
  ** vars: Instance variables
  **  type - '[HTextControl]'
  **  value - The string that is currently held by this object.
  **
  ** Extends:
  **  <HControl>
  **
  ** See also:
  **  <HControl>
  ***/
HTextControl = HControl.extend({
  
  componentName: "textcontrol",

/** constructor: constructor
  *
  * Parameters:
  *   _rect - An <HRect> object that sets the position and dimensions of this control.
  *   _parentClass - The parent view that this control is to be inserted in.
  *   _options - (optional) All other parameters. See <HComponentDefaults>.
  **/
  constructor: function(_rect, _parentClass, _options) {
    
    this.markupElemIds = {};
    
    if(this.isinherited) {
      this.base(_rect, _parentClass, _options);
    }
    else {
      this.isinherited = true;
      this.base(_rect, _parentClass, _options);
      this.isinherited = false;
    }
    
    this.type = '[HTextControl]';
    
    // When this is true, the component is always drawn with the theme that was
    // active at the creation of the component, not the current theme.
    this.preserveTheme = true;
    if(!this.isinherited) {
      this.draw();
    }
  },
  
  
/** method: die
  *
  * Unregisters some text control specific events before destroying the view.
  *
  * See also:
  *  <HView.die> <HControl.die>
  **/
  die: function() {
    if(this.drawn) {
      var _domElementId = 'value' + this.elemId;
      Event.stopObserving(_domElementId, 'mousedown', this._stopPropagation);
      Event.stopObserving(_domElementId, 'mousemove', this._stopPropagation);
      Event.stopObserving(_domElementId, 'focus', this._activateControl);
      Event.stopObserving(_domElementId, 'blur', this._deactivateControl);
    }
    this.base();
  },
  
  
/** method: setEnabled
  * 
  * Enables/disables the actual text control in addition to changing the look of
  * the field.
  * 
  * Parameters:
  *   _flag - True to enable, false to disable.
  *
  * See also:
  *  <HControl.setEnabled>
  **/
  setEnabled: function(_flag) {
    this.base(_flag);
    if(this.markupElemIds.value) {
      ELEM.setAttr(this.markupElemIds.value,'disabled',!this.enabled);
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
      this.drawMarkup();
      
      if(this.markupElemIds.value) {
        // Prevents errors in FF when setting the value programmatically.
        ELEM.setAttr(this.markupElemIds.value,"autocomplete", "off");
        this.setEnabled(this.enabled);
      }
      
      this._setLowLevelEventListeners();
      
      this.drawn = true;
    }

    this.refresh(); // Make sure the value gets drawn.
  },
  
  
  // Private method.
  // Overrides the event manager's mouseDown and mouseMove events in order to
  // get the text field to work in an intuitive way. Also the focus and blur
  // listeners are added to handle the active control management, which the
  // event manager cannot do when the mouseDown is overridden.
  //
  // The methods are set as member variables so that we can get rid of them when
  // the text control is destroyed.
  _setLowLevelEventListeners: function() {
    var _domElementId = 'value'+this.elemId;
    // Allow focusing by mouse click. Only do this once per control. This is
    // handled by the draw method with the this.drawn boolean.
    this._stopPropagation = function(_event) {
      HControl.stopPropagation(_event);
    };

    Event.observe(_domElementId, 'mousedown', this._stopPropagation, false);
    Event.observe(_domElementId, 'mousemove', this._stopPropagation, false);
      
    // Set the focus listener to the text field so the text control can get
    // informed when it gains the active status. Also the lostActiveStatus
    // needs this to work so the event manager knows the correct active
    // control.
    var _that = this;
    this._activateControl = function(event) {
      // When the text field gets focus, make this control active.
      EVENT.changeActiveControl(_that);
    };
    Event.observe(_domElementId, 'focus', this._activateControl, false);
    
    // The blur listener unsets the active control. It is used when the user
    // moves the focus out of the document (clicks on the browser's address bar
    // for example).
    this._deactivateControl = function(event) {
      // Explicitly update the value when the field loses focus.
      _that._updateValue();
      EVENT.changeActiveControl(null);
    };
    Event.observe(_domElementId, 'blur', this._deactivateControl, false);
  },
  
  
/** method: refresh
  * 
  * Redraws only the value, not the whole markup.
  *
  * See also:
  *  <HView.refresh>
  **/
  refresh: function() {
    this.base();
    if (this.markupElemIds.value) {
      if (ELEM.getAttr(this.markupElemIds.value,'value',true) != this.value) {
        ELEM.setAttr(this.markupElemIds.value,'value',this.value,true);
      }
    }
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
    if (this.active) {
      this._updateValue();
    }
  },
  
  
  // Private method.
  // Updates the component's value from the typed in text.
  _updateValue: function() {
    if (this.drawn) {
      
      if (ELEM.getAttr(this.markupElemIds.value,'value',true) != this.value) {
        this.setValue(ELEM.getAttr(this.markupElemIds.value,'value',true));
      }
      
    }
  },
  
  
/** event: lostActiveStatus
  * 
  * Makes sure that the focus is removed from the text field when another
  * component is activated.
  *
  * See also:
  *  <HControl.lostActiveStatus>
  **/
  lostActiveStatus: function(_newActiveControl) {
    if (this.markupElemIds.value) {
      ELEM.get(this.markupElemIds.value).blur();
    }
  }
  
});

