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

# ValueManager uses rexml for client -> server data parsing
require 'rexml/document'
include REXML

# Require needed value types (hvalue supports bool/float/int/string)
require 'values/hvalue'

# RandomGenerator produces unique, random values
require 'util/randgen'

=begin
 ValueManager provides automagic, transparent syncronization of values between client and server.
=end
class ValueManager
  
  attr_accessor :randgen
  
  ## Initializes the member value handler objects.
  def initialize
    
    @config = $config[:values_conf]
    
    ## The value type parsers by string
    @value_parsers = {}
    
    @value_parsers['b'] = BoolValueParser.new
    @value_parsers['f'] = FloatValueParser.new
    @value_parsers['i'] = IntValueParser.new
    @value_parsers['s'] = StringValueParser.new
    
    # the version is checked to ensure client and server are compatible
    @value_implementation_version = 8118 # 8000+revision
    
    ## 'Unique' Random String generator for HValue keys (passed on to the client)
    @randgen = RandomGenerator.new( @config[:key_length], @config[:buffer_size] )
    
  end
  
  ## Re-constructs all stored values and sends them to the client
  def resend_session_values( msg )
    
    # with disposable keys enabled,
    # sessions restored from cookie_key replace
    # all val_id:s with new ones
    if @config[:disposable_keys]
      
      # get the session values
      ses_values = msg.session[:values]
      
      # loop through the value id:s
      old_ids = ses_values[:by_id].keys
      old_ids.each do |old_id|
        
        # make a new id
        new_id = @randgen.get_one
        
        # get the hvalue
        val_obj = ses_values[:by_id][old_id]
        
        # replace the old id in the hvalue itself
        val_obj.val_id = new_id
        
        # re-associate the value with the new id
        ses_values[:by_id][new_id] = val_obj
        ses_values[:by_id].delete(old_id)
        
        # replace the id in the unvalidated values (:check) array
        if ses_values[:check].include?(old_id)
          old_idx = ses_values[:check].index(old_id)
          ses_values[:check][old_idx] = new_id
        end
        
        # replace the id in the unsynchronized values (:sync) array
        if ses_values[:sync].include?(old_id)
          old_idx = ses_values[:sync].index(old_id)
          ses_values[:sync][old_idx] = new_id
        end
        
        # tell the hvalue to send its client-side initialization
        val_obj.restore( msg )
        
      end
    
    ## keeping the id:s between page reloads is faster, but less tamper-proof
    else
      msg.session[:values][:by_id].each_key do |val_id|
        msg.session[:values][:by_id][val_id].restore( msg )
      end
    end
    
  end
  
  ### Parses the xml from the client and passes it on to associated parsers
  def xhr( msg, syncdata_str )
    
    # makes an xml parser object 'syncdata_xml' of the xml string 'syncdata_str'
    syncdata_xml = Document.new( syncdata_str )
    
    # gets the <hsyncvalues.../hsyncvalues> element (should only be one of these)
    syncdata_xml.elements.each( 'hsyncvalues' ) do |syncvalues_xml|
      
      # gets the version of the input xml
      syncvalversion = syncvalues_xml.attributes['version'].to_i
      
      # the client xml generator should match the server parser's version.
      if syncvalversion != @value_implementation_version
        if $DEBUG_MODE
          puts
          puts "CLIENT/SERVER hsyncvalues version mismatch: #{syncvalversion} vs #{@value_implementation_version}"
          puts
        end
        $SESSION.stop_client_with_message( msg,
          @config[:messages][:version_mismatch][:title],
          @config[:messages][:version_mismatch][:descr],
          @config[:messages][:version_mismatch][:uri]
        )
        return
      end
      
      # loop through available parsers and..
      @value_parsers.each_key do |value_type|
        
        # ..pass the xml value items to the associated value parser objects
        syncvalues_xml.elements.each(value_type) do |value_xml|
          @value_parsers[ value_type ].parse_xml( msg, value_xml )
        end
        
      end
    end
  end
  
  ### Sets a value by id
  def set( msg, val_id, val_data )
    
    # get the session data of this session
    session_values = msg.session[:values][:by_id]
    
    # tell the value of that id that it has new data
    val_obj = session_values[ val_id ]
    val_obj.set( msg, val_data )
  end
  
  ### Validates the new data of all client-side-modified session-bound values
  def validate( msg )
    
    # get the session data of this session
    session_values = msg.session[:values]
    
    # loop through un-validated values and validate them
    check_ids = session_values[:check]
    check_ids.each do |check_id|
      session_values[:by_id][check_id].tell( msg )
    end
    
  end
  
  ### Sends the new data of all server-side-modified session-bound values to the client
  def sync_client( msg )
    
    # get the session data of this session
    session_values = msg.session[:values]
    
    # go through the currently un-synced values
    session_values[:sync].size.times do |count_num|
      
      # the sync-array will return the value id
      val_id = session_values[:sync].shift
      
      # tell the value of that id to report its state to the client
      session_values[:by_id][val_id].to_client( msg )
      
    end
    
  end
  
end


