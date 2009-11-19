/*   Riassence Framework
 *   Copyright 2009 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */


/*** = Description
  ** Auxiliary class for time handling.
  ***/
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
  * +date+:: Date to return month name from.
  *
  * = Returns
  * Month name
  *
  **/
  monthName: function(date){
    date = (date instanceof Date)?date:this.date();
    return this.months_localized[date.getUTCMonth()];
  },
  
/** = Description
  * Returns week number for date given as input.
  *
  * = Parameters
  * +date+:: Date to return week number from.
  *
  * = Returns
  * Number of the week.
  *
  **/
  week: function(date){
    date = (date instanceof Date)?date:this.date();
    var firstDateOfYear = this.firstDateOfYear(date),
        firstWeekOfYear = this.firstDateOfWeek(firstDateOfYear);
    if(firstWeekOfYear.getUTCDate()<=28){
      firstWeekOfYear = new Date(firstWeekOfYear.getTime()+this.msWeek-this.tzMs(firstWeekOfYear));
    }
    var week = Math.ceil(
      ( ( ( date.getTime() - firstWeekOfYear - this.tzMs(date) ) / this.msDay ) + firstDateOfYear.getUTCDay() + 1 ) / 7
    );
    if((week === 53) && (this.firstDateOfWeek(this.lastDateOfYear(date)).getUTCDate() > 28 )){
      week = 1;
    }
    return week;
  },

/** = Description
  * Returns day of the month for the date given as input.
  *
  * = Parameters
  * +date+:: Date to return day of the month.
  * 
  * = Returns
  * Day of the month
  *
  **/
  mday: function(date){
    date = (date instanceof Date)?date:this.date();
    return date.getUTCDate();
  },

/** = Description
  * Returns month number for the date given as input.
  * Note that months are numbered from 0 to 11.
  *
  * = Parameters
  * +date+:: Date to return month number from.
  *
  * = Returns
  * Number of the month 0 (January) to 11 (December).
  *
  **/
  month: function(date){
    date = (date instanceof Date)?date:this.date();
    return date.getUTCMonth();
  },

/** = Description
  * Returns year for given date.
  *
  * = Parameters
  * +date+:: Date to return year from.
  *
  * = Returns
  * Year
  *
  **/
  year: function(date){
    date = (date instanceof Date)?date:this.date();
    return date.getUTCFullYear();
  },

/** = Description
  * Returns the timezone offset in milliseconds.
  *
  * = Parameters
  * +date+:: The date to get timezone offset from.
  * = Returns
  * Timezone offset in milliseconds.
  *
  **/
  tzMs: function(date){
    return date.getTimezoneOffset()*this.msMinute;
  },

/** = Description
  * Returns date for epoch given in seconds.
  *
  * = Parameters
  * +epoch_seconds+:: Point of time given in seconds 
  * since 1 January 1970 00:00:00 UTC.
  *
  * = Returns
  * Date object
  *
  **/
  date: function(epoch_seconds){
    epoch_seconds = (typeof epoch_seconds === 'number')?epoch_seconds:this.value;
    var date = new Date(epoch_seconds*1000);
    return date;
  },

/** = Description
  * Returns a Date object with first millisecond of the year.
  *
  * = Parameters
  * +date+:: The date to get the first millisecond of the same year.
  *
  * = Returns
  * The Date object for the first millisecond of the year
  *
  **/
  firstDateOfYear: function(date){
    date = (date instanceof Date)?date:this.date();
    var date1 = new Date( date.getUTCFullYear(), 0, 1 ),
        date2 = new Date( date1.getTime() - this.tzMs(date1) );
    return date2;
  },

/** = Description
  *
  *
  *
  **/
  lastDateOfYear: function(date){
    date = (date instanceof Date)?date:this.date();
    var date1 = new Date( new Date( date.getUTCFullYear()+1, 0, 1 ) - 1 ),
        date2 = new Date( date1.getTime() - this.tzMs(date1) );
    return date2;
  },

/** = Description
  *
  *
  *
  **/
  firstDateOfMonth: function(date){
    date = (date instanceof Date)?date:this.date();
    var date1 = new Date( date.getUTCFullYear(), date.getUTCMonth(), 1 ),
        date2 = new Date( date1.getTime() - this.tzMs(date1) );
    return date2;
  },

/** = Description
  *
  *
  *
  **/
  lastDateOfMonth: function(date){
    date = (date instanceof Date)?date:this.date();
    var date1 = new Date( new Date( date.getUTCFullYear(), date.getUTCMonth()+1, 1 ) - 1 ),
        date2 = new Date( date1.getTime() - this.tzMs(date1) );
    return date2;
  },

/** = Description
  * Returns the first second when the week starts for date given as input.
  *
  * = Parameters
  * +date+:: The date to get the first second.
  *
  * = Returns
  * Date for the first second of the week.
  *
  **/
  firstDateOfWeek: function(date){
    date = (date instanceof Date)?date:this.date();
    var wday = date.getUTCDay();
    if(wday===0){
      wday = 7;
    }
    var dateMs = ((wday-1)*this.msDay),
        date1 = new Date( date.getTime() - dateMs ),
        date2 = new Date( date1.getTime() );
    return date2;
  },

/** = Description
  *
  *
  *
  **/
  lastDateOfWeek: function(date){
    var firstDateOfWeek = this.firstDateOfWeek(date),
        lastDateOfWeek = new Date( firstDateOfWeek.getTime() + this.msWeek - this.msDay - 1 );
    return lastDateOfWeek;
  }
});
