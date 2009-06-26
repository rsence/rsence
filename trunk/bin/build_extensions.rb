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

require 'rbconfig'
require 'fileutils'

rsence_dir = File.split(File.split( File.expand_path( __FILE__ ) )[0])[0]
lib_dir = File.join( rsence_dir, 'lib', 'ext' )
ext_dir = File.join( rsence_dir, 'ext' )
ruby_exec = RbConfig::CONFIG['ruby_install_name']
ext_names = ['randgen','jsmin','jscompress','html_min']

def extconf_products( src_dir, exclusion = [] )
  products_found = []
  Dir.entries( src_dir ).each do |product_file|
    next if product_file[0].chr == '.'
    next if product_file == 'extconf.rb'
    next if exclusion.include? product_file
    products_found.push( File.join( src_dir, product_file ) )
  end
  return products_found
end
def cleanup_exts( ext_dir, ext_names )
  ext_names.each do |ext_name|
    puts "Cleaning up #{ext_name}.."
    extconf_products( File.join(ext_dir,ext_name), ["#{ext_name}.c"] ).each do |build_product|
      File.delete( build_product )
    end
  end
end
cleanup_exts( ext_dir, ext_names )
def build_exts( ruby_exec, ext_dir, ext_names )
  old_wd = Dir.pwd
  ext_names.each do |ext_name|
    puts "Building #{ext_name}..."
    Dir.chdir( File.join( ext_dir, ext_name ) )
    system( "#{ruby_exec} extconf.rb" )
  end
  Dir.chdir( old_wd )
end
build_exts( ruby_exec, ext_dir, ext_names )
def inst_exts( ext_dir, lib_dir, ext_names )
  ext_names.each do |ext_name|
    puts "Installing #{ext_name}..."
    extconf_products( File.join( ext_dir, ext_name ), ['Makefile',"#{ext_name}.c"] ).each do |ext_product|
      FileUtils.mv( ext_product, lib_dir )
    end
  end
end
inst_exts( ext_dir, lib_dir, ext_names )
cleanup_exts( ext_dir, ext_names )
