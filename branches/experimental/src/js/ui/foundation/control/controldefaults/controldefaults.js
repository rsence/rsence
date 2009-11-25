/*   Riassence Framework
 *   Copyright 2006 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

/*** = Description
  ** Define default setting here. Will be used, when no or invalid constructor
  ** options are supplied.
  ***/
HControlDefaults = HClass.extend({
  
/** The default label. A label is the "visual value" of a component that
  * operates on a "hidden" value.
  **/
  label:    "",

/** The default initial visibility of the component.
  **/
  visible:  true,
  
/** The default initial event responders to register to a component.
  * By default no events are enabled.
  **/
  events:   {},
  
/** The default initial value of the component.
  **/
  value:    0,
  
/** The default initial enabled state of the component.
  **/
  enabled:  true,
  
/** The default initial active state of the component.
  **/
  active:   false,
  
/** The default initial minimum value of the component.
  **/
  minValue: -2147483648, // negative max of signed 32bit
  
/** The default initial maximum value of the component.
  **/
  maxValue:  2147483648  // positive max of signed 32bit
  
});

// Alias for backwards-compatibility.
HComponentDefaults = HControlDefaults;

