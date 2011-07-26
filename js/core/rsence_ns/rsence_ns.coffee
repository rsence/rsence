
# The RSence namespace
RSence =
  
  # Call this method from the index page to
  # setup the environment variables and to
  # start synchronizing immediately afterwards.
  serverConf: (_clientPrefix, _helloUrl) ->
    COMM.ClientPrefix = _clientPrefix
    COMM.Transporter.HelloUrl = _helloUrl
    HThemeManager.themePath = _clientPrefix+'/themes'
    HThemeManager._start()
    COMM.AutoSyncStarter.start()
    null
  
  # Storage for guiTrees, cantains
  # JSONRenderer instances by plugin name.
  guiTrees: {}

