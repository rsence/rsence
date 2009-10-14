# -* coding: UTF-8 -*-
###
  # Riassence Core -- http://rsence.org/
  #
  # Copyright (C) 2007 Juha-Jarmo Heinonen <jjh@riassence.com>
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

$_INC_NAME = 'js.inc'
$_DONT_PACK_UNDEFINED = false
# sorted by output order:
$_PACKAGE_NAMES = [ 'core', 'comm', 'controls',
                    'servermessage', 'iefix', 'datetime',
                    'lists', 'json_renderer' ]
$_PACKAGES = {
  
  ## The core package contains everything needed
  ## to run the framework, except the default controls
  'core' => [
    
    # HClass
    'class',
    
    # Default settings and misc patches
    'common',
    
    # The ELEM handler
    'elem',
    
    # The EVENT handler
    'event',
    
    # SHA1 / MD5 / BASE64 encoder/decoder collection
    'sha',
    
    # Process foundation
    'system','application',
    
    # Server communication package
    'comm','autosync','values','value','jsloader',
    
    # Multi-control-single-value controller
    'valuematrix',
    
    # geometry
    'point','rect',
    
    # ui foundation
    'thememanager',
    'markupview','morphanimation','view',
    'eventresponder','valueresponder',
    'control',
    'dummyvalue','controldefaults',
    'dyncontrol'
  ],
  
  # Stand-alone Server communication package
  'comm' => [
    'class','comm','system','application','autosync',
    'valuemanager','value','jsloader'
  ],
  
  ## The default set of controls
  'controls' => [
    
    # theme up to date:
    'button','checkbox','radiobutton',
    'stringview','textcontrol','passwordcontrol','textarea',
    'uploader',
    
    'slider','vslider',
    'progressbar','progressindicator','imageview','splitview','stepper',
    'validatorview','window','tab'
  ],
  
  ## Application to invoke when a client/server error is encountered ("Reload" dialog)
  'servermessage' => [
    'reloadapp'
  ],
  
  ## Collection of IE6 -related fixes
  'iefix' => [
    'iefix'
  ],
  
  'datetime' => [
    'datetimevalue',
    'calendar',
    'timesheet'
  ],
  
  'lists' => [
    'listitems',
    'checkboxlist',
    'radiobuttonlist'
  ],
  
  'json_renderer' => [
    'json_renderer',
    'json_renderer_test'
  ]
}

# Backwards compatibility
$_PACKAGE_NAMES.push('basic')
$_PACKAGES['basic'] = $_PACKAGES['controls']


# All in one -package
$_PACKAGE_NAMES.push('allinone')
$_PACKAGES['allinone'] = $_PACKAGES['core'] + $_PACKAGES['controls'] + $_PACKAGES['datetime']


# Themes to include
$_THEMES = ['default']

# BASEPATH COMES FROM THE .sh FILE
$_SRC_PATH = [ File.join(BASEPATH,'src') ]

if ARGV.empty?
  $_REL_PATH = File.join( BASEPATH, 'client' )
else
  $_REL_PATH = ARGV[0]
end

# REPLACEMENT "COMPRESSION" PREFIX
$_REPL_PREFIX= '_'

$_NO_OBFUSCATION = ARGV.include?('-noo')
$_NO_WHITESPACE_REMOVAL = ARGV.include?('-nwr')
$_NO_GZIP = false

# DON'T COMPRESS THESE WORDS IN THE SOURCE:
$_RESERVED_NAMES= [
  
  ## template stuff:
  '_ID', '_WIDTH', '_HEIGHT',
  
  ## other (obvious) non-compressibles:
  '_'
  
]

