/*   Riassence Framework
 *   Copyright 2008 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

/*** = Description
  ** An application designed to display errors.
  **
  ** Used automatically by the server to report issues.
  ** Stops COMM.Transporter and displays a HWindow with the message contained.
  ** Has two buttons: *Reset Session* and *Reload*
  **
  ** = Usage
  **   jsLoader.load('servermessage');
  **   ReloadApp.nu( 'Session Timeout', 'Your session has timed out', '/' );
  **
**/
ReloadApp = HApplication.extend({
  
/** Reloads the page using the +_url+ given in the +constructor+.
  **/
  reload: function(){
    var _url = this._url;
    if((!_url)||(_url==='/')){
      window.location.reload(true);
    }
    else {
      window.location.href = _url;
    }
  },
  
/** = Description
  * Reset the session.
  *
  * Resets the session by calling the hello/goodbye url on the server.
  * The server reads the cookie key and deletes the session bound to it.
  *
  * Reloads the page after a successful request.
  *
  **/
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
  
/** = Description
  * Constructs the ReloadApp.
  *
  * Creates an application with a window titled +_title+,
  * containing the +_message+ and *Reset Session* and *Reload*
  * buttons. The +_url+ is the url to load when any of the
  * buttons are pressed.
  *
  * = Parameters
  * +_title+::    The title of the message.
  * +_message+::  The message text content.
  * +_url+::      The url the buttons load when pressed.
  *
  **/
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
  
/** Re-focuses the window.
  **/
  onIdle: function(){
    if(this['_alertWindow']){
      HSystem.windowFocus(this._alertWindow);
    }
  }
});
