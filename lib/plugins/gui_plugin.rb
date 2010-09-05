##   RSence
 #   Copyright 2009 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##


module RSence
  module Plugins
    
    # The CUIPlugin__ is actually available as +GUIPlugin+ from plugin bundle code using the {RSence::Plugins::GUIPlugin} class mimic method.
    #
    # GUIPlugin extends {Plugin__ Plugin} by automatically initializing an {GUIParser} instance as +@gui+.
    #
    # Read {Plugin__ Plugin} for usage of the API, {file:ExampleGuiPlugin Example GUIPlugin} for an example of use and {file:PluginBundles Plugin Bundles} for overall information about plugin bundle usage.
    #
    # * It implements automatic dependency loading based on the dependencies item in the YAML gui declaration.
    # * It inits the gui automatically.
    #
    # = User Interface -related hooks:
    # * {#init_ui +#init_ui+} -- Extend to implement logic when the {MainPlugin} plugin has started the client. The {GUIPlugin__ +GUIPlugin+} class extends this method to automatically load and initialize the user interface from a +GUITree+ data structure defined in the +gui/main.yaml+ document in the bundle directory.
    # * {#gui_params +#gui_params+} -- Extend to define your own params for the gui data.
    #
    class GUIPlugin__ < Plugin__
      
      # @private Class type identifier for the PluginManager.
      # @return [:GUIPlugin]
      def self.bundle_type; :GUIPlugin; end
      
      # In addition to {Plugin__#init Plugin#init}, also automatically initializes a {GUIParser} instance as +@gui+
      #
      # @return [nil]
      def init
        super
        yaml_src = file_read( "gui/#{@name}.yaml" )
        unless yaml_src
          yaml_src = file_read( "gui/main.yaml" )
        end
        if yaml_src
          @gui = GUIParser.new( self, yaml_src, @name )
        else
          @gui = nil
        end
        @client_pkgs = false
      end
  
      # Extend this method to return custom params to {GUIParser#init}.
      #
      # Called from {#init_ui}.
      #
      # By default assigns the session values as :values to use for +bind: :values.my_value_name+ in the YAML GUI file for client-side value bindings.
      #
      # @param [Message] msg The message is supplied by the system.
      # 
      # @return [Hash] Parameters for {GUIParser#init @gui#init}
      #
      # @example To provide extra parameters, do this:
      #   def gui_params( msg )
      #     params = super
      #     params[:extra] = {
      #       :foo => "Foo",       # use in the GUITree as :extra.foo
      #       :num => 124334,      # use in the GUITree as :extra.num
      #       :bar => {
      #         :barbar => "Bar"   # use in the GUITree as :extra.bar.barbar
      #       }
      #       :arr => [1,2,4,8]    # use in the GUITree as :extra.arr
      #     }
      #     params[:more] = "More" # use in the GUITree as :more
      #     return params
      #   end
      #
      def gui_params( msg )
        return unless @gui
        { :values => @gui.values( get_ses( msg ) ) }
      end
      
      # @private Method that implements +client_pkgs.yaml+ loading
      def install_client_pkgs
        if @client_pkgs
          warn "install_client_pkgs: called with @client_pkgs defined; returning"
          return
        end
        @client_pkgs = yaml_read( 'client_pkgs.yaml' )
        if @client_pkgs
          if @client_pkgs.has_key?(:src_dirs)
            @client_pkgs[:src_dirs].each do |src_dir|
              src_dir = bundle_path( src_dir[2..-1] ) if src_dir.start_with?('./')
              @plugins.client_pkg.add_src_dir( src_dir )
            end
          end
          @plugins.client_pkg.add_packages(       @client_pkgs[:packages      ] ) if @client_pkgs.has_key?(:packages      )
          @plugins.client_pkg.add_themes(         @client_pkgs[:theme_names   ] ) if @client_pkgs.has_key?(:theme_names   )
          @plugins.client_pkg.add_gfx_formats(    @client_pkgs[:gfx_formats   ] ) if @client_pkgs.has_key?(:gfx_formats   )
          @plugins.client_pkg.add_reserved_names( @client_pkgs[:reserved_names] ) if @client_pkgs.has_key?(:reserved_names)
          @plugins.client_pkg.rebuild_client
        end
      end
      
      # @private Method that implements +client_pkgs.yaml+ unloading
      def uninstall_client_pkgs
        if not @client_pkgs
          warn "uninstall_client_pkgs: called without @client_pkgs defined"
        else
          if @client_pkgs.has_key?(:src_dirs)
            @client_pkgs[:src_dirs].each do |src_dir|
              src_dir = bundle_path( src_dir[2..-1] ) if src_dir.start_with?('./')
              @plugins.client_pkg.del_src_dir( src_dir )
            end
          end
          @plugins.client_pkg.del_reserved_names( @client_pkgs[:reserved_names] ) if @client_pkgs.has_key?(:reserved_names)
          @plugins.client_pkg.del_gfx_formats(    @client_pkgs[:gfx_formats   ] ) if @client_pkgs.has_key?(:gfx_formats   )
          @plugins.client_pkg.del_themes(         @client_pkgs[:theme_names   ] ) if @client_pkgs.has_key?(:theme_names   )
          @plugins.client_pkg.del_packages(       @client_pkgs[:packages].keys  ) if @client_pkgs.has_key?(:packages      )
          @plugins.client_pkg.rebuild_client
        end
        @client_pkgs = false
      end
      
      # @private calls install_client_pkgs, if a 'client_pkgs.yaml' file is found
      def open
        super
        install_client_pkgs if File.exist? bundle_path( 'client_pkgs.yaml' )
      end
      
      # @private calls uninstall_client_pkgs, if a 'client_pkgs.yaml' file was loaded
      def close
        super
        uninstall_client_pkgs if @client_pkgs
      end
      
      # @private Returns structured, processed gui tree to the caller.
      def struct_ui( msg )
        return {} unless @gui
        @gui.struct( msg, gui_params( msg ) )
      end
      
      # Automatically inits the UI using {GUIParser#init}
      #
      # @param [Message] msg The message is supplied by the system.
      #
      # @return [nil]
      def init_ui( msg )
        return unless @gui
        @gui.init( msg, gui_params( msg ) )
      end
      
      # @private Automatically kills the UI using {GUIParser#kill}
      def kill_ui( msg )
        return unless @gui
        @gui.kill( msg )
      end
      
    end
  end
end
