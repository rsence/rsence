#!/usr/bin/env ruby

###
  # HIMLE RIA Server
  # Copyright (C) 2008 HIMLE GROUP http://himle.sorsacode.com/
  # Copyright (C) 2006-2007 Helmi Technologies Inc.
  #  
  #  This program is free software; you can redistribute it and/or modify it under the terms
  #  of the GNU General Public License as published by the Free Software Foundation;
  #  either version 2 of the License, or (at your option) any later version. 
  #  This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
  #  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
  #  See the GNU General Public License for more details. 
  #  You should have received a copy of the GNU General Public License along with this program;
  #  if not, write to the Free Software Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
  ###

puts "HIMLE Server"
if ARGV.include?('-h')
  puts
  puts "Command-Line switches:"
  puts " -h       : This Help"
  # before the config file loads
  puts " -d       : Debug Mode"# (#{server_conf_path})"
  puts " -c  path : Alternate configuration file"# (#{server_conf_path})"
  puts " -r  path : The location of RIA Server"# (default: #{dir_root.inspect})"
  puts " -ui path : The location of RIA Client"# (default: #{client_root.inspect})"
  # after the config file is loaded
  puts " -p  port : The HTTP Port to use."# (default: #{$config[:httpserver][:Port]})"
  puts " -a  path : The RIA Applications path."# (default: #{$config[:app_path]})"
  puts
  exit
end

$config = {}
server_conf_path = File.join(File.split($0)[0], '..','conf', 'server_config')

if ARGV.include?('-c')
  server_conf_path = ARGV[ARGV.index('-c')+1]
end

if not File.exist?(server_conf_path+'.rb')
  puts "cannot load config file: #{server_conf_path+'.rb'}"
  puts "exiting"
  exit
end

if ARGV.include?('-r')
  $config[:dir_root] = ARGV[ARGV.index('-r')+1]
end

if ARGV.include?('-ui')
  $config[:client_root] = ARGV[ARGV.index('-ui')+1]
end

$config[:debug_mode] = false
if ARGV.include?('-d')
  $config[:debug_mode] = true
end

require server_conf_path

if not File.exist?($config[:dir_root])
  puts "root directory (#{dir_root}) not found"
  puts "exiting."
  exit
end

if not File.exist?($config[:client_root])
  puts "client directory (#{$config[:client_root]}) not found"
  puts "exiting."
  exit
end

if ARGV.include?('-p')
  $config[:httpserver][:Port] = ARGV[ARGV.index('-p')+1].to_i
end
if ARGV.include?('-a')
  $config[:app_path] = ARGV[ARGV.index('-a')+1]
end

require 'webrick'
include WEBrick

#$config[:httpserver][:ServerName] = Utils::getservername
#$config[:httpserver][:BindAddress]    = nil   # "0.0.0.0" or "::" or nil
$config[:httpserver][:MaxClients]     = 999   # maximum number of the concurrent connections
#$config[:httpserver][:ServerType]     = nil   # default: WEBrick::SimpleServer
#$config[:httpserver][:Logger]         = TinyLog.new
$config[:httpserver][:ServerSoftware] = "HIMLE Server"
#$config[:httpserver][:TempDir]        = ENV['TMPDIR']||ENV['TMP']||ENV['TEMP']||'/tmp'
#$config[:httpserver][:DoNotListen]    = false
#$config[:httpserver][:StartCallback]  = nil
#$config[:httpserver][:StopCallback]   = nil
#$config[:httpserver][:AcceptCallback] = nil

if not $config[:debug_mode]
  require 'lib/log/nullogger'
  $config[:httpserver][:Logger] = NulLog.new
  $config[:httpserver][:AccessLog] = NulLog.new
end

## Initialize the web server
def init
  
  # This is the main http server instance:
  $server = HTTPServer.new(
    $config[:httpserver]
  )
  
  # Require the inital web-page handler
  require 'lib/page/initial'
  
  # Require the server front-end data handling system
  require 'lib/http/frontend'
  
  # Require handler of pre-compressed js support files
  require 'lib/file/gzfiles'
  
  # The initialization code lives in the root directory servlet
  $server.mount(
    '/',
    HInitialPage
  )
  
  # Mount the ria_paths as FileHandler servlets
  #$config[:ria_paths].each_value do |ria_path|
  #  mount_path    = ria_path[0]
  #  filesys_path  = ria_path[1]
  #  begin
  #    server.mount( mount_path, HTTPServlet::FileHandler, filesys_path )
  #  rescue
  #    puts "WARN: Mount of #{mount_path} failed, pointing to #{filesys_path}."
  #  end
  #end
  $server.mount( $config[:ria_paths][:rsrc_path][0], HTTPServlet::FileHandler, $config[:ria_paths][:rsrc_path][1] )
  
  # The server cookie-aware front-end is directed here:
  $server.mount( '/hello', Broker )
  
  # The server front-end is directed here:
  $server.mount( '/ui', Broker )
  
  # Pre-Compressed JS File handler:
  $server.mount( '/gz', GZFileServe )
  
  yield $server if block_given?
  
  
  unless RUBY_PLATFORM.include? "mswin32"
    ['INT', 'TERM', 'KILL', 'HUP'].each do |signal|
      trap(signal) {
        $server.shutdown
      }
    end
  end
  
  # should be daemonized, also should redirect the stdout to log files.
  $server.start
end
init

