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

class HColorValue < HValue
  
  def add( msg )
    session_values = msg.valuemanager.values[:session][msg.ses_id]
    
    if session_values.has_key?( @val_id )
      raise "HColorValue; Duplicate ID when adding! (#{@val_id.inspect})"
    end
    
    ## Store the object here
    session_values[ @val_id  ]  = self
    
    ## Initialize a new client value
    init_str = "common_values.#{@val_name}=new HColorValue( #{@val_id}, [#{@data.join(',')}]);"
    msg.reply init_str
    
    ## Set the valid flag, so we know that the value is initially in sync
    @valid = true
    
    ## Make a reference by name also to aid developer-friendliness
    if session_values[ :names ].has_key?( @val_name )
      raise "HColorValue; Duplicate Value Name when adding! (#{@val_name.inspect})"
    end
    
    session_values[ :names ][ @val_name ] = @val_id
  end
  
  def initialize( msg, name, data )
    @val_id   = msg.valuemanager.new_value_id
    @val_name = name
    @type     = 'color'
    set( msg, data, true )
    @sync  = false
    @valid = true
    add( msg )
    @members = []
  end
  
  def from_client( msg, red, green, blue )
    #if (@data[0] != red) or (@data[1] != green) or (@data[2] != blue)
      
    ## set takes care of the setting..
    @data = [red,green,blue]
    
    ## change the valid state, because the value was set by the client!
    @valid = false
    
    ## add the id to the values to be checked
    check_ids = msg.valuemanager.values[:session][msg.ses_id][:check]
    unless check_ids.include?( @val_id )
      check_ids.push( @val_id )
    end
    
    #end
  end
  
  def set( msg, data_arr, dont_tell_client=false )
    @data      = data_arr
    unless dont_tell_client
      ## update the flags
      @sync  = false
      @valid = true
      
      ## add the id to the values to be syncronized (to client)
      sync_ids = msg.valuemanager.values[:session][msg.ses_id][:sync]
      unless sync_ids.include?( @val_id )
        sync_ids.push( @val_id )
      end
    end
  end
  
  def to_hex
    return '#'+@data.pack("ccc").unpack("H*")[0]
  end
  
  def to_css
    return "rgb(#{@data.join(',')})"
  end
  
  def to_client( msg )
    msg.reply "HVM.set( #{@val_id}, [#{@data.join(',')}] );"
  end
  
end

class HColorValueParser
  
  def parse_xml( msg, hvalue_xml )
    
    ## get the value id from xml
    val_id = hvalue_xml.attributes['id']
    
    ## parse the value id to integer
    if val_id == val_id.to_i.to_s
      val_id = val_id.to_i
    else
      puts "HColorValue; string value id's not supported yet! (tried to set #{val_id.inspect})"
      return
    end
    
    ## get the value data
    val_red   = hvalue_xml.elements['red'].text.to_i
    val_green = hvalue_xml.elements['green'].text.to_i
    val_blue  = hvalue_xml.elements['blue'].text.to_i
    [val_red, val_green, val_blue].each do | val_chk |
      if val_chk > 255 or val_chk < 0
        raise "HColorValue; part-color out of range! (#{val_id}: rgb(#{val_red.inspect},#{val_green.inspect},#{val_blue.inspect}))"
      end
    end
    
    ## store the value
    session_values = msg.valuemanager.values[:session][msg.ses_id]
    if session_values.has_key?( val_id )
      value_obj = session_values[ val_id ]
      value_obj.from_client( msg, val_red, val_green, val_blue )
    else
      raise "HColorValue; unassigned value id! (#{val_id.inspect})"
    end
  end
end