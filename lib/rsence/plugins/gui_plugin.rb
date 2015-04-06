# Interface for handling localized strings
require 'rsence/plugins/plugin_localization'

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

      include Localization
      
      # @private Class type identifier for the PluginManager.
      # @return [:GUIPlugin]
      def self.bundle_type; :GUIPlugin; end
      
      # In addition to {Plugin__#init Plugin#init}, also automatically initializes a {GUIParser} instance as +@gui+
      #
      # @return [nil]
      def init
        super
        yaml_src = false
        [ "#{@name}.yaml", 'gui.yaml',
          "gui/#{@name}.yaml", 'gui/main.yaml'
        ].each do |yaml_name|
          yaml_src = file_read( yaml_name )
          break if yaml_src
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
        params = super
        params[:values] = @gui.values( get_ses( msg ) )
        params
      end
      
      # @private Method that implements +client_pkgs.yaml+ loading
      def install_client_pkgs
        if @client_pkgs
          warn "install_client_pkgs: called with @client_pkgs defined (#{@client_pkgs.inspect}); returning" if RSence.args[:debug]
          return
        end
        client_pkgs = yaml_read( 'client_pkgs.yaml' )
        if client_pkgs

          sleep 0.1 until client_pkg.ready?
          
          if client_pkgs.has_key?('src_dir')
            src_dirs = [ client_pkgs['src_dir'] ]
          elsif client_pkgs.has_key?('src_dirs')
            src_dirs = client_pkgs['src_dirs']
          elsif client_pkgs.has_key?(:src_dirs)
            src_dirs = client_pkgs[:src_dirs]
          else
            src_dirs = false
          end

          @client_pkgs = {}
          if src_dirs
            src_dirs.each do |src_dir|
              if src_dir.start_with?('./')
                src_dir = bundle_path( src_dir[2..-1] )
              end
              client_pkg.add_src_dir( src_dir )
            end
            @client_pkgs[:src_dirs] = src_dirs
          end
          
          if client_pkgs.has_key?('packages')
            packages = client_pkgs['packages']
          elsif client_pkgs.has_key?(:packages)
            packages = client_pkgs[:packages]
          else
            packages = false
          end

          if packages
            client_pkg.add_packages( packages )
            @client_pkgs[:packages] = packages
          end

          
          if client_pkgs.has_key?('compounds')
            compounds = client_pkgs['compounds']
          elsif client_pkgs.has_key?('compound_packages')
            compounds = client_pkgs['compound_packages']
          elsif client_pkgs.has_key?(:compound_packages)
            compounds = client_pkgs[:compound_packages]
          else
            compounds = false
          end

          if compounds
            client_pkg.add_compounds( compounds )
            @client_pkgs[:compound_packages] = compounds
          end

          
          if client_pkgs.has_key?('themes')
            theme_names = client_pkgs['themes']
          elsif client_pkgs.has_key?('theme_names')
            theme_names = client_pkgs['theme_names']
          elsif client_pkgs.has_key?(:theme_names)
            theme_names = client_pkgs[:theme_names]
          else
            theme_names = false
          end

          if theme_names
            client_pkg.add_themes( theme_names )
            @client_pkgs[:theme_names] = theme_names
          end


          if client_pkgs.has_key?('gfx_formats')
            gfx_formats = client_pkgs['gfx_formats']
          elsif client_pkgs.has_key?(:gfx_formats)
            gfx_formats = client_pkgs[:gfx_formats]
          else
            gfx_formats = false
          end

          if gfx_formats
            client_pkg.add_gfx_formats( gfx_formats )
            @client_pkgs[:gfx_formats] = gfx_formats
          end

          if client_pkgs.has_key?('reserved_names')
            reserved_names = client_pkgs['reserved_names']
          elsif client_pkgs.has_key?(:reserved_names)
            reserved_names = client_pkgs[:reserved_names]
          else
            reserved_names = false
          end

          if reserved_names
            client_pkg.add_reserved_names( reserved_names )
            @client_pkgs[:reserved_names] = reserved_names
          end

          client_pkg.rebuild_client
          
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
              client_pkg.del_src_dir( src_dir )
            end
          end
          sleep 0.1 until client_pkg.ready?
          client_pkg.del_reserved_names( @client_pkgs[:reserved_names] ) if @client_pkgs.has_key?(:reserved_names)
          client_pkg.del_gfx_formats(    @client_pkgs[:gfx_formats   ] ) if @client_pkgs.has_key?(:gfx_formats   )
          client_pkg.del_themes(         @client_pkgs[:theme_names   ] ) if @client_pkgs.has_key?(:theme_names   )
          client_pkg.del_compounds(      @client_pkgs[:compound_packages] ) if @client_pkgs.has_key?(:compound_packages)
          client_pkg.del_packages(       @client_pkgs[:packages].keys  ) if @client_pkgs.has_key?(:packages      )
          client_pkg.rebuild_client
        end
        @client_pkgs = false
      end
      
      # @private calls install_client_pkgs, if a 'client_pkgs.yaml' file is found
      def open
        super
        install_client_pkgs if File.exist? bundle_path( 'client_pkgs.yaml' )
      end
      
      # @private calls uninstall_client_pkgs, if a 'client_pkgs.yaml' file was loaded
      # and transporter is online
      def close
        super
        if RSence.transporter.online? and @client_pkgs
          uninstall_client_pkgs
        end
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
