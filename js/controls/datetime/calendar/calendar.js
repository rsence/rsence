/*   RSence
 *   Copyright 2009 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

/*** = Description
  ** Use HCalendar to display a month calendar that displays days as columns
  ** and weeks as rows. Its value is a date/time number specified in seconds
  ** since or before epoch (1970-01-01 00:00:00 UTC).
  ***/
HCalendar = HControl.extend({
  componentName: 'calendar',
  weekdays_localized: ['Wk','Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
  defaultEvents: {
    mouseWheel: true
  },
/** = Description
  * Calls HCalendar#nextMonth or HCalendar#prevMonth based on delta 
  * of mouseWheel. 
  *
  **/
  mouseWheel: function(_delta){
    if ( _delta < 0 ) {
      this.nextMonth();
    }
    else {
      this.prevMonth();
    }
  },

/** = Description
  * Refreshes weekdays.
  *
  **/
  refreshLabel: function(){
    if(!this['markupElemIds']){
      return;
    }
    var _weekdays_localized = this.weekdays_localized,
        _weekdays_width = Math.floor(this.rect.width/_weekdays_localized.length),
        _weekdays_html = [],
        i = 0,
        _weekdays_html_pre = ['<div style="width:'+_weekdays_width+'px;left:','px">'],
        _weekdays_html_suf = '</div>';
    for(;i<_weekdays_localized.length;i++){
      _weekdays_html.push([
        _weekdays_html_pre.join(i*_weekdays_width),
        _weekdays_localized[i],
        _weekdays_html_suf
      ].join('') );
    }
    ELEM.setHTML(this.markupElemIds.label, _weekdays_html.join(''));
  },

/** = Description
  * Checks the date range for the month which the date given as input belongs.
  * 
  * = Parameters
  * +_date+:: A Date instance to check date range from
  *
  * = Returns
  * Array of [0] first week's date and [1] last week's date.
  *
  **/
  calendarDateRange: function(_date){
    var _date_begin = this.firstDateOfMonth(_date),
        _date_end = this.lastDateOfMonth(_date),
        _firstWeeksDate = this.firstDateOfWeek(_date_begin),
        _lastWeeksDate  = this.lastDateOfWeek(_date_end),
        _week_begin = this.week(_firstWeeksDate),
        _week_end = this.week(_lastWeeksDate),
        _weeks = _week_end-_week_begin;
    if((_weeks===5) && (_firstWeeksDate.getDate() !== 1)){
      _lastWeeksDate = new Date( _lastWeeksDate.getTime() + this.msWeek );
    }
    else if((_weeks===5) && (_firstWeeksDate.getDate() === 1)){
      _firstWeeksDate = new Date( _firstWeeksDate.getTime() - this.msWeek );
    }
    else if(_weeks===4){
      _firstWeeksDate = new Date( _firstWeeksDate.getTime() - this.msWeek );
      _lastWeeksDate = new Date( _lastWeeksDate.getTime() + this.msWeek );
    }
    return [
      _firstWeeksDate,
      _lastWeeksDate
    ];
  },

/** = Description
  * Refreshes the calendar.
  *
  **/
  refreshValue: function(){
    var _date = this.date();
    this.drawCalendar(_date);
  },

/** = Description
  * Draws the next month on calendar.
  *
  **/
  nextMonth: function(){
    var _date = new Date( this.viewMonth[0], this.viewMonth[1]+1, 1 );
    this.drawCalendar( new Date(_date.getTime() - this.tzMs(_date)) );
  },

/** = Description
  * Draws the previous month on calendar.
  *
  **/
  prevMonth: function(){
    var _date = new Date( this.viewMonth[0], this.viewMonth[1]-1, 1 );
    this.drawCalendar( new Date(_date.getTime() - this.tzMs(_date)) );
  },
  viewMonth: [1970,0],

/** = Description
  * Draws the calendar with the date open given as input.
  *
  * = Parameters
  * +_date+:: The date on which calendar UI is opened at.
  *
  **/
  drawCalendar: function(_date){
    _date = (_date instanceof Date)?_date:this.date();
    var _calendarDateRange = this.calendarDateRange(_date),
        _monthFirst = this.firstDateOfMonth(_date),
        _monthLast = this.lastDateOfMonth(_date),
        _firstDate = _calendarDateRange[0],
        _lastDate = _calendarDateRange[1],
        _column_count = this.weekdays_localized.length,
        _column_width = Math.floor((this.rect.width-1)/_column_count),
        _row_height = Math.floor((this.rect.height-1-35)/6),
        _week_html_pre = ['<div class="calendar_weeks_week_row" style="width:'+(this.rect.width-3)+'px;height:'+_row_height+'px;top:','px">'],
        _week_html_suf = '</div>',
        _col_html_pre = ['<a href="javascript:void(HSystem.views['+this.viewId+'].setValue(','));" class="calendar_weeks_week_col','" style="width:'+_column_width+'px;height:'+_row_height+'px;line-height:'+_row_height+'px;left:','px">'],
        _col_html_suf = '</a>',
        _col_week_pre = '<div class="calendar_weeks_week_col_wk" style="width:'+_column_width+'px;height:'+_row_height+'px;line-height:'+_row_height+'px;left:0px">',
        _col_week_suf = '</div>',
        _month_html = [],
        _week_html,
        _col_html,
        _row = 0,
        _col,
        _colMs,
        _colSecs,
        _colDate,
        _extraCssClass;
    for(; _row<6; _row++){
      _week_html = [];
      for(_col = 0; _col<8; _col++){
        _colDate = new Date(_firstDate.getTime()+((_row*this.msWeek)+((_col-1)*this.msDay)));
        _colMs = _colDate.getTime();
        if(_col===0){
          _col_html = [
            _col_week_pre,
            this.week(_colDate),
            _col_week_suf
          ].join('');
        }
        else {
          _colSecs = Math.round(_colMs/1000);
          if((this.value >= _colSecs) && (this.value < (_colSecs+86400))){
            _extraCssClass = '_'+'sel';
          }
          else{
            _extraCssClass = (_colDate<_monthFirst || _colDate > _monthLast)?'_'+'no':'_'+'yes';
          }
          _col_html = [
            _col_html_pre[0],
            _colSecs,
            _col_html_pre[1],
            _extraCssClass,
            _col_html_pre[2],
            (_col*_column_width),
            _col_html_pre[3],
            this.mday(_colDate),
            _col_html_suf
          ].join('');
        }
        _week_html.push(_col_html);
      }
      _month_html.push([
        _week_html_pre.join(_row*_row_height),
        _week_html.join(''),
        _week_html_suf
      ].join('') );
    }
    ELEM.setHTML(this.markupElemIds.value, _month_html.join(''));
    ELEM.setHTML(this.markupElemIds.state, this.monthName(_date)+'&nbsp;'+this.year(_date));
    this.viewMonth = [_monthFirst.getUTCFullYear(),_monthFirst.getUTCMonth()];
  }
});
HCalendar.implement(HDateTime);
