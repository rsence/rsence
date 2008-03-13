###
  # HIMLE RIA SYSTEM
  # Copyright (C) 2008 HIMLE GROUP http://himle.sorsacode.com/
  # Copyright (C) 2007 Juha-Jarmo Heinonen <juha-jarmo.heinonen@sorsacode.com>
  #  
  #  This program is free software; you can redistribute it and/or modify it under the terms
  #  of the GNU General Public License as published by the Free Software Foundation;
  #  either version 2 of the License, or (at your option) any later version. 
  #  This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
  #  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
  #  See the GNU General Public License for more details. 
  #  You should have received a copy of the GNU General Public License along with this program;
  #  if not, write to the Free Software Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
  ###

if ARGV.include?('-d')
  puts "Debug On"
  DEBUG_MODE = true
else
  DEBUG_MODE = false
end


DIR_ROOT = File.join(File.split($0)[0], '..')

if RUBY_PLATFORM.include? "mswin32"
  JSMIN = File.join(BINPATH,'jsmin.exe').gsub("/","\\")
  HTMLTIDY = 'type'
elsif RUBY_PLATFORM.include? "linux"
  JSMIN = File.join(BINPATH,'jsmin.linux')
  HTMLTIDY = 'cat'
elsif RUBY_PLATFORM.include? "powerpc-darwin"
  JSMIN = File.join(BINPATH,'jsmin.macppc')
  HTMLTIDY = "#{File.join(BINPATH,'htmltidy.macppc')} -q -config #{File.join(CONFPATH,'htmltidy.config')} -utf8"
elsif RUBY_PLATFORM.include? "darwin"
  JSMIN = File.join(BINPATH,'jsmin.macintel')
  HTMLTIDY = "#{File.join(BINPATH,'htmltidy.macppc')} -q -config #{File.join(CONFPATH,'htmltidy.config')} -utf8"
end
if RUBY_PLATFORM.include? "mswin32"
  FIND = File.join(BINPATH,'find.exe').gsub('/',"\\")
  GZIP = File.join(BINPATH,'gzip.exe').gsub('/',"\\")
  CAT  = 'type'
  TOUCH = File.join(BINPATH,'touch.exe').gsub("/","\\")
else
  FIND = 'find'
  GZIP = 'gzip'
  CAT  = 'cat'
  TOUCH = 'touch'
end

