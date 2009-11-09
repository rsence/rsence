/*   Riassence Framework
 *   Copyright 2008 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

// Changes the documentElement properties of the web page.
ELEM.setStyle(0,'overflow','auto');

// Session Watcher class definition
SesWatcher = HApplication.extend({
  constructor: function( _timeoutSecs, _sesTimeoutValueId ){
    
    this.label = 'SesWatcher';
    
    // onIdle is called when HSystem's ticker count % 100 == 0
    // this means it's 5 seconds with HSystemTickerInterval 50
    this.base(10); 
    
    // gets the HValue represented by
    // sesTimeoutValueId (:client_time in server)
    this.sesTimeoutValue = HVM.values[_sesTimeoutValueId];
    this.timeoutSecs = _timeoutSecs;
  },
  
  // Tells the server the client's current time
  onIdle: function(){
    if((new Date().getTime() - this.sesTimeoutValue.value) > this.timeoutSecs ){
      this.sesTimeoutValue.set( new Date().getTime() );
    }
  }
});

