#!/usr/bin/env ruby
##   RSence
 #   Copyright 2010 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##


if ARGV.include?('--help') or ARGV.include?('-h')
  puts %{

  RSence Client Builder
  This script builds the client into the DESTINATION_PATH that defaults to ./client

  Usage:
    #{__FILE__} [DESTINATION_PATH] [params]

  Params:
    -d                      Debug/Development mode
    --config <PATH>         Optional config override file
    --auto                  Checks if the source has changed every 3 seconds
    --help                  This message
    -h                      This message
  
  Examples:
    #{__FILE__} /web/sites/my_site/rsence/client -d
  
  Further information:
     http://rsence.org/

}
  exit
end

require 'profile' if ARGV.include?('--profile')

## Auto-construct paths using this file as the waypoint
SERVER_PATH = ARGV.include?('--root-path')?(ARGV[ARGV.index('--root-path')+1]):File.split(File.expand_path(File.dirname(__FILE__)))[0]

## Include server & lib in the search path
$LOAD_PATH << SERVER_PATH
$LOAD_PATH << File.join( SERVER_PATH, 'lib' )

require 'rubygems'
require 'yaml'
require 'json'

$rsence_config = YAML.load( File.read( File.join( SERVER_PATH, 'conf', 'default_conf.yaml' ) ) )

## Create default local configuratation override file, if it does not exist:
local_config_file_paths = [
  File.join(SERVER_PATH,'conf','local_conf.yaml')
]
if ARGV.include?('--config')
  argv_conf_file = ARGV[ARGV.index('--config')+1]
  if not argv_conf_file.begin_with? '/'
    argv_conf_file = File.join( Dir.pwd, conf_file )
  end
  local_config_file_paths.push( argv_conf_file )
end

def array_merge( target, source )
  source.each do |item|
    unless target.include?(item)
      if item.class == Array
        sub_arr = []
        array_merge( sub_arr, item )
        target.push( sub_arr )
      elsif item.class == Hash
        sub_hash = {}
        hash_merge( sub_hash, item )
        target.push( sub_hash )
      else
        target.push( item )
      end
    end
  end
end
def hash_merge( target, source )
  source.each do |key,item|
    if not target.has_key?key or target[key] != item
      if item.class == Array
        target[key] = [] unless target.has_key?(key)
        array_merge( target[key], item )
        # if key == :plugin_paths
        #   puts target[key].inspect
        # end
      elsif item.class == Hash
        target[key] = {} unless target.has_key?key
        hash_merge( target[key], item )
      else
        target[key] = item
      end
    end
  end
end

local_config_file_path_found = false
local_config_file_paths.each do |local_config_file_path|
  if File.exists? local_config_file_path and File.file? local_config_file_path
    if local_config_file_path.end_with? '.yaml'
      local_conf = YAML.load( File.read( local_config_file_path ) )
      hash_merge( $rsence_config, local_conf )
      local_config_file_path_found = true
    else
      warn "Only Yaml configuration files are allowed at this time."
    end
  end
end

module RSence
  def self.config
    $rsence_config
  end
  def self.args
    debug = ARGV.include?('-d')
    return {
      :debug => debug,
      :verbose => debug
    }
  end
end

require 'lib/rsence/gzstring'
require 'plugins/client_pkg/lib/client_pkg_build'

