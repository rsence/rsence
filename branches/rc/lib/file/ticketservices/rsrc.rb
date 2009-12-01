#--
##   Riassence Framework
 #   Copyright 2008 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##
 #++


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
