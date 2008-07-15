=begin
#<Himle::Server::Request:0x150da9c
 @env=
  {"SERVER_NAME"=>"localhost",
   "rack.url_scheme"=>"http",
   "CONTENT_LENGTH"=>"19811",
   "HTTP_ACCEPT_ENCODING"=>"gzip,deflate",
   "HTTP_USER_AGENT"=>
    "Mozilla/5.0 (Macintosh; U; PPC Mac OS X Mach-O; en-US; rv:1.8.1.15) Gecko/20080623 Firefox/2.0.0.15",
   "PATH_INFO"=>"/U/",
   "rack.run_once"=>false,
   "rack.input"=>
    #<Rack::Lint::InputWrapper:0x150dba0 @input=#<StringIO:0x1511ffc>>,
   "SCRIPT_NAME"=>"",
   "SERVER_PROTOCOL"=>"HTTP/1.1",
   "HTTP_ACCEPT_LANGUAGE"=>"en-us,en;q=0.5",
   "HTTP_HOST"=>"localhost:8001",
   "rack.errors"=>
    #<Rack::Lint::ErrorWrapper:0x150db14
     @error=
      #<IO:/Users/o/code/himle/trunk/server/var/log/himle::server::himleserve.stderr>>,
   "REMOTE_ADDR"=>"127.0.0.1",
   "HTTP_KEEP_ALIVE"=>"300",
   "REQUEST_PATH"=>"/U/",
   "SERVER_SOFTWARE"=>"thin 0.8.2 codename Double Margarita",
   "CONTENT_TYPE"=>
    "multipart/form-data; boundary=---------------------------1019292671580723810704877633",
   "HTTP_REFERER"=>"http://localhost:8001/",
   "rack.request.form_input"=>
    #<Rack::Lint::InputWrapper:0x150dba0 @input=#<StringIO:0x1511ffc>>,
   "rack.request.query_hash"=>
    {"upload_file77"=>
      {:type=>"application/msword",
       :filename=>"A.doc",
       :head=>
        "Content-Disposition: form-data; name=\"upload_file77\"; filename=\"A.doc\"\r\nContent-Type: application/msword\r\n",
       :name=>"upload_file77",
       :tempfile=>
        #<File:/var/folders/jk/jkDpFGpfFb08aV6Rcfl1iE+++TI/-Tmp-/RackMultipart.9499.0>},
     "upload_button77"=>"Upload"},
   "HTTP_COOKIE"=>
    "ses_key=z4UbPjR_LpmNvMbl46VQiQAeFLxA9Ud5RaLNYqYPdgWmHtiv7ht5JCH5XFVpdTHFd6vj5C3kbKE4tfYvmgv358JihCHJkmNKC6Ybi9VocRW1zhW5KBY7Lv6ewr7YhFmANLiUwXJrx5zck58uy97tpz03tbo1HWMge45k7NE_XwnY7qFPTxg26qhX_QBTW204:Domain=localhost:Max-Age=900:Comment=Himle session key (just for your convenience):Path=/hello",
   "HTTP_ACCEPT_CHARSET"=>"ISO-8859-1,utf-8;q=0.7,*;q=0.7",
   "HTTP_VERSION"=>"HTTP/1.1",
   "rack.multithread"=>false,
   "rack.version"=>[0, 3],
   "REQUEST_URI"=>"/U/",
   "rack.multiprocess"=>false,
   "SERVER_PORT"=>"8001",
   "rack.request.form_hash"=>
    {"upload_file77"=>
      {:type=>"application/msword",
       :filename=>"A.doc",
       :head=>
        "Content-Disposition: form-data; name=\"upload_file77\"; filename=\"A.doc\"\r\nContent-Type: application/msword\r\n",
       :name=>"upload_file77",
       :tempfile=>
        #<File:/var/folders/jk/jkDpFGpfFb08aV6Rcfl1iE+++TI/-Tmp-/RackMultipart.9499.0>},
     "upload_button77"=>"Upload"},
   "rack.request.query_string"=>"",
   "QUERY_STRING"=>"",
   "GATEWAY_INTERFACE"=>"CGI/1.2",
   "HTTP_ACCEPT"=>
    "text/xml,application/xml,application/xhtml+xml,text/html;q=0.9,text/plain;q=0.8,image/png,*/*;q=0.5",
   "HTTP_CONNECTION"=>"keep-alive",
   "REQUEST_METHOD"=>"POST"},
 @header=
  {"query-string"=>"",
   "server-port"=>"8001",
   "accept-language"=>"en-us,en;q=0.5",
   "path-info"=>"/U/",
   "connection"=>"keep-alive",
   "accept"=>
    "text/xml,application/xml,application/xhtml+xml,text/html;q=0.9,text/plain;q=0.8,image/png,*/*;q=0.5",
   "accept-encoding"=>"gzip,deflate",
   "request-uri"=>"/U/",
   "request-path"=>"/U/",
   "user-agent"=>
    "Mozilla/5.0 (Macintosh; U; PPC Mac OS X Mach-O; en-US; rv:1.8.1.15) Gecko/20080623 Firefox/2.0.0.15",
   "server-name"=>"localhost",
   "version"=>"HTTP/1.1",
   "referer"=>"http://localhost:8001/",
   "remote-addr"=>"127.0.0.1",
   "server-protocol"=>"HTTP/1.1",
   "accept-charset"=>"ISO-8859-1,utf-8;q=0.7,*;q=0.7",
   "host"=>"localhost:8001",
   "request-method"=>"POST",
   "keep-alive"=>"300",
   "server-software"=>"thin 0.8.2 codename Double Margarita"},
 @path="/U/",
 @query=
  {"upload_file77"=>
    {:type=>"application/msword",
     :filename=>"A.doc",
     :head=>
      "Content-Disposition: form-data; name=\"upload_file77\"; filename=\"A.doc\"\r\nContent-Type: application/msword\r\n",
     :name=>"upload_file77",
     :tempfile=>
      #<File:/var/folders/jk/jkDpFGpfFb08aV6Rcfl1iE+++TI/-Tmp-/RackMultipart.9499.0>},
   "upload_button77"=>"Upload"}>
=end

require 'pp'

module Himle
module Server
module TicketService
module Upload
  def up(request,response)
    pp request
    response.status = 200
    http_body = '<html><head><title>Uploading Done</title><script type="text/javascript">alert("upload done");</script></head><body></body></html>'
    response['content-type'] = 'text/html; charset=UTF-8'
    response['content-size'] = http_body.size.to_s
    response.body = http_body
  end
  def upload_key(msg,max_size=10000,mime_allow=/text\/(.*?)/)
  end
end
end
end
end


