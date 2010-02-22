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

## TicketServe serves static and disposable data and images.
## It accepts Magick::Image objects too to render them only when really needed.
## Each serve-call returns an unique uri to pass to the client.
## It performs clean-ups based on session and request time-outs.
class TicketServe < Servlet
  
  # the library path of this plugin
  lib_path = File.join( PluginManager.curr_plugin_path, 'lib' )
  
  # common functionality
  require File.join(lib_path,'common')
  include TicketService::Common
  
  # rsrc-related functionality
  require File.join(lib_path,'rsrc')
  include TicketService::Rsrc
  
  # file-related functionality
  require File.join(lib_path,'file')
  include TicketService::TicketFile
  
  # upload-related functionality
  require File.join(lib_path,'upload')
  include TicketService::Upload
  
  # img-related functionality
  require File.join(lib_path,'img')
  include TicketService::Img
  
  # favicon-related functionality
  require File.join(lib_path,'favicon')
  include TicketService::Favicon
  
  # smart object wrapper
  require File.join(lib_path,'objblob')
  include TicketService::ObjBlob
  
  def broker_urls
    $config[:broker_urls]
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
  
  def get( req, res, ses )
    uri = req.fullpath
    if uri.match( /^#{broker_urls[:i]}/ )
      puts "/i: #{uri.inspect}" if $DEBUG_MODE
      get_ticket( req, res, :img )
    elsif uri.match( /^#{broker_urls[:d]}/ )
      puts "/d: #{uri.inspect}" if $DEBUG_MODE
      get_ticket( req, res, :rsrc )
    elsif uri.match( /^#{broker_urls[:f]}/ )
      puts "/f: #{uri.inspect}" if $DEBUG_MODE
      get_ticket( req, res, :file )
    elsif uri.match( /^#{broker_urls[:b]}/ )
      puts "/b: #{uri.inspect}" if $DEBUG_MODE
      get_ticket( req, res, :blobobj )
    elsif uri == broker_urls[:favicon]
      favicon( req, res )
    elsif uri == broker_urls[:uploader_iframe]
      puts "/U/iframe_html: #{uri.inspect}" if $DEBUG_MODE
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
      puts "/U: #{uri.inspect}" if $DEBUG_MODE
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
    
    @db = Sequel.connect( $config[:database][:ses_db] )
    
  end
  
end

ticketserve = TicketServe.new

# Global bindings for backwards functionality:
$config[:ticketserve] = ticketserve
$TICKETSERVE          = ticketserve

# Plugin API for ticket services
class TicketServices < Plugin
  def set_ticketserve( ticketserve )
    @ticketserve = ticketserve
  end
end

ticketservices = TicketServices.new
ticketservices.register( 'ticket' )
ticketservices.set_ticketserve( ticketserve )


