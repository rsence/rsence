#--
##   Riassence Framework
 #   Copyright 2010 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##
 #++
require 'daemon/sigcomm'
module RSence
def self.pid_support?
  # true for non-windows
  return (not ['i386-mingw32','x86-mingw32'].include?(RUBY_PLATFORM))
end
class ARGVParser

@@version = File.read( File.join( SERVER_PATH, 'VERSION' ) ).strip

if RSence.pid_support?
  @@cmds = [ :run, :status, :start, :stop, :restart, :save,
             :initenv, :version, :help ]
else
  @@cmds = [ :run, :initenv, :version, :help ]
end

@@cmd_help = {}

@@cmd_help[:head] = <<-EOF
RSence command-line tool, version #{@@version}

EOF

@@cmd_help[:unknown] = "Unknown command: "

@@cmd_help[:help_help] = "Type 'rsence help' for usage."

@@cmd_help[:help_main] = <<-EOF
usage: rsence <command> [options] [args]

Type 'rsence help <command>' for help on a specific command.

Available commands:
   #{@@cmds.map{|cmd|cmd.to_s}.join("\n   ")}

EOF

@@cmd_help[:path] = <<-EOF
The [PATH] is the RSence environment to use.
The [PATH] defaults to the current working directory.

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
  
  --addr <ip address>     The IP address or netmask the http server listens to.
                          '0.0.0.0' matches all interfaces.
                          '127.0.0.1' matches the local loopback interface.
  
  --server <handler>      The Rack handler to use. Defaults to mongrel
  
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

@@cmd_help[:initenv] = <<-EOF
usage: 'rsence initenv [options] [PATH]'

The 'initenv' command creates a new RSence environment. 

The expected structure of a project environment (where 'project_directory'
is the directory of your project) is:

 [d]  project_name       :  The name of your project.
   [d]  conf             :  The directory of config files.
     [f]  config.yaml    :  The config file to load by defult.
   [d]  db               :  Directory containing database files.
   [d]  log              :  Directory containing log files.
   [d]  plugins          :  Directory containing installed plugins.
   [d]  run              :  Directory containing runtime pid files.
   [f]  README           :  Description of the environment directory.
   [f]  VERSION          :  RSence version the environment was created with

The 'config.yaml' file contains patches specific to your project.

The configuration files are loaded and applied in this order:
  1:  [rsence_install_path]/conf/default_conf.yaml
  2:  [rsence_install_path]/conf/local_conf.yaml
  3:  /etc/rsence/config.yaml
  4:  ~/.rsence/config.yaml
  5:  [project_directory]/conf/config.yaml
  6:  Any files given using --conf parameters, in order of occurrence.
 
The plugins directory contains the plugins that are run in the project.


Available options:

  --port <number>         The port number the http server listens to.
  
  --addr <ip address>     The IP address or netmask the http server listens to.
                          '0.0.0.0' matches all interfaces.
                          '127.0.0.1' matches the local loopback interface.
                          Defaults to 0.0.0.0
  
  --server <handler>      The Rack handler to use. Defaults to mongrel
  
  --title <title>         The title of the index page.
  
  --database <conn_str>   Use the Sequel connection string to configure the
                          default session database.
  
  --uri-prefix <path>     Configure RSence to use this http "directory" as
                          the prefix. It defaults to the root directory: /
  
  --blank                 Doesn't install the Welcome -plugin.
  
  --non-interactive (-q)  Doesn't ask anything, just creates the environment
                          with the options supplied.

For further configuration, edit the config.yaml file.

EOF

@@cmd_help[:run] = <<-EOF
usage: 'rsence run [options] [PATH]'

The 'run' command starts RSence in foreground (no daemon). Exit with CTRL-C.

#{@@cmd_help[:path]}
#{@@cmd_help[:options]}
EOF

@@cmd_help[:start] = <<-EOF
usage: 'rsence start [options] [PATH]'

The 'start' command starts RSence in the background (as a daemon).

Use the 'stop' command to stop RSence.

