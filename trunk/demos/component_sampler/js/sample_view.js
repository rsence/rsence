SampleView = HView.extend({
  drawSubviews: function() {
    this.setStyle('border','1px dashed red');
    this.setStyle('background-color','#e6e7e9');
    this.setStyle('background-image','url('+this.app.options.checker_pattern_gif_url+')');
    this.setStyle('overflow','visible');
    var labelElemId = ELEM.make(this.elemId);
    ELEM.setCSS(labelElemId, 'position:absolute; left:-1px; top:-1px; font-family:Arial; font-size:10px; border:1px solid red; background-color:#fff; padding-left:8px; padding-right: 8px;');
    ELEM.setHTML(labelElemId, 'Sample:');
  }
});