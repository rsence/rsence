#!/bin/sh
rdoc --op doc/rdoc -U -w 2 -x ".js .css .html" -S --threads=4 -N -F -I gif -c utf-8 -m "lib/conf/argv.rb" -t "RSence" -i bin lib
