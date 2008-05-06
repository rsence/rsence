#!/usr/bin/env ruby

###
  # HIMLE RIA Server
  # Copyright (C) 2008 HIMLE GROUP http://himle.sorsacode.com/
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

if ARGV.include?('--help') or ARGV.include?('-h')
  puts "Usage: #{__FILE__} [params]"
  puts "Params:"
  puts " --trace-js          Write content of msg.reply calls to stdout."
  puts " --root-path /path   Define the path to himle server, defaults to 'bin'"
  puts " --client-path /path Define the path to himle client, defaults to 'client'"
  puts " --port 80           Define the http port to use, defaults to '8001'"
  puts " --addr 127.0.0.1    Define the IPv4 address to bind to, defaults to '0.0.0.0' (all)"
  puts " --server ebb        Choose http server, valid choices:"
  puts "                       webrick, mongrel, ebb or thin.  Defaults to 'mongrel'"
end


require 'rubygems'
require 'rack'

## Auto-construct paths using this file as the waypoint
SERVER_PATH = File.split(File.expand_path(File.dirname(__FILE__)))[0]

## Paths for log and pid files
PIDPATH = File.join(SERVER_PATH,'var','run')
LOGPATH = File.join(SERVER_PATH,'var','log')

## Client by default is "server/client"
CLIENT_PATH = File.join( SERVER_PATH, 'client' )

## Global configuration hash
$config = {
  
  ## This setting should be on, until Rack supports chunked transfers (and as such, transfer encodings for gzip)
  :no_gzip => true,
  
  ## Enabling this appends all msg.reply call output to stdout
  :trace   => ARGV.include?('--trace-js'),
  
  ## Path to the server root (containing lib, rsrc etc..)
  :dir_root    => ARGV.include?('--root-path')?ARGV[ARGV.index('--root-path')+1]:SERVER_PATH,
  
  ## Path to the client root (containing js and themes dirs)
  :client_root => ARGV.include?('--client-path')?ARGV[ARGV.index('--client-path')+1]:CLIENT_PATH,
  
  ## Switches on debug-mode:
  ##  - Generates more output
  ##  - Each time /hello is post-requested:
  ##    - Plugins are reloaded from source 
  ##    - GZFiles are reloaded (if more recent than in memory)
  :debug_mode  => (ARGV.include?('-d') or ARGV.include?('--debug')),
  
  ## Web server-related settings:
  :http_server  => {
    
    ## HTTP Port number:
    :port           => ARGV.include?('--port')?ARGV[ARGV.index('--port')+1].to_i:8001,
    
    ## Bind this ip address ('0.0.0.0' means all)
    :bind_address   => ARGV.include?('--addr')?ARGV[ARGV.index('--addr')+1]:'0.0.0.0',
    
    ## Rack handler to use
    :rack_require   => ARGV.include?('--server')?ARGV[ARGV.index('--server')+1]:'mongrel',
    :rack_handler   => nil # automatic
  },
  
  ## When disabled, tries to prevent all request caching
  :cache_maximize => false,
  
  ## When cache_maximize is enabled,
  ## this is the time (in seconds) the cached content will expire in
  :cache_expire   => 14515200,
  
  ## Client-related paths as [virtual, actual] path pairs
  :ria_paths   => {
    
    ## Resource path of the initial html document (could contain images, css etc)
    #:rsrc_path   => [ '/rsrc',   File.join( SERVER_PATH, 'rsrc'    ) ], # will be replaced with static tickets
    
    ## The paths FileServe uses to load client js, css and html templates
    :ui_path     => File.join( CLIENT_PATH, 'js'      ),
    :theme_path  => File.join( CLIENT_PATH, 'themes'  )
  },
  
  ## 
  :sys_path     => SERVER_PATH,
  
  ## Paths to scan for available plugins
  :app_paths    => [
    File.join( SERVER_PATH, 'plugins' )
    #File.join( PATH_TO_ALT_PLUGINS, 'plugins' )
  ],
  
  ## The global Transporter instance will be bound to:
  :transporter => nil,
  
  ## The global IndexHtml instance will be bound to:
  :indexhtml   => nil,
  
  ## The global FileCache instance will be bound to:
  :filecache   => nil,
  
  ## The global FileServe instance will be bound to:
  :fileserve   => nil,
  
  ## The global TicketServe instance will be bound to:
  :ticketserve => nil,
  
  ## The global Broker instance will bo bound to:
  :broker => nil,
  
  ## IndexHtml settings:
  :indexhtml_conf => {
    ## The initial index.html page <title>
    :loading_title  => 'Himle Loading...',
    
    ## The initialized html page <title>
    :loaded_title   => 'Himle',
  },
  
  ## Session-related settings
  :session_conf => {
    ## The comment string in the session cookie
    :ses_cookie_comment => "Himle session key (just for your convenience)"
  }
  
}

# methods that return rack handlers
def rack_webrick_handler; Rack::Handler::WEBrick; end
def rack_ebb_handler;     Rack::Handler::Ebb;     end
def rack_thin_handler;    Rack::Handler::Thin;    end
def rack_mongrel_handler; Rack::Handler::Mongrel; end

# Selects handler for Rack
$config[:http_server][:rack_handler] = self.method({
  'webrick' => :rack_webrick_handler,
  'ebb'     => :rack_ebb_handler,  # unsupported
  'thin'    => :rack_thin_handler, # unsupported
  'mongrel' => :rack_mongrel_handler
}[$config[:http_server][:rack_require]]).call

## Paths of server libraries
LIB_PATHS  = [File.join( SERVER_PATH, 'lib' )]

## Database configuration
$config[:database] = {
  
  # root_setup should ideally have permissions
  # to create the auth_setup account and database,
  # but if the access fails, it'll fall back to
  # auth_setup, if it's created manually
  :root_setup => {
    :host => 'localhost', # try '127.0.0.1' if this fails with your mysql configuration
    :user => 'root',
    :pass => '',
    :db   => 'mysql'
  },
  
  # auth_setup is the mysql connection himle uses
  # to handle session tables. It's obligatory.
  :auth_setup => {
    :host => 'localhost',
    :user => 'himle',
    :pass => 'bbJNhmtwtOBu6',
    :db   => 'himle'
  }
  
}

###########################################
##### Place config file parsing here. #####
###########################################


## Uses the lib paths as search paths
LIB_PATHS.each do |lib_path|
  $LOAD_PATH << lib_path
end


## Loads the chosen web-server 
require $config[:http_server][:rack_require]

# Transporter is the top-level handler for xhr
require 'transporter/transporter'
$config[:transporter] = Transporter.new

# JSServe / JSCache caches and serves js and theme -files
require 'file/filecache'
$config[:filecache] = FileCache.new
$config[:fileserve] = FileServe.new

# TicketServe caches and serves disposable and static resources
require 'file/ticketserve'
$config[:ticketserve] = TicketServe.new

# IndexHtml builds the default page at '/'
require 'page/indexlhtml'
$config[:indexhtml]  = IndexHtml.new

## Broker routes requests to the correct handler
require 'http/broker'
$config[:broker] = Broker.start(
  $config[:http_server][:rack_handler],
  $config[:http_server][:bind_address],
  $config[:http_server][:port]
)

## CONSTANT aliases for common instances:
TRANSPORTER = $config[:transporter]
INDEXHTML   = $config[:indexhtml]
FILECACHE   = $config[:filecache]
FILESERVE   = $config[:fileserve]
TICKETSERVE = $config[:ticketserve]
BROKER      = $config[:broker]

DEBUG_MODE  = $config[:debug_mode]


