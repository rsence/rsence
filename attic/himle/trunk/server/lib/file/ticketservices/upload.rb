=begin

Handles uploads by using tickets and other filters.

Upload success states:
 0: Idle, default, ready to upload
 1: Upload started
 2: Upload completed
 3: Upload processed
 4: Client requests new key

Upload failure states:
 -1: Invalid request (missing query keys)
 -2: Invalid or missing key
 -3: Invalid mime-type (invalid data format)
 -4: File too big
 -5: Key request forbidden (when calling upload_key)
 -6: Post-processing failed


Default upload table:

create table himle_uploads (
  id int primary key auto_increment,
  ses_id int not null,
  upload_date int not null,
  upload_done tinyint not null default 0,
  file_size int not null default 0,
  file_mime varchar(255) not null default 'text/plain',
  file_data mediumblob
)
=end

module Himle
module Server
module TicketService
module Upload
  
  def upload(request,response)
    
    ticket_id = request.unparsed_uri.split('/U/')[1]
    value_id  = request.query['value_id']
    
    if not @upload_slots[:by_id].has_key?(ticket_id)
      done_value = '-2:::Invalid or missing key'
    else
      ## Get data stored in the upload slot
      (mime_allow,max_size,ses_id,value_key,allow_multi) = @upload_slots[:by_id][ticket_id]
      if not allow_multi
        @upload_slots[:by_id].delete( ticket_id )
      end
      ## The upload form field
      file_data = request.query['file_data']
      file_mimetype = file_data[:type]
      file_filename = file_data[:filename]
      ## Get the size from the temporary file
      file_size = file_data[:tempfile].stat.size
      ## Check for errors
      if not mime_allow.match(file_mimetype)
        done_value = "-3:::#{ticket_id}"
      elsif not file_size < max_size
        done_value = "-4:::#{ticket_id}"
      else
        #puts "ok"
        done_value = "2:::#{ticket_id}"
        ## Insert basic data about the upload and get its key
        upload_id = @db.q(%{
          insert into himle_uploads
            (ses_id,ticket_id,upload_date,upload_done,file_name,file_size,file_mime,file_data)
          values
            (#{ses_id},#{ticket_id.inspect},#{Time.now.to_i},0,#{hexlify(file_filename)},#{file_size},#{file_mimetype.inspect},'')
        })
        if not @upload_slots[:uploaded].has_key?(ticket_id)
          @upload_slots[:uploaded][ticket_id] = []
        end
        @upload_slots[:uploaded][ticket_id].push( upload_id )
        #puts "upload id:#{upload_id.inspect}"
        ## Start a loop to read the tempfile as chunks of the upload into the
        ## database (4k chunks, so mysql won't choke with its default settings)
        file_readcount = 0
        while file_readcount < file_size
          file_chunk = file_data[:tempfile].read(4096)
          file_chunksize = file_chunk.size
          file_readcount += file_chunksize
          #puts "#{file_readcount} < #{file_size}"
          @db.q("update himle_uploads set file_data = concat(file_data,#{hexlify(file_chunk)}) where id = #{upload_id}")
        end
        @db.q("update himle_uploads set upload_done = 1 where id = #{upload_id}")
        #puts "insert done"
      end
      #puts "upload almost done"
    end
    
    response_body = %{
      <html>
        <head>
          <script type="text/javascript">
            with(parent){
              HVM.values[#{value_id.to_json}].set(#{done_value.to_json});
            }
          </script>
        </head>
        <body></body>
      </html>
    }
    
    response.status = 200
    response['content-type'] = 'text/html; charset=UTF-8'
    response['Content-Length'] = response_body.size.to_s
    response.body = response_body
  end
  
  def get_uploads( ticket_id, with_data=false )
    uploads = []
    if @upload_slots[:uploaded].has_key?(ticket_id)
      @upload_slots[:uploaded][ticket_id].each do |row_id|
        if with_data
          row_datas = @db.q("select upload_date,upload_done,file_name,file_size,file_mime,file_data from himle_uploads where id = #{row_id}")
          if row_datas.size == 1
            row_data = row_datas.first
            row_hash = {
              :date => Time.at(row_data['upload_date']),
              :done => (row_data['upload_done']==1),
              :size => row_data['file_size'],
              :mime => row_data['file_mime'],
              :name => row_data['file_name'],
              :data => row_data['file_data']
            }
            uploads.push(row_hash)
          end
        else
          row_datas = @db.q("select upload_date,upload_done,file_name,file_size,file_mime from himle_uploads where id = #{row_id}")
          if row_datas.size == 1
            row_data = row_datas.first
            row_hash = {
              :date => Time.at(row_data['upload_date']),
              :done => (row_data['upload_done']==1),
              :size => row_data['file_size'],
              :mime => row_data['file_mime'],
              :name => row_data['file_name'],
              :data => nil
            }
            uploads.push(row_hash)
          end
        end
      end
    end
    return uploads
  end
  
  def del_upload( ticket_id, row_id )
    @upload_slots[:uploaded][ticket_id].delete(row_id)
    @db.q("delete from himle_uploads where id = #{row_id}")
  end
  
  # removes uploaded files
  def del_uploads( ticket_id, ses_id=false )
    if ses_id and @upload_slots[:ses_ids].has_key?( ses_id )
      if @upload_slots[:ses_ids][ses_id].include?( ticket_id )
        @upload_slots[:ses_ids][ses_id].delete( ticket_id )
      end
    end
    if @upload_slots[:uploaded].has_key?( ticket_id )
      @upload_slots[:uploaded][ticket_id].each do |row_id|
        @upload_slots[:uploaded][ticket_id].delete( row_id )
        @db.q("delete from himle_uploads where id = #{row_id}")
      end
      @upload_slots[:uploaded].delete( ticket_id )
    end
    if @upload_slots[:by_id].has_key?( ticket_id )
      @upload_slots[:by_id].delete( ticket_id )
    end
    @db.q("delete from himle_uploads where ticket_id = #{hexlify(ticket_id)}")
    @db.q("delete from himle_uploads where ses_id = #{ses_id}")
  end
  
  def upload_key(msg,value_key,max_size=1000000,mime_allow=/(.*?)\/(.*?)/,allow_multi=true)
    key = @randgen.get_one()
    while @upload_slots[:by_id].has_key?(key)
      key = @randgen.get_one()
    end 
    @upload_slots[:by_id][key] = [mime_allow,max_size,msg.ses_id,value_key,allow_multi]
    @upload_slots[:uploaded][key]  = []
    @upload_slots[:ses_ids][msg.ses_id] = [] unless @upload_slots[:ses_ids].has_key?(msg.ses_id)
    @upload_slots[:ses_ids][msg.ses_id].push( key )
    return "0:::#{key}"
  end
end
end
end
end
















