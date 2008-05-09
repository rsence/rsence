###
  # HIMLE RIA Server
  # Copyright (C) 2008 HIMLE GROUP http://himle.sorsacode.com/
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

class Main < Plugin
  
  # url_responder gets called whenever the
  # page location.href changes, enabled virtual uris
  # to enable back/forward/bookmarking in browsers,
  # when software is coded to support it.
  #
  # Client-side support is included in js/url_responder.js
  #
  # Also allows virtual-host -like behavior, if software
  # is coded to support it.
  def url_responder(msg,location_href)
    
    mses = msg.session[:main]
    
    # Virtual locations:
    if location_href.data.include?('#')
      
      # split 'http://localhost:8001/#/some_uri'
      #   -> ['http://localhost:8001/','/some_uri']
      mses[:url] = location_href.data.split('#')
      
      virtual_uri = mses[:url][1]
      
      # built-in support for signing out, deletes the
      # server-side session and reloads the page
      if virtual_uri == '/sign_out'
        msg.reply( "location.href='/?';" )
        msg.expire_session()
      end
      
    else
      
      # assigns only a virtual url
      mses[:url] = [location_href.data]
      
    end
    
    # url_responder always accepts locations
    return true
    
  end
  
  
  # new session initialization,
  # called just once per session.
  def init_ses(msg)
    
    ses = msg.session
    
    ## Creates :main hash in msg.session, common stuff
    ## that removes unneccessary duplicates in other plugins.
    ses[:main] = {
      
      # 'boot' state, gets incremented on each request.
      :boot => 0,
      
      # [real,virtual] url
      :url  => [nil,nil],
      
      # the date/time of the client
      :client_time => HValue.new( msg, 0 ),
      
      # the location.href value of the client
      :location_href => HValue.new(msg,''),
      
      ## array for segmented transfers
      :delayed_calls => []
      
    }
    
    ## binds the location_href HValue to self::url_responder
    ses[:main][:location_href].bind( 'main', 'url_responder')
  end
  
  # called once when a session is 
  # restored using the cookie's ses_key
  def restore_ses(msg)
    
    ## Resets session data to defaults
    ses = msg.session
    init_ses unless ses.has_key?(:main)
    ses[:main][:boot] = 0
    ses[:main][:delayed_calls] = []
  end
  
  # called on every request of an
  # active, valid session
  def idle(msg)
    
    mses = msg.session[:main]
    
    ## Prioritizes segmented execution to prevent
    ## the client from choking on itself
    if mses[:boot] == 0
      
      ## js/start.js includes the client's initial settings
      msg.reply require_js_once(msg,'start')
      
      ## url_responder is bound in the client-space
      ## to tell the server its status by updating its value
      msg.reply require_js_once(msg,'url_responder')
      msg.reply "urlCatcher = new URLCatcher('#{mses[:location_href].val_id}');"
    
    ## Second stage enables SesWatcher that changes :client_time every 60 seconds.
    ## Causes the client to poll the server on regular intervals, when polling mode
    ## is disabled.
    elsif mses[:boot] == 1
      
      # 60000ms = 60secs
      msg.reply "sesWatcher = new SesWatcher(60000,'#{mses[:client_time].val_id}');"
    
    ## Processes delayed calls, if the
    ## :delayed_calls -array contains something to process.
    elsif not mses[:delayed_calls].empty?
      
      ## Limits the amount of delayed calls to process to 4.
      ## Prevents the client from choking even when the server
      ## load is light.
      if mses[:delayed_calls].size < 4
        call_count = mses[:delayed_calls].size
      else
        call_count = 4
      end
      
      time_start = Time.now.to_f
      time_taken = 0.0
      
      ## process delayed calls, until:
      ## - over 200ms of cpu time has been spent
      ## - the :delayed_calls -array is empty
      ## - call_count limit is reached
      until time_taken > 0.2 or mses[:delayed_calls].size == 0 or call_count == 0
        
        # gets the next call
        delayed_call = mses[:delayed_calls].shift
        if $DEBUG_MODE
          puts '-='*30
          puts "delayed_call: #{delayed_call.inspect}"
          puts '=-'*30
        end
        
        # strings are always javascript, used for segmenting client load
        if delayed_call.class == String
          msg.reply delayed_call
        
        # arrays are plugin calls
        elsif delayed_call.class == Array
          
          # ['plugin_name', 'method_name'] pairs call the named plugin:method with just msg
          if delayed_call.size == 2
            (plugin_name,method_name) = delayed_call
            msg.run(plugin_name,method_name,msg)
          
          # if the array contains more items, they are used as additional method params
          else
            (plugin_name,method_name) = delayed_call[0..1]
            method_params = delayed_call[2..-1]
            msg.run(plugin_name,method_name,msg,*method_params)
          end
          
        end
        
        ## calculates time taken
        time_taken = Time.now.to_f - time_start
        
        call_count -= 1
      end
      
      ## Sets the client into poll mode, unless the :delayed_calls -array is empty
      if mses[:boot] > 3
        msg.reply( "HTransporter.setPollMode(#{(not mses[:delayed_calls].empty?).inspect});" )
      end
      
    ## When nothing is delayed and the fifth poll has been made,
    ## sets the client to non-polling-mode, having only HValue
    ## changes trigger new requests.
    elsif mses[:boot] > 3
      msg.reply "HTransporter.setPollMode(false);"
      msg.reply("ELEM.setAttr(0,'title',#{$config[:indexhtml_conf][:loaded_title].inspect});")
    end
    
    ## Increment the counter forever.
    mses[:boot] += 1
    
  end
  
end

## Initialize and register the plugin.
main = Main.new
main.register( "main" )



