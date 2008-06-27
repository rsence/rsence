# -* coding: UTF-8 -*-
###
  # Himle Server -- http://himle.org/
  #
  # Copyright (C) 2008 Juha-Jarmo Heinonen
  #
  # This file is part of Himle Server.
  #
  # Himle Server is free software: you can redistribute it and/or modify
  # it under the terms of the GNU General Public License as published by
  # the Free Software Foundation, either version 3 of the License, or
  # (at your option) any later version.
  #
  # Himle server is distributed in the hope that it will be useful,
  # but WITHOUT ANY WARRANTY; without even the implied warranty of
  # MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  # GNU General Public License for more details.
  #
  # You should have received a copy of the GNU General Public License
  # along with this program.  If not, see <http://www.gnu.org/licenses/>.
  #
  ###

require 'rubygems'
require 'rack'

module Himle
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
      ['HTTP_CONNECTION',       'connection']
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
