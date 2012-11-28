##   RSence
 #   Copyright 2006 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##



module RSence

  ## HValue class for session restoration
  require 'rsence/value'

  if RSence.config[:database][:ses_db].start_with? 'mongodb://'
    require 'rsence/session/mongo_sessionstorage'
    SessionBackend = MongoSessionStorage
  else
    require 'rsence/session/sequel_sessionstorage'
    SessionBackend = SequelSessionStorage
  end

  # SessionStorage doesn't do anything by itself, it's simply
  # the superclass for SessionManager that handles the persistent
  # storage.
  class SessionStorage < SessionBackend
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
    attr_reader :db_avail
    attr_reader :accept_requests

    ## Returns a new, unique session identifier by storing the params to the database
    def new_ses_id( cookie_key, ses_key, timeout_secs, user_id=0 )
      if @db_avail
        return insert_session_data( {
          :cookie_key  => cookie_key,
          :ses_key     => ses_key,
          :ses_timeout => timeout_secs,
          :user_id     => user_id
        } )
      else
        @id_counter += 1
        return @id_counter
      end
    end

    ## Stores all sessions to db from ram
    def store_sessions
      unless @db_avail
        puts "Warning: Can't store sessions: No database!" if RSence.args[:verbose]
        return
      end
      puts "Storing sessions..." if RSence.args[:verbose]
      ses_ids = @sessions.keys.clone
      ses_ids.each do |ses_id|
        ses_data = @sessions[ses_id]
        next if ses_data.nil?
        ses_data = @sessions[ses_id].clone
        if @plugins
          @plugins.delegate( :dump_ses, ses_data )
          @plugins.delegate( :dump_ses_id, ses_id )
        end
        begin
          store_session_data( ses_data )
          sleep @config[:db_sleep]
        rescue => e
          warn "Unable to dump session: #{ses_id}, because: #{e.message}"
        end
      end
    end

    ## Restores a single session, called from the database backend
    def restore_session( ses_id, ses_data )
      ses_key = ses_data[:ses_key]
      @sessions[ses_id] = ses_data
      @session_keys[ ses_key ] = ses_id
      @session_cookie_keys[ ses_data[:cookie_key] ] = ses_id
      if @plugins
        @plugins.delegate( :load_ses_id, ses_id )
        @plugins.delegate( :load_ses, ses_data )
      end
    end

    ## Deletes all rows from rsence_session as well as rsence_uploads
    def reset_sessions
      unless @db_avail
        puts "Warning: Can't reset sessions: No database!" if RSence.args[:verbose]
        return
      end
      remove_all_session_data
    end

    ## Restores all saved sessions from db to ram
    def restore_sessions
      unless @db_avail
        puts "Warning: Can't restore sessions: No database!" if RSence.args[:verbose]
        return
      end
      puts "Restoring sessions..." if RSence.args[:verbose]
      load_session_data
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
        remove_session_data( ses_id )
        sleep @config[:db_sleep]
      end
    end

    ## Expires all sessions that meet the timeout criteria
    def expire_sessions
    
      # Loop through all sessions in memory:
      ses_ids = @sessions.keys.clone
      ses_ids.each do |ses_id|
        if @sessions[ses_id] and @sessions[ses_id].has_key?(:timeout)
          timed_out = @sessions[ ses_id ][:timeout] < Time.now.to_i
        else
          timed_out = true
        end
        ## Deletes the session, if the session is too old
        expire_session( ses_id ) if timed_out
      end
    end

    ## Shut-down signal, triggers store_sessions for now
    def shutdown
      @accept_requests = false
      puts "Session shutdown in progress..." if RSence.args[:verbose]
      store_sessions
      puts "Session shutdown complete." if RSence.args[:verbose]
    end
  end
end
