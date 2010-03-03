#--
##   Riassence Framework
 #   Copyright 2008 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##
 #++

# Use the default configuration:
require 'conf/default'

# Use rubygems to load rack
require 'rubygems'
require 'rack'

# Loads the selected web-server (default is 'thin')
require Riassence::Server.config[:http_server][:rack_require]

# Methods that return rack the selected handler
def rack_webrick_handler;  Rack::Handler::WEBrick;  end
def rack_ebb_handler;      Rack::Handler::Ebb;      end
def rack_thin_handler;     Rack::Handler::Thin;     end
def rack_mongrel_handler;  Rack::Handler::Mongrel;  end
def rack_unicorn_handler;  Rack::Handler::Unicorn;  end
def rack_rainbows_handler; Rack::Handler::Rainbows; end

# Selects the handler for Rack
Riassence::Server.config[:http_server][:rack_handler] = self.method({
  'fuzed'    => :rack_fuzed_handler,
  'webrick'  => :rack_webrick_handler,
  'ebb'      => :rack_ebb_handler,
  'thin'     => :rack_thin_handler,
  'mongrel'  => :rack_mongrel_handler,
  'unicorn'  => :rack_unicorn_handler,
  'rainbows' => :rack_rainbows_handler
}[Riassence::Server.config[:http_server][:rack_require]]).call

# Debug mode switch. The debug mode is intended for developers, not production.
$DEBUG_MODE  = Riassence::Server.config[:debug_mode]

# Transporter is the top-level handler for calls coming from the javascript COMM.Transporter.
require 'transporter/transporter'

## Broker routes requests to the correct handler
require 'http/broker'


module Riassence
module Server

# adapted from:
# http://snippets.dzone.com/posts/show/2265

require 'fileutils'

