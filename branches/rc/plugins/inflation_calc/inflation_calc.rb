class InflationCalc < Plugin
  def calculate( msg, value=nil )
    ses   = msg.session[:inflation]
    percent = ses[:percent].data.to_f
    money = ses[:money].data.to_i
    years = ses[:years].data.to_i
    if years < 0
      years = 0-years
      ses[:years].set(msg,years)
    end
    if years > 100
      years = 100
      ses[:years].set(msg,100)
    end
    if percent > 20
      percent = 20
      ses[:percent].set(msg,20)
    end
    if percent < -20
      percent = -20
      ses[:percent].set(msg,-20)
    end
    rate = 1-(percent*0.01)
    result_future = []
    result_past   = []
    calc_future = money
    calc_past   = money
    years.times do |y|
      calc_future *= rate
      calc_past   /= rate
      result_future.push( calc_future.round )
      result_past.push(     calc_past.round )
    end
    puts result_past.inspect
    puts result_future.inspect
    ses[:result_past  ].set( msg, result_past   )
    ses[:result_future].set( msg, result_future )
    return true
  end
  def init_ses( msg )
    msg.session[:inflation] = {
      :percent =>  HValue.new(msg, 7 ),
      :money   =>  HValue.new(msg, 1000 ),
      :years   =>  HValue.new(msg, 10 ),
      :result_future =>  HValue.new(msg, [] ),
      :result_past   =>  HValue.new(msg, [] )
    }
    ses = msg.session[:inflation]
    [ :percent, :money, :years ].each do |val|
      ses[val].bind('inflation','calculate')
    end
  end
  def init_ui( msg )
    ses = msg.session[:inflation]
    include_js( msg, ['controls'] )
    msg.reply require_js( 'inflation_calc' )
    calculate( msg )
    msg.reply "inflationCalc = InflationCalc.nu(#{extract_hvalues_from_hash(ses)});"
  end
end
InflationCalc.new.register('inflation')