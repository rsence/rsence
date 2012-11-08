##   RSence
 #   Copyright 2008 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##


# ValueManager synchronizes value objects
require 'rsence/valuemanager'

# SessionManager creates, validates, stores and expires sessions
require 'rsence/sessionmanager'

# PluginManager handles all the plugins
require 'rsence/pluginmanager'


module RSence
  
  # Transporter handles incoming requests targeted at RSence and distributes calls and data accordingly. It's called via {Broker}.
  # @see Broker
  class Transporter
    
    # The single instance of the {ValueManager}
    # @return [ValueManager]
    attr_accessor :valuemanager
    
    # The single instance of the {SessionManager}
    # @return [SessionManager]
    attr_accessor :sessions
    
    # The main instance of the {PluginManager}
    # @return [PluginManager]
    attr_accessor :plugins
    
    def initialize
      RSence.transporter = self
      @config = RSence.config[:transporter_conf]
      @accept_req = false
      core_pkgs = {
        :core => [:transporter, :session_storage, :session_manager, :value_manager]
      }
      @plugins = PluginManager.new( {
        :plugin_paths => RSence.config[:plugin_paths],
        :transporter => self,
        :autoreload => RSence.args[:autoupdate],
        :name_prefix => false,
        :resolved_deps => core_pkgs[:core],
        :resolved_categories => core_pkgs
      })
      @valuemanager = ValueManager.new
      RSence.value_manager = @valuemanager
      @sessions = SessionManager.new( self )
      @plugins.sessions = @sessions
      @plugins.ticket.set_db_state( @sessions.db_avail )
      RSence.session_manager = @sessions
      if RSence.config[:session_conf][:reset_sessions]
        puts "Resetting all sessions..."
        @sessions.reset_sessions()
      else
        @sessions.restore_sessions()
      end

      if RSence.launch_pid != Process.pid
        Process.kill( 'TERM', RSence.launch_pid )
      end
    end
  
    def online?
      @accept_req
    end
  
    def online=(state)
      return if @accept_req == state
      if RSence.args[:verbose]
        if state
          puts "RSence is online now."
        else
          puts "RSence is offline now."
        end
      end
      @accept_req = state
    end
  
    def shutdown
      online=false
      @sessions.shutdown
      @plugins.shutdown
    end
  
    def servlet( request_type, request, response )
      broker_urls = RSence.config[:broker_urls]
      uri = request.fullpath
    
      if request_type == :post
        ## /x handles sync without cookies
        if uri == broker_urls[:x] and @sessions.accept_requests
          sync( request, response, { :cookies => true, :servlet => false } )
          return true
        ## /hello handles the first sync (with cookies, for session key)
        elsif uri == broker_urls[:hello] and @sessions.accept_requests
          sync( request, response, { :cookies => true, :servlet => false } )
          return true
        end
      end
      return @plugins.match_servlet( request_type, request, response, @sessions.servlet_cookie_ses( request, response ) )
    end
  
    # wrapper for the session manager stop client functionality
    def sync_error_handler(msg,err_name,err_extra_descr='')
      @sessions.stop_client_with_message( msg,
        @config[:messages][err_name][:title],
        @config[:messages][err_name][:descr]+err_extra_descr,
        @config[:messages][err_name][:uri]
      )
    end
  
    # wrapper for tracebacks in sync
    def sync_traceback_handler(e,err_descr='Transporter::UnspecifiedError')
      puts "=="*40 if RSence.args[:debug]
      puts err_descr
      if RSence.args[:debug]
        puts "--"*40
        puts e.message
        puts "  #{e.backtrace.join("\n  ")}"
        puts "=="*40
      end
    end

    def find_client_sync_error( options )
      return false if options.length == 0
      errors = []
      options.each do |err|
        if err.class == Hash and err.has_key?('err_msg')
          errors.push( err['err_msg'] )
        end
      end
      return false if errors.length == 0
      return errors
    end
  
    ## handles incoming XMLHttpRequests from the browser
    def sync(request, response, options = { :cookies => false, :servlet => false } )
      request_body = request.body.read
      begin
        request_content = JSON.parse( request_body )
      rescue JSON::ParseError
        warn "Request body isn't valid JSON: #{request_body}"
        request_content = ['-1:.o.:INVALID',{},[]]
      end
      options[:ses_key] = request_content[0]
      options[:values] = request_content[1]
      options[:messages] = request_content[2]

      session_conf = RSence.config[:session_conf]
    
      options[:cookies] = false unless options.has_key?(:cookies)
    
      if session_conf[:session_cookies] and session_conf[:trust_cookies]
        options[:cookies] = true
      end
    
      # Creates the msg object, also checks or creates a new session; verifies session keys and such
      msg = @sessions.init_msg( request, response, options )
    
      response_success = true
      
      client_errors = find_client_sync_error( options[:messages] )

      # If the client encounters an error, display error message
      if client_errors #request.query.has_key?('err_msg')
        response_success = false
        client_error_msg = client_errors.inspect
        puts "\nCLIENT ERROR:\n#{client_error_msg}\n" if RSence.args[:debug]
        sync_error_handler(msg,:client_error,client_error_msg)
      end
    
      # If the session is valid, continue:
      if msg.ses_valid and response_success
        
        # If cookies are true, it means the url base needs to
        # be changed from /hello to /x to prevent further cookie juggling.
        if options[:cookies] and not options[:servlet]
          conf_sync_url = RSence.config[:broker_urls][:x]
        else
          conf_sync_url = RSence.config[:broker_urls][:hello]
        end
        if msg.request.path != conf_sync_url
          msg.reply("COMM.Transporter.url=#{conf_sync_url.to_json};")
        end
        
        # Appends a 'new session.' message for new sessions in RSence.args[:verbose]:
        if RSence.args[:verbose]
          puts "new session." if msg.new_session
          puts "restored session." if msg.restored_session
          puts "clone source." if msg.cloned_targets
          puts "clone target." if msg.cloned_source
        end
        
        ## Pass the client XML to the value manager
        if options[:values].has_key?('set')#request.query.has_key?( 'values' )
          # syncdata_str = request.query[ 'values' ]
          begin
            @valuemanager.sync( msg, options[:values]['set'] )
          rescue => e
            response_success = false
            sync_error_handler( msg, :valuemanager_sync_error, e.message )
            sync_traceback_handler( e, "Transporter::ValueManagerXHRError: @valuemanager.sync failed." )
          end
        end
      
        ## Calls the restore_ses of plugins, when a session is restored (page reload with previously active session)
        if msg.restored_session
          msg.session[:deps] = []
          
          if msg.cloned_source
            begin
              @plugins.delegate( :cloned_target, msg, msg.cloned_source )
            rescue => e
              response_success = false
              sync_error_handler( msg, :plugin_delegate_cloned_target_error, e.message )
              sync_traceback_handler( e, "Transporter::PluginDelegateClonedTargetError: @plugins.delegate 'cloned_target' failed." )
            end
          end
          
          begin
            @plugins.delegate( :restore_ses, msg )
            msg.session[:plugin_incr] = @plugins.incr
          rescue => e
            response_success = false
            sync_error_handler( msg, :plugin_delegate_restore_ses_error, e.message )
            sync_traceback_handler( e, "Transporter::PluginDelegateRestoreSesError: @plugins.delegate 'restore_ses' failed." )
          end
          
        elsif msg.new_session
          
          begin
            @plugins.delegate( :init_ses, msg )
            msg.session[:plugin_incr] = @plugins.incr
          rescue => e
            response_success = false
            sync_error_handler( msg, :plugin_delegate_init_ses_error, e.message )
            sync_traceback_handler( e, "Transporter::PluginDelegateInitSesError: @plugins.delegate 'init_ses' failed." )
          end
          
        elsif msg.cloned_targets
          
          begin
            @plugins.delegate( :cloned_source, msg, msg.cloned_targets )
          rescue => e
            response_success = false
            sync_error_handler( msg, :plugin_delegate_cloned_source_error, e.message )
            sync_traceback_handler( e, "Transporter::PluginDelegateClonedSourceError: @plugins.delegate 'cloned_source' failed." )
          end
          
        elsif msg.refresh_page?( @plugins.incr ) and @config[:client_autoreload]
          while msg.refresh_page?( @plugins.incr )
            msg.session[:plugin_incr] = @plugins.incr
            sleep 0.5
          end
          # Forces the client to reload, if plugins are incremented
          msg.reply("window.location.reload( true );")
        end
        
        ## Calls validators for changed values
        begin
          @valuemanager.validate( msg )
        rescue => e
          response_success = false
          sync_error_handler( msg, :valuemanager_validate_error, e.message )
          sync_traceback_handler( e, "Transporter::ValueManagerValidateError: @valuemanager.validate failed." )
        end
        
        ### Allows every plugin to respond to the idle call
        begin
          @plugins.delegate( :idle, msg )
        rescue => e
          response_success = false
          sync_error_handler( msg, :plugin_idle_error, e.message )
          sync_traceback_handler( e, "Transporter::PluginIdleError: @plugins.idle failed." )
        end
        
        ### Processes outgoing values to client
        begin
          @valuemanager.sync_client( msg )
        rescue => e
          response_success = false
          sync_error_handler( msg, :valuemanager_sync_client_error, e.message )
          sync_traceback_handler( e, "Transporter::ValueManagerSyncClientError: @valuemanager.sync_client failed." )
        end
        
      else
      
        # session is not valid, the error was set in SessionManager
        response_success = false
      
      end
    
      msg.response_success = response_success
    
      unless options[:servlet]
        msg.response_done()
      end
    
      return msg
    end
  end
end
