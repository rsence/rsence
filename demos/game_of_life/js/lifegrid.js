LifeGrid = HControl.extend({
  lifeBlock: [],
  drawSubviews: function() {
    for (var i = 0; i < this.value.length; i++) {
      var rowLength = 40;
      var x_size = this.options.tile_height;
      var y_size = this.options.tile_width;
      
      this.lifeBlock.push(ELEM.make( this.elemId, 'div' ));
      var top = (Math.floor(i / rowLength)) * (y_size + 2) + "px";
      var left = (i - (Math.floor(i / rowLength) * rowLength)) * (x_size + 2) + "px";
      console.log( left + " " + top);
      if (this.value[i] > 0) {
        ELEM.setCSS( this.lifeBlock[i], "position:absolute;top:" + top + ";left:" + left + ";width:" + x_size + "px;height:" + y_size +"px;background-color:green;");
        ELEM.setAttr( this.lifeBlock[i], "living", 1);
      } else {
        ELEM.setCSS( this.lifeBlock[i], "position:absolute;top:" + top + ";left:" + left + ";width:" + x_size + "px;height:" + y_size +"px;background-color:black;");
        ELEM.setAttr( this.lifeBlock[i], "living", 0);
      }
    }
  },
  refreshValue: function() {
    for (var i = 0; i < this.value.length; i++) {
      var rowLength = 40;
      var x_size = this.options.tile_height;
      var y_size = this.options.tile_width;
      
      var top = (Math.floor(i / rowLength)) * (y_size + 2) + "px";
      var left = (i - (Math.floor(i / rowLength) * rowLength)) * (x_size + 2) + "px";
      console.log( left + " " + top);
      if (this.value[i] > 0) {
        if (ELEM.getAttr(this.lifeBlock[i], "living") == 0) {
          ELEM.setCSS( this.lifeBlock[i], "position:absolute;top:" + top + ";left:" + left + ";width:" + x_size + "px;height:" + y_size +"px;background-color:green;");
        }
      } else {
        if (ELEM.getAttr(this.lifeBlock[i], "living") == 0) {
          ELEM.setCSS( this.lifeBlock[i], "position:absolute;top:" + top + ";left:" + left + ";width:" + x_size + "px;height:" + y_size +"px;background-color:black;");
        }
      }
    }
  }
});