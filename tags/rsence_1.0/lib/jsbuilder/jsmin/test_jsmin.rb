#!/usr/bin/env ruby

require 'jsmin'

t = JSMin.new
infile = "basic.js"
outfile = "basic_.js"

fh = open(infile)
contents = t.convert(fh.read)
fh.close

fh = open(outfile, "wb")
fh.write(contents)
fh.close

infile = "allinone.js"
outfile = "allinone_.js"
fh = open(infile)
contents = t.convert(fh.read)
fh.close

fh = open(outfile, "wb")
fh.write(contents)
fh.close
