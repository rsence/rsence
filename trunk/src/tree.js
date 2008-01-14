/**
  *  Helmi RIA Platform
  *  Copyright (C) 2006-2007 Helmi Technologies Inc.
  *  
  *  This program is free software; you can redistribute it and/or modify it under the terms
  *  of the GNU General Public License as published by the Free Software Foundation;
  *  either version 2 of the License, or (at your option) any later version. 
  *  This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
  *  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
  *  See the GNU General Public License for more details. 
  *  You should have received a copy of the GNU General Public License along with this program;
  *  if not, write to the Free Software Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
  **/

/*** class: HTreeNode
  **
  ** Node objects are used in a <HTreeControl>. Node displays a view, keeps track
  ** of its child nodes and handles expanding and collapsing of them.
  **
  ** constants: Static constants
  **  cssSelected - The CSS class name of a selected item ("selected").
  **  cssExpanded - The CSS class name of an item that has subitems and it is
  **      expanded ("expanded").
  **  cssCollapsed - The CSS class name of an item has subitems and it is
  **      collapsed ("collapsed").
  **  cssHover - The CSS class name to use when an item that may be dropped on
  **      this node is hovering above this item ("hovering").
  ** 
  ** vars: Instance variables
  **  type - '[HTreeNode]'
  **  childNodes - An array of nodes on the tree at the root level.
  **  tree - Reference to the <HTreeControl> that currently owns this node.
  **  expanded - True when the node is expanded, false when it's collapsed.
  **  selected - True when the node is selected, false when it's not.
  **  toggleControl - A reference to a <HTreeNodeToggleControl> object that
  **      handled user interaction for expanding and collapsing nodes.
  **  content - A reference to a content object currently held by this node. The
  **      content object must be derived from <HControl>.
  **  parent - A reference to the parent view of this node. It's the parent node
  **      of this node too.
  **
  ** Extends:
  **  <HControl>
  **
  ** See also:
  **  <HTreeControl>
  ***/
