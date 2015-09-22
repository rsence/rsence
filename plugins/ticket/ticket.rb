
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

# TicketPlugin serves static and disposable data and images. It accepts Magick::Image objects too to render them only when really needed. Each serve-call returns an unique uri to pass to the client.
# It performs clean-ups based on session and request time-outs.
#
# It's available to other plugins as +@plugins.ticket+
class TicketPlugin < Plugin
  
  # @private No user-addressable code inside
  class TicketServe
    include TicketService::Common
    include TicketService::Rsrc
    include TicketService::TicketFile
    include TicketService::Upload
    include TicketService::Img
    include TicketService::Favicon
    include TicketService::ObjBlob
  end
  
  # @private Returns the broker's url's. Used in {#match}
  def broker_urls
    ::RSence.config[:broker_urls]
  end
  
  # @private Implements this part of the {RSence::Plugins::Servlet__ Servlet} API on a plugin to match the {#broker_urls}
  def match( req, uri, request_type )
    if request_type == :post
      upload_match = uri.start_with?( broker_urls[:u] + '/')   
      return true if upload_match
    elsif request_type == :get or request_type == :head
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
  
  # @private Override with a lower score, if you want to match some parts in alternative ways.
  def score; 200; end
  
  # @private Implements this part of the {RSence::Plugins::Servlet__ Servlet} API on a plugin to respond to get requests matched by the {#match}
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
      res['Content-Type'] = 'text/html; charset=UTF-8'
      res['Content-Length'] = http_body.bytesize.to_s
      res.body = http_body
    end
  end
  
  # @private Handles the upload request
  def post( req, res, ses )
    uri = req.fullpath
    if uri.start_with?( broker_urls[:u] + '/')
      puts "/U: #{uri.inspect}" if RSence.args[:verbose]
      @ticketserve.upload( req, res )
    end
  end
  
  # @private Initializes storage.
  def init # :nodoc:
    super
    @ticketserve = TicketServe.new
  end

  def open
    super
    unless RSence.session_manager.nil?
      set_db_state( RSence.session_manager.db_avail )
    end
  end

  def set_db_state( state )
    @ticketserve.set_db_state( state )
  end
  
  # @private Shuts down TicketServe
  def shutdown
    @ticketserve.shutdown
  end
  
  # API for BlobObj's
  class BlobObj
    
    # @param [String] data The data to serve
    # @param [String] mime The content-type of the data to serve
    def initialize(data,mime)
      @data = data
      @mime = mime
    end
    
    # @return [String] The content-type served
    def mime
      return @mime
    end
    
    # @return [String] The data served
    def data
      return @data
    end
    
    # @return [Number] The size (in bytes) of the data
    def size
      return @data.bytesize
    end
    
    # Implement, if you need to do cleanup before destructing
    def close
    end
    
  end
  
  # Serves an RMagick::Image object accessible by a disposable ticket URL.
  #
  # @param [Message] msg The message instance.
  # @param [#to_blob] content Image data to serve
  # @param [String] format To pass on as a +{ self.format = format }+ block of +content#to_blob+
  # @param [Symbol] type The type of the object.
  #
  # @return [String] Disposable URL. Destroyed after being requested.
  def serve( msg, content, format='PNG', type=:img )
    @ticketserve.serve( msg, content, format, type )
  end
  
  # @private Removes data used by the session, takes session id
  def expire_ses_id( ses_id )
    @ticketserve.expire_ses( ses_id )
  end
  
  # @private Removes data used by the session, takes msg
  def expire_ses( msg )
    if msg.class == RSence::Message
      expire_ses_id( msg.ses_id )
    elsif msg.class == Hash
      expire_ses_id( msg[:ses_id] )
    elsif msg.class == Integer
      expire_ses_id( msg )
    else
      warn "ticket: Unknown session class: #{msg.class}"
    end
  end
  
  # Sets a custom favicon for RSence
  #
  # @param [String] ico_data Favicon-compatible image data in binary.
  # @param [String] content_type The content-type of the favicon image data.
  #
  # @return [nil]
  def set_favicon( ico_data, content_type=false )
    @ticketserve.set_favicon( ico_data, content_type )
  end
  
  # Removes a downloadable file resource served from memory.
  #
  # Does not delete any files from the file system.
  #
  # @param [Message] msg The message instance.
  # @param [String] file_id The file url returned by {#serve_file}
  #
  # @return [nil]
  def del_file( msg, file_id )
    @ticketserve.del_file( file_id, msg.ses_id )
  end
  
  # Serves a downloadable file resource to be served from memory using a generated url.
  #
  # @param [Message] msg The message instance.
  # @param [String] content The file attachment file data in binary.
  # @param [String] content_type The content-type of the file attachment.
  # @param [String] filename The filename of the download (not the url)
  #
  # @return [String] Disposable URL. Destroyed after being requested.
  def serve_file( msg, content='', content_type='text/plain', filename=nil )
    @ticketserve.serve_file( msg, content, content_type, filename )
  end
  
  # Removes a downloadable file resource served from memory.
  #
  # Does not delete any files from the file system.
  #
  # @param [Message] msg The message instance.
  # @param [String] img_id The image url returned by {#serve_img}
  #
  # @return [nil]
  def del_img( msg, img_id )
    @ticketserve.del_img( img_id, msg.ses_id )
  end
  
  # Serves a downloadable file resource to be served from memory using a generated url.
  #
  # @param [Message] msg The message instance.
  # @param [#to_blob] content Image data to serve
  # @param [String] format To pass on as a +{ self.format = format }+ block of +content#to_blob+
  # @param [Symbol] type The type of the object.
  #
  # @return [String] Disposable URL. Destroyed after being requested.
  def serve_img( msg, content, format='PNG', type=:img )
    @ticketserve.serve_img( msg, content, format, type )
  end
  
  # @return [BlobObj] to be used for custom objects served by {#serve_obj}
  def proto_obj
    return BlobObj
  end
  
  # Serves custom object using the {BlobObj} API (Binary Large Object)
  #
  # @param [Message] msg The message instance.
  # @param [BlobObj] blob_obj The custom object to serve.
  # @param [Boolean] no_expire When true, keeps in memory until {#del_obj} is called manually.
  #
  # @return [String] URL. Destroyed after being requested, unless +no_expire+ is +true+.
  def serve_obj( msg, blob_obj, no_expire=false )
    @ticketserve.serve_blobobj( msg, blob_obj, no_expire )
  end
  
  # Deletes a custom object served by {#serve_obj}
  #
  # @param [Message] msg The message instance.
  # @param [String] ticket_id The object url returned by {#serve_img}
  #
  # @return [nil]
  def del_obj( msg, ticket_id )
    @ticketserve.del_blobobj( ticket_id, msg.ses_id )
  end
  
  # Removes static resource served by {#serve_rsrc}
  #
  # @param [String] rsrc_id The object url returned by {#serve_rsrc}
  #
  # @return [nil]
  def del_rsrc( rsrc_id )
    @ticketserve.del_rsrc( rsrc_id )
  end
  
  # Serves static resource as from raw binary data.
  #
  # @param [String] content Any binary data to serve
  # @param [String] content_type The content-type to serve the +content+ as.
  #
  # @return [String] A static url. Use {#del_rsrc} manually to free the memory occupied by the content.
  def serve_rsrc( content, content_type )
    @ticketserve.serve_rsrc( content, content_type )
  end
  
  # Returns a list of uploads matching the ticket id.
  #
  # @param [String] ticket_id The key for the upload, returned by {#upload_key}
  # @param [Boolean] with_data Return data also
  #
  # @return [Array] List of uploaded data matching the ticket_id
  def get_uploads( ticket_id, with_data=false )
    @ticketserve.get_uploads( ticket_id, with_data )
  end
  
  # Removes the uploaded data matching both ticket id as well as row id.
  #
  # @param [String] ticket_id The key for the upload, returned by {#upload_key}
  # @param [Number] row_id The row id returned by {#get_uploads}
  #
  # @return [nil]
  def del_upload( ticket_id, row_id )
    @ticketserve.del_upload( ticket_id, row_id )
  end
  
  # Removes all uploaded data matching the ticket id
  #
  # @param [Message] msg The message instance.
  # @param [String] ticket_id The key for the upload, returned by {#upload_key}
  #
  # @return [nil]
  def del_uploads( msg, ticket_id )
    @ticketserve.del_uploads( ticket_id, msg.ses_id )
  end
  
  # Allocates an upload slot and returns the ticket id to use for {#get_uploads}, {#del_upload} and {#del_uploads}
  #
  # @param [Message] msg The message instance.
  # @param [String] value_key The key for the value associated with the upload. See {RSence::HValue#value_id}
  # @param [Number] max_size  The maximum size allowed to upload.
  # @param [RegExp] mime_allow A regular expression to match what types of data are allowed to be uploaded
  # @param [Boolean] allow_multi When false, allows uploading only once per key.
  #
  # @return [String] The ticket id. Use for the {RSence::HValue HValue} used with the client HUploader component. Also use with {#get_uploads}, {#del_upload} and {#del_uploads}
  def upload_key( msg, value_key, max_size=1000000, mime_allow=/(.*?)\/(.*?)/, allow_multi=true )
    @ticketserve.upload_key( msg, value_key, max_size, mime_allow, allow_multi )
  end
end


