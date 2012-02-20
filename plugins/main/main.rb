##   RSence
 #   Copyright 2008 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##


# The MainPlugin is accessible as +@plugins.main+ and just +main+ from other plugins.
#
# = MainPlugin provides mainly client setup and the following services:
# * The root html page, which includes the scripts and sets up client startup variables.
# * The url of the client as a HValue, including the anchor.
#   * Accessible via +msg.session[:main][:location_href]+
# * The local time of the client's web browser as a HValue, as seconds since epoch.
#   * Accessible via +msg.session[:main][:client_time]+
# * Sequential loading. See {#delayed_call #delayed_call}
# * Provides the +#init_ui+ event for plugins that respond to it.
class MainPlugin < Plugin
  
  # # Session-specific index page renderer (unused)
  # def session_index_html( request, response )
  #   
  #   ses_key = @randgen.gen
  #   sha_key = ''
  #   
  #   buffer = [
  #     "var qP=function(cmd){COMM.Queue.push(cmd);};"
  #   ]
  #   
  #   req_num = 0
  #   
  #   3.times do |req_num|
  #     sha_key = Digest::SHA1.hexdigest( ses_key + sha_key )
  #     msg = @plugins.transporter.xhr(
  #       request, response, {
  #         :servlet => true,
  #         :cookie  => (req_num==0),
  #         :query   => {
  #           'ses_key' => "#{req_num}:.o.:#{sha_key}"
  #         }
  #       }
  #     )
  #     buffer += msg.value_buffer
  #     msg.buffer.each do |buffer_item|
  #       buffer.push( "qP(function(){#{buffer_item};});")
  #     end
  #     ses_key = msg.ses_key
  #   end
  #   
  #   buffer.unshift( "COMM.Session.newKey(#{ses_key.to_json});" )
  #   buffer.unshift( "COMM.Session.sha_key=#{sha_key.to_json};" )
  #   buffer.unshift( "COMM.Session.req_num=#{req_num};" )
  #   
  #   index_html = render_index_html
  #   
  #   return index_html.gsub('__STARTUP_SEQUENCE__', buffer.join("\n") )
  # end
  
  
  # Index page renderer
  def render_index_html
    
    index_html = @index_html_src.clone
    
    client_rev = client_pkg.client_cache.client_rev
    deps_src = ''
    @conf[:deps].each do |dep|
      deps_src += %{<script src="#{dep}" type="text/javascript"></script>}
    end
    deps_src += %{<script src="__CLIENT_BASE__/js/#{@conf[:boot_lib]}.js"></script>}
    @conf[:default_libs].each do |dep|
      deps_src += %{<script src="__CLIENT_BASE__/js/#{dep}.js"></script>}
    end
    client_base = File.join(@bconf[:h],client_rev)
    
    index_html.gsub!( '__SCRIPT_DEPS__',   deps_src          )
    index_html.gsub!( '__CLIENT_BASE__',   client_base       )
    index_html.gsub!( '__DEFAULT_TITLE__', @conf[:title]     )
    index_html.gsub!( '__CLIENT_REV__',    client_rev        )
    index_html.gsub!( '__CLIENT_HELLO__',  @bconf[:hello]    )
    index_html.gsub!( '__NOSCRIPT__',      @conf[:noscript]  )
    
    return index_html
  end
  
  
  
  ### Top-level plugin events:
  
  
  # Binds configuration data as instance variables
  def init
    super
    @plugins.register_alias( :main, :index_html )
    @randgen = RandGen.new( 40 )
    ::RSence.config[:index_html][:instance] = self
    @conf  = ::RSence.config[:index_html]
    @bconf = ::RSence.config[:broker_urls]
    @goodbye_uri = File.join(@bconf[:hello],'goodbye')
  end
  
  # Opens and renders the index page template
  def open
    super
    @index_html_src = file_read( ::RSence.config[:index_html][:index_tmpl] )
    render_index_html
  end
  
  # Frees the ticket resource id of the "loading" gif image.
  def close
    super
    @plugins[:ticket].del_rsrc( @loading_gif_id )
  end
  
  
  
  ### Servlet features; responds to GET / as well as POST /hello/goodbye
  
  
  # @private Internal structures, matches the "hello/goodbye" session termination POST request and the "/" index html page GET request
  def match( uri, method )
    if uri == ::RSence.config[:index_html][:respond_address] and ( method == :get or method == :head )
      return true
    elsif method == :post and uri == @goodbye_uri
      return true
    else
      return false
    end
  end
  
  # @private Internal structures, score for the "hello/goodbye" session termination request and the default index html page
  def score
    return 1000 # allows overriding with anything with a score below 1000
  end
  
  # Inspects the http request header to decide if the browser supports gzip compressed responses.
  def support_gzip( header )
    return false if not ::RSence.config[:no_gzip]
    return false if not header.has_key?('accept-encoding')
    return header['accept-encoding'].include?('gzip')
  end
  
  # Outputs the startup web page.
  def get( req, response, ses )
    index_html = render_index_html
    
    response.status = 200
    
    response['Content-Type'] = 'text/html; charset=UTF-8'
    response['Date'] = httime( Time.now )
    response['Server'] = 'RSence'
    response['Cache-Control'] = 'no-cache'
    
    if support_gzip( req.header )
      index_gzip = GZString.new('')
      gzwriter = Zlib::GzipWriter.new( index_gzip, 9 )
      gzwriter.write( index_html )
      gzwriter.close
      response['Content-Length'] = index_gzip.bytesize.to_s
      response['Content-Encoding'] = 'gzip'
      response.body = index_gzip
    else
      response['Content-Length'] = index_html.bytesize.to_s
      response.body = index_html
    end
  end
  
  # Returns the "hello/goodbye" session termination request
  def post( req, res, ses )
    @plugins.sessions.expire_ses_by_req( req, res )
  end
  
  
  
  ### Features accessible from other plugins:
  
  # The +#url_responder+ gets called whenever the anchor (pound) of location.href changes.
  # It enables virtual url events for back/forward buttons and bookmarking in browsers whenever utilized.
  #
  # Client-side support is included in js/url_responder.js
  #
  # Also allows virtual-host -like behavior if utilized.
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
        msg.expire_session()
        msg.reply( [
          'COMM.Transporter.stop=true;',
          "location.href=#{resp_addr.to_json};"
        ].join('') )
      end
      
    else
      ses[:url] = [location_href.data,nil]
    end
    
    # url_responder always accepts locations
    return true
    
  end
  
  
  # Returns base url of browser (before the '#' sign)
  def url( msg )
    get_ses( msg )[:url][0]
  end
  
  
  # Returns pound url of browser (after the '#' sign)
  def pound( msg )
    get_ses( msg )[:url][1]
  end
  
  
  
  ### Session events:
  
  
  # New session initialization, called just once per session.
  def init_ses( msg )
    super
    restore_ses( msg )
  end
  
  def index_deps_setup( msg )
    ses = msg.session
    if not ses.has_key?( :deps )
      # make an array of dependencies for this session, if not already done
      ses[:deps] = []
    end
    compound_pkgs = RSence.config[:client_pkg][:compound_packages]
    boot_dep = @conf[:boot_lib]
    unless ses[:deps].include?( boot_dep )
      if compound_pkgs.include?( boot_dep )
        compound_pkgs[ boot_dep ].each do |pkg_name|
          ses[:deps].push( pkg_name )
          msg.reply(%{jsLoader.loaded("#{pkg_name}");})
        end
      end
      ses[:deps].push( boot_dep )
      msg.reply(%{jsLoader.loaded("#{boot_dep}");})
      if boot_dep == 'rsence'
        ses[:deps].push( 'std_widgets' )
        msg.reply(%{jsLoader.loaded("std_widgets");})
      end
    end
    @conf[:default_libs].each do |dep_lib|
      unless ses[:deps].include?( dep_lib )
        if compound_pkgs.include?( dep_lib )
          compound_pkgs[ dep_lib ].each do |pkg_name|
            ses[:deps].push( pkg_name )
            msg.reply(%{jsLoader.loaded("#{pkg_name}");})
          end
        end
        ses[:deps].push( dep_lib )
        msg.reply(%{jsLoader.loaded("#{dep_lib}");})
      end
    end
  end
  
  # Called once when a session is restored or cloned using the cookie's ses_key
  def restore_ses( msg )
    super
    index_deps_setup( msg )
    ## Resets session data to defaults
    ses = get_ses( msg )
    ses[:boot] = 0
    ses[:url] = [nil,nil]
    ses[:delayed_calls] = []
    ses[:poll_mode] = true
  end
  
  
  # Interface for adding delayed calls
  #
  # When adding a delayed call, use an Array to define a plugin/method with optional arguments that will be called on the next request. The client will call back immediately when a delayed call is pending. The first param of the method is a +msg+. Don't include the +msg+ of the current request in params, it will be inserted automatically for the delayed call.
  #
  # It can also be used for loading sequences to the client, when using a String as the +params+.
  #
  # == Format of +params+ for plugin callback:
  # Array:: [ plugin_name, method_name, *args ]
  #
  # == Format of +params+ for javascript sequences:
  # String:: Javascript to send
  #
  # Calls will be flushed per request with the following conditions:
  # * At most four (4) delayed calls will be processed at a time
  # * If the calls use more than 200ms combined, even less will be processed at a time
  #
  # @param [Message] msg The message instance.
  # @param [Array, String] params The params of the delayed call.
  #
  # @return [nil]
  def delayed_call( msg, params )
    get_ses( msg )[:delayed_calls].push( params )
  end
  
  
  # @private Initializes the client-side COMM.urlResponder and sesWatcher
  def boot0( msg, ses )
    
    msg.reply read_js( 'main' )

    msg.reply("ELEM.setStyle(0,'background-color','#{::RSence.config[:main_plugin][:bg_color]}');")
    
    ## url_responder is bound in the client-space
    ## to tell the server its status by updating its value
    location_href_id = ses[:location_href].val_id.to_json
    msg.reply "try{COMM.Values.values[#{location_href_id}].bind(COMM.urlResponder);}catch(e){console.log('urlResponder failed, reason:',e);}"
    
    ## This enables SesWatcher that changes :client_time every n seconds, which depends on the server_poll_interval configuration setting.
    ## It makes the client to poll the server on regular intervals, when polling mode is disabled.
    # 5000ms = 5secs
    
    client_time_id = ses[:client_time].val_id.to_json
    poll_interval = ::RSence.config[:main_plugin][:server_poll_interval]
    msg.reply "try{window.sesWatcher=COMM.SessionWatcher.nu(#{poll_interval},#{client_time_id});}catch(e){console.log('sesWatcher failed, reason:',e);}"
    
  end
  
  
  # @private Calls the init_ui method of each loaded plugin and removes the loading -message
  def boot1( msg, ses )
    # Delegates the init_ui method to each plugin to signal bootstrap completion.
    msg.plugins.delegate( 'init_ui', msg ) unless ses[:dont_init_ui]
  end
  
  
  # Disables the init_ui event.
  def dont_init_ui( msg )
    get_ses( msg )[:dont_init_ui] = true
  end
  
  
  # Enables the init_ui event.
  def do_init_ui( msg )
    get_ses( msg )[:dont_init_ui] = false
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
  # sets the client to non-polling-mode, having only value synchronization trigger
  # new requests. On the client, SesWatcher forces the change by sending the
  # client time periodically.
  def end_polling( msg, ses )
    if ses[:poll_mode] == true
      msg.reply "COMM.Transporter.poll(0);"
      ses[:poll_mode] = false
    end
  end
  
  # Starts polling mode.
  def start_polling( msg, ses )
    if ses[:poll_mode] == false
      msg.reply( "COMM.Transporter.poll(#{::RSence.config[:transporter_conf][:client_poll_priority]});" )
      ses[:poll_mode] = true
    end
  end
  
  # Called on every request of an active, valid session
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


