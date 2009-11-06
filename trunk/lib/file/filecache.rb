# -* coding: UTF-8 -*-
##   Riassence Framework
 #   Copyright 2007 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##


module Riassence
module Server

=begin
 FileCache scans and stores the ui path for javascript files and 
 (css/html/image) theme files compiled as the result of the client
 SDK's build_client.rb
=end
class FileCache
  
  attr_reader :busy_scanning, :scan_time, :js_cache, :theme_cache, :gz_cache, :client_rev
  
  # A lock flag for preventing different threads from
  # scanning simultaneously in debug mode
  @busy_scanning = false
  
  # Initially, scan.
  def initialize
    @client_rev = 0
    scan_dirs
  end
  
  # Helper method to return the suffix of a file
  def suffix(file_path)
    return '.'+file_path.split('.')[-1]
  end
  
  # Helper method to return the time formatted according to the HTTP RFC
  def httime(time)
    return time.gmtime.strftime('%a, %d %b %Y %H:%M:%S %Z')
  end
  
  # Helper method to read files from the given path and returns an array
  # with the data itself, last-modified time of the file formatted as a
  # http datetime string and the size of the file in bytes
  def getfile(path)
    file = open( path, 'rb' )
    data = file.read
    file.close
    stat = File.stat( path )
    return [data,httime(stat.mtime),stat.size]
  end
  
  ## The main method to load and purge the theme cache
  def scan_dirs
    
    # Just return, if the scan lock is on
    return if @busy_scanning == true
    
    # Set the scan lock
    @busy_scanning = true
    
    # Root path of the compiled js client framework
    ui_path = $config[:client_parts][:js]
    
    @client_rev = File.read( File.join( ui_path, 'built' ) ).strip
    
    # Clean hash for js data and properties
    js_cache = {}
    gz_cache = {}
    
    Dir.entries( ui_path ).each do |path_item|
      file_path = File.join( ui_path, path_item )
      suf = suffix( file_path )
      if suf == '.js'
        file_key = path_item[0..-4]
        js_cache[file_key] = getfile(file_path)
      elsif suf == '.gz'
        file_key = path_item[0..-4]
        gz_cache[file_key] = getfile(file_path)
      end
    end
    
    # Root path of the themes
    themes_path = $config[:client_parts][:themes]
    
    # Clean hash for theme data and properties
    theme_cache = {}
    
    # Scans all themes
    Dir.entries( themes_path ).each do |theme_name|
      
      # Checks, if the theme path is a directory
      theme_path = File.join(themes_path,theme_name)
      is_dir = File.stat(theme_path).directory?
      
      # Skips dirs starting with a dot
      if theme_name[0].chr != '.' and is_dir
        
        # initializes a theme-specific hash for css/html/gfx entries
        unless theme_cache.has_key?(theme_name)
          theme_cache[theme_name] = {'css'=>{},'html'=>{},'gfx'=>{}}
        end
        
        # build sub-paths for css/html/gfx entries
        gfx_path   = File.join(theme_path,'gfx')
        css_path   = File.join(theme_path,'css')
        html_path  = File.join(theme_path,'html')
        
        # Scans for css theme files
        Dir.entries( css_path ).each do |path_item|
          file_path = File.join( css_path, path_item )
          suf = suffix( file_path )
          if suf == '.css' or suf == '.gz'
            theme_cache[theme_name]['css'][path_item] = getfile(file_path)
          end
        end
        
        # Scans for html theme files
        Dir.entries( html_path ).each do |path_item|
          file_path = File.join( html_path, path_item )
          suf = suffix( file_path )
          if suf == '.html' or suf == '.gz'
            theme_cache[theme_name]['html'][path_item] = getfile(file_path)
          end
        end
        
        # Scans for gfx theme files
        Dir.entries( gfx_path ).each do |path_item|
          file_path = File.join( gfx_path, path_item )
          suf = suffix( file_path )
          if ['.jpg','.gif','.swf','.png'].include?(suf)
            theme_cache[theme_name]['gfx'][path_item] = getfile(file_path)
          end
        end
      end
    end
    
    # replaces the current caches with the fresh ones
    @js_cache = js_cache
    @gz_cache = gz_cache
    @theme_cache = theme_cache
    
    # time of last scan:
    @scan_time = Time.now
    
    # release lock
    @busy_scanning = false
    
    puts "New client build found and loaded."
    if ARGV.include?('-say')
      Thread.new do
        system('say "New client build found and loaded."')
      end
    end
  end
  
  # Checks, if the client is newer than the cached
  def check_scan
    
    # special tag file created by build_client.rb
    buildfile_path = File.join($config[:client_parts][:js],'built')
    
    # checks, if the tag file is newer than last time the cache is loaded
    build_time = File.stat(buildfile_path).mtime
    
    # make a new scan, if needed
    if @scan_time < build_time and not @busy_scanning
      scan_dirs
    end
    
  end
  
end

end
end