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

HTimeSheetItemEdit = HControl.extend({
  timeSheetItem: false,
  setTimeSheetItem: function(_timeSheetItem){
    this.timeSheetItem = _timeSheetItem;
    this.textField.setValue( _timeSheetItem.label );
  },
  show: function(){
    if(this.timeSheetItem!==false){
      var _newRect = HRect.nu(this.timeSheetItem.rect);
      if(_newRect.height < 40){
        _newRect.setHeight( 40 );
      }
      if(_newRect.width < 200){
        _newRect.setWidth( 200 );
      }
      var _timeSheetItemParentRect = this.timeSheetItem.parent.rect;
      _newRect.offsetBy( _timeSheetItemParentRect.left, _timeSheetItemParentRect.top );
      this.setRect( _newRect );
      this.drawRect();
    }
    this.base();
  },
  hide: function(){
    this.base();
  },
  origParent: null,
  drawSubviews: function(){
    this.origParent = this.parent;
    this.remove();
    this.origParent.parent.addView( this );
    ELEM.append( this.elemId, this.parent.elemId );
    this.textField = HTextArea.nu(
      [0,0,null,20,0,26],
      this, {
        value: ''
      }
    );
    this.delButton = HButton.extend({
      click: function(){
        this.parent.hide();
        if(this.timeSheetItem!==false){
          this.parent.timeSheetItem.delTimeSheetItem();
          this.parent.timeSheetItem = false;
        }
      }
    }).nu(
      [2,null,60,24,null,0],
      this, {
        label: 'Delete',
        events: {
          click: true
        }
      }
    );
    this.okButton = HButton.extend({
      click: function(){
        this.parent.hide();
        if(this.timeSheetItem!==false){
          var _label = this.parent.textField.getTextFieldValue();
          console.log('label: ',_label);
          this.parent.timeSheetItem.setTimeSheetItemLabel( _label );
          this.parent.timeSheetItem = false;
        }
      }
    }).nu(
      [null,null,60,24,2,0],
      this, {
        label: 'Save',
        events: {
          click: true
        }
      }
    );
    this.cancelButton = HButton.extend({
      click: function(){
        this.parent.hide();
        if(this.timeSheetItem!==false){
          this.parent.timeSheetItem = false;
        }
      }
    }).nu(
      [null,null,60,24,66,0],
      this, {
        label: 'Cancel',
        events: {
          click: true
        }
      }
    );
    this.textField.setStyle('text-align','center');
    this.textField.setStyle('line-height','12px');
    this.textField.setStyle('font-size','12px');
    this.textField.setStyle('font-family','Arial, sans-serif');
  }
});

