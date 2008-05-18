#!/usr/bin/env ruby

###
  # Himle Server -- http://himle.org/
  #
  # Copyright (C) 2008 Juha-Jarmo Heinonen
  #
  # This file is part of Himle Server.
  #
  # Himle Server is free software: you can redistribute it and/or modify
  # it under the terms of the GNU General Public License as published by
  # the Free Software Foundation, either version 3 of the License, or
  # (at your option) any later version.
  #
  # Himle server is distributed in the hope that it will be useful,
  # but WITHOUT ANY WARRANTY; without even the implied warranty of
  # MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  # GNU General Public License for more details.
  #
  # You should have received a copy of the GNU General Public License
  # along with this program.  If not, see <http://www.gnu.org/licenses/>.
  #
  ###

if ARGV.include?('--help') or ARGV.include?('-h') or ARGV.include?('help')
  puts "Usage: #{__FILE__} command [params]"
  puts
  puts "command is one of:"
  puts " start      Starts the server daemon"
  puts " stop       Stops the server daemon"
  puts " restart    Restarts the server daemon"
  puts
  puts "Params:"
  puts " --trace-js               Write content of msg.reply calls to stdout."
  puts " --root-path /path        Define the path to himle server, defaults to 'bin'"
  puts " --client-path /path      Define the path to himle client, defaults to '../client'"
  puts " --port 80                Define the http port to use, defaults to '8001'"
  puts " --addr 127.0.0.1         Define the IPv4 address to bind to, defaults to '0.0.0.0' (all)"
  puts " --server ebb             Choose http server, valid choices:"
  puts "                            webrick, mongrel, ebb or thin.  Defaults to 'mongrel'"
  puts " --reset-sessions         Deletes all old sessions on startup, useful for development and maintenance"
  puts " --config /path/conf.rb   Optional config override file."
  puts " --profile                Turns on profiling (Will slow down performance A LOT)"
  puts " --help                   This Text"
  puts
  exit
end

require 'profile' if ARGV.include?('--profile')

## Auto-construct paths using this file as the waypoint
SERVER_PATH = ARGV.include?('--root-path')?(ARGV[ARGV.index('--root-path')+1]):File.split(File.expand_path(File.dirname(__FILE__)))[0]

## Include server & lib in the search path
$LOAD_PATH << SERVER_PATH
$LOAD_PATH << File.join( SERVER_PATH, 'lib' )

## HimleDaemon controls 
require 'daemon/daemon'


