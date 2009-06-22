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



function description () {
    var descr_viewId = "windowview" + panelapp.descrPanel.windowView.elemId;
    var id = document.getElementById( descr_viewId );
    var descr = "<div align = 'justify' style = 'margin: 10px'>";
    descr += "<span style = 'font-weight: bold'>BUTTON<br></span>";
    descr += "HButton is a control unit that provides the user a simple way to trigger an event and responds to mouse clicks and keystrokes by calling a proper action method on its target class. A typical button is a rectangle with a label in its centre. Buttons come in three categories, push buttons, sticky buttons and radio buttons. Button view or theme can be changed; “helmiTheme” is used by default. For example, a simple Helmi GUI button implementation would look like this:";
    descr += "</div>";
    id.innerHTML = descr;
    
}

function demo () {

    var _buttonRect = new HRect(50,50,150,70);
    this.buttonValue = new HClickButton( _buttonRect, panelapp.demoPanel, {label: "Click me!"} );
    
    var _stringViewRect = new HRect(180,50,250,70);
    this.string1 = new HStringView( _stringViewRect, panelapp.demoPanel, {value: 0} );
        
    //this.commonvalue = php_db.buttonValue;
    //this.commonvalue.bind(this.buttonValue);
    //this.commonvalue.bind(this.string1);

}

function source () {
    var source_viewId = "windowview" + panelapp.sourcePanel.windowView.elemId;
    var id = document.getElementById ( source_viewId );
    var source = "<div style = 'margin: 10px;font-family:courier'>";
    source += "<strong>var</strong> _buttonRect = new HRect( 50, 50, 150, 70 );<br>this.button1 = new HClickButton( <br>&nbsp;&nbsp;&nbsp;_buttonRect,<br>&nbsp;&nbsp; panelapp.demoPanel,<br>&nbsp;&nbsp;&nbsp;{ label: 'Click me!' }<br> );";
    source += "</div>";
    id.innerHTML = source; 
}

description ();
demo ();
source ();