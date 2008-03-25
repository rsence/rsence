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

$_INC_NAME = 'js.inc'

# sorted by output order:
$_PACKAGE_NAMES = ['core','basic','tabs','window','servermessage','iefix']
$_PACKAGES = {
  'core' => [
    'class',
    'common',
    'ajax',
    'elem',
    'event',
    'sha',
    'transporter','valuemanager','value','jsloader',
    'point','rect',
    'system','application','thememanager','markupview','view','control',
  ],
  'basic' => [
    'button','stringview','textcontrol','textarea','slider','vslider',
    'progressbar','progressindicator','imageview','splitview','stepper','radiobutton',
    'passwordcontrol','divider','checkbox'
  ],
  'tabs' => [
    'tabbar','tablabel','tabview','tabcontrol'
  ],
  'window' => [
    'windowbar','windowlabel','windowview','windowcontrol'
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


# DON'T COMPRESS THESE WORDS IN THE SOURCE:
$_RESERVED_NAMES= [
  
  ## template stuff:
  '_ID', '_WIDTH', '_HEIGHT',
  
  ## javascript reserved:
  "abstract", "boolean", "break", "byte", "case", "catch", "char",
  "class", "const", "continue", "debugger", "default", "delete",
  "do", "doubleelse", "enum", "export", "extends", "false", "final",
  "finally", "float", "for", "function", "goto", "if", "implements",
  "import", "ininstanceof", "int", "interface", "long", "native",
  "new", "null", "package", "private", "protected", "public",
  "return", "short", "static", "superswitch", "synchronized",
  "this", "throw", "throws", "transient", "true", "try", "typeof",
  "var", "void", "volatile", "while", "with",
  
  ## browser
  "setTimeout", "setInterval", "clearTimeout",
  "document", "getElementById", "setAttribute", "setProperty", "style",
  "appendChild", "createElement", "innerHTML", 
  "attributes", "childNodes", "className", "clientWidth", "clientHeight",
  "dir", "firstChild", "id", "lang", "lastChild", "localName",
  "namespaceURI", "nextSibling", "nodeName", "nodeType", "nodeValue",
  "offsetLeft", "offsetTop", "offsetParent", "offsetWidth", "offsetHeight",
  "ownerDocument", "parentNode", "prefix", "previousSibling", "scrollLeft",
  "scrollTop", "scrollHeight", "scrollWidth", "style", "tabIndex", "tagName",
  "title",
  
  ## misc
  'Function', 'console', 'arguments', 'apply', 'callee', 'parent',
  'instanceof', 'indexOf', 'set', 'toLowerCase', 'charAt', 'Object',
  'undefined', 'else', 'position', 'absolute', 'display', 'block',
  'type', 'rect', 'ELEM', 'EVENT', 'CTRL', 'px', 'lefyt', 'top', 'right',
  'bottom', 'width', 'auto', 'height', 'box', 'focus', 'blur', 'Event',
  'e', 'extend', 'cssText', 'getPropertyValue', 'getAttribute',
  'visible', 'currentStyle', 'filter', 'match', 'alpha', 'replace',
  'padding', 'border', 'mode', 'parseInt', 'parseFloat', 'parseString',
  'navigator', 'Opera', 'MSIE', 'KHTML', 'khtml', 'pre', 'div', 'img',
  'span', 'src', 'onload', 'javascript', 'js', 'http', 'readyState',
  'complete', 'Safari', 'Mozilla', 'pointerX', 'pointerY', 'stop',
  'preventDefault', 'window', 'unload', 'status',
  
  'mousemove', 'mouseup', 'mousedown', 'keyup', 'keydown', 'keypress',
  'contextmenu', 'DOMMouseScroll', 'mouseover', 'mouseout', 'Date',
  'zIndex', 'onreadystatechange', 'send', 'sent', 'run', 'step'
  
]

