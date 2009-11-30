#--
##   Riassence Framework
 #   Copyright 2008 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##
 #++

class RiassenceCal < Plugin
  def init
    @cal_path = File.join( @path, 'db', 'rsence_cal.db' )
    create_db unless File.exist? @cal_path
  end
  def open
    @db = Sequel.sqlite @cal_path
    @gui = GUIParser.new( self, 'rsence_cal' )
  end
  def close
    @db.disconnect
  end
  def path; @path; end
  def get_ses( msg )
    msg.session[:rsence_cal] = {} unless msg.session.has_key?(:rsence_cal)
    return msg.session[:rsence_cal]
  end
  def init_ses( msg )
    ses = get_ses( msg )
    time_now = Time.now.to_i
    default_values = {
      :calendar_day  => time_now,
      :calendar_list => calendars_list,
      :calendar_id   => calendars_list.first[:value],
      :entries_tab   => 0,
      :entries_day_name => 'Saturday 31.10.',
      :entries_day   => [],
      :entries_day_edit => {
        'create'   => [],
        'delete'   => [],
        'modify'   => [],
        'response' => []
      },
      :entries_wday0_name => 'Mon 26.10.',
      :entries_wday0 => [],
      :entries_wday1_name => 'Tue 27.10.',
      :entries_wday1 => [],
      :entries_wday2_name => 'Wed 28.10.',
      :entries_wday2 => [],
      :entries_wday3_name => 'Thu 29.10.',
      :entries_wday3 => [],
      :entries_wday4_name => 'Fri 30.10.',
      :entries_wday4 => [],
      :entries_wday5_name => 'Sat 31.10.',
      :entries_wday5 => [],
      :entries_wday6_name => 'Sun 1.11.',
      :entries_wday6 => []
    }
    default_keep = [ :calendar_day, :calendar_id, :entries_tab ]
    default_values.each do |value_name, default_value|
      if not ses.has_key?( value_name )
        ses[value_name] = HValue.new( msg, default_value )
      elsif not default_keep.include?( value_name )
        ses[value_name].set( msg, default_value )
      end
    end
    update_entries_day_names( msg )
    update_entries( msg )
    values_bind = [
      [:calendar_day, 'change_calendar_day'],
      [:calendar_id,  'change_calendar_id' ],
      [:entries_day_edit, 'edit_entry' ]
    ]
    values_bind.each do |value_name,method_name|
      ses[value_name].bind( 'rsence_cal', method_name )
    end
  end
  alias restore_ses init_ses
  def init_ui( msg )
    include_js( msg, ['default_theme','controls','datetime','lists','json_renderer'] )
    ses = msg.session[:rsence_cal]
    params = {
      :values => @gui.values( ses )
    }
    @gui.init( msg, params )
  end
  
  def edit_entry( msg, hvalue )
    data = hvalue.data.clone
    ses = get_ses( msg )
    cal_id = ses[:calendar_id].data
    cal_day = ses[:calendar_day].data
    data['response'] = []
    data['create'].each do |item|
      time_begin = cal_day + (item['timeBegin']*60*60)
      time_end = cal_day + (item['timeEnd']*60*60)
      item_id = @db[:cal_entries].insert(
        :time_begin  => time_begin,
        :time_end    => time_end,
        :title       => item['label'],
        :calendar_id => cal_id
      )
      puts "item_id: #{item_id.inspect}"
      data['response'].push( {
        'id' => item['id'],
        'modify' => {
          'id' => item_id
        }
      } )
    end
    data['create'] = []
    data['modify'].each do |item|
      time_begin = cal_day + (item['timeBegin']*60*60)
      time_end = cal_day + (item['timeEnd']*60*60)
      @db[:cal_entries].filter(
        :id => item['id']
      ).update(
        :time_begin => time_begin,
        :time_end => time_end,
        :title => item['label']
      )
    end
    data['modify'] = []
    data['delete'].each do |item_id|
      @db[:cal_entries].filter(
        :id => item_id
      ).delete
    end
    data['delete'] = []
    hvalue.set( msg, data )
    return true
  end
  def change_calendar_day( msg, hvalue )
    update_entries_day_names( msg )
    update_entries( msg )
    return true
  end
  def change_calendar_id( msg, hvalue )
    update_entries( msg )
    return true
  end

