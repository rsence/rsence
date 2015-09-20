
module RSence
  
  # Classic WEBrick -compatible Response object for Rack.
  # Implements only the methods used by the framework.
  class Response
    
    # Adds the + method "operator" to an extended Array.
    # Used for pushing http body data.
    class ResponseBody < Array
      
      def push( body_data )
        super( sanitize_body_data( body_data ) )
      end
      def sanitize_body_data( body_data )
        if body_data.class == String or body_data.class == GZString
          return body_data
        elsif body_data.respond_to?(:to_s)
          warn "WARNING: RSence::Response::ResponseBody -> body_data is not a string. It's a #{body_data.class}, with the following contents: #{body_data.inspect}" if RSence.args[:verbose]
          return body_data.to_s
        else
          warn "Invalid response data: #{body_data.inspect[0..100]}"
          return ''
        end
      end
      def +(body_data)
        self.push(body_data)
      end
    end

    def initialize
      @body = ResponseBody.new(1)
      @body[0] = ''
      @status = 200
      @header = {
        'Content-Type' => 'text/plain',
        'Server' => RSence.config[:http_server][:name]
      }
    end
    def body=(body_data)
      @body = ResponseBody.new(1)
      @body[0] = @body.sanitize_body_data( body_data )
    end
    def body
      @body
    end
    def body_bytes
      bytes = 0
      @body.each do |part|
        if part.respond_to?(:to_s)
          bytes += part.to_s.bytesize
        else
          warn "body data part does not respond to to_s: #{part.inspect[0..100]}"
        end
      end
      return bytes.to_s
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

