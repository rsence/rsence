module RSence
module ArgvUtil
  # Main argument parser for the status command, sends the INFO (or PWR on linux) POSIX signal to
  # the process, if running.
  # Checks if the process responds on the port and address it's configured for.
  def parse_status_argv
    init_args
    expect_option  = false
    option_name = false
    if @argv.length >= 2
      @argv[1..-1].each_with_index do |arg,i|
        if expect_option
          if [:port].include?(option_name) and arg.to_i.to_s != arg
            puts ERB.new( @strs[:messages][:invalid_option_expected_number] ).result( binding )
            exit
          elsif option_name == :conf_files
            if not File.exists?( arg ) or not File.file?( arg )
              puts ERB.new( @strs[:messages][:no_such_configuration_file] ).result( binding )
              exit
            else
              @args[:conf_files].push( arg )
            end
          else
            @args[option_name] = arg
          end
          expect_option = false
        else
          if arg.start_with?('--')
            if arg == '--debug'
              set_debug
            elsif arg == '--verbose'
              set_verbose
            elsif arg == '--port'
              expect_option = true
              option_name = :port
            elsif arg == '--addr'
              expect_option = true
              option_name = :addr
            elsif arg == '--conf' or arg == '--config'
              expect_option = true
              option_name = :conf_files
            else
              invalid_option(arg)
            end
          elsif arg.start_with?('-')
            arg.split('')[1..-1].each do |chr|
              if chr == 'd'
                set_debug
              elsif chr == 'v'
                set_verbose
              else
                invalid_option(arg,chr)
              end
            end
          elsif valid_env?(arg)
            @args[:env_path] = File.expand_path(arg)
            @args[:conf_files].unshift( File.expand_path( File.join( arg, 'conf', 'config.yaml' ) ) )
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
    require 'conf/default'
    config = Configuration.new(@args).config
    port = config[:http_server][:port]
    addr = config[:http_server][:bind_address]
    port_status = test_port( port, addr )
    if RSence.pid_support?
      pid_fn = config[:daemon][:pid_fn]
      if File.exists?( pid_fn )
        pid = File.read( pid_fn ).to_i
        sig_name = RSence.info_signal_name
        pid_status = RSence::SIGComm.wait_signal_response(
          pid, pid_fn, sig_name, 3
        )
      else
        warn @strs[:messages][:no_pid_file] if @args[:verbose]
        pid_status = nil
      end
    else
      warn @strs[:messages][:no_pid_support] if @args[:verbose]
      pid_status = nil
    end
    if RSence.pid_support?
      if pid_status == nil
        puts @strs[:messages][:no_pid]
      elsif pid_status == false
        if port_status
          puts ERB.new( @strs[:messages][:no_process_running_but_something_responds] ).result( binding )
        else
          puts ERB.new( @strs[:messages][:no_process_running_and_nothing_responds] ).result( binding )
        end
      else
        if port_status
          puts ERB.new( @strs[:messages][:process_running_and_responds] ).result( binding )
        else
          puts ERB.new( @strs[:messages][:process_running_but_nothing_responds] ).result( binding )
        end
      end
    end
  end
end
end  
