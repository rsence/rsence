$LOAD_PATH << PluginManager.curr_plugin_path
require 'lib/inflation_calc_responder'
class InflationCalc < Plugin
  include InflationCalcResponder
  def init_ses( msg )
    msg.session[:inflation] = {
      :percent =>  HValue.new(msg, 7 ),
      :amount  =>  HValue.new(msg, 1000 ),
      :years   =>  HValue.new(msg, 10 ),
      :result_future =>  HValue.new(msg, [] ),
      :result_past   =>  HValue.new(msg, [] )
    }
    ses = msg.session[:inflation]
    [ :percent, :amount, :years ].each do |val|
      ses[val].bind('inflation','calculate')
    end
  end
  def init_ui( msg )
    ses = msg.session[:inflation]
    include_js( msg, ['controls','default_theme'] )
    msg.reply require_js( 'simple_table' )
    msg.reply require_js( 'inflation_calc' )
    calculate( msg )
    msg.reply "inflationCalc = InflationCalc.nu(#{extract_hvalues_from_hash(ses)});"
  end
end
InflationCalc.new.register('inflation')