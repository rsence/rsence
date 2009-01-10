#!/usr/bin/env ruby

require 'jscompress'

t = JSCompress.new

infile = "basic.js"
outfile = "basic_compressed.js"
fh = open(infile)
contents = t.compress(fh.read)
fh.close

fh = open(outfile, "wb")
fh.write(contents)
fh.close
