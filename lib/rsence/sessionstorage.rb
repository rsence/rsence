##   RSence
 #   Copyright 2006 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##



module RSence

  require 'rubygems'
  require 'sequel'
  
  ## HValue class for session restoration
  require 'rsence/value'
  
  # SessionStorage doesn't do anything by itself, it's simply
  # the superclass for SessionManager that does all the boring
  # housekeeping duties.
  # 
  # Spliced of as a separate file to reduce the complexity
  # of SessionManager.
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
      @config = RSence.config[:session_conf]
    
      @db_uri = RSence.config[:database][:ses_db]
    
      if db_test
        @db_avail = true
        db_init
      else
        @db_avail = false
        puts "Warning: Session database is not available. Can't use persistent sessions."
        @id_counter = 0
      end
    
      @accept_requests = true
    
    end
  
    attr_reader :accept_requests
  
    def db_test
      begin
        db_open
        if @db.table_exists?(:rsence_test)
          @db.drop_table(:rsence_test)
        end
        @db.create_table(:rsence_test) { primary_key :id; String :test }
        test_id = @db[:rsence_test].insert( :test => 'TestFoo' )
        @db[:rsence_test].filter( :id => test_id ).update( :test => 'TestFoo2' )
        @db[:rsence_test].filter( :id => test_id ).delete
        @db[:rsence_test].delete
        @db.drop_table(:rsence_test)
        db_close
        return true
      rescue => e
        if RSence.args[:debug]
          err_msg = [
            "ERROR: SessionStorage couldn't open database",
            "#{e.class.to_s}, #{e.message}",
            "Backtrace:",
            "\t"+e.backtrace.join("\n\t")
          ].join("\n")+"\n"
          $stderr.write( err_msg )
        elsif RSence.args[:verbose]
          puts "Failed to open database '#{@db_uri}'."
          puts "Run RSence in debug mode for full error output."
        end
        return false
      end
    end
  
    def db_close
      @db.disconnect
    end
  
    def db_open
      # work-around for windows (drive letters causing confusion)
      if @db_uri.start_with?('sqlite://')
        @db = Sequel.sqlite( @db_uri.split('sqlite://')[1] )
      else
        @db = Sequel.connect(@db_uri)
      end
    end
  
    ## Creates the 'rsence_session' table, if necessary
    ## This table is used to store sessions
    def create_session_table
      db_open
      unless @db.table_exists?(:rsence_session)
        puts "Creating session table..." if RSence.args[:verbose]
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
      end
      db_close
    end
  
    ## Creates the 'rsence_version' table, if necessary
    ## This table is used to check for the need of future database upgrades
    def create_version_table
      db_open
      unless @db.table_exists?(:rsence_version)
        puts "Creating version info table..." if RSence.args[:verbose]
        @db.create_table :rsence_version do
          Integer :version
        end
        @db[:rsence_version].insert(:version => 586)
      end
      db_close
    end
  
    ## Creates the 'rsence_uploads' table, if necessary
    ## This table is used for storing temporary uploads before processing
    def create_uploads_table
      db_open
      unless @db.table_exists?(:rsence_uploads)
        puts "Creating uploads table..." if RSence.args[:verbose]
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
      end
      db_close
    end
  
    # returns the version in the rsence_version table
    def table_version
      db_open
      rsence_version = @db[:rsence_version].select(:version).all[0][:version]
      db_close
      return rsence_version
    end
  
    ## Checks database connectivity and loads stored sessions from the database
    def db_init
    
      create_session_table
      create_version_table
      create_uploads_table
    
      ## Used for future upgrades:
      # version = table_version
    
      return true
    end
  
    ## Deletes all rows from rsence_session as well as rsence_uploads
    def reset_sessions
      unless @db_avail
        puts "Warning: Can't reset sessions: No database!" if RSence.args[:verbose]
        return
      end
      db_open
      @db[:rsence_session].delete if @db.table_exists?(:rsence_session)
      @db[:rsence_uploads].delete if @db.table_exists?(:rsence_uploads)
      db_close
    end
  
    ## Restores all saved sessions from db to ram
    def restore_sessions
      unless @db_avail
        puts "Warning: Can't restore sessions: No database!" if RSence.args[:verbose]
        return
      end
      puts "Restoring sessions..." if RSence.args[:verbose]
      db_open
      @db[:rsence_session].all do |ses_row|
        ses_id = ses_row[:id]
        ses_data_dump = ses_row[:ses_data]
        
        if ses_data_dump == nil
          @db[:rsence_session].filter(:id => ses_id).delete
          @db[:rsence_uploads].filter(:ses_id => ses_id).delete
        else
          begin
            ses_data = Marshal.load( ses_data_dump )
            ses_key = ses_data[:ses_key]
            @sessions[ses_id] = ses_data
            @session_keys[ ses_key ] = ses_id
            @session_cookie_keys[ ses_data[:cookie_key] ] = ses_id
            if @plugins
              @plugins.delegate( :load_ses_id, ses_id )
              @plugins.delegate( :load_ses, ses_data )
            end
          rescue => e
            warn "Unable to load session: #{ses_id}, because: #{e.message}"
            @db[:rsence_session].filter(:id => ses_id).delete
            @db[:rsence_uploads].filter(:ses_id => ses_id).delete
          end
        end
      end
      db_close
    end
  
    ## Stores all sessions to db from ram
    def store_sessions
      unless @db_avail
        puts "Warning: Can't store sessions: No database!" if RSence.args[:verbose]
        return
      end
      puts "Storing sessions..." if RSence.args[:verbose]
      db_open
      ses_ids = @sessions.keys
      ses_ids.each do |ses_id|
        ses_data = @sessions[ses_id]
        if @plugins
          @plugins.delegate( :dump_ses, ses_data )
          @plugins.delegate( :dump_ses_id, ses_id )
        end
        begin
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
        rescue => e
          warn "Unable to dump session: #{ses_id}, because: #{e.message}"
        end
      end
      db_close
    end
  
    ## Shut-down signal, triggers store_sessions for now
    def shutdown
      @accept_requests = false
      puts "Session shutdown in progress..." if RSence.args[:verbose]
      store_sessions
      puts "Session shutdown complete." if RSence.args[:verbose]
    end
  
  
    ## Returns a new, unique session identifier by storing the params to the database
    def new_ses_id( cookie_key, ses_key, timeout_secs, user_id=0 )
      unless @db_avail
        @id_counter += 1
        return @id_counter
      end
      db_open
      new_id = @db[:rsence_session].insert(
        :cookie_key  => cookie_key,
        :ses_key     => ses_key,
        :ses_timeout => timeout_secs,
        :user_id     => user_id
      )
      db_close
      return new_id
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
      if @plugins
        @plugins.delegate( :expire_ses, ses_data )
        @plugins.delegate( :expire_ses_id, ses_id )
      end
    
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
    
      if @db_avail
        db_open
        # Deletes the session's row from the database
        @db[:rsence_uploads].filter(:ses_id => ses_id).delete
        @db[:rsence_session].filter(:id => ses_id).delete
        db_close
      end
    
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
