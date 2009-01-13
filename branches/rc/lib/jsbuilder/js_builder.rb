# -* coding: UTF-8 -*-
###
  # Himle Server -- http://himle.org/
  #
  # Copyright (C) 2009 Juha-Jarmo Heinonen
  #
  # This file is part of Himle Server.
  #
  # Himle Server is free software: you can redistribute it and/or modify
  # it under the terms of the GNU General Public License as published by
  # the Free Software Foundation, either version 3 of the License, or
  # (at your option) any later version.
  #
  # Himle server is distributed in the hope that it will be useful,
  # but WITHOUT ANY WARRANTY; without even the implied warranty of
  # MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  # GNU General Public License for more details.
  #
  # You should have received a copy of the GNU General Public License
  # along with this program.  If not, see <http://www.gnu.org/licenses/>.
  #
  ###

module Himle
module Client

require 'jsbuilder/jsmin/jsmin'
require 'jsbuilder/jscompress/jscompress'

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
  
  
  def initialize( src_dirs=false, dst_dir=false,
                  theme_names=false, pkg_info=false,
                  packages=false, reserved_names=false )
    
    @use_jscompress = true #ARGV.include?('--jscompress')
    
    # src_dirs is supposed to be an array of js source directories
    if src_dirs
      @src_dirs = src_dirs
    else
      warn "JSBuilder WARNING: no src_dir specified, instead trying: $_SRC_PATH: #{$_SRC_PATH.inspect}"
      @src_dirs = $_SRC_PATH
    end
    
    # dst_dir is supposed to be the path to the build destination
    if dst_dir
      @dst_dir = dst_dir
    else
      warn "JSBuilder WARNING: no dst_dir specified, instead trying: $_REL_PATH: #{$_REL_PATH.inspect}"
      @dst_dir = $_REL_PATH
    end
    
    # theme_names is supposed to be an array of theme names to include in the build
    if theme_names
      @theme_names = theme_names
    else
      warn "JSBuilder WARNING: no theme_names specified, instead trying: $_THEMES: #{$_THEMES.inspect}"
      @theme_names = $_THEMES
    end
    
    # pkg_info is supposed to be a hash of js package name definitions by pkg_name
    if pkg_info
      @pkg_info = pkg_info
    else
      warn "JSBuilder WARNING: no pkg_info specified, instead trying: $_PACKAGES: #{$_PACKAGES.inspect}"
      @pkg_info = $_PACKAGES
    end
    
    # packages is supposed to be a list of js package name definitions to include
    if packages
      @packages = packages
    else
      warn "JSBuilder WARNING: no packages specified, instead trying: $_PACKAGE_NAMES: #{$_PACKAGE_NAMES.inspect}"
      @packages = $_PACKAGE_NAMES
    end
    
    # reserved_names is supposed to be a list of reserved words (words that shouldn't be compressed)
    if reserved_names
      @reserved_names = reserved_names
    else
      warn "JSBuilder WARNING: no reserved_names specified, instead trying: $_RESERVED_NAMES: #{$_RESERVED_NAMES.inspect}"
      @reserved_names = $_RESERVED_NAMES
    end
    
    # makes sure the specified dirs are ok
    setup_dirs
    
    # constructs the jsmin instance
    @jsmin = JSMin.new
    
    # constructs the jscompress instance
    @jscompress = JSCompress.new( @reserved_names )
    
    # contains a list of js names found (by default all names beginning with an underscore; '_' )
    @hints = []
    
  end
  
  def save_file(outp_path,outp_data)
    outp_file = open(outp_path,'wb')
    outp_file.write(outp_data)
    outp_file.close
  end
  def read_file(path)
    filehandle = open(path,'rb')
    filedata   = filehandle.read
    filehandle.close
    return filedata
  end
  
  ### REITERATE!
  def cp_file(src_path,dst_path)
    if RUBY_PLATFORM.include? "mswin32"
      `copy #{src_path.gsub('/',"\\")} #{dst_path.gsub('/',"\\")}`
    else
      save_file(dst_path,read_file(src_path))
    end
  end
  
  ### REITERATE!
  def cp_css_tidy_file(src_path,dst_path)
    cp_file(src_path,dst_path)
    gzip_file(dst_path,dst_path+'.gz') unless $_NO_GZIP
  end
  
  ### REITERATE!
  def cp_html_tidy_file(src_path,dst_path)
    if RUBY_PLATFORM.include? "mswin32"
      save_file(dst_path,read_file(src_path))
    else
      save_file(dst_path,`#{HTMLTIDY} "#{src_path}"`.gsub("\n",""))
    end
    gzip_file(dst_path,dst_path+'.gz') unless $_NO_GZIP
  end
  
  ### REITERATE!
  def gzip_file(src,dst)
    if RUBY_PLATFORM.include? "mswin32"
      `#{GZIP} -c #{src.gsub('/',"\\")} > #{dst.gsub('/',"\\")}`
    else
      gz_data = `#{GZIP} -c #{src}`
      save_file(dst,gz_data)
    end
  end
  
  # processes theme-related files
  def cp_theme(bundle_dir,bundle_name)
    
    @theme_names.each do |theme_name|
      
      tgt_path_theme = File.join( @dst_dir, 'themes', theme_name )
      src_path_theme = File.join( bundle_dir, 'themes', theme_name )
      
      tgt_file_css = File.join( tgt_path_theme, 'css', bundle_name+'.css' )
      src_file_css = File.join( src_path_theme, 'css', bundle_name+'.css' )
      
      tgt_file_html = File.join( tgt_path_theme, 'html', bundle_name+'.html' )
      src_file_html = File.join( src_path_theme, 'html', bundle_name+'.html' )
      
      if File.exist?( src_file_css )
        cp_css_tidy_file(src_file_css,tgt_file_css)
      end
      
      if File.exist?( src_file_html )
        cp_html_tidy_file( src_file_html, tgt_file_html )
        @html_by_theme[theme_name][bundle_name] = read_file(tgt_file_html)
      end
      
      src_files_gfx = File.join( src_path_theme, 'gfx' )
      
      if File.exist?(src_files_gfx)
        Dir.entries( src_files_gfx ).each do |src_gfx_filename|
          src_file_gfx = File.join( src_files_gfx, src_gfx_filename )
          if ['.jpg','.gif','.png','.swf'].include?(src_file_gfx[-4..-1])
            tgt_file_gfx = File.join( tgt_path_theme, 'gfx', src_gfx_filename )
            if File.exist?( src_file_gfx ) and File.exist?( tgt_file_gfx )
              File.delete( tgt_file_gfx )
            end
            cp_file( src_file_gfx, tgt_file_gfx )
          end
        end
      end
    end
  end
  
  def add_hints( js_data )
    js_data.gsub(/[^a-zA-Z0-9_](_[a-zA-Z0-9_]+?)[^a-zA-Z0-9_]/) do
      unless @reserved_names.include?( $1 )
        @hints.push( $1 ) unless @hints.include?( $1 )
        @conversion_stats[ $1 ] = 0 unless @conversion_stats.include?( $1 )
        @conversion_stats[ $1 ] += 1
      end
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
      warn "JSBuilder WARNING: bundle name #{bundle_name.inspect} does not belong to any package, skipping.."
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
    unless @use_jscompress
      add_hints( js_data ) unless DEBUG_MODE or $_NO_OBFUSCATION
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
          next if dir_entry[0].chr == '.'
          sub_dir = File.join( src_dir, dir_entry )
          find_bundles( sub_dir ) if File.directory?( sub_dir )
        end
      end
    end
    
  end
  
  ## REITERATE!
  def conv_ids
    conv_tmp = []
    # 0..9
    48.upto(57)  {|val|conv_tmp.push(val.chr)}
    # a..z
    97.upto(122) {|val|conv_tmp.push(val.chr)}
    # A..Z
    65.upto(90)  {|val|conv_tmp.push(val.chr)}
    # double them up..
    @conv_ids  = []
    @conv_used = {}
    conv_tmp.each do |pri_chr|
      @conv_ids.push($_REPL_PREFIX+pri_chr)
    end
    conv_tmp.each do |pri_chr|
      conv_tmp.each do |sec_chr|
        @conv_ids.push($_REPL_PREFIX+pri_chr+sec_chr)
      end
    end
    # well, 3906 conv_ids should be enough for everyone ;)
  end
  
  ## REITERATE!
  def mkconvcount
    conv_amt_name = {}
    @conversion_stats.each do |conv_name,conv_amt|
      conv_amt_name[conv_amt] = [] unless conv_amt_name.has_key?(conv_amt)
      conv_amt_name[conv_amt].push(conv_name)
    end
    conv_amt_name.keys.sort.reverse.each do |conv_amt|
      conv_amt_name[conv_amt].sort.each do |conv_name|
        @conv_used[conv_name] = @conv_ids.shift
      end
    end
  end
  
  def build_indexes
    @destination_files.each_key do | package_name |
      @jscompress.build_indexes( @destination_files[ package_name ].join('') )
    end
  end
  
  ## REITERATE!
  def do_compress
    @conv_used = {}
    if @use_jscompress
      build_indexes
    else
      conv_ids()           # make short unique strings to be used as replacement patterns
      mkconvcount()        # calculate the order of occurrences (biggest first)
    end
    minimize_data()      # do the actual compression
  end
  
  ## REITERATE!
  def minimize_data
    puts  "Package.......................:   Size |  Compressed |  GZIPed"
    @destination_files.each_key do | package_name |
      jsc_path = File.join( @js_dst_dir, package_name+'.js')
      if DEBUG_MODE
        jsc_data = @destination_files[package_name].join('')
      elsif $_NO_OBFUSCATION and not $_NO_WHITESPACE_REMOVAL
        jsc_data = @jsmin.convert(@destination_files[package_name].join(''))
      else
        if $_NO_WHITESPACE_REMOVAL
          jsc_data = pre_convert(@destination_files[package_name].join(''))
        else
          jsc_data = pre_convert( @jsmin.convert( @destination_files[package_name].join('') ) )
        end
      end
      
      save_file(jsc_path,jsc_data)
      
      unless $_NO_GZIP
        gz_path = jsc_path.gsub('.js','.gz')
        gzip_file(jsc_path,gz_path)
      end
      
      print_stat( package_name )
    end
  end
  
  ### REITERATE!
  def print_stat( package_name )
    jsc_path = File.join( @js_dst_dir, package_name+'.js' )
    gz_path = File.join( @js_dst_dir, package_name+'.gz' )
    dst_size = @destination_files[package_name].join.size
    jsc_size = File.stat(jsc_path).size
    if $_NO_GZIP
      gz_size  = -1
    else
      gz_size  = File.stat( gz_path).size
    end
    percent = 'n/a'
    if dst_size > 0
      percent1 = (100*(jsc_size/dst_size.to_f)).to_i.to_s + '%'
      percent2 = (100*(gz_size/dst_size.to_f)).to_i.to_s + '%'
    else
      percent1 = '-'
      percent2 = '-'
    end
    jsc_name = jsc_path.split('/')[-1]
    puts  "#{jsc_name.ljust(30).gsub(' ','.')}: #{dst_size.to_s.rjust(6)} | #{jsc_size.to_s.rjust(6)} #{percent1.ljust(4)} | #{gz_size.to_s.rjust(6)} #{percent2.ljust(4)}"
  end
  
  ### REITERATE!
  def pre_convert(jsc_data)
    return @jscompress.compress( jsc_data ) if @use_jscompress
    # replace names in conv in the most common -> least common order of conv_ids
    @conv_used.keys.each do |conv_from|
      conv_to = @conv_used[conv_from]
      jsc_data.gsub!(eval("/\\b(#{conv_from})\\b/"),conv_to)
    end
    jsc_data.gsub!(/\\\n([\ ]*)/,'')
    return jsc_data
  end
  
  # returns html theme piece for special case optimization (REITERATE!!!)
  def html(theme_name); @html_by_theme[theme_name]; end
  
  
  def run
    
    # hash of bundles per bundle name per theme; @html_by_theme[theme_name][bundle_name] = bundle_data
    @html_by_theme = {}
    @theme_names.each do | theme_name |
      @html_by_theme[ theme_name ] = {}
    end
    
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
    do_compress()
    
    save_file( File.join( @js_dst_dir, 'built' ), Time.now.to_i.to_s )
    
  end
  
  def flush
    @jscompress.free_indexes
  end
  
end

# end of the module blocks:
end
end

JSBuilder = Himle::Client::JSBuilder


