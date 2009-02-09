# -* coding: UTF-8 -*-
###
  # Riassence Core -- http://rsence.org/
  #
  # Copyright 2003, 2004, 2005, 2007, 2008 Juha-Jarmo Heinonen <jjh@riassence.com>
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


### ROXOR MySQL Abstractor
require "rubygems"
gem "dbi", ">= 0.4.0"
require "dbi"
DBI.convert_types = true

class Status_TBL
  attr_reader :name, :rows, :size_avg, :size, :last_id, :created, :modified, :comment
  def string2time(datetime_str)
    # "2008-07-25 17:51:24"
    (date_str,time_str) = datetime_str.split(' ')
    split_date = date_str.split('-')
    split_time = time_str.split(':')
    year = split_date[0].to_i
    month = split_date[1].to_i
    day = split_date[2].to_i
    hour = split_time[0].to_i
    minute = split_time[1].to_i
    second = split_time[2].to_i
    return Time.gm(year,month,day,hour,minute,second)
  end
  def datetime2time(datetime)
    return Time.gm(datetime.year,datetime.month,datetime.mday,datetime.hour,datetime.min,datetime.sec)
  end
  def initialize(row)
    @name     = row['Name']
    @rows     = row['Rows'].to_i
    @size_avg = row['Avg_row_length'].to_i
    @size     = row['Data_length'].to_i
    @last_id  = row['Auto_increment'].to_i
    ct = row['Create_time']
    if ct == nil
      @created = 0
    elsif ct.class == DateTime
      @created = datetime2time(ct).to_i
    elsif ct.class == String 
      @created = string2time(ct).to_i
    else
      creat = Time.gm(ct.year,ct.month,ct.day,ct.hour,ct.minute,ct.second)
      @created  = creat.to_i
    end
    mt  = row['Update_time']
    if mt == nil
      @modified = 0
    elsif ct.class == DateTime
      @modified = datetime2time(mt).to_i
    elsif ct.class == String 
      @modified = string2time(mt).to_i
    else
      modit = Time.gm(mt.year,mt.month,mt.day,mt.hour,mt.minute,mt.second)
      @modified = modit.to_i
    end
    @comment  = row['Comment']
  end
end

class Status_DB
  attr_reader :size, :created, :modified, :name
  def initialize(size,modified,created,name)
    @size       = size
    @modified   = modified
    @created    = created
    @name       = name
  end
end

class MySQL_UTF8_Util
  
  def is_database_utf8?(db_name)
    return @db.q("show create database #{db_name}")[0]['Create Database'].downcase.include?('set utf8')
  end
  
  def is_table_utf8?(table_name)
    return @db.q("show create table #{table_name}")[0]['Create Table'].downcase.include?('charset=utf8')
  end

  def convert_charset(string,in_charset='ISO-8859-1',out_charset='UTF-8')
    return Iconv.iconv(out_charset,in_charset,string)[0]
  end
  
  def convert_table_to_utf8( table_name, column_names )
    puts "Checking if #{table_name} needs update" if $DEBUG_MODE
    @db.q( "show full columns from #{table_name}" ).each do |descr_row|
      col_name = descr_row['Field']
      col_type = descr_row['Type']
      collation = descr_row['Collation']
      if column_names.include?(col_name) and not collation.include?('utf8')
        puts "..upgrading column #{col_name}" if $DEBUG_MODE
        col_null = descr_row['Null']
        if col_null == "YES"
          col_null = "NULL"
        else
          col_null = "NOT NULL"
        end
        col_default = descr_row['Default']
        if col_default == nil and col_null == 'NOT NULL'
          col_default = ''
        elsif col_default == ''
          col_default = "default ''"
        elsif col_default == nil
          col_default = 'default NULL'
        else
          col_default = "default #{hexlify(col_default)}"
        end
        puts "....converting data" if $DEBUG_MODE
        row_by_id = {}
        @db.q("select id,#{col_name} from #{table_name}").each do |row|
          row_id = row['id']
          row_data = row[col_name]
          if row_data != nil
            row_by_id[row_id] = convert_charset(row_data)
          end
        end
        @db.q("alter table #{table_name} change #{col_name} #{col_name} #{col_type} character set utf8 #{col_null} #{col_default}")
        row_by_id.each do |row_id,row_data|
          if row_data != ''
            @db.q("update #{table_name} set #{col_name} = #{hexlify(row_data)} where id = #{row_id}")
          end
        end
      end
    end
    if not is_table_utf8?(table_name)
      @db.q( "alter table #{table_name} default charset utf8 collate utf8_general_ci" )
    end
  end
  
  def initialize(db)
    @db = db
  end
  
  def convert_database_to_utf8( db_name )
    @db.q( "alter database #{db_name} default character set utf8 collate utf8_general_ci" )
  end
  
  ## Utility method for converting strings to hexadecimal
  def hexlify( str )
    "0x#{str.unpack('H*')[0]}"
  end
  
end

