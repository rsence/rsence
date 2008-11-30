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


/*
	
  */
HRichTextBar = HButton.extend({
  
  packageName:   "richtext",
  componentName: "richtextbar",

  constructor: function(_rect,_parentClass,_options) {
    if(this.isinherited){
      this.base(_rect,_parentClass,_options);
    }
    else {
      this.isinherited = true;
      this.base(_rect,_parentClass,_options);
      this.isinherited = false;
    }
    this.type = '[HRichTextBar]';
    
    if(!this.isinherited){
      this.draw();
    }
  },
  draw: function() {
    if(!this.drawn){
      this.base();
      
      if (!this.bButton) {
      
        this.bButton = new HStyleButton(
          new HRect(0,0,20,20), this, {label:this.label, value:true, command:"bold"});
        this.bButton.draw();
        this.iButton = new HStyleButton(
          new HRect(20,0,40,20), this, {label:this.label, value:true, command:"italic"});
        this.iButton.draw();
        this.underlineButton = new HStyleButton(
          new HRect(40,0,60,20), this, {label:this.label, value:true, command:"underline"});
        this.underlineButton.draw();
        this.justifyleftButton = new HStyleButton(
          new HRect(60,0,80,20), this, {label:this.label, value:true, command:"justifyleft"});
        this.justifyleftButton.draw();
        this.justifycenterButton = new HStyleButton(
          new HRect(80,0,100,20), this, {label:this.label, value:true, command:"justifycenter"});
        this.justifycenterButton.draw();
        this.justifyrightButton = new HStyleButton(
          new HRect(100,0,120,20), this, {label:this.label, value:true, command:"justifyright"});
        this.justifyrightButton.draw();
        this.justifyfullButton = new HStyleButton(
          new HRect(120,0,140,20), this, {label:this.label, value:true, command:"justifyfull"});
        this.justifyfullButton.draw();
        this.ulButton = new HStyleButton(
          new HRect(140,0,160,20), this, {label:this.label, value:true, command:"insertunorderedlist"});
        this.ulButton.draw();
        this.olButton = new HStyleButton(
          new HRect(160,0,180,20), this, {label:this.label, value:true, command:"insertorderedlist"});
        this.olButton.draw();
        this.indentButton = new HStyleButton(
          new HRect(180,0,200,20), this, {label:this.label, value:true, command:"indent"});
        this.indentButton.draw();
        this.outdentButton = new HStyleButton(
          new HRect(200,0,220,20), this, {label:this.label, value:true, command:"outdent"});
        this.outdentButton.draw();
      }
      //this.drawn=true;
    }
    this.drawRect();
  },
  refresh: function(){
    if(this.bButton){
      this.bButton.refresh();
      this.iButton.refresh();
      this.underlineButton.refresh();
      this.justifyleftButton.refresh();
      this.justifycenterButton.refresh();
      this.justifyrightButton.refresh();
      this.justifyfullButton.refresh();
      this.ulButton.refresh();
      this.olButton.refresh();
      this.indentButton.refresh();
      this.outdentButton.refresh();
    }
    //this.drawRect();
  }
});


