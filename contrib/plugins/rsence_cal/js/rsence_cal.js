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

TimeSheetItemEditor = HClass.extend({
  drawSubviews: function(){
    itemEditor = HTimeSheetItemEditor.nu();
  }
});
RiassenceCal = HApplication.extend({
  constructor: function(values){
    this.values = values;
    this.base(100);
    this.drawSubviews();
  },
  drawSubviews: function(){
    this.view = HView.nu([0,0,700,500,0,0],this);
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
      this.view, {
        label: 'Today',
        valueObj: this.values.calendar_day,
        events: {
          click: true
        }
      }
    );
    this.calendarList = HRadiobuttonList.nu(
      [8,40,217,200,null,248],
      this.view, {
        valueObj: this.values.calendar_id
      }
    );
    this.calendarList.setStyle('background-color','#eee');
    this.calendarListItems = HListItems.nu( null, this.calendarList, {
      valueObj: this.values.calendar_list
    });
    this.calendar = HCalendar.nu(
      [8,null,220,200,null,40],
      this.view, {
        valueObj: this.values.calendar_day,
        events: {
          mouseWheel: true,
          click: true
        }
      }
    );
    this.calendar.setStyle('background-color','#eee');
    this.entriesTabs = HTab.nu(
      [233,17,100,100,8,41],
      this.view, {
        valueObj: this.values.entries_tab
      }
    );
    this.dayTab = this.entriesTabs.addTab( 'Day' );
    this.dayEntriesLabel = HStringView.nu(
      HRect.nu(36,4,678,20),
      this.dayTab, {
        valueObj: this.values.entries_day_name
      }
    );
    this.dayEntriesLabel.setStyle('font-weight','bold');
    this.dayEntries = HTimeSheet.nu(
      HRect.nu(0,24,678,528),
      this.dayTab, {
        valueObj: this.values.entries_day,
        events: {
          draggable: true
        }
      }
    );
    this.weekTab = this.entriesTabs.addTab( 'Week' );
    this.wday0Label = HStringView.nu(
      HRect.nu(36,4,126,20),
      this.weekTab, {
        valueObj: this.values.entries_wday0_name
      }
    );
    this.wday0Label.setStyle('font-weight','bold');
    this.wday0Entries = HTimeSheet.nu(
      [0,24,126,504],
      this.weekTab, {
        valueObj: this.values.entries_wday0,
        events: {
          draggable: true
        }
      }
    );
    var _wdayLabelRect = HRect.nu(128,4,128+90,20);
    var _wdayRect = HRect.nu(128,24,128+90,528);
    var _wdayOffsetX = 92;
    this.wday1Label = HStringView.nu(
      HRect.nu(_wdayLabelRect),
      this.weekTab, {
        valueObj: this.values.entries_wday1_name
      }
    );
    this.wday1Label.setStyle('font-weight','bold');
    this.wday1Entries = HTimeSheet.nu(
      HRect.nu(_wdayRect),
      this.weekTab, {
        valueObj: this.values.entries_wday1,
        hideLabel: true,
        events: {
          draggable: true
        }
      }
    );
    _wdayRect.offsetBy( _wdayOffsetX, 0 );
    _wdayLabelRect.offsetBy( _wdayOffsetX, 0 );
    this.wday2Label = HStringView.nu(
      HRect.nu(_wdayLabelRect),
      this.weekTab, {
        valueObj: this.values.entries_wday2_name
      }
    );
    this.wday2Label.setStyle('font-weight','bold');
    this.wday2Entries = HTimeSheet.nu(
      HRect.nu(_wdayRect),
      this.weekTab, {
        valueObj: this.values.entries_wday2,
        hideLabel: true,
        events: {
          draggable: true
        }
      }
    );
    _wdayRect.offsetBy( _wdayOffsetX, 0 );
    _wdayLabelRect.offsetBy( _wdayOffsetX, 0 );
    this.wday3Label = HStringView.nu(
      HRect.nu(_wdayLabelRect),
      this.weekTab, {
        valueObj: this.values.entries_wday3_name
      }
    );
    this.wday3Label.setStyle('font-weight','bold');
    this.wday3Entries = HTimeSheet.nu(
      HRect.nu(_wdayRect),
      this.weekTab, {
        valueObj: this.values.entries_wday3,
        hideLabel: true,
        events: {
          draggable: true
        }
      }
    );
    _wdayRect.offsetBy( _wdayOffsetX, 0 );
    _wdayLabelRect.offsetBy( _wdayOffsetX, 0 );
    this.wday4Label = HStringView.nu(
      HRect.nu(_wdayLabelRect),
      this.weekTab, {
        valueObj: this.values.entries_wday4_name
      }
    );
    this.wday4Label.setStyle('font-weight','bold');
    this.wday4Entries = HTimeSheet.nu(
      HRect.nu(_wdayRect),
      this.weekTab, {
        valueObj: this.values.entries_wday4,
        hideLabel: true,
        events: {
          draggable: true
        }
      }
    );
    _wdayRect.offsetBy( _wdayOffsetX, 0 );
    _wdayLabelRect.offsetBy( _wdayOffsetX, 0 );
    this.wday5Label = HStringView.nu(
      HRect.nu(_wdayLabelRect),
      this.weekTab, {
        valueObj: this.values.entries_wday5_name
      }
    );
    this.wday5Label.setStyle('font-weight','bold');
    this.wday5Entries = HTimeSheet.nu(
      HRect.nu(_wdayRect),
      this.weekTab, {
        valueObj: this.values.entries_wday5,
        hideLabel: true,
        events: {
          draggable: true
        }
      }
    );
    _wdayRect.offsetBy( _wdayOffsetX, 0 );
    _wdayLabelRect.offsetBy( _wdayOffsetX, 0 );
    this.wday6Label = HStringView.nu(
      HRect.nu(_wdayLabelRect),
      this.weekTab, {
        valueObj: this.values.entries_wday6_name
      }
    );
    this.wday6Label.setStyle('font-weight','bold');
    this.wday6Entries = HTimeSheet.nu(
      HRect.nu(_wdayRect),
      this.weekTab, {
        valueObj: this.values.entries_wday6,
        hideLabel: true,
        events: {
          draggable: true
        }
      }
    );
  }
});
