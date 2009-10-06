# -* coding: UTF-8 -*-
###
  # Riassence Core -- http://rsence.org/
  #
  # Copyright (C) 2007 Juha-Jarmo Heinonen <jjh@riassence.com>
  #
  # This file is part of Riassence Core.
  #
  # Riassence Core is free software: you can redistribute it and/or modify
  # it under the terms of the GNU General Public License as published by
  # the Free Software Foundation, either version 3 of the License, or
  # (at your option) any later version.
  #
  # Riassence Core is distributed in the hope that it will be useful,
  # but WITHOUT ANY WARRANTY; without even the implied warranty of
  # MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  # GNU General Public License for more details.
  #
  # You should have received a copy of the GNU General Public License
  # along with this program.  If not, see <http://www.gnu.org/licenses/>.
  #
  ###

module Riassence
module Server

=begin
 FileServe serves javascript and (css/html/image) theme files needed by the client from FileCache
=end
class FileServe
  
  # Helper method to return the time formatted according to the HTTP RFC
  def httime(time)
    return time.gmtime.strftime('%a, %d %b %Y %H:%M:%S %Z')
  end
  
  ## Responds to get-requests
  def get( request, response )
    
    # Sets the response date header to the current time:
    response['Date'] = httime( Time.now )
    
    # Controls caching with headers based on the configuration
    if $config[:cache_maximize]
      response['Expires'] = httime(Time.now+$config[:cache_expire])
    else
      response['Cache-Control'] = 'no-cache'
    end
    
    support_gzip = (request.header.has_key?('accept-encoding') and request.header['accept-encoding'].include?('gzip'))
    support_gzip = false if $config[:no_gzip]
    if request.header.has_key?('user-agent')
      ua = request.header['user-agent']
      is_symbian = ua.include?("SymbianOS")
      is_safari  = ((not is_symbian) and ua.include?("WebKit"))
      is_msie = ((not ua.include?("Opera")) and ua.include?("MSIE"))
      is_msie6 = ((not ua.include?("Opera")) and ua.include?("MSIE 6.0"))
    end
    
    ## Split path into an array for determining what to serve
    request_uri = '/'+request.path.match( /^#{$config[:broker_urls][:h]}(.*)$/ )[1]
    
    request_path = request_uri.split( '/' )
    
    ## Requested type of client resource (js/themes)
    req_type = request_path[2]
    
    if not ['js','themes'].include? req_type
      req_rev = req_type
      req_type = request_path[3]
      request_path.delete_at(2)
    end
    
    ## Special rules for the special browser
    if request.path.include?('.htc')
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
      
    ## Serve compiled client javascript component files:
    elsif req_type == 'js'
      
      # the file-specific identifier ('core', 'basic' etc)
      req_file = request_path[3][0..-4]
      
      if not $FILECACHE.js_cache.has_key?( req_file )
        response.status = 404
        response.body   = '/* 404 - Not Found */'
      else
        response.status = 200
        response.content_type = 'text/javascript; charset=utf-8'
        
        # these browsers have issues with gzipped js content
        support_gzip = false if (is_safari or is_msie or is_symbian)
        
        if support_gzip
          #response['Transfer-Encoding'] = 'chunked,gzip'
          response['Last-Modified'] = $FILECACHE.gz_cache[ req_file ][1]
          response['Content-Length'] = $FILECACHE.gz_cache[ req_file ][2]
          response['Content-Encoding'] = 'gzip'
          response.body   = $FILECACHE.gz_cache[ req_file ][0]+"\r\n\r\n"
        else
        
          response['Last-Modified'] = $FILECACHE.js_cache[ req_file ][1]
          response['Content-Length'] = $FILECACHE.js_cache[ req_file ][2]
          response.body = $FILECACHE.js_cache[ req_file ][0]
        
        end
      end
    
    ## Serve client theme files
    elsif req_type == 'themes'
      
      # Get the name of the theme
      theme_name = request_path[3]
      
      # Get the theme resource type (html/css/gfx)
      theme_part = request_path[4]
      
      # Get the theme resource identifier
      req_file  = request_path[5]
      
      # checks for theme name
      has_theme = $FILECACHE.theme_cache.has_key?( theme_name )
      
      # checks for theme part (css/html/gfx)
      has_theme_part = has_theme and $FILECACHE.theme_cache[theme_name].has_key?( theme_part )
      
      # checks for theme file
      has_theme_file = has_theme_part and $FILECACHE.theme_cache[theme_name][theme_part].has_key?( req_file )
      
      if not has_theme_file and theme_file == 'common.css'
        response.status = 200
        response.content_type = 'text/css'
        response.body = ''
      end
      
      if not has_theme
        response.status = 404
        response.body   = '404 - Theme Not Found'
        puts "Theme not found, avail: #{$FILECACHE.theme_cache.inspect}" if $DEBUG_MODE
      elsif not has_theme_part
        response.status = 503
        response.body   = '503 - Invalid Theme Part Request'
      elsif not has_theme_file
        response.status = 404
        response.body   = '404 - Theme Resource Not Found'
        puts "File not found, avail: #{$FILECACHE.theme_cache[theme_name][theme_part].keys.inspect}" if $DEBUG_MODE
      else
        
        response.status = 200
        
        file_ext = req_file.split('.')[-1]
        response.content_type = {
          'html' => 'text/html; charset=utf-8',
          'css'  => 'text/css; charset=utf-8',
          'png'  => 'image/png',
          'jpg'  => 'image/jpeg',
          'gif'  => 'image/gif',
          'swf'  => 'application/x-shockwave-flash'
        }[file_ext]
        
        support_gzip = false if theme_part == 'gfx'
        support_gzip = false if (is_safari or is_msie or is_symbian)
        
        if support_gzip
          response['Last-Modified'] = $FILECACHE.theme_cache[theme_name][theme_part][ req_file+'.gz' ][1]
          response['Content-Length'] = $FILECACHE.theme_cache[theme_name][theme_part][ req_file+'.gz' ][2]
          response['Content-Encoding'] = 'gzip'
          response.body   = $FILECACHE.theme_cache[theme_name][theme_part][ req_file+'.gz' ][0]
        else
          
          # Special IE6 condition to serve gifs instead of png's, because it works much better
          # than using the ActiveX alpha filter hack
          if is_msie6 and req_file[-4..-1] == '.png'
            ie6_req_png2gif = req_file.gsub('.png','-ie6.gif')
            req_file = ie6_req_png2gif if $FILECACHE.theme_cache[theme_name][theme_part].include?(ie6_req_png2gif)
          end
        
          response['Last-Modified'] = $FILECACHE.theme_cache[theme_name][theme_part][ req_file ][1]
          response['Content-Length'] = $FILECACHE.theme_cache[theme_name][theme_part][ req_file ][2]
          response.body = $FILECACHE.theme_cache[theme_name][theme_part][ req_file ][0]
          
        end
      end
      
    end
    
  end
  
end

end
end