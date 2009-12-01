##   Riassence Framework
 #   Copyright 2007 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##


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
    'system', 'application',
    
    # Server communication package
    'comm',
    'queue', 'session', 'transporter', 'sessionwatcher', 'urlresponder', 'autosync',
    'values',
    'value', 'jsloader',
    'json_renderer',
    
    # Multi-control-single-value controller
    'valuematrix',
    
    # geometry
    'point', 'rect',
    
    # ui foundation
    'thememanager',
    'markupview', 'morphanimation', 'view',
    'eventresponder', 'valueresponder',
    'dummyvalue', 'controldefaults',
    'control',
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
    'progressbar','progressindicator','imageview','stepper',
    'validatorview','window','tab',
    
    'sheet', 'alert_sheet', 'confirm_sheet'
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
    'timesheet','timesheet_item','timesheet_item_edit'
  ],
  
  'lists' => [
    'listitems',
    'checkboxlist',
    'radiobuttonlist'
  ],
  
  'json_renderer' => [
    'json_renderer_pre_check',
    'json_renderer',
    'json_renderer_post_check',
#    'json_renderer_test'
  ]
}

# Backwards compatibility
$_PACKAGE_NAMES.push('basic')
$_PACKAGES['basic'] = $_PACKAGES['controls']


# All in one -package
$_PACKAGE_NAMES.push('allinone')
$_PACKAGES['allinone'] = $_PACKAGES['core'] + $_PACKAGES['controls'] + $_PACKAGES['lists'] + $_PACKAGES['datetime']


# Themes to include
$_THEMES = ['default','bright']

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

