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

if ARGV.include?('--help') or ARGV.include?('-h') or
   ARGV.include?('help') or not (
    ARGV.include?('start') or ARGV.include?('stop') or 
    ARGV.include?('restart') or ARGV.include?('status') or
    ARGV.include?('save')
  )
  puts %{
Usage: #{__FILE__} command [params]

command is one of:"
 status     Tells if Riassence Framework Server is running or not
 start      Starts Riassence Framework Server
 stop       Stops Riassence Framework Server
 restart    Restarts Riassence Framework Server
 save       Saves Riassence Framework Server session data
 help       This message

Params:
 --trace-js               Write content of msg.reply calls to stdout.
 --root-path /path        Define the path to rsence server, defaults to 'bin'
 --client-path /path      Define the path to rsence client, defaults to '../client'
 --port 80                Define the http port to use, defaults to '8001'
 --latency 200            Simulate network latency, value in milliseconds
 --addr 127.0.0.1         Define the IPv4 address to bind to, defaults to '0.0.0.0' (all)
 --server ebb             Choose http server, valid choices:
                            webrick, mongrel, ebb or thin.  Defaults to 'thin'
 --reset-sessions         Deletes all old sessions on startup, useful for development and maintenance
 --config /path/conf.rb   Optional config override file.
 --profile                Turns on profiling (Will slow down performance A LOT)
 --help                   This Text
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

