# -* coding: UTF-8 -*-
##   Riassence Framework
 #   Copyright 2008 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##


require 'rubygems'
require 'rack'

module Riassence
module Server

class Request < Rack::Request
  attr_reader :header, :path, :query
  def initialize(env)
    @header = {
      
    }
    super
    env2header()
    @path = path_info()
    @query = params()
  end
  def unparsed_uri
    return @header['request-uri']
  end
  def env2header
    [ ['SERVER_NAME',           'server-name'],
      ['HTTP_USER_AGENT',       'user-agent'],
      ['HTTP_ACCEPT_ENCODING',  'accept-encoding'],
      ['PATH_INFO',             'path-info'],
      ['HTTP_HOST',             'host'],
      ['HTTP_ACCEPT_LANGUAGE',  'accept-language'],
      ['SERVER_PROTOCOL',       'server-protocol'],
      ['REQUEST_PATH',          'request-path'],
      ['HTTP_KEEP_ALIVE',       'keep-alive'],
      ['SERVER_SOFTWARE',       'server-software'],
      ['REMOTE_ADDR',           'remote-addr'],
      ['HTTP_REFERER',          'referer'],
      ['HTTP_VERSION',          'version'],
      ['HTTP_ACCEPT_CHARSET',   'accept-charset'],
      ['REQUEST_URI',           'request-uri'],
      ['SERVER_PORT',           'server-port'],
      ['QUERY_STRING',          'query-string'],
      ['HTTP_ACCEPT',           'accept'],
      ['REQUEST_METHOD',        'request-method'],
      ['HTTP_CONNECTION',       'connection'],
      ['HTTP_SOAPACTION',       'soapaction']
    ].each do |env_key,header_key|
      @header[header_key] = @env[env_key] if @env.has_key?(env_key)
      @header["x-#{header_key}"] = @env["X_#{env_key}"] if @env.has_key?("X_#{env_key}")
      x_env_key = "#{env_key.gsub('HTTP_','HTTP_X_')}"
      @header["x-#{header_key}"] = @env[x_env_key] if @env.has_key?(x_env_key) if x_env_key.include?('X_')
    end
  end
end


end
end
