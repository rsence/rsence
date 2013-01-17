
// RSence client-side namespace initialization.
// Current contents are a store for guiTrees and the serverConf method for setting up variables before starting.
var
RSence = {
  
  // Configuration method for the html document of the server
  serverConf: function(_clientPrefix,_helloUrl){
    COMM.ClientPrefix=_clientPrefix;
    COMM.Transporter.HelloUrl=_helloUrl;
    HThemeManager.themePath=_clientPrefix+'/themes';
    HThemeManager._start();
    COMM.AutoSyncStarter.start();
  },
  
  // Structure reserved for JSONRenderer instances remotely populated by the server
  guiTrees: {
    
  }
};
