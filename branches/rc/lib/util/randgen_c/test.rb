# -* coding: UTF-8 -*-

require 'randgen'

randgen = RandomGenerator.new(64,10000)

puts randgen.get_one.inspect
puts randgen.get(10).inspect

#10000.times {|n|randgen.get_one;  puts randgen.get_one.inspect if n==0 }
#10000.times {|n|randgen.get(100); puts randgen.get(4).inspect  if n==0 }

