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

/*!
@function HTextEdit
@description Enables contentEditable attribute in Netscape and Firefox.
*/

HTextEdit = Base.extend({
  constructor: null,
  /*!
  @function execCommand
  @description Executes execCommand of browser. Makes some modifications to command
  so that command works correctly.
  */
	// BackColor, Bold, (contentReadOnly), copy, CreateLink, cut, (decreasefontsize), delete, (findstring - safari),
	// FontName, FontSize, (fontsizedelta - safari), ForeColor, FormatBlock, (heading), HiliteColor, (increasefontsize)
	// Indent, InsertHorizontalRule, InsertHTML, (InsertLineBrake - safari), InsertOrderedList, (InsertParagraph - safari),
	// (InsertNewLineInQuotedContent - safari), (InsertText - safari), InsertUnorderedList, Italic, JustifyCenter,
	// JustifyFull, JustifyLeft, JustifyRight, Outdent, RemoveFormat, SelectAll, StrikeThrough, (styleWithCSS),
	// Subscript, Superscript, (Transpose - Safari), Underline, Unlink, (Unselect - safari)
	
	// copy -> check Opera and Firefox
	// cut -> check Opera and Firefox
	
	// CreateLink - > Safari -> doesn't work
	// FormatBlock - > Safari -> doesn't work (should)- > IE -> doesn't work (should)
	// heading - > Safari -> doesn't work,  - > Opera -> doesn't work
	// HiliteColor - > Safari -> doesn't work (should)- > IE -> doesn't work
	// InsertUnorderedList - > Safari -> doesn't work (should)
	// Indent - > Safari -> doesn't work (should)
	// InsertHorizontalRule - > Safari -> doesn't work (should)
	// InsertHTML - > Safari -> doesn't work (should)
	// InsertImage - > Safari -> doesn't work (should)
	// InsertOrderedList - > Safari -> doesn't work (should)
	// Outdent - > Safari -> doesn't work (should)
	// RemoveFormat - > Safari -> doesn't work (should)
	// SelectAll - > Safari -> should select only the editable earea
	// StrikeThrough - > Safari -> doesn't work (should) -> Internet Explorer doesn't work
	
	// Subscript  -> Internet Explorer doesn't work
	// Superscript  -> Internet Explorer doesn't work
	
	execCommand: function(_command, _userInterface, _value, _doc) {
		_doc = _doc || document;
		var _lowerCasedCommand = _command.toLowerCase();
		if ((_lowerCasedCommand == "hilitecolor" ||
		     _lowerCasedCommand == "inserthtml") && is.ie) {
		  return;
		}
		if ((_lowerCasedCommand == "backcolor" ||
				 _lowerCasedCommand == "forecolor" ||
				 _lowerCasedCommand == "hilitecolor") &&
				_userInterface == true) {
			// show color panel
		} else if (_lowerCasedCommand == "copy" &&
		           !is.ns && !is.opera) {
		  _doc.execCommand(_command, _userInterface, _value);
		} else if (_lowerCasedCommand == "createlink" &&
							 _userInterface == true) {
			// show link panel
		/*} else if (_lowerCasedCommand == "fontname" &&
							 _userInterface == true) {
			// show font name panel*/
		} else if (_lowerCasedCommand == "fontsize") {
			if (is.safari) {
				switch (parseInt(_value)) {
					case 1: _value = "x-small"; break;
					case 2: _value = "small"; break;
					case 3: _value = "medium"; break;
					case 4: _value = "large"; break;
					case 5: _value = "x-large"; break;
					case 6: _value = "xx-large"; break;
					case 7: _value = "48px"; break;
				}
			}
			_doc.execCommand(_command, _userInterface, _value);
		} else if (_lowerCasedCommand == "formatblock" &&
							 _userInterface == true) {
			// show font name panel
		} else if (_lowerCasedCommand == "inserthtml" &&
							 _userInterface == true) {
			// show font name panel
		} else if (_lowerCasedCommand == "insertimage" &&
							 _userInterface == true) {
			// show font name panel
		} else if(is.safari && _lowerCasedCommand == "createlink") {
			// 2006 august release should work
			if (this._execCreateLink) {
			  this._execCreateLink(_value);
			}
		} else {
			 _doc.execCommand(_command, _userInterface, _value);
		}
	},
  /*!
  @function enableSelectionListeners
  @description Populates the _selection object every time when mouse or key goes up.
  */
	enableSelectionListeners: function() {
		var obj = this;
		if (!this._enabled) {
		  if (is.ie) {
		    document.attachEvent("onkeydown", function(e) {obj._selectionChanged(e);});
		    document.attachEvent("onkeyup", function(e) {obj._selectionChanged(e);});
		    //document.attachEvent("onkeypress", function(e) {obj._selectionChanged(e);});
		    document.attachEvent("onmouseup", function(e) {obj._selectionChanged(e);});
		  } else {
		    document.addEventListener("keydown", function(e) {obj._selectionChanged(e);}, false);
		    document.addEventListener("keyup", function(e) {obj._selectionChanged(e);}, false);
		    document.addEventListener("mouseup", function(e) {obj._selectionChanged(e);}, false);
		  }
		  this._enabled = true;
		}
	},
  /*!
  @function saveSelection
  @description Saves current _selection object to _savedSelection object.
  */
	// call before losing focus to text selection
	// mouseover for edit button would be good
	saveSelection: function() {
	  if (is.ie) {
	    this._savedSelection.range = this._selection.range;
	  } else {
		  this._savedSelection.anchorNode = this._selection.anchorNode;
		  this._savedSelection.anchorOffset = this._selection.anchorOffset;
		  this._savedSelection.focusNode = this._selection.focusNode;
		  this._savedSelection.focusOffset = this._selection.focusOffset;
		  this._savedSelection.isCollapsed = this._selection.isCollapsed;
		  if (is.safari) {
			  this._savedSelection.baseNode = this._selection.baseNode;
			  this._savedSelection.baseOffset = this._selection.baseOffset;
			  this._savedSelection.extentNode = this._selection.extentNode;
			  this._savedSelection.extentOffset = this._selection.extentOffset;
		  } else {
			  this._savedSelection.range = this._selection.range;
		  }
		}
	},
  /*!
  @function loadSelection
  @description Makes real browser selection object to _savedSelection object.
  */
	// load selection that was saved with saveSelection method
	// that we can get situation that was before we pressed button
	// that edited the selection and got focus
	loadSelection: function(_window) {
	  var _window = _window || window;
	  if (is.ie) {
	    this._savedSelection.range.select();
	  } else {
		  var _selection = _window.getSelection();
		  if (is.ns || is.opera) {
			  if (_selection.rangeCount > 0) {
			  	_selection.removeAllRanges();
			  }
			  // bug: opera collapses selection if focusnode is left from anchornode
			  if (is.opera) {
			    var _element = this._savedSelection.anchorNode;
			    do {
			    	if (_element.nodeType == 1 && _element.getAttribute("contentEditable") == "true") {
			    		_element.setAttribute("contentEditable","false");
		  	  		_element.setAttribute("contentEditable","true")
			    	}
		  	  	_element = _element.parentNode;
		  	  } while(_element);
			  }
			  
			  var _range = document.createRange();
			  //alert(this._savedSelection.isCollapsed);
			  //alert(this._savedSelection.anchorNode + " " + this._savedSelection.anchorOffset);
			  //window.status = this._savedSelection.anchorNode + " " + this._savedSelection.anchorOffset;
			  _range.setStart(this._savedSelection.anchorNode, this._savedSelection.anchorOffset);
			  _selection.addRange(_range);
			  // we want right focus
			  // isCollapsed can't be true if extend method is used.
			  if (this._savedSelection.isCollapsed == false) {
			    _selection.extend(this._savedSelection.focusNode, this._savedSelection.focusOffset);
			  }
		  } else if (is.safari) {
			  _selection.empty();
			  _selection.setBaseAndExtent(this._savedSelection.baseNode, this._savedSelection.baseOffset,
			  													  this._savedSelection.extentNode, this._savedSelection.extentOffset);
		  }
		}
	},
  /*!
  @function populateSelection
  @description Populates _selection object with real browser selection object.
  */
	// save selection on keyup event and on mouseup event
	// called by _selectionChanged
	populateSelection: function(e, _window) {
	  var _window = _window || window;
	  if (is.ie) {
	    var _selection = _window.document.selection;
	    //type can be none, text or control
	    if (_selection.type.toLowerCase() != "control") {
	      var _textRange = _selection.createRange();
	      this._selection.range = _textRange;
	      //alert("toimii" + textRange + "dd");
	    }
	  } else {
		  var _selection = _window.getSelection();
		  this._selection.anchorNode = _selection.anchorNode;
		  this._selection.anchorOffset = _selection.anchorOffset;
		  this._selection.focusNode = _selection.focusNode;
		  this._selection.focusOffset = _selection.focusOffset;
		  this._selection.isCollapsed = _selection.isCollapsed;
		  if (is.safari) {
			  this._selection.baseNode = _selection.baseNode;
			  this._selection.baseOffset = _selection.baseOffset;
			  this._selection.extentNode = _selection.extentNode;
			  this._selection.extentOffset = _selection.extentOffset;
		  } else {
			  this._selection.range = _selection.getRangeAt(0);
		  }
		}
		if (!this._index) {
		  this._index = 0;
		}
		if (e) {
		  if (e.type == "keydown" || e.type == "keyup"/* || e.type == "keypress"*/) {
		    //this._index ++;
		    //window.status = this._index;
		    this.saveSelection();
		  }
		}
	},
  /*!
  @function _selectionChanged
  @description Populates the _selection object every time when mouse or key goes up.
  */
	// save selection on keyup event and on mouseup event
	_selectionChanged: function(e) {
	  if (is.ie) {
	    this.populateSelection(e);
	  } else {
		  var _selection = window.getSelection();
		  // Firefox, Opera 9
		  if (_selection.rangeCount > 0) {
			  this.populateSelection(e);
		  // Safari 2
		  } else if (is.safari) {
			  this.populateSelection(e);
		  }
		}
	},
	_selection: {
		anchorNode: null,
		anchorOffset: -1,
		focusNode: null,
		focusOffset: -1,
		isCollapsed: undefined
	},
	_savedSelection: {
		anchorNode: null,
		anchorOffset: -1,
		focusNode: null,
		focusOffset: -1,
		isCollapsed: undefined
	},
	_enabled: false
});
/*** class: HStyleButton
  **
  ** HStyleButton is the button that has an image. HStyleButtons can have two states, checked and unchecked.
  ** It inherits these properties from the HImageButton.
  ** State transition of a button is done by clicking the mouse on the button 
  ** or by using a keyboard shortcut. Also applies the command to the richtextview when the mouse button goes up.
  ** 
  ** vars: Instance variables
  **  type - '[HImageButton]'
  **  value - A boolean, true when the button is checked, false when it's not.
  **  image - The url of an image that indicates false state.
  **  alternateImage - The url of an image that indicates true state.
  **  command - The command to be applied for the HRichTextView.
  **  richtextview - The HRichTextView for which the command is applied.
  **
  ** Extends:
  **  <HControl>
  **
  ** See also:
  **  <HControl> <HImageButton>
  ***/
