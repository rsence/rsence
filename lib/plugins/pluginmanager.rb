##   Riassence Framework
 #   Copyright 2006 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##


def eval_bundle( params )
  src_path = params[:src_path]
  mod = Module.new do |m|
    @@bundle_path    = params[:bundle_path   ]
    @@bundle_name    = params[:bundle_name   ]
    @@bundle_info    = params[:bundle_info   ]
    @@plugin_manager = params[:plugin_manager]
    if params[:bundle_info][:inits_self] == false
      m::module_eval( File.read(src_path) )
    elsif params[:bundle_info][:reloadable] == false
      require src_path[0..-4]
    else
      load src_path
    end
  end
  return mod
end

module Riassence
module Server

# Contains the PluginUtil module which has common methods for the bundle classes
require 'plugins/plugin_util'

# plugin.rb contains the Plugin skeleton class
require 'plugins/plugin'

# guiparser.rb contains the Yaml serializer for gui trees.
# It uses JSONRenderer on the client to build user interfaces.
require 'plugins/guiparser'

# gui_plugin.rb is an extension of Plugin that uses
# GUIParser to init the gui automatically.
require 'plugins/gui_plugin'

# plugin_sqlite_db.rb contains automatic local sqlite database
# creation for a plugin that includes it.
require 'plugins/plugin_sqlite_db'

# servlet includes the Servlet class, for handling any requests / responses
require 'plugins/servlet'

