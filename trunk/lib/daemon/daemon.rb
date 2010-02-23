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
require $config[:http_server][:rack_require]

# Methods that return rack the selected handler
def rack_webrick_handler;  Rack::Handler::WEBrick;  end
def rack_ebb_handler;      Rack::Handler::Ebb;      end
def rack_thin_handler;     Rack::Handler::Thin;     end
def rack_mongrel_handler;  Rack::Handler::Mongrel;  end
def rack_unicorn_handler;  Rack::Handler::Unicorn;  end
def rack_rainbows_handler; Rack::Handler::Rainbows; end

# Selects the handler for Rack
$config[:http_server][:rack_handler] = self.method({
  'fuzed'    => :rack_fuzed_handler,
  'webrick'  => :rack_webrick_handler,
  'ebb'      => :rack_ebb_handler,
  'thin'     => :rack_thin_handler,
  'mongrel'  => :rack_mongrel_handler,
  'unicorn'  => :rack_unicorn_handler,
  'rainbows' => :rack_rainbows_handler
}[$config[:http_server][:rack_require]]).call

# Debug mode switch. The debug mode is intended for developers, not production.
$DEBUG_MODE  = $config[:debug_mode]

# JSServe / JSCache caches and serves the pre-packaged js and theme -files.
# require 'file/filecache'
# require 'file/fileserve'

# ValueManager syncronizes value objects
require 'values/valuemanager'

# SessionManager creates, validates, stores and expires sessions
require 'session/sessionmanager'

# PluginManager handles all the plugins
require 'plugins/pluginmanager'

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
      $config[:daemon][:pid_fn]
    end
    def self.log_fn
      $config[:daemon][:log_fn]
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
    
    def self.log_io(daemon)
      Thread.new do
        outpath = "#{daemon.log_fn}.stdout"
        errpath = "#{daemon.log_fn}.stderr"
        if $DEBUG_MODE
          puts "Waiting 2 seconds before switching output to log file #{outpath} and .../#{File.split(errpath)[1]}"
          sleep 2
          puts "Switching to stdin and stdout to log mode. Follow the log file to see further server output."
        end
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
    end
    
    def self.daemonize(daemon)
      case !ARGV.empty? && ARGV[0]
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
      else
        puts "Invalid command. Please specify one of the following: start, stop, restart, status, save or help."
        exit
      end
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
          $PLUGINS.shutdown
          $SESSION.shutdown
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
      sleep 0.01 until self.status(daemon) or timeout < Time.now
      
      if timeout < Time.now
        puts "Riassence Framework did not start, please check the logfile."
      else
        puts "Riassence Framework is running now."
      end
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

class HTTPDaemon < Riassence::Server::Daemon::Base
  def self.start
    # $config[:filecache]       = FileCache.new
    # $FILECACHE   = $config[:filecache]
    # $config[:fileserve]       = FileServe.new
    # $FILESERVE   = $config[:fileserve]
    
    $config[:valuemanager]    = ValueManager.new
    $VALUES      = $config[:valuemanager]
    $config[:sessionmanager]  = SessionManager.new
    $SESSION     = $config[:sessionmanager]
    $config[:plugins]         = PluginManager.new
    $PLUGINS     = $config[:plugins]
    $config[:transporter]     = Transporter.new
    $TRANSPORTER = $config[:transporter]
    
    Daemon::Controller.log_io(self)
    
    # This is the main http server instance:
    $config[:broker] = Broker.start(
      $config[:http_server][:rack_handler],
      $config[:http_server][:bind_address],
      $config[:http_server][:port]
    )
    $BROKER      = $config[:broker]
  
    yield $BROKER if block_given?
  end
  def self.restart
    self.stop
    $BROKER = nil
    $config[:broker] = nil
    self.start
  end
  def self.stop
    $PLUGINS.shutdown if $PLUGINS
    $SESSION.shutdown if $SESSION
  end
end

end
end

