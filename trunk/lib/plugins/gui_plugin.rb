##   Riassence Framework
 #   Copyright 2009 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##

module Riassence
module Server

# The GUIPlugin extends Plugin by automatically initializing an GUIParser
# instance as @gui
# It makes the include_js method public to enable automatic dependency
# loading based on the dependencies item in the YAML gui declaration.
# It also makes the @path public.
# It inits the gui automatically.
# Extend the gui_params method to define your own params for the gui data.
class GUIPlugin < Plugin
  
  # Automatically initializes an GUIParser instance as @gui
  def init
    super
    @gui = GUIParser.new( self, @names.first )
  end
  
  # Makes @path public to enable GUIParser
  attr_reader :path
  
  # Extend this method to return custom params to GUIParser#init.
  # Called from init_ui.
  # By default assigns the session values as :values to use for 
  # valueObjId: ":values.my_value_name" in the YAML GUI file.
  def gui_params( msg )
    return {
      :values => @gui.values( get_ses( msg ) )
    }
  end
  
  # Automatically inits the UI using GUIParser#init.
  # Passes on the return value of gui_params.
  def init_ui( msg )
    @gui.init( msg, gui_params( msg ) )
  end
  
  # Makes include_js public to enable calls to it from GUIParser
  public :include_js
  
end

end
end

