#--
##   Riassence Framework
 #   Copyright 2010 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##
 #++

# = Riassence Unit Converter
# This plugin demonstrates simple yaml-based gui with
# simple server interaction.
# The server-side code extends the +GUIPlugin+ class with value responders,
# constructs and registers a GUIPlugin instance that loads the associated
# gui/unit_converter.yaml file  and sends its contents to the client where
# it's rendered.
# Values are defined in the values.yaml file.
class UnitConverter < GUIPlugin
  def limit_number( msg, value, min_value, max_value )
    data = value.data
    if data < min_value
      data = min_value
    elsif data > max_value
      data = max_value
    end
    if data != value.data
      value.set( msg, data )
    end
    return data
  end
  def validate_input( msg, input_number )
    data = limit_number( msg, input_number, -1000000000, 1000000000 )
    recalculate( msg )
    return true
  end
  def validate_convert_factor( msg, convert_factor )
    data = limit_number( msg, convert_factor, -10000, 10000 )
    recalculate( msg )
    return true
  end
  def recalculate( msg )
    ses = get_ses( msg )
    input_number = ses[:input_number].data
    convert_factor = ses[:convert_factor].data
    output_number = ses[:output_number]
    output_number.set( msg, input_number * convert_factor )
  end
end
UnitConverter.new.register( 'unit_converter' )
