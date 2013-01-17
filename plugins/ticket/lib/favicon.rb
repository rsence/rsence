
# @private Inner workings of Ticket
module TicketService
# @private Inner workings of Ticket
module Favicon
  
  def favicon( req, res ) # :nodoc:
    
    res.status = 200
    
    favicon_data = @raw_uris['favicon.ico']
    
    res['Content-Type'] = favicon_data[0]
    res['Content-Length'] = favicon_data[1]
    
    res['Date'] = httime( Time.now )
    res.body = favicon_data[2]
    
  end
  
  # Sets favicon. First parameter is favicon data and the second one is content type which defaults to false.
  def set_favicon( ico_data, content_type=false )
    @raw_uris['favicon.ico'][0] = content_type if content_type
    @raw_uris['favicon.ico'][1] = ico_data.bytesize.to_s
    @raw_uris['favicon.ico'][2] = ico_data
    
  end
  
end
end