private
  def create_db
    db = Sequel.sqlite(@cal_path)
    unless db.table_exists?(:calendars)
      db.create_table :calendars do
        primary_key :id
        String :title
      end
      calendars = db[:calendars]
      calendars.insert(:title => 'Default')
    end
    unless db.table_exists?(:cal_entries)
      db.create_table :cal_entries do
        primary_key :id
        String :title
        Number :time_begin
        Number :time_end
        Number :calendar_id
      end
    end
  end
  def calendars_list
    @db[:calendars].select(:id => :value, :title => :label).all
  end
  def calendars_selected
    @db[:calendars].select(:id).map {|row| row[:id]}
  end
  def entries_day(msg, time_within)
    time = Time.at(time_within.data).utc
    time_begin = Time.gm( time.year, time.month, time.mday ).to_i
    time_end   = time_begin + 86400
    ses = msg.session[:rsence_cal]
    @db[:cal_entries].filter({
      :calendar_id => ses[:calendar_id].data,
      :time_begin => time_begin..time_end
    }).all
  end
  def same_week_offset( time, target_wday )
    day_secs = 60*60*24
    wday_sel = Time.at(time).utc.wday - 1
    wday_sel = 6 if wday_sel == -1
    return (target_wday-wday_sel)*day_secs
  end
  def update_entries_day_names( msg )
    ses = get_ses( msg )
    time = Time.at( ses[:calendar_day].data ).utc
    names = {
      :long  => %w(Sunday Monday Tuesday Wednesday Thursday Friday Saturday),
      :short => %w(Sun Mon Tue Wed Thu Fri Sat)
    }
    [ [ :entries_day_name,   :long,  0 ],
      [ :entries_wday0_name, :short, same_week_offset( time, 0 ) ],
      [ :entries_wday1_name, :short, same_week_offset( time, 1 ) ],
      [ :entries_wday2_name, :short, same_week_offset( time, 2 ) ],
      [ :entries_wday3_name, :short, same_week_offset( time, 3 ) ],
      [ :entries_wday4_name, :short, same_week_offset( time, 4 ) ],
      [ :entries_wday5_name, :short, same_week_offset( time, 5 ) ],
      [ :entries_wday6_name, :short, same_week_offset( time, 6 ) ],
    ].each do |value_name, date_format, date_offset|
      thistime = time+date_offset
      day_name = "#{names[date_format][thistime.wday]} "+thistime.strftime( '%d.%m.' )
      ses[value_name].set( msg, day_name )
    end
  end
  def time_to_decimal_hour( time )
    t = Time.at( time ).utc
    time_begin_day = Time.gm( t.year, t.month, t.mday, 0, 0, 0 ).to_i
    secs = time - time_begin_day
    mins = secs / 60.0
    hour = ( (mins / 60.0) * 2 ).round * 0.5
    return hour
  end
  def select_day_entries( cal_id, time_begin )
    entries = []
    time_end = time_begin+86400
    @db[:cal_entries].filter(
      :calendar_id => cal_id,
      :time_begin  => time_begin...time_end
    ).each do |entry_row|
      row_begin = time_to_decimal_hour( entry_row[:time_begin].to_i )
      row_end = time_to_decimal_hour( entry_row[:time_end  ].to_i )
      if row_end < row_begin and row_end == 0
        row_end = 24
      end
      entries.push({
        'id' => entry_row[:id],
        'label' => entry_row[:title],
        'timeBegin' => row_begin,
        'timeEnd'   => row_end
      })
    end
    return entries
  end
  def update_entries( msg )
    ses = get_ses( msg )
    cal_id = ses[:calendar_id].data
    t = Time.at( ses[:calendar_day].data ).utc
    time = Time.gm( t.year, t.month, t.mday, 0, 0, 0 ).to_i
    [ [ :entries_day,   0 ],
      [ :entries_wday0, same_week_offset( time, 0 ) ],
      [ :entries_wday1, same_week_offset( time, 1 ) ],
      [ :entries_wday2, same_week_offset( time, 2 ) ],
      [ :entries_wday3, same_week_offset( time, 3 ) ],
      [ :entries_wday4, same_week_offset( time, 4 ) ],
      [ :entries_wday5, same_week_offset( time, 5 ) ],
      [ :entries_wday6, same_week_offset( time, 6 ) ]
    ].each do | value_name, date_offset |
      entries = select_day_entries( cal_id, time+date_offset )
      ses[value_name].set( msg, entries )
    end
    return true
  end
end
RiassenceCal.new.register('rsence_cal')
