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
class Ticket < Plugin
  
  class TicketServe
    include TicketService::Common
    include TicketService::Rsrc
    include TicketService::TicketFile
    include TicketService::Upload
    include TicketService::Img
    include TicketService::Favicon
    include TicketService::ObjBlob
  end
  
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
      @ticketserve.get_ticket( req, res, :img )
    elsif uri.match( /^#{broker_urls[:d]}/ )
      puts "/d: #{uri.inspect}" if RSence.args[:verbose]
      @ticketserve.get_ticket( req, res, :rsrc )
    elsif uri.match( /^#{broker_urls[:f]}/ )
      puts "/f: #{uri.inspect}" if RSence.args[:verbose]
      @ticketserve.get_ticket( req, res, :file )
    elsif uri.match( /^#{broker_urls[:b]}/ )
      puts "/b: #{uri.inspect}" if RSence.args[:verbose]
      @ticketserve.get_ticket( req, res, :blobobj )
    elsif uri == broker_urls[:favicon]
      @ticketserve.favicon( req, res )
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
      @ticketserve.upload( req, res )
    end
  end
  
  # Initializes storage.
  def init # :nodoc:
    super
    @ticketserve = TicketServe.new
  end
  
  def shutdown
    @ticketserve.shutdown
  end
  
  class BlobObj
    def initialize(data,mime)
      @data = data
      @mime = mime
    end
    def mime
      return @mime
    end
    def data
      return @data
    end
    def size
      return @data.size
    end
    def close
    end
  end
  
  def serve( msg, content, format='PNG', type=:img )
    @ticketserve.serve( msg, content, format, type )
  end
  def expire_ses( msg )
    @ticketserve.expire_ses( msg.ses_id )
  end
  def set_favicon( ico_data, content_type=false )
    @ticketserve.set_favicon( ico_data, content_type )
  end
  def del_file( msg, file_id )
    @ticketserve.del_file( file_id, msg.ses_id )
  end
  def serve_file( msg, content='', content_type='text/plain', filename='' )
    @ticketserve.serve_file( msg, content, content_type, filename )
  end
  def del_img( msg, img_id )
    @ticketserve.del_img( img_id, msg.ses_id )
  end
  def serve_img( msg, content, format='PNG', type=:img )
    @ticketserve.serve_img( msg, content, format, type )
  end
  def proto_obj
    return BlobObj
  end
  def serve_obj( msg, blob_obj, no_expire=false )
    @ticketserve.serve_blobobj( msg, blob_obj, no_expire )
  end
  def del_obj( msg, ticket_id )
    @ticketserve.del_blobobj( ticket_id, msg.ses_id )
  end
  def del_rsrc( rsrc_id )
    @ticketserve.del_rsrc( rsrc_id )
  end
  def serve_rsrc( content, content_type )
    @ticketserve.serve_rsrc( content, content_type )
  end
  def get_uploads( ticket_id, with_data=false )
    @ticketserve.get_uploads( ticket_id, with_data )
  end
  def del_upload( ticket_id, row_id )
    @ticketserve.del_upload( ticket_id, row_id )
  end
  def del_uploads( msg, ticket_id )
    @ticketserve.del_uploads( ticket_id, msg.ses_id )
  end
  def upload_key( msg, value_key, max_size=1000000, mime_allow=/(.*?)\/(.*?)/, allow_multi=true )
    @ticketserve.upload_key( msg, value_key, max_size, mime_allow, allow_multi )
  end
end


