##   RSence
 #   Copyright 2008 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##

require 'rubygems'
require 'rack'

## Minimally WEBrick -compatible response object
require 'http/response'

## Minimally WEBrick -compatible request object
require 'http/request'


module RSence


# Broker sets up Rack and routes requests to the proper request processing instance.
class Broker
  
  # This method is called from Rack.
  # @param [Hash] env is the Rack environment.
  # @return [Array(Number, Hash, String)] Rack-style response status, header, body
  def call( env )
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
    response_body = response.body
    response.header['Content-Length'] = response_body.bytesize.to_s unless response.header.has_key?('Content-Length')
    return [response.status, response.header, response_body]
  end
  
  # Returns a dynamically created "REST Dispatcher" kind of class that has
  # request and response as instance variables and the rest of the Broker
  # class as the superclass. It calls the method according to the http method. Called from {#call}
  # Broker currently implements only the {#get} and {#post} methods.
  # @return [Broker] An instance of Broker with a {Request} instance as +@request+ and a {Response} instance as +@response+
  def dispatcher_class
    @dispatcher ||= Class.new(self.class) do
      attr_accessor :content_type
      def initialize(request,response)
        @request  = request
        @response = response
      end
    end
  end
  
  # Creates the Rack instance and set up itself accordingly.
  #
  # @param [Transporter] transporter The single {Transporter} instance initialized by {HTTPDaemon}
  # @param [Hash{Symbol => String}] conf Rack initialization settings
  # @option conf [String] :bind_address ('127.0.0.1') The TCP/IP address or mask to bind to.
  # @option conf [#to_i] :port ('8001') The TCP port to bind to.
  # @option conf [String] :rack_require ('mongrel') The Rack handler to use.
  def self.start( transporter, conf = {:bind_address => '127.0.0.1', :port => '8001', :rack_require => 'mongrel'} )
    
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
      puts "Testing if #{host}:#{port} responds.." if ::RSence.args[:debug]
      until RSence.argv.test_port( port, host )
        puts "..#{host}:#{port} doesn't respond yet.." if ::RSence.args[:debug]
        sleep 0.2
      end
      puts "..#{host}:#{port} responds!" if ::RSence.args[:debug]
      puts "RSence is online on the address http://#{host}:#{port}#{::RSence.config[:base_url]}"
      @@transporter.online = true
    end
    
    require 'rack'
    
    # Loads the selected web-server (default is 'mongrel')
    rack_require = conf[:rack_require]
    puts conf.inspect if RSence.args[:debug]
    
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
  
  # Generic 404 error handler. Just sets up response status, headers, body as a small "Page Not Found" html page
  def not_found
    puts "/404: #{@request.fullpath.inspect}" if RSence.args[:verbose]
    @response.status = 404
    err404 = '<html><head><title>404 - Page Not Found</title></head><body>404 - Page Not Found</body></html>'
    @response['Content-Type'] = 'text/html; charset=UTF-8'
    @response['Content-Length'] = err404.bytesize.to_s
    @response.body = err404
  end
  
  # Routes POST requests to {Transporter#servlet}
  def post
    
    puts "post: #{@request.fullpath}" if RSence.args[:verbose]
    
    not_found unless @@transporter.servlet( :post, @request, @response )
    
  end
  
  # Routes GET requests to {Transporter#servlet}
  def get
    
    puts "get: #{@request.fullpath}" if RSence.args[:verbose]
    
    not_found unless @@transporter.servlet( :get, @request, @response )
    
  end
  
  ### -- Add more http methods here when we have some apps to test with CalDAV implementation maybe? ++
  
end

end
