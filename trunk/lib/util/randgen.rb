# -* coding: UTF-8 -*-
###
  # Riassence Core -- http://rsence.org/
  #
  # Copyright (C) 2008 Juha-Jarmo Heinonen <jjh@riassence.com>
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

begin
  require File.expand_path(File.join(File.dirname(__FILE__),'randgen_c','randgen'))
rescue LoadError => e
  puts "c-randgen failed to init, reason: #{e.inspect}" if $DEBUG_MODE
  begin
    puts "Trying to build extension..."
    fork do
      system( 'ruby '+File.expand_path(File.join(File.dirname(__FILE__),'randgen_c','extconf.rb')) )
    end
    require File.expand_path(File.join(File.dirname(__FILE__),'randgen_c','randgen'))
  end
  warn "falling back to old randgen"
  require File.expand_path(File.join(File.dirname(__FILE__),'randgen_rb','randgen'))
end

