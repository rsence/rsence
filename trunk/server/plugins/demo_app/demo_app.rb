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

require 'rubygems'
require 'RMagick'

=begin

ClockApp is a demonstation HApplication for tutorial purposes.

It serves a draggable analog clock that updates automatically.

=end

## Create Himle Application instances like this.
## See lib/app/application.rb for details about the prototype
class ClockApp < HApplication
  
  def initialize
    
    super
    
    # This string stores the clock background image url
    # It is defined in ClockApp::render_clock_bg()
    @clock_bg_img_url = ''
    
    # Specify the clock dimensions:
    @clock_width  = 256
    @clock_height = 256
    
    # Specify the clock center coordinate:
    @clock_center_x = 128
    @clock_center_y = 128
    
    # Specify the clock style
    @background_color   = '#ccc' # light gray
    @background_opacity = 0.5    # 50% transparent
    
    @border_color     = '#ccc' # light gray
    @border_opacity   = 0.75   # 25% transparent
    @border_thickness = 6      # 6 pixels wide circle
    
    @hours_dot_color    = '#666' # medium gray
    @hours_dot_opacity  = 0.66   # 33% transparent
    @hours_dot_position = 124    # pixels from center
    @hours_dot_size     = 3      # circle radius (diameter / 2)
    
    # Specify the lengths of the clock arms:
    @hour_arm_length   = 80
    @minute_arm_length = 120
    
    # Specify the style of the clock arms:
    @clock_arms_opacity = 0.75
    
    @hour_arm_color     = '#333' # dark gray
    @hour_arm_width     = 8
    
    @minute_arm_color   = '#999' # medium-light gray
    @minute_arm_width   = 4
  end
  
  # Trigonometric utility to calculate coordinates
  def calc_clock_coords( step, steps_max, distance_from_center )
    angle_step_degrees = (360.0/steps_max).round
    angle = ((step*angle_step_degrees-180.0) * Math::PI) / 180.0
    x = (0-Math.sin(angle)*distance_from_center).round + @clock_center_x
    y = (0+Math.cos(angle)*distance_from_center).round + @clock_center_y
    return [x,y]
  end
  
  # Renders the clock background, it's shared amongst
  # sessions and it's rendered once only, when the
  # application starts. It's called from ClockApp::open()
  def render_clock_bg
    
    # Create the image object
    clock_bg = Magick::Image.new( @clock_width, @clock_height ) { 
      self.background_color = 'transparent'
    }
    
    # Create the drawing command object
    draw_bg = Magick::Draw.new
    
    # Set styles for circle:
    draw_bg.fill( @background_color )
    draw_bg.fill_opacity( @background_opacity )
    draw_bg.stroke( @border_color )
    draw_bg.stroke_width( @border_thickness )
    draw_bg.stroke_opacity( @border_opacity )
    
    # Draw circle:
    draw_bg.circle(
      @clock_center_x, @clock_center_y,    # circle center point
      @border_thickness/2, @clock_center_y # circle left edge point
    )
    
    # Set styles for hour dots:
    draw_bg.fill( @hours_dot_color )
    draw_bg.fill_opacity( @hours_dot_opacity )
    draw_bg.stroke( 'transparent' ) # no stroke
    draw_bg.stroke_width( 0 )       # no stroke
    
    # Draw circles for each hour
    12.times do |hour|
      (x,y) = calc_clock_coords( hour, 12, @hours_dot_position )
      (x2,y2) = calc_clock_coords( hour, 12, @hours_dot_position + @hours_dot_size )
      draw_bg.circle(x,y,x2,y2)
    end
    
    # Render the drawing commands to pixels:
    draw_bg.draw( clock_bg )
    
    # Convert the raw pixels to png-image data
    clock_img_data = clock_bg.to_blob{ self.format='PNG' }
    
    # Send the image to the IMGSERVE cache as a 'resource', basically
    # meaning that it should be stored forever or until it's manually removed.
    # It returns a generated uri stored as @clock_bg_img_url
    @clock_bg_img_url = IMGSERVE.serve_rsrc( clock_img_data, 'image/png' )
    
  end
  
  
  # Renders the clock foreground, it's a disposable
  # image sent only once to the client.
  # It takes an optional parameter;
  # time specified in seconds since epoch
  def render_clock_fg(msg, time_now=false)
    
    # Create a date/time object based on the argument given 
    if time_now == false
      time_now = Time.now
    else
      time_now = Time.at( time_now )
    end
    
    # Get the time in 12.(minutes*1.66) -format
    hour = time_now.hour
    hour -= 12 if hour >= 12
    minutes = time_now.min
    hour += (minutes/60.0)
    
    # Create the image object
    clock_fg = Magick::Image.new( @clock_width, @clock_height ) { 
      self.background_color = 'transparent'
    }
    
    # Create the drawing command object
    draw_fg = Magick::Draw.new
    
    # Set clock arm style
    draw_fg.stroke_opacity( @clock_arms_opacity )
    
    draw_fg.stroke( @hour_arm_color )
    draw_fg.stroke_width( @hour_arm_width )
    
    # Draw the hour arm:
    (hour_x,hour_y) = calc_clock_coords(hour,12,@hour_arm_length)
    draw_fg.line(@clock_center_x,@clock_center_y,hour_x,hour_y)
    
    # Set the minute arm style:
    draw_fg.stroke( @minute_arm_color )
    draw_fg.stroke_width( @minute_arm_width )
    
    # Draw the minute arm:
    (minutes_x,minutes_y) = calc_clock_coords(minutes,60,@minute_arm_length)
    draw_fg.line(@clock_center_x,@clock_center_y,minutes_x,minutes_y)
    
    # Render the drawing commands to pixels:
    draw_fg.draw( clock_fg )
    
    # Store the image as a disposable image object, it expires automatically.
    clock_fg_img_url = IMGSERVE.serve(msg,clock_fg,'PNG')
    
    # Return the image uri returned by the image cache
    return clock_fg_img_url
  end
  
  # Render the background image, when the
  # open event is triggered:
  def open
    render_clock_bg
  end
  
  # Remove the background image from the cache,
  # when the close event is triggered:
  def close
    IMGSERVE.del_rsrc( @clock_bg_img_url )
    @clock_bg_img_url = ''
  end
  
  
  # Set to true, if you wish to render the
  # client's time
  @use_client_time = false
  
  # This method is called whenever the value in
  # the [:main][:client_time] value changed.
  # It's basically 60 seconds as defined in
  # the Main application's client part.
  def tick_responder(msg, client_time)
    
    # This application's session data storage
    # (see ClockApp::init_ses)
    clock_ses = msg.session[:clock_app]
    
    # If configured to true, use clien't time..
    if @use_client_time
      time_now = client_time
    
    # otherwise server time:
    else
      time_now = Time.now.to_i
    end
    
    # Redraws the clock arms:
    update_clock(msg, time_now)
    
    # Always returns true validation:
    return true
  end
  
  # New session initialization, called once per session.
  def init_ses(msg)
    
    # Render the initial clock arms
    clock_fg_url = render_clock_fg(msg)
    
    # Store some data into the session-specific data storage:
    msg.session[:clock_app] = {
      
      # Define a HValue. It's an automatically syncronized data
      # message object shared between server and client.
      
      # Here we are using it to send the clock arms'
      # image url to the client.
      :clock_fg_url => HValue.new( msg, clock_fg_url )
      
    }
    
    # Bind the main application's client_time HValue instance
    # to our tick_reponder method:
    msg.session[:main][:client_time].bind( 'clock_app', 'tick_responder')
  end
  
  # Called when a session is restored from cookie (essentially when the user
  # reloads or comes back from other pages, while the session is alive)
  def restore_ses(msg)
    
    # The session should be initalized for this app,
    # unless it's been done, in which case it's data
    # will be reset.
    
    ses = msg.session
    if not ses.has_key?(:clock_app)
      init_ses(msg)
    else
      update_clock(msg)
    end
    
  end
  
  # Re-renders the clock arms, time_now is either false
  # or an integer representing seconds since epoch:
  def update_clock(msg, time_now=false)
    
    clock_ses = msg.session[:clock_app]
    
    # Re-render the clock arms:
    clock_fg_url = render_clock_fg(msg,time_now)
    
    # Tell the client what the url to the image is:
    clock_ses[:clock_fg_url].set( msg, clock_fg_url )
  end
  
  # Called on every client request:
  def idle(msg)
    
    # Don't do anything, if the main app hasn't been initialized:
    return if not msg.session.has_key?(:main)
    
    # Init the ui, when the first request to the main app is complete:
    init_ui(msg) if msg.session[:main][:boot] == 1
    
  end
  
  # Initializes the client's UI
  def init_ui(msg)
    
    # Load a list of dependencies (well, only basic is required for now)
    include_js( msg, 'basic' )
    
    # Load the client initialization javascript from the js dir:
    msg.reply require_js('demo_app')
    
    # Get the value id of the clock arm image url message (HValue):
    clock_fg_url_id = msg.session[:clock_app][:clock_fg_url].val_id
    
    # Initialize the client with background image url and foreground image value id
    msg.reply "clockApp = new ClockApp(#{@clock_width},#{@clock_height},'#{@clock_bg_img_url}','#{clock_fg_url_id}');"
  end

end

# Initializes the application:
app = ClockApp.new

# Register the app as 'clock_app':
app.register( "clock_app" )

