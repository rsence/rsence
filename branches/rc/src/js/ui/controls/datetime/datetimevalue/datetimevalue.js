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

HDateTime = HClass.extend({
  msWeek: 604800000,
  msDay: 86400000,
  msHour: 3600000,
  msMinute: 60000,
  months_localized: [
    'January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'
  ],
  monthName: function(date){
    date = (date instanceof Date)?date:this.date();
    return this.months_localized[date.getUTCMonth()];
  },
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
  mday: function(date){
    date = (date instanceof Date)?date:this.date();
    return date.getUTCDate();
  },
  month: function(date){
    date = (date instanceof Date)?date:this.date();
    return date.getUTCMonth();
  },
  year: function(date){
    date = (date instanceof Date)?date:this.date();
    return date.getUTCFullYear();
  },
  tzMs: function(date){
    return date.getTimezoneOffset()*this.msMinute;
  },
  date: function(epoch_seconds){
    epoch_seconds = (typeof epoch_seconds === 'number')?epoch_seconds:this.value;
    var date = new Date(epoch_seconds*1000);
    return date;
  },
  firstDateOfYear: function(date){
    date = (date instanceof Date)?date:this.date();
    var date1 = new Date( date.getUTCFullYear(), 0, 1 ),
        date2 = new Date( date1.getTime() - this.tzMs(date1) );
    return date2;
  },
  lastDateOfYear: function(date){
    date = (date instanceof Date)?date:this.date();
    var date1 = new Date( new Date( date.getUTCFullYear()+1, 0, 1 ) - 1 ),
        date2 = new Date( date1.getTime() - this.tzMs(date1) );
    return date2;
  },
  firstDateOfMonth: function(date){
    date = (date instanceof Date)?date:this.date();
    var date1 = new Date( date.getUTCFullYear(), date.getUTCMonth(), 1 ),
        date2 = new Date( date1.getTime() - this.tzMs(date1) );
    return date2;
  },
  lastDateOfMonth: function(date){
    date = (date instanceof Date)?date:this.date();
    var date1 = new Date( new Date( date.getUTCFullYear(), date.getUTCMonth()+1, 1 ) - 1 ),
        date2 = new Date( date1.getTime() - this.tzMs(date1) );
    return date2;
  },
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
  lastDateOfWeek: function(date){
    var firstDateOfWeek = this.firstDateOfWeek(date),
        lastDateOfWeek = new Date( firstDateOfWeek.getTime() + this.msWeek - this.msDay - 1 );
    return lastDateOfWeek;
  }
});
