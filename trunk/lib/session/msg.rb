##   Riassence Framework
 #   Copyright 2006 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##

module Riassence
module Server
require 'util/gzstring'

## Due to the single instance architecture of +Plugin+, instances of Message 
## class are used for communication between sessions and +Plugin+ instance. 
## The +Message+ instance contains session and request-response related 
## mappings and utility methods. 
##
## The Message object is initialized as 'msg' in SessionManager.
## It's passed around the system as the user/session -object namespace,
## much like 'self' is passed around in python methods.
## 
## Using the msg object saves considerate amounts of CPU cycles and memory,
## because it allows single instances of any classes that handle user data.
## 
## == HValue Initialization Example
## +HValue+ is closely related to +Message+ as instances of +HValue+ are
## used to send data between sessions and the server. This is a small
## code snippet about how to initialize several HValues as the session
## is initialized. 
## 
## def init_ses( msg )
##   msg.session[:session_name] = {    
##     :hvalue1     => HValue.new( msg, @firstvalue ),
##     :hvalue2     => HValue.new( msg, @secondvalue ),
##     :hvalue3     => HValue.new( msg, @thirdvalue )
##   }
## end
## 

class Message
  # Session data placeholder, assigned by SessionManager.
  attr_accessor :session 
  # The session identifier placeholder, assigned by SessionManager.
  attr_accessor :ses_id
  # New session flag, check it in your code to decide
  # what to do, when a new session is encountered.
  # In plugins, this usually means that some Values
  # need to be created and bound or possibly that a
  # user_id mapping needs to be done.
  attr_accessor :new_session
  # Old session first xhr flag, check it in your code
  # to decide what to do, when a restored session is
  # encountered. The old Values are automatically present,
  # so you should at least not re-create or re-bind them.
  attr_accessor :restored_session
  # Contains the source ses on the first request after this
  # session was cloned from another session.
  attr_accessor :cloned_source 
  # Contains the target sessions packed in an array on
  # the first request after another session was cloned
  # from this session.
  attr_accessor :cloned_targets
  # The session is not valid by default, it's set
  # by SessionManager, if everything seems ok.
  attr_accessor :ses_valid 
  # The http request object.
  attr_accessor :request 
  # The http response object.
  attr_accessor :response
  # Response output.
  attr_accessor :buffer
  # The request success flag.
  attr_accessor :response_success
  # Special flag for Internet Explorer as it's the only browser which needs own support routines on the server side.
  attr_reader   :ie6
  
  
  # Message is initialized with a valid +Request+ and +Response+ objects. 
  # These are generated automatically by a webserver
  def initialize( request, response )
    @request  = request
    @response_success = false
    @response = response
    @session     = {}
    @buffer = []
    # Value response output.
    @value_buffer = []
    @ses_id      = 0
    # The session key placeholder.
    @ses_key = false
    @ie6         = (request.header.has_key?('user-agent') and request.header['user-agent'].include?('MSIE 6.0'))
    @new_session      = false
    @restored_session = false
    @cloned_source = false
    @cloned_targets = false
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
  
  # Expire the session.
  def expire_session
    $SESSION.expire_session( @ses_id )
  end
  
  # Define the session key.
  def ses_key=(ses_key)
    @ses_key = ses_key
  end
  
  def error_msg( error_js )
    @error_js = error_js
    # response_done
  end
  
  def buf_json(buffer)
    buffer.to_json
  end
  
  # Called to flush buffer.
  def response_done
    return if @response_sent
    if not @response_success
      @response.status = 200
      #@response.status = 503
      
      buffer = [
        "" # empty session key will stop the syncing
      ] + @error_js
    else
      ## The response status should always be 200 (OK)
      @response.status = 200
      
      buffer = @value_buffer + @buffer
      if @ses_key
        buffer.unshift( @ses_key )
      end
      
    end
    
    # flush the output
    if @do_gzip
      outp = GZString.new('')
      gzwriter = Zlib::GzipWriter.new(outp,Zlib::BEST_SPEED)
      gzwriter.write( buf_json(buffer) )
      gzwriter.close
    else
      outp = buf_json(buffer)
    end
    
    @response['content-length'] = outp.size
    @response.body = outp
    
    @response_sent = true
  end
  
  # Sends data to the client, usually
  # javascript, but is valid for any data.
  def reply(data)
    puts data if $config[:trace]
    @buffer.push( data )
  end
  
  # For valuemanager; insert changed values BEFORE other js.
  def reply_value(data)
    puts data if $config[:trace]
    @value_buffer.push( data )
  end
  
  # Sends data to the client's console.
  def console(data)
    reply( "console.log(#{data.to_json});" )
  end
  
  # Serves an image object +img_obj+ by returning its disposable URL. The 
  # second optional parameter +img_format+ defaults to 'PNG' and defines 
  # the format of served picture.
  def serve_img( img_obj, img_format='PNG' )
    return $TICKETSERVE.serve_img( self, img_obj, img_format )
  end
  
  # Sends any binary to be served, returns a disposable uri. First parameter
  # defines the file data, second optional defines content type and defaults
  # to 'text/plain' and third, also optional defines the filename which 
  # defaults to 'untitled.txt'.
  def serve_file( file_data, content_type='text/plain', filename='untitled.txt' )
    return $TICKETSERVE.serve_file( self, file_data, content_type, filename )
  end
  
  # Sends any binary to be served, returns a static uri.
  #
  # IMPORTANT: PLEASE call unserve_rsrc manually, when you
  # don't need the resource anymore! Otherwise TicketServe will
  # keep on chugging more memory every time you serve something.
  #
  # HINT: Usually, it's a better idea to use serve_img or
  # serve_file instead.
  def serve_rsrc( rsrc_data, content_type='text/plain' )
    return $TICKETSERVE.serve_rsrc( self, rsrc_data, content_type )
  end
  
  # Removes the uri served, you HAVE TO call this manually when
  # you are done serving something! Takes the uri as its only parameter.
  def unserve_rsrc( uri )
    $TICKETSERVE.del_rsrc( uri[3..-1] )
  end
  
  # Calls registered plugin +plugin+ method +plugin_method+ with any +args+
  def run( plugin_name, plug_method, *args )
    $PLUGINS.run_plugin( plugin_name, plug_method, *args)
  end
  
  
end

end
end