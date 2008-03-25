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

$config = {}

if ARGV.include?('-r')
  $config[:dir_root] = ARGV[ARGV.index('-r')+1]
end

if ARGV.include?('-ui')
  $config[:client_root] = ARGV[ARGV.index('-ui')+1]
end

if not $config.has_key?(:dir_root)
  $config[:dir_root]    = File.join(File.split($0)[0], '..')
end
if not $config.has_key?(:client_root)
  $config[:client_root] = File.join( $config[:dir_root], '..' )
end

$config[:debug_mode] = false
if ARGV.include?('-d')
  $config[:debug_mode] = true
end
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

$config[:httpserver] = {
  :Port => 8001
}

$config[:cache_maximize] = (not $config[:debug_mode])
$config[:cache_expire] = 14515200

# Client file directories #
$config[:ria_paths] = {}  ########
                                 #  server uri             filesystem path
$config[:ria_paths][:rsrc_path]  = ['/rsrc',               File.join( $config[:dir_root],     'rsrc'           ) ]
$config[:ria_paths][:ui_path]    = ['/js',                 File.join( $config[:client_root],  'js'             ) ]
$config[:ria_paths][:theme_path] = ['/themes',             File.join( $config[:client_root],  'themes'         ) ]

# The path to the base directory of the server
$config[:sys_path] = $config[:dir_root]

# The path to the plugins
$config[:app_path] = File.join( $config[:dir_root], 'plugins' )

$LOAD_PATH << $config[:sys_path]

$config[:database] = {
  
  :root_setup => {
    :host => 'localhost', # try '127.0.0.1' if this fails with your mysql configuration
    :user => 'root',
    :pass => '',
    :db   => 'mysql'
  },
  
  :auth_setup => {
    :host => 'localhost',
    :user => 'himle',
    :pass => 'f0RH_QcjR4BvQ',
    :db   => 'himle'
  }
  
  
}

$config[:default_html_page_title] = 'Himle RIA System'
if ARGV.include?('--html-title')
  $config[:default_html_page_title] = ARGV[ARGV.index('--html-title')+1]
end

if ARGV.include?('-p')
  $config[:httpserver][:Port] = ARGV[ARGV.index('-p')+1].to_i
end
if ARGV.include?('-a')
  $config[:app_path] = ARGV[ARGV.index('-a')+1]
end


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













