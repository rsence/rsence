require 'zlib'

class GZString < String
  alias write <<
end
