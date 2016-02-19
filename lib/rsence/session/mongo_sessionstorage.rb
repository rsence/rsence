
require 'mongo'

# MongoSessionStorage is the SessionStorage backend for MongoDB
class MongoSessionStorage

  # Opens database connection
  def db_open
    conf = @db_params[:mongo]
    if conf[:repl_enabled]
      @conn = Mongo::MongoReplicaSetClient.new( conf[:repl_members], {
        :name => conf[:repl_name],
        :pool_size => conf[:pool_size],
        :pool_timeout => conf[:pool_timeout]
      } )
    else
      @conn = Mongo::Connection.new( conf[:host], conf[:port], {
        :pool_size => conf[:pool_size],
        :pool_timeout => conf[:pool_timeout],
      } )
    end
    @db = @conn.db( conf[:db_name] )
    @db_auth = @db.authenticate( conf[:username], conf[:password] )
    @db_auth = true
  end

  # Checks, whether the string can be converted to BSON::ObjectId
  def legal_bson_str?( _id )
    ( _id.class == String and BSON::ObjectId.legal?( _id ) )
  end

  # Converts string-id's to BSON id's
  def bson_id( _id )
    if legal_bson_str?( _id )
      return BSON::ObjectId.from_string( _id )
    elsif _id.class == BSON::ObjectId
      return _id
    else
      return nil
    end
  end

  # Closes database connection
  def db_close
    @conn.close
    @db = nil
    @db_auth = false
  end

  # Tests database authentication
  def db_test
    begin
      db_open
    rescue => e
      warn "MongoDB connection exception: #{e.inspect}"
      return false
    end
    return true if @db_auth
    db_close
    warn "MongoDB authentication failed"
    return false
  end

  # Just binds the collections to their own instance members
  def db_init
    @ses_coll = @db['rsence_ses']
    @up_coll  = @db['rsence_uploads']
  end

  # Finds every document is the rsence_ses
  # collection and calls #restore_session
  def load_session_data
    @ses_coll.find.each do |ses_row|
      ses_id   = ses_row['_id'].to_s
      ses_data_bin = ses_row['ses_data']
      if ses_data_bin.nil?
        puts "removing #{ses_id}"
        remove_session_data( ses_id )
      else
        begin
          ses_data = Marshal.load( ses_data_bin.to_s )
        rescue => e
          warn "Unable to restore session #{ses_id}"
          remove_session_data( ses_id )
        end
        restore_session( ses_id, ses_data )
      end
    end
  end

  # Inserts new session and returns its id
  def insert_session_data( ses_data )
    if legal_bson_str?( ses_data[:user_id] )
      user_id = bson_id( ses_data[:user_id] )
    else
      user_id = ses_data[:user_id]
    end
    ses_id = @ses_coll.insert({
      'cookie_key'  => ses_data[:cookie_key],
      'ses_key'     => ses_data[:ses_key],
      'ses_timeout' => ses_data[:ses_timeout],
      'user_id'     => user_id
    })
    return ses_id.to_s
  end

  # Stores the session data, requires inserted session
  def store_session_data( ses_data )
    ses_id = bson_id( ses_data[:ses_id] )
    if legal_bson_str?( ses_data[:user_id] )
      user_id = bson_id( ses_data[:user_id] )
    else
      user_id = ses_data[:user_id]
    end
    ses_data_bin = BSON::Binary.new( Marshal.dump( ses_data ) )
    @ses_coll.update({'_id' => ses_id}, {'$set' => {
      'cookie_key'  => ses_data[:cookie_key],
      'ses_key'     => ses_data[:ses_key],
      'user_id'     => user_id,
      'ses_data'    => ses_data_bin,
      'ses_timeout' => ses_data[:timeout],
      'ses_stored'  => Time.now.to_i
    }})
  end

  # Removes session data of a session
  def remove_session_data( ses_id )
    ses_id = bson_id( ses_id )
    @ses_coll.remove({'_id' => ses_id})
    @up_coll.remove({'ses_id' => ses_id})
  end

  # Removes all session data
  def remove_all_session_data
    @ses_coll.remove
    @up_coll.remove
  end

  # Creates upload, returns its id as string
  def new_upload_data( data )
    ses_id = bson_id( data[:ses_id] )
    if legal_bson_str?( data[:ticket_id] )
      ticket_id = bson_id( data[:ticket_id] )
    else
      ticket_id = data[:ticket_id]
    end
    return @up_coll.insert({
      'ses_id'      => ses_id,
      'ticket_id'   => ticket_id,
      'upload_date' => data[:upload_date],
      'upload_done' => data[:upload_done],
      'file_name'   => data[:file_name],
      'file_size'   => data[:file_size],
      'file_mime'   => data[:file_mime],
      'file_data'   => BSON::Binary.new( data[:file_data] )
    }).to_s
  end

  # Sets upload data
  def set_upload_data( upload_id, file_data )
    upload_id = bson_id( upload_id )
    @up_coll.update({'_id' => upload_id}, { '$set' => {
      'file_data'   => BSON::Binary.new( file_data ),
      'upload_done' => true
    }})
  end

  # Gets upload data
  def get_upload_data( upload_id )
    upload_id = bson_id( upload_id )
    up_data = @up_coll.find_one({ '_id' => upload_id }, {
      :fields => [ 'upload_date', 'upload_done', 'file_name',
                   'file_size', 'file_mime', 'file_data' ]
    })
    return {
      :upload_date => up_data['upload_date'],
      :upload_done => up_data['upload_done'],
      :file_name => up_data['file_name'],
      :file_size => up_data['file_size'],
      :file_mime => up_data['file_mime'],
      :file_data => up_data['file_data'].to_s
    }
  end

  # Gets upload metadata only
  def get_upload_meta( upload_id )
    upload_id = bson_id( upload_id )
    up_data = @up_coll.find_one({ '_id' => upload_id }, {
      :fields => [ 'upload_date', 'upload_done', 'file_name',
                   'file_size', 'file_mime' ]
    })
    return {
      :upload_date => up_data['upload_date'],
      :upload_done => up_data['upload_done'],
      :file_name => up_data['file_name'],
      :file_size => up_data['file_size'],
      :file_mime => up_data['file_mime'],
      :file_data => nil
    }
  end

  # Deletes upload by id
  def del_upload( upload_id )
    upload_id = bson_id( upload_id )
    @up_coll.remove( { '_id' => upload_id } )
  end

  # Deletes upload by ticket_id and ses_id
  def del_uploads( ticket_id, ses_id )
    if legal_bson_str?( ses_id )
      ses_id = bson_id( ses_id )
    else
      ses_id = false
    end
    if legal_bson_str?( ticket_id )
      ticket_id = bson_id( ticket_id )
    else
      ticket_id = ticket_id
    end
    @up_coll.remove( { 'ses_id' => ses_id } ) if ses_id
    @up_coll.remove( { 'ticket_id' => ticket_id } ) if ticket_id
  end
end
