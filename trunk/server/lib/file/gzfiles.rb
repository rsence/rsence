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

### AppSpace GZFileServer
##  by  Juha-Jarmo Heinonen (otus@olen.to)
##
## (c) 2007-2008 Juha-Jarmo Heinonen, All Rights Reserved
###

class GZFileCache
  attr_reader :busy_scanning, :scan_time, :gz_cache, :js_cache, :theme_cache
  @busy_scanning = false
  def initialize
    scan_dirs
  end
  
  def suffix(file_path)
    return '.'+file_path.split('.')[-1]
  end
  
  def httime(time)
    return time.gmtime.strftime('%a, %d %b %Y %H:%M:%S %Z')
  end
  
  def getfile(path)
    file = open( path, 'rb' )
    data = file.read
    file.close
    stat = File.stat( path )
    return [data,httime(stat.mtime),stat.size]
  end
  
  def scan_dirs
    return if @busy_scanning == true
    #puts '-'*80
    @busy_scanning = true
    ui_path = $config[:ria_paths][:ui_path][1]
    @gz_cache = {}
    @js_cache = {}
    @theme_cache = {}
    Dir.entries( $config[:ria_paths][:theme_path][1] ).each do |theme_name|
      is_dir = File.stat(File.join($config[:ria_paths][:theme_path][1],theme_name)).directory?
      if theme_name[0].chr != '.' and is_dir
        unless @theme_cache.has_key?(theme_name)
          @theme_cache[theme_name] = {'css'=>{},'html'=>{},'gfx'=>{}}
        end
        theme_path = File.join( $config[:ria_paths][:theme_path][1], theme_name )
        gfx_path   = File.join(theme_path,'gfx')
        css_path   = File.join(theme_path,'css')
        html_path  = File.join(theme_path,'html')
        Dir.entries( ui_path ).each do |path_item|
          file_path = File.join( ui_path, path_item )
          suf = suffix( file_path )
          file_key = path_item[0..-4]
          if suf == '.gz'
            @gz_cache[file_key] = getfile(file_path)
          elsif suf == '.js'
            @js_cache[file_key] = getfile(file_path)
          end
        end
        Dir.entries( css_path ).each do |path_item|
          file_path = File.join( css_path, path_item )
          suf = suffix( file_path )
          if suf == '.gz' || suf == '.css'
            @theme_cache[theme_name]['css'][path_item] = getfile(file_path)
          end
        end
        Dir.entries( html_path ).each do |path_item|
          file_path = File.join( html_path, path_item )
          suf = suffix( file_path )
          if suf == '.gz' || suf == '.html'
            @theme_cache[theme_name]['html'][path_item] = getfile(file_path)
          end
        end
        Dir.entries( gfx_path ).each do |path_item|
          if path_item[0].chr != '.'
            file_path = File.join( gfx_path, path_item )
            @theme_cache[theme_name]['gfx'][path_item] = getfile(file_path)
          end
        end
      end
    end
    @scan_time = Time.now
    @busy_scanning = false
  end
  def check_scan
    build_time = File.stat(File.join($config[:ria_paths][:ui_path][1],'built')).mtime
    if @scan_time < build_time and not @busy_scanning
      scan_dirs
    end
  end
end
$config[:gzfilecache] = GZFileCache.new

