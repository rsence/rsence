### AppSpace GZFileServer
##  by  Juha-Jarmo Heinonen (otus@olen.to)
##
## (c) 2007-2008 Juha-Jarmo Heinonen, All Rights Reserved
###

class GZFileServe < HTTPServlet::AbstractServlet
  
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
    ui_path = $config[:ria_paths][:ui_path][1]
    theme_path = File.join( $config[:ria_paths][:theme_path][1], 'default' )
    gfx_path   = File.join(theme_path,'gfx')
    css_path   = File.join(theme_path,'css')
    html_path  = File.join(theme_path,'html')
    @@gz_cache = {}
    @@js_cache = {}
    @@theme_cache = {}
    Dir.entries( ui_path ).each do |path_item|
      file_path = File.join( ui_path, path_item )
      suf = suffix( file_path )
      file_key = path_item[0..-4]
      if suf == '.gz'
        @@gz_cache[file_key] = getfile(file_path)
      elsif suf == '.js'
        @@js_cache[file_key] = getfile(file_path)
      end
    end
    Dir.entries( css_path ).each do |path_item|
      file_path = File.join( css_path, path_item )
      suf = suffix( file_path )
      if suf == '.gz' || suf == '.css'
        file_key = File.join('/default/css',path_item)
        @@theme_cache[file_key] = getfile(file_path)
      end
    end
    Dir.entries( html_path ).each do |path_item|
      file_path = File.join( html_path, path_item )
      suf = suffix( file_path )
      if suf == '.gz' || suf == '.html'
        file_key = File.join('/default/html',path_item)
        @@theme_cache[file_key] = getfile(file_path)
      end
    end
    Dir.entries( gfx_path ).each do |path_item|
      if path_item[0].chr != '.'
        file_path = File.join( gfx_path, path_item )
        file_key = File.join('/default/gfx',path_item)
        @@theme_cache[file_key] = getfile(file_path)
      end
    end
    @@scan_time = File.stat(ui_path).mtime
  end
  def do_GET( request, response )
    response['Date'] = Time.now.gmtime.strftime('%a, %d %b %Y %H:%M:%S %Z')
    response['Cache-Control'] = 'no-cache' if not $config[:cache_maximize]
    response['Expires'] = (Time.now+$config[:cache_expire]).gmtime.strftime('%a, %d %b %Y %H:%M:%S %Z') if $config[:cache_maximize]
    if not defined? @@gz_cache
      do_scan = true
    elsif not @@scan_time == File.stat($config[:ria_paths][:ui_path][1]).mtime
      do_scan = true
    else
      do_scan = false
    end
    scan_dirs if do_scan
    if not request.query.has_key?('js') and not request.query.has_key?('themes')
      response.status = 503
      response.body   = '503 - Invalid Request'
    elsif request.query.has_key?('js')
      if not @@gz_cache.has_key?( request.query['js'] )
        response.status = 404
        response.body   = '404 - Not Found'
      else
        response.status = 200
        response.content_type = 'text/javascript; charset=utf-8'
        if request['Accept-Encoding'].include?('gzip')
          response.chunked = true
          response['Content-Encoding'] = 'gzip'
          response['Last-Modified'] = @@gz_cache[ request.query['js'] ][1]
          response['Content-Size'] = @@gz_cache[ request.query['js'] ][2]
          response.body   = @@gz_cache[ request.query['js'] ][0]
        else
          response['Last-Modified'] = @@js_cache[ request.query['js'] ][1]
          response['Content-Size'] = @@js_cache[ request.query['js'] ][2]
          response.body   = @@js_cache[ request.query['js'] ][0]
        end
      end
    elsif request.query.has_key?('themes')
      if not @@theme_cache.has_key?( request.query['themes'] )
        response.status = 404
        response.body   = '404 - Not Found'
      else
        response.status = 200
        req_key = request.query['themes']
        file_ext = req_key.split('.')[-1]
        response.content_type = {
          'html' => 'text/html; charset=utf-8',
          'css'  => 'text/css; charset=utf-8',
          'png'  => 'image/png',
          'jpg'  => 'image/jpeg',
          'gif'  => 'image/gif'
        }[file_ext]
        if not request['Accept-Encoding'].include?('gzip') or req_key.include?('/gfx/')
          response['Last-Modified'] = @@theme_cache[ req_key ][1]
          response['Content-Size'] = @@theme_cache[ req_key ][2]
          response.body   = @@theme_cache[ req_key ][0]
        else
          response.chunked = true
          response['Last-Modified'] = @@theme_cache[ req_key+'.gz' ][1]
          response['Content-Size'] = @@theme_cache[ req_key+'.gz' ][2]
          response['Content-Encoding'] = 'gzip'
          response.body   = @@theme_cache[ req_key+'.gz' ][0]
        end
      end
    end
  end
  alias do_POST do_GET

end
