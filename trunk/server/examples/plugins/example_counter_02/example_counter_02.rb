
##### CounterPlugin example, extends the default Plugin class.
  ### Gathers statistics, stores statistics.
class CounterPlugin02 < Plugin
  
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
  
  ### Called, when it's time to save changes.
  def flush
    file_save( 'data/hits_total',    @hits_total.to_s   )
    file_save( 'data/visits_total',  @visits_total.to_s )
    file_save( 'data/visits_unique', @visits_uniqu.to_s )
  end
  
  ### Called, when it's time to read data
  def open
    @hits_total   = ( file_read( 'data/hits_total'    ) or 0 ).to_i
    @visits_total = ( file_read( 'data/visits_total'  ) or 0 ).to_i
    @visits_uniqu = ( file_read( 'data/visits_unique' ) or 0 ).to_i
  end
  
end

# Creates the instance and registers as example_counter_02
CounterPlugin02.new.register 'example_counter_02'

