#--
##   Riassence Framework
 #   Copyright 2010 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##
 #++

module RSence
class ARGVParser

@@version = File.read( File.join( SERVER_PATH, 'VERSION' ) ).strip

is_win = ['i386-mingw32','x86-mingw32'].include? RUBY_PLATFORM

if is_win
  @@cmds = [ :run, :setup, :initenv, :version, :help ]
else
  @@cmds = [ :run, :status, :start, :stop, :restart, :save, :setup,
             :initenv, :version, :help ]
end

@@cmd_help = {}

@@cmd_help[:head] = <<-EOF
usage: rsence <command> [options] [args]
RSence command-line tool, version #{@@version}
EOF

@@cmd_help[:unknown] = "Unknown command: "

@@cmd_help[:help_help] = "Type 'rsence help' for usage."

@@cmd_help[:help_main] = <<-EOF
Type 'rsence help <command>' for help on a specific command.

Available commands:
   #{@@cmds.map{|cmd|cmd.to_s}.join("\n   ")}

EOF

@@cmd_help[:path] = <<-EOF
The [PATH] is the RSence environment to use.
The [PATH] defaults to the current working directory.

The expected structure of a project environment (where 'project_directory'
is the directory of your project) is:

  [dir]   project_directory   :: The directory of your project.
    [dir]   conf              :: The directory of config files.
      [file]  config.yaml     :: The config file to load by defult.
    [dir]   var               :: Directory containing various runtime files.
      [dir]  run              :: Directory containing PID files.
      [dir]  log              :: Directory containing log files.
      [dir]  db               :: Directory containing database files.
    [dir]   plugins           :: Directory containing installed plugins.

The 'config.yaml' file contains patches specific to your project.

The configuration files are loaded and applied in this order:
  1:  [rsence_install_path]/conf/default_conf.yaml
  2:  [rsence_install_path]/conf/local_conf.yaml
  3:  /etc/rsence/config.yaml
  4:  ~/.rsence/config.yaml
  5:  [project_directory]/conf/config.yaml
  6:  Any files given using --conf parameters, in order of occurrence.
 
The plugins directory contains the plugins installed in the project.

See also the 'setup' and 'initenv' commands.
EOF

@@cmd_help[:options] = <<-EOF
Available options:

  --conf <file.yaml>      Use additional config file. You can give this option
                          several times. The <file.yaml> is the configuration
                          file to load.
  
  --debug (-d)            Debug mode. Shortcut for several options useful for
                          developers. Not the preferred mode for production.
  
  --verbose (-v)          More verbose output. Also enabled by --debug
  
  --log-fg (-f)           Directs the output of the log messages to stdout
                          instead of the log files. Useful for development.
  
  --trace-js              Logs all js/json going through the msg object.
  
  --trace-delegate        Logs all plugin delegate calls.
  
  --port <number>         The port number the http server listens to.
  
  --addr <ip address>     THe IP address or netmask the http server listen to.
                          '0.0.0.0' listens on all interfaces.
                          '127.0.0.1' listens on the local loopback interface.
  
  --server <handler>      The Rack handler to use.
  
  --reset-sessions (-r)   Resets all active sessions.
  
  --auto-update (-a)      Automatically checks for changes in installed plugin
                          and component bundles. Rebuilds changed component
                          bundles and reload changed plugin bundles.
                          Useful for development purposes.
                          Also enabled by --debug
  
  --latency <number>      Sleeps <number> amount of milliseconds on every
                          request. Useful for testing slow connections.
  
  --say (-S)              Uses speech synthesis via the 'say' command to
                          provide audible feedback, when --auto-update is
                          enabled. Says 'Autobuild complete.',
                          'Loaded [plugin name].', 'Unloaded [plugin name].',
                          'Reloaded [plugin name].', 'Reloading plugins.' and
                          'Plugins reloaded.'
                          Only available on Mac OS X and other systems with a
                          'say' command installed.
  
