
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
