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

module Himle
module Server

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
      'Content-Type' => 'text/plain'
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
end