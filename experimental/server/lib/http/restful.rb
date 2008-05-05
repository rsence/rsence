# RestfulDispatcher improved from: http://nutrun.com/weblog/rack-restful-dispatcher/

require 'rubygems'
require 'rack'

## Minimally WEBrick -compatible response object
require 'http/response'

## Minimally WEBrick -compatible request object
require 'http/request'


module RestfulDispatcher
  
  def call(env)
    
    request  = Request.new(env)
    response = Response.new
    
    request_method = request.request_method.downcase
    dispatcher = dispatcher_class.new( request, response )
    
    dispatcher.send(request_method)
    
    content_type = dispatcher.content_type
    
    #puts response.header.inspect
    
    return [response.status, response.header, response.body]
  end
  
  def dispatcher_class
    @dispatcher ||= Class.new(self.class) do
      attr_accessor :content_type
      
      def initialize(request,response)
        @request = request
        @response = response
      end
      
    end
  end
  
  module SingletonMethods
    def start(handler, host, port)
      handler.run Rack::Lint.new(self.new), :Host => host, :Port => port
    end
  end

  def self.included(receiver)
    receiver.extend SingletonMethods
  end
end

