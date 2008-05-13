###
  # HIMLE RIA Server
  # Copyright (C) 2008 HIMLE GROUP http://himle.sorsacode.com/
  #  
  #  This program is free software; you can redistribute it and/or modify it under the terms
  #  of the GNU General Public License as published by the Free Software Foundation;
  #  either version 2 of the License, or (at your option) any later version. 
  #  This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
  #  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
  #  See the GNU General Public License for more details. 
  #  You should have received a copy of the GNU General Public License along with this program;
  #  if not, write to the Free Software Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
  ###

require 'md5'

## HRandgen generates a buffer of random strings and keeps that buffer
## Its give method always return a new unique number
class RandomGenerator
  
  attr_reader :stats
  
  ## Initialize with:
  ##  - target_len: the target length of the string
  ##  - buffer_min: the minimum amount of strings in the buffer
  def initialize( target_len, buffer_min, verbose=false )
    @verbose     = verbose
    if verbose
      @stats = {:make=>0,:get=>0}
    end
    @counter     = rand(9223372036854775808)
    @buffer_min  = buffer_min
    @target_len  = target_len
    @buffer      = []
    make( @buffer_min )
  end
  
  ## Generate one new string
  def generate
    @counter += rand(32768)
    @counter = rand(9223372036854775808) if @counter > 9223372036854775808
    outp = [ MD5.digest(@counter.to_s) ]
    (@target_len/20.0).ceil.times do |n|
      outp.push( MD5.digest((@counter+rand(32768)).to_s) )
    end
    return [outp.join].pack('m*').strip[0..(20+@target_len)]
  end
  
  ## Adds amount: number of keys to the buffer
  def make( amount = 1 )
    @stats[:make]+=1 if @verbose
    amount.times do |n|
      @buffer.push( generate )
    end
  end
  
  ## Returns amount number of random strings packed in an array
  def get( amount = 1 )
    @stats[:get]+=1 if @verbose
    make( @buffer_min + amount ) if @buffer.size < amount
    outp = []
    amount.times {
     outp.push( @buffer.shift )
    }
    return outp
  end
  alias give get
  
  ## Returns just one random string as string
  def get_one
    return get(1)[0] # the first item in an array of one items
  end
  alias give_one get_one
  
end