EOF

@@cmd_help[:run] = <<-EOF
usage: 'rsence run [options] [PATH]'

The 'run' command starts RSence in foreground (no daemon). Exit with CTRL-C.
This is the suggested mode for development and the only mode supported by
Windows, because Windows is missing the concept of a process ID.

#{@@cmd_help[:path]}
#{@@cmd_help[:options]}
EOF

@@cmd_help[:start] = <<-EOF
usage: 'rsence start [options] [PATH]'

The 'start' command starts RSence in the background (as a daemon).
Use the 'stop' command to stop.
Use the 'restart' command to restart.

#{@@cmd_help[:path]}
#{@@cmd_help[:options]}
EOF

@@cmd_help[:stop] = <<-EOF
usage: 'rsence stop [options] [PATH]'

The 'stop' command stops RSence running in the background (as a daemon).

#{@@cmd_help[:path]}
#{@@cmd_help[:options]}
EOF

@@cmd_help[:restart] = <<-EOF
usage: 'rsence restart [options] [PATH]'

The 'restart' command restarts RSence in the background (as a daemon).
If RSence wasn't running before the 'restart' command was issued, the
effect is the same as 'start'.
Use the 'stop' command to stop.

#{@@cmd_help[:path]}
#{@@cmd_help[:options]}
EOF

