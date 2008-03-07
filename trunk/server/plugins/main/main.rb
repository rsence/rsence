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
  
  # this gets called whenever the page location.href changes
  def url_responder(msg,location_href)
    puts "location.href = #{location_href.data.inspect}"
    return true # urls always validate true
  end
  
  # new session initialization, called only once per session.
  # do your initial settings here.
  def init_ses(msg)
    ses = msg.session
    if not ses.has_key?(:main)
      ses[:main] = {
        :boot => 0,
        :client_time => HValue.new( msg, 0 ),
        :location_href => HValue.new(msg,'')
      }
      ses[:main][:location_href].bind( 'main', 'url_responder')
    end
  end
  
  # called when a session is restored from cookie
  def restore_ses(msg)
    ses = msg.session
    if ses.has_key?(:main)
      ses[:main][:boot] = 0
    end
    if $config[:debug_mode]
      puts "Restored session: "
      puts msg.session.inspect
    end
  end
  
  # this gets called on every request performed with an active session
  def idle(msg)
    mses = msg.session[:main]
    if mses[:boot] == 0
      if $config[:debug_mode]
        include_js( msg, ['basic','window'] )
        # debug window goes here
      end
      msg.reply require_js('start')
      msg.reply require_js('url_responder')
      msg.reply "urlResponder = new URLResponder('#{mses[:location_href].val_id}');"
    elsif mses[:boot] == 1
      msg.reply "sesWatcher = new SesWatcher(60000,'#{mses[:client_time].val_id}');" # 60000 = 60 seconds
    elsif mses[:boot] == 2
      msg.reply "HTransporter.setPollMode(false);"
    end
    mses[:boot] += 1
  end
  
end

# register the app
app = Main.new
app.register( "main" )

