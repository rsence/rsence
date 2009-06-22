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

SiteBox = HWindowControl.extend({
  componentName: 'sitebox',
  constructor: function( _parent, _filterId, _bgColorId, _userNameId, _passwdHashId, _passwdSaltId, _loginCmdId ){
    this._winW = helmi.Window.getInnerWidth();
    this._winH = helmi.Window.getInnerHeight();
    var _rect = this._calcMaxRect();
    var _options = {
      label:     'AppSpace',
      minSize:   [797,500],
      maxSize:   [2048,1536],
      barHeight: 100,
      resizeW:   36,
      resizeE:   36,
      resizeN:   36,
      resizeS:   36,
      resizeNW:  [60, 60],
      resizeNE:  [60, 60],
      resizeSW:  [60, 60],
      resizeSE:  [60, 60]
    };
    this.base( _rect, _parent, _options );
    this.snapTo();
    this.type = '[SiteBox]';
    this.explorer = new AppExplorer(this.bindDomElement('app-explorer-'+this.elemId), _filterId, this);
    this.userinfo = new UserInfo( this, _bgColorId, _userNameId, _passwdHashId, _passwdSaltId, _loginCmdId );
    this.isMinimized = false;
    this.isMaximized = false;
    this.restoreRect = new HRect( this.rect );
    this.minimizeButton = new MinimizeButton( this, 18 );
    this.maximizeButton = new MaximizeButton( this, 0 );
    this.restoreButton  = new RestoreButton( this, 0 );
    
    this.asWizardLauncher = new (SmallButton.extend({
      flexTop: false,
      flexBottom: true,
      flexBottomOffset: 48,
      constructor: function(_parent){
        var _rect = new HRect(480,0,600,21);
        this.base(_rect,_parent,{
          label:'Create Application',
          actionVal:1,
          events: {  mouseDown:true  }
        });
      }
    }))(this);
    this.app.editorState.bind(this.asWizardLauncher);
    
    this.minimizeButton.show();
    this.maximizeButton.show();
  },
  
  // disable normal window stuff
  buildWinParts: function(){
  },
  
  // disable normal window stuff
  calcWindowPartRects: function(){
  },
  
  minimizeWin: function(){
    if(!this.isMinimized){
      if(!this.isMaximized){
        this.restoreRect = new HRect( this.rect);
      }
      var _targetRect = new HRect( this.rect );
      _targetRect.setSize( this.options.minSize[0], this.options.minSize[1] );
      _targetRect.offsetTo( 0-this.options.minSize[0]+128, this._winH - 64 );
      this.animateTo( _targetRect );
      this.snapTo();
      this.isMaximized = false;
      this.isMinimized = true;
    }
  },
  _calcMaxRect: function(){
    return new HRect( -32, -32, this._winW + 32, this._winH + 32 );
  },
  maximizeWin: function(){
    if(!this.isMaximized){
      if(!this.isMinimized){
        this.restoreRect = new HRect( this.rect);
      }
      var _targetRect = this._calcMaxRect();
      this.animateTo( _targetRect );
      this.snapTo();
      this.isMinimized = false;
      this.isMaximized = true;
    }
  },
  restoreWin: function(){
    this.animateTo( this.restoreRect );
    this.isMinimized = false;
    this.isMaximized = false;
  },
  snapTo: function(){
    var _snap5Remainder = (this.rect.width + 1) % 6;
    if (_snap5Remainder != 0){
      if (_snap5Remainder < 3){
        var _snap5Width     = this.rect.width - _snap5Remainder;
      } else {
        var _snap5Width     = this.rect.width + (6-_snap5Remainder);
      }
      this.rect.setWidth( _snap5Width );
      this.setStyle('width',_snap5Width+'px');
    }
  },
  startDrag: function(x,y){
    if(this.isMaximized){
      this.isMaximized = false;
      this.restoreButton.hide();
      this.maximizeButton.show();
    }
    this.isMinimized = false;
    this.base(x,y);
  },
  endDrag: function(x,y){
    this.base(x,y);
    this.snapTo();
  }
  
});
