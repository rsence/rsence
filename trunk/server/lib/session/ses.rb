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
  
  
require 'lib/session/msg'
require 'lib/session/randgen'
require 'lib/db/mysql'

require 'pp'

class HSessionManager
  
  def initialize( valuemanager, system, timeout_secs=15*60, disposable_keys=true )
    
    ## Counter for unique session id's
    @last_ses_id  = 0
    
    ## Session data storage (by ses_id)
    @sessions     = {}
    
    ## Session id by key
    @session_keys = {}
    
    ## Session id by cookie key
    @session_cookie_keys = {}
    
    ## Disposable keys (new ses_key each request)
    @disposable_keys = disposable_keys
    
    ## 'Unique' Random String generator
    str_len    = 64   # the length of the string (actually returns 12 chars more)
    min_buffer = 600  # the minimum size the random generated buffer is allowed to be
    @randgen   = HRandgen.new( str_len, min_buffer )
    
    
    #minutes  = 60 # seconds
    #hours    = 60 * minutes
    #days     = 24 * hours
    
    # configure your timeout here, we'll use 15 minutes as a default
    @timeout_secs = timeout_secs #15 * minutes
    
    @valuemanager = valuemanager
    @system       = system
    
    # regex to match ipv4 addresses
    @ipv4_reg = /^([1][0-9][0-9]|[2][0-5][0-9]|[1-9][0-9]|[1-9])\.([1][0-9][0-9]|[2][0-5][0-9]|[1-9][0-9]|[0-9])\.([1][0-9][0-9]|[2][0-5][0-9]|[1-9][0-9]|[0-9])\.([1][0-9][0-9]|[2][0-5][0-9]|[1-9][0-9]|[0-9])$/
    
    db_init_mysql
    
  end
  
  def db_init_mysql
    ## check/create himle database
    root_setup = $config[:database][:root_setup]
    auth_setup = $config[:database][:auth_setup]
    
    begin
      db_root = MySQLAbstractor.new(root_setup, root_setup[:db])
      db_root.open
      unless db_root.dbs.include?( auth_setup[:db] )
        puts "Creating himle session database #{auth_setup[:db].inspect}..." if $config[:debug_mode]
        db_root.q( "create database #{auth_setup[:db]}" )
      end
    rescue
      puts "root_setup failed, using auth_setup"
      db_root = false
    end
    
    db_auth = MySQLAbstractor.new(auth_setup, auth_setup[:db])
    begin
      has_privileges = (db_auth.q("drop table if exists himle_test") == 0)
      has_privileges = (db_auth.q("create table himle_test (id int primary key auto_increment)") == 0) and has_privileges
      has_privileges = (db_auth.q("drop table if exists himle_test") == 0)
    rescue
      has_privileges = false
    end
    
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
      puts "Granting privileges..." if $config[:debug_mode]
      db_root.q( "grant all privileges on #{auth_setup[:db]}.* to #{auth_setup[:user]}@localhost identified by '#{auth_setup[:pass]}'" )
      db_root.q( "flush privileges" )
      db_auth.close
      db_auth.open
    end
    @db = db_auth
    db_root.close if db_root
    
    unless @db.tables.include?('himle_session')
      puts "Creating session table..." if $config[:debug_mode]
      @db.q( "create table himle_session (id int primary key auto_increment, cookie_key char(252) null, ses_key char(84), ses_timeout int not null default 0, user_id int not null default 0, ses_active tinyint not null default 0, ses_stored int not null default 0, ses_data mediumblob)" )
    end
    
    unless @db.tables.include?('himle_version')
      puts "Creating version info table..." if $config[:debug_mode]
      @db.q( "create table himle_version ( version int primary key not null default 0)" )
      @db.q( "insert into himle_version ( version ) values (37)" )
    end
    
    if ARGV.include?('--reset-sessions=true')
      puts "Resetting all sessions..."
      reset_sessions
    else
      puts "Restoring old sessions..." if $config[:debug_mode]
      restore_sessions
    end
  end
  
  def reset_sessions
    @db.q("delete from himle_session")
  end
  
  def restore_sessions
    puts "Restoring sessions..." if $config[:debug_mode]
    @db.q("select * from himle_session").each do |ses_row|
      ses_id = ses_row['id']
      ses_data_dump = ses_row['ses_data']
      if ses_data_dump != nil
        #pp ses_data_dump
        ses_data = Marshal.restore( ses_data_dump )
        @sessions[ses_id] = ses_data
        @session_keys[ ses_data[:ses_key] ] = ses_id
        @session_cookie_keys[ ses_data[:cookie_key] ] = ses_id
      end
    end
  end
  
  def store_sessions
    puts "Storing sessions..." if $config[:debug_mode]
    @sessions.each_key do |ses_id|
      ses_data = @sessions[ ses_id ]
      #pp ses_data
      ses_data_dump = Marshal.dump( ses_data )
      @db.q("update himle_session set cookie_key = #{hexlify(ses_data[:cookie_key])} where id=#{ses_id}")
      @db.q("update himle_session set ses_key = #{hexlify(ses_data[:ses_key])} where id=#{ses_id}")
      @db.q("update himle_session set user_id = #{ses_data[:user_id]} where id=#{ses_id}")
      @db.q("update himle_session set ses_data = #{hexlify(ses_data_dump)} where id=#{ses_id}")
      @db.q("update himle_session set ses_timeout = #{ses_data[:timeout]}")
      @db.q("update himle_session set ses_stored = #{Time.now.to_i} where id=#{ses_id}")
    end
  end
  
  def shutdown
    puts "Session shutdown in progress..." if $config[:debug_mode]
    store_sessions
    puts "Session shutdown complete." if $config[:debug_mode]
  end
  
  def hexlify( str )
    "0x#{str.unpack('H*')[0]}"
  end
  
  ## Returns an unique session identifier
  def new_ses_id( cookie_key, ses_key, timeout_secs, user_id=0 )
    return @db.q( "insert into himle_session (cookie_key, ses_key, ses_timeout, user_id) values (#{hexlify(cookie_key)},#{hexlify(ses_key)}, #{timeout_secs},#{user_id})" )
    #@last_ses_id += 1
    #return @last_ses_id
  end
  
  def expire_session( ses_id )
    #puts "HSessionManager.expire_session( #{ses_id.inspect} )"
    
    ses_data = @sessions[ ses_id ]
    
    #@valuemanager.expire_ses( ses_id )
    
    #puts "@session_keys.delete( #{ses_data[:ses_key].inspect} )"
    @session_keys.delete( ses_data[:ses_key] )
    #puts "@session_cookie_keys.delete( #{ses_data[:cookie_key].inspect} )"
    @session_cookie_keys.delete( ses_data[:cookie_key] )
    #puts "@sessions.delete( #{ses_id.inspect} )"
    @sessions.delete( ses_id )
    
    #puts "IMGSERVE.expire_ses( #{ses_id.inspect} )"
    IMGSERVE.expire_ses( ses_id )
    
    @db.q( "delete from himle_session where id = #{ses_id}" )
    
    #puts "/HSessionManager.expire_session"
  end
  
  def expire_sessions
    @sessions.each_key do |ses_id|
      ses_data = @sessions[ ses_id ]
      if ses_data[:timeout] < Time.now.to_i
        @valuemanager.expire_ses( ses_id )
        @session_keys.delete( ses_data[:ses_key] )
        @session_cookie_keys.delete( ses_data[:cookie_key] )
        @sessions.delete( ses_id )
        
        IMGSERVE.expire_ses( ses_id )
        
        @db.q( "delete from himle_session where id = #{ses_id}" )
        
      end
    end
  end
  
  ## Returns an unique session key
  def new_ses_key
    return @randgen.give_one
  end
  
  ### Create a session
  def init_ses( msg )
    
    time_now = Time.now.to_i # seconds since epoch
    timeout  = time_now + @timeout_secs
    
    ses_key    = new_ses_key()
    cookie_key = new_ses_key()+new_ses_key()+new_ses_key()
    
    ses_id     = new_ses_id(cookie_key, ses_key, timeout)
    
    ses_data = {
      :timeout    =>  timeout,
      :ses_id     =>  ses_id,
      :ses_key    =>  ses_key,
      :cookie_key =>  cookie_key,
      :user_id    =>  0,
      :values     => {
        :sync  => [],  # value id's to sync to client
        :check => [],  # value id's to validate in server (from client)
        :by_id => {}   # values by id
      }
    }
    
    # add the session data to @sessions
    @sessions[ ses_id ] = ses_data
    
    # map the key back to the id
    @session_keys[ ses_key ] = ses_id
    
    # map the ses_id to cookie key
    @session_cookie_keys[ cookie_key ] = ses_id
    
    ### Tell the client what the new key is
    msg.reply "HTransporter.ses_id='#{ses_key}';"
    
    ### Set the session data and id to the message object
    msg.session = ses_data
    msg.ses_id  = ses_id
    
    msg.new_session = true
    
    return cookie_key
    
  end
  
  ### Returns the current session data, if valid session.
  ### Otherwise stops the client and returns false.
  def check_ses( msg, ses_key )
    if @session_keys.has_key?( ses_key )
      
      ses_id   = @session_keys[ ses_key ]
      ses_data = @sessions[ ses_id ]
      
      # increase timeout
      ses_data[:timeout] = Time.now.to_i + @timeout_secs
      
      ### extra security
      # re-generate ses_key for each request
      if @disposable_keys
        @session_keys.delete( ses_key )
        ses_key = new_ses_key
        @session_keys[ses_key] = ses_id
        @sessions[ses_id][:ses_key] = ses_key
        msg.reply "HTransporter.ses_id='#{ses_key}';"
      end
      ## /extra security
      
      ### Set the session data and id to the message object
      msg.session = ses_data
      msg.ses_id  = ses_id
      return true
    else
      msg.reply "jsLoader.load('basic');"
      msg.reply "jsLoader.load('window');"
      msg.reply "jsLoader.load('servermessage');"
      msg.reply "reloadApp = new ReloadApp( 'Invalid Session', 'Your session is invalid. Please reload the page to continue.', '/'  );"
      msg.reply "HTransporter.syncDelay=-1;"
      return false
    end
  end
  
  ### Checks / Sets cookies
  def check_cookie( msg )
    cookie_key = false
    msg.request.cookies.each do |cookie|
      if cookie.name == 'ses_key'
        cookie_key = cookie.value
        break
      end
    end
    if cookie_key
      cookie_key_exist = @session_cookie_keys.has_key?( cookie_key )
    end
    if cookie_key and cookie_key_exist
      ses_id = @session_cookie_keys[ cookie_key ]
      ses_key = @sessions[ses_id][:ses_key]
      ses_status = check_ses( msg, ses_key )
      @session_cookie_keys.delete( cookie_key )
      if ses_status
        cookie_key = new_ses_key+new_ses_key+new_ses_key
        @session_cookie_keys[ cookie_key ] = ses_id
        @sessions[ses_id][:cookie_key] = cookie_key
        msg.restored_session = true
        @valuemanager.init_ses( msg )
        msg.new_session = false
      else
        cookie_key = false
      end
    else
      cookie_key = false
    end
    unless cookie_key
      cookie_key = init_ses( msg )
      ses_status = true
      ## Makes sure we have value storage for the session
      @valuemanager.init_ses( msg )
    end
    ses_cookie = WEBrick::Cookie.new('ses_key',cookie_key)
    ses_cookie.comment = 'Himle session key (just for your convenience)'
    
    ## mod_rewrite:
    if msg.request.header.has_key?('x-forwarded-host')
      domain = msg.request.header['x-forwarded-host'][0]
      
    ## direct access:
    else
      domain = msg.request.host
    end
    
    if @ipv4_reg.match(domain)
      ses_cookie.domain  = domain
    elsif domain.include?('.')
      ses_cookie.domain  = ".#{domain}"
    end
    ses_cookie.max_age = @timeout_secs
    ses_cookie.path    = '/hello'
    #ses_cookie.secure  = false
    ses_cookie_str = ses_cookie.to_s
    msg.response['Set-Cookie'] = ses_cookie_str
    return ses_status
  end
  
  ### Creates a message and checks the session
  def init_msg( request, response, cookies=false )
    
    expire_sessions
    
    ## The 'ses_id' request key is required (the client defaults to '0')
    if not request.query.has_key?( 'ses_id' )
      return false
    else
      ses_key = request.query[ 'ses_id' ]
      ## Use a message object to pass arguments to plugin methods
      msg = Message.new( request, response )
      
      msg.valuemanager = @valuemanager
      msg.system       = @system
      
      ## The client tells that its ses_key is '0',
      ## until the server tells it otherwise.
      if ses_key == '0'
        if cookies
          ses_status = check_cookie( msg )
        else
          ## Initialize a new session
          init_ses( msg )
          ses_status = true
          ## Makes sure we have value storage for the session
          @valuemanager.init_ses( msg )
        end
      else
        ## Check the session by key (check_ses returns the session data)
        ses_status = check_ses( msg, ses_key )
      end # /ses_id
      msg.ses_valid = ses_status
      return msg
    end # /ses_key
  end # /init_msg
end



