
# -* coding: UTF-8 -*-
###
  # Himle Server -- http://himle.org/
  #
  # Copyright (C) 2008 Juha-Jarmo Heinonen
  #
  # This file is part of Himle Server.
  #
  ###

# SOAP handler servlet for RACK / Himle

# Modified from soap/rpc/soaplet.rb of soap4r:
#
# Copyright (C) 2000-2007  NAKAMURA, Hiroshi <nahi@ruby-lang.org>.

# This program is copyrighted free software by NAKAMURA, Hiroshi.  You can
# redistribute it and/or modify it under the same terms of Ruby's license;
# either the dual license version in 2003, or any later version.


require 'soap/rpc/router'
require 'soap/streamHandler'

module SOAP
module RPC

class Himle_SOAPlet
  
public
  
  attr_reader :options
  attr_accessor :authenticator
  
  ### Initialize with optional router argument (defaults to ::SOAP::RPC::Router)
  def initialize(router = nil)
    @router = router or ::SOAP::RPC::Router.new(self.class.name)
    @options = {}
    @config = {}
  end
  
  ### Setter for gzipped transfer encoding
  def allow_content_encoding_gzip=(allow)
    @options[:allow_content_encoding_gzip] = allow
  end
  
  ### Request/Response handler
  def post( req, res )
    puts "SOAP request: " + req.body if $DEBUG_MODE
    begin
      conn_data = ::SOAP::StreamHandler::ConnectionData.new
      setup_req(conn_data, req)
      @router.external_ces = @options[:external_ces]
      Mapping.protect_threadvars(:SOAPlet) do
        SOAPlet.user = req.user
        SOAPlet.cookies = req.cookies
        conn_data = @router.route(conn_data)
        setup_res(conn_data, req, res)
      end
    rescue Exception => e
      conn_data = @router.create_fault_response(e)
      res.status = WEBrick::HTTPStatus::RC_INTERNAL_SERVER_ERROR
      res.body = conn_data.send_string
      res['content-type'] = conn_data.send_contenttype || "text/xml"
    end
    if res.body.is_a?(IO)
      res.chunked = true
      logger.debug { "SOAP response: (chunked response not logged)" } if logger
    else
      logger.debug { "SOAP response: " + res.body } if logger
    end
  end
  
  def self.cookies
    get_variable(:Cookies)
  end
  
  def self.cookies=(cookies)
    set_variable(:Cookies, cookies)
  end
  
  def self.user
    get_variable(:User)
  end
  
  def self.user=(user)
    set_variable(:User, user)
  end
  
private
  
  def self.get_variable(name)
    if var = Thread.current[:SOAPlet]
      var[name]
    else
      nil
    end
  end
  
  def self.set_variable(name, value)
    var = Thread.current[:SOAPlet] ||= {}
    var[name] = value
  end
  
  def logger
    @config[:Logger]
  end
  
  def setup_req(conn_data, req)
    conn_data.receive_string = req.body
    conn_data.receive_contenttype = req['content-type']
    conn_data.soapaction = parse_soapaction(req.meta_vars['HTTP_SOAPACTION'])
  end
  
  def setup_res(conn_data, req, res)
    res['content-type'] = conn_data.send_contenttype
    cookies = SOAPlet.cookies
    unless cookies.empty?
      res['set-cookie'] = cookies.collect { |cookie| cookie.to_s }
    end
    if conn_data.is_nocontent
      res.status = 202 # "Accepted"
      res.body = ''
      return
    end
    if conn_data.is_fault
      res.status = 500 # "Internal Server Error"
    end
    if outstring = encode_gzip(req, conn_data.send_string)
      res['content-encoding'] = 'gzip'
      res['content-length'] = outstring.size
      res.body = outstring
    else
      res.body = conn_data.send_string
    end
  end
  
  def parse_soapaction(soapaction)
    if !soapaction.nil? and !soapaction.empty?
      if /^"(.+)"$/ =~ soapaction
        return $1
      end
    end
    nil
  end
  
  def encode_gzip(req, outstring)
    unless encode_gzip?(req)
      return nil
    end
    begin
      ostream = StringIO.new
      gz = Zlib::GzipWriter.new(ostream)
      gz.write(outstring)
      ostream.string
    ensure
      gz.close
    end
  end
  
  def encode_gzip?(req)
    @options[:allow_content_encoding_gzip] and defined?(::Zlib) and
      req['accept-encoding'] and
      req['accept-encoding'].split(/,\s*/).include?('gzip')
  end
end


end
end
