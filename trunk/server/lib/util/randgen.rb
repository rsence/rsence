###
  # Himle Server -- http://himle.org/
  #
  # Copyright (C) 2008 Juha-Jarmo Heinonen
  #
  # This file is part of Himle Server.
  #
  # Himle Server is free software: you can redistribute it and/or modify
  # it under the terms of the GNU General Public License as published by
  # the Free Software Foundation, either version 3 of the License, or
  # (at your option) any later version.
  #
  # Himle server is distributed in the hope that it will be useful,
  # but WITHOUT ANY WARRANTY; without even the implied warranty of
  # MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  # GNU General Public License for more details.
  #
  # You should have received a copy of the GNU General Public License
  # along with this program.  If not, see <http://www.gnu.org/licenses/>.
  #
  ###

begin
  require File.expand_path(File.join(File.dirname(__FILE__),'randgen_c/randgen'))
rescue => e
  puts "c-randgen failed to init, reason: #{e.inspect}" if $DEBUG_MODE
  puts "Warning: falling back to old randgen."
  require File.expand_path(File.join(File.dirname(__FILE__),'randgen_rb/randgen'))
end

