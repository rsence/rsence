
module RSence
  module Plugins
    
    class MultiGUIPlugin__ < GUIPlugin__

      include Localization
      
      def self.bundle_type; :MultiGUIPlugin; end
      
      def init
        super
        @other_guis = {}
        yaml_src = false
        [ 'gui_m.yaml' ].each do |yaml_name|
          yaml_src = file_read( yaml_name )
          break if yaml_src
        end
        if yaml_src
          @other_guis['m'] = GUIParser.new( self, yaml_src, @name )
        end
      end

      def gui_params( msg )
        gui = select_gui( msg )
        return unless gui
        params = super
        params[:values] = gui.values( get_ses( msg ) )
        params
      end
            
      def init_ui( msg )
        gui = select_gui( msg )
        return unless gui
        gui.init( msg, gui_params( msg ) )
      end
      
      def kill_ui( msg )
        gui = select_gui( msg )
        return unless gui
        gui.kill( msg )
      end

      def select_gui( msg )
        layout = msg.layout
        if layout and @other_guis.key?( layout[:name] )
          return @other_guis[ layout[:name] ]
        else
          return @gui
        end
      end
      
    end
  end
end
