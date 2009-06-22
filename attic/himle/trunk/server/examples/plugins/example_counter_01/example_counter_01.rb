
##### CounterPlugin example, extends the default Plugin class. Gathers statistics.
class CounterPlugin01 < Plugin
  
  ### Called after primary initialization, sets up a few counters.
  def init
    @hits_total = 0
    @visits_total = 0
    @visits_unique = 0
  end
  
  ### Called whenever a new session is created.
  def init_ses( msg )
    @visits_unique += 1
    @visits_total += 1
    msg.session[:counter] = {
      :visits => 1
    }
    msg.reply "console.log('Welcome, user! Your Session ID is #{msg.ses_id}. This is your first visit.');"
    msg.reply "console.log('Unique visits since restart: #{@visits_total}');"
    msg.reply "console.log('Total visits since restart: #{@visits_total}');"
  end
  
  ### Called whenever an old session is restored.
  def restore_ses( msg )
    @visits_total += 1
    msg.session[:counter][:visits] += 1
    msg.reply "console.log('Welcome back, user! This is your #{msg.session[:counter][:visits]}. visit!');"
    msg.reply "console.log('Total visits since restart: #{@visits_total}');"
  end
  
  ### Called on each request.
  def idle( msg )
    @hits_total += 1
    msg.reply "console.log('Hit count: #{@hits_total}');"
  end
  
end

# Creates the instance and registers as example_counter_01
CounterPlugin01.new.register 'example_counter_01'

