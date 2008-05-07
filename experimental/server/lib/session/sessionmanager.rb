###
  # HIMLE RIA Server
  # Copyright (C) 2008 HIMLE GROUP http://himle.sorsacode.com/
  # Copyright (C) 2006-2007 Helmi Technologies Inc.
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

## Shared messaging-object:
require 'session/msg'

## Unique random number generator:
require 'util/randgen'

## MySQL database abstraction
require 'db/mysql'

=begin
SessionManager does session creation, validation, expiration and storage duties.
It's quite transparent.
=end
class SessionManager
  
  ## Makes everything ready to run
  def initialize
    
    ## Session data storage (by ses_id)
    @sessions     = {}
    
    ## Session id by key
    @session_keys = {}
    
    ## Session id by cookie key
    @session_cookie_keys = {}
    
    ## Disposable keys (new ses_key each request)
    @config = $config[:session_conf]
    
    ## 'Unique' Random String generator for ses_key:s and cookie_key:s
    @randgen   = RandomGenerator.new( @config[:key_length], @config[:buffer_size] )
    
    # regex to match ipv4 addresses
    @ipv4_reg = /^([1][0-9][0-9]|[2][0-5][0-9]|[1-9][0-9]|[1-9])\.([1][0-9][0-9]|[2][0-5][0-9]|[1-9][0-9]|[0-9])\.([1][0-9][0-9]|[2][0-5][0-9]|[1-9][0-9]|[0-9])\.([1][0-9][0-9]|[2][0-5][0-9]|[1-9][0-9]|[0-9])$/
    
    # Check database connectivity and load stored sessions from the database
    db_init_mysql()
    
  end
  
  ## Checks database connectivity and loads stored sessions from the database
  def db_init_mysql
    
    ## modify these settings in the config to match your system:
    root_setup = $config[:database][:root_setup] # 'root' access account of mysql
    auth_setup = $config[:database][:auth_setup] # himle-isolated account of mysql
    
    ## checks/creates himle database or fails (in that case you have to set up the database manually)
    begin
      db_root = MySQLAbstractor.new(root_setup, root_setup[:db])
      db_root.open
      unless db_root.dbs.include?( auth_setup[:db] )
        puts "Creating himle session database #{auth_setup[:db].inspect}..." if DEBUG_MODE
        db_root.q( "create database #{auth_setup[:db]}" )
      end
    rescue
      puts "root_setup failed, using auth_setup" if DEBUG_MODE
      db_root = false
    end
    
    ## tests auth_setup permissions by creating and dropping himle_test
    db_auth = MySQLAbstractor.new(auth_setup, auth_setup[:db])
    begin
      has_privileges = (db_auth.q("drop table if exists himle_test") == 0)
      has_privileges = (db_auth.q("create table himle_test (id int primary key auto_increment)") == 0) and has_privileges
      has_privileges = (db_auth.q("drop table if exists himle_test") == 0)
    rescue
      has_privileges = false
    end
    
    ## Tries creating necessary permissions for auth_setup
    ## It will fail, if there is no mysql 'root' permissions
    if not has_privileges
      if not db_root
        puts "no db_root, please grant permissions manually for:"
        puts "  user: #{auth_setup[:user]}"
        puts "  pass: #{auth_setup[:pass]}"
        puts "  host: #{auth_setup[:host]}"
        puts "    db: #{auth_setup[:db]}"
        puts
        puts "exit."
        exit
      end
      puts "Granting privileges..." if DEBUG_MODE
      db_root.q( "grant all privileges on #{auth_setup[:db]}.* to #{auth_setup[:user]}@localhost identified by '#{auth_setup[:pass]}'" )
      db_root.q( "flush privileges" )
      db_auth.close()
      db_auth.open()
    end
    
    # use db_auth for session management
    @db = db_auth
    
    # closes the root db connection, if necessary
    db_root.close() if db_root
    
    ## Creates the 'himle_session' table, if necessary
    ## This table is used to store sessions
    unless @db.tables.include?('himle_session')
      puts "Creating session table..." if DEBUG_MODE
      @db.q( "create table himle_session (id int primary key auto_increment, cookie_key char(252) null, ses_key char(84), ses_timeout int not null default 0, user_id int not null default 0, ses_active tinyint not null default 0, ses_stored int not null default 0, ses_data mediumblob)" )
    end
    
    ## Creates the 'himle_version' table, if necessary
    ## This table is used to check for the need of future database upgrades
    unless @db.tables.include?('himle_version')
      puts "Creating version info table..." if DEBUG_MODE
      @db.q( "create table himle_version ( version int primary key not null default 0)" )
      @db.q( "insert into himle_version ( version ) values (37)" )
    end
    
    ## 
    if @config[:reset_sessions]
      puts "Resetting all sessions..."
      reset_sessions()
    else
      puts "Restoring old sessions..." if DEBUG_MODE
      restore_sessions()
    end
  end
  
  ## Deletes all rows from himle_session
  def reset_sessions
    @db.q("delete from himle_session")
  end
  
  ## Restores all saved sessions from db to ram
  def restore_sessions
    puts "Restoring sessions..." if DEBUG_MODE
    @db.q("select * from himle_session").each do |ses_row|
      ses_id = ses_row['id']
      ses_data_dump = ses_row['ses_data']
      if ses_data_dump != nil
        ses_data = Marshal.restore( ses_data_dump )
        @sessions[ses_id] = ses_data
        @session_keys[ ses_data[:ses_key] ] = ses_id
        @session_cookie_keys[ ses_data[:cookie_key] ] = ses_id
      end
    end
  end
  
  ## Stores all sessions to db from ram
  def store_sessions
    puts "Storing sessions..." if DEBUG_MODE
    @sessions.each_key do |ses_id|
      ses_data = @sessions[ ses_id ]
      ses_data_dump = Marshal.dump( ses_data )
      @db.q("update himle_session set cookie_key = #{hexlify(ses_data[:cookie_key])} where id=#{ses_id}")
      @db.q("update himle_session set ses_key = #{hexlify(ses_data[:ses_key])} where id=#{ses_id}")
      @db.q("update himle_session set user_id = #{ses_data[:user_id]} where id=#{ses_id}")
      @db.q("update himle_session set ses_data = #{hexlify(ses_data_dump)} where id=#{ses_id}")
      @db.q("update himle_session set ses_timeout = #{ses_data[:timeout]}")
      @db.q("update himle_session set ses_stored = #{Time.now.to_i} where id=#{ses_id}")
    end
  end
  
  ## Shut-down signal, triggers store_sessions for now
  def shutdown
    puts "Session shutdown in progress..." if DEBUG_MODE
    store_sessions
    puts "Session shutdown complete." if DEBUG_MODE
  end
  
  ## Utility method for converting strings to hexadecimal
  def hexlify( str )
    "0x#{str.unpack('H*')[0]}"
  end
  
  ## Returns a new, unique session identifier by storing the params to the database
  def new_ses_id( cookie_key, ses_key, timeout_secs, user_id=0 )
    return @db.q( "insert into himle_session (cookie_key, ses_key, ses_timeout, user_id) values (#{hexlify(cookie_key)},#{hexlify(ses_key)}, #{timeout_secs},#{user_id})" )
  end
  
  ## Expires a session by its identifier
  def expire_session( ses_id )
    
    
    ses_data = @sessions[ ses_id ]
    
    # Makes the session invalid for xhr's by deleting its key
    @session_keys.delete( ses_data[:ses_key] )
    
    # Makes the session invalid for all requests by deleting its cookie key
    @session_cookie_keys.delete( ses_data[:cookie_key] )
    
    # Deletes the session data itself
    @sessions.delete( ses_id )
    
    # Removes all ticket-based storage bound to the session
    TICKETSERVE.expire_ses( ses_id )
    
    # Deletes the session's row from the database
    @db.q( "delete from himle_session where id = #{ses_id}" )
    
  end
  
  ## Expires all sessions that meet the timeout criteria
  def expire_sessions
    
    # Loop through all sessions in memory:
    @sessions.each_key do |ses_id|
      
      timed_out = @sessions[ ses_id ][:timeout] < Time.now.to_i
      
      ## Deletes the session, if the session is too old
      exire_session( ses_id ) if timed_out
    end
  end
  
  ### Creates a new session
  def init_ses( msg )
    
    ## Assigns new timeout for the session
    time_now = Time.now.to_i # seconds since epoch
    timeout  = time_now + @config[:timeout_secs]
    
    ## Creates a new session key
    ses_key    = @randgem.get_one
    
    ## Creates a new cookie key
    cookie_key = @randgen.get(@config[:cookie_key_multiplier]).join('')
    
    ## Makes a new database row for the session, returns its id
    ses_id     = new_ses_id( cookie_key, ses_key, timeout )
    
    ### Default session data structure,
    ### Please don't mess with it, unless you know exactly what you are doing.
    ses_data = {
      
      # the time, when the session will time out
      :timeout    =>  timeout,
      
      # session id, used internally
      :ses_id     =>  ses_id,
      
      # session key, used externally (client xhr)
      :ses_key    =>  ses_key,
      
      # session key, used externally (client cookies)
      :cookie_key =>  cookie_key,
      
      # user id, map to your own user management code
      :user_id    =>  0,
      
      # valuemanager data
      :values     => {
        :sync  => [],  # value id's to sync to client
        :check => [],  # value id's to validate in server (from client)
        :by_id => {}   # values by id
      }
    }
    
    # bind the session data to @sessions by its id
    @sessions[ ses_id ] = ses_data
    
    # map the key back to the id
    @session_keys[ ses_key ] = ses_id
    
    # map the ses_id to cookie key
    @session_cookie_keys[ cookie_key ] = ses_id
    
    puts "init_ses, cookie_key = #{cookie_key.inspect}" if DEBUG_MODE
    
    ### Tell the client what the new key is
    msg.reply "HTransporter.ses_id='#{ses_key}';"
    
    ### Set the session data and id to the message object
    msg.session = ses_data
    msg.ses_id  = ses_id
    
    # Flag the session as new, so associated
    # plugins know when to create new data
    msg.new_session = true
    
    # Returns the cookie key, so it can be sent in the response header
    return cookie_key
    
  end
  
  ### Returns the current session data, if the session is valid.
  ### Otherwise stops the client and returns false.
  def check_ses( msg, ses_key )
    
    # first, check if the session key exists (xhr)
    if @session_keys.has_key?( ses_key )
      
      # get the session's id based on its key
      ses_id   = @session_keys[ ses_key ]
      
      # get the session's data based on its id
      ses_data = @sessions[ ses_id ]
      
      # new time-out
      ses_data[:timeout] = Time.now.to_i + @config[:timeout_secs]
      
      ### extra security
      # re-generates the ses_key for each xhr
      if @config[:disposable_keys]
        
        # disposes the old (current) ses_key:
        @session_keys.delete( ses_key )
        
        # gets a new ses_key:
        ses_key = @randgen.get_one
        
        # re-maps the session id to the new key
        @session_keys[ses_key] = ses_id
        
        # changes the session key in the session data
        ses_data[:ses_key] = ses_key
        
        # tell the client what its new session key is
        msg.reply "HTransporter.ses_id='#{ses_key}';"
      end
      ### /extra security
      
      ### Bind the session data and id to the message object
      msg.session = ses_data
      msg.ses_id  = ses_id
      
      ## Return success
      return true
    
    ## The session was either faked or expired:
    else
      ### Tells the client to stop connecting with its session key and reload instead to get a new one.
      stop_client_with_message( msg,
        @config[:messages][:invalid_session][:title],
        @config[:messages][:invalid_session][:descr],
        @config[:messages][:invalid_session][:uri]
      )
      
      ## Return failure
      return false
    end
    
  end
  
  ## Tells the client to stop connecting with its session
  def stop_client( msg )
    msg.reply "HTransporter.syncDelay=-1;"
  end
  
  ## Displays error message and stops the client
  def stop_client_with_message( msg, title='Unknown Issue', descr='No issue description given.', uri='/' )
    msg.reply "jsLoader.load('basic');"
    msg.reply "jsLoader.load('window');"
    msg.reply "jsLoader.load('servermessage');"
    msg.reply "reloadApp = new ReloadApp( '#{title.gsub("'",'\'')}', '#{descr.gsub("'",'\'')}', '#{uri}'  );"
    stop_client( msg )
  end
  
  ### Checks / Sets cookies
  def check_cookie( msg )
    
    # default to no cookie key found:
    cookie_key = false
    
    # gets the cookie array from the request object
    cookie_raw = msg.request.cookies
    
    # checks, if a cookie named 'ses_key' is found
    if cookie_raw.has_key?('ses_key')
      
      # gets just the data itself (discards comment, domain, exipiry etc)
      cookie_key = cookie_raw['ses_key'].split(':')[0]
      
    end
    
    # if a cookie key is found (non-false), checks if it's valid
    if cookie_key
      
      # checks for validity by looking the key up in @session_cookie_keys
      cookie_key_exist = @session_cookie_keys.has_key?( cookie_key )
      
      # sets the cookie key to false, if it doesn't exist
      cookie_key = false unless cookie_key_exist
      
    end
    
    # at this point, the cookie key seems valid:
    if cookie_key and cookie_key_exist
      
      # get the session identifier
      ses_id = @session_cookie_keys[ cookie_key ]
      
      # get the last session key from session data
      ses_key = @sessions[ses_id][:ses_key]
      
      # make additional checks on the session validity (expiry etc)
      ses_status = check_ses( msg, ses_key )
      
      # delete the old key:
      @session_cookie_keys.delete( cookie_key )
      
      # status is either true (valid) or false (invalid)
      # based on the result of check_ses
      if ses_status
        
        # get a new cookie key
        cookie_key = @randgen.get(@config[:cookie_key_multiplier]).join('')
        
        # map the new cookie key to the old session identifier
        @session_cookie_keys[ cookie_key ] = ses_id
        
        # binds the new cookie key to the old session data
        @sessions[ses_id][:cookie_key] = cookie_key
        
        # Sets the restored_session flag of msg to true
        # It signals plugins to re-set data
        msg.restored_session = true
        
        # Sets the new_session flag of msg to false
        # It signals plugins to not create new server-side values
        msg.new_session = false
        
        # tells ValueManager to re-send client-side HValue objects
        # with data to the client
        VALUEMANAGER.init_ses( msg )
      
      # if the session is not valid, make sure to mark the
      # cookie key as invalid (false)
      else
        cookie_key = false
      end
    end
    
    # if the cookie key failed validation in the
    # tests above, create a new session instead
    unless cookie_key
      cookie_key = init_ses( msg )
      ses_status = true
    end
    
    # Uses a cookie comment to tell the user what the
    # cookie is for, change it to anything valid in the
    # configuration.
    ses_cookie_comment = @config[:ses_cookie_comment]
    
    ## mod_rewrite changes the host header to x-forwarded-host:
    if msg.request.header.has_key?('x-forwarded-host')
      domain = msg.request.header['x-forwarded-host']
      
    ## direct access just uses host (at least mongrel
    ## does mod_rewrite header translation):
    else
      domain = msg.request.host
    end
    
    ## if the host address is a real domain
    ## (not just hostname or 'localhost'),
    ## but not an ip-address, prepend it with
    ## a dotto accept wildcards (useful for
    ## dns-load-balanced server configurations)
    if not @ipv4_reg.match(domain) and domain.include?('.')
      ses_cookie_domain  = ".#{domain}"
    
    ## Otherwise, use the domain as-is
    else
      ses_cookie_domain  = domain
    end
    
    ## uses the timeout to declare the max age
    ## of the cookie, allows the browser to delete
    ## it, when it expires.
    ses_cookie_max_age = @config[:timeout_secs]
    
    ## Only match the handshaking address of himle,
    ## prevents unneccessary cookie-juggling in xhr's
    ses_cookie_path    = '/hello'
    
    ## Formats the cookie to string
    ## (through array, to keep it readable in the source)
    ses_cookie_str = [
      "ses_key=#{cookie_key}",
      "Domain=#{ses_cookie_domain}",
      "Max-Age=#{ses_cookie_max_age}",
      "Comment=#{ses_cookie_comment}",
      "Path=#{ses_cookie_path}"
    ].join(':')
    
    if DEBUG_MODE
      puts "ses_cookie_str: #{ses_cookie_str.inspect}"
      puts "@session_cookie_keys: #{@session_cookie_keys.inspect}"
    end
    
    ### Sets the set-cookie header
    msg.response['Set-Cookie'] = ses_cookie_str
    
    ## Return the session status. Actually,
    ## the value is always true, but future
    ## versions might not accept invalid
    ## cookies as new sessions.
    return ses_status
  end
  
  ### Creates a message and checks the session
  def init_msg( request, response, cookies=false )
    
    ## Perform old-session cleanup on all xhr:s
    expire_sessions
    
    ## The 'ses_id' request query key is required.
    ## The client defaults to '0', which means the
    ## client needs to be initialized.
    ## The client's ses_id is the server's ses_key.
    if not request.query.has_key?( 'ses_id' )
      return false
    else
      
      ## get the ses_key from the request query:
      ses_key = request.query[ 'ses_id' ]
      
      ## The message object binds request, response
      ## and all user/session -related data to one
      ## object, which is passed around where
      ## request/response/user/session -related
      ## data is needed.
      msg = Message.new( request, response )
      
      ## The client tells that its ses_key is '0',
      ## until the server tells it otherwise.
      if ses_key == '0'
        
        # If Broker encounters a '/hello' request, it
        # sets cookies to true.
        # It means that a session should have its cookies
        # checked.
        if cookies
          ses_status = check_cookie( msg )
        
        # Otherwise, we just create a new session:
        else
          init_ses( msg )
          ses_status = true
        end
      
      # for non-'0' ses_keys:
      else
        
        ## Validate the session key
        ses_status = check_ses( msg, ses_key )
        
      end # /ses_id
      
      ## msg.ses_valid is false by default, meaning
      ## it's not valid or hasn't been initialized.
      msg.ses_valid = ses_status
      
      return msg
      
    end # /ses_key
    
  end # /init_msg
  
  
end



