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
            ELEM.setStyle(this.dragElemId, 'left', (_x - this.originX) + 'px');
            ELEM.setStyle(this.dragElemId, 'top', (_y - this.originY) + 'px');
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
        var _element = ELEM.get(this.ownerNode.elemId);
        
        // Get the node's original position
        var _originalPosition = helmi.Element.getPageLocation(_element, true);
        
        // Duplicate the node element, but hide it first so the raw markup
        // doesn't scare the user.
        this.dragElemId = ELEM.make(0);
        ELEM.setStyle(this.dragElemId, 'visibility', 'hidden', true);
        var _dragClone = _element.cloneNode(true);
        
        // Anonymize the clone by removing all the id attributes in its markup.
        _dragClone.removeAttribute("id");
        _dragClone.innerHTML =
          _dragClone.innerHTML.replace(/\s+id="[^"]*"/g, "");
        this.dragContentElemId = ELEM.bind(_dragClone);
        
        // Ghosting effect
        ELEM.setStyle(this.dragElemId, 'opacity', 0.50);
        
        // Place the clone on the screen
        ELEM.setStyle(this.dragElemId, 'position', 'absolute', true);
        ELEM.setStyle(this.dragElemId, 'left', _originalPosition[0] + 'px', true);
        ELEM.setStyle(this.dragElemId, 'top', _originalPosition[1] + 'px', true);
        ELEM.append(this.dragContentElemId, this.dragElemId);
        
        // Bring to temporary front
        ELEM.setStyle(this.dragElemId, 'z-index', this.app.viewsZOrder.length);
        ELEM.setStyle(this.dragElemId, 'visibility', 'visible', true);

        
        // Store the original position, used in doDrag()
        this.originX = this.originX - _originalPosition[0];
        this.originY = this.originY - _originalPosition[1];

      };
      // Removes the drag clone from the screen.
      this.content.deleteDragClone = function() {
        if(this.dragContentElemId) {
          ELEM.del(this.dragContentElemId);
          this.dragContentElemId = null;
        }
        if(this.dragElemId) {
          ELEM.del(this.dragElemId);
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
      var _element = ELEM.get(this.elemId);
      ELEM.get(0).appendChild(_element);
      
      this.draw();
      this.postDrawBindings();
      
      var _parentElem = ELEM.get(this.parent.childContainerId);
      // Element has changed after calling postDrawBindings
      _element = ELEM.get(this.elemId);
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
      var _elem = ELEM.get(this.elemId);
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
        ELEM.setStyle(this.childContainerId, 'display', 'block');
      }
      else {
        ELEM.setStyle(this.childContainerId, 'display', 'none');
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
      ELEM.append(this.elemId, _newParent.childContainerId);
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
    
    //ELEM.replace(this.elemId, $(HTreeNode._tmplElementPrefix + this.elemId));
    var _oldId = this.elemId;
    ELEM.del( this.elemId );
    this.elemId = ELEM.bindId( HTreeNode._tmplElementPrefix + _oldId );
    
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
      
      ELEM.setStyle(this.content.elemId, 'position', 'relative', true);
      ELEM.append(this.content.elemId, this.contentId);
      
      
      if (!this.tree.staticNodeWidth) {
        // Make the content as wide as it needs to be. Overrides the width set in
        // the rect of the element.
        this.content.optimizeWidth();
      }
      
    }
    
    // Toggler button
    this.toggleControl.draw();
    ELEM.setStyle(this.toggleControl.elemId, 'position', 'relative', true);
    ELEM.append(this.toggleControl.elemId, this.togglerId);
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
    var _toggleSelect = EVENT.status[EVENT.ctrlKeyDown];
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

