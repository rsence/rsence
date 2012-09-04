
module RSence
module ArgvUtil

  # Tests, if the port on addr responds or refuses the connection.
  # Automatically replaces '0.0.0.0' with '127.0.0.1'
  def test_port( port, addr='127.0.0.1' )
    require 'socket'
    require 'timeout'
    begin
      addr = '127.0.0.1' if addr == '0.0.0.0'
      timeout(1) do
        if RUBY_VERSION.to_f >= 1.9
          sock = TCPSocket.open( addr, port )
        else
          begin
            sock = TCPsocket.open( addr, port )
          rescue NameError => e # Rubinius
            warn "TCPsocket not available, trying TCPSocket.."
            sock = TCPSocket.open( addr, port )
          end
        end
        sock.close
      end
      return true
    rescue Timeout::Error
      puts "Address #{addr} port #{port} timed out"
      return false
    rescue Errno::ECONNREFUSED
      return false
    rescue => e
      warn e.inspect
      return false
    end
  end

end
end

