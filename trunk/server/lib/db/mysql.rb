
### ROXOR MySQL Abstractor
##  by  Juha-Jarmo Heinonen (otus@olen.to)
##
## (c) 2003-2005 Juha-Jarmo Heinonen, All Rights Reserved
###

require "dbi"

### Database abstraction

=begin

db/MySQL Quick API

 class MySQL(
                host[str],     <-= hostname/ip
                user[str],     <-= db username
                pass[str],     <-= db password
                debe[str]      <-= database (optional)
   ):
   hash-array/int q(qu[str])  <-= Returns the results of the query string (or row id)
   nil close_conn             <-= Close connections
   str-array dbs              <-= Return names of available databases
   nil db(nimi[str])          <-= Connect to / Create new database (new if not avail)
   
=end


class MySQL
  
  ## Init with the database name
  def initialize( setup )
    
    @host = setup[:host]  # Sets the host name as a instance variable
    @user = setup[:user]  # Sets the database username as a instance variable
    @pass = setup[:pass]  # Sets the database password as a instance variable
    @debe = setup[:db]  # Sets the database name as a instance variable
    
    @conn = false # The connection is opened only when needed
    
  end
  
  ### Close database connection
  def open_conn
    begin
      # Don't open if already open or no database specified
      if not @conn and @debe
        # The second parameter is the mode, which is unused; use 0!
        @conn = DBI.connect("DBI:Mysql:#{@debe}:#{@host}",@user,@pass)
        return true
      end
    rescue DBI::DatabaseError
      # simply reconnect on failure
      @conn = DBI.connect("DBI:Mysql:#{@debe}:#{@host}",@user,@pass)
      return true
    end
  end
  
  ### Close database connection
  def close_conn
    begin
      @conn.disconnect if @conn # Close only when a connection is open
    rescue DBI::DatabaseError
    end
    @conn = false
  end
  
  ### Return databases
  def dbs
    if @conn
      databases = q("show databases")
      return databases
    else
      return false
    end
  end
  
  ### Change/Create database
  def db(nimi=false)
    if nimi
      luo_uusi = true
      for kanta in dbs()
        if kanta == nimi
          luo_uusi = false
        end
      end
      if luo_uusi == true
        @conn.func(:createdb,nimi)
      end
      close_conn
      @debe = nimi
      open_conn
      return true
    else
      return false
    end
  end
  
  ### Perform a database query
  def q(qu,ignore_cache=false)
    get_id = false  # we are not inserting anything by default
    
    ## get the keyword of the query
    action = qu.split(' ')[0].downcase
    
    ## these are keywords that modify data
    inserters = ['insert','update','delete','replace','create']
    
    ## check if we are going to change something
    get_id = true if inserters.include?(action)
    
    ## open the connection if it's not opened earlier
    open_conn() if not @conn
    
    if get_id
      ## we are modifying something
      begin
        @conn.execute(qu)
      rescue
        ## if that fails, the probable cause was disconnection
        ## by timeout, so lets reconnect:
        close_conn
        open_conn
        @conn.execute(qu)
      end
      ## get the new row id if it was created
      return @conn.func(:insert_id)
      
    elsif @debe
      ## Well.. we are getting getting data.
      begin
        rows = []
        begin
          quo = @conn.execute(qu)
        rescue
          close_conn
          open_conn
          quo = @conn.execute(qu)
        end
        quo.fetch_hash() do |row|
          rows.push( row.clone ) if row != nil
        end
        
        ## return fetched data
        return rows.clone
      end
    else
      ## something failed
      return false
    end
  end
end

