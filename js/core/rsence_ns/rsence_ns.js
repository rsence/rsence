/*   RSence
 *   Copyright 2010 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

// RSence namespace, nothing here yet.
// However, a future version of client_pkg will pack var's assigned like..
//   var//RSence
// ..into this namespace.
// Additional logic for handling the namespaces will however be required.
var RSence = {
  
  // Configuration method for the html document of the server
  serverConf: function(_clientPrefix,_helloUrl){
    COMM.ClientPrefix=_clientPrefix;
    COMM.Transporter.HelloUrl=_helloUrl;
    HThemeManager.themePath=_clientPrefix+'/themes';
  },
  
  // Structure reserved for JSONRenderer instances remotely populated by the server
  guiTrees: {
    
  }
};

