/*   Riassence Framework
 *   Copyright 2009 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

/** = Description
  * HCalendar class
  *
  *
  **/
  
HCalendar = HControl.extend({
  componentName: 'calendar',
  weekdays_localized: ['Wk','Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
  
/** = Description
  * Mousewheel changes months on calendar ui.
  *
  **/
  mouseWheel: function(delta){
    if(delta<0){
      this.nextMonth();
    }
    else{
      this.prevMonth();
    }
  },

/** = Description
  *
  *
  *
  **/
  refreshLabel: function(){
    var weekdays_localized = this.weekdays_localized,
        weekdays_width = Math.floor(this.rect.width/weekdays_localized.length),
        weekdays_html = [],
        i = 0,
        weekdays_html_pre = ['<div style="width:'+weekdays_width+'px;left:','px">'],
        weekdays_html_suf = '</div>';
    for(;i<weekdays_localized.length;i++){
      weekdays_html.push([
        weekdays_html_pre.join(i*weekdays_width),
        weekdays_localized[i],
        weekdays_html_suf
      ].join('') );
    }
    ELEM.setHTML(this.markupElemIds.label, weekdays_html.join(''));
  },

/** = Description
  *
  *
  *
  **/
  calendarDateRange: function(date){
    var date_begin = this.firstDateOfMonth(date),
        date_end = this.lastDateOfMonth(date),
        firstWeeksDate = this.firstDateOfWeek(date_begin),
        lastWeeksDate  = this.lastDateOfWeek(date_end),
        week_begin = this.week(firstWeeksDate),
        week_end = this.week(lastWeeksDate),
        weeks = week_end-week_begin;
    if((weeks===5) && (firstWeeksDate.getDate() !== 1)){
      lastWeeksDate = new Date( lastWeeksDate.getTime() + this.msWeek );
    }
    else if((weeks===5) && (firstWeeksDate.getDate() === 1)){
      firstWeeksDate = new Date( firstWeeksDate.getTime() - this.msWeek );
    }
    else if(weeks===4){
      firstWeeksDate = new Date( firstWeeksDate.getTime() - this.msWeek );
      lastWeeksDate = new Date( lastWeeksDate.getTime() + this.msWeek );
    }
    return [
      firstWeeksDate,
      lastWeeksDate
    ];
  },

/** = Description
  *
  *
  *
  **/
  refreshValue: function(){
    var date = this.date();
    this.drawCalendar(date);
  },

/** = Description
  *
  *
  *
  **/
  nextMonth: function(){
    var date = new Date( this.viewMonth[0], this.viewMonth[1]+1, 1 );
    this.drawCalendar( new Date(date.getTime() - this.tzMs(date)) );
  },

/** = Description
  *
  *
  *
  **/
  prevMonth: function(){
    var date = new Date( this.viewMonth[0], this.viewMonth[1]-1, 1 );
    this.drawCalendar( new Date(date.getTime() - this.tzMs(date)) );
  },
  viewMonth: [1970,0],

/** = Description
  *
  *
  *
  **/
  drawCalendar: function(date){
    date = (date instanceof Date)?date:this.date();
    var calendarDateRange = this.calendarDateRange(date),
        monthFirst = this.firstDateOfMonth(date),
        monthLast = this.lastDateOfMonth(date),
        firstDate = calendarDateRange[0],
        lastDate = calendarDateRange[1],
        column_count = this.weekdays_localized.length,
        column_width = Math.floor((this.rect.width-1)/column_count),
        row_height = Math.floor((this.rect.height-1-35)/6),
        week_html_pre = ['<div class="calendar_weeks_week_row" style="width:'+(this.rect.width-3)+'px;height:'+row_height+'px;top:','px">'],
        week_html_suf = '</div>',
        col_html_pre = ['<a href="javascript:void(HSystem.views['+this.viewId+'].setValue(','));" class="calendar_weeks_week_col','" style="width:'+column_width+'px;height:'+row_height+'px;line-height:'+row_height+'px;left:','px">'],
        col_html_suf = '</a>',
        col_week_pre = '<div class="calendar_weeks_week_col_wk" style="width:'+column_width+'px;height:'+row_height+'px;line-height:'+row_height+'px;left:0px">',
        col_week_suf = '</div>',
        month_html = [],
        week_html,
        col_html,
        row, col,
        colMs,
        colSecs,
        colDate,
        extraCssClass;
    for(row = 0; row<6; row++){
      week_html = [];
      for(col = 0; col<8; col++){
        colDate = new Date(firstDate.getTime()+((row*this.msWeek)+((col-1)*this.msDay)));
        colMs = colDate.getTime();
        if(col===0){
          col_html = [
            col_week_pre,
            this.week(colDate),
            col_week_suf
          ].join('');
        }
        else {
          colSecs = Math.round(colMs/1000);
          if((this.value >= colSecs) && (this.value < (colSecs+86400))){
            extraCssClass = '_'+'sel';
          }
          else{
            extraCssClass = (colDate<monthFirst || colDate > monthLast)?'_'+'no':'_'+'yes';
          }
          col_html = [
            col_html_pre[0],
            colSecs,
            col_html_pre[1],
            extraCssClass,
            col_html_pre[2],
            (col*column_width),
            col_html_pre[3],
            this.mday(colDate),
            col_html_suf
          ].join('');
        }
        week_html.push(col_html);
      }
      month_html.push([
        week_html_pre.join(row*row_height),
        week_html.join(''),
        week_html_suf
      ].join('') );
    }
    ELEM.setHTML(this.markupElemIds.value, month_html.join(''));
    ELEM.setHTML(this.markupElemIds.state, this.monthName(date)+'&nbsp;'+this.year(date));
    this.viewMonth = [monthFirst.getUTCFullYear(),monthFirst.getUTCMonth()];
  }
});
HCalendar.implement(HDateTime);
