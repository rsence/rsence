class LifeCalculator
  def initialize(plugin, state, sleep_time = 1)
    @plugin = plugin
    @data = state[0]
    @rowlength = state[1]
    @sleep_time = sleep_time
    @thr = false
    @idle_counter = 0
  end
  
  def open
    @thr = Thread.new do
      while true do
        @idle_counter = @idle_counter + 1
        puts "hello number #{@idle_counter}!"
        calculate_state
        @plugin.set_state( @data )
        sleep @sleep_time
      end
    end
    Thread.pass
  end
  
  def close
    if @thr
      puts "killing the thread"
      @thr.kill!
      @thr = false
    end
  end
  
  def calculate_state
    #puts "begin calculation"
    y = 0
    #puts "y: #{y}"
    temptable = Marshal.load(Marshal.dump(@data))
    neighbours = 0
    max_x = @rowlength
    max_y = @data.length / @rowlength
    #puts "variables, max_x #{max_x}, max_y #{max_y}, temptable.length #{temptable.length}"
    @data.each_with_index {|values, iterator|
      y = iterator / @rowlength
      x = iterator % @rowlength
      if (x - 1 >= 0 and y -1 >= 0)
        if (alive?( x - 1, y - 1 ))
          neighbours = neighbours + 1
        end
      end
      
      if (x - 1 >= 0)
        if (alive?( x - 1, y ))
          neighbours = neighbours + 1
        end
      end
      
      if (x - 1 >= 0 and y + 1 < max_y)
        if (alive?( x - 1, y + 1 ))
          neighbours = neighbours + 1
        end
      end
      
      if (y + 1 < max_y) 
        if (alive?( x, y + 1 )) 
          neighbours = neighbours + 1
        end
      end
      
      if (y + 1 < max_y and x + 1 < max_x)
        if (alive?( x + 1, y + 1 ))
          neighbours = neighbours + 1
        end
      end
      
      if (x + 1 < max_x)
        if (alive?( x + 1, y ))
          neighbours = neighbours + 1
        end
      end
      
      if (x + 1 < max_x and y - 1 >= 0)
        if (alive?( x + 1, y - 1 ))
          neighbours = neighbours + 1
        end
      end
      
      if (y - 1 >= 0)
        if (alive?( x, y - 1 ))
          neighbours = neighbours + 1
        end
      end
      
      
      if neighbours != 2 and neighbours != 3
        #puts "dies... #{neighbours} neighbours"
        temptable[((y * @rowlength) + x)] = 0 #dead
      end
      
      if neighbours == 3 and !alive?( x, y )
        #puts "resurrection: #{neighbours}"
        temptable[((y * @rowlength) + x)] = 1 #alive
      end
      neighbours = 0
    }
    @data = Marshal.load(Marshal.dump(temptable))
    
  end
  
  def alive?(x, y)
    if (@data[( (y*@rowlength) + x )] > 0)
      return true
    else
      return false
    end
  end
  
end