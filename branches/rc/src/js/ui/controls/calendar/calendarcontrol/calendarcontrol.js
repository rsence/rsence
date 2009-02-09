/***  Riassence Core
  ** 
  **  Copyright (C) 2008 Riassence Inc http://rsence.org/
  **  Copyright (C) 2006-2007 Helmi Technologies Inc.
  ** 
  **  This program is free software; you can redistribute it and/or modify it under the terms
  **  of the GNU General Public License as published by the Free Software Foundation;
  **  either version 2 of the License, or (at your option) any later version. 
  **  This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
  **  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
  **  See the GNU General Public License for more details. 
  **  You should have received a copy of the GNU General Public License along with this program;
  **  if not, write to the Free Software Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
  ***/

HCalendarControl = HControl.extend({
  
  packageName:   "calendar",
  componentName: "calendarcontrol",

  constructor: function(_rect, _parentClass, _options) {
    if(this.isinherited) {
      this.base(_rect, _parentClass, _options);
    }
    else {
      this.isinherited = true;
      this.base(_rect, _parentClass, _options);
      this.isinherited = false;
    }
    
    this.type = '[HCalendarControl]';
    
    // When this is true, the component is always drawn with the theme that was
    // active at the creation of the component, not the current theme.
    this.preserveTheme = true;
    
    // Show 2 years back and 5 years to the future in the year selector by
    // default.
    var _thisYear = new Date().getFullYear();
    var _defaultYears = [];
    for (var i = _thisYear - 2; i < _thisYear + 6; i++) {
      _defaultYears.push(i);
    }
    this._calendarDefaults = {
      hSpace: 26,
      vSpace: 20,
      selectToday: true,
      switchMonths: true,
      dayList: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      startDay: 0,
      monthList: ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"],
      yearList: _defaultYears,
      barHeight: 25
    };
    
    this._initialized = false;
    
    if(!this.isinherited) {
      this.draw();
    }
  },
  
  
  // Key events redirected from calendar buttons
  keyDown: function(_keycode) {
    if ( _keycode == Event.KEY_LEFT) {
      this.previousDay();
    }
    else if (_keycode == Event.KEY_RIGHT) {
      this.nextDay();
    }
    else if (_keycode == Event.KEY_UP) {
      this.previousWeek();
    }
    else if (_keycode == Event.KEY_DOWN) {
      this.nextWeek();
    }
    else if (_keycode == Event.KEY_PAGEUP) {
      this.previousMonth();
    }
    else if (_keycode == Event.KEY_PAGEDOWN) {
      this.nextMonth();
    }


  },
  
  // Helpers for moving around in the calendar
  previousDay: function() {
    var _day = this.day - 1;
    if (_day < 1) {
      this.previousMonth();
      _day = new Date(this.year, this.month, 1).getMonthLength();
    }
    this.setDate(this.year, this.month, _day);
  },
  
  nextDay: function() {
    var _day = this.day + 1;
    if (_day > new Date(this.year, this.month, 1).getMonthLength()) {
      this.nextMonth();
      _day = 1;
    }
    this.setDate(this.year, this.month, _day);
  },
  
  previousWeek: function() {
    var _day = this.day - 7;
    if (_day < 1) {
      this.previousMonth();
      _day = new Date(this.year, this.month, 1).getMonthLength() +
        (this.day - 7);
    }
    this.setDate(this.year, this.month, _day);
  },
  
  nextWeek: function() {
    var _day = this.day + 7;
    var _monthLen = new Date(this.year, this.month, 1).getMonthLength();
    if (_day > _monthLen) {
      this.nextMonth();
      _day = _day - _monthLen;
    }
    this.setDate(this.year, this.month, _day);
  },
  
  previousMonth: function() {
    var _month = this.month - 1;
    var _year = this.year;
    if (_month < 0) {
      _year--;
      _month = this._calendarDefaults.monthList.length - 1;
    }
    this.setDate(_year, _month, this.day);
  },
  
  nextMonth: function() {
    var _month = this.month + 1;
    var _year = this.year;
    if (_month > this._calendarDefaults.monthList.length - 1) {
      _year++;
      _month = 0;
    }
    this.setDate(_year, _month, this.day);
  },
  
  
  draw: function() {
    if(!this._initialized) {
      this.rect.width = this._calendarDefaults.hSpace * 8;
      this.rect.right = this.rect.left + this.rect.width;
      this.rect.height = this._calendarDefaults.barHeight +
        this._calendarDefaults.vSpace * 7;
      this.rect.bottom = this.rect.top + this.rect.height;
    }
    
    this.base();
    
    if(!this._initialized) {
      this.drawMarkup();
      
      var _left, _top, _right, _bottom;
      
      this._useDate();
      this.monthControl = new HComboBox(new HRect(4,3,86,23), this, {
        enabled: this.enabled
      });
      for (var i = 0; i < this._calendarDefaults.monthList.length; i++) {
        this.monthControl.addItem(this._calendarDefaults.monthList[i]);
      }
      
      this.monthControl.selectedIndexChanged = this._selectedIndexChanged;
      this.yearControl = new HComboBox(new HRect(89,3,146,23), this, {
        enabled: this.enabled
      });
      for (var i = 0; i < this._calendarDefaults.yearList.length; i++) {
        this.yearControl.addItem(this._calendarDefaults.yearList[i]);
      }
      
      this.yearControl.selectedIndexChanged = this._selectedIndexChanged2;
      
      this.closeButton = new HButton(
        new HRect(150, 7, 164, 21),
        this,
        {label: '', enabled: this.enabled}
      );
      
      this.closeButton.setMouseUp(true);
      this.closeButton.mouseUp = this._close;
      var i, j, _item;
      var k = 0;
      i = 0;
      
      
      // Create weekday names for the header row.
      for (j = 0; j < 7 - this._calendarDefaults.startDay; j++) { // rows
        
        _left = this._calendarDefaults.hSpace * (j + 1);
        _top = this._calendarDefaults.barHeight +
          this._calendarDefaults.vSpace * (i);
        _right = _left + this._calendarDefaults.hSpace;
        _bottom = _top + this._calendarDefaults.vSpace;
        
        _item = new HCalendarHeaderButton(
          new HRect(_left, _top, _right, _bottom),
          this, {
            label: this._calendarDefaults.dayList[
              j + this._calendarDefaults.startDay
            ],
            enabled: this.enabled
          }
        );  
        
      }
      
      
      // If monday is the first day of the week, create header for sunday here.
      if (this._calendarDefaults.startDay == 1) {
        
        _left = this._calendarDefaults.hSpace * (j + 1);
        _top = this._calendarDefaults.barHeight +
          this._calendarDefaults.vSpace * (i);
        _right = _left + this._calendarDefaults.hSpace;
        _bottom = _top + this._calendarDefaults.vSpace;
        
        _item = new HCalendarHeaderButton(
          new HRect(_left, _top, _right, _bottom),
          this, {
            label: this._calendarDefaults.dayList[0],
            enabled: this.enabled
          }
        );  
        
      }
      
      
      // Create the left-top corner square for the header.
      _left = 0;
      _top = this._calendarDefaults.barHeight +
        this._calendarDefaults.vSpace * (i);
      _right = _left + this._calendarDefaults.hSpace;
      _bottom = _top + this._calendarDefaults.vSpace;
      
      _item = new HCalendarHeaderButton(
        new HRect(_left, _top, _right, _bottom),
        this, {
          label: '',
          enabled: this.enabled
        }
      );  
      
      
      
      // Create week numbers in the leftmost column.
      this.spot2 = [];
      for (i = 0; i < 6; i++) {
        
        _left = 0;
        _top = this._calendarDefaults.barHeight +
          this._calendarDefaults.vSpace * (i + 1);
        _right = _left + this._calendarDefaults.hSpace;
        _bottom = _top + this._calendarDefaults.vSpace;
        
        _item = new HCalendarHeaderButton(
          new HRect( _left, _top, _right, _bottom),
          this, {
            label: this.spotstr2[i],
            enabled: this.enabled
          }
        );
        
        this.spot2[i] = _item;
      }
      
      
      // Create the day numbers for the calendar grid.
      this.spot = [];
      for (i = 0; i < 6; i++) { // rows
        for (j = 0; j < 7; j++) { // columns
          
          _left = this._calendarDefaults.hSpace * (j + 1);
          _top = this._calendarDefaults.barHeight +
            this._calendarDefaults.vSpace * (i + 1);
          _right = _left + this._calendarDefaults.hSpace;
          _bottom = _top + this._calendarDefaults.vSpace;
          
          _item = new HCalendarButton(
            new HRect(_left, _top, _right, _bottom),
            this, {
              label: this.spotstr[k].day,
              enabled: this.enabled
            }
          );
          _item.index = k;
          _item.setValue(this.spotstr[k].shade);

          this.spot[k] = _item;
          k++;
        }
      }
      
      this._updateMonth();
      this._updateYear();
      
      this._initialized = true;
    }
  },
  
  _close: function(_x, _y) {
    this.parent.hide();
    this.base(_x, _y);
  },
  
  _selectedIndexChanged: function() {
    if (this.parent.updating2) {
      return;
    }
    this.parent.setDate(this.parent.year, this.selectedIndex(),
      this.parent.day);
  },
  
  _selectedIndexChanged2: function() {
    if (this.parent.updating) {
      return;
    }
    this.parent.setDate(this.selectedItem().label, this.parent.month,
      this.parent.day);
  },
  
  _updateYear: function() {
    this.updating = true;
    for (var i = 0; i < this._calendarDefaults.yearList.length; i++) {
      if (this._calendarDefaults.yearList[i] == this.year) {
        this.yearControl.selectItemAtIndex(i);
        break;
      }
    }
    this.updating = false;
  },
  
  _updateMonth: function() {
    this.updating2 = true;
    this.monthControl.selectItemAtIndex(this.month);
    this.updating2 = false;
  },
  
  _updateWeek: function() {
    for (var i = 0; i < 6; i++) {
      this.spot2[i].setLabel(this.spotstr2[i]);
    }
  },
  
  _updateDate: function() {
    for (var i = 0; i < 42; i++) {
      this.spot[i].setLabel(this.spotstr[i].day);
      this.spot[i].setValue(this.spotstr[i].shade);
    }
  },
  
  _calendarGetString: function(day, which) {
    if (which == 0) {
      return {shade:2, day:day};
    }
    if (which == 1) {
      return {shade:0, day:day};
    }
    if (which == 2) {
      return {shade:1, day:day};
    }
  },
  
  setDate: function(_year, _month, _day, _fromSetValue) {
    if (_year == this.year && _month == this.month &&  _day == this.day) {
      return;
    }
    if (!_fromSetValue) {
      this.setValue(new Date(_year, _month, _day));
    }
    this._useDate(_year, _month, _day);
    this._updateDate();
    this._updateWeek();
    this._updateMonth();
    this._updateYear();
  },
  
  setValue: function(_dateValue) {
    this.base(_dateValue);
    if(this.valueObj instanceof HDateValue && !this._updatingSetValue) {
      this.setDate(_dateValue.getFullYear(), _dateValue.getMonth(),
        _dateValue.getDate(),true);
    }
  },
  
  selectDay: function(i) {
    if (i == this.todayspot) {
      return;
    }
    if (i < this.firstspot && this._calendarDefaults.switchMonths) {
      this.setDate(this.year, this.month - 1, this.spotday[i]);
    } else if (i >= this.lastspot && this._calendarDefaults.switchMonths) {
      this.setDate(this.year, this.month + 1, this.spotday[i]);
    } else {
      if (this.todayspot != null) {
        this.spotstr[this.todayspot] = this._calendarGetString(
          this.spotday[this.todayspot], 1);
          
        this.spot[this.todayspot].setValue(this.spotstr[this.todayspot].shade);
      }
      this.todayspot = i;
      this._useDate(this.year, this.month, this.spotday[i]);
      this.spot[i].setValue(this.spotstr[i].shade);
      this._updateMonth();
      this._updateYear();
      this._updatingSetValue = true;
      this.setValue(new Date(this.year, this.month, this.spotday[i]));
      this._updatingSetValue = false;
    }
    
  },
  
  // Private method.
  // If the parameters are omitted, current date will be used.
  _useDate: function(_year, _month, _day) {
    
    // Validate the parameters.
    var d = new Date();
    if (!_month && _month != 0) {
      _month = d.getMonth();
    }
    if (!_day) {
      _day = d.getDate();
    }
    if (!_year) {
      _year = d.getFullYear();
    }
    if (_year < 100) {
      _year += 1900;
    }
    if (_month < 0) {
      _month = 11;
      _year -= 1;
    } else if (_month > 11) {
      _month = 0;
      _year += 1;
    }
    var l = new Date(_year, _month, 1).getMonthLength();
    if (_day > l || _day < 0) {
      _day = l;
    }
    
    this.year = _year;
    this.month = _month;
    this.day = _day;
    
    
    // The first day of the month as a Date object.
    var date = new Date(this.year, this.month, this.day);
    date.setDate(1);
    
    
    // _calshift tells how many days of the last month is to be showed in the
    // current month view.
    var _calshift = date.getDay() - this._calendarDefaults.startDay;
    if (_calshift == -(this._calendarDefaults.startDay) || _calshift == 0) {
      _calshift += 7;
    }
    
    
    this.spotstr2 = new Array();
    
    var thisMonth_length = new Date(this.year, this.month, 1).getMonthLength();
    var lastMonth = (this.month == 0) ? 11 : this.month -1;
    var lastMonth_length = new Date(this.year, lastMonth, 1).getMonthLength();
    var calstart = lastMonth_length - _calshift + 1;
    var which,c;
    _day = 0;
    this.spotday = new Array();
    this.spotstr = new Array();
    for (var i = 0; i < _calshift; i++) {
      // first week number
      if (i == 0) {
        var year1 = (this.month == 0) ? this.year - 1 : this.year;
        this.spotstr2[0] = new Date(year1, lastMonth, calstart + i).getWeek();
      }
      this.spotday[i] = calstart + i;
      this.spotstr[i] = this._calendarGetString(this.spotday[i], 0);
    }
    this.firstspot = _calshift;
    
    for (var i = _calshift; i < thisMonth_length + _calshift; i++) {
      if (i == 7) {
        this.spotstr2[1] = new Date(
          this.year, this.month, i - _calshift + 1).getWeek();
      } else if (i == 14) {
        this.spotstr2[2] = new Date(
          this.year, this.month, i - _calshift + 1).getWeek();
      } else if (i == 21) {
        this.spotstr2[3] = new Date(
          this.year, this.month, i - _calshift + 1).getWeek();
      } else if (i == 28) {
        this.spotstr2[4] = new Date(
          this.year, this.month, i - _calshift + 1).getWeek();
      }
      
      // last week number
      if (i == 35) {
        if (c < 15) {
          
          var year1 = (this.month == 11) ? this.year + 1 : this.year;
          var month1 = (this.month == 11) ? 0 : this.month + 1;
          this.spotstr2[5] = new Date(
            year1, month1, i - _calshift + 1).getWeek();
            
        } else {
          
          this.spotstr2[5] = new Date(
            this.year, this.month, i - _calshift + 1).getWeek();
            
        }
      }
      
      this.spotday[i] = i - _calshift + 1;
      if (this.spotday[i] == this.day && this._calendarDefaults.selectToday) {
        which = 2;
        this.todayspot = i;
      } else {
        which = 1;
      }
      this.spotstr[i] = this._calendarGetString(this.spotday[i], which);
    }
    
    c = 1;
    this.lastspot = thisMonth_length + _calshift;
    
    for (var i = thisMonth_length + _calshift; i < 42; i++) {
      // last week number
      if (i == 35) {
        if (c < 15) {
          var year1 = (this.month == 11) ? this.year + 1 : this.year;
          var month1 = (this.month == 11) ? 0 : this.month + 1;
          this.spotstr2[5] = new Date(year1, month1, c).getWeek();
        } else {
          this.spotstr2[5] = new Date(this.year, this.month, c).getWeek();
        }
      }
      this.spotday[i] = c++;
      this.spotstr[i] = this._calendarGetString(this.spotday[i], 0);
      
    }
  }
  
});


