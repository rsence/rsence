/**
  * Riassence Core -- http://rsence.org/
  *
  * Copyright (C) 2008 Juha-Jarmo Heinonen <jjh@riassence.com>
  *
  * This file is part of Riassence Core.
  *
  * Riassence Core is free software: you can redistribute it and/or modify
  * it under the terms of the GNU General Public License as published by
  * the Free Software Foundation, either version 3 of the License, or
  * (at your option) any later version.
  *
  * Riassence Core is distributed in the hope that it will be useful,
  * but WITHOUT ANY WARRANTY; without even the implied warranty of
  * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  * GNU General Public License for more details.
  *
  * You should have received a copy of the GNU General Public License
  * along with this program.  If not, see <http://www.gnu.org/licenses/>.
  *
  **/


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
  setStyle: function(_name, _value){
    ELEM.setStyle(this.markupElemIds.label,_name,_value);
  }
});

/** class: HClickValueButton
  *
  * Simple HButton extension, operates on its value so it's useful
  * for sending button clicks to the server and the like.
  * For the value responder, reset the value to 0 when read to make
  * the button clickable again.
  *
  * Value states:
  *  0: Enabled, clickable
  *  1: Disabled, clicked
  *  Other: Disabled, not clickable, not clicked
  *
  **/
HClickValueButton = HButton.extend({
  refreshValue: function(){
    this.setEnabled( this.value === 0 );
  },
  click: function(){
    this.setValue(1);
  }
});

