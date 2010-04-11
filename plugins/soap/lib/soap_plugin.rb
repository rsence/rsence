#--
##   Riassence Framework
 #   Copyright 2008 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##
 #++

module RSence

## Initialize SOAPPlugin with its fully qualified urn, for instance:
##  soap_plug = SOAPPlugin.new( 'urn:TestPlugin' )
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
  
  include PluginUtil
  
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
  
  
end

end



