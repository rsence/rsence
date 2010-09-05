##   RSence
 #   Copyright 2008 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##


# ValueManager synchronizes value objects
require 'values/valuemanager'

# SessionManager creates, validates, stores and expires sessions
require 'session/sessionmanager'

# PluginManager handles all the plugins
require 'plugins/pluginmanager'


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
      @config = RSence.config[:transporter_conf]
      @accept_req = false
      @valuemanager = ValueManager.new
      @sessions = SessionManager.new( self )
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
      @plugins.shutdown
      @sessions.shutdown
    end
  
    def servlet( request_type, request, response )
      broker_urls = RSence.config[:broker_urls]
      uri = request.fullpath
    
      if @plugins.match_servlet( request_type, request, response, {} )
        return true
      elsif request_type == :post
        ## /x handles xhr without cookies
        if uri == broker_urls[:x] and @sessions.accept_requests
          xhr( request, response, { :cookies => true, :servlet => false } )
          return true
        ## /hello handles the first xhr (with cookies, for session key)
        elsif uri == broker_urls[:hello] and @sessions.accept_requests
          xhr( request, response, { :cookies => true, :servlet => false } )
          return true
        end
      end
      return false
    end
  
    # wrapper for the session manager stop client functionality
    def xhr_error_handler(msg,err_name,err_extra_descr='')
      @sessions.stop_client_with_message( msg,
        @config[:messages][err_name][:title],
        @config[:messages][err_name][:descr]+err_extra_descr,
        @config[:messages][err_name][:uri]
      )
    end
  
    # wrapper for tracebacks in xhr
    def xhr_traceback_handler(e,err_descr='Transporter::UnspecifiedError')
      puts "=="*40 if RSence.args[:debug]
      puts err_descr
      if RSence.args[:debug]
        puts "--"*40
        puts e.message
        puts "  #{e.backtrace.join("\n  ")}"
        puts "=="*40
      end
    end
  
    ## handles incoming XMLHttpRequests from the browser
    def xhr(request, response, options = { :cookies => false, :servlet => false } )
    
      session_conf = RSence.config[:session_conf]
    
      options[:cookies] = false unless options.has_key?(:cookies)
    
      if session_conf[:session_cookies] and session_conf[:trust_cookies]
        options[:cookies] = true
      end
    
      # Creates the msg object, also checks or creates a new session; verifies session keys and such
      msg = @sessions.init_msg( request, response, options )
    
      response_success = true
    
      # If the client encounters an error, display error message
      if request.query.has_key?('err_msg')
        response_success = false
        client_error_msg = request.query['err_msg'].inspect
        puts "\nCLIENT ERROR:\n#{client_error_msg}\n" if RSence.args[:debug]
        xhr_error_handler(msg,:client_error,client_error_msg)
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
        if request.query.has_key?( 'values' )
          syncdata_str = request.query[ 'values' ]
          begin
            @valuemanager.xhr( msg, syncdata_str )
          rescue => e
            response_success = false
            xhr_error_handler( msg, :valuemanager_xhr_error, e.message )
            xhr_traceback_handler( e, "Transporter::ValueManagerXHRError: @valuemanager.xhr failed." )
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
              xhr_error_handler( msg, :plugin_delegate_cloned_target_error, e.message )
              xhr_traceback_handler( e, "Transporter::PluginDelegateClonedTargetError: @plugins.delegate 'cloned_target' failed." )
            end
          end
        
          begin
            @plugins.delegate( :restore_ses, msg )
          rescue => e
            response_success = false
            xhr_error_handler( msg, :plugin_delegate_restore_ses_error, e.message )
            xhr_traceback_handler( e, "Transporter::PluginDelegateRestoreSesError: @plugins.delegate 'restore_ses' failed." )
          end
        
        elsif msg.new_session
          begin
            @plugins.delegate( :init_ses, msg )
          rescue => e
            response_success = false
            xhr_error_handler( msg, :plugin_delegate_init_ses_error, e.message )
            xhr_traceback_handler( e, "Transporter::PluginDelegateInitSesError: @plugins.delegate 'init_ses' failed." )
          end
        elsif msg.cloned_targets
          begin
            @plugins.delegate( :cloned_source, msg, msg.cloned_targets )
          rescue => e
            response_success = false
            xhr_error_handler( msg, :plugin_delegate_cloned_source_error, e.message )
            xhr_traceback_handler( e, "Transporter::PluginDelegateClonedSourceError: @plugins.delegate 'cloned_source' failed." )
          end
        end
        
        ## Calls validators for changed values
        begin
          @valuemanager.validate( msg )
        rescue => e
          response_success = false
          xhr_error_handler( msg, :valuemanager_validate_error, e.message )
          xhr_traceback_handler( e, "Transporter::ValueManagerValidateError: @valuemanager.validate failed." )
        end
        
        ### Allows every plugin to respond to the idle call
        begin
          @plugins.delegate( :idle, msg )
        rescue => e
          response_success = false
          xhr_error_handler( msg, :plugin_idle_error, e.message )
          xhr_traceback_handler( e, "Transporter::PluginIdleError: @plugins.idle failed." )
        end
        
        ### Processes outgoing values to client
        begin
          @valuemanager.sync_client( msg )
        rescue => e
          response_success = false
          xhr_error_handler( msg, :valuemanager_sync_client_error, e.message )
          xhr_traceback_handler( e, "Transporter::ValueManagerSyncClientError: @valuemanager.sync_client failed." )
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
