require 'mkmf'
create_makefile('html_min')
system('make clean')
system('make all')
require 'test_html_min'