HStyleButton = HImageButton.extend({
  
  packageName:   "richtext",
  componentName: "stylebutton",

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
    
    this.type = '[HStyleButton]';

	this.preserveTheme = true;
    
    if(!this.isinherited) {
      this.draw();
    }
  },

/** event: mouseUp
  * 
  * Called when the user clicks the mouse button up on this object. Sets the state of the HImageButton.
  * It can be 0 or 1. Also executes the "command" for the richtextview.
  *
  * Parameters:
  *  _x - The horizonal coordinate units (px) of the mouse cursor position.
  *  _y - The vertical coordinate units (px) of the mouse cursor position.
  *  _leftButton - Flag, is false when the right mouse button was pressed. *Do
  *                not rely on it*
  *
  * See also:
  *  <HControl.mouseUp>
  **/
  mouseUp: function() {
	if (this.styleButtonDefaults.richtextview) {
	  HTextEdit.execCommand(this.styleButtonDefaults.command, false, null, this.styleButtonDefaults.richtextview.iframe().contentWindow.document);
	}
	this.base();
  }
  
},{
  _tmplImgPrefix: "imageview"
});
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
      var _iFrame = elem_get( this.markupElemIds.control );
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
        var _iFrame = elem_get( this.markupElemIds.control );
		if (_iFrame.contentWindow.document.body) {
          _iFrame.contentWindow.document.body.innerHTML = _value;
		}
      }
    }
    this.base(_value);
  },
  iframe: function() {
	return elem_get( this.markupElemIds.control );
  }
});
/*** class: HRichTextControl
  **
  ** HRichTextControl is a rich, robust and powerful control unit 
  ** that allows the user type and edit formatted text. 
  ** In addition, among other features that the rich text editor
  ** provides, it can be easily extended for specialized editing tasks.
  **
  ***/

