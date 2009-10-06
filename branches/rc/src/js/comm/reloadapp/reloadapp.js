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

ReloadApp = HApplication.extend({
  reload: function(){
    var _url = this._url;
    if((!_url)||(_url==='/')){
      window.location.reload(true);
    }
    else {
      window.location.href = _url;
    }
  },
  reset_session: function(){
    COMM.request(
      HCLIENT_HELLO + '/goodbye', {
        method: 'POST',
        body: ('ses_key='+COMM.Session.ses_key),
        async: true,
        onSuccess: function(){
          window.location.reload(true);
        },
        onFailure: function(){
          window.location.reload(true);
        }
    });
  },
  constructor: function( _title, _message, _url ){
    var _this = this;
    _this.base();
    _this._title = _title;
    _this._message = _message;
    _this._url = _url;
    var _winWidth  = ELEM.windowSize()[0],
        _winHeight = ELEM.windowSize()[1],
        _halfWidth = parseInt(_winWidth/2,10),
        _halfHeight = parseInt(_winHeight/2,10),
        _alertWidth  = 400,
        _alertHeight = 300,
        _alertX      = _halfWidth - 200,
        _alertY      = _halfHeight - 150;
    if(_alertX<10){_alertX = 10;}
    if(_alertY<10){_alertY = 10;}
    HWindow.extend({
      drawSubviews: function(){
        var _this = this,
            _elemId = _this.markupElemIds['subview'],
            _alertIcon = ELEM.make( _elemId ),
            _alertTitle = ELEM.make( _elemId ),
            _alertMessage = ELEM.make( _elemId ),
            _iconUrl = _this.getThemeGfxFile('reloadapp_warning.png');
        _this.setStyle('font-family','Arial, sans-serif');
        _this.setStyle('color','#000');
        _this.setStyle('font-size','13px');
        ELEM.setCSS(_alertIcon,'position:absolute;left:8px;top:8px;width:48px;height:48px;background-image:url('+_iconUrl+');');
        ELEM.setCSS(_alertTitle,'position:absolute;left:64px;top:8px;width:300px;height:24px;line-height:24px;vertical-align:middle;text-align:center;font-weight:bold;overflow:hidden;text-overflow:ellipsis;line-wrap:nowrap;');
        ELEM.setHTML(_alertTitle,_this.app._title);
        ELEM.setCSS(_alertMessage,'position:absolute;left:64px;top:42px;width:332px;height:186px;border-bottom:1px dotted #999;line-height:17px;vertical-align:middle;overflow:auto;');
        ELEM.setHTML(_alertMessage,_this.app._message);
        HButton.extend({
          click: this.app.reload
        }).nu(
          HRect.nu(280, 234, 380, 258 ),
          _this, {
            label: 'Reload',
            events: {
              click: true
            }
          }
        );
        HButton.extend({
          click: this.app.reset_session
        }).nu(
          HRect.nu(20, 234, 170, 258 ),
          _this, {
            label: 'Reset session',
            events: {
              click: true
            }
          }
        );
      }
    }).nu(
      HRect.nu( _alertX, _alertY, _alertX+_alertWidth, _alertY+_alertHeight ),
      _this, {
        label: _title,
        minSize: [_alertWidth,_alertHeight],
        maxSize: [_alertWidth,_alertHeight],
        enabled: true,
        closeButton: true,
        noResize: true
      }
    );
    
    COMM.Transporter.stop = true;
  },
  onIdle: function(){
    if(this._alertWindow){
      HSystem.windowFocus(this._alertWindow);
    }
  }
});
/** USAGE: 
jsLoader.load('servermessage');
reloadApp = ReloadApp.nu( 'Session Timeout', 'Your session has timed out', '/' );
**/
