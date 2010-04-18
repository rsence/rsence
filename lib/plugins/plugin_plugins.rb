##   Riassence Framework
 #   Copyright 2010 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##

## Interface to enable plugins in a plugin. Just include this in your subclass of Plugin.
module PluginPlugins
  def init
    super
    @plugin_plugins = RSence::PluginManager.new( [ bundle_path('plugins') ] )
  end
  def open
    super
    @plugin_plugins.delegate(:open)
  end
  def close
    super
    @plugin_plugins.delegate(:close)
  end
  def flush
    super
    @plugin_plugins.delegate(:flush)
  end
  def idle( msg )
    super
    @plugin_plugins.delegate(:idle,msg)
  end
  def init_ses( msg )
    super
    @plugin_plugins.delegate(:init_ses,msg)
  end
  def restore_ses( msg )
    super
    @plugin_plugins.delegate(:restore_ses,msg)
  end
  def cloned_target( msg, source_session )
    super
    @plugin_plugins.delegate(:cloned_target,msg,source_session)
  end
  def cloned_source( msg, target_session )
    super
    @plugin_plugins.delegate(:cloned_source,msg,target_session)
  end
end
