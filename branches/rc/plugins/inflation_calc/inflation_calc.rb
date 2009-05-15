class InflationCalc < Plugin
  def calculate( msg, value=nil )
    ses   = msg.session[:inflation]
    percent = ses[:percent].data.to_f
    money = ses[:money].data.to_i
    years = ses[:years].data.to_i
    money_max =  100_000_000_000_000
    money_min = -100_000_000_000_000
    if money < money_min
      money = money_min
      ses[:money].set(msg,money)
    elsif money > money_max
      money = money_max
      ses[:money].set(msg,money)
    end
    years_min = 1
    years_max = 100
    if years < years_min
      years = years_min
      ses[:years].set(msg,years)
    elsif years > years_max
      years = years_max
      ses[:years].set(msg,years)
    end
    percent_min = -20
    percent_max = 20
    if percent > percent_max
      percent = percent_max
      ses[:percent].set(msg,percent)
    end
    if percent < percent_min
      percent = percent_min
      ses[:percent].set(msg,percent)
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