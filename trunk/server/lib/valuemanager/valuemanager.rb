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
  
  
require 'rexml/document'
include REXML

require 'pp'

require 'lib/values/hvalue'
require 'lib/values/hcolorvalue'
require 'lib/values/hcontrolvalue'
require 'lib/values/hdatevalue'
require 'lib/values/hrectvalue'
require 'lib/values/htablevalue'

require 'lib/session/randgen'

##
# ValueManager does the duties of the server-side representation of values.
# It integrates seamless syncronization of values and also detects the (experimental)
# command formats of values.
#
class HValueManager
  
  attr_reader :values
  
  ## Initializes the member value handler objects.
  def initialize
    
    ## The value type parsers by string
    @value_parsers = {}
    
    @value_parsers['hvalue'] = HValueParser.new
    @value_parsers['color']  = HColorValueParser.new
    
    ## local / global value storage
    @values = {
      
      ## session-specific values, by session id, see init_session_values
      :session => {
      },
      
      ## global values, shared by all sessions, by id.
      :global  => {
        # use names as a secondary reference to get the id.
        :names => {}
      }
    }
    
    @value_implementation_version = 2240
    
    @value_id_generator = HRandgen.new(16,600)
    #@last_value_id = 0
  end
  
  ## counter for new value id's (returns an unique integer)
  def new_value_id
    #@last_value_id += 1
    #return @last_value_id
    return @value_id_generator.give_one
  end
  
  ## make the session-specific value collection, if not found
  def init_session_values( msg )
    @values[ :session ][ msg.ses_id ] = {
      :sync  => [], # value id's to sync to client
      :check => [], # value id's to validate in server (from client)
      :names => {}  # map value names to value id's (both global and local)
    }
  end
  
  ##
  # Checks, if the session data structures exist, if not:
  #  - creates a new structure for the session.
  ##
  def init_ses( msg )
    init_session_values( msg ) if not @values[ :session ].has_key?( msg.ses_id )
  end
  
  ###
  ## Builds the msg.hsyncvalues hash of data from the client request.
  ## Its arguments are:
  ##  - msg: The http message object passed around during the request.
  ##  - syncdata_str: The xml data from the client.
  ##
  ### syncdata_str sample:
  ## <hsyncvalues version="1700" length="1"><hvalue id="launch:load_something" order="0" jstype="boolean" length="4">true</hvalue></hsyncvalues>
  ###
  def from_client( msg, syncdata_str )
    
    # makes an xml parser object 'syncdata_xml' of the xml string 'syncdata_str'
    syncdata_xml = Document.new( syncdata_str )
    
    # gets the <hsyncvalues.../hsyncvalues> element (should only be one of these)
    syncdata_xml.elements.each( 'hsyncvalues' ) do |syncvalues_xml|
      
      # gets the version of the input xml
      syncvalversion = syncvalues_xml.attributes['version'].to_i
      
      # the client xml generator should match the server parser's version.
      raise "HSyncValues; wrong version!" if syncvalversion != @value_implementation_version
      
      # loop through available parsers and..
      @value_parsers.each_key do |value_type|
        # ..pass the xml value items to the value parser objects
        syncvalues_xml.elements.each(value_type) do |value_xml|
          @value_parsers[ value_type ].parse_xml( msg, value_xml )
        end
      end
    end
  end
  
  ###
  ## Sets a value by name
  ###
  def set_by_name( msg, val_name, val_data )
    ses_check( msg )
    set( msg, val_id, val_data )
  end
  
  ###
  ## Sets a value by id
  ###
  def set( msg, val_id, val_data )
    
    # get the session data of this session
    session_values = @values[:session][msg.ses_id]
    
    # tell the value of that id that it has new data
    val_obj = session_values[ val_id ]
    val_obj.set( msg, val_data )
  end
  
  ###
  ## Validates user entered entries
  ###
  def validate( msg )
    session_values = @values[:session][msg.ses_id]
    check_ids = session_values[:check]
    check_ids.each do |check_id|
      session_values[check_id].tell( msg )
    end
  end
  
  ###
  ## Sends the status of changed values to the client.
  ###
  def to_client( msg )
    
    # get the session data of this session
    session_values = @values[:session][msg.ses_id]
    
    # go through the currently un-synced values
    # (no each, because we don't want to spend a possible eternity here, if code is synced faster than processed)
    session_values[:sync].size.times do |count_num|
      
      # the array will return the value id
      val_id = session_values[:sync].shift
      
      # tell the value of that id to report its state to the client
      session_values[ val_id ].to_client( msg )
      
    end
    
  end
  
end


