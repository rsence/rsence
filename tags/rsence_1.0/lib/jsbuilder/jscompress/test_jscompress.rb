#!/usr/bin/env ruby

require 'jscompress'

$_RESERVED_NAMES= [ '_ID', '_WIDTH', '_HEIGHT', '_x', '_0', '__', '_test_' ]

t = JSCompress.new($_RESERVED_NAMES)

infile = "basic.js"
outfile = "basic_compressed.js"
fh = open("allinone.js")
c = fh.read
t.build_indexes(c)
contents = t.compress(c)
fh.close

fh = open("allinone_compressed.js", "wb")
fh.write(contents)
fh.close

fh = open("basic.js")
c = fh.read
contents = t.compress(c)
fh.close

fh = open("basic_compressed.js", "wb")
fh.write(contents)
fh.close

t.free_indexes
fh = open("basic.js")
c = fh.read
t.build_indexes(c)
contents = t.compress(c)
fh.close

fh = open("basic_compressed2.js", "wb")
fh.write(contents)
fh.close
t.free_indexes
