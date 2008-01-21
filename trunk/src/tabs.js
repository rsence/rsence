/** class: HTabBar
  *
  * HTabBar has no logic functionality at all.
  * Its sole purpose is to act as a themeable background for <HTabLabel>:s.
  * Use <HTabControl> as the interface, don't use HTabBar directly.
  *
  * vars: Instance variables
  *  type - '[HTabBar]'
  *
  * Extends:
  *  <HView>
  *
  * See Also:
  *  <HTabControl> <HTabLabel> <HTabView> <HView>
  *
  * NOTE:
  *  HTab -components are still evolving.
  *
  **/
HTabBar = HView.extend({
  
  packageName:   "tab",
  componentName: "tabbar",

/** constructor: constructor
  *
  * Basically just a passthrough for <HView.constructor> it only differs by
  * defining theme preservation and the instance type.
  *
  **/
  constructor: function(_rect, _parentClass) {
    
    if(this.isinherited){
      this.base(_rect, _parentClass);
    }
    else {
      this.isinherited = true;
      this.base(_rect, _parentClass);
      this.isinherited = false;
    }
    
    this.type = '[HTabBar]';
    
    // When this is true, the component is always drawn with the theme that was
    // active at the creation of the component, not the current theme.
    this.preserveTheme = true;
    
    if(!this.isinherited) {
      this.draw();
    }
  },
  
  draw: function() {
    if(!this.drawn) {
      this.drawRect();
      this.drawMarkup();
      this.drawn = true;
    }
    this.drawRect();
  }
  
});

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
        var _isInVisible = (prop_get(this._highlightElementId,
          'visibility') == 'hidden');
          
        // hide highlight-element:
        if(_isInVisible && this.highlight) {
          prop_set(this._highlightElementId, 'visibility', '', true);
        }
        
        // show highlight-element:
        else if (!_isInVisible && !this.highlight) {
          prop_set(this._highlightElementId, 'visibility', 'hidden', true);
        }
      }
    }
  }

});

/** class: HTabView
  *
  * HTabBar has no logic functionality at all.
  * Its sole purpose is to act as a themeable background for the content area of
  * tabs. Use <HTabControl> as the interface, don't use HTabView directly.
  *
  * vars: Instance variables
  *  type - '[HTabView]'
  *
  * Extends:
  *  <HView>
  *
  * See Also:
  *  <HTabControl> <HTabLabel> <HTabBar> <HView>
  *
  * NOTE:
  *  HTab -components are still evolving.
  *
  **/
HTabView = HView.extend({
  
  packageName:   "tab",
  componentName: "tabview",

/** constructor: constructor
  *
  * Basically just a passthrough for <HView.constructor> it only differs by
  * defining theme preservation and the instance type.
  *
  **/
  constructor: function(_rect, _parentClass, _options) {
    if (!_options) {
      _options = {};
    }
    if(this.isinherited) {
      this.base(_rect, _parentClass, _options);
    }
    else {
      this.isinherited = true;
      this.base(_rect, _parentClass, _options);
      this.isinherited = false;
    }
    
    this.type = '[HTabView]';
    
    // When this is true, the component is always drawn with the theme that was
    // active at the creation of the component, not the current theme.
    this.preserveTheme = true;
    
    
    if(!this.isinherited) {
      this.draw();
    }
  },
  
  
/** method: draw
  *
  * Nothing special, gets drawn by <HTabControl>
  **/
  draw: function() {
    if(!this.drawn){
      this.drawMarkup();
      // Bind the element from the HTML template.
      var _temp_id = this.bindDomElement(
        HTabView._tmplElementPrefix + this.elemId);
      
      if (!_temp_id) {
        throw("HTabView: The HTML template must have an element with " +
          "the ID '" + HTabView._tmplElementPrefix + " + this.elemId'.");
      }
      
      // Place the new element as this element's sibling.
      elem_append(this.parent.elemId, _temp_id);
      
      // Move the original element into the document body.
      elem_append(0, this.elemId);
      
      // Delete the original element.
      elem_del(this.elemId);
      
      // Place the new element into the element cache in the same position as
      // the original element was in.
      elem_replace(this.elemId, elem_get(_temp_id));
    }
    this.drawRect();
  }
  
},{
  _tmplElementPrefix: "tabview"
});
/** class: HTabControl
  *
  * HTabControl is the main component of the <HTabBar> / <HTabLabel> /
  * <HTabControl> / <HTabView> collection. HTabControl is, in other words the
  * controlling part of the tab compound component. 
  * HTabControl is a control unit that allows multiple pages of information 
  * to be placed in one position. Above the tabcontrol, there is a row of tabs where the user may
  * select the page to be displayed. Tab's pages are called tab items. 
  * A tabcontrol component can contain a lot of different GUI components. 
  * TabControl view or theme can be changed; the helmiTheme is used by default.
  *
  * Use HTabControl whenever you need to implement a client-side tabbing interface.
  *
  * vars: Instance variables
  *  type - '[HTabControl]'
  *  tabs - A Hash of tabs. The key is the tab id and the value is the HView
  *         with all the component contents of the tab.
  *  labelViews - A <HTabBar> instance
  *  activeTab - The tab id of the currently selected tab.
  *
  * Extends:
  *  <HControl>
  *
  * See Also:
  *  <HTabBar> <HTabLabel> <HTabView> <HView>
  *
  * NOTE:
  *  HTab -components are still evolving.
  *
  **/
