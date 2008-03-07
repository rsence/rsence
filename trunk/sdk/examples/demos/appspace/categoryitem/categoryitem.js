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

_CategoryItemSelectedMessenger = HClass.extend({
  constructor: function(_categoryId,_categoryItem){
    this._categoryId = _categoryId;
    this._categoryItem = _categoryItem;
  },
  setValueObj: function(_obj){
    this.valueObj = _obj;
    this.setValue( _obj.value );
  },
  setValue: function(_value){
    if(this._categoryId==_value){
      this._categoryItem.setStyle('background-color','#fff');
    } else {
      this._categoryItem.setStyle('background-color','transparent');
    }
  }
});

CategoryItem = HControl.extend({
  componentName: 'categoryitem',
  isAbsolute: false,
  constructor: function(_parent, _categoryId, _categoryTitle, _idSelector){
    var _rect = new HRect(_parent._childRect);
    this.base( _rect, _parent, { label: _categoryTitle } );
    this.drawMarkup();
    this._categoryId = _categoryId;
    this._selectedMessenger = new _CategoryItemSelectedMessenger( _categoryId, this );
    _idSelector.bind( this._selectedMessenger );
    this._idSelector = _idSelector;
    this.setMouseDown(true);
    this.sizeElemId = this.bindDomElement('catsize'+this.elemId);
    this.labelElemId = this.bindDomElement('catname'+this.elemId);
    elem_set(this.labelElemId,_categoryTitle);
    elem_set(this.sizeElemId,'0');
    this.setStyle('overflow','hidden');
    this.show();
  },
  setLabel: function(_label){
    this.base( _label );
    if(this.labelElemId!==undefined){
      elem_set(this.labelElemId,_label);
    }
  },
  mouseDown: function(_x,_y,_z){
    this._idSelector.set( this._categoryId );
  },
  setValue: function(_number){
    this.base(_number);
    if(this.sizeElemId!==undefined){
      elem_set(this.sizeElemId,_number);
    }
    if((this._categoryId == 0)||(this._categoryId == -1)){
      this.show();
    } else {
      if(_number > 0){
        this.show();
      }
      else{
        this.hide();
      }
    }
  }
});