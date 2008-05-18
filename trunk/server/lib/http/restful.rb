###
  # Himle Server -- http://himle.org/
  #
  # Copyright (C) 2008 Juha-Jarmo Heinonen
  #
  # This file is part of Himle Server.
  #
  # Himle Server is free software: you can redistribute it and/or modify
  # it under the terms of the GNU General Public License as published by
  # the Free Software Foundation, either version 3 of the License, or
  # (at your option) any later version.
  #
  # Himle server is distributed in the hope that it will be useful,
  # but WITHOUT ANY WARRANTY; without even the implied warranty of
  # MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  # GNU General Public License for more details.
  #
  # You should have received a copy of the GNU General Public License
  # along with this program.  If not, see <http://www.gnu.org/licenses/>.
  #
  ###

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

