#!/usr/bin/env ruby
# -* coding: UTF-8 -*-
###
  # Riassence Core -- http://rsence.org/
  #
  # Copyright (C) 2009 Juha-Jarmo Heinonen <jjh@riassence.com>
  #
  # This file is part of Riassence Core.
  #
  # Riassence Core is free software: you can redistribute it and/or modify
  # it under the terms of the GNU General Public License as published by
  # the Free Software Foundation, either version 3 of the License, or
  # (at your option) any later version.
  #
  # Riassence Core is distributed in the hope that it will be useful,
  # but WITHOUT ANY WARRANTY; without even the implied warranty of
  # MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  # GNU General Public License for more details.
  #
  # You should have received a copy of the GNU General Public License
  # along with this program.  If not, see <http://www.gnu.org/licenses/>.
  #
  ###

rsence_dir = File.split(File.split( File.expand_path( __FILE__ ) )[0])[0]
lib_dir = File.join( rsence_dir, 'lib' )

puts "Building randgen.."
randgen_dir = File.join( lib_dir, 'util', 'randgen_c'  )
Dir.chdir(   randgen_dir )
[ File.join( randgen_dir, 'Makefile' ),
  File.join( randgen_dir, 'randgen.bundle' ),
  File.join( randgen_dir, 'randgen.so' ),
  File.join( randgen_dir, 'randgen.o' )
].each do |build_product|
  File.delete( build_product ) if File.exist?( build_product )
end
`ruby extconf.rb`
`make`

puts "Building jsmin.."
jsmin_dir   = File.join( lib_dir, 'jsbuilder', 'jsmin' )
Dir.chdir(   jsmin_dir )
[ File.join( jsmin_dir, 'Makefile' ),
  File.join( jsmin_dir, 'jsmin.bundle' ),
  File.join( jsmin_dir, 'jsmin.so' ),
  File.join( jsmin_dir, 'jsmin.o' )
].each do |build_product|
  File.delete( build_product ) if File.exist?( build_product )
end
`ruby extconf.rb`
`make`

puts "Building jscompress.."
jscompress_dir = File.join( lib_dir, 'jsbuilder', 'jscompress' )
Dir.chdir(   jscompress_dir )
[ File.join( jscompress_dir, 'Makefile' ),
  File.join( jscompress_dir, 'jscompress.bundle' ),
  File.join( jscompress_dir, 'jscompress.so' ),
  File.join( jscompress_dir, 'jscompress.o' )
].each do |build_product|
  File.delete( build_product ) if File.exist?( build_product )
end
`ruby extconf.rb`
`make`

puts "Building html_min.."
html_min_dir   = File.join( lib_dir, 'jsbuilder', 'html_min'   )
Dir.chdir(   html_min_dir )
[ File.join( html_min_dir, 'Makefile' ),
  File.join( html_min_dir, 'html_min.bundle' ),
  File.join( html_min_dir, 'html_min.so' ),
  File.join( html_min_dir, 'html_min.o' )
].each do |build_product|
  File.delete( build_product ) if File.exist?( build_product )
end
`ruby extconf.rb`
`make`

