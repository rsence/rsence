/*   RSence
 *   Copyright 2010 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

// Simple view for scrolling purposes.
// Uses two special options for setting scroll bar behavior:
//  - scrollX: true | false | 'auto'
//  - scrollY: true | false | 'auto'
var//RSence.Views
HScrollView = HControl.extend({
  controlDefaults: HControlDefaults.extend({
    scrollX: true,
    scrollY: true
  }),
  drawSubviews: function(){
    if(!this.options.scrollX){
      this.setStyle('overflow-x','hidden');
    }
    else if(this.options.scrollX === 'auto'){
      this.setStyle('overflow-x','auto');
    }
    else {
      this.setStyle('overflow-x','scroll');
    }
    if(!this.options.scrollY){
      this.setStyle('overflow-y','hidden');
    }
    else if(this.options.scrollY === 'auto'){
      this.setStyle('overflow-y','auto');
    }
    else {
      this.setStyle('overflow-y','scroll');
    }
  }
});

