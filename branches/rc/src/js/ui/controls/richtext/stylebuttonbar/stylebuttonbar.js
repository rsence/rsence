/***  Riassence Core
  ** 
  **  Copyright (C) 2008 Riassence Inc http://rsence.org/
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

HStyleButtonBar = HView.extend({
  
  packageName:   "richtext",
  componentName: "stylebuttonbar",

  constructor: function(_rect, _parentClass, _options) {
    
    if(this.isinherited) {
      this.base(_rect, _parentClass, _options);
    }
    else {
      this.isinherited = true;
      this.base(_rect, _parentClass, _options);
      this.isinherited = false;
    }
    this.styleButtonBarDefaults = new (Base.extend({
    }).extend(_options));
    
    this.type = '[HStyleButtonBar]';

	this.preserveTheme = true;
    
    if(!this.isinherited) {
      this.draw();
    }
  },
  draw: function() {
    if(!this.drawn){
	  this.drawRect();
	  if (this.styleButtonBarDefaults.styleBarSettings) {
		if (this.styleButtonBarDefaults.styleBarSettings.bold) {
  		  this.bButton = new HStyleButton(
		    new HRect(0,0,20,20),this,{image: "bold.gif", richtextview: this.styleButtonBarDefaults.richtextview, command: "bold"}
		  );
		}
		if (this.styleButtonBarDefaults.styleBarSettings.italic) {
  		this.iButton = new HStyleButton(
		  new HRect(20,0,40,20),this,{image: "italic.gif", richtextview: this.styleButtonBarDefaults.richtextview, command: "italic"}
		);
		}
		if (this.styleButtonBarDefaults.styleBarSettings.underline) {
  		this.underlineButton = new HStyleButton(
		  new HRect(40,0,60,20),this,{image: "underline.gif", richtextview: this.styleButtonBarDefaults.richtextview, command: "underline"}
		);
		}
		if (this.styleButtonBarDefaults.styleBarSettings.justify) {
  		this.justifyleftButton = new HStyleButton(
		  new HRect(60,0,80,20),this,{image: "justifyleft.gif", richtextview: this.styleButtonBarDefaults.richtextview, command: "justifyleft"}
		);
  		this.justifycenterButton = new HStyleButton(
		  new HRect(80,0,100,20),this,{image: "justifycenter.gif", richtextview: this.styleButtonBarDefaults.richtextview, command: "justifycenter"}
		);
  		this.justifyrightButton = new HStyleButton(
		  new HRect(100,0,120,20),this,{image: "justifyright.gif", richtextview: this.styleButtonBarDefaults.richtextview, command: "justifyright"}
		);
  		this.justifyfullButton = new HStyleButton(
		  new HRect(120,0,140,20),this,{image: "justifyfull.gif", richtextview: this.styleButtonBarDefaults.richtextview, command: "justifyfull"}
		);
		}
		if (this.styleButtonBarDefaults.styleBarSettings.insertunorderedlist) {
		this.ulButton = new HStyleButton(
		  new HRect(140,0,160,20),this,{image: "insertunorderedlist.gif", richtextview: this.styleButtonBarDefaults.richtextview, command: "insertunorderedlist"}
		);
		}
		if (this.styleButtonBarDefaults.styleBarSettings.insertorderedlist) {
  		this.olButton = new HStyleButton(
		  new HRect(160,0,180,20),this,{image: "insertorderedlist.gif", richtextview: this.styleButtonBarDefaults.richtextview, command: "insertorderedlist"}
		);
		}
		if (this.styleButtonBarDefaults.styleBarSettings.indent) {
  		this.indentButton = new HStyleButton(
		  new HRect(180,0,200,20),this,{image: "indent.gif", richtextview: this.styleButtonBarDefaults.richtextview, command: "indent"}
		);
		}
		if (this.styleButtonBarDefaults.styleBarSettings.outdent) {
  		this.outdentButton = new HStyleButton(
		  new HRect(200,0,220,20),this,{image: "outdent.gif", richtextview: this.styleButtonBarDefaults.richtextview, command: "outdent"}
		);
		}
		
        this.fonts = new HComboBox(new HRect(220,0,280,20), this);
        for (var i = 0; i < this.styleButtonBarDefaults.styleBarSettings.fontFamilies.length; i++) {
          this.fonts.addItem(this.styleButtonBarDefaults.styleBarSettings.fontFamilies[i]);
        }
		this.fonts.selectedIndexChanged = this._exexFontName;
		
        this.fontsizes = new HComboBox(new HRect(280,0,360,20), this);
        for (var i = 0; i < this.styleButtonBarDefaults.styleBarSettings.fontSizes.length; i++) {
          this.fontsizes.addItem(this.styleButtonBarDefaults.styleBarSettings.fontSizes[i]);
        }
		this.fontsizes.selectedIndexChanged = this._exexFontSize;
	  }
      this.drawn = true;
    }
   },
  _exexFontName: function(){
	if (this.parent.styleButtonBarDefaults.richtextview) {
	  var _window = this.parent.styleButtonBarDefaults.richtextview.iframe().contentWindow;
	  var _doc = _window.document;
	  HTextEdit.execCommand("fontname", false, this.selectedItem().label, _doc);
	}
  },
  _exexFontSize: function(){
	if (this.parent.styleButtonBarDefaults.richtextview) {
	  var _window = this.parent.styleButtonBarDefaults.richtextview.iframe().contentWindow;
	  var _doc = _window.document;
	  HTextEdit.execCommand("fontsize", false, this.selectedItem().label, _doc);
	}
  },
  refresh: function(){
    if(this.drawn){
	  this.base();
      /*this.bButton.refresh();
      this.iButton.refresh();
      this.underlineButton.refresh();
      this.justifyleftButton.refresh();
      this.justifycenterButton.refresh();
      this.justifyrightButton.refresh();
      this.justifyfullButton.refresh();
      this.ulButton.refresh();
      this.olButton.refresh();
      this.indentButton.refresh();
      this.outdentButton.refresh();*/
    }
  }
});
