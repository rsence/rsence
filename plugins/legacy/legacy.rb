
class LegacyPlugin < Servlet
  def init
    super
    $PLUGINS = @plugins
    $config  = ::Riassence::Server.config
    $TICKETSERVE = @plugins[:ticketservices]
  end
end

