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


## MySQL database abstraction
require 'db/mysql'

## HValue class for session restoration
require 'values/hvalue'

=begin
SessionStorage doesn't do anything by itself, it's simply
the superclass for SessionManager that does all the boring
housekeeping duties.

Splitted of as a separate file to reduce the complexity
of SessionManager.

=end
class SessionStorage
  def initialize
    ## Session data storage (by ses_id)
    @sessions     = {}
    
    ## Session id by key
    @session_keys = {}
    
    ## Session id by cookie key
    @session_cookie_keys = {}
    
    ## Disposable keys (new ses_key each request)
    @config = $config[:session_conf]
    
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
        puts "Creating himle session database #{auth_setup[:db].inspect}..." if $DEBUG_MODE
        db_root.q( "create database #{auth_setup[:db]}" )
      end
    rescue
      puts "root_setup failed, using auth_setup" if $DEBUG_MODE
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
      puts "Granting privileges..." if $DEBUG_MODE
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
      puts "Creating session table..." if $DEBUG_MODE
      @db.q( "create table himle_session (id int primary key auto_increment, cookie_key char(252) null, ses_key char(84), ses_timeout int not null default 0, user_id int not null default 0, ses_active tinyint not null default 0, ses_stored int not null default 0, ses_data mediumblob)" )
    end
    
    ## Creates the 'himle_version' table, if necessary
    ## This table is used to check for the need of future database upgrades
    unless @db.tables.include?('himle_version')
      puts "Creating version info table..." if $DEBUG_MODE
      @db.q( "create table himle_version ( version int primary key not null default 0)" )
      @db.q( "insert into himle_version ( version ) values (37)" )
    end
    
    ## 
    if @config[:reset_sessions]
      puts "Resetting all sessions..."
      reset_sessions()
    else
      puts "Restoring old sessions..." if $DEBUG_MODE
      restore_sessions()
    end
  end
  
  
  ## Deletes all rows from himle_session
  def reset_sessions
    @db.q("delete from himle_session")
  end
  
  ## Restores all saved sessions from db to ram
  def restore_sessions
    puts "Restoring sessions..." if $DEBUG_MODE
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
    puts "Storing sessions..." if $DEBUG_MODE
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
    puts "Session shutdown in progress..." if $DEBUG_MODE
    store_sessions
    puts "Session shutdown complete." if $DEBUG_MODE
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
    $TICKETSERVE.expire_ses( ses_id )
    
    # Deletes the session's row from the database
    @db.q( "delete from himle_session where id = #{ses_id}" )
    
  end
  
  ## Expires all sessions that meet the timeout criteria
  def expire_sessions
    
    # Loop through all sessions in memory:
    @sessions.each_key do |ses_id|
      
      timed_out = @sessions[ ses_id ][:timeout] < Time.now.to_i
      
      ## Deletes the session, if the session is too old
      expire_session( ses_id ) if timed_out
    end
  end
  
end

