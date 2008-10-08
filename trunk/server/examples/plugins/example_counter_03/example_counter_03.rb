
##### CounterPlugin example, extends the default Plugin class.
  ### Gathers statistics, stores statistics, uses the client framework for display.
class CounterPlugin03 < Plugin
  
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
      :visits => 1,
      :hit_button => HValue.new( msg, 0 ),
      :hit_count => HValue.new(  msg, @hits_total )
    }
    msg.session[:counter][:hit_button].bind( 'example_counter_03', 'hit_button_pressed' )
  end
  
  def hit_button_pressed( msg, button_hvalue )
    button_pressed_count = button_hvalue.data
    puts "#{msg.ses_id}: button_pressed_count = #{button_pressed_count}"
  end
  
  ### Called whenever an old session is restored.
  def restore_ses( msg )
    @visits_total += 1
  end
  
  ### Called on each request.
  def idle( msg )
    @hits_total += 1
    msg.session[:counter][:hit_count].set( msg, @hits_total )
  end
  
  ### Called from the main plugin when it's done
  def init_ui( msg )
    include_js( msg, 'basic' )
    msg.reply require_js 'example_counter_03'
    hit_button_id = msg.session[:counter][:hit_button].val_id.to_json
    hit_count_id  = msg.session[:counter][:hit_count ].val_id.to_json
    msg.reply "new ExampleCounterApp03(#{hit_button_id}, #{hit_count_id});"
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

# Creates the instance and registers as example_counter_03
CounterPlugin03.new.register 'example_counter_03'

