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


src_paths  = `find src -type f -name \*.js`
src_paths += `find src -type f -name \*.css`
src_paths += `find src -type f -name \*.html`


require 'pp'

def readfile( src_path )
  src_file = open( src_path, 'rb' )
  src_data = src_file.read()
  src_file.close
  return src_data
end

def writefile( dst_path, data )
  dst_file = open( dst_path, 'wb' )
  dst_data = dst_file.write( data )
  dst_file.close
end

src_paths.split("\n").each do |src_path|
  src_data = readfile( src_path )
  if src_data.include?("\r\n")
    all_msdos = (src_data.count("\r\n")/2) == src_data.count("\n")
    puts "NOTE: MS-DOS CR/LF in: #{src_path}"
    src_data.gsub!("\r\n", "\n")
    puts "  ..CORRECTED! (CR/LF -> LF)"
    writefile( src_path, src_data )
  end
  if src_data[0..2] == "\357\273\277"
    puts "FUBAR STARTING-3 BYTES of: #{src_path}"
    src_data.gsub!("\357\273\277","\n")
    puts "  ..CORRECTED! (Replaced with LF)"
    writefile( src_path, src_data )
  end
  linenum = 0
  err_lines = []
  src_data.split("\n").each do |src_line|
    linenum += 1
    src_line.each_byte do |src_byte|
      if src_byte > 127
        err_lines.push( linenum ) unless err_lines.include?( linenum )
      end
    end
  end
  if err_lines != []
    puts "ERROR: HI-BIT in #{src_path}, lines: #{err_lines.join(', ')}"
  end
end