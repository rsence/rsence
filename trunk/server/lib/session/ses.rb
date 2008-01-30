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
  
  
require 'lib/session/msg'
require 'lib/session/randgen'

##
#   HSessionManager is the Helmi Session Manager.
#   It is initalized in HTransporter.
class HSessionManager
  def initialize( valuemanager, system )
    
    ## Counter for unique session id's
    @last_ses_id  = 0
    
    ## Session data storage
    @sessions     = {}
    
    ## Session id by key
    @session_keys = {}
    
    ## Session id by cookie key
    @session_cookie_keys = {}
    
    ## Session key by id
    @session_ids = {}
   
    ## 'Unique' Random String generator
    str_len    = 64   # the length of the string (actually returns 12 chars more)
    min_buffer = 600  # the minimum size the random generated buffer is allowed to be
    @randgen   = HRandgen.new( str_len, min_buffer )
    
    
    minutes  = 60 # seconds
    hours    = 60 * minutes
    days     = 24 * hours
    
    # configure your timeout here, we'll use 15 minutes as a default
    @timeout_secs = 15 * minutes
    
    @valuemanager = valuemanager
    @system       = system
    
    # regex to match ipv4 addresses
    @ipv4_reg = /^([1][0-9][0-9]|[2][0-5][0-9]|[1-9][0-9]|[1-9])\.([1][0-9][0-9]|[2][0-5][0-9]|[1-9][0-9]|[0-9])\.([1][0-9][0-9]|[2][0-5][0-9]|[1-9][0-9]|[0-9])\.([1][0-9][0-9]|[2][0-5][0-9]|[1-9][0-9]|[0-9])$/
  end
  
  ## Returns an unique session identifier
  def new_ses_id
    @last_ses_id += 1
    return @last_ses_id
  end
  
  ## Returns an unique session key
  def new_ses_key
    return @randgen.give_one
  end
  
  ### Create a session
  def init_ses( msg )
    
    time_now = Time.now.to_i # seconds since epoch
    timeout  = time_now + @timeout_secs
    
    ses_id   = new_ses_id
    ses_key  = new_ses_key
    ses_data = {
      :timeout   =>  timeout,
      :ses_id    =>  ses_id
    }
    
    # add the session data to @sessions
    @sessions[ ses_id ] = ses_data
    
    # map the key back to the id
    @session_keys[ ses_key ] = ses_id
    
    # map the id back to the key
    @session_ids[ ses_id ] = ses_key
    
      # map the ses_id to cookie key
    cookie_key = new_ses_key+new_ses_key+new_ses_key
    @session_cookie_keys[ cookie_key ] = ses_id
    
  ### Tell the client what the new key is
    msg.reply "HTransporter.ses_id='#{ses_key}';"
    
    ### Make a common storage object in the client, we'll add value objects to it by name.
    msg.reply "common_values={};"
    
    ### Set the session data and id to the message object
    msg.session = ses_data
    msg.ses_id  = ses_id
    
    msg.new_session = true
    
    return cookie_key
    
  end
  
  ### Returns the current session data, if valid session.
  ### Otherwise stops the client and returns false.
  def check_ses( msg, ses_key )
    if @session_keys.has_key?( ses_key )
      ses_id   = @session_keys[ ses_key ]
      ses_data = @sessions[ ses_id ]
      time_now = Time.now.to_i
      if ses_data[:timeout] < time_now
        #msg.reply "HTransporter.stop();alert('Session timed out. STOP.');"
        msg.reply "jsLoader.load('basic');"
        msg.reply "jsLoader.load('window');"
        msg.reply "jsLoader.load('servermessage');"
        msg.reply "reloadApp = new ReloadApp( 'Session Timeout', 'Your session has timed out. Please reload the page to continue.', '/'  );"
        @session_keys.delete( ses_key )
        @sessions.delete( ses_id )
        return false
      else
        ses_data[:timeout] = time_now + @timeout_secs
      end
      
      ### extra security
      @session_keys.delete( ses_key )
      ses_key = new_ses_key
      @session_keys[ ses_key ] = ses_id
      @session_ids[ ses_id] = ses_key
      msg.reply "HTransporter.ses_id='#{ses_key}';"
      ## /extra security
      
      ### Set the session data and id to the message object
      msg.session = ses_data
      msg.ses_id  = ses_id
      
      return true
    else
      msg.reply "jsLoader.load('basic');"
      msg.reply "jsLoader.load('window');"
      msg.reply "jsLoader.load('servermessage');"
      msg.reply "reloadApp = new ReloadApp( 'Invalid Session', 'Your session is invalid. Please reload the page to continue.', '/'  );"
      #msg.reply "HTransporter.stop();alert('Invalid session key. STOP.');"
      return false
    end
  end
  
  ### Creates a message and checks the session
  def init_msg( request, response, cookies=false )
    ## The 'ses_id' request key is required (the client defaults to '0')
    if not request.query.has_key?( 'ses_id' )
      return false
    else
      ses_key = request.query[ 'ses_id' ]
      ## Use a message object to pass arguments to plugin methods
      msg = Message.new( request, response )
      
      msg.valuemanager = @valuemanager
      msg.system       = @system
      
      ## The client tells that its ses_key is '0', until the server tells it otherwise.
      if ses_key == '0'
        if cookies
          cookie_key = false
          request.cookies.each do |cookie|
            if cookie.name == 'ses_key'
              cookie_key = cookie.value
              break
            end
          end
          if cookie_key
            cookie_key_exist = @session_cookie_keys.has_key?( cookie_key )
          end
          if cookie_key and cookie_key_exist
            ses_id = @session_cookie_keys[ cookie_key ]
            ses_key = @session_ids[ ses_id ]
            ses_status = check_ses( msg, ses_key )
            @session_cookie_keys.delete( cookie_key )
            if ses_status
              cookie_key = new_ses_key+new_ses_key+new_ses_key
              @session_cookie_keys[ cookie_key ] = ses_id
              msg.restored_session = true
              @valuemanager.init_ses( msg )
              msg.new_session = false
            else
              cookie_key = false
            end
          else
            cookie_key = false
          end
          unless cookie_key
            cookie_key = init_ses( msg )
            ses_status = true
            ## Makes sure we have value storage for the session
            @valuemanager.init_ses( msg )
          end
          ses_cookie = WEBrick::Cookie.new('ses_key',cookie_key)
          ses_cookie.comment = 'Himle session key (just for your convenience)'
          domain = request.host
          if @ipv4_reg.match(domain)
            ses_cookie.domain  = domain
          elsif domain.include?('.')
            ses_cookie.domain  = ".#{domain}"
          end
          ses_cookie.max_age = @timeout_secs
          ses_cookie.path    = '/hello'
          #ses_cookie.secure  = false
          ses_cookie_str = ses_cookie.to_s
          response['Set-Cookie'] = ses_cookie_str
        else
          ## Initialize a new session
          init_ses( msg )
          ses_status = true
          ## Makes sure we have value storage for the session
          @valuemanager.init_ses( msg )
        end
      else
        ## Check the session by key (check_ses returns the session data)
        ses_status = check_ses( msg, ses_key )
      end # /ses_id
      msg.ses_valid = ses_status
      return msg
    end # /ses_key
  end # /init_msg
end