class GZFileServe < HTTPServlet::AbstractServlet
  def do_GET( request, response )
    response['Date'] = Time.now.gmtime.strftime('%a, %d %b %Y %H:%M:%S %Z')
    response['Cache-Control'] = 'no-cache' if not $config[:cache_maximize]
    response['Expires'] = (Time.now+$config[:cache_expire]).gmtime.strftime('%a, %d %b %Y %H:%M:%S %Z') if $config[:cache_maximize]
    support_gzip = (request.header.has_key?('accept-encoding') and request.header['accept-encoding'].include?('gzip'))
    is_safari = (request.header.has_key?('user-agent') and request.header['user-agent'][0].include?('WebKit'))
    is_msie   = (request.header.has_key?('user-agent') and request.header['user-agent'][0].include?('MSIE'))
    is_msie6  = (request.header.has_key?('user-agent') and request.header['user-agent'][0].include?('MSIE 6.0'))
    request_path = request.path.split('/')
    #puts "request_path: #{request_path.inspect}"
    #request_path: ["", "gz", "js", "core.js"]
    req_type = request_path[2]
    if request.path.include?('.htc')
      req_file = request_path[3]
      if req_file == 'ie_css_element.htc'
        response.status = 200
        response['Content-Type'] = 'text/x-component'
        response.body = %{<PUBLIC:COMPONENT lightWeight="true"></PUBLIC:COMPONENT>}
        #response.body = %{<PUBLIC:COMPONENT lightWeight="true">\r\n<script type="text/javascript">\r\ntry{element.attachEvent("onpropertychange",iefix.htcElementEntry);}catch(e){}\r\n</script>\r\n</PUBLIC:COMPONENT>}
      elsif req_file == 'ie_css_style.htc'
        response.status = 200
        response['Content-Type'] = 'text/x-component'
        response.body = %{<PUBLIC:COMPONENT lightWeight="true"></PUBLIC:COMPONENT>}
        #response.body = %{<PUBLIC:COMPONENT lightWeight="true">\r\n<script type="text/javascript">\r\ntry{element.attachEvent("onreadystatechange",iefix.htcStyleEntry);}catch(e){}\r\n</script>\r\n</PUBLIC:COMPONENT>}
      else
        response.status = 503
        response.body   = '503 - Invalid Request'
      end
    elsif req_type == 'js'
      req_file = request_path[3][0..-4]
      if not $config[:gzfilecache].gz_cache.has_key?( req_file )
        response.status = 404
        response.body   = '404 - Not Found'
      else
        response.status = 200
        response.content_type = 'text/javascript; charset=utf-8'
        if support_gzip and not is_safari and not is_msie
          response.chunked = true
          response['Content-Encoding'] = 'gzip'
          response['Last-Modified'] = $config[:gzfilecache].gz_cache[ req_file ][1]
          response['Content-Size'] = $config[:gzfilecache].gz_cache[ req_file ][2]
          response.body   = $config[:gzfilecache].gz_cache[ req_file ][0]
        else
          response['Last-Modified'] = $config[:gzfilecache].js_cache[ req_file ][1]
          response['Content-Size'] = $config[:gzfilecache].js_cache[ req_file ][2]
          response.body   = $config[:gzfilecache].js_cache[ req_file ][0]
        end
      end
    elsif req_type == 'themes'
      theme_name = request_path[3]
      theme_part = request_path[4]
      req_file  = request_path[5]
      #puts "theme_name: #{theme_name.inspect}, theme_part: #{theme_part.inspect}, req_file: #{req_file.inspect}"
      if not $config[:gzfilecache].theme_cache.has_key?( theme_name )
        response.status = 404
        response.body   = '404 - Theme Not Found'
        puts "Theme not found, avail: #{$config[:gzfilecache].theme_cache.inspect}"
      elsif not $config[:gzfilecache].theme_cache[theme_name].has_key?( theme_part )
        response.status = 503
        response.body   = '503 - Invalid Theme Part Request'
      elsif not $config[:gzfilecache].theme_cache[theme_name][theme_part].has_key?( req_file )
        response.status = 404
        response.body   = '404 - Theme Resource Not Found'
        puts "File not found, avail: #{$config[:gzfilecache].theme_cache[theme_name][theme_part].keys.inspect}"
      else
        response.status = 200
        #req_key = request.query['themes']
        #file_ext = req_key.split('.')[-1]
        file_ext = req_file.split('.')[-1]
        response.content_type = {
          'html' => 'text/html; charset=utf-8',
          'css'  => 'text/css; charset=utf-8',
          'png'  => 'image/png',
          'jpg'  => 'image/jpeg',
          'gif'  => 'image/gif'
        }[file_ext]
        support_gzip = false if theme_part == 'gfx'
        if support_gzip and not is_safari and not is_msie
          response.chunked = true
          response['Last-Modified'] = $config[:gzfilecache].theme_cache[theme_name][theme_part][ req_file+'.gz' ][1]
          response['Content-Size'] = $config[:gzfilecache].theme_cache[theme_name][theme_part][ req_file+'.gz' ][2]
          response['Content-Encoding'] = 'gzip'
          response.body   = $config[:gzfilecache].theme_cache[theme_name][theme_part][ req_file+'.gz' ][0]
        else
          if is_msie6 and req_file[-4..-1] == '.png'
            ie6_req_png2gif = req_file.gsub('.png','-ie6.gif')
            req_file = ie6_req_png2gif if $config[:gzfilecache].theme_cache[theme_name][theme_part].include?(ie6_req_png2gif)
          end
          response['Last-Modified'] = $config[:gzfilecache].theme_cache[theme_name][theme_part][ req_file ][1]
          response['Content-Size'] = $config[:gzfilecache].theme_cache[theme_name][theme_part][ req_file ][2]
          response.body   = $config[:gzfilecache].theme_cache[theme_name][theme_part][ req_file ][0]
        end
      end
    end
  end
  alias do_POST do_GET

end
