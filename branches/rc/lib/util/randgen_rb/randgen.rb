# -* coding: UTF-8 -*-
###
  # Riassence Core -- http://rsence.org/
  #
  # Copyright (C) 2008 Juha-Jarmo Heinonen <jjh@riassence.com>
  #
  # This file is part of Riassence Core.
  #
  # Riassence Core is free software: you can redistribute it and/or modify
  # it under the terms of the GNU General Public License as published by
  # the Free Software Foundation, either version 3 of the License, or
  # (at your option) any later version.
  #
  # Riassence Core is distributed in the hope that it will be useful,
  # but WITHOUT ANY WARRANTY; without even the implied warranty of
  # MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  # GNU General Public License for more details.
  #
  # You should have received a copy of the GNU General Public License
  # along with this program.  If not, see <http://www.gnu.org/licenses/>.
  #
  ###

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
    @chars_in = '01234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_'.split('')
    @chars_len = @chars_in.size
    @chars = randomize_chars
    @buffer_min  = buffer_min
    @target_len  = target_len
    @buffer      = []
    make( @buffer_min )
  end
  
  def randomize_chars
    chars = ''
    chars_in = @chars_in.clone
    chars_in.size.times do |n|
      chars += chars_in.delete_at( rand(chars_in.length) )
    end
    return chars
  end
  
  ## Generate one new string
  def generate
    outp = ''
    @target_len.times do |n|
      outp += @chars[rand(@chars_len)].chr
    end
    return outp
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

