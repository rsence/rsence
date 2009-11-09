# -* coding: UTF-8 -*-
##   Riassence Framework
 #   Copyright 2008 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##


module Riassence
module Server
module TicketService
module Favicon
  
  def favicon( req, res )
    
    res.status = 200
    
    favicon_data = @raw_uris['favicon.ico']
    
    res['Content-Type'] = favicon_data[0]
    res['Content-Length'] = favicon_data[1]
    
    res['Date'] = httime( Time.now )
    res.body = favicon_data[2]
    
  end
  
  def set_favicon( ico_data, content_type=false )
    @raw_uris['favicon.ico'][0] = content_type if content_type
    @raw_uris['favicon.ico'][1] = ico_data.size.to_s
    @raw_uris['favicon.ico'][2] = ico_data
    
  end
  
end
end
end
end
