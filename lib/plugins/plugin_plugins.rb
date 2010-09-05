##   RSence
 #   Copyright 2010 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##


module RSence
  
  
  module Plugins
    
    
    # Include this module in your subclass of {Plugin__ Plugin} to enable sub-plugin bundles in another plugin bundle.
    #
    # The plugins loaded using this system are isolated from system-wide plugins.
    #
    # To address them from this plugin, use +@plugin_plugins+ instead of +@plugins+ to access them.
    #
    # Install your sub-plugins into a directory named +plugins+ inside your plugin bundle.
    module PluginPlugins
      
      # Extended {#init}, delegates calls to the sub-plugins.
      def init
        super
        @plugin_plugins = RSence::PluginManager.new({
          :plugin_paths => [ bundle_path('plugins') ],
          :autoreload => @plugins.autoreload,
          :parent_manager => @plugins
        })
      end
      
      # Extended {#open}, delegates calls to the sub-plugins.
      def open
        super
        @plugin_plugins.delegate(:open)
      end
      
      # Extended {#close}, delegates calls to the sub-plugins.
      def close
        super
        @plugin_plugins.delegate(:close)
      end
      
      # Extended {#flush}, delegates calls to the sub-plugins.
      def flush
        super
        @plugin_plugins.delegate(:flush)
      end
      
      # Extended {#idle}, delegates calls to the sub-plugins.
      def idle( msg )
        super
        @plugin_plugins.delegate(:idle,msg)
      end
      
      # Extended {#init_ses}, delegates calls to the sub-plugins.
      def init_ses( msg )
        super
        @plugin_plugins.delegate(:init_ses,msg)
      end
      
      # Extended {#restore_ses}, delegates calls to the sub-plugins.
      def restore_ses( msg )
        super
        @plugin_plugins.delegate(:restore_ses,msg)
      end
      
      # Extended {#cloned_target}, delegates calls to the sub-plugins.
      def cloned_target( msg, source_session )
        super
        @plugin_plugins.delegate(:cloned_target,msg,source_session)
      end
      
      # Extended {#cloned_source}, delegates calls to the sub-plugins.
      def cloned_source( msg, target_session )
        super
        @plugin_plugins.delegate(:cloned_source,msg,target_session)
      end
      
    end
  end
end