module Daemon
  
  class Base
    def self.pid_fn
      Riassence::Server.config[:daemon][:pid_fn]
    end
    def self.log_fn
      Riassence::Server.config[:daemon][:log_fn]
    end
    def self.daemonize
      Controller.daemonize(self)
    end
  end
  
  module PidFile
    def self.store(daemon, pid)
      File.open(daemon.pid_fn, 'w') {|f| f << pid}
    end
    def self.recall(daemon)
      IO.read(daemon.pid_fn).to_i rescue nil
    end
  end
  
  module Controller
    
    def self.print_status(daemon)
      is_running = self.status(daemon)
      puts "Riassence Framework is #{'not ' unless is_running}running"
    end
    
    ## Status is not entirely reliable
    def self.status(daemon)
      if File.file?(daemon.pid_fn)
        begin
          pid = File.read(daemon.pid_fn).to_i
          pid && Process.kill('USR2',pid)
          return true
        rescue Errno::ESRCH => e
          return false
        end
      end
      return false
    end
    
    def self.open_log( outpath, errpath )
      if File.exist?( outpath )
        STDOUT.reopen( outpath, "a" )
      else
        STDOUT.reopen( outpath, "w" )
      end
      if File.exist?( errpath )
        STDERR.reopen( errpath, "a" )
      else
        STDERR.reopen( errpath, "w" )
      end
      STDOUT.sync = true
      STDERR.sync = true
    end
    
    def self.log_io(daemon)
      outpath = "#{daemon.log_fn}.stdout"
      errpath = "#{daemon.log_fn}.stderr"
      if $DEBUG_MODE
        Thread.new do
          puts "Waiting 2 seconds before switching output to log file #{outpath} and .../#{File.split(errpath)[1]}"
          sleep 2
          puts "Switching to stdin and stdout to log mode. Follow the log file to see further server output."
          self.open_log( outpath, errpath )
        end
      else
        self.open_log( outpath, errpath )
      end
    end
    
    def self.daemonize(daemon)
      cmd = ARGV[0]
      if ['i386-mingw32','x86-mingw32'].include? RUBY_PLATFORM
        if cmd == 'start'
          warn "Running on Microsoft Windows: unable to background. Using the run command instead of start"
          cmd = 'run'
        elsif cmd != 'run'
          puts "Invalid command: #{cmd.inspect}. Windows supports only run and help."
          exit
        end
      elsif not cmd or not %w[status start stop restart save run].include?( cmd )
        puts "Invalid command. Please specify one of the following: run, start, stop, restart, status, save or help."
        exit
      end
      case cmd
      when 'run'
        puts "Starting as a foreground process."
        puts "Enter CTRL-C to stop."
        self.start_fg(daemon)
      when 'status'
        self.print_status(daemon)
      when 'start'
        self.start(daemon)
      when 'stop'
        self.stop(daemon)
      when 'restart'
        self.stop(daemon,true)
        self.start(daemon)
      when 'save'
        self.save(daemon)
      end
    end
    def self.start_fg(daemon)
      ['INT', 'TERM', 'KILL'].each do |signal|
        Signal.trap(signal) do
          puts "Got signal #{signal.inspect}"
          daemon.stop
          exit
        end
      end
      daemon.start
      exit
    end
    def self.start(daemon)
      is_running = self.status(daemon)
      if is_running
        puts "Riassence Framework is already running. Try restart."
        exit
      elsif not is_running and File.file?(daemon.pid_fn)
        puts "Stale pid file, removing.."
        FileUtils.rm(daemon.pid_fn)
      end
      fork do
        Process.setsid
        exit if fork
        PidFile.store(daemon, Process.pid)
        Signal.trap('USR1') do 
          if @transporter != nil
            @transporter.plugins.shutdown if @transporter.plugins
            @transporter.sessions.shutdown if @transporter.session
          end
        end
        Signal.trap('USR2') do 
          puts "Alive."
        end
        ['INT', 'TERM', 'KILL'].each do |signal|
          Signal.trap(signal) do
            puts "Got signal #{signal.inspect}"
            daemon.stop
            exit
          end
        end
        Signal.trap('HUP') {
          daemon.restart
        }
        STDIN.reopen( "/dev/null" )
        daemon.start
      end
      
      timeout = Time.now + 10
      sleep 0.1 until self.status(daemon) or timeout < Time.now
      
      if timeout < Time.now
        puts "Riassence Framework did not start, please check the logfile."
      else
        puts "Riassence Framework is running now."
      end
      
      sleep 2.5 if $DEBUG_MODE
      
      #Process.kill("USR2", File.read(daemon.pid_fn).to_i)
    end
    def self.save(daemon,is_restart=false)
      if !File.file?(daemon.pid_fn)
        puts "Pid file not found. Is Riassence Framework started?"
        return if is_restart
        exit
      end
      pid = File.read(daemon.pid_fn).to_i
      begin
        pid && Process.kill("USR1", pid)
        puts "Session data saved."
      rescue
        puts "Error, no such pid (#{pid}) running"
      end
    end
    def self.stop(daemon,is_restart=false)
      self.save(daemon,is_restart)
      if !File.file?(daemon.pid_fn)
        puts "Pid file not found. Is Riassence Framework started?"
        return if is_restart
        exit
      end
      pid = PidFile.recall(daemon)
      begin
        pid && Process.kill("TERM", pid)
        puts "Riassence Framework is stopped now."
      rescue
        puts "Error, no such pid (#{pid}) running"
      end
      FileUtils.rm(daemon.pid_fn)
    end
  end
end

class HTTPDaemon < Daemon::Base
  def self.start
    @transporter = Transporter.new
    
    unless ARGV.include?('--log-fg')
      Daemon::Controller.log_io(self)
    end
    
    # This is the main http handler instance:
    @broker = Broker.start(
      @transporter,
      Riassence::Server.config[:http_server][:rack_handler],
      Riassence::Server.config[:http_server][:bind_address],
      Riassence::Server.config[:http_server][:port]
    )
    
    yield @broker if block_given?
    
  end
  def self.restart
    self.stop
    @broker = nil
    self.start
  end
  def self.stop
    @transporter.plugins.shutdown
    @transporter.sessions.shutdown
  end
end

end
end

