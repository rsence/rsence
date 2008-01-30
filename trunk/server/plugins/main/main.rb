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
  
  # new session initialization, called only once per session.
  # do your initial settings here.
  def init_ses(msg)
    ses = msg.session
    if not ses.has_key?(:main)
      ses[:main] = {
        :boot => 0,
        :server_time  => HValue.new(msg,Time.now.strftime("%H:%M:%S")),
        :clicker_val  => HValue.new(msg,0)
      }
      ses[:main][:clicker_val].bind(self.method('clicker'))
    end
  end
  
  # called when a session is restored from cookie
  def restore_ses(msg)
    ses = msg.session
    if ses.has_key?(:main)
      ses[:main][:boot] = 0
    end
  end
  
  # this gets called on every request performed with an active session
  def idle(msg)
    mses = msg.session[:main]
    if msg.restored_session
      puts "Restored session: "
      puts msg.session.inspect
    end
    if mses[:boot] == 0
      include_js( msg, 'basic' )
      include_js( msg, 'window' )
      msg.reply require_js('start')
    elsif mses[:boot] == 1
      msg.reply require_js('clicker')
      msg.reply "clickerApp = new ClickerApp('#{mses[:clicker_val].val_id}','#{mses[:server_time].val_id}');"
      msg.reply "HTransporter.setPollMode(false);"
    end
    mses[:boot] += 1
  end
  
end

# register the app
app = Main.new
app.register( "main" )




