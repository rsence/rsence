
require 'json'

class KamppaInfo < Plugin
  def init
    @db = MySQLAbstractor.new({:user=>'root',:pass=>'',:host=>'localhost'},'kampat')
  end
  def init_ui(msg,do_refresh=false)
    include_js( msg, ['basic','tabs','window'] ) unless do_refresh
    msg.reply require_js_once( msg, 'kamppa_info' ) unless do_refresh
    ses = msg.session[:kamppa]
    rows = @db.q("select k.*, u.urli as url from kamppa_info as k, urli_data as u where k.url_id = u.id order by #{ses[:prev_sort]} #{ses[:asc_desc]}")
    begin
      json_rows = rows.to_json
    rescue JSON::GeneratorError
      rows2 = []
      rows.each do |row|
        hash2 = {}
        row.each_key do |row_key|
          row_val = row[row_key]
          begin
            hash2[row_key] = row_val.to_json
          rescue JSON::GeneratorError
            puts "row_col #{row_key}: #{row_val.inspect}"
          end
        end
      end
    end
    if do_refresh
      msg.reply( "kamppaUI.refresh(#{json_rows});" )
    else
      msg.reply( "kamppaUI = new KamppaUI(#{json_rows},'#{ses[:sorting].val_id}','#{ses[:delete].val_id}','#{ses[:love].val_id}');")
    end
    row_ids = []
    rows.each{|row|row_ids.push(row['id'])}
    ses[:prev_arr] = row_ids
    msg.session[:kamppa][:updated] = most_recent_up
  end
  def most_recent_up
    @db.q("select updated from kamppa_info order by updated desc limit 1")[0]['updated'].to_i
  end
  def init_ses(msg)
    msg.session[:kamppa] = {
      :sorting => HValue.new(msg,''),
      :delete  => HValue.new(msg,0),
      :love    => HValue.new(msg,0),
      :prev_sort => 'k.updated',
      :asc_desc  => 'desc',
      :prev_arr  => [],
      :updated   => most_recent_up
    }
    msg.session[:kamppa][:sorting].bind('kamppa','reorder')
    msg.session[:kamppa][:delete ].bind('kamppa','del_row')
    msg.session[:kamppa][:love   ].bind('kamppa','love_row')
  end
  def del_row(msg,row_id_val)
    ses = msg.session[:kamppa]
    row_id = row_id_val.data.to_i
    puts "delete row: #{row_id_val.data.inspect}?"
    if row_id != 0
      puts "deleting #{row_id}"
      #@db.q("delete from kamppa_info where id = #{row_id}")
      refresh_ui(msg,true)
    end
    row_id_val.set(msg,0)
    puts "del valid? #{row_id_val.valid.inspect}"
    return true
  end
  def love_row(msg,row_id_val)
    ses = msg.session[:kamppa]
    row_id = row_id_val.data.to_i
    puts "love row: #{row_id_val.data.inspect}?"
    if row_id != 0
      curr_val = @db.q("select love from kamppa_info where id = #{row_id}")[0]['love'].to_i
      onoff = ( (curr_val.to_i == 0) ? 1 : 0 )
      puts "updating #{row_id}: #{onoff}"
      @db.q("update kamppa_info set love = #{onoff} where id = #{row_id}")
    end
    row_id_val.set(msg,0)
    puts "love valid? #{row_id_val.valid.inspect}"
    return true
  end
  def refresh_ui(msg,db_up=false)
    ses = msg.session[:kamppa]
    if db_up
      rows = @db.q("select k.id as id from kamppa_info as k order by #{ses[:prev_sort]} #{ses[:asc_desc]}")
      row_ids = []
      rows.each{|row|row_ids.push(row['id'])}
      ses[:prev_arr] = row_ids
    else
      row_ids = ses[:prev_arr]
    end
    msg.reply("try{kamppaUI.view.reorder(#{row_ids.to_json});}catch(e){}")
  end
  def reorder(msg,new_order)
    ses = msg.session[:kamppa]
    new_data = new_order.data
    if [ 'k.updated','k.vuokra','k.kaupunginosa',
         'k.pinta_ala','k.esittelyajat','k.vapautumis_pvm'
      ].include?( new_data )
      if ses[:prev_sort] == new_data
        (ses[:asc_desc] == 'asc') ? 'desc' : 'asc'
        ses[:prev_arr].reverse!
        refresh_ui( msg, false )
      else
        ses[:prev_sort] = new_data
        refresh_ui( msg, true )
      end
    end
    new_order.set(msg,'---')
    return true
  end
  def restore_ses(msg)
    init_ses(msg) unless msg.session.has_key?(:kamppa)
  end
  def idle(msg)
    return unless msg.session.has_key?(:main)
    init_ui(msg) if msg.session[:main][:boot]==3
    if msg.session[:main][:boot] > 3
      most_recent = most_recent_up
      if msg.session[:kamppa][:updated] < most_recent
        init_ui(msg,true)
        msg.session[:kamppa][:updated] = most_recent
      end
    end
  end
end
kamppainfo = KamppaInfo.new
kamppainfo.register('kamppa')
