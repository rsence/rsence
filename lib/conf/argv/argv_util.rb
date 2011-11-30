module RSence
module ArgvUtil
  
  # Tests for a valid environment
  def valid_env?( arg, quiet=false )
    
    # Checks, if the top-level path exists and is a directory
    path = File.expand_path( arg )
    if not File.exists?( path )
      puts ERB.new( @strs[:messages][:no_such_directory] ).result( binding ) unless quiet
      return false
    elsif not File.directory?( path )
      puts ERB.new( @strs[:messages][:not_a_directory] ).result( binding ) unless quiet
      return false
    end
    
    # Checks, if the conf path exists and is a directory
    conf_path = File.join( path, 'conf' )
    if not File.exists?( conf_path )
      puts ERB.new( @strs[:messages][:missing_conf_directory] ).result( binding ) unless quiet
      return false
    elsif not File.directory?( conf_path )
      puts ERB.new( @strs[:messages][:invalid_conf_directory] ).result( binding ) unless quiet
      return false
    end
    
    # Checks, if the conf/config.yaml file exists and is a directory
    conf_file = File.join( path, 'conf', 'config.yaml' )
    if not File.exists?(conf_file)
      puts ERB.new( @strs[:messages][:missing_conf_file] ).result( binding ) unless quiet
      return false
    elsif not File.file?( conf_file )
      puts ERB.new( @strs[:messages][:invalid_conf_file_not_file] ).result( binding ) unless quiet
      return false
    end
    
    # Checks, if the plugins path exists and is a directory
    plugin_path = File.join( path, 'plugins' )
    if not File.exists?( plugin_path )
      warn ERB.new( @strs[:messages][:warn_no_plugin_directory_in_project] ).result( binding ) if @args[:verbose]
    elsif not File.directory?( plugin_path )
      puts ERB.new( @strs[:messages][:plugin_directory_not_a_directory] ).result( binding ) unless quiet
      return false
    end
    
    # Checks (and automatically creates if missing) the run, db and log directories
    ['run','log','db'].each do |dir_name|
      dir_path = File.join( path, dir_name )
      unless File.exists?( dir_path )
        warn ERB.new( @strs[:messages][:warn_no_directory_creating] ).result( binding ) if @args[:verbose]
        Dir.mkdir( dir_path )
      end
    end
    return true
  end

end
end
