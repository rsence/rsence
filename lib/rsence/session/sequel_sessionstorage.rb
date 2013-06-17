
require 'sequel'

# SequelSessionStorage is the SessionStorage backend for
# Sequel (SQL) database storage
class SequelSessionStorage

  # Opens database connection
  def db_open
    # work-around for windows (drive letters causing confusion)
    if @db_uri.start_with?('sqlite://')
      @db = Sequel.sqlite( @db_uri.split('sqlite://')[1] )
    else
      @db = Sequel.connect(@db_uri)
    end
  end

  # Tests database connection
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

  # Closes database connection
  def db_close
    @db.disconnect
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

  def load_session_data
    @db[:rsence_session].all do |ses_row|
      ses_id = ses_row[:id]
      ses_data_dump = ses_row[:ses_data]
      if ses_data_dump.nil?
        remove_session_data( ses_id )
      else
        begin
          ses_data = Marshal.load( ses_data_dump )
          restore_session( ses_id, ses_data )
        rescue => e
          warn "Unable to load session: #{ses_id}, because: #{e.message}"
          remove_session_data( ses_id )
        end
      end
    end
  end

  def insert_session_data( ses_data )
    db_open
    new_id = @db[:rsence_session].insert( ses_data )
    db_close
    return new_id
  end

  def store_session_data( ses_data )
    ses_data_dump = Marshal.dump( ses_data )
    ses_id = ses_data[:ses_id]
    db_open
    @db[:rsence_session].filter(
      :id => ses_id
    ).update(
      :cookie_key  => ses_data[:cookie_key],
      :ses_key     => ses_data[:ses_key],
      :user_id     => ses_data[:user_id],
      :ses_data    => Sequel.blob( ses_data_dump ),
      :ses_timeout => ses_data[:timeout],
      :ses_stored  => Time.now.to_i
    )
    db_close
  end

  def remove_session_data( ses_id )
    db_open
    # Deletes the session's row from the database
    @db[:rsence_uploads].filter(:ses_id => ses_id).delete
    @db[:rsence_session].filter(:id => ses_id).delete
    db_close
  end

  def remove_all_session_data
    db_open
    @db[:rsence_session].delete if @db.table_exists?(:rsence_session)
    @db[:rsence_uploads].delete if @db.table_exists?(:rsence_uploads)
    db_close
  end

  def new_upload_data( data )
    db_open
    new_id = @db[:rsence_uploads].insert( data )
    db_close
    return new_id
  end

  def set_upload_data( upload_id, file_data )
    db_open
    @db[:rsence_uploads].filter(:id => upload_id).update( {
      :file_data => Sequel.blob( file_data ),
      :upload_done => true
    } )
    db_close
  end

  def get_upload_data( row_id )
    db_open
    row_datas = @db[:rsence_uploads].select(
      :upload_date, :upload_done, :file_name,
      :file_size, :file_mime, :file_data
    ).filter(
      :id => row_id
    )
    db_close
    return row_datas.first
  end

  def get_upload_meta( row_id )
    db_open
    row_datas = @db[:rsence_uploads].select(
      :upload_date, :upload_done, :file_name,
      :file_size, :file_mime
    ).filter(
      :id => row_id
    )
    db_close
    return row_datas.first
  end

  def del_upload( row_id )
    db_open
    @db[:rsence_uploads].filter( :id => row_id ).delete
    db_close
  end

  def del_uploads( ticket_id, ses_id )
    db_open
    @db[:rsence_uploads].filter( :ticket_id => ticket_id ).delete
    @db[:rsence_uploads].filter( :ses_id => ses_id ).delete
    db_close
  end

end
