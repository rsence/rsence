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

AppSpace = HApplication.extend({
  constructor: function(
      _categoryId, _refreshId, _filterId, _combinedSizeId, _myAppsSizeId,
      _bgColorId, _userNameId, _passwdHashId, _passwdSaltId, _loginCmdId,
      _editorStateId
    ){
    this.base(50);
    
    this.editorState     = HVM.values[ _editorStateId     ];
    
    this.view = new SiteBox(
      this, _filterId, _bgColorId, _userNameId,
      _passwdHashId, _passwdSaltId, _loginCmdId
    );
    this._counter = 0;
    this.categoryItems = [];
    this.appItems = {};
    this.categoryIdVal = HVM.values[_categoryId];
    this._refresher    = HVM.values[_refreshId];
    this.categoryItems.push(
      this.addCategory( -1, 'My Apps', _myAppsSizeId )
    );
    this.categoryItems.push(
      this.addCategory( 0, 'All Categories', _combinedSizeId )
    );
  },
  addCategory: function(_categoryId,_categoryTitle,_categorySizeId){
    var _categoryList  = this.view.explorer.categories;
    var _categoryItem  = new CategoryItem( _categoryList, _categoryId, _categoryTitle, this.categoryIdVal );
    var _categorySize  = HValueManager.values[ _categorySizeId ];
    _categorySize.bind( _categoryItem );
    this.categoryItems.push( _categoryItem );
  },
  addApps: function(_appList){
    var _appNum, _appArr, _appIconSrc, _appTitle,
        _appMsgId, _appMessengerValue, _appCategories;
    var _appListView = this.view.explorer.appList;
    for(_appNum=0; _appNum < _appList.length; _appNum++){
      _appArr = _appList[_appNum];
      _appIconSrc = _appArr[0];
      _appTitle = _appArr[1];
      _appMsgId = _appArr[2];
      _appMessengerValue = HVM.values[_appMsgId];
      _appCategories = _appArr[3];
      this.appItems[_appMsgId] = new AppItem(_appListView, _appIconSrc, _appTitle, _appMessengerValue, _appCategories );
    }
  },
  onIdle: function(){
    this._counter++;
    if(this._counter%100==0){
      // sync now and then this dummy value to the server,
      // so the session won't time out.
      this._refresher.set( this._counter/100 );
    }
    
    // view size tuning:
    var _wH = this.view._winH;
    var _wW = this.view._winW;
    var _wH0 = helmi.Window.getInnerHeight();
    var _wW0 = helmi.Window.getInnerWidth();
    if(this._counter%10==0){
      var _tooNarrow = (this.view.rect.width  < this.view.options.minSize[0]);
      var _tooLow =    (this.view.rect.height < this.view.options.minSize[1]);
      if (_tooNarrow || _tooLow){
        this.view.maximizeWin();
      }
    }
    else if(this._counter%10==1){
      this.view.snapTo();
    }
    if((_wH != _wH0) ||
       (_wW != _wW0)
    ) {
      var _view = this.view;
      var _rect = _view.rect;
      var _targetRect = new HRect( _rect );
      _view._winW = _wW0;
      _view._winH = _wH0;
      if( _view.isMaximized ){
        _targetRect.set(_view._calcMaxRect());
        //_targetRect.setSize( _wW0 + 48, _wH0 + 64 );
      } else if (!_view.isMinimized) {
        if (_rect.width-64 > _wW0){
          _targetRect.setWidth( _wW0 + (0-_view.pageX()) );
        }
        if (_rect.height-64 > _wH0) {
          _targetRect.setHeight( _wH0 + (0-_view.pageY()) );
        }
        if ((_rect.left > _wW0) || (_rect.top > _wH0)) {
          _targetRect.offsetTo( _wW0 - _targetRect.width, _wH0 - _targetRect.height );
        }
      }
      if(!_rect.equals(_targetRect)){
        if(_targetRect.width < _view.options.minSize[0]){ _targetRect.setWidth( _view.options.minSize[0] ); }
        if(_targetRect.height < _view.options.minSize[1]){ _targetRect.setHeight( _view.options.minSize[1] ); }
        _view.animateTo( _targetRect );
      }
    }
  }
});
