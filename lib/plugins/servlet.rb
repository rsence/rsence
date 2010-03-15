##   Riassence Framework
 #   Copyright 2009 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##

## Register the ServletPlugin with a regular expression that
## should match its uri. Alternatively just a string, but
## that needs to be an exact match.
## servlet_plug = ServletPlugin.new
## servlet_plug.register_get( /\/about\/.*/ )
## servlet_plug.register_post( '/mailsender' )
## servlet_plug.register( /\/feedback\/.*/ )
class Servlet
  
  include PluginUtil
  
  # Initializes and registers the ServletPlugin.
  def initialize( name = false )
    @info    = @@bundle_info
    if name
      @name = name
    else
      @name    = @@bundle_name
    end
    @path    = @@bundle_path
    @plugins = @@plugin_manager
    register
    @inited = false
  end
  
  # Servlet ID
  attr_reader :name, :path, :info, :inited
  def register # :nodoc
    @plugins.register_bundle( self, @name )
    @inited = true
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
  
end

ServletPlugin = Servlet


