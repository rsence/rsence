
# Use rubygems to load rack
require 'rubygems'

# Transporter is the top-level handler for calls coming from the javascript COMM.Transporter.
require 'rsence/transporter'

# Broker routes requests to the correct handler
require 'rsence/http'


module RSence
  
  # @private  The process id of the launch process (usually the PID of the 'rsence' command)
  @@launch_pid = Process.pid
  
  # @private  Returns the pid of the process when starting up.
  #   PID is different for the forked child process or processes
  def self.launch_pid
    return @@launch_pid
  end

  # @private  The Controller module handles the daemonizing
  #   operations of the process referred to as +daemon+
  module Daemon
  
    # Writes the process id to disk, the pid_fn method of the daemon contains
    # the name of the pid file.
    def self.write_pid( daemon, pid )
      File.open( daemon.pid_fn, 'w' ) do |pidfile|
        pidfile.write( pid )
      end
    end
  
    # Reads the process id from disk, the pid_fn method of the daemon contains
    # the name of the pid file. Returns nil on errors.
    def self.read_pid( daemon )
      File.read( daemon.pid_fn ).to_i rescue nil
    end
  
    def self.responds?( daemon )
      wait_signal_response( daemon, RSence.info_signal_name )
    end
  
    # Reads the pid file and calls the process.
    # Returns true if the process responds, false otherwise (no process)
    def self.status( daemon )
      pid = read_pid( daemon )
      return nil if not pid
      return responds?( daemon )
    end
  
    # Redirects standard input and errors to the log files
    def self.start_logging( daemon )
      outpath = "#{daemon.log_fn}.stdout"
      errpath = "#{daemon.log_fn}.stderr"
      STDOUT.reopen( outpath, (File.exist?( outpath ) ? 'a' : 'w') )
      STDOUT.sync = true
      STDERR.reopen( errpath, (File.exist?( errpath ) ? 'a' : 'w') )
      STDERR.sync = true
    end
  
    # Writes a signal response file containing the pid.
    def self.write_signal_response( daemon, signal )
      pid = Process.pid.to_s
      pid_fn = daemon.pid_fn
      RSence::SIGComm.write_signal_response( pid, pid_fn, signal )
    end
  
    # Removes a signal response file.
    def self.delete_signal_response( daemon, signal )
      pid_fn = daemon.pid_fn
      RSence::SIGComm.delete_signal_response( pid_fn )
    end
  
    # Waits for a signal response.
    def self.wait_signal_response( daemon, signal, timeout = 10,
                                   debug_pre = false, debug_suf = false, sleep_secs = 0.2 )
      pid = read_pid( daemon )
      pid_fn = daemon.pid_fn
      return RSence::SIGComm.wait_signal_response( pid, pid_fn, signal, timeout, debug_pre, debug_suf, sleep_secs )
    end
  
    # Signal trapping for windows.
    # The only supported POSIX signal trappable seems to be INT (CTRL-C).
    def self.trap_windows_signals( daemon )
      ['INT'].each do | signal |
        Signal.trap( signal ) do
          puts "RSence killed with signal #{signal.inspect}" if RSence.args[:verbose]
          daemon.usr1
          daemon.stop
          puts "Shutdown complete."
          exit
        end
      end
    end
  
    # Traps common POSIX signals
    def self.trap_signals( daemon )
    
      # Triggered with 'kill -USR1 `cat rsence.pid`'
      Signal.trap( 'USR1' ) do 
        daemon.usr1
        write_signal_response( daemon, 'USR1' )
      end
      Signal.trap( 'USR2' ) do 
        daemon.usr2
        write_signal_response( daemon, 'USR2' )
      end
      # Signal.trap( 'PWR' ) do 
      #   daemon.pwr
      #   write_signal_response( daemon, 'PWR' )
      # end
      Signal.trap( 'ALRM' ) do 
        daemon.alrm
        write_signal_response( daemon, 'ALRM' )
      end
      Signal.trap( RSence.info_signal_name ) do 
        daemon.info
        write_signal_response( daemon, RSence.info_signal_name )
      end
      ['INT', 'TERM'].each do | signal |
        Signal.trap( signal ) do
          puts "RSence killed with signal #{signal.inspect}" if RSence.args[:verbose]
          daemon.usr1
          daemon.stop
          delete_stale_pids( daemon )
          write_signal_response( daemon, signal )
          puts "Shutdown complete."
          exit
        end
      end
      Signal.trap('HUP') do
        daemon.stop
        daemon.start
      end
    end
  
    # Removes all pid files that were left around if a process died unexpectedly.
    def self.delete_stale_pids( daemon )
      ( pid_fn_path, pid_fn_name ) = File.split( daemon.pid_fn )
      Dir.entries( pid_fn_path ).each do | item_fn |
        item_path = File.join( pid_fn_path, item_fn )
        if item_fn.start_with?( pid_fn_name ) and File.file?( item_path )
          puts "Stale pid file (#{item_fn}), removing.." if RSence.args[:verbose]
          File.delete( item_path )
        end
      end
    end
  
    # Creates pid file and traps signal.
    def self.init_pid( daemon )
      if RSence.pid_support?
        is_running = status( daemon )
        if is_running
          puts "RSence is already running."
          puts "Stop the existing process first: see 'rsence help stop'"
          if RSence.launch_pid != Process.pid
            Process.kill( 'INT', RSence.launch_pid )
          end
          exit
        elsif not is_running
          delete_stale_pids( daemon )
        end
        trap_signals( daemon )
        pid = Process.pid
        write_pid( daemon, pid ) 
        return pid
      else
        trap_windows_signals( daemon )
        return false
      end
    end
  
    # Inits the pid, signals and then starts the server in the foreground
    def self.run( daemon )
      init_pid( daemon )
      daemon.run
      exit
    end
  
    # Inits the pid, signals and then starts the daemon in
    # the background and waits until the daemon sends the TERM signal.
    def self.start( daemon )
      fork do
        exit if fork
        init_pid( daemon )
        daemon.start
      end
      Signal.trap('INT') do
        puts "RSence startup failed. Please inspect the log and/or run in debug mode."
        exit
      end
      Signal.trap('TERM') do
        puts "RSence is online at http://#{daemon.addr}:#{daemon.port}/"
        exit
      end
      sleep 1 while true
    end
  
    # Sends the PWR signal to the process, which in turn
    # calls the save method of the daemon.
    def self.save( daemon )
      status_ = status( daemon )
      if status_
        if wait_signal_response( daemon, 'PWR', 10, 'saving.', 'saved', 0.3 )
          puts "Session data saved."
        else
          puts "Warning: saving timed out! Session data not saved."
        end
      elsif status_ == false
        puts "Warning, no such process (#{pid}) running: unable to save."
      elsif status_ == nil
        puts "No pid file: unable to save."
      else
        throw "Unexpected process status: #{status_.inspect}"
      end
    end
  
    # Sends the TERM signal to the process, which in turn
    # calls the stop method of the daemon
    def self.stop( daemon )#,is_restart=false)
      status_ = status( daemon )
      if status_
        if wait_signal_response( daemon, 'TERM', 10, 'killing.', 'killed', 0.3 )
          puts "RSence is terminated now."
        else
          puts "Warning: termination timed out!"
          puts "RSence might still be running, please ensure manually."
        end
      elsif status_ == false
        puts "Warning, no such process (#{read_pid(daemon)}) running."
      elsif status_ == nil
        puts "Warning, no pid file (process not running)."
      else
        throw "Unexpected process status: #{status_.inspect}"
      end
    end
  
    # Main entry point called from the daemon process passing +self+ as +daemon+.
    def self.daemonize( daemon )
    
      # Uses the command-line tool command to decide what to do.
      case RSence.cmd
      when :run
        run( daemon )
      when :start
        start( daemon )
      when :stop
        stop( daemon )
      when :restart
        stop( daemon )
        start( daemon )
      when :save
        save( daemon )
      end
    end
  
  end

  # @private  Simple process control, constructed here and called from Daemon::Controller
  class HTTPDaemon
    
    def ps_name
      config = RSence.config
      url = "http://#{config[:http_server][:bind_address]}:#{config[:http_server][:port]}#{config[:base_url]}"
      env_path = RSence.args[:env_path]
      "RSence-#{RSence.version} on #{url} in #{env_path}"
    end
    
    def start_broker( conf )
      http_delayed_seconds = RSence.config[:daemon][:http_delayed_start].to_i
      if http_delayed_seconds == -1
        puts "The HTTP Broker is disabled. RSence won't bind a http listener to any address."
      else
        if http_delayed_seconds > 0
          puts "Delaying the start of the HTTP Broker by #{http_delayed_seconds} seconds."
          if http_delayed_seconds > 10
            # report when starting in 10 second intervals
            sleep_remainder = http_delayed_seconds % 10
            sleep_count = http_delayed_seconds / 10
            sleep_time_left = http_delayed_seconds
            sleep_count.times do |sleep_count_num|
              puts "Waiting #{sleep_time_left} seconds..."
              sleep 10
              sleep_time_left -= 10
            end
            if sleep_remainder != 0
              puts "Waiting #{sleep_remainder} seconds..."
              sleep sleep_remainder
            end
          else
            sleep http_delayed_seconds
          end
          puts "Starting the HTTP Broker now."
        end
        # This is the main http handler instance:
        @broker = Broker.start(
          @transporter,
          conf
        )
      end
    end
    
    # RSence top-level run handler. Almost identical to start.
    def run
      
      # Sets the process name
      $0 = ps_name
      
      puts "Starting as a foreground process." if RSence.args[:verbose]
      puts "Press CTRL-C to terminate."
    
      @transporter = Transporter.new
    
      conf = RSence.config[:http_server]
    
      unless RSence.args[:log_fg]
        Daemon.start_logging( self )
      end
      
      ses_expire_loop
      autosave_loop if RSence.config[:daemon][:autosave_interval] > 0
      start_broker( conf )
      
    end
    
    # Returns the pid file path.
    def pid_fn
      RSence.config[:daemon][:pid_fn]
    end
    
    # Returns the log path.
    def log_fn
      RSence.config[:daemon][:log_fn]
    end
    
    # Returns the configured bind address
    def addr
      RSence.config[:http_server][:bind_address]
    end
    
    # Returns the configured port.
    def port
      RSence.config[:http_server][:port]
    end

    # Expires old sessions once a second
    def ses_expire_loop
      Thread.new do
        Thread.pass
        while true
          sleep 1
          begin
            @transporter.sessions.expire_sessions if @transporter.online?
          rescue => e
            warn "Session expiration error: #{e.inspect}"
          end
        end
      end
    end

    # Saves plugin and session state periodically
    def autosave_loop
      Thread.new do
        Thread.pass
        sleep RSence.config[:daemon][:autosave_interval]
        while true
          if @transporter.online?
            save
          end
          sleep RSence.config[:daemon][:autosave_interval]
        end
      end
    end
    
    # Called by Controller#start, contains RSence-specific operations
    def start
      
      # Sets the process name
      $0 = ps_name
      
      @transporter = Transporter.new
      
      conf = RSence.config[:http_server]
      
      unless RSence.args[:log_fg]
        Daemon.start_logging( self )
        STDIN.reopen( "/dev/null" )
      end
      
      Process.setsid
      
      ses_expire_loop
      autosave_loop if RSence.config[:daemon][:autosave_interval] > 0
      start_broker( conf )
      yield @broker
    
    end
    
    # Called by Controller#stop, contains RSence-specific operations
    def stop
      @transporter.shutdown
    end
    
    # # Called on PWR signals (save data)
    # def pwr
    #   save
    # end
    
    # Called on INFO (PWR) signals ("Alive?")
    def info
      puts "#{Time.now.strftime('%Y-%m-%d %H:%M:%S')} -- RSence version #{RSence.version} is running the project: #{RSence.args[:env_path]}"
    end
    
    # Called on ALRM signals (save data, reload all plugins manually)
    def alrm
      save
      @transporter.plugins.shutdown
      @transporter.plugins.init_bundles!
    end
    
    # Called on usr1 signals (updates bundles manually, like the regular intervals of the -a switch and forces client to be rebuilt)
    def usr1
      @transporter.plugins.update_bundles!
      # @transporter.plugins.client_pkg.rebuild_client
    end
    
    # Called on USR2 signals
    def usr2
      save
    end
    
    # Save state
    def save
      puts "#{Time.now.strftime('%Y-%m-%d %H:%M:%S')} -- Saving state..."
      # transporter_state = @transporter.online?
      # @transporter.online = false
      begin
        # Store remaining active sessions
        @transporter.sessions.store_sessions
      rescue => e
        puts "Exception #{e.inspect} occurred while storing sessions"
      end
      @transporter.plugins.delegate(:flush)
      # @transporter.online = transporter_state
      puts "#{Time.now.strftime('%Y-%m-%d %H:%M:%S')} -- State saved."
    end
    
    # Main entry point, daemonizes itself using Controller.
    def daemonize!
      Daemon.daemonize( self )
    end
  
  end
end
