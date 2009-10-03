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
  def calendars
    @db[:calendars].all
  end
  def calendar_ids
    @db[:calendars].select(:id).map {|row| row[:id]}
  end
  def entries_day(msg, time_within)
    time = Time.at(time_within.data).utc
    time_begin = Time.gm( time.year, time.month, time.mday ).to_i
    time_end   = time_begin + 86400
    ses = msg.session[:rsence_cal]
    @db[:cal_entries].filter({
      :calendar_id => ses[:calendar_ids].data,
      :time_begin => time_begin..time_end
    }).all
  end
  def init_ses(msg)
    time_now = Time.now.to_i
    msg.session[:rsence_cal] = {
      :calendar_day  => HValue.new(msg,time_now),
      :calendar_list => HValue.new(msg,calendars),
      :calendar_ids  => HValue.new(msg,calendar_ids),
      :entries_tab   => HValue.new(msg,0),
      :entries_day   => HValue.new(msg,[])
    }
    ses = msg.session[:rsence_cal]
    ses[:entries_day].set( msg, entries_day(msg, ses[:calendar_day]) )
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
