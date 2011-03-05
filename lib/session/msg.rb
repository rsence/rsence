##   RSence
 #   Copyright 2006 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##


require 'util/gzstring'


module RSence

  # A Message instance is used as a `messenger class` while processing client-server requests. It's initialized by the system and the convention guideline for its instance is +msg+, pass it on wherever msg might be needed.
  # In most cases, the use of +msg+ is to just pass the same +msg+ onward from a method to another.
  # 
  # @example Logs a message in the client javascript console.
  #  msg.console "#{Time.new.to_s} -- Testing.."
  #
  # @example Executes a custom Javascript command in the client.
  #  msg.reply "alert('Hello!');"
  #
  # @example Invalidates the session.
  #  msg.expire_session
  #
  # @example Creating a new {HValue}. Usage like this in any extended {Plugins::Plugin__ Plugin} or {Plugins::GUIPlugin__ GUIPlugin} class. It's recommended to use the +values.yaml+ file to create any initial values.
  #  def create_example_value( msg )
  #    ses = get_ses(msg)
  #    default_data = "Some text"
  #    if ses.has_key?( :example_value )
  #      # Resets the default data, causes it to update in the client too on the next sync.
  #      ses[:example_value].set( msg, default_data )
  #    else
  #      # Creates a new value with default data
  #      ses[:example_value] = HValue.new( msg, default_data )
  #    end
  #  end
  # 
  class Message
    
    # @private Session data placeholder, assigned by SessionManager.
    attr_accessor :session 
    
    # Flag for a new session's first request.
    # Check it in your code to decide what to do, when a new session is encountered.
    # In systems that require authentication, this may be used as a trigger to display a login/register dialog.
    # @return [Boolean] This flag is true on the first request of a newly created session.
    attr_accessor :new_session
    
    # Flag for a restored session's first request.
    # Check it in your code to decide what to do, when a restored session is encountered.
    # @return [Boolean] This flag is true on the first request of a newly restored session.
    attr_accessor :restored_session
    
    # Contains the source ses on the first request after the active session was cloned from another session.
    # @return [false, Hash]
    attr_accessor :cloned_source 
    
    # Contains the target sessions packed in an Array on the first request after another session was cloned from the active session.
    # @return [false, Array<Hash>]
    attr_accessor :cloned_targets
    
    # @private The session is not valid by default, it's set by SessionManager, if everything seems ok.
    attr_accessor :ses_valid 
    
    # The HTTP Request object of the active request.
    # @return [Request]
    attr_accessor :request 
    
    # The HTTP Response object of the active request.
    # @return [Response]
    attr_accessor :response
    
    # @private Response output buffer, Array of Strings; sent to client using to_json
    attr_accessor :buffer
    
    # @private Value response output buffer, Array value setters; sent to client using to_json before {:buffer} is sent
    attr_accessor :value_buffer
    
    # @private The request success flag; Boolean.
    attr_accessor :response_success
    
    # Reference to {Transporter}
    # @return [Transporter]
    attr_accessor :transporter
    
    # Reference to {ValueManager}
    # @return [ValueManager]
    attr_accessor :valuemanager
    
    # Reference to {SessionManager}
    # @return [SessionManager]
    attr_accessor :sessions
    
    # Reference to the main {PluginManager}
    # @return [PluginManager]
    attr_accessor :plugins
    
    # @private Message is initialized with a valid {Transporter}, {Request} and {Response} objects along with options. 
    def initialize( transporter, request, response, options )
    
      @config = RSence.config
    
      @request  = request
      @response_success = false
      @response = response
      @session  = nil
      @buffer = []
    
      @options = options
    
      # Value response output.
      @value_buffer = {
        :new => [],
        :set => [],
        :del => []
      }
    
      # The session key placeholder.
      @ses_key = false
      @new_session      = false
      @restored_session = false
      @cloned_source = false
      @cloned_targets = false
      @ses_valid = false
      @error_js = ''
    
      # global instances
      @transporter    = transporter
      @valuemanager   = @transporter.valuemanager
      @sessions = @transporter.sessions
      @plugins  = @transporter.plugins
    
      if options[:servlet]
        @do_gzip = false
      else
        @response['Content-Type'] = 'text/javascript; charset=utf-8'
        @response['Cache-Control'] = 'no-cache'
      
        # gnu-zipped responses:
        if @request.header['accept-encoding'] and @request.header['accept-encoding'].include?('gzip') and not @config[:no_gzip]
          @response['Content-Encoding'] = 'gzip'
          @do_gzip = true
        else
          @do_gzip = false
        end
      end
    
      @response_sent = false
    end
  
    # @private Returns true for Internet Explorer 6.0
    # @return [Boolean]
    def ie6;
      (request.header.has_key?('user-agent') and request.header['user-agent'].include?('MSIE 6.0'))
    end
  
    # Invalidates the active session.
    # @return [nil]
    def expire_session
      @sessions.expire_session( @session[:ses_id] ) if @session
    end
  
    # @private Define the session key.
    def ses_key=(ses_key)
      @ses_key = ses_key
    end
    
    # @private Getter for session key.
    # @return [String] The active session key.
    def ses_key
      @ses_key
    end
  
    # Getter for the user id
    # @return [Number, String] The current user id. Returns 0 by default.
    def user_id
      @session[:user_id]
    end
    
    # Getter for the user info hash
    # @return [Hash] The current user info hash. Returns {} by default.
    def user_info
      @session[:user_info] = {} unless @session.has_key?(:user_info)
      @session[:user_info]
    end    
    
    # @private used for automatic reload of page, when the plugins have been changed.
    def refresh_page?( plugin_incr )
      if plugin_incr != @session[:plugin_incr]
        puts "@session[:plugin_incr] = #{@session[:plugin_incr].inspect}  vs  plugin_incr = #{plugin_incr.inspect}" if RSence.args[:debug]
        @session[:plugin_incr] = plugin_incr
        return true
      end
      return false
    end
    
    # Setter for the user id
    # @param [Number, String] user_id The user id to set. Use in login situations to store the user id.
    # @return [nil]
    def user_id=(user_id)
      @session[:user_id] = user_id
    end

    # Setter for the user info
    # @param [Hash] user_info The user info hash to set. Use in login situations to store the user information.
    # @return [nil]
    def user_info=(user_info)
      @session[:user_info] = user_info
    end
    
    # Returns the session id
    # @return [Number]
    def ses_id
      @session[:ses_id]
    end
    alias session_id ses_id
    
    # @private Sets the session id
    # @param [Number] ses_id The session id to set.
    # @return [nil]
    def ses_id=(ses_id)
      @session[:ses_id] = ses_id
    end
    
    # @private Sets the error message
    # @param [String] error_js The error script to send instead of the regular buffers.
    def error_msg( error_js )
      @error_js = error_js
      # response_done
    end
    
    # @private Converts the buffer to JSON
    def buf_json(buffer)
      buffer.to_json
    end
  
    # @private Called to flush buffer.
    def response_done
      return if @response_sent
      if not @response_success
        @response.status = 200
        #@response.status = 503
        
        buffer = [
          "", # empty session key will stop the syncing
          {}, # no session values
        ] + @error_js
      else
        ## The response status should always be 200 (OK)
        @response.status = 200
        
        buffer = [
          @ses_key,
          @value_buffer,
        ] + @buffer
        
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
      
      @response['Content-Length'] = outp.bytesize.to_s
      @response.body = outp
      
      @response_sent = true
    end
    
    # Sends data to the client, usually javascript, but is valid for any data that responds to #to_json
    # @param [String<js>, #to_json] data Javascript source or object that responds to #to_json
    # @param [Boolean] dont_squeeze When true, doesn't `squeeze` the contents (jsmin + jscompress)
    def reply(data,dont_squeeze=false)
      data.strip!
      data = @plugins[:client_pkg].squeeze( data ) unless dont_squeeze
      puts data if @config[:trace]
      @buffer.push( data )
    end
  
    # @private For value manager; insert changed values BEFORE other js.
    def reply_value( operation_type, value_id, data=nil )
      if operation_type == :set
        @value_buffer[:set].push( [ value_id, data ] )
      elsif operation_type == :new
        @value_buffer[:new].push( [ value_id, data ] )
      elsif operation_type == :del
        @value_buffer[:del].push( value_id )
      else
        throw "Invalid reply_value operation: operation_type: #{operation_type.inspect}, value_id: #{value_id.inspect}, data: #{data.inspect}"
      end
    end
  
    # Sends data to the client's javascript console.
    # @param [#to_json] data Any data that can be presented in the Javascript console.
    def console(data)
      reply( "console.log(#{data.to_json});" )
    end
    alias puts console
    
    # Serves an image object and returns its disposable URL.
    # Calls the default `ticket` plugin.
    # @param [#to_blob] img_obj RMagick image object.
    # @param [String] img_format The format img_obj#to_blob is encoded as.
    # @return [String] The URL where the image can be accessed from using a GET request.
    # @deprecated
    # Use {TicketPlugin#serve_img ticket.serve_img} directly instead.
    def serve_img( img_obj, img_format='PNG' )
      call( :ticket, :serve_img, self, img_obj, img_format )
    end
    
    # Binary data to be served once as a downloadable file attachment, returns a disposable URL.
    # Calls the default `ticket` plugin.
    # @param [String] file_data The binary data to serve
    # @param [String] content_type The MIME type to serve the data as
    # @param [String] filename The name of the downloadable file.
    # @return [String] The URL where the downloadable file can be accessed from using a GET request.
    # @deprecated
    # Use {TicketPlugin#serve_file ticket.serve_file} directly instead.
    def serve_file( file_data, content_type='text/plain', filename='untitled.txt' )
      call( :ticket, :serve_file, self, file_data, content_type, filename )
    end
    
    # Sends any binary to be served indefinitely, returns a unique, random, static URL.
    # Calls the default `ticket` plugin.
    # IMPORTANT: PLEASE call {#release_rsrc} manually, when the resource is no longer needed to free the memory occupied!
    # HINT: In most cases, it's a better idea to use serve_img or serve_file to expire the resource automatically.
    # @see {#release_rsrc}
    # @param [String] rsrc_data The binary data of the resource to serve.
    # @param [String] content_type The MIME type to serve the data as
    # @return [String] The URL where the resource can be accessed from using a GET request.
    # @deprecated
    # Use {TicketPlugin#serve_rsrc ticket.serve_rsrc} directly instead.
    def serve_rsrc( rsrc_data, content_type='text/plain' )
      call(:ticket,:serve_rsrc,self, rsrc_data, content_type )
    end
  
    # Removes the URL served, you *must* call this manually when after a served resource is no longer needed!
    # Calls the default `ticket` plugin.
    # @see {#serve_rsrc}
    # @param [String] uri The URL to delete; the return value of {#serve_rsrc}
    # @deprecated
    # Use {TicketPlugin#serve_rsrc ticket.serve_rsrc} directly instead.
    def release_rsrc( uri )
      call(:ticket,:del_rsrc, uri[3..-1] )
    end
    alias unserve_rsrc release_rsrc
  
    # Calls a method of a registered plugin with optional arguments.
    # @param [Symbol] plugin_name The plugin to call
    # @param [Symbol] plugin_method The method of the plugin to call
    # @param *args Any arguments to pass to the `plugin_method`
    def call( plugin_name, plugin_method, *args )
      @plugins.call( plugin_name, plugin_method, *args)
    end
    alias run call
  end
end
