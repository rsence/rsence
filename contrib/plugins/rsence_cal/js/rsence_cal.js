/**
  * Riassence Core -- http://rsence.org/
  *
  * Copyright (C) 2009 Juha-Jarmo Heinonen <jjh@riassence.com>
  *
  * This file is part of Riassence Core.
  *
  * Riassence Core is free software: you can redistribute it and/or modify
  * it under the terms of the GNU General Public License as published by
  * the Free Software Foundation, either version 3 of the License, or
  * (at your option) any later version.
  *
  * Riassence Core is distributed in the hope that it will be useful,
  * but WITHOUT ANY WARRANTY; without even the implied warranty of
  * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  * GNU General Public License for more details.
  *
  * You should have received a copy of the GNU General Public License
  * along with this program.  If not, see <http://www.gnu.org/licenses/>.
  *
  **/


RiassenceCal = HApplication.extend({
  constructor: function(values){
    this.values = values;
    this.base(100);
    this.drawSubviews();
  },
  CalendarList: HCheckboxList.extend({
    flexBottom: true,
    flexBottomOffset: 248
  }),
  Calendar: HCalendar.extend({
    flexTop: false, flexBottom: true,
    flexBottomOffset: 40
  }),
  drawSubviews: function(){
    this.win = HWindow.nu(
      HRect.nu(8,8,800,580),
      this, {
        label: 'Riassence Calendar',
        minSize: [500,500]
      }
    );
    this.todayButton = HButton.extend({
      click: function(){
        var date = new Date(),
            date_today = new Date(date.getFullYear(),date.getMonth(),date.getDate());
            secs_today = Math.round(date_today.getTime()/1000);
        secs_today -= (date_today.getTimezoneOffset()*60);
        this.setValue( secs_today );
      }
    }).nu(
      HRect.nu(8,8,80,32),
      this.win, {
        label: 'Today',
        valueObj: this.values.calendar_day,
        events: {
          click: true
        }
      }
    );
    this.calendarList = this.CalendarList.nu(
      HRect.nu(8,40,225,200),
      this.win, {
        valueObj: this.values.calendar_list,
        cal_ids: this.values.calendar_ids
      }
    );
    this.calendar = this.Calendar.nu(
      HRect.nu(8,0,228,200),
      this.win, {
        valueObj: this.values.calendar_day,
        events: {
          mouseWheel: true,
          click: true
        }
      }
    );
    this.entriesTabs = HTab.extend({
      flexRight: true, flexRightOffset: 20,
      flexBottom: true, flexBottomOffset: 41
    }).nu(
      HRect.nu(233,17,333,400),
      this.win
    );
    this.dayTab = this.entriesTabs.addTab( 'Day' );
    this.dayEntries = HTimeSheet.nu(
      HRect.nu(0,0,400,600),
      this.dayTab, {
        valueObj: this.values.entries_day
      }
    );
    this.weekTab = this.entriesTabs.addTab( 'Week' );
    this.monthTab = this.entriesTabs.addTab( 'Month' );
    this.values.entries_tab.bind(this.entriesTabs);
  }
});
