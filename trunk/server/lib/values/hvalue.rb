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

class HValue
  
  attr_reader :valid, :sync, :val_id, :data, :type, :jstype, :members
  attr_writer :valid
  
  ## value conversion table between js and ruby
  @@jstype_conv = {
    'String'      => 'string',
    'Fixnum'      => 'number',
    'Bignum'      => 'number',
    'Float'       => 'number',
    'TrueClass'   => 'boolean',
    'FalseClass'  => 'boolean',
    'Array'       => 'object'
  }
  
  ## method for adding the value to the value manager
  def add( msg )
    
    #session_values = msg.valuemanager.values[:session][msg.ses_id]
    session_values = msg.session[:values][:by_id]
    
    if session_values.has_key?( @val_id )
      raise "HValue; Duplicate ID when adding! (#{@val_id.inspect})"
    end
    
    ## Store the object here
    session_values[ @val_id  ]  = self
    
    restore( msg )
    
    ## Set the valid flag, so we know that the value is initially in sync
    @valid = true
    
  end
  
  ## re-send client-size representation
  def restore( msg )
    ## Initialize a new client value
    init_str = "new HValue(#{@val_id.inspect}, #{@data.inspect});"
    msg.reply init_str
  end
  
  def initialize( msg, data )
    
    ## Get an unique integer id for the value
    @val_id   = msg.valuemanager.new_value_id
    
    ## HValue's type is 'hvalue', just as in js
    @type     = 'hvalue'
    
    ## set the data of the hvalue
    set( msg, data, true )
    
    ## the @sync flag is raised, when the client data is older than the server data
    @sync  = false
    
    ## the @valid flas is lowered, when the client data is newer than the server data
    @valid = true
    
    ## Add the value to the value manager and report it to the client
    add( msg )
    
    ## store value bindings here
    @members = {}
    
  end
  
  ## bind the value to the app method (both as strings; app as the name registered in HSystem)
  def bind( app_name, method_name )
    @members[app_name] = [] unless @members.has_key?( app_name )
    @members[app_name].push( method_name ) unless @members[app_name].include?( method_name )
    return true
  end
  
  ## release the binding of the value, both params as in bind, but optional (wildcards as false)
  def release( app_name=false, method_name=false )
    return release_all if not app_name and not method_name
    return false unless @members.has_key?( app_name )
    if not method_name
      @members.delete( app_name )
    else 
      @members[app_name].slice!(@members[app_name].index( method_name )) if @members[app_name].include?(method_name)
    end
    return true
  end
  
  ## release all members
  def release_all
    @members = {}
    return true
  end
  
  # the unbind method can be used as an alias to release (as in the client)
  alias unbind release
  
  ## tell all bound instances that the value is changed
  def tell( msg )
    invalid_count = 0
    @members.each_key do |app_name|
      @members[app_name].each do |method_name|
        invalid_count += 1 unless msg.system.run_app( app_name, method_name, msg, self ) 
      end
    end
    if invalid_count == 0
      @valid = true
      #msg.valuemanager.values[:session][msg.ses_id][:check].delete( @val_id )
      msg.session[:values][:check].delete( @val_id )
    end
  end
  
  ## handle client updates
  def from_client( msg, data )
    
    if @data != data
      
      ## set takes care of the setting..
      @data = data
      
      #puts "-"*80
      puts "#{msg.ses_id}.#{@val_id}: #{data.inspect} != #{@data.inspect}" if $config[:debug_mode]
      #puts "-"*80
      #puts
      
      ## change the valid state, because the value was set by the client!
      @valid = false
      
      ## add the id to the values to be checked
      #check_ids = msg.valuemanager.values[:session][msg.ses_id][:check]
      check_ids = msg.session[:values][:check]
      unless check_ids.include?( @val_id )
        check_ids.push( @val_id )
      end
    else
      puts "#{msg.ses_id}.#{@val_id}: #{@data.inspect} == #{data.inspect}" if $config[:debug_mode]
    end
    
  end
  
  ## sets the data
  def set( msg, data, dont_tell_client=false )
    
    ## check, if the data class is a supported type
    if @@jstype_conv.has_key?( data.class.inspect )
      ## the data should be correct
      @jstype = @@jstype_conv[ data.class.inspect ]
      @data   = data
    else
      ## unknown type: default to string (.inspect takes care of that)
      @jstype = 'string'
      @data   = data.inspect
    end
    unless dont_tell_client
      ## update the flags
      @sync  = false
      @valid = true
      
      ## add the id to the values to be syncronized (to client)
      #sync_ids = msg.valuemanager.values[:session][msg.ses_id][:sync]
      sync_ids = msg.session[:values][:sync]
      unless sync_ids.include?( @val_id )
        sync_ids.push( @val_id )
      end
    end
  end
  
  ## tell the client that the value changed
  def to_client( msg )
    msg.reply "HVM.s( #{@val_id.inspect}, #{@data.inspect} );" 
  end
  
  ## clean up self
  def die
  end
  
end


class ValueParser
  def initialize( default_value=nil )
    @default_value = default_value
  end
  # please replace the process_data -method.
  def process_data( msg, hvalue_xml )
    puts "Warning: process_data not implemented for #{self.class.inspect}"
    return @defalut_value
  end
  def parse_xml( msg, hvalue_xml )
    
    ## get the value id from xml
    val_id = hvalue_xml.attributes['id']
    
    ## parse the value id to integer
    if val_id == val_id.to_i.to_s
      val_id = val_id.to_i
    end
    
    ## get the parsed value data
    val_data = process_data( msg, hvalue_xml )
    
    ## store the value
    #session_values = msg.valuemanager.values[:session][msg.ses_id]
    session_values = msg.session[:values][:by_id]
    if session_values.has_key?( val_id )
      value_obj = session_values[ val_id ]
      value_obj.from_client( msg, val_data )
    else
      raise "HValue; unassigned value id! (#{val_id.inspect})"
    end
  end
end

class BoolValueParser < ValueParser
  def initialize( default_value=false )
    super
  end
  def process_data( msg, hvalue_xml )
    val_data = hvalue_xml.text
    if val_data != nil
      return true  if val_data == '1'
      return false if val_data == '0'
    end
    puts "Warning: using default data: #{@default_value.inspect} instead of #{val_data.inspect}"
    return @default_value
  end
end

class FloatValueParser < ValueParser
  def initialize( default_value=0.0 )
    super
  end
  def process_data( msg, hvalue_xml )
    val_data = hvalue_xml.text
    if val_data != nil
      return val_data.to_f
    end
    puts "Warning: using default data: #{@default_value.inspect} instead of #{val_data.inspect}"
    return @default_value
  end
end

class IntValueParser < ValueParser
  def initialize( default_value=0 )
    super
  end
  def process_data( msg, hvalue_xml )
    val_data = hvalue_xml.text
    if val_data != nil
      return val_data.to_i
    end
    puts "Warning: using default data: #{@default_value.inspect} instead of #{val_data.inspect}"
    return @default_value
  end
end

class StringValueParser < ValueParser
  def initialize( default_value='' )
    super
  end
  def process_data( msg, hvalue_xml )
    val_data = hvalue_xml.text
    if val_data != nil
      val_data = val_data.unpack('m*')[0] # base64
      while val_data[-1..-1] == "\000"
        val_data.chop!
      end
      return val_data
    end
    puts "Warning: using default data: #{@default_value.inspect} instead of #{val_data.inspect}"
    return @default_value
  end
end

