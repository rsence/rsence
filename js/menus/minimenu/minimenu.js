/*   RSence
 *   Copyright 2010 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */


/*** = Description
  ** Simple small menu component for selecting one value amongst several.
  ** It's limited to 15px height by the default theme.
  ***/
var//RSence.Menus
HMiniMenu = HRadioButtonList.extend({
  
  componentName: 'minimenu',
  
  defaultEvents: {
    draggable: true,
    click: true
  },
  
  repositionMenuItems: function(){
    var
    x = this.pageX(),
    y = this.pageY(),
    w = this.rect.width,
    h = this.listItems.length*15,
    i = 0,
    listItem = null;
    for(;i<this.listItems.length && listItem === null;i++){
      if(this.listItems[i][0]===this.value){
        listItem = this.listItems[i];
      }
    }
    y -= (i-1)*15;
    if(y < 0){
      y = y%15;
    }
    if(this.options['menuItemGeom']){
      if(this.options.menuItemGeom.width){
        w += this.options.menuItemGeom.width;
      }
      if(this.options.menuItemGeom.width){
        x += this.options.menuItemGeom.left;
      }
    }
    this.menuItemView.rect.set( x, y, x+w, y+h );
    this.menuItemView.refresh();
  },
  
  click: function(){
    this.menuShow();
  },
  
  refreshValue: function(){
    this.base();
    for(var i=0;i<this.listItems.length;i++){
      if(this.listItems[i][0]===this.value){
        this.setLabel( this.listItems[i][1] );
        return;
      }
    }
  },
  
  menuShow: function(){
    this.repositionMenuItems();
    this.menuItemView.bringToFront();
    this.menuItemView.show();
    return true;
  },
  
  menuHide: function(){
    this.menuItemView.sendToBack();
    this.menuItemView.hide();
  },
  
  startDrag: function(x,y){
    this.dragStart = [x,y];
    this.menuShow();
  },
  
  lostActiveStatus: function(newActive){
    this.menuHide();
  },
  
  endDrag: function(x,y){
    if( (Math.round(this.dragStart[0]*0.2)===Math.round(x*0.2)) &&
        (Math.round(this.dragStart[1]*0.2)===Math.round(y*0.2))
    ){
      this.menuShow();
    }
    else {
      this.menuHide();
    }
  },
  
  die: function(){
    this.menuItemView.die();
    this.base();
  },
  
  drawSubviews: function(){
    this.markupElemIds.subview = 0;
    this.menuItemView = HView.extend({
      bringToFront: function(){
        this.setStyle('z-index',this.app.views.length);
      }
    }).nu(
      [ this.rect.left, this.rect.top, this.rect.width, 500 ],
      this, {
        visible: false,
        style: [
          ['background-color','#f6f6f6'],
          ['border', '1px solid #999'],
          ['overflow-y', 'auto'],
          ['opacity', 0.9]
        ]
      }
    );
  },
  
  setListItems: function(listItems){
    this.base(listItems);
    this.valueMatrix = this.menuItemView.valueMatrix;
  },
  
  createComponent: function( i, _label ){
    return HMiniMenuItem.nu(
      [ 0, (i*15), null, 15, 0, null ],
      this.menuItemView, {
        label: _label
      }
    );
  }
  
});