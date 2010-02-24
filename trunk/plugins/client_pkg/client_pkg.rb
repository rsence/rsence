##   Riassence Framework
 #   Copyright 2007 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##

class ClientPkg < Servlet
  
  # the library path of this plugin
  lib_path = File.join( PluginManager.curr_plugin_path, 'lib' )
  
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
          if @client_build.bundle_changes( @last_change )
            @last_change = Time.now
            @client_build.run
            @client_cache.set_cache( @client_build.js, @client_build.gz, @client_build.themes )
            `say "Autobuild complete!"` if ARGV.include?('-say')
          end
          sleep 3
        end
      end
    end
  end
  
  def close
    if @thr
      @thr.kill!
      @thr = false
    end
    @build_logger.close
  end
  
  def init
    
    @thr = false
    
    @build_logger = BuildLogger.new( File.join(@path,'log','build_log') )
    @build_logger.open
    
    @client_build = ClientPkgBuild.new( $config[:client_pkg], @build_logger )
    @last_change = Time.new
    @client_build.run
    
    @client_cache = ClientPkgCache.new
    @client_cache.set_cache( @client_build.js, @client_build.gz, @client_build.themes )
    
    # Used by:
    #  - plugins/index_html/index_html.rb
    $FILECACHE = @client_cache
  end
  
end

client_pkg = ClientPkg.new

# Used by:
#  - plugins/index_html/index_html.rb
$FILESERVE = client_pkg


