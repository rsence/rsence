##   RSence
 #   Copyright 2007 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##


=begin
 FileCache scans and stores the ui path for javascript files and 
 (css/html/image) theme files compiled as the result of the client
 SDK's build_client.rb
=end
class ClientPkgCache
  
  attr_reader :scan_time, :js_cache, :theme_cache, :gz_cache, :client_rev, :last_modified
  
  # A lock flag for preventing different threads from
  # scanning simultaneously in debug mode
  @busy_scanning = false
  
  # Initially, scan.
  def initialize
    @client_rev = 0
    # scan_dirs
  end
  
  # Helper method to return the suffix of a file
  def suffix(file_path)
    return '.'+file_path.split('.')[-1]
  end
  
  # Helper method to return the time formatted according to the HTTP RFC
  def httime(time)
    return time.gmtime.strftime('%a, %d %b %Y %H:%M:%S %Z')
  end
  
  def set_cache( js, gz, themes )
    @js_cache    = js
    @gz_cache    = gz
    @theme_cache = themes
    time_now = Time.now
    @client_rev  = time_now.to_i.to_s( 36 )
    @last_modified = httime( time_now )
  end
  
end


