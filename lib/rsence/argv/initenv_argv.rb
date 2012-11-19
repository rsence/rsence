module RSence
module ArgvUtil
    
  # asks y/n and returns booleans,
  # the default tells if which one is for just enter
  def yesno(default=false)
    if default
      question = "Y/n? "
    else
      question = "y/N? "
    end
    print question
    answer = $stdin.gets.strip.downcase[0]
    answer = answer.chr if answer
    if answer == 'n'
      return false
    elsif answer == 'y'
      return true
    elsif answer == nil
      return default
    else
      return nil
    end
  end
  
  # The initenv command and its parser. Asks questions about the environment before doing anything else.
  def parse_initenv_argv
    init_args
    expect_option  = false
    option_name    = false
    valid_env      = false
    interactive    = true
    create_blank   = false
    if @argv.length >= 2
      @argv[1..-1].each_with_index do |arg,i|
        if expect_option
          if [:port].include?(option_name) and arg.to_i.to_s != arg
            puts ERB.new( @strs[:messages][:invalid_option_expected_number] ).result( binding )
            exit
          else
            @args[option_name] = arg
          end
          expect_option = false
        else
          if arg.start_with?('--')
            if arg == '--port'
              expect_option = true
              option_name = :port
            elsif arg == '--addr'
              expect_option = true
              option_name = :addr
            elsif arg == '--server'
              expect_option = true
              option_name = :server
            elsif arg == '--title'
              expect_option = true
              option_name = :title
            elsif arg == '--database'
              expect_option = true
              option_name = :db
            elsif arg == '--uri-prefix'
              expect_option = true
              option_name = :base_url
            elsif arg == '--blank'
              create_blank = true
            elsif arg == '--non-interactive'
              interactive = false
            else
              invalid_option(arg)
            end
          elsif arg.start_with?('-')
            arg.split('')[1..-1].each do |chr|
              if chr == 'q'
                interactive = false
              end
            end
          else
            @args[:env_path] = File.expand_path(arg)
          end
        end
      end
      if expect_option
        puts ERB.new( @strs[:messages][:no_value_for_option] ).result( binding )
        exit
      end
    end
    if valid_env?(@args[:env_path],true)
      puts @strs[:initenv][:env_already_initialized]
      exit
    end
    conf_file = File.expand_path( File.join( @args[:env_path], 'conf', 'config.yaml' ) )
    if File.exists?(@args[:env_path])
      env_empty = true # true while entries start with a dot
      env_clear = true # true while entries don't contain RSence project files
      env_entries = ['conf', 'db', 'log', 'plugins', 'run', 'README', 'VERSION']
      Dir.entries(@args[:env_path]).each do |entry|
        next if entry.start_with?('.')
        env_empty = false
        if env_entries.include? entry
          env_clear = false
          break
        end
      end
      unless env_clear
        puts ERB.new( @strs[:initenv][:env_not_clear] ).result( binding )
        print @strs[:initenv][:continue_question]
        exit unless yesno
      end
      unless env_empty
        puts ERB.new( @strs[:initenv][:env_not_empty] ).result( binding )
        print @strs[:initenv][:continue_question]
        exit unless yesno
      end
    end
  
    require 'rsence/default_config'
    default_config = Configuration.new(@args,true).config
  
    config = {
      :base_url => (@args[:base_url] or default_config[:base_url]),
      :http_server => {
        :port   => (@args[:port] or default_config[:http_server][:port]),
        :bind_address => (@args[:addr] or default_config[:http_server][:bind_address]),
        :rack_require => (@args[:server] or default_config[:http_server][:rack_require])
      },
      :index_html => {
        :title  => (@args[:title] or default_config[:index_html][:title])
      },
      :database => {
        :ses_db => (@args[:db] or default_config[:database][:ses_db])
      }
    }
    Signal.trap 'INT' do
      puts
      puts "Configuration aborted."
      exit
    end
    if interactive
      answers_ok = false
      until answers_ok
        puts ERB.new( @strs[:initenv][:creating_env] ).result( binding )
    
        require 'highline/import'
  
        say @strs[:initenv][:enter_title]
        str_project_title = @strs[:initenv][:project_title]
        config[:index_html][:title] = ask( str_project_title ) do |q|
          q.default = config[:index_html][:title]
        end
      
        say @strs[:initenv][:enter_db_url]
        str_db_url = @strs[:initenv][:db_url]
        config[:database][:ses_db] = ask(str_db_url) do |q|
          q.default = config[:database][:ses_db]
        end
      
        say @strs[:initenv][:enter_http_port]
        str_http_port = @strs[:initenv][:http_port]
        config[:http_server][:port] = ask(str_http_port) do |q|
          q.default = config[:http_server][:port].to_s
        end

        say @strs[:initenv][:enter_tcp_ip]
        str_tcp_ip = @strs[:initenv][:tcp_ip]
        config[:http_server][:bind_address] = ask(str_tcp_ip) do |q|
          q.default = config[:http_server][:bind_address]
        end
      
        say @strs[:initenv][:enter_root_dir]
        str_root_dir = @strs[:initenv][:root_dir]
        config[:base_url] = ask(str_root_dir) do |q|
          q.default = config[:base_url]
        end

        # possible workaround for highline on some systems:
        config[:index_html][:title] = config[:index_html][:title].to_s
        config[:database][:ses_db] = config[:database][:ses_db].to_s
        config[:http_server][:port] = config[:http_server][:port].to_s.to_i
        config[:http_server][:bind_address] = config[:http_server][:bind_address].to_s
        config[:base_url] = config[:base_url].to_s
      
        test_url = "http://#{config[:http_server][:bind_address]}:#{config[:http_server][:port]}#{config[:base_url]}"
        say ERB.new( @strs[:initenv][:config_summary] ).result( binding )
        print @strs[:initenv][:confirm_config]
        answers_ok = yesno(true)
      end
    else
      test_url = "http://#{config[:http_server][:bind_address]}:#{config[:http_server][:port]}#{config[:base_url]}"
    end
  
    puts @strs[:initenv][:creating_dirs]
    env_dir = @args[:env_path]
    require 'fileutils'
    FileUtils.mkdir_p( env_dir ) unless File.exists?( env_dir )
    conf_dir = File.expand_path( 'conf', env_dir )
    Dir.mkdir( conf_dir )
    db_dir = File.expand_path( 'db', env_dir )
    Dir.mkdir( db_dir )
    log_dir = File.expand_path( 'log', env_dir )
    Dir.mkdir( log_dir )
    plugins_dir = File.expand_path( 'plugins', env_dir )
    Dir.mkdir( plugins_dir )
    run_dir = File.expand_path( 'run', env_dir )
    Dir.mkdir( run_dir )
    unless create_blank
      print @strs[:initenv][:install_welcome]
      if yesno
        welcome_plugin_dir = File.join( SERVER_PATH, 'setup', 'welcome' )
        welcome_plugin_dst = File.join( plugins_dir, 'welcome' )
        puts ERB.new( @strs[:initenv][:installing_welcome_plugin] ).result( binding )
        FileUtils.cp_r( welcome_plugin_dir, welcome_plugin_dst )
      end
    end
    puts @strs[:initenv][:creating_files]
    conf_file = File.join( conf_dir, 'config.yaml' )
    File.open( conf_file, 'w' ) {|f| f.write( YAML.dump( config ) ) }
    readme_file = File.join( env_dir, 'README' )
    File.open( readme_file, 'w' ) {|f| f.write( ERB.new( @strs[:initenv][:readme] ).result( binding ) ) }
    version_file = File.join( env_dir, 'VERSION' )
    File.open( version_file, 'w' ) {|f| f.write( "RSence Environment Version #{version.to_f}\n" ) }
    [ db_dir, log_dir, run_dir ].each do |ign_prefix|
      gitignore_file = File.join( ign_prefix, '.gitignore' )
      File.open( gitignore_file, 'w' ) {|f| f.write("*\n") }
    end
    puts ERB.new( @strs[:initenv][:congratulations] ).result( binding )
    exit
  end
end
end
