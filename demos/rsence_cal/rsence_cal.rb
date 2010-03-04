#--
##   Riassence Framework
 #   Copyright 2009 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##
 #++


# = Riassence Calendar
# This plugin demonstrates a plugin that handles fairly complex data and
# a GUI based entirely on YAML data (converted to JSON by GUIParser).
#
# The Riassence Calendar application itself is a test case for some more
# complex data handling. It's a calendaring application with support for
# multiple calendars and daily time sheets. It's inspired by iCal.
#
# It will later incorporate fancy stuff like a CalDAV servlet, OpenID
# authentication and multi-user collaborative calendaring.
#
# NOTE: This plugin requires RIassence Framework
# trunk revision 875 or newer.
#
# NOTE: This is still a work in progress.
#
class RiassenceCal < GUIPlugin
  
  # Uses an sqlite database for storing the calendars.
  # The PluginSqliteDB module handles the database
  # initialization automatically.
  include PluginSqliteDB
  
  # In addition to the new (as of r875) features in Plugin,
  # just updates a few dynamic values, all the rest is defined in
  # the "values.yaml" file and initialized by the Plugin base class.
  def init_ses( msg )
    super
    update_entries_day_names( msg )
    update_entries( msg )
  end
  alias restore_ses init_ses
  
  # Responder for entry editing from the client.
  # A fairly complicated example, it will be described in detail later.
  def edit_entry( msg, hvalue )
    data = hvalue.data.clone
    ses = get_ses( msg )
    cal_id = ses[:calendar_id].data
    t = Time.at( ses[:calendar_day].data )
    cal_day = Time.gm( t.year, t.month, t.mday, 0, 0, 0 ).to_i
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
    update_entries( msg )
    return true
  end
  
  # Responder for calendar date changes.
  # Sends an updated list of entries to the client
  # and updates the names of the day.
  def change_calendar_day( msg, hvalue )
    update_entries_day_names( msg )
    update_entries( msg )
    return true
  end
  
  # Responder for calendar changes.
  # Sends an updated list of entries to the client.
  def change_calendar_id( msg, hvalue )
    update_entries( msg )
    return true
  end
  
  # Creates two tables:
  # calendars::      Stores a list of calendars
  # cal_entries::    Stores a list of entries related to 
  #                  the calendar they belong to.
  # Called by PluginSqliteDB when creating the database.
  def create_db_tables
    @db.create_table :calendars do
      primary_key :id
      String :title
    end
    calendars = @db[:calendars]
    calendars.insert(:title => 'Default')
    @db.create_table :cal_entries do
      primary_key :id
      String :title
      Number :time_begin
      Number :time_end
      Number :calendar_id
    end
  end
  
private
  
  # Returns the current time as UTC seconds since epoch
  def time_now
    return Time.now.to_i
  end
  
  # Selects and returns a list of calendars
  def calendars_list
    @db[:calendars].select(:id => :value, :title => :label).all
  end
  
  # Returns the first calendar id
  def calendars_list_first_id
    @db[:calendars].select(:id).first[:id]
  end
  
  # Returns a list of calendar ids
  def calendars_selected
    @db[:calendars].select(:id).map {|row| row[:id]}
  end
  
  # Selects all the entries within the same day as +time_within+
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
  
  # Returns the offset of time (in seconds) compared to +time+.
  # +target_wday+ is the day number within the same week as +time+
  def same_week_offset( time, target_wday )
    day_secs = 60*60*24
    wday_sel = Time.at(time).utc.wday - 1
    wday_sel = 6 if wday_sel == -1
    return (target_wday-wday_sel)*day_secs
  end
  
  # Update localized long or short week days for the weekday fields.
  # The localization itself needs more work.
  def update_entries_day_names( msg )
    ses = get_ses( msg )
    t = Time.at( ses[:calendar_day].data )
    time = Time.gm( t.year, t.month, t.mday, 0, 0, 0 ).utc
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
  
  # Returns the hours of the day of the +time+ given.
  # The hour is in decimal format, so 6.5 means "06:30"
  def time_to_decimal_hour( time )
    t = Time.at( time ).utc
    time_begin_day = Time.gm( t.year, t.month, t.mday, 0, 0, 0 ).to_i
    secs = time - time_begin_day
    mins = secs / 60.0
    hour = ( (mins / 60.0) * 2 ).round * 0.5
    return hour
  end
  
  # Selects all the entries of the calendar +cal_id+ within the full day of the time +time_begin+.
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
  
  # Updates all timesheet entries at once.
  def update_entries( msg )
    ses = get_ses( msg )
    cal_id = ses[:calendar_id].data
    t = Time.at( ses[:calendar_day].data )
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

# Initialize and register the plugin:
RiassenceCal.new.register('rsence_cal')
