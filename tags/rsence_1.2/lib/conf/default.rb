#--
##   Riassence Framework
 #   Copyright 2008 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##
 #++

require 'rubygems'
require 'rack'
require 'yaml'

# Legacy:
LIB_PATHS = []
PIDPATH = File.join(SERVER_PATH,'var','run')
LOGPATH = File.join(SERVER_PATH,'var','log')
def load_legacy( local_config_file_path )
  require local_config_file_path[0..-4]
end

module Riassence
module Server


class Configuration
  def array_merge( target, source )
    source.each do |item|
      unless target.include?(item)
        if item.class == Array
          sub_arr = []
          array_merge( sub_arr, item )
          target.push( sub_arr )
        elsif item.class == Hash
          sub_hash = {}
          hash_merge( sub_hash, item )
          target.push( sub_hash )
        else
          target.push( item )
        end
      end
    end
  end
  def hash_merge( target, source )
    source.each do |key,item|
      if not target.has_key?key or target[key] != item
        if item.class == Array
          target[key] = [] unless target.has_key?(key)
          array_merge( target[key], item )
          if key == :plugin_paths
            puts target[key].inspect
          end
        elsif item.class == Hash
          target[key] = {} unless target.has_key?key
          hash_merge( target[key], item )
        else
          target[key] = item
        end
      end
    end
  end
  def initialize
    ## Paths for log and pid files
    pidpath = File.join(SERVER_PATH,'var','run')
    logpath = File.join(SERVER_PATH,'var','log')
    
    yaml_conf_path = File.join( SERVER_PATH, 'conf', 'default_conf.yaml' )
    
    ## Global configuration hash
    $config = YAML.load( File.read( yaml_conf_path ) )
    
    # Legacy:
    $config[:indexhtml_conf] = $config[:index_html]
    
    ## Client by default is "server/client"
    if ARGV.include?('--client-path')
      client_path = ARGV[ARGV.index('--client-path')+1]
    else
      client_path_test1 = File.expand_path( File.join( SERVER_PATH, 'client' ) )
      client_path_test2 = File.expand_path( File.join( File.split( SERVER_PATH )[0], 'client' ) )
      client_path_test3 = File.expand_path( File.join( Dir.pwd, 'client' ) )
      if File.exist?(client_path_test1)
        client_path = client_path_test1
      elsif File.exist?(client_path_test2)
        client_path = client_path_test2
      elsif File.exist?(client_path_test3)
        client_path = client_path_test3
      else
        warn [ "",
               "ERROR: client_path not found in the standard locations:",
               "  - #{[client_path_test1,client_path_test2,client_path_test3].join("\n  - ")}",
               "",
               "  Did you build the client?",
               "",
               "  Unable to continue: exiting.",
               ""
       ].join("\n")
       exit
      end
    end
    $config[:client_parts] = {
      :js => File.join( client_path, 'js' ),
      :themes => File.join( client_path, 'themes' )
    }
    
    default_plugins_path = File.join( SERVER_PATH, 'plugins' )
    $config[:plugin_paths].push( default_plugins_path ) unless $config[:plugin_paths].include? default_plugins_path

    ## Paths of server libraries
    lib_paths  = [
      ## already included in launch.rb; override this one in local config, if needed
      #File.join( SERVER_PATH, 'lib' )
    ]
    
    ## Create default local configuratation override file, if it does not exist:
    local_config_file_paths = [
      File.join(SERVER_PATH,'conf','local_conf.yaml'),
      File.join( File.split( SERVER_PATH )[0], 'conf', 'local_conf.yaml' ),
      File.join( Dir.pwd, 'conf', 'local_conf.yaml' ),
      File.join(SERVER_PATH,'conf','local_conf.rb'),
      File.join( File.split( SERVER_PATH )[0], 'conf', 'local_conf.rb' ),
      File.join( Dir.pwd, 'conf', 'local_conf.rb' )
    ]
    if ARGV.include?('--config')
      argv_conf_file = ARGV[ARGV.index('--config')+1]
      if not argv_conf_file.begin_with? '/'
        argv_conf_file = File.join( Dir.pwd, conf_file )
      end
      local_config_file_paths.push( argv_conf_file )
    end
    
    local_config_file_path_found = false
    local_config_file_paths.each do |local_config_file_path|
      if File.exists? local_config_file_path and File.file? local_config_file_path
        if local_config_file_path.end_with? '.yaml'
          local_conf = YAML.load( File.read( local_config_file_path ) )
          hash_merge( $config, local_conf )
          local_config_file_path_found = true
        elsif local_config_file_path.end_with? '.rb'
          # Legacy work-arounds
          prev_pidpath = PIDPATH
          prev_logpath = LOGPATH
          # /Legacy work-arounds
          load_legacy( local_config_file_path )
          # Legacy work-arounds
          pidpath = PIDPATH if PIDPATH != prev_pidpath
          logpath = LOGPATH if LOGPATH != prev_logpath
          # /Legacy work-arounds
          local_config_file_path_found = true
        else
          warn "Only Yaml and Ruby configuration files are allowed at this time."
        end
      end
    end

    if not local_config_file_path_found or ARGV.include? '--run-wizard'
      puts "NOTE:  No local configuration file found, running the, configuration wizard." unless ARGV.include? '--run-wizard'
      puts "Please answer the following questions, blank lines equal to the default in brackets:"
      require 'conf/wizard'
      if File.directory?( File.join( Dir.pwd, 'conf' ) )
        wizard_conf_file = File.join( Dir.pwd, 'conf', 'local_conf.yaml' )
      else
        wizard_conf_file = File.join( SERVER_PATH, 'conf', 'local_conf.yaml' )
      end
      wizard_config_data = ConfigWizard.new($config).run( wizard_conf_file )
      $config.merge!( wizard_config_data )
    end
    
    if not $config[:database].has_key?( :ses_db ) and $config[:database].has_key?( :auth_setup )
      warn "WARNING: The database is not configured with a :ses_db url."
      warn "         You are advised to convert the :root_setup and :auth_setup keys of"
      warn "         $config[:database] to the new url format."
      db_auth = $config[:database][:auth_setup]
      $config[:database][:ses_db] = "mysql://#{db_auth[:user]}:#{db_auth[:pass]}@#{db_auth[:host]}:#{db_auth[:port]}/#{db_auth[:db]}"
      warn "      -> Performed automatic conversion of :auth_setup as"
      warn "         $config[:database][:ses_db] = #{$config[:database][:ses_db].inspect}"
    end
    
    
    $config[:trace] = true if ARGV.include?('--trace-js')
    $config[:client_root] = client_path unless $config.has_key? :client_root
    $config[:debug_mode] = true if ARGV.include?('-d') or ARGV.include?('--debug')
    $config[:http_server][:latency] = ARGV[ARGV.index('--latency')+1].to_i if ARGV.include?('--latency')
    $config[:http_server][:port] = ARGV[ARGV.index('--port')+1].to_i if ARGV.include?('--port')
    $config[:http_server][:bind_address] = ARGV[ARGV.index('--addr')+1] if ARGV.include?('--addr')
    $config[:http_server][:rack_require] = ARGV[ARGV.index('--server')+1] if ARGV.include?('--server')
    $config[:session_conf][:reset_sessions] = true if ARGV.include?('--reset-sessions=true') or ARGV.include?('--reset-sessions')
    $config[:daemon][:pid_fn] = File.join(pidpath, "rsence.pid") unless $config[:daemon].has_key?(:pid_fn)
    $config[:daemon][:log_fn] = File.join(logpath, "rsence") unless $config[:daemon].has_key?(:log_fn)
    
    
    ## Broker configuration
    [   ## POST-requests
        # broker_key      # default_uri
        # The default responder for transporter requests.
      [ :x,               File.join($config[:base_url],'x') ],
        # The default responder for cookie-enabled "handshake" transporter requests
      [ :hello,           File.join($config[:base_url],'hello') ],
        # The default responder for SOAP -requests
      [ :soap,            File.join($config[:base_url],'SOAP') ],
        # The default responder for file uploads
      [ :u,               File.join($config[:base_url],'U') ],
      
        ## GET-requests
        # broker_key      # default_uri
        # The default address of built javascript and theme packages
      [ :h,               File.join($config[:base_url],'H/') ],
        # The default address of the ticketserve :img -category
      [ :i,               File.join($config[:base_url],'i/') ],
        # The default address of the ticketserve :rsrc -category
      [ :d,               File.join($config[:base_url],'d/') ],
        # The default address of the ticketserve :file -category
      [ :f,               File.join($config[:base_url],'f/') ],
        # The default address of the ticketserve :blobobj -category
      [ :b,               File.join($config[:base_url],'b/') ],
      # The default address of the favicon
      [ :favicon,         '/favicon.ico' ],
      # The default address of the "empty" iframe of uploader
      [ :uploader_iframe, File.join($config[:base_url],'U/iframe_html') ],
    ].each do |broker_key, default_uri|
      unless $config[:broker_urls].has_key?( broker_key )
        $config[:broker_urls][broker_key] = default_uri
      end
    end
    
    # The default address of the index_html plugin
    unless $config[:indexhtml_conf].has_key?(:respond_address)
      $config[:indexhtml_conf][:respond_address] = File.join($config[:base_url])
    end
    
    ## Uses the lib paths as search paths
    lib_paths.each do |lib_path|
      $LOAD_PATH << lib_path
    end
    
    ## Legacy:
    LIB_PATHS.each do |lib_path|
      $LOAD_PATH << lib_path
    end
    
    unless File.exist?(client_path)
      $stderr.write("ERROR: client_path: #{client_path.inspect} does not exist!\n")
      $stderr.write("Unable to continue; exit.\n")
      exit
    end
    
    @config = $config
  end
  attr_reader :config
end
@@config = Configuration.new.config
def self.config
  @@config
end

end
end


