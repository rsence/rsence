#--
##   Riassence Framework
 #   Copyright 2008 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##
 #++

class Main < Plugin
  
  def init
    super
    @conf  = ::RSence.config[:index_html]
    @bconf = ::RSence.config[:broker_urls]
  end
  
  def match( uri, request_type )
    if request_type == :post and
       uri == File.join(@bconf[:hello],'goodbye')
      return true
    end
    return false
  end
  
  def score; 100; end
  
  def post( req, res, ses )
    msg = @plugins.sessions.init_msg( req, res, { :cookies => true } )
    msg.expire_session()
    msg.response_done
  end
  
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
    
    ses = get_ses( msg )
    
    # Virtual locations:
    if location_href.data.include?('#')
      
      # split 'http://localhost:8001/#/some_uri'
      #   -> ['http://localhost:8001/','/some_uri']
      ses[:url] = location_href.data.split('#')
      
      virtual_uri = ses[:url][1]
      
      # built-in support for signing out, deletes the
      # server-side session and reloads the page
      if virtual_uri == '/sign_out'
        resp_addr = @conf[:respond_address]
        msg.reply( [
          'COMM.Transporter.stop=true;',
          "location.href=#{resp_addr.to_json};"
        ].join('') )
        msg.expire_session()
      end
      
    else
      ses[:url] = [location_href.data,nil]
    end
    
    # url_responder always accepts locations
    return true
    
  end
  
  
  # new session initialization,
  # called just once per session.
  def init_ses(msg)
    super
    restore_ses( msg )
  end
  
  # called once when a session is 
  # restored using the cookie's ses_key
  def restore_ses(msg)
    super
    ## Resets session data to defaults
    ses = get_ses( msg )
    ses[:boot] = 0
    ses[:url] = [nil,nil]
    ses[:delayed_calls] = []
    ses[:poll_mode] = true
  end
  
  # Interface for adding delayed calls
  def delayed_call( msg, args )
    get_ses( msg )[:delayed_calls].push( args )
  end
  
  # Initializes the client-side COMM.urlResponder and sesWatcher
  def boot0( msg, ses )
    
    msg.reply read_js( 'riassence_ns' )

    msg.reply("ELEM.setStyle(0,'background-color','#{::RSence.config[:main_plugin][:bg_color]}');")
    
    ## url_responder is bound in the client-space
    ## to tell the server its status by updating its value
    location_href_id = ses[:location_href].val_id.to_json
    msg.reply "COMM.Values.values[#{location_href_id}].bind(COMM.urlResponder);"
    
    ## This enables SesWatcher that changes :client_time every 60 seconds.
    ## It makes the client to poll the server on regular intervals, when polling mode
    ## is disabled.
    # 5000ms = 5secs
    
    client_time_id = ses[:client_time].val_id.to_json
    poll_interval = ::RSence.config[:main_plugin][:server_poll_interval]
    msg.reply "sesWatcher = COMM.SessionWatcher.nu(#{poll_interval},#{client_time_id});"
    
    
  end
  
  # Calls the init_ui method of each loaded plugin and removes the loading -message
  def boot1( msg, ses )
    # Delegates the init_ui method to each plugin to signal bootstrap completion.
    msg.plugins.delegate( 'init_ui', msg ) unless ses[:dont_init_ui]
  end
  
  def dont_init_ui( msg )
    get_ses( msg )[:dont_init_ui] = true
  end
  
  # Flushes commands in the :delayed_calls array
  def flush_delayed( msg, ses )
    ## Limits the amount of delayed calls to process to 4.
    ## Prevents the client from choking even when the server
    ## load is light.
    if ses[:delayed_calls].size < 4
      call_count = ses[:delayed_calls].size
    else
      call_count = 4
    end
    
    time_start = Time.now.to_f
    time_taken = 0.0
    
    ## process delayed calls, until:
    ## - over 200ms of cpu time has been spent
    ## - the :delayed_calls -array is empty
    ## - call_count limit is reached
    until time_taken > 0.2 or ses[:delayed_calls].size == 0 or call_count == 0
      # gets the next call
      delayed_call = ses[:delayed_calls].shift
      if RSence.args[:debug]
        puts "delayed_call: #{delayed_call.inspect}"
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
    if ses[:boot] > 1
      if ses[:delayed_calls].empty?
        end_polling( msg, ses )
      else
        start_polling( msg, ses )
      end
    end
  end
  
  # When nothing is delayed and the second poll has been made (init_ui called),
  # sets the client to non-polling-mode, having only HValue
  # changes trigger new requests. SesWatcher makes this happen
  # regularly.
  def end_polling( msg, ses )
    if ses[:poll_mode] == true
      msg.reply "COMM.Transporter.poll(0);"
      ses[:poll_mode] = false
    end
  end
  
  # Starts polling.
  def start_polling( msg, ses )
    if ses[:poll_mode] == false
      msg.reply( "COMM.Transporter.poll(#{::RSence.config[:transporter_conf][:client_poll_priority]});" )
      ses[:poll_mode] = true
    end
  end
  
  # called on every request of an
  # active, valid session
  def idle(msg)
    
    ses = get_ses( msg )
    
    if ses[:boot] == 0
      boot0( msg, ses )
    elsif ses[:boot] == 1
      boot1( msg, ses )
    elsif not ses[:delayed_calls].empty?
      flush_delayed( msg, ses )
    elsif ses[:boot] > 1
      end_polling( msg, ses )
    end
    ## Increment the counter forever.
    ses[:boot] += 1
  end
  
end

## Initialize and register the plugin.
main = Main.new.register( :main )



