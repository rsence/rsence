##   RSence
 #   Copyright 2007 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##


# the library path of this plugin
lib_path = File.join( bundle_path, 'lib' )

# The ClientPkgCache class:
require File.join( lib_path, 'client_pkg_cache' )

# The ClientPkgServe module:
require File.join( lib_path, 'client_pkg_serve' )

# The ClientPkgBuild class:
require File.join( lib_path, 'client_pkg_build' )


# @private The ClientPkgPlugin builds and serves the client packages. It's not intended to be a part of the public API at this time.
class ClientPkgPlugin < Servlet
  
  include ClientPkgServe
  
  class BuildLogger
    def initialize( log_path )
      @last_time = Time.now
      @log_path = log_path
      @log_file = nil
    end
    def log( str )
      if RSence.args[:verbose] or not RSence.args[:suppress_build_messages]
        puts str
        return
      else
        if @last_time < Time.now - 30
          @last_time = Time.now
          @log_file.write( %{--- #{@last_time.strftime("%Y-%m-%d %H:%M:%S")} ---\n} )
        end
        @log_file.write( "#{str}\n" )
        @log_file.flush
      end
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
  
  def rebuild_client
    while @build_busy
      puts "-- build busy, sleeping.. --"
      sleep 0.1
    end
    @build_busy = true
    @last_change = Time.now.to_i
    @client_build.setup_dirs
    @client_build.run
    @client_cache = ClientPkgCache.new
    @client_cache.set_cache( @client_build.js, @client_build.gz, @client_build.themes )
    RSence.plugin_manager.incr! if RSence.config[:transporter_conf][:client_autoreload]
    @build_busy = false
  end
  
  def ready?
    return (not @build_busy)
  end

  def open
    if not @thr and RSence.args[:autoupdate]
      @thr = Thread.new do
        Thread.pass
        while true
          begin
            if @client_build.bundle_changes( @last_change )
              rebuild_client
              puts "Autobuilt."
              if RSence.args[:say]
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
  
  def add_src_dir( src_dir ); @client_build.add_src_dir( src_dir ); end
  def add_src_dirs( src_dirs ); @client_build.add_src_dirs( src_dirs ); end
  def del_src_dir( src_dir ); @client_build.del_src_dir( src_dir ); end
  def del_src_dirs( src_dirs ); @client_build.del_src_dirs( src_dirs ); end
  
  def add_theme( theme_name ); @client_build.add_theme( theme_name ); end
  def add_themes( theme_names ); @client_build.add_themes( theme_names ); end
  def del_theme( theme_name ); @client_build.del_theme( theme_name ); end
  def del_themes( theme_names ); @client_build.del_themes( theme_names ); end
  
  def add_package( pkg_name, pkg_items ); @client_build.add_package( pkg_name, pkg_items ); end
  def add_packages( packages ); @client_build.add_packages( packages ); end
  def del_package( pkg_name ); @client_build.del_package( pkg_name ); end
  def del_packages( packages ); @client_build.del_packages( packages ); end
  
  def add_reserved_name( reserved_name ); @client_build.add_reserved_name( reserved_name ); end
  def add_reserved_names( reserved_names ); @client_build.add_reserved_names( reserved_names ); end
  def del_reserved_name( reserved_name ); @client_build.del_reserved_name( reserved_name ); end
  def del_reserved_names( reserved_names ); @client_build.del_reserved_names( reserved_names ); end
  
  def add_gfx_format( gfx_format_name ); @client_build.add_gfx_format( gfx_format_name ); end
  def add_gfx_formats( gfx_format_names ); @client_build.add_gfx_formats( gfx_format_names ); end
  def del_gfx_format( gfx_format_name ); @client_build.del_gfx_format( gfx_format_name ); end
  def del_gfx_formats( gfx_format_names ); @client_build.del_gfx_formats( gfx_format_names ); end
  
  def client_build; @client_build; end
  
  def client_cache; @client_cache; end
  
  def close
    if @thr
      @thr.kill
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

  def coffee( src )
    return @client_build.coffee( src )
  end
  
  def init
    
    @thr = false
    
    @build_logger = BuildLogger.new( File.join(RSence.args[:env_path],'log','build_log') )
    @build_logger.open
    
    @client_build = ClientPkgBuild.new( RSence.config[:client_pkg], @build_logger )
    @client_cache = ClientPkgCache.new
    
    @build_busy = false
    rebuild_client
    
  end
  
end


