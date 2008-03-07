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

/*** class: HTreeControl
  **
  ** HTreeControl is a control unit that displays hierarchical data and allows the user
  ** to expand and collapse its nodes. The navigation interface is one of the most common and
  ** important parts of any application that lets users quickly get desired information.
  ** The HTreeControl offers functionality for selecting, deselecting, adding
  ** and removing nodes. HTreeControl view or theme can be changed; 
  ** the helmiTheme is used by default.
  **
  ** constants: Static constants
  **  H_SINGLE_SELECTION_TREE - A tree type that allows the user to select only
  **                            one item in the tree at a time. This is the
  **                            default setting.
  **  H_MULTIPLE_SELECTION_TREE - A tree type that allows the user to select any
  **                              number of items by holding down an Option key
  **                              or a Shift key.
  ** 
  ** vars: Instance variables
  **  type - '[HTreeControl]'
  **  childNodes - An array of nodes on the tree at the root level.
  **  selectedNodes - An array of currently selected nodes on the tree.
  **  treeType - The type of the tree, either
  **    HTreeControl.H_MULTIPLE_SELECTION_TREE or
  **    HTreeControl.H_SINGLE_SELECTION_TREE (default)
  **  staticNodeWidth - A boolean, false (default) when the nodes should adjust
  **     their width by their content, and true when they should follow the
  **     <HRect> object given in their constructor.
  **  allowNodeDragging - A boolean, false (default) when the nodes on this tree
  **     cannot be dragged, and true when the nodes are draggable.
  **
  ** Extends:
  **  <HControl>
  **
  ** See also:
  **  <HTreeNode>
  ***/