Use the 'restart' command to restart RSence in the background.

Use the 'status' command to see if RSence is running.

#{@@cmd_help[:path]}
#{@@cmd_help[:options]}
EOF

@@cmd_help[:stop] = <<-EOF
usage: 'rsence stop [options] [PATH]'

The 'stop' command stops RSence running in the background (as a daemon).

Use the 'status' command to see if RSence is running.

#{@@cmd_help[:path]}
#{@@cmd_help[:options]}
EOF

@@cmd_help[:restart] = <<-EOF
usage: 'rsence restart [options] [PATH]'

The 'restart' command restarts RSence in the background (as a daemon).
If RSence wasn't running before the 'restart' command was issued, the
effect is the same as 'start'.

Use the 'stop' command to stop RSence.

Use the 'status' command to see if RSence is running.

#{@@cmd_help[:path]}
#{@@cmd_help[:options]}
EOF

@@cmd_help[:status] = <<-EOF
usage: 'rsence status [options] [PATH]'

The 'status' command checks if RSence is running.
If started with the 'start', 'run' or 'restart' command, a PID file is written.
Status checks if the PID file exists, if the RSence process responds and if
the configured TCP port responds in the configured IP address.

Available options:

  --conf <file.yaml>      Use additional config file. You can give this option
                          several times. The <file.yaml> is the configuration
                          file to load.
  
  --debug (-d)            Debug mode. Shortcut for several options useful for
                          developers. Not the preferred mode for production.
  
  --verbose (-v)          More verbose output. Also enabled by --debug
  
  --port <number>         The port number the http server listens to.
  
  --addr <ip address>     The IP address or netmask the http server listens to.

#{@@cmd_help[:path]}

EOF

@@cmd_help[:save] = <<-EOF
usage: 'rsence save [options] [PATH]'

The 'save' command signals the RSence process to tell the plugins to save their
data and the session manager to save its session database.

Available options:

  --conf <file.yaml>      Use additional config file. You can give this option
                          several times. The <file.yaml> is the configuration
                          file to load.
  
  --debug (-d)            Debug mode. Shortcut for several options useful for
                          developers. Not the preferred mode for production.
  
  --verbose (-v)          More verbose output. Also enabled by --debug

#{@@cmd_help[:path]}

EOF

@@cmd_help[:version] = <<-EOF
usage: 'rsence version'

The 'version' command simply outputs the version number of RSence.

RSence follows the standard four-numbered sequence-based version identification
scheme. The scheme is defined like: major.minor[.maintenance[.package]][.pre]

The major number designates major changes in functionality, sometimes limiting
backwards compatibility with software written for previous versions.

The minor number designates minor changes in functionality, like minor or
moderate changes in functinality that usually don't impact backwards
compatibilty of software written for a previous release with the same major
version.

The maintenance number designates bug fixes and other minimal changes to
the release. In a maintenance number change, no new features are introduced.

The package number is a sequence used for the package release. Rubygems
requires an unique version for each gem released, so pre-releases usually
occupy the first package numbers of any release.

The '.pre' suffix signifies a pre-release, like "Alpha" or "Beta". To
install a prerelease version, gem requires the '--pre' command line argument.
Release versions never have the '.pre' suffix. There are usually several
package number increments of a new release.

Version number conventions in written text should include both major and
minor version numbers prefixed with 'RSence'. The maintennance number
is usally not mentioned unless an issue is fix or such is discussed.

For instance: "RSence 2.0 has undergone some major refactoring since 1.2.1"

EOF

