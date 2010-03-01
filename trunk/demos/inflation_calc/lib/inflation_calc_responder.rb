#--
##   Riassence Framework
 #   Copyright 2009 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##
 #++

# This module contains the calculate -method for the values in the plugin.
module InflationCalcResponder
  
  # Responder for changes in the percent, amount and years -values.
  def calculate( msg, value=nil )
    
    # The session hash reference:
    ses   = msg.session[:inflation]
    
    # The data of the session values:
    percent = ses[:percent].data.to_f
    amount = ses[:amount].data.to_i
    years = ses[:years].data.to_i
    
    # Limits for the amount
    amount_max =  100_000_000_000_000
    amount_min = -100_000_000_000_000
    if amount < amount_min
      amount = amount_min
      ses[:amount].set(msg,amount)
    elsif amount > amount_max
      amount = amount_max
      ses[:amount].set(msg,amount)
    end
    
    # Limits for the years
    years_min = 1
    years_max = 100
    if years < years_min
      years = years_min
      ses[:years].set(msg,years)
    elsif years > years_max
      years = years_max
      ses[:years].set(msg,years)
    end
    
    # Limits for the percentage rate
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
    
    # Compute the past ond future values
    rate = 1-(percent*0.01)
    result_future = []
    result_past   = []
    calc_future = amount
    calc_past   = amount
    years.times do |y|
      calc_future *= rate
      calc_past   /= rate
      result_future.push( calc_future.round )
      result_past.push(     calc_past.round )
    end
    ses[:result_past  ].set( msg, result_past   )
    ses[:result_future].set( msg, result_future )
    
    # Value responders return true, unless the change
    # of the value data should be discarded.
    return true
    
  end
  
end
