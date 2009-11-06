# -* coding: UTF-8 -*-
##   Riassence Framework
 #   Copyright 2008 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##

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
#  ['soap4r', '>= 1.5.8'],
  'json',
  'mkmf',
  'sequel'
].each do |dep|
  if dep.class == String
    begin
      gem dep
    rescue Gem::LoadError
      require dep
    end
  elsif dep.class == Array
    begin
      gem( *dep )
    rescue Gem::LoadError
      require dep[0]
    end
  end
end

