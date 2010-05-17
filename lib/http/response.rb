#--
##   RSence
 #   Copyright 2008 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##
 #++


module RSence

class ResponseBody < Array
  def +(body_data)
    self.push(body_data)
  end
end

## Minimally WEBrick -compatible Response object.
## Implements only the methods used by the framework.
class Response
  def initialize
    @body = ResponseBody.new(1)
    @body[0] = ''
    @status = 200
    @header = {
      'Content-Type' => 'text/plain',
      'Server' => 'RSence'
    }
  end
  def body=(body_data)
    @body = ResponseBody.new(1)
    @body[0] = body_data
  end
  def body
    @body.join
  end
  def content_type=(new_content_type)
    @header['Content-Type'] = new_content_type
  end
  def content_type
    @header['Content-Type']
  end
  def camelize( header_key )
    header_key.capitalize.gsub(/\-([a-z])/) { '-'+$1.upcase }
  end
  def []=(header_key,header_val)
    @header[camelize( header_key )] = header_val.to_s
  end
  def status=(new_val)
    @status = new_val.to_i
  end
  def status
    @status
  end
  def header
    @header
  end
end

end

