###
  # HIMLE RIA Server
  # Copyright (C) 2008 HIMLE GROUP http://himle.sorsacode.com/
  #  
  #  This program is free software; you can redistribute it and/or modify it under the terms
  #  of the GNU General Public License as published by the Free Software Foundation;
  #  either version 2 of the License, or (at your option) any later version. 
  #  This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
  #  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
  #  See the GNU General Public License for more details. 
  #  You should have received a copy of the GNU General Public License along with this program;
  #  if not, write to the Free Software Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
  ###

require 'rubygems'
require 'RMagick'

require 'util/randgen'

=begin

TicketServe serves static and disposable data and images.
It accepts Magick::Image objects too to render them only when really needed.
Each serve-call returns an unique uri to pass to the client.
It performs clean-ups based on session and request time-outs.

=end
class TicketServe
  
  attr_accessor :raw_uris, :imgs, :content_types
  
  # Helper method to return the time formatted according to the HTTP RFC
  def httime(time)
    return time.gmtime.strftime('%a, %d %b %Y %H:%M:%S %Z')
  end
  
  # Initializes storage
  def initialize
    
    # storage for tickets to be expired by expiry time
    # as the key and an array of ids in array as the value
    @expires = {}
    @expire_files = {}
    
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
    
    # an randgen instance used for generating ids (64B long)
    @randgen = RandomGenerator.new( 64, 600 )
    
    # supported image content types
    @content_types = {
      'GIF' => 'image/gif',
      'PNG' => 'image/png',
      'JPG' => 'image/jpeg'
    }
    
    # static data, initially for invalid/not found error-gif
    # also all serve_rsrc items
    @raw_uris = {
      'invalid.gif' => ['image/gif','53',['749464839316700090000800000000004e7ebe129f400000000000c200000000700090000020c0c8f70a9c810e0229ea2da1a000b3'].pack('h*')]
    }
    
  end
  
  ## flushes disposable storage when the session expires
  def expire_ses( ses_id )
    
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
    
  end
  
  # removes image data and references
  def del_img( img_id, ses_id=false )
    if ses_id and @imgs[:ses_ids].has_key?( ses_id )
      @imgs[:ses_ids][ses_id].delete( img_id ) if @imgs[:ses_ids][ses_id].include?( img_id )
    end
    @imgs[:by_id].delete( img_id ) if @imgs[:by_id].has_key?( img_id )
  end
  
  # removes other disposable data and references
  def del_file( file_id, ses_id=false )
    if ses_id and @files[:ses_ids].has_key?( ses_id )
      @files[:ses_ids][ses_id].delete( file_id ) if @files[:ses_ids][ses_id].include?( file_id )
    end
    @files[:by_id].delete( file_id ) if @files[:by_id].has_key?( file_id )
  end
  
  # removes static data by id
  def del_rsrc( rsrc_id )
    @raw_uris.delete( rsrc_id )
  end
  
  # extends expiration time of disposable files, essentially for keep-alive requests
  def push_keepalive( img_id, keep_alive )
    expiry_time = Time.now.to_i+keep_alive
    @expires[expiry_time] = [] unless @expires.has_key?(expiry_time)
    @expires[expiry_time].push( img_id )
  end
  
  # extends expiration time of disposable data, essentially for keep-alive requests
  def push_keepalive_file( file_id, keep_alive )
    expiry_time = Time.now.to_i+keep_alive
    @expire_files[expiry_time] = [] unless @expires.has_key?(expiry_time)
    @expire_files[expiry_time].push( file_id )
  end
  
  # removes all expired images
  def expire_keepalives
    curr_time = Time.now.to_i
    @expires.keys.sort.each do |exp_time|
      if exp_time < curr_time
        @expires[exp_time].size.times do |incr|
          img_id = @expires[exp_time].shift
          if @imgs[:by_id].has_key?(img_id)
            ses_id = @imgs[:by_id][img_id][3]
            del_img( img_id, ses_id )
          end
        end
        @expires.delete(exp_time) if @expires[exp_time].size == 0
      end
    end
  end
  
  # removes all expired files
  def expire_keepalive_files
    curr_time = Time.now.to_i
    @expire_files.keys.sort.each do |exp_time|
      if exp_time < curr_time
        @expire_files[exp_time].size.times do |incr|
          file_id = @expire_files[exp_time].shift
          if @files[:by_id].has_key?(file_id)
            ses_id = @files[:by_id][file_id][3]
            del_file( file_id, ses_id )
          end
        end
        @expires_files.delete(exp_time) if @expires_files[exp_time].size == 0
      end
    end
  end
  
  # serves files and images
  def serve( msg, content, format='PNG', type=:img )
    
    # gets a new, unique identifier
    ticket_id = @randgen.give_one
    
    # serve image
    if type == :img
      
      # makes sure the format is in uppper case
      format.upcase!
      
      # checks, that the format is a supported image type
      unless @content_types.keys.include?( format )
        puts "ImgServe.serve: invalid format (#{format.inspect})" if DEBUG_MODE
        return '/img/invalid.gif'
      end
      
      # changes the format to GIF for IE6
      format = 'GIF' if msg.ie6 and format == 'PNG'
      
      # stores the image data and meta-data ready to be served
      storage_hash = @imgs
      storage_arr = [format,0,content,msg.ses_id]
      
      # return an uri that will respond to the data
      uri = "/i/#{ticket_id}.#{format.downcase}"
    
    # serve file
    elsif type == :file
      
      # re-map content_type and filename meta-data from format
      (content_type, filename) = format
      
      # content size for the header
      content_size = content.size.to_s
      
      storage_hash = @files
      storage_arr = [content_type,content_size,content,msg.ses_id,filename]
      
      uri = "/f/#{ticket_id}"
    end
    
    # makes sure, that the storage array has a sub-array for sessions (to aid session-based cleanup)
    storage_hash[:ses_ids][msg.ses_id] = [] unless @imgs[:ses_ids].has_key?(msg.ses_id)
    
    # adds the id to the session-specific storage
    storage_hash[:ses_ids][msg.ses_id].push( ticket_id )
    
    storage_hash[:by_id][ticket_id] = storage_arr
    
    return uri
  end
  
  # serves images
  alias serve_img serve
  
  # serves files
  def serve_file( msg, content='', content_type='text/plain', filename='' )
    return serve( msg, content, [content_type, filename], :file)
  end
  
  # serves static resources
  def serve_rsrc( content, content_type )
    
    rsrc_id = @randgen.give_one
    
    content_size = content.size.to_s
    
    @raw_uris[rsrc_id] = [content_type,content_size,content]
    
    return "/d/#{rsrc_id}"
  end
  
  # serves stuff from get-request
  def get( req, res, type=:img )
    
    is_invalid = true
    
    
    if type == :img
      
      img_id = req.unparsed_uri.split('/i/')[1]
      
      if img_id == nil
        puts "ImgServe.fetch_img: invalid uri#1 (#{req.unparsed_uri.inspect})" if DEBUG_MODE
        img_id = 'invalid.gif'
      end
      
      img_id = img_id.split('.')[0]
      
      if img_id == nil
        puts "ImgServe.fetch_img: invalid uri#2 (#{req.unparsed_uri.inspect})" if DEBUG_MODE
        img_id = 'invalid.gif'
      
      elsif img_id.size != 84
        puts "ImgServe.fetch_img: invalid img_id (#{img_id.inspect})" if DEBUG_MODE
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
        content_size = content.size.to_s
      
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
      file_id = req.unparsed_uri.split('/f/')[1]
      if file_id == nil
        puts "fileServe.fetch_file: invalid uri#1 (#{req.unparsed_uri.inspect})" if DEBUG_MODE
        file_id = 'invalid.gif'
      end
      file_id = file_id.split('.')[0]
      if file_id == nil
        puts "fileServe.fetch_file: invalid uri#2 (#{req.unparsed_uri.inspect})" if DEBUG_MODE
        file_id = 'invalid.gif'
      elsif file_id.size != 84
        puts "fileServe.fetch_file: invalid file_id (#{file_id.inspect})" if DEBUG_MODE
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
      
    elsif type == :rsrc
      rsrc_id = req.unparsed_uri.split('/d/')[1]
      if rsrc_id == nil
        puts "rsrcServe.fetch_rsrc: invalid uri#1 (#{req.unparsed_uri.inspect})"
        rsrc_id = 'invalid.gif'
      end
      rsrc_id = rsrc_id.split('.')[0]
      if rsrc_id == nil
        puts "rsrcServe.fetch_rsrc: invalid uri#2 (#{req.unparsed_uri.inspect})"
        rsrc_id = 'invalid.gif'
      elsif rsrc_id.size != 84
        puts "rsrcServe.fetch_rsrc: invalid rsrc_id (#{rsrc_id.inspect})"
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
    res['Content-Size'] = content_size
    
    res['Date'] = httime( Time.now )
    res['Cache-Control'] = 'no-cache' if not $config[:cache_maximize]
    res['Expires'] = httime(Time.now+$config[:cache_expire]) if $config[:cache_maximize]
    
    res.body = content
    
  end
  
end



