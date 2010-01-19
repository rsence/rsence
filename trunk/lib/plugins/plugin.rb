##   Riassence Framework
 #   Copyright 2006 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##

module Riassence
module Server

## = Abstract
## The Plugin class is the base class for extending server logic.
## A single Plugin instance serves the requests of all sessions,
## which makes them very cpu and memory efficient compared to systems,
## where the server classes are constructed and destructed for each
## request.
##
## Plugins are designed to be contained in a plugin directory bundle and
## to be loaded by the +PluginManager+, which is also responsible for
## delegating the events and other calls throughout the system.
##
## == Anatomy of a plugin bundle
## The plugin bundle contains all data needed to run the plugin. Design
## your plugin without any hard-coded paths, remember that it's intended
## to be deployed by "dropping" the whole plugin into one of the server's
## plugins directories.
##
## The +PluginManager+ looks for such bundles and evaluates them into an
## anonymous +Module+ namespace. The content of the ruby source file
## is then responsible for including its libraries, constructing an
## instance of itself and registering itself as a part of the system.
##
## It's advised to use the +GUIPlugin+ class for plugins that handle
## user interfaces. Usage of the +Plugin+ bundle is advised to use
## for plugins that provide extra functionality, value responders
## and other utilities that supplement the user interface.
##
## You must call the +#register+ method after the class is constructed.
## Otherwise, the class is not connected to the system and just discarded
## and then garbage collected.
##
## == Messages
## As a side effect of having single instances of plugins serve the requests
## of all sessions, the request/response/session messaging is implemented
## as messaging objects. These objects contain or delegate all the necessary
## hooks required by the complete request/response cycle.
##
## The naming convention of the +Message+ instance is +msg+ and it's
## given as the first parameter of methods needing it.
##
## Use +msg.ses_id+ to identify the session's serial number and +msg.user_id+
## to identify the user's identity.
##
## Use the +msg.session+ +Hash+ to store any persistent data
## associated with the user's session, preferably using the name of the
## plugin or its registered name as the primary key entry in the Hash.
## The session data is persistent; it's stored in the session database
## by +SessionStorage+ automatically.
##
## The +msg+ instance also provides access to the +Request+ and +Response+
## objects as +msg.request+ and +msg.response+, respectively.
##
## Use the +msg.run+ method to call other plugins.
##
## To append js source code to be evaluated in the client, use the +msg.reply+
## call. The +msg.console+ call appends messages to the browser's js console.
##
##
## == Session -related event methods
## The +#get_ses+ method returns (or creates and returns) the entry in
## the session based on the name your plugin is registered as. It's advised
## to use this call instead of manually managing +msg.session+ in most cases.
##
## The +#idle+ method is called each time a client performs a data
## synchronization or "idle poll" request.
##
## The +#init_ses+ method is called once in the same request a new session
## is created. A new session is created, when a user enters accesses the
## server the first time, or the first time after the previous session is 
## expired.
##
## The +#init_ui+ method is called by the "main" plugin after the client has
## booted successfully. The +GUIPlugin+ class extends this method to
## automatically load and initialize the user interface from a data structure.
##
## The +#restore_ses+ method is called once in the same request an old
## session is restored. A session is restored, when the user returns to
## the page or reloads the page before the session is expired.
##
## === When the server is configured to restore previous sessions (default):
## If the user accesses the same page using the same browser (in different
## tabs or windows), only the most recently restored one is valid, while 
## the previous ones are immediately invalidated.
## If your application is intended to support several sessions per browser,
## enable session cloning in the configuration file.
##
## === When the server is configured to restore and clone previous sessions:
## When sessions are cloned, the previous session is not invalidated and
## exists until timing out as a result of the web browser window being closed
## or client computer losing network connectivity for a certain (configurable)
## time frame.
##
## The +#cloned_target+ method is like +#restore_ses+, but called when 
## the session is a clone of a previous session.
##
## The +#cloned_source+ method is called on the next request of the previous
## session after it has been cloned.
##
## == Server event methods
## Extend the +#init+ method to invoke constructor functionality that
## depends on the plugin to be constructed and registered as a part of
## the system.
##
## Extend the +#open+, +#flush+ and +#close+ methods to open, flush and close
## streams or other similar functionality.
##
## == Data handling
## The data exchange system exists to support bi-directional
## data synchronization between the browser and the plugin. The values
## are stored in the session as +HValue+ instances.
##
## Values support Hashes, Arrays, Strings, Numbers, Booleans and
## combinations of them. The data is automatically converted between
## ruby objects (server) and json objects (client).
##
## Each instance may be bound to plugin methods that are used as
## value change notification responders.
##
## When a method is bound to the value, the method is called as an
## event notification whenever the client has changed the value and
## synchronizes it to the server. The responders act as validators
## by default.
##
## Values are also bound in the client to classes implementing the
## HValueResponder interface, like any derivate of HControl. See the
## client documentation for instructions about using them.
##
## To define a value responder method, it needs to respond to exactly
## two parameters: the +Message+ instance +msg+ and the HValue object
## (in that order). The method's return value must be either +true+
## or +false+. When the method returns +false+, the change is discarded
## and the previously server-set value is sent back to the client.
##
## A minimal value responder method is defined like this:
##
##    def my_value_responder( msg, my_value )
##      return true
##    end
##
## To access the content of the value, use the +HValue#data+ attribute.
##
##    def int_between_100_and_200( msg, value )
##      data = value.data.to_i
##      return ( data >= 100 and data <= 200 )
##    end
##
## To change the content of the value, use the +HValue#set+ method.
##
##    def int_between_100_and_200( msg, value )
##      data = value.data.to_i
##      value.set( msg, 100 ) if data < 100
##      value.set( msg, 200 ) if data > 200
##      return true
##    end
##
## == Defining values
## The simplest and recommended way of defining the values is to define
## the value configuration file +values.yaml+. Its configuration is then
## applied to sessions automatically.
##
## 
## === Syntax reference of the contents of a +values.yaml+ file:
##
##    # The name of the value (:value_name).
##    # A hash key in the yaml syntax
##    :value_name:
##      
##      # All of these keys are optional!
##      
##      # Default value, a string "Foo" here.
##      # Defaults to 0
##      :value: Foo
##      
##      # A plugin method to call to define the default value
##      # instead of the one defined in :value
##      :value_call:
##        :plugin: plugin_name # defaults to the plugin where defined
##        
##        # Mandatory; name of the method to call
##        :method: method_name
##        
##        # Optional, list of parameter values for the :method
##        :args:
##          # three parameters: 1, 'foo', 3
##          - 1
##          - foo
##          - 3
##        
##        # When false, doesn't pass the msg as the first parameter.
##        # Defaults to true
##        :uses_msg: true
##      
##      # Restore the default, when the session is restored; defaults to false
##      :restore_default: false
##      
##      # List of value responder methods to bind.
##      :responders:
##        - 
##          # name of plugin to call, defaults to the plugin where defined:
##          :plugin: plugin_name
##          
##          # mandatory, name of the method to call
##          :method: method_name
##        
##        # Another responder, this one using the same plugin where defined:
##        - :method: another_method
##    
##    # Another value, this one just defining the defaults
##    # by supplying an empty Hash:
##    # (value: 0, default restored, no responders or calls)
##    :value_with_defaults: {}
##    
##    # This value defines a Number (123) and doesn't restore
##    # the default, when restoring the session.
##    :one_two_three:
##      :value: 123
##      :restore_default: false
##    
##    # This value gets a random string and specifies a responder,
##    # that ensures it's unique, if changed in the client.
##    :random_unique_string:
##      :value_call:
##        :method:   get_unique_random_string
##        :uses_msg: false
##      :responders:
##        - :method: ensure_unique_random_string
##
## = Examples
## More examples are available in the repository;
## http://svn.rsence.org/contrib/plugins
## ..as well as the standard "main" plugin in the "plugins" directory.
## 
## 
## == A minimal Plugin bundle
## The minimal active plugin bundle (named "name_of_plugin")
## is defined like this:
##
##    [dir] name_of_plugin
##      |
##      +---[file] name_of_plugin.rb
##
## This sample Plugin doesn't do anything except construct itself and
## respond as 'name_of_plugin'.
##
##    Plugin.new.register('name_of_plugin')
##
## However, this is not very useful in itself, so you'll need to extend
## its functionality to do anything useful.
##
## == A simple Plugin extension
## This plugin logs session events to the logs/session_log file.
##
##    [dir] ses_logger
##      |
##      +---[file] ses_logger.rb
##      |
##      +---[dir] logs
##            |
##            +---[file] session_log
##
## == Contents of "ses_logger.rb"
##
##    class SessionLogger < Plugin
##      def init
##        super
##        @logfile = false
##      end
##      def open
##        log_path = compose_plugin_path( 'session_log', 'logs' )
##        @logfile = File.open( log_path, 'a' )
##      end
##      def close
##        @logfile.close if @logfile
##        @logfile = false
##      end
##      def flush
##        @logfile.flush if @logfile
##      end
##      def init_ses( msg )
##        super
##        @logfile.write( "#{Time.new} -- Session id #{msg.ses_id} was created.\n" )
##      end
##      def restore_ses( msg )
##        super
##        @logfile.write( "#{Time.new} -- Session id #{msg.ses_id} was restored.\n" )
##      end
##      def idle( msg )
##        @logfile.write( "#{Time.new} -- Client of session id #{msg.ses_id} connected.\n" )
##      end
##    end
##    SessionLogger.new.register( 'ses_logger' )
##
class Plugin
  
  # The +path+ is the absolute path to the directory where the plugin resides.
  attr_writer :path
  
  # The +names+ is a list of (usually just one) names the plugin is registered under.
  attr_reader :names
  
  # The constructor should not take any parameters. In most cases, it's better
  # to extend the +#init+ method, because it's called after the plugin is set up.
  def initialize
    @inited = false
    @names  = []
    @values = false
  end
  
  # Extend this method to do any initial tasks before other methods are called.
  # By default init_values is called to load the +values.yaml+ configuration file.
  def init
    init_values
  end
  
  # Extend this method to do any tasks every time the client makes a request.
  def idle( msg )
  end
  
  # Extend this method to open objects like streams and database connections.
  # It is called when everything is constructed after all plugins are loaded.
  def open
  end
  
  # Extend to save your plugin state or store any data that needs to be
  # persistent. It's always called before close, but doesn't necessarily mean
  # a close call is imminent.
  def flush
  end
  
  # Extend this method to close objects like streams and database connections.
  # It's called when plugins are about to be destructed, so don't expect any
  # calls after it has been called. When this method is called, it's the last
  # chance to save persistent data before being destructed, so implement
  # the +#flush+ method for primarily storing data.
  def close
  end
  
  # Extend this method to invoke actions, when a new session is created.
  # By default +#init_ses_values+ is called to initialize values defined in the 
  # +values.yaml+ configuration file.
  def init_ses( msg )
    init_ses_values( msg )
  end
  
  # Extend this method to invoke actions, when a previous session is restored.
  # By default +#restore_ses_values+ is called to perform actions on values as
  # defined in the +values.yaml+ configuration file.
  def restore_ses( msg )
    restore_ses_values( msg )
  end
  
  # Extend this method to invoke actions, when the session
  # is a clone of another session. It's called once, just
  # before +#restore_ses+ is called.
  #
  # A session is cloned, when a user opens a another browser
  # window or tab, while the previous session is still active.
  #
  # The +source_ses+ is the actual previous session object, which
  # was used as the source of the clone.
  def cloned_target( msg, source_session )
  end
  
  # Extend this method to invoke actions, when the session
  # has been cloned to another session. It's called once, just
  # before +#restore_ses+ is called on the first request after
  # the cloning happened.
  #
  # A session is cloned, when a user opens a another browser
  # window or tab, while the previous session is still active.
  #
  # The +target_ses+ is the actual cloned session object, which
  # is a copy of the current session.
  def cloned_source( msg, target_sessions )
  end
  
  # This method must be called to register the plugin instance
  # into the system. Otherwise, it's subject to destruction
  # and garbage collection. Use the +name+ parameter to 
  # give the (unique) name of your plugin.
  def register( name )
    raise "DuplicateAppNameFound: #{name.inspect}" if PluginManager.plugins.has_key?(name)
    PluginManager.plugins[ name ] = self
    @names << name
    @path = File.expand_path( PluginManager.curr_plugin_path )
    init if not @initied
    @inited = true
  end
  
