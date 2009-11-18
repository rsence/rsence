/*   Riassence Framework
 *   Copyright 2006 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

/*** = Description
  ** HVSlider (vertical version of the slider control) is a control unit that enables the user
  ** to choose a value in a range of values. Sliders support both dragging the handle and 
  ** clicking the mouse anywhere on the slider to move the handle towards the mouse, 
  ** as well as keyboard support after the handle is in active mode. 
  ** Naturally, sliders are commonly used as colour mixers, volume controls, 
  ** graphical equalizers and seekers in media applications. 
  ** A typical slider is a drag-able knob along vertical or horizontal line. 
  ** Slider view or theme can be changed; the helmiTheme is used by default.
  **
  ** = Instance variables
  ** +type+::      '[HVSlider]'
  ** +value+::     Numeric value currently set to this object.
  ** +minValue+::  The minimum value that can be set to this object.
  ** +maxValue+::  The maximum value that can be set to this object.
  ***/
HVSlider = HSlider.extend({
  
  componentName: "vslider",
  
/** = Description
  * Vertical slider constructor.
  *
  * = Parameters
  * +_rect+::          An HRect object that sets the position and dimensions 
  *                    of this control.
  * +_parentClass+::   The parent view that this control is to be inserted in.
  * +_options+::       (optional) All other parameters. See HComponentDefaults.
  *
  **/
  constructor: function(_rect,_parentClass,_options) {
    
    if(this.isinherited){
      this.base(_rect,_parentClass,_options);
    }
    else {
      this.isinherited = true;
      this.base(_rect,_parentClass,_options);
      this.isinherited = false;
    }
    
    // This overrides the HSlider property.
    this._isVertical = true;
    
    if(!this.isinherited){
      this.draw();
    }
  }
  
});

