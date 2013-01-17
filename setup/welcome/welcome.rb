
# RSence 'Welcome' plugin.
# An instance of a class extended from GUIPlugin includes basic functionality
# to initialize their user interface from YAML files without extra code.
class WelcomePlugin < GUIPlugin
  
  def gui_params( msg )
    params = super
    params[:text] = {
      :welcome => file_read('text/welcome.html')
    }
    return params
  end
  
  # Responder for the value defined as `:close` in values.yaml
  # A responder is called whenever its value is changed on the client.
  def close_button( msg, value )
    
    # Gets the value of the checkbox
    dont_show_again = get_ses(msg)[:dont_show_again]
    
    # If both the checkbox is checked (true) and the button clicked,
    # calls the disable_self method defined below.
    if (value.data == 1) and (dont_show_again.data == true)
      disable_self
    end
    
    # For most uses of HClickButton combined with a value, resetting the data
    # to 0 (to make the button clickable again) is done like this:
    # value.set( msg, 0 )
    
    # Responders should always return true, until more specific return
    # values are defined in a future version of RSence.
    # Returning false causes the responder to be called on every request
    # the client makes until the responder returns true.
    return true
  end
  
  # Called by close_button, when the checkbox is checked (true) and the Close-button is clicked (1).
  def disable_self
    file_write( 'disabled', 'This plugin is disabled. Remove this file to re-enable.' )
    @plugins.unload_bundle( @name )
  end
  
end

