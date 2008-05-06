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
  
  
=begin
 
 IndexHtml is the servlet that is responsible for initializing the "boot-strap page".
 
 It just loads, caches and sends the page for now.
 
=end
class IndexHtml
  
  def initialize
    
    index_html_file = open($config[:sys_path]+'/lib/page/index.html','rb')
    @index_html = index_html_file.read
    index_html_file.close
    
    loading_gif_file = open($config[:sys_path]+'/lib/page/loading.gif','rb')
    loading_gif = loading_gif_file.read
    loading_gif_file.close
    
    loading_gif_id = TICKETSERVE.serve_rsrc(loading_gif, 'image/gif' )
    
    @index_html.gsub!('__DEFAULT_TITLE__',$config[:indexhtml_conf][:loading_title])
    @index_html.gsub!('__LOADING_GIF_ID__',loading_gif_id)
  end
  
  ## Outputs a static web page. Nothing else.
  def get(request, response)
    
    response.status = 200
    response.content_type = 'text/html; charset=UTF-8'
    
    response.body = @index_html
    
  end
  
end

