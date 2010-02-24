##   Riassence Framework
 #   Copyright 2006 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##

require 'rubygems'
require 'sequel'

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
    
    @clone_origins = {
      # id => [ id, id, id ... ]
    }
    @clone_sources = {
      # id => id
    }
    @clone_targets = {
      # id => [ id, id, id ... ]
    }
    
    ## Disposable keys (new ses_key each request)
    @config = $config[:session_conf]
    
    @db_uri = $config[:database][:ses_db]
    
    db_init
    
  end
  
  def db_test
    if @db.table_exists?(:rsence_test)
      @db.drop_table(:rsence_test)
    end
    @db.create_table(:rsence_test) { primary_key :id; String :test }
    test_id = @db[:rsence_test].insert( :test => 'TestFoo' )
    @db[:rsence_test].filter( :id => test_id ).update( :test => 'TestFoo2' )
    @db[:rsence_test].filter( :id => test_id ).delete
    @db[:rsence_test].delete
    @db.drop_table(:rsence_test)
  end
  
  def db_open
    ## Tests if database has sufficient privileges
    begin
      @db = Sequel.connect(@db_uri)
      db_test
      @db.disconnect
      @db = Sequel.connect(@db_uri)
    rescue => e
      $stderr.write( "SessionStorage: error #{e.inspect}\nReverting to default database.\n" )
      @db_uri = "sqlite://#{File.join(SERVER_PATH,'var','db','rsence_ses.db')}"
      @db = Sequel.connect(@db_uri)
      db_test
      @db.disconnect
      @db = Sequel.connect(@db_uri)
    end
  end
  
  ## Checks database connectivity and loads stored sessions from the database
  def db_init
    
    db_open
    
    ## 
    if @config[:reset_sessions]
      puts "Resetting all sessions..."
      reset_sessions()
    else
      restore_sessions()
    end
    
    ## Creates the 'rsence_session' table, if necessary
    ## This table is used to store sessions
    unless @db.table_exists?(:rsence_session)
      puts "Creating session table..." if $DEBUG_MODE
      @db.create_table :rsence_session do
        primary_key( :id )
        column( :cookie_key,  String  )
        column( :ses_key,     String  )
        column( :ses_timeout, Integer )
        column( :user_id,     Integer )
        column( :ses_active,  TrueClass )
        column( :ses_stored,  Integer )
        column( :ses_data,    File    )
      end
      @db.disconnect
      db_open
    end
    
    ## Creates the 'rsence_version' table, if necessary
    ## This table is used to check for the need of future database upgrades
    unless @db.table_exists?(:rsence_version)
      puts "Creating version info table..." if $DEBUG_MODE
      @db.create_table :rsence_version do
        Integer :version
      end
      @db[:rsence_version].insert(:version => 586)
      @db.disconnect
      db_open
    end
    
    ## Creates the 'rsence_uploads' table, if necessary
    ## This table is used for storing temporary uploads before processing
    unless @db.table_exists?(:rsence_uploads)
      puts "Creating uploads table..." if $DEBUG_MODE
      @db.create_table :rsence_uploads do
        primary_key( :id )
        foreign_key( :ses_id, :rsence_session )
        column( :upload_date, Integer )
        column( :upload_done, Integer )
        column( :ticket_id,   String  )
        column( :file_size,   Integer )
        column( :file_name,   String  )
        column( :file_mime,   String  )
        column( :file_data,   File    )
      end
      @db.disconnect
      db_open
    end
    rsence_version = @db[:rsence_version].select(:version).all[0][:version]
    
    return true
  end
  
  ## Deletes all rows from rsence_session as well as rsence_uploads
  def reset_sessions
    @db[:rsence_session].delete if @db.table_exists?(:rsence_session)
    @db[:rsence_uploads].delete if @db.table_exists?(:rsence_uploads)
    @db.disconnect
    db_open
  end
  
  ## Restores all saved sessions from db to ram
  def restore_sessions
    puts "Restoring sessions..." if $DEBUG_MODE
    @db[:rsence_session].all do |ses_row|
      ses_id = ses_row[:id]
      ses_data_dump = ses_row[:ses_data]
      
      if ses_data_dump == nil
        @db[:rsence_session].filter(:id => ses_id).delete
        @db[:rsence_uploads].filter(:ses_id => ses_id).delete
      else
        ses_data = Marshal.restore( ses_data_dump )
        ses_key = ses_data[:ses_key]
        @sessions[ses_id] = ses_data
        @session_keys[ ses_key ] = ses_id
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
      @db[:rsence_session].filter(
        :id => ses_id
      ).update(
        :cookie_key  => ses_data[:cookie_key],
        :ses_key     => ses_data[:ses_key],
        :user_id     => ses_data[:user_id],
        :ses_data    => ses_data_dump.to_sequel_blob,
        :ses_timeout => ses_data[:timeout],
        :ses_stored  => Time.now.to_i
      )
    end
  end
  
  ## Shut-down signal, triggers store_sessions for now
  def shutdown
    puts "Session shutdown in progress..." if $DEBUG_MODE
    store_sessions
    @db.disconnect
    puts "Session shutdown complete." if $DEBUG_MODE
  end
  
  
  ## Returns a new, unique session identifier by storing the params to the database
  def new_ses_id( cookie_key, ses_key, timeout_secs, user_id=0 )
    return @db[:rsence_session].insert(
      :cookie_key  => cookie_key,
      :ses_key     => ses_key,
      :ses_timeout => timeout_secs,
      :user_id     => user_id
    )
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
    
    # target -> source cleanup
    if @clone_sources.has_key?( ses_id )
      source_id = @clone_sources[ ses_id ]
      @clone_sources.delete( ses_id ) if @clone_sources.has_key?( ses_id )
      @clone_targets[ source_id ].delete( ses_id ) if @clone_targets.has_key?( source_id )
    end
    
    # source -> targets cleanup
    if @clone_targets.has_key?( ses_id )
      @clone_targets[ ses_id ].each do |target_id|
        @clone_sources.delete( target_id ) if @clone_sources.has_key?( target_id )
      end
      @clone_targets.delete( ses_id ) if @clone_targets.has_key?( ses_id )
    end
    
    # Deletes the session's row from the database
    @db[:rsence_session].filter(:id => ses_id).delete
    
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

