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

module Riassence
module Server

class Configuration
  def initialize
    ## Paths for log and pid files
    pidpath = File.join(SERVER_PATH,'var','run')
    logpath = File.join(SERVER_PATH,'var','log')
    
    ## Client by default is "server/client"
    if ARGV.include?('--client-path')
      client_path = ARGV[ARGV.index('--client-path')+1]
    else
      client_path_test1 = File.expand_path( File.join( SERVER_PATH, 'client' ) )
      client_path_test2 = File.expand_path( File.join( SERVER_PATH, '..', 'client' ) )
      if File.exist?(client_path_test1)
        client_path = client_path_test1
      elsif File.exist?(client_path_test2)
        client_path = client_path_test2
      else
        warn "WARNING: client_path: #{client_path.inspect} not found in standard locations (#{client_path_test1.inspect} or #{client_path_test2.inspect})"
      end
    end
    
    yaml_conf_path = File.join( SERVER_PATH, 'conf', 'default_conf.yaml' )
    
    ## Global configuration hash
    $config = YAML.load( File.read( yaml_conf_path ) )
    
    $config[:trace] = true if ARGV.include?('--trace-js')
    $config[:client_root] = client_path unless $config.has_key? :client_root
    $config[:debug_mode] = true if ARGV.include?('-d') or ARGV.include?('--debug')
    $config[:http_server][:latency] = ARGV[ARGV.index('--latency')+1].to_i if ARGV.include?('--latency')
    $config[:http_server][:port] = ARGV[ARGV.index('--port')+1].to_i if ARGV.include?('--port')
    $config[:http_server][:bind_address] = ARGV[ARGV.index('--addr')+1] if ARGV.include?('--addr')
    $config[:http_server][:rack_require] = ARGV[ARGV.index('--server')+1] if ARGV.include?('--server')
    $config[:client_parts] = {
      :js => File.join( client_path, 'js' ),
      :themes => File.join( client_path, 'themes' )
    }
    default_plugins_path = File.join( SERVER_PATH, 'plugins' )
    $config[:plugin_paths].push( default_plugins_path ) unless $config[:plugin_paths].include? default_plugins_path
    $config[:indexhtml_conf] = $config[:index_html]
    $config[:session_conf][:reset_sessions] = true if ARGV.include?('--reset-sessions=true') or ARGV.include?('--reset-sessions')
    $config[:daemon][:pid_fn] = File.join(pidpath, "rsence.pid") unless $config[:daemon].has_key?(:pid_fn)
    $config[:daemon][:log_fn] = File.join(logpath, "rsence") unless $config[:daemon].has_key?(:log_fn)

    ## Paths of server libraries
    lib_paths  = [
      ## already included in launch.rb; override this one in local config, if needed
      #File.join( SERVER_PATH, 'lib' )
    ]
    
    ## Create default local configuratation override file, if it does not exist:
    local_config_file_path = File.join(SERVER_PATH,'conf','local_conf.rb')
    
    local_config_file_path2 = File.join(SERVER_PATH,'conf','local_conf.yaml')
    local_config_file_path3 = File.join( File.split( SERVER_PATH )[0], 'conf', 'local_conf.yaml' )
    
    if File.exists? local_config_file_path2
      config2 = YAML.load( File.read( local_config_file_path2 ) )
      $config.join( config2 )
    end
    if File.exists? local_config_file_path3
      config3 = YAML.load( File.read( local_config_file_path3 ) )
      $config.join( config3 )
    end


    if File.exist?(local_config_file_path)
      require local_config_file_path[0..-4]
    elsif ARGV.include?('--config')
      conf_file = ARGV[ARGV.index('--config')+1]
      if conf_file[0].chr != '/'
        conf_file = File.join( Dir.pwd, conf_file )
      end
      if conf_file[-3..-1] != '.rb'
        warn "WARNING: Only ruby configuration files are supported for now."
        warn "         Future versions might include YAML support."
        warn "      -> #{conf_file} ignored."
      elsif File.exist?( conf_file )
        # strip the '.rb' suffix
        conf_file = conf_file[0..-4]
        require conf_file
      else
        warn "ERROR: Configuration file #{conf_file.inspect} not found."
        exit
      end
    else
      puts "NOTE:  Local configuration file #{local_config_file_path.inspect}"
      puts "       does not exist, creating a default one."
      puts "Please answer the following questions, blank lines equal to the default in brackets:"
      require 'conf/wizard'
      conf_wizard = ConfigWizard.new
      local_config_data = conf_wizard.run( local_config_file_path )
    end

    unless $config[:database].has_key?(:ses_db)
      warn "WARNING: The database is not configured with a :ses_db url."
      warn "         You are advised to convert the :root_setup and :auth_setup keys of"
      warn "         $config[:database] to the new url format."
      db_auth = $config[:database][:auth_setup]
      $config[:database][:ses_db] = "mysql://#{db_auth[:user]}:#{db_auth[:pass]}@#{db_auth[:host]}:#{db_auth[:port]}/#{db_auth[:db]}"
      warn "      -> Performed automatic conversion of :auth_setup as"
      warn "         $config[:database][:ses_db] = #{$config[:database][:ses_db].inspect}"
    end



    ## Broker configuration
    ## WARNING: Don't rely on this as-is yet. The naming conventions might still change.

    ## POST-requests

    # The default listener address of cookie-less transporter requests
    unless $config[:broker_urls].has_key?(:x)
      $config[:broker_urls][:x]     = File.join($config[:base_url],'x')
    end

    # The default listener address of cookie-enabled transporter requests
    unless $config[:broker_urls].has_key?(:hello)
      $config[:broker_urls][:hello] = File.join($config[:base_url],'hello')
    end

    # The default listener address of SOAP -requests
    unless $config[:broker_urls].has_key?(:soap)
      $config[:broker_urls][:soap] = File.join($config[:base_url],'SOAP')
    end

    # The default listener address of file uploads
    unless $config[:broker_urls].has_key?(:u)
      $config[:broker_urls][:u] = File.join($config[:base_url],'U')
    end


    ## GET-requests

    # The default address of built javascript and theme packages
    unless $config[:broker_urls].has_key?(:h)
      $config[:broker_urls][:h] = File.join($config[:base_url],'H/')
    end

    # The default address of the ticketserve :img -category
    unless $config[:broker_urls].has_key?(:i)
      $config[:broker_urls][:i] = File.join($config[:base_url],'i/')
    end

    # The default address of the ticketserve :rsrc -category
    unless $config[:broker_urls].has_key?(:d)
      $config[:broker_urls][:d] = File.join($config[:base_url],'d/')
    end

    # The default address of the ticketserve :file -category
    unless $config[:broker_urls].has_key?(:f)
      $config[:broker_urls][:f] = File.join($config[:base_url],'f/')
    end

    # The default address of the ticketserve :blobobj -category
    unless $config[:broker_urls].has_key?(:b)
      $config[:broker_urls][:b] = File.join($config[:base_url],'b/')
    end

    # The default address of the favicon
    unless $config[:broker_urls].has_key?(:favicon)
      $config[:broker_urls][:favicon] = File.join($config[:base_url],'favicon.ico')
    end

    # The default address of the "empty" iframe of uploader
    unless $config[:broker_urls].has_key?(:uploader_iframe)
      $config[:broker_urls][:uploader_iframe] = File.join($config[:base_url],'U/iframe_html')
    end


    # The default address of the index_html plugin
    unless $config[:indexhtml_conf].has_key?(:respond_address)
      $config[:indexhtml_conf][:respond_address] = File.join($config[:base_url])
    end


    ## Uses the lib paths as search paths
    lib_paths.each do |lib_path|
      $LOAD_PATH << lib_path
    end

    unless File.exist?(client_path)
      $stderr.write("ERROR: client_path: #{client_path.inspect} does not exist!\n")
      $stderr.write("Unable to continue; exit.\n")
      exit
    end

  end
end

end
end

Riassence::Server::Configuration.new

