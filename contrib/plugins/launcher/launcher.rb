#--
##   Riassence Framework
 #   Copyright 2010 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##
 #++

# = Launcher
# This plugin demonstrates mostly msg.run
# It implements a simple gui with buttons on the bottom of the browser window,
# prevents the main plugin from delegating the init_ui call and moves that
# control to the gui. Included hardcoded support for a few of the example/demo
# plugins.
#
class Launcher < GUIPlugin
  
  # Helper method for the value responders, delegates the init_ui
  # method call to the +plugin_name+
  def gui_starter( msg, val, plugin_name )
    if val.data == 1
      msg.run( plugin_name, 'init_ui', msg )
    end
    val.set( msg, 0 )
    return true
  end
  
  # Responders for the values of the buttons in the gui:
  def clock( msg, val )
    gui_starter( msg, val, 'clock' )
  end
  def inflation_calc( msg, val )
    gui_starter( msg, val, 'inflation' )
  end
  def rsence_cal( msg, val )
    gui_starter( msg, val, 'rsence_cal' )
  end
  def simple_chat( msg, val )
    gui_starter( msg, val, 'simple_chat' )
  end
  def unit_converter( msg, val )
    gui_starter( msg, val, 'unit_converter' )
  end
  
  # Prevents the main plugin to call init_ui on the second request
  # (boot 1) by setting it to 2 on the 1st request.
  def idle( msg )
    super
    if msg.session.has_key?(:main) and msg.session[:main][:boot] == 0
      msg.run( 'main', 'boot0', msg, msg.session[:main] )
      msg.reply "ELEM.del(ELEM.bindId('loading'));"
      init_ui( msg )
      msg.session[:main][:boot] = 2
    end
  end
end

Launcher.new.register( 'launcher' )