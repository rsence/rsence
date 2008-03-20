HPieChart = HControl.extend({

  componentName: "piechart",

  constructor: function(_rect, _parentClass, _options) {

    if(this.isinherited) {
      this.base(_rect, _parentClass, _options);
    }
    else {
      this.isinherited = true;
      this.base(_rect, _parentClass, _options);
      this.isinherited = false;
    }

    this.type = '[HPieChart]';


    var _left = 0;
    var _top = 5;
    var _right = _left + _rect.width;
    var _bottom = _top + 20;
    var _newRect = new HRect(_left,_top,_right,_bottom);

    if (!this.label) {
      this.label = "Unknown";
    }

    this.pieTitle = new HStringView(
      new HRect(_newRect),
      this, {
        value: this.label
      }
    );

    this.pieTitle.setStyle("font-weight","bold");
    this.pieTitle.setStyle("text-align","center");

    if (!this.options.imgWidth) {
      this.options.imgWidth = 300;
    } else if (!this.options.imgHeight) {
      this.options.imgHeight = 300;
    }

    _newRect.offsetBy(10,40);
    _newRect.setSize(this.options.imgWidth,this.options.imgHeight);
    this.pieImage = new HImageView(
      new HRect(_newRect),
      this, {
        value: this.value
      }
    );

    _newRect.offsetBy(this.pieImage.rect.right,0);
    var _legWidth = _rect.width - _newRect.left - 15;
    var _legHeight = this.options.labels.length * 20;
    _newRect.setSize(_legWidth,_legHeight);
    
    this.pieLegend = new HView(
      new HRect(_newRect),
      this
    );
    this.pieLegend.setStyle("border","1px solid gray");

    var _labelRect = new HRect(30, 0, _legWidth, 20);
    var _ledRect = new HRect(10,3,20,13);

    for (var i=0;i<this.options.labels.length;i++) {
      this.legendLed = new HView(
        _ledRect,
        this.pieLegend
      );
      this.legendLed.setStyle("border","1px solid gray");
      _color = this.options.colors[i];
      this.legendLed.setStyle("background-color",_color);
      _ledRect.offsetBy(0,20);
      this.legendLabel = new HStringView(
        _labelRect,
        this.pieLegend,
        {value: this.options.labels[i]}
      );
    _labelRect.offsetBy(0,20);
    }


    if(!this.isinherited) {
      this.draw();
    }
  },

  draw: function() {
    this.base();
    this.drawRect();
  }

});
