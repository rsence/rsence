###
  # HIMLE RIA Server
  # Copyright (C) 2008 HIMLE GROUP http://himle.sorsacode.com/
  # Copyright (C) 2006-2007 Helmi Technologies Inc.
  #  
  #  This program is free software; you can redistribute it and/or modify it under the terms
  #  of the GNU General Public License as published by the Free Software Foundation;
  #  either version 2 of the License, or (at your option) any later version. 
  #  This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
  #  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
  #  See the GNU General Public License for more details. 
  #  You should have received a copy of the GNU General Public License along with this program;
  #  if not, write to the Free Software Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
  ###

require 'zlib'

require 'lib/session/ses'

require 'lib/sys/system'

require 'lib/valuemanager/valuemanager'

class GZString < String
  alias write <<
end

###
##  HTransporter is the real request/response handler for HFrontEnd.
##   - It is initialized as a single instance in HFrontEnd.
##   - It is called by the HFrontEnd::Broker servlet.
##
##  HTransporter functionality:
##   - Initializes HSessionManager, HSystem and HValueManager once, then passes messages to the instances.
##   - Initializes new Messages for requests and finally sends its response buffer to the client.
##
class Transporter
  
  ## build the essential structures
  def initialize
    @system       = HSystem.new( $config[:app_paths] )
    @valuemanager = HValueManager.new
    @session      = HSessionManager.new( @valuemanager, @system )
  end
  
  ## expires session: ses_id
  def expire_session( ses_id )
    #puts "HTransporter.expire_session( #{ses_id.inspect} )"
    @session.expire_session( ses_id )
    #puts "/HTransporter.expire_session"
  end
  
  def shutdown
    @system.shutdown
    @valuemanager.shutdown
    @session.shutdown
  end
  
  ## 
  def from_client(request, response, cookies=false)
    
    ## The response status should always be 200 (OK)
    response.status = 200
    
    # It's better to evaluate plain text than to respond with js.
    response.content_type = 'text/javascript; charset=utf-8'
    response['Cache-Control'] = 'no-cache'
    
    ## Uncomment, when Rack supports chunked transfers:
    #if request['Accept-Encoding'] and request['Accept-Encoding'].include?('gzip') and not $config[:no_gzip]
    #  response.chunked = true
    #  response['Content-Encoding'] = 'gzip'
    #  do_gzip = true
    #else
    #  do_gzip = false
    #end
    
    msg = @session.init_msg( request, response, cookies )
    
    if request.query.has_key?('err_msg')
      if $config[:debug_mode]
        puts
        puts "CLIENT ERROR:"
        pp request.query['err_msg']
        puts
      end
      msg.reply "jsLoader.load('basic');jsLoader.load('window');jsLoader.load('servermessage');"
      msg.reply "reloadApp = new ReloadApp( 'Client Error', 'Your web browser has encountered an javascript error. Please reload the page to continue.', '/'  );"
      
      msg.reply( "HTransporter.syncDelay=-1;" )
      #console.log(#{request.query['err_msg'].inspect});alert('Client Error. STOP.');" )
    end
    
    #puts "----- valid session: #{msg.inspect} -----"
    
    if msg.ses_valid
      
      if cookies
        msg.reply('HTransporter.url_base="/ui";')
      end
      if (msg.new_session or msg.restored_session) and $config[:debug_mode]
        puts
        puts "new session. rescanning apps."
        puts
        $config[:gzfilecache].check_scan
        @system.rescan()
        puts
        puts "rescan done"
        puts
      end
      
      ## Pass the client XML to @valuemanager
      if request.query.has_key?( 'HSyncData' )
        syncdata_str = request.query[ 'HSyncData' ]
        @valuemanager.from_client( msg, syncdata_str )
      end
      
      @valuemanager.validate( msg )
      
      if msg.restored_session
        msg.session[:deps] = []
        @system.delegate( 'restore_ses', msg )
      elsif msg.new_session
        @system.delegate( 'init_ses', msg )
      end
      
      ### Allows every application to respond to the idle call
      @system.idle( msg )
      
      ### Process outgoing values to client
      @valuemanager.to_client( msg )
      
    end
    
    ## return the output
    #if do_gzip
    #  outp = GZString.new('')
    #  gzwriter = Zlib::GzipWriter.new(outp,Zlib::BEST_SPEED)
    #  gzwriter.write( msg.output.join("\r\n") )
    #  gzwriter.close
    #else
    #outp = msg.output.join("\r\n")
    #end
    response['Content-Size'] = response.body.size
    #return outp
    #response.body = outp
  end
  
end

