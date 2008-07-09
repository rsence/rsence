module Himle
module Server
module TicketService
module Img
  
  # removes image data and references
  def del_img( img_id, ses_id=false )
    if ses_id and @imgs[:ses_ids].has_key?( ses_id )
      @imgs[:ses_ids][ses_id].delete( img_id ) if @imgs[:ses_ids][ses_id].include?( img_id )
    end
    @imgs[:by_id].delete( img_id ) if @imgs[:by_id].has_key?( img_id )
  end
  
  # extends expiration time of disposable files, essentially for keep-alive requests
  def push_keepalive( img_id, keep_alive )
    expiry_time = Time.now.to_i+keep_alive
    @expires[expiry_time] = [] unless @expires.has_key?(expiry_time)
    @expires[expiry_time].push( img_id )
  end
  
  # removes all expired images
  def expire_keepalives
    curr_time = Time.now.to_i
    @expires.keys.sort.each do |exp_time|
      if exp_time < curr_time
        @expires[exp_time].size.times do |incr|
          img_id = @expires[exp_time].shift
          if @imgs[:by_id].has_key?(img_id)
            ses_id = @imgs[:by_id][img_id][3]
            del_img( img_id, ses_id )
          end
        end
        @expires.delete(exp_time) if @expires[exp_time].size == 0
      end
    end
  end
  
end
end
end
end