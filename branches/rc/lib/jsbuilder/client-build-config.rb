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
$_PACKAGE_NAMES = ['core','comm','controls','table','servermessage','iefix','richtext']
$_PACKAGES = {
  
  ## The core package contains everything needed
  ## to run the framework, except the default controls
  'core' => [
    
    # HClass
    'class',
    
    # Default settings and misc patches
    'common',
    
    # The "Ajax" object
    'ajax',
    
    # The ELEM handler
    'elem',
    
    # The EVENT handler
    'event',
    
    # SHA1 / MD5 / BASE64 encoder/decoder collection
    'sha',
    
    # Server communication package
    'transporter','valuemanager','value','jsloader',
    
    # Multi-control-single-value controller
    'valuematrix',
    
    # geometry
    'point','rect',
    
    # ui foundation
    'system','application','thememanager','markupview','view','control',
    'dyncontrol'
  ],
  
  # Stand-alone Server communication package
  'comm' => [
    'class','ajax',
    'transporter','valuemanager','value','jsloader'
  ],
  
  ## The default set of controls
  'controls' => [
    
    # theme up to date:
    'button','checkbox','radiobutton',
    'stringview','textcontrol',
    'uploader',
    
    # theme outdated:
    'textarea','slider','vslider',
    'progressbar','progressindicator','imageview','splitview','stepper',
    'passwordcontrol','divider','validatorview','window','tab','imagebutton'
  ],
  
  ## Table is such a big set of classes we include it separate from other controls
  'table' => [
    'databuffer','tablevalue','tableheadercolumn','tableheaderview',
    'tablecornerview','tablecolumn','tablecontrol'
  ],
  
  ## Rich text editing
  'richtext' => [
    'stylebutton','stylebuttonbar','richtextbar','richtextview','richtextcontrol'
  ],
  
  ## Application to invoke when a client/server error is encountered ("Reload" dialog)
  'servermessage' => [
    'reloadapp'
  ],
  
  ## Collection of IE6 -related fixes
  'iefix' => [
    'iefix'
  ]
}

# Backwards compatibility
$_PACKAGE_NAMES.push('basic')
$_PACKAGES['basic'] = $_PACKAGES['controls']


# All in one -package
$_PACKAGE_NAMES.push('allinone')
$_PACKAGES['allinone'] = $_PACKAGES['core'] + $_PACKAGES['controls'] + $_PACKAGES['table'] + $_PACKAGES['richtext']


# Themes to include
$_THEMES = ['default']

# BASEPATH COMES FROM THE .sh FILE
$_SRC_PATH = [ File.join(BASEPATH,'src') ]

if ARGV.empty?
  $_REL_PATH = File.join( BASEPATH, 'client' )
else
  $_REL_PATH = ARGV[0]
end

$_HTMLTIDY_CONF_PATH= File.join(BASEPATH,'conf','htmltidy.config')

# REPLACEMENT "COMPRESSION" PREFIX
$_REPL_PREFIX= '_'

$_NO_OBFUSCATION = ARGV.include?('-noo')
$_NO_WHITESPACE_REMOVAL = ARGV.include?('-nwr')
$_NO_GZIP = false

# DON'T COMPRESS THESE WORDS IN THE SOURCE:
$_RESERVED_NAMES= [
  
  ## template stuff:
  '_ID', '_WIDTH', '_HEIGHT',
  
]

