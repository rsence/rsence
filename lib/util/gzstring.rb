require 'zlib'

# Implements the +write+ method for strings, used with zlib to
# use GZStrings as the target for compression.
class GZString < String
  alias write <<
end
