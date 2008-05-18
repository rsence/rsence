###
  # Himle Server -- http://himle.org/
  #
  # Copyright (C) 2008 Juha-Jarmo Heinonen
  #
  # This file is part of Himle Server.
  #
  # Himle Server is free software: you can redistribute it and/or modify
  # it under the terms of the GNU General Public License as published by
  # the Free Software Foundation, either version 3 of the License, or
  # (at your option) any later version.
  #
  # Himle server is distributed in the hope that it will be useful,
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

require 'util/randgen'

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

# This setting should be on, until Rack supports chunked transfers (and as such, transfer encodings for gzip)
#{cdiff([:no_gzip])}$config[:no_gzip] = #{@conf[:no_gzip].inspect}

## Enabling this appends all msg.reply call output to stdout
#{cdiff([:trace])}$config[:trace] = #{@conf[:trace].inspect}
  
## Path to the server root (containing lib, rsrc etc..)
#{cdiff([:dir_root])}$config[:dir_root] = #{@conf[:dir_root].inspect}

## Path to the client root (containing js and themes dirs)
#{cdiff([:client_root])}$config[:client_root] = #{@conf[:client_root].inspect}

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


## Old param, essentially always the same as SERVER_PATH
#{cdiff([:sys_path])}$config[:sys_path] = #{@conf[:sys_path].inspect}


## Paths to scan for available plugins
#{cdiff([:plugin_paths])}$config[:plugin_paths] = #{@conf[:plugin_paths].inspect}


## Transporter settings:

## Message strings
# If the client fails on javascript, display this:
#{cdiff([:transporter_conf,:messages,:client_error,:title])}$config[:transporter_conf][:messages][:client_error][:title] = #{@conf[:transporter_conf][:messages][:client_error][:title].inspect}
#{cdiff([:transporter_conf,:messages,:client_error,:descr])}$config[:transporter_conf][:messages][:client_error][:descr] = #{@conf[:transporter_conf][:messages][:client_error][:descr].inspect}
#{cdiff([:transporter_conf,:messages,:client_error,:uri])}$config[:transporter_conf][:messages][:client_error][:uri] = #{@conf[:transporter_conf][:messages][:client_error][:uri].inspect}


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

# root_setup should ideally have permissions
# to create the auth_setup account and database,
# but if the access fails, it'll fall back to
# auth_setup, if it's created manually
#{cdiff([:database,:root_setup,:host])}$config[:database][:root_setup][:host] = #{@conf[:database][:root_setup][:host].inspect}
#{cdiff([:database,:root_setup,:user])}$config[:database][:root_setup][:user] = #{@conf[:database][:root_setup][:user].inspect}
#{cdiff([:database,:root_setup,:pass])}$config[:database][:root_setup][:pass] = #{@conf[:database][:root_setup][:pass].inspect}
#{cdiff([:database,:root_setup,:db])}$config[:database][:root_setup][:db] = #{@conf[:database][:root_setup][:db].inspect}
  
# auth_setup is the mysql connection himle uses
# to handle session tables. It's obligatory.
#{cdiff([:database,:auth_setup,:host])}$config[:database][:auth_setup][:host] = #{@conf[:database][:auth_setup][:host].inspect}
#{cdiff([:database,:auth_setup,:user])}$config[:database][:auth_setup][:user] = #{@conf[:database][:auth_setup][:user].inspect}
#{cdiff([:database,:auth_setup,:pass])}$config[:database][:auth_setup][:pass] = #{@conf[:database][:auth_setup][:pass].inspect}
#{cdiff([:database,:auth_setup,:db])}$config[:database][:auth_setup][:db] = #{@conf[:database][:auth_setup][:db].inspect}


## ValueManager settings

## Key length controls the length of the random-part of the key.
## The total length is actually key length + 12 bytes, because
## the uniqueness part is 12 bytes long
#{cdiff([:values_conf,:key_length])}$config[:values_conf][:key_length] = #{@conf[:values_conf][:key_length].inspect}
  
## The amount of pre-generated keys to keep
## Tweaking this might affect performance
#{cdiff([:values_conf,:buffer_size])}$config[:values_conf][:buffer_size] = #{@conf[:values_conf][:buffer_size].inspect}

