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
  ** vars: Instance variables
  **  type - '[HProgressBar]'
  **  value - Numeric value currently set to this object.
  **  minValue - The minimum value that can be set to this object.
  **  maxValue - The maximum value that can be set to this object.
  **
  ** Extends:
  **  <HControl>
  **
  ** See also:
  **  <HControl> <HProgressIndicator>
  ***/

HProgressBar = HControl.extend({
  
  componentName: "progressbar",

/** constructor: constructor
  *
  * Parameters:
  *   _rect - An <HRect> object that sets the position and dimensions of this control.
  *   _parentClass - The parent view that this control is to be inserted in.
  *   _options - (optional) All other parameters. See <HComponentDefaults>.
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
      minValue: 0,
      maxValue: 100
    });
    
    _defaults = _defaults.extend(_options);
    _options = new _defaults();

    this.value = _options.value;
    this.minValue = _options.minValue;
    this.maxValue = _options.maxValue;

    this.visibleWidth = this.rect.width - 2;
    
    this.type = '[HProgressBar]';
    this._progressbarPrefix = 'progressmark';
    
    if(!this.isinherited) {
      this.draw();
    }
    
    this.progressFrameHeight = 20;
    this.progressFrames      = 10;
    this.currProgressFrame   = 0;
  },
  
  setProgressFrameHeight: function(_px){
    this.progressFrameHeight = _px;
  },
  
  setProgressFrameNum: function(_num){
    this.progressFrames = _num;
  },
  
/** method: setValue
  * 
  * Sets the current value of the object and extends the progress mark to the correct position.
  * 
  * Parameters:
  *   _value - A numeric value to be set to the object.
  *
  * See also:
  *  <HControl.setValue>
  **/  
  setValue: function(_value) {  
    this.base(_value);       
    this.drawProgress();
  },
  
  onIdle: function(){
    if(this.progressbarElemId) {
      this.currProgressFrame++;
      if(this.currProgressFrame>=this.progressFrames){this.currProgressFrame=0;}
      var _px = this.currProgressFrame*this.progressFrameHeight;
      ELEM.setStyle(this.progressbarElemId,'background-position','0px -'+_px+'px');
    }
  },
  
  /** method: draw
  * 
  * Draws the rectangle and the markup of this object on the screen.
  *
  * See also:
  *  <HView.draw>
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
    this.progressbarElemId = this.bindDomElement(
      this._progressbarPrefix + this.elemId);
    this.drawProgress();
  },

// private method  
  _value2px: function() {   
    var _intvalue = this.visibleWidth * ((this.value - this.minValue) / (this.maxValue - this.minValue));
    var _pxvalue = parseInt(Math.round(_intvalue),10) + 'px';
    return _pxvalue; 
  },

// private method 
  drawProgress: function() {
    if (this.progressbarElemId) {
      var _propval   = this._value2px();
      ELEM.setStyle(this.progressbarElemId, 'width', _propval);
    }
  }
});
