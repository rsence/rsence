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

Toolbox = HControl.extend({
  flexBottom: true,
  constructor: function(_parent){
    /* Tools:
       0 = None
       1 = Select
       2 = Rectangle
       3 = Button
       4 = Label
       5 = Text Field
       6 = Text Area
       7 = Pulldown Menu
     */
    var _rect = new HRect(0,0,36,36*8);
    this.base(_rect,_parent);
    this._buildUI();
  },
  _buildUI: function(){
    this.setStyle('background-color','#ddd');
    this.setStyle('border-right','1px solid #bbb');
    var _toolItems = [
    //        icon
    // num  offset     label
      [ 1,      0,    'Select'          ],
      [ 2,    -32,    'Rectangle'       ],
      [ 3,    -64,    'Button'          ],
      [ 4,    -96,    'Label'           ],
      [ 5,   -128,    'Single-line text'],
      [ 6,   -160,    'Multi-line text' ],
      [ 7,   -192,    'Pulldown Menu'   ],
      [ 8,   -224,    'Radio / Checkbox']
    ];
    var _activeTool = this.app.activeTool;
    var _toolRect = new HRect(2,2,34,34);
    var _toolboxItem, _options, _toolItem,
        _toolNum, _iconOffset, _toolLabel;
    for (var i=0; i<8; i++) {
      _toolItem   = _toolItems[i];
      _toolNum    = _toolItem[0];
      _iconOffset = _toolItem[1];
      _toolLabel  = _toolItem[2];
      _options = {
        value:       0,
        label:       _toolLabel,
        toolNum:     _toolNum,
        iconOffsetY: _iconOffset,
        iconOffsetX: 0,
        events: {
          mouseDown: true
        }
      };
      _toolboxItem = new ToolboxItem(
        new HRect(_toolRect), this, _options
      );
      _activeTool.bind( _toolboxItem );
      _toolRect.offsetBy(0,34);
    }
    _activeTool.set(1); // Select Tool by default
  }
});