#!/usr/bin/env ruby

require 'rubygems'
require 'rack'

SERVER_PATH = File.split(File.expand_path(File.dirname(__FILE__)))[0]

PIDPATH = File.join(SERVER_PATH,'var','run')
LOGPATH = File.join(SERVER_PATH,'var','log')

CLIENT_PATH = File.join( SERVER_PATH, '..' ) #, 'client' )

$config = {
  :no_gzip => true,
  :trace   => false,
  :dir_root    => SERVER_PATH,
  :client_root => CLIENT_PATH,
  :debug_mode  => true,
  :transporter => nil,
  :http_server  => {
    :port           => 8001,
    :bind_address   => '127.0.0.1',
    
    ## Uncomment ONLY these two lines to use WEBrick as the HTTP server
    #:rack_require   => 'webrick',
    #:rack_handler   => Rack::Handler::WEBrick
    
    ## Uncomment ONLY these two lines to use mongrel as the HTTP server
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
  :cache_maximize => false,
  :cache_expire   => 14515200,
  :ria_paths   => {
    :rsrc_path   => [ '/rsrc',   File.join( SERVER_PATH, 'rsrc'    ) ],
    :ui_path     => [ '/js',     File.join( CLIENT_PATH, 'js'      ) ],
    :theme_path  => [ '/themes', File.join( CLIENT_PATH, 'themes'  ) ]
  },
  :sys_path     => SERVER_PATH,
  :app_paths    => [
    File.join( SERVER_PATH, 'plugins' )
    #File.join( PATH_TO_ALT_PLUGINS, 'plugins' )
  ],
  :default_html_page_title     => 'Himle Loading...',
  :initialized_html_page_title => 'Himle Ready'
  
}

LIB_PATH  = File.join( SERVER_PATH, 'lib' )
CONF_PATH = File.join( SERVER_PATH, 'conf' )

$LOAD_PATH << LIB_PATH
$LOAD_PATH << CONF_PATH

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

require  $config[:http_server][:rack_require]

require 'http/broker'

broker = Broker.start(
  $config[:http_server][:rack_handler],
  $config[:http_server][:bind_address],
  $config[:http_server][:port]
)


