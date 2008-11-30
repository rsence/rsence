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
BUILDER_BINPATH  File.join(BASEPATH,'lib','jsbuilder','bin')
CONFPATH = File.join(BASEPATH,'conf')
$LOAD_PATH << CONFPATH
$LOAD_PATH << File.join(BASEPATH,'lib')
Dir.chdir(BASEPATH)

require 'jsbuilder/platform_bins'
require 'jsbuilder/client-build-config'
require 'jsbuilder/js_builder'

# if local custom client build override:
if File.exist? File.join(CONFPATH,'client-build-config.rb')
  require 'conf/client-build-config'
end

JSBuilder.new.run

