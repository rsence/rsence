
var Point = HClass.extend({
  constructor: function(x, y) {
    this.x = x;
    this.y = y;
  }
});
var point1 = new Point(10,20);

var Rectangle1 = Point.extend({
  constructor: function(x, y, width, height) {
    this.base(x, y);
    this.width = width;
    this.height = height;
  },
  getWidth: function() {
    return this.width;
  },
  getHeight: function() {
    return this.height;
  }
},
{
  // class methods
  description: "this is a Rectangle",
  getClass: function() {
    return this;
  }
});
var rect1 = new (Rectangle1.getClass())(11,21,100,200);
// Mimics the interface
var AreaInterface = HClass.extend({
  constructor: null,
  area: function() {
    return this.getWidth() * this.getHeight();
  }
});
Rectangle1.implement(AreaInterface);
var rect2 = new Rectangle1(12,22,101,201);


testName('Class Inheritance');
  assertTrue("Instance members x and y from constructor", (point1.x===10 && point1.y===20));
  assertTrue("Instance members inheritance from constructor", (
    rect1.width === rect1.getWidth() &&
    rect1.width === 100 &&
    rect1.height === rect1.getHeight() &&
    rect1.height === 200 &&
    rect1.x === 11 &&
    rect1.y === 21)
  );


testName('Class Methods');
  assertTrue("Class variable test",(Rectangle1.description==='this is a Rectangle'));

testName('Interface Implementation');
  assertEquals("Area does not match", rect2.area(), 20301);

