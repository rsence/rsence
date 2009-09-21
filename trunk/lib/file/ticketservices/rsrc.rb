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

module Riassence
module Server
module TicketService
module Rsrc
  
  # removes static data by id
  def del_rsrc( rsrc_id )
    @raw_uris.delete( rsrc_id )
  end
  
  # serves static resources
  def serve_rsrc( content, content_type )
    
    rsrc_id = @randgen.gen
    #puts "rsrc_id: #{rsrc_id.inspect}"
    
    content_size = content.size.to_s
    
    @raw_uris[rsrc_id] = [content_type,content_size,content]
    
    uri = File.join($config[:broker_urls][:d],rsrc_id)
  end
  
end
end
end
end
