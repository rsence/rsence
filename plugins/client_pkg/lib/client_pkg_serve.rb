
module ClientPkgServe
  def broker_urls
    ::RSence.config[:broker_urls]
  end
  
  def match( uri, request_type )
    uri.match( /^#{broker_urls[:h]}/ )
  end
  
  # Helper method to return the time formatted according to the HTTP RFC
  def httime(time)
    return time.gmtime.strftime('%a, %d %b %Y %H:%M:%S %Z')
  end
  
  def build_busy_wait
    while @build_busy
      puts "-- build not finished, waiting.. --"
      sleep 0.4
    end
  end
  
  def set_headers( response )
    # Sets the response date header to the current time:
    response['Date'] = httime( Time.now )
    
    # Controls caching with headers based on the configuration
    if ::RSence.config[:cache_maximize]
      response['Expires'] = httime(Time.now+::RSence.config[:cache_expire])
    else
      response['Cache-Control'] = 'no-cache'
    end
  end
  
  def check_ua( request )
    support_gzip = (request.header.has_key?('Accept-Encoding') and request.header['Accept-Encoding'].include?('gzip'))
    support_gzip = false if ::RSence.config[:no_gzip]
    if request.header.has_key?('User-Agent')
      ua = request.header['User-Agent']
      is_symbian = ua.include?("SymbianOS")
      is_safari  = ((not is_symbian) and ua.include?("WebKit"))
      is_msie = ((not ua.include?("Opera")) and ua.include?("MSIE"))
      is_msie6 = ((not ua.include?("Opera")) and ua.include?("MSIE 6.0"))
    end
    if is_safari
      version = ua.split( 'WebKit/' )[1].split('.')[0].to_i
    else
      version = 0 # not used for others
    end
    return {
      :symbian => is_symbian,
      :safari  => is_safari,
      :msie    => is_msie,
      :msie6   => is_msie6,
      :version => version
    }
  end
  
  def support_gzip?( ua )
    doesnt_support = ( ua[:msie6] or ua[:symbian] or (ua[:safari] and ua[:version] < 533) )
    return ( not doesnt_support )
  end
  
  def serve_htc( request, response, request_path )
    req_file = request_path[3]
    
    # this file is a part of iefix, it injects calls to
    # the ie rendering engine to override stupid behavior
    # when changing element properties
    if request_path.include?('ie_css_element.htc')
      response.status = 200
      response['Content-Type'] = 'text/x-component'
      ## Usually, we don't need it, because the client framework does calls when needed
      response.body = %{<PUBLIC:COMPONENT lightWeight="true"></PUBLIC:COMPONENT>}
      
      ## Enable it to call iefix automatically whenever element properties are changed
      #response.body = %{<PUBLIC:COMPONENT lightWeight="true">\r\n<script type="text/javascript">\r\ntry{element.attachEvent("onpropertychange",iefix.htcElementEntry);}catch(e){}\r\n</script>\r\n</PUBLIC:COMPONENT>}
    
    # this file is a part of iefix, it injects calls to
    # the ie rendering engine to override stupid behavior
    # when changing style properties
    elsif request_path.include?('ie_css_style.htc')
      response.status = 200
      response['Content-Type'] = 'text/x-component'
      
      ## Usually, we don't need it, because the client framework does calls when needed
      response.body = %{<PUBLIC:COMPONENT lightWeight="true"></PUBLIC:COMPONENT>}
      
      ## Enable it to call iefix automatically whenever element properties are changed
      #response.body = %{<PUBLIC:COMPONENT lightWeight="true">\r\n<script type="text/javascript">\r\ntry{element.attachEvent("onreadystatechange",iefix.htcStyleEntry);}catch(e){}\r\n</script>\r\n</PUBLIC:COMPONENT>}
    
    # Other htc requests are invalid
    else
      response.status = 503
      response.body   = '503 - Invalid Request'
    end
  end
  
  def serve_js( request, response, request_path, ua )
    # the file-specific identifier ('core', 'basic' etc)
    req_file = request_path[3][0..-4]
    
    if not @client_cache.js_cache.has_key?( req_file )
      response.status = 404
      response.body   = '/* 404 - Not Found */'
    else
      
      response.status = 200
      response['Content-Type'] = 'text/javascript; charset=utf-8'
      
      # these browsers have issues with gzipped js content
      support_gzip = support_gzip?( ua )
      
      if support_gzip
        #response['Transfer-Encoding'] = 'chunked,gzip'
        response['Last-Modified'] = @client_cache.last_modified
        body = @client_cache.gz_cache[ req_file ]+"\r\n\r\n"
        response['Content-Length'] = body.bytesize.to_s
        response['Content-Encoding'] = 'gzip'
        response.body   = body
      else
        
        response['Last-Modified'] = @client_cache.last_modified
        body = @client_cache.js_cache[ req_file ]
        response['Content-Length'] = body.bytesize.to_s
        response.body = body
        
      end
    end
  end
  
  def serve_theme( request, response, request_path, ua )
    # Get the name of the theme
    theme_name = request_path[3]
    
    # Get the theme resource type (html/css/gfx)
    theme_part = request_path[4].to_sym
    
    # Get the theme resource identifier
    req_file  = request_path[5]
    
    # checks for theme name
    has_theme = @client_cache.theme_cache.has_key?( theme_name )
    
    # checks for theme part (css/html/gfx)
    if theme_part == :css or theme_part == :html
      has_theme_part = false
    else
      has_theme_part = ( has_theme and @client_cache.theme_cache[theme_name].has_key?(theme_part) )
    end
    
    # checks for theme file
    has_theme_file = ( has_theme_part and @client_cache.theme_cache[theme_name][theme_part].has_key?( req_file ) )
    
    if not has_theme
      response.status = 404
      response.body   = '404 - Theme Not Found'
      puts "Theme #{theme_name} not found, avail: #{@client_cache.theme_cache.keys.join(', ')}" if RSence.args[:verbose]
    elsif not has_theme_part
      response.status = 503
      response.body   = '503 - Invalid Theme Part Request'
    elsif not has_theme_file
      response.status = 404
      response.body   = '404 - Theme Resource Not Found'
      puts "File not found, avail: #{@client_cache.theme_cache[theme_name][theme_part].keys.join(', ')}" if RSence.args[:verbose]
    else
      response.status = 200
      file_ext = req_file.split('.')[-1]
      response['Content-Type'] = {
        'png'  => 'image/png',
        'jpg'  => 'image/jpeg',
        'gif'  => 'image/gif',
        'swf'  => 'application/x-shockwave-flash'
      }[file_ext]
      # Special IE6 condition to serve gifs instead of png's, because it works much better
      # than using the ActiveX alpha filter hack
      if ua[:msie6] and req_file[-4..-1] == '.png'
        ie6_req_png2gif = req_file.gsub('.png','-ie6.gif')
        req_file = ie6_req_png2gif if @client_cache.theme_cache[theme_name][theme_part].include?(ie6_req_png2gif)
      end
      response['Last-Modified'] = @client_cache.last_modified
      body = @client_cache.theme_cache[theme_name][theme_part][req_file]
      if body.nil?
        warn "ClientPkgServe#get: empty body for #{request.path}"
        body = ''
      end
      response['Content-Length'] = body.bytesize.to_s
      response.body = body
    end
  end
  
  ## Responds to get-requests
  def get( request, response, session )
    
    build_busy_wait
    
    ua = check_ua( request )
    
    set_headers( response )
    
    ## Split path into an array for determining what to serve
    request_uri = '/'+request.path.match( /^#{::RSence.config[:broker_urls][:h]}(.*)$/ )[1]
    
    request_path = request_uri.split( '/' )
    
    ## Requested type of client resource (js/themes)
    req_type = request_path[2]
    
    unless ['js','themes'].include? req_type
      req_rev = req_type
      req_type = request_path[3]
      request_path.delete_at(2)
    end
    
    ## Special rules for the special browser
    if request.path.end_with?('.htc')
      serve_htc( request, response, request_path )
    ## Serve compiled client javascript component files:
    elsif req_type == 'js'
      serve_js( request, response, request_path, ua )
    ## Serve client theme files
    elsif req_type == 'themes'
      serve_theme( request, response, request_path, ua )
    end
    
  end
end


