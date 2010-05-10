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
    file_write( 'disabled', '' )
    @plugins.unload_bundle( @name )
  end
  
  def gui_params( msg )
    params = super
    params[:text] = {
      :welcome => file_read('text/welcome.html')
    }
    return params
  end
  
  def close_button( msg, value )
    dont_show_again = get_ses(msg)[:dont_show_again]
    if (value.data == 1) and (dont_show_again.data == true)
      disable_self
    end
    return true
  end
end
