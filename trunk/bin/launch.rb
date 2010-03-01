#!/usr/bin/env ruby
#--
##   Riassence Framework
 #   Copyright 2008 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##
 #++

if RUBY_VERSION.to_f >= 1.9
  Encoding.default_external = Encoding::ASCII_8BIT
end

if ARGV.include?('--help') or ARGV.include?('-h') or
   ARGV.include?('help') or not (
    ARGV.include?('start') or ARGV.include?('stop') or 
    ARGV.include?('restart') or ARGV.include?('status') or
    ARGV.include?('save')
  )
  puts %{

  Riassence Framework is RIA client and server. This help message contains
  hints about how to control the server startup/shutdown.

  Usage:
    #{__FILE__} command [params]

  Command is one of:
    status     Tells if Riassence Framework Server is running or not
    start      Starts Riassence Framework Server
    stop       Stops Riassence Framework Server
    restart    Restarts Riassence Framework Server
    save       Saves Riassence Framework Server session data
    help       This message
  
  Params:
    -d                      Debug/Development mode
    --trace-js              Write content of msg.reply calls to stdout
    --trace-delegate        Traces plugin method delegation to stdout
    --root-path <PATH>      Define the PATH to rsence server
                              Defaults to 'bin'
    --port PORT             Define the http PORT to use, defaults to '8001'
    --latency MS            Simulate network latency, value in milliseconds
    --addr <ADDRESS>        Define the IPv4 ADDRESS to bind to.
                              Defaults to '0.0.0.0' (any)
    --server <SERVER>       Choose http SERVER, valid choices:
                               - webrick
                               - mongrel
                               - ebb
                               - thin
                               Defaults to thin
    --reset-sessions        Deletes all old sessions on startup
    --config <PATH>         Optional config override file
    --run-config-wizard     Runs configuration wizard
                              Runs by default, if no local
                              configuration files were found.
    --no-rescan             Doesn't rescan the plugins even when in debug mode.
    --profile               Turns on profiling
                              - Runs everything considerable slower!
                              - Shown a table displaying the results on stop.
    --help                  This message
    -h                      This message
  
  Examples:
    #{__FILE__} status
    #{__FILE__} start
    #{__FILE__} stop
    #{__FILE__} save
    #{__FILE__} restart
    #{__FILE__} restart -d --reset-sessions
    #{__FILE__} restart --latency 150
    #{__FILE__} restart --server mongrel --port 8080 --addr 127.0.0.1
  
  Further information:
     http://riassence.org/

}
  exit
end

require 'profile' if ARGV.include?('--profile')

## Auto-construct paths using this file as the waypoint
SERVER_PATH = ARGV.include?('--root-path')?(ARGV[ARGV.index('--root-path')+1]):File.split(File.expand_path(File.dirname(__FILE__)))[0]

## Include server & lib in the search path
$LOAD_PATH << SERVER_PATH
$LOAD_PATH << File.join( SERVER_PATH, 'lib' )

## Riassence Daemon controls
require 'daemon/daemon'
Riassence::Server::HTTPDaemon.daemonize

