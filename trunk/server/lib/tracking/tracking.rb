

module Himle
module Server
module Tracking
  
  class Main
    
    def setup_db
      
      unless @db.tables.include?('himle_tracking')
        puts "Creating tracking table"
      
        ### Primary table for tracking mode
        #
        #  Column descriptions of himle_tracking
        #
        #  Name             Description
        #
        #  id               The primary row id: unique integer serial 
        #  ses_id           The session's id
        #  user_id          The user's id
        #  action_type      The action type, see table: himle_tracking_action_types
        #  action_id        The row id of the action, relative to the table used
        #  time_started_ms  The time (epoch milliseconds when the action started)
        #  time_elapsed_ms  The time taken for the action (in milliseconds)
        #  data             Custom data for action
        #  data_bytes       Size of custom data for action
        #  cpu_load_x_100   CPU load at the end of the action, multiplied by 100
        #
        @db.q( %{
          create table himle_tracking (
            id int primary key auto_increment,
            ses_id          int not null default 0,
            user_id         int not null default 0,
            action_type     int not null default 0,
            action_id       int not null default 0,
            time_started_ms int not null default 0,
            time_elapsed_ms int not null default 0,
            cpu_load_x_100  smallint
          ) default charset utf8
        }.gsub("\n",' ').squeeze(' ') )
      end
      
      unless @db.tables.include?('himle_tracking_actions')
        puts "Creating tracking actions table"
        
        ### Action description table for tracking mode
        #
        #  Column descriptions of himle_tracking
        #
        #  Name         Description
        #  id           The primary row id: unique integer, same as himle_tracking: action_type
        #  description  Human-readable description of action
        #  action_table Table name of the action
        @db.q( %{
          create table himle_tracking_actions (
            id           int primary key unique,
            description  varchar(255) not null character set utf8,
            action_table varchar(255) not null character set utf8
          ) default charset utf8
        }.gsub("\n",' ').squeeze(' ') )
      end
      
    end
    
    def setup_mysql
    end
    
    def setup_pluginamanager
    end
    
    def setup_session
    end
    
    def setup_ticketserve
    end
    
    def setup_transporter
    end
    
    def setup_valuemanager
    end
    
    def setup_msg
    end
    
    def setup_broker
    end
    
    def setup_fileserve
    end
    
    def setup_hvalue
    end
    
    def setup_index
    end
    
    def setup_actions
      setup_mysql         if @config[:enable_mysql]
      setup_pluginmanager if @config[:enable_pluginmanager]
      setup_session       if @config[:enable_session]
      setup_ticketserve   if @config[:enable_ticketserve]
      setup_transporter   if @config[:enable_transporter]
      setup_valuemanager  if @config[:enable_valuemanager]
      setup_msg           if @config[:enable_msg]
      setup_broker        if @config[:enable_broker]
      setup_fileserve     if @config[:enable_fileserve]
      setup_hvalue        if @config[:enable_hvalue]
      setup_index         if @config[:enable_index]
    end
    
    def initialize( db )
      @db = db
      @config = $config[:tracking]
      if @config[:enabled]
        setup_db
        setup_actions
      end
    end
    
  end
  
end
end
end

