#--
##   Riassence Framework
 #   Copyright 2008 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##
 #++


module TicketService
module ObjBlob
  
  # Serves a blob object. Will expire by default. Returns ID as URI.
  def serve_blobobj( msg, blob_obj, no_expire=false )
    # gets a new, unique identifier
    ticket_id = @randgen.gen
    if no_expire
      @raw_uris[ticket_id] = blob_obj
    else
      @blob_objs[:ses_ids][msg.ses_id] = [] unless @imgs[:ses_ids].has_key?(msg.ses_id)
      @blob_objs[:ses_ids][msg.ses_id].push( ticket_id )
      @blob_objs[:by_id][ticket_id] = [msg.ses_id,blob_obj]
    end
    uri = File.join($config[:broker_urls][:b],ticket_id)
    return uri
  end
  
  # Deletes blob object by ID. 
  def del_blobobj( ticket_id, ses_id=false )
    if @raw_uris.has_key?( ticket_id )
      @raw_uris.delete( rsrc_id )
    else
      if ses_id and @blob_objs[:ses_ids].has_key?( ses_id )
        @blob_objs[:ses_ids][ses_id].delete( ticket_id ) if @blob_objs[:ses_ids][ses_id].include?( ticket_id )
      end
      @blob_objs[:by_id].delete( ticket_id ) if @blob_objs[:by_id].has_key?( ticket_id )
    end
  end
  
  # Increases expiration time by keep_alive in seconds.
  def push_keepalive_blobobj( ticket_id, keep_alive )
    expiry_time = Time.now.to_i+keep_alive
    @expire_blobobj[expiry_time] = [] unless @expire_blobobj.has_key?(expiry_time)
    @expire_blobobj[expiry_time].push( ticket_id )
  end
  
  # Removes all expired blob objects.
  def expire_keepalive_blobobjs
    curr_time = Time.now.to_i
    @expire_blobobj.keys.sort.each do |exp_time|
      if exp_time < curr_time
        @expire_blobobj[exp_time].size.times do |incr|
          ticket_id = @expire_blobobj[exp_time].shift
          if @blob_objs[:by_id].has_key?(ticket_id)
            ses_id = @blob_objs[:by_id][ticket_id][3]
            del_blobobj( ticket_id, ses_id )
          end
        end
        @expire_blobobj.delete(exp_time) if @expire_blobobj[exp_time].size == 0
      end
    end
  end
end
end
