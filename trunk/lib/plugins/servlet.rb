# -* coding: UTF-8 -*-
###
  # Riassence Core -- http://rsence.org/
  #
  # Copyright (C) 2009 Juha-Jarmo Heinonen <jjh@riassence.com>
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

module Riassence
module Server

## Register the ServletPlugin with a regular expression that
#  should match its uri. Alternatively just a string, but
#  that needs to be an exact match.
#  servlet_plug = ServletPlugin.new
#  servlet_plug.register_get( /\/about\/.*/ )
#  servlet_plug.register_post( '/mailsender' )
#  servlet_plug.register( /\/feedback\/.*/ )
class ServletPlugin
  
  
  def initialize
    @path = PluginManager.curr_plugin_path
    register
    init
  end
  
  attr_reader :servlet_id
  def register
    
    ## registers itself as a soap servant
    @servlet_id = PluginManager.add_servlet( self )
    
    
  end
  
  ## Extendables
  
  # return true to match, false to not match
  def match( uri, request_type=:get )
    return false
  end
  
  # if match, return score (lower is better)
  def score
    return 100
  end
  
  # Extend to do any GET request processing
  def get( req, res, ses )
    
  end
  
  # Extend to do any POST request processing
  def post( req, res, ses )
    
  end
  
  # Extend to do any initial configuration
  def init
  end
  
  # Extend to manage stream or database opening etc..
  # It is called when everything is set to go after all plugins are loaded / reloaded.
  def open
  end
  
  # Extend to save your plugin state, when the system is going down.
  def flush
  end
  
  # Extend to manage stream or database closing etc..
  # It is called before plugins are loaded / reloaded
  def close
  end
  
  ## Utilities
  
  # File reader utility,
  # practical for simple file data operations
  def file_read( path )
    if path[0].chr != '/' and path[0..1] != '..'
      path = File.join( @path, path )
    end
    return File.read( path )
  end
  
end

end
end



