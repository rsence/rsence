 
require 'rsence/plugins'
require 'rsence/dependencies'

module RSence
  
  ## PluginManager is the service that loads and provides method delegation
  ## amongst its plugin bundles.
  ##
  ## = Usage
  ##  plugin_paths = [ 'plugins', '/home/me/rsence/plugins' ]
  ##  myPluginManager = RSence::PluginManager.new( plugin_paths )
  ##
  class PluginManager
    
    attr_reader :transporter, :sessions
    
    @@incr = 0
    def incr
      return @@incr
    end
    def incr!
      @@incr += 1
    end
    
    # Returns the registry data for plugin bundle +plugin_name+
    def registry( plugin_name=false )
      return @registry unless plugin_name
      if @registry.has_key?( plugin_name )
        return @registry[ plugin_name ]
      elsif @parent_manager
        return @parent_manager.registry( plugin_name )
      else
        throw "Plugin not in registry: #{plugin_name.inspect}"
      end
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
      elsif @parent_manager
        return @parent_manager.method_missing( sym, *args, &block )
      end
      warn "method or plugin #{sym.inspect} not found!"
      nil
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
          add_servlet( bundle_name )
        end
      end
    end
    
    def add_servlet( bundle_name )
      if @parent_manager
        sub_name = "#{@name_prefix.to_s}:#{bundle_name.to_s}"
        @parent_manager.add_servlet( sub_name )
      end
      @servlets.push( bundle_name )
    end
    
    def del_servlet( bundle_name )
      if @parent_manager
        sub_name = "#{@name_prefix.to_s}:#{bundle_name.to_s}"
        @parent_manager.del_servlet( sub_name )
      end
      @servlets.delete( bundle_name )
    end
    
    def callable?( plugin_name, method_name )
      return false if @deps.category?( plugin_name )
      return false unless @registry.has_key?( plugin_name )
      plugin = @registry[plugin_name]
      return false unless plugin.respond_to?( method_name )
      return true
    end
    
    # Calls the method +method_name+ with args +args+ of the plugin +plugin_name+.
    # Returns false, if no such plugin or method exists.
    def call( plugin_name, method_name, *args )
      puts "#{plugin_name}.#{method_name}" if RSence.args[:trace_delegate]
      plugin_name_s = plugin_name.to_s
      if plugin_name_s.include?(':')
        colon_index = plugin_name_s.index(':')
        sub_manager_name = plugin_name_s[0..(colon_index-1)].to_sym
        plugin_name = plugin_name_s[(colon_index+1)..-1].to_sym
        if @registry.has_key?( sub_manager_name )
          sub_manager = @registry[sub_manager_name]
          if sub_manager.respond_to?( :plugin_plugins )
            return sub_manager.plugin_plugins.call( plugin_name, method_name, *args )
          end
        end
        return false
      end
      plugin_name = plugin_name.to_sym
      if callable?( plugin_name, method_name )
        begin
          return @registry[ plugin_name ].send( method_name, *args )
        rescue => e
          plugin_error(
            e,
            "RSence::PluginManager.call error",
            "plugin_name: #{plugin_name.inspect}, method_name: #{method_name.inspect}",
            plugin_name
          )
        end
      elsif @deps.category?( plugin_name )
        warn "Warning! Tried to call category: #{plugin_name.inpsect}"
      elsif not @registry.has_key?( plugin_name )
        warn "Warning (#{@pluginmanager_id})! No such plugin: #{plugin_name.inspect} (tried to call #{method_name.inspect[0..100]} using args: #{args.inspect[0..100]}"
      elsif not @registry[ plugin_name ].respond_to?( method_name )
        warn "Warning! Plugin: #{plugin_name.inspect} does not respond to #{method_name.inspect}"
      end
      return false
    end
    alias run_plugin call
    
    # Prettier error handling.
    @@prev_errors = []
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
      error_say = "Error! #{err_location_descr.capitalize}. #{e.class.to_s}, #{e.message}?"
      unless @@prev_errors.include?( error_say )
        @@prev_errors.push( error_say )
        say error_say
      end
      @@prev_errors.shift if @@prev_errors.length > 10
      if eval_repl
        puts
        puts "plugin: #{eval_repl}"
        puts
        begin
          err_msg = err_msg.gsub(/^\t\(eval\)\:/s,"\t#{eval_repl}:")
        rescue Encoding::CompatibilityError => e
          $stderr.write( "Encoding::CompatibilityError in plugin error eval!" )
        end
      end
      $stderr.write( err_msg )
    end
    
    # Search servlets that match the +uri+ and +req_type+
    def match_servlet_uri( uri, req_type=:get )
      match_score = {}
      @servlets.each do | servlet_name |
        if call( servlet_name, :match, uri, req_type )
          score = call( servlet_name, :score )
          match_score[ score ] = [] unless match_score.has_key? score
          match_score[ score ].push( servlet_name )
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
          call( servlet_name, req_type, req, resp, session )
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
      @deps.list.each do |plugin_name|
        call( plugin_name, method_name, *args ) if callable?( plugin_name, method_name )
      end
    end
    
    # Reverse delegate +method_name+ with +args+ to any loaded
    # plugin that responds to the method.
    def delegate_reverse( method_name, *args )
      @deps.list.reverse.each do |plugin_name|
        call( plugin_name, method_name, *args ) if callable?( plugin_name, method_name )
      end
    end
    
    # Delegates the +flush+ and +close+ methods to any
    # loaded plugins, in that order.
    def shutdown
      if @parent_manager
        @closed = true
      else
        @transporter.online = false
      end
      @deps.list.reverse.each do |bundle_name|
        unload_bundle( bundle_name )
      end
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
          next if entry_name[0].chr == '.' # skip hidden, '.' and '..' 
          full_path = File.join( bundle_path, entry_name )
          if File.directory?( full_path )
            next if entry_name == 'plugins' # skip sub-plugins
          else
            next unless entry_name.include?('.')
            next unless ['yaml','rb'].include?( entry_name.split('.')[-1] )
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
        :sys_version => '>= 2.2.0',
        
        # Dependency, by default the system category (built-in plugins).
        # A nil ( "~" in yaml ) value means no dependencies.
        :depends_on     => [ :system ],
        
        # Optional, name of category. The built-in plugins are :system
        :category       => nil,
        
        # Optional, name of plugin to replace
        # NOTE: Has no effect yet!
        :replaces       => nil,
        
        # Optional, reverse dependency. Loads before the prepended plugin(category).
        # NOTE: Doesn't support packages yet!
        :prepends       => nil,
        
        # Name of plugin manager, so the bundle internals know what its path is.
        :manager        => @name_prefix
        
      }
      
      # Merge info.yaml data into info
      info_path = File.join( bundle_path, 'info.yaml' )
      if File.exists?( info_path )
        info_yaml = YAML.load( File.read( info_path ) )
        info_yaml.each do |info_key,info_value|
          info[ info_key.to_sym ] = info_value
        end
      elsif RSence.args[:debug]
        warn "Expected info.yaml, using defaults:"
        warn "  #{info_path}"
      end
      
      @deps.set_deps( bundle_name, info[:depends_on] )
      if info[:category]
        if info[:category].class == Symbol
          @deps.add_category( info[:category] ) unless @deps.category?( info[:category] )
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
      
      # Extra information, not override-able in info.yaml
      
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
      
      if @deps.unresolved?(name)
        warn "Warning: Bundle #{name} has unmet dependencies."
        return
      end
      
      if @registry.has_key?( name )
        warn "Warning: Bundle #{name} already loaded."
        return
      end
      puts "Loading bundle: #{name.inspect}" if RSence.args[:debug]
      
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
          if [:Servlet, :Plugin, :GUIPlugin, :MultiGUIPlugin].include? type
            bundle_inst = module_const.new( name, info, path, self )
            bundle_inst.register( name ) if [ :Plugin, :GUIPlugin, :MultiGUIPlugin ].include?( type )
            break
          else
            warn "Can't init class: #{module_const.to_s}"
            break
          end
        else
          warn "Invalid module_const.class: #{module_const.class.inspect} in bundle path: #{path.inspect}"
        end
      end
    end
    
    # loads all bundles found in order of dependency
    def load_bundles
      @deps.list.each do |name|
        load_bundle( name ) if @deps.loadable?( name )
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
    def disabled?( bundle_path )
      File.exists?( File.join( bundle_path, 'disabled' ) )
    end
    
    # Returns true, if the bundle is loaded.
    def loaded?( bundle_name )
      @registry.has_key?( bundle_name )
    end
    
    # Scans a directory of plugins, calls +load_plugin+ for bundles that match
    # the definition of a plugin bundle.
    #  - Skips bundles starting with a dot
    #  - Skips bundles without a ruby source file with the same
    #    name as the directory (plus '.rb').
    #  - Skips bundles containing a file or directory named 'disabled'
    def find_bundles( path )
      bundles_found = []
      Dir.entries(path).each do |bundle_name|
        bundle_status = valid_plugindir?( path, bundle_name )
        if bundle_status
          (bundle_path, src_file) = bundle_status
          unless disabled?( bundle_path )
            # bundle_name = "#{@name_prefix.to_s}.#{bundle_name}" if @name_prefix
            bundles_found.push( [bundle_path, bundle_name.to_sym, src_file] )
          end
        end
      end
      return bundles_found
    end
    
    # Unloads the plugin bundle named +bundle_name+
    def unload_bundle( bundle_name )
      if @registry.has_key?( bundle_name )
        unload_order = @deps.del_order( bundle_name )
        unload_order.each do |unload_dep|
          unload_bundle( unload_dep ) unless unload_dep == bundle_name
        end
        puts "Unloading bundle: #{bundle_name.inspect}" if RSence.args[:debug]
        @deps.del_item( bundle_name )
        if @transporter
          online_status = @transporter.online?
          @transporter.online = false
        end
        call( bundle_name, :flush )
        call( bundle_name, :close )
        @registry.delete( bundle_name )
        @aliases.each do |a_name,b_name|
          if b_name == bundle_name
            @aliases.delete( a_name )
          end
        end
        if @servlets.include?( bundle_name )
          del_servlet( bundle_name )
        end
        if @info.include?( bundle_name )
          @info.delete( bundle_name )
        end
        @transporter.online = online_status if @transporter
        return unload_order
      end
    end
    
    # Returns true, if a plugin bundle has changed.
    # Only compares timestamp, not checksum.
    def changed?( plugin_name )
      info = @info[plugin_name]
      last_changed = info[:last_changed]
      newest_change = most_recent( info[:path], last_changed )
      return last_changed < newest_change
    end
    
    # Logs and speaks the message, if the speech synthesis command "say" exists.
    def say( message )
      puts message
      if RSence.args[:say]
        Thread.new do
          Thread.pass
          system(%{say "#{message.gsub('"',"'").gsub('`',"'")}"})
        end
      end
    end
    
    # Checks for changed plugin bundles and unloads/loads/reloads them accordingly.
    def update_bundles!
      (are_found, to_load, to_unload, to_reload) = [[],[],[],[]]
      found_map = {}
      @plugin_paths.each do |path|
        are_found += find_bundles( path )
      end
      are_found.each do |item|
        (path, name, src_file) = item
        found_map[name] = item
        is_loaded = loaded?( name )
        if is_loaded and changed?( name )
          to_reload.push( name )
        elsif not is_loaded
          to_load.push( name )
        end
      end
      @registry.keys.each do |name|
        to_unload.push( name ) if not found_map.has_key?( name )
      end
      to_unload.each do |name|
        next if @deps.category?( name )
        if RSence.args[:verbose]
          print "Unloading #{name.inspect}..."; STDOUT.flush
        end
        unload_bundle( name )
        puts "done!" if RSence.args[:verbose]
      end
      to_reload.each do |name|
        next if @deps.category?( name )
        if RSence.args[:verbose]
          print "Unloading #{name.inspect}..."; STDOUT.flush
        end
        unload_order = unload_bundle( name )
        to_load += unload_order
        puts "done!" if RSence.args[:verbose]
      end
      info_map = {}
      to_load.each do |name|
        next unless found_map.has_key? name
        info_map[name] = bundle_info( *found_map[name] )
      end
      no_deps = {}
      to_load.dup.each do |name|
        if @deps.unresolved?( name )
          no_deps[ name ] = @deps.deps_on( name )
          @deps.del_item( name )
          to_load.delete( name )
        end
      end
      to_open = []
      @deps.list.each do |name|
        next if @deps.category?( name )
        next unless to_load.include?( name )
        info = info_map[name]
        if RSence.args[:verbose]
          if to_reload.include?( name )
            print "Reloading #{name.inspect}..."
          else
            print "Loading #{name.inspect}..."
          end
          STDOUT.flush
        end
        @info[name] = info
        load_bundle( name )
        to_open.push( name )
        puts "done!" if RSence.args[:verbose]
      end
      unless no_deps.empty?
        warn "Warning! Unable to load the following bundles; missing dependencies:"
        no_deps.each do |name,deps|
          warn "  #{name} depends on: #{deps.join(', ')}"
        end
      end
      to_open.each do |name|
        if RSence.args[:verbose]
          print "Opening #{name.inspect}..."; STDOUT.flush
        end
        call( name, :open )
        puts "done!" if RSence.args[:verbose]
      end
      if not (to_load.empty? and to_unload.empty? and to_reload.empty?)
        incr!
        puts "@@incr: #{@@incr}" if RSence.args[:debug]
        puts "Plugin bundles:"
        puts "  loaded: #{to_load.join(', ')}" unless to_load.empty?
        puts "  unloaded: #{to_unload.join(', ')}" unless to_unload.empty?
        puts "  reloaded: #{to_reload.join(', ')}" unless to_reload.empty?
        puts "  opened: #{to_open.join(', ')}" unless to_open.empty?
      end
    end
    
    # Top-level method for scanning all plugin directories.
    # Clears previously loaded plugins.
    def init_bundles!
      @registry = {} # bundle_name => bundle_instance mapping
      @info     = {} # bundle_name => bundle_info mapping
      @aliases  = {} # bundle_alias => bundle_name mapping
      @servlets = [] # bundle_name list of Servlet class instances
      update_bundles!
    end
    
    attr_reader :transporter
    attr_reader :autoreload
    attr_reader :name_prefix
    attr_reader :plugin_paths
    attr_reader :parent_manager
    
    def sessions
      warn "no sessions" unless @sessions
      @sessions
    end
    def sessions=(ses_manager)
      @sessions = ses_manager
    end

    @@pluginmanager_id = 0
    # Initialize with a list of directories as plugin_paths.
    # It's an array containing all plugin directories to scan.
    def initialize( options )
      
      options = {
        :plugin_paths => nil,
        :transporter => nil,
        :autoreload => false,
        :name_prefix => false,
        :resolved_deps => [],
        :resolved_categories => {},
        :parent_manager => nil
      }.merge( options )
      
      @pluginmanager_id = @@pluginmanager_id
      @@pluginmanager_id += 1
      
      @closed = false
      @plugin_paths = options[:plugin_paths]
      
      if options[:transporter]
        @transporter = options[:transporter]
        #@sessions    = options[:transporter].sessions
      end
      
      @autoreload = options[:autoreload]
      @name_prefix = options[:name_prefix]
      @parent_manager = options[:parent_manager]
      
      if @parent_manager == nil
        RSence.plugin_manager = self
      end
      
      @deps = Dependencies.new( options[:resolved_deps], options[:resolved_categories] )
      
      puts "Loading #{@name_prefix.to_s+' ' if @name_prefix}plugins..." if RSence.args[:verbose]
      init_bundles!
      puts %{Plugins #{"of #{@name_prefix} " if @name_prefix}loaded.} if RSence.args[:verbose]
      if @autoreload
        @thr = Thread.new do
          Thread.pass
          until @closed
            begin
              update_bundles!
            rescue => e
              plugin_error( e, "PluginManager#update_bundles!", "An error occurred while reloading bundles" )
            end
            sleep 3
          end
          puts "No longer reloading plugins of #{@name_prefix}." if RSence.args[:verbose]
        end
      end
      
    end
    
  end
end




















