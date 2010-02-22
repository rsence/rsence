##   Riassence Framework
 #   Copyright 2009 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##

module Riassence
module Server

## Register the ServletPlugin with a regular expression that
## should match its uri. Alternatively just a string, but
## that needs to be an exact match.
## servlet_plug = ServletPlugin.new
## servlet_plug.register_get( /\/about\/.*/ )
## servlet_plug.register_post( '/mailsender' )
## servlet_plug.register( /\/feedback\/.*/ )
class Servlet
  
  # Initializes and registers the ServletPlugin.
  def initialize
    @path = PluginManager.curr_plugin_path
    register
    init
  end
  
  # Servlet ID
  attr_reader :servlet_id
  def register # :nodoc
    
    ## registers itself as a soap servant
    @servlet_id = PluginManager.add_servlet( self )
    
    
  end
  
  ## Extendables
  
  # Return true to match, false to not match. Returns false as default if 
  # not extended.
  def match( uri, request_type=:get )
    return false
  end
  
  # If match, return score (lower is better). Returns 100 by defalt if not 
  # extended
  def score
    return 100
  end
  
  # Extend to do any GET request processing. Not doing anything by default.
  def get( req, res, ses )
    
  end
  
  # Extend to do any POST request processing. Not doing anything by default.
  def post( req, res, ses )
    
  end
  
  # Extend to do any initial configuration. Not doing anything by default.
  def init
  end
  
  # Extend to manage stream or database opening etc.
  # It is called when everything is set to go after all plugins are 
  # loaded / reloaded. Not doing anything by default.
  def open
  end
  
  # Extend to save your plugin state, when the system is going down.
  # Not doing anything by default.
  def flush
  end
  
  # Extend to manage stream or database closing etc.
  # It is called before plugins are loaded / reloaded. Not doing anything by 
  # default.
  def close
  end
  
  ## Utilities
  
  # File reader utility,
  # practical for simple file data operations.
  # Path given as parameter.
  def file_read( path )
    if path[0].chr != '/' and path[0..1] != '..'
      path = File.join( @path, path )
    end
    return File.read( path )
  end
  
end

ServletPlugin = Servlet

end
end


