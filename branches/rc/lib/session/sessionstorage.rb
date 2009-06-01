# -* coding: UTF-8 -*-
###
  # Riassence Core -- http://rsence.org/
  #
  # Copyright (C) 2008 Juha-Jarmo Heinonen <jjh@riassence.com>
  # Copyright (C) 2006 Helmi Technologies Inc.
  #
  # This file is part of Riassence Core.
  #
  # Riassence Core is free software: you can redistribute it and/or modify
  # it under the terms of the GNU General Public License as published by
  # the Free Software Foundation, either version 3 of the License, or
  # (at your option) any later version.
  #
  # Riassence Core is distributed in the hope that it will be useful,
  # but WITHOUT ANY WARRANTY; without even the implied warranty of
  # MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  # GNU General Public License for more details.
  #
  # You should have received a copy of the GNU General Public License
  # along with this program.  If not, see <http://www.gnu.org/licenses/>.
  #
  ###

require 'rubygems'
require 'iconv'

## MySQL database abstraction
require 'db/mysql'

## HValue class for session restoration
require 'values/hvalue'

module Riassence
module Server

=begin
SessionStorage doesn't do anything by itself, it's simply
the superclass for SessionManager that does all the boring
housekeeping duties.

Splitted of as a separate file to reduce the complexity
of SessionManager.

