##   Riassence Framework
 #   Copyright 2009 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##

## The GUIPlugin extends Plugin by automatically initializing an GUIParser
## instance as @gui
## It makes the include_js method public to enable automatic dependency
## loading based on the dependencies item in the YAML gui declaration.
## It also makes the @path public.
## It inits the gui automatically.
## Extend the gui_params method to define your own params for the gui data.
##
## HValues can be defined inside values.yaml at the root directory of
## plugin. The HValues may be linked directly with methods on the values.yaml
## as well.
##
## == Values.yaml
## :valuename:    # name of the HValue
##  :value: 2.56  # defined value
##  :responders:  # methods responding to the value on ruby code upon change
##    - :method: validate_convert_factor
##
##
##
class GUIPlugin < Plugin
  
  # Automatically initializes an GUIParser instance as @gui
  def init
    super
    @gui = GUIParser.new( self, @name )
  end
  
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
  public :include_js, :read_js_once
  
  attr_reader :plugins
  
end


