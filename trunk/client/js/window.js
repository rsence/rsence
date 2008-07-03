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

/** class: HWindow
  *
  * Simple window component.
  *
  * Extends:
  *  <HDynControl>
  *
  * See Also:
  *  <HDynControl> <HControl> <HView>
  *
  **/
HWindow = HDynControl.extend({
  componentName:      'window',
  componentBehaviour: 'window',
  constructor: function(_rect,_parentApp,_options){
    if(_parentApp.componentBehaviour[0]!='app'){
      console.log(
        "Himle.ComponentParentError",
        "HWindow parent must be an HApplication instance!"
      );
    }
    this.base(_rect,_parentApp,_options);
    this.windowView = this; // backwards-compatibility, will go away!
    HSystem.windowFocus(this);
  },
  gainedActiveStatus: function(){
    HSystem.windowFocus(this);
  },
  windowFocus: function(){
    this.toggleCSSClass(this.elemId, 'inactive', false);
  },
  windowBlur: function(){
    this.toggleCSSClass(this.elemId, 'inactive', true);
  },
  refresh: function() {
    if(this.drawn){
      this.base();
      // Label
      if(this.markupElemIds.label){
        ELEM.setHTML(this.markupElemIds.label, this.label);
      }
    }
  }
});

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

/** class: HWindow
  *
  * Simple window component.
  *
  * Extends:
  *  <HDynControl>
  *
  * See Also:
  *  <HDynControl> <HControl> <HView>
  *
  **/
HWindow = HDynControl.extend({
  componentName:      'window',
  componentBehaviour: 'window',
  constructor: function(_rect,_parentApp,_options){
    if(_parentApp.componentBehaviour[0]!='app'){
      console.log(
        "Himle.ComponentParentError",
        "HWindow parent must be an HApplication instance!"
      );
    }
    this.base(_rect,_parentApp,_options);
    this.windowView = this; // backwards-compatibility, will go away!
    HSystem.windowFocus(this);
  },
  gainedActiveStatus: function(){
    HSystem.windowFocus(this);
  },
  windowFocus: function(){
    this.toggleCSSClass(this.elemId, 'inactive', false);
  },
  windowBlur: function(){
    this.toggleCSSClass(this.elemId, 'inactive', true);
  },
  refresh: function() {
    if(this.drawn){
      this.base();
      // Label
      if(this.markupElemIds.label){
        ELEM.setHTML(this.markupElemIds.label, this.label);
      }
    }
  }
});