private
  
  # This method looks looks for a file called "values.yaml"
  # in the plugin's bundle directory
  #.
  # If this file is found, it loads it for initial value definitions.
  #
  # These definitions are accessible as the +@values+ attribute.
  def init_values
    values_path = File.join( @path, 'values.yaml' )
    if File.exist?( values_path )
      @values = YAML.load( File.read( values_path ) )
    end
  end
  
  # Returns all the names your plugin respond to.
  def name
    return @names.first
  end
  
  
  # Returns or creates a new session hash for the plugin.
  #
  # Uses the first name registered for the plugin and converts it to a symbol.
  def get_ses( msg )
    name_sym = name.to_sym
    unless msg.session.has_key?( name_sym )
      msg.session[ name_sym ] = {}
    end
    return msg.session[ name_sym ]
  end
  
  # Returns the contents of the file given as +path+.
  #
  # The plugin bundle's path is used as the prefix, unless +path+ starts with '/' or '..'
  #
  # If the file doesn't exist, it returns +false+.
  def file_read( path )
    path = compose_plugin_path( path )
    return false unless File.exist?( path )
    return File.read( path )
  end
  
  # Writes the +data+ into the file +path+.
  #
  # The plugin bundle's path is used as the prefix, unless +path+ starts with '/' or '..'
  #
  # It returns a success code (+false+ for failure and +true+ for success).
  def file_write( path, data )
    path = compose_plugin_path( path )
    begin
      datafile = File.open( path, 'wb' )
      datafile.write( data )
      datafile.close
      return true
    rescue => e
      warn "file_write error for path #{path} #{e}"
      return false
    end
  end
  alias file_save file_write
  
  # Makes a full path using the plugin bundle as the 'local path'.
  # The (optional) +prefix+ is a subdirectory in the bundle,
  # the +suffix+ is the file extension.
  def compose_plugin_path( path, prefix=false, suffix=false )
    if suffix
      path = "#{name}#{suffix}" unless path.end_with?(suffix)
    end
    if prefix
      path = File.join( prefix, path )
    end
    if path[0].chr != '/' and path[0..1] != '..'
      path = File.join( @path, path )
    end
    return path
  end
  
  # Returns the source code of the javascript file +name+ in the 'js'
  # subdirectory of the plugin bundle.
  def read_js( name )
    file_read( compose_plugin_path( name, 'js', '.js' ) )
  end
  
  # Deprecated name of +#read_js+
  alias require_js read_js
  
  # Like +#read_js+, but reads the file only once per session.
  #
  # Returns the contents of the file on the first call,
  # an empty string on the subsequent calls.
  #
  # Returns false otherwise.
  def read_js_once( msg, name )
    ses = msg.session
    if not ses.has_key?(:deps)
      ses[:deps] = []
    end
    path = compose_plugin_path( name, 'js', '.js' )
    unless ses[:deps].include?( path )
      ses[:deps].push( path )
      return file_read( path )
    else
      return ''
    end
  end
  
  # Deprecated name of +#read_js_once+
  alias require_js_once read_js_once
  
  # Creates a new instance of HValue, assigns it as +value_name+ into the
  # session and uses the +value_properties+ Hash to define the default
  # value and value responders.
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
  #     # Restore the default, when the session is restored; defaults to false
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
    ses[value_name] = HValue.new( msg, default_value )
    if value_properties.has_key?(:responders)
      value_properties[:responders].each do |responder|
        if responder.has_key?(:plugin)
          responder_plugin = responder[:plugin]
        else
          responder_plugin = @names.first
        end
        if responder.has_key?(:method)
          ses[value_name].bind( responder_plugin, responder[:method] )
        end
      end
    end
  end
  
  # Initializes session values, if the contents of the +values.yaml+ 
  # file is defined in the bundle directory and loaded in +#init_values+.
  def init_ses_values( msg )
    return unless @values
    @values.each do | value_name, value_properties |
      init_ses_value( msg, value_name, value_properties )
    end
  end
  
  # Returns a value based on the :method and :plugin members of the
  # +value_call+ hash.
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
  
  # Restores session values to default, unless specified otherwise.
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
  
  # Extracts +HValue+ references as javascript from the session Hash.
  # The +ses+ parameter is used for supplying a hash with the +HValue+
  # instances. It's optional and defaults to the current plugin node in
  # the active session.
  # 
  # The return value is a string representing a js object similar to
  # the ruby Hash +ses+.
  # 
  # Sample usage:
  #
  #   values_js( msg, msg.session[:main] )
  #
  def values_js( msg, ses=false )
    # backwards-compatible with pre-1.3 behaviour
    ses = msg if msg.class == Hash
    # gets the session automatically, if false
    ses = get_ses( msg ) unless ses
    js_references = []
    ses.each_key do |key_name|
      if ses[key_name].class == HValue
        js_references.push( "#{key_name.to_s}: HVM.values['#{ses[key_name].val_id}']" )
      end
    end
    return "{#{js_references.join(', ')}}"
  end
  
  # Deprecated name of +#values_js+
  alias extract_hvalues_from_hash values_js
  
  # Tells the js client framework to load a list of dependency packages.
  # It keeps track of what's loaded, so nothing library loaded twice.
  #
  # The +dependencies+ parameter is an Array of dependencies.
  #
  # Sample usage:
  #
  #   include_js( msg, [ 'default_theme', 'controls', 'lists', 'datetime' ] )
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
  
  
end

end
end

