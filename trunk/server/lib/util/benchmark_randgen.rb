#!/usr/bin/env ruby

require 'randgen_rb/randgen'

def ms(start_time)
  return ((Time.now.to_f - start_time) * 100000 ).round/100.0
end

def dec(float,prec=3)
  (int,dec) = float.to_s.split('.')
  return "#{int}.#{dec[0..(prec-1)].ljust(prec).gsub(' ','0')}"
end

puts "| keylen | bufsize | time:ms |"#    gets |   makes |"
[20,40,120].each do |key_length|
  [10,100,1000,10000].each do |buffer_size|
    buffer_start = Time.now.to_f
    randgen = RandomGenerator.new(key_length,buffer_size)
    #puts  "=================================================="
    #stats = {1=>0,2=>0,4=>0,8=>0,16=>0,32=>0,64=>0,128=>0,256=>0}
    print ".............................\r"
    1000.times do |n|
      [1,2,4,8,16,32,64,128,256].each do |get_amount|
        #item_start = Time.now.to_f
        randgen.get(get_amount)
        #stats[get_amount]+=ms(item_start)
      end
      if n%40==0
        print ':' 
        STDOUT.flush
      end
    end
    print "\r|#{key_length.to_s.rjust(7)} |#{buffer_size.to_s.rjust(8)} |#{ms(buffer_start).to_s.rjust(8)} |\n"##{randgen.stats[:get].to_s.rjust(8)} |#{randgen.stats[:make].to_s.rjust(8)} |\n"
=begin
    puts "
 size | time_taken (ms)"
    [1,2,4,8,16,32,64,128,256].each do |stat_key|
      puts "#{stat_key.to_s.rjust(6)} : #{dec(stats[stat_key],2).to_s.rjust(9)}"
    end
=end
    #puts "randgen calls, get:#{randgen.stats[:get]} / make:#{randgen.stats[:make]}" 
    #puts
  end
end

