#--
##   RSence
 #   Copyright 2008 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##
 #++


require 'rubygems'
require 'highline/import'

require 'randgen'

class ConfigWizard
  
  # returns a deep copy of source_hash using Marshal
  # (I wish there was a better way)
  def hash_deep_copy(source_hash)
    return Marshal.restore( Marshal.dump(source_hash) )
  end
  
  # returns a pound ('#') char, unless @conf and @config values differ
  def cdiff(confkeys)
    conf1 = @conf
    conf2 = @config
    # recurse into config hash
    confkeys.each do |confkey|
      conf1 = conf1[confkey]
      conf2 = conf2[confkey]
    end
    # return '' if the values differ, '#' if they are the same
    #puts "#{conf1.inspect} vs #{conf2.inspect}"
    if conf1 != conf2
      return ''
    else
      return '#'
    end
  end
  
  # makes a copy of the default configuration for comparisons
  def initialize( config )
    @config = config
    @conf = {
      :database      => hash_deep_copy( config[:database] ),
      :http_server   => hash_deep_copy( config[:http_server] )
    }
  end
  
  # asks y/n and returns boleans,
  # the default tells if which one is for just enter
  def yesno(default=false)
    if default
      question = "Y/n? "
    else
      question = "y/N? "
    end
    print question
    answer = $stdin.gets.strip.downcase[0]
    answer = answer.chr if answer
    if answer == 'n'
      return false
    elsif answer == 'y'
      return true
    elsif answer == nil
      return default
    else
      return nil
    end
  end
  
  # configuration dialog for database connectivity
  def ask_about_mysql
    puts "-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-"
    puts " MySQL configuration"
    puts 
    puts "  This feature requires an mysql account with "
    puts "  sufficient privileges of creating databases,"
    puts "  tables and users. "
    puts
    puts "  This account is used for persistent session storage "
    puts "  and it is also the default database for plugins."
    puts
    puts " The default rsence account is configured as:"
    puts
    puts " Hostname: #{@conf[:database][:auth_setup][:host].inspect}"
    puts " Username: #{@conf[:database][:auth_setup][:user].inspect}"
    puts " Password: #{@conf[:database][:auth_setup][:pass].inspect}"
    puts " Database: #{@conf[:database][:auth_setup][:db].inspect}"
    puts " Port: #{@conf[:database][:auth_setup][:port].inspect}"
    puts
    print " Correct, "
    is_correct = nil
    is_correct = yesno(true) until is_correct != nil
    unless is_correct
      @conf[:database][:auth_setup][:host] = ask("Hostname (or IP address)?") do |q|
        q.default = @conf[:database][:auth_setup][:host]
      end
      @conf[:database][:auth_setup][:user] = ask("Username?") do |q|
        q.default = @conf[:database][:auth_setup][:user]
      end
      @conf[:database][:auth_setup][:pass] = ask("Password?") do |q|
        q.default = @conf[:database][:auth_setup][:pass]
      end
      @conf[:database][:auth_setup][:db] = ask("Database?") do |q|
        q.default = @conf[:database][:auth_setup][:db]
      end
      @conf[:database][:auth_setup][:port] = ask("Port?") do |q|
        q.default = @conf[:database][:auth_setup][:port]
      end
    end
    puts
    print " Re-edit these settings, "
    re_edit = yesno(false) until re_edit != nil
    if re_edit
      ask_about_mysql
    else
      db_auth = @conf[:database][:auth_setup]
      return "mysql://#{db_auth[:user]}:#{db_auth[:pass]}@#{db_auth[:host]}:#{db_auth[:port]}/#{db_auth[:db]}"
    end
  end
  
  # configuration dialog for the web server
  def ask_about_httpd
    puts "-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-"
    puts " HTTP Server configuration"
    puts 
    puts "  RSence runs its HTTP Server as:"
    puts
    puts "  Server: #{@conf[:http_server][:rack_require].inspect}"
    puts " Address: #{@conf[:http_server][:bind_address].inspect}"
    puts "    Port: #{@conf[:http_server][:port].inspect}"
    puts
    puts
    print " Correct, "
    is_correct = yesno(true) until is_correct != nil
    unless is_correct
      server_type = ''
      until ['mongrel','webrick','thin','ebb'].include?(server_type)
        server_type = ask("Server Type? (valid: mongrel, webrick, thin, ebb)") do |q|
          q.default = @conf[:http_server][:rack_require]
        end
      end
      @conf[:http_server][:rack_require] = server_type
      @conf[:http_server][:bind_address] = ask("Address? (0.0.0.0 binds to all)") do |q|
        q.default = @conf[:http_server][:bind_address]
      end
      @conf[:http_server][:port] = ask("Port number?") do |q|
        q.default = @conf[:http_server][:port]
      end
    end
  end
  
  def file_ok?(path)
    return false if path == ''
    if File.exist?(File.split(path)[0])
      if File.directory?(File.split(path)[0])
        if File.writable?(File.split(path)[0])
          if File.exist?(path)
            if File.file?(path)
              return true if File.writable?(path) and File.readable?(path)
              puts " Invalid path; #{path} is not writable or readable."
              return false
            end
            puts " Invalid path; #{path} exists and is not a file."
            return false
          end
          return true
        end
        puts " Invalid path; the directory #{File.split(path)[0]} is not writable."
        return false
      end
      puts " Invalid path; the parent directory #{File.split(path)[0]} is not a directory."
      return false
    end
    puts " Invalid path; the parent directory #{File.split(path)[0]} does not exist."
    return false
  end
  
  def ask_about_sqlite
    sqlite_path = File.join(SERVER_PATH,'var','db','rsence_ses.db')
    puts "-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-"
    puts " SQLite database configuration"
    puts
    puts "  SQLite is configured using file names. The default is:"
    puts "  #{sqlite_path.inspect}"
    puts
    print " Correct, "
    is_correct = yesno(true) until is_correct != nil
    unless is_correct
      new_sqlite_path = ''
      until file_ok?(new_sqlite_path)
        new_sqlite_path = ask(" Database file path? ") do |q|
          q.default = sqlite_path
        end
      end
      sqlite_path = new_sqlite_path
    end
    return "sqlite://#{sqlite_path}"
  end
  
  def ask_about_other_db( other_db_string = '' )
    puts "-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-"
    puts " All Sequel-compatible database drivers are supported."
    puts
    puts "  To configure another database engine, please enter a db url."
    puts "  The format is usually: 'engine://username:password@host:port/database_name'"
    puts "  For more details, see: http://sequel.rubyforge.org/rdoc/files/doc/opening_databases_rdoc.html"
    puts
    input_db_string = ''
    until input_db_string != ''
      input_db_string = ask(" Database connection string: ") do |q|
        q.default = other_db_string
      end
    end
    other_db_string = input_db_string
    print "Correct, "
    is_correct = yesno(true) until is_correct != nil
    if is_correct
      return other_db_string
    else
      ask_about_other_db( other_db_string )
    end
  end
  
  def ask_about_db
    puts "-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-"
    puts " Session database configuration"
    puts
    puts "  RSence requires a database for persistant"
    puts "  session storage. This feature allows the server"
    puts "  to be restarted without losing user sessions."
    puts
    puts " The default database engine is SQLite."
    puts
    puts " Select one of the following:"
    puts "   1 - SQLite"
    puts "   2 - MySQL"
    puts "   3 - Other (custom Sequel database url)"
    db_type = ''
    until ['1','2','3'].include?(db_type)
      db_type = ask("Database engine? ") do |q|
        q.default = '1'
      end
    end
    if db_type == '1'
      db_connection_string = ask_about_sqlite
    elsif db_type == '2'
      db_connection_string = ask_about_mysql
    elsif db_type == '3'
      db_connection_string = ask_about_other_db
    end
    puts
    puts " The database connection string is:"
    puts "  #{db_connection_string}"
    puts
    print " Correct, "
    db_ok = yesno(true) until db_ok != nil
    if not db_ok
      ask_about_db
    else
      @conf[:database][:ses_db] = db_connection_string
    end
  end
  
  def run( local_config_file_path )
    puts
    puts
    puts "-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-"
    puts " This RSence instance is not configured."
    puts
    puts " To configure, create a configuration file:"
    puts "  #{local_config_file_path}"
    puts
    puts " You may also answer a few simple questions to create"
    puts " a configuration file template."
    puts
    print " Do you want to run the configuration tool, "
    configure_now = yesno(true) until configure_now != nil
    unless configure_now
      puts
      puts " OK. No configuration at this time. Can't continue; exit."
      exit
    end
    ask_about_db
    ask_about_httpd
    puts
    puts "Configuration done!"
    puts
    puts "Writing #{local_config_file_path.inspect}..."
    f = File.open( local_config_file_path, 'w' )
    f.write( YAML.dump( @conf ) )
    f.close
    puts
    puts "Edit #{local_config_file_path} to change the configuration."
    puts
    return @conf
  end
end


