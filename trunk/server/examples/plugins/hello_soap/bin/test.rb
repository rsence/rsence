#!/usr/bin/env ruby

require 'rubygems'
gem 'soap4r'
require 'soap/rpc/driver'

drv = SOAP::RPC::Driver.new( 'http://localhost:8001/SOAP', 'urn:HelloSoap' )
drv.add_rpc_method( 'hello', 'who' )
puts drv.hello( 'Test' )

