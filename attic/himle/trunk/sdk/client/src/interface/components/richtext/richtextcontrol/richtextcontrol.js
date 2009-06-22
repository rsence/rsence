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
