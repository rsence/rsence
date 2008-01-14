/**
  *  Helmi RIA Platform
  *  Copyright (C) 2006-2007 Helmi Technologies Inc.
  *  
  *  This program is free software; you can redistribute it and/or modify it under the terms
  *  of the GNU General Public License as published by the Free Software Foundation;
  *  either version 2 of the License, or (at your option) any later version. 
  *  This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
  *  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
  *  See the GNU General Public License for more details. 
  *  You should have received a copy of the GNU General Public License along with this program;
  *  if not, write to the Free Software Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
  **/

Date.prototype.getWeek = function() {
  var _year = this.getFullYear();  
  var _newYear = new Date(_year,0,1);
  var _modDay = _newYear.getDay();
  var _daynum = ((Date.UTC(_year,this.getMonth(),this.getDate()) -
    Date.UTC(_year,0,1)) / (1000 * 60 * 60 * 24))/* + 1*/;
  if (_modDay == 0) {
    _modDay = 6;
  } else {
    _modDay--;
  }  
  // Monday is now 0 etc  
  var _weeknumDays = _daynum - (7 - _modDay);  
  var _fullWeeks = Math.floor(_weeknumDays / 7) + 1;
    
  // tuesday, wednesday tai thursday
  if (0 <= _modDay && _modDay <= 3) {
    _fullWeeks += 1;
  }
  _weeknum = _fullWeeks;
  if (_weeknum == 53) {
    // if year starts with thursday or
    // or karkausvuosi starts with wednesday or thursday
    if (_modDay == 3 ||
        ( (_modDay == 2 || _modDay == 3) &&
        ( (_year % 4 == 0 && _year % 100 != 0) || _year % 400 == 0) ) ) {
    } else {
      // next year's week 1
      _weeknum = 1;
    }
  }
  return _weeknum;
}
Date.prototype.getMonthLength = function() {
  var _month = this.getMonth();
  var _year = this.getFullYear();
  var _monthLength = [31,28,31,30,31,30,31,31,30,31,30,31];
  if (_month == 1 && ( (_year % 4 == 0 && _year % 100 != 0) || _year % 400 == 0) ) {
    return 29;
  } else {
    return _monthLength[_month];
  }
}
/** class: HDateValue
  *
  * HDateValues are <HValue> extensions used to support the special type of
  * value of dates/times with special xml output and internal representanion as a numeric value representing seconds since 1970-1-1
  * It has the accompanying methods to set date parts, like months and hours.
  *
  **/
