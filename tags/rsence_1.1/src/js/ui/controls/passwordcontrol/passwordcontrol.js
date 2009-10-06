/**
  * Riassence Core -- http://rsence.org/
  *
  * Copyright (C) 2008 Juha-Jarmo Heinonen <jjh@riassence.com>
  * Copyright (C) 2006 Helmi Technologies Inc.
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

/*** class: HPasswordControl
  **
  ** Just like HTextControl, but the typed characters are not shown.
  **
  ** vars: Instance variables
  **  type - '[HPasswordControl]'
  **  value - The string that is currently held by this object.
  **
  ** Extends:
  **  <HTextControl>
  **
  ** See also:
  **  <HControl> <HTextControl>
  ***/
HPasswordControl = HTextControl.extend({
  // just change input type to password from the default input type=text
  drawSubviews: function(){
    this.base();
    ELEM.get(this.markupElemIds.value).type = 'password';
  },
  // disable value echoing for passwords,
  // one way only (the value entered in the password input)
  refreshValue: function(){
  }
});

