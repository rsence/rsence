###
  # HIMLE RIA Server
  # Copyright (C) 2008 HIMLE GROUP http://himle.sorsacode.com/
  # Copyright (C) 2006-2007 Helmi Technologies Inc.
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

require 'digest/sha1'

## HRandgen generates a buffer of random strings and keeps that buffer
## Its give method always return a new unique number
class HRandgen
  
  ## Initialize with:
  ##  - target_len: the target length of the string
  ##  - buffer_min: the minimum amount of strings in the buffer
  def initialize( target_len, buffer_min )
    @counter     = 0
    @chars       = '01234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_'
    @charcount   = @chars.size
    @buffer_min  = buffer_min
    @target_len  = target_len
    @buffer      = []
  end
  
  ## Generate one new string
  def generate
    outp = []
    @target_len.times do |n|
      randnum = rand( @charcount )
      outp.push( @chars[ randnum ].chr )
    end
    return outp.join
  end
  
  ## Adds amount: number of keys to the buffer
  def make( amount = 1 )
    
    until amount == 0
      
      ## increment the counter by at least one
      rand_add  = rand(9) + 1
      @counter += rand_add
      
      ## flip the counter, when the number grows big enough
      if @counter > 999999999999
        @counter = rand_add
      end
      
      ## uses the counter to prefix the random string to make sure that the 
      prefix    = ''
      Digest::SHA1.digest(@counter.to_s).each_byte do |digest_byte|
        prefix += @chars[digest_byte%64].chr
      end
      generated = prefix + generate
      unless @buffer.include?( generated )
        @buffer.push( generated )
        amount -= 1
      end
    end
  end
  
  ## Returns amount number of random strings packed in an array
  def give( amount = 1 )
    make( @buffer_min + amount ) if @buffer.size < amount
    outp = []
    amount.times {
     outp.push( @buffer.shift )
    }
    return outp
  end
  
  ## Returns just one random string as string
  def give_one
    return give()[0]
  end
  
end

=begin
rand16 = Randgen.new(16)
rand16.make(1000)
10.times {puts rand16.give.inspect}
=end
