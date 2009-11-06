# -* coding: UTF-8 -*-
##   Riassence Framework
 #   Copyright 2006 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##


# Require needed value types (hvalue supports bool/float/int/string)
require 'values/hvalue'

# RandomGenerator produces unique, random values
require 'ext/randgen'

module Riassence
module Server

=begin
 ValueManager provides automagic, transparent syncronization of values between client and server.
=end
class ValueManager
  
  attr_accessor :randgen
  
  ## Initializes the member value handler objects.
  def initialize
    
    @config = $config[:values_conf]
    
    ## 'Unique' Random String generator for HValue keys (passed on to the client)
    @randgen = RandGen.new( @config[:key_length] )
    
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
        new_id = @randgen.gen
        
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
  
  ### Parses the json from the client and passes it on to associated values
  def xhr( msg, syncdata_str )
    
    # parses the json data sent by the client
    syncdata = JSON.parse( syncdata_str )
    
    session_values = msg.session[:values][:by_id]
    syncdata.each do |value_key, value_data|
      if session_values.has_key?( value_key )
        value_obj = session_values[ value_key ]
        value_obj.from_client( msg, value_data )
      else
        raise "HValue; unassigned value id! (#{val_id.inspect})"
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


end
end