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


_BgColorResponder = HClass.extend({
  constructor: function(){
    this._bodyElemId = elem_bind('body');
  },
  setValueObj: function(_obj){
    this.valueObj = _obj;
    this.setValue( _obj.value );
  },
  setValue: function(_val){
    prop_set( this._bodyElemId, 'background-color', _val );
  }
});

_BgColorLabel = HView.extend({
  constructor: function(_parent){
    var _rect = new HRect(100,127,195,145);
    this.base(_rect,_parent);
    this.setHTML('Theme');
    this.setStyle('font-size','11px');
    this.setStyle('color','#333');
  }
});

_LoginResponder = HClass.extend({
  constructor: function(_userInfo){
    this._userInfo = _userInfo;
  },
  setValueObj: function(_obj){
    this.valueObj = _obj;
    this.setValue( _obj.value );
  },
  // 0 = initial state (not logged in)
  // 1 = login ok (hide login / register, show user info + logout)
  // 2 = not ok (show msg)
  // 3 = checking login (show progress)
  // 4 = started registering
  // 5 = logged out
  setValue: function(_val){
    if(_val==0){
      this._userInfo._loginBox._loginProgress.hide();
      this._userInfo._loginBox._loginStatusBox.setHTML('Please <b>Log In</b> or <b>Register</b>');
    } else if(_val==1){
      this._userInfo._loginBox._loginProgress.hide();
      this._userInfo._loginBox.hide();
      this._userInfo._infoBox.show();
    } else if (_val==2){
      this._userInfo._loginBox._loginProgress.hide();
      this._userInfo._loginBox._loginStatusBox.setHTML('<b>Log In Error:</b> Invalid credentials.');
      this._userInfo._loginBox.show();
      this._userInfo._infoBox.hide();
    } else if (_val==3){
      this._userInfo._loginBox._loginProgress.show();
      this._userInfo._loginBox._loginStatusBox.setHTML('<i>Checking credentials...</i>');
    } else if (_val==4){
      this._userInfo._loginBox.hide();
      this._userInfo._startRegisterWizard();
    } else if (_val==5){
      this._userInfo._loginBox.show();
      this._userInfo._loginBox._loginStatusBox.setHTML('Logged out. Please <b>Log In</b> or <b>Register</b>');
      this._userInfo._infoBox.hide();
    }
  }
});

// Login Box Group
_LoginBox = HView.extend({
  constructor: function(_parent,_userNameId,_passwdHashId,_passwdSaltId,_loginCmdId){
    var _rect = new HRect(6,32,195,122);
    this.base(_rect,_parent);
    this._loginStatusBox = new HView(new HRect(0,0,187,21),this);
    var _statusStyle = [
      ['color',          '#fff'],
      ['text-align',     'center'],
      ['vertical-align', 'middle'],
      ['line-height',    '21px'],
      ['font-size',      '11px']
    ];
    for(var i=0;i<_statusStyle.length;i++){
      this._loginStatusBox.setStyle(_statusStyle[i][0],_statusStyle[i][1]);
    }
    this._loginProgress = new HView(new HRect(173,0,189,16),this);
    this._loginProgress.setStyle('background-image',"url('/rsrc/loading.gif')");
    this._loginProgress.hide();
    var _labelStyle = [
      ['font-size',     '11px'],
      ['color',         '#333']
    ];
    this._userNameLabel = new HView(new HRect(7,27,90,40),this);
    this._userNameLabel.setHTML('Username:');
    this._userNameField = new SmallTextField(new HRect(2,40,90,61),this);
    HVM.values[_userNameId].bind(this._userNameField);
    
    this._userPassLabel = new HView(new HRect(105,27,204,40),this);
    this._userPassLabel.setHTML('Password:');
    this._userPassField = new SmallPasswdField(new HRect(100,40,188,61),this,_passwdSaltId);
    HVM.values[_passwdHashId].bind(this._userPassField);
    
    var _labels = [this._userNameLabel,this._userPassLabel];
    for(var i=0;i<_labels.length;i++){
      for(var j=0;j<_labelStyle.length;j++){
        _labels[i].setStyle(_labelStyle[j][0],_labelStyle[j][1]);
      }
    }
    
    this._registerButton = new SmallButton(
      new HRect(2,64,90,85), this, {
        label:      'Register',
        actionVal:  4,
        events:     {mouseDown:true}
      }
    );
    HVM.values[_loginCmdId].bind(this._registerButton);
    
    this._loginButton = new SmallButton(
      new HRect(100,64,188,85), this, {
        label:      'Log In',
        actionVal:  3,
        events:     {mouseDown:true}
      }
    );
    HVM.values[_loginCmdId].bind(this._loginButton);
  },
  
  _startRegisterWizard: function(){
    throw "LoginBox startRegisterWizard not implemented yet!";
  }
});

_InfoBox = HView.extend({
  constructor: function(_parent){
    var _rect = new HRect(6,32,195,122);
    this.base(_rect,_parent);
    this.hide();
    this.setStyle('background-color','#900');
    this.setStyle('color','#fff');
    this.setStyle('font-size','21px');
    this.setHTML('<b><i>InfoBox not implemented yet!</i></b>');
  }
});

UserInfo = HView.extend({
  componentName: 'userinfo',
  constructor: function( _parent, _bgColorId, _userNameId, _passwdHashId, _passwdSaltId, _loginCmdId ){
    var _rect = new HRect(60,103,260,303);
    this.base( _rect, _parent );
    this.hide();
    this.drawMarkup();
    
    this._userNameId   = _userNameId;
    this._passwdHashId = _passwdHashId;
    this._passwdSaltId = _passwdSaltId;
    this._loginCmdId   = _loginCmdId;
    
    this._buildUserInfo();
    
    this._bgColorVal = HVM.values[_bgColorId];
    this._buildColorPalette();
    
    this.show();
  },
  
  _buildUserInfo: function(){
    this._loginBox = new _LoginBox( this, this._userNameId, this._passwdHashId, this._passwdSaltId, this._loginCmdId );
    this._infoBox = new _InfoBox( this );
    this._loginResponder = new _LoginResponder( this );
    HVM.values[this._loginCmdId].bind(this._loginResponder);
  },
  
  _buildColorPalette: function(){
    this._bgColorLabel = new _BgColorLabel(this);
    this._bgColorResponder = new _BgColorResponder();
    this._bgColorVal.bind( this._bgColorResponder );
    this._colorBox = new HView(new HRect(95,143,193,193),this);
    this._colorBox.setStyle('background-color','#ccc');
    this._colorBox.setStyle('border','1px solid #000');
    var _buildRect = new HRect(1,1,17,17);
    var _colors = [
      '#000000','#333333','#666666','#999999','#cccccc','#ffffff',
      '#003366','#330066','#660000','#009933','#996600','#663300',
      '#99ccff','#cc99ff','#ff9999','#99ffcc','#ffcc00','#ffcc99'
    ];
    for(var i = 0; i < _colors.length; i++){
      if(((i%6)==0)&&(i!=0)){
        _buildRect.offsetBy(0,16);
        _buildRect.setLeft(1);
        _buildRect.setRight(17);
      }
      var _colorItem = new BgColorButton(new HRect(_buildRect), this._colorBox, _colors[i]);
      this._bgColorVal.bind(_colorItem);
      _buildRect.offsetBy(16,0);
    }
  }
});
