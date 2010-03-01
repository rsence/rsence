
# soapserve contains an extended hsoaplet for pluginmanager usage
begin
  require 'http/soap/soapserve'
  SKIP_SOAPSERVE = true
rescue RegexpError
  # happens with soap4r-1.5.8 on ruby-1.9.1:
  puts "soap4r failed; /SOAP will not work!"
  SKIP_SOAPSERVE = true
end

# soap_plugin includes a SOAPPlugin class, that includes plug-and-play SOAP access
require 'plugins/soap_plugin'
