##   Riassence Framework
 #   Copyright 2009 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##

module Riassence
module Server

class GUIParser
  def init( msg, params )
    gui_data = YAML.load( @yaml_src )
    parse_gui( gui_data, params )
    msg.reply "JSONRenderer.nu( #{gui_data.to_json} );"
  end
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
  def parse_gui( gui_data, params )
    data_class = gui_data.class
    if data_class == Array
      gui_data.each_with_index do |item,i|
        gui_data[i] = parse_gui( item, params )
      end
    elsif data_class == Hash
      gui_data.each do |key,value|
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
    end
    return gui_data
  end
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
  def initialize( parent, gui_name )
    @parent = parent
    @yaml_src = File.read(
      File.join( parent.path, 'gui', "#{gui_name}.yaml" )
    )
  end
end
end

end

