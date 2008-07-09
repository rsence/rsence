=begin
#<Himle::Server::Request:0x20ef0e0
 @env=
  {"HTTP_HOST"=>"localhost:8080",
   "HTTP_ACCEPT"=>
    "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
   "SERVER_NAME"=>"localhost",
   "rack.url_scheme"=>"http",
   "REQUEST_PATH"=>"/U/foofoo",
   "HTTP_USER_AGENT"=>
    "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10.5; en-US; rv:1.9) Gecko/2008061004 Firefox/3.0",
   "HTTP_KEEP_ALIVE"=>"300",
   "CONTENT_LENGTH"=>"0",
   "rack.errors"=>
    #<Rack::Lint::ErrorWrapper:0x20ef108
     @error=
      #<IO:/Users/o/code/nokia/lifestream/server/var/log/himle::server::himleserve.stderr>>,
   "HTTP_ACCEPT_LANGUAGE"=>"en-us,en;q=0.5",
   "CONTENT_TYPE"=>"application/x-www-form-urlencoded",
   "SERVER_PROTOCOL"=>"HTTP/1.1",
   "rack.version"=>[0, 1],
   "rack.run_once"=>false,
   "SERVER_SOFTWARE"=>"Mongrel 1.1.5",
   "PATH_INFO"=>"/U/foofoo",
   "REMOTE_ADDR"=>"127.0.0.1",
   "HTTP_REFERER"=>"http://localhost:8080/",
   "SCRIPT_NAME"=>"",
   "rack.multithread"=>true,
   "HTTP_VERSION"=>"HTTP/1.1",
   "HTTP_COOKIE"=>
    "ses_key=KNaAapFlqCkGWXU4SCh_9iO5GfxTJv1NLm8hBvFN4jyBQyK7D4pIAHEmEw7Sr0EGjylGfoShA60uM6XbX0L577qs8qtHodGmpXkTsTUGrMhhICfZFWxPx3oK7TyHxjX8tUwitx6QqmJ0b9eUUK0qOAUTItM3sWlypCGCGfsLbjjWC1RGcK2_eXQsuxW4nAmT:Domain=localhost:Max-Age=259200:Comment=360Pulse Session Key:Path=/hello",
   "rack.request.form_vars"=>"",
   "rack.multiprocess"=>false,
   "REQUEST_URI"=>"/U/foofoo",
   "rack.request.form_input"=>
    #<Rack::Lint::InputWrapper:0x20ef144 @input=#<StringIO:0x20f2150>>,
   "rack.request.query_hash"=>{},
   "HTTP_ACCEPT_CHARSET"=>"ISO-8859-1,utf-8;q=0.7,*;q=0.7",
   "SERVER_PORT"=>"8080",
   "REQUEST_METHOD"=>"POST",
   "rack.request.form_hash"=>{},
   "rack.request.query_string"=>"",
   "QUERY_STRING"=>"",
   "rack.input"=>
    #<Rack::Lint::InputWrapper:0x20ef144 @input=#<StringIO:0x20f2150>>,
   "HTTP_ACCEPT_ENCODING"=>"gzip,deflate",
   "HTTP_CONNECTION"=>"keep-alive",
   "GATEWAY_INTERFACE"=>"CGI/1.2"},
 @header=
  {"query-string"=>"",
   "server-port"=>"8080",
   "accept-language"=>"en-us,en;q=0.5",
   "accept"=>"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
   "server-name"=>"localhost",
   "path-info"=>"/U/foofoo",
   "connection"=>"keep-alive",
   "request-uri"=>"/U/foofoo",
   "request-path"=>"/U/foofoo",
   "user-agent"=>
    "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10.5; en-US; rv:1.9) Gecko/2008061004 Firefox/3.0",
   "server-protocol"=>"HTTP/1.1",
   "accept-encoding"=>"gzip,deflate",
   "version"=>"HTTP/1.1",
   "referer"=>"http://localhost:8080/",
   "remote-addr"=>"127.0.0.1",
   "server-software"=>"Mongrel 1.1.5",
   "host"=>"localhost:8080",
   "request-method"=>"POST",
   "accept-charset"=>"ISO-8859-1,utf-8;q=0.7,*;q=0.7",
   "keep-alive"=>"300"},
 @path="/U/foofoo",
 @query={}>
=end

require 'pp'

module Himle
module Server
module TicketService
module Upload
  def up(request,response)
    puts "up..."
    #pp request
    response.status = 200
    http_body = '<html><head><title>Uploading Done</title><script type="text/javascript">alert("upload done");</script></head><body></body></html>'
    response['content-type'] = 'text/html; charset=UTF-8'
    response['content-size'] = http_body.size.to_s
    response.body = http_body
  end
end
end
end
end


