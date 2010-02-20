#--
##   Riassence Framework
 #   Copyright 2010 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##
 #++

# = Riassence Simple Chat
# This plugin demonstrates a simple multi-user chat application.
# It's not intended to be a fully featured chat app in itself, instead
# its main purpose is to work as an example of a an application where
# multiple users interact with each other. Also shows how to create a
# thread for processing data in the background.
# A majority of the chat handling routines are in the ChatHandler
# class, which is defined in lib/chat_handler.rb
#
# NOTE: Use Riassence Framework trunk rev 909 
#       or the next release version following it (1.3 or newer)
class SimpleChat < GUIPlugin
  
  # Make a few private methods public (ChatHandler interfaces with them)
  public :compose_plugin_path, :file_read, :file_write, :get_ses
  
  # Loads and initializes the ChatHandler instance as @chat
  def init
    super
    load( compose_plugin_path( 'lib/chat_handler.rb' ) )
    conf_yaml = file_read( 'config.yaml' )
    if conf_yaml
      @conf = YAML.load( conf_yaml )
    else
      @conf = { :timeout_secs => 15, :buffer_lines => 1000, :poll_ms => 500 }
    end
    @chat = ChatHandler.new( self, @conf[:timeout_secs], @conf[:buffer_lines] )
  end
  
  # Passes on the init_ses method to the chat handler before calling
  # the superclass (GUIPlugin)
  def init_ses( msg )
    @chat.init_ses( msg.ses_id )
    super
  end
  
  # Ensures there is an entry in the chat handler for this session.
  def restore_ses( msg )
    ensure_chat_ses( msg )
    super
  end
  
  # Updates / ensures the chat handler knows this session is online
  def ensure_chat_ses( msg )
    ses_id = msg.ses_id
    if @chat.has_ses?( ses_id )
      @chat.update_ses( ses_id )
    else
      ses = get_ses( msg )
      nick = ses[:nick].data
      @chat.init_ses( msg.ses_id, nick )
    end
  end
  
  # Signals the chat handler to restore its data and
  # start the background clean up thread.
  def open
    super
    @chat.open
  end
  
  # Signals the chat handler to store its data.
  def flush
    super
    @chat.flush
  end
  
  # Signals the chat handler to stop the background thread.
  def close
    super
    @chat.close
  end
  
  # Returns an array of nick names.
  def nick_list
    @chat.nick_list
  end
  
  # Formats an epoch integer time as a string.
  def time_format( epoch )
    Time.at( epoch ).strftime( "%H:%M:%S" )
  end
  
  # Formats chat lines
  def process_lines( lines_in )
    lines_out = []
    event_in_lines = false
    lines_in.each do | line |
      event_in_lines = true if line[:nick] == false
      lines_out.push([
        time_format( line[:time] ),
        line[:nick],
        line[:text]
      ])
    end
    return [ lines_out, event_in_lines ]
  end
  
  # Updates the :chat_lines value with lines from the chat handler's buffer
  def chat_lines( msg )
    return unless @chat.new_lines?( msg.ses_id )
    ( lines, event_in_lines ) = process_lines( @chat.new_lines( msg.ses_id ) )
    ses = get_ses( msg )
    ses[:chat_lines].set( msg, lines )
    update_nicks( msg ) if event_in_lines
  end
  
  # Returns an initial array of chat lines from the chat handler's buffer
  def init_lines( msg )
    process_lines( @chat.new_lines( msg.ses_id, 0 ) ).first
  end
  
  # Updates the :nick_list value with a list of active nicks
  def update_nicks( msg )
    ses = get_ses( msg )
    ses[:nick_list].set( msg, @chat.nick_list )
  end
  
  # Updates the session (prevents "ping timeout" in chat handler) and polls for changes.
  def idle( msg )
    super
    ensure_chat_ses( msg )
    chat_lines( msg ) if msg.session[:main][:boot] > 4
  end
  
  # Returns a default or stored nick
  def init_nick( msg )
    @chat.nick_of( msg.ses_id )
  end
  
  # Adds a line to the chat and performs the nick change, if the nick field is edited
  def chat_submit( msg, submit_value )
    ses = get_ses( msg )
    submit_value.set( msg, 0 )
    text = ses[:chat_line].data
    if text != ''
      text = text[0..159] if text.length > 160
      nick = ses[:nick].data
      if nick == ''
        nick = @chat.nick_of( msg.ses_id )
      elsif nick.length > 13
        nick = nick[0..12]
      end
      @chat.add_line( msg.ses_id, nick, text )
      nick = @chat.nick_of( msg.ses_id )
      ses[:nick].set( msg, nick ) if ses[:nick].data != nick
      ses[:chat_line].set( msg, '' )
    end
    return true
  end
  
  # In addition to the default gui rendering, changes the poll frequency to 0.5 seconds
  def init_ui( msg )
    super
    msg.reply "sesWatcher.timeoutSecs=#{@conf[:poll_ms]};"
  end
  
end

# Construct and register the plugin:
SimpleChat.new.register('simple_chat')