// TODO: Remove duplicate code between HTreeControl and HTreeNode by adding a
// special root node.
HTreeControl = HControl.extend({

  packageName:   "tree",
  componentName: "treecontrol",

/** constructor: constructor
  *
  * Parameters:
  *   _rect - An <HRect> object that sets the position and dimensions of this
  *     control.
  *   _parentClass - The parent view that this control is to be inserted in.
  *   _options - (optional) All other parameters. See <HComponentDefaults> and
  *     <_options> below.
  *
  * vars: _options
  *  allowNodeDragging - A boolean, should the nodes on this tree be draggable.
  *     Defaults to false.
  *  staticNodeWidth - A boolean, should the nodes' content obey the <HRect>
  *     object of the node. Defaults to false, the width is scaled to fit the
  *     content.
  *  treeType - The type of the tree, see <Instance variables> for details.
  *
  **/
  constructor: function(_rect, _parentClass, _options) {
    
    if (!_options) {
      _options = {};
    }
    _options.events = {
      mouseDown: false,
      mouseUp:   false,
      draggable: false
    };
    
    // Default options.
    var _defaults = Base.extend({
      staticNodeWidth: false,
      allowNodeDragging: false,
      treeType: HTreeControl.H_SINGLE_SELECTION_TREE
    });
    this.options = new (_defaults.extend(_options))();
    
    if(this.isinherited) {
      this.base(_rect, _parentClass, _options);
    }
    else {
      this.isinherited = true;
      this.base(_rect, _parentClass, _options);
      this.isinherited = false;
    }

    this.type = '[HTreeControl]';
    
    // When this is true, the component is always drawn with the theme that was
    // active at the creation of the component, not the current theme.
    this.preserveTheme = true;
    
    
    this.childNodes = [];
    
    this.setTreeType(this.options.treeType);
    this.selectedNodes = [];
    
    this.setStaticNodeWidth(this.options.staticNodeWidth);
    this.allowNodeDragging = this.options.allowNodeDragging;
    
    if(!this.isinherited) {
      this.draw();
    }
  },
  
  
/** method: expandAll
  * 
  * Expand all the nodes on this tree.
  *
  * See also:
  *  <HTreeNode.expand>
  **/
  expandAll: function() {
    for(var i = 0; i < this.childNodes.length; i++) {
      this.childNodes[i].expandAllChildren();
      this.childNodes[i].expand();
    }
  },
  
  
/** method: collapseAll
  * 
  * Collapse all the nodes on this tree.
  *
  * See also:
  *  <HTreeNode.collapse>
  **/
  collapseAll: function() {
    for(var i = 0; i < this.childNodes.length; i++) {
      this.childNodes[i].collapseAllChildren();
      this.childNodes[i].collapse();
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
      
      // Add the child nodes under the DOM element by the ID of
      // "treecontrol"+this.elemId
      this.childContainerId = this.bindDomElement(
        HTreeControl._tmplElementPrefix + this.elemId);
      
      // Loop through all the nodes and do some bindings that can't be done before
      // the nodes have been drawn.
      for(var i = 0; i < this.childNodes.length; i++) {
        this.childNodes[i].postDrawBindings();
      }
      
      
      // Add a scroll event to the tree control, otherwise the nodes will have
      // an incorrect position in the cache. The scroll event launches a timeout
      // that is restarted on each scroll event. This way the position cache is
      // not invalidated during scrolling, only when the scrolling stops
      // completely, or pauses for a while.
      var _that = this;
      Event.observe(elem_get(this.childContainerId), 'scroll',
        function(e) {
          if (_that._invalidateTimeout) {
            // Restart the timeout if we are currently scrolling.
            window.clearTimeout(_that._invalidateTimeout);
            _that._invalidateTimeout = null;
          }
          _that._invalidateTimeout = window.setTimeout(
            // 300 ms seems ok, feel free to adjust if necessary.
            function() {
              _that.invalidatePositionCache();
            }, 300);
        }, false);
      this.drawn = true;
    } // if (!this.drawn)
  },
  
  
/** method: drawChildren
  * 
  * Draws all the nodes on this tree. This should be automatically called from
  * the HTML-template when the tree itself is drawn.
  * 
  * Returns:
  *  The markup of the complete node hierarchy that was drawn.
  *
  * See also:
  *  <HTreeNode.drawChildren>
  **/
  drawChildren: function() {
    var _markupString = "";
    for(var i = 0; i < this.childNodes.length; i++) {
      
      this.childNodes[i].draw();
      _markupString += this.childNodes[i].markup;
      
    }
    
    return _markupString;
  },
  
  
/** method: setTreeType
  * 
  * Sets the tree type whether or not it permits multiple selections. The type
  * must be either H_SINGLE_SELECTION_TREE or H_MULTIPLE_SELECTION_TREE.
  * 
  * When converting a multiple selection tree into a single selection tree, the
  * last item that was selected is made the only selection.
  * 
  * Parameters:
  *   _type - The tree type to be set to the object.
  *
  **/
  setTreeType: function(_type) {
    if (this.treeType == HTreeControl.H_MULTIPLE_SELECTION_TREE &&
      _type == HTreeControl.H_SINGLE_SELECTION_TREE &&
      this.selectedNodes.length > 0) {
        
      var _lastSelection = this.selectedNodes[this.selectedNodes.length - 1];
      this.deselectAllNodes();
      this.selectNode(_lastSelection);
      
    }

    this.treeType = _type;
  },
  
  
/** method: selectNode
  * 
  * Selects the _node. If the extend flag is false, as it is by default, this
  * function removes the highlighting from the previously selected item(s) and
  * highlights the new selection. However, if the extend flag is true, the
  * newly selected items are added to the current selection. Selection
  * extending requires that the tree is in multiple selection mode.
  * 
  * If _ignoreSelectionChange is set to true, the hook function
  * selectionChanged() will not be called. This is important for the
  * functionality of internal methods.
  * 
  * Parameters:
  *   _node - The node on the tree that should be selected.
  *   _extendSelection - A boolean that indicates whether the current selection
  *     should be extended or not.
  *   _ignoreSelectionChange - A boolean that indicates whether the hook method
  *     selectionChanged should be called if the selection does change. This is
  *     mostly used by internal methods.
  *
  * See also:
  *  <HTreeNode.select> <selectionChanged>
  **/
  selectNode: function(_node, _extendSelection, _ignoreSelectionChange) {
    var _didChangeSelection = false;
    if (this.treeType == HTreeControl.H_SINGLE_SELECTION_TREE ||
      !_extendSelection) {
      _didChangeSelection = this.deselectAllNodesExcept(_node, true);
    }
    
    // Select the node only if it's not already selected.
    if (!this.isSelectedNode(_node)) {
      _node.selected = true;
      
      // temporary, for the HR demo
      _node.setValue("mouseUp");
      
      this.selectedNodes.push(_node);
      _node.refreshSelectionStatus();
      _didChangeSelection = true;
    }
    
    // Call the hook function if something actually changed.
    if (!_ignoreSelectionChange && _didChangeSelection) {
      this.selectionChanged();
    }
  },


/** method: deselectNode
  * 
  * Deselects _node.
  * 
  * If _ignoreSelectionChange is set to true, the hook function
  * selectionChanged() will not be called. This is important for the
  * functionality of internal methods.
  * 
  * Parameters:
  *   _node - The node on the tree that should be deselected.
  *     should be extended or not.
  *   _ignoreSelectionChange - A boolean that indicates whether the hook method
  *     selectionChanged should be called if the selection does change. This is
  *     mostly used by internal methods.
  *
  * See also:
  *  <HTreeNode.deselect> <selectionChanged>
  **/
  deselectNode: function(_node, _ignoreSelectionChange) {
    if (this.isSelectedNode(_node)) {
      _node.selected = false;
      
      // temporary, for the HR demo
      _node.setValue("");
      
      this.selectedNodes.splice(this.selectedNodes.indexOf(_node), 1);
      _node.refreshSelectionStatus();
    
      // Call the hook function if something actually changed.
      if (!_ignoreSelectionChange) {
        this.selectionChanged();
      }
    }
  },
  
  
/** method: selectAllNodes
  * 
  * Selects all the nodes on this tree. If the tree is in single selection
  * mode, this method doesn't do anything.
  * 
  * See also:
  *  <HTreeNode.selectAllChildren> <selectionChanged>
  **/
  selectAllNodes: function() {
    if (this.treeType == HTreeControl.H_MULTIPLE_SELECTION_TREE) {
      var _didChangeSelection = this.childNodes.length > 0 &&
        (this.selectedNodes.length != this.childNodes.length);
      
      // Ignore the selection change on all the child selects. This way the hook
      // function gets called only once for each selectAllNodes() call.
      for(var i = 0; i < this.childNodes.length; i++) {
        this.childNodes[i].selectAllChildren(true);
        this.childNodes[i].select(true, true);
      }

      // Call the hook function if something actually changed.
      if (_didChangeSelection) {
        this.selectionChanged();
      }
    }
  },
  
  
/** method: deselectAllNodes
  * 
  * Deselects all the nodes on this tree.
  * 
  * If _ignoreSelectionChange is set to true, the hook function
  * selectionChanged() will not be called. This is important for the
  * functionality of internal methods.
  * 
  * Parameters:
  *   _ignoreSelectionChange - A boolean that indicates whether the hook method
  *     selectionChanged should be called if the selection does change. This is
  *     mostly used by internal methods.
  * 
  * Returns:
  *   True if the selection on the tree changed, false if it didn't.
  *
  * See also:
  *  <HTreeNode.deselectAllChildren> <selectionChanged>
  **/
  deselectAllNodes: function(_ignoreSelectionChange) {
    var _didChangeSelection = (this.selectedNodes.length > 0);
    var _notifySelectionChange = !_ignoreSelectionChange && _didChangeSelection;
      
    // Ignore the selection change on all the child deselects. This way the hook
    // function gets called only once for each deselectAllNodes() call.
    while(this.selectedNodes.length > 0) {
      this.deselectNode(this.selectedNodes[0], true);
    }
    
    if (_notifySelectionChange) {
      this.selectionChanged();
    }
    return _didChangeSelection;
  },
  
  
/** method: deselectAllNodesExcept
  * 
  * Deselects all but _node on this tree.
  * 
  * If _ignoreSelectionChange is set to true, the hook function
  * selectionChanged() will not be called. This is important for the
  * functionality of internal methods.
  * 
  * Parameters:
  *   _node - The node that is _not_ to be deselected.
  *   _ignoreSelectionChange - A boolean that indicates whether the hook method
  *     selectionChanged should be called if the selection does change. This is
  *     mostly used by internal methods.
  * 
  * Returns:
  *   True if the selection on the tree changed, false if it didn't.
  *
  * See also:
  *   <selectionChanged>
  **/
  deselectAllNodesExcept: function(_node, _ignoreSelectionChange) {
    var _didChangeSelection = false;
    if (!this.isSelectedNode(_node)) {
      // If the _node is not selected, just call deselectAllNodes().
      _didChangeSelection = this.deselectAllNodes(_ignoreSelectionChange);
    }
    else {
      // Temporarily remove the _node from the array of selected items.
      this.selectedNodes.splice(this.selectedNodes.indexOf(_node), 1);
      _didChangeSelection = this.deselectAllNodes(_ignoreSelectionChange);
      this.selectedNodes.splice(0, 0, _node);
    }
    return _didChangeSelection;
  },
  
  
/** method: selectedNode
  * 
  * Returns the first selected node on the tree or null when nothing is
  * selected. Helpful when using a single select tree.
  * 
  * Returns:
  *   The node that is currently selected.
  *
  **/
  selectedNode: function() {
    if (this.selectedNodes.length > 0) {
      return this.selectedNodes[0];
    }
    return null;
  },
  
  
/** method: isSelectedNode
  * 
  * Returns true if the given node is selected on this tree, and false if it's
  * not.
  * 
  * Parameters:
  *   _node - The node that is being inspected.
  * 
  * Returns:
  *   A boolean, selection status of the _node.
  *
  **/
  isSelectedNode: function(_node) {
    return (this.selectedNodes.indexOf(_node) > -1);
  },
  
  
/** method: removeAllNodes
  * 
  * Removes all nodes from the tree recursively.
  * 
  * See also:
  *  <HTreeNode.removeAllChildren> <childNodeRemoved>
  **/
  removeAllNodes: function() {
    for(var i = this.childNodes.length - 1; i >= 0; i--) {
      this.childNodes[i].removeAllChildren();
      this.childNodes[i].removeFromParent();
    }
  },
  
  
/** method: importJSON
  * 
  * Imports a set of structured data into the tree.
  * 
  * Data might look something like this:
  *
  * > [
  * >   {
  * >     value:"item 0",
  * >     children:[
  * >       {value:"item 0-1", children:[]},
  * >       {value:"item 0-2", children:[]},
  * >       {value:"item 0-3", children:[]},
  * >       {value:"item 0-4", children:[
  * >         {value:"item 0-4-0", children:[]},
  * >         {value:"item 0-4-1", children:[]},
  * >         {value:"item 0-4-2", children:[]},
  * >         {value:"item 0-4-3", children:[]}
  * >       ]}
  * >     ]
  * >   }
  * > ]
  * 
  * The key 'children' has a special meaning, it contains the array of child
  * nodes of the node being handled. Other keys are treated as values, and
  * they are injected to the created node content after it has been
  * constructed. First, the import script tries to use a setter method for the
  * current value (eg. value has a setter setValue), and if that doesn't
  * exist, the value is assigned directly to that object.
  * Only single argument setters are supported.
  * 
  * Parameters:
  *   _data - Array of data to be imported.
  *   _class - The class of the items to be imported (defaults to <HStringView>).
  *   _rect - A <HRect> object to be used when creating the content objects.
  *   _parentNode - The node that the new nodes are to be imported under. When
  *     omitted, the nodes are created under the root.
  * 
  * See also:
  *  <HTreeNode.importJSON>
  **/
  importJSON: function(_data, _class, _rect, _parentNode) {
    if (typeof(_class) == "undefined" || _class == null) {
      _class = HStringView;
    }
    if (typeof(_rect) == "undefined" || _rect == null) {
      _rect = new HRect();
    }
    if (typeof(_parentNode) == "undefined" || _parentNode == null) {
      _parentNode = this;
    }
    this._insertItems(_data, _class, _parentNode, _rect);
  },
  /**
    * Private method.
    * Recursive import method called from importJSON.
    */
  _insertItems: function(_data, _class, _parent, _rect) {

    var l = _data.length;
    for (var i = 0; i < l; i++) {
      // We should use default constructor here to keep it general, but
      // currently our classes need a parent, and usually a rect too.
      var _item = new _class(_rect, this.app);
      
      for (var _key in _data[i]) {
        // Inject item's member variables from the data. For example the value
        // of _data[i].text is placed in _item.text. Children is a special
        // variable in the data set, thus skipped.
        if (_key != "children") {
          
          var _methodName = _key.substring(0, 1).toUpperCase() +
            _key.substring(1, _key.length);
          _methodName = "set" + _methodName;
          
          if (eval("_item." + _methodName)) {
            // Call setter method.
            eval("_item." + _methodName + "(_data[i][_key])");
          }
          else {
            // No properly named method found, place the value into a property.
            _item[_key] = _data[i][_key];
          }
        }
      }
      
      var _newNode = new HTreeNode(_parent, _item);
      this._insertItems(_data[i].children, _class, _newNode, _rect);
    }

  },
  
  
/** method: setStaticNodeWidth
  * 
  * Nodes' content objects need to implement the <HView.optimizeWidth> method in
  * order to make this effective.
  * 
  * Parameters:
  *   _flag - A boolean, false if the nodes should adjust their width by their
  *   content, and true when they should follow the <HRect> object given in
  *   their constructor.
  * 
  * See also:
  *  <HView.optimizeWidth>
  **/
  setStaticNodeWidth: function(_flag) {
    this.staticNodeWidth = _flag;
  },
  
  
  // TODO: Unnecessary code repetition with tree node. Maybe consider
  // implementing a root node.
/** method: hasChildren
  * 
  * Checks if the tree has child nodes.
  * 
  * Returns:
  *   True if the tree has child nodes and false if it doesn't.
  * 
  * See also:
  *  <HTreeNode.hasChildren>
  **/
  hasChildren: function() {
    return (this.childNodes.length > 0);
  },
  
  
/** method: addChildNode
  * 
  * Adds a node to the tree.
  * 
  * Parameters:
  *   _node - The node to be added into this tree.
  * 
  * See also:
  *  <HTreeNode.addChildNode> <childNodeAdded>
  **/
  addChildNode: function(_node) {
    _node.setTree(this);
    this.childNodes.push(_node);
    if (this.drawn) {
      _node.addDomNode();
    }
    
    this.childNodeAdded(this, _node);
  },
  
  
/** method: removeChildNode
  * 
  * Removes a node from the tree.
  * 
  * Parameters:
  *   _node - The node to be removed from this tree.
  * 
  * See also:
  *  <HTreeNode.removeChildNode> <childNodeRemoved>
  **/
  removeChildNode: function(_node) {
    _node.deselect();
    _node.removeDomNode();
    _node.tree = null;
    this.childNodes.splice(this.childNodes.indexOf(_node), 1);
    
    this.childNodeRemoved(this, _node);
  },
  // //
  
  
/** method: selectionChanged
  * 
  * Implemented by derived classes to do whatever they please when the selection
  * on the tree changes.
  * 
  **/
  selectionChanged: function() {
    // Intentionally left blank.
  },
  
  
/** method: childNodeAdded
  * 
  * Implemented by derived classes to do whatever they please when a node on
  * the tree gains child nodes.
  * 
  * Parameters:
  *   _parentNode - The node that gained a new child.
  *   _childNode - The node that was added to _parentNode.
  * 
  **/
  childNodeAdded: function(_parentNode, _childNode) {
    // TODO: Actually, the _parentNode can be a tree object as well... The root
    // node implementation seems to be the way to go.

    // Intentionally left blank.
  },
  
  
/** method: childNodeRemoved
  * 
  * Implemented by derived classes to do whatever they please when a node on
  * the tree loses child nodes.
  * 
  * Parameters:
  *   _parentNode - The node that lost a child.
  *   _childNode - The node that was removed from _parentNode.
  * 
  **/
  childNodeRemoved: function(_parentNode, _childNode) {
    // TODO: Actually, the _parentNode can be a tree object as well... The root
    // node implementation seems to be the way to go.

    // Intentionally left blank.
  }

},{
  // Class methods and properties
  
  // The user can select only one item in the tree at a time. This is the
  // default setting.
  H_SINGLE_SELECTION_TREE: 0,
  
  // The user can select any number of items by holding down an Option key (for
  // discontinuous selections) or a Shift key (for contiguous selections).
  H_MULTIPLE_SELECTION_TREE: 1,
  
  // Template ID prefixes
  _tmplElementPrefix: "treecontrol"
  
});

