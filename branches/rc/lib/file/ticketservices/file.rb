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

module Riassence
module Server
module TicketService
module TicketFile
  
  # removes other disposable data and references
  def del_file( file_id, ses_id=false )
    if ses_id and @files[:ses_ids].has_key?( ses_id )
      @files[:ses_ids][ses_id].delete( file_id ) if @files[:ses_ids][ses_id].include?( file_id )
    end
    @files[:by_id].delete( file_id ) if @files[:by_id].has_key?( file_id )
  end
  
  # extends expiration time of disposable data, essentially for keep-alive requests
  def push_keepalive_file( file_id, keep_alive )
    expiry_time = Time.now.to_i+keep_alive
    @expire_files[expiry_time] = [] unless @expire_files.has_key?(expiry_time)
    @expire_files[expiry_time].push( file_id )
  end
  
  # removes all expired files
  def expire_keepalive_files
    curr_time = Time.now.to_i
    @expire_files.keys.sort.each do |exp_time|
      if exp_time < curr_time
        @expire_files[exp_time].size.times do |incr|
          file_id = @expire_files[exp_time].shift
          if @files[:by_id].has_key?(file_id)
            ses_id = @files[:by_id][file_id][3]
            del_file( file_id, ses_id )
          end
        end
        @expire_files.delete(exp_time) if @expire_files[exp_time].size == 0
      end
    end
  end
  
  # serves files
  def serve_file( msg, content='', content_type='text/plain', filename='' )
    return serve( msg, content, [content_type, filename], :file)
  end
  
end
end
end
end


