
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
      
      # Makes @plugin_plugins accessible
      attr :plugin_plugins
      
      # Extended {#init}, delegates calls to the sub-plugins.
      def init
        super
        @plugin_plugins = RSence::PluginManager.new({
          :plugin_paths => [ bundle_path('plugins') ],
          :autoreload => true,
          :name_prefix => name_with_manager_s.to_sym,
          :parent_manager => @plugins,
          :resolved_deps => [ :system, @name, name_with_manager_s.to_sym ]
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
        @plugin_plugins.shutdown
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