=end
class SessionStorage
  attr_accessor :db
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
    if @config[:mysql_backend]
      @mysql_fail = (not db_init_mysql())
    else
      @mysql_fail = true
    end
    
    @int_counter = 0 if @mysql_fail
    
  end
  
  ## Checks database connectivity and loads stored sessions from the database
  def db_init_mysql
    
    ## modify these settings in the config to match your system:
    root_setup = $config[:database][:root_setup] # 'root' access account of mysql
    auth_setup = $config[:database][:auth_setup] # rsence-isolated account of mysql
    
    ## checks/creates rsence database or fails (in that case you have to set up the database manually)
    begin
      db_root = MySQLAbstractor.new(root_setup, root_setup[:db])
      db_root.open
      unless db_root.dbs.include?( auth_setup[:db] )
        puts "Creating rsence session database #{auth_setup[:db].inspect}..." if $DEBUG_MODE
        db_root.q( "create database #{auth_setup[:db]} default charset=utf8" )
      end
    rescue DBI::InterfaceError => e
      puts "mysql driver not loaded, error: #{e}"
      puts "  "+e.backtrace.join("\n  ")
      puts "mysql driver failed to initialize, continuing without session storage support."
      return false
    rescue => e
      puts "root setup failed, reason: #{e.inspect}"
      puts "root_setup failed, using auth_setup" if $DEBUG_MODE
      db_root = false
    end
    
    ## tests auth_setup permissions by creating and dropping rsence_test
    db_auth = MySQLAbstractor.new(auth_setup, auth_setup[:db])
    begin
      has_privileges = (db_auth.q("drop table if exists rsence_test") == 0)
      has_privileges = (db_auth.q("create table rsence_test (id int primary key auto_increment)") == 0) and has_privileges
      has_privileges = (db_auth.q("drop table if exists rsence_test") == 0) and has_privileges
    rescue => e
      puts "privilege test failed, reason: #{e.inspect}"
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
    
    ## Creates the 'rsence_session' table, if necessary
    ## This table is used to store sessions
    unless @db.tables.include?('rsence_session')
      puts "Creating session table..." if $DEBUG_MODE
      @db.q( %{
        create table rsence_session (
          id int primary key auto_increment,
          cookie_key char(252) character set utf8 null,
          ses_key char(84),
          ses_timeout int not null default 0,
          user_id int not null default 0,
          ses_active tinyint not null default 0,
          ses_stored int not null default 0,
          ses_data mediumblob
        ) default charset utf8
      }.gsub("\n",' ').squeeze(' ') )
    end
    
    ## Creates the 'rsence_version' table, if necessary
    ## This table is used to check for the need of future database upgrades
    unless @db.tables.include?('rsence_version')
      puts "Creating version info table..." if $DEBUG_MODE
      @db.q( "create table rsence_version ( version int primary key not null default 0)" )
      @db.q( "insert into rsence_version ( version ) values (270)" )
    end
    
    ## Creates the 'rsence_uploads' table, if necessary
    ## This table is used for storing temporary uploads before processing
    unless @db.tables.include?('rsence_uploads')
      puts "Creating uploads table..." if $DEBUG_MODE
      @db.q( %{
        create table rsence_uploads (
          id int primary key auto_increment,
          ses_id int not null,
          upload_date int not null,
          upload_done tinyint not null default 0,
          ticket_id varchar(255) character set utf8 not null,
          file_size int not null default 0,
          file_name varchar(255) character set utf8 not null,
          file_mime varchar(255) character set utf8 not null default 'text/plain',
          file_data mediumblob
        ) default character set utf8
      }.gsub("\n",' ').squeeze(' ') )
      @db.q( "update rsence_version set version = 270" )
      rsence_version = 270
    end
    rsence_version = @db.q("select version from rsence_version")[0]['version'].to_i
    
    # updates the uploads-table, if it was created in revision 249:
    if rsence_version < 252
      @db.q( "alter table rsence_uploads add column upload_done tinyint not null default 0" )
      @db.q( "alter table rsence_uploads add column upload_date int not null" )
      @db.q( "alter table rsence_uploads add column ticket_id varchar(255) not null character set utf8" )
      @db.q( "alter table rsence_uploads add column file_name varchar(255) not null character set utf8" )
      @db.q( "alter table rsence_uploads drop column file_uploaded" )
      @db.q( "update rsence_version set version = 270" )
      rsence_version = 270
    end
    if rsence_version < 254
      @db.q( "alter table rsence_uploads add column ticket_id varchar(255) not null character set utf8" )
      @db.q( "alter table rsence_uploads add column file_name varchar(255) not null character set utf8" )
      @db.q( "update rsence_version set version = 270" )
      rsence_version = 270
    end
    
    utf8util = MySQL_UTF8_Util.new(@db)
    
    db_is_utf8 = utf8util.is_database_utf8?(auth_setup[:db])
    
    ## Convert column definitions and data to utf-8
    if rsence_version < 270 or not db_is_utf8
      
      puts "Converting tables to utf8" if $DEBUG_MODE
      
      utf8util.convert_table_to_utf8('rsence_session',['cookie_key','ses_key'])
      utf8util.convert_table_to_utf8('rsence_uploads',['file_mime','ticket_id','file_name'])
      
      puts "Converting database to utf8" if $DEBUG_MODE
      utf8util.convert_database_to_utf8(auth_setup[:db])
      
      @db.q( "update rsence_version set version = 270" )
      rsence_version = 270
    end
    
    ## 
    if @config[:reset_sessions]
      puts "Resetting all sessions..."
      reset_sessions()
    else
      restore_sessions()
    end
    
    return true
  end
  
  ## Deletes all rows from rsence_session as well as rsence_uploads
  def reset_sessions
    return if @mysql_fail
    @db.q("delete from rsence_session")
    @db.q("delete from rsence_uploads")
  end
  
  ## Restores all saved sessions from db to ram
  def restore_sessions
    return if @mysql_fail
    puts "Restoring sessions..." if $DEBUG_MODE
    @db.q("select * from rsence_session").each do |ses_row|
      ses_id = ses_row['id']
      #puts "ses_id = #{ses_id.inspect}"
      ses_data_dump = ses_row['ses_data']
      if ses_data_dump == nil
        @db.q("delete from rsence_session where id = #{ses_id}")
      else
        ses_data = Marshal.restore( ses_data_dump )
        ses_key = ses_data[:ses_key]
        #puts "ses_key = #{ses_key.inspect}"
        @sessions[ses_id] = ses_data
        @session_keys[ ses_key ] = ses_id
        @session_cookie_keys[ ses_data[:cookie_key] ] = ses_id
      end
    end
  end
  
  ## Stores all sessions to db from ram
  def store_sessions
    return if @mysql_fail
    puts "Storing sessions..." if $DEBUG_MODE
    @sessions.each_key do |ses_id|
      ses_data = @sessions[ ses_id ]
      #puts ses_data.inspect
      ses_data_dump = Marshal.dump( ses_data )
      @db.q("update rsence_session set cookie_key = #{hexlify(ses_data[:cookie_key])} where id=#{ses_id}")
      @db.q("update rsence_session set ses_key = #{hexlify(ses_data[:ses_key])} where id=#{ses_id}")
      @db.q("update rsence_session set user_id = #{ses_data[:user_id]} where id=#{ses_id}")
      @db.q("update rsence_session set ses_data = #{hexlify(ses_data_dump)} where id=#{ses_id}")
      @db.q("update rsence_session set ses_timeout = #{ses_data[:timeout]}")
      @db.q("update rsence_session set ses_stored = #{Time.now.to_i} where id=#{ses_id}")
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
    if @mysql_fail
      @int_counter += 1
      return @int_counter
    end
    return @db.q( "insert into rsence_session (cookie_key, ses_key, ses_timeout, user_id) values (#{hexlify(cookie_key)},#{hexlify(ses_key)}, #{timeout_secs},#{user_id})" )
  end
  
  ## Expires a session by its identifier
  def expire_session( ses_id )
    
    return unless @sessions.has_key? ses_id
    ses_data = @sessions[ ses_id ]
    
    # Makes the session invalid for xhr's by deleting its key
    @session_keys.delete( ses_data[:ses_key] )
    
    # Makes the session invalid for all requests by deleting its cookie key
    @session_cookie_keys.delete( ses_data[:cookie_key] )
    
    # Deletes the session data itself
    @sessions.delete( ses_id )
    
    # Removes all ticket-based storage bound to the session
    $TICKETSERVE.expire_ses( ses_id )
    
    return if @mysql_fail
    
    # Deletes the session's row from the database
    @db.q( "delete from rsence_session where id = #{ses_id}" )
    
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

end
end

