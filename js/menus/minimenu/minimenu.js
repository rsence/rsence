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
    click: true,
    resize: true
  },

  subComponentHeight: 15,

  resize: function(){
    this.repositionMenuItems();
  },
  
  repositionMenuItems: function(){
    var
    x = this.pageX(),
    y = this.pageY(),
    w = this.rect.width,
    h = this.listItems.length*this.subComponentHeight,
    i = 0,
    listItem = null;
    for(;i<this.listItems.length && listItem === null;i++){
      if(this.listItems[i][0]===this.value){
        listItem = this.listItems[i];
      }
    }
    y -= (i-1)*this.subComponentHeight;
    if(y < 0){
      y = this.subComponentHeight%y;
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
    if(this.listItems && this.listItems.length !== 0 && this['valueMatrix'] !== undefined ) {
      for(var i=0;i<this.listItems.length;i++){
        if(this.listItems[i][0]===this.value){
          this.setLabel( this.listItems[i][1] );
          return;
        }
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
    this.valueMatrix = null;
    var _menuItemView = this.menuItemView;
    this.base();
    _menuItemView && _menuItemView.die();
  },
  
  drawSubviews: function(){
    var
    itemStyle = {
      'background-color': '#f6f6f6',
      'border': '1px solid #999',
      'overflow': 'auto',
      'overflow-x': 'hidden'
    };
    if(!BROWSER_TYPE.ie){
      itemStyle.opacity = 0.9;
    }
    this.menuItemView = HView.nu(
      [ this.rect.left, this.rect.top, this.rect.width, 10 ],
      this.app, {
        visible: false,
        style: itemStyle
      }
    );
  },
  
  setListItems: function(listItems){
    this.base(listItems);
    this.valueMatrix = this.menuItemView.valueMatrix;
    this.refreshValue();
    if( this.options.initialVisibility ){
      EVENT.changeActiveControl(this);
      this.menuShow();
    }
  },
  
  createComponent: function( i, _label ){
    return HMiniMenuItem.nu(
      [ 0, (i*this.subComponentHeight), null, this.subComponentHeight, 0, null ],
      this.menuItemView, {
        label: _label
      }
    );
  }
  
});