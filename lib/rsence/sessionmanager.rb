
module RSence

  require 'rubygems'
  require 'json'

  ## Shared messaging-object:
  require 'rsence/msg'

  ## Unique random number generator:
  require 'randgen'

  ## SessionStorage is the superclass of SessionManager
  require 'rsence/sessionstorage'

  require 'digest/sha1'

  # SessionManager does session creation, validation, expiration and storage duties.
  class SessionManager < SessionStorage
  
    include Digest
  
    attr_reader :randgen
  
    ## Makes everything ready to run
    def initialize( transporter )
    
      super()
    
      @transporter = transporter
    
      @valuemanager = @transporter.valuemanager
    
      @plugins = @transporter.plugins
    
      ## 'Unique' Random String generator for ses_key:s and cookie_key:s
      @randgen   = RandGen.new( @config[:key_length] )
    
      # regex to match ipv4 addresses
      @ipv4_reg = /^([1][0-9][0-9]|[2][0-5][0-9]|[1-9][0-9]|[1-9])\.([1][0-9][0-9]|[2][0-5][0-9]|[1-9][0-9]|[0-9])\.([1][0-9][0-9]|[2][0-5][0-9]|[1-9][0-9]|[0-9])\.([1][0-9][0-9]|[2][0-5][0-9]|[1-9][0-9]|[0-9])$/
    
    end
  
    ### Creates a new session
    def init_ses( msg=nil, ses_seed=false )

      ## Perform old-session cleanup before creating another
      # expire_sessions

      if ses_seed == false
        ses_seed = @randgen.gen
      end
    
      ## Assigns new timeout for the session
      timeout  = Time.now.to_i + @config[:timeout_first] #@config[:timeout_secs]
    
      ## Creates a new session key
      ses_key    = @randgen.gen
    
      ## Creates a new cookie key
      cookie_key = @randgen.gen_many(@config[:cookie_key_multiplier]).join('')
    
      ## Makes a new database row for the session, returns its id
      ses_id     = new_ses_id( cookie_key, ses_key, timeout )

      ses_sha = SHA1.hexdigest(ses_key+ses_seed)
    
      ### Default session data structure,
      ### Please don't mess with it, unless you know exactly what you are doing.
      ses_data = {
      
        # the time, when the session will time out
        :timeout    =>  timeout,
        
        :plugin_incr => @plugins.incr,
        
        # session id, used internally
        :ses_id     =>  ses_id,
      
        # session key, used externally (client sync)
        :ses_key    =>  ses_sha,
      
        # session key, used externally (client cookies)
        :cookie_key =>  cookie_key,
      
        # user id, map to your own user management code
        :user_id    =>  0,

        # unused in msg context:
        :_msg_unused => true,
        
        # user info, map to your own user management code
        :user_info  => {
          :lang => RSence.config[:lang]
        },

        # sequence number of session, incremented by each restore
        :ses_seq => 0,
      
        # valuemanager data
        :values     => {
          :sync  => [],  # value id's to sync to client
          :check => [],  # value id's to validate in server (from client)
          :by_id => {}   # values by id
        }
      }
    
      # bind the session data to @sessions by its id
      @sessions[ ses_id ] = ses_data
    
      # map the key back to the id
      @session_keys[ ses_sha ] = ses_id
    
      # map the ses_id to cookie key
      @session_cookie_keys[ cookie_key ] = ses_id
      
      if msg
        ### Tell the client what the new key is
        msg.ses_key = ses_key
      
        ### Set the session data and id to the message object
        msg.session = ses_data
      
        # Flag the session as new, so associated
        # plugins know when to create new data
        msg.new_session = true
      end

      # Returns the cookie key, so it can be sent in the response header
      return cookie_key
    
    end
  
    def refresh_ses( msg, ses_data, ses_id, ses_key, ses_seed )
      # new time-out
      ses_data[:timeout] = Time.now.to_i + @config[:timeout_secs]
      
      if ses_data.has_key?(:ses_seq)
        ses_data[:ses_seq] += 1
      else
        ses_data[:ses_seq] = 0
      end
      
      # re-generates the ses_key for each sync
      if @config[:disposable_keys]
      
        # disposes the old (current) ses_key:
        @session_keys.delete( ses_key )
      
        unless ses_seed
          ses_seed = ses_key
        end
      
        # gets a new ses_key:
        ses_key = @randgen.gen
      
        ses_sha = SHA1.hexdigest(ses_key+ses_seed)
      
        # re-maps the session id to the new key
        @session_keys[ses_sha] = ses_id
      
        # changes the session key in the session data
        ses_data[:ses_key] = ses_sha
      
        # tell the client what its new session key is
        msg.ses_key = ses_key
      end
      
      if @config[:clone_cookie_sessions] and @clone_targets.has_key? ses_id
        targets = []
        @clone_targets[ ses_id ].length.times do |n|
          target_id  = @clone_targets[ ses_id ].shift
          target_ses = @sessions[ target_id ]
          if @sessions.has_key?( target_id ) and @sessions[ target_id ].class == Hash
            targets.push( target_ses )
          end
        end
        @clone_targets.delete( ses_id ) if @clone_targets[ ses_id ].empty?
        msg.cloned_targets = targets unless targets.empty?
      end
    
      ### Bind the session data and id to the message object
      msg.session = ses_data
    
    end
  
    def clone_ses( msg, old_data, old_id, old_key, ses_seed )
      if @plugins
        @plugins.delegate( :dump_ses, old_data )
        @plugins.delegate( :dump_ses_id, old_id )
      end
      begin
        old_dump = Marshal.dump( old_data )
        if @plugins
          @plugins.delegate( :load_ses_id, old_id )
          @plugins.delegate( :load_ses, old_data )
        end
        ses_data = Marshal.load( old_dump )
      rescue => e
        warn "Unable to clone session #{old_id}, because: #{e.message}"
        init_ses( msg, ses_seed )
        return
      end
      old_data[:timeout] = Time.now.to_i + @config[:cloned_session_expires_in]
      timeout = Time.now.to_i + @config[:timeout_secs]
      cookie_key = @randgen.gen_many(@config[:cookie_key_multiplier]).join('')
      ses_key = @randgen.gen
      ses_sha = SHA1.hexdigest(ses_key+ses_seed)
      ses_data[:timeout] = timeout
      ses_data[:ses_key] = ses_key
      ses_data[:cookie_key] = cookie_key
      ses_data[:plugin_incr] = @plugins.incr
      ses_id = new_ses_id( cookie_key, ses_key, timeout )
      ses_data[:ses_id] = ses_id
      ses_data[:ses_seq] = 0
      @sessions[ ses_id ] = ses_data
      @session_keys[ ses_sha ] = ses_id
      @session_cookie_keys.delete( old_data[:cookie_key] )
      @session_cookie_keys[ cookie_key ] = ses_id
      msg.ses_key = ses_key
      msg.session = ses_data
      if @plugins
        @plugins.delegate( :load_ses_id, ses_id )
        @plugins.delegate( :load_ses, ses_data )
      end
      if @clone_targets.has_key? old_id
        @clone_targets[ old_id ].push( ses_id )
      else
        @clone_targets[ old_id ] = [ ses_id ]
      end
      @clone_sources[ ses_id ] = old_id
      msg.cloned_source = old_data
      msg.new_session = false
      msg.restored_session = true
    end
  
    ### Returns the current session data, if the session is valid.
    ### Otherwise stops the client and returns false.
    def check_ses( msg, ses_key, ses_seed=false )

      # first, check if the session key exists (sync)
      if @session_keys.has_key?( ses_key )
      
        # get the session's id based on its key
        ses_id   = @session_keys[ ses_key ]
      
        # get the session's data based on its id
        ses_data = @sessions[ ses_id ]

        if not ses_data.has_key?(:_msg_unused) and @config[:clone_cookie_sessions] and ses_seed
          clone_ses( msg, ses_data, ses_id, ses_key, ses_seed )
          return [true, true]
        else
          refresh_ses( msg, ses_data, ses_id, ses_key, ses_seed )
          return [true, false]
        end
      
      ## The session was either faked or expired:
      elsif RSence.args[:debug]
    
        ### Tells the client to stop connecting with its session key and reload instead to get a new one.
        stop_client_with_message( msg,
          @config[:messages][:invalid_session][:title],
          @config[:messages][:invalid_session][:descr],
          @config[:messages][:invalid_session][:uri]
        )
      
        ## Return failure
        return [false, false]

      else

        msg.error_msg( [
          "COMM.Transporter.stop = true;",
          "setTimeout(function(){window.location.reload(true);},1000);"
          # "COMM.Transporter.setInterruptAnim('Session failure, reloading in 3 seconds..','#039');",
          # "setTimeout(function(){COMM.Transporter.setInterruptAnim('Reloading...');},2500);",
          # "setTimeout(function(){COMM.Transporter.setInterruptAnim('Session failure, reloading in 1 seconds..');},2000);",
          # "setTimeout(function(){COMM.Transporter.setInterruptAnim('Session failure, reloading in 2 seconds..');},1000);",
        ] )
        return [ false, false ]
      end
    
    end
  
    def js_str( str )
      return str.to_json.gsub('<','&lt;').gsub('>','&gt;').gsub(/\[\[(.*?)\]\]/,'<\1>')
    end
  
    ## Displays error message and stops the client
    def stop_client_with_message( msg,
                                  title = 'Unknown Issue',
                                  descr = 'No issue description given.',
                                  uri = RSence.config[:index_html][:respond_address] )
      msg.error_msg( [
        # "jsLoader.load('default_theme');",
        # "jsLoader.load('controls');",
        # "jsLoader.load('servermessage');",
        "ReloadApp.nu( #{js_str(title)}, #{js_str(descr)}, #{js_str(uri)}  );"
      ] )
    end

    def servlet_cookie_ses( request, response )
      cookie_raw = request.cookies
      if cookie_raw.has_key?('ses_key')
        cookie_key = cookie_raw['ses_key'].split(';')[0]
      else
        cookie_key = nil
      end
      if @session_cookie_keys.has_key?( cookie_key )
        timeout = Time.now.to_i + @config[:timeout_secs]
      else
        cookie_key = init_ses
        timeout = Time.now.to_i + @config[:timeout_first]
      end
      ses_id = @session_cookie_keys[ cookie_key ]
      ses_data = @sessions[ ses_id ]
      ses_data[:timeout] = timeout
      renew_cookie_req_res( request, response, cookie_key, request.fullpath )
      return ses_data
    end
  
    ### Checks / Sets cookies
    def check_cookie( msg, ses_seed )
    
      # default to no cookie key found:
      cookie_key = false
    
      # gets the cookie array from the request object
      cookie_raw = msg.request.cookies
    
      # checks, if a cookie named 'ses_key' is found
      if cookie_raw.has_key?('ses_key')
      
        # gets just the data itself (discards comment, domain, expiration etc)
        cookie_key = cookie_raw['ses_key'].split(';')[0]
      
      end
    
      # if a cookie key is found (non-false), checks if it's valid
      if cookie_key
      
        # checks for validity by looking the key up in @session_cookie_keys
        cookie_key_exist = @session_cookie_keys.has_key?( cookie_key )
      
        # sets the cookie key to false, if it doesn't exist
        cookie_key = false unless cookie_key_exist
      
      end
    
      # at this point, the cookie key seems valid:
      if cookie_key and cookie_key_exist
      
        # get the session identifier
        ses_id = @session_cookie_keys[ cookie_key ]
      
        # get the last session key from session data
        ses_key = @sessions[ses_id][:ses_key]
      
        # make additional checks on the session validity (expiry etc)
        (ses_status, ses_cloned) = check_ses( msg, ses_key, ses_seed )
      
        if ses_status and ses_cloned
          ses_id = msg.ses_id
          ses_key = msg.session[:ses_key]
          cookie_key = msg.session[:cookie_key]
          @valuemanager.resend_session_values( msg )
        elsif ses_status

          unless @sessions[ses_id].has_key?(:_msg_unused)
            # delete the old cookie key:
            @session_cookie_keys.delete( cookie_key )
          
            # get a new cookie key
            cookie_key = @randgen.gen_many(@config[:cookie_key_multiplier]).join('')
          
            # map the new cookie key to the old session identifier
            @session_cookie_keys[ cookie_key ] = ses_id
          
            # binds the new cookie key to the old session data
            @sessions[ses_id][:cookie_key] = cookie_key
          end
          
          msg.session[:plugin_incr] = @plugins.incr
        
          # Sets the restored_session flag of msg to true
          # It signals plugins to re-set data
          msg.restored_session = true
        
          # Sets the new_session flag of msg to false
          # It signals plugins to not create new server-side values
          msg.new_session = false
        
          # tells ValueManager to re-send client-side HValue objects
          # with data to the client
          @valuemanager.resend_session_values( msg )
      
        # if the session is not valid, make sure to mark the
        # cookie key as invalid (false)
        else
          cookie_key = false
        end
      end
    
      # if the cookie key failed validation in the
      # tests above, create a new session instead
      unless cookie_key
        cookie_key = init_ses( msg, ses_seed )
        ses_status = true
      end
    
      renew_cookie( msg, cookie_key )
    
      ## Return the session status. Actually,
      ## the value is always true, but future
      ## versions might not accept invalid
      ## cookies as new sessions.
      return ses_status
    end
  
    def renew_cookie( msg, cookie_key )
      renew_cookie_req_res( msg.request, msg.response, cookie_key )
    end

    def renew_cookie_req_res( request, response, cookie_key, ses_cookie_path=nil )
      # Uses a cookie comment to tell the user what the
      # cookie is for, change it to anything valid in the
      # configuration.
      ses_cookie_comment = @config[:ses_cookie_comment]
    
      ## mod_rewrite changes the host header to x-forwarded-host:
      if request.header.has_key?('x-forwarded-host')
        domain = request.header['x-forwarded-host']
      
      ## direct access just uses host (at least mongrel
      ## does mod_rewrite header translation):
      else
        domain = request.host
      end
    
      if domain == 'localhost'
        warn "Warning: Cookies won't be set for 'localhost'. Use '127.0.0.1' instead." if RSence.args[:debug]
        return
      end
    
      server_port = request.port
    
      ## if the host address is a real domain
      ## (not just hostname or 'localhost'),
      ## but not an ip-address, prepend it with
      ## a dot to accept wildcards (useful for
      ## dns-load-balanced server configurations)
      if not @ipv4_reg.match(domain) and domain.include?('.')
        ses_cookie_domain  = ".#{domain}"
      ## Otherwise, use the domain as-is
      else
        ses_cookie_domain  = domain
      end
    
      ## uses the timeout to declare the max age
      ## of the cookie, allows the browser to delete
      ## it, when it expires.
      ses_cookie_max_age = @config[:timeout_secs]
      # IE not support Max-Age. So, have to send Expires, too.
      ses_cookie_expires = CGI.rfc1123_date( Time.now + ses_cookie_max_age )
    
      ## Only match the handshaking address of rsence,
      ## prevents unnecessary cookie-juggling in sync's
      if @config[:trust_cookies]
        ses_cookie_path    = '/'
      elsif ses_cookie_path == nil
        ses_cookie_path    = RSence.config[:broker_urls][:hello]
      end

      ## Formats the cookie to string
      ## (through array, to keep it readable in the source)
      ses_cookie_arr = [
        "ses_key=#{cookie_key}",
        "Path=#{ses_cookie_path}",
        "Port=#{server_port}",
        "Max-Age=#{ses_cookie_max_age}",
        "Expires=#{ses_cookie_expires}",
        "Comment=#{ses_cookie_comment}",
        "Domain=#{ses_cookie_domain}"
      ]
    
      ### Sets the set-cookie header
      response['Set-Cookie'] = ses_cookie_arr.join('; ')
    end
    
    def expire_ses_by_req( req, res )
      
      cookie_raw = req.cookies
      
      # checks, if a cookie named 'ses_key' is found
      if cookie_raw.has_key?('ses_key')
        
        # gets just the data itself (discards comment, domain, expiration etc)
        cookie_key = cookie_raw['ses_key'].split(';')[0]
        
      end
      
      # if a cookie key is found (non-false), checks if it's valid
      if cookie_key
        
        # checks for validity by looking the key up in @session_cookie_keys
        cookie_key_exist = @session_cookie_keys.has_key?( cookie_key )
        
        # sets the cookie key to false, if it doesn't exist
        cookie_key = false unless cookie_key_exist
        
      end
      
      # at this point, the cookie key seems valid:
      if cookie_key and cookie_key_exist
        
        # get the session identifier
        ses_id = @session_cookie_keys[ cookie_key ]
        
        # Expire the session
        # expire_session( ses_id )
        
        return true
        
      end
      
      return false
    end
    
    ### Creates a message and checks the session
    def init_msg( request, response, options = { :cookies => false, :servlet => false } )
      
      cookies = options[:cookies]
      
      if options.has_key?(:query)
        query = options[:query]
      else
        query = request.query
      end
      
      ## The 'ses_id' request query key is required.
      ## The client defaults to '0', which means the
      ## client needs to be initialized.
      ## The client's ses_id is the server's ses_key.
      if not options.has_key?( :ses_key )
        return Message.new( @transporter, request, response, options )
      else
        
        ## get the ses_key from the request query:
        ses_key = options[:ses_key]

        ## The message object binds request, response
        ## and all user/session -related data to one
        ## object, which is passed around where
        ## request/response/user/session -related
        ## data is needed.
        msg = Message.new( @transporter, request, response, options )
        
        ## The client tells that its ses_key is '0',
        ## until the server tells it otherwise.
        (req_num, ses_seed) = ses_key.split(':1:')
        
        if req_num == '0'
          
          # If Broker encounters a '/hello' request, it
          # sets cookies to true.
          #
          # It means that a session should have its cookies
          # checked.
          #
          if cookies
            ses_status = check_cookie( msg, ses_seed )
          # Otherwise, a new session is created:
          else
            init_ses( msg, ses_seed )
            ses_status = true
          end
          
        # for non-'0' ses_keys:
        else
          
          ## Validate the session key
          ses_status = check_ses( msg, ses_seed )[0]
          
          ## Renew the cookie even when the request is a "x" (not "hello")
          if @config[:session_cookies] and ses_status
            renew_cookie( msg, msg.session[:cookie_key] )
          end
        
        end # /ses_key
        
        ## msg.ses_valid is false by default, meaning
        ## it's not valid or hasn't been initialized.
        msg.ses_valid = ses_status
        
        return msg
      end # /ses_key
    end # /init_msg
  end
end

