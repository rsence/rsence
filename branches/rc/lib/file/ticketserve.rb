# -* coding: UTF-8 -*-
###
  # Riassence Core -- http://rsence.org/
  #
  # Copyright (C) 2008 Juha-Jarmo Heinonen <jjh@riassence.com>
  #
  # This file is part of Riassence Core.
  #
  # Riassence Core is free software: you can redistribute it and/or modify
  # it under the terms of the GNU General Public License as published by
  # the Free Software Foundation, either version 3 of the License, or
  # (at your option) any later version.
  #
  # Riassence Core is distributed in the hope that it will be useful,
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

require 'ext/randgen'

## the modules of ticketserve:
require 'file/ticketservices/common'       # common functionality

require 'file/ticketservices/rsrc'    # rsrc-related functionality
require 'file/ticketservices/file'    # file-related functionality
require 'file/ticketservices/upload'  # upload-related functionality
require 'file/ticketservices/img'     # img-related functionality
require 'file/ticketservices/favicon' # favicon-related functionality
require 'file/ticketservices/objblob' # smart object wrapper

module Riassence
module Server

=begin

TicketServe serves static and disposable data and images.
It accepts Magick::Image objects too to render them only when really needed.
Each serve-call returns an unique uri to pass to the client.
It performs clean-ups based on session and request time-outs.

=end
class TicketServe
  
  include Riassence::Server::TicketService::Common
  
  include Riassence::Server::TicketService::Rsrc
  include Riassence::Server::TicketService::TicketFile
  include Riassence::Server::TicketService::Img
  include Riassence::Server::TicketService::Upload
  include Riassence::Server::TicketService::Favicon
  include Riassence::Server::TicketService::ObjBlob
  
end

end
end

