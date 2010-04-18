/*   Riassence Framework
 *   Copyright 2009 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

// Starts the synchronization upon page load.
LOAD(
  function(){
    COMM.urlResponder=COMM.URLResponder.nu();
    urlResponder=COMM.urlResponder; // backwards compatibility
    COMM.Transporter.url=HCLIENT_HELLO;
    COMM.Transporter.stop=false;
    COMM.Transporter.sync();
  }
);
