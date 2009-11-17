/*   Riassence Framework
 *   Copyright 2006 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

/*** = Description
  ** A progress indicator is the indeterminate progress bar, which is used in situations where the
  ** extent of the task is unknown or the progress of the task can not be determined in a way that could be
  ** expressed as a percentage. This bar uses motion or some other indicator to show that progress is taking
  ** place, rather than using the size of the filled portion to show the total amount of progress.
  **
  ** = Instance variables
  ** +type+::      '[HProgressIndicator]'
  ** +value+::     Boolean value currently set to this object (true - on, false - off).
  ** +interval+::  The delay time (in ms) before the next iteration.
  ***/

HProgressIndicator = HControl.extend({
  
  packageName:   "progress",
  componentName: "progressindicator",

/** = Description
  * HProgressIndicator constructor.
  *
  * = Parameters
  * +_rect+::         An HRect object that sets the position and dimensions 
  *                   of this control.
  * +_parentClass+::  The parent view that this control is to be inserted in.
  * +_options+::      (optional) All other parameters. See <HComponentDefaults>.
  *
  **/    
  constructor: function(_rect,_parentClass,_options) { 
   
    if(this.isinherited) {
      this.base(_rect,_parentClass,_options);
    }
    else {
      this.isinherited = true;
      this.base(_rect,_parentClass,_options);
      this.isinherited = false;
    }
    
    if (!_options) {
      _options = {};
    }
    
    // Default options.
    var _defaults = Base.extend({
      value: 0,
      interval: 20
    });
    _defaults = _defaults.extend(_options);
    _options = new _defaults();

  
    this.type = '[HProgressIndicator]';
    this._progressbarPrefix = 'progressmark'; 
    
    this.interval = _options.interval;
    this.value = _options.value;
    
    // The interval reference.
    this._counter = null;
    
    if(!this.isinherited) {
        this.draw();
    }
    
  },

/** = Description
  * Checks if the given value is true of false and serves as a toggle of the object. (to be changed..)
  * 
  * = Parameters
  * +_value+:: A boolean value to be set to the object.
  *
  **/ 
  setValue: function(_value) {
    
    if(this._progressbarElemId) {
      
      if (_value === true && !this._counter) {
        var temp = this;
        this._counter = setInterval(function() {
            temp.drawProgress();
          }, temp.interval
        );
      }
      else {
        clearInterval(this._counter);
        this._counter = null;
      }
      
    }
  },
  
  
/** = Description
  * Makes sure the progress indicator update interval gets cleaned up before the
  * component is destroyed.
  * 
  */
  die: function() {
    this.base();
    if (this._counter) {
      clearInterval(this._counter);
    }
  },
  
  
/** = Description
  * Draws the rectangle and the markup of this object on the screen.
  *
  **/ 
  draw: function() {
    if (!this.drawn) {
      this.drawRect();
      this.drawMarkup();
      this._initProgress();
    }
  },

// private method   
  _initProgress: function() {
    this._progressbarElemId = this.bindDomElement(
      this._progressbarPrefix + this.elemId);

    this.drawProgress();
  },

/** = Description
  * DrawProgress function
  *
  **/
  drawProgress: function() {
    this.progressPosition ++;
    if(this.progressPosition > this.positionLimit - 1) {
      this.progressPosition = 0;
    }
    
    if (this._progressbarElemId) {
      ELEM.setStyle(this._progressbarElemId, 'background-position', '0px -' +
        (this.progressPosition * this.rect.height) + 'px');
    }
    
  }
   
});

