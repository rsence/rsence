#--
##   Riassence Framework
 #   Copyright 2008 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##
 #++


require 'rubygems'
begin
  require 'RMagick'
rescue LoadError
  warn "Warning: RMagick not installed, ticketserve images will not be supported."
end

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



## TicketServe serves static and disposable data and images.
## It accepts Magick::Image objects too to render them only when really needed.
## Each serve-call returns an unique uri to pass to the client.
## It performs clean-ups based on session and request time-outs.

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