HDateValue = HValue.extend({
  
/** constructor: constructor
  *
  * We just need the id and value, as usual.
  * However the value has to be a JavaScript Date object.
  *
  * Parameters:
  *  _id - See <HValue.constructor>
  *  _value - JavaScript Date object.
  *
  **/
  constructor: function(_id,_value){
    this.validate(_value);
    // default time zone
    this._dateFormat = "";
    this._timezone = 2;
    this.base(_id,_value);
    this.type = '[HDateValue]';
  },

  
/** method: validate
  *
  * Simple value validation
  *
  * Parameters:
  *  _value - JavaScript Date object.
  *
  **/
  validate: function(_value){
    
  },
  
/** method: set
  *
  * You should only set with values as arrays with three integers in range 0..255.
  *
  **/
  set: function(_value){
    this.base(_value);
  },
  
/** method: getYear
  *
  * Returns the year of the specified date according to local time.
  *
  * Returns:
  *  For dates between the years 1000 and 9999, getYear returns a four-digit number, for example, 1995.
  *
  **/
  getYear: function(){
    var _time = this._utcToLocal();
    return _time.getFullYear();
  },
  
/** method: getMonth
  *
  * Returns the month in the specified date according to local time.
  *
  * Returns:
  *  The value returned by getMonth is an integer between 1 and 12.
  *
  **/
  getMonth: function(){
    var _time = this._utcToLocal();
    return _time.getMonth() + 1;
  },
  
/** method: getWeek
  *
  * Returns the week in the specified date according to local time.
  *
  * Returns:
  *  The value returned by getWeek is an integer between 1 and 53.
  *
  **/
  getWeek: function(){
    var _time = this._utcToLocal();
    return _time.getWeek();
  },
  
  
/** method: getMDay
  *
  * Returns the day of the month for the specified date according to local time.
  *
  * Returns:
  *  The value returned by getMDay is an integer between 1 and 31.
  *
  **/
  getMDay: function(){
    var _time = this._utcToLocal();
    return _time.getDate();
  },
  
/** method: getHour
  *
  * Returns the hour for the specified date according to local time.
  *
  * Returns:
  *  The value returned by getHour is an integer between 0 and 23.
  *
  **/
  getHour: function(){
    var _time = this._utcToLocal();
    return _time.getHours();
  },
  
  _utcToLocal: function(){
    var _localTime = this.value.getTime();
    var _localOffset = this.value.getTimezoneOffset() * 60000;
    var _utc = _localTime + _localOffset; 
    var _time = new Date(_utc + (this._timezone * 3600000));
    return _time;
  },
  
/** method: getMinute
  *
  * Returns the minute for the specified date according to local time.
  *
  * Returns:
  *  The value returned by getMinute is an integer between 0 and 59.
  *
  **/
  getMinute: function(){
    var _time = this._utcToLocal();
    return _time.getUTCMinutes();
  },
  
/** method: getSecond
  *
  * Returns the second for the specified date according to local time.
  *
  * Returns:
  *  The value returned by getSecond is an integer between 0 and 59.
  *
  **/
  getSecond: function(){
    var _time = this._utcToLocal();
    return _time.getUTCSeconds();
  },
  
  getMilliSecond: function(){
    var _time = this._utcToLocal();
    return _time.getUTCMilliseconds();
  },
  
/** method: getTimeZone
  *
  * Returns:
  *  Returns the time-zone offset in hours for the current locale.
  *
  **/
  getTimeZone: function(){
    return this._timezone;
  },
  
/** method: setYear
  *
  * Sets the full year for a specified date according to local time.
  *
  * Parameters:
  *  _yearNum - An integer specifying the numeric value of the year, for example, 1995.
  *  _monthNum - An integer between 1 and 12 representing the months January through December.
  *  _mdayNum - An integer between 1 and 31 representing the day of the month. If you specify the dayValue parameter, you must also specify the monthValue.
  *
  **/
  setYear:   function(_yearNum, _monthNum, _mdayNum){
    if (_monthNum) {
      _monthNum -= 1;
    }
    this.value.setFullYear(_yearNum, _monthNum, _mdayNum);
    this.base(this.value);
  },
  
/** method: setMonth
  *
  * Set the month for a specified date according to local time.
  *
  * Parameters:
  *  _monthNum - An integer between 1 and 12.
  *  _mdayNum - An integer from 1 to 31, representing the day of the month.
  *
  **/
  setMonth:   function(_monthNum, _mdayNum){
    this.value.setMonth(_monthNum - 1, _mdayNum);
    this.base(this.value);
  },
  
/** method: setMDay
  *
  * Sets the day of the month for a specified date according to local time.
  *
  * Parameters:
  *  _mdayNum - An integer from 1 to 31, representing the day of the month.
  *
  **/
  setMDay:   function(_mdayNum){
    this.value.setDate(_mdayNum);
    this.base(this.value);
  },
  
/** method: setHour
  *
  * Sets the hour for a specified date according to local time.
  *
  * Parameters:
  *  _hourNum - An integer between 0 and 23, representing the hour.
  *  _minuteNum - An integer between 0 and 59, representing the minute.
  *  _secondNum - An integer between 0 and 59, representing the seconds. If you specify the _secondNum parameter, you must also specify the _minuteNum.
  *  _msNum - A number between 0 and 999, representing the milliseconds. If you specify the _msNum parameter, you must also specify the _minuteNum and _secondNum.
  *
  **/
  setHour:   function(_hourNum, _minuteNum, _secondNum, _msNum){
    this.value.setHours(_hourNum, _minuteNum, _secondNum, _msNum);
    this.base(this.value);
  },
  
/** method: setMinute
  *
  * Sets the minute for a specified date according to local time.
  *
  * Parameters:
  *  _minuteNum - An integer between 0 and 59, representing the minute.
  *  _secondNum - An integer between 0 and 59, representing the second. If you specify the _secondNum parameter, you must also specify the _minuteNum.
  *  _msNum - A number between 0 and 999, representing the millisecond. If you specify the _msNum parameter, you must also specify the _minuteNum and _secondNum.
  *
  **/
  setMinute:   function(_minuteNum, _secondNum, _msNum){
    this.value.setMinutes(_minuteNum, _secondNum, _msNum);
    this.base(this.value);
  },
  
/** method: setSecond
  *
  * Sets the second for a specified date according to local time.
  *
  * Parameters:
  *  _secondNum - An integer between 0 and 59.
  *  _msNum - A number between 0 and 999, representing the millisecond.
  *
  **/
  setSecond:   function(_secondNum, _msNum){
    this.value.setSeconds(_secondNum, _msNum);
    this.base(this.value);
  },
  
/** method: setTimeZone
  *
  * Parameters:
  *  _theTimeZoneNum - Negative or positive numeric value that represents
  *                    how many hours to add or subtract when making the 
  *                    value human-readable.
  *
  **/
  setTimeZone:   function(_theTimeZoneValue){
    this._timezone = _theTimeZoneValue;
  },
  
  
/** method: setDateFormat
  *
  * Parameters:
  *   _reprString - A string that represents date / time parts in the 
  *                 format the user wants them.
  *
  * See Also:
  *  <toDateString>
  **/
  setDateFormat: function(_reprString){
    this._dateFormat = _reprString;
  },
/** method: toDateString
  *
  * Format the value as a nice human-readable string.
  *
  * d - The day of the month. Single-digit days will not have a leading zero.
  * dd - The day of the month. Single-digit days will have a leading zero.
  * M - The numeric month. Single-digit months will not have a leading zero.
  * MM - The numeric month. Single-digit months will have a leading zero.
  * MMM - The abbreviated name of the month
  * MMMM - The full name of the month
  * y - The year without the century. If the year without the century is less than 10, the year is displayed with no leading zero.
  * yy - The year without the century. If the year without the century is less than 10, the year is displayed with a leading zero.
  * yyyy - The year in four digits, including the century.
  * h - The hour in a 12-hour clock. Single-digit hours will not have a leading zero.
  * hh - The hour in a 12-hour clock. Single-digit hours will have a leading zero.
  * H - The hour in a 24-hour clock. Single-digit hours will not have a leading zero.
  * HH - The hour in a 24-hour clock. Single-digit hours will have a leading zero.
  * m - The minute. Single-digit minutes will not have a leading zero.
  * mm - The minute. Single-digit minutes will have a leading zero.
  * s - The second. Single-digit seconds will not have a leading zero.
  * ss - The second. Single-digit seconds will have a leading zero.
  * t - The first character in the AM/PM designator
  * tt - The AM/PM designator
  * z - The time zone offset ("+" or "-" followed by the hour only). Single-digit hours will not have a leading zero.
  * zz - The time zone offset ("+" or "-" followed by the hour only). Single-digit hours will have a leading zero.
  *
  * See Also:
  *  <setDateFormat>
  **/
  toDateString: function(){
    var _monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var _abbpreviatedMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var _dateString = this._dateFormat;
    var _stringArray = [""];
    var _index = 0;
    var ch = "";
    var _day = this.getMDay().toString();
    var _month = this.getMonth().toString();
    var _year = this.getYear().toString();
    var _year2Digits = (_year.length == 1?"0"+_year:(_year.charAt(_year.length-2)+_year.charAt(_year.length-1)));
    var _24hour = this.getHour().toString();
    var _hour = this.getHour(); // temp
    var _12hour = (_hour > 12)?_hour-12:_hour;
    _12hour = (_12hour == 0)?12:_12hour;
    var _minute = this.getMinute().toString();
    var _second = this.getSecond().toString();
    var _timezone = this.getTimeZone();
    var _timezoneS = _timezone.toString();
    var _milliseconds = this.getHour() * 60 * 60 * 1000 +
      this.getMinute() * 60 * 1000 +
      this.getSecond() * 1000 +
      this.getMilliSecond();
    var _designator = (0 < _milliseconds && _milliseconds <= 12 * 60 * 60 * 1000)?"AM":"PM";
    
    var regexpArray = [
      [/dd/g,(_day.length == 1?"0":"")+_day],       // dd
      [/d/g,_day],                                  // d
      [/MMMM/g,"'"+_monthNames[parseInt(_month)-1]+"'"],  // MMMM
      [/MMM/g,"'"+_abbpreviatedMonthNames[parseInt(_month)-1]+"'"],  // MMM
      [/MM/g,(_month.length == 1?"0":"")+_month],   // MM
      [/M/g,_month],                                // M
      [/yyyy/g,_year],                              // yyyy
      [/yy/g,_year2Digits],                         // yy
      [/y/g,parseInt(_year2Digits)],                // y,
      [/HH/g,(_24hour.length == 1?"0":"")+_24hour], // HH
      [/H/g,_24hour],                               // H
      [/hh/g,(_12hour.length == 1?"0":"")+_12hour], // hh
      [/h/g,_12hour],                               // h
      [/mm/g,(_minute.length == 1?"0":"")+_minute], // mm
      [/m/g,_minute],                               // m
      [/ss/g,(_second.length == 1?"0":"")+_second], // ss
      [/s/g,_second],                               // s
      [/zz/g,((_timezone > 0) ? "+" : "")+(_timezoneS.length == 1?"0":"")+_timezone], // zz
      [/z/g,((_timezone > 0) ? "+" : "")+_timezone],                                  // z
      [/tt/g,"'"+_designator+"'"],                          // tt
      [/t/g,"'"+_designator.charAt(0)+"'"]                 // t
    ];
    
    for (var i = 0; i < _dateString.length; i++) {
      ch = _dateString.charAt(i);
      if (ch == "'") {
        if (i > 0) {
          _index++;
          _stringArray[_index] = "";
        }
        _stringArray[_index] += ch;
        i++;
        ch = _dateString.charAt(i);
        while (ch != "'" && i < _dateString.length) {
          _stringArray[_index] += ch;
          i++;
          ch = _dateString.charAt(i);
        }
        if (i < _dateString.length) {
          _stringArray[_index] += ch;
          _index++;
          _stringArray[_index] = "";
        }
      } else {
        _stringArray[_index] += ch;
      }
    }
    for (var i = 0; i < _stringArray.length; i++) {
      if (_stringArray[i].charAt(0) != "'") {
        for (var j = 0; j < regexpArray.length; j++) {
          _stringArray[i] = _stringArray[i].replace(regexpArray[j][0],regexpArray[j][1]);
          if (_stringArray[i].indexOf("'") >= 0) { // text replace
            var k = _stringArray[i].indexOf("'");
            var k2 = _stringArray[i].indexOf("'",k+1);
            var _split = _stringArray[i];
            var _split1 = _split.substring(0,k);
            var _split2 = _split.substring(k,k2+1);
            var _split3 = _split.substring(k2+1,_split.length);
            _stringArray.splice(i,1,_split1,_split2,_split3);
            i++;
            break;
          }
        }
      }
    }
    
    return _stringArray.join("").replace(/'/g,"");
  },
  
/** method: toXML
  *
  * Generates an XML description of the date.
  *
  * Parameter:
  *  _i - The sequence number of the item, generated by HValueManager.
  *
  * Returns:
  *  An XML string with the date as specified
  *
  * See Also:
  *  <HValue.toXML> <HValueManager.toXML>
  *
  * Sample:
  * > <date id="date:215" order="1" epochvalue="1163153913.33" timezone="+2"><year>2006</year><month>11</month><mday>10</mday><hour>10</hour><minute>20</minute><second>23</second><timezone>+2</timezone></date>
  **/
  toXML: function(_i){
    var _syncid = this.id;
    var _timezone = this.getTimeZone();
    _timezone = ((_timezone > 0) ? "+" : "") +_timezone;
    return '<date id="'+_syncid+'" order="'+_i+'" epochvalue="'+this.value.getTime()+'" timezone="'+_timezone+'"><year>'+this.getYear()+'</year><month>'+this.getMonth()+'</month><mday>'+this.getMDay()+'</mday><hour>'+this.getHour()+'</hour><minute>'+this.getMinute()+'</minute><second>'+this.getSecond()+'</second></date>';
  }
});


HCalendarButton = HControl.extend({
  
  packageName:   "calendar",
  componentName: "calendarbutton",

  constructor: function(_rect,_parentClass,_options) {
    if(this.isinherited){
      this.base(_rect,_parentClass,_options);
    }
    else {
      this.isinherited = true;
      this.base(_rect,_parentClass,_options);
      this.isinherited = false;
    }
    
    this.type = '[HCalendarButton]';
    
    this._tmplLabelPrefix = "calendarbuttonlabel";
    
    this.setMouseDown(true);
    this.setKeyDown(true);
    
    if(!this.isinherited){
      this.draw();
    }
  },
  
  keyDown: function(_keycode) {
    this.parent.keyDown(_keycode);
  },
  
  
  // Private method.
  _updateCheckBoxImage: function(){
    // Sets the checkbox background image
    if (this.value == 0) {
      this.toggleCSSClass(elem_get(this._labelElementId),
        "shaded", false);
      this.toggleCSSClass(elem_get(this._labelElementId),
        HCalendarButton.cssOn, false);
      this.toggleCSSClass(elem_get(this._labelElementId),
        HCalendarButton.cssOff, true);
    } else if (this.value == 1) {
      this.toggleCSSClass(elem_get(this._labelElementId),
        "shaded", false);
      this.toggleCSSClass(elem_get(this._labelElementId),
        HCalendarButton.cssOn, true);
      this.toggleCSSClass(elem_get(this._labelElementId),
        HCalendarButton.cssOff, false);
    } else if (this.value == 2) {
      this.toggleCSSClass(elem_get(this._labelElementId),
        "shaded", true);
      this.toggleCSSClass(elem_get(this._labelElementId),
        HCalendarButton.cssOn, false);
      this.toggleCSSClass(elem_get(this._labelElementId),
        HCalendarButton.cssOff, false);
    }
    /*if(this.value){
      this.toggleCSSClass(elem_get(this._labelElementId),
        HCalendarButton.cssOn, true);
      this.toggleCSSClass(elem_get(this._labelElementId),
        HCalendarButton.cssOff, false);

    } else {
      this.toggleCSSClass(elem_get(this._labelElementId),
        HCalendarButton.cssOn, false);
      this.toggleCSSClass(elem_get(this._labelElementId),
        HCalendarButton.cssOff, true);
    }*/
  },
  
  
  // HControl seems to call refresh too.
  /* setValue: function(_value){
    this.base(_value);
    this.refresh();
  }, */
  
  // setValue calls refresh that calls _updateCheckBoxImage.
  /* onIdle: function(){
    this._updateCheckBoxImage();
    this.base();
  }, */
  
  
  draw: function() {
    if(!this.drawn){
      this.drawRect();
      this.drawMarkup();
      this.drawn = true;
    }
    this.refresh();
  },
  
  

  refresh: function() {
    if(this.drawn) {
      // Checks if this is the first refresh call:
      if(!this._labelElementId){
        // Gets the label element based on the id specified in constructor and template:
        this._labelElementId = elem_bind(this._tmplLabelPrefix+this.elemId);
      }
      // Checks if we have a label element:
      if(this._labelElementId) {
        elem_set(this._labelElementId,this.label);
        this._updateCheckBoxImage();
      }
      this.drawRect();
    }
  },
  setShaded: function(){
    this.value = 0;
  },
  setSelected: function(){
    
  },
  setNormal: function(){
    
  },
 
  mouseDown: function(_x,_y,_isLeftButton){
    this.parent.selectDay(this.index);
    //this.setValue(!this.value);
  }
  
},{

  // The name of the CSS class to be used when...
  
  // the item is selected.
  cssOn: "on",
  // the item not selected.
  cssOff: "off"
});

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



HCalendarHeaderButton = HControl.extend({
  
  packageName:   "calendar",
  componentName: "calendarheaderbutton",

  constructor: function(_rect,_parentClass,_options) {
    if(this.isinherited){
      this.base(_rect,_parentClass,_options);
    }
    else {
      this.isinherited = true;
      this.base(_rect,_parentClass,_options);
      this.isinherited = false;
    }
    
    this.type = '[HCalendarHeaderButton]';
    
    this._tmplLabelPrefix = "calendarheaderbuttonlabel";
    
    this.setKeyDown(true);
    
    if(!this.isinherited){
      this.draw();
    }
  },
  
  keyDown: function(_keycode) {
    this.parent.keyDown(_keycode);
  },
  
  
  // HControl seems to call refresh too.
  /* setValue: function(_value){
    this.base(_value);
    this.refresh();
  }, */
  
  // setValue calls refresh that calls _updateCheckBoxImage.
  /* onIdle: function(){
    this._updateCheckBoxImage();
    this.base();
  }, */
  
  
  draw: function() {
    if(!this.drawn){
      this.drawRect();
      this.drawMarkup();
      this.drawn = true;
    }
    this.refresh();
  },
  
  refresh: function() {
    if(this.drawn) {
      // Checks if this is the first refresh call:
      if(!this._labelElementId){
        // Gets the label element based on the id specified in constructor and template:
        this._labelElementId = elem_bind(this._tmplLabelPrefix+this.elemId);
      }
      // Checks if we have a label element:
      if(this._labelElementId) {
        elem_set(this._labelElementId,this.label);
      }
      this.drawRect();
    }
  }
  
});

