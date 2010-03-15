class GameOfLife < GUIPlugin
  
 def gui_params( msg )
   h1 = {
     :values => @gui.values( get_ses( msg ) ),
     :settings => {:tile_width => 10, :tile_height => 10}
   }
   return h1
 end
  
  def init
    super
    load( compose_plugin_path( 'lib/life_calculator.rb') )
    @state = []
    1800.times { |i| @state.push(rand(2)) }
    @idlecounter = 0
    @life = LifeCalculator.new( self, [@state, 40], 1)
  end
  
  def init_ui( msg )
    super
    msg.reply "sesWatcher.timeoutSecs = 500;"
  end
  
  def idle( msg )
    super
    @idlecounter = @idlecounter + 1
    get_ses(msg)[:grid].set( msg, @state )
  end
  
  def get_state
    return @state
  end
  
  def set_state( state )
    @state = state
  end
  
  def open
    super
    @life.open
  end
  
  def close
    super
    @life.close
  end
  
end