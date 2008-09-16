
# -* coding: UTF-8 -*-
###
  # Himle Server -- http://himle.org/
  #
  # Copyright (C) 2008 Juha-Jarmo Heinonen
  #
  # This file is part of Himle Server.
  #
#####
  #
  # Adapted from mongrel-soap4r: http://mongrel-soap4r.rubyforge.org/
  #
  # Copyright (c) 2007 Jared Hanson
  #
  # Permission is hereby granted, free of charge, to any person obtaining a copy
  # of this software and associated documentation files (the "Software"), to deal
  # in the Software without restriction, including without limitation the rights
  # to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  # copies of the Software, and to permit persons to whom the Software is
  # furnished to do so, subject to the following conditions:
  #
  # The above copyright notice and this permission notice shall be included in
  # all copies or substantial portions of the Software.
  #
  # THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  # IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  # FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  # AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  # LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  # OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  # THE SOFTWARE.
  #
  ###


require 'rubygems'
gem 'soap4r'

require 'soap/rpc/router'
require 'soap/streamHandler'

module SOAP
module RPC

##### Handles SOAP Requests fed via the process method.
   ## Tested only with Himle running 'thin 0.8.2' on 'RACK 0.4.0'; your mileage may wary
class HSoaplet
  
  ### Feed with a custom Router instance do define your namespace. It uses the class name by default.
  def initialize(router = nil)
    @router = router || ::SOAP::RPC::Router.new(self.class.name)
  end
  
  ### POST-Request goes here:
  def process(request, response)
    
    # Set up some default response values:
    response_status = 500
    content_type    = 'text/xml; charset=UTF-8'
    response_body   = 'Internal Server Errror'
    
    ### Ensures the request method is POST
    if request.env['REQUEST_METHOD'] != 'POST'
      
      response_status = 405
      response['Allow'] = 'POST'
      response_body = 'Method Not Allowed'
      
    else
      
      # The request method is POST
      begin
        
        # The ConnectionData instance keeps copies of the request data and SOAP-related variables
        conn_data = ::SOAP::StreamHandler::ConnectionData.new
        
        # Copies the request body, content type and soap action data to conn_data
        setup_req( conn_data, request )
        
        # Process conn_data with the RPC Router, 'ConnectionData:route!' anyone?
        conn_data = @router.route( conn_data )
        
        # Sets the status code depending on the success status:
        response_status = conn_data.is_fault ? 500 : 200
        
      rescue Exception => e
        
        # Get a nice error response message:
        conn_data = @router.create_fault_response(e)
        
      end
      
      # Get the content type:
      content_type = conn_data.send_contenttype || content_type
      
      # Render the response body:
      response_body = conn_data.send_string
    end
    
    # Finalize the response:
    response.status          = response_status
    response['Content-Type'] = content_type
    response.body            = response_body
    
  end
  
private
  
  ### Copies the needed request headers and the response body and
  ### sets the appropriate ConnectionData instance members
  def setup_req(conn_data, req)
    conn_data.receive_string = req.body.read
    conn_data.receive_contenttype = req.env['CONTENT_TYPE']
    conn_data.soapaction = parse_soapaction( req.env['HTTP_SOAPACTION'] )
  end
  
  ### Handles the 'HTTP_SOAPACTION' request header, called from setup_req
  def parse_soapaction(soapaction)
    if !soapaction.nil? and !soapaction.empty?
      if /^"(.+)"$/ =~ soapaction
        return $1
      end
    end
    nil
  end
  
  
end

end
end