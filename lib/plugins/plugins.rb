##   RSence
 #   Copyright 2009 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##


module RSence
  
  # Namespace for plugin classes and modules
  module Plugins
  end
end

# Contains the PluginBase module which has common methods for the bundle classes
require 'plugins/plugin_base'

# guiparser.rb contains the Yaml serializer for gui trees.
# It uses JSONRenderer on the client to build user interfaces.
require 'plugins/guiparser'

# plugin_sqlite_db.rb contains automatic local sqlite database
# creation for a plugin that includes it.
require 'plugins/plugin_sqlite_db'

# Interface for plugins in a plugin bundle
require 'plugins/plugin_plugins'


# Templates for the main plugin classes.
require 'plugins/plugin'
require 'plugins/gui_plugin'
require 'plugins/servlet'


module RSence
  
  module Plugins
    
    # Creates the runtime Plugin class from Plugin__
    # @return [Plugin__]
    def self.Plugin
      lambda do |ns|
        klass = Class.new( Plugin__ ) do
          def self.ns=(ns)
            define_method( :bundle_info ) do
              ns.bundle_info
            end
          end
        end
        klass.ns = ns if ns
        klass
      end
    end
    
    
    # Creates the runtime GUIPlugin class from GUIPlugin__
    # @return [GUIPlugin__]
    def self.GUIPlugin
      lambda do |ns|
        klass = Class.new( GUIPlugin__ ) do
          def self.ns=(ns)
            define_method( :bundle_info ) do
              ns.bundle_info
            end
          end
        end
        klass.ns = ns if ns
        klass
      end
    end
    
    
    # Creates the runtime Servlet class from Servlet__
    # @return [Servlet__]
    def self.Servlet
      lambda do |ns|
        klass = Class.new( Servlet__ ) do
          def self.ns=(ns)
            define_method( :bundle_info ) do
              ns.bundle_info
            end
          end
        end
        klass.ns = ns if ns
        klass
      end
    end
    
    # Loads bundle in an anonymous module with special environment options.
    # @param [Hash] params
    # @option params [String] :src_path ('/path/of/the_plugin/the_plugin.rb') The ruby source file to read.
    # @option params [String] :bundle_path ('/path/of/the_plugin') The plugin bundle directory path.
    # @option params [String] :bundle_name (:the_plugin) The name of the plugin as it will be registered.
    # @return [Module] Isolated, anonymous module containing the evaluated source code of +src_path+
    def self.bundle_loader( params )
      begin
        mod = Module.new do |m|
          if RUBY_VERSION.to_f >= 1.9
            m.define_singleton_method( :_bundle_path ) do
              params[ :bundle_path ]
            end
          else
            m.module_eval( <<-END
            def self._bundle_path; #{params[:bundle_path].inspect}; end
            END
            )
          end
          
          # Makes a full path using the plugin bundle as the 'local path'.
          # The (optional) +prefix+ is a subdirectory in the bundle,
          # the +suffix+ is the file extension.
          def self.bundle_path( path=false, prefix=false, suffix=false )
            return _bundle_path if not path
            if suffix
              path = "#{path}#{suffix}" unless path.end_with?(suffix)
            end
            if prefix
              path = File.join( prefix, path )
            end
            path = File.expand_path( path, _bundle_path )
            return path
          end
          def self.inspect; "#<module BundleWrapper of #{@@bundle_name}}>"; end
          def self.const_missing( name )
            if name == :Servlet
              return Plugins.Servlet.call( self )
            elsif name == :Plugin
              return Plugins.Plugin.call( self )
            elsif name == :GUIPlugin
              return Plugins.GUIPlugin.call( self )
            else
              warn "Known const missing: #{name.inspect}"
              super
            end
          end
          begin
            plugin_src = params[:src]
            unless RUBY_VERSION.to_f >= 1.9
              plugin_src = "_bundle_path = #{params[:bundle_path].inspect};" + plugin_src
            end
            m.module_eval( plugin_src )
          rescue => e
            src_path = params[:src_path]
            src_path = "<undefined src_path>" if src_path == nil
            params[:plugin_manager].plugin_error(
              e,
              'BundleLoaderEvalError',
              "An error occurred while evaluating the plugin bundle #{params[:bundle_name]}.",
              src_path
            )
          end
        end
        return mod
      rescue => e
        src_path = params[:src_path]
        src_path = "<undefined src_path>" if src_path == nil
        params[:plugin_manager].plugin_error(
          e,
          'BundleLoaderError',
          "An error occurred while loading the plugin bundle #{params[:bundle_name]}.",
          src_path
        )
      end
    end
  end
end
