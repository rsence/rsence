require 'mkmf'
create_makefile('jsmin_c')
system('make clean')
system('make all')
require 'test_jsmin'
