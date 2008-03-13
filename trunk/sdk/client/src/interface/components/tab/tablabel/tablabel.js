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

/** class: HTabLabel
  *
  * HTabLabel displays the 'tab title button' above the tab view.
  * Use <HTabControl> as the interface, don't use HTabLabel directly.
  *
  * vars: Instance variables
  *  type - '[HTabControl]'
  *  highlight - The highlight status of the tab. True when tab is selected,
  *            otherwise false.
  *
  * Extends:
  *  <HControl>
  *
  * See Also:
  *  <HTabControl> <HTabBar> <HTabView> <HView>
  *
  * NOTE:
  *  HTab -components are still evolving.
  *
  **/
HTabLabel = HButton.extend({
  
  packageName:   "tab",
  componentName: "tablabel",

  constructor: function(_left, _height, _parentClass, _options) {
    
    if(!_options) {
      var _options = {};
    }
    
    // Throw some errors, if used incorrectly.
    // NOTE: Zero is a valid ID value, we cannot use if (!_options.tabId) to
    // check for errors.
    if(!_options.label) {
      throw("HTabLabelConstructionError: No label specified!");
    }
    if(null === _options.tabId || undefined === _options.tabId) {
      throw("HTabLabelConstructionError: No id specified!");
    }
    if(!_options.tabControl) {
      throw("HTabLabelConstructionError: No control specified!");
    }
    
    // This will default to false
    if(!_options.highlight) {
      _options.highlight = false;
    }
    
    // Should always listen to mouseDown (to activate itself)
    if(!_options.events) {
      _options.events = {
        mouseDown: true
      };
    }
    var _rect = new HRect(_left,0,_left+5,_height);
    if(this.isinherited) {
      this.base(_rect, _parentClass, _options);
    }
    else {
      this.isinherited = true;
      this.base(_rect, _parentClass, _options);
      this.isinherited = false;
    }
    
    this.type = '[HTabLabel]';
    
    this._tmplHighlightPrefix = "tabhighlight";
    
    this.tabControl = _options.tabControl;
    this.tabId = _options.tabId;
    
    this.setHighlight(_options.highlight);
    
    if(!this.isinherited) {
      this.draw();
    }
  },
  
/** method: setHighlight
  *
  * Sets the tab 'highlighted' or not, depending on the flag parameter. Called
  * via <HTabControl.selectTab>. Actual functionality in <refresh>
  *
  * Parameters:
  *  _flag - A flag that tells the label to highlight when true and hide the
  *          highlight when false.
  *
  * See also:
  *  <HTabControl.selectTab> <refresh>
  **/
  setHighlight: function(_flag) {
    this.highlight = _flag;
    if(_flag) {
      this.tabControl.selectTab(this.tabId);
    }
    this.refresh();
  },
  
/** event: mouseDown
  * 
  * Performs tab selection/highlights.
  * Actual functionality in <HTabControl.selectTab> and <setHighlight>.
  * 
  * See also:
  *  <HTabControl.selectTab> <setHighlight>
  **/
  mouseDown: function(_x, _y, _button) {
    if(this.tabControl && !this.highlight) {
      this.setHighlight(true);
    }
  },
  
/** method: setValue
  *
  * Sets the highlight based on the value, use as a boolean flag.
  *
  * Parameters:
  *  _value - Same as the flag in in <setHighlight>
  *
  * See also:
  *  <setHighlight>
  *
  **/
  setValue: function(_value) {
    this.base(_value);
    if(this.value && this.tabControl) {
      this.tabControl.selectTab(this.tabId);
    }
  },
  
/** method: refresh
  * 
  * Updates visual properties of the tab label.
  * Specifically, sets the visibility of the highlight effect element, if
  * applicable.
  *
  * See also:
  *  <setHighlight>
  **/
  refresh: function() {
    if (this.drawn) {
      if(this.markupElemIds['label']){
        var _labelWidth = this.stringWidth( this.label, null, this.markupElemIds['label'] );
        this.rect.setWidth(_labelWidth+16);
      }
      this.base();
      if(!this._highlightElementId) {
        this._highlightElementId = this.bindDomElement(
          this._tmplHighlightPrefix + this.elemId);
      }
      if (this._highlightElementId) {
        var _isInVisible = (ELEM.getStyle(this._highlightElementId,'visibility') == 'hidden');
          
        // hide highlight-element:
        if(_isInVisible && this.highlight) {
          ELEM.setStyle(this._highlightElementId, 'visibility', '', true);
        }
        
        // show highlight-element:
        else if (!_isInVisible && !this.highlight) {
          ELEM.setStyle(this._highlightElementId, 'visibility', 'hidden', true);
        }
      }
    }
  }

});

