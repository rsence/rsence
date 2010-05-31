/*   RSence
 *   Copyright 2009 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */


/*** = Description
  ** Auxiliary class for time handling.
  ***/
var//RSence.DateTime
HDateTime = HClass.extend({
  msWeek: 604800000,
  msDay: 86400000,
  msHour: 3600000,
  msMinute: 60000,
  months_localized: [
    'January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'
  ],
  
/** = Description
  * Returns month name of the given date.
  *
  * = Parameters
  * +_date+:: Date to return month name from.
  *
  * = Returns
  * Month name
  *
  **/
  monthName: function(_date){
    _date = (_date instanceof Date)?_date:this.date();
    return this.months_localized[_date.getUTCMonth()];
  },
  
/** = Description
  * Returns week number for date given as input.
  *
  * = Parameters
  * +_date+:: Date to return week number from.
  *
  * = Returns
  * Number of the week.
  *
  **/
  week: function(_date){
    _date = (_date instanceof Date)?_date:this.date();
    var _firstDateOfYear = this.firstDateOfYear(_date),
        _firstWeekOfYear = this.firstDateOfWeek(_firstDateOfYear);
    if(_firstWeekOfYear.getUTCDate()<=28){
      _firstWeekOfYear = new Date(_firstWeekOfYear.getTime()+this.msWeek-this.tzMs(_firstWeekOfYear));
    }
    var _week = Math.ceil(
      ( ( ( _date.getTime() - _firstWeekOfYear - this.tzMs(_date) ) / this.msDay ) + _firstDateOfYear.getUTCDay() + 1 ) / 7
    );
    if((_week === 53) && (this.firstDateOfWeek(this.lastDateOfYear(_date)).getUTCDate() > 28 )){
      _week = 1;
    }
    return _week;
  },

/** = Description
  * Returns day of the month for the date given as input.
  *
  * = Parameters
  * +_date+:: Date to return day of the month.
  * 
  * = Returns
  * Day of the month
  *
  **/
  mday: function(_date){
    _date = (_date instanceof Date)?_date:this.date();
    return _date.getUTCDate();
  },

/** = Description
  * Returns month number for the date given as input.
  * Note that months are numbered from 0 to 11.
  *
  * = Parameters
  * +_date+:: Date to return month number from.
  *
  * = Returns
  * Number of the month 0 (January) to 11 (December).
  *
  **/
  month: function(_date){
    _date = (_date instanceof Date)?_date:this.date();
    return _date.getUTCMonth();
  },

/** = Description
  * Returns year for given date.
  *
  * = Parameters
  * +_date+:: Date to return year from.
  *
  * = Returns
  * Year
  *
  **/
  year: function(_date){
    _date = (_date instanceof Date)?_date:this.date();
    return _date.getUTCFullYear();
  },

/** = Description
  * Returns the timezone offset in milliseconds.
  *
  * = Parameters
  * +_date+:: The date to get timezone offset from.
  *
  * = Returns
  * Timezone offset in milliseconds.
  *
  **/
  tzMs: function(_date){
    return _date.getTimezoneOffset()*this.msMinute;
  },

/** = Description
  * Returns a Date instance for epoch given in seconds.
  *
  * = Parameters
  * +epoch_seconds+:: Point of time given in seconds 
  *                   since 1 January 1970 00:00:00 UTC.
  *
  * = Returns
  * Date object
  *
  **/
  date: function(epoch_seconds){
    epoch_seconds = (typeof epoch_seconds === 'number')?epoch_seconds:this.value;
    var _date = new Date(epoch_seconds*1000);
    return _date;
  },

/** = Description
  * Returns a Date object with first millisecond of the year.
  *
  * = Parameters
  * +_date+:: The date to get the first millisecond of the same year.
  *
  * = Returns
  * The Date object for the first millisecond of the year
  *
  **/
  firstDateOfYear: function(_date){
    _date = (_date instanceof Date)?_date:this.date();
    var _date1 = new Date( _date.getUTCFullYear(), 0, 1 ),
        _date2 = new Date( _date1.getTime() - this.tzMs(_date1) );
    return _date2;
  },

/** = Description
  * Get last millisecond of the input given date's year as a Date object.
  *
  * = Parameters
  * +_date+:: The last millisecond of the year on the date given.
  *
  * = Returns
  * Last millisecond of the year as a Date object.
  *
  **/
  lastDateOfYear: function(_date){
    _date = (_date instanceof Date)?_date:this.date();
    var _date1 = new Date( new Date( _date.getUTCFullYear()+1, 0, 1 ) - 1 ),
        _date2 = new Date( _date1.getTime() - this.tzMs(_date1) );
    return _date2;
  },

/** = Description
  * Returns the first millisecond of the input given date's month.
  *
  * = Parameters
  * +_date+:: The date to get the first millisecond of the month
  *
  * = Returns
  * The first millisecond on the given date's month as a Date object.
  *
  **/
  firstDateOfMonth: function(_date){
    _date = (_date instanceof Date)?_date:this.date();
    var _date1 = new Date( _date.getUTCFullYear(), _date.getUTCMonth(), 1 ),
        _date2 = new Date( _date1.getTime() - this.tzMs(_date1) );
    return _date2;
  },

/** = Description
  * Returns the last millisecond of the input given date's month.
  *
  * = Parameters
  * +_date+:: The date to get the last millisecond of the month.
  *
  * = Returns
  * The last millisecond of the given date's month as a Date object.
  *
  **/
  lastDateOfMonth: function(_date){
    _date = (_date instanceof Date)?_date:this.date();
    var _date1 = new Date( new Date( _date.getUTCFullYear(), _date.getUTCMonth()+1, 1 ) - 1 ),
        _date2 = new Date( _date1.getTime() - this.tzMs(_date1) );
    return _date2;
  },

/** = Description
  * Returns the first millisecond when the week starts for date given as input.
  *
  * = Parameters
  * +_date+:: The date to get the first millisecond.
  *
  * = Returns
  * Date for the first millisecond of the week.
  *
  **/
  firstDateOfWeek: function(_date){
    _date = (_date instanceof Date)?_date:this.date();
    var _wday = _date.getUTCDay();
    if(_wday===0){
      _wday = 7;
    }
    var _dateMs = ((_wday-1)*this.msDay),
        _date1 = new Date( _date.getTime() - _dateMs ),
        _date2 = new Date( _date1.getTime() );
    return _date2;
  },

/** = Description
  * Returns the last millisecond of the week for the given date.
  *
  * = Parameters
  * +_date+:: The date to get the last millisecond
  *
  * = Returns
  * The last millisecond of the week as a Date object.
  *
  **/
  lastDateOfWeek: function(_date){
    var _firstDateOfWeek = this.firstDateOfWeek(_date),
        _lastDateOfWeek = new Date( _firstDateOfWeek.getTime() + this.msWeek - this.msDay - 1 );
    return _lastDateOfWeek;
  }
});
