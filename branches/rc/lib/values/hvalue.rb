# -* coding: UTF-8 -*-
###
  # Riassence Core -- http://rsence.org/
  #
  # Copyright (C) 2008 Juha-Jarmo Heinonen <jjh@riassence.com>
  # Copyright (C) 2006 Helmi Technologies Inc.
  #
  # This file is part of Riassence Core.
  #
  # Riassence Core is free software: you can redistribute it and/or modify
  # it under the terms of the GNU General Public License as published by
  # the Free Software Foundation, either version 3 of the License, or
  # (at your option) any later version.
  #
  # Riassence Core is distributed in the hope that it will be useful,
  # but WITHOUT ANY WARRANTY; without even the implied warranty of
  # MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  # GNU General Public License for more details.
  #
  # You should have received a copy of the GNU General Public License
  # along with this program.  If not, see <http://www.gnu.org/licenses/>.
  #
  ###


module Riassence
module Server

=begin
HValue is the server-side representation of the client's HValue object.
It's the 'messenger' to syncronize server-client data and is smart enough
to validate and process itself as well as tell the client-side
representation of itself.
=end
class HValue
  
  attr_reader :valid, :sync, :val_id, :data, :type, :jstype, :members
  attr_writer :valid, :val_id
  
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
  
  ## method for binding the value to the session data
  def add( msg )
    
    # get the value storage from the session data
    session_values = msg.session[:values][:by_id]
    
    ## Store the object here
    session_values[ @val_id ] = self
    
    ## Sends the client-side description
    restore( msg )
    
    ## Set the valid flag, so we know that the value is initially in sync
    @valid = true
  end
  
  ## (Re-)Send the client-size representation
  def restore( msg )
    ## Initialize a new client value
    init_str = "HValue.nu('#{@val_id}', #{@data.to_json});"
    msg.reply( init_str )
  end
  
  def initialize( msg, data )
    
    ## Get an unique integer id for the value
    @val_id   = $VALUES.randgen.get_one
    
    ## HValue's type is 'hvalue', just as in js
    @type     = 'hvalue'
    
    ## set the data of the hvalue
    set( msg, data, true )
    
    ## the @sync flag is raised, when the client data is older than the server data
    @sync  = false
    
    ## the @is_valid flas is lowered, when the client data is newer than the server data
    @is_valid = true
    
    ## Bind the value to the value manager and report it to the client
    add( msg )
    
    ## storage for validator bindings
    @members = {}
    
  end
  
  ## Binds the value to the plugin method (both as
  ## strings; plugin as the name registered in PluginManager)
  ##
  ## It uses strings instead of '...method(...)' because
  ## it won't work with marshal. Strings are easier and work
  ## as well.
  def bind( plugin_name, method_name )
    @members[plugin_name] = [] unless @members.has_key?( plugin_name )
    @members[plugin_name].push( method_name ) unless @members[plugin_name].include?( method_name )
    return true
  end
  
  ## Releases the binding of the value, both params as
  ## in bind, but optional (false = 'wildcard')
  def release( plugin_name=false, method_name=false )
    return release_all if not plugin_name and not method_name
    return false unless @members.has_key?( plugin_name )
    if not method_name
      @members.delete( plugin_name )
    else 
      @members[plugin_name].slice!(@members[plugin_name].index( method_name )) if @members[plugin_name].include?(method_name)
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
    @members.each_key do |plugin_name|
      @members[plugin_name].each do |method_name|
        invalid_count += 1 unless $PLUGINS.run_plugin( plugin_name, method_name, msg, self ) 
      end
    end
    if invalid_count == 0
      @is_valid = true
      msg.session[:values][:check].delete( @val_id )
    end
  end
  
  ## handle client updates
  def from_client( msg, data )
    
    # only process changes, if different from the one already stored.
    if @data != data
      
      ## set takes care of the setting..
      @data = data
      
      ## change the valid state, because the value was set by the client!
      @is_valid = false
      
      ## add the id to the values to be checked
      check_ids = msg.session[:values][:check]
      unless check_ids.include?( @val_id )
        check_ids.push( @val_id )
      end
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
      ## unknown type: default to string (.to_json takes care of that)
      @jstype = 'string'
      @data   = data.to_json
    end
    
    # won't tell the client about the change, usually not needed
    unless dont_tell_client
      ## update the flags
      @sync  = false
      @is_valid = true
      
      ## add the id to the values to be syncronized (to client)
      sync_ids = msg.session[:values][:sync]
      unless sync_ids.include?( @val_id )
        sync_ids.push( @val_id )
      end
    end
  end
  
  ## tell the client that the value changed
  def to_client( msg )
    msg.reply "HVM.s( '#{@val_id}', #{@data.to_json} );" 
  end
  
  ## clean up self
  def die( msg=false )
    
    release_all
    
    # get the value storage from the session data
    session_values = msg.session[:values][:by_id]
    
    ## Store the object here
    session_values.delete[ @val_id ]
    
    if msg
      msg.reply("HVM.del('#{@val_id}');")
    end
  end
  
