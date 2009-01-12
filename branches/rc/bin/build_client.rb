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

require 'rubygems'
require 'json'

BINPATH  = File.split( File.expand_path( __FILE__ ) )[0]
BASEPATH = File.split(BINPATH)[0]
PARENT_PATH = File.split(BASEPATH)[0]
BUILDER_BINPATH = File.join(BASEPATH,'lib','jsbuilder','bin')
CONFPATH = File.join(BASEPATH,'conf')
$LOAD_PATH << CONFPATH
$LOAD_PATH << File.join(BASEPATH,'lib')
Dir.chdir(BASEPATH)

require 'jsbuilder/platform_bins'
require 'jsbuilder/client-build-config'
require 'jsbuilder/js_builder'

# standard build configuration
if File.exist? File.join(CONFPATH,'client-build-config.rb')
  require File.join(CONFPATH,'client-build-config')
end

# local custom build configuration override:
if File.exist?(File.join(PARENT_PATH,'conf','client-build-config.rb'))
  require File.join(PARENT_PATH,'conf','client-build-config')
end

# compile client package
js_builder = JSBuilder.new( $_SRC_PATH, $_REL_PATH, $_THEMES, $_PACKAGES, $_PACKAGE_NAMES, $_RESERVED_NAMES )
js_builder.run

# compile "all-in-one" css and html resources
$_THEMES.each do |theme_name|
  html_templates = js_builder.html( theme_name )
  html2js_themes = []
  css_templates = []
  theme_css_path_prefix = File.join( $_REL_PATH, 'themes', theme_name, 'css' )
  html_templates.each do |tmpl_name,tmpl_html|
    html2js_themes.push( "#{tmpl_name}:#{tmpl_html.to_json}" )
    theme_css_template_path = File.join( theme_css_path_prefix, tmpl_name+'.css' )
    if File.exist?( theme_css_template_path )
      css_templates.push( File.read( theme_css_template_path ) )
    end
  end
  theme_html_js  = "HThemeManager._tmplCache[#{theme_name.to_json}]={" + html2js_themes.join(',') + "};"
  theme_html_js += "HNoComponentCSS.push(#{theme_name.to_json});"
  theme_html_js += "HNoCommonCSS.push(#{theme_name.to_json});"
  theme_html_js += "HThemeManager.loadCSS(HThemeManager._cssUrl( #{theme_name.to_json}, #{(theme_name+'_theme').to_json}, HThemeManager.themePath, null ));"
  theme_html_js = js_builder.pre_convert(theme_html_js)
  theme_html_js_path = File.join( $_REL_PATH, 'js', theme_name+'_theme.js' )
  theme_html_gz_path = File.join( $_REL_PATH, 'js', theme_name+'_theme.gz' )
  js_builder.save_file( theme_html_js_path, theme_html_js )
  js_builder.gzip_file( theme_html_js_path, theme_html_gz_path )
  theme_css_path = File.join( theme_css_path_prefix, theme_name+'_theme.css' )
  js_builder.save_file( theme_css_path, css_templates.join("\n") )
  theme_css_path_gz = File.join( theme_css_path+'.gz' )
  js_builder.gzip_file( theme_css_path, theme_css_path_gz )
end

js_builder.flush

