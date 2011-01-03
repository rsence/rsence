##   RSence
 #   Copyright 2008 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##


# @private Inner workings of Ticket
module TicketService

# @private Inner workings of Ticket
module Common
  
  def initialize
    # storage for tickets to be expired by expiry time
    # as the key and an array of ids in array as the value
    @expires = {}
    @expire_files = {}
    @expire_blobobj = {}
    
    # storage for disposable images
    @imgs = {
      
      # id is used as the uri
      :by_id   => {},
      
      # list of image ids by session id
      :ses_ids => {}
    }
    
    # storage for other disposable data
    @files = {
      
      # id is used as the uri
      :by_id   => {},
      
      # list of image ids by session id
      :ses_ids => {}
    }
    
    # an randgen instance used for generating ids (84B long)
    @randgen = RandGen.new( 84 )
    
    # supported image content types
    @content_types = {
      'GIF' => 'image/gif',
      'PNG' => 'image/png',
      'JPG' => 'image/jpeg'
    }
    
    # static data, initially for invalid/not found error-gif
    # also all serve_rsrc items
    @raw_uris = {
      'invalid.gif' => ['image/gif','53',['749464839316700090000800000000004e7ebe129f400000000000c200000000700090000020c0c8f70a9c810e0229ea2da1a000b3'].pack('h*')],
      'favicon.ico' => ['image/gif','371',['749464839316010001005d00005e5e3dd1d1a1ca7dbf983cfeb9dc5ff8f848db1effbd1fff27279609a600cacae9e0e0d0dcaeff8e8fff030303010101848424afffff0000007be7008c8c9bffffff878b9e0eba712fcfffb2b282e9c6000d5900020202bd3a70ababbaf8f834f9f9f9f8f8f887fafafafa49060606fefefe0707700707074e3bc2939353ce6cd50404007d7d6cfafafa8edb34dcfcfc0f0d97fbfbfb000000000000000000000000000000000000000000000000000000000000000000000000000000000000129f401000000000c20000000001000100006009040801058c8420e91a258ca41744380506934656846910140e04051092ca650688d282bc2072bb5303e0728c2330d6fbb15a78249291bbf0d0811102353410124677285190b2e524e110e0f208b890a13176a480b0725211c889b16227a44101f0027931b1d171a745a010b2caea82f15845c9627182e2a2e050f5007af0f1a203329bf52be032d2213ca4501021501400b3'].pack('h*')]
    }
    
    @upload_slots = {
      # upload slots
      :by_id => {
        # random key      mime    max_size session_id 
        # 'test123'  => [ '*/*',  15000,   12         ]
      },
      # processed uploads
      :uploaded => {
        # same key as :by_id  rsence_uploads:id
        # 'test123'  =>       [37483,37546,38759]
      },
      # upload ids by session id
      :ses_ids => {
        # 12 => ['test123']
      }
    }
    
    @blob_objs = {
      :by_id   => {},
      :ses_ids => {}
    }
    
    begin
      db_uri = ::RSence.config[:database][:ses_db]
      if db_uri.start_with?('sqlite://')
        @db = Sequel.sqlite( db_uri.split('sqlite://')[1] )
      else
        @db = Sequel.connect( db_uri )
      end
    rescue => e
      if RSence.args[:debug]
        err_msg = [
          "ERROR: TicketServices couldn't open database",
          "#{e.class.to_s}, #{e.message}",
          "Backtrace:",
          "\t"+e.backtrace.join("\n\t")
        ].join("\n")+"\n"
        $stderr.write( err_msg )
      elsif RSence.args[:verbose]
        puts "Failed to open database '#{@db_uri}'."
        puts "Run RSence in debug mode for full error output."
      end
      @upload_id = 0
      @db = false
    end
  end

  attr_accessor :raw_uris # :nodoc:
  attr_accessor :imgs # :nodoc:
  attr_accessor :content_types # :nodoc:
  
  # Helper method to return the time formatted according to the HTTP RFC
  def httime(time)
    return time.gmtime.strftime('%a, %d %b %Y %H:%M:%S %Z')
  end
  
  # Disconnects connection to the database.
  def shutdown # :nodoc:
    @db.disconnect if @db
  end
  
  # Serves files and images by returning an URI. Content is given as second 
  # parameter. Optional third defaults to 'PNG' and defines the format. 
  # Optional fourth parameter is where there are two possibilities :img 
  # and :file, defaults to :img. URI works as an ID for data.
  def serve( msg, content, format='PNG', type=:img )
    
    # gets a new, unique identifier
    ticket_id = @randgen.gen
    
    # serve image
    if type == :img
      
      # makes sure the format is in uppper case
      format.upcase!
      
      # checks, that the format is a supported image type
      unless @content_types.keys.include?( format )
        puts "ImgServe.serve: invalid format (#{format.inspect})" if RSence.args[:verbose]
        return File.join(::RSence.config[:broker_urls][:i],'invalid.gif')
      end
      
      # changes the format to GIF for IE6
      format = 'GIF' if msg.ie6 and format == 'PNG'
      
      # stores the image data and meta-data ready to be served
      storage_hash = @imgs
      storage_arr = [format,0,content,msg.ses_id]
      
      # return an uri that will respond to the data
      uri = File.join(::RSence.config[:broker_urls][:i],"#{ticket_id}.#{format.downcase}")
    
    # serve file
    elsif type == :file
      
      # re-map content_type and filename meta-data from format
      (content_type, filename) = format
      
      # content size for the header
      content_size = content.bytesize.to_s
      
      storage_hash = @files
      storage_arr = [content_type,content_size,content,msg.ses_id,filename]
      
      uri = File.join(::RSence.config[:broker_urls][:f],ticket_id)
    end
    
    # makes sure, that the storage array has a sub-array for sessions (to aid session-based cleanup)
    storage_hash[:ses_ids][msg.ses_id] = [] unless @imgs[:ses_ids].has_key?(msg.ses_id)
    
    # adds the id to the session-specific storage
    storage_hash[:ses_ids][msg.ses_id].push( ticket_id )
    
    storage_hash[:by_id][ticket_id] = storage_arr
    
    return uri
  end
  
  # Alias for +Ticketserve#serve+.
  alias serve_img serve
  
  # Flushes disposable storage when the session expires. Session id is given
  # as a parameter.
  def expire_ses( ses_id ) # :nodoc:
    
    # flush images by session id
    if @imgs[:ses_ids].has_key?(ses_id)
      
      # goes through the array, until it's empty
      until @imgs[:ses_ids][ses_id].empty?
        img_id = @imgs[:ses_ids][ses_id].shift
        del_img( img_id, ses_id )
      end
      
      # finally, removes the session id
      @imgs[:ses_ids].delete( ses_id )
    end
    
    # flush other data by session id
    if @files[:ses_ids].has_key?(ses_id)
      
      # goes through the array, until it's empty
      until @files[:ses_ids][ses_id].empty?
        file_id = @files[:ses_ids][ses_id].shift
        del_file( file_id, ses_id )
      end
      
      # finally, removes the session id
      @files[:ses_ids].delete( ses_id )
    end
    
    if @upload_slots[:ses_ids].has_key?(ses_id)
      # goes through the array, until it's empty
      until @upload_slots[:ses_ids][ses_id].empty?
        ticket_id = @upload_slots[:ses_ids][ses_id].shift
        del_uploads( ticket_id, ses_id )
      end
      
      # finally, removes the session id
      @upload_slots[:ses_ids].delete( ses_id )
    end
    
    if @blob_objs[:ses_ids].has_key?(ses_id)
      # goes through the array, until it's empty
      until @blob_objs[:ses_ids][ses_id].empty?
        ticket_id = @blob_objs[:ses_ids][ses_id].shift
        del_blobobj( ticket_id, ses_id )
      end
      
      # finally, removes the session id
      @blob_objs[:ses_ids].delete( ses_id )
    end
    
  end
  
  # Serves data based on get request. Is used automatically by +Broker+.
  def get_ticket( req, res, type=:img ) # :nodoc:
    
    is_invalid = true
    
    if type == :img
      
      img_id = req.unparsed_uri.match(/^#{::RSence.config[:broker_urls][:i]}(.*)$/)[1]
      
      if img_id == nil
        puts "ImgServe.fetch_img: invalid uri#1 (#{req.unparsed_uri.inspect})" if RSence.args[:verbose]
        img_id = 'invalid.gif'
      end
      
      img_id = img_id.split('.')[0]
      
      if img_id == nil
        puts "ImgServe.fetch_img: invalid uri#2 (#{req.unparsed_uri.inspect})" if RSence.args[:verbose]
        img_id = 'invalid.gif'
      
      elsif img_id.size != 84
        puts "ImgServe.fetch_img: invalid img_id (#{img_id.inspect})" if RSence.args[:verbose]
        img_id = 'invalid.gif'
      end
      
      if @raw_uris.include?(img_id)
        (content_type,content_size,content) = @raw_uris[img_id]
        
      elsif @imgs[:by_id].include?(img_id)
        
        (format,content_size_zero,img_data,ses_id) = @imgs[:by_id][img_id]
        
        # renders the Magick::Image object
        content = img_data.to_blob {
          self.format = format
        }
      
        # content size for the header
        content_size = content.bytesize.to_s
      
        # content type for the header
        content_type = @content_types[format]
        
        if req.header.has_key?('keep-alive') and req.header['keep-alive'].size > 0
          keep_alive = req.header['keep-alive'][0].to_i
          keep_alive = 10  if keep_alive < 10
          keep_alive = 600 if keep_alive > 600
          push_keepalive( img_id, keep_alive )
          expire_keepalives
        else
          del_img( img_id, ses_id )
        end
      else
        (content_type,content_size,content) = @raw_uris['invalid.gif']
      end
      
    
    elsif type == :file
      file_id = req.unparsed_uri.match(/^#{::RSence.config[:broker_urls][:f]}(.*)$/)[1]
      if file_id == nil
        puts "fileServe.fetch_file: invalid uri#1 (#{req.unparsed_uri.inspect})" if RSence.args[:verbose]
        file_id = 'invalid.gif'
      end
      file_id = file_id.split('.')[0]
      if file_id == nil
        puts "fileServe.fetch_file: invalid uri#2 (#{req.unparsed_uri.inspect})" if RSence.args[:verbose]
        file_id = 'invalid.gif'
      elsif file_id.size != 84
        puts "fileServe.fetch_file: invalid file_id (#{file_id.inspect})" if RSence.args[:verbose]
        file_id = 'invalid.gif'
      end
      if @raw_uris.include?(file_id)
        (content_type,content_size,content) = @raw_uris[file_id]
      elsif @files[:by_id].include?(file_id)
        (content_type,content_size,content,ses_id) = @files[:by_id][file_id]
        if req.header.has_key?('keep-alive') and req.header['keep-alive'].size > 0
          keep_alive = req.header['keep-alive'][0].to_i
          keep_alive = 10  if keep_alive < 10
          keep_alive = 600 if keep_alive > 600
          push_keepalive_file( file_id, keep_alive )
          expire_keepalive_files
        else
          del_file( file_id, ses_id )
        end
      else
        (content_type,content_size,content) = @raw_uris['invalid.gif']
      end
    
    elsif type == :blobobj
      blobobj_id = req.unparsed_uri.match(/^#{::RSence.config[:broker_urls][:b]}(.*)$/)[1]
      if blobobj_id == nil
        puts "fileServe.fetch_blobobj: invalid uri#1 (#{req.unparsed_uri.inspect})" if RSence.args[:verbose]
        blobobj_id = 'invalid.gif'
      end
      if blobobj_id == nil
        puts "fileServe.fetch_blobobj: invalid uri#2 (#{req.unparsed_uri.inspect})" if RSence.args[:verbose]
        blobobj_id = 'invalid.gif'
      elsif blobobj_id.size != 84
        puts "fileServe.fetch_blobobj: invalid blobobj_id (#{blobobj_id.inspect})" if RSence.args[:verbose]
        blobobj_id = 'invalid.gif'
      end
      if @raw_uris.include?(blobobj_id)
        content_type = @raw_uris[blobobj_id].mime
        content_size = @raw_uris[blobobj_id].bytesize
        content      = @raw_uris[blobobj_id].data
      elsif @blob_objs[:by_id].include?(blobobj_id)
        (ses_id, blobobj) = @blob_objs[:by_id][blobobj_id]
        content_type = blobobj.mime
        content_size = blobobj.bytesize
        content      = blobobj.data
        if req.header.has_key?('keep-alive') and req.header['keep-alive'].size > 0
          keep_alive = req.header['keep-alive'][0].to_i
          keep_alive = 10  if keep_alive < 10
          keep_alive = 600 if keep_alive > 600
          push_keepalive_blobobj( blobobj_id, keep_alive )
          expire_keepalive_blobobjs
        else
          del_blobobj( blobobj_id, ses_id )
        end
      else
        (content_type,content_size,content) = @raw_uris['invalid.gif']
      end
      
    elsif type == :rsrc
      rsrc_id = req.unparsed_uri.match(/^#{::RSence.config[:broker_urls][:d]}(.*)$/)[1]
      if rsrc_id == nil
        puts "rsrcServe.fetch_rsrc: invalid uri#1 (#{req.unparsed_uri.inspect})" if RSence.args[:verbose]
        rsrc_id = 'invalid.gif'
      end
      rsrc_id = rsrc_id.split('.')[0]
      if rsrc_id == nil
        puts "rsrcServe.fetch_rsrc: invalid uri#2 (#{req.unparsed_uri.inspect})" if RSence.args[:verbose]
        rsrc_id = 'invalid.gif'
      elsif rsrc_id.size != 84
        puts "rsrcServe.fetch_rsrc: invalid rsrc_id (#{rsrc_id.inspect})" if RSence.args[:verbose]
        rsrc_id = 'invalid.gif'
      end
      if @raw_uris.include?(rsrc_id)
        (content_type,content_size,content) = @raw_uris[rsrc_id]
      else
        (content_type,content_size,content) = @raw_uris['invalid.gif']
      end
    end
    
    res.status = 200
    
    res['Content-Type'] = content_type
    res['Content-Length'] = content_size
    
    res['Date'] = httime( Time.now )
    res['Expires'] = httime(Time.now+::RSence.config[:cache_expire])
    
    res.body = content
    
  end
  
end
end
