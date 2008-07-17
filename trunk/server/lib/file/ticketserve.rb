# -* coding: UTF-8 -*-
###
  # Himle Server -- http://himle.org/
  #
  # Copyright (C) 2008 Juha-Jarmo Heinonen
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

require 'rubygems'
require 'RMagick'

require 'util/randgen'

## the modules of ticketserve:
require 'file/ticketservices/common'       # common functionality

require 'file/ticketservices/rsrc'    # rsrc-related functionality
require 'file/ticketservices/file'    # file-related functionality
require 'file/ticketservices/upload'  # upload-related functionality
require 'file/ticketservices/img'     # img-related functionality
require 'file/ticketservices/favicon' # favicon-related functionality
require 'file/ticketservices/objblob' # smart object wrapper

module Himle
module Server

=begin

TicketServe serves static and disposable data and images.
It accepts Magick::Image objects too to render them only when really needed.
Each serve-call returns an unique uri to pass to the client.
It performs clean-ups based on session and request time-outs.

=end
class TicketServe
  
  include Himle::Server::TicketService::Common
  
  include Himle::Server::TicketService::Rsrc
  include Himle::Server::TicketService::File
  include Himle::Server::TicketService::Img
  include Himle::Server::TicketService::Upload
  include Himle::Server::TicketService::Favicon
  include Himle::Server::TicketService::ObjBlob
  
end

end
end

