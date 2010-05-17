##   RSence
 #   Copyright 2009 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##

module ::RSence
module Plugins
# This class automatically loads a YAML file from "gui" subdirectory of a plugin.
# Extend your plugin from the GUIPlugin class instead of the Plugin class to make
# this work automatically.
# = Usage:
# Initialize like this from inside a plugin method. This will load the "gui/my_gui.yaml" file.
#   @gui = GUIParser.new( self, 'my_gui' )
# To make the client render the contents of the yaml do this:
#   ses = get_ses( msg )
#   params = { :values => @gui.values( ses ) }
#   @gui.init( msg, params )
class GUIParser
  
  include ::RSence
  
  # Use this method to send the client all commands required to construct the GUI Tree using JSONRenderer.
  # = Parameters
  # +msg+::    The +Message+ instance +msg+ used all over the place.
  # +params+:: An hash containing all parameters referred from the YAML file.
  def init( msg, params )
    gui_data = YAML.load( @yaml_src )
    parse_gui( gui_data, params )
    if gui_data.has_key?('dependencies')
      @parent.include_js( msg, gui_data['dependencies'] )
      gui_data.delete('dependencies')
    end
    if gui_data.has_key?('include')
      gui_data['include'].each do | js_file |
        js_src = @parent.read_js_once( msg, js_file )
        msg.reply( js_src )
      end
    end
    gui_name = @parent.name
    json_data = JSON.dump( gui_data )
    msg.reply( "JSONRenderer.nu(#{json_data});", true )
  end
  
  # Use this method to extract all the value id's of the +ses+ hash.
  def values( ses )
    ids = {}
    ses.each do | key, value |
      if value.class == HValue
        ids[ key ] = value.val_id
      end
    end
    return ids
  end
  
private

  def json_fun( value )
    JSON.parse( "[#{value}]" ).first
  end
  
  # Parses the gui data using params. Called from +init+.
  def parse_gui( gui_data, params )
    data_class = gui_data.class
    if data_class == Array
      gui_data.each_with_index do | item, i |
        gui_data[i] = parse_gui( item, params )
      end
    elsif data_class == Hash
      gui_data.each do | key, value |
        gui_data[key] = parse_gui( value, params )
      end
    elsif data_class == Symbol
      sym_str = gui_data.to_s
      if sym_str.include? '.'
        sym_arr = sym_str.split('.')
      else
        sym_arr = [ sym_str ]
      end
      return get_params( sym_arr, params )
    elsif data_class == String and gui_data.strip.start_with?('function(')
      return @parent.plugins[:client_pkg].squeeze( "a="+json_fun( gui_data.to_json ) )[2..-1]
    end
    return gui_data
  end
  
  # Searches the params hash for parameters whenever encountered a Symbol in the YAML.
  def get_params( params_path, params )
    item = params_path.shift
    if params.class == Hash
      has_str = params.has_key?( item )
      has_sym = params.has_key?( item.to_sym )
      item = item.to_sym if has_sym
      if has_str or has_sym
        if params_path.size == 0
          return params[item]
        else
          return get_params( params_path, params[ item ] )
        end
      end
    end
    return ''
  end
  
  # Loads the YAML file.
  # = Parameters
  # +parent+::    The Plugin instance called from, use +self+ when constructing in a Plugin method.
  # +yaml_src+::  The YAML source template for the GUI
  def initialize( parent, yaml_src )
    @parent = parent
    @yaml_src = yaml_src
  end

end
end
end
