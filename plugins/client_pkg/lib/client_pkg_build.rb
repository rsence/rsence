require 'pathname'
require 'jsmin_c'
require 'jscompress'
require 'html_min'
begin
  require 'sass'
  RSence.config[:client_pkg][:sass_supported] = true
  module Sass::Script::Functions
    def js_call(string)
      tmpl_js = '${'+string.value+'}'
      Sass::Script::String.new(tmpl_js)
    end
    def js_tmpl(string)
      # assert_type string, :String
      tmpl_js = '#{'+string.value+'}'
      # puts "js_tmpl(#{string.inspect}) -> #{tmpl_js.inspect}"
      Sass::Script::String.new(tmpl_js)
    end
    declare :js_call, :args => [:string]
    declare :js_tmpl, :args => [:string]
  end
rescue LoadError
  warn "SASS not installed. Install the 'sass' gem to enable."
  RSence.config[:client_pkg][:sass_supported] = false
end
begin
  require 'coffee-script'
  RSence.config[:client_pkg][:coffee_supported] = true
  module Sass::Script::Functions
    def coffee_call(string)
      js_src = CoffeeScript.compile( string.value, :bare => true )
      tmpl_js = '${'+js_src+'}'
      Sass::Script::String.new(tmpl_js)
    end
    def coffee_tmpl(string)
      js_src = CoffeeScript.compile( string.value, :bare => true )
      tmpl_js = '#{'+js_src+'}'
      Sass::Script::String.new(tmpl_js)
    end
    declare :coffee_call, :args => [:string]
    declare :coffee_tmpl, :args => [:string]
  end
rescue LoadError
  warn "CoffeeScript not installed. Install the 'coffee-script' gem to enable."
  RSence.config[:client_pkg][:coffee_supported] = false
end


