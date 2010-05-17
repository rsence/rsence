##   RSence
 #   Copyright 2009 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##

module ::RSence
module Plugins
# Include this module in your plugin class to automatically
# create and connect/disconnect an sqllite database.
# The plugin instance will have a @db Sequel object refering
# to the sqlite database automatically created
module PluginSqliteDB
  
  # First calls superclass, then creates database directory and database.
  # Then calls init_db_tables.
  def init
    super
    db_dir = File.join( @path, 'db' )
    unless File.directory?( db_dir )
      Dir.mkdir( db_dir )
    end
    @db_path = File.join( db_dir, "#{@name}.db" )
    unless File.exist?( @db_path )
      @db = Sequel.sqlite( @db_path )
      create_db_tables
      @db.disconnect
    end
    
  end
  
  # Automatically opens the database connection, then calls update_db.
  def open
    @db = Sequel.sqlite( @db_path )
    update_db
    super
  end
  
  # Automatically closes (disconnects) the database. Calls flush_db before closing.
  def close
    flush_db
    @db.disconnect
    super
  end
  
  # Extend this method to do something immediately after the @db object is assigned.
  # An usage scenario would be updating some tables or deleting some junk rows.
  def update_db
  end
  
  # Extend this method to do something immediately before the @db object is disconnected.
  # An usage scenario would be deleting some junk rows or writing some pending data in memory into the database.
  def flush_db
  end
  
  # Extend this method to define tables or initial data for the tables.
  # It's called once, when the database is created.
  #
  # NOTE: In a future reversion, tables might be defined from a configuration file.
  #
  # = Usage:
  #   @db.create_table :my_table do
  #     primary_key :id
  #     String :my_text_column
  #   end
  #   my_table = @db[:my_table]
  #   my_table.insert(:my_text_column => 'Some text')
  # 
  def create_db_tables
  end
end

end
end
