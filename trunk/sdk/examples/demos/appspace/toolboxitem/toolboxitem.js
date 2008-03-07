/***  HIMLE RIA SYSTEM
  ** 
  **  Copyright (C) 2008 HIMLE GROUP http://himle.sorsacode.com/
  **  Copyright (C) 2007 Juha-Jarmo Heinonen <o@sorsacode.com>
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

ToolboxItem = HControl.extend({
  componentName: 'toolboxitem',
  constructor: function(_rect,_parent,_options){
    this.base(_rect,_parent,_options);
    this.toolNum = _options.toolNum;
    this.iconOffsetX = _options.iconOffsetX;
    this.iconOffsetY = _options.iconOffsetY;
    this.drawMarkup();
  },
  mouseDown: function(_x,_y,_b){
    this.setValue(this.toolNum);
  },
  setValue: function(_value){
    this.base(_value);
    if(_value==this.toolNum){
      this.setStyle('background-color','#fff');
      this.setStyle('border','1px solid #fc0');
      this.setStyle('margin','-1px');
    } else {
      this.setStyle('background-color','transparent');
      this.setStyle('border','0px');
      this.setStyle('margin','0px');
    }
  }
});