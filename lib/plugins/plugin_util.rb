##   RSence
 #   Copyright 2010 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##

module ::RSence
module Plugins
module PluginUtil
  
  include RSence

  # 
  # def self.method_missing( name, *args, &block )
  #   puts "method_missing:"
  #   puts "  name: #{name.inspect}"
  #   puts "  args: #{args.inspect}"
  #   puts "  block: #{block.inspect}"
  #   if name == :bundle_path
  #     return Info.new( Module.nesting ).bundle_path
  #   end
  # end
  
  # Extend to do any initial configuration. Not doing anything by default.
  def init
  end
  
  # Extend this method to open objects like streams and database connections.
  # It is called when everything is constructed after all plugins are loaded.
  def open
  end
  
  # Extend to save your plugin state or store any data that needs to be
  # persistent. It's always called before close, but doesn't necessarily mean
  # a close call is imminent.
  def flush
  end
  
  # Extend this method to close objects like streams and database connections.
  # It's called when plugins are about to be destructed, so don't expect any
  # calls after it has been called. When this method is called, it's the last
  # chance to save persistent data before being destructed, so implement
  # the +#flush+ method for primarily storing data.
  def close
  end
  
  # Returns the contents of the file given as +path+.
  #
  # The plugin bundle's path is used as the prefix, unless +path+ starts with '/' or '..'
  #
  # If the file doesn't exist, it returns +false+.
  def file_read( path )
    path = bundle_path( path )
    return false unless File.exist?( path )
    return File.read( path )
  end
  
  def yaml_read( path )
    file_data = file_read( path )
    if not file_data
      return false
    else
      return YAML.load( file_data )
    end
  end
  
  def method_undefined?( *args )
    puts "Method undefined: #{args.inspect}"
  end
  
  # Writes the +data+ into the file +path+.
  #
  # The plugin bundle's path is used as the prefix, unless +path+ starts with '/' or '..'
  #
  # It returns a success code (+false+ for failure and +true+ for success).
  def file_write( path, data )
    path = bundle_path( path )
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
  
  # Makes a full path using the plugin bundle as the 'local path'.
  # The (optional) +prefix+ is a subdirectory in the bundle,
  # the +suffix+ is the file extension.
  def bundle_path( path, prefix=false, suffix=false )
    if suffix
      path = "#{path}#{suffix}" unless path.end_with?(suffix)
    end
    if prefix
      path = File.join( prefix, path )
    end
    path = File.expand_path( path, @path )
    return path
  end
  
  alias compose_plugin_path bundle_path
  
  # Helper method to return the time formatted according to the HTTP RFC
  def httime(time=false)
    time = Time.new unless time 
    return time.gmtime.strftime('%a, %d %b %Y %H:%M:%S %Z')
  end
  
end
end
end
