###
  # HIMLE RIA SYSTEM
  # Copyright (C) 2007-2008 Juha-Jarmo Heinonen <juha-jarmo.heinonen@sorsacode.com>
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

$_INC_NAME = 'js.inc'

# sorted by output order:
$_PACKAGE_NAMES = ['core','controls','servermessage','iefix']
$_PACKAGES = {
  'core' => [
    'class',
    'common',
    'ajax',
    'elem',
    'event',
    'sha',
    'transporter','valuemanager','value','jsloader',
    'valuematrix',
    'point','rect',
    'system','application','thememanager','markupview','view','control',
    'dyncontrol'
  ],
  
  'controls' => [
    'button','checkbox','radiobutton',
    'stringview','textcontrol','textarea','slider','vslider',
    'progressbar','progressindicator','imageview','splitview','stepper',
    'passwordcontrol','divider','validatorview','window','tab',
    'uploader'
  ],
  
  'servermessage' => [
    'reloadapp'
  ],
  
  'iefix' => [
    'iefix'
  ]
}

$_THEMES = ['default']

# BASEPATH COMES FROM THE .sh FILE
$_SRC_PATH = [ File.join(BASEPATH,'..') ]
$_REL_PATH = ARGV[0]

$_HTMLTIDY_CONF_PATH= File.join(BASEPATH,'conf','htmltidy.config')

# REPLACEMENT ("COMPRESSION") PREFIX
#REPL_PREFIX = '_'
$_REPL_PREFIX= '_'

$_NO_OBFUSCATION = ARGV.include?('-noo')
$_NO_WHITESPACE_REMOVAL = ARGV.include?('-nwr')
$_NO_GZIP = false

# DON'T COMPRESS THESE WORDS IN THE SOURCE:
$_RESERVED_NAMES= [
  
  ## template stuff:
  '_ID', '_WIDTH', '_HEIGHT',
  
]

