# -* coding: UTF-8 -*-
###
  # Riassence Core -- http://rsence.org/
  #
  # Copyright (C) 2008 Juha-Jarmo Heinonen <jjh@riassence.com>
  #
  # This file is part of Riassence Core.
  #
  # Riassence Core is free software: you can redistribute it and/or modify
  # it under the terms of the GNU General Public License as published by
  # the Free Software Foundation, either version 3 of the License, or
  # (at your option) any later version.
  #
  # Riassence Core is distributed in the hope that it will be useful,
  # but WITHOUT ANY WARRANTY; without even the implied warranty of
  # MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  # GNU General Public License for more details.
  #
  # You should have received a copy of the GNU General Public License
  # along with this program.  If not, see <http://www.gnu.org/licenses/>.
  #
  ###


module Riassence
module Server

# Restful provides the basic structure for Broker
require 'http/restful'

=begin

 Broker routes requests to the proper request processing instance

=end

class Broker
  include RestfulDispatcher
  
  ## Post requests are always xhr requests
  def post
    
    ## The full request URI:
    uri = @request.fullpath
    
    ## User agent:
    ua = @request.header['user-agent'] if $DEBUG_MODE
    
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
  
      ## /up handles the uploads inited for ticketserve
      ## the second part of the uri contains the disposable
      ## upload key that has a server-side mapping to the
      ## user's session
      elsif uri[0..2] == broker_urls[:u]
        puts "/U: #{uri.inspect}" if $DEBUG_MODE
        $TICKETSERVE.upload( @request, @response )
      ## nothing matched, display 404
      else
        puts "/404: #{uri.inspect}" if $DEBUG_MODE
        @response.status = 404
        err404 = '<html><head><title>404 - Page Not Found</title></head><body>404 - Page Not Found</body></html>'
        @response['content-type'] = 'text/html; charset=UTF-8'
        @response['content-length'] = err404.size.to_s
        @response.body = err404
      end
    end
    
  end
  
  ## Get requests are different, depending on the uri requested
  def get
    
    ## The full request URI:
    uri = @request.fullpath
    
    ## User agent:
    ua = @request.header['user-agent'] if $DEBUG_MODE
    
    uri_matched = $TRANSPORTER.servlet( :get, @request, @response )
    
    unless uri_matched
      
      broker_urls = $config[:broker_urls]
      
      ## /H processes client framework files (js & themes)
      if uri.match( /^#{broker_urls[:h]}/ )
        # == '/H/'
        puts "/H: #{uri.inspect}" if $DEBUG_MODE
        $FILESERVE.get( @request, @response )
    
      ## /i returns disposable RMagick objects rendered to data
      elsif uri.match( /^#{broker_urls[:i]}/ )
        puts "/i: #{uri.inspect}" if $DEBUG_MODE
        $TICKETSERVE.get( @request, @response, :img )
    
      ## /d returns static data resources
      elsif uri.match( /^#{broker_urls[:d]}/ )
        puts "/d: #{uri.inspect}" if $DEBUG_MODE
        $TICKETSERVE.get( @request, @response, :rsrc )
    
      ## /f return disposable data resources
      elsif uri.match( /^#{broker_urls[:f]}/ )
        puts "/f: #{uri.inspect}" if $DEBUG_MODE
        $TICKETSERVE.get( @request, @response, :file )
    
      ## /B return smart data objects
      elsif uri.match( /^#{broker_urls[:b]}/ )
        puts "/b: #{uri.inspect}" if $DEBUG_MODE
        $TICKETSERVE.get( @request, @response, :blobobj )
    
      ## special case for favicon
      elsif uri == broker_urls[:favicon]
        $TICKETSERVE.favicon( @request, @response )
    
      ## empty html page for the uploader iframe
      elsif uri == broker_urls[:uploader_iframe]
        puts "/U/iframe_html: #{uri.inspect}" if $DEBUG_MODE
        @response.status = 200
        http_body = '<html><head><title>Empty Iframe for Uploading</title></head><body></body></html>'
        @response['content-type'] = 'text/html; charset=UTF-8'
        @response['content-length'] = http_body.size.to_s
        @response.body = http_body
    
      ## nothing matched, display 404
      else
        puts "/404: #{uri.inspect}" if $DEBUG_MODE
        @response.status = 404
        err404 = '<html><head><title>404 - Page Not Found</title></head><body>404 - Page Not Found</body></html>'
        @response['content-type'] = 'text/html; charset=UTF-8'
        @response['content-length'] = err404.size.to_s
        @response.body = err404
      end
    end
    
  end
  
  
end

end
end