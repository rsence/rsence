##   Riassence Framework
 #   Copyright 2007 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##

class ClientPkg < Servlet
  
  # the library path of this plugin
  lib_path = File.join( @@bundle_path, 'lib' )
  
  # The ClientPkgCache class:
  require File.join(lib_path,'client_pkg_cache')
  
  # The ClientPkgServe module:
  require File.join(lib_path,'client_pkg_serve')
  include ClientPkgServe
  
  # The ClientPkgBuild class:
  require File.join(lib_path,'client_pkg_build')
  
  class BuildLogger
    def initialize( log_path )
      @last_time = Time.now
      @log_path = log_path
      @log_file = nil
    end
    def log( str )
      if @last_time < Time.now - 30
        @last_time = Time.now
        @log_file.write( %{--- #{@last_time.strftime("%Y-%m-%d %H:%M:%S")} ---\n} )
      end
      @log_file.write( "#{str}\n" )
      @log_file.flush
    end
    def open
      return if @log_file
      @log_file = File.open( @log_path, 'a' )
    end
    def close
      @log_file.close
      @log_file = nil
    end
  end
  
  def open
    if not @thr and $DEBUG_MODE
      @thr = Thread.new do
        Thread.pass
        while true
          begin
            if @client_build.bundle_changes( @last_change )
              @last_change = Time.now.to_i
              @client_build.run
              @client_cache.set_cache( @client_build.js, @client_build.gz, @client_build.themes )
              puts "Autobuilt."
              if ARGV.include?('-say')
                Thread.new do
                  Thread.pass
                  system('say "Autobuilt."')
                end
              end
            end
          rescue => e
            warn e.inspect
          end
          sleep 3
        end
      end
    end
    
  end
  
  def client_build; @client_build; end
  
  def client_cache; @client_cache; end
  
  def close
    if @thr
      @thr.kill!
      @thr = false
    end
    @client_build.flush
    @client_build = nil
    @client_cache = nil
    @build_logger.close
  end
  
  def squeeze( js )
    return @client_build.squeeze( js )
  end
  
  def init
    
    @thr = false
    
    @build_logger = BuildLogger.new( File.join(@path,'log','build_log') )
    @build_logger.open
    
    @client_build = ClientPkgBuild.new( ::Riassence::Server.config[:client_pkg], @build_logger )
    @last_change = Time.new.to_i
    @client_build.run
    
    @client_cache = ClientPkgCache.new
    @client_cache.set_cache( @client_build.js, @client_build.gz, @client_build.themes )
    
  end
  
end

ClientPkg.new

