module Himle
module Server
module TicketService
module Rsrc
  
  # removes static data by id
  def del_rsrc( rsrc_id )
    @raw_uris.delete( rsrc_id )
  end
  
  # serves static resources
  def serve_rsrc( content, content_type )
    
    rsrc_id = @randgen.get_one
    #puts "rsrc_id: #{rsrc_id.inspect}"
    
    content_size = content.size.to_s
    
    @raw_uris[rsrc_id] = [content_type,content_size,content]
    
    return "/d/#{rsrc_id}"
  end
  
end
end
end
end
