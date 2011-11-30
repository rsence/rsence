module RSence
module ArgvUtil
  # Main argument parser for the save command. Sends the USR1 POSIX signal to the process, if running.
  def parse_save_argv
    init_args
    expect_option  = false
    option_name = false
    if @argv.length >= 2
      @argv[1..-1].each_with_index do |arg,i|
        if expect_option
          if option_name == :conf_files
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
    if RSence.pid_support?
      pid_fn = config[:daemon][:pid_fn]
      if File.exists?( pid_fn )
        pid = File.read( pid_fn ).to_i
        saving_message = @strs[:messages][:saving_message]
        pid_status = RSence::SIGComm.wait_signal_response(
          pid, pid_fn, 'USR2', 30, saving_message, '.', 0.1, true
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
        puts @strs[:messages][:no_pid_unable_to_save]
      elsif pid_status == false
        puts @strs[:messages][:no_process_running]
      else
        puts @strs[:messages][:session_data_saved]
      end
    end
  end
end
end