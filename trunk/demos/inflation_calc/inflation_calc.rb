#--
##   Riassence Framework
 #   Copyright 2009 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##
 #++

# = Inflation Calculator
# This plugin demonstrates using a separate library file for
# calculating values and how to initialize values and user interfaces
# without YAML.
#
$LOAD_PATH << PluginManager.curr_plugin_path
require 'lib/inflation_calc_responder'
class InflationCalc < Plugin
  
  # See lib/inflation_calc_responder, it contains the calculate method.
  include InflationCalcResponder
  
  # Initialize session structure
  def init_ses( msg )
    
    # Create values for the fields in the user interface
    msg.session[:inflation] = {
      :percent =>  HValue.new(msg, 7 ),
      :amount  =>  HValue.new(msg, 1000 ),
      :years   =>  HValue.new(msg, 10 ),
      :result_future =>  HValue.new(msg, [] ),
      :result_past   =>  HValue.new(msg, [] )
    }
    
    # Bind three of them (input data) to the calculate method as the responder.
    ses = msg.session[:inflation]
    [ :percent, :amount, :years ].each do |val|
      ses[val].bind('inflation','calculate')
    end
    
  end
  
  # Initializes the user interface "manually"
  def init_ui( msg )
    
    # See init_ses
    ses = msg.session[:inflation]
    
    # Dependency packages
    include_js( msg, ['controls','default_theme'] )
    
    # Loads the SimpleTable class
    msg.reply read_js_once( msg, 'simple_table' )
    
    # The user interface code as js
    msg.reply read_js_once( msg, 'inflation_calc' )
    
    # Initial calculation
    calculate( msg )
    
    # Constructs an instance of the user interface
    msg.reply "InflationCalc.nu(#{values_js(ses)});"
    
  end
end
InflationCalc.new.register('inflation')

