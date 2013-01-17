
// Starts the synchronization upon page load.
COMM.AutoSyncStarter = {
  start: function(){
    COMM.urlResponder=COMM.URLResponder.nu();
    COMM.Transporter.url=COMM.Transporter.HelloUrl;
    COMM.Transporter.stop=false;
    COMM.Transporter.sync();
  }
};
