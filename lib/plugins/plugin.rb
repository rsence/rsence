##   RSence
 #   Copyright 2006 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##


module RSence
  module Plugins
    
    # The Plugin__ is actually available as +Plugin+ from plugin bundles using the {RSence::Plugins::Plugin} class mimic method.
    # 
    # The Plugin class is the base class for extending server logic. A single Plugin instance serves the requests of all sessions, which makes them very cpu and memory efficient compared to systems, where the server classes are constructed and destructed for each request.
    # 
    # Plugins are designed to be contained in a plugin directory bundle and to be loaded by the main {PluginManager}, which is also responsible for delegating the events and other calls throughout the system.
    #
    # 
    # == Anatomy of a plugin bundle
    #
    # First read about the {file:PluginBundles Plugin Bundles}.
    #
    # The plugin bundle contains all data needed to run the plugin. Design your plugin without any hard-coded paths, remember that it's intended to be installed by moving or copying the whole plugin into one of the "plugins" directories. Use {#bundle_path} to construct paths.
    # 
    # The {PluginManager} looks for these bundles and evaluates them into an anonymous +Module+ namespace. The contents of the ruby source file is then responsible for including its libraries, constructing an instance of itself and registering itself as a part of the system.
    # 
    # Use the {GUIPlugin__ GUIPlugin} class for plugins that handle user interfaces. Use the {Plugin__ Plugin} class for plugin bundles that provide supplemental functionality, value responders and other utilities that supplement the user interface.
    # 
    # = Extension hooks for server events
    # These methods are provided as the basic server event hooks:
    # * {#init +init+} -- Use instead of +initialize+
    # * {#open +open+} -- Extend to open objects
    # * {#flush +flush+} -- Extend to write the state and to flush buffers
    # * {#close +close+} -- Extend to close objects
    #
    # = Extension hooks for session events
    # * {#idle +#idle+} -- Extend to implement logic for each client data synchronization and "idle poll" request.
    # * {#init_ses +#init_ses+} -- Extend to implement logic when a new session is created. A new session is created, when a user enters accesses the server the first time, or the first time after the previous session expired.
    # * {#restore_ses +#restore_ses+} -- Extend to implement logic when an old session is restored. A session is restored, when the user returns to the page or reloads the page before the session is expired.
    # 
    # == Extension hooks for session events, If the server is configured to restore and clone previous sessions (default):
    # When sessions are cloned, the previous session is not invalidated and exists until timing out as a result of the web browser window being closed or client computer losing network connectivity for a certain (configurable) time frame.
    # * {#cloned_target +#cloned_target+} -- Extend to implement logic in the request when session is a clone of the original session.
    # * {#cloned_source +#cloned_source+} -- Extend to implement logic in the next request of the original session after it has been cloned.
    # 
    # == If the server is configured to not clone sessions:
    # When the user accesses the same page using the same browser (in different tabs or windows), only the most recently restored one is valid, while the previous ones are immediately invalidated. This is a more secure mode of operation, but has several drawback to usability, so it's not enabled by default.
    #
    # = Utility methods
    # These are general utility methods not intended to be extended.
    # * {#get_ses +get_ses+} Returns the bundle-specific session Hash.
    # * {#file_read +file_read+} Use to read files
    # * {#yaml_read +yaml_read+} Use to read yaml data
    # * {#file_write +file_write+} Use to write files
    # * {#bundle_path +bundle_path+} Use for plugin bundle -specific paths
    # * {#httime +httime+} Use for HTTP date/time
    #
    # = Client-support
    # These methods are intended for server-client interaction. Namely, commanding the client.
    # * {#read_js +read_js+} Returns a javascript source file.
    # * {#read_js_once +read_js_once+} Returns a javascript source file once per session.
    # * {#values_js +values_js+} Returns a javascript source snippet containing references to values.
    # * {#include_js +include_js+} Tells the client to load a library package.
    #
    # = See also
    # * {file:PluginBundles Plugin Bundles} -- General information about the plugin bundle system
    # * {file:Values Values} -- General information about the value exchange system
    # * {file:PluginBundleInfo Plugin Bundle +info.yaml+ files} -- General information about the meta-information files.
    # * {PluginUtil PluginUtil} -- The PluginUtil module
    # * {Servlet__ Servlet} -- The Servlet base class
    # * {GUIPlugin__ GUIPlugin} -- The GUIPlugin base class
    class Plugin__
      
      
      include PluginUtil
      
      # @private Class type identifier for the PluginManager.
      # @return [:Plugin]
      def self.bundle_type; :Plugin; end
  
      # @return [Symbol] The name of the plugin bundle
      attr_reader :name
      
      # @return [String] The absolute path of the plugin bundle.
      attr_reader :path
      
      # @return [Hash] The {file:PluginBundleInfo meta-information} of the plugin bundle.
      attr_reader :info
      
      # @private State of the plugin.
      attr_reader :inited
  
      # @private The constructor should not be accessed from anywhere else than the PluginManager, which does it automatically.
      def initialize( bundle_name, bundle_info, bundle_path, plugin_manager )
        @inited  = false
        @info    = bundle_info
        @name    = bundle_name
        @path    = bundle_path
        @plugins = plugin_manager
        register unless @info[:inits_self]
      end
  
      # Extend this method to do any initial tasks before other methods are called.
      #
      # By default {#init_values} is called to load the {file:Values +values.yaml+} configuration file.
      #
      # @return [nil]
      #
      # @see PluginUtil#init
      def init
        @values = init_values
      end
  
      # Extend this method to do any tasks every time the client makes a request.
      #
      # @param [Message] msg The message is supplied by the system.
      #
      # @return [nil]
      def idle( msg )
      end
  
      # Extend this method to invoke actions, when a new session is created.
      #
      # By default {#init_ses_values} is called to initialize values defined in the {file:Values +values.yaml+} configuration file.
      #
      # @param [Message] msg The message is supplied by the system.
      #
      # @return [nil]
      def init_ses( msg )
        init_ses_values( msg )
      end
  
      # Extend this method to invoke actions, when a previous session is restored.
      #
      # By default +#restore_ses_values+ is called to perform actions on values as defined in the {file:Values +values.yaml+} configuration file.
      #
      # @param [Message] msg The message is supplied by the system.
      #
      # @return [nil]
      def restore_ses( msg )
        restore_ses_values( msg )
      end
  
      # Extend this method to invoke actions, when the session is a clone of another session. It's called once, just before {#restore_ses} is called.
      #
      # A session is cloned, when a user opens a another browser window or tab, while the previous session is still active.
      #
      # @param [Message] msg The message is supplied by the system.
      # @param [Hash] source_session The actual previous session object, which was used as the source of the clone.
      #
      # @return [nil]
      def cloned_target( msg, source_session )
      end
  
      # Extend this method to invoke actions, when the session has been cloned to another session. It's called once, just before {#restore_ses} is called on the first request after the cloning happened.
      #
      # A session is cloned, when a user opens a another browser window or tab, while the previous session is still active.
      #
      # @param [Message] msg The message is supplied by the system.
      # @param [Hash] target_session The actual cloned session object, which is a copy of the current session.
      #
      # @return [nil]
      def cloned_source( msg, target_sessions )
      end
  
      # @private This method must be called to register the plugin instance into the system. Otherwise, it's subject to destruction and garbage collection. Use the +name+ parameter to  give the (unique) name of your plugin.
      def register( name=false )
        if @inited
          @plugins.register_alias( @name, name )
        else
          if name
            name = name.to_s
          else
            name = @name
          end
          @plugins.register_bundle( self, name )
          @inited = true
        end
      end
  
      # This method returns (or creates and returns) the entry in the session based on the name your plugin is registered as. It's advised to use this call instead of manually managing {Message#session msg#session} in most cases.
      #
      # Uses the first name registered for the plugin and converts it to a symbol.
      #
      # @param [Message] msg The message is supplied by the system.
      #
      # @return [Hash] Plugin-specific session hash
      def get_ses( msg )
        name_sym = name.to_sym
        unless msg.session.has_key?( name_sym )
          msg.session[ name_sym ] = {}
        end
        return msg.session[ name_sym ]
      end
  
      # Returns the source code of the javascript file +js_name+ in the 'js' subdirectory of the plugin bundle. Use it to send raw javascript command code to the client. Use {#read_js_once} for libraries.
      #
      # @param [String] js_name Javascript source file name without the '.js' suffix.
      #
      # @return [String] The source of the file.
      # @return [false] Returns false, when file was not found.
      def read_js( js_name )
        file_read( bundle_path( js_name, 'js', '.js' ) )
      end
      
      # Like {#read_js}, but reads the file only once per session. Use for inclusion of custom library code.
      #
      # @param [Message] msg The message is supplied by the system.
      # @param [String] js_name Javascript source file name without the '.js' suffix.
      #
      # @return [String] The source of the file on the first call in a session, or an empty string on the subsequent calls.
      # @return [false] Returns false, when file was not found.
      def read_js_once( msg, js_name )
        ses = msg.session
        if not ses.has_key?(:deps)
          ses[:deps] = []
        end
        path = bundle_path( js_name, 'js', '.js' )
        unless ses[:deps].include?( path )
          ses[:deps].push( path )
          return file_read( path )
        else
          return ''
        end
      end
      
      # Extracts +HValue+ references as javascript from the session Hash.
      #
      # @param [Message] msg The message is supplied by the system.
      # @param [Hash] ses Used for supplying a Hash with the {HValue} instances. It's optional and defaults to the current plugin node in the active session.
      # 
      # @return [String] A string representing a javascript object similar to the ruby Hash +ses+.
      # 
      # @example
      #   values_js( msg, get_ses(msg) )
      def values_js( msg, ses=false )
        # backwards-compatible with pre-1.3 behavior
        ses = msg if msg.class == Hash
        # gets the session automatically, if false
        ses = get_ses( msg ) unless ses
        js_references = []
        ses.each_key do |key_name|
          if ses[key_name].class == HValue
            js_references.push( "#{key_name.to_s}:HVM.values['#{ses[key_name].val_id}']" )
          end
        end
        return "{#{js_references.join(',')}}"
      end
      
      
      # Tells the js client framework to load a list of pre-packaged client libraries.
      #
      # It keeps track of what's loaded, so nothing library loaded twice.
      #
      # @param [Message] msg The message is supplied by the system.
      # @param [Array] dependencies A list of package names.
      #
      # @return [nil]
      #
      # @example
      #   include_js( msg, [ 'default_theme', 'controls' ] )
      #
      def include_js( msg, dependencies=[] )
        ses = msg.session
        # check, if the session has a dependency array
        if not ses.has_key?( :deps )
          # make an array of dependencies for this session, if not already done
          ses[:deps] = []
        end
        dependencies = [dependencies] if dependencies.class == String
        # Check the required dependencies until everything is loaded.
        dependencies.each do |dependency|
          unless ses[:deps].include?( dependency )
            ses[:deps].push( dependency )
            msg.reply(%{jsLoader.load("#{dependency}");})
          end
        end
      end
      
      
      # @private  This method looks looks for a file called "values.yaml" in the plugin's bundle directory.
      #           If this file is found, it loads it for initial value definitions.
      #           These definitions are accessible as the +@values+ attribute.
      def init_values
        values_path = bundle_path( 'values.yaml' )
        return yaml_read( values_path )
      end
      
      # @private  Creates a new instance of HValue, assigns it as +value_name+ into the
      #           session and uses the +value_properties+ Hash to define the default
      #           value and value responders.
      #
      # This method is invoked automatically, when handling the properties
      # of the +values.yaml+ configuration file of a new session.
      #
      # It's invoked by +#init_ses+ via +#init_ses_values+.
      #
      # Structure of +value_properties+, all top-level items are optional:
      #
      #   {
      #     # Default value; defaults to 0
      #     :value => 'foo',
      #     
      #     # A plugin method to call to define the default value instead of the one defined in :value
      #     :value_call => {
      #       :plugin => 'plugin_name', # defaults to the plugin where defined
      #       :method => 'method_name', # mandatory; name of the method to call
      #       :args => [ 1, 'foo', 3 ], # optional, list of parameter values for the :method
      #       :uses_msg => true         # defaults to true; when false, doesn't pass the msg as the first parameter
      #     },
      #     
      #     # Restore the default, when the session is restored; defaults to true
      #     :restore_default => false,
      #     
      #     # List of value responder methods to bind.
      #     :responders => [
      #        {
      #          :plugin => 'plugin_name', # defaults to the plugin where defined
      #          :method => 'method_name'  # mandatory, name of the method to call
      #        },
      #        # You can supply as many responders as you like:
      #        { :plugin => 'another_plugin', :method => 'another_method' }
      #     ]
      #   }
      #
      def init_ses_value( msg, value_name, value_properties )
        ses = get_ses( msg )
        if value_properties.has_key?(:value_call)
          default_value = init_value_call( msg, value_properties[:value_call] )
        elsif value_properties.has_key?(:value)
          default_value = value_properties[:value]
        else
          default_value = 0
        end
        ses[value_name] = HValue.new( msg, default_value, { :name => "#{@name}.#{value_name}" } )
        if value_properties.has_key?(:responders)
          value_properties[:responders].each do |responder|
            if responder.has_key?(:plugin)
              responder_plugin = responder[:plugin]
            else
              responder_plugin = @name
            end
            if responder.has_key?(:method)
              ses[value_name].bind( responder_plugin, responder[:method] )
            end
          end
        end
      end
      
      # @private  Initializes session values, if the contents of the +values.yaml+ 
      #           file is defined in the bundle directory and loaded in +#init_values+.
      def init_ses_values( msg )
        return unless @values
        @values.each do | value_name, value_properties |
          init_ses_value( msg, value_name, value_properties )
        end
      end
      
      # @private  Returns a value based on the :method and :plugin members of the
      #           +value_call+ hash.
      #
      # The call is made via msg.run if the method is not defined in
      # the local plugin bundle.
      #
      # This method is called from +#init_ses_value+.
      #
      # Structure of the +value_call+ Hash:
      #   { :plugin => 'plugin_name', # defaults to the plugin where defined
      #     :method => 'method_name', # mandatory; name of the method to call
      #     :args => [ 1, 'foo', 3 ], # optional, list of parameter values for the :method
      #     :uses_msg => true         # defaults to true; when false, doesn't pass the msg as the first parameter
      #   }
      def init_value_call( msg, value_call )
        value_call_method = value_call[:method]
        if value_call.has_key?(:plugin)
          value_call_plugin = value_call[:plugin]
        else
          value_call_plugin = false
        end
        if value_call.has_key?(:args)
          if value_call.has_key?(:uses_msg) and value_call[:uses_msg] != false
            if value_call_plugin
              return msg.run( value_call_plugin, value_call_method, msg, *value_call[:args] )
            else
              return self.method( value_call_method ).call( msg, *value_call[:args] )
            end
          else
            if value_call_plugin
              return msg.run( value_call_plugin, value_call_method, *value_call[:args] )
            else
              return self.method( value_call_method ).call( *value_call[:args] )
            end
          end
        else
          if value_call.has_key?(:uses_msg) and value_call[:uses_msg] != false
            if value_call_plugin
              return msg.run( value_call_plugin, value_call_method, msg )
            else
              return self.method( value_call_method ).call( msg )
            end
          else
            if value_call_plugin
              return msg.run( value_call_plugin, value_call_method )
            else
              return self.method( value_call_method ).call( )
            end
          end
        end
      end
      
      # @private  Restores session values to default, unless specified otherwise.
      #
      # Called from +#restore_ses+
      def restore_ses_values( msg )
        return unless @values
        ses = get_ses( msg )
        @values.each do | value_name, value_properties |
          if ses.has_key?( value_name ) and ses[ value_name ].class == HValue
            unless value_properties[:restore_default] == false
              if value_properties.has_key?(:value_call)
                default_value = init_value_call( msg, value_properties[:value_call] )
              elsif value_properties.has_key?(:value)
                default_value = value_properties[:value]
              else
                default_value = 0
              end
              ses[value_name].set( msg, default_value )
            end
          else
            init_ses_value( msg, value_name, value_properties )
          end
        end
      end
    end
  end
end

