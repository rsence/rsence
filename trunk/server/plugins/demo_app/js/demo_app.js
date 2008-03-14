
DemoApp = HApplication.extend({
  constructor: function( clockImgId ){
    this.base();
    this.clockImgVal = HVM.values[clockImgId];
    var x = 100, y = 100;
    this.clockWindow = new HWindowControl(
      new HRect(x,y,x+256+16,y+256+16+21),
      this, {
        label: 'Clock Demo'
      }
    );
    this.clockView = new HImageView(
      new HRect(4,4,4+256,4+256),
      this.clockWindow.windowView
    );
    this.clockImgVal.bind( this.clockView );
  }
});


