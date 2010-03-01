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

module Riassence
module Server

=begin
 Riassence::Server::SOAP::SOAPServe provides Riassence-specific SOAP access to Riassence::Server::Pluginmanager
=end
module SOAP
  class SOAPServe < ::SOAP::RPC::HSoaplet
    # nothing here for now
  end
end

end
end