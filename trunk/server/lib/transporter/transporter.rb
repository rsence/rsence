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
class HTransporter
  
  ## build the essential structures
  def initialize
    @valuemanager = HValueManager.new
    @system       = HSystem.new( $config[:app_path] )
    @session      = HSessionManager.new( @valuemanager, @system )
  end
  
  ## 
  def from_client(request, response)
    
    ## The response status should always be 200 (OK)
    response.status = 200
    
    # It's better to evaluate plain text than to respond with js.
    response.content_type = 'text/javascript; charset=utf-8'
    response['Cache-Control'] = 'no-cache'
    if request['Accept-Encoding'].include?('gzip')
      response.chunked = true
      response['Content-Encoding'] = 'gzip'
      do_gzip = true
    else
      do_gzip = false
    end
    
    msg = @session.init_msg( request, response )
    
    if request.query.has_key?('err_msg')
      puts
      puts "CLIENT ERROR:"
      pp request.query['err_msg']
      puts
      msg.reply( "HTransporter.stop(); console.log(#{request.query['err_msg'].inspect}); alert('Client Error. STOP.');" )
    end
    
    if msg
      
      if msg.new_session and $config[:debug_mode]
        puts
        puts "new session. rescanning apps."
        puts
        @system.rescan()
      end
      
      ## Pass the client XML to @valuemanager
      if request.query.has_key?( 'HSyncData' )
        syncdata_str = request.query[ 'HSyncData' ]
        @valuemanager.from_client( msg, syncdata_str )
      end
      
      @valuemanager.validate( msg )
      
      ### Allows every application to respond to the idle call
      @system.idle( msg )
      
      ### Process outgoing values to client
      @valuemanager.to_client( msg )
      msg.new_session = false if msg.new_session
      
      ## return the output
      if do_gzip
        outp = GZString.new('')
        gzwriter = Zlib::GzipWriter.new(outp,Zlib::BEST_SPEED)
        gzwriter.write( msg.output.join("\n") )
        gzwriter.close
      else
        outp = msg.output.join("\n")
      end
      response['Content-Size'] = outp.size
      return outp
    else
      return "alert('session failure.');"
    end
  end
  
end

