#!/usr/bin/env ruby

require 'html_min'

t = HTMLMin.new

f = 'button.css'
fh = open(f)
contents = t.minimize(fh.read)
fh.close

fh = open(f + ".min", "wb")
fh.write(contents)
fh.close

f = 'button.html'
fh = open(f)
contents = t.minimize(fh.read)
fh.close

fh = open(f + ".min", "wb")
fh.write(contents)
fh.close

