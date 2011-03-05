/*   RSence
 *   Copyright 2011 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

var
HLocale = {
  components: {
    
  },
  dateTime: {
    strings: {
      weekDaysLong:  [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ],
      weekDaysShort: [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ],
      dateDelimitter: '.',
      timeDelimitter: ':',
      timeMsDelimitter: '.',
      rangeDelimitter: ' ... '
    },
    settings: {
      zeroPadTime: true,
      AMPM: false
    },
    defaultOptions: {
      longWeekDay: false,
      shortWeekDay: false,
      shortYear: false,
      fullYear: true,
      seconds: false,
      milliSeconds: false
    },
    options: function( _custom ){
      var
      _this = HLocale.dateTime,
      _default = _this.defaultOptions,
      _options = {},
      _key;
      for( _key in _default ){
        _options[_key] = _default[_key];
      }
      if( !_custom ){
        _custom = {};
      }
      for( _key in _custom ){
        _options[_key] = _custom[_key];
      }
      return _options;
    },
    zeroPadTime: function( _num ){
      if( HLocale.dateTime.settings.zeroPadTime && _num < 10 ){
        return '0'+_num;
      }
      return _num.toString();
    },
    formatShortWeekDay: function( _dateTimeEpoch ){
      var
      _this = HLocale.dateTime,
      _date = new Date( _dateTimeEpoch * 1000 ),
      _strings = _this.strings,
      _wday = _date.getUTCDay();
      return _strings.weekDaysShort[ _wday ];
    },
    formatLongWeekDay: function( _dateTimeEpoch ){
      var
      _this = HLocale.dateTime,
      _date = new Date( _dateTimeEpoch * 1000 ),
      _strings = _this.strings,
      _wday = _date.getUTCDay();
      return _strings.weekDaysLong[ _wday ];
    },
    formatDate: function( _dateTimeEpoch, _options ){
      var
      _this = HLocale.dateTime,
      _date = new Date( _dateTimeEpoch * 1000 ),
      _strings = _this.strings,
      _wday = _date.getUTCDay(),
      _dateString = _date.getUTCDate() + _strings.dateDelimitter + (_date.getUTCMonth() + 1) + _strings.dateDelimitter;
      
      _options = _this.options( _options );
      
      if( _options.fullYear ){
        _dateString += _date.getUTCFullYear();
      }
      else if( _options.shortYear ){
        _dateString += date.getUTCYear();
      }
      
      if( _options.longWeekDay ){
        return _strings.weekDaysLong[_wday] + ' ' + _dateString;
      }
      else if( _options.shortWeekDay ){
        return _strings.weekDaysShort[_wday] + ' ' + _dateString;
      }
      return _dateString;
    },
    formatTime: function( _dateTimeEpoch, _options ){
      var
      _this = HLocale.dateTime,
      _date = new Date( _dateTimeEpoch * 1000 ),
      _strings = _this.strings,
      _timeString = _this.zeroPadTime( _date.getUTCHours() ) + _strings.timeDelimitter + _this.zeroPadTime( _date.getUTCMinutes() );
      
      _options = _this.options( _options );
      
      if( _options.seconds ){
        _timeString += _strings.timeDelimitter + _this.zeroPadTime( _date.getUTCSeconds() );
        if( _options.milliSeconds ){
          _timeString += _strings.timeMsDelimitter + _date.getUTCMilliseconds();
        }
      }
      return _timeString;
    },
    formatDateTime: function( _dateTimeEpoch, _options ){
      var _this = HLocale.dateTime;
      return _this.formatDate( _dateTimeEpoch, _options ) + ' ' + _this.formatTime( _dateTimeEpoch, _options );
    }
  }
};

