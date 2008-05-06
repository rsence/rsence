#!/usr/bin/env ruby

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
  :no_gzip => true,
  
  ## Enabling this appends all msg.reply call output to stdout
  :trace   => ARGV.include?('--trace-js'),
  
  ## Path to the server root (containing lib, rsrc etc..)
  :dir_root    => ARGV.include?('--root-path')?ARGV[ARV.index('--root-path')+1]:SERVER_PATH,
  
  ## Path to the client root (containing js and themes dirs)
  :client_root => ARGV.include?('--client-path')?ARGV[ARV.index('--client-path')+1]:CLIENT_PATH,
  
  ## Switches on debug-mode:
  ##  - Generates more output
  ##  - Each time /hello is post-requested:
  ##    - Plugins are reloaded from source 
  ##    - GZFiles are reloaded (if more recent than in memory)
  :debug_mode  => (ARGV.include?('-d') or ARGV.include?('--debug')),
  
  ## Web server-related settings:
  :http_server  => {
    
    ## HTTP Port number:
    :port           => 8001,
    
    ## Bind this ip address ('0.0.0.0' means all)
    :bind_address   => '127.0.0.1',
    
    ## Uncomment ONLY these two lines to use WEBrick as the HTTP server
    #:rack_require   => 'webrick',
    #:rack_handler   => Rack::Handler::WEBrick
    
    ## Comment out these two lines to use something else than mongrel as the HTTP server
    :rack_require   => 'mongrel',
    :rack_handler   => Rack::Handler::Mongrel
    
    ## Uncomment ONLY these two lines to use EBB as the HTTP server
    ## (Doesn't seem to support Rack fully yet)
    #:rack_require   => 'ebb',
    #:rack_handler   => Rack::Handler::Ebb
    
    ## Uncomment ONLY these two lines to use Thin as the HTTP server
    ## (Doesn't seem to support Rack fully yet)
    #:rack_require   => 'thin',
    #:rack_handler   => Rack::Handler::Thin
    
  },
  
  ## When disabled, tries to prevent all request caching
  :cache_maximize => false,
  
  ## When cache_maximize is enabled,
  ## this is the time (in seconds) the cached content will expire in
  :cache_expire   => 14515200,
  
  ## Client-related paths as [virtual, actual] path pairs
  :ria_paths   => {
    
    ## Resource path of the initial html document (could contain images, css etc)
    :rsrc_path   => [ '/rsrc',   File.join( SERVER_PATH, 'rsrc'    ) ],
    
    ## The paths GZFiles uses to load client js, css and html templates
    :ui_path     => [ '/js',     File.join( CLIENT_PATH, 'js'      ) ],
    :theme_path  => [ '/themes', File.join( CLIENT_PATH, 'themes'  ) ]
  },
  
  ## 
  :sys_path     => SERVER_PATH,
  
  ## Paths to scan for available plugins
  :app_paths    => [
    File.join( SERVER_PATH, 'plugins' )
    #File.join( PATH_TO_ALT_PLUGINS, 'plugins' )
  ],
  
  ## Transporter instance will be constructed to this one:
  :transporter => nil,
  
  ## The initial html page <title>
  :default_html_page_title     => 'Himle Loading...',
  
  ## The initialized html page <title>
  :initialized_html_page_title => 'Himle Ready',
  
  ## The comment string in the session cookie
  :ses_cookie_comment => "Himle session key (just for your convenience)"
  
}

## Paths of server libraries
LIB_PATHS  = [File.join( SERVER_PATH, 'lib' )]

## Database configuration
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

## Loads the http broker class
require 'http/broker'

## Initializes the http broker class
broker = Broker.start(
  $config[:http_server][:rack_handler],
  $config[:http_server][:bind_address],
  $config[:http_server][:port]
)


