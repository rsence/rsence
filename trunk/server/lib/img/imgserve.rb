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

require 'lib/session/randgen'

class ImgServlet < WEBrick::HTTPServlet::AbstractServlet
  def do_GET( req, res )
    IMGSERVE.fetch_img( req, res )
  end
end

class FileServlet < WEBrick::HTTPServlet::AbstractServlet
  def do_GET( req, res )
    IMGSERVE.fetch_file( req, res )
  end
end

class RsrcServlet < WEBrick::HTTPServlet::AbstractServlet
  def do_GET( req, res )
    IMGSERVE.fetch_rsrc( req, res )
  end
end

class ImgServe
  
  attr_accessor :raw_uris, :imgs, :content_types
  
  def httime(time)
    return time.gmtime.strftime('%a, %d %b %Y %H:%M:%S %Z')
  end
  
  def initialize( server )
    @expires = {}
    @expire_files = {}
    @server = server
    @server.mount( '/img', ImgServlet )
    @server.mount( '/file', FileServlet )
    @server.mount( '/data', RsrcServlet )
    @imgs = {
      :by_id   => {},
      :ses_ids => {}
    }
    @files = {
      :by_id   => {},
      :ses_ids => {}
    }
    @randgen = HRandgen.new( 64, 600 )
    @content_types = {
      'GIF' => 'image/gif',
      'PNG' => 'image/png',
      'JPG' => 'image/jpeg'
    }
    @raw_uris = {
      'invalid.gif' => ['image/gif','53',['749464839316700090000800000000004e7ebe129f400000000000c200000000700090000020c0c8f70a9c810e0229ea2da1a000b3'].pack('h*')]
    }
  end
  
  def expire_ses( ses_id )
    while @imgs[:ses_ids][ses_id]
      img_id = @imgs[:ses_ids][ses_id].shift
      @imgs[:by_id].delete( img_id )
    end
    @imgs[:ses_ids].delete( img_id )
  end
  
  def del_img( img_id, ses_id )
    #puts "deleting img_id: #{img_id.inspect} of ses_id: #{ses_id.inspect}"
    if @imgs[:ses_ids].has_key?( ses_id )
      @imgs[:ses_ids][ses_id].delete( img_id ) if @imgs[:ses_ids][ses_id].include?( img_id )
    end
    
    @imgs[:by_id].delete( img_id ) if @imgs[:by_id].has_key?( img_id )
  end
  
  def del_file( file_id, ses_id )
    if @files[:ses_ids].has_key?( ses_id )
      @files[:ses_ids][ses_id].delete( file_id ) if @files[:ses_ids][ses_id].include?( file_id )
    end
    @files[:by_id].delete( file_id ) if @files[:by_id].has_key?( file_id )
  end
  
  def del_rsrc( rsrc_id )
    @raw_uris.delete( rsrc_id )
  end
  
  def push_keepalive( img_id, keep_alive )
    expiry_time = Time.now.to_i+keep_alive
    @expires[expiry_time] = [] unless @expires.has_key?(expiry_time)
    @expires[expiry_time].push( img_id )
  end
  
  def push_keepalive_file( file_id, keep_alive )
    expiry_time = Time.now.to_i+keep_alive
    @expire_files[expiry_time] = [] unless @expires.has_key?(expiry_time)
    @expire_files[expiry_time].push( file_id )
  end
  
  def expire_keepalives
    curr_time = Time.now.to_i
    @expires.keys.sort.each do |exp_time|
      if exp_time < curr_time
        @expires[exp_time].each do |img_id|
          ses_id = @imgs[:by_id][img_id][3]
          del_img( img_id, ses_id )
        end
      end
    end
  end
  
  def expire_keepalive_files
    curr_time = Time.now.to_i
    @expire_files.keys.sort.each do |exp_time|
      if exp_time < curr_time
        @expire_files[exp_time].each do |img_id|
          ses_id = @files[:by_id][file_id][3]
          del_file( file_id, ses_id )
        end
      end
    end
  end
  
  def serve( msg, img_data, format )
    
    format.upcase!
    unless @content_types.keys.include?( format )
      puts "ImgServe.serve: invalid format (#{format.inspect})"
      return '/img/invalid.gif'
    end
    
    @imgs[:ses_ids][msg.ses_id] = [] unless @imgs[:ses_ids].has_key?(msg.ses_id)
    
    img_id = @randgen.give_one
    
    #puts "="*80
    #puts "ImgServe.serve: img_id = (#{img_id.inspect})"
    #puts "="*80
    
    @imgs[:ses_ids][msg.ses_id].push( img_id )
    
    content = img_data.to_blob {
      self.format = format
    }
    content_size = content.size.to_s
    content_type = @content_types[format]
    
    #puts "content_size: #{content_size.inspect}\ncontent_type: #{content_type.inspect}\ncontent: #{content[0..80].unpack('h*').inspect}\nimg_id: #{img_id.inspect}"
    
    @imgs[:by_id][img_id] = [content_type,content_size,content,msg.ses_id]
    
    return "/img/#{img_id}.#{format.downcase}"
  end
  
  def serve_file( msg, content, content_type, filename )
    
    @files[:ses_ids][msg.ses_id] = [] unless @files[:ses_ids].has_key?(msg.ses_id)
    
    file_id = @randgen.give_one
    
    @files[:ses_ids][msg.ses_id].push( file_id )
    
    content_size = content.size.to_s
    
    @files[:by_id][file_id] = [content_type,content_size,content,msg.ses_id,filename]
    
    return "/file/#{file_id}"
  end
  
  def serve_rsrc( content, content_type )
    
    rsrc_id = @randgen.give_one
    
    content_size = content.size.to_s
    
    @raw_uris[rsrc_id] = [content_type,content_size,content,nil]
    
    return "/data/#{rsrc_id}"
  end
  
  def fetch_img( req, res )
    #puts "img_ids: #{@imgs[:by_id].inspect}"
    img_id = req.unparsed_uri.split('/img/')[1]
    if img_id == nil
      puts "ImgServe.fetch_img: invalid uri#1 (#{req.unparsed_uri.inspect})"
      img_id = 'invalid.gif'
    end
    img_id = img_id.split('.')[0]
    if img_id == nil
      puts "ImgServe.fetch_img: invalid uri#2 (#{req.unparsed_uri.inspect})"
      img_id = 'invalid.gif'
    elsif img_id.size != 84
      puts "ImgServe.fetch_img: invalid img_id (#{img_id.inspect})"
      img_id = 'invalid.gif'
    end
    if @raw_uris.include?(img_id)
      (content_type,content_size,content) = @raw_uris[img_id]
    elsif @imgs[:by_id].include?(img_id)
      (content_type,content_size,content,ses_id) = @imgs[:by_id][img_id]
      #puts "="*80
      puts "ImgServe.fetch: found img_id = #{img_id.inspect}, ses_id = #{ses_id.inspect}"
      #puts "="*80
      if req.header.has_key?('keep-alive') and req.header['keep-alive'].size > 0
        keep_alive = req.header['keep-alive'][0].to_i
        keep_alive = 10  if keep_alive < 10
        keep_alive = 600 if keep_alive > 600
        #puts "KEEP ALIVE: #{keep_alive.inspect}"
        push_keepalive( img_id, keep_alive )
        expire_keepalives
      else
        del_img( img_id, ses_id )
      end
    else
      #puts "="*80
      #puts "ImgServe.fetch: img_id not found (#{img_id.inspect})"
      #puts "="*80
      (content_type,content_size,content) = @raw_uris['invalid.gif']
    end
    
    res.status = 200
    
    res['Content-Type'] = content_type
    res['Content-Size'] = content_size
    
    res['Date'] = httime( Time.now )
    res['Cache-Control'] = 'no-cache' if not $config[:cache_maximize]
    res['Expires'] = httime(Time.now+$config[:cache_expire]) if $config[:cache_maximize]
    
    res.body = content
    
    #puts "  Content = #{content[0..80].inspect}"
    #puts "  Content_size = #{content_size}"
    #puts "  Content_type = #{content_type}"
    #puts "="*80
  end
    
  def fetch_file( req, res )
    file_id = req.unparsed_uri.split('/file/')[1]
    if file_id == nil
      puts "fileServe.fetch_file: invalid uri#1 (#{req.unparsed_uri.inspect})"
      file_id = 'invalid.gif'
    end
    file_id = file_id.split('.')[0]
    if file_id == nil
      puts "fileServe.fetch_file: invalid uri#2 (#{req.unparsed_uri.inspect})"
      file_id = 'invalid.gif'
    elsif file_id.size != 84
      puts "fileServe.fetch_file: invalid file_id (#{file_id.inspect})"
      file_id = 'invalid.gif'
    end
    if @raw_uris.include?(file_id)
      (content_type,content_size,content) = @raw_uris[file_id]
    elsif @files[:by_id].include?(file_id)
      (content_type,content_size,content,ses_id) = @files[:by_id][file_id]
      puts "fileServe.fetch: found file_id = #{file_id.inspect}, ses_id = #{ses_id.inspect}"
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
    
    res.status = 200
    
    res['Content-Type'] = content_type
    res['Content-Size'] = content_size
    
    res['Date'] = httime( Time.now )
    res['Cache-Control'] = 'no-cache' if not $config[:cache_maximize]
    res['Expires'] = httime(Time.now+$config[:cache_expire]) if $config[:cache_maximize]
    
    res.body = content
  end
  
  def fetch_rsrc( req, res )
    rsrc_id = req.unparsed_uri.split('/data/')[1]
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
    
    res.status = 200
    
    res['Content-Type'] = content_type
    res['Content-Size'] = content_size
    
    res['Date'] = httime( Time.now )
    res['Cache-Control'] = 'no-cache' if not $config[:cache_maximize]
    res['Expires'] = httime(Time.now+$config[:cache_expire]) if $config[:cache_maximize]
    
    res.body = content
    
  end
  
end


# should be DATASERVE, will change later..
IMGSERVE = ImgServe.new($server)