HTreeNode = HControl.extend({

  packageName:   "tree",
  componentName: "treenode",

/** constructor: constructor
  *
  * Parameters:
  *   _parentClass - The parent view that this control is to be inserted in.
  *       Currently, the _parentClass must always be a valid node or a tree.
  *   _content - The content object of this node. Must be derived from
  *       <HControl>.
  *   _options - See <HControl.constructor> and <HComponentDefaults>
  *
  **/
  constructor: function(_parentClass, _content, _options) {
    var _rect = new HRect();
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
    this.setContent(_content);
    
    this.type = '[HTreeNode]';
    
    // When this is true, the component is always drawn with the theme that was
    // active at the creation of the component, not the current theme.
    this.preserveTheme = true;
    
    
    this.expanded = true;
    this.selected = false;
    
    // Toggle control responds to mouse clicks and collapses/expands this node.
    this.toggleControl = new HTreeNodeToggleControl(this);
    
    // The tree object that hosts this node
    this.tree = null;
    this.childNodes = [];
    
    
    this.parent.addChildNode(this);
    
    
    if(!this.isinherited) {
      this.draw();
    }
  },
  
  
/** method: setContent
  * 
  * Sets the content of this node, an object inherited from <HControl>.
  *
  * Parameters:
  *   _content - The new content object of this node.
  *
  * See also:
  *  <HControl>
  **/
  setContent: function(_content) {
    
    this.content = _content;
    if (this.content) {
      
      // The tree node's dragging functionality has been moved to its content
      // view. These methods are injected to the view here, overriding the
      // original ones.


      // TODO: Clean up, this looks quite bad now.
      // TODO: Move the drag logic to a lower level, maybe to HControl or event
      // manager.
      
      this.content.ownerNode = this;
      
      // this.content.setEnabled(false);
      this.content.setEvents( {
        mouseDown: false,
        mouseUp:   false,
        draggable: true,
        droppable: true
      } );
      
      var _that = this;
      this.content.startDrag = function(_x, _y) {
        this.actuallyDragging = false;
        this.canBeDropped = false;
        
        // Don't start the drag event if it's disabled in the tree control.
        if (this.ownerNode.tree.allowNodeDragging) {
          this.base(_x, _y);
          // Don't start the actual drag until the user has dragged the item for
          // a few pixels.
          this.originX = _x;
          this.originY = _y;
        }
      }; // // // startDrag
      
      this.content.doDrag = function(_x, _y) {
        // Do nothing when dragging is disabled in the tree control.
        if (this.ownerNode.tree.allowNodeDragging) {
          
          if (this.actuallyDragging) {
            // We are currently dragging, follow the mouse with the object.
            prop_set(this.dragElemId, 'left', (_x - this.originX) + 'px');
            prop_set(this.dragElemId, 'top', (_y - this.originY) + 'px');
          }
          else {
            // Not yet dragging, see if mouse has moved enough to drag.
            if (_x > this.originX + 4 || _x < this.originX - 4 ||
              _y > this.originY + 4 || _y < this.originY - 4) {
                
              this.actuallyDragging = true;
              this.canBeDropped = true;
              this.createDragClone(_x, _y);
            }
  
          }
          
        }
      }; // // // doDrag
      
      this.content.endDrag = function(_x, _y) {
        if (this.ownerNode.tree.allowNodeDragging) {
          this.base(_x, _y);
        }
        if (this.actuallyDragging) {
          this.deleteDragClone();
          this.actuallyDragging = false;
        }
        else if (this._focusOn) {
          this.mouseUp(_x, _y);
        }
      }; // // // endDrag
      
      // Focus and blur are used to make sure that the mouseUp is only called
      // when the mouse is still on the node.
      this.content.focus = function() {
        this.base();
        this._focusOn = true;
      };
      this.content.blur = function() {
        this.base();
        this._focusOn = false;
      };

      
      
      // This creates the drag clone when the dragging starts.
      this.content.createDragClone = function(_x, _y) {
        var _element = elem_get(this.ownerNode.elemId);
        
        // Get the node's original position
        var _originalPosition = helmi.Element.getPageLocation(_element, true);
        
        // Duplicate the node element, but hide it first so the raw markup
        // doesn't scare the user.
        this.dragElemId = elem_mk(this.appId);
        prop_set(this.dragElemId, 'visibility', 'hidden', true);
        var _dragClone = _element.cloneNode(true);
        
        // Anonymize the clone by removing all the id attributes in its markup.
        _dragClone.removeAttribute("id");
        _dragClone.innerHTML =
          _dragClone.innerHTML.replace(/\s+id="[^"]*"/g, "");
        this.dragContentElemId = elem_add(_dragClone);
        
        // Ghosting effect
        prop_set(this.dragElemId, 'opacity', 0.50);
        
        // Place the clone on the screen
        prop_set(this.dragElemId, 'position', 'absolute', true);
        prop_set(this.dragElemId, 'left', _originalPosition[0] + 'px', true);
        prop_set(this.dragElemId, 'top', _originalPosition[1] + 'px', true);
        elem_append(this.dragElemId, this.dragContentElemId);
        
        // Bring to temporary front
        prop_set(this.dragElemId, 'z-index', this.app.viewsZOrder.length);
        prop_set(this.dragElemId, 'visibility', 'visible', true);

        
        // Store the original position, used in doDrag()
        this.originX = this.originX - _originalPosition[0];
        this.originY = this.originY - _originalPosition[1];

      };
      // Removes the drag clone from the screen.
      this.content.deleteDragClone = function() {
        if(this.dragContentElemId) {
          elem_del(this.dragContentElemId);
          this.dragContentElemId = null;
        }
        if(this.dragElemId) {
          elem_del(this.dragElemId);
          this.dragElemId = null;
        }
      };
      
      
      this.content.mouseUp = function(_x, _y) {
        this.ownerNode.mouseUp(_x, _y);
      };
      
      this.content.onDrop = function(_object) {
        if (!this.isValidDroppable(_object) || !_object.canBeDropped) {
          return;
        }
        _object.canBeDropped = false;
        this.ownerNode.setHover(false);
        _object.ownerNode.moveUnder(this.ownerNode);
      };
  
      this.content.onHoverStart = function(_object) {
        if (!this.isValidDroppable(_object)) {
          return;
        }
        this.ownerNode.setHover(true);
      };
      this.content.onHoverEnd = function(_object) {
        if (!this.isValidDroppable(_object)) {
          return;
        }
        this.ownerNode.setHover(false);
      };
      this.content.isValidDroppable = function(_object) {
        // The droppable is always invalid when dragging has been disabled in
        // the tree control. This disables hovering too.
        if(!this.ownerNode.tree.allowNodeDragging ||
          this == _object || // drop on to itself, should never happen
          !this.ownerNode || !_object.ownerNode || // not inside of a node
          this.ownerNode == _object.ownerNode.parent || // own parent
          this.ownerNode.isDescendantOf(_object.ownerNode)) { // own descendant
          return false;
        }
        return true;
      }
      
    }
    
    // Content object's method injection ends.
  },
  
  
/** method: setHover
  * 
  * Sets the hover status of this node. When the _flag is true, the content
  * element of this node gets a CSS class attached to it, defined in a static
  * constant cssHover. When the _flag is false, the CSS class is removed.
  * This is called automatically by the drag event when the hover status
  * changes.
  *
  * Parameters:
  *   _flag - Boolean value of the hover status to be set.
  *
  **/
  setHover: function(_flag) {
  	this.toggleCSSClass(HTreeNode._tmplContentPrefix + this.elemId,
      HTreeNode.cssHover, _flag);
  },
  
  
/** method: isDescendantOf
  * 
  * Returns true when this node is found under _ancestor, at any depth, and
  * false if it doesn't.
  *
  * Parameters:
  *   _ancestor - The assumed ancestor node of this node.
  *
  **/
  isDescendantOf: function(_ancestor) {
    if(this.parent == _ancestor) {
      return true;
    }
    else if (!this.parent.isDescendantOf) {
      return false;
    }
    else {
      return this.parent.isDescendantOf(_ancestor);
    }
  },
  
  
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
  * Appends the _node into this nodes list of child nodes.
  *
  * Parameters:
  *   _node - The node to be added as a child node.
  *
  * See also:
  *  <HTreeNode.addChildNode> <HTreeControl.childNodeAdded>
  **/
  addChildNode: function(_node) {
    if (this.tree &&  this.tree != _node.tree) {
      _node.setTree(this.tree);
    }
    this.childNodes.push(_node);
    if (this.drawn) {
      _node.addDomNode();
      this._refreshToggler();
    }
    
    // Notify the tree about the change.
    this.tree.childNodeAdded(this, _node);
  },
  
  
  /**
    * Not for public API, use addChildNode.
    * Adds the DOM node of this tree node to the tree.
    */
  addDomNode: function() {
    if (!this.drawn) {
      
      // Kludge to keep MSIE happy. Move the element to document body before
      // drawing the markup with innerHTML, and then move it to the parent
      // element's child container.
      var _element = elem_get(this.elemId);
      elem_get(this.appId).appendChild(_element);
      
      this.draw();
      this.postDrawBindings();
      
      var _parentElem = elem_get(this.parent.childContainerId);
      // Element has changed after calling postDrawBindings
      _element = elem_get(this.elemId);
      _parentElem.appendChild(_element);
      
      this.tree.invalidatePositionCache();
    }
  },
  
  
/** method: setTree
  * 
  * Updates this node's and its children's tree property.
  * 
  * Parameters:
  *   _tree - New tree of this node, should be an instance of <HTreeControl>.
  *
  **/
  setTree: function(_tree) {
    this.tree = _tree;
    for(var i = 0; i < this.childNodes.length; i++) {
      this.childNodes[i].setTree(_tree);
    }
  },
  
  
/** method: removeChildNode
  * 
  * Removes the given child node from this node.
  * 
  * Parameters:
  *   _node - The child node to be removed from this node.
  * 
  * See also:
  *  <HTreeControl.removeChildNode> <HTreeControl.childNodeRemoved>
  **/
  removeChildNode: function(_node) {
    _node.deselect();
    _node.removeDomNode();
    _node.tree = null;
    this.childNodes.splice(this.childNodes.indexOf(_node), 1);
    this._refreshToggler();
    
    // Notify the tree about the change.
    this.tree.childNodeRemoved(this, _node);
  },


/** method: removeFromParent
  * 
  * Removes this node from its parent.
  * 
  * See also:
  *  <removeChildNode> <HTreeControl.childNodeRemoved>
  **/
  removeFromParent: function() {
    this.parent.removeChildNode(this);
  },
  
  
/** method: removeAllChildren
  * 
  * Removes all the child nodes of this node, but not this node.
  * 
  * See also:
  *  <HTreeControl.removeAllNodes> <HTreeControl.childNodeRemoved>
  **/
  removeAllChildren: function() {
    for(var i = this.childNodes.length - 1; i >= 0; i--) {
      this.childNodes[i].removeAllChildren();
      this.childNodes[i].removeFromParent();
    }
  },
  
  
  /**
    * Not for public API, use removeChildNode.
    * Removes the DOM node of this tree node from the tree.
    */
  removeDomNode: function() {
    if (this.drawn) {
      var _elem = elem_get(this.elemId);
      _elem.parentNode.removeChild(_elem);
      
      this.tree.invalidatePositionCache();
    }
  },
  
  
/** method: collapse
  * 
  * Collapses this node, hiding the child nodes.
  * 
  **/
  collapse: function() {
    if(!this.expanded) {
      return;
    }
    this.expanded = false;
    this._updateExpansionStatus();
  },
  
  
/** method: expand
  * 
  * Expands this node, exposing the child nodes.
  * 
  **/
  expand: function() {
    if(this.expanded) {
      return;
    }
    this.expanded = true;
    this._updateExpansionStatus();
  },
  
  
  // Private method
  // Handles showing and hiding the child nodes and refreshes the toggler
  // status. Called from collapse and expand.
  _updateExpansionStatus: function() {
    if (this.drawn) {
      if(this.expanded) {
        prop_set(this.childContainerId, 'display', 'block');
      }
      else {
        prop_set(this.childContainerId, 'display', 'none');
      }
      this._refreshToggler();
      
      this.tree.invalidatePositionCache();
    }
  },
  
  
/** method: collapseAllChildren
  * 
  * Collapses the child nodes of this node, but not this node.
  * 
  * See also:
  *  <HTreeControl.collapseAll>
  **/
  collapseAllChildren: function() {
    for(var i = 0; i < this.childNodes.length; i++) {
      this.childNodes[i].collapseAllChildren();
      this.childNodes[i].collapse();
    }
  },
  
  
/** method: expandAllChildren
  * 
  * Expands the child nodes of this node, but not this node.
  * 
  * See also:
  *  <HTreeControl.expandAll>
  **/
  expandAllChildren: function() {
    for(var i = 0; i < this.childNodes.length; i++) {
      this.childNodes[i].expandAllChildren();
      this.childNodes[i].expand();
    }
  },
  
  
/** method: toggle
  * 
  * Expand when collapsed, collapse when expanded.
  * 
  * See also:
  *  <collapse> <expand>
  **/
  toggle: function() {
    if(this.expanded) {
      this.collapse();
    }
    else {
      this.expand();
    }
  },
  
  
  // Private method
  // Updates the CSS class on the toggler control depending on whether the node
  // has child nodes and is expanded or collapsed.
  _refreshToggler: function() {
    var _hasChildren = this.hasChildren();
    this.toggleCSSClass(HTreeNode._tmplTogglerPrefix + this.elemId,
      HTreeNode.cssExpanded, this.expanded && _hasChildren);
    this.toggleCSSClass(HTreeNode._tmplTogglerPrefix + this.elemId,
      HTreeNode.cssCollapsed, !this.expanded && _hasChildren);
  },
  
  
/** method: select
  * 
  * Selects the node, setting a CSS class defined in cssSelected to the node's
  * DOM element indicating the selection status.
  * 
  * See also:
  *  <HTreeControl.selectNode> <HTreeControl.selectionChanged>
  **/
  select: function(_extendSelection, _ignoreSelectionChange) {
    this.tree.selectNode(this, _extendSelection, _ignoreSelectionChange);
  },
  
  
/** method: deselect
  * 
  * Unselects the node, removing the CSS class defined in cssSelected from the
  * node's DOM element.
  * 
  * See also:
  *  <HTreeControl.deselectNode> <HTreeControl.selectionChanged>
  **/
  deselect: function() {
    this.tree.deselectNode(this);
  },
  
  
  /**     
    * Not for public API.
    * 
    * Makes sure that the CSS class of the node's content element gets changed
    * when the selection status changes. Called from tree control too.
    * 
    **/
  refreshSelectionStatus: function() {
    if (this.drawn) {
      this.toggleCSSClass(HTreeNode._tmplContentPrefix + this.elemId,
        HTreeNode.cssSelected, this.selected);
    }
  },
  
  
/** method: selectAllChildren
  * 
  * Selects all the child nodes of this node, but not this node. Selecting all
  * nodes works only when the tree is in multiple selection mode.
  * 
  * Parameters:
  *   _ignoreSelectionChange - A boolean that indicates whether the hook method
  *     selectionChanged should be called if the selection does change. This is
  *     mostly used by internal methods.
  * 
  * See also:
  *  <HTreeControl.selectAllNodes> <HTreeControl.setTreeType>
  *  <HTreeControl.selectionChanged>
  **/
  selectAllChildren: function(_ignoreSelectionChange) {
    if (this.tree.treeType == HTreeControl.H_MULTIPLE_SELECTION_TREE) {
      for(var i = 0; i < this.childNodes.length; i++) {
        this.childNodes[i].selectAllChildren(_ignoreSelectionChange);
        this.childNodes[i].select(true, _ignoreSelectionChange);
      }
    }
  },
  
  
/** method: deselectAllChildren
  * 
  * Unselects all the child nodes of this node, but not this node.
  * 
  * See also:
  *  <HTreeControl.deselectAllNodes>  <HTreeControl.selectionChanged>
  **/
  deselectAllChildren: function() {
    for(var i = 0; i < this.childNodes.length; i++) {
      this.childNodes[i].deselectAllChildren();
      this.childNodes[i].deselect();
    }
  },
  
  
/** method: draw
  * 
  * The draw method is called by the tree that hosts this node. Calling this
  * after drawing the tree has no effect.
  *
  * See also:
  *  <HView.draw> <HTreeControl.draw>
  **/
  draw: function() {
    if (!this.drawn) {
      this.drawMarkup();
      this.drawn = true; // drawRect is not called, so set this manually.
    }
  },
  
  
/** method: drawChildren
  * 
  * Draws all the child nodes of this node. This should be automatically called
  * from the HTML-template when the node itself is drawn.
  * 
  * Returns:
  *  The markup of the complete child node hierarchy that was drawn.
  *
  * See also:
  *  <HTreeControl.drawChildren>
  **/
  drawChildren: function() {
    var _markupString = "";
    for(var i = 0; i < this.childNodes.length; i++) {
      
      this.childNodes[i].draw();
      _markupString += this.childNodes[i].markup;
      
    }
    
    return _markupString;
  },
  
  
/** method: moveUnder
  * 
  * Completely moves this node (and the child nodes) under the _newParent.
  * The node is first removed from its current parent's views array, and then
  * added to the new parent's views array, and finally the DOM node is moved
  * under the new parent's child container.
  * 
  * Parameters:
  *   _newParent - The target node that this node is to be moved under.
  *
  **/
  moveUnder: function(_newParent) {

    // Remove the node from its current parent and leave the DOM element to be
    // used in the new parent.
    this.deselect();
    this.parent.removeChildNode(this);
    if (this.parent._refreshToggler) {
      // The parent is not a tree.
      this.parent._refreshToggler();
    }
    
    this.remove();

    _newParent.addView(this);
    _newParent.addChildNode(this);
    
    if (_newParent.drawn) {
      elem_append(_newParent.childContainerId, this.elemId);
    }
    
    if (_newParent._refreshToggler) {
      // The parent is not a tree.
      _newParent._refreshToggler();
    }

  },
  
  
  /**
    * Not for public API.
    * 
    * Binds required DOM elements to the element manager. this.elemId will point
    * to the node element itself, and this.childContainerId will point to a 
    * container element which will hold the children of this node.
    * this.togglerId is the element containing the toggle button which is used
    * for expanding and collapsing nodes. this.contentId is the element that
    * contains the view that is displayed as the node content.
    * 
    * Also draws the content of the node and the toggler, and disables events.
    * All the actions that can be done with a node go through the content
    * element assigned to the node.
    */
  postDrawBindings: function() {
    
    elem_replace(this.elemId, $(HTreeNode._tmplElementPrefix + this.elemId));
    this.childContainerId =
      this.bindDomElement(HTreeNode._tmplChildrenPrefix + this.elemId);
    
    this.togglerId = this.bindDomElement(
      HTreeNode._tmplTogglerPrefix + this.elemId);
    this.contentId = this.bindDomElement(
      HTreeNode._tmplContentPrefix + this.elemId);

    
    if(this.content) {
      // Make the content relatively positioned and add it to this view's array
      // of subviews.
      this.content.remove();
      this.addView(this.content);
      
      // TODO: Should this be handled by the content object?
      if(this.content.drawn) {
        this.content.refresh();
      }
      else {
        this.content.draw();
      }
      
      prop_set(this.content.elemId, 'position', 'relative', true);
      elem_append(this.contentId, this.content.elemId);
      
      
      if (!this.tree.staticNodeWidth) {
        // Make the content as wide as it needs to be. Overrides the width set in
        // the rect of the element.
        this.content.optimizeWidth();
      }
      
    }
    
    // Toggler button
    this.toggleControl.draw();
    prop_set(this.toggleControl.elemId, 'position', 'relative', true);
    elem_append(this.togglerId, this.toggleControl.elemId);
    this._updateExpansionStatus();
    this.refreshSelectionStatus();

    // All the events for a node are handled by its content.
    this.setEnabled(false);
    
    for(var i = 0; i < this.childNodes.length; i++) {
      this.childNodes[i].postDrawBindings();
    }
    
  },
  
  
/** method: importJSON
  * 
  * Imports a set of structured data into the tree under this node. See 
  * <HTreeControl.importJSON> for details.
  * 
  * Parameters:
  *   _data - Array of data to be imported.
  *   _class - The class of the items to be imported (defaults to <HStringView>).
  *   _rect - A <HRect> object to be used when creating the content objects.
  * 
  * See also:
  *   <HTreeControl.importJSON>
  */
  importJSON: function(_data, _class, _rect) {
    if (!this.tree) {
      // The parent node must be in a tree.
      return;
    }
    this.tree.importJSON(_data, _class, _rect, this);
  },
  
  
  
  
/** event: mouseUp
  * 
  * This is called through the content object of this node when the item is
  * clicked. Handles selection of nodes.
  * 
  * Parameters:
  *   _x - The X coordinate of the point where the mouse button was released.
  *   _y - The Y coordinate of the point where the mouse button was released.
  *
  **/
  mouseUp: function(_x, _y) {
    var _toggleSelect = HEventManager.events[HEventManager.HStatusCtrlKey];
    var _extendSelection = (this.tree.treeType ==
      HTreeControl.H_MULTIPLE_SELECTION_TREE) && _toggleSelect;
    
      
    if (_extendSelection) {
      // Extending the selection while holding down the ctrl key.
      if (this.selected) {
        this.deselect();
      }
      else {
        this.select(true);
      }
    }
    else {
      // Plain old click, no selection extending.
      if (this.selected && _toggleSelect) {
        this.tree.deselectAllNodes();
      }
      else {
        this.select(false);
      }
    }

  }
  
},{

  // The name of the CSS class to be used when...
  
  // the item is selected.
  cssSelected: "selected",
  // the item has subitems and it is expanded.
  cssExpanded: "expanded",
  // the item has subitems and it is collapsed.
  cssCollapsed: "collapsed",
  // an item that may be dropped on this node is hovering above this item.
  cssHover: "hovering",
  
  // Template ID prefixes
  _tmplTogglerPrefix: "treenodetoggler",
  _tmplContentPrefix: "treenodecontent",
  _tmplChildrenPrefix: "treenodechildren",
  _tmplElementPrefix: "treenode"

});




/*** class: HTreeNodeToggleControl
  **
  ** Small helper class that acts as the expand/collapse toggler on the node.
  **
  ** Extends:
  **  <HControl>
  **
  ** See also:
  **  <HTreeControl> <HTreeNode>
  ***/
HTreeNodeToggleControl = HControl.extend({
  
/** constructor: constructor
  *
  * Parameters:
  *   _parentClass - The tree node that this control is to be inserted in.
  *
  **/
  constructor: function(_parentClass) {
    var _rect = new HRect();
    var _options = {
      events:{
        mouseDown: true,
        mouseUp:   false,
        draggable: false,
        droppable: false
      }
    };
    this.base(_rect, _parentClass, _options);
  },
  
  
/** event: mouseDown
  * 
  * Toggles the owner node's expanded/collapsed status.
  * 
  * Parameters:
  *   _x - The X coordinate of the point where the mouse button was clicked.
  *   _y - The Y coordinate of the point where the mouse button was clicked.
  *
  **/
  mouseDown: function(_x, _y) {
    if(this.parent.hasChildren()) {
      this.parent.toggle();
    }
  }
});

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

