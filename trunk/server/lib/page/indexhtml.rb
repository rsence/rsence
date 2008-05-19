###
  # Himle Server -- http://himle.org/
  #
  # Copyright (C) 2008 Juha-Jarmo Heinonen
  # Copyright (C) 2006-2007 Helmi Technologies Inc.
  #
  # This file is part of Himle Server.
  #
  # Himle Server is free software: you can redistribute it and/or modify
  # it under the terms of the GNU General Public License as published by
  # the Free Software Foundation, either version 3 of the License, or
  # (at your option) any later version.
  #
  # Himle server is distributed in the hope that it will be useful,
  # but WITHOUT ANY WARRANTY; without even the implied warranty of
  # MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  # GNU General Public License for more details.
  #
  # You should have received a copy of the GNU General Public License
  # along with this program.  If not, see <http://www.gnu.org/licenses/>.
  #
  ###


=begin
 
 IndexHtml is the servlet that is responsible for initializing the "boot-strap page".
 
 It just loads, caches and sends the page for now.
 
=end
class IndexHtml
  
  def set_deps( deps )
    @deps = deps
    render_index_html
  end
  
  def initialize
    @deps = []
    index_html_file = open($config[:sys_path]+'/lib/page/index.html','rb')
    @index_html_src = index_html_file.read
    index_html_file.close
    render_index_html
  end
  def render_index_html
    
    @index_html = @index_html_src
    
    loading_gif_file = open($config[:sys_path]+'/lib/page/loading.gif','rb')
    loading_gif = loading_gif_file.read
    loading_gif_file.close
    
    loading_gif_id = $TICKETSERVE.serve_rsrc(loading_gif, 'image/gif' )
    
    @index_html.gsub!('__DEFAULT_TITLE__',$config[:indexhtml_conf][:loading_title])
    @index_html.gsub!('__LOADING_GIF_ID__',loading_gif_id)
    
    deps_src = ''
    @deps.each do |dep|
      deps_src += %{<script src="#{dep}" type="text/javascript"></script>}
    end
    @index_html.gsub!('__SCRIPT_DEPS__',deps_src)
    
    @content_size = @index_html.size
  end
  
  ## Outputs a static web page. Nothing else.
  def get(request, response)
    
    response.status = 200
    response['content-type'] = 'text/html; charset=UTF-8'
    response['content-size'] = @content_size
    
    response.body = @index_html
    
  end
  
end

