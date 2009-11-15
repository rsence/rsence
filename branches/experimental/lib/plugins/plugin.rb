##   Riassence Framework
 #   Copyright 2006 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##

module Riassence
module Server

=begin
Plugin is an abstract class for rsence server-side application logic.
=end
class Plugin
  
  attr_writer :path
  attr_reader :names
  
  # Initializes your plugin instance.
  # Dont extend it, use the 'init' method instead.
  def initialize
    @inited = false
    @names  = []
  end
  
  
  ## Extendables
  
  # Extend to do any initial configuration
  def init
  end
  
  # Extend to handle non-specific client calls to your specific plugin.
  # (When the plugin specified, but the method not specified)
  def run( msg )
  end
  
  # Extend to handle client-side plugin kill post-cleanup
  # For example, reset the state, so the plugin can be recalled.
  def release( msg )
  end
  
  # Extend to handle client calls even if your plugin was not specifically called.
  def idle( msg )
  end

  # Extend to handle calls, even if specific client calls to plugin and method are specified.
  def any( msg )
  end
  
  # Extend to manage stream or database opening etc..
  # It is called when everything is set to go after all plugins are loaded / reloaded.
  def open
  end
  
  # Extend to save your plugin state, when the system is going down.
  def flush
  end
  
  # Extend to manage stream or database closing etc..
  # It is called before plugins are loaded / reloaded
  def close
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
  
  
  # Registers the plugin respond to messages prefixed +name+
  # Call multiple times to make your plugin to respond
  # to several names.
  def register( name )
    raise "DuplicateAppNameFound: #{name.inspect}" if PluginManager.plugins.has_key?(name)
    PluginManager.plugins[ name ] = self
    @names << name
    @path = File.expand_path( PluginManager.curr_plugin_path )
    init if not @initied
    @inited = true
  end
  
private
  ## Don't extend these:
  # Returns all the names your plugin respond to.
  def name
    return @names.join(',')
  end
  
  ## Utilities
  
  # File reader utility,
  # practical for simple file data operations
  def file_read( path )
    if path[0].chr != '/' and path[0..1] != '..'
      path = File.join( @path, path )
    end
    return false unless File.exist?( path )
    return File.read( path )
  end
  
  # File writer utility,
  # practical for simple file data operations
  def file_write( path, data )
    if path[0].chr != '/' and path[0..1] != '..'
      path = File.join( @path, path )
    end
    begin
      datafile = File.open( path, 'wb' )
      datafile.write( data )
      datafile.close
      return true
    rescue => e
      warn "file_write error for path #{path} #{e}"
      return false
    end
  end
  alias file_save file_write
  
  # Javascript inclusion utility.
  # Reads js sources from your plugin's dir
  def require_js(name)
    full_path = File.join( @path, 'js', name+'.js' )
    return file_read( full_path )
  end
  
  # Javascript inclusion utility.
  # Reads js sources from your plugin's dir, but only once per session
  def require_js_once(msg,name)
    ses = msg.session
    if not ses.has_key?(:deps)
      ses[:deps] = []
    end
    full_path = File.join( @path, 'js', name+'.js' )
    unless ses[:deps].include?( full_path )
      ses[:deps].push( full_path )
      return file_read( full_path )
    else
      return ''
    end
  end
  
  # Utility method for HValue reference extraction from ruby to js hashes.
  def extract_hvalues_from_hash( ses_hash )
    js_references = []
    ses_hash.each_key do |key_name|
      if ses_hash[key_name].class == HValue
        js_references.push( "#{key_name.to_s}: HVM.values['#{ses_hash[key_name].val_id}']" )
      end
    end
    return "{#{js_references.join(', ')}}"
  end
  
  # Riassence Framework dependency reader, just supply it 
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
    dependencies.each do |dependency|
      unless ses[:deps].include?( dependency )
        ses[:deps].push( dependency )
        msg.reply(%{jsLoader.load("#{dependency}");})
      end
    end
  end
  
  
end

end
end

