#!/usr/bin/env ruby
# -* coding: UTF-8 -*-
##   Riassence Framework
 #   Copyright 2009 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##


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