@@cmd_help[:tail] = <<-EOF
RSence is a self-contained rich internet application client-server framework.
For further information, see http://rsence.org/
EOF
  
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
  
  def parse_startup_argv
    init_args
    expect_option  = false
    option_name = false
    if @argv.length >= 2
      @argv[1..-1].each_with_index do |arg,i|
        if expect_option
          if [:port,:latency].include?(option_name) and arg.to_i.to_s != arg
            puts "invalid #{option_name.to_s}, expected number: #{arg.inspect}"
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
    if valid_env?(@args[:env_path])
      conf_file = File.expand_path( File.join( @args[:env_path], 'conf', 'config.yaml' ) )
      @args[:conf_files].push( conf_file ) unless @args[:conf_files].include?( conf_file )
    else
      puts "invalid environment."
      exit
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
  
  def valid_env?( arg, quiet=false )
    path = File.expand_path( arg )
    if not File.exists?( path )
      puts "no such directory: #{path.inspect}" unless quiet
      return false
    elsif not File.directory?( path )
      puts "not a directory: #{path.inspect}" unless quiet
      return false
    end
    conf_path = File.join( path, 'conf' )
    if not File.exists?( conf_path )
      puts "no conf directory, expected: #{conf_path.inspect}" unless quiet
      return false
    elsif not File.directory?( conf_path )
      puts "not a conf directory, expected: #{conf_path.inspect}" unless quiet
      return false
    end
    conf_file = File.join( path, 'conf', 'config.yaml' )
    if not File.exists?(conf_file)
      puts "missing conf file, expected: #{conf_file.inspect}" unless quiet
      return false
    elsif not File.file?( conf_file )
      puts "conf file not a file, expected: #{conf_file.inspect}" unless quiet
      return false
    end
    plugin_path = File.join( path, 'plugins' )
    if not File.exists?( plugin_path )
      warn "Warning; no plugin directory in project, expected: #{plugin_path.inspect}" if @args[:verbose]
    elsif not File.directory?( plugin_path )
      puts "plugin directory not a directory, expected: #{plugin_path.inspect}" unless quiet
      return false
    end
    run_path = File.join( path, 'run' )
    unless File.exists?( run_path )
      warn "Warning: no run directory: Creating #{run_path.inspect}" if @args[:verbose]
      Dir.mkdir( run_path )
    end
    log_path = File.join( path, 'log' )
    unless File.exists?( log_path )
      warn "Warning: no log directory: Creating #{log_path.inspect}" if @args[:verbose]
      Dir.mkdir( log_path )
    end
    db_path = File.join( path, 'db' )
    unless File.exists?( db_path )
      warn "Warning: no db directory: Creating #{db_path.inspect}" if @args[:verbose]
      Dir.mkdir( db_path )
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
  
  def test_port( port, addr='127.0.0.1' )
    require 'socket'
    begin
      addr = '127.0.0.1' if addr == '0.0.0.0'
      sock = TCPsocket.open( addr, port )
      sock.close
      return true
    rescue Errno::ECONNREFUSED
      return false
    rescue => e
      warn e.inspect
      return false
    end
  end
  
  def parse_status_argv
    init_args
    expect_option  = false
    option_name = false
    if @argv.length >= 2
      @argv[1..-1].each_with_index do |arg,i|
        if expect_option
          if [:port].include?(option_name) and arg.to_i.to_s != arg
            puts "invalid #{option_name.to_s}, expected number: #{arg.inspect}"
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
        puts "no value for option #{option_name.to_s.inspect}"
        puts "Type 'rsence help #{@cmd.to_s} for usage."
        exit
      end
    end
    if valid_env?(@args[:env_path])
      conf_file = File.expand_path( File.join( @args[:env_path], 'conf', 'config.yaml' ) )
      @args[:conf_files].push( conf_file ) unless @args[:conf_files].include?( conf_file )
    else
      puts "invalid environment."
      exit
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
        pid_status = RSence::SIGComm.wait_signal_response(
          pid, pid_fn, 'USR2', 3
        )
      else
        puts "no PID file, unable to check process status" if @args[:verbose]
        pid_status = nil
      end
    else
      puts "no PID support, unable to check process status" if @args[:verbose]
      pid_status = nil
    end
    if RSence.pid_support?
      if pid_status == nil
        puts "No process id, unable to check process status."
      elsif pid_status == false
        puts "No process running#{port_status ? ' but something responds on ' : ' and nothing responds on ' }#{addr}:#{port}."
      else
        puts "Process id #{pid} is running#{port_status ? ' and responds on ' : ', but does not respond on '}#{addr}:#{port}."
      end
    end
  end
  
  def parse_save_argv
    init_args
    expect_option  = false
    option_name = false
    if @argv.length >= 2
      @argv[1..-1].each_with_index do |arg,i|
        if expect_option
          if option_name == :conf_files
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
        puts "no value for option #{option_name.to_s.inspect}"
        puts "Type 'rsence help #{@cmd.to_s} for usage."
        exit
      end
    end
    if valid_env?(@args[:env_path])
      conf_file = File.expand_path( File.join( @args[:env_path], 'conf', 'config.yaml' ) )
      @args[:conf_files].push( conf_file ) unless @args[:conf_files].include?( conf_file )
    else
      puts "invalid environment."
      exit
    end
    require 'conf/default'
    config = Configuration.new(@args).config
    if RSence.pid_support?
      pid_fn = config[:daemon][:pid_fn]
      if File.exists?( pid_fn )
        pid = File.read( pid_fn ).to_i
        pid_status = RSence::SIGComm.wait_signal_response(
          pid, pid_fn, 'USR1', 30, 'Saving session data...', '.', 0.1, true
        )
      else
        puts "no PID file, unable to signal the save command to the process" if @args[:verbose]
        pid_status = nil
      end
    else
      puts "no PID support, unable to signal the save command to the process" if @args[:verbose]
      pid_status = nil
    end
    if RSence.pid_support?
      if pid_status == nil
        puts "No process id, unable to signal the save command to the process."
      elsif pid_status == false
        puts "No process running."
      else
        puts "Session data saved."
      end
    end
  end
  
  # asks y/n and returns boleans,
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
            puts "invalid #{option_name.to_s}, expected number: #{arg.inspect}"
            puts "Type 'rsence help #{@cmd.to_s}' for usage."
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
        puts "no value for option #{option_name.to_s.inspect}"
        puts "Type 'rsence help #{@cmd.to_s} for usage."
        exit
      end
    end
    if valid_env?(@args[:env_path],true)
      puts "Environment already initialized."
      exit
    end
    conf_file = File.expand_path( File.join( @args[:env_path], 'conf', 'config.yaml' ) )
    if File.exists?(@args[:env_path])
      if Dir.entries(@args[:env_path]).length > 2 # [ '.', '..' ]
        puts "Environment directory #{@args[:env_path]} is not empty."
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
        puts <<-END

