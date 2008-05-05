
class ResponseBody < Array
  def +(body_data)
    self.push(body_data)
  end
end

## Minimally WEBrick -compatible Response object.
## Implements only used methods
class Response
  def initialize
    @body = ResponseBody.new(1)
    @body[0] = ''
    @status = 200
    @header = {
      'content-type' => 'text/plain'
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
    @header['content-type'] = new_content_type
  end
  def content_type
    @header['content-type']
  end
  def []=(header_key,header_val)
    @header[header_key.downcase] = header_val.to_s
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

