/*   Riassence Framework
 *   Copyright 2006 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */


/** class: HComponentDefaults
  *
  * Define default setting here. Will be used, when no or invalid constructor options are supplied.
  *
  * vars: Settable Control-level defaults, override on construction
  *  label - The visual value of the component
  **/
HComponentDefaults = HClass.extend({
  
  // The visual value of a component:
  label:    "",
  visible:  true,
  
  // See <HControl.setEvents>.
  events:   {},
  
  // The default value. See <HControl.setValue>
  value:    0,
  
  // The enabled/disabled flag. See <HControl.setEnabled>
  enabled:  true,
  active:   false,
  
  // Value Range -related
  minValue: -2147483648, // signed 32bit
  maxValue:  2147483648  // signed 32bit
  
});

