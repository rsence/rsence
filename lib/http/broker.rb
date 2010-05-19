#--
##   RSence
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

# Broker routes requests to the proper request processing instance.
# It's the top-level http handler.
class Broker
  
  # This method is called from Rack. The env is the Rack environment.
  def call(env)
    sleep @@ping_sim if @@ping_sim
    unless @@transporter.online?
      puts "#{Time.now.strftime('%Y-%m-%d %H:%M:%S')} -- Server busy."
      headers = {
        'Retry-After' => '2',
        'Content-Type' => 'text/plain',
        'Refresh' => "2; #{env['REQUEST_URI']}",
        'Content-Length' => '4'
      }
      return [ 503, headers, 'BUSY' ]
    end
    request  = Request.new(env)
    response = Response.new
    request_method = request.request_method.downcase
    dispatcher = dispatcher_class.new( request, response )
    dispatcher.send( request_method )
    content_type = dispatcher.content_type
    response.header['Content-Length'] = response.body.length.to_s unless response.header.has_key?('Content-Length')
    return [response.status, response.header, response.body]
  end
  
  # Returns a dynamically created "REST Dispatcher" kind of class that has
  # request and response as instance variables and the rest of the Broker
  # class as the superclass.
  # It calls the method according to the http method.
  # Called from #call
  # Broker currently implements only get and post methods.
  def dispatcher_class
    @dispatcher ||= Class.new(self.class) do
      attr_accessor :content_type
      def initialize(request,response)
        @request  = request
        @response = response
      end
    end
  end
  
  # This method is used to create the Rack instance
  # and set up itself accordingly.
  # The transporter parameter is an instance of the Transporter class,
  # which does all the actual delegation.
  # The conf parameter contains a hash with at least the following:
  #  :bind_address, :port, :rack_require
  def self.start( transporter, conf )
    
    host = conf[:bind_address]
    port = conf[:port]
    
    @@transporter = transporter
    latency = ::RSence.config[:http_server][:latency]
    if latency == 0
      @@ping_sim = false
    else
      @@ping_sim = latency/1000.0
    end
    Thread.new do
      Thread.pass
      puts "testing port.. #{host.inspect}"
      until RSence.argv.test_port( port, host )
        puts "port tested"
        sleep 0.1
      end
      @@transporter.online = true
    end
    
    require 'rack'
    
    # Loads the selected web-server (default is 'mongrel')
    rack_require = conf[:rack_require]
    puts conf.inspect
    puts "rack require: #{rack_require.inspect}" if RSence.args[:debug]
    require rack_require
    
    # Selects the handler for Rack
    handler = {
      'webrick'  => lambda { Rack::Handler::WEBrick  },
      'ebb'      => lambda { Rack::Handler::Ebb      },
      'thin'     => lambda { Rack::Handler::Thin     },
      'mongrel'  => lambda { Rack::Handler::Mongrel  },
      'unicorn'  => lambda { Rack::Handler::Unicorn  },
      'rainbows' => lambda { Rack::Handler::Rainbows }
    }[rack_require].call
    
    handler.run( Rack::Lint.new(self.new), :Host => host, :Port => port )
    
  end
  
  def self.included( receiver )
    receiver.extend( SingletonMethods )
  end
  
  # Generic 404 handler
  def not_found
    puts "/404: #{@request.fullpath.inspect}" if RSence.args[:verbose]
    @response.status = 404
    err404 = '<html><head><title>404 - Page Not Found</title></head><body>404 - Page Not Found</body></html>'
    @response['content-type'] = 'text/html; charset=UTF-8'
    @response['content-length'] = err404.length.to_s
    @response.body = err404
  end
  
  ## Post requests are always xhr requests
  def post
    
    puts "post: #{@request.fullpath}" if RSence.args[:verbose]
    
    not_found unless @@transporter.servlet( :post, @request, @response )
    
  end
  
  ## Get requests are different, depending on the uri requested
  def get
    
    puts "get: #{@request.fullpath}" if RSence.args[:verbose]
    
    not_found unless @@transporter.servlet( :get, @request, @response )
    
  end
  
  ### -- Add more http methods here when we have some apps to test with, caldav implementation maybe? ++
  
end

end
