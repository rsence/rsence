#!/usr/bin/env ruby

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

BINPATH  = File.split( File.expand_path( __FILE__ ) )[0]
BASEPATH = File.split(BINPATH)[0]
CONFPATH = File.join(BASEPATH,'conf')
$LOAD_PATH << CONFPATH
$LOAD_PATH << File.join(BASEPATH,'lib')
Dir.chdir(BASEPATH)

require 'platform_bins'
require File.join(CONFPATH,'client-build-config')
require 'js_builder'

CHECKPATH_JS = File.join(BASEPATH,'src')

if RUBY_PLATFORM.include? "darwin"
  FIND_NEWER = "-newermm"
else
  FIND_NEWER = "-newer"
end

def newer_files_js?
  dest_path = File.join($_REL_PATH,'js','built')
  fnewer =  %{#{FIND_NEWER} "#{dest_path}"}
  find_str = %{#{FIND} "#{CHECKPATH_JS}" #{fnewer} -name "*.js" -o #{fnewer} -name "*.html" -o #{fnewer} -name "*.css"}
  newer_files = `#{find_str}`
  return newer_files != ""
end
while true do
  puts "sleeping.."
  until newer_files_js?
    sleep 10
  end
  puts "building.."
  load File.join(CONFPATH,'client-build-config.rb')
  JSBuilder.new.run
  # opens new tabs :/
  # `open -a firefox #{TEST_FILE}`
  
  # `#{File.join(BINPATH,'restart')}`
  
  # reloads the front window in firefox and return to textmate
  `osascript #{File.join(BINPATH,'firefox_reload.as')}` if ARGV.include?('-ff') and RUBY_PLATFORM.include? 'darwin'
end