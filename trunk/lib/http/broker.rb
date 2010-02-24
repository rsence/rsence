#--
##   Riassence Framework
 #   Copyright 2008 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##
 #++



module Riassence
module Server

# Restful provides the basic structure for Broker
require 'http/restful'

=begin

 Broker routes requests to the proper request processing instance

=end

class Broker
  include RestfulDispatcher
  
  def not_found
    puts "/404: #{@request.fullpath.inspect}" if $DEBUG_MODE
    @response.status = 404
    err404 = '<html><head><title>404 - Page Not Found</title></head><body>404 - Page Not Found</body></html>'
    @response['content-type'] = 'text/html; charset=UTF-8'
    @response['content-length'] = err404.length.to_s
    @response.body = err404
  end
  
  ## Post requests are always xhr requests
  def post
    
    sleep $config[:http_server][:latency]/1000.0 unless $config[:http_server][:latency] == 0
    
    not_found unless $TRANSPORTER.servlet( :post, @request, @response )
    
  end
  
  ## Get requests are different, depending on the uri requested
  def get
    
    sleep $config[:http_server][:latency]/1000.0 unless $config[:http_server][:latency] == 0
    
    not_found unless $TRANSPORTER.servlet( :get, @request, @response )
    
  end
  
  
end

end
end