
/*** = Description
  ** Menu item for the HMiniMenu component.
  ***/
var//RSence.Menus
HMiniMenuItem = HRadioButton.extend({
  
  componentName: 'minimenuitem',
  
  defaultEvents: {
    click: true,
    mouseUp: true,
    mouseDown: true
  },

  gainedActiveStatus: function( _prevActive ){
    this.base( _prevActive );
  },

  lostActiveStatus: function( _newActive ){
    this.parent.options.logicParent.menuHide();
    this.base( _newActive );
  },

  _parentLastActivation: 0,
  click: function(){
    var _now = new Date().getTime();
    if( _now - this._parentLastActivation > 200 ){
      this.base();
      this._parentLastActivation = _now;
      EVENT.changeActiveControl(null);
    }
    return true;
  },
  
  mouseDown: function(){
    this.base();
    this.click();
    return true;
  },
  
  mouseUp: function(){
    this.base();
    this.click();
    return true;
  }
  
});
