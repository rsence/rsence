var
HPopupMenu = HMiniMenu.extend({
  componentName: 'popupmenu',
  subComponentHeight: 24,
  createComponent: function( i, _label ){
    return HMenuItem.nu(
      [ 0, (i*24), null, 24, 0, null ],
      this.menuItemView, {
        label: _label
      }
    );
  }
});
var HPopUpMenu = HPopupMenu;