##   RSence
 #   Copyright 2010 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##

# The RSence module contains the server interfaces of RSence.
# == The classes that matter from a Plugin developer's point of view are:
# - {RSence::Plugins::GUIPlugin__ GUIPlugin}
#   - Use for user interface plugins. Supports {RSence::Plugins::GUIParser GUITree} handling; the user interface starts automatically.
#   - No server programming except defining GUITree YAML structures is required to define a user interface when using this class.
# - {RSence::Plugins::Plugin__ Plugin}
#   - Use for supporting plugins and advanced client-server development.
#   - Great for providing backend functionality and miscellaneous API's for other Plugins.
# - {RSence::Plugins::Servlet__ Servlet}
#   - Use for raw POST / GET handlers to provide external API's, search engine indexes, plain html fallback etc.
# - {RSence::HValue HValue}
#   - Use for syncing data objects between client and server automatically.
#   - Bind any plugin methods as responders / validators; they will be called whenever a client-server change triggers an data change event.
# - {RSence::Message Message (msg)}
#   - Used extensively to pass around session, data and request/response bindings.
#   - The standard convention is usage as the first parameter, named +msg+, of any method that includes handling session-related data.
# 
# Most other classes are inner workings of RSence itself and are subject to change without further notice.
module RSence
end

# Requires the ARGVParser that functions as the command-line user interface.
require 'conf/argv'

