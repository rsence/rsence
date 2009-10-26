/**
  * Riassence Core -- http://rsence.org/
  *
  * Copyright (C) 2009 Juha-Jarmo Heinonen <jjh@riassence.com>
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

HConfirmSheet = HAlertSheet.extend({
  alertButtons: function(){
    this.cancelButton = HClickValueButton.extend({
      click: function(){
        this.setValue( -1 );
      }
    }).nu(
      [ null, null, 60, 23, 76, 8 ],
      this, {
        label: 'Cancel',
        valueObj: this.valueObj,
        events: {
          click: true
        }
      }
    );
    this.base();
  }
});