end

class UploadValue < HValue
  
  @state_responders = {
    :ready   => [], # id == 0
    :started => [], # id == 1
    :process => [], # id == 2 ; also uses bind
    3 => [], # id == 3
    4 => [], # id == 4
    :error => [] # id < 0
  }
  
  @upload_state = 0
  @upload_key = ''
  @uploads = []
  
  # the data should contain both state and key in the value
  def from_client( msg, data )
    
    ## change the valid state, because the value was set by the client!
    @is_valid = data.include?(':::')
    
    # the state and key are separated by the ':::' delimitter string
    if @is_valid
      
      # split state and key using the delimitter
      (upload_state, upload_key) = data.split(':::')
      
      # the state is a number
      upload_state = upload_state.to_i
      
      @upload_state = upload_state
      @upload_key = upload_key
      
      # negative states are errors
      if upload_state < 0
        # "upload error: #{upload_state}"
        # (parse the error)
        unless @state_respders[:error].empty?
          @state_responders[:error].each do |plugin_name,method_name|
            msg.run( plugin_name,method_name,msg,self,upload_state )
          end
        end
        
      # the default state, 0 means the ui is ready to send an
      # upload and ticketserve is ready to receive it
      elsif upload_state == 0
        # "upload state: ready to upload."
        # (do nothing)
        
        unless @state_respders[:ready].empty?
          @state_responders[:ready].each do |plugin_name,method_name|
            msg.run( plugin_name,method_name,msg,self,upload_state )
          end
        end
        
      # this state means the upload's transfer is started and progressing
      elsif upload_state == 1
        # "upload state: upload started."
        # (show progress bar)
        
        unless @state_respders[:started].empty?
          @state_responders[:started].each do |plugin_name,method_name|
            msg.run( plugin_name,method_name,msg,self,upload_state )
          end
        end
      
      # this state means the upload's transfer is complete,
      # but the uploaded data hasn't been handled yet.
      elsif upload_state == 2
        # "upload state: waiting to process."
        
        uploads = $TICKETSERVE.get_uploads(upload_key,true)
        if uploads.size == 1
          uploaded_data = uploads[0]
          
          # only process changes, if different from the one already stored.
          if uploaded_data != @data
            
            @data = uploaded_data
            
            ## add the id to the values to be checked
            check_ids = msg.session[:values][:check]
            unless check_ids.include?( @val_id )
              check_ids.push( @val_id )
            end
            
          end
          $TICKETSERVE.del_uploads(upload_key,msg.ses_id)
        else
          # "upload, amount of uploads: #{uploads.size}"
        end
        
        # 
        hvalue.set(msg,"3:::#{upload_key}")
        
        msg.console( "upload state: set to ack" )
        
      elsif upload_state == 3
        # "upload state: waiting for user ack."
        # (do nothing)
        
        msg.console( "upload state: waiting user ack" )
        
        
      elsif upload_state == 4
        # "upload state: user wants to upload again."
        # (set a new upload key, )
        
        msg.console( "upload state: ack, getting new key" )
        
        
        setup_upload( msg, hvalue )
        
        
      else
        # "upload unknown state: #{upload_state.inspect}"
      end
    end
    return true
  end
  def setup_upload(msg,hvalue,size_bytes=500*1024,accept_mime=/image\/(.*?)/,allow_multi=false)
    upload_key = $TICKETSERVE.upload_key(msg,hvalue.val_id,size_bytes,accept_mime,allow_multi)
    hvalue.set( msg, upload_key )
  end
end

