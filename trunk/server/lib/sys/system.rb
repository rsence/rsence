###
  # HIMLE RIA Server
  # Copyright (C) 2008 HIMLE GROUP http://himle.sorsacode.com/
  # Copyright (C) 2006-2007 Helmi Technologies Inc.
  #  
  #  This program is free software; you can redistribute it and/or modify it under the terms
  #  of the GNU General Public License as published by the Free Software Foundation;
  #  either version 2 of the License, or (at your option) any later version. 
  #  This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
  #  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
  #  See the GNU General Public License for more details. 
  #  You should have received a copy of the GNU General Public License along with this program;
  #  if not, write to the Free Software Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
  ###
  
  
require 'lib/app/application'

# HSystem manages applications and delegates messages to and 
# between them to respond to messages.
class HSystem
  
  # hash of registered message prefixes and associated applications
  @@apps = Hash.new

  # dirlist:: array of directories to scan for available applications
  #
  # Creates a new application handler, scans for available applications in +dirlist+
  def initialize(dirlist)
    @@curr_app_path = nil
    @dirs = dirlist
    scan
  end
  
  # Access to the list of applications
  def HSystem.apps
    return @@apps
  end
  
  # Application module access to its own path
  def HSystem.curr_app_path
    return @@curr_app_path
  end
  
  # Loads applicotions from the list of application directories.
  def scan
    dirs = @dirs
    dirs.each do |appdir|
      if(FileTest.directory?(appdir))
        d = Dir.new(appdir)
        d.sort.each do |appname|
          next if(appname =~ /^\./)
          
          @@curr_app_path = File.join(appdir,appname)
          
          next unless(FileTest.directory?(@@curr_app_path))
          
          filename = File.join(@@curr_app_path,"#{appname}.rb")
          
          next if File.exist?(File.join(@@curr_app_path,'disabled'))
          
          # Create a new, anonymous module as the application namespace.
          app_module = Module.new
          
          begin
            app_as_string = IO.readlines( filename ).join
            app_module.module_eval( app_as_string )
          rescue
            puts "WARN: Application #{appname} failed to initialize (#{@@curr_app_path.inspect})."
          end
        end
      end
    end
    @@curr_app_path = nil
  end
  
  # Tells all applications to open the files or databases they need.
  def open
    delegate 'open'
  end
  
  # Tells all applications that a request happened and gives the arguments to them.
  def idle( *args )
    delegate( 'idle', *args )
  end
  
  # Tells all applications to flush their data.
  def flush
    delegate 'flush'
  end
  
  # Tells all applications that they are about to be terminated.
  def close
    delegate 'close'
  end
  
  # Restarts all running applications
  def rescan
    flush
    close
    @@apps = Hash.new
    scan
    open
  end
  
  # Called when everything is going down
  def shutdown
    flush
    close
  end
  
  # Check if each application handles +method+, and if so, call it, passing +args+ as a parameter
  def delegate(method, *args)
    @@apps.values.uniq.each do |app|
      if(app.respond_to? method)
        app.send( method, *args )
      end
    end
  end
  
  # See if we have an application that wants to handle this message, if so, pass
  # it to the application and return true, otherwise false
  def run( msg )
    if @@apps.has_key?( msg.app )
      if @@apps[ msg.app ].respond_to?( msg.command )
        @@apps[ msg.app ].send( msg.command, msg )
        return true
      end
    end
    return false
  end
  
  def run_app( app_name, method_name, *args )
    if @@apps.has_key?( app_name )
      if @@apps[app_name].respond_to?( method_name )
        return @@apps[app_name].method( method_name ).call(*args)
      end
    end
  end
  
end
