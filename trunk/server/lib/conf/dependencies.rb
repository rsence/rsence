# -* coding: UTF-8 -*-
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

#####
#
#  This file tests the existence of all dependencies in one place

require 'rubygems'
[ 'highline',
  'rack',
  ['thin', '>= 1.0'],
  ['soap4r', '>= 1.5.8'],
  'json',
  'iconv',
  'mkmf',
  'mysql',
  'dbi'
].each do |dep|
  if dep.class == String
    begin
      gem dep
    rescue Gem::LoadError
      require dep
    end
  elsif dep.class == Array
    begin
      gem *dep
    rescue Gem::LoadError
      require dep[0]
    end
  end
end

begin
  gem 'rmagick'
rescue Gem::LoadError
  require 'RMagick'
end
