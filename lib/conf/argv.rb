##   RSence
 #   Copyright 2010 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##

# Includes the Signal Communication utility.
# Used to respond via special PID files in the run directory of the environment
require 'daemon/sigcomm'


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
  
  # @private  ARGVParser is the "user interface" as a command-line argument parser.
  #           It parses the command-line arguments and sets up things accordingly.
  class ARGVParser
    
    # The RSence version string, read from the VERSION file in
    # the root directory of RSence.
    @@version = File.read( File.join( SERVER_PATH, 'VERSION' ) ).strip
    
    # Makes various commands available depending on the platform.
    # The status/start/stop/restart/save -commands depend on an operating
    # system that fully implements POSIX standard signals.
    # These are necessary to send signals to the background process.
    if not RSence.pid_support?
      @@cmds = [ :run, :init, :initenv, :version, :help ]
    else
      @@cmds = [ :run, :status, :start, :stop, :restart, :save,
                 :init, :initenv, :version, :help ]
    end
    
    help_avail_cmds = @@cmds.map{|cmd|cmd.to_s}.join("\n       ")
    
    # Load the strings from the strings file.
    strs_path = File.join( SERVER_PATH, 'conf', 
                           'rsence_command_strings.yaml' )
    strs_data = File.read( strs_path )
    require 'erb'
    
    strs_data = ERB.new( strs_data ).result( binding )
    
    require 'yaml'
    @@strs = YAML.load( strs_data )
    
    @@strs[:help][:run] += @@strs[:help][:path]+@@strs[:help][:options]
    @@strs[:help][:start] += @@strs[:help][:path]+@@strs[:help][:options]
    @@strs[:help][:stop] += @@strs[:help][:path]+@@strs[:help][:options]
    @@strs[:help][:restart] += @@strs[:help][:path]+@@strs[:help][:options]
    @@strs[:help][:status] += @@strs[:help][:path]
    @@strs[:help][:save] += @@strs[:help][:path]
    
    
    # Returns true if one of the 'start' -type commands were supplied
    # and the environment seems valid.
    def startable?; @startable; end
    
    # Parses an argument of the 'help' command
    def parse_help_argv
      if @argv.length >= 2
        help_cmd = @argv[1].to_sym
      else
        help_cmd = :help_main
      end
      help( help_cmd )
      exit
    end
    
    # Creates the default and initial @args hash.
    def init_args
      @args = {
        :env_path       => Dir.pwd,
        :conf_files     => [ ], # --conf
        :debug          => false, # -d --debug
        :verbose        => false, # -v --verbose
        :log_fg         => false, # -f --log-fg
        :trace_js       => false, # --trace-js
        :trace_delegate => false, # --trace-delegate
        :port           => nil,   # --port
        :addr           => nil,   # --addr --bind
        :server         => nil,   # --server
        :reset_ses      => false, # -r --reset-sessions
        :autoupdate     => false, # -a --auto-update
        :latency        => 0,     # --latency
        :say            => false, # -S --say
      
        # client_pkg (not supported yet)
        :client_pkg_no_gzip               => false, # --build-no-gzip
        :client_pkg_no_obfuscation        => false, # --build-no-obfuscation
        :client_pkg_no_whitespace_removal => false, # --build-keep-whitespace
        :client_pkg_quiet                 => true,  # --build-verbose
      
      }
    end
    
    # Main argument parser for all 'start' -type commands.
    def parse_startup_argv
      init_args
      expect_option  = false
      option_name = false
      if @argv.length >= 2
        @argv[1..-1].each_with_index do |arg,i|
          if expect_option
            if [:port,:latency].include?(option_name) and arg.to_i.to_s != arg
              puts ERB.new( @@strs[:messages][:invalid_option_expected_number] ).result( binding )
              exit
            elsif option_name == :conf_files
              if not File.exists?( arg ) or not File.file?( arg )
                puts ERB.new( @@strs[:messages][:no_such_configuration_file] ).result( binding )
                exit
              else
                @args[:conf_files].push( arg )
              end
            else
              @args[option_name] = arg
            end
            expect_option = false
          else
            if arg.start_with?('--')
              if arg == '--profile'
                true
              elsif arg == '--debug'
                set_debug
              elsif arg == '--verbose'
                set_verbose
              elsif arg == '--log-fg'
                set_log_fg
              elsif arg == '--trace-js'
                @args[:trace_js]   = true
              elsif arg == '--trace-delegate'
                @args[:trace_delegate] = true
              elsif arg == '--port'
                expect_option = true
                option_name = :port
              elsif arg == '--addr'
                expect_option = true
                option_name = :addr
              elsif arg == '--server'
                expect_option = true
                option_name = :server
              elsif arg == '--conf' or arg == '--config'
                expect_option = true
                option_name = :conf_files
              elsif arg == '--reset-sessions'
                set_reset_ses
              elsif arg == '--auto-update'
                set_autoupdate
              elsif arg == '--latency'
                expect_option = true
                option_name = :latency
              elsif arg == '--say'
                set_say
              else
                invalid_option(arg)
              end
            elsif arg.start_with?('-')
              arg.split('')[1..-1].each do |chr|
                if chr == 'd'
                  set_debug
                elsif chr == 'v'
                  set_verbose
                elsif chr == 'f'
                  set_log_fg
                elsif chr == 'r'
                  set_reset_ses
                elsif chr == 'a'
                  set_autoupdate
                elsif chr == 'S'
                  set_say
                else
                  invalid_option(arg,chr)
                end
              end
            elsif valid_env?(arg)
              @args[:env_path] = File.expand_path(arg)
              @args[:conf_files].push( File.expand_path( File.join( arg, 'conf', 'config.yaml' ) ) )
            else
              invalid_env( arg )
            end
          end
        end
        if expect_option
          puts ERB.new( @@strs[:messages][:no_value_for_option] ).result( binding )
          exit
        end
      end
      if valid_env?(@args[:env_path])
        conf_file = File.expand_path( File.join( @args[:env_path], 'conf', 'config.yaml' ) )
        @args[:conf_files].push( conf_file ) unless @args[:conf_files].include?( conf_file )
      else
        invalid_env
      end
      @startable = true
    end
    
    # Sets various debug-related options on.
    def set_debug
      @args[:debug]      = true
      @args[:verbose]    = true
      @args[:autoupdate] = true
      @args[:client_pkg_no_obfuscation] = true
      @args[:client_pkg_no_whitespace_removal] = true
      @args[:client_pkg_quiet] = false
    end
    
    # Set the verbose argument on
    def set_verbose
      @args[:verbose]    = true
    end
    
    # Set the foreground logging argument on
    def set_log_fg
      @args[:log_fg]     = true
    end
    
    # Sets the session reset argument on
    def set_reset_ses
      @args[:reset_ses]  = true
    end
    
    # Sets the auto-update argument on
    def set_autoupdate
      @args[:autoupdate] = true
    end
    
    # Sets the speech synthesis argument on
    def set_say
      @args[:say] = true
    end
    
    # Tests for a valid environment
    def valid_env?( arg, quiet=false )
      
      # Checks, if the top-level path exists and is a directory
      path = File.expand_path( arg )
      if not File.exists?( path )
        puts ERB.new( @@strs[:messages][:no_such_directory] ).result( binding ) unless quiet
        return false
      elsif not File.directory?( path )
        puts ERB.new( @@strs[:messages][:not_a_directory] ).result( binding ) unless quiet
        return false
      end
      
      # Checks, if the conf path exists and is a directory
      conf_path = File.join( path, 'conf' )
      if not File.exists?( conf_path )
        puts ERB.new( @@strs[:messages][:missing_conf_directory] ).result( binding ) unless quiet
        return false
      elsif not File.directory?( conf_path )
        puts ERB.new( @@strs[:messages][:invalid_conf_directory] ).result( binding ) unless quiet
        return false
      end
      
      # Checks, if the conf/config.yaml file exists and is a directory
      conf_file = File.join( path, 'conf', 'config.yaml' )
      if not File.exists?(conf_file)
        puts ERB.new( @@strs[:messages][:missing_conf_file] ).result( binding ) unless quiet
        return false
      elsif not File.file?( conf_file )
        puts ERB.new( @@strs[:messages][:invalid_conf_file_not_file] ).result( binding ) unless quiet
        return false
      end
      
      # Checks, if the plugins path exists and is a directory
      plugin_path = File.join( path, 'plugins' )
      if not File.exists?( plugin_path )
        warn ERB.new( @@strs[:messages][:warn_no_plugin_directory_in_project] ).result( binding ) if @args[:verbose]
      elsif not File.directory?( plugin_path )
        puts ERB.new( @@strs[:messages][:plugin_directory_not_a_directory] ).result( binding ) unless quiet
        return false
      end
      
      # Checks (and automatically creates if missing) the run, db and log directories
      ['run','log','db'].each do |dir_name|
        dir_path = File.join( path, dir_name )
        unless File.exists?( dir_path )
          warn ERB.new( @@strs[:messages][:warn_no_directory_creating] ).result( binding ) if @args[:verbose]
          Dir.mkdir( dir_path )
        end
      end
      return true
    end
    
    # Error message when an invalid environment is encountered, exits.
    def invalid_env( env_path=false )
      env_path = @args[:env_path] unless env_path
      puts ERB.new( @@strs[:messages][:invalid_environment] ).result( binding )
      exit
    end
    
    # Error message when an invalid option is encountered, exits.
    def invalid_option(arg,chr=false)
      if chr
        puts ERB.new( @@strs[:messages][:invalid_option_chr] ).result( binding )
      else
        puts ERB.new( @@strs[:messages][:invalid_option] ).result( binding )
      end
      exit
    end
    
    # Tests, if the port on addr responds or refuses the connection.
    # Automatically replaces '0.0.0.0' with '127.0.0.1'
    def test_port( port, addr='127.0.0.1' )
      require 'socket'
      begin
        addr = '127.0.0.1' if addr == '0.0.0.0'
        if RUBY_VERSION.to_f >= 1.9
          sock = TCPSocket.open( addr, port )
        else
          begin
            sock = TCPsocket.open( addr, port )
          rescue NameError => e
            warn "TCPsocket not available, trying TCPSocket.."
            sock = TCPSocket.open( addr, port )
          end
        end
        sock.close
        return true
      rescue Errno::ECONNREFUSED
        return false
      rescue => e
        warn e.inspect
        return false
      end
    end
    
    # Main argument parser for the status command, sends the INFO (or PWR on linux) POSIX signal to
    # the process, if running.
    # Checks if the process responds on the port and address it's configured for.
    def parse_status_argv
      init_args
      expect_option  = false
      option_name = false
      if @argv.length >= 2
        @argv[1..-1].each_with_index do |arg,i|
          if expect_option
            if [:port].include?(option_name) and arg.to_i.to_s != arg
              puts ERB.new( @@strs[:messages][:invalid_option_expected_number] ).result( binding )
              exit
            elsif option_name == :conf_files
              if not File.exists?( arg ) or not File.file?( arg )
                puts ERB.new( @@strs[:messages][:no_such_configuration_file] ).result( binding )
                exit
              else
                @args[:conf_files].push( arg )
              end
            else
              @args[option_name] = arg
            end
            expect_option = false
          else
            if arg.start_with?('--')
              if arg == '--debug'
                set_debug
              elsif arg == '--verbose'
                set_verbose
              elsif arg == '--port'
                expect_option = true
                option_name = :port
              elsif arg == '--addr'
                expect_option = true
                option_name = :addr
              elsif arg == '--conf' or arg == '--config'
                expect_option = true
                option_name = :conf_files
              else
                invalid_option(arg)
              end
            elsif arg.start_with?('-')
              arg.split('')[1..-1].each do |chr|
                if chr == 'd'
                  set_debug
                elsif chr == 'v'
                  set_verbose
                else
                  invalid_option(arg,chr)
                end
              end
            elsif valid_env?(arg)
              @args[:env_path] = File.expand_path(arg)
              @args[:conf_files].push( File.expand_path( File.join( arg, 'conf', 'config.yaml' ) ) )
            else
              invalid_env( arg )
            end
          end
        end
        if expect_option
          puts ERB.new( @@strs[:messages][:no_value_for_option] ).result( binding )
          exit
        end
      end
      if valid_env?(@args[:env_path])
        conf_file = File.expand_path( File.join( @args[:env_path], 'conf', 'config.yaml' ) )
        @args[:conf_files].push( conf_file ) unless @args[:conf_files].include?( conf_file )
      else
        invalid_env
      end
      require 'conf/default'
      config = Configuration.new(@args).config
      port = config[:http_server][:port]
      addr = config[:http_server][:bind_address]
      port_status = test_port( port, addr )
      if RSence.pid_support?
        pid_fn = config[:daemon][:pid_fn]
        if File.exists?( pid_fn )
          pid = File.read( pid_fn ).to_i
          sig_name = RSence.info_signal_name
          pid_status = RSence::SIGComm.wait_signal_response(
            pid, pid_fn, sig_name, 3
          )
        else
          warn @@strs[:messages][:no_pid_file] if @args[:verbose]
          pid_status = nil
        end
      else
        warn @@strs[:messages][:no_pid_support] if @args[:verbose]
        pid_status = nil
      end
      if RSence.pid_support?
        if pid_status == nil
          puts @@strs[:messages][:no_pid]
        elsif pid_status == false
          if port_status
            puts ERB.new( @@strs[:messages][:no_process_running_but_something_responds] ).result( binding )
          else
            puts ERB.new( @@strs[:messages][:no_process_running_and_nothing_responds] ).result( binding )
          end
        else
          if port_status
            puts ERB.new( @@strs[:messages][:process_running_and_responds] ).result( binding )
          else
            puts ERB.new( @@strs[:messages][:process_running_but_nothing_responds] ).result( binding )
          end
        end
      end
    end
    
    # Main argument parser for the save command. Sends the USR1 POSIX signal to the process, if running.
    def parse_save_argv
      init_args
      expect_option  = false
      option_name = false
      if @argv.length >= 2
        @argv[1..-1].each_with_index do |arg,i|
          if expect_option
            if option_name == :conf_files
              if not File.exists?( arg ) or not File.file?( arg )
                puts ERB.new( @@strs[:messages][:no_such_configuration_file] ).result( binding )
                exit
              else
                @args[:conf_files].push( arg )
              end
            else
              @args[option_name] = arg
            end
            expect_option = false
          else
            if arg.start_with?('--')
              if arg == '--debug'
                set_debug
              elsif arg == '--verbose'
                set_verbose
              elsif arg == '--conf' or arg == '--config'
                expect_option = true
                option_name = :conf_files
              else
                invalid_option(arg)
              end
            elsif arg.start_with?('-')
              arg.split('')[1..-1].each do |chr|
                if chr == 'd'
                  set_debug
                elsif chr == 'v'
                  set_verbose
                else
                  invalid_option(arg,chr)
                end
              end
            elsif valid_env?(arg)
              @args[:env_path] = File.expand_path(arg)
              @args[:conf_files].push( File.expand_path( File.join( arg, 'conf', 'config.yaml' ) ) )
            else
              invalid_env( arg )
            end
          end
        end
        if expect_option
          puts ERB.new( @@strs[:messages][:no_value_for_option] ).result( binding )
          exit
        end
      end
      if valid_env?(@args[:env_path])
        conf_file = File.expand_path( File.join( @args[:env_path], 'conf', 'config.yaml' ) )
        @args[:conf_files].push( conf_file ) unless @args[:conf_files].include?( conf_file )
      else
        invalid_env
      end
      require 'conf/default'
      config = Configuration.new(@args).config
      if RSence.pid_support?
        pid_fn = config[:daemon][:pid_fn]
        if File.exists?( pid_fn )
          pid = File.read( pid_fn ).to_i
          saving_message = @@strs[:messages][:saving_message]
          pid_status = RSence::SIGComm.wait_signal_response(
            pid, pid_fn, 'USR2', 30, saving_message, '.', 0.1, true
          )
        else
          warn @@strs[:messages][:no_pid_file] if @args[:verbose]
          pid_status = nil
        end
      else
        warn @@strs[:messages][:no_pid_support] if @args[:verbose]
        pid_status = nil
      end
      if RSence.pid_support?
        if pid_status == nil
          puts @@strs[:messages][:no_pid_unable_to_save]
        elsif pid_status == false
          puts @@strs[:messages][:no_process_running]
        else
          puts @@strs[:messages][:session_data_saved]
        end
      end
    end
    
    # asks y/n and returns booleans,
    # the default tells if which one is for just enter
    def yesno(default=false)
      if default
        question = "Y/n? "
      else
        question = "y/N? "
      end
      print question
      answer = $stdin.gets.strip.downcase[0]
      answer = answer.chr if answer
      if answer == 'n'
        return false
      elsif answer == 'y'
        return true
      elsif answer == nil
        return default
      else
        return nil
      end
    end
    
    # The initenv command and its parser. Asks questions about the environment before doing anything else.
    def parse_initenv_argv
      init_args
      expect_option  = false
      option_name    = false
      valid_env      = false
      interactive    = true
      create_blank   = false
      if @argv.length >= 2
        @argv[1..-1].each_with_index do |arg,i|
          if expect_option
            if [:port].include?(option_name) and arg.to_i.to_s != arg
              puts ERB.new( @@strs[:messages][:invalid_option_expected_number] ).result( binding )
              exit
            else
              @args[option_name] = arg
            end
            expect_option = false
          else
            if arg.start_with?('--')
              if arg == '--port'
                expect_option = true
                option_name = :port
              elsif arg == '--addr'
                expect_option = true
                option_name = :addr
              elsif arg == '--server'
                expect_option = true
                option_name = :server
              elsif arg == '--title'
                expect_option = true
                option_name = :title
              elsif arg == '--database'
                expect_option = true
                option_name = :db
              elsif arg == '--uri-prefix'
                expect_option = true
                option_name = :base_url
              elsif arg == '--blank'
                create_blank = true
              elsif arg == '--non-interactive'
                interactive = false
              else
                invalid_option(arg)
              end
            elsif arg.start_with?('-')
              arg.split('')[1..-1].each do |chr|
                if chr == 'q'
                  interactive = false
                end
              end
            else
              @args[:env_path] = File.expand_path(arg)
            end
          end
        end
        if expect_option
          puts ERB.new( @@strs[:messages][:no_value_for_option] ).result( binding )
          exit
        end
      end
      if valid_env?(@args[:env_path],true)
        puts @@strs[:initenv][:env_already_initialized]
        exit
      end
      conf_file = File.expand_path( File.join( @args[:env_path], 'conf', 'config.yaml' ) )
      if File.exists?(@args[:env_path])
        if Dir.entries(@args[:env_path]).length > 2 # [ '.', '..' ]
          puts ERB.new( @@strs[:initenv][:env_not_empty] ).result( binding )
          exit
        end
      end
    
      require 'conf/default'
      default_config = Configuration.new(@args,true).config
    
      config = {
        :base_url => (@args[:base_url] or default_config[:base_url]),
        :http_server => {
          :port   => (@args[:port] or default_config[:http_server][:port]),
          :bind_address => (@args[:addr] or default_config[:http_server][:bind_address]),
          :rack_require => (@args[:server] or default_config[:http_server][:rack_require])
        },
        :index_html => {
          :title  => (@args[:title] or default_config[:index_html][:title])
        },
        :database => {
          :ses_db => (@args[:db] or default_config[:database][:ses_db])
        }
      }
      Signal.trap 'INT' do
        puts
        puts "Configuration aborted."
        exit
      end
      if interactive
        answers_ok = false
        until answers_ok
          puts ERB.new( @@strs[:initenv][:creating_env] ).result( binding )
      
          require 'highline/import'
    
          say @@strs[:initenv][:enter_title]
          str_project_title = @@strs[:initenv][:project_title]
          config[:index_html][:title] = ask( str_project_title ) do |q|
            q.default = config[:index_html][:title]
          end
        
          say @@strs[:initenv][:enter_db_url]
          str_db_url = @@strs[:initenv][:db_url]
          config[:database][:ses_db] = ask(str_db_url) do |q|
            q.default = config[:database][:ses_db]
          end
        
          say @@strs[:initenv][:enter_http_port]
          str_http_port = @@strs[:initenv][:http_port]
          config[:http_server][:port] = ask(str_http_port) do |q|
            q.default = config[:http_server][:port]
          end
        
          say @@strs[:initenv][:enter_tcp_ip]
          str_tcp_ip = @@strs[:initenv][:tcp_ip]
          config[:http_server][:bind_address] = ask(str_tcp_ip) do |q|
            q.default = config[:http_server][:bind_address]
          end
        
          say @@strs[:initenv][:enter_root_dir]
          str_root_dir = @@strs[:initenv][:root_dir]
          config[:base_url] = ask(str_root_dir) do |q|
            q.default = config[:base_url]
          end
        
          test_url = "http://#{config[:http_server][:bind_address]}:#{config[:http_server][:port]}#{config[:base_url]}"
          say ERB.new( @@strs[:initenv][:config_summary] ).result( binding )
          print @@strs[:initenv][:confirm_config]
          answers_ok = yesno(true)
        end
      else
        test_url = "http://#{config[:http_server][:bind_address]}:#{config[:http_server][:port]}#{config[:base_url]}"
      end
    
      puts @@strs[:initenv][:creating_dirs]
      env_dir = @args[:env_path]
      require 'fileutils'
      FileUtils.mkdir_p( env_dir ) unless File.exists?( env_dir )
      conf_dir = File.expand_path( 'conf', env_dir )
      Dir.mkdir( conf_dir )
      db_dir = File.expand_path( 'db', env_dir )
      Dir.mkdir( db_dir )
      log_dir = File.expand_path( 'log', env_dir )
      Dir.mkdir( log_dir )
      plugins_dir = File.expand_path( 'plugins', env_dir )
      Dir.mkdir( plugins_dir )
      run_dir = File.expand_path( 'run', env_dir )
      Dir.mkdir( run_dir )
      unless create_blank
        print @@strs[:initenv][:install_welcome]
        if yesno(true)
          welcome_plugin_dir = File.join( SERVER_PATH, 'setup', 'welcome' )
          welcome_plugin_dst = File.join( plugins_dir, 'welcome' )
          puts ERB.new( @@strs[:initenv][:installing_welcome_plugin] ).result( binding )
          FileUtils.cp_r( welcome_plugin_dir, welcome_plugin_dst )
        end
      end
      puts @@strs[:initenv][:creating_files]
      conf_file = File.join( conf_dir, 'config.yaml' )
      File.open( conf_file, 'w' ) {|f| f.write( YAML.dump( config ) ) }
      readme_file = File.join( env_dir, 'README' )
      File.open( readme_file, 'w' ) {|f| f.write( ERB.new( @@strs[:initenv][:readme] ).result( binding ) ) }
      version_file = File.join( env_dir, 'VERSION' )
      File.open( version_file, 'w' ) {|f| f.write( "RSence Environment Version #{version.to_f}" ) }
      puts ERB.new( @@strs[:initenv][:congratulations] ).result( binding )
      exit
    end
    
    # Main parser for the help command
    def help( cmd )
      cmd.to_sym! if cmd.class != Symbol
      puts @@strs[:help][:head]
      if @@strs[:help].has_key?(cmd)
        puts @@strs[:help][cmd]
      else
        puts @@strs[:help][:help_main]
      end
      puts @@strs[:help][:tail]
    end
    
    # Returns the version of RSence
    def version
      @@version
    end
    
    # Returns the command the process was started with.
    def cmd
      @cmd
    end
    
    # Returns the parsed optional arguments
    def args
      @args
    end
    
    # Top-level argument parser, checks for command and calls sub-parser, if valid command.
    def parse_argv
      if @argv.empty?
        puts @@strs[:help][:help_help]
        exit
      else
        cmd = @argv[0].to_sym
        cmd = :help if [:h, :'-h', :'--help', :'-help'].include? cmd
      end
      if @@cmds.include?(cmd)
        @cmd = cmd
        if cmd == :help
          parse_help_argv
        elsif cmd == :version
          puts version
          exit
        elsif [:run,:start,:stop,:restart].include? cmd
          parse_startup_argv
        elsif cmd == :status
          parse_status_argv
        elsif cmd == :save
          parse_save_argv
        elsif cmd == :initenv or cmd == :init
          parse_initenv_argv
        end
      else
        puts @@strs[:help][:unknown] + cmd.to_s.inspect
        puts @@strs[:help][:help_help]
        exit
      end
    end
    
    # Entry point for ARGV parsing
    def parse( argv )
      @argv = argv
      @startable = false
      parse_argv
    end
    
    # The constructor sets the @startable flag as false. Use the #parse method with ARGV as the argument to start parsing the ARGV.
    def initialize
      @startable = false
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
    require 'conf/default'
    @@config = Configuration.new(self.args).config
    
    # RSence runtime configuration data
    # @return [Hash] the active configuration structure as defined by the {file:default_conf default configuration} and overridden by local configuration files.
    def self.config
      @@config
    end
    ## Riassence Daemon controls
    require 'daemon/daemon'
    puts "Starting RSence..." if self.args[:verbose]
    daemon = HTTPDaemon.new
    daemon.daemonize!
  end
  
  # @private  The ARGVParser instance and its startup
  @@argv_parser = ARGVParser.new
  @@argv_parser.parse( ARGV )

end

