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
  warn "Warning: RMagick not installed, ticketserve images will not be supported." if RSence.args[:verbose]
end

require 'randgen'

# the library path of this plugin
lib_path = File.join( bundle_path, 'lib' )

# common functionality
require File.join(lib_path,'common')

# rsrc-related functionality
require File.join(lib_path,'rsrc')

# file-related functionality
require File.join(lib_path,'file')

# upload-related functionality
require File.join(lib_path,'upload')

# img-related functionality
require File.join(lib_path,'img')

# favicon-related functionality
require File.join(lib_path,'favicon')

# smart object wrapper
require File.join(lib_path,'objblob')

## TicketServe serves static and disposable data and images.
## It accepts Magick::Image objects too to render them only when really needed.
## Each serve-call returns an unique uri to pass to the client.
## It performs clean-ups based on session and request time-outs.
class TicketServe < Plugin
  
  include TicketService::Common
  include TicketService::Rsrc
  include TicketService::TicketFile
  include TicketService::Upload
  include TicketService::Img
  include TicketService::Favicon
  include TicketService::ObjBlob
  
  def broker_urls
    ::RSence.config[:broker_urls]
  end
  
  def match( uri, request_type )
    if request_type == :post
      return true if uri[0..2] == broker_urls[:u]
    elsif request_type == :get
      if uri.match( /^#{broker_urls[:i]}/ )
        return true
      elsif uri.match( /^#{broker_urls[:d]}/ )
        return true
      elsif uri.match( /^#{broker_urls[:f]}/ )
        return true
      elsif uri.match( /^#{broker_urls[:b]}/ )
        return true
      elsif uri == broker_urls[:favicon]
        return true
      elsif uri == broker_urls[:uploader_iframe]
        return true
      end
    end
    return false
  end
  
  def score; 200; end
  
  def get( req, res, ses )
    uri = req.fullpath
    if uri.match( /^#{broker_urls[:i]}/ )
      puts "/i: #{uri.inspect}" if RSence.args[:verbose]
      get_ticket( req, res, :img )
    elsif uri.match( /^#{broker_urls[:d]}/ )
      puts "/d: #{uri.inspect}" if RSence.args[:verbose]
      get_ticket( req, res, :rsrc )
    elsif uri.match( /^#{broker_urls[:f]}/ )
      puts "/f: #{uri.inspect}" if RSence.args[:verbose]
      get_ticket( req, res, :file )
    elsif uri.match( /^#{broker_urls[:b]}/ )
      puts "/b: #{uri.inspect}" if RSence.args[:verbose]
      get_ticket( req, res, :blobobj )
    elsif uri == broker_urls[:favicon]
      favicon( req, res )
    elsif uri == broker_urls[:uploader_iframe]
      puts "/U/iframe_html: #{uri.inspect}" if RSence.args[:verbose]
      res.status = 200
      http_body = '<html><head><title>Empty Iframe for Uploading</title></head><body></body></html>'
      res['content-type'] = 'text/html; charset=UTF-8'
      res['content-length'] = http_body.size.to_s
      res.body = http_body
    end
  end
  
  def post( req, res, ses )
    uri = req.fullpath
    if uri[0..2] == broker_urls[:u]
      puts "/U: #{uri.inspect}" if RSence.args[:verbose]
      upload( req, res )
    end
  end
  
  # Initializes storage.
  def init # :nodoc:
    
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
  
end
# ticketserve = TicketServe.new

# Plugin API for ticket services
# class TicketAPI < Plugin
#   class BlobObj
#     def initialize(data,mime)
#       @data = data
#       @mime = mime
#     end
#     def mime
#       return @mime
#     end
#     def data
#       return @data
#     end
#     def size
#       return @data.size
#     end
#     def close
#     end
#   end
#   def set_ticketserve( ticketserve )
#     @ticketserve = ticketserve
#   end
#   def serve( msg, content, format='PNG', type=:img )
#     @ticketserve.serve( msg, content, format, type )
#   end
#   def expire_ses( msg )
#     @ticketserve.expire_ses( msg.ses_id )
#   end
#   def set_favicon( ico_data, content_type=false )
#     @ticketserve.set_favicon( ico_data, content_type )
#   end
#   def del_file( msg, file_id )
#     @ticketserve.del_file( file_id, msg.ses_id )
#   end
#   def serve_file( msg, content='', content_type='text/plain', filename='' )
#     @ticketserve.serve_file( msg, content, content_type, filename )
#   end
#   def del_img( msg, img_id )
#     @ticketserve.del_img( img_id, msg.ses_id )
#   end
#   def serve_img( msg, content, format='PNG', type=:img )
#     @ticketserve.serve_img( msg, content, format, type )
#   end
#   def proto_obj
#     return BlobObj
#   end
#   def serve_obj( msg, blob_obj, no_expire=false )
#     @ticketserve.serve_blobobj( msg, blob_obj, no_expire )
#   end
#   def del_obj( msg, ticket_id )
#     @ticketserve.del_blobobj( ticket_id, msg.ses_id )
#   end
#   def del_rsrc( rsrc_id )
#     @ticketserve.del_rsrc( rsrc_id )
#   end
#   def serve_rsrc( content, content_type )
#     @ticketserve.serve_rsrc( content, content_type )
#   end
#   def get_uploads( ticket_id, with_data=false )
#     @ticketserve.get_uploads( ticket_id, with_data )
#   end
#   def del_upload( ticket_id, row_id )
#     @ticketserve.del_upload( ticket_id, row_id )
#   end
#   def del_uploads( msg, ticket_id )
#     @ticketserve.del_uploads( ticket_id, msg.ses_id )
#   end
#   def upload_key( msg, value_key, max_size=1000000, mime_allow=/(.*?)\/(.*?)/, allow_multi=true )
#     @ticketserve.upload_key( msg, value_key, max_size, mime_allow, allow_multi )
#   end
# end

# ticket = TicketAPI.new
# ticket.register( 'ticket' )
# ticket.set_ticketserve( ticketserve )


