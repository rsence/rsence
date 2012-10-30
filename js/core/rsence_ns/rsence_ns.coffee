
# The RSence namespace
RSence =

  # Adds text selection prevention class
  loadUnselectable: ->
    HThemeManager.useCSS('''
.textunselectable {
   -webkit-user-select: none;
   -khtml-user-select: none;
   -moz-user-select: -moz-none;
   -ms-user-select: none;
   -o-user-select: none;
   user-select: none;
}
.textselectable {
   -webkit-user-select: text;
   -khtml-user-select: text;
   -moz-user-select: text;
   -ms-user-select: text;
   -o-user-select: text;
   user-select: text;
}
''')
  
  # Call this method from the index page for
  # client-only features
  clientConf: (_clientPrefix)->
    HThemeManager.themePath = _clientPrefix+'/themes'
    HThemeManager._start()
    @loadUnselectable()

  # Call this method from the index page to
  # setup the environment variables and to
  # start synchronizing immediately afterwards.
  serverConf: (_clientPrefix, _helloUrl) ->
    COMM.ClientPrefix = _clientPrefix
    COMM.Transporter.HelloUrl = _helloUrl
    RSence.clientConf( _clientPrefix )
    COMM.AutoSyncStarter.start()
    null
  
  # Storage for guiTrees, cantains
  # JSONRenderer instances by plugin name.
  guiTrees: {}

  killGuiTree: (_guiName)->
    _guiTrees = RSence.guiTrees
    _guiTree = _guiTrees[_guiName]
    if _guiTree?
      _guiTree.die()
      _guiTrees[_guiName] = null
      delete _guiTrees[_guiName]
