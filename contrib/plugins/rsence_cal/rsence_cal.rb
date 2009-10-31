# -* coding: UTF-8 -*-
###
  # Riassence Core -- http://rsence.org/
  #
  # Copyright (C) 2009 Juha-Jarmo Heinonen <jjh@riassence.com>
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

class RiassenceCal < Plugin
  require 'sequel'
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
  def init
    @cal_path = File.join( @path, 'db', 'rsence_cal.db' )
    unless File.exist?( @cal_path )
      create_db
    end
  end
  def open
    @db = Sequel.sqlite(@cal_path)
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
  def get_ses( msg )
    msg.session[:rsence_cal] = {} unless msg.session.has_key?(:rsence_cal)
    return msg.session[:rsence_cal]
  end
  def same_week_offset( time, target_wday )
    day_secs = 60*60*24
    wday_sel = Time.at(time).wday - 1
    wday_sel = 6 if wday_sel == -1
    return (target_wday-wday_sel)*day_secs
  end
  def update_entries_day_names( msg )
    ses = get_ses( msg )
    time = Time.at( ses[:calendar_day].data )
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
  def change_calendar_day( msg, hvalue )
    update_entries_day_names( msg )
    update_entries( msg )
    return true
  end
  def change_calendar_id( msg, hvalue )
    update_entries( msg )
    return true
  end
  def time_to_decimal_hour( time )
    t = Time.at( time )
    time_begin_day = Time.mktime( t.year, t.month, t.mday, 0, 0, 0 ).to_i
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
      :time_begin  => time_begin..time_end,
      :time_end    => time_begin..time_end
    ).each do |entry_row|
      entries.push({
        :id => entry_row[:id],
        :label => entry_row[:title],
        :value => [
          time_to_decimal_hour( entry_row[:time_begin].to_i ),
          time_to_decimal_hour( entry_row[:time_end  ].to_i )
        ]
      })
    end
    return entries
  end
  def update_entries( msg )
    ses = get_ses( msg )
    cal_id = ses[:calendar_id].data
    t = Time.at( ses[:calendar_day].data )
    time = Time.mktime( t.year, t.month, t.mday, 0, 0, 0 ).to_i
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
      pp entries if value_name == :entries_day
      ses[value_name].set( msg, entries )
    end
    return true
  end
  require 'pp'
  def init_ses(msg)
    ses = get_ses( msg )
    time_now = Time.now.to_i
    default_values = {
      :calendar_day  => time_now,
      :calendar_list => calendars_list,
      :calendar_id   => calendars_list.first[:value],
      :entries_tab   => 0,
      :entries_day_name => 'Saturday 31.10.',
      :entries_day   => [],
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
      puts "#{value_name.inspect} => #{default_value.inspect}"
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
      [:calendar_id,  'change_calendar_id' ]
    ]
    values_bind.each do |value_name,method_name|
      ses[value_name].bind( 'rsence_cal', method_name )
    end
  end
  alias restore_ses init_ses
  def init_ui(msg)
    include_js( msg, ['default_theme','controls','datetime','lists'] )
    msg.reply require_js('rsence_cal')
    ses = msg.session[:rsence_cal]
    msg.reply "rsence_cal = RiassenceCal.nu(#{extract_hvalues_from_hash(ses)});"
  end
end
RiassenceCal.new.register('rsence_cal')
