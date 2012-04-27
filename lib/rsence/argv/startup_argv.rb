module RSence
module ArgvUtil
    
  # Main argument parser for all 'start' -type commands.
  def parse_startup_argv
    init_args
    expect_option  = false
    option_name = false
    if @argv.length >= 2
      @argv[1..-1].each_with_index do |arg,i|
        if expect_option
          if [ :port, :latency, :http_delayed_start ].include?(option_name) and arg.to_i.to_s != arg
            puts ERB.new( @strs[:messages][:invalid_option_expected_number] ).result( binding )
            exit
          elsif option_name == :conf_files
            if not File.exists?( arg ) or not File.file?( arg )
              puts ERB.new( @strs[:messages][:no_such_configuration_file] ).result( binding )
              exit
            else
              @args[:conf_files].push( arg )
            end
          elsif option_name == :http_delayed_start
            @args[:http_delayed_start] = arg.to_i
          else
            arg = arg.to_i if option_name == :latency
            @args[option_name] = arg
          end
          expect_option = false
        else
          if arg.start_with?('--')
            if arg == '--profile'
              true
            elsif arg == '--debug'
              set_debug
            elsif arg == '--verbose'
              set_verbose
            elsif arg == '--log-fg'
              set_log_fg
            elsif arg == '--trace-js'
              @args[:trace_js]   = true
            elsif arg == '--trace-delegate'
              @args[:trace_delegate] = true
            elsif arg == '--port'
              expect_option = true
              option_name = :port
            elsif arg == '--addr' or arg == '--bind'
              expect_option = true
              option_name = :addr
            elsif arg == '--http-delayed-start' or arg == '--delayed-start'
              expect_option = true
              option_name = :http_delayed_start
            elsif arg == '--server'
              expect_option = true
              option_name = :server
            elsif arg == '--conf' or arg == '--config'
              expect_option = true
              option_name = :conf_files
            elsif arg == '--reset-sessions'
              set_reset_ses
            elsif arg == '--auto-update'
              set_autoupdate
            elsif arg == '--latency'
              expect_option = true
              option_name = :latency
            elsif arg == '--say'
              set_say
            elsif arg == '--disable-gzip'
              @args[:client_pkg_no_gzip] = true
            elsif arg == '--disable-obfuscation'
              @args[:client_pkg_no_obfuscation] = true
            elsif arg == '--disable-jsmin'
              @args[:client_pkg_no_whitespace_removal] = true
            elsif arg == '--build-report'
              @args[:suppress_build_messages] = false
            else
              invalid_option(arg)
            end
          elsif arg.start_with?('-')
            arg.split('')[1..-1].each do |chr|
              if chr == 'd'
                set_debug
              elsif chr == 'v'
                set_verbose
              elsif chr == 'f'
                set_log_fg
              elsif chr == 'r'
                set_reset_ses
              elsif chr == 'a'
                set_autoupdate
              elsif chr == 'S'
                set_say
              else
                invalid_option(arg,chr)
              end
            end
          elsif valid_env?(arg)
            @args[:env_path] = File.expand_path(arg)
            @args[:conf_files].push( File.expand_path( File.join( arg, 'conf', 'config.yaml' ) ) )
          else
            invalid_env( arg )
          end
        end
      end
      if expect_option
        puts ERB.new( @strs[:messages][:no_value_for_option] ).result( binding )
        exit
      end
    end
    if valid_env?(@args[:env_path])
      conf_file = File.expand_path( File.join( @args[:env_path], 'conf', 'config.yaml' ) )
      @args[:conf_files].unshift( conf_file ) unless @args[:conf_files].include?( conf_file )
    else
      invalid_env
    end
    @startable = true
  end
end
end