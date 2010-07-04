##   RSence
 #   Copyright 2010 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##


module RSence
  
  
  module Plugins
    
    # This module contains common functionality included in the {Plugin__ Plugin}, {GUIPlugin__ GUIPlugin} and the {Servlet__ Servlet} base classes.
    #
    # = Extension hooks for server events
    # These methods are provided as the basic server event hooks:
    # * {#init +#init+} -- Use instead of +initialize+
    # * {#open +#open+} -- Extend to open objects
    # * {#flush +#flush+} -- Extend to write the state and to flush buffers
    # * {#close +#close+} -- Extend to close objects
    #
    # = Utility methods
    # These are general utility methods not intended to be extended.
    # * {#file_read +#file_read+} Use to read files
    # * {#yaml_read +#yaml_read+} Use to read yaml data
    # * {#file_write +#file_write+} Use to write files
    # * {#bundle_path +#bundle_path+} Use for plugin bundle -specific paths
    # * {#httime +#httime+} Use for HTTP date/time
    #
    # = See also
    # * {file:PluginBundles Plugin Bundles} -- General information about the plugin bundle system
    # * {Plugin__ Plugin} -- The Plugin base class
    # * {Servlet__ Servlet} -- The Servlet base class
    # * {GUIPlugin__ GUIPlugin} -- The GUIPlugin base class
    module PluginUtil
      
      # @private External accessor for @plugins
      # @return [PluginManager] The PluginManager the instance belongs to.
      attr_reader :plugins
      
      # Extend this method do any initial configuration instead of extending the +initialize+ constructor, which should *never* be done in plugins.
      #
      # It is called by the {PluginManager#register_bundle PluginManager} when the plugin has been constructed and registered.
      #
      # @return [nil]
      def init
      end
      
      # Extend to open objects like streams and database connections.
      #
      # It is called by the {PluginManager#update_bundles! PluginManager} after the {#init} method, when everything is constructed after all plugins are loaded.
      #
      # @return [nil]
      def open
      end
      
      # Extend to save your plugin state, write or flush any data that needs to be stored.
      #
      # It is called by the {PluginManager#unload_bundle PluginManager} before {#close}, but doesn't always mean a +close+ event is imminent.
      #
      # @return [nil]
      def flush
      end
      
      # Extend to close objects like streams and database connections.
      #
      # It is called by the {PluginManager#unload_bundle PluginManager} when the plugin is about to be destructed, so don't expect any events after it has been called.
      #
      # @return [nil]
      def close
      end
      
      # File reader utility
      #
      # Reads the contents of the file given in the +path+.
      #
      # @param [String] path The +path+ is relative to the bundle path by default, unless it starts with '/' or '..'; it's simply processed by {#bundle_path} before reading the file.
      #
      # @return [false] If there is no file, returns +false+
      # @return [String] The contents of the file.
      def file_read( path )
        path = bundle_path( path )
        return false unless File.exist?( path )
        return File.read( path )
      end
      
      # YAML reader utility
      #
      # Reads the contents of the YAML file given in the +path+ and returns as a parsed structure of the contents of the file.
      #
      # @param [String] path The +path+ is relative to the bundle path by default, unless it starts with '/' or '..'; it's simply processed by {#bundle_path} before reading the file.
      #
      # @return [false] If the is no file, returns +false+
      # @return [Object] Any valid structure defined by the YAML file, parsed to a Ruby object.
      def yaml_read( path )
        file_data = file_read( path )
        if not file_data
          return false
        else
          return YAML.load( file_data )
        end
      end
      
      # Flie writer utility.
      #
      # Writes the contents of the +data+ into the file given in the +path+.
      # @param [String] path The +path+ is relative to the bundle path by default, unless it starts with '/' or '..'; it's simply processed by {#bundle_path} before writing the file.
      # @param [#to_s] data The data to write.
      #
      # @return [true,false] A success code of the operation (+false+ for failure and +true+ for success).
      def file_write( path, data )
        path = bundle_path( path )
        begin
          datafile = File.open( path, 'wb' )
          datafile.write( data.to_s )
          datafile.close
          return true
        rescue => e
          warn "file_write error for path #{path} #{e}"
          return false
        end
      end
      alias file_save file_write
      
      # Path utility
      #
      # Makes a full, absolute path using the plugin bundle as the default path when a relative path is given. Returns just the bundle's local path, if no parameters given.
      # 
      # @param [String, false] path The path is relative to the bundle path by default, unless it starts with '/' or '..'.
      # @param [String, false] prefix Alternative root path if +path+ is specified as a relative path.
      # @param [String, false] suffix The file suffix, like the the extension.
      #
      # @return [String] Full absolute path.
      def bundle_path( path=false, prefix=false, suffix=false )
        return @path if not path
        if suffix
          path = "#{path}#{suffix}" unless path.end_with?(suffix)
        end
        if prefix
          path = File.join( prefix, path )
        end
        path = File.expand_path( path, @path )
        return path
      end
      
      # Utility for returning the time in the HTTP RFC specification format, like:
      #   !!!text
      #   Sun, 04 Jul 2010 06:20:53 EEST
      #
      # @param [Time, false] time An Time object to format. Uses the current date/time by default.
      #
      # @return [String] The date/time formatted according to the HTTP RFC specification.
      def httime(time=false)
        time = Time.new unless time 
        return time.gmtime.strftime('%a, %d %b %Y %H:%M:%S %Z')
      end
      
    end
  end
end
