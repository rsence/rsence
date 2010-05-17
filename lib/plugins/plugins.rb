##   RSence
 #   Copyright 2009 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##

# unless RUBY_VERSION.to_f >= 1.9
#   module Kernel
#     def const_missing( name )
#       puts "const_missing: #{name.inspect}"
#       super
#     end
#   end
# end

# Contains the PluginUtil module which has common methods for the bundle classes
require 'plugins/plugin_util'

# plugin.rb contains the Plugin skeleton class
# servlet includes the Servlet class, for handling any requests / responses
# if RUBY_VERSION.to_f >= 1.9
module ::RSence
  module Plugins
    require 'plugins/plugin'
    def self.PluginMaker
      lambda do |ns|
        klass = Class.new( PluginTemplate ) do
          # include PluginMod
          def self.ns=(ns)
            define_method( :bundle_info ) do
              ns.bundle_info
            end
            # define_method( :bundle_name ) do
            #   ns.bundle_name
            # end
            # define_method( :bundle_path ) do
            #   ns.bundle_path
            # end
            # define_method( :plugin_manager ) do
            #   ns.plugin_manager
            # end
          end
        end
        klass.ns = ns if ns
        puts "Plugin.bundle_type = #{klass.bundle_type}"
        klass
      end
    end
  end
end
# else
#   require 'plugins/plugin'
# end

# guiparser.rb contains the Yaml serializer for gui trees.
# It uses JSONRenderer on the client to build user interfaces.
require 'plugins/guiparser'

# gui_plugin.rb is an extension of Plugin that uses
# GUIParser to init the gui automatically.
module ::RSence
  module Plugins
    require 'plugins/gui_plugin'
    def self.GUIPluginMaker
      lambda do |ns|
        klass = Class.new( GUIPluginTemplate ) do
          # include ServletMod
          def self.ns=(ns)
            define_method( :bundle_info ) do
              ns.bundle_info
            end
            # define_method( :bundle_name ) do
            #   ns.bundle_name
            # end
            # define_method( :bundle_path ) do
            #   ns.bundle_path
            # end
            # define_method( :plugin_manager ) do
            #   ns.plugin_manager
            # end
          end
        end
        klass.ns = ns if ns
        puts "GUIPlugin.bundle_type = #{klass.bundle_type}"
        klass
      end
    end
  end
end

# plugin_sqlite_db.rb contains automatic local sqlite database
# creation for a plugin that includes it.
require 'plugins/plugin_sqlite_db'

# servlet includes the Servlet class, for handling any requests / responses
# if RUBY_VERSION.to_f >= 1.9
module ::RSence
  module Plugins
    require 'plugins/servlet'
    def self.ServletMaker
      lambda do |ns|
        klass = Class.new( ServletTemplate ) do
          # include ServletMod
          def self.ns=(ns)
            define_method( :bundle_info ) do
              ns.bundle_info
            end
            # define_method( :bundle_name ) do
            #   ns.bundle_name
            # end
            # define_method( :bundle_path ) do
            #   ns.bundle_path
            # end
            # define_method( :plugin_manager ) do
            #   ns.plugin_manager
            # end
          end
        end
        klass.ns = ns if ns
        puts "Servlet.bundle_type = #{klass.bundle_type}"
        klass
      end
    end
  end
end
# else
#   class Servlet
#     instance_eval File.read( 'plugins/servlet.rb' )
#   end
# end

# Interface for plugins in a plugin bundle
require 'plugins/plugin_plugins'

