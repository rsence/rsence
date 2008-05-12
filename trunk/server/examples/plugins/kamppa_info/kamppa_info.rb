
require 'json'

class KamppaInfo < Plugin
  def init
    @db = MySQLAbstractor.new({:user=>'root',:pass=>'',:host=>'localhost'},'kampat')
  end
  def init_ui(msg)
    include_js( msg, ['basic','tabs','window'] )
    msg.reply require_js_once( msg, 'kamppa_info' )
    ses = msg.session[:kamppa]
    rows = @db.q("select k.*, u.urli as url from kamppa_info as k, urli_data as u where k.url_id = u.id order by #{ses[:prev_sort]} #{ses[:asc_desc]}")
    msg.reply( "kamppaUI = new KamppaUI(#{JSON(rows)},'#{ses[:sorting].val_id}');")
    row_ids = []
    rows.each do |row|
      row_ids.push(row['id'])
    end
    ses[:prev_arr] = row_ids
  end
  def init_ses(msg)
    msg.session[:kamppa] = {
      :sorting => HValue.new(msg,''),
      :prev_sort => 'k.vuokra',
      :asc_desc => 'asc',
      :prev_arr => []
    }
    msg.session[:kamppa][:sorting].bind('kamppa','reorder')
  end
  def reorder(msg,new_order)
    ses = msg.session[:kamppa]
    new_data = new_order.data
    puts "prev: #{ses[:prev_sort].inspect} vs #{new_data.inspect}"
    if ['k.vuokra','k.kaupunginosa','k.pinta_ala','k.esittelyajat','k.vapautumis_pvm'].include?( new_data )
      if ses[:prev_sort] == new_data
        if ses[:asc_desc] == 'asc'
          puts "asc -> desc"
          ses[:asc_desc] = 'desc'
        else ses[:asc_desc] == 'desc'
          puts "desc -> asc"
          ses[:asc_desc] = 'asc'
        end
        ses[:prev_arr].reverse!
        row_ids = ses[:prev_arr]
      else
        puts "new sel (#{ses[:asc_desc].inspect})"
        ses[:prev_sort] = new_data
        rows = @db.q("select k.id as id from kamppa_info as k order by #{ses[:prev_sort]} #{ses[:asc_desc]}")
        row_ids = []
        rows.each do |row|
          row_ids.push(row['id'])
        end
        ses[:prev_arr] = row_ids
      end
      puts row_ids.inspect
      msg.reply("kamppaUI.view.reorder(#{row_ids.to_json});")
    end
    new_order.set(msg,'')
    return true
  end
  def restore_ses(msg)
    init_ses(msg) unless msg.session.has_key?(:kamppa)
  end
  def idle(msg)
    return unless msg.session.has_key?(:main)
    if msg.session[:main][:boot]==3
      init_ui(msg)
    end
  end
end
kamppainfo = KamppaInfo.new
kamppainfo.register('kamppa')
