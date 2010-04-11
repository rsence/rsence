#--
##   Riassence Framework
 #   Copyright 2008 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##
 #++



module RSence

require 'rubygems'
require 'rack'

## Minimally WEBrick -compatible response object
require 'http/response'

## Minimally WEBrick -compatible request object
require 'http/request'

=begin

 Broker routes requests to the proper request processing instance

=end

class Broker
  
  def call(env)
    request  = Request.new(env)
    response = Response.new
    request_method = request.request_method.downcase
    dispatcher = dispatcher_class.new( request, response )
    dispatcher.send(request_method)
    content_type = dispatcher.content_type
    response.header['Content-Length'] = response.body.length.to_s unless response.header.has_key?('Content-Length')
    return [response.status, response.header, response.body]
  end
  
  def dispatcher_class
    @dispatcher ||= Class.new(self.class) do
      attr_accessor :content_type
      def initialize(request,response)
        @request  = request
        @response = response
      end
    end
  end
  
  def self.start( transporter, handler, host, port)
    @@transporter = transporter
    conf = ::RSence.config[:http_server][:latency]
    if conf == 0
      @@ping_sim = false
    else
      @@ping_sim = conf/1000.0
    end
    handler.run( Rack::Lint.new(self.new), :Host => host, :Port => port )
  end
  
  def self.included(receiver)
    receiver.extend( SingletonMethods )
  end
  
  def not_found
    puts "/404: #{@request.fullpath.inspect}" if $DEBUG_MODE
    @response.status = 404
    err404 = '<html><head><title>404 - Page Not Found</title></head><body>404 - Page Not Found</body></html>'
    @response['content-type'] = 'text/html; charset=UTF-8'
    @response['content-length'] = err404.length.to_s
    @response.body = err404
  end
  
  ## Post requests are always xhr requests
  def post
    
    puts "post: #{@request.fullpath}" if $DEBUG_MODE
    
    sleep @@ping_sim if @@ping_sim
    
    not_found unless @@transporter.servlet( :post, @request, @response )
    
  end
  
  ## Get requests are different, depending on the uri requested
  def get
    
    puts "get: #{@request.fullpath}" if $DEBUG_MODE
    
    sleep @@ping_sim if @@ping_sim
    
    not_found unless @@transporter.servlet( :get, @request, @response )
    
  end
  
  
end

end
