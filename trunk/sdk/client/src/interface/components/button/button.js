/***
  ** Himle Client -- http://himle.org/
  **
  ** Copyright (C) 2008 Juha-Jarmo Heinonen
  **
  ** This file is part of Himle Client.
  **
  ** Himle Client is free software: you can redistribute it and/or modify
  ** it under the terms of the GNU General Public License as published by
  ** the Free Software Foundation, either version 3 of the License, or
  ** (at your option) any later version.
  **
  ** Himle Client is distributed in the hope that it will be useful,
  ** but WITHOUT ANY WARRANTY; without even the implied warranty of
  ** MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  ** GNU General Public License for more details.
  **
  ** You should have received a copy of the GNU General Public License
  ** along with this program.  If not, see <http://www.gnu.org/licenses/>.
  **
  ***/

/** class: HButton
  *
  * Simple button component, designed to be extended for any
  * actual functionality above regular <HControl>.
  * It's limited to 24px height by the default theme, because
  * it's much simpler to render that way.
  *
  * Extends:
  *  <HControl>
  *
  * See Also:
  *  <HControl> <HView>
  *
  **/
HButton = HControl.extend({
  componentName: 'button',
  constructor: function(_rect, _parent, _options){
    if(this.isinherited){
      this.base(_rect, _parent, _options);
    }
    else{
      this.isinherited = true;
      this.base(_rect, _parent, _options);
      this.isinherited = false;
    }
    if(!this.isinherited) {
      this.draw();
    }
  },
  refresh: function() {
    if(this.drawn){
      this.base();
      if(this.markupElemIds.label){
        ELEM.setHTML(this.markupElemIds.label, this.label);
      }
    }
  },
  draw: function(){
    var _isDrawn = this.drawn;
    this.base();
    if(!_isDrawn){
      this.drawMarkup();
    }
    this.refresh();
  }
});

