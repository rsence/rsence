#--
##   Riassence Framework
 #   Copyright 2008 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##
 #++



module Riassence
module Server

# Restful provides the basic structure for Broker
require 'http/restful'

=begin

 Broker routes requests to the proper request processing instance

=end

class Broker
  include RestfulDispatcher
  
  def not_found
    puts "/404: #{uri.inspect}" if $DEBUG_MODE
    @response.status = 404
    err404 = '<html><head><title>404 - Page Not Found</title></head><body>404 - Page Not Found</body></html>'
    @response['content-type'] = 'text/html; charset=UTF-8'
    @response['content-length'] = err404.length.to_s
    @response.body = err404
  end
  
  ## Post requests are always xhr requests
  def post
    
    sleep $config[:http_server][:latency]/1000.0 unless $config[:http_server][:latency] == 0
    
    ## The full request URI:
    uri = @request.fullpath
    
    uri_matched = $TRANSPORTER.servlet( :post, @request, @response )
    
    unless uri_matched
      
      broker_urls = $config[:broker_urls]
      
      ## /x handles xhr without cookies
      if uri == broker_urls[:x]
        puts "/x: #{uri.inspect}" if $DEBUG_MODE
        $TRANSPORTER.xhr( @request, @response, false )
      
      ## /hello handles the first xhr (with cookies, for session key)
      elsif uri == broker_urls[:hello]
        puts "/hello: #{uri.inspect}" if $DEBUG_MODE
        $TRANSPORTER.xhr( @request, @response, true )
      
      ## /SOAP handles SOAP Requests
      elsif uri == broker_urls[:soap]
        puts "/SOAP: #{uri.inspect}"
        $TRANSPORTER.soap( @request, @response )
      
      ## nothing matched, display 404
      else
        not_found
      end
    end
    
  end
  
  ## Get requests are different, depending on the uri requested
  def get
    
    sleep $config[:http_server][:latency]/1000.0 unless $config[:http_server][:latency] == 0
    
    ## The full request URI:
    uri = @request.fullpath
    
    uri_matched = $TRANSPORTER.servlet( :get, @request, @response )
    
    unless uri_matched
      
      broker_urls = $config[:broker_urls]
      
      ## /H processes client framework files (js & themes)
      if uri.match( /^#{broker_urls[:h]}/ )
        # == '/H/'
        puts "/H: #{uri.inspect}" if $DEBUG_MODE
        $FILESERVE.get( @request, @response )
      
      ## nothing matched, display 404
      else
        not_found
      end
    end
    
  end
  
  
end

end
end