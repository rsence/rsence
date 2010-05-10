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

if RUBY_VERSION.to_f >= 1.9
  Encoding.default_external = Encoding::ASCII_8BIT
end

# Legacy:
LIB_PATHS = []
PIDPATH = File.join(SERVER_PATH,'var','run')
LOGPATH = File.join(SERVER_PATH,'var','log')
def load_legacy( local_config_file_path )
  require local_config_file_path[0..-4]
end

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
        elsif item.class == Hash
          target[key] = {} unless target.has_key?key
          hash_merge( target[key], item )
        else
          target[key] = item
        end
      end
    end
  end
  def wizard
    puts "Please answer the following questions, blank lines equal to the default in brackets:"
    require 'conf/wizard'
    if File.directory?( File.join( Dir.pwd, 'conf' ) )
      wizard_conf_file = File.join( Dir.pwd, 'conf', 'local_conf.yaml' )
    else
      wizard_conf_file = File.join( SERVER_PATH, 'conf', 'local_conf.yaml' )
    end
    wizard_config_data = ConfigWizard.new(config).run( wizard_conf_file )
    config.merge!( wizard_config_data )
  end
  def initialize( args, dont_expand_path=false )
    ## Paths for log and pid files
    pidpath = File.join( args[:env_path], 'run' )
    logpath = File.join( args[:env_path], 'log' )
    
    yaml_conf_path = File.join( SERVER_PATH, 'conf', 'default_conf.yaml' )
    
    yaml_strings_path = File.join( SERVER_PATH, 'conf', 'default_strings.yaml' )
    strings = YAML.load( File.read( yaml_strings_path ) )
    
    ## Global configuration hash
    config = YAML.load( File.read( yaml_conf_path ) )
    config[:transporter_conf][:messages] = strings[:messages][:transporter]
    
    config[:client_pkg][:src_dirs].unshift( File.join( SERVER_PATH, 'js' ) )
    
    default_plugins_path = File.join( SERVER_PATH, 'plugins' )
    unless config[:plugin_paths].include? default_plugins_path
      config[:plugin_paths].push( default_plugins_path )
    end
    
    ## Paths of server libraries
    lib_paths  = [
      ## already included in launch.rb; override this one in local config, if needed
      #File.join( SERVER_PATH, 'lib' )
    ]
    
    ## Create default local configuratation override file, if it does not exist:
    local_config_file_paths = [
      File.join(SERVER_PATH,'conf','local_conf.yaml'),
      '/etc/rsence/config.yaml',
      File.expand_path('~/.rsence/config.yaml'),
      File.join( File.split( SERVER_PATH )[0], 'conf', 'local_conf.yaml' ),
      # File.join( Dir.pwd, 'conf', 'local_conf.yaml' ),
      File.join(SERVER_PATH,'conf','local_conf.rb'),
      # File.join( File.split( SERVER_PATH )[0], 'conf', 'local_conf.rb' ),
      # File.join( Dir.pwd, 'conf', 'local_conf.rb' )
    ]
    
    args[:conf_files].each do |conf_file|
      local_config_file_paths.push( conf_file )
    end
    
    local_config_file_paths.each do |local_config_file_path|
      if File.exists? local_config_file_path and File.file? local_config_file_path
        if local_config_file_path.end_with? '.yaml'
          puts "loading config file: #{local_config_file_path}" if args[:verbose]
          local_conf = YAML.load( File.read( local_config_file_path ) )
          unless local_conf.class == Hash
            warn "invalid configuration file: #{local_config_file_path.inspect}"
            next
          end
          hash_merge( config, local_conf )
        elsif local_config_file_path.end_with? '.rb'
          warn "WARNING: '.rb' configuration files are deprecated!"
          # Legacy work-arounds
          prev_pidpath = PIDPATH
          prev_logpath = LOGPATH
          # /Legacy work-arounds
          load_legacy( local_config_file_path )
          # Legacy work-arounds
          pidpath = PIDPATH if PIDPATH != prev_pidpath
          logpath = LOGPATH if LOGPATH != prev_logpath
          # /Legacy work-arounds
        else
          warn "Only Yaml and Ruby configuration files are allowed at this time."
        end
      end
    end
    
    env_plugins_path = File.join( args[:env_path], 'plugins' )
    unless config[:plugin_paths].include? env_plugins_path
      config[:plugin_paths].push( env_plugins_path )
    end
    
    config[:trace] = true if args[:trace_js]
    config[:debug_mode] = true if args[:debug]
    config[:http_server][:latency] = args[:latency]
    config[:http_server][:port] = args[:port] if args[:port]
    config[:http_server][:bind_address] = args[:addr] if args[:addr]
    config[:http_server][:rack_require] = args[:server] if args[:server]
    config[:session_conf][:reset_sessions] = true if args[:reset_ses]
    
    config[:daemon][:pid_fn] = File.join(pidpath, "rsence.pid") unless config[:daemon].has_key?(:pid_fn)
    config[:daemon][:log_fn] = File.join(logpath, "rsence") unless config[:daemon].has_key?(:log_fn)
    
    if config[:database][:ses_db].start_with?('sqlite://') and not dont_expand_path
      db_url = File.expand_path( config[:database][:ses_db].split('sqlite://')[1], args[:env_path] )
      config[:database][:ses_db] = "sqlite://#{db_url}"
    end
    
    ## Broker configuration
    [   ## POST-requests
        # broker_key      # default_uri
        # The default responder for transporter requests.
      [ :x,               File.join(config[:base_url],'x') ],
        # The default responder for cookie-enabled "handshake" transporter requests
      [ :hello,           File.join(config[:base_url],'hello') ],
        # The default responder for SOAP -requests
      [ :soap,            File.join(config[:base_url],'SOAP') ],
        # The default responder for file uploads
      [ :u,               File.join(config[:base_url],'U') ],
      
        ## GET-requests
        # broker_key      # default_uri
        # The default address of built javascript and theme packages
      [ :h,               File.join(config[:base_url],'H/') ],
        # The default address of the ticketserve :img -category
      [ :i,               File.join(config[:base_url],'i/') ],
        # The default address of the ticketserve :rsrc -category
      [ :d,               File.join(config[:base_url],'d/') ],
        # The default address of the ticketserve :file -category
      [ :f,               File.join(config[:base_url],'f/') ],
        # The default address of the ticketserve :blobobj -category
      [ :b,               File.join(config[:base_url],'b/') ],
      # The default address of the favicon
      [ :favicon,         '/favicon.ico' ],
      # The default address of the "empty" iframe of uploader
      [ :uploader_iframe, File.join(config[:base_url],'U/iframe_html') ],
    ].each do |broker_key, default_uri|
      unless config[:broker_urls].has_key?( broker_key )
        config[:broker_urls][broker_key] = default_uri
      end
    end
    
    # The default address of the index_html plugin
    unless config[:index_html].has_key?(:respond_address)
      config[:index_html][:respond_address] = File.join(config[:base_url])
    end
    
    ## Uses the lib paths as search paths
    lib_paths.each do |lib_path|
      $LOAD_PATH << lib_path
    end
    
    ## Legacy:
    LIB_PATHS.each do |lib_path|
      $LOAD_PATH << lib_path
    end
    
    @config = config
  end
  attr_reader :config
end


