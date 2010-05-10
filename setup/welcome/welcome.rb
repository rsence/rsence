##   Riassence Framework
 #   Copyright 2010 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##

# RSence 'Welcome' plugin
class WelcomePlugin < GUIPlugin
  def disable_self
    file_write( 'disabled' )
    @plugins.unload_bundle( @name )
  end
  
  def gui_params( msg )
    params = super
    params[:text] = {
      :welcome => file_read('text/welcome.html')
    }
    return params
  end
  
  def dont_show_again( msg, value )
    close = get_ses(msg)[:close]
    if value.data == 1 and close.data == 1
      disable_self
    end
    return true
  end
end