Creating a new RSence environment at #{@args[:env_path]}

RSence will first ask a few questions about your environment
in order to initialize and prepare the project configuration.

You may abort this command at any time by pressing CTRL-C
Nothing will be written until you have answered all the questions.

Pressing the ENTER (or RETURN) key at each prompt will choose the
default option shown.
If you are not sure about how to answer a question, press
the ENTER (or RETURN) key to continue.

        END
      
        require 'highline/import'
    
        say <<-END

 Please enter the title of your project.
 This title will be used in the default page title.
 
        END
        config[:index_html][:title] = ask("Project Title") do |q|
          q.default = config[:index_html][:title]
        end
      
        say <<-END



 Please specify the connection string for the session database to use.
 By default, a local SQLite database is created in the 'db' subdirectory
 of the environment directory. Any database supported by Sequel is supported
 by RSence.

 For further information about database connection strings, read the Sequel
 documentation at:
 http://sequel.rubyforge.org/rdoc/files/doc/opening_databases_rdoc.html

 You will also need the appropriate ruby driver for the database selected. If
 none is installed, RSence will not be able to store persistent session data
 between server restarts.

        END
        config[:database][:ses_db] = ask("Session database connection string") do |q|
          q.default = config[:database][:ses_db]
        end
        say <<-END



 Please enter a HTTP port for the server to listen to. This port must not be a
 TCP port already in use.
 
        END
        config[:http_server][:port] = ask("HTTP Port:") do |q|
          q.default = config[:http_server][:port]
        end
        say <<-END


 Please enter a TCP/IP address for the HTTP server to listen to. This address 
 must be an address configured by a network interface of this computer.

 The address 0.0.0.0 matches any interfaces.
 The address 127.0.0.1 matches only the localhost address, this address is
 not accessible from any other computer.
 
        END
        config[:http_server][:bind_address] = ask("Interface TCP/IP address:") do |q|
          q.default = config[:http_server][:bind_address]
        end
        
        say <<-END


 Please enter a root directory for RSence to respond in.
 By default this is the root directory of the server: /
 
        END
        config[:base_url] = ask("URI Prefix:") do |q|
          q.default = config[:base_url]
        end
        test_url = "http://#{config[:http_server][:bind_address]}:#{config[:http_server][:port]}#{config[:base_url]}"
        say <<-END

