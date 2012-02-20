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
require 'rsence/http/response'

## Minimally WEBrick -compatible request object
require 'rsence/http/request'

module RSence


# Broker sets up Rack and routes requests to the proper request processing instance.
class Broker
  
  # This method is called from Rack.
  # @param [Hash] env is the Rack environment.
  # @return [Array(Number, Hash, Array)] Rack-style response status, header, body
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
      return [ 503, headers, ['BUSY'] ]
    end
    request  = Request.new(env)
    response = Response.new
    request_method = request.request_method.downcase
    dispatcher = dispatcher_class.new( request, response )
    if dispatcher.respond_to?( request_method )
      begin
        dispatcher.send( request_method )
      rescue => e
        dispatcher.server_error( e )
      end
    else
      dispatcher.not_implemented( request.request_method )
    end
    response_body = response.body
    response.header['Content-Length'] = response.body_bytes unless response.header.has_key?('Content-Length')
    return [response.status, response.header, response_body]
  end
  
  # Returns a dynamically created "REST Dispatcher" kind of class that has
  # request and response as instance variables and the rest of the Broker
  # class as the superclass. It calls the method according to the http method. Called from {#call}
  # Broker currently implements only the {#get} and {#post} methods.
  # @return [Broker] An instance of Broker with a {Request} instance as +@request+ and a {Response} instance as +@response+
  def dispatcher_class
    @dispatcher ||= Class.new(self.class) do
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
      if host == '0.0.0.0' and Socket.respond_to?(:ip_address_list)
        puts "RSence is online and responds on the addresses:"
        Socket.ip_address_list.each do |if_addr|
          if RSence.argv.test_port( port, if_addr.ip_address )
            puts "  http://#{if_addr.ip_address}:#{port}#{::RSence.config[:base_url]}"
          end
        end
      else
        puts "RSence is online on the address http://#{host}:#{port}#{::RSence.config[:base_url]}"
      end
      @@transporter.online = true
    end
    
    require 'rack'
    
    # Loads the selected web-server (default is 'mongrel')
    rack_require = conf[:rack_require]
    puts conf.inspect if RSence.args[:debug]

    require rack_require
    
    # Selects the handler for Rack
    handler = {
      'mongrel2' => lambda { Rack::Handler::Mongrel2 },
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
    err404 = "<html><head><title>404 - Page Not Found</title></head><body>404 - Page &quot;#{@request.fullpath}&quot; Not Found</body></html>"
    @response['Content-Type'] = 'text/html; charset=UTF-8'
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
  
  # Routes HEAD requests to {Transporter#servlet}
  # Uses GET and removes the response body, if nothing matches HEAD directly.
  def head
    puts "head: #{@request.fullpath}" if RSence.args[:verbose]
    return if @@transporter.servlet( :head, @request, @response )
    if @@transporter.servlet( :get, @request, @response )
      @response.body = ''
    else
      not_found
    end
  end

  # Generic 405 (method not allowed) handler.
  def not_allowed( method_name )
    @response.status = 405
    body_txt = "Error 405: The method #{method_name} is not allowed on #{@request.fullpath}.\r\n"
    @response['Content-Type'] = 'text/plain; charset=UTF-8'
    @response.body = body_txt
  end
  
  # Generic 501 (method not implemented) handler.
  def not_implemented( method_name )
    @response.status = 501
    body_txt = "Error 501: The method #{method_name} is not implemented on #{@request.fullpath}.\r\n"
    @response['Content-Type'] = 'text/plain; charset=UTF-8'
    @response.body = body_txt
  end
  
  # Generic 500 (server error) handler.
  def server_error( e, custom_name='Broker Exception' )
    @response.status = 500
    exception_detail = [
      custom_name,
      "Time: #{Time.now.to_s}",
      "#{'-='*39}-",
      "#{e.class}: #{e.to_s}",
      "\t#{e.backtrace.join("\r\n\t")}",
      "#{'-='*39}-",
      "Request method: #{@request.request_method}",
      "Request path: #{@request.fullpath}",
      "Request headers: #{@request.header.inspect}",
      "#{'-='*39}-\r\n\r\n"
    ].join("\r\n")
    $stderr.puts exception_detail
    if RSence.args[:debug]
      body_txt = "Error 500: "+ exception_detail
    else
      body_txt = "Error 500: General server error.\r\n"
    end
    @response['Content-Type'] = 'text/plain; charset=UTF-8'
    @response.body = body_txt
  end
  
  # Routes OPTIONS requests to {Transporter#servlet}
  def options
    puts "options: #{@request.fullpath}" if RSence.args[:verbose]
    not_allowed('OPTIONS') unless @@transporter.servlet( :options, @request, @response )
  end

  # Routes PUT requests to {Transporter#servlet}
  def put
    puts "put: #{@request.fullpath}" if RSence.args[:verbose]
    not_allowed('PUT') unless @@transporter.servlet( :put, @request, @response )
  end

  # Routes DELETE requests to {Transporter#servlet}
  def delete
    puts "delete: #{@request.fullpath}" if RSence.args[:verbose]
    not_allowed('DELETE') unless @@transporter.servlet( :delete, @request, @response )
  end

  # Routes TRACE requests to {Transporter#servlet}
  def trace
    puts "trace: #{@request.fullpath}" if RSence.args[:verbose]
    not_allowed('TRACE') unless @@transporter.servlet( :trace, @request, @response )
  end

  # Routes CONNECT requests to {Transporter#servlet}
  def connect
    puts "connect: #{@request.fullpath}" if RSence.args[:verbose]
    not_allowed('CONNECT') unless @@transporter.servlet( :connect, @request, @response )
  end

end

end
