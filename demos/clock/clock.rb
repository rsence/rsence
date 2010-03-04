#--
##   Riassence Framework
 #   Copyright 2010 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##
 #++

# = Riassence Clock
# This plugin demonstrates a simple yaml-based gui with
# minimal server interaction.
# The server-side code simply constructs and registers a
# GUIPlugin instance that loads the associated gui/clock.yaml file
# and sends its contents to the client where it's rendered.
GUIPlugin.new.register( 'clock' )
