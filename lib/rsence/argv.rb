##   RSence
 #   Copyright 2010 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##


module RSence

  require 'erb'
  require 'yaml'

  # @private  ARGVParser is the "user interface" as a command-line argument parser.
  #           It parses the command-line arguments and sets up things accordingly.
  class ARGVParser

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
        :http_delayed_start => nil, # --http-delayed-start
      
        # client_pkg (not supported yet)
        :client_pkg_no_gzip               => false, # --disable-gzip
        :client_pkg_no_obfuscation        => false, # --disable-obfuscation
        :client_pkg_no_whitespace_removal => false, # --disable-jsmin
        :suppress_build_messages          => true,  # --build-report
      
      }
    end
    
    # Sets various debug-related options on.
    def set_debug
      @args[:debug]      = true
      @args[:verbose]    = true
      @args[:autoupdate] = true
      @args[:client_pkg_no_obfuscation] = true
      @args[:client_pkg_no_whitespace_removal] = true
      @args[:suppress_build_messages] = false
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
    
    # Error message when an invalid environment is encountered, exits.
    def invalid_env( env_path=false )
      env_path = @args[:env_path] unless env_path
      puts ERB.new( @strs[:messages][:invalid_environment] ).result( binding )
      exit
    end
    
    # Error message when an invalid option is encountered, exits.
    def invalid_option(arg,chr=false)
      if chr
        puts ERB.new( @strs[:messages][:invalid_option_chr] ).result( binding )
      else
        puts ERB.new( @strs[:messages][:invalid_option] ).result( binding )
      end
      exit
    end
    
    require 'conf/argv/startup_argv'
    require 'conf/argv/status_argv'
    require 'conf/argv/save_argv'
    require 'conf/argv/initenv_argv'
    require 'conf/argv/help_argv'
    require 'conf/argv/env_check'
    require 'conf/argv/test_port'
    include ArgvUtil
    
    # Returns the version of RSence
    def version; @version; end
    
    # Returns the command the process was started with.
    def cmd; @cmd; end
    
    # Returns the parsed optional arguments
    def args; @args; end
    
    # Top-level argument parser, checks for command and calls sub-parser, if valid command.
    def parse_argv
      if @argv.empty?
        puts @strs[:help][:help_help]
        exit
      else
        cmd = @argv[0].to_sym
        cmd = :help if [:h, :'-h', :'--help', :'-help'].include? cmd
      end
      if @cmds.include?(cmd)
        @cmd = cmd
        unless [:help, :version].include?( cmd )
          puts "RSence #{@version} -- Ruby #{RUBY_VERSION}"
        end
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
        puts @strs[:help][:unknown] + cmd.to_s.inspect
        puts @strs[:help][:help_help]
        exit
      end
    end
    
    # Entry point for ARGV parsing
    def parse( argv )
      warn "RSence::ArgvParser::parse is deprecated and does nothing."
    end
    
    # The constructor sets the @startable flag as false. Use the #parse method with ARGV as the argument to start parsing the ARGV.
    def initialize( argv )
      @argv = argv
      @startable = false

      # The RSence version string, read from the VERSION file in
      # the root directory of RSence.
      @version = File.read( File.join( SERVER_PATH, 'VERSION' ) ).strip
      
      # Makes various commands available depending on the platform.
      # The status/start/stop/restart/save -commands depend on an operating
      # system that fully implements POSIX standard signals.
      # These are necessary to send signals to the background process.
      if not RSence.pid_support?
        @cmds = [ :run, :init, :initenv, :version, :help ]
      else
        @cmds = [ :run, :status, :start, :stop, :restart, :save,
                  :init, :initenv, :version, :help ]
      end
      
      help_avail_cmds = @cmds.map{|cmd|cmd.to_s}.join("\n       ")
      
      # Load the strings from the strings file.
      strs_path = File.join( SERVER_PATH, 'conf', 
                             'rsence_command_strings.yaml' )
      strs_data = File.read( strs_path )
      
      strs_data = ERB.new( strs_data ).result( binding )
      
      @strs = YAML.load( strs_data )
      
      @strs[:help][:run] += @strs[:help][:path]+@strs[:help][:options]
      @strs[:help][:start] += @strs[:help][:path]+@strs[:help][:options]
      @strs[:help][:stop] += @strs[:help][:path]+@strs[:help][:options]
      @strs[:help][:restart] += @strs[:help][:path]+@strs[:help][:options]
      @strs[:help][:status] += @strs[:help][:path]
      @strs[:help][:save] += @strs[:help][:path]
      
      parse_argv
    end
  
  end
  
  # @private  The ARGVParser instance and its startup
  @@argv_parser = ARGVParser.new( ARGV )

end