@@cmd_help[:tail] = <<-EOF
RSence is a self-contained rich internet application client-server framework.
For further information, see http://rsence.org/
EOF

  def initialize( argv )
    @argv = argv
    @startable = false
    parse_argv
  end
  
  def startable?; @startable; end
  
  def parse_help_argv
    if @argv.length >= 2
      help_cmd = @argv[1].to_sym
    else
      help_cmd = :help_main
    end
    help( help_cmd )
    exit
  end
  
  def parse_startup_argv
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
    expect_option  = false
    option_name = false
    if @argv.length >= 2
      @argv[1..-1].each_with_index do |arg,i|
        if expect_option
          if [:port,:latency].include?(option_name) and arg.to_i.to_s != arg
            puts "invalid #{option_nam.to_s}, expected number: #{arg.inspect}"
            puts "Type 'rsence help #{@cmd.to_s}' for usage."
            exit
          elsif option_name == :conf_files
            if not File.exists?( arg ) or not File.file?( arg )
              puts "no such configuration file: #{arg.inspect}"
              puts "Type 'rsence help #{@cmd.to_s}' for usage."
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
        puts "no value for option #{option_name.to_s.inspect}"
        puts "Type 'rsence help #{@cmd.to_s} for usage."
        exit
      end
    end
    @startable = true
  end
  
  def set_debug
    @args[:debug]      = true
    @args[:verbose]    = true
    @args[:autoupdate] = true
    @args[:client_pkg_quiet] = false
  end
  def set_verbose
    @args[:verbose]    = true
  end
  def set_log_fg
    @args[:log_fg]     = true
  end
  def set_reset_ses
    @args[:reset_ses]  = true
  end
  def set_autoupdate
    @args[:autoupdate] = true
  end
  def set_say
    @args[:say] = true
  end
  
  def valid_env?( arg )
    path = File.expand_path( arg )
    if not File.exists?( path )
      puts "no such directory: #{path.inspect}"
      return false
    elsif not File.directory?( path )
      puts "not a directory: #{path.inspect}"
      return false
    end
    conf_path = File.join( path, 'conf' )
    if not File.exists?( conf_path )
      puts "no conf directory, expected: #{conf_path.inspect}"
      return false
    elsif not File.directory?( conf_path )
      puts "not a conf directory, expected: #{conf_path.inspect}"
      return false
    end
    conf_file = File.join( path, 'conf', 'config.yaml' )
    if not File.exists?(conf_file)
      puts "missing conf file, expected: #{conf_file.inspect}"
      return false
    elsif not File.file?( conf_file )
      puts "conf file not a file, expected: #{conf_file.inspect}"
      return false
    end
    plugin_path = File.join( path, 'plugins' )
    if not File.exists?( plugin_path )
      warn "Warning; no plugin directory in project, expected: #{plugin_path.inspect}"
    elsif not File.directory?( plugin_path )
      puts "plugin directory not a directory, expected: #{plugin_path.inspect}"
      return false
    end
    var_path = File.join( path, 'var' )
    unless File.exists?( var_path )
      warn "Warning: no var directory: Creating #{var_path.inspect}"
      Dir.mkdir( var_path )
    end
    var_run_path = File.join( var_path, 'run' )
    unless File.exists?( var_run_path )
      warn "Warning: no var/run directory: Creating #{var_run_path.inspect}"
      Dir.mkdir( var_run_path )
    end
    var_log_path = File.join( var_path, 'log' )
    unless File.exists?( var_log_path )
      warn "Warning: no var/log directory: Creating #{var_log_path.inspect}"
      Dir.mkdir( var_log_path )
    end
    var_db_path = File.join( var_path, 'db' )
    unless File.exists?( var_db_path )
      warn "Warning: no var/db directory: Creating #{var_db_path.inspect}"
      Dir.mkdir( var_db_path )
    end
    return true
  end
  
  def invalid_env( arg )
    puts "invalid environment: #{arg.inspect}"
    puts "Type 'rsence help #{@cmd.to_s}' for usage."
    puts "Type 'rsence help initenv' for environment initialization usage."
    exit
  end
  
  def invalid_option(arg,chr=false)
    if not chr
      puts "invalid option: #{arg.inspect}"
    else
      puts "invalid option character #{chr.inspect} in option character block #{arg.inspect}"
    end
    puts "Type 'rsence help #{@cmd.to_s}' for usage."
    exit
  end
  
  def parse_status_argv
    throw "parse_status_argv not implemented!"
  end
  
  def parse_save_argv
    throw "parse_save_argv not implemented!"
  end
  
  def parse_setup_argv
    throw "parse_setup_argv not implemented!"
  end
  
  def parse_initenv_argv
    throw "parse_initenv_argv not implemented!"
  end
  
  def parse_argv
    if @argv.empty?
      puts @@cmd_help[:help_help]
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
        version
        exit
      elsif [:run,:start,:stop,:restart].include? cmd
        parse_startup_argv
      elsif cmd == :status
        parse_status_argv
      elsif cmd == :save
        parse_save_argv
      elsif cmd == :setup
        parse_setup_argv
      elsif cmd == :initenv
        parse_initenv_argv
      end
    else
      puts @@cmd_help[:unknown] + cmd.to_s.inspect
      puts @@cmd_help[:help_help]
      exit
    end
  end
  
  def help( cmd )
    cmd.to_sym! if cmd.class != Symbol
    puts @@cmd_help[:head]
    if @@cmd_help.has_key?(cmd)
      puts @@cmd_help[cmd]
    else
      puts @@cmd_help[:help_main]
    end
    puts @@cmd_help[:tail]
  end
  
  def version
    puts @@version
  end
  
  def cmd
    @cmd
  end
  
  def args
    @args
  end
  
end

@@argv_parser = ARGVParser.new( ARGV )

def self.argv;    @@argv_parser;    end
def self.cmd;     @@argv_parser.cmd;     end
def self.args;    @@argv_parser.args;    end
def self.startable?; @@argv_parser.startable?; end
def self.startup
  puts "Loading configuration..." if self.args[:verbose]
  # Use the default configuration:
  require 'conf/default'
  @@config = Configuration.new(self.args).config
  def self.config
    @@config
  end
  ## Riassence Daemon controls
  require 'daemon/daemon'
  puts "Starting RSence..." if self.args[:verbose]
  HTTPDaemon.daemonize
end

end

