
module RSence


  # HValue is the model for client-server synchronized values.
  # A value contains its payload {#data} and enough meta-data to define its behavior.
  class HValue
    
    # The validity of the data. Defaults to false, when the data comes from the client.
    # @return [Boolean] True, when set by the server. False when initially set by the client. Also false, unless all responders return true.
    attr_reader :is_valid
    
    # @private Is true when changed by the server. Causes the ValueManager to send its client-side representation.
    attr_reader :sync
    
    # @private The unique ID of the value.
    attr_reader :value_id
    alias val_id value_id
    
    # The payload data. Use {#set} to change.
    attr_reader :data
    
    # @private List of responders
    attr_reader :members
    
    # @private
    attr_writer :is_valid
    
    # @private
    def value_id=(new_id)
      @value_id = new_id
    end
    # @private
    alias val_id= value_id=
    
    alias valid is_valid
    alias valid? is_valid
    
    # @private Method for binding the value to the session data.
    def add( msg )
      
      # get the value storage from the session data
      session_values = msg.session[:values][:by_id]
      
      ## Store the object here
      session_values[ @value_id ] = self
      
      ## Sends the client-side description
      restore( msg )
      
      ## Set the valid flag, so we know that the value is initially in sync
      @is_valid = true
    end
    
    # @private (Re-)Send the client-size representation
    def restore( msg )
      
      ## Tags itself as a new value from the client's point of view
      @is_new_to_client = true
      
      add_to_sync( msg )
      
    end
    
    # Value meta-data. The third constructor parameter
    attr_accessor :meta
    
    # Creates a new client-server automatically synchronized data wrapper object.
    # @param [Message] msg Just pass on the +msg+ from the scope you call from.
    # @param [#to_json] data Any data that can be converted to JSON.
    # @param [Hash] meta Has no effect yet.
    def initialize( msg, data, meta = { :name => nil } )
      
      ## Get an unique integer id for the value
      if RSence.args[:debug] and meta[:name] and not msg.valuemanager.id_exists?( msg, meta[:name] )
        @value_id   = meta[:name]
      else
        @value_id = msg.valuemanager.ses_unique_id( msg )
      end
      
      @meta = meta
      
      ## set the data of the hvalue
      set( msg, data, true )
      
      ## the @sync flag is raised, when the client data is older than the server data
      @sync  = false
      
      ## the @is_valid flag is lowered, when the client data is newer than the server data
      @is_valid = true
      
      ## Bind the value to the value manager and report it to the client
      add( msg )
      
      ## storage for validator bindings
      @members = {}
      
    end
    
    # Binds the value to a responder. The responder is an instance of {Plugins::Plugin__ Plugin} or {Plugins::GUIPlugin__ GUIPlugin}.
    # Responders are called once, when the client requests the data to be changed.
    # Responders must return +true+, if they accept the change. Otherwise the data is treated as invalid.
    # Responders must respond to exactly two parameters: ( (Message) +msg+, (HValue) +value+ )
    #
    # @param [Symbol] plugin_name The name of the registered plugin to call with the +method_name+
    # @param [Symbol] method_name The name of the method of the registered plugin +plugin_name+ to call.
    # @return [true]
    def bind( plugin_name, method_name )
      plugin_name = plugin_name.to_sym unless plugin_name.class == Symbol
      method_name = method_name.to_sym unless method_name.class == Symbol
      @members[plugin_name] = [] unless @members.has_key?( plugin_name )
      @members[plugin_name].push( method_name ) unless @members[plugin_name].include?( method_name )
      return true
    end
    
    # Checks, if the plugin_name and method_name pairing is already bound with the bind method. Returns true or false.
    def bound?( plugin_name, method_name )
      plugin_name = plugin_name.to_sym unless plugin_name.class == Symbol
      method_name = method_name.to_sym unless method_name.class == Symbol
      return false unless @members.has_key?(plugin_name)
      return @members[plugin_name].include?(method_name)
    end
    
    # Releases the responder of the value, both params as in bind, but optional +method_name+ can be omitted, matching all methods bound to the +plugin_name+.
    # @param [Symbol] plugin_name The name of the plugin acting as a responder to the value.
    # @param [Symbol] method_name The name of the method of the plugin acting as a responder to the value.
    # @return [Boolean] Returns true, if successful, false if not bound or other error.
    def release( plugin_name=false, method_name=false )
      plugin_name = plugin_name.to_sym if plugin_name.class == String
      method_name = method_name.to_sym if method_name.class == String
      return release_all if not plugin_name and not method_name
      return false unless @members.has_key?( plugin_name )
      if not method_name
        @members.delete( plugin_name )
      else 
        @members[plugin_name].slice!(@members[plugin_name].index( method_name )) if @members[plugin_name].include?(method_name)
        if @members[plugin_name].empty?
          @members.delete( plugin_name )
        end
      end
      return true
    end
    
    # Releases all responders.
    # @return [true]
    def release_all
      @members = {}
      return true
    end
    
    # @deprecated Use {#release} as the opposite to bind.
    alias unbind release
    
    # @private Tell all bound instances that the value is changed.
    def tell( msg )
      invalid_count = 0
      @members.each_key do |plugin_name|
        @members[plugin_name].each do |method_name|
          invalid_count += 1 unless msg.plugins.run_plugin( plugin_name, method_name, msg, self ) 
        end
      end
      if invalid_count == 0
        @is_valid = true
        msg.session[:values][:check].delete( @value_id )
      end
    end
    
    # @private Handle updates from the client.
    def from_client( msg, data )
      # only process changes, if different from the one already stored.
      if @data != data
        
        # puts "data sync from client: #{@data.inspect} -> #{data.inspect} (#{@meta[:name]})"

        ## set takes care of the setting..
        @data = data
        
        ## change the valid state, because the value was set by the client!
        @is_valid = false
        
        ## add the id to the values to be checked
        check_ids = msg.session[:values][:check]
        unless check_ids.include?( @value_id )
          check_ids.push( @value_id )
        end
      end
      
    end
    
    # @private Adds the value to the sync array.
    def add_to_sync( msg )
      ## add the id to the values to be synchronized (to client)
      sync_ids = msg.session[:values][:sync]
      unless sync_ids.include?( @value_id )
        sync_ids.push( @value_id )
      end
    end
    
    # Sets the data of the value, the change will be synced with the client.
    # @param [Message] msg The {Message} instance.
    # @param [#to_json] data Any data that can be mapped to JSON and handled by the client.
    # @param [Boolean] dont_tell_client Doesn't notify the client about the change, if true.
    def set( msg, data, dont_tell_client=false )
      
      @data   = data
      
      # won't tell the client about the change, usually not needed
      unless dont_tell_client
        ## update the flags
        @sync  = false
        @is_valid = true
        
        add_to_sync( msg )
      end
    end
    
    # Sets the key of the hash data of the value, the change will be synced with the client.
    # @param [Message] msg The {Message} instance.
    # @param [String] key The key of data to change
    # @param [#to_json] data Any data that can be mapped to JSON and handled by the client.
    # @param [Boolean] dont_tell_client Doesn't notify the client about the change, if true.
    def set_key( msg, key, data, dont_tell_client=false )
      
      @data[key] = data
      
      # won't tell the client about the change, usually not needed
      unless dont_tell_client
        ## update the flags
        @sync  = false
        @is_valid = true
        
        add_to_sync( msg )
      end
    end
    
    # @private Tell the client that the value changed.
    def to_client( msg )
      if @is_new_to_client
        ## Initialize a new client value
        msg.reply_value( :new, @value_id, @data )
        @is_new_to_client = false
      else
        ## Sets the client value
        msg.reply_value( :set, @value_id, @data )
      end
    end
    
    # Destructor method. If msg is supplied, deletes the client representation too.
    # @param [false, Message] A {Message} instance. When supplied, deletes the client representation.
    def die!( msg=false )
      
      release_all
      
      # get the value storage from the session data
      session_values = msg.session[:values][:by_id]
      
      ## Store the object here
      session_values.delete( @value_id )
      
      if msg and not @is_new_to_client
        msg.reply_value( :del, @value_id )
      end
    end
    alias die die!

    def inspect
      "#<RSence::HValue value_id:#{@value_id.inspect}, valid: #{@is_valid.inspect}, sync: #{@sync.inspect}, is_new_to_client: #{@is_new_to_client.inspect}, meta: #{@meta.inspect[0..100]}, data: #{@data.inspect[0..100]} ...>"
    end
    
  end

end


