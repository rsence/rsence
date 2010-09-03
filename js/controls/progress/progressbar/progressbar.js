/*   RSence
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
var//RSence.Controls
HProgressBar = HControl.extend({
  componentName: "progressbar",
  
/** The amount of pixels the theme insets the width of the progress bar **/
  themeWidthInset: 2,
  
/** Sets the width of the progress bar when the value changes. **/
  refreshValue: function(){
    if( this.drawn && this.markupElemIds.value ){
      var _visibleWidth = this.rect.width-this.themeWidthInset,
          _progressWidth = Math.round(_visibleWidth * this.value);
      if(_progressWidth<0){
        _progressWidth = 0;
      }
      this.setStyleOfPart('value','width',_progressWidth+'px');
    }
  },
  onIdle: function(){
    this.base();
    this.refreshValue();
  }
});