class JSBuilder < ClientPkgBuild
  def initialize( conf, logger )
    super
    @conf = conf
    @debug = ARGV.include?('-d')
    @quiet = false
  end
  def flush
    @jscompress.free_indexes
  end
  def ensure_client_dir
    dst_dir = @conf[:dst_dir]
    Dir.mkdir( dst_dir ) unless File.exist?( dst_dir )
    js_dir = File.join( dst_dir, 'js' )
    Dir.mkdir( js_dir ) unless File.exist?( js_dir )
    themes_dir = File.join( dst_dir, 'themes' )
    Dir.mkdir( themes_dir ) unless File.exist?( themes_dir )
    @themes.each_key do |theme_name|
      theme_dir = File.join( themes_dir, theme_name )
      Dir.mkdir( theme_dir ) unless File.exist?( theme_dir )
      ['gfx','css','html'].each do |theme_part|
        theme_part_dir = File.join( theme_dir, theme_part )
        Dir.mkdir( theme_part_dir ) unless File.exist?( theme_part_dir )
      end
    end
  end
  def store_client_files
    dst_dir = @conf[:dst_dir]
    js_dir = File.join( dst_dir, 'js' )
    @js.each_key do |js_name|
      js_path = File.join( js_dir, "#{js_name}.js" )
      js_file = File.open( js_path, 'wb' )
      js_file.write( @js[js_name] )
      js_file.close
    end
    @gz.each_key do |gz_name|
      gz_path = File.join( js_dir, "#{gz_name}.gz" )
      gz_file = File.open( gz_path, 'wb' )
      gz_file.write( @gz[gz_name] )
      gz_file.close
    end
    themes_dir = File.join( dst_dir, 'themes' )
    @themes.each_key do |theme_name|
      theme_dir = File.join( themes_dir, theme_name )
      gfx_dir = File.join( theme_dir, 'gfx' )
      @themes[theme_name][:gfx].each do | img_name, file_data |
        img_path = File.join( gfx_dir, img_name )
        img_file = File.open( img_path, 'wb' )
        img_file.write( file_data )
        img_file.close
      end
      css_dir = File.join( theme_dir, 'css' )
      @themes[theme_name][:css].each do | css_name, file_data |
        css_path = File.join( css_dir, "#{css_name}.css" )
        css_file = File.open( css_path, 'wb' )
        css_file.write( file_data )
        css_file.close
        css_path += '.gz'
        css_file = File.open( css_path, 'wb' )
        css_file.write( gzip_string( file_data ) )
        css_file.close
      end
      html_dir = File.join( theme_dir, 'html' )
      @themes[theme_name][:html].each do | html_name, file_data |
        html_path = File.join( html_dir, "#{html_name}.html" )
        html_file = File.open( html_path, 'wb' )
        html_file.write( file_data )
        html_file.close
        html_path += '.gz'
        html_file = File.open( html_path, 'wb' )
        html_file.write( gzip_string( file_data ) )
        html_file.close
      end
    end
    built_path = File.join( js_dir, 'built' )
    built_file = File.open( built_path, 'w' )
    built_file.write( Time.now.to_i.to_s )
    built_file.close
  end
  def run
    ensure_client_dir
    super
    store_client_files
  end
end
class Logger
  def log( str )
    puts str
  end
end

conf = $rsence_config[:client_pkg]
conf[:src_dirs].unshift( File.join( SERVER_PATH, 'js' ) )

# require 'pp'
# pp conf.inspect

dst_dir = File.join( SERVER_PATH, 'client' )
if ARGV.length > 0
  unless ['-d','-auto','--auto','-say','--config','--root-path'].include?( ARGV[0] )
    dst_dir = ARGV[0]
    unless dst_dir.start_with?('/')
      dst_dir = File.join( SERVER_PATH, dst_dir )
    end
  end
end
puts "Client build destination directory: #{dst_dir}"
conf[:dst_dir] = dst_dir

conf[:compound_packages].each do | pkg_name, js_order |
  pkg_files = []
  js_order.each do |js_pkg|
    unless conf[:packages].has_key?(js_pkg)
      pkg_files.push( js_pkg )
      next
    end
    conf[:packages][js_pkg].each do |js_file|
      pkg_files.push( js_file )
    end
  end
  conf[:packages][ pkg_name ] = pkg_files
end

js_builder = JSBuilder.new( conf, Logger.new )
# js_builder.setup_dirs
js_builder.run
if ARGV.include? '-auto' or ARGV.include? '--auto'
  last_change = Time.now.to_i
  while true
    if js_builder.bundle_changes( last_change )
      last_change = Time.now.to_i
      js_builder.setup_dirs
      js_builder.run
      # client_cache.set_cache( @client_build.js, @client_build.gz, @client_build.themes )
      `say "Autobuild complete!"` if ARGV.include?('-say')
    end
    sleep 3
  end
end
js_builder.flush
