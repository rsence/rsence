##   Riassence Framework
 #   Copyright 2009 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##

=begin
 IndexHtmlPlugin is the servlet plugin that is responsible for initializing the "boot-strap page".
 
 It just loads, caches and sends the page for now.
=end
class IndexHtmlPlugin < ServletPlugin
  
  def match( uri, method )
    if uri == $config[:indexhtml_conf][:respond_address] and method == :get
      return true
    else
      return false
    end
  end
  
  def score
    return 1000 # allows overriding with anything with a score below 1000
  end
  
  def init
    $config[:indexhtml_conf][:instance] = self
  end
  
  def open
    @client_rev = $FILECACHE.client_rev
    #@deps = []
    @index_html_src = file_read( $config[:index_html][:index_tmpl] )
    loading_gif = File.read( File.join( @path, 'img/loading.gif' ) )
    @loading_gif_id = $TICKETSERVE.serve_rsrc( loading_gif, 'image/gif' )
    # riassence_gif = File.read( File.join( @path, 'img/riassence.gif' ) )
    # @riassence_gif_id = $TICKETSERVE.serve_rsrc( riassence_gif, 'image/gif' )
    render_index_html
  end
  
  def close
    $TICKETSERVE.del_rsrc( @riassence_gif_id )
    $TICKETSERVE.del_rsrc( @loading_gif_id )
  end
  
  def render_index_html
    
    @index_html = @index_html_src.clone
    
    @index_html.gsub!('__DEFAULT_TITLE__',$config[:indexhtml_conf][:loading_title])
    @index_html.gsub!('__LOADING_GIF_ID__',@loading_gif_id)
    # @index_html.gsub!('__RIASSENCE_GIF_ID__',@riassence_gif_id)
    @index_html.gsub!('__CLIENT_REV__',@client_rev)
    @index_html.gsub!('__CLIENT_BASE__',File.join($config[:broker_urls][:h],@client_rev))
    @index_html.gsub!('__CLIENT_HELLO__',$config[:broker_urls][:hello])
    @index_html.gsub!('__NOSCRIPT__',$config[:indexhtml_conf][:noscript])
    
    deps_src = ''
    $config[:index_html][:deps].each do |dep|
      deps_src += %{<script src="#{dep}" type="text/javascript"></script>}
    end
    @index_html.gsub!('__SCRIPT_DEPS__',deps_src)
    
    @index_gzip = GZString.new('')
    gzwriter = Zlib::GzipWriter.new( @index_gzip, Zlib::BEST_SPEED )
    gzwriter.write( @index_html )
    gzwriter.close
    
    @content_size = @index_html.size
    @content_size_gzip = @index_gzip.size
    
    @index_date = $FILESERVE.httime( Time.now )
  end
  
  def debug_rescan
    
    puts "re-buffering client files"
    begin
      $FILECACHE.check_scan
      @client_rev = $FILECACHE.client_rev
    rescue => e
      puts "=="*40 if $DEBUG_MODE
      puts "IndexHtml::FileCacheError: $FILECACHE.check_scan failed."
      if $DEBUG_MODE
        puts "--"*40
        puts e.message
        puts "  #{e.backtrace.join("\n  ")}"
        puts "=="*40
      end
    end
    
    unless ARGV.include?('-no-rescan')
      puts "re-scanning plugins."
      begin
        $PLUGINS.rescan()
      rescue => e
        puts "=="*40 if $DEBUG_MODE
        puts "IndexHtml::PluginsRescanError: $PLUGINS.rescan failed."
        if $DEBUG_MODE
          puts "--"*40
          puts e.message
          puts "  #{e.backtrace.join("\n  ")}"
          puts "=="*40
        end
      end
    end
    
    puts "re-rendering index html"
    render_index_html
    
  end
  
  ## Outputs a static web page.
  ## If $DEBUG_MODE is active, re-renders page and reloads filecache.
  def get(request, response, session)
    
    debug_rescan if $DEBUG_MODE
    
    response.status = 200
    response['Content-Type'] = 'text/html; charset=UTF-8'
    response['Date'] = @index_date
    response['Server'] = 'Riassence Framework'
    
    support_gzip = (request.header.has_key?('accept-encoding') and \
                    request.header['accept-encoding'].include?('gzip')) \
                    and not $config[:no_gzip]
    
    if support_gzip
      response['Content-Length'] = @content_size_gzip
      response['Content-Encoding'] = 'gzip'
      response.body = @index_gzip
    else
      response['Content-Length'] = @content_size
      response.body = @index_html
    end
  end
  
end

index_html = IndexHtmlPlugin.new

