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


# HApplication is an abstract class for server applications.
# Designed to be extended to match your needs.
#
# [name](msg)::          Called when a user interface command is matched with
#                        the plugin name
class HApplication
  
  attr_writer :path
  attr_reader :names
  
  # Initializes your application instance.
  # Dont extend it, use the 'init' method instead.
  def initialize
    @inited = false
    @names  = []
  end
  
  
  ## Utilities
  
  # File reader utility, practical for simple file data operations
  def file_read(fullpath)
    srcfile = File.open(fullpath,'r')
    srcdata = srcfile.read
    srcfile.close
    return srcdata
  end
  
  # Javascript inclusion utility.
  # Reads js sources from your plugin's dir
  def require_js(name)
    fullpath = @path+'/js/'+name+'.js'
    return file_read( fullpath )
  end
  
  # Javascript inclusion utility.
  # Reads js sources from your plugin's dir, but only once
  def require_js_once(msg,name)
    ses = msg.session
    if not ses.has_key?(:deps)
      ses[:deps] = []
    end
    fullpath = @path+'/js/'+name+'.js'
    unless ses[:deps].include?( fullpath )
      ses[:deps].push( fullpath )
      return file_read( fullpath )
    else
      return ''
    end
  end
  
  # Himle dependency reader, just supply
  # with everything you need, it keeps track of
  # what's loaded.
  def include_js(msg, dependencies=[])
    
    ses = msg.session
    
    # check, if the session has a dependency array
    if not ses.has_key?( :deps )
      # make an array of dependencies for this session, if not already done
      ses[:deps] = []
    end
    
    dependencies = [dependencies] if dependencies.class == String
    
    # Check the required dependencies until everything is loaded.
    # It returns them one-at-a time to make segmented loading easy.
    dependencies.each do |dependency|
      unless ses[:deps].include?( dependency )
        ses[:deps].push( dependency )
        msg.reply(%{jsLoader.load("#{dependency}");})
      end
    end
  end
  
  
  ## Extendables
  
  # Extend to do any initial configuration
  def init
  end
  
  # Extend to handle non-specific client calls to your specific application.
  # (When the application specified, but the method not specified)
  def run( msg )
  end
  
  # Extend to handle client-side app kill post-cleanup
  # For example, reset the state, so the app can be recalled.
  def release( msg )
  end
  
  # Extend to handle client calls even if your application was not specifically called.
  def idle( msg )
  end

  # Extend to handle calls, even if specific client calls to application and method are specified.
  def any( msg )
  end
  
  # Extend to manage stream or database opening etc..
  # It is called when everything is set to go after all apps are loaded / reloaded.
  def open
  end
  
  # Extend to save your application state, when the system is going down.
  def flush
  end
  
  # Extend to manage stream or database closing etc..
  # It is called before apps are loaded / reloaded
  def close
  end
  
  
  ## Don't extend these:
  
  # Returns all the names your application respond to.
  def name
    return @names.join(',')
  end
  
  # Registers the application respond to messages prefixed +name+
  # Call multiple times to make your application to respond
  # to several names.
  def register( name )
    raise "DuplicateAppNameFound: #{name.inspect}" if HSystem.apps.has_key?(name)
    HSystem.apps[ name ] = self
    @names << name
    @path = HSystem.curr_app_path
    init if not @initied
    @inited = true
  end
  
  # extend this method to invoke actions
  # whenever a new session is created.
  # (reload or other page load without the ses_key
  # cookie set for an valid and active session)
  def init_ses( msg )
  end
  
  # extend this method to invoke actions
  # whenever a user restores an active session.
  # (reload or other page load with the ses_key
  # cookie set for an valid and active session)
  def restore_ses( msg )
  end
  
end
