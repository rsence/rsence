##   RSence
 #   Copyright 2006 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##
require 'plugins/plugins'
require 'plugins/dependencies'

module RSence
  
  ## = Abstract
  ## PluginManager is the service that loads and provides method delegation
  ## amongst its plugin bundles.
  ##
  ## = Usage
  ## plugin_paths = [ 'plugins', '/home/me/rsence/plugins' ]
  ## myPluginManager = RSence::PluginManager.new( plugin_paths )
  ##
  class PluginManager
    
    attr_reader :transporter, :sessions
    
    # Returns the registry data for plugin bundle +plugin_name+
    def registry( plugin_name )
      return @registry[ plugin_name ]
    end
    alias [] registry
    
    # By default, calling a method not defined calls a plugin of that name
    def method_missing( sym, *args, &block )
      if @registry.has_key?(sym)
        if args == [] and block == nil
          return @registry[sym]
        elsif block == nil
          call( sym, *args )
        end
      end
    end
    
    # Registers alias name for a plugin bundle.
    def register_alias( bundle_name, alias_name )
      if @aliases.has_key?( alias_name.to_sym )
        warn "Alias already taken: #{alias_name.inspect}"
      else
        @aliases[ alias_name ] = bundle_name.to_sym
      end
    end
    
    # Registers plugin class +inst+ into the registry using +bundle_name+
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
        if inst.respond_to?( :match ) and ( inst.respond_to?( :get ) or inst.respond_to?( :post ) )
          @servlets.push( bundle_name )
        end
      end
    end
    
    # Calls the method +method_name+ with args +args+ of the plugin +plugin_name+.
    # Returns false, if no such plugin or method exists.
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
    
    # Prettier error handling.
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
      if eval_repl
        puts
        puts "plugin: #{eval_repl}"
        puts
        err_msg = err_msg.gsub(/^\t\(eval\)\:/s,"\t#{eval_repl}:")
      end
      $stderr.write( err_msg )
    end
    
    # Search servlets that match the +uri+ and +req_type+
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
            "RSence::PluginManager.match_servlet_uri",
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
    
    # Calls the servlet that matches the +req_type+ and +req.fullpath+ with
    # the highest score.
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
            "RSence::PluginManager.match_servlet",
            "servlet_name: #{servlet_name.inspect}, req_type: #{req_type.inspect}",
            servlet_name
          )
          next
        end
      end
      return false
    end
    
    # Delegates +method_name+ with +args+ to any loaded
    # plugin that responds to the method.
    def delegate( method_name, *args )
      @registry.each do | plugin_name, plugin |
        if plugin.respond_to?( method_name )
          begin
            plugin.send( method_name, *args  )
          rescue => e
            plugin_error(
              e,
              "RSence::PluginManager.delegate error",
              "plugin_name: #{plugin_name.inspect}, method_name: #{method_name.inspect}",
              plugin_name
            )
          end
        end
      end
    end
    
    # Delegates the +flush+ and +close+ methods to any
    # loaded plugins, in that order.
    def shutdown
      delegate( :flush )
      delegate( :close )
    end
    
    # Finds the most recent file in the path
    def most_recent( bundle_path, newest_date=0 )
      path_date = File.stat( bundle_path ).mtime.to_i
      is_dir = File.directory?( bundle_path )
      if path_date > newest_date and not is_dir
        newest_date = path_date
      end
      if is_dir
        Dir.entries( bundle_path ).each do |entry_name|
          next if entry_name[0].chr == '.'
          full_path = File.join( bundle_path, entry_name )
          unless File.directory?( full_path )
            has_dot = entry_name.include?('.')
            next unless has_dot
            is_src_file = ['yaml','rb'].include?( entry_name.split('.')[-1] )
            next unless is_src_file
          end
          newest_date = most_recent( full_path, newest_date )
        end
      end
      return newest_date
    end
    
    # Gets plugin information
    def bundle_info( bundle_path, bundle_name, src_file )
      
      # Default bundle information
      info = {
        
        # The human-readable product name of the package
        :title => bundle_name.to_s.capitalize,
        
        # The human-readable version of the package
        :version => '0.0.0',
        
        # A brief description of the package (rdoc formatting supported)
        :description => 'No Description',
        
        # A flag (when false) prevents the plugin from automatically reload when changed.
        :reloadable => true,
        
        # System version requirement.
        # NOTE: Has no effect yet!
        :sys_version => '>= 1.0.0',
        
        # Dependency, by default the system category (built-in plugins).
        # A nil ( "~" in yaml ) value means no dependencies.
        :depends_on     => :system,
        
        # Optional, name of category. The built-in plugins are :system
        :category       => nil,
        
        # Optional, name of plugin to replace
        # NOTE: Has no effect yet!
        :replaces       => nil,
        
        # Optional, reverse dependency. Loads before the prepended plugin(category).
        # NOTE: Doesn't support packages yet!
        :prepends       => nil
        
      }
      
      # Merge info.yaml data into info
      info_path = File.join( bundle_path, 'info.yaml' )
      if File.exists?( info_path )
        info_yaml = YAML.load( File.read( info_path ) )
        info_yaml.each do |info_key,info_value|
          info[ info_key.to_sym ] = info_value
        end
      else
        warn "Expected info.yaml, using defaults:"
        warn "  #{info_path}"
      end
      
      @deps.set_deps( bundle_name, info[:depends_on] )
      if info[:category]
        if info[:category].class == Symbol
          @categories.push( info[:category] ) unless @categories.include?( info[:category] )
          @deps.set_deps( info[:category], bundle_name )
        else
          warn "Invalid category: #{info[:category].inspect}"
        end
      end
      if info[:prepends]
        if info[:prepends].class == Array
          info[:prepends].each do |prep|
            @deps.set_deps( prep, bundle_name )
          end
        else
          @deps.set_deps( info[:prepends], bundle_name )
        end
      end
      
      # Extra information, not overrideable in info.yaml
      
      # Path of bundle
      info[:path] = bundle_path
        
      # Name of bundle
      info[:name] = bundle_name
        
      # Full path of source file
      info[:src_file] = src_file
        
      # Timestamp of last changed file
      info[:last_changed] = most_recent( bundle_path )
      
      # ..however, don't accept future timestamps:
      time_now = Time.now.to_i
      info[:last_changed] = time_now if info[:last_changed] > time_now
      
      return info
    end
    
    # Loads a plugin bundle.
    def load_bundle( name )
      if @registry.has_key?( name )
        warn "Warning: Bundle #{name} already loaded."
        return
      end
      puts "loading bundle: #{name.inspect}" if RSence.args[:debug]
      
      info = @info[ name ]
      
      path = info[:path]
      src_file = info[:src_file]
      
      bundle_src = File.read( src_file )
      
      module_ns         = Plugins.bundle_loader( {
        :bundle_path    => path,
        :bundle_name    => name,
        :bundle_info    => info,
        :plugin_manager => self,
        :src_path       => src_file,
        :src            => bundle_src
      } )
      
      module_ns.constants.each do |module_const_name|
        module_const = module_ns.const_get( module_const_name )
        if module_const.class == Class
          type = module_const.bundle_type
          if [:Servlet, :Plugin, :GUIPlugin].include? type
            bundle_inst = module_const.new( name, info, path, self )
            bundle_inst.register( name ) if [ :Plugin, :GUIPlugin ].include?( type )
            break
          else
            warn "Can't init class: #{module_const.to_s}"
            break
          end
        else
          warn "Invalid module_const.class: #{module_const.class.inspect}"
        end
      end
    end
    
    # loads all bundles found in order of dependency
    def load_bundles
      @deps.list.each do |name|
        load_bundle( name ) unless @categories.include?( name )
      end
    end
    
    # If a bundle is found, set its dependencies etc
    def bundle_found( bundle_path, bundle_name, src_file )
      @info[ bundle_name ] = bundle_info( bundle_path, bundle_name, src_file )
    end
    
    # Returns false, if the plugin directory isn't valid.
    # Returns [bundle_path, src_file] otherwise.
    def valid_plugindir?( path, bundle_name )
      return false if bundle_name[0].chr == '.'
      bundle_path = File.expand_path( File.join( path, bundle_name ) )
      return false unless File.directory?( bundle_path )
      bundle_file = bundle_name+'.rb'
      src_file = File.join( bundle_path, bundle_file )
      if not File.exists?( src_file )
        bundle_file = 'main.rb'
        src_file = File.join( bundle_path, bundle_file )
        return false unless File.exists?( src_file )
      end
      return [ bundle_path, src_file ]
    end
    
    # Returns true, if the bundle is disabled
    def is_disabled?( bundle_path )
      File.exists?( File.join( bundle_path, 'disabled' ) )
    end
    
    # Returns true, if the bundle is loaded.
    def is_loaded?( bundle_name )
      @registry.has_key?( bundle_name )
    end
    
    # Scans a directory of plugins, calls +load_plugin+ for bundles that match
    # the definition of a plugin bundle.
    #  - Skips bundles starting with a dot
    #  - Skips bundles without a ruby source file with the same
    #    name as the directory (plus '.rb').
    #  - Skips bundles containing a file or directory named 'disabled'
    def scan_plugindir( path )
      bundles_found = []
      Dir.entries(path).each do |bundle_name|
        bundle_status = valid_plugindir?( path, bundle_name )
        if bundle_status
          (bundle_path, src_file) = bundle_status
          bundles_found.push( [bundle_path, bundle_name.to_sym, src_file] )
        end
      end
      return bundles_found
    end
    
    # Top-level method for scanning all plugin directories.
    # Clears previously loaded plugins.
    def scan_plugins
      @registry = {} # bundle_name => bundle_instance mapping
      @info     = {} # bundle_name => bundle_info mapping
      @aliases  = {} # bundle_alias => bundle_name mapping
      @servlets = [] # bundle_name list of Servlet class instances
      @categories = [] # list of categories
      bundles_found = []
      @plugin_paths.each do |path|
        next unless File.directory? path
        bundles_found += scan_plugindir( path )
      end
      bundles_found.each do |bundle_path, bundle_name, src_file|
        unless is_disabled?( bundle_path )
          bundle_found( bundle_path, bundle_name, src_file )
        end
      end
      load_bundles
      delegate( :open )
    end
    
    # Unloads the plugin bundle named +bundle_name+
    def unload_bundle( bundle_name )
      puts "unloading bundle: #{bundle_name.inspect}" if RSence.args[:debug]
      if @registry.has_key?( bundle_name )
        online_status = @transporter.online?
        @transporter.online = false
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
        @transporter.online = online_status
      end
    end
    
    # Returns true, if a plugin bundle has changed.
    # Only compares timestamp, not checksum.
    def plugin_changed?( plugin_name )
      info = @info[plugin_name]
      last_changed = info[:last_changed]
      newest_change = most_recent( info[:path], last_changed )
      return last_changed < newest_change
    end
    
    # Logs and speaks the message
    def say( message )
      puts message
      if RSence.args[:say]
        Thread.new do
          Thread.pass
          system(%{say "#{message.gsub('"','')}"})
        end
      end
    end
    
    # Checks for changed plugin bundles and unloads/loads/reloads them accordingly.
    def changed_plugins!
      begin
        bundles_found = []
        @plugin_paths.each do |path|
          bundles_found += scan_plugindir( path )
        end
        bundle_names_found = []
        bundles_found.each do |bundle_path, bundle_name, src_file|
          bundle_names_found.push( bundle_name )
          is_loaded = is_loaded?( bundle_name )
          if is_loaded and is_disabled?( bundle_path )
            # bundle already loaded but disabled now, should be unloaded:
            unload_bundle( bundle_name )
            say( "Unloaded #{bundle_name}." )
          elsif is_loaded and plugin_changed?( bundle_name )
            # bundle changed, should be reloaded:
            unload_bundle( bundle_name )
            @info[bundle_name] = bundle_info( bundle_path, bundle_name, src_file )
            load_bundle( bundle_name )
            say( "Reloaded #{bundle_name}." )
          elsif not is_loaded
            # bundle not loaded, should be loaded:
            @info[bundle_name] = bundle_info( bundle_path, bundle_name, src_file )
            load_bundle( bundle_name )
            say( "Loaded #{bundle_name}." )
          end
        end
        bundles_missing = @info.keys - bundle_names_found
        bundles_missing.each do |bundle_name|
          say( "#{bundle_name} deleted, unloading.." )
          unload_bundle( bundle_name )
        end
      rescue => e
        plugin_error(
          e,
          "RSence::PluginManager.changed_plugins! error",
          "---"
        )
      end
    end
    
    # Initialize with a list of directories as plugin_paths.
    # It's an array containing all plugin directories to scan.
    def initialize( plugin_paths, transporter=nil,
                    autoreload=false, name_prefix=false,
                    resolved_deps=[] )
      if transporter
        @transporter = transporter
        @sessions    = transporter.sessions
      end
      @name_prefix = name_prefix
      @plugin_paths = plugin_paths
      @deps = Dependencies.new( resolved_deps )
      puts "Loading #{name_prefix+' ' if name_prefix}plugins..." if RSence.args[:verbose]
      scan_plugins
      puts %{Plugins #{"of #{name_prefix} " if name_prefix}loaded.} if RSence.args[:verbose]
      if autoreload
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
  end
end




















