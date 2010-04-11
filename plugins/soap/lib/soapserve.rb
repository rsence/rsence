#--
##   Riassence Framework
 #   Copyright 2008 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##
 #++


require 'http/soap/hsoaplet'

module RSence

=begin
 RSence::SOAP::SOAPServe provides Riassence-specific SOAP access to RSence::Pluginmanager
=end
module SOAP
  class SOAPServe < ::SOAP::RPC::HSoaplet
    # nothing here for now
  end
end

end
