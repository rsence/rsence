# -* coding: UTF-8 -*-
###
  # Riassence Core -- http://rsence.org/
  #
  # Copyright (C) 2009 Toni Nurminen <tjn@riassence.com>
  #
  # This file is part of Riassence Core.
  #
  # Riassence Core is free software: you can redistribute it and/or modify
  # it under the terms of the GNU General Public License as published by
  # the Free Software Foundation, either version 3 of the License, or
  # (at your option) any later version.
  #
  # Riassence Core is distributed in the hope that it will be useful,
  # but WITHOUT ANY WARRANTY; without even the implied warranty of
  # MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  # GNU General Public License for more details.
  #
  # You should have received a copy of the GNU General Public License
  # along with this program.  If not, see <http://www.gnu.org/licenses/>.
  #
  ###
  
require 'shared-mime-info'
require 'yaml'
require 'cgi'
class FSMount < ServletPlugin


  def open
    @conf = YAML::load(File.read(File.join(@path, '/conf/fileconfig')))
  end

  def uri_matches?(uri)
    @conf.each_key do |uri_prefix|
      return true if uri[0..(uri_prefix.length - 1)] == uri_prefix
    end
    return false
  end
  
  def uri_to_path(uri)
    @conf.each_key do |uri_prefix|
      if uri[0..(uri_prefix.length - 1)] == uri_prefix
        root_path = @conf[uri_prefix]['path']
        rel_path = uri[uri_prefix.length..-1]
        full_path = File.expand_path(File.join(root_path,rel_path))
        return full_path
      end
    end
  end
  
  def error_404(res)
    res.status = 404
    res['content-type'] = 'text/plain'
    res.body = '404 - Not Found'
  end
  
  def match( uri, request_type) 
    return (request_type == :get and uri_matches?(uri))
  end
  
  def html_index(full_path, res, uri)
    res.status = 200
    res['content-type'] = 'text/html; charset=UTF-8'
    directories = Dir.entries(full_path)
    directoryhtml = ''
    directories.each do |dir|
      directoryhtml += %{<a href="#{File.join(uri,CGI.escape(dir))}">#{dir}</a><br>}
    end
    
    
    res.body = directoryhtml
    
  end
  
  def serve_file(full_path, res)
    begin
      res.status = 200
      res['content-type'] = MIME::check(full_path).type
      content = File.read(full_path)
      res['content-length'] = content.length
      res.body = content
    rescue
      res.status = 503
      res['content-type'] = 'text/plain'
      res.body = '503 - Generic Server Error'
    end
  end
  
  def get( req, res, ses)
    uri = CGI.unescape(req.fullpath)
    unless uri_matches?(uri) 
      error_404(res)
      return
    end
    full_path = uri_to_path(uri)
    unless File.exist?(full_path)
      error_404(res)
      return
    end
    if File.directory?(full_path)
      html_index(full_path, res, uri)
    else
      serve_file(full_path, res)
    end
  end
  
  
end
FSMount.new