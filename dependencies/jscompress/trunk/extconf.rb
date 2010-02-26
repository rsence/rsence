require 'mkmf'
create_makefile('jscompress')
system('make clean')
system('make all')

