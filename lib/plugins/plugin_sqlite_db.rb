##   RSence
 #   Copyright 2009 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##


module RSence
  
  
  module Plugins
    
    
    # Include this module in your plugin class to automatically create, update and connect/disconnect a sqlite database file.
    #
    # The Plugin instances including this module will have a +@db+ Sequel[http://sequel.rubyforge.org/] object referring to the sqlite database automatically created.
    #
    module PluginSqliteDB
      
      # Extends {Plugin__#init Plugin#init} to specify +@db_path+ as the name of the bundle with a +.db+ suffix in the project environment +db+ path.
      #
      # Calls {#create_db_tables} (extend with your own method), if no database is found (typically on the first run in an environment)
      #
      # @example If your plugin bundle is named +my_app+, a +db/my_app.db+ database is created under your project environment.
      #
      # @return [nil]
      def init
        super
        db_dir = File.join( RSence.args[:env_path], 'db' )
        @db_path = File.join( db_dir, "#{@name}.db" )
        unless File.exist?( @db_path )
          @db = Sequel.sqlite( @db_path )
          create_db_tables
          @db.disconnect
        end
      end
      
      # Extends {PluginUtil#open PluginUtil#open} to open the sqlite database from +@db_path+ as a +@db+ instance variable.
      #
      # Calls {#update_db} (extend with your own method) after the database object is created.
      #
      # @return [nil]
      def open
        @db = Sequel.sqlite( @db_path )
        update_db
        super
      end
      
      # Extends {PluginUtil#close PluginUtil#close} to close (disconnect) the database object.
      #
      # Calls {#flush_db} (extend with your own method) before closing the database object.
      #
      # @return [nil]
      def close
        flush_db
        @db.disconnect
        super
      end
      
      # Extend this method to do something immediately after the +@db+ object is created.
      #
      # An usage scenario would be updating some tables or deleting some junk rows.
      #
      # @return [nil]
      def update_db
      end
      
      # Extend this method to do something immediately before the +@db+ object is disconnected.
      #
      # An usage scenario would be deleting some junk rows or writing some pending data in memory into the database.
      #
      # @return [nil]
      def flush_db
      end
      
      # Extend this method to define tables or initial data for the tables.
      # It's called once, when the database is created.
      #
      # @example Creates a table named +:my_table+ and inserts one row.
      #   def create_db_tables
      #     @db.create_table :my_table do
      #       primary_key :id
      #       String :my_text_column
      #     end
      #     my_table = @db[:my_table]
      #     my_table.insert(:my_text_column => 'Some text')
      #   end
      #
      # @return [nil]
      def create_db_tables
      end
      
    end
    
  end
end
