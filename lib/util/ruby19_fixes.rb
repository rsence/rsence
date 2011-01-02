
# NOTE: Ruby 1.9 isn't fully supported yet.
# There are some encoding handlers and some of the dependencies are not fully working yet.
# One should wait for Ruby 2.0 for production use anyway.

# Ruby 1.9 encoding defaults.
# This is clearly not enough but a good start for fixing the encoding madness.
Encoding.default_external = Encoding::BINARY
Encoding.default_internal = Encoding::BINARY

# Ruby 1.9 doesn't have String#each anymore.
# This is a backwards-compatible work-around.
class String
  alias each each_line
end