module ::RSence
module Plugins
  def self.bundle_loader( params )
  #   if RUBY_VERSION.to_f >= 1.9
  #     bundle_loader19( params )
  #   else
  #     bundle_loader18( params )
  #   end
  # end
  # def self.bundle_loader19( params )
    src_path = params[:src_path]
    begin
      mod = Module.new do |m|
        # @@bundle_path    = params[:bundle_path   ]
        # @@bundle_name    = params[:bundle_name   ]
        # @@bundle_info    = params[:bundle_info   ]
        # @@plugin_manager = params[:plugin_manager]
        if RUBY_VERSION.to_f >= 1.9
          m.define_singleton_method( :bundle_path ) do
            params[:bundle_path]
          end
        # else
          # puts m.private_methods.inspect
          # m.send( :define_method, :bundle_path ) do
          #   params[:bundle_path]
          # end
        end
        # def self.bundle_path; @@bundle_path; end
        # def self.bundle_info; @@bundle_info; end
        # def self.bundle_name; @@bundle_name; end
        # def self.plugin_manager; @@plugin_manager; end
        def self.inspect; "#<module BundleWrapper of #{@@bundle_name}}>"; end
        def self.const_missing( name )
          if name == :Servlet
            return Plugins.ServletMaker.call( self )
          elsif name == :ServletPlugin
            warn "'ServletPlugin' is deprecated, use 'Servlet' instead."
            return Plugins.ServletMaker.call( self )
          elsif name == :Plugin
            return Plugins.PluginMaker.call( self )
          elsif name == :GUIPlugin
            return Plugins.GUIPluginMaker.call( self )
          else
            warn "Known const missing: #{name.inspect}"
            super
          end
        end
        # def self.load_bundle( src_path )
        
        plugin_src = File.read( src_path )
        unless RUBY_VERSION.to_f >= 1.9
          plugin_src = ["bundle_path = #{params[:bundle_path].inspect}", plugin_src].join("\n")
        end
        m.module_eval( plugin_src )
          # if params[:bundle_info][:inits_self] == false
          #   puts "using module_eval" if RSence.args[:debug]
          #   plugin_src = File.read( src_path )
          #   self.module_eval( plugin_src )
          # elsif params[:bundle_info][:reloadable] == false # and not RUBY_VERSION.to_f >= 1.9
          #   puts "using require" if RSence.args[:debug]
          #   require src_path[0..-4]
          # else
          #   puts "using load" if RSence.args[:debug]
          # end
        # end
        # end
      end
      # mod.load_bundle( src_path )
      return mod
    rescue => e
      params[:plugin_manager].plugin_error(
        e,
        'BundleLoaderError',
        "An error occurred while loading the plugin bundle #{params[:bundle_name]}.",
        src_path
      )
    end
  end
end
end

# def bundle_loader18( params )
#   src_path = params[:src_path]
#   mod = Module.new do |m|
#     @@bundle_path    = params[:bundle_path   ]
#     @@bundle_name    = params[:bundle_name   ]
#     @@bundle_info    = params[:bundle_info   ]
#     @@plugin_manager = params[:plugin_manager]
#     def self.inspect; "#<module BundleWrapper of #{@@bundle_name}}>"; end
#     begin
#       if params[:bundle_info][:inits_self] == false
#         m::module_eval( File.read(src_path) )
#       elsif params[:bundle_info][:reloadable] == false
#         require src_path[0..-4]
#       else
#         load src_path
#       end
#       exit
#     rescue => e
#       @@plugin_manager.plugin_error(
#         e,
#         'BundleLoaderError',
#         "An error occurred while loading the plugin bundle #{@@bundle_name}.",
#         @@bundle_path
#       )
#       exit
#     end
#   end
#   return mod
# end

=begin
def bundle_loader18( params )
  src_path = params[:src_path]
  begin
    mod = Module.new do |m|
      @@bundle_path    = params[:bundle_path   ]
      @@bundle_name    = params[:bundle_name   ]
      @@bundle_info    = params[:bundle_info   ]
      @@plugin_manager = params[:plugin_manager]
      def m.bundle_path; @@bundle_path; end
      def m.bundle_info; @@bundle_info; end
      def m.bundle_name; @@bundle_name; end
      def m.plugin_manager; @@plugin_manager; end
      def m.inspect; "#<module BundleWrapper of #{@@bundle_name}}>"; end
      def Servlet( ns=false )
        puts "----- Servlet";
        Plugins.Servlet( self )
      end
      def ServletPlugin( ns=false )
        Plugins.Servlet( ns || self )
      end
      def Plugin( ns=false )
        Plugins.Plugin( ns || self )
      end
      def GUIPlugin( ns=false )
        Plugins.GUIPlugin( ns || self )
      end
      plugin_src = File.read( src_path )
      m.module_eval( plugin_src )
        # def self.load_bundle( src_path, inits_self, reloadable )
        #   # if RUBY_VERSION.to_f < 1.9
        #   #   puts "--- Setting ns: #{Plugin.inspect}"
        #   #   Servlet.ns = self
        #   #   Plugin.ns = self
        #   #   GUIPlugin.ns = self
        #   # end
        #   # if inits_self == false
        #     puts "using module_eval" if RSence.args[:debug]
        #     plugin_src = File.read( src_path )
        #     self.module_eval( plugin_src )
        #   # elsif reloadable == false # and not RUBY_VERSION.to_f >= 1.9
        #   #   puts "using require" if RSence.args[:debug]
        #   #   require src_path[0..-4]
        #   # else
        #   #   puts "using load" if RSence.args[:debug]
        #   #   load src_path
        #   # end
        # end
    end
    return mod
  rescue => e
    params[:plugin_manager].plugin_error(
      e,
      'BundleLoaderError',
      "An error occurred while loading the plugin bundle #{params[:bundle_name]}.",
      src_path
    )
  end
end
=end