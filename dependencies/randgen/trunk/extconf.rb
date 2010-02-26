require 'mkmf'
create_makefile('randgen')
system('make clean')
system('make all')
require 'test_randgen'

