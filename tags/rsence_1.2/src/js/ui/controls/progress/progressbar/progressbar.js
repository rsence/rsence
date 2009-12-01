/*   Riassence Framework
 *   Copyright 2006 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

/*** = Description
  ** HProgressBar is a control unit used to convey the progress of a task, 
  ** such as a download or file transfer. In other words, it is a component 
  ** indicating a percentage of a total task has completed.
  **
  ** Use the maxValue to define the point of progress at the end and use value
  ** to define the point of progress.
  **
***/
HProgressBar = HControl.extend({
  componentName: "progressbar",
  
/** The amount of pixels the theme insets the width of the progress bar **/
  themeWidthInset: 2,
  
/** Sets the width of the progress bar when the value changes. **/
  refreshValue: function(){
    if( this.drawn && this.markupElemIds.value ){
      var _visibleWidth = ELEM.getVisibleSize( this.elemId )[0]-this.themeWidthInset,
          _unitWidth = _visibleWidth/this.maxValue,
          _progressWidth = Math.round(_unitWidth * this.value);
      this.setStyleOfPart('value','width',_progressWidth+'px');
    }
  }
});