HTabControl = HControl.extend({

  packageName:   "tab",
  componentName: "tabcontrol",
  
/** constructor: constructor
  *
  * Constructs a new HTabControl and initializes subcomponents.
  * <HTabControl.draw> performs initialization phase2, the component is not
  * fully functional before that.
  *
  * Parameters:
  *  _rect - The rectangle of the component. See <HView.constructor>.
  *  _parentClass - The parent component of the component. See
  *                 <HView.constructor>.
  *  _options - (Object, optional)
  *
  * _options attributes:
  *  label - The default label for new tabs (default: 'Untitled')
  *  labelHeight - The default height (in px) for new tabs (default: 21)
  *  labelWidth - The default width (in px) for new tabs (default: 192)
  *
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
    
    // Some defaults
    this.tabDefaults = new (Base.extend({
      label: 'Untitled', // The default label
      labelHeight: 21,   // The height of the label bar
      labelWidth: 192    // The default width of a label item
    }).extend(_options));
    
    
    this.type = '[HTabControl]';
    this.preserveTheme = true;
    
    // Shortcuts for using tabs
    this.tabs = {};
    
    // Array that holds the tab IDs in the correct order.
    this._tabsInOrder = [];
    
    // Flag, switches to false after draw is called.
    this._notDone = true;
    
    if(!this.isinherited) {
      this.draw();
    }
  },
  
/** method: draw
  *
  * Performs tab initialization phase 2. Initializes structures and
  * subcomponents. Does nothing except what <HControl.draw> does after the first
  * time called.
  *
  * See also:
  *  <constructor> <HControl.draw>
  **/
  draw: function() {
    if(!this.drawn) {
      var _rect = this.rect;
      // Tab selection/label buttons here
      var _labelsRect = new HRect(0, 0, _rect.width,
        this.tabDefaults.labelHeight);
      this.labelViews = new HTabBar(_labelsRect, this);
      this.labelViews.draw();
      this._labelsRightMostPx = 0;
      // View items here
      var _viewXLeft = 0;
      var _viewYTop  = this.tabDefaults.labelHeight;
      var _viewXRight = _rect.width;
      var _viewYBottom = (_rect.height - this.tabDefaults.labelHeight);
      var _viewRect = new HRect(_viewXLeft, _viewYTop, _viewXRight,
        _viewYBottom);
      this.tabDefaults.rect = new HRect(0, 0, _viewRect.width,
        _viewRect.height);
      this.tabViews = new HView(_viewRect, this);
      this.tabViews.draw();
      // Mark the currently selected item here (-1 means N/A)
      this.activeTab = -1;
      this.drawn = true;
    }
    this.drawRect();
  },
  
/** method: addTab
  *
  * Makes a new tab. Parameters are optional, not supported and will change in a
  * later revision. 
  *
  * Parameters:
  *  _tabView - (optional) A <HView> or <HControl> -compatible object to attach
  *             to the tab. Default to create a new <HTabView> with defaults
  *             defined in the constructor. 
  *  _selectOnCreation - (optional) Selects the tab (brings it to 'front') after
  *             it's created.
  *  _label - (optional) The label to assign to the new tab.
  *  _labelWidth - (optional) The width of the tab label component.
  *
  * Returns:
  *  The tab id, use it to refer to <tabs>.
  *
  **/
  addTab: function(_tabView, _selectOnCreation, _label, _labelWidth) {
    if(this._notDone) {
      this.draw();
    }
    // The plain HView should be replaced with a more sophisticated HTabView
    if(!_tabView) {
      var _tabRect = this.tabDefaults.rect;
      // Modify the parameter _tabView.
      _tabView = new HTabView(_tabRect, this.tabViews);
      _tabView.draw();
    }
    if(!_label) {
      var _label = this.tabDefaults.label;
    }
    
    // Hide the TabView by default
    _tabView.hide();
    
    // Force the selection of the first tab that is created, so the tab control
    // doesn't end up showing nothing.
    if (this._tabsInOrder.length == 0) {
      _selectOnCreation = true;
    }
    
    var _tabViewId = _tabView.viewId;
    this.tabs[_tabViewId] = _tabView;
    
    this._tabsInOrder.push(_tabViewId);
    
    // The rightmost label pixel (the leftmost coordinate of this one)
    //var _labelRectXLeft = this._labelsRightMostPx;
    
    // It should now be correct for HRect usage:
    //var _labelRectXRight = this._labelsRightMostPx;
    
    // avoid double borders:
    // TODO: Don't assume that the border width of the label is one pixel.
    //this._labelsRightMostPx--;
    //var _tabLabelRect = new HRect(_labelRectXLeft, 0, _labelRectXRight,
    //  this.tabDefaults.labelHeight);
      
    var _tabLabelOpts = {
      label:      _label,
      tabId:      _tabViewId,
      tabControl: this,
      highlight:    false
    };
    var _tabLabel = new HTabLabel(
      this._labelsRightMostPx,
      this.tabDefaults.labelHeight,
      this.labelViews,
      _tabLabelOpts
    );
    // Append the specified width (should be made automatic later)
    this._labelsRightMostPx += (_tabLabel.rect.width-1);
    
    // The label id should match the view id
    var _tabLabelId = _tabLabel.viewId;
    _tabLabel.draw();
    
    if(_tabLabelId != _tabViewId) {
      throw("HTabControlAddTabError: tabId Mismatch (" + _tabLabelId + " vs. " +
        _tabViewId + ")");
    }
    
    if(_selectOnCreation) {
      this.selectTab(_tabViewId);
    }
    
    this.refresh();
    
    return _tabViewId;
  },
  
  // Private method.
  // Calculates and sets the rectangles for the tabs currently in this tab
  // control.
  _recalculateRectsForTabLabels: function() {
    if (this._tabsInOrder.length == 0) {
      // No tabs left, just reset the rightmost pixel value.
      this._labelsRightMostPx = 0;
    }
    
    var _labelRectXLeft = 0;
    for (var i = 0; i < this._tabsInOrder.length; i++) {
      // The tab label object.
      var _label = this.labelViews.views[this._tabsInOrder[i]];
      
      // Figure out the left and right edges of the rectangle and use the
      // existing top and bottom edges.
      this._labelsRightMostPx = _labelRectXLeft + _label.rect.width;
      
      var _tabLabelRect = new HRect(_labelRectXLeft, _label.rect.top,
        this._labelsRightMostPx, _label.rect.bottom);
        
      this.labelViews.views[this._tabsInOrder[i]].setRect(_tabLabelRect);
      
      // TODO: Don't assume that the border width of the label is one pixel.
      this._labelsRightMostPx--;
      _labelRectXLeft = this._labelsRightMostPx;
      
    }
  },
  
/** method: removeTab
  *
  * Removes a tab and the view that it holds. If a selected tab is removed, the
  * selection is moved to the previous tab (or to the next tab if the deleted
  * tab is the first one).
  *
  * Parameters:
  *  _tabId - The ID of the tab to be removed.
  *
  **/
  removeTab: function(_tabId) {
    if (this.tabs[_tabId] instanceof HTabView) {
      // If the tab to be deleted is currently selected, try to select the
      // previous tab first, and if that fails, select the next tab.
      if (this.activeTab == _tabId) {
        if (!this.selectPreviousTab()) {
          if (!this.selectNextTab()) {
            // If previous and next selection fail, this must be the last tab
            // on this tab control. When the last tab gets deleted, active tab
            // id is negative.
            this.activeTab = -1;
          }
        }
      }
      
      // Get rid of the view and the label of the removed tab.
      this.tabViews.destroyView(_tabId);
      this.labelViews.destroyView(_tabId);
      
      // Update the arrays that keep track of the tabs.
      this.tabs[_tabId] = null;
      var _tabIndex = this._tabsInOrder.indexOf(_tabId);
      this._tabsInOrder.splice(_tabIndex, 1);
      
      // When a tab gets removed, recalculate the positions of the remaining
      // tabs so there will be no blank space between tabs.
      this._recalculateRectsForTabLabels();
    }
  },
  
/** method: removeSelectedTab
  *
  * Removes the tab and its content that is currently selected.
  *
  **/
  removeSelectedTab: function() {
    this.removeTab(this.activeTab);
  },
  
/** method: selectNextTab
  *
  * Selects the next tab.
  *
  * Returns:
  *  True if there was a next tab, and the selected tab changed, false if the
  *  currently selected tab is the last one, and selection didn't change.
  *
  **/
  selectNextTab: function() {
    var _tabIndex = this._tabsInOrder.indexOf(this.activeTab);
    if (_tabIndex < this._tabsInOrder.length - 1) {
      return this.selectTab(this._tabsInOrder[_tabIndex + 1]);
    }
    
    return false;
  },
  
/** method: selectPreviousTab
  *
  * Selects the previous tab.
  *
  * Returns:
  *  True if there was a previous tab, and the selected tab changed, false if
  *  the currently selected tab is the first one, and selection didn't change.
  *
  **/
  selectPreviousTab: function() {
    var _tabIndex = this._tabsInOrder.indexOf(this.activeTab);
    if (_tabIndex > 0) {
      return this.selectTab(this._tabsInOrder[_tabIndex - 1]);
    }
    
    return false;
  },
  
/** method: selectTab
  *
  * Selects (brings to 'front' / 'shows' / 'activates') the selected tab id and
  * hides the previously active tab.
  *
  * Parameters:
  *  _tabId - A valid tab id.
  *
  * Returns:
  *  True if the active tab was changed, false if the given tab id was invalid
  *  or the same as the currently active tab.
  * 
  **/
  selectTab: function(_tabId) {
    // Don't reselect the active tab.
    if(this.activeTab != _tabId) {
      
      // Check for an invalid tab id.
      var _tabIndex = this._tabsInOrder.indexOf(_tabId);
      if (_tabIndex > -1) {
        
        if(this.activeTab != -1) {
          this.tabViews.views[this.activeTab].setStyle('display', 'none');
          this.tabViews.views[this.activeTab].hide();
          this.labelViews.views[this.activeTab].setHighlight(false);
        }
        this.activeTab = _tabId;
        this.tabViews.views[this.activeTab].setStyle('display', 'block');
        this.tabViews.views[this.activeTab].show();
        this.labelViews.views[this.activeTab].setHighlight(true);
        
        return true;
        
      }
    }
    return false;
  },
  
/** method: numberOfTabs
  *
  * Returns:
  *  The number of tabs currently on this tab control.
  *
  **/
  numberOfTabs: function() {
    return this._tabsInOrder.length;
  }
  
});

// Alias shortcut.
HTab = HTabControl;