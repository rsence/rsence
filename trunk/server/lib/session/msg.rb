# -* coding: UTF-8 -*-
###
  # Himle Server -- http://himle.org/
  #
  # Copyright (C) 2008 Juha-Jarmo Heinonen
  # Copyright (C) 2006-2007 Helmi Technologies Inc.
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

module Himle
module Server

=begin

The Message object is initialized as 'msg' in SessionManager.
It's passed around the system as the user/session -object namespace,
much like 'self' is passed around in python methods.

Using the msg object saves considerate amounts of cpu cycles and memory,
because it allows single instances of any classes that handle user data.

Major clean-up in 2008-05-07.

=end

## Uncomment, when Rack supports chunked transfers
require 'zlib'

class GZString < String
  alias write <<
end


class Message
  
  attr_accessor :session, :ses_id,
                :new_session, :restored_session,
                :ses_valid, :request, :response,
                :buffer, :response_success
  
  attr_reader   :ie6
  
  
  ### Message is initialized with a valid
  ### Request and Response instance.
  def initialize( request, response )
    
    # The http request object
    @request  = request
    
    # The request success flag
    @response_success = false
    
    # The http response object
    @response = response
    
    # Session data placeholder, assigned by SessionManager
    @session     = {}
    
    # response output
    @buffer = []
    
    # The session identifier placeholder, assigned by SessionManager
    @ses_id      = 0
    
    # The session key placeholder
    @ses_key = false
    
    # The 'special' browser's presense is detected here:
    @ie6         = (request.header.has_key?('user-agent') and request.header['user-agent'].include?('MSIE 6.0'))
    
    # New session flag, check it in your code to decide
    # what to do, when a new session is encountered.
    # In plugins, this usually means that some Values
    # need to be created and bound or possibly that a
    # user_id mapping needs to be done.
    @new_session      = false
    
    # Old session first xhr flag, check it in your code
    # to decide what to do, when a restored session is
    # encountered. The old Values are automatically present,
    # so you should at least not re-create or re-bind them.
    @restored_session = false
    
    # The session is not valid by default, it's set
    # by SessionManager, if everything seems ok.
    @ses_valid = false
    
    @error_js = ''
    
    # It's better to evaluate plain text than to respond with js.
    @response.content_type = 'text/javascript; charset=utf-8'
    @response['cache-control'] = 'no-cache'
    
    # gnu-ziped responses:
    if @request.header['accept-encoding'] and @request.header['accept-encoding'].include?('gzip') and not $config[:no_gzip]
      @response['content-encoding'] = 'gzip'
      @do_gzip = true
    else
      @do_gzip = false
    end
    
    @response_sent = false
  end
  
  ### Expire the session
  def expire_session
    $SESSION.expire_session( @ses_id )
  end
  
  def ses_key=(ses_key)
    @ses_key = ses_key
  end
  
  def error_msg( error_js )
    @error_js = error_js
    response_done
  end
  
  ## called to flush buffer
  def response_done
    return if @response_sent
    ## The response status should always be 200 (OK)
    @response.status = 200
    
    if not @response_success
      @response.body = [
        "HTransporter.ses_id='#{@ses_key}';",
        @error_js,
        "HTransporter.restoreSyncDelay=HTransporter.syncDelay;",
        "HTransporter.syncDelay=-1;"
      ].join("\r\n")
    else
      
      if @ses_key
        @buffer.unshift( "HTransporter.ses_id='#{@ses_key}';" )
      end
      
      ## flush the output
      if @do_gzip
        puts "do_gzip" if $DEBUG_MODE
        outp = GZString.new('')
        gzwriter = Zlib::GzipWriter.new(outp,Zlib::BEST_SPEED)
        gzwriter.write( @buffer.join("\r\n") )
        gzwriter.close
      else
        puts "no_gzip" if $DEBUG_MODE
        outp = @buffer.join("\r\n")
      end
      @response['content-size'] = outp.size
      @response.body = outp
    end
    @response_sent = true
  end
  
  ### Sends some data to the client, usually
  ### javascript, but is valid for any data.
  def reply(data)
    puts data if $config[:trace]
    @buffer.push( data )
  end
  
  ### Sends a Magick::Image object to be served, returns a disposable uri.
  def serve_img( img_obj, img_format='PNG' )
    return $TICKETSERVE.serve_img( self, img_obj, img_format )
  end
  
  ### Sends any binary to be served, returns a disposable uri.
  def serve_file( file_data, content_type='text/plain', filename='untitled.txt' )
    return $TICKETSERVE.serve_file( self, file_data, content_type, filename )
  end
  
  ### Sends any binary to be served, returns a static uri.
  ###
  ### IMPORTANT: PLEASE call unserve_rsrc manually, when you
  ### don't need the resource anymore! Otherwise TicketServe will
  ### keep on chugging more memory every time you serve something.
  ###
  ### HINT: Usually, it's a better idea to use serve_img or
  ### serve_file instead.
  ###
  def serve_rsrc( rsrc_data, content_type='text/plain' )
    return $TICKETSERVE.serve_rsrc( self, rsrc_data, content_type )
  end
  
  ### Removes the uri served, you HAVE TO call this manually when
  ### you are done serving something!
  def unserve_rsrc( uri )
    $TICKETSERVE.del_rsrc( uri[3..-1] )
  end
  
  ### Calls registered plugin +plugin+ method +plugin_method+ with any +args+
  def run( plugin_name, plug_method, *args )
    $PLUGINS.run_plugin( plugin_name, plug_method, *args)
  end
  
  
end

end
end