## Disposable keys, when enabled, changes the value id on each session restoration
#{cdiff([:values_conf,:disposable_keys])}$config[:values_conf][:disposable_keys] = #{@conf[:values_conf][:disposable_keys].inspect}

## Message strings
    
# this message is for version mismatches in hsyncvalues
#{cdiff([:values_conf,:messages,:version_mismatch,:title])}$config[:values_conf][:messages][:version_mismatch][:title] = #{@conf[:values_conf][:messages][:version_mismatch][:title].inspect}
#{cdiff([:values_conf,:messages,:version_mismatch,:descr])}$config[:values_conf][:messages][:version_mismatch][:descr] = #{@conf[:values_conf][:messages][:version_mismatch][:descr].inspect}
#{cdiff([:values_conf,:messages,:version_mismatch,:uri])  }$config[:values_conf][:messages][:version_mismatch][:uri  ] = #{@conf[:values_conf][:messages][:version_mismatch][:uri].inspect}
  
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
    puts " Database configuration"
    puts 
    puts "  Himle should ideally have permissions"
    puts "  to create the the himle account and database."
    puts
    puts "  This feature requires an mysql account with "
    puts "  sufficient privileges of creating databases,"
    puts "  tables and users. "
    puts
    puts " The default root account is configured as:"
    puts
    puts " Hostname: #{@conf[:database][:root_setup][:host].inspect}"
    puts " Username: #{@conf[:database][:root_setup][:user].inspect}"
    puts " Password: #{@conf[:database][:root_setup][:pass].inspect}"
    puts " Database: #{@conf[:database][:root_setup][:db].inspect}"
    puts
    print " Correct, "
    is_correct = yesno(true) until is_correct != nil
    unless is_correct
      @conf[:database][:root_setup][:host] = ask("MySQL Root Hostname (or IP address)?") do |q|
        q.default = @conf[:database][:root_setup][:host]
      end
      @conf[:database][:root_setup][:user] = ask("MySQL Root Username?") do |q|
        q.default = @conf[:database][:root_setup][:user]
      end
      @conf[:database][:root_setup][:pass] = ask("MySQL Root Password?") do |q|
        q.default = @conf[:database][:root_setup][:pass]
      end
      @conf[:database][:root_setup][:db] = ask("MySQL Root Database?") do |q|
        q.default = @conf[:database][:root_setup][:db]
      end
    end
    puts
    puts "  The Himle account is used for Himle session storage "
    puts "  and is also the default database for plugins."
    puts
    puts "  It runs in restricted mode and will be created automatically."
    puts
    puts " The default himle account is configured as:"
    puts
    puts " Hostname: #{@conf[:database][:auth_setup][:host].inspect}"
    puts " Username: #{@conf[:database][:auth_setup][:user].inspect}"
    puts " Password: #{@conf[:database][:auth_setup][:pass].inspect}"
    puts " Database: #{@conf[:database][:auth_setup][:db].inspect}"
    puts
    print " Correct, "
    is_correct = nil
    is_correct = yesno(true) until is_correct != nil
    unless is_correct
      @conf[:database][:auth_setup][:host] = ask("MySQL Himle Hostname (or IP address)?") do |q|
        q.default = @conf[:database][:auth_setup][:host]
      end
      @conf[:database][:auth_setup][:user] = ask("MySQL Himle Username?") do |q|
        q.default = @conf[:database][:auth_setup][:user]
      end
      @conf[:database][:auth_setup][:pass] = ask("MySQL Himle Password?") do |q|
        q.default = @conf[:database][:auth_setup][:pass]
      end
      @conf[:database][:auth_setup][:db] = ask("MySQL Himle Database?") do |q|
        q.default = @conf[:database][:auth_setup][:db]
      end
    end
    puts
    print " Re-edit these settings, "
    re_edit = yesno(false) until re_edit != nil
    ask_about_mysql if re_edit
  end
  
  # configuration dialog for the web server
  def ask_about_httpd
    puts "-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-"
    puts " HTTP Server configuration"
    puts 
    puts "  Himle runs its HTTP Server as:"
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
      until ['mongrel','webrick'].include?(server_type)
        server_type = ask("Server Type? (valid: mongrel, webrick)") do |q|
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
  
  def run( local_config_file_path )
    @conf[:database][:auth_setup][:pass] = RandomGenerator.new(12,1).get_one
    ask_about_mysql
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


