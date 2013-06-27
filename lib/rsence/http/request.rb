
module RSence

  # Simple Request class, slightly more involved
  # than the Rack::Request it's extending.
  class Request < Rack::Request
    attr_reader :header, :path, :query
    class RequestHeader < Hash
      def [](key)
        super(key.downcase)
      end
    end
    def initialize(env)
      @header = RequestHeader.new
      super
      env2header()
      @path = path_info()
      @query = params()
    end
    def unparsed_uri
      return @header['request-uri']
    end
    @@env_transl = {
      'SERVER_NAME'     => 'server-name',
      'PATH_INFO'       => 'path-info',
      'SERVER_PROTOCOL' => 'server-protocol',
      'REQUEST_PATH'    => 'request-path',
      'SERVER_SOFTWARE' => 'server-software',
      'REMOTE_ADDR'     => 'remote-addr',
      'REQUEST_URI'     => 'request-uri',
      'SERVER_PORT'     => 'server-port',
      'QUERY_STRING'    => 'query-string',
      'REQUEST_METHOD'  => 'request-method'
    }
    def env2header
      @env.each do |env_key,env_val|
        if @@env_transl.has_key?(env_key)
          http_key = @@env_transl[env_key]
          @header[http_key] = @env[env_key]
        elsif env_key.start_with?( 'HTTP_' )
          http_key = env_key[4..-1].gsub(/_([A-Z0-9]+)/) {|m|'-'+$1.downcase}[1..-1]
          @header[http_key] = @env[env_key]
        end
      end
    end
  end
end
