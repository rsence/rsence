
class HelloSoap < SOAPPlugin
  def hello( who='World' )
    return "Hello, #{who}!"
  end
end

HelloSoap.new( 'urn:HelloSoap' )

