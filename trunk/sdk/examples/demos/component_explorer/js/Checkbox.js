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
    var descr = "<div>";
    descr += "HCheckbox is a control unit that allows the user to make multiple selections from a number of options. Checkboxes can have two states, checked and unchecked. In contrast of radio button, checkbox can be presented as a single unit. State transition of a checkbox is done by clicking the mouse on the button or by using a keyboard shortcut. Checkbox view or theme can be Helmi RIA Platform v2.0 changed; “helmiTheme” is used by default. As an instance, a simple Helmi GUI checkbox implementation would look like this:";
    descr += "</div>";
    id.innerHTML = descr;
    
}

    

function demo () {
    var _checkboxRect = new HRect( 50, 50, 70, 70 );
    this.checkboxValue = new HCheckbox( _checkboxRect, panelapp.demoPanel, {value: true} );
    
    //this.commonvalue = php_db.checkboxValue;
    //this.commonvalue.bind(this.checkboxValue);
}

function source () {
    var source_viewId = "windowview" + panelapp.sourcePanel.windowView.elemId;
    var id = document.getElementById ( source_viewId );
    var source = "<div>";
    source += "HCheckbox is a control unit that allows the user to make multiple selections from a number of options. Checkboxes can have two states, checked and unchecked. In contrast of radio button, checkbox can be presented as a single unit. State transition of a checkbox is done by clicking the mouse on the button or by using a keyboard shortcut. Checkbox view or theme can be Helmi RIA Platform v2.0 changed; “helmiTheme” is used by default. As an instance, a simple Helmi GUI checkbox implementation would look like this:";
    source += "</div>";
    id.innerHTML = source; 
}

description ();
demo ();
source ();


