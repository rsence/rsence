##   RSence
 #   Copyright 2009 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##


module RSence
  module Plugins
    
    # Use the Servlet class to create responders for GET / POST urls.
    # 
    # A Servlet's public API is accessible like the other plugins directly.
    # 
    # == Responding to a URL consists of four phases:
    # 1. PluginManager calls every {Servlet__#match #match} method
    # 2. The plugins that return true to the {Servlet__#match #match} method are queried by their score -method
    # 3. The matched plugins are sorted by score, lowest score wins. If it's a draw between equal scores, the choice is randomized.
    # 4. The {Servlet__#post #post} or {Servlet__#get #get} method is called, depending on the type of HTTP request.
    #
    # = Extension hooks for server events
    # These methods are provided as the basic server event hooks:
    # * {#init +#init+} -- Use instead of +initialize+
    # * {#open +#open+} -- Extend to open objects
    # * {#flush +#flush+} -- Extend to write the state and to flush buffers
    # * {#close +#close+} -- Extend to close objects
    #
    # = Extension hooks for REST events
    # * {#match +#match+} -- Extend to return true for certain url and request_type conditions.
    # * {#score +#score+} -- Extend to return a numeric score. Lower scores are "better" than higher ones. 
    # * {#get   +#get+} -- Extend to handle a HTTP GET request and response.
    # * {#post  +#post+} -- Extend to handle a HTTP POST request and response.
    class Servlet__
      
      include PluginBase
      
      # @private Class type identifier for the PluginManager.
      # @return [:Servlet]
      def self.bundle_type; :Servlet; end
      
      # @private The constructor should not be accessed from anywhere else than the PluginManager, which does it automatically.
      def initialize( bundle_name, bundle_info, bundle_path, plugin_manager )
        @info    = bundle_info
        @name    = bundle_name
        @path    = bundle_path
        @plugins = plugin_manager
        register
        @inited = false
      end

      # @return [Symbol] The name of the plugin bundle
      attr_reader :name
      
      # @return [String] The absolute path of the plugin bundle.
      attr_reader :path
      
      # @return [Hash] The {file:PluginBundleInfo meta-information} of the plugin bundle.
      attr_reader :info
      
      # @private State of the plugin.
      attr_reader :inited

      
      # @private Used by PluginManager to register the plugin
      def register
        @plugins.register_bundle( self, @name )
        @inited = true
      end
      
      # Extend to return true for the certain uri and request_type conditions your servlet code handles.
      #
      # @example Handles :get requests that begin with /foo
      #   def match( uri, request_type )
      #     request_type == :get and uri.start_with?( '/foo' )
      #   end
      #
      # @param [String] uri The request uri (full "path" of the request url).
      # @param [:get, :post] request_type The type of request. Only :get and :post are handled yet.
      #
      # @return [true] to match
      # @return [false] to not match. Returns false to everything, if not extended.
      def match( uri, request_type=:get ); false; end
      alias match? match
      
      # If matched, returns score where lower is better. Score is needed for priority sorting, when several Servlet's {#match} are returning true for the same request.
      #
      # @return [Number]
      def score; 100; end
      
      # Extend to do any GET request processing. Not doing anything by default.
      #
      # @param [Request] req The HTTP Request object.
      # @param [Response] res The HTTP Response object.
      # @param [Hash] ses The session object, not implemented yet.
      def get( req, res, ses ); end
      
      # Extend to do any POST request processing. Not doing anything by default.
      #
      # @param [Request] req The HTTP Request object.
      # @param [Response] res The HTTP Response object.
      # @param [Hash] ses The session object, not implemented yet.
      def post( req, res, ses ); end
      
    end
  end
end
