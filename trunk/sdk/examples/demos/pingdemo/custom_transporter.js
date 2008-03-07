/***  HIMLE RIA SYSTEM
  ** 
  **  Copyright (C) 2008 HIMLE GROUP http://himle.sorsacode.com/
  **  Copyright (C) 2006-2007 Helmi Technologies Inc.
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

HTransportURL = 'server.cfm';

_HTransporter = _HTransporter.extend({

	/* jsfailure: function(jserr, resp) {
		console.log('JS EVAL ERR! STOP.');
    console.log(jserr);
    console.log(resp);
		clearTimeout(this.req_timeout);
		this.isBusy = true;
	},
	
	respond: function(resp) {
		var t = HTransporter;
		try {
		  eval(resp.responseText); 
		  t.isBusy = false;
		} catch(e) {
		  t.jsfailure(e, resp.responseText);
		}
	}, */
  
  stop: function() {
    clearTimeout(this.req_timeout);
  }
});

