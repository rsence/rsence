###
  # HIMLE RIA Server
  # Copyright (C) 2008 HIMLE GROUP http://himle.sorsacode.com/
  #  
  #  This program is free software; you can redistribute it and/or modify it under the terms
  #  of the GNU General Public License as published by the Free Software Foundation;
  #  either version 2 of the License, or (at your option) any later version. 
  #  This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
  #  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
  #  See the GNU General Public License for more details. 
  #  You should have received a copy of the GNU General Public License along with this program;
  #  if not, write to the Free Software Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
  ###

class Main < HApplication
  
  # this gets called whenever an user changes the clicker_val
  def clicker(msg,clicker_val)
    server_time = msg.session[:main][:server_time]
    server_time.set(msg,Time.now.strftime("%H:%M:%S"))
  end
  
  
  # this gets called on every request performed with an active session
  def idle(msg)
    
    # assigns the active session to ses
    ses = msg.session
    if not ses.has_key?(:main) or msg.new_session
      ses[:main] = {
        :boot => 0,
        :server_time  => HValue.new(msg,Time.now.strftime("%H:%M:%S")),
        :clicker_val  => HValue.new(msg,0)
      }
      ses[:main][:clicker_val].bind(self.method('clicker'))
    end
    
    lses = ses[:main]
    if lses[:boot] == 0
      lses[:boot] = 1
      msg.reply require_js('start')
    elsif lses[:boot] == 1
      lses[:boot] = 2
      msg.reply require_js('clicker')
      msg.reply "clickerApp = new ClickerApp('#{lses[:clicker_val].val_id}','#{lses[:server_time].val_id}');"
      msg.reply "HTransporter.setPollMode(false);"
    end
    
  end
  
end

# register the app
app = Main.new
app.register( "main" )




