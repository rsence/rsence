# -* coding: UTF-8 -*-
###
  # Riassence Core -- http://rsence.org/
  # 
  # Influenced by rbot's plugins.rb by Tom Gilbert (BSD License)
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

# plugin.rb contains the Plugin skeleton class
require 'plugins/plugin'

# soapserve contains an extended hsoaplet for pluginmanager usage
begin
  require 'http/soap/soapserve'
  SKIP_SOAPSERVE = true
rescue RegexpError
  # happens with soap4r-1.5.8 on ruby-1.9.1:
  puts "soap4r failed; /SOAP will not work!"
  SKIP_SOAPSERVE = true
end

# soap_plugin includes a SOAPPlugin class, that includes plug-and-play SOAP access
require 'plugins/soap_plugin'

# servlet includes the ServletPlugin class, for handling any requests / responses
require 'plugins/servlet'

module Riassence
module Server

=begin
 PluginManager manages plugins and delegates messages to and between them to respond to messages.
=end
class PluginManager
  
  # hash of associated plugins
  @@plugins = {}
  
  # the current plugin path during scan
  @@curr_plugin_path = nil
  
  ### SOAPServe Instance
  ## Example usage, provides all public methods of HelloServant (a regular class)
  # hello_servant = HelloServant.new
  # @@soap_serve.add_servant( hello_servant, 'urn:HelloServant' )
  @@soap_serve = nil
  # list of method accessors of the private, but required methods in SOAPPlugin instances:
  @@soap_plugins = []
  
  # dirlist is an array of directories to scan for available plugins
  #
  # Creates a new plugin instance, scans for available plugins in +dirlist+
  def initialize
    @dirs = $config[:plugin_paths]
    
    scan()
    
  end
  
  ### Access to the @soap_serve instance of SOAPServe
  def PluginManager.soap_serve
    @@soap_serve
  end
  
  ### Routes requests and responses from transporter:
  def PluginManager.soap( request, response )
    @@soap_serve.process( request, response )
  end
  
  # Access to the list of plugins
  def PluginManager.plugins
    return @@plugins
  end
  
  # Application module access to its own path
  def PluginManager.curr_plugin_path
    return @@curr_plugin_path
  end
  
  ### destroys soapserve (to free all instances)
  def deinit_soapserve
    @@soap_serve = nil
    @@soap_plugins = []
  end
  
  ### initializes soapserve
  def init_soapserve
    return if SKIP_SOAPSERVE == true
    @@soap_serve = SOAP::SOAPServe.new
  end
  
  ### Adds soapserve instance
  def PluginManager.add_soap_plugin( plug_instance, urn, plugin_methods )
    @@soap_serve.add_servant( plug_instance, urn )
    @@soap_plugins.push( plugin_methods )
  end
  
  # Loads pluginlicotions from the list of plugin directories.
  def scan
    
    ## Reset soapserve
    deinit_soapserve
    init_soapserve
    
    # loop through all plugin-mainlevel directories
    @dirs.each do |plugin_dir|
      
      # makes sure the plugin dir is a dir
      # (there might be files like readme.txt or licence.txt)
      is_dir = FileTest.directory?( plugin_dir )
      next unless is_dir
      
      scan_plugin_dir( plugin_dir )
      
    end
    open
    @@curr_plugin_path = nil
  end
  
  def scan_plugin_dir( plugin_dir )
    # goes through all plugins in the
    # plugin dir in alphabetical order:
    Dir.new(plugin_dir).sort.each do |plugin_name|
      
      # skip, if the plugin starts with a dot, like '.svn', '.' and '..'
      dot_file = (plugin_name =~ /^\./)
      next if dot_file
      
      # sets the plugin path
      @@curr_plugin_path = File.join(plugin_dir,plugin_name)
      
      # checks that the plugin is a dir
      is_dir = File.directory?( @@curr_plugin_path )
      next unless is_dir
      
      # expects to find a 'plugin_dir/plugin_name/plugin_name.rb' file
      filename = File.join( @@curr_plugin_path, "#{plugin_name}.rb" )
      next unless File.exist?( filename )
      
      # if the plugin contains a 'disabled' flag-file, it skips to the next
      disabled_path = File.join( @@curr_plugin_path, 'disabled' )
      next if File.exist?( disabled_path )
      
      begin
        ## eval the plugin source
        plugin_eval( filename )
      rescue => e
        puts "=="*40 if $DEBUG_MODE
        puts "WARN: Plugin #{plugin_name} failed to initialize."
        if $DEBUG_MODE
          e_msg = e.message.gsub('(eval):',filename+':')
          b_trace = e.backtrace.join("\n  ")
          puts "#{'--'*40}\n#{e_msg}\n  #{b_trace}\n#{'=='*40}"
        end
      end
    end
  end
  
  ### Evaluates the plugin as a string in an anonymous module
  def plugin_eval( filename )
    # Create a new, anonymous module as the plugin namespace.
    module_ns = Module.new
    plugin_src = File.read( filename )
    module_ns.module_eval( plugin_src )
  end
  
  # Tells all plugins to open the files or databases they need.
  def open
    delegate_soap( :open )
    delegate_servlet( 'open' )
    delegate( 'open' )
  end
  
  # Tells all plugins that a request happened and gives the msg-parameter to them.
  def idle( msg )
    delegate( 'idle', msg )
  end
  
  # Tells all plugins to flush their data.
  def flush
    delegate_soap( :flush )
    delegate_servlet( 'flush' )
    delegate( 'flush' )
  end
  
  # Tells all plugins that they are about to be terminated.
  def close
    delegate_soap( :close )
    delegate_servlet( 'close' )
    delegate( 'close' )
  end
  
  # Restarts all running plugins
  def rescan
    flush
    close
    @@plugins = {}
    @@servlets = []
    scan
    open
  end
  
  # Called when everything is going down
  def shutdown
    flush
    close
  end
  
  def delegate_soap( method_name )
    @@soap_plugins.each do |method_hash|
      method_hash[ method_name ].call
    end
  end
  
  @@servlets = []
  def match_servlet_uri( uri, request_type=:get )
    match_score = {}
    @@servlets.each_with_index do | servlet, i |
      if servlet.match( uri, request_type )
        score = servlet.score
        match_score[ score ] = [] unless match_score.has_key? score
        match_score[ score ].push( servlet )
      end
    end
    match_scores = match_score.keys.sort
    if match_scores.empty?
      return false
    else
      match_servlets = match_score[ match_scores[0] ]
      return match_servlets[ rand( match_servlets.size ) ]
    end
  end
  
  def match_servlet( request_type, request, response, session )
    match_plugin = match_servlet_uri( request.fullpath, request_type )
    if match_plugin
      if request_type == :get
        match_plugin.get( request, response, session )
      elsif request_type == :post
        match_plugin.post( request, response, session )
      else
        return false
      end
      return true
    else
      return false
    end
  end
  
  def delegate_servlet( method_name, *args )
    @@servlets.each do |servlet|
      if servlet.respond_to? method_name
        servlet.method( method_name ).call( *args )
      end
    end
  end
  
  def PluginManager.add_servlet( servlet )
    idx = @@servlets.size
    @@servlets.push( servlet )
    return idx
  end
  
  ### Check if each plugin handles +method+, and if so, call it, passing +args+ as a parameter
  def delegate(method, *args)
    @@plugins.keys.sort.each do |plugin_name|
      plugin = @@plugins[plugin_name]
      puts "delegating method #{method.inspect} to plugin #{plugin.names.inspect}" if ARGV.include?('--trace-delegate')
      if plugin.respond_to?(method)
        plugin.send( method, *args )
      end
    end
  end
  
  ### Runs a plugin's (named +plugin_name+) method (named +method_name+) with the supplied +args+
  def run_plugin( plugin_name, method_name, *args )
    
    ## 
    if @@plugins.has_key?( plugin_name )
      if @@plugins[plugin_name].respond_to?( method_name )
        return @@plugins[plugin_name].method( method_name ).call(*args)
      end
    end
  end
  
end

end
end