class ClientPkgBuild

  def read_file( path )
    filehandle = open( path, 'rb' )
    filedata   = filehandle.read
    filedata.force_encoding( 'UTF-8' ) if filedata.encoding != 'UTF-8'
    filehandle.close
    return filedata
  end

  def write_file( path, filedata )
    dirname = File.dirname( path )
    unless File.directory?( dirname )
      FileUtils.mkdir_p( dirname )
    end
    filehandle = open( path, 'wb' )
    filehandle.write( filedata )
    filehandle.close
    true
  end

  def gzip_string( string )
    gz_string = GZString.new('')
    gz_writer = Zlib::GzipWriter.new( gz_string, @gz_strategy )
    gz_writer.write( string )
    gz_writer.close
    return gz_string
  end

  def read_css( src_path, theme_name, component_name )
    css_data = read_file( src_path )
    if @sass_supported
      begin
        if src_path.end_with?('.sass')
          css_data = Sass::Engine.new(css_data,:syntax => :sass, :style => :compressed).render
        elsif src_path.end_with?('.scss')
          css_data = Sass::Engine.new(css_data,:syntax => :scss).render #, :style => :compressed).render
          # puts css_data
        end
      rescue => e
        RSence.plugin_manager.plugin_error(
          e,
          'SASS Error',
          "An error occurred while parsing the SASS file: #{src_path}.",
          src_path
        )
        return ''
      end
    end
    unless @debug
      unless @no_whitespace_removal
        css_data = @html_min.minimize( css_data )
        if @css_min
          css_data = CSSMin.minify( css_data )
        end
      end
    end
    tmpl_to_js( css_data, theme_name, component_name )
  end

  ID_RE = /(#\{_ID\})/
  WIDTH_RE = /(#\{_WIDTH\})/
  HEIGHT_RE = /(#\{_HEIGHT\})/
  TMPL_RE = /([#\$])\{([^\}]*?)\}/m
  def tmpl_to_js( tmpl, theme_name, component_name )
    js_cmds = []
    seq_num = 10
    cached_idx = {}
    tmpl.gsub!( ID_RE, ']I[')
    tmpl.gsub!( WIDTH_RE, ']W[')
    tmpl.gsub!( HEIGHT_RE, ']H[')
    tmpl.gsub!( TMPL_RE ) do
      ( js_type, js_code ) = [ $1, $2 ]
      begin
        if js_code.start_with?('#!coffee')
          js_code = CoffeeScript.compile( js_code, :bare => true )
        end
      rescue ExecJS::RuntimeError
        js_code = "console.log('Invalid CoffeeScript in template #{theme_name}/#{component_name}:',#{js_code.to_json});"
      rescue Encoding::CompatibilityError
        js_code = "console.log('Invalid charset in CoffeeScript template #{theme_name}/#{component_name}:',#{js_code.to_json});"
      end
      if cached_idx.has_key?( js_code )
        seq_id = cached_idx[ js_code ]
      else
        seq_id = seq_num.to_s(36)
        cached_idx[ js_code ] = seq_id
        seq_num += 1
        if js_code.include?('_HEIGHT')
          fn_args = '_ID,_WIDTH,_HEIGHT'
        elsif js_code.include?('_WIDTH')
          fn_args = '_ID,_WIDTH'
        elsif js_code.include?('_ID')
          fn_args = '_ID'
        else
          fn_args = ''
        end
        js_code.force_encoding 'UTF-8' if js_code.encoding != 'UTF-8'
        if js_type == '$'
          js_cmds << "function(#{fn_args}){#{js_code};}"
        else
          js_cmds << "function(#{fn_args}){return #{js_code};}"
        end
      end
      "#{js_type}{#{seq_id}}"
    end
    tmpl.force_encoding 'UTF-8' if tmpl.encoding != 'UTF-8'
    %{[[#{js_cmds.join(',')}],#{tmpl.to_json}]}
  end

  def read_html( src_path, theme_name, component_name )
    html_data = read_file( src_path )
    unless @debug
      unless @no_whitespace_removal
        html_data = @html_min.minimize( html_data )
      end
    end
    tmpl_to_js( html_data, theme_name, component_name )
  end

  def read_gfx( src_path_theme, theme_newest )
    gfx_size = 0
    gfx_data = {}
    src_files_gfx_path = File.join( src_path_theme, 'gfx' )
    [ src_path_theme, src_files_gfx_path ].each do |src_files_gfx|
      if File.exist?( src_files_gfx )
        Dir.entries( src_files_gfx ).each do |src_gfx_filename|
          src_file_gfx = File.join( src_files_gfx, src_gfx_filename )
          if @gfx_formats.include?( src_file_gfx[-4..-1] ) or @gfx_formats.include?( src_file_gfx[-5..-1] )
            fstat = File.stat( src_file_gfx )
            theme_newest = fstat.mtime.to_f if fstat.mtime.to_f > theme_newest
            gfx_size += fstat.size
            gfx_data[src_gfx_filename] = read_file( src_file_gfx )
          end
        end
      end
    end
    return [ gfx_size, gfx_data, theme_newest ]
  end

  # processes theme-related files
  def read_theme( bundle_dir, bundle_name )
    time_start = Time.now.to_f
    @theme_names.each do |theme_name|
      src_path_theme = File.join( bundle_dir, 'themes', theme_name )
      if @src_cache[:theme_timestamp].has_key?(src_path_theme)
        theme_newest = @src_cache[:theme_timestamp][src_path_theme]
      else
        theme_newest = 0
      end
      if theme_newest == 0 or find_newer( src_path_theme, theme_newest )
        theme_size = {
          :css => [0,0],
          :html => [0,0],
          :gfx => 0
        }
        theme_css = ''
        [ File.join( src_path_theme, bundle_name+'.sass' ),
          File.join( src_path_theme, bundle_name+'.scss' ),
          File.join( src_path_theme, bundle_name+'.css' ),
          File.join( src_path_theme, 'css', bundle_name+'.css' )
        ].each do |src_file_css|
          if File.exist?( src_file_css )
            fstat = File.stat( src_file_css )
            theme_newest = fstat.mtime.to_f if fstat.mtime.to_f > theme_newest
            theme_css = read_css( src_file_css, theme_name, bundle_name )
            theme_size[:css][0] += fstat.size
            theme_size[:css][1] += theme_css.bytesize
            break
          end
        end
        theme_html = ''
        [ File.join( src_path_theme, bundle_name+'.html' ),
          File.join( src_path_theme, 'html', bundle_name+'.html' )
        ].each do |src_file_html|
          if File.exist?( src_file_html )
            fstat = File.stat( src_file_html )
            theme_newest = fstat.mtime.to_f if fstat.mtime.to_f > theme_newest
            theme_html = read_html( src_file_html, theme_name, bundle_name )
            theme_size[:html][0] += fstat.size
            theme_size[:html][1] += theme_html.bytesize
            break
          end
        end
        ( gfx_size, theme_gfx, theme_newest ) = read_gfx( src_path_theme, theme_newest )
        theme_size[:gfx] += gfx_size
        @src_cache[:theme_timestamp][src_path_theme] = theme_newest
        @src_cache[:theme_data][src_path_theme] = {} unless @src_cache[:theme_data].has_key?(src_path_theme)
        @src_cache[:theme_data][src_path_theme][:size] = theme_size
        @src_cache[:theme_data][src_path_theme][:data] = {
          :css => theme_css,
          :html => theme_html,
          :gfx => theme_gfx
        }
      else
        theme_size = @src_cache[:theme_data][src_path_theme][:size]
        tc = @src_cache[:theme_data][src_path_theme][:data]
        theme_css = tc[:css]
        theme_html = tc[:html]
        theme_gfx = tc[:gfx]
      end
      @html_by_theme[theme_name][bundle_name] = theme_html
      @css_by_theme[theme_name][bundle_name] = theme_css
      th = @themes[theme_name]
      th[:css][bundle_name] = theme_css
      th[:html][bundle_name] = theme_html
      th[:gfx].merge!(theme_gfx)
      unless @theme_sizes.has_key?( theme_name )
        @theme_sizes[ theme_name ] = {
          :css => [0,0],
          :html => [0,0],
          :gfx => 0
        }
      end
      ts = @theme_sizes[theme_name]
      ts[:css][0] += theme_size[:css][0]
      ts[:css][1] += theme_size[:css][1]
      ts[:html][0] += theme_size[:html][0]
      ts[:html][1] += theme_size[:html][1]
      ts[:gfx] += theme_size[:gfx]
    end
    @theme_time += (Time.now.to_f - time_start)
  end

  def coffee_cache_path( src_path )
    coffee_path = Pathname.new( src_path )
    env_path = Pathname.new( RSence.env_path )
    rel_path = coffee_path.relative_path_from( env_path )
    cache_path = env_path.join( 'js_cache' )
    js_path = cache_path.join( rel_path )
    js_path.to_s
  end

  def coffee_cached?( src_path, src_timestamp )
    path = coffee_cache_path( src_path )
    if File.exists?( path )
      cache_timestamp = File.stat( path ).mtime.to_i
      ( cache_timestamp == src_timestamp )
    else
      false
    end
  end

  def load_coffee_cache( src_path )
    path = coffee_cache_path( src_path )
    read_file( path )
  end

  def save_coffee_cache( src_path, src_timestamp, js_data )
    path = coffee_cache_path( src_path )
    write_file( path, js_data )
    File.utime( 0, src_timestamp, path )
    true
  end

  def add_bundle( bundle_name, bundle_path, entries, has_js=false, has_coffee=false )
    has_themes = entries.include?( 'themes' ) and File.directory?( File.join( bundle_path, 'themes' ) )
    if @bundles_found.has_key?( bundle_name )
      @logger.log( "JSBuilder ERROR: duplicate bundles with the name #{bundle_name.inspect} found." )
      @logger.log( "    The first encountered is #{@bundles_found[ bundle_name ].inspect}" )
      @logger.log( "    The second encountered is #{bundle_path.inspect}" )
      @logger.log( "abort." )
      return false
    end
    unless @destinations.include?( bundle_name )
      warn "JSBuilder WARNING: bundle name #{bundle_name.inspect} does not belong to any package, skipping.." if ARGV.include?('-d')
      return true
    end
    if has_coffee and @coffee_supported
      src_path = File.join( bundle_path, bundle_name+'.coffee' )
      is_coffee = true
    elsif not has_js
      src_path = false
    else
      src_path = File.join( bundle_path, bundle_name+'.js' )
      is_coffee = false
    end
    if src_path
      src_timestamp = File.stat( src_path ).mtime.to_i
      src_cache_compiled = @src_cache[:path_compiled].has_key?( src_path )
      src_cache_timestamp = @src_cache[:path_timestamp].has_key?( src_path )
      src_cache_entry = src_cache_compiled and src_cache_timestamp
      src_cached = ( src_cache_entry and ( @src_cache[:path_timestamp][src_path] == src_timestamp ) )
      if src_cached
        js_data = @src_cache[:path_compiled][src_path]
        js_size = @src_cache[:orig_size][src_path]
        min_size = js_data.bytesize
      else
        process_start = Time.new.to_f
        if is_coffee
          if coffee_cached?( src_path, src_timestamp )
            js_data = load_coffee_cache( src_path )
          else
            begin
              coffee_src = read_file( src_path )
              js_data = CoffeeScript.compile( coffee_src, :bare => true )
              save_coffee_cache( src_path, src_timestamp, js_data )
            rescue CoffeeScript::CompilationError, ExecJS::RuntimeError => e
              if has_js
                warn "CoffeeScript Compilation failure #1: #{e.inspect}"
                js_data = %{console.log( 'WARNING: CoffeeScript complilation failed for source file #{src_path.to_json}, using the js variant instead.' );}
                js_data += read_file( File.join( bundle_path, bundle_name+'.js' ) )
              else
                warn "CoffeeScript Compilation failure #2: #{e.inspect}"
                js_data = %{console.log( 'WARNING: CoffeeScript complilation failed for source file #{src_path.to_json}' );}
              end
            rescue => e
              warn "CoffeeScript Compilation failure #3: #{e.inspect}"
              js_data = %{console.log( 'WARNING CoffeeScript complilation failed for source file #{src_path.to_json}' );}
            end
          end
        else
          js_data = read_file( src_path )
        end
        js_size = js_data.bytesize
        if @debug
          min_size = js_size
        else
          begin
            js_data = @jsmin.minimize( js_data ) unless @no_whitespace_removal
          rescue => e
            warn "JSMin failed for #{src_path} (#{e.inspect}); using uncompressed version."
          end
          min_size = js_data.bytesize
        end
        if is_coffee
          @coffee_time += ( Time.new.to_f - process_start )
        else
          @js_time += ( Time.new.to_f - process_start )
        end
        @src_cache[:path_timestamp][src_path] = src_timestamp
        @src_cache[:path_compiled][src_path] = js_data
        @src_cache[:orig_size][src_path] = js_size
      end
    else
      js_data = %{console.log( "ERROR: CoffeeScript not supported and no JS source available for #{bundle_path}" );}
      js_size = js_data.bytesize
      min_size = js_size
      src_timestamp = 0
    end
    @bundles_found[ bundle_name ] = {
      :path => bundle_path,
      :js_data => js_data,
      :js_size => min_size,
      :orig_size => js_size,
      :has_themes => has_themes,
      :src_timestamp => src_timestamp
    }

    read_theme( bundle_path, bundle_name ) if has_themes

    return true
  end

  def find_bundles( src_dir )
    # makes sure the src_dir exists and is a directory
    if File.exist?( src_dir ) and File.directory?( src_dir )
      # array of item names in dir
      dir_entries = Dir.entries( src_dir )
      # the name of src_dir (src_dir itself is a full path)
      dir_name    = File.split( src_dir )[1]
      # bundles are defined as directories with a js file of the same name plus the 'js.inc' tagfile
      not_disabled = ( not dir_entries.include?( 'disabled' ) )
      has_js = dir_entries.include?( dir_name+'.js' )
      has_coffee = dir_entries.include?( dir_name+'.coffee' )
      is_bundle   = not_disabled and ( has_js or has_coffee )
      # if src_dir is detected as a bundle, handle it in add_bundle
      if is_bundle
        add_bundle( dir_name, src_dir, dir_entries, has_js, has_coffee )
      end
      # descend into the sub-directory:
      dir_entries.each do | dir_entry |
        # don't descend into themes or hidden dirs:
        next if dir_entry[0].chr == '.' or dir_entry == 'themes'
        sub_dir = File.join( src_dir, dir_entry )
        find_bundles( sub_dir ) if File.directory?( sub_dir )
      end
    end
  end

  def build_indexes
    indexes = []
    @destination_files.each_key do | package_name |
      indexes.push( @destination_files[ package_name ] )
    end
    @jscompress.build_indexes( indexes.join("\n") ) unless @no_obfuscation
  end

  def pre_convert(jsc_data)
    return @jscompress.compress( jsc_data )
  end

  def minimize_data
    unless @quiet
      @logger.log(  '' )
      @logger.log(  "Client package build report.......................#{Time.now.strftime('%Y-%m-%d %H:%M:%S')}" )
      @logger.log(  '' )
      @logger.log(  "JS Package....................:    Source |   Minimized |   GNUZipped" )
      @logger.log(  "                              :           |             |" )
    end
    @package_origsizes = {}
    @destination_files.each_key do | package_name |
      jsc_data = process_js( @destination_files[package_name] )
      @js[package_name] = jsc_data
      unless @no_gzip
        gz_data = gzip_string( jsc_data )
        @gz[package_name] = gz_data
      end
      unless @quiet
        js_size  = @destination_origsize[package_name] #@destination_files[ package_name ].bytesize
        @package_origsizes[package_name] = js_size
        jsc_size = jsc_data.bytesize
        if @no_gzip
          gz_size  = -1
        else
          gz_size  = gz_data.bytesize
        end
        print_stat( package_name, js_size, jsc_size, gz_size )
      end
    end
  end

  def squeeze( js, is_coffee=false )
    unless @no_whitespace_removal
      begin
        js = @jsmin.minimize( js ).strip
        # js = JSMinC.minify( js )
      rescue IndexError => e
        warn "js can't get smaller using js; just ignoring jsmin"
      end
    end
    unless @no_obfuscation
      begin
        ## Not creating new indexes on the fly, to save some speed
        # @jscompress.build_indexes( js )
        js = @jscompress.compress( js )
      rescue
        warn "jscompress failed squeeze; just ignoring jscompress"
      end
    end
    return js
  end

  def coffee( src )
    begin
      js = CoffeeScript.compile( src, :bare => true )
    rescue ExecJS::RuntimeError => e
      warn "ExecJS RuntimeError, invalid CoffeScript supplied:\n----\n#{src}----\n"
      js = "function(){console.log('ERROR; invalid CoffeeScript supplied: #{src.to_json}');}"
    rescue CoffeeScript::CompilationError
      warn "Invalid CoffeeScript supplied:\n----\n#{src}----\n"
      js = "function(){console.log('ERROR; invalid CoffeeScript supplied: #{src.to_json}');}"
    rescue
      js = "function(){console.log('ERROR; CoffeeScript compilation failed: #{src.to_json}');}"
    end
    js = squeeze( js )
    return js[1..-3] if js.start_with?('(') and js.end_with?(');')
    return js
  end

  def process_js( src_in )
    if @debug
      return src_in
    else
      src_out = src_in
      src_out = pre_convert( src_out ) unless @no_obfuscation
      return src_out
    end
  end

  def build_themes
    time_start = Time.now.to_f
    unless @quiet
      @logger.log(  '' )
      @logger.log(  "Theme name and part...........:    Source |   Minimized |   GNUZipped" )
      @logger.log(  "                              :           |             |" )
    end
    # compile "all-in-one" css and html resources
    @theme_names.each do |theme_name|
      html_templates = @html_by_theme[ theme_name ]
      css_templates  = @css_by_theme[  theme_name ]
      css_template = ''
      css_templates.each do |bundle_name,theme_data|
        css_template += "#{bundle_name.to_json}:#{theme_data}," unless theme_data.empty?
      end
      css_template.chop! if css_template.end_with?(',')
      # theme_css_template_data = css_templates.values.join(",")
      html_template = ''
      html_templates.each do |bundle_name,theme_data|
        html_template += "#{bundle_name.to_json}:#{theme_data}," unless theme_data.empty?
      end
      html_template.chop! if html_template.end_with?(',')
      theme_html_js = "(function(){HThemeManager.installThemeData(#{theme_name.to_json},{#{css_template}},{#{html_template}});})();"
      pkg_name = theme_name+'_theme'
      orig_size = theme_html_js.bytesize
      theme_html_js = @jsmin.minimize( theme_html_js ) unless @no_whitespace_removal
      @destination_files[pkg_name] = theme_html_js
      @destination_origsize[pkg_name] = orig_size
      # @package_origsizes[theme_name+'_theme'] = theme_html_js.bytesize
      # theme_html_js = process_js( theme_html_js )
      # @js[theme_name+'_theme'] = theme_html_js
      # unless @no_gzip
      #   theme_html_gz = gzip_string( @js[theme_name+'_theme'] )
      #   @gz[theme_name+'_theme'] = theme_html_gz
      # end
      # unless @quiet
      #   print_stat( "#{theme_name}/html", @theme_sizes[theme_name][:html][0], @theme_sizes[theme_name][:html][1], theme_html_gz.bytesize )
      # end
      unless @quiet or @theme_sizes[theme_name].nil?
        # print_stat( "#{theme_name}/css", @theme_sizes[theme_name][:css][0], @theme_sizes[theme_name][:css][1], theme_css_template_data_gz.bytesize )
        print_stat( "#{theme_name}/gfx", @theme_sizes[theme_name][:gfx], @theme_sizes[theme_name][:gfx], @theme_sizes[theme_name][:gfx] )
        # @logger.log( '' )
      end
    end
    @theme_time += (Time.now.to_f - time_start)
  end

  def build_compound_packages
    time_start = Time.now.to_f
    unless @quiet
      @logger.log(  '' )
      @logger.log(  "Compound package..............:    Source |   Minimized |   GNUZipped" )
      @logger.log(  "                              :           |             |" )
    end
    @compounds.each do |pkg_name, js_order|
      js_size = 0
      pkg_parts = []
      js_order.each do |js_pkg|
        pkg_part = @js[ js_pkg ]
        pkg_parts.push( pkg_part )
        pkg_size = ( @package_origsizes[ js_pkg ] or @destination_origsize[ js_pkg ] or @compound_origsize[ js_pkg ] )
        warn "nil pkg size of: #{js_pkg}" if ( pkg_size.nil? or pkg_size == 0 ) and @debug
        js_size += pkg_size.nil? ? 0 : pkg_size
      end
      js_src = pkg_parts.join("\n")
      @js[ pkg_name ] = js_src
      unless @no_gzip
        gz_data = gzip_string( js_src )
        @gz[ pkg_name ] = gz_data
      end
      unless @quiet
        jsc_size  = js_src.bytesize
        if @no_gzip
          gz_size  = -1
        else
          gz_size  = gz_data.bytesize
        end
        @compound_origsize[ pkg_name ] = js_size
        print_stat( pkg_name, js_size, jsc_size, gz_size )
      end
    end
    @js_time += (Time.now.to_f - time_start)
  end

  def reset_structures
    # hash of bundles per bundle name per theme; @html_by_theme[theme_name][bundle_name] = bundle_data
    @html_by_theme = {}
    @css_by_theme  = {}
    @theme_names.each do | theme_name |
      @html_by_theme[ theme_name ] = {}
      @css_by_theme[  theme_name ] = {}
    end
    @theme_sizes = {}
    # hash of bundle -> package mappings (reverse @packages)
    @destinations = {}
    @package_names.each do | package_name |
      @packages[ package_name ].each do |bundle_name|
        @destinations[ bundle_name ] = [] unless @destinations.include?( bundle_name )
        @destinations[ bundle_name ].push( package_name )
      end
    end
    @bundles_found = {} # populated by add_bundle
    @conversion_stats = {} # populated by add_hints
  end

  def traverse_bundles
    src_dirs = @src_dirs.clone
    src_dirs.each do | src_dir |
      find_bundles( src_dir )
    end
  end

  def package_array_cleanup_encodings( package_array )
    outp = ''
    package_array.each do |item|
      if item.encoding != 'UTF-8'
        puts "item has invalid encoding(#{item.encoding.to_s}): #{item[0..70]}"
        outp += item.force_encoding( 'UTF-8' )
      else
        outp += item
      end
    end
    outp
  end

  def compose_destinations
    @destination_files = {} # rename to package_products
    @destination_origsize = {}
    @compound_origsize = {}
    @package_names.each do |package_name|
      @packages[package_name].each do |bundle_name|
        if @bundles_found.has_key?( bundle_name )
          @destination_files[ package_name ] = [] unless @destination_files.has_key?( package_name )
          @destination_files[ package_name ].push( @bundles_found[bundle_name][:js_data] )
          @destination_origsize[ package_name ] = 0 unless @destination_origsize.has_key?( package_name )
          @destination_origsize[ package_name ] += @bundles_found[bundle_name][:orig_size]
        end
      end
    end
    @destination_files.each do | package_name, package_array |
      begin
        package_data = package_array.join("\n")
      rescue Encoding::CompatibilityError
        package_data = package_array_cleanup_encodings( package_array )
      end
      @destination_files[ package_name ] = package_data
    end
  end

  def run( last_change=0 )

    time_start = Time.now.to_f*10000
    @coffee_time = 0
    @js_time = 0
    @theme_time = 0
    @last_change = last_change

    reset_structures

    traverse_bundles

    compose_destinations

    build_themes

    build_indexes
    minimize_data

    build_compound_packages

    ms_taken = ((Time.now.to_f*10000)-time_start).round/10.0
    js_taken = (@js_time*10000).round/10.0
    coffee_taken = (@coffee_time*10000).round/10.0
    themes_taken = (@theme_time*10000).round/10.0
    other_taken = ((ms_taken - coffee_taken - js_taken - themes_taken)*10).round/10.0
    @logger.log( "\nTime taken:\n     js:  #{js_taken}ms\n coffee:  #{coffee_taken}ms\n themes:  #{themes_taken}ms\n  other:  #{other_taken}ms\n  total:  #{ms_taken}ms\n\n" )

  end

  def setup_dirs
    # make sure the src_dirs contain only absolute paths.
    # if not, use current working dir as a logical prefix
    @src_dirs.map! do |src_dir|
      File.expand_path( src_dir )
    end

    @src_dirs.each do |src_dir|
      # exit with error if the src dir does not exist
      unless File.exist?( src_dir )
        @logger.log( "JSBuilder ERROR: the source directory #{src_dir.inspect} does not exist." )
        @logger.log( "abort." )
        return false
      end

    end

    @package_names.each do |package_name|
      @js[package_name] = ''
      @gz[package_name] = ''
    end

    # ensures the destination directories of various theme parts exist
    @theme_names.each do |theme_name|
      @themes[theme_name] = {
        :css  => {},
        :html => {},
        :gfx  => {}
      }
    end

    return true

  end

  def add_src_dir( src_dir )
    @src_dirs.push( src_dir ) unless @src_dirs.include? src_dir
  end
  def add_src_dirs( src_dirs )
    src_dirs.each { |src_dir| add_src_dir( src_dir ) }
  end
  def del_src_dir( src_dir )
    @src_dirs.delete( src_dir ) if @src_dirs.include? src_dir
  end
  def del_src_dirs( src_dirs )
    src_dirs.each { |src_dir| del_src_dir( src_dir ) }
  end

  def add_theme( theme_name )
    @theme_names.push( theme_name ) unless @theme_names.include? theme_name
  end
  def add_themes( theme_names )
    theme_names.each { |theme_name| add_theme( theme_name ) }
  end
  def del_theme( theme_name )
    @theme_names.delete( theme_name ) if @theme_names.include? theme_name
  end
  def del_themes( theme_names )
    theme_names.each { |theme_name| del_theme( theme_name ) }
  end

  def add_package( pkg_name, pkg_items )
    if @packages.has_key?( pkg_name )
      warn "Package #{pkg_name} already exists, ignoring."
    else
      @packages[ pkg_name ] = pkg_items
      @package_names = @packages.keys
    end
  end
  def add_packages( packages )
    packages.each do | pkg_name, pkg_items |
      add_package( pkg_name, pkg_items )
    end
  end
  def del_package( pkg_name )
    if @packages.has_key?( pkg_name )
      @packages.delete( pkg_name )
      @package_names = @packages.keys
    end
  end
  def del_packages( packages )
    packages.each { |pkg_name| del_package( pkg_name ) }
  end

  def add_compound( compound_name, pkg_names )
    if @compounds.has_key?( compound_name )
      warn "Compound #{compound_name} already exists, ignoring."
    else
      @compounds[ compound_name ] = pkg_names
    end
  end
  def add_compounds( compounds )
    compounds.each do | compound_name, pkg_names |
      add_compound( compound_name, pkg_names )
    end
  end
  def del_compound( compound_name )
    if @compounds.has_key?( compound_name )
      @compounds.delete( compound_name )
    end
  end
  def del_compounds( compounds )
    compounds.each { |compound_name| del_compound( compound_name ) }
  end

  def add_reserved_name( reserved_name )
    @reserved_names.push( reserved_name ) unless @reserved_names.include? reserved_name
  end
  def add_reserved_names( reserved_names )
    reserved_names.each { |n| add_reserved_name( n ) }
  end
  def del_reserved_name( reserved_name )
    @reserved_names.delete( reserved_name ) if @resered_names.include? reserved_name
  end
  def del_reserved_names( reserved_names )
    reserved_names.each { |n| del_reserved_name( n ) }
  end

  def add_gfx_format( gfx_format )
    @gfx_formats.push( gfx_format ) unless @gfx_formats.include? gfx_format
  end
  def add_gfx_formats( gfx_formats )
    gfx_formats.each { |gfx_format| add_gfx_format( gfx_format ) }
  end
  def del_gfx_format( gfx_format )
    @gfx_formats.delete( gfx_format ) if @gfx_formats.include? gfx_format
  end
  def del_gfx_formats( gfx_formats )
    gfx_formats.each { |gfx_format| del_gfx_format( gfx_format ) }
  end

  #delete: @js_dst_dir, @themes_dst_dir,

  attr_reader :js, :gz, :themes, :jsmin, :jscompress

  def initialize( config, logger )

    @coffee_supported = config[:coffee_supported]
    @sass_supported = config[:sass_supported]
    @src_cache = {
      :path_timestamp => {},
      :path_compiled => {},
      :orig_size => {},
      :theme_timestamp => {},
      :theme_data => {}
    }

    @logger = logger

    # src_dirs is supposed to be an array of js source directories
    @src_dirs = config[:src_dirs]

    @js = {}
    @gz = {}
    @themes = {}

    # theme_names is supposed to be an array of theme names to include in the build
    @theme_names = config[:theme_names]

    # pkg_info is supposed to be a hash of js package name definitions by pkg_name
    @packages = config[:packages]

    # packages is supposed to be a list of js package name definitions to include
    @package_names = @packages.keys

    # reserved_names is supposed to be a list of reserved words (words that shouldn't be compressed)
    @reserved_names = config[:reserved_names]

    # JSCompress compresses js by "obfuscating"
    # all variables beginning with an underscore "_",
    # eg. "_this" -> "_0", except
    # those specified in the @reserved_names array
    @jscompress = JSCompress.new( config[:reserved_names] )

    # HTMLMin compresses css and html by removing whitespace
    @html_min = HTMLMin.new

    # JSMin removes js white-space (makes the source shorter)
    @jsmin = JSMin.new

    # makes sure the specified dirs are ok
    return if not setup_dirs

    begin
      require 'rubygems'
      require 'cssmin'
      @css_min = true
    rescue LoadError => e
      warn "cssmin not installed. install cssmin (gem install cssmin) to improve the css minifiying."
      @css_min = false
    end

    # contains a list of theme gfx extensions allowed
    @gfx_formats = config[:gfx_formats]

    # compression strategy ( fastest vs smallest )
    @gz_strategy = config[:gz_strategy]
    @no_gzip = config[:no_gzip]
    @no_obfuscation = config[:no_obfuscation]
    @no_whitespace_removal = config[:no_whitespace_removal]
    @debug = RSence.args[:debug]
    @quiet = (not RSence.args[:verbose] and RSence.args[:suppress_build_messages])
    @compounds = config[:compound_packages]
  end

  def find_newer( src_dir, newer_than, quiet=false )
   if File.exist?( src_dir ) and File.directory?( src_dir )
     Dir.entries( src_dir ).each do | dir_entry |
       next if dir_entry[0].chr == '.'
       sub_dir = File.join( src_dir, dir_entry )
       if File.directory?( sub_dir )
         return true if find_newer( sub_dir, newer_than )
       else
         if newer_than < File.stat( sub_dir ).mtime.to_i
           @logger.log( "File changed: #{sub_dir}" ) unless quiet
           return true
         end
       end
     end
   end
   return false
  end

  def bundle_changes( newer_than )
   @bundles_found.each do | bundle_name, bundle_info |
     bundle_path = bundle_info[:path]
     is_newer = find_newer( bundle_path, newer_than )
     return true if is_newer
   end
   return false
  end

  def print_stat( package_name, dst_size, jsc_size, gz_size )
    # percent = 'n/a'
    if dst_size > 0
      percent1 = (100*(jsc_size/dst_size.to_f)).to_i.to_s + '%'
      percent2 = (100*(gz_size/dst_size.to_f)).to_i.to_s + '%'
    else
      percent1 = '-'
      percent2 = '-'
    end
    if jsc_size == -1
      jsc_size = ''
      percent1 = ''
    end
    if gz_size == -1
      gz_size  = ''
      percent2 = ''
    end
    @logger.log(  "#{package_name.ljust(30).gsub(' ','.')}: #{dst_size.to_s.rjust(9)} | #{jsc_size.to_s.rjust(6)} #{percent1.rjust(4)} | #{gz_size.to_s.rjust(6)} #{percent2.rjust(4)}" )
  end

  def flush
    @jscompress.free_indexes
  end
end

