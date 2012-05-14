/*   RSence
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
  **
  ** = Instance variables
  ** +minValue+::       The smallest allowed value.
  ** +maxValue+::       The biggest allowed value.
  ** +repeatDelay+::    The key repetition initial delay when changing the slider
  **                    with cursor keys. Defaults to 300 (ms)
  ** +repeatInterval+:: The key repetition interval when changing the slider
  **                    with cursor keys. Defaults to 50 (ms)
  ** +inveseAxis+::     Inverse Scrollwheel axis.
  **                    As there is only one scrollwheel event, sideways
  **                    scrolling doesn't work logically for horizonal
  **                    scrollbars by default, so set this to true to
  **                    have horizonal sliders work logically
  **                    with sideways scrolling, where supported.
  ***/
var//RSence.Controls
HVSlider = HSlider.extend({
  
  componentName: "vslider",
    
  // This overrides the HSlider property.
  _isVertical: true,

  orientations: ['w','e','c']
  
});

