/*   RSence
 *   Copyright 2009 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */


/*** = Description
  ** The single instance of this class is constructed after the first
  ** handshake request with the server by the 'main' plugin.
  **
  ** It has dual functionality:
  ** - It tells the the client time.
  **   It's available as the server HValue instance
  **   +msg.session[:main][:client_time]+ from
  **   any Plugin instance.
  ** - It polls the server on regular intervals.
  **   The polling interval is defined by the server
  **   as the _timeoutSecs constructor parameter.
  **
***/
COMM.SessionWatcher = HApplication.extend({
  constructor: function( _timeoutSecs, _sesTimeoutValueId ){
    
    // onIdle is called when HSystem's ticker count % 100 == 0
    // this means it's 5 seconds with HSystemTickerInterval 50
    this.base(10, 'SesWatcher'); 
    
    // gets the HValue represented by
    // sesTimeoutValueId (:client_time in server)
    this.sesTimeoutValue = COMM.Values.values[_sesTimeoutValueId];
    this.timeoutSecs = _timeoutSecs;
  },
  
  // Tells the server the client's current time
  onIdle: function(){
    if((new Date().getTime() - this.sesTimeoutValue.value) > this.timeoutSecs ){
      this.sesTimeoutValue.set( new Date().getTime() );
    }
  }
});
