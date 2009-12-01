#--
##   Riassence Framework
 #   Copyright 2008 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##
 #++

module Riassence
module Server

=begin
  Transporter is the counterpart to the client's HTransporter xhr engine.
=end

class Transporter
  
  def initialize
    @config = $config[:transporter_conf]
  end
  
  def servlet( request_type, request, response )
    #msg = $SESSION.init_msg( request, response, true )
    #session = msg.session
    session = {}
    $PLUGINS.match_servlet( request_type, request, response, session )
  end
  
  ## handles incoming SOAP requests
  def soap(request, response)
    PluginManager.soap( request, response )
  end
  
  # wrapper for the session manager stop client functionality
  def xhr_error_handler(msg,err_name,err_extra_descr='')
    $SESSION.stop_client_with_message( msg,
      @config[:messages][err_name][:title],
      @config[:messages][err_name][:descr]+err_extra_descr,
      @config[:messages][err_name][:uri]
    )
  end
  
  # wrapper for tracebacks in xhr
  def xhr_traceback_handler(e,err_descr='Transporter::UnspecifiedError')
    puts "=="*40 if $DEBUG_MODE
    puts err_descr
    if $DEBUG_MODE
      puts "--"*40
      puts e.message
      puts "  #{e.backtrace.join("\n  ")}"
      puts "=="*40
    end
  end
  
  ## handles incoming XMLHttpRequests from the browser
  def xhr(request, response, cookies=false)
    
    cookies = false unless $config[:session_conf][:session_cookies]
    
    # Creates the msg object, also checks or creates a new session; verifies session keys and such
    msg = $SESSION.init_msg( request, response, cookies )
    
    response_success = true
    
    # If the client encounters an error, display error message
    if request.query.has_key?('err_msg')
      response_success = false
      client_error_msg = request.query['err_msg'].inspect
      puts "\nCLIENT ERROR:\n#{client_error_msg}\n" if $DEBUG_MODE
      xhr_error_handler(msg,:client_error,client_error_msg)
    end
    
    # If the session is valid, continue:
    if msg.ses_valid and response_success
      
      # If cookies are true, it means the url base needs to
      # be changed from /hello to /x to prevent further cookie juggling.
      if cookies
        msg.reply("COMM.Transporter.url=#{$config[:broker_urls][:x].to_json};")
      end
      
      # Appends a 'new session.' message for new sessions in $DEBUG_MODE:
      puts "new session." if msg.new_session and $DEBUG_MODE
      puts "restored session." if msg.restored_session and $DEBUG_MODE
      puts "clone source." if msg.cloned_targets and $DEBUG_MODE
      puts "clone target." if msg.cloned_source and $DEBUG_MODE
      
      ## Pass the client XML to the value manager
      if request.query.has_key?( 'values' )
        syncdata_str = request.query[ 'values' ]
        begin
          $VALUES.xhr( msg, syncdata_str )
        rescue => e
          response_success = false
          xhr_error_handler( msg, :valuemanager_xhr_error, e.message )
          xhr_traceback_handler( e, "Transporter::ValueManagerXHRError: $VALUES.xhr failed." )
        end
      end
      
      ## Calls validators for changed values
      begin
        $VALUES.validate( msg )
      rescue => e
        response_success = false
        xhr_error_handler( msg, :valuemanager_validate_error, e.message )
        xhr_traceback_handler( e, "Transporter::ValueManagerValidateError: $VALUES.validate failed." )
      end
      
      ## Calls the restore_ses of plugins, when a session is restored (page reload with previously active session)
      if msg.restored_session
        
        msg.session[:deps] = []
        
        if msg.cloned_source
          begin
            $PLUGINS.delegate( 'cloned_target', msg, msg.cloned_source )
          rescue => e
            response_success = false
            xhr_error_handler( msg, :plugin_delegate_cloned_target_error, e.message )
            xhr_traceback_handler( e, "Transporter::PluginDelegateClonedTargetError: $PLUGINS.delegate 'cloned_target' failed." )
          end
        end
        
        begin
          $PLUGINS.delegate( 'restore_ses', msg )
        rescue => e
          response_success = false
          xhr_error_handler( msg, :plugin_delegate_restore_ses_error, e.message )
          xhr_traceback_handler( e, "Transporter::PluginDelegateRestoreSesError: $PLUGINS.delegate 'restore_ses' failed." )
        end
        
      elsif msg.new_session
        begin
          $PLUGINS.delegate( 'init_ses', msg )
        rescue => e
          response_success = false
          xhr_error_handler( msg, :plugin_delegate_init_ses_error, e.message )
          xhr_traceback_handler( e, "Transporter::PluginDelegateInitSesError: $PLUGINS.delegate 'init_ses' failed." )
        end
      elsif msg.cloned_targets
        begin
          $PLUGINS.delegate( 'cloned_source', msg, msg.cloned_targets )
        rescue => e
          response_success = false
          xhr_error_handler( msg, :plugin_delegate_cloned_source_error, e.message )
          xhr_traceback_handler( e, "Transporter::PluginDelegateClonedSourceError: $PLUGINS.delegate 'cloned_source' failed." )
        end
      end
      
      ### Allows every plugin to respond to the idle call
      begin
        $PLUGINS.idle( msg )
      rescue => e
        response_success = false
        xhr_error_handler( msg, :plugin_idle_error, e.message )
        xhr_traceback_handler( e, "Transporter::PluginIdleError: $PLUGINS.idle failed." )
      end
      
      ### Processes outgoing values to client
      begin
        $VALUES.sync_client( msg )
      rescue => e
        response_success = false
        xhr_error_handler( msg, :valuemanager_sync_client_error, e.message )
        xhr_traceback_handler( e, "Transporter::ValueManagerSyncClientError: $VALUES.sync_client failed." )
      end
      
    else
      
      # session is not valid, the error was set in SessionManager
      response_success = false
      
    end
    
    msg.response_success = response_success
    
    msg.response_done()
  end
  
end

end
end
