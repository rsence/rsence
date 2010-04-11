#--
##   Riassence Framework
 #   Copyright 2008 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##
 #++

if ARGV.include?('--root-path')
  SERVER_PATH = ARGV[ARGV.index('--root-path')+1]
else
  path = ::File.dirname(__FILE__)
  exp_path = ::File.expand_path( path )
  lib_path = ::File.split( exp_path )[0]
  SERVER_PATH = ::File.split( lib_path )[0]
end

$LOAD_PATH << SERVER_PATH
$LOAD_PATH << ::File.join( SERVER_PATH, 'lib' )

# Use the default configuration:
require 'conf/default'

# Debug mode switch. The debug mode is intended for developers, not production.
$DEBUG_MODE  = RSence.config[:debug_mode]

ENV['RACK_ENV'] = 'production' unless $DEBUG_MODE

## Minimally WEBrick -compatible response object
require 'http/response'

## Minimally WEBrick -compatible request object
require 'http/request'

# Transporter is the top-level handler for calls coming from the javascript COMM.Transporter.
require 'transporter/transporter'

module RSence
module Broker
  
  @@transporter = Transporter.new
  
  def self.start
    conf = ::RSence.config[:http_server][:latency]
    if conf == 0
      @@ping_sim = false
    else
      @@ping_sim = conf/1000.0
    end
  end
  
  def self.stop
    @@transporter.plugins.shutdown
    @@transporter.sessions.shutdown
  end
  
  def self.call(env)
    request  = Request.new(env)
    response = Response.new
    request_method = request.request_method.downcase
    if request_method == 'get'
      puts "get: #{request.fullpath}" if $DEBUG_MODE
      sleep @@ping_sim if @@ping_sim
      not_found( request, response ) unless @@transporter.servlet( :get, request, response )
    elsif request_method == 'post'
      puts "post: #{request.fullpath}" if $DEBUG_MODE
      sleep @@ping_sim if @@ping_sim
      not_found( request, response ) unless @@transporter.servlet( :post, request, response )
    else
      puts "unsupported method: #{request_method.inspect}"
    end
    response.header['Content-Length'] = response.body.length.to_s unless response.header.has_key?('Content-Length')
    return [response.status, response.header, response.body]
  end
  
  def not_found( request, response )
    puts "/404: #{request.fullpath.inspect}" if $DEBUG_MODE
    response.status = 404
    err404 = '<html><head><title>404 - Page Not Found</title></head><body>404 - Page Not Found</body></html>'
    response['content-type'] = 'text/html; charset=UTF-8'
    response['content-length'] = err404.length.to_s
    response.body = err404
  end
  
end
end
