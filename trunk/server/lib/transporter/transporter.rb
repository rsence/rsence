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

require 'http/soap/hsoaplet'

module Himle
module Server

=begin
  Transporter is the counterpart to the client's HTransporter xhr engine.
=end



class Transporter
  
  ## just for testing, for now:
  class TestSoaplet < ::SOAP::RPC::HSoaplet
    def self.test( name='foo' )
      return "Hello, #{name.inspect}"
    end
  end
  
  def initialize
    @config = $config[:transporter_conf]
    @soap_serve = TestSoaplet.new
  end
  
  ## handles incoming SOAP requests
  def soap(request, response)
    #puts 'Transporter.soap'
    #require 'pp'
    #pp request
    #puts request.env['rack.input'].read
    @soap_serve.process( request, response )
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
    
    # Creates the msg object, also checks or creates a new session; verifies session keys and such
    msg = $SESSION.init_msg( request, response, cookies )
    
    # If the client encounters an error, display error message
    if request.query.has_key?('err_msg')
      client_error_msg = request.query['err_msg'].inspect
      puts "\nCLIENT ERROR:\n#{client_error_msg}\n" if $DEBUG_MODE
      xhr_error_handler(msg,:client_error,client_error_msg)
    end
    
    # If the session is valid, continue:
    if msg.ses_valid
      
      # If cookies are true, it means the url base needs to
      # be changed from /hello to /x to prevent further cookie juggling.
      if cookies
        msg.reply('HTransporter.url_base="/x";')
      end
      
      # Appends a 'new session.' message for new sessions in $DEBUG_MODE:
      puts "new session." if (msg.new_session or msg.restored_session) and $DEBUG_MODE
      
      ## Pass the client XML to the value manager
      if request.query.has_key?( 'HSyncData' )
        syncdata_str = request.query[ 'HSyncData' ]
        begin
          $VALUES.xhr( msg, syncdata_str )
        rescue => e
          xhr_errer_handler( msg, :valuemanager_xhr_error, e.message )
          xhr_traceback_handler( e, "Transporter::ValueManagerXHRError: $VALUES.xhr failed." )
        end
      end
      
      ## Calls validators for changed values
      begin
        $VALUES.validate( msg )
      rescue => e
        xhr_errer_handler( msg, :valuemanager_validate_error, e.message )
        xhr_traceback_handler( e, "Transporter::ValueManagerValidateError: $VALUES.validate failed." )
      end
      
      ## Calls the restore_ses of plugins, when a session is restored (page reload with previously active session)
      if msg.restored_session
        msg.session[:deps] = []
        begin
          $PLUGINS.delegate( 'restore_ses', msg )
        rescue => e
          xhr_errer_handler( msg, :plugin_delegate_restore_ses_error, e.message )
          xhr_traceback_handler( e, "Transporter::PluginDelegateRestoreSesError: $PLUGINS.delegate 'restore_ses' failed." )
        end
      elsif msg.new_session
        begin
          $PLUGINS.delegate( 'init_ses', msg )
        rescue => e
          xhr_errer_handler( msg, :plugin_delegate_init_ses_error, e.message )
          xhr_traceback_handler( e, "Transporter::PluginDelegateInitSesError: $PLUGINS.delegate 'init_ses' failed." )
        end
      end
      
      ### Allows every plugin to respond to the idle call
      begin
        $PLUGINS.idle( msg )
      rescue => e
        xhr_errer_handler( msg, :plugin_idle_error, e.message )
        xhr_traceback_handler( e, "Transporter::PluginIdleError: $PLUGINS.idle failed." )
      end
      
      ### Processes outgoing values to client
      begin
        $VALUES.sync_client( msg )
      rescue => e
        xhr_errer_handler( msg, :valuemanager_sync_client_error, e.message )
        xhr_traceback_handler( e, "Transporter::ValueManagerSyncClientError: $VALUES.sync_client failed." )
      end
      
      msg.response_success = true
      
    end
    
    msg.response_done
  end
  
end

end
end
