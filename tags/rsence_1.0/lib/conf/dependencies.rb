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

#####
#
#  This file tests the existence of all dependencies in one place

if RUBY_VERSION == '1.9.1'
  # Work-around for rack 0.9.1
  class String 
    alias each each_line unless ''.respond_to?(:each) 
  end
  
end

require 'rubygems'
[ 'highline',
  'rack',
  ['thin', '>= 1.0'],
  ['soap4r', '>= 1.5.8'],
  'json',
  'iconv',
  'mkmf',
  'mysql',
  'dbd-mysql',
  'dbi'
].each do |dep|
  if dep.class == String
    begin
      gem dep
    rescue Gem::LoadError
      # gem name to require string conversions:
      if dep == 'dbd-mysql'
        dep = 'dbd/Mysql' if dep == 'dbd-mysql'
        begin
          require dep
        rescue LoadError
          puts "dbd-myql failed, continue? (y/N)"
          answer = $stdin.gets.strip.downcase
          exit unless answer[0].chr == 'y'
        end
      else
        dep = 'RMagick'   if dep == 'rmagick'
        require dep
      end
    end
  elsif dep.class == Array
    begin
      gem *dep
    rescue Gem::LoadError
      require dep[0]
    end
  end
end

