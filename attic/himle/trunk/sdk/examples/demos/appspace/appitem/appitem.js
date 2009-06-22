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


_AppItemCategoryMessenger = HClass.extend({
  constructor: function(_appCategories,_appItem){
    this._appCategories = _appCategories;
    this._appItem = _appItem;
  },
  setValueObj: function(_obj){
    this.valueObj = _obj;
    this.setValue( _obj.value );
  },
  setValue: function(_value){
    if(this._appCategories.indexOf(_value)!=-1){
      if(!(this._appItem._launchMessenger.value == 3)){
        this._appItem.show();
      }
    } else {
      this._appItem.hide();
    }
    this.value = _value;
  }
});

_AppItemLaunchMessenger = HClass.extend({
  constructor: function(_appItem){
    this._appItem = _appItem;
  },
  setValueObj: function(_obj){
    this.valueObj = _obj;
    this.setValue( _obj.value );
  },
  // 0 = initial status
  // 1 = launch request
  // 2 = launch complete
  // 3 = hide by keyword search
  // 4 = show by keyword search
  setValue: function(_value){
    if( _value != this.value ){
      if( _value == 1){
        this._appItem.setStyle('background-color','#ffffff');
      } else if( _value == 2){
        this._appItem.setStyle('background-color','#ffcc00');
      } else if( _value == 3){
        this._appItem.hide();
      } else if( _value == 4){
        this._appItem.show();
      } else if( _value == 0) {
        this._appItem.setStyle('background-color','transparent');
      }
      this.value = _value;
    }
  }
});

AppItem = HControl.extend({
  componentName: 'appitem',
  isAbsolute: false,
  flexRight: true,
  constructor: function(_parent, _appIconSrc, _appTitle, _appMessengerValue, _appCategories){
    var _rect = new HRect(_parent._childRect);
    this.base(_rect,_parent,{label:_appTitle});
    this.hide();
    this.drawMarkup();
    this.setMouseDown(true);
    this._iconElemId = this.bindDomElement('appicon'+this.elemId);
    var _iconElem = elem_get( this._iconElemId );
    _iconElem.src = _appIconSrc;
    this._descrElemId = this.bindDomElement('appdescr'+this.elemId);
    //prop_set(this._iconElemId,'background-image',"url('"+_appIconSrc+"')");
    this._launchMessenger = new _AppItemLaunchMessenger( this );
    _appMessengerValue.bind( this._launchMessenger );
    this._categoryMessenger = new _AppItemCategoryMessenger( _appCategories, this );
    this.app.categoryIdVal.bind( this._categoryMessenger );
  },
  setLabel: function(_label){
    if(this._descrElemId){
      prop_set(this._descrElemId,_label);
    }
    this.base(_label);
  },
  mouseDown: function(_x,_y,_z){
    this._launchMessenger.setValue(1);
  }
});
