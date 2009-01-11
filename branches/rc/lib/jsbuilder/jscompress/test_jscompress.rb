#!/usr/bin/env ruby

require 'jscompress'

$_RESERVED_NAMES= [ '_ID', '_WIDTH', '_HEIGHT', '_x', '_0', '__', '_test_' ]

t = JSCompress.new($_RESERVED_NAMES)

infile = "basic.js"
outfile = "basic_compressed.js"
fh = open(infile)
contents = t.compress(fh.read)
fh.close

fh = open(outfile, "wb")
fh.write(contents)
fh.close
