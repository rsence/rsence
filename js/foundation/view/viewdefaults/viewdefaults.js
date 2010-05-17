/*   RSence
 *   Copyright 2010 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

/*** = Description
  ** Define default HView setting here. Will be used, when no or invalid constructor
  ** options are supplied.
  ***/
HViewDefaults = HClass.extend({
  
/** The default label. A label is the "visual value" of a component that
  * operates on a "hidden" value.
  **/
  label:    "",

/** The default initial visibility of the component.
  **/
  visible:  true
  
});

