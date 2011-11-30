##   RSence
 #   Copyright 2010 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##

# The RSence module contains the server interfaces of RSence.
# == The classes that matter from a Plugin developer's point of view are:
# - {RSence::Plugins::GUIPlugin__ GUIPlugin}
#   - Use for user interface plugins. Supports {RSence::Plugins::GUIParser GUITree} handling; the user interface starts automatically.
#   - No server programming except defining GUITree YAML structures is required to define a user interface when using this class.
# - {RSence::Plugins::Plugin__ Plugin}
#   - Use for supporting plugins and advanced client-server development.
#   - Great for providing backend functionality and miscellaneous API's for other Plugins.
# - {RSence::Plugins::Servlet__ Servlet}
#   - Use for raw POST / GET handlers to provide external API's, search engine indexes, plain html fallback etc.
# - {RSence::HValue HValue}
#   - Use for syncing data objects between client and server automatically.
#   - Bind any plugin methods as responders / validators; they will be called whenever a client-server change triggers an data change event.
# - {RSence::Message Message (msg)}
#   - Used extensively to pass around session, data and request/response bindings.
#   - The standard convention is usage as the first parameter, named +msg+, of any method that includes handling session-related data.
# 
# Most other classes are inner workings of RSence itself and are subject to change without further notice.
module RSence
  
  # @private  Returns true, if platform fully supports POSIX standard signals.
  def self.pid_support?
    # true for non-windows
    return (not ['i386-mingw32','x86-mingw32'].include?(RUBY_PLATFORM))
  end
  
  # @private  Returns true, if platform is linux
  def self.linux?
    return RUBY_PLATFORM.end_with?('-linux')
  end
  
  # @private  Returns true, if platform is Mac OS X
  def self.darwin?
    return RUBY_PLATFORM.include?('-darwin')
  end
  
  # @private  Returns signal name that resembles INFO or PWR (extra signal to poll for server status)
  def self.info_signal_name
    if self.linux?
      return 'PWR'
    else
      return 'INFO'
    end
  end
  
  # @private  This accessor enables RSence.argv method, which returns the ARGVParser instance
  def self.argv;    @@argv_parser;    end
  
  # @private  This accessor enables RSence.cmd method, which returns the command the process was started with.
  def self.cmd;     @@argv_parser.cmd;     end
  
  # Command line options parsed
  # @return [Hash] Parsed command-line options:
  # *Key* (Symbol):: *Value*
  # +:env_path+:: (String) The directory of the environment.
  # +:conf_files+:: (Array of Strings) Additional configuration files given with the +--conf+ command-line option. Default is +[]+.
  # +:debug+:: (true or false) True, if the +-d+ or +--debug+ command-line option was given. Default is false.
  # +:verbose+:: (true or false) True, if the +-v+ or +--verbose+ command-line option was given. Default is false.
  # +:log_fg+:: (true or false) True, if the +-f+ or +--log-fg+ command-line option was given. Default is false.
  # +:trace_js+:: (true or false) True, if the +--trace-js+ command-line option was given. Default is false.
  # +:trace_delegate+:: (true or false) True, if the +--trace-delegate+ command-line option was given. Default is false.
  # +:port+:: (String or nil) The TCP port number given with the +--port+ command-line option. Default is nil.
  # +:addr+:: (String or nil) The TCP bind address given with the +--addr+ command-line option. Default is nil.
  # +:server+:: (String or nil) The Rack http server handler given with the +--server+ command-line option. Default is nil.
  # +:reset_ses+:: (true or false) True, if the +-r+ or +--reset-sessions+ command-line option was given. Default is false.
  # +:autoupdate+:: (true or false) True, if the +-a+ or +--auto-update+ command-line option was given. Default is false.
  # +:latency+:: (Number) Amount of milliseconds to sleep in each request given with the +--latency+ command-line option. Default is 0.
  # +:say+:: (true or false) True, if the +-S+ or +--say+ command-line option was given. Default is false.
  def self.args;    @@argv_parser.args;    end
  
  # @private  This accessor enables RSence.startable? method, which returns true if a start-type command was given.
  def self.startable?; @@argv_parser.startable?; end
  
  # @return [String] The version of RSence
  def self.version; @@argv_parser.version; end
  
  # @private  This accessor enables RSence.startup method, which starts RSence.
  def self.startup
    puts "Loading configuration..." if self.args[:verbose]
    # Use the default configuration:
    require 'rsence/default_config'
    @@config = Configuration.new(self.args).config
    
    # RSence runtime configuration data
    # @return [Hash] the active configuration structure as defined by the {file:default_conf default configuration} and overridden by local configuration files.
    def self.config
      @@config
    end
    
    def self.transporter
      @@transporter
    end
    def self.transporter=(transporter)
      if class_variable_defined?(:'@@transporter')
        warn "WARN: Transporter already set."
        return
      else
        @@transporter = transporter
      end
    end
    
    def self.plugin_manager
      @@plugin_manager
    end
    def self.plugin_manager=(plugin_manager)
      if class_variable_defined?(:'@@plugin_manager')
        warn "WARN: @@plugin_manager already set."
        return
      else
        @@plugin_manager = plugin_manager
      end
    end
    
    def self.value_manager
      @@value_manager
    end
    def self.value_manager=(value_manager)
      if class_variable_defined?(:'@@value_manager')
        warn "WARN: @@value_manager already set."
        return
      else
        @@value_manager = value_manager
      end
    end
    
    def self.session_manager
      @@session_manager
    end
    def self.session_manager=(session_manager)
      if class_variable_defined?(:'@@session_manager')
        warn "WARN: @@session_manager already set."
        return
      else
        @@session_manager = session_manager
      end
    end
    
    ## Riassence Daemon controls
    require 'rsence/daemon'
    puts "Starting RSence..." if self.args[:verbose]
    daemon = HTTPDaemon.new
    daemon.daemonize!
  end

  
  # Includes the Signal Communication utility.
  # Used to respond via special PID files in the run directory of the environment
  require 'rsence/sigcomm'


  # Requires the ARGVParser that functions as the command-line user interface.
  require 'rsence/argv'
  
end

