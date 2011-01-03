##   RSence
 #   Copyright 2008 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##



require 'sequel'

# Inner workings of Ticket
module TicketService
  
  
=begin

# Here is an example how to implement "simple" upload value management.
#
# Define the component in yaml like this:
#
# - class: HUploader
#   rect: [ 10, 10, 200, 24 ]
#   bind: :values.upload
#   options:
#     label: Upload
#     events:
#       click: true
#
#       
# Expects a value named :upload, it is defined like this in values.yaml:
#
# :upload:
#   :responders:
#     - :method: upload
#
#
class UploadPlugin < GUIPlugin
  def init_ses_values( msg )
    super
    upload_id( msg )
  end
  def restore_ses_values( msg )
    super
    upload_id( msg )
  end  
  def upload_id( msg )
    upload_ticket = ticket.upload_key( msg, get_ses( msg, :upload ).value_id )
    get_ses( msg, :upload ).set( msg, upload_ticket )
  end
  def upload( msg, value )
    if value.data.start_with?('2:::') # upload is completed
      ticket_id = value.data.split(':::')[1]
      ticket_data = ticket.get_uploads( ticket_id, true )
      ticket_data.each do |ticket_item|
        file_write( bundle_path( ticket_item[:name], 'uploaded' ), ticket_item[:data] )
      end
      ticket.del_uploads( msg, ticket_id )
      value.set( msg, '3:::' + ticket_id ) # upload is processed
    elsif value.data.start_with?('4:::')   # client wants a new id
      upload_id( msg )
    end
    return true
  end
end
=end

module Upload
  
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

create table rsence_uploads (
  id int primary key auto_increment,
  ses_id int not null,
  upload_date int not null,
  upload_done tinyint not null default 0,
  file_size int not null default 0,
  file_mime varchar(255) not null default 'text/plain',
  file_data mediumblob
)
=end
  def upload(request,response)
    
    ticket_id = request.unparsed_uri.match(/^#{::RSence.config[:broker_urls][:u]+'/'}(.*)$/)[1]
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
        done_value = "2:::#{ticket_id}"
        ## Insert basic data about the upload and get its key
        insert_hash = {
          :ses_id      => ses_id,
          :ticket_id   => ticket_id,
          :upload_date => Time.now.to_i,
          :upload_done => false,
          :file_name   => file_filename,
          :file_size   => file_size,
          :file_mime   => file_mimetype,
          :file_data   => ''
        }
        if @db
          upload_id = @db[:rsence_uploads].insert( insert_hash )
        else
          @upload_id += 1
          upload_id = @upload_id
          @upload_slots[:rsence_uploads] = {} unless @upload_slots.has_key?(:rsence_uploads)
          @upload_slots[:rsence_uploads][upload_id] = insert_hash
        end
        if not @upload_slots[:uploaded].has_key?(ticket_id)
          @upload_slots[:uploaded][ticket_id] = []
        end
        @upload_slots[:uploaded][ticket_id].push( upload_id )
        
        update_hash = {
          :file_data   => file_data[:tempfile].read.to_sequel_blob,
          :upload_done => true
        }
        if @db
          @db[:rsence_uploads].filter(:id => upload_id).update( update_hash )
        else
          @upload_slots[:rsence_uploads][upload_id].merge!( update_hash )
        end
      end
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
    response['Content-Type'] = 'text/html; charset=UTF-8'
    response['Content-Length'] = response_body.bytesize.to_s
    response.body = response_body
  end
  
  def get_uploads( ticket_id, with_data=false )
    uploads = []
    if @upload_slots[:uploaded].has_key?(ticket_id)
      @upload_slots[:uploaded][ticket_id].each do |row_id|
        if with_data
          if @db
            row_datas = @db[:rsence_uploads].select(
              :upload_date, :upload_done, :file_name,
              :file_size, :file_mime, :file_data
            ).filter(
              :id => row_id
            )
          else
            row_datas = @upload_slots[:rsence_uploads][row_id]
          end
          if row_datas.count == 1
            row_data = row_datas.first
            row_hash = {
              :date => Time.at(row_data[:upload_date]),
              :done => row_data[:upload_done],
              :size => row_data[:file_size],
              :mime => row_data[:file_mime],
              :name => row_data[:file_name],
              :data => row_data[:file_data]
            }
            uploads.push(row_hash)
          end
        else
          if @db
            row_datas = @db[:rsence_uploads].select(
              :upload_date, :upload_done, :file_name,
              :file_size, :file_mime
            ).filter(
              :id => row_id
            )
          else
            row_datas = @upload_slots[:rsence_uploads][row_id]
          end
          if row_datas.count == 1
            row_data = row_datas.first
            row_hash = {
              :date => Time.at(row_data[:upload_date]),
              :done => row_data[:upload_done],
              :size => row_data[:file_size],
              :mime => row_data[:file_mime],
              :name => row_data[:file_name],
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
    if @db
      @db[:rsence_uploads].filter( :id => row_id ).delete
    else
      @upload_slots[:rsence_uploads].delete(row_id)
    end
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
        if @db
          @db[:rsence_uploads].filter( :id => row_id ).delete
        else
          @upload_slots[:rsence_uploads].delete(row_id)
        end
      end
      @upload_slots[:uploaded].delete( ticket_id )
    end
    if @upload_slots[:by_id].has_key?( ticket_id )
      @upload_slots[:by_id].delete( ticket_id )
    end
    if @db
      @db[:rsence_uploads].filter( :ticket_id => ticket_id ).delete
      @db[:rsence_uploads].filter( :ses_id => ses_id ).delete
    end
  end
  
  def upload_key(msg,value_key,max_size=1000000,mime_allow=/(.*?)\/(.*?)/,allow_multi=true)
    key = @randgen.gen
    while @upload_slots[:by_id].has_key?(key)
      key = @randgen.gen
    end 
    @upload_slots[:by_id][key] = [mime_allow,max_size,msg.ses_id,value_key,allow_multi]
    @upload_slots[:uploaded][key]  = []
    @upload_slots[:ses_ids][msg.ses_id] = [] unless @upload_slots[:ses_ids].has_key?(msg.ses_id)
    @upload_slots[:ses_ids][msg.ses_id].push( key )
    return "0:::#{key}"
  end
end
end
