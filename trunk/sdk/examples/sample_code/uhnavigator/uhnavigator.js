/***  HIMLE RIA SYSTEM
  ** 
  **  Copyright (C) 2008 HIMLE GROUP http://himle.sorsacode.com/
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

UHNavigator = HControl.extend({

  componentName: "uhnavigator",
  
  constructor: function(_rect, _parentClass, _options) {
    
    if(this.isinherited) {
      this.base(_rect, _parentClass, _options);
    }
    else {
      this.isinherited = true;
      this.base(_rect, _parentClass, _options);
      this.isinherited = false;
    }
    
    this.type = '[UHNavigator]';
    
    //this.navigatorItems = [];
    
    if ( !this.options.navItems ) {
      this.options.navItems = [[
        "Untitled",
        "#"
      ]];
      
    }

/*
    this.navItems = "";
    for ( var i = 0; i < this.options.navItems.length; i++ ) {
        this.navItems += '<a class="hitem" href="' + this.options.navItems[i][1] + '">' + this.options.navItems[i][0] + '</a>';
    } 
*/
    
    this.navItems = "<ul>";
    this.subItems = [];
    for ( var i = 0; i < this.options.navItems.length; i++ ) {
      if ( this.options.navItems[i].length > 2 ) {
        this.subItems = this.options.navItems[i][2];
        this.navItems += '<li><a href="' + this.options.navItems[i][1] + '">' + this.options.navItems[i][0] + '</a><ul>';
        for ( var j = 0; j < this.subItems.length; j++ ) {
         
          this.navItems += '<li><a href="' + this.subItems[j][1] + '">' + this.subItems[j][0] + '</a></li>';
        }
        this.navItems += '</li></ul>';
      } else {
        this.navItems += '<li><a href="' + this.options.navItems[i][1] + '">' + this.options.navItems[i][0] + '</a></li>';
      }
    }
    this.navItems += "</ul>"; 
    
    if(!this.isinherited) {
      this.draw();
    }
    
  },

  createMenu: function() {

  },
  
  draw: function() {
    if (!this.drawn) {
      this.drawRect();
      this.drawMarkup();
    } else {
      this.drawRect();
    }
  }

});