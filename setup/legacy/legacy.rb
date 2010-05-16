
# This Plugin contains some namespace mappings of what used to exist in RSence 1.x
class LegacyPlugin < Servlet
  def init
    super
    $PLUGINS = @plugins
    $config  = ::RSence.config
    $TICKETSERVE = @plugins[:ticketservices]
  end
end

module ::Riassence
  module Server
    include RSence
  end
end

