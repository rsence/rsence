#--
##   Riassence Framework
 #   Copyright 2008 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##
 #++
class SessionTimeout < ServletPlugin
  def match( uri, request_type )
    if request_type == :post and uri == File.join($config[:broker_urls][:hello],'goodbye')
      return true
    end
    return false
  end
  def post( req, res, ses )
    msg = $SESSION.init_msg( req, res, true )
    msg.expire_session()
    msg.response_done
  end
end
SessionTimeout.new

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
        msg.reply( %{
          COMM.Transporter.stop=true;
          location.href=#{$config[:indexhtml_conf][:respond_address].to_json};
        } )
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
      :location_href => HValue.new(msg,'#'),
      
      ## array for segmented transfers
      :delayed_calls => [],
      
      :poll_mode => true,
      :title_loading => true
      
    }
    
    ## binds the location_href HValue to self::url_responder
    ses[:main][:location_href].bind( 'main', 'url_responder')
  end
  
  # called once when a session is 
  # restored using the cookie's ses_key
  def restore_ses(msg)
    ## Resets session data to defaults
    ses = msg.session
    init_ses(msg) unless ses.has_key?(:main)
    ses[:main][:boot] = 0
    ses[:main][:delayed_calls] = []
    ses[:main][:poll_mode] = true
    ses[:main][:title_loading] = true
  end
  
  def delayed_call(msg,args)
    msg.session[:main][:delayed_calls].push( args )
  end
  
  # called on every request of an
  # active, valid session
  def idle(msg)
    
    init_ses(msg) unless msg.session.has_key?(:main)
    
    mses = msg.session[:main]
    
    ## Prioritizes segmented execution to prevent
    ## the client from choking on itself
    if mses[:boot] == 0
      
      msg.reply("ELEM.setStyle(0,'background-color','#{$config[:main_plugin][:bg_color]}');")
      
      ## url_responder is bound in the client-space
      ## to tell the server its status by updating its value
      # msg.reply require_js('main')
      msg.reply "COMM.Values['#{mses[:location_href].val_id}'].bind(COMM.urlResponder);"
      msg.reply "urlResponder = COMM.URLResponder;" # backwards compatibility
      ## This enables SesWatcher that changes :client_time every 60 seconds.
      ## It makes the client to poll the server on regular intervals, when polling mode
      ## is disabled.
      # 5000ms = 5secs
      msg.reply "sesWatcher = COMM.SessionWatcher.nu(#{$config[:main_plugin][:server_poll_interval]},'#{mses[:client_time].val_id}');"
      
    elsif mses[:boot] == 1
      
      
      # Delegates the init_ui method to each plugin to signal bootstrap completion.
      $PLUGINS.delegate( 'init_ui', msg )
      
      # Deletes the initial "Loading, please wait..." -message
      msg.reply "ELEM.del(ELEM.bindId('loading'));"

      
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
      if mses[:boot] > 1
        if mses[:delayed_calls].empty?
          if mses[:title_loading] == true
            msg.reply( "document.title = #{$config[:indexhtml_conf][:loaded_title].to_json};" )
            mses[:title_loading] = false
          end
          msg.reply( "COMM.Transporter.poll(0);" )
          mses[:poll_mode] = false
        else
          msg.reply( "COMM.Transporter.poll(#{$config[:transporter_conf][:client_poll_priority]});" )
          mses[:poll_mode] = true
        end
      end
      
    ## When nothing is delayed and the fifth poll has been made,
    ## sets the client to non-polling-mode, having only HValue
    ## changes trigger new requests.
    elsif mses[:boot] > 1
      if msg.session[:main][:poll_mode] == true
        if mses[:title_loading] == true
          msg.reply("document.title = #{$config[:indexhtml_conf][:loaded_title].to_json};")
          mses[:title_loading] = false
        end
        msg.reply "COMM.Transporter.poll(0);"
        mses[:poll_mode] = false
      end
    end
    
    ## Increment the counter forever.
    mses[:boot] += 1
    
  end
  
end

## Initialize and register the plugin.
main = Main.new
main.register( "main" )



