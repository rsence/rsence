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
# Plugin is an abstract class for rsence server-side application logic.
=end
class Plugin
  
  attr_writer :path
  attr_reader :names
  
  # Initializes your plugin instance.
  # Dont extend it, use the 'init' method instead.
  def initialize
    @inited = false
    @names  = []
    @values = false
  end
  
  
  ## Extendables
  
  # Extend to do any initial configuration
  # By default it calls init_values
  def init
    init_values
  end
  
  # Extend to handle client-side plugin kill post-cleanup
  # For example, reset the state, so the plugin can be recalled.
  # ==== Parameters
  # +msg+:: The +Message+ instance that contains session and request-response -related mappings and utility methods.
  def release( msg )
  end
  
  # Extend to handle client calls even if your plugin was not specifically called.
  # ==== Parameters
  # +msg+:: The +Message+ instance that contains session and request-response -related mappings and utility methods.
  def idle( msg )
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
  # By default it calls init_ses_values
  # ==== Parameters
  # +msg+:: The +Message+ instance that contains session and request-response -related mappings and utility methods.
  def init_ses( msg )
    init_ses_values( msg )
  end
  
  # extend this method to invoke actions
  # whenever a user restores an active session.
  # (reload or other page load with the ses_key
  # cookie set for an valid and active session)
  # By default it calls restore_ses_values
  # ==== Parameters
  # +msg+:: The +Message+ instance that contains session and request-response -related mappings and utility methods.
  def restore_ses( msg )
    restore_ses_values( msg )
  end
  
  # extend this method to invoke actions
  # whenever a user's session is cloned.
  # this one is called before resore_ses.
  # this happens when a user opens a new
  # another browser window or tab while
  # the old session is still active.
  # source_ses is the "old" session, which
  # was the source of the cloning.
  # ==== Parameters
  # +msg+:: The +Message+ instance that contains session and request-response -related mappings and utility methods.
  # +source_session+:: The +session+ to be cloned.
  def cloned_target( msg, source_session )
  end
  
  # extend this method to invoke actions
  # whenever another session is cloned
  # from the current session.
  # target_ses is the "new" session, which
  # was the target when cloning the
  # current session.
  # ==== Parameters
  # +msg+:: The +Message+ instance that contains session and request-response -related mappings and utility methods.
  # +target_sessions+:: The +session+ which was target when cloning the current session.
  def cloned_source( msg, target_sessions )
  end
  
  # Registers the plugin respond to messages prefixed +name+
  # Call multiple times to make your plugin to respond
  # to several names.
  # ==== Parameters
  # +name+:: The name which plugin will be registered.
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
  
  # This method looks looks for a file called 'values.yaml'
  # in the plugin's path.
  # If this file is found, it loads it for initial value definitions.
  # These definitions are assigned as @values
  def init_values
    values_path = File.join( @path, 'values.yaml' )
    if File.exist?( values_path )
      @values = YAML.load( File.read( values_path ) )
    end
  end
  
  # Returns all the names your plugin respond to.
  def name
    return @names.join(',')
  end
  
  ## Utilities
  
  # Returns or creates a new session hash for the plugin.
  # Uses the first name registered for the plugin and converts
  # it to a symbol.
  # ==== Parameters
  # +msg+:: The +Message+ instance that contains session and request-response -related mappings and utility methods.
  def get_ses( msg )
    name = @names.first.to_sym
    unless msg.session.has_key?( name )
      msg.session[ name ] = {}
    end
    return msg.session[ name ]
  end
  
  # File reader utility,
  # practical for simple file data operations
  # ==== Parameters
  # +path+:: Path to read +File+ from.
  def file_read( path )
    if path[0].chr != '/' and path[0..1] != '..'
      path = File.join( @path, path )
    end
    return false unless File.exist?( path )
    return File.read( path )
  end
  
  # File writer utility,
  # practical for simple file data operations.
  # ==== Parameters
  # +path+:: Path to write data.
  # +data+:: Data to write.
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
  # ==== Parameters
  # +name+:: The name of the javascript without the ending .js. Javascript is 
  #          included from the directory named 'js' inside the plugin folder.
  def read_js( name )
    full_path = File.join( @path, 'js', name+'.js' )
    return file_read( full_path )
  end
  # old name for the read_js as an alias
  alias require_js read_js
  
  # Javascript inclusion utility.
  # Reads js sources from your plugin's dir, but only once per session
  # ==== Parameters
  # +msg+::  The +Message+ instance that contains session and request-response -related mappings and utility methods.
  # +name+:: The name of the javascript without the ending .js. Javascript is 
  #          included from the directory named 'js' inside the plugin folder.
  def require_js_once( msg, name )
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
  
  # initializes a single session value
  # ==== Parameters
  # +msg+::              The +Message+ instance that contains session and 
  #                      request-response -related mappings and utility methods.
  # +value_name+::       Name of the value for the session value.
  # +value_properties+:: Checks if the property array has :value_call for a method or :value for a value.
  #                      If neither is present defaults to value 0.
  def init_ses_value( msg, value_name, value_properties )
    ses = get_ses( msg )
    if value_properties.has_key?(:value_call)
      default_value = init_value_call( msg, value_properties[:value_call] )
    elsif value_properties.has_key?(:value)
      default_value = value_properties[:value]
    else
      default_value = 0
    end
    ses[value_name] = HValue.new( msg, default_value )
    if value_properties.has_key?(:responders)
      value_properties[:responders].each do |responder|
        if responder.has_key?(:plugin)
          responder_plugin = responder[:plugin]
        else
          responder_plugin = @names.first
        end
        if responder.has_key?(:method)
          ses[value_name].bind( responder_plugin, responder[:method] )
        end
      end
    end
  end
  
  # Initializes session values, if a values.yaml file is in the bundle.
  # ==== Parameters
  # +msg+::  The +Message+ instance that contains session and request-response -related mappings and utility methods.
  def init_ses_values( msg )
    return unless @values
    @values.each do | value_name, value_properties |
      init_ses_value( msg, value_name, value_properties )
    end
  end
  
  # Returns a value based on the :method and :plugin members of the value_call hash.
  # The call is made via msg.run
  # Contents:
  # :plugin is the name of the plugin to call.
  #   - It's optional and defaults to the local plugin instance.
  # :method is the name of the method to call
  # :args is the extra parameters to pass to the method
  #   - It's optional and the default is no :args
  #   - It must be an Array, if defined
  # :uses_msg is a boolean that defines if msg is the first argument or not
  #   - It's optional and defaults to true
  def init_value_call( msg, value_call )
    value_call_method = value_call[:method]
    if value_call.has_key?(:plugin)
      value_call_plugin = value_call[:plugin]
    else
      value_call_plugin = false
    end
    if value_call.has_key?(:args)
      if value_call.has_key?(:uses_msg) and value_call[:uses_msg] != false
        if value_call_plugin
          return msg.run( value_call_plugin, value_call_method, msg, *value_call[:args] )
        else
          return self.method( value_call_method ).call( msg, *value_call[:args] )
        end
      else
        if value_call_plugin
          return msg.run( value_call_plugin, value_call_method, *value_call[:args] )
        else
          return self.method( value_call_method ).call( *value_call[:args] )
        end
      end
    else
      if value_call.has_key?(:uses_msg) and value_call[:uses_msg] != false
        if value_call_plugin
          return msg.run( value_call_plugin, value_call_method, msg )
        else
          return self.method( value_call_method ).call( msg )
        end
      else
        if value_call_plugin
          return msg.run( value_call_plugin, value_call_method )
        else
          return self.method( value_call_method ).call( )
        end
      end
    end
  end
  
  # restores session values to default, unless specified otherwise
  # ==== Parameters
  # +msg+::  The +Message+ instance that contains session and request-response -related mappings and utility methods.
  def restore_ses_values( msg )
    return unless @values
    ses = get_ses( msg )
    @values.each do | value_name, value_properties |
      if ses.has_key?( value_name ) and ses[ value_name ].class == HValue
        unless value_properties[:restore_default] == false
          if value_properties.has_key?(:value_call)
            default_value = init_value_call( msg, value_properties[:value_call] )
          elsif value_properties.has_key?(:value)
            default_value = value_properties[:value]
          else
            default_value = 0
          end
          ses[value_name].set( msg, default_value )
        end
      else
        init_ses_value( msg, value_name, value_properties )
      end
    end
  end
  
  # Utility method for HValue reference extraction from ruby to js hashes.
  # ==== Parameters
  # +msg+::  The +Message+ instance that contains session and request-response -related mappings and utility methods.
  # +ses+::  Session to extract values from. If not defined, will extract from the current session.
  def values_js( msg, ses=false )
    # backwards-compatible with pre-1.3 behaviour
    ses = msg if msg.class == Hash
    # gets the session automatically, if false
    ses = get_ses( msg ) unless ses
    js_references = []
    ses.each_key do |key_name|
      if ses[key_name].class == HValue
        js_references.push( "#{key_name.to_s}: HVM.values['#{ses[key_name].val_id}']" )
      end
    end
    return "{#{js_references.join(', ')}}"
  end
  # old name for the values_js method as an alias
  alias extract_hvalues_from_hash values_js
  
  # Riassence Framework dependency reader, just supply it 
  # with everything you need, it keeps track of
  # what's loaded.
  # ===== Parameters
  # +msg+::          The +Message+ instance that contains session and 
  #                  request-response -related mappings and utility methods.
  # +dependencies+:: Array of dependencies.
  def include_js( msg, dependencies=[] )
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

