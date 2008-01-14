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
  
  
##
# HelmiInit is the servlet that is responsible for initializing the "boot-strap page".
# Currently, it just loads an html file and displays it.
##
class HInitialPage < WEBrick::HTTPServlet::AbstractServlet
  
  def initialize(args)
    index_html_file = open($config[:sys_path]+'/lib/page/initial.html')
    @index_html = index_html_file.read
    index_html_file.close
    super
  end
  
  ## Outputs a static web page. Nothing else.
  def do_GET(request, response)
    
    response.status = 200
    response['Content-Type'] = 'text/html'
    
    response.body = @index_html
    
  end
  
  alias do_POST do_GET
end

