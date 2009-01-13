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

## Initialize SOAPPlugin with its fully qualified urn, for instance:
#  soap_plug = SOAPPlugin.new( 'urn:TestPlugin' )
class SOAPPlugin


#  WARNING: All public methods are accessible through SOAP as-is!
public
  
  def initialize( urn )
    @path = PluginManager.curr_plugin_path
    register( urn )
    init
  end


#  NOTE: Only specify private methods, unless you are certain
#        you want them to be accessible through SOAP!
private
  
  ## Extendables
  
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
  
  ### Registers a plugin with the name +name+
  def register( urn )
    
    # ensures the urn is valid (of course we could do some additional checking)
    urn = "urn:#{urn}" unless urn[0..3] == 'urn:'
    
    # get the methods for pluginmanager
    init_method    = self.method( 'init'  )
    open_method    = self.method( 'open'  )
    flush_method   = self.method( 'flush' )
    close_method   = self.method( 'close' )
    
    ## registers itself as a soap servant
    PluginManager.add_soap_plugin( self, urn, {
      :init => init_method, :flush => flush_method,
      :open => open_method, :close => close_method
    } )
    
    
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



