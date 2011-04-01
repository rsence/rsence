##   RSence
 #   Copyright 2008 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##


require 'rubygems'
require 'rack'
require 'yaml'



module RSence
  
  
  # Configuration handles config files and such.
  class Configuration
  
    # Combines the Arrays `target` and `source` recursively.
    # @param [Array] target Gets merged with `source`
    # @param [Array] source Has its items pushed to `target` unless an identical item already exists in `target`. If an item class is a Hash, then uses {#hash_merge} to combine them.
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
  
    # Combines the Hashes `target` and `source` recursively.
    # @param [Hash] target Gets merged with `source`
    # @param [Hash] source Has its items merged to `target` unless a key with an identical value already exists in `target`. If an item class is Array, then uses {#array_merge} to combine them.
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
  
    # @param args A parsed structure of the command-line arguments.
    # @param dont_expand_path Is reserved for special cases, when Configuration is used without running RSence.
    def initialize( args, dont_expand_path=false )
    
      ## Paths for log and pid files
      pidpath = File.join( args[:env_path], 'run' )
      logpath = File.join( args[:env_path], 'log' )
    
      # The default configuration path, this one is distributed with the system.
      yaml_conf_path = File.join( SERVER_PATH, 'conf', 'default_conf.yaml' )
    
      # Parses the default configuration from yaml first.
      # This is used as the basis for overriding the defaults in various other config files.
      config = YAML.load( File.read( yaml_conf_path ) )
    
      # The default strings for various messages, this one is distributed with the system.
      yaml_strings_path = File.join( SERVER_PATH, 'conf', 'default_strings.yaml' )
      strings = YAML.load( File.read( yaml_strings_path ) )
    
      # Transporter-specific strings are set.
      config[:transporter_conf][:messages] = strings[:messages][:transporter]
    
      # Makes the distribution 'js' directory containing the client core the
      # first client package source directory.
      config[:client_pkg][:src_dirs].unshift( File.join( SERVER_PATH, 'js' ) )
    
      # The distributed standard plugins are in this directory.
      default_plugins_path = File.join( SERVER_PATH, 'plugins' )
      unless config[:plugin_paths].include? default_plugins_path
        config[:plugin_paths].push( default_plugins_path )
      end
    
      # Paths to add to $LOAD_PATH after all configuration files are read.
      lib_paths  = []
    
      # List of configuration files to look for.
      local_config_file_paths = [
        File.join(SERVER_PATH,'conf','local_conf.yaml'),
        '/etc/rsence/config.yaml',
        File.expand_path('~/.rsence/config.yaml'),
        File.join( File.split( SERVER_PATH )[0], 'conf', 'local_conf.yaml' )
      ]
    
      # Add the additional config files optionally specified in ARGVParser
      args[:conf_files].each do |conf_file|
        local_config_file_paths.push( conf_file )
      end
    
      # Loads the configuration files
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
          else
            warn "Only Yaml configuration files are supported."
          end
        end
      end
    
      # Adds the plugins directory of the environment
      # to the configuration automatically
      env_plugins_path = File.expand_path( 'plugins', args[:env_path] )
      unless config[:plugin_paths].include? env_plugins_path
        config[:plugin_paths].push( env_plugins_path )
      end
    
      # At this point, configuration files are read and ready.
    
      puts "plugin paths: #{config[:plugin_paths].inspect}" if args[:debug]
    
      # Override configuration options with command-line-options.
      config[:trace] = true if args[:trace_js]
      config[:debug_mode] = true if args[:debug]
      config[:http_server][:latency] = args[:latency]
      config[:http_server][:port] = args[:port] if args[:port]
      config[:http_server][:bind_address] = args[:addr] if args[:addr]
      config[:http_server][:rack_require] = args[:server] if args[:server]
      config[:session_conf][:reset_sessions] = true if args[:reset_ses]
      config[:daemon][:http_delayed_start] = args[:http_delayed_start] if args[:http_delayed_start] != nil
    
      config[:client_pkg][:no_obfuscation] = true if args[:client_pkg_no_obfuscation]
      config[:client_pkg][:no_whitespace_removal] = true if args[:client_pkg_no_whitespace_removal]
    
      # Sets the default pid and log paths used by the HTTPDaemon
      config[:daemon][:pid_fn] = File.join(pidpath, "rsence.pid") unless config[:daemon].has_key?(:pid_fn)
      config[:daemon][:log_fn] = File.join(logpath, "rsence") unless config[:daemon].has_key?(:log_fn)
    
      # Check database path for sqlite databases.
      if config[:database][:ses_db].start_with?('sqlite://') and not dont_expand_path
        db_url = File.expand_path( config[:database][:ses_db].split('sqlite://')[1], args[:env_path] )
        config[:database][:ses_db] = "sqlite://#{db_url}"
      end
    
      # Sets the various standard url prefixes:
      [   ## POST-requests
          # broker_key      # default_uri
          # The default responder for transporter requests.
        [ :x,               File.join(config[:base_url],'x') ],
          # The default responder for cookie-enabled "handshake" transporter requests
        [ :hello,           File.join(config[:base_url],'hello') ],
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
    
      if RUBY_VERSION.to_f >= 1.9
        # The encodings mess up compression when using ruby1.9
        warn "Disabling gzip support for ruby 1.9" if args[:debug]
        config[:no_gzip] = true
      end
    
      # The default address of the index_html plugin
      unless config[:index_html].has_key?(:respond_address)
        config[:index_html][:respond_address] = File.join(config[:base_url])
      end
    
      ## Uses the lib paths as search paths
      lib_paths += config[:lib_paths] if config.has_key?(:lib_paths)
      lib_paths.each do |lib_path|
        lib_path = File.expand_path( lib_path, args[:env_path] ) if lib_path.start_with? './'
        $LOAD_PATH << lib_path
      end
      @config = config
    end
  
    attr_reader :config
  
  end
end

