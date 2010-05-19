##   RSence
 #   Copyright 2010 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##

module ::RSence
  module Plugins
    
    # Interface to enable plugins under a plugin.
    # Just include this in your subclass of Plugin.
    # The plugins loaded using this system are isolated from other plugins.
    # To address them from this plugin, use @plugin_plugins instead of
    # @plugins to address them.
    module PluginPlugins
      
      # Extended init, delegates calls to the sub-plugins.
      def init
        super
        @plugin_plugins = RSence::PluginManager.new( [ bundle_path('plugins') ] )
      end
      
      # Extended open, delegates calls to the sub-plugins.
      def open
        super
        @plugin_plugins.delegate(:open)
      end
      
      # Extended close, delegates calls to the sub-plugins.
      def close
        super
        @plugin_plugins.delegate(:close)
      end
      
      # Extended flush, delegates calls to the sub-plugins.
      def flush
        super
        @plugin_plugins.delegate(:flush)
      end
      
      # Extended idle, delegates calls to the sub-plugins.
      def idle( msg )
        super
        @plugin_plugins.delegate(:idle,msg)
      end
      
      # Extended init_ses, delegates calls to the sub-plugins.
      def init_ses( msg )
        super
        @plugin_plugins.delegate(:init_ses,msg)
      end
      
      # Extended restore_ses, delegates calls to the sub-plugins.
      def restore_ses( msg )
        super
        @plugin_plugins.delegate(:restore_ses,msg)
      end
      
      # Extended cloned_target, delegates calls to the sub-plugins.
      def cloned_target( msg, source_session )
        super
        @plugin_plugins.delegate(:cloned_target,msg,source_session)
      end
      
      # Extended cloned_source, delegates calls to the sub-plugins.
      def cloned_source( msg, target_session )
        super
        @plugin_plugins.delegate(:cloned_source,msg,target_session)
      end
      
    end
  end
end