Configuration Summary

 Please verify that the configuration is correct.
 This configuration will be written into the configuration file:
   #{conf_file}

Title:       #{config[:index_html][:title]}

Database:    #{config[:database][:ses_db]}

HTTP Server:
  Address:    #{config[:http_server][:bind_address]}
  Port:       #{config[:http_server][:port]}
  URI Prefix: #{config[:base_url]}
  
  This means the URL will be #{test_url}

        END
        print "Is the configuration correct, "
        answers_ok = yesno(true)
      end
    else
      test_url = "http://#{config[:http_server][:bind_address]}:#{config[:http_server][:port]}#{config[:base_url]}"
    end
    
    puts "Creating directories..."
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
      welcome_plugin_dir = File.join( SERVER_PATH, 'setup', 'welcome' )
      welcome_plugin_dst = File.join( plugins_dir, 'welcome' )
      puts "Installing the welcome plugin. To remove it, just delete this folder:"
      puts "  #{welcome_plugin_dst}"
      FileUtils.cp_r( welcome_plugin_dir, welcome_plugin_dst )
    end
    puts "Creating files..."
    conf_file = File.join( conf_dir, 'config.yaml' )
    File.open( conf_file, 'w' ) {|f| f.write( YAML.dump( config ) ) }
    readme_file = File.join( env_dir, 'README' )
    File.open( readme_file, 'w' ) {|f| f.write( <<-END
This directory contains a RSence environment titled '#{config[:index_html][:title]}'.
Visit http://rsence.org/ for further information.
    END
    ) }
    version_file = File.join( env_dir, 'VERSION' )
    File.open( readme_file, 'w' ) {|f| f.write( "RSence Environment Version #{version.to_f}" ) }
    puts <<-END

#{'-='*39}-

RSence project environment for '#{config[:index_html][:title]}' created.

You may configure the environment by editing the file:

  #{conf_file}

If you would like to test this environment now, start the RSence server:

  rsence run #{env_dir}

Then point your browser to:

  #{test_url}

The latest documentation and further information is available at the
RSence website:

  http://rsence.org/


Congratulations!

    END
    exit
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
    @@version
  end
  
  def cmd
    @cmd
  end
  
  def args
    @args
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
        puts version
        exit
      elsif [:run,:start,:stop,:restart].include? cmd
        parse_startup_argv
      elsif cmd == :status
        parse_status_argv
      elsif cmd == :save
        parse_save_argv
      elsif cmd == :initenv
        parse_initenv_argv
      end
    else
      puts @@cmd_help[:unknown] + cmd.to_s.inspect
      puts @@cmd_help[:help_help]
      exit
    end
  end
  
  def parse( argv )
    @argv = argv
    @startable = false
    parse_argv
  end
  
  def initialize
    @startable = false
  end
  
end

def self.argv;    @@argv_parser;    end
def self.cmd;     @@argv_parser.cmd;     end
def self.args;    @@argv_parser.args;    end
def self.startable?; @@argv_parser.startable?; end
def self.version; @@argv_parser.version; end
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
  daemon = HTTPDaemon.new
  daemon.daemonize!
end
@@argv_parser = ARGVParser.new
@@argv_parser.parse( ARGV )

end

