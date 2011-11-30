module RSence
module ArgvUtil
  # Main parser for the help command
  def help( cmd )
    cmd.to_sym! if cmd.class != Symbol
    puts @strs[:help][:head]
    if @strs[:help].has_key?(cmd)
      puts @strs[:help][cmd]
    else
      puts @strs[:help][:help_main]
    end
    puts @strs[:help][:tail]
  end
end
end  