HRichTextControl = HControl.extend({
  
  packageName:   "richtext",
  componentName: "richtextcontrol",

  constructor: function(_rect,_parentClass,_options) {
    if(this.isinherited){
      this.base(_rect,_parentClass,_options);
    }
    else {
      this.isinherited = true;
      this.base(_rect,_parentClass,_options);
      this.isinherited = false;
    }
    
    this.type = '[HRichTextControl]';
    
    // When this is true, the component is always drawn with the theme that was
    // active at the creation of the component, not the current theme.
    this.preserveTheme = true;
    
    this._initialized = false;
    
    if(!this.isinherited){
      this.draw();
    }
  },
  
  draw: function() {
    if(!this.drawn){
      this.base();
    
      this.drawRect();
      this.drawMarkup();
      if(!this._initialized){
    //richtext1 = new HRichTextBar( new HRect(100,100,380,121), application, 'Slaves' );
    //windowbar1.setStyle("border","1px dotted pink");
    //windowbar1.setStyle("overflow","visible");
    //richtext1.draw();
        this.barView = new HRichTextBar(
          new HRect(0,0,this.rect.width,20),
          this,
          {value:this.value}
        );
        this.barView.draw();
        this.richTextView = new HRichTextView(
          new HRect(0,20,this.rect.width,this.rect.height),
          this,
          {value:(this.value||"editable text")}
        );
        this.richTextView.draw();
      }
      this.drawn=true;
    }
    this.drawRect();
    //this.refresh(); // Make sure the label gets drawn.
  }
  
});

// Some aliases.
HRichTextArea = HRichTextControl;
HRichTextEditor = HRichTextControl;
