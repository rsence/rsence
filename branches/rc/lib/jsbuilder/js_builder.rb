# -* coding: UTF-8 -*-
###
  # Riassence Core -- http://rsence.org/
  #
  # Copyright (C) 2009 Juha-Jarmo Heinonen <jjh@riassence.com>
  #
  # This file is part of Riassence Core.
  #
  # Riassence Core is free software: you can redistribute it and/or modify
  # it under the terms of the GNU General Public License as published by
  # the Free Software Foundation, either version 3 of the License, or
  # (at your option) any later version.
  #
  # Riassence Core is distributed in the hope that it will be useful,
  # but WITHOUT ANY WARRANTY; without even the implied warranty of
  # MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  # GNU General Public License for more details.
  #
  # You should have received a copy of the GNU General Public License
  # along with this program.  If not, see <http://www.gnu.org/licenses/>.
  #
  ###

module Riassence
module Client

require 'jsbuilder/jsmin/jsmin'
require 'jsbuilder/jscompress/jscompress'
require 'jsbuilder/html_min/html_min'

require 'util/gzstring'

class JSBuilder
  def setup_dirs
    
    # make sure the src_dirs contain only absolute paths.
    # if not, use current working dir as a logical prefix
    @src_dirs.map! do |src_dir|
      if src_dir[0].chr == '/'
        src_dir
      else
        File.join( File.expand_path( Dir.pwd ), src_dir )
      end
    end
    
    @src_dirs.each do |src_dir|
      # exit with error if the src dir does not exist
      unless File.exist?( src_dir )
        puts "JSBuilder ERROR: the source directory #{src_dir.inspect} does not exist."
        puts "abort."
        exit
      end
      
    end
    
    # make sure dst_dir is a full path.
    # if not, use current working dir as a logical prefix
    @dst_dir = File.join( File.expand_path( Dir.pwd ), @dst_dir ) unless @dst_dir[0].chr == '/'
    
    # create the dst dir if it doesn't exist yet
    Dir.mkdir( @dst_dir ) unless File.exist?( @dst_dir )
    
    # destination dir sub-parts
    @js_dst_dir = File.join( @dst_dir, 'js' )
    @themes_dst_dir = File.join( @dst_dir, 'themes' )
    
    # ensures the js and themes destination dirs exist
    Dir.mkdir( @js_dst_dir ) unless File.exist?( @js_dst_dir )
    Dir.mkdir( @themes_dst_dir ) unless File.exist?( @themes_dst_dir )
    
    # ensures the destination directories of various theme parts exist
    @theme_names.each do |theme_name|
      theme_dst_dir = File.join( @themes_dst_dir, theme_name )
      Dir.mkdir( theme_dst_dir ) unless File.exist?( theme_dst_dir )
      css_dst_dir = File.join( theme_dst_dir, 'css' )
      Dir.mkdir( css_dst_dir ) unless File.exist?( css_dst_dir )
      html_dst_dir = File.join( theme_dst_dir, 'html' )
      Dir.mkdir( html_dst_dir ) unless File.exist?( html_dst_dir )
      gfx_dst_dir = File.join( theme_dst_dir, 'gfx' )
      Dir.mkdir( gfx_dst_dir ) unless File.exist?( gfx_dst_dir )
    end
    
  end
  
  
  def initialize( src_dirs, dst_dir, theme_names, pkg_info, packages, reserved_names )
    
    # src_dirs is supposed to be an array of js source directories
    @src_dirs = src_dirs
    
    # dst_dir is supposed to be the path to the build destination
    @dst_dir = dst_dir
    
    # theme_names is supposed to be an array of theme names to include in the build
    @theme_names = theme_names
    
    # pkg_info is supposed to be a hash of js package name definitions by pkg_name
    @pkg_info = pkg_info
    
    # packages is supposed to be a list of js package name definitions to include
    @packages = packages
    
    # reserved_names is supposed to be a list of reserved words (words that shouldn't be compressed)
    @reserved_names = reserved_names
    
    # makes sure the specified dirs are ok
    setup_dirs
    
    # JSMin removes js white-space (makes the source shorter)
    @jsmin = JSMin.new
    
    # JSCompress compresses js by "obfuscating" 
    # all variables beginning with an underscore "_",
    # eg. "_this" -> "_0", except
    # those specified in the @reserved_names array
    @jscompress = JSCompress.new( @reserved_names )
    
    # HTMLMin compresses css and html by removing whitespace
    @html_min = HTMLMin.new
    
    # contains a list of theme gfx extensions allowed
    @gfx_formats = ['.jpg','.gif','.png','.swf']
    
    # contains a list of js names found (by default all names beginning with an underscore; '_' )
    @hints = []
    
    # compression strategy ( fastest vs smallest )
    #@gz_strategy = Zlib::BEST_SPEED
    @gz_strategy = Zlib::BEST_COMPRESSION
    
  end
  
  def save_file( outp_path, outp_data )
    outp_file = open( outp_path, 'wb' )
    outp_file.write( outp_data )
    outp_file.close
  end
  
  def read_file( path )
    filehandle = open( path, 'rb' )
    filedata   = filehandle.read
    filehandle.close
    return filedata
  end
  
  def cp_file( src_path, dst_path )
    file_data = read_file( src_path )
    save_file( dst_path, file_data )
    return file_data.size
  end
  
  def cp_html( src_path, dst_path )
    if $_NO_WHITESPACE_REMOVAL
      html_data = read_file( src_path )
    else
      html_data = @html_min.minimize( read_file( src_path ) )
    end
    save_file( dst_path, html_data )
    unless $_NO_GZIP
      gz_html = gzip_string( html_data )
      save_file( dst_path+'.gz', gz_html )
    end
    return html_data
  end
  alias cp_css cp_html
  
  def gzip_string( string )
    gz_string = GZString.new('')
    gz_writer = Zlib::GzipWriter.new( gz_string, @gz_strategy )
    gz_writer.write( string )
    gz_writer.close
    return gz_string
  end
  
  def gzip_file( src, dst )
    gz_data = gzip_string( read_file( src ) )
    save_file( dst, gz_data )
  end
  
  def cp_gfx( src_path_theme, tgt_path_theme )
    
    gfx_size = 0
    
    src_files_gfx = File.join( src_path_theme, 'gfx' )
    
    if File.exist?( src_files_gfx )
      Dir.entries( src_files_gfx ).each do |src_gfx_filename|
        src_file_gfx = File.join( src_files_gfx, src_gfx_filename )
        if @gfx_formats.include?( src_file_gfx[-4..-1] )
          tgt_file_gfx = File.join( tgt_path_theme, 'gfx', src_gfx_filename )
          if File.exist?( src_file_gfx ) and File.exist?( tgt_file_gfx )
            File.delete( tgt_file_gfx )
          end
          gfx_size += cp_file( src_file_gfx, tgt_file_gfx )
        end
      end
    end
    
    return gfx_size
    
  end
  
  # processes theme-related files
  def cp_theme( bundle_dir, bundle_name )
    
    @theme_names.each do |theme_name|
      
      @theme_sizes[ theme_name ] = {
        :css  => [0,0],
        :html => [0,0],
        :gfx  => 0
      } unless @theme_sizes.has_key?( theme_name )
      
      tgt_path_theme = File.join( @themes_dst_dir, theme_name )
      src_path_theme = File.join( bundle_dir, 'themes', theme_name )
      
      tgt_file_css = File.join( tgt_path_theme, 'css', bundle_name+'.css' )
      src_file_css = File.join( src_path_theme, 'css', bundle_name+'.css' )
      
      tgt_file_html = File.join( tgt_path_theme, 'html', bundle_name+'.html' )
      src_file_html = File.join( src_path_theme, 'html', bundle_name+'.html' )
      
      if File.exist?( src_file_css )
        css_data = cp_css( src_file_css, tgt_file_css )
        @theme_sizes[   theme_name ][:css][0] += File.stat( src_file_css ).size
        @theme_sizes[   theme_name ][:css][1] += css_data.size
        @css_by_theme[  theme_name ][ bundle_name ] = css_data
      end
      if File.exist?( src_file_html )
        html_data = cp_html( src_file_html, tgt_file_html )
        @theme_sizes[   theme_name ][:html][0] += File.stat( src_file_html ).size
        @theme_sizes[   theme_name ][:html][1] += html_data.size
        @html_by_theme[ theme_name ][ bundle_name ] = html_data
      end
      
      gfx_size = cp_gfx( src_path_theme, tgt_path_theme )
      @theme_sizes[   theme_name ][:gfx] += gfx_size
      
    end
  end
  
  def add_bundle( bundle_name, bundle_path, entries )
    has_themes = entries.include?( 'themes' ) and File.directory?( File.join( bundle_path, 'themes' ) )
    if @bundles_found.has_key?( bundle_name )
      puts "JSBuilder ERROR: duplicate bundles with the name #{bundle_name.inspect} found."
      puts "    The first encountered is #{@bundles_found[ bundle_name ].inspect}"
      puts "    The second encountered is #{bundle_path.inspect}"
      puts "abort."
      exit
    end
    unless @destinations.include?( bundle_name )
      warn "JSBuilder WARNING: bundle name #{bundle_name.inspect} does not belong to any package, skipping.." if ARGV.include?('-d')
      return
    end
    js_data = read_file( File.join( bundle_path, bundle_name+'.js' ) )
    @bundles_found[ bundle_name ] = {
      :path => bundle_path,
      :js_data => js_data,
      :js_size => js_data.size,
      :has_themes => has_themes
    }
    if has_themes
      cp_theme( bundle_path, bundle_name )
    end
  end
  
  def find_bundles( src_dir )
    # makes sure the src_dir exists and is a directory
    if File.exist?( src_dir ) and File.directory?( src_dir )
      # array of item names in dir
      dir_entries = Dir.entries( src_dir )
      # the name of src_dir (src_dir itself is a full path)
      dir_name    = File.split( src_dir )[1]
      # bundles are defined as directories with a js file of the same name plus the 'js.inc' tagfile
      is_bundle   = dir_entries.include?( 'js.inc' ) and dir_entries.include?( dir_name+'.js' )
      
      # if src_dir is detected as a bundle, handle it in add_bundle
      if is_bundle
        add_bundle( dir_name, src_dir, dir_entries )
      
      # otherwise, descend into the sub-directory:
      else
        dir_entries.each do | dir_entry |
          # don't descend into themes or hidden dirs:
          next if dir_entry[0].chr == '.' or dir_entry == 'themes'
          sub_dir = File.join( src_dir, dir_entry )
          find_bundles( sub_dir ) if File.directory?( sub_dir )
        end
      end
    end
    
  end
  
  def find_newer( src_dir, newer_than )
    if File.exist?( src_dir ) and File.directory?( src_dir )
      Dir.entries( src_dir ).each do | dir_entry |
        next if dir_entry[0].chr == '.'
        sub_dir = File.join( src_dir, dir_entry )
        if File.directory?( sub_dir )
          return true if find_newer( sub_dir, newer_than )
        else
          if newer_than < File.stat( sub_dir ).mtime.to_i
            puts "File changed: #{sub_dir}"
            return true
          end
        end
      end
    end
    return false
  end
  
  def bundle_changes( newer_than )
    @bundles_found.each do | bundle_name, bundle_info |
      bundle_path = bundle_info[:path]
      is_newer = find_newer( bundle_path, newer_than )
      return true if is_newer
    end
    return false
  end
  
  def autorun
    while true
      newest = read_file( File.join( @js_dst_dir, 'built' ) ).to_i
      puts "waiting for changes..."
      until bundle_changes( newest )
        sleep 3
      end
      flush
      run
      `say "Autobuild complete!"` if ARGV.include?('-say')
    end
  end
  
  def build_indexes
    indexes = []
    @destination_files.each_key do | package_name |
      indexes.push( @destination_files[ package_name ] )
    end
    @jscompress.build_indexes( indexes.join("\n") )
  end
  
  def do_compress
    build_indexes
    minimize_data
  end
  
  def minimize_data
    unless ARGV.include? '-nv'
      puts  "Package.......................:   Size |  Compressed |  GZIPed"
      puts  "                              :        |             |"
    end
    @destination_files.each_key do | package_name |
      jsc_path = File.join( @js_dst_dir, package_name+'.js')
      
      jsc_data = @destination_files[package_name]
      
      unless DEBUG_MODE
        unless $_NO_OBFUSCATION
          jsc_data = @jsmin.convert( jsc_data )
        end
        unless $_NO_WHITESPACE_REMOVAL
          jsc_data = pre_convert( jsc_data )
        end
      end
      
      save_file( jsc_path, jsc_data )
      
      unless $_NO_GZIP
        gz_path = jsc_path
        gz_path[-3..-1] = '.gz'
        gz_data = gzip_string( jsc_data )
        save_file( gz_path, gz_data )
      end
      
      unless ARGV.include? '-nv'
        js_size  = @destination_files[ package_name ].size
        jsc_size = jsc_data.size
        
        if $_NO_GZIP
          gz_size  = -1
        else
          gz_size  = gz_data.size
        end
        
        print_stat( package_name, js_size, jsc_size, gz_size )
      end
      
    end
  end
  
  def print_stat( package_name, dst_size, jsc_size, gz_size )
    percent = 'n/a'
    if dst_size > 0
      percent1 = (100*(jsc_size/dst_size.to_f)).to_i.to_s + '%'
      percent2 = (100*(gz_size/dst_size.to_f)).to_i.to_s + '%'
    else
      percent1 = '-'
      percent2 = '-'
    end
    puts  "#{package_name.ljust(30).gsub(' ','.')}: #{dst_size.to_s.rjust(6)} | #{jsc_size.to_s.rjust(6)} #{percent1.ljust(4)} | #{gz_size.to_s.rjust(6)} #{percent2.ljust(4)}"
  end
  
  def pre_convert(jsc_data)
    return @jscompress.compress( jsc_data )
  end
  
  # returns html theme piece for special case optimization
  def html( theme_name ); @html_by_theme[ theme_name ]; end
  def css(  theme_name ); @css_by_theme[  theme_name ]; end
  
  def run
    
    # hash of bundles per bundle name per theme; @html_by_theme[theme_name][bundle_name] = bundle_data
    @html_by_theme = {}
    @css_by_theme  = {}
    @theme_names.each do | theme_name |
      @html_by_theme[ theme_name ] = {}
      @css_by_theme[  theme_name ] = {}
    end
    
    @theme_sizes = {}
    
    # hash of bundle -> package mappings (reverse @pkg_info)
    @destinations = {}
    @packages.each do | package_name |
      @pkg_info[ package_name ].each do |bundle_name|
        @destinations[ bundle_name ] = [] unless @destinations.include?( bundle_name )
        @destinations[ bundle_name ].push( package_name )
      end
    end
    
    @bundles_found = {} # populated by add_bundle
    @conversion_stats = {} # populated by add_hints
    @src_dirs.each do | src_dir |
      find_bundles( src_dir )
    end
    
    @destination_files = {} # rename to package_products
    @packages.each do |package_name|
      @pkg_info[package_name].each do |bundle_name|
        if @bundles_found.has_key?( bundle_name )
          @destination_files[ package_name ] = [] unless @destination_files.has_key?( package_name )
          @destination_files[ package_name ].push( @bundles_found[bundle_name][:js_data] )
        end
      end
    end
    @destination_files.each do | package_name, package_array |
      package_data = package_array.join('')
      @destination_files[ package_name ] = package_data
    end
    
    do_compress()
    build_themes()
    
    save_file( File.join( @js_dst_dir, 'built' ), Time.now.to_i.to_s )
    
  end
  
  def build_themes
    unless ARGV.include? '-nv'
      puts
      puts  "Theme name and part...........:   Orig |  Compressed |  GZIPed"
      puts  "                              :        |             |"
    end
    # compile "all-in-one" css and html resources
    @theme_names.each do |theme_name|
      
      
      html_templates = @html_by_theme[ theme_name ]
      css_templates  = @css_by_theme[  theme_name ]
      
      html2js_themes = []
      
      theme_css_dir = File.join( @themes_dst_dir, theme_name, 'css' )
      
      html_templates.each do |tmpl_name,tmpl_html|
        html2js_themes.push( "#{tmpl_name}:#{tmpl_html.to_json}" )
      end
      
      theme_html_js_arr = []
      theme_html_js_arr.push "HThemeManager._tmplCache[#{theme_name.to_json}]={" + html2js_themes.join(',') + "};"
      theme_html_js_arr.push "HNoComponentCSS.push(#{theme_name.to_json});"
      theme_html_js_arr.push "HNoCommonCSS.push(#{theme_name.to_json});"
      theme_html_js_arr.push "HThemeManager.loadCSS(HThemeManager._cssUrl( #{theme_name.to_json}, #{(theme_name+'_theme').to_json}, HThemeManager.themePath, null ));"
      
      theme_html_js = pre_convert( theme_html_js_arr.join('') )
      
      theme_html_js_path = File.join( @js_dst_dir, theme_name+'_theme.js' )
      
      save_file( theme_html_js_path, theme_html_js )
      
      unless $_NO_GZIP
        theme_html_gz_path = theme_html_js_path
        theme_html_gz_path[-3..-1] = '.gz'
        
        theme_html_gz = gzip_string( theme_html_js )
        
        save_file( theme_html_gz_path, theme_html_gz )
      end
      
      unless ARGV.include? '-nv'
        print_stat( "#{theme_name}/html", @theme_sizes[theme_name][:html][0], @theme_sizes[theme_name][:html][1], theme_html_gz.size )
      end
      
      theme_css_path = File.join( theme_css_dir, theme_name+'_theme.css' )
      
      theme_css_template_data = css_templates.values.join("\n")
      
      save_file( theme_css_path, theme_css_template_data )
      
      unless $_NO_GZIP
        theme_css_path_gz = theme_css_path+'.gz'
        theme_css_template_data_gz = gzip_string( theme_css_template_data )
        save_file( theme_css_path_gz, theme_css_template_data_gz )
      end
      
      unless ARGV.include? '-nv'
        print_stat( "#{theme_name}/css", @theme_sizes[theme_name][:css][0], @theme_sizes[theme_name][:css][1], theme_css_template_data_gz.size )
        print_stat( "#{theme_name}/gfx", @theme_sizes[theme_name][:gfx], 0, 0 )
      end
      
    end
    
  end
  
  def flush
    @jscompress.free_indexes
  end
  
end

# end of the module blocks:
end
end

JSBuilder = Riassence::Client::JSBuilder


