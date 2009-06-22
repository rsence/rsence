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
module Favicon
  
  def favicon( req, res )
    
    res.status = 200
    
    favicon_data = @raw_uris['favicon.ico']
    
    res['Content-Type'] = favicon_data[0]
    res['Content-Size'] = favicon_data[1]
    
    res['Date'] = httime( Time.now )
    res.body = favicon_data[2]
    
  end
  
  def set_favicon( ico_data )
    @raw_uris['favicon.ico'][1] = ico_data.size.to_s
    @raw_uris['favicon.ico'][2] = ico_data
  end
  
end
end
end
end
