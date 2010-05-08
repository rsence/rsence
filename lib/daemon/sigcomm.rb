#--
##   Riassence Framework
 #   Copyright 2010 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##
 #++

# RSence async signal communication handler, uses temporary files for communication.
# Utilized by ARGVParser and Daemon.

module RSence
  module SIGComm
    def self.delete_signal_response( pid_fn )
      sig_fn = pid_fn+'.response.'+signal
      if File.file?( sig_fn )
        File.delete( sig_fn )
      end
    end
    def self.write_signal_response( pid, pid_fn, signal )
      sig_fn = pid_fn+'.response.'+signal
      File.open(sig_fn,'w') do |file|
        file.write( pid.to_s )
      end
    end
    def self.wait_signal_response( pid, pid_fn, signal, timeout = 10,
                                   debug_pre = false, debug_suf = false,
                                   sleep_secs = 0.2, verbose=nil )
      sig_fn = pid_fn+'.response.'+signal
      verbose = RSence.args[:verbose] if verbose == nil
      begin
        if verbose and debug_pre
          print debug_pre
        end
        File.delete( sig_fn ) if File.exists?( sig_fn )
        status = Process.kill( signal, pid )
        time_out = Time.now + timeout
        until (time_out < Time.now) or File.exists?( sig_fn )
          if verbose
            print "."
            STDOUT.flush
          end
          sleep sleep_secs
        end
        if File.file?( sig_fn )
          sig_pid = File.read( sig_fn ).to_i
          if sig_pid != pid
            puts "Warning, signal PID mismatch. Expected #{pid}, got #{sig_pid}"
          end
          File.delete( sig_fn )
        else
          puts "Warning, signal response file disappeared! Expected #{sig_fn}"
        end
        puts debug_suf if verbose and debug_suf
        return true
      rescue Errno::ESRCH
        return false
      end
    end
  end
end

