###
  # HIMLE RIA Server
  # Copyright (C) 2008 HIMLE GROUP http://himle.sorsacode.com/
  # Copyright (C) 2006-2007 Helmi Technologies Inc.
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

##
# The Message object holds references to all data of a single request.
#
# It has the following objects:
#  app:     The currently delegated application name
#  command: The currently delegated application method name
#  data:    The currently delegated application input data
#  output:  The response output buffer
#  session: The session data
#  ses_id:  The current session id
#  system:    A reference to the static application instance collection
#  hsyncvalues:  Session HValue & compatible objects
#  valuemanager: The value management system
#
##

require 'lib/img/imgserve'

class Message
  
  attr_accessor :app, :command, :data, :output, :session, :ses_id, :system, :hsyncvalues, :valuemanager, :new_session, :restored_session, :ses_valid, :request, :response
  
  def initialize( request, response )
    
    @request  = request
    @response = response
    
    @system      = nil
    @app         = nil
    @command     = nil
    @hsyncvalues = {}
    @data        = nil
    @session     = {}
    @ses_id      = 0
    
    @output      = []
    
    @new_session = false
    @restored_session = false
    
    @valuemanager = nil
    
    @ses_valid = false
    
  end
  
  def reply(data)
    @output.push(data)
  end
  
  def run(*args)
    @system.run(*args)
  end
  
  def serve_img( img_obj, img_format='PNG' )
    return IMGSERVE.serve( self, img_obj, img_format )
  end
end

