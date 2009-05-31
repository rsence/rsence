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

// The HSystem ticker interval in ms:
HSystemTickerInterval = 50;

// The Element Manager's DOM-update ticker, in ms
ELEMTickerInterval = 50;

// Another limit for Element Manager,
// limits frames per seconds of DOM Updates.

// Prevents wasting precious cpu-cycles on something
// a human being can't see.
ELEM.setFPS(20);

// Changes the documentElement properties of the web page.
ELEM.setStyle(0,'overflow','auto');

// Sets the theme path to the path FileServe responds to:
HThemeManager.setThemePath('/H/'+HCLIENT_REV+'/themes');

// Deletes the initial "Loading, please wait..." -message
ELEM.del(ELEM.bindId('loading'));

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

