#!/bin/sh
rdoc --op doc/rdoc -U -w 2 -x ".js .css .html" -S --threads=4 -N -F -I gif -c utf-8 -m "bin/launch.rb" -t "Riassence Framework Server" -i bin lib
