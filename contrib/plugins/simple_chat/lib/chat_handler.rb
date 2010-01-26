
# Handles the chat itself
class ChatHandler
  
  # Returns a default data structure, if no stored
  # data/chat_data.yaml file exists.
  def default_data
    { :last_id => 0,
      :lines => [
        # { :id => 1, :time => 1264387209, :nick => "FooBert", :text => "Hi!" }
      ],
      :nicks => [
        # "FooBert"
      ],
      :ses_meta => {
        # 123 => { :nick => "FooBert", :last_sync => 1264387210, :last_id => 1 }
      }
    }
  end
  
  # Initializes the class using +plugin+ as
  # the parameter (assigned as @plugin in the instance)
  def initialize( plugin )
    # placeholder / default data structure
    @data = default_data
    # placeholder for the background thread
    @thr = false
    # reference to the plugin using this handler
    @plugin = plugin
    # setting that defines how long before a "ping timeout"
    @timeout_secs = 15
    # paths to the persistent data files
    @data_path = @plugin.compose_plugin_path( 'data/chat_data.yaml' )
  end
  
  # Loads stored data and starts the background thread
  def open
    # loads the previous chat data (transcript/log)
    data_yaml    = @plugin.file_read( @data_path )
    if data_yaml
      @data   = YAML.load( data_yaml )
    else
      @data   = default_data
    end
    # starts the background thread (calls #clean every second)
    @thr = Thread.new do
      while true do
        clean
        sleep 1
      end
    end
    Thread.pass
  end
  
  # crops the chat buffer to 1000 lines (if longer) and deletes expired sessions.
  def clean
    # crops the log buffer length to 1000 lines
    @data[:lines].shift while @data[:lines].length > 1000
    time_now = Time.now.to_i
    @data[:ses_meta].each_key do | ses_id |
      delete_ses( ses_id ) if ses_expired?( ses_id, time_now )
    end
  end
  
  # Stores the @data structure in data/chat_data.yaml
  def flush
    # stores chat and nicks data
    @plugin.file_write( @data_path, @data.to_yaml )
  end
  
  # Terminates the background thread that calls +#clean+
  def close
    # stops the background thread
    if @thr
      @thr.kill!
      @thr = false
    end
  end
  
  # Returns true, if the nick has changed, false otherwise.
  def nick_changed?( ses_id, nick )
    return @data[:ses_meta][ses_id][:nick] != nick
  end
  
  # Ensures the +nick+ is unique. If duplicates are found,
  # a serial number is appended at the end.
  def unique_nick( nick='Anonymous' )
    try_num = 0
    nicks = @data[:nicks]
    prefix = nick
    until not nicks.include?( nick )
      nick = "#{prefix}-#{try_num}"
      try_num += 1
    end
    return nick
  end
  
  # Changes the +nick+
  def change_nick( ses_id, new_nick )
    orig_nick = @data[:ses_meta][ses_id][:nick]
    new_nick = unique_nick( new_nick )
    @data[:nicks].delete( orig_nick )
    @data[:nicks].push( new_nick )
    @data[:ses_meta][ses_id][:nick] = new_nick
    add_event( "#{orig_nick} is now known as #{new_nick}" )
    return new_nick
  end
  
  # Returns the nick of a +ses_id+
  def nick_of( ses_id )
    @data[:ses_meta][ses_id][:nick]
  end
  
  # Increments the serial number of the chat lines
  def increment_id
    new_id = @data[:last_id] + 1
    @data[:last_id] = new_id
    return new_id
  end
  
  # Adds an event with contents of the string +text+ into the
  # chat log messages, instead of a string for the :nick entry,
  # the boolean state false is used.
  def add_event( text )
    new_id = increment_id
    @data[:lines].push({
      :id => new_id,
      :time => Time.now.to_i,
      :nick => false,
      :text => text
    })
  end
  
  # Adds a line into the chat log messages.
  # ses_id is the session id, nick is the nick
  # name, text is the chat text line entry itself.
  def add_line( ses_id, nick, text )
    nick = change_nick( ses_id, nick ) if nick_changed?( ses_id, nick )
    new_id = increment_id
    @data[:lines].push({
      :id => new_id,
      :time => Time.now.to_i,
      :nick => nick,
      :text => text
    })
  end
  
  # Checks, if there is a session entry for the session id.
  # Returns a boolean status; true if there is a session entry,
  # false otherwise.
  def has_ses?( ses_id )
    @data[:ses_meta].has_key?( ses_id )
  end
  
  # Creates a session entry for the session id. nick is
  # the preferred nick name (optional).
  def init_ses( ses_id, nick="Anonymous" )
    nick = unique_nick( nick )
    @data[:nicks].push( nick )
    @data[:ses_meta][ses_id] = {
      :last_sync => Time.now.to_i,
      :last_id => 0,
      :nick => nick
    }
    add_event( "#{nick} has joined the chat" )
  end
  
  # Checks, if the session with id +ses_id+ has expired.
  # +time_now+ is the current time as an epoch integer,
  # it's optional and defaults to the current time.
  # Returns true, if expired, false otherwise.
  # @timeout_secs decides how old an session should be,
  # by default it's 15 seconds.
  def ses_expired?( ses_id, time_now=false )
    time_now = Time.now.to_i unless time_now
    last_sync = @data[:ses_meta][ses_id][:last_sync]
    return last_sync + @timeout_secs < time_now
  end
  
  # Sets the :last_sync entry of the session with
  # id +ses_id+ to the current time.
  def update_ses( ses_id )
    @data[:ses_meta][ses_id][:last_sync] = Time.now.to_i
  end
  
  # Deletes the session entry with id +ses_id+ and
  # frees its associated nick. Also adds an event
  # to the chat log, so other users know the user
  # disconnected.
  def delete_ses( ses_id )
    nick = @data[:ses_meta][ses_id][:nick]
    @data[:nicks].delete( nick )
    @data[:ses_meta].delete( ses_id )
    add_event( "#{nick} has left the chat." )
  end
  
  # Returns a list of nicks. Just an array.
  def nick_list
    @data[:nicks].clone
  end
  
  # Returns true, if there are unsynchronized
  # lines for the session with id +ses_id+
  # Returns false otherwise.
  def new_lines?( ses_id )
    @data[:ses_meta][ses_id][:last_id] != @data[:last_id]
  end
  
  # Returns a slice of new chat lines for the session
  # with id +ses_id+.
  # +last_id+ is optional and contains the integer id
  # of the last id wanted (or 0, if all lines).
  # Defaults to the last line sent (stored as :last_id
  # in the session metadata.
  def new_lines( ses_id, last_id=false )
    ses_meta = @data[:ses_meta][ses_id]
    last_id = ses_meta[:last_id] unless last_id
    lines_range = @data[:last_id] - last_id
    if lines_range > @data[:lines].length
      lines_range = @data[:lines].length
    end
    return [] if lines_range == 0
    ses_meta[:last_id] = @data[:last_id]
    return @data[:lines][(0-lines_range)..-1]
  end
  
end
