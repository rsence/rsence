old_cwd = Dir.pwd
Dir.chdir(File.expand_path(File.join(File.dirname(__FILE__))))
require 'mkmf'
create_makefile('randgen')
system('make clean')
system('make all')
Dir.chdir(old_cwd)
