/***  HIMLE RIA SYSTEM
  ** 
  **  Copyright (C) 2008 HIMLE GROUP http://himle.sorsacode.com/
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

ReloadApp = HApplication.extend({
  constructor: function( _windowTitle, _windowMessage, _destinationUrl ){
    
    this.base();
    
    this._destinationUrl = _destinationUrl;
    
    var _winWidth  = helmi.Window.getInnerWidth();
    var _winHeight = helmi.Window.getInnerHeight();
    var _halfWidth = parseInt(_winWidth/2,10);
    var _halfHeight = parseInt(_winHeight/2,10);
    
    this._backgroundView = new HView(
      new HRect( 0, 0, _winWidth, _winHeight ),
      this
    );
    
    this._backgroundView.setStyle('opacity',0.75);
    this._backgroundView.setStyle('background-color','#666');
    
    var _alertWidth  = 400;
    var _alertHeight = 300;
    var _alertX      = _halfWidth - 200;
    var _alertY      = _halfHeight - 150;
    
    if(_alertX<10){_alertX = 10;}
    if(_alertY<10){_alertY = 10;}
    
    var _alertRect   = new HRect( _alertX, _alertY, _alertX+_alertWidth, _alertY+_alertHeight );
    
    this._alertWindow = new HWindowControl(
      _alertRect,
      this, {
        label: _windowTitle,
        minSize: [_alertWidth,_alertHeight],
        maxSize: [_alertWidth,_alertHeight],
        enabled: true
      }
    );
    
    var _alertMessageView = this._alertWindow.windowView;
    
    var _alertMessageTitleBox = new HView( new HRect( 10, 10, 350, 32 ), _alertMessageView );
    _alertMessageTitleBox.setStyle('font-family','Trebuchet MS, Arial, sans-serif');
    _alertMessageTitleBox.setStyle('font-size','18px');
    _alertMessageTitleBox.setStyle('font-weight','bold');
    _alertMessageTitleBox.setStyle('color','#000');
    _alertMessageTitleBox.setHTML( _windowTitle );
    
    var _alertMessageBox = new HView( new HRect( 10, 48, 350, 230 ), _alertMessageView );
    _alertMessageBox.setStyle('font-family','Trebuchet MS, Arial, sans-serif');
    _alertMessageBox.setStyle('font-size','13px');
    _alertMessageBox.setStyle('overflow','auto');
    _alertMessageBox.setStyle('color','#000');
    _alertMessageBox.setHTML( _windowMessage );
    
    var _reloadButton = new HClickButton(
      new HRect(10, 236, 370, 258 ),
      _alertMessageView,
      { label: 'Reload', action: this._clicked }
    );
    HTransporter.stop();
  },
  _clicked: function(){
    location.href = reloadApp._destinationUrl;
  }
});
/** USAGE: 
jsLoader.load('servermessage');
reloadApp = new ReloadApp( 'Session Timeout', 'Your session has timed out', '/' );
**/
