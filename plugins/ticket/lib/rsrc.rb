
# @private Inner workings of Ticket
module TicketService
# @private Inner workings of Ticket
module Rsrc
  
  # Removes static data by ID.
  def del_rsrc( rsrc_id )
    @raw_uris.delete( rsrc_id )
  end
  
  # Serves static resources. ID returned by function.
  def serve_rsrc( content, content_type )
    
    rsrc_id = @randgen.gen
    #puts "rsrc_id: #{rsrc_id.inspect}"
    
    content_size = content.bytesize.to_s
    
    @raw_uris[rsrc_id] = [content_type,content_size,content]
    
    uri = File.join(::RSence.config[:broker_urls][:d],rsrc_id)
  end
  
end
end
