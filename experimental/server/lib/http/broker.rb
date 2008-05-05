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
require 'transporter/transporter'
$config[:transporter] = HTransporter.new

require 'page/initial'
$config[:index_html]  = HInitialPage.new

require 'file/gzfiles'
$config[:gzfilecache] = GZFileCache.new
$config[:gzfiles]     = GZFileServe.new

require 'http/restful'

class Broker
  include RestfulDispatcher
  def post
    full_path = @request.fullpath
    transporter = $config[:transporter]
    if full_path[0..2] == '/ui'
      transporter.from_client( @request, @response, false )
    elsif full_path[0..5] == '/hello'
      transporter.from_client( @request, @response, true )
    end
  end
  def get
    full_path = @request.fullpath
    #puts "############  #{full_path.inspect}  ############"
    if full_path[0..2] == '/gz'
      $config[:gzfiles].get( @request, @response )
      #puts @response.header.methods.inspect
    elsif full_path[0..3] == '/img'
      IMGSERVE.fetch_img( @request, @response )
    elsif full_path[0..4] == '/data'
      IMGSERVE.fetch_rsrc( @request, @response )
    elsif full_path[0..4] == '/file'
      IMGSERVE.fetch_file( @request, @response )
    else
      $config[:index_html].get( @request, @response )
    end
  end
end
