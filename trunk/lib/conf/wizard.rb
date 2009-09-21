# -* coding: UTF-8 -*-
###
  # Riassence Core -- http://rsence.org/
  #
  # Copyright (C) 2008 Juha-Jarmo Heinonen <jjh@riassence.com>
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

require 'rubygems'
require 'highline/import'

require 'ext/randgen'

class ConfigWizard
  
  # returns a deep copy of source_hash using Marshal
  # (I wish there was a better way)
  def hash_deep_copy(source_hash)
    return Marshal.restore( Marshal.dump(source_hash) )
  end
  
  # returns a pound ('#') char, unless @conf and $config values differ
  def cdiff(confkeys)
    conf1 = @conf
    conf2 = $config
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
  def initialize
    @conf = hash_deep_copy( $config )
  end
  
  # returns configuration as ruby source
  def conf_data
    return %{

## Local configuration

## The base_url specifies the prefix for all default http responders, except servlets.
## NOTE: the default index_html servlet is aware of this parameter.
#{cdiff[:base_url]}$config[:base_url] = #{@conf[:base_url].inspect}


# This setting should be on, until Rack supports chunked transfers (and as such, transfer encodings for gzip)
#{cdiff([:no_gzip])}$config[:no_gzip] = #{@conf[:no_gzip].inspect}

## Enabling this appends all msg.reply call output to stdout
#{cdiff([:trace])}$config[:trace] = #{@conf[:trace].inspect}
  
## Switches on debug-mode:
##  - Generates more output
##  - Each time /hello is post-requested:
##    - Plugins are reloaded from source 
##    - GZFiles are reloaded (if more recent than in memory)
#{cdiff([:debug_mode])}$config[:debug_mode] = #{@conf[:debug_mode].inspect}


## Web server-related settings:

## HTTP Port number:
#{cdiff([:http_server,:port])}$config[:http_server][:port] = #{@conf[:http_server][:port].inspect}

## Bind this ip address ('0.0.0.0' means all)
#{cdiff([:http_server,:bind_address])}$config[:http_server][:bind_address] = #{@conf[:http_server][:bind_address].inspect}
  
## Rack handler to use
#{cdiff([:http_server,:rack_require])}$config[:http_server][:rack_require] = #{@conf[:http_server][:rack_require].inspect}


## When disabled, tries to prevent all request caching
#{cdiff([:cache_maximize])}$config[:cache_maximize] = #{@conf[:cache_maximize].inspect}

## When cache_maximize is enabled,
## this is the time (in seconds) the cached content will expire in
#{cdiff([:cache_expire])}$config[:cache_expire] = #{@conf[:cache_expire].inspect}


## Client-related paths (fileserve)

## The paths FileServe uses to load client js
#{cdiff([:client_parts,:js])}$config[:client_parts][:js] = #{@conf[:client_parts][:js].inspect}

## The paths FileServe uses to load client css and html templates
#{cdiff([:client_parts,:themes])}$config[:client_parts][:themes] = #{@conf[:client_parts][:themes].inspect}


## Paths to scan for available plugins
#{cdiff([:plugin_paths])}$config[:plugin_paths] = #{@conf[:plugin_paths].inspect}


## IndexHtml settings:

## The initial index.html page <title>
#{cdiff([:indexhtml_conf,:loading_title])}$config[:indexhtml_conf][:loading_title] = #{@conf[:indexhtml_conf][:loading_title].inspect}

## The initialized html page <title>
#{cdiff([:indexhtml_conf,:loaded_title])}$config[:indexhtml_conf][:loaded_title] = #{@conf[:indexhtml_conf][:loaded_title].inspect}


## Session-related settings

## The comment string in the session cookie
#{cdiff([:session_conf,:ses_cookie_comment])}$config[:session_conf][:ses_cookie_comment] = #{@conf[:session_conf][:ses_cookie_comment].inspect}

## Disposable keys, when enabled, changes the session id on each xhr
#{cdiff([:session_conf,:disposable_keys])}$config[:session_conf][:disposable_keys] = #{@conf[:session_conf][:disposable_keys].inspect}

## Timeout controls how long a session is valid, specify seconds
#{cdiff([:session_conf,:timeout_secs])}$config[:session_conf][:timeout_secs] = #{@conf[:session_conf][:timeout_secs].inspect}

## Key length controls the length of the random-part of the key.
## The total length is actually key length + 12 bytes, because
## the uniqueness part is 12 bytes long
#{cdiff([:session_conf,:key_length])}$config[:session_conf][:key_length] = #{@conf[:session_conf][:key_length].inspect}

## Cookie keys are this many times longer than xhr keys
#{cdiff([:session_conf,:cookie_key_multiplier])}$config[:session_conf][:cookie_key_multiplier] = #{@conf[:session_conf][:cookie_key_multiplier].inspect}

## The amount of pre-generated keys to keep
## Tweaking this might affect performance
#{cdiff([:session_conf,:buffer_size])}$config[:session_conf][:buffer_size] = #{@conf[:session_conf][:buffer_size].inspect}

## When enabled, deletes all old sessions upon server startup
#{cdiff([:session_conf,:reset_sessions])}$config[:session_conf][:reset_sessions] = #{@conf[:session_conf][:reset_sessions].inspect}

## Message strings
# if the session is invalid for one reason or another, display this:
#{cdiff([:session_conf,:messages,:invalid_session,:title])}$config[:session_conf][:messages][:invalid_session][:title] = #{@conf[:session_conf][:messages][:invalid_session][:title].inspect}
#{cdiff([:session_conf,:messages,:invalid_session,:descr])}$config[:session_conf][:messages][:invalid_session][:descr] = #{@conf[:session_conf][:messages][:invalid_session][:descr].inspect}
#{cdiff([:session_conf,:messages,:invalid_session,:uri])  }$config[:session_conf][:messages][:invalid_session][:uri  ] = #{@conf[:session_conf][:messages][:invalid_session][:uri].inspect}


## Database configuration

# The session database is required for persistent session storage.
# The database connection string for the session database is:
#{cdiff([:database,:ses_db])}$config[:database][:ses_db] = #{@conf[:database][:ses_db].inspect}

## NOTE: :root_setup and :auth_setup are deprecated.
##       They are included only for backwards compatiblity with code that depended on RSence 1.0.

#{cdiff([:database,:root_setup,:host])}$config[:database][:root_setup][:host] = #{@conf[:database][:root_setup][:host].inspect}
#{cdiff([:database,:root_setup,:user])}$config[:database][:root_setup][:user] = #{@conf[:database][:root_setup][:user].inspect}
#{cdiff([:database,:root_setup,:pass])}$config[:database][:root_setup][:pass] = #{@conf[:database][:root_setup][:pass].inspect}
#{cdiff([:database,:root_setup,:db])}$config[:database][:root_setup][:db] = #{@conf[:database][:root_setup][:db].inspect}

#{cdiff([:database,:auth_setup,:host])}$config[:database][:auth_setup][:host] = #{@conf[:database][:auth_setup][:host].inspect}
#{cdiff([:database,:auth_setup,:user])}$config[:database][:auth_setup][:user] = #{@conf[:database][:auth_setup][:user].inspect}
#{cdiff([:database,:auth_setup,:pass])}$config[:database][:auth_setup][:pass] = #{@conf[:database][:auth_setup][:pass].inspect}
#{cdiff([:database,:auth_setup,:db])}$config[:database][:auth_setup][:db] = #{@conf[:database][:auth_setup][:db].inspect}


## ValueManager settings

## Key length controls the length of the random-part of the key.
## The total length is actually key length + 12 bytes, because
## the uniqueness part is 12 bytes long
#{cdiff([:values_conf,:key_length])}$config[:values_conf][:key_length] = #{@conf[:values_conf][:key_length].inspect}
  
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
    puts "  Riassence Core runs its HTTP Server as:"
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
    puts "  Riassence Core requires a database for persistant"
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
    @conf[:database][:auth_setup][:pass] = RandGen.new(12).gen
    ask_about_db
    ask_about_httpd
    puts
    puts "Configuration done!"
    puts
    puts "Writing #{local_config_file_path.inspect}..."
    local_config_file = open( local_config_file_path, 'w' )
    local_config_file.write( conf_data )
    local_config_file.close
    require local_config_file_path[0..-4]
    puts
    puts "Revisit #{local_config_file_path} to edit these (and a lot more) settings."
    puts
  end
end


