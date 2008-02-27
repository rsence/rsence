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

require 'RMagick'

require 'lib/session/randgen'

class ImgServlet < WEBrick::HTTPServlet::AbstractServlet
  def do_GET( req, res )
    IMGSERVE.fetch( req, res )
  end
end

class ImgServe
  
  def httime(time)
    return time.gmtime.strftime('%a, %d %b %Y %H:%M:%S %Z')
  end
  
  def initialize( server )
    @server = server
    @server.mount( '/img', ImgServlet )
    @imgs = {
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
  
  def serve( msg, img_data, format )
    
    format.upcase!
    unless @content_types.keys.include?( format )
      puts "ImgServe.store: invalid format (#{format.inspect})"
      return '/img/invalid.gif'
    end
    
    @imgs[:ses_ids][msg.ses_id] = [] unless @imgs[:ses_ids].has_key?(msg.ses_id)
    
    img_id = @randgen.give_one
    @imgs[:ses_ids][msg.ses_id].push( img_id )
    
    content = img_data.to_blob {
      self.format = format
    }
    content_size = content.size.to_s
    content_type = @content_types[format]
    
    #puts "content_size: #{content_size.inspect}\ncontent_type: #{content_type.inspect}\ncontent: #{content[0..80].unpack('h*').inspect}\nimg_id: #{img_id.inspect}"
    
    @imgs[:by_id][img_id] = [content_type,content_size,content]
    
    return "/img/#{img_id}.#{format.downcase}"
  end
  
  def fetch( req, res )
    #puts "img_ids: #{@imgs[:by_id].inspect}"
    img_id = req.unparsed_uri.split('/img/')[1]
    if img_id == nil
      puts "ImgServe.store: invalid uri#1 (#{req.unparsed_uri.inspect})"
      img_id = 'invalid.gif'
    end
    img_id = img_id.split('.')[0]
    if img_id == nil
      puts "ImgServe.store: invalid uri#2 (#{req.unparsed_uri.inspect})"
      img_id = 'invalid.gif'
    elsif img_id.size != 84
      puts "ImgServe.store: invalid img_id (#{img_id.inspect})"
      img_id = 'invalid.gif'
    end
    if @raw_uris.include?(img_id)
      (content_type,content_size,content) = @raw_uris[img_id]
    elsif @imgs[:by_id].include?(img_id)
      (content_type,content_size,content) = @imgs[:by_id][img_id]
    else
      puts "ImgServe.store: img_id not found (#{img_id.inspect})"
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

IMGSERVE = ImgServe.new($server)



