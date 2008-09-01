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

## Uncomment, when Rack supports chunked transfers
#require 'zlib'
#
#class GZString < String
#  alias write <<
#end

=begin
  Transporter is the counterpart to the client's HTransporter xhr engine.
=end
class Transporter
  
  def initialize
    @config = $config[:transporter_conf]
  end
  
  ## 
  def xhr(request, response, cookies=false)
    
    ## The response status should always be 200 (OK)
    response.status = 200
    
    # It's better to evaluate plain text than to respond with js.
    response.content_type = 'text/javascript; charset=utf-8'
    response['Cache-Control'] = 'no-cache'
    
    ## Uncomment, when Rack supports chunked transfers:
    if request['Accept-Encoding'] and request['Accept-Encoding'].include?('gzip') and not $config[:no_gzip]
      response['Content-Encoding'] = 'gzip'
      do_gzip = true
    else
      do_gzip = false
    end
    
    msg = $SESSION.init_msg( request, response, cookies )
    
    if request.query.has_key?('err_msg')
      if $DEBUG_MODE
        puts
        puts "CLIENT ERROR:"
        puts request.query['err_msg'].inspect
        puts
      end
      
      $SESSION.stop_client_with_message( msg,
        @config[:messages][:client_error][:title],
        @config[:messages][:client_error][:descr]+request.query['err_msg'].inspect,
        @config[:messages][:client_error][:uri]
      )
    end
    
    #puts "----- valid session: #{msg.inspect} -----"
    
    if msg.ses_valid
      
      if cookies
        msg.reply('HTransporter.url_base="/x";')
      end
      if (msg.new_session or msg.restored_session) and $DEBUG_MODE
        puts
        puts "new session. rescanning apps."
        puts
        begin
          $FILECACHE.check_scan
        rescue => e
          $SESSION.stop_client_with_message( msg,
            @config[:messages][:filecache_error][:title],
            @config[:messages][:filecache_error][:descr]+e.message,
            @config[:messages][:filecache_error][:uri]
          )
          puts "=="*40 if $DEBUG_MODE
          puts "Transporter::FileCacheError: FileCache.check_scan failed."
          if $DEBUG_MODE
            puts "--"*40
            puts e.message
            puts "  #{e.backtrace.join("\n  ")}"
            puts "=="*40
          end
        end
        begin
          $PLUGINS.rescan()
        rescue => e
          $SESSION.stop_client_with_message( msg,
            @config[:messages][:plugins_rescan_error][:title],
            @config[:messages][:plugins_rescan_error][:descr]+e.message,
            @config[:messages][:plugins_rescan_error][:uri]
          )
          puts "=="*40 if $DEBUG_MODE
          puts "Transporter::PluginsRescanError: $PLUGINS.rescan failed."
          if $DEBUG_MODE
            puts "--"*40
            puts e.message
            puts "  #{e.backtrace.join("\n  ")}"
            puts "=="*40
          end
        end
        puts
        puts "rescan done"
        puts
      end
      
      ## Pass the client XML to $VALUES
      if request.query.has_key?( 'HSyncData' )
        syncdata_str = request.query[ 'HSyncData' ]
        begin
          $VALUES.xhr( msg, syncdata_str )
        rescue => e
          $SESSION.stop_client_with_message( msg,
            @config[:messages][:valuemanager_xhr_error][:title],
            @config[:messages][:valuemanager_xhr_error][:descr]+e.message,
            @config[:messages][:valuemanager_xhr_error][:uri]
          )
          puts "=="*40 if $DEBUG_MODE
          puts "Transporter::ValueManagerXHRError: $VALUES.xhr failed."
          if $DEBUG_MODE
            puts "--"*40
            puts e.message
            puts "  #{e.backtrace.join("\n  ")}"
            puts "=="*40
          end
        end
      end
      
      begin
        $VALUES.validate( msg )
      rescue => e
        $SESSION.stop_client_with_message( msg,
          @config[:messages][:valuemanager_validate_error][:title],
          @config[:messages][:valuemanager_validate_error][:descr]+e.message,
          @config[:messages][:valuemanager_validate_error][:uri]
        )
        puts "=="*40 if $DEBUG_MODE
        puts "Transporter::ValueManagerValidateError: $VALUES.validate failed."
        if $DEBUG_MODE
          puts "--"*40
          puts e.message
          puts "  #{e.backtrace.join("\n  ")}"
          puts "=="*40
        end
      end
      
      if msg.restored_session
        msg.session[:deps] = []
        begin
          $PLUGINS.delegate( 'restore_ses', msg )
        rescue => e
          $SESSION.stop_client_with_message( msg,
            @config[:messages][:plugin_delegate_restore_ses_error][:title],
            @config[:messages][:plugin_delegate_restore_ses_error][:descr]+e.message,
            @config[:messages][:plugin_delegate_restore_ses_error][:uri]
          )
          puts "=="*40 if $DEBUG_MODE
          puts "Transporter::PluginDelegateRestoreSesError: $PLUGINS.delegate 'restore_ses' failed."
          if $DEBUG_MODE
            puts "--"*40
            puts e.message
            puts "  #{e.backtrace.join("\n  ")}"
            puts "=="*40
          end
        end
      elsif msg.new_session
        begin
          $PLUGINS.delegate( 'init_ses', msg )
        rescue => e
          $SESSION.stop_client_with_message( msg,
            @config[:messages][:plugin_delegate_init_ses_error][:title],
            @config[:messages][:plugin_delegate_init_ses_error][:descr]+e.message,
            @config[:messages][:plugin_delegate_init_ses_error][:uri]
          )
          puts "=="*40 if $DEBUG_MODE
          puts "Transporter::PluginDelegateInitSesError: $PLUGINS.delegate 'init_ses' failed."
          if $DEBUG_MODE
            puts "--"*40
            puts e.message
            puts "  #{e.backtrace.join("\n  ")}"
            puts "=="*40
          end
        end
      end
      
      ### Allows every plugin to respond to the idle call
      begin
        $PLUGINS.idle( msg )
      rescue => e
        $SESSION.stop_client_with_message( msg,
          @config[:messages][:plugin_idle_error][:title],
          @config[:messages][:plugin_idle_error][:descr]+e.message,
          @config[:messages][:plugin_idle_error][:uri]
        )
        puts "=="*40 if $DEBUG_MODE
        puts "Transporter::PluginIdleError: $PLUGINS.idle failed."
        if $DEBUG_MODE
          puts "--"*40
          puts e.message
          puts "  #{e.backtrace.join("\n  ")}"
          puts "=="*40
        end
      end
      
      ### Process outgoing values to client
      begin
        $VALUES.sync_client( msg )
      rescue => e
        $SESSION.stop_client_with_message( msg,
          @config[:messages][:valuemanager_sync_client_error][:title],
          @config[:messages][:valuemanager_sync_client_error][:descr]+e.message,
          @config[:messages][:valuemanager_sync_client_error][:uri]
        )
        puts "=="*40 if $DEBUG_MODE
        puts "Transporter::ValueManagerSyncClientError: $VALUES.sync_client failed."
        if $DEBUG_MODE
          puts "--"*40
          puts e.message
          puts "  #{e.backtrace.join("\n  ")}"
          puts "=="*40
        end
      end
      
    end
    
    ## return the output
    if do_gzip
      outp = GZString.new('')
      gzwriter = Zlib::GzipWriter.new(outp,Zlib::BEST_SPEED)
      gzwriter.write( msg.buffer.join("\r\n") )
      gzwriter.close
    else
      outp = msg.buffer.join("\r\n")
    end
    response['Content-Size'] = response.body.size
    response.body = outp
  end
  
end

end
end
