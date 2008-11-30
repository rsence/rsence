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

# Require the client-server data handling system
require 'lib/transporter/transporter'

$config[:transporter] = HTransporter.new

##
#  Broker is a minimal servlet class that passes requests to the transporter
#####
class Broker < HTTPServlet::AbstractServlet
  
  ## Forwards the POST/GET request to the HTransporter instance transporter
  def do_GET( request, response )
    if request.unparsed_uri[0..2] == '/ui'
      response.body = $config[:transporter].from_client( request, response, false )
    elsif request.unparsed_uri[0..5] == '/hello'
      response.body = $config[:transporter].from_client( request, response, true )
    end
  end
  
  alias do_POST do_GET
  
end

