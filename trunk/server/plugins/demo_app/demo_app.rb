
require 'rubygems'
require 'RMagick'

class DemoApp < HApplication
  
  def draw_clock_bg
    draw_bg = Magick::Draw.new
    draw_bg.stroke('#ccc').stroke_width(7)
    draw_bg.circle(128,128,4,128)   # circle around clock
    draw_bg.circle(128,128,125,128) # circle in middle
    draw_bg.draw( @clock_bg )
  end
  
  def initialize
    super
    @clock_bg = Magick::Image.new(255,255) { 
      self.background_color = 'transparent'
    }
    draw_clock_bg
  end
  
  def clock_responder(msg, clock_val)
    return true# just ignore whatever is coming in
  end
  
  def draw_clock( msg )
    
    clock_url = msg.serve_img( @clock_bg, 'PNG' )
    
    msg.session[:demo_app][:clock_url].set( msg, clock_url )
  end
  
  # new session initialization, called only once per session.
  # do your initial settings here.
  def init_ses(msg)
    ses = msg.session
    if not ses.has_key?(:demo_app)
      ses[:demo_app] = {
        :clock_url => HValue.new( msg, 'about:blank' )
      }
      ses[:demo_app][:clock_url].bind( 'demo_app', 'clock_responder')
    end
  end
  
  # called when a session is restored from cookie
  def restore_ses(msg)
    ses = msg.session
    if ses.has_key?(:main)
      ses[:demo_app][:clock_url].set( msg, 'about:blank' )
    end
  end
  
  # called when a session is restored from cookie
  def idle(msg)
    mses = msg.session[:main]
    return if not mses
    init_ui(msg) if mses[:boot] == 1
  end
  
  # this gets called once
  def init_ui(msg)
    include_js( msg, ['basic','window','playground'] )
    msg.reply require_js('demo_app')
    
    draw_clock( msg )
    
    clock_id = msg.session[:demo_app][:clock_url].val_id
    
    msg.reply "demoApp = new DemoApp('#{clock_id}');"
  end

end

# register the app
app = DemoApp.new
app.register( "demo_app" )

