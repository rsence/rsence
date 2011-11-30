
module RSence
module ArgvUtil

  # Tests, if the port on addr responds or refuses the connection.
  # Automatically replaces '0.0.0.0' with '127.0.0.1'
  def test_port( port, addr='127.0.0.1' )
    require 'socket'
    begin
      addr = '127.0.0.1' if addr == '0.0.0.0'
      if RUBY_VERSION.to_f >= 1.9
        sock = TCPSocket.open( addr, port )
      else
        begin
          sock = TCPsocket.open( addr, port )
        rescue NameError => e
          warn "TCPsocket not available, trying TCPSocket.."
          sock = TCPSocket.open( addr, port )
        end
      end
      sock.close
      return true
    rescue Errno::ECONNREFUSED
      return false
    rescue => e
      warn e.inspect
      return false
    end
  end

end
end