# -* coding: UTF-8 -*-
###
  # Himle Server -- http://himle.org/
  #
  # Copyright (C) 2009 Juha-Jarmo Heinonen
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

## Register the ServletPlugin with a regular expression that
#  should match its uri. Alternatively just a string, but
#  that needs to be an exact match.
#  servlet_plug = ServletPlugin.new
#  servlet_plug.register_GET( /\/about\/.*/ )
#  servlet_plug.register_POST( '/mailsender' )
#  servlet_plug.register( /\/feedback\/.*/ )
class ServletPlugin
  
  def initialize
    @path = PluginManager.curr_plugin_path
    init
  end
  
  ### Registers a GET listener for the uri_match string or regex
  def register_GET( uri_match )
    
  end
  
  ### Registers a POST listener for the uri_match string or regex
  def register_POST( uri_match )
    
  end
  
  ### Registers both a GET and POST listener for the uri_match string or regex
  def register( uri_match )
    register_GET( uri_match )
    register_POST( uri_match )
  end
  
  ## Extendables
  
  # Extend to do any GET request processing
  def do_GET( req, res, ses )
    
  end
  
  # Extend to do any POST request processing
  def do_POST( req, res, ses )
    
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