class MySQLAbstractor
  def initialize(conf,db_name)
    (@host,@user,@pass,@debe) = [conf[:host],conf[:user],conf[:pass],db_name]
    if conf.has_key?(:charset)
      @charset = conf[:charset]
    else
      @charset = 'utf8'
    end
    @conn_retry = 0
    @conn_retry_max = 2
    if conf.has_key?(:port)
      @port = conf[:port]
    else
      @port = 3306
    end
    @conn = false
  end
  def open
    begin
      if not @conn and @debe
        @conn = DBI.connect("DBI:Mysql:database=#{@debe};host=#{@host};port=#{@port}",@user,@pass)
        @conn.do("set names #{@charset}")
        @conn_retry = 0
        return true
      end
    rescue DBI::DatabaseError => e
      puts "=="*40 if $DEBUG_MODE
      puts "WARN: MySQLAbstractor:open; failed to connect, retrying..."
      if $DEBUG_MODE
        puts "--"*40
        puts "hostname: #{@host.inspect}"
        puts "username: #{@user.inspect}"
        puts "password: #{@pass.inspect}"
        puts "database: #{@debe.inspect}"
        puts " portnum: #{@port.inspect}"
        puts e.message
        puts "  #{e.backtrace.join("\n  ")}"
        puts "=="*40
      end
      @conn_retry += 1
      if @conn_retry <= @conn_retry_max
        # using 'self.' for clarity
        self.open()
        self.db(@debe)
      end
      return true
    end
  end
  def close
    begin
      @conn.disconnect if @conn # Close only when a connection is open
    rescue DBI::DatabaseError
      puts "WARN: DBConn.close; unable to close connection (@debe:#{@debe.inspect},@host:#{@host.inspect})"
    end
    @conn = false
  end
  def dbs
    open unless @conn
    if @conn
      databases = []
      q("show databases").each do |database|
        databases.push(database['Database'])
      end
      return databases.sort
    else
      return false
    end
  end
  def tables
    open if not @conn
    table_names = []
    q("show tables").each do |table_name_hsh|
      table_names.push(table_name_hsh[table_name_hsh.keys[0]])
    end
    return table_names.sort
  end
  def db(db_name=false)
    open unless @conn
    if db_name
      unless dbs.include?(db_name)
        $stderr.write("Note: creating database #{db_name.inspect}\n")
        #@conn.func(:createdb,db_name)
        @conn.execute("create database #{db_name}")
      end
      close
      @debe = db_name
      open
      return true
    else
      return false
    end
  end
  def status
    open if not @conn
    quo = @conn.execute("show table status")
    status_tbl = {}
    total_bytes = 0
    modified_db = 0
    created_db = 2**32
    quo.fetch_hash do |row|
      table_info = Status_TBL.new(row)
      status_tbl[table_info.name] = table_info
      modified_db = table_info.modified if modified_db < table_info.modified
      created_db  = table_info.created  if created_db > table_info.created
      total_bytes += table_info.size
    end
    status_db = Status_DB.new(total_bytes,modified_db,created_db,@debe)
    return [status_db,status_tbl]
  end
  def trans(qu_a)
    @conn['AutoCommit'] = false
    begin
      qu_a.each do |qu|
        @conn.do( qu )
      end
      @conn.commit
    rescue
      puts "query failure: #{qu_a.inspect}"
      @conn.rollback
    end
    @conn['AutoCommit'] = true
  end
  def q(qu)
    action = qu.split(' ')[0].downcase
    inserters = ['insert']
    updaters  = ['update','delete','replace','create','grant','drop','flush','alter']
    get_id = inserters.include?(action)
    get_count = updaters.include?(action)
    open() if not @conn
    if get_id
      begin
        @conn.do(qu)
      rescue
        puts "=="*40 if $DEBUG_MODE
        puts "WARN: MySQLAbstractor:q; failed query, retrying..."
        begin
          close
          open
          @conn.do(qu)
        rescue => e
          if $DEBUG_MODE
            puts "--"*40
            puts "query: #{qu.inspect}"
            puts e.message
            puts "  #{e.backtrace.join("\n  ")}"
            puts "=="*40
          else
            puts "...retry failed!"
            raise
          end
        end
      end
      return @conn.func(:insert_id)
    elsif get_count
      begin
        return @conn.do(qu) # matched row count
      rescue => e
        puts "=="*40 if $DEBUG_MODE
        puts "WARN: MySQLAbstractor:q; failed query, retrying..."
        begin
          close
          open
          return @conn.do(qu)
        rescue => e
          if $DEBUG_MODE
            puts "--"*40
            puts "query: #{qu.inspect}"
            puts e.message
            puts "  #{e.backtrace.join("\n  ")}"
            puts "=="*40
            raise
          else
            puts "...retry failed!"
            raise
          end
        end
      end
    elsif @debe
      begin
        begin
          quo = @conn.execute(qu)
        rescue => e
          puts "=="*40 if $DEBUG_MODE
          puts "WARN: MySQLAbstractor:q; failed query, retrying..."
          begin
            close
            open
            quo = @conn.execute(qu)
          rescue => e
            if $DEBUG_MODE
              puts "--"*40
              puts "query: #{qu.inspect}"
              puts e.message
              puts "  #{e.backtrace.join("\n  ")}"
              puts "=="*40
              raise
            else
              puts "...retry failed!"
              raise
            end
          end
        end
        return fetch_hash_array( quo )
      end
    else
      $stderr.write("ERROR: DBConn.q; unknown query type (qu.inspect)\n")
      return false
    end
  end
  def fetch_hash_array(quo)
    col_names = quo.column_names
    rows_arr  = quo.fetch_all()
    rows = []
    rows_arr.each do |row|
      row_hash = {}
      col_names.size.times do |col_num|
        col_name = col_names[ col_num ]
        row_hash[ col_name ] = row[col_num]
      end
      rows.push( row_hash )
    end
    return rows
  end
end






