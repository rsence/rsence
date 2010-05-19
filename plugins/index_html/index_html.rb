##   RSence
 #   Copyright 2009 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##

# IndexHtmlPlugin is the servlet plugin that is responsible for initializing the "boot-strap page".
class IndexHtmlPlugin < Servlet
  
  def match( uri, method )
    if uri == ::RSence.config[:index_html][:respond_address] and method == :get
      return true
    else
      return false
    end
  end
  
  def score
    return 1000 # allows overriding with anything with a score below 1000
  end
  
  def init
    @randgen = RandGen.new( 40 )
    ::RSence.config[:index_html][:instance] = self
  end
  
  def open
    @index_html_src = file_read( ::RSence.config[:index_html][:index_tmpl] )
    render_index_html
  end
  
  def close
    @plugins[:ticket].del_rsrc( @loading_gif_id )
  end
  
  def render_index_html
    
    index_html = @index_html_src.clone
    
    index_html.gsub!('__DEFAULT_TITLE__',::RSence.config[:index_html][:title])
    client_rev = @plugins[:client_pkg].client_cache.client_rev
    index_html.gsub!('__CLIENT_REV__',client_rev)
    index_html.gsub!('__CLIENT_BASE__',File.join(::RSence.config[:broker_urls][:h],client_rev))
    index_html.gsub!('__CLIENT_HELLO__',::RSence.config[:broker_urls][:hello])
    index_html.gsub!('__NOSCRIPT__',::RSence.config[:index_html][:noscript])
    
    deps_src = ''
    ::RSence.config[:index_html][:deps].each do |dep|
      deps_src += %{<script src="#{dep}" type="text/javascript"></script>}
    end
    index_html.gsub!('__SCRIPT_DEPS__',deps_src)
    
    return index_html
  end
  
  def session_index_html( request, response )
    ses_key = @randgen.gen
    sha_key = ''
    buffer = [
      "var qP=function(cmd){COMM.Queue.push(cmd);};"
    ]
    req_num = 0
    3.times do |req_num|
      sha_key = Digest::SHA1.hexdigest( ses_key + sha_key )
      msg = @plugins.transporter.xhr(
        request, response, {
          :servlet => true,
          :cookie  => (req_num==0),
          :query   => {
            'ses_key' => "#{req_num}:.o.:#{sha_key}"
          }
        }
      )
      buffer += msg.value_buffer
      msg.buffer.each do |buffer_item|
        buffer.push( "qP(function(){#{buffer_item};});")
      end
      ses_key = msg.ses_key
    end
    buffer.unshift( "COMM.Session.newKey(#{ses_key.to_json});" )
    buffer.unshift( "COMM.Session.sha_key=#{sha_key.to_json};" )
    buffer.unshift( "COMM.Session.req_num=#{req_num};" )
    index_html = render_index_html
    return index_html.gsub('__STARTUP_SEQUENCE__', buffer.join("\n") )
  end
  
  ## Outputs a static web page.
  def get( request, response, ses )
    index_html = render_index_html
    support_gzip = (request.header.has_key?('accept-encoding') and \
                    request.header['accept-encoding'].include?('gzip')) \
                    and not ::RSence.config[:no_gzip]
    
    response.status = 200
    
    response['Content-Type'] = 'text/html; charset=UTF-8'
    response['Date'] = httime( Time.now )
    response['Server'] = 'RSence'
    response['Cache-Control'] = 'no-cache'
    
    if support_gzip
      index_gzip = GZString.new('')
      gzwriter = Zlib::GzipWriter.new( index_gzip, 9 )
      gzwriter.write( index_html )
      gzwriter.close
      response['Content-Length'] = index_gzip.length
      response['Content-Encoding'] = 'gzip'
      response.body = index_gzip
    else
      response['Content-Length'] = index_html.length
      response.body = index_html
    end
  end
  
end