## = Abstract
## PluginManager is the service that loads and provides method delegation
## amongst all installed plugins.
##
## = Usage
## plugin_paths = [ 'plugins', '/home/me/rsence/plugins' ]
## myPluginManager = Riassence::Server::PluginManager.new( plugin_paths )
##
class PluginManager
  
  attr_reader :transporter, :sessions
  
  # Initialize with a list of directories as plugin_paths.
  # It's an array containing all plugin directories to scan.
  def initialize( transporter, plugin_paths )
    @transporter = transporter
    @sessions = transporter.sessions
    @plugin_paths = plugin_paths
    puts "Loading plugins..."
    scan_plugins
    puts "Plugins loaded."
    puts "Riassence Framework is online."
    if $DEBUG_MODE
      @thr = Thread.new do
        Thread.pass
        while true
          begin
            changed_plugins!
          rescue => e
            warn e.inspect
          end
          sleep 3
        end
      end
    end
  end
  
  def method_missing( sym, *args, &block )
    if @registry.has_key?(sym)
      if args == [] and block == nil
        return @registry[sym]
      elsif block == nil
        call( sym, *args )
      end
    end
  end
  
  def changed_plugins!
    @plugin_paths.each do |path|
      next unless File.directory? path
      Dir.entries(path).each do |bundle_name|
        next if bundle_name =~ /&\./
        bundle_path = File.expand_path( File.join( path, bundle_name ) )
        next unless File.directory?( bundle_path )
        bundle_file = bundle_name+'.rb'
        next unless File.exists?( File.join( bundle_path, bundle_file ) )
        if File.exists?( File.join( bundle_path, 'disabled' ) )
          if @registry.has_key?( bundle_name.to_sym )
            puts "Disabling bundle #{bundle_name}..."
            unload_bundle( bundle_name.to_sym )
            if ARGV.include?('-say')
              Thread.new do
                Thread.pass
                system(%{say "Unloaded #{bundle_name.to_s}."})
              end
            end
          end
        else
          if not @registry.has_key?( bundle_name.to_sym )
            puts "Loading bundle #{bundle_name}..."
            load_bundle( bundle_path, bundle_name.to_sym, bundle_name+'.rb' )
            call( bundle_name.to_sym, :open )
            if ARGV.include?('-say')
              Thread.new do
                Thread.pass
                system(%{say "Loaded #{bundle_name.to_s}."})
              end
            end
          else
            # puts "Checking if bundle #{bundle_name} is changed..."
            info = @info[bundle_name.to_sym]
            if info[:reloadable] and plugin_changed?( bundle_name.to_sym )
              puts "Bundle #{bundle_name} has changed, reloading..."
              unload_bundle( bundle_name.to_sym )
              load_bundle( bundle_path, bundle_name.to_sym, bundle_name+'.rb' )
              call( bundle_name.to_sym, :open )
              if ARGV.include?('-say')
                Thread.new do
                  Thread.pass
                  system(%{say "Reloaded #{bundle_name.to_s}."})
                end
              end
            end
          end
        end
      end
    end
  end
  
  def unload_bundle( bundle_name )
    if @registry.has_key?( bundle_name )
      call( bundle_name, :flush )
      call( bundle_name, :close )
      @registry.delete( bundle_name )
      @aliases.each do |a_name,b_name|
        if b_name == bundle_name
          @aliases.delete( a_name )
        end
      end
      if @servlets.include?( bundle_name )
        @servlets.delete( bundle_name )
      end
      if @info.include?( bundle_name )
        @info.delete( bundle_name )
      end
    end
  end
  
  def plugin_changed?( plugin_name )
    info = @info[plugin_name]
    last_changed = info[:last_changed]
    newest_change = most_recent( info[:path], last_changed )
    return last_changed < newest_change
  end
  
  # Top-level method for scanning all plugin directories.
  # Clears previously loaded plugins.
  def scan_plugins
    @registry = {}
    @info     = {}
    @aliases  = {}
    @servlets = []
    # @types    = {
    #   :gui     => [],
    #   :plugin  => [],
    #   :servlet => []
    # }
    @plugin_paths.each do |path|
      next unless File.directory? path
      scan_plugindir( path )
    end
    delegate( :open )
  end
  
  def registry( plugin_name )
    return @registry[ plugin_name ]
  end
  alias [] registry
  
  # Scans a directory of plugins, calls +load_plugin+ for bundles that match
  # the definition of a plugin bundle.
  #  - Skips bundles starting with a dot
  #  - Skips bundles without a ruby source file with the same
  #    name as the directory (plus '.rb').
  #  - Skips bundles containing a file or directory named 'disabled'
  def scan_plugindir( path )
    Dir.entries(path).each do |bundle_name|
      # puts "bundle_name: #{bundle_name}"
      next if bundle_name[0].chr == '.'
      bundle_path = File.expand_path( File.join( path, bundle_name ) )
      # puts "#{File.stat(bundle_path).inspect}"
      next unless File.directory?( bundle_path )
      bundle_file = bundle_name+'.rb'
      next unless File.exists?( File.join( bundle_path, bundle_file ) )
      next if File.exists?( File.join( bundle_path, 'disabled' ) )
      
      load_bundle( bundle_path, bundle_name.to_sym, bundle_file )
    end
  end
  
  # Finds the most recent file in the path
  def most_recent( bundle_path, newest_date=0 )
    path_date = File.stat( bundle_path ).mtime.to_i
    if path_date > newest_date
      # puts "File is newer: #{bundle_path}"
      newest_date = path_date
    end
    if File.directory?( bundle_path )
      Dir.entries( bundle_path ).each do |entry_name|
        next if entry_name[0].chr == '.'
        full_path = File.join( bundle_path, entry_name )
        unless File.directory?( full_path )
          next unless entry_name.include?('.') and ['yaml','rb'].include?( entry_name.split('.')[-1] )
        end
        newest_date = most_recent( full_path, newest_date )
      end
    end
    return newest_date
  end
  
  # Gets plugin information
  def bundle_info( bundle_path )
    
    bundle_name = File.split( bundle_path )[1]
    
    # Default bundle information
    info = {
      # The human-readable product name of the package
      :title => bundle_name.capitalize,
      
      # The human-readable version of the package
      :version => '0.0.0',
      
      # A brief description of the package (rdoc formatting supported)
      :description => 'No Description given',
      
      # A flag (when false) prevents the plugin from automatically reload when changed.
      :reloadable => true,
      
      # A flag (when false) enables automatic construction
      # of the Plugin and Servlet classes contained.
      :inits_self => true,
      
      # System version requirement.
      :sys_version => '>= 1.0.0',
      
      # Path to bundle
      :path => bundle_path,
      
      # Name of bundle
      :name => bundle_name.to_sym,
      
      # Last change
      :last_changed => most_recent( bundle_path  )
      
    }
    
    info_path = File.join( bundle_path, 'info.yaml' )
    if File.exists?( info_path )
      info_yaml = YAML.load( File.read( info_path ) )
      info_yaml.each do |info_key,info_value|
        info[ info_key.to_sym ] = info_value
      end
    end
    return info
    
  end
  
  # Loads a plugin bundle.
  def load_bundle( bundle_path, bundle_name, bundle_file )
    
    if @registry.has_key?( bundle_name.to_sym )
      warn "Warning: Bundle #{bundle_name} already loaded."
      return
    end
    
    bundle_file_path = File.join( bundle_path, bundle_file )
    
    bundle_info = bundle_info( bundle_path )
    
    @info[bundle_name.to_sym] = bundle_info
    
    bundle_src = File.read( bundle_file_path )
    
    if RUBY_VERSION.to_f >= 1.9
      src_path = bundle_file_path
      plugin_manager = self
      module_ns = Module.new do |m|
        @@bundle_path    = bundle_path
        @@bundle_name    = bundle_name
        @@bundle_info    = bundle_info
        @@plugin_manager = plugin_manager
        def m.bundle_path; @@bundle_path; end
        # puts "using eval"
        # m::module_eval( File.read(src_path) )
        # puts "using require"
        # require src_path[0..-4]
        puts "using load"
        load src_path
      end
    else
      module_ns         = eval_bundle( {
        :bundle_path    => bundle_path,
        :bundle_name    => bundle_name,
        :bundle_info    => bundle_info,
        :plugin_manager => self,
        :src_path       => bundle_file_path,
        :src            => bundle_src
      } )
    end
    
    unless bundle_info[:inits_self]
      # puts "#{bundle_name}: #{module_ns.constants.inspect}"
      module_ns.constants.each do |module_const_name|
        module_const = module_ns.const_get( module_const_name )
        if module_const.class == Class
          # puts "is class"
          module_const.ancestors.each do |ancestor|
            # puts "ancestor: #{ancestor.to_s.inspect}"
            if ancestor.to_s == "Servlet"
              module_const.new
              break
            elsif ancestor.to_s == "Plugin"
              module_const.new.register( bundle_name )
              break
            elsif ancestor.to_s == "Object"
              puts "Can't init class: #{module_const.to_s}"
              break
            end
          end
        end
      end
    end
  end
  
  def register_bundle( inst, bundle_name )
    bundle_name = bundle_name.to_sym
    if @registry.has_key?( bundle_name )
      if registry[ bundle_name ] != inst
        warn "Tried to register a conflicting bundle name: #{bundle_name.inspect}; ignoring"
      else
        warn "Use @plugins.register_alias to register more than one name per plugin."
        register_alias( inst.name.to_sym, bundle_name )
      end
    else
      inst.init if inst.respond_to? :init and not inst.inited
      @registry[ bundle_name ] = inst
      if inst.respond_to?( :match )
        @servlets.push( bundle_name )
      end
    end
  end
  
  def register_alias( bundle_name, alias_name )
    if @aliases.has_key?( alias_name.to_sym )
      warn "Alias already taken: #{alias_name.inspect}"
    else
      @aliases[ alias_name ] = bundle_name.to_sym
    end
  end
  
  def plugin_error( e, err_location, err_location_descr, eval_repl=false )
    err_msg = [
      "*"*40,
      err_location,
      err_location_descr,
      "#{e.class.to_s}, #{e.message}",
      "Backtrace:",
      "\t"+e.backtrace.join("\n\t"),
      "*"*40
    ].join("\n")+"\n"
    puts
    puts "eval repl: #{eval_repl}"
    puts
    if eval_repl
      err_msg = err_msg.gsub('from (eval):',"from #{eval_repl}:")
    end
    $stderr.write( err_msg )
  end
  
  def match_servlet_uri( uri, req_type=:get )
    match_score = {}
    @servlets.each do | servlet_name |
      servlet = @registry[ servlet_name ]
      next unless servlet.respond_to?( req_type )
      begin
        if servlet.match( uri, req_type )
          score = servlet.score
          match_score[ score ] = [] unless match_score.has_key? score
          match_score[ score ].push( servlet_name )
        end
      rescue => e
        plugin_error(
          e,
          "Riassence::Server::PluginManager.match_servlet_uri",
          "servlet: #{servlet_name.inspect}, req_type: #{req_type.inspect}, uri: #{uri.inspect}",
          servlet_name
        )
      end
    end
    match_scores = match_score.keys.sort
    if match_scores.empty?
      return false
    else
      matches_order = []
      matches_best  = match_score[ match_scores[0] ]
      if matches_best.size > 1
        matches_best = matches_best[ rand( matches_best.size ) ]
      else
        matches_best = matches_best.first
      end
      matches_order.push( matches_best )
      match_score.keys.sort.each do |match_n|
        match_score[ match_n ].each do | match_name |
          matches_order.push( match_name ) unless matches_order.include? match_name
        end
      end
      return matches_order
    end
  end
  
  def delegate( method_name, *args )
    @registry.each do | plugin_name, plugin |
      if plugin.respond_to?( method_name )
        plugin.send( method_name, *args  )
      end
    end
  end
  
  def shutdown
    delegate( :flush )
    delegate( :close )
  end
  
  def call( plugin_name, method_name, *args )
    plugin_name = plugin_name.to_sym
    if @registry.has_key?( plugin_name )
      if @registry[ plugin_name ].respond_to?( method_name )
        return @registry[ plugin_name ].send( method_name, *args )
      else
        puts "No method #{method_name.inspect} for plugin #{plugin_name.inspect}"
        return false
      end
    else
      puts "No such plugin: #{plugin_name.inspect}"
      return false
    end
  end
  
  alias run_plugin call
  
  def match_servlet( req_type, req, resp, session )
    req_uri = req.fullpath
    matches_order = match_servlet_uri( req_uri, req_type )
    return false unless matches_order
    matches_order.each do |servlet_name|
      begin
        @registry[servlet_name].send( req_type, req, resp, session )
        return true
      rescue => e
        plugin_error(
          e,
          "Riassence::Server::PluginManager.match_servlet",
          "servlet_name: #{servlet_name.inspect}, req_type: #{req_type.inspect}",
          servlet_name
        )
        next
      end
    end
    return false
  end
  
end

end
end