## Skeleton HValue parser
class ValueParser
  
  def initialize( default_value=nil )
    @default_value = default_value
  end
  
  # please replace the process_data -method.
  def process_data( msg, hvalue_xml )
    puts "Warning: process_data not implemented for #{self.class.inspect}" if $DEBUG_MODE
    return @defalut_value
  end
  
  # gets called from valuemanager
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
    session_values = msg.session[:values][:by_id]
    if session_values.has_key?( val_id )
      value_obj = session_values[ val_id ]
      value_obj.from_client( msg, val_data )
    else
      raise "HValue; unassigned value id! (#{val_id.inspect})"
    end
  end
end

## HValue parser that understands boolean data
class BoolValueParser < ValueParser
  
  ## defaults to false
  def initialize( default_value=false )
    super
  end
  
  ## parses boolean data from client: <b id='xyz'>1</b>
  def process_data( msg, hvalue_xml )
    val_data = hvalue_xml.text
    if val_data != nil
      return true  if val_data == '1'
      return false if val_data == '0'
    end
    puts "Warning: using default data: #{@default_value.inspect} instead of #{val_data.inspect}" if $DEBUG_MODE
    return @default_value
  end
end

## HValue parser that understands floating-point numbers
class FloatValueParser < ValueParser
  
  ## defaults to 0.0
  def initialize( default_value=0.0 )
    super
  end
  
  ## parses floating-point-numeric data from the client: <f id='xyz'>1234.5678</f>
  def process_data( msg, hvalue_xml )
    val_data = hvalue_xml.text
    if val_data != nil
      return val_data.to_f
    end
    puts "Warning: using default data: #{@default_value.inspect} instead of #{val_data.inspect}" if $DEBUG_MODE
    return @default_value
  end
  
end

## HValue parser that understands integer numbers
class IntValueParser < ValueParser
  
  ## defaults to 0
  def initialize( default_value=0 )
    super
  end
  
  ## parses integer numeric data from the client: <i id='xyz'>1234</i>
  def process_data( msg, hvalue_xml )
    val_data = hvalue_xml.text
    if val_data != nil
      return val_data.to_i
    end
    puts "Warning: using default data: #{@default_value.inspect} instead of #{val_data.inspect}" if $DEBUG_MODE
    return @default_value
  end
  
end

## HValue parser that understands base64-encoded strings
class StringValueParser < ValueParser
  
  ## defaults to ''
  def initialize( default_value='' )
    super
  end
  
  ## parses base64-encoded string data from the client: <s id='xyz'>d898gD98guadbaxDDgd</s>
  def process_data( msg, hvalue_xml )
    val_data = hvalue_xml.text
    if val_data != nil
      val_data = Iconv.iconv('utf-8','utf-16be',val_data.unpack('m*')[0])[0]
      while val_data[-1].chr == "\000"
        val_data.chop!
      end
      return val_data
    end
    puts "Warning: using default data: #{@default_value.inspect} instead of #{val_data.inspect}" if $DEBUG_MODE
    return @default_value
  end
end

## Flat, simple Array value parser (arrays encoded as strings, then decoded usin JSON.parse)
## <a id='xyz'>WzEsImZvbyIse2ZvbzoiYmFyIn1d</a>
class ArrayValueParser < ValueParser
  
  ## defaults to ''
  def initialize( default_value=[] )
    super
  end
  
  ## parses base64-encoded string data from the client: <s id='xyz'>d898gD98guadbaxDDgd</s>
  def process_data( msg, hvalue_xml )
    val_data = hvalue_xml.text
    if val_data != nil
      len = hvalue_xml.attributes['len'].to_i
      arr_data_raw = JSON.parse( val_data )
      if arr_data_raw.size != len
        puts "Warning: using default data: #{@default_value.inspect} instead of #{val_data.inspect}" if $DEBUG_MODE
        return @default_value
      end
      arr_data = []
      arr_data_raw.each do |data_item|
        data_item_class = data_item.class
        if String == data_item_class
          data_item = Iconv.iconv('utf-8','utf-16',data_item.unpack('m*')[0])[0]
          while data_item[-1].chr == "\000"
            data_item.chop!
          end
        elsif not [Float,Fixnum,Bignum,TrueClass,FalseClass].include?( data_item_class )
          puts "Warning: using default data: #{@default_value.inspect} instead of #{val_data.inspect}" if $DEBUG_MODE
          return @default_value
        end
        arr_data.push( data_item )
      end
      return arr_data
    end
    puts "Warning: using default data: #{@default_value.inspect} instead of #{val_data.inspect}" if $DEBUG_MODE
    return @default_value
  end
end

end
end

