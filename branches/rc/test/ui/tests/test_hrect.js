var rect, rect2, rect3, rect4;

rect = new HRect();

// left, top, right, bottom
rect2 = new HRect(120,80,300,180);

// left-top, right-bottom
rect3 = new HRect( new HPoint(20,40), new HPoint(210,166) );

// copy constructor
rect4 = new HRect( new HRect(400,430,1235,858) );

/* Helper function for the tests. */
function roundToDecimals(num,decimals) {
  var multiplier=Math.pow(10,decimals);
  return Math.round(num*multiplier) / multiplier;
}
////////////////////////////////////////////////////////////////////////////////

testName("Create");
  assertNotUndefined("Rect object created without parameters.", rect);
  assertNotNull("Rect object created without parameters.", rect);
  assertFalse("Rect object created without parameters should be invalid.", rect.isValid);

testName("InitialDimensions");
  assertEquals("Rect object's initial width.", -1, rect.width);
  assertEquals("Rect object's initial height.", -1, rect.height);

testName("InitialPosition");
  assertEquals("Rect object's initial left position.", 0, rect.left);
  assertEquals("Rect object's initial top position.", 0, rect.top);
  assertEquals("Rect object's initial right position.", -1, rect.right);
  assertEquals("Rect object's initial bottom position.", -1, rect.bottom);

testName("InitialDimensionsSetting");
  rect.set(60,70,350,120);
  
  assertEquals("Rect object's width.", 290, rect.width);
  assertEquals("Rect object's height.", 50, rect.height);
  
  assertTrue("Rect should be valid now.", rect.isValid);

testName("InitialPositionSetting");
  rect.set(60,70,350,120);
  
  assertEquals("Rect object's left position.", 60, rect.left);
  assertEquals("Rect object's top position.", 70, rect.top);
  assertEquals("Rect object's right position.", 350, rect.right);
  assertEquals("Rect object's bottom position.", 120, rect.bottom);
  
  assertTrue("Rect should be valid now.", rect.isValid);

////////////////////////////////////////////////////////////////////////////////

testName("CreateWithParameters");
  assertNotUndefined("Rect object created with parameters.", rect2);
  assertNotNull("Rect object created with parameters.", rect2);
  assertTrue("Rect object created with parameters should be valid.", rect2.isValid);

testName("Dimensions");
  assertEquals("Rect object's width.", 180, rect2.width);
  assertEquals("Rect object's height.", 100, rect2.height);

testName("Position");
  assertEquals("Rect object's left position.", 120, rect2.left);
  assertEquals("Rect object's top position.", 80, rect2.top);
  assertEquals("Rect object's right position.", 300, rect2.right);
  assertEquals("Rect object's bottom position.", 180, rect2.bottom);

testName("DimensionsSetting");
  rect2.set(60,70,350,120);
  
  assertEquals("Rect object's width.", 290, rect2.width);
  assertEquals("Rect object's height.", 50, rect2.height);
  
  assertTrue("Rect should be still valid.", rect2.isValid);

testName("PositionSetting");
  rect2.set(60,70,350,120);
  
  assertEquals("Rect object's left position.", 60, rect2.left);
  assertEquals("Rect object's top position.", 70, rect2.top);
  assertEquals("Rect object's right position.", 350, rect2.right);
  assertEquals("Rect object's bottom position.", 120, rect2.bottom);
  
  assertTrue("Rect should be still valid.", rect2.isValid);

////////////////////////////////////////////////////////////////////////////////

testName("CreateFromPoints");
  assertNotUndefined("Rect object created from points.", rect3);
  assertNotNull("Rect object created from points.", rect3);
  assertTrue("Rect object created from points should be valid.", rect3.isValid);

testName("DimensionsCreatedFromPoints");
  assertEquals("Rect object's width.", 190, rect3.width);
  assertEquals("Rect object's height.", 126, rect3.height);

testName("PositionCreatedFromPoints");
  assertEquals("Rect object's left position.", 20, rect3.left);
  assertEquals("Rect object's top position.", 40, rect3.top);
  assertEquals("Rect object's right position.", 210, rect3.right);
  assertEquals("Rect object's bottom position.", 166, rect3.bottom);

testName("DimensionsSettingCreatedFromPoints");
  rect3.set(60,70,350,120);
  
  assertEquals("Rect object's width.", 290, rect3.width);
  assertEquals("Rect object's height.", 50, rect3.height);
  
  assertTrue("Rect should be still valid.", rect3.isValid);

testName("PositionSettingCreatedFromPoints");
  rect3.set(60,70,350,120);
  
  assertEquals("Rect object's left position.", 60, rect3.left);
  assertEquals("Rect object's top position.", 70, rect3.top);
  assertEquals("Rect object's right position.", 350, rect3.right);
  assertEquals("Rect object's bottom position.", 120, rect3.bottom);
  
  assertTrue("Rect should be still valid.", rect3.isValid);

////////////////////////////////////////////////////////////////////////////////

testName("CreateFromRect");
  assertNotUndefined("Rect object created by the copy constructor.", rect4);
  assertNotNull("Rect object created by the copy constructor.", rect4);
  assertTrue("Rect object created by the copy constructor should be valid.", rect4.isValid);

testName("DimensionsCreatedFromRect");
  assertEquals("Rect object's width.", 835, rect4.width);
  assertEquals("Rect object's height.", 428, rect4.height);

testName("PositionCreatedFromRect");
  assertEquals("Rect object's left position.", 400, rect4.left);
  assertEquals("Rect object's top position.", 430, rect4.top);
  assertEquals("Rect object's right position.", 1235, rect4.right);
  assertEquals("Rect object's bottom position.", 858, rect4.bottom);

testName("DimensionsSettingCreatedFromRect");
  rect4.set(60,70,350,120);
  
  assertEquals("Rect object's width.", 290, rect4.width);
  assertEquals("Rect object's height.", 50, rect4.height);
  
  assertTrue("Rect should be still valid.", rect4.isValid);

testName("PositionSettingCreatedFromRect");
  rect4.set(60,70,350,120);
  
  assertEquals("Rect object's left position.", 60, rect4.left);
  assertEquals("Rect object's top position.", 70, rect4.top);
  assertEquals("Rect object's right position.", 350, rect4.right);
  assertEquals("Rect object's bottom position.", 120, rect4.bottom);
  
  assertTrue("Rect should be still valid.", rect4.isValid);

////////////////////////////////////////////////////////////////////////////////

testName("Validation");
  var r = new HRect( 0, 0, 0, 0 );
  assertTrue("Rect validity test 1.", r.isValid);
  
  r.set(120,120,100,130);
  assertFalse("Rect validity test 2.", r.isValid);

  r.set(120,120,200,130);
  assertTrue("Rect validity test 3.", r.isValid);

  r.set(120,120,200,30);
  assertFalse("Rect validity test 4.", r.isValid);

  r.set(-10,-20,-5,-15);
  assertTrue("Rect validity test 5.", r.isValid);

  r.set(-10,-20,-15,-15);
  assertFalse("Rect validity test 6.", r.isValid);

  r.set(-10,-20,-5,-45);
  assertFalse("Rect validity test 7.", r.isValid);

////////////////////////////////////////////////////////////////////////////////

testName("ContainsPoint");
  var r = new HRect( 60, 80, 120, 240 );
  
  assertTrue("Rect contains a Point test 1.", r.contains(new HPoint(60,80)));
  assertTrue("Rect contains a Point test 2.", r.contains(new HPoint(120,240)));
  assertTrue("Rect contains a Point test 3.", r.contains(new HPoint(95,200)));
  assertTrue("Rect contains a Point test 4.", r.contains(new HPoint(61,239)));
  
  assertFalse("Rect contains a Point test 5.", r.contains(new HPoint(59,80)));
  assertFalse("Rect contains a Point test 6.", r.contains(new HPoint(60,79)));
  assertFalse("Rect contains a Point test 7.", r.contains(new HPoint(121,80)));
  assertFalse("Rect contains a Point test 8.", r.contains(new HPoint(60,241)));

testName("ContainsRect");
  var r = new HRect( 60, 80, 120, 240 );
  
  assertTrue("Rect contains a Rect test 1.", r.contains(new HRect(60,80,120,240)));
  assertTrue("Rect contains a Rect test 2.", r.contains(new HRect(70,90,110,230)));
  assertTrue("Rect contains a Rect test 3.", r.contains(new HRect(60,80,60,80)));
  assertTrue("Rect contains a Rect test 4.", r.contains(new HRect(110,230,120,240)));

  assertFalse("Rect contains a Rect test 5.", r.contains(new HRect(60,230,70,250)));
  assertFalse("Rect contains a Rect test 6.", r.contains(new HRect(50,90,70,110)));
  assertFalse("Rect contains a Rect test 7.", r.contains(new HRect(80,70,110,90)));
  assertFalse("Rect contains a Rect test 8.", r.contains(new HRect(10,30,20,50)));

testName("IntersectsRect");
  var r = new HRect( 60, 80, 120, 240 );
  
  assertTrue("Rect intersects a Rect test 1.", r.intersects(new HRect(60,80,120,240)));
  assertTrue("Rect intersects a Rect test 2.", r.intersects(new HRect(60,230,70,250)));
  assertTrue("Rect intersects a Rect test 3.", r.intersects(new HRect(40,80,60,240)));
  assertTrue("Rect intersects a Rect test 4.", r.intersects(new HRect(50,90,70,110)));
  assertTrue("Rect intersects a Rect test 5.", r.intersects(new HRect(120,40,121,80)));
  assertTrue("Rect intersects a Rect test 6.", r.intersects(new HRect(115,235,400,400)));

  assertFalse("Rect intersects a Rect test 7.", r.intersects(new HRect(10,30,20,50)));
  assertFalse("Rect intersects a Rect test 8.", r.intersects(new HRect(121,85,150,350)));
  assertFalse("Rect intersects a Rect test 9.", r.intersects(new HRect(40,0,59,900)));
  assertFalse("Rect intersects a Rect test 10.", r.intersects(new HRect(75,50,110,70)));
  assertFalse("Rect intersects a Rect test 11.", r.intersects(new HRect(75,241,110,270)));

////////////////////////////////////////////////////////////////////////////////

testName("PointSetting");
  rect2.set(120,80,300,180);
  // 120,80,300,180
  rect2.setLeftTop( new HPoint(125,22) );
  
  assertEquals("Rect object's left position.", 125, rect2.left);
  assertEquals("Rect object's top position.", 22, rect2.top);
  assertEquals("Rect object's right position.", 300, rect2.right);
  assertEquals("Rect object's bottom position.", 180, rect2.bottom);
  
  assertTrue("Rect should be still valid.", rect2.isValid);

  // 125,22,300,180
  rect2.setLeftBottom( new HPoint(25,600) );
  
  assertEquals("Rect object's left position.", 25, rect2.left);
  assertEquals("Rect object's top position.", 22, rect2.top);
  assertEquals("Rect object's right position.", 300, rect2.right);
  assertEquals("Rect object's bottom position.", 600, rect2.bottom);
  
  assertTrue("Rect should be still valid.", rect2.isValid);

  // 25,22,300,600
  rect2.setRightTop( new HPoint(35,400) );
  
  assertEquals("Rect object's left position.", 25, rect2.left);
  assertEquals("Rect object's top position.", 400, rect2.top);
  assertEquals("Rect object's right position.", 35, rect2.right);
  assertEquals("Rect object's bottom position.", 600, rect2.bottom);
  
  assertTrue("Rect should be still valid.", rect2.isValid);

  // 25,400,35,600
  rect2.setRightBottom( new HPoint(95,450) );
  
  assertEquals("Rect object's left position.", 25, rect2.left);
  assertEquals("Rect object's top position.", 400, rect2.top);
  assertEquals("Rect object's right position.", 95, rect2.right);
  assertEquals("Rect object's bottom position.", 450, rect2.bottom);
  
  assertTrue("Rect should be still valid.", rect2.isValid);

  // 25,400,95,450
  rect2.setRightBottom( new HPoint(95,390) );
  assertFalse("Rect shouldn't be valid anymore.", rect2.isValid);

testName("PointGetting");
  rect2.set(120,80,300,180);
  // 120,80,300,180
  assertEquals("Rect object's corner position.", 120, rect2.leftTop.x);
  assertEquals("Rect object's corner position.", 80, rect2.leftTop.y);

  assertEquals("Rect object's corner position.", 120, rect2.leftBottom.x);
  assertEquals("Rect object's corner position.", 180, rect2.leftBottom.y);

  assertEquals("Rect object's corner position.", 300, rect2.rightTop.x);
  assertEquals("Rect object's corner position.", 80, rect2.rightTop.y);

  assertEquals("Rect object's corner position.", 300, rect2.rightBottom.x);
  assertEquals("Rect object's corner position.", 180, rect2.rightBottom.y);

////////////////////////////////////////////////////////////////////////////////

testName("FloatDimensions");
  rect.set(60.1, 70.8, 350.45, 120.2);
  
  assertEquals("Rect object's width.", 290.35, roundToDecimals(rect.width,2));
  assertEquals("Rect object's height.", 49.40, roundToDecimals(rect.height,2));

////////////////////////////////////////////////////////////////////////////////

testName("InsetBy");
  rect.set(60,70,350,120);
  rect.insetBy(4,4);
  
  assertEquals("Rect object's left position.", 64, rect.left);
  assertEquals("Rect object's top position.", 74, rect.top);
  assertEquals("Rect object's right position.", 346, rect.right);
  assertEquals("Rect object's bottom position.", 116, rect.bottom);
  
  rect.insetBy(-4,10);
  
  assertEquals("Rect object's left position.", 60, rect.left);
  assertEquals("Rect object's top position.", 84, rect.top);
  assertEquals("Rect object's right position.", 350, rect.right);
  assertEquals("Rect object's bottom position.", 106, rect.bottom);

  rect.set(60,70,350,120);
  rect.insetBy( new HPoint(6,3) );
  
  assertEquals("Rect object's left position.", 66, rect.left);
  assertEquals("Rect object's top position.", 73, rect.top);
  assertEquals("Rect object's right position.", 344, rect.right);
  assertEquals("Rect object's bottom position.", 117, rect.bottom);
  
  rect.insetBy( new HPoint(-1,-5) );
  
  assertEquals("Rect object's left position.", 65, rect.left);
  assertEquals("Rect object's top position.", 68, rect.top);
  assertEquals("Rect object's right position.", 345, rect.right);
  assertEquals("Rect object's bottom position.", 122, rect.bottom);

testName("OffsetBy");
  rect.set(60,70,350,120);
  rect.offsetBy(4,4);
  
  assertEquals("Rect object's left position.", 64, rect.left);
  assertEquals("Rect object's top position.", 74, rect.top);
  assertEquals("Rect object's right position.", 354, rect.right);
  assertEquals("Rect object's bottom position.", 124, rect.bottom);
  
  rect.offsetBy(-4,10);
  
  assertEquals("Rect object's left position.", 60, rect.left);
  assertEquals("Rect object's top position.", 84, rect.top);
  assertEquals("Rect object's right position.", 350, rect.right);
  assertEquals("Rect object's bottom position.", 134, rect.bottom);

  rect.set(60,70,350,120);
  rect.offsetBy( new HPoint(6,3) );
  
  assertEquals("Rect object's left position.", 66, rect.left);
  assertEquals("Rect object's top position.", 73, rect.top);
  assertEquals("Rect object's right position.", 356, rect.right);
  assertEquals("Rect object's bottom position.", 123, rect.bottom);
  
  rect.offsetBy( new HPoint(-1,-5) );
  
  assertEquals("Rect object's left position.", 65, rect.left);
  assertEquals("Rect object's top position.", 68, rect.top);
  assertEquals("Rect object's right position.", 355, rect.right);
  assertEquals("Rect object's bottom position.", 118, rect.bottom);

testName("OffsetTo");
  rect.set(60,70,350,120);
  rect.offsetTo(4,4);
  
  assertEquals("Rect object's left position.", 4, rect.left);
  assertEquals("Rect object's top position.", 4, rect.top);
  assertEquals("Rect object's right position.", 294, rect.right);
  assertEquals("Rect object's bottom position.", 54, rect.bottom);
  
  rect.offsetTo(-4,10);
  
  assertEquals("Rect object's left position.", -4, rect.left);
  assertEquals("Rect object's top position.", 10, rect.top);
  assertEquals("Rect object's right position.", 286, rect.right);
  assertEquals("Rect object's bottom position.", 60, rect.bottom);

  rect.set(60,70,350,120);
  rect.offsetTo( new HPoint(6,3) );
  
  assertEquals("Rect object's left position.", 6, rect.left);
  assertEquals("Rect object's top position.", 3, rect.top);
  assertEquals("Rect object's right position.", 296, rect.right);
  assertEquals("Rect object's bottom position.", 53, rect.bottom);
  
  rect.offsetTo( new HPoint(-1,-5) );
  
  assertEquals("Rect object's left position.", -1, rect.left);
  assertEquals("Rect object's top position.", -5, rect.top);
  assertEquals("Rect object's right position.", 289, rect.right);
  assertEquals("Rect object's bottom position.", 45, rect.bottom);

////////////////////////////////////////////////////////////////////////////////

testName("Equality");
  rect.set(60,70,350,120);

  rect2.set(1,1,200,200);
  assertFalse("Rect objects are not equal.", rect.equals(rect2));

  rect2.set(1,1,350,120);
  assertFalse("Rect objects are not equal.", rect.equals(rect2));

  rect2.set(60,70,350,121);
  assertFalse("Rect objects are not equal.", rect.equals(rect2));

  rect2.set(60,70,350,120);
  assertTrue("Rect objects are equal.", rect.equals(rect2));

testName("Intersection");
  rect.set(60,70,350,120);
  rect2.set(1,1,200,200);
  assertTrue("Rect's intersection with another Rect.",
    new HRect(60,70,200,120).equals(rect.intersection(rect2)));
  assertTrue("New Rect should be valid.", rect.intersection(rect2).isValid);
  
  rect.set(10,10,20,20);
  rect2.set(15,15,30,30);
  assertTrue("Rect's intersection with another Rect.",
    new HRect(15,15,20,20).equals(rect.intersection(rect2)));
  assertTrue("New Rect should be valid.", rect.intersection(rect2).isValid);
  
  rect.set(100,100,150,150);
  rect2.set(140,10,300,101);
  assertTrue("Rect's intersection with another Rect.",
    new HRect(140,100,150,101).equals(rect.intersection(rect2)));
  assertTrue("New Rect should be valid.", rect.intersection(rect2).isValid);
  
  rect.set(20,30,30,40);
  rect2.set(60,70,70,80);
  assertFalse("New Rect should be invalid.", rect.intersection(rect2).isValid);

testName("Union");
  rect.set(60,70,350,120);
  rect2.set(1,1,200,200);
  assertTrue("Rect's union with another Rect.",
    new HRect(1,1,350,200).equals(rect.union(rect2)));
  
  rect.set(10,10,20,20);
  rect2.set(15,15,30,30);
  assertTrue("Rect's union with another Rect.",
    new HRect(10,10,30,30).equals(rect.union(rect2)));
  
  rect.set(100,100,150,150);
  rect2.set(140,10,300,101);
  assertTrue("Rect's union with another Rect.",
    new HRect(100,10,300,150).equals(rect.union(rect2)));
  
  rect.set(20,30,30,40);
  rect2.set(60,70,70,80);
  assertTrue("Rect's union with another Rect.",
    new HRect(20,30,70,80).equals(rect.union(rect2)));

testName("DimensionSetting");
  rect2.set(60,70,350,120);
  
  assertEquals("Rect object's width.", 290, rect2.width);
  assertEquals("Rect object's height.", 50, rect2.height);
  
  assertEquals("Rect object's left position.", 60, rect2.left);
  assertEquals("Rect object's top position.", 70, rect2.top);
  assertEquals("Rect object's right position.", 350, rect2.right);
  assertEquals("Rect object's bottom position.", 120, rect2.bottom);


  rect2.setWidth(100);
  rect2.setHeight(120);
  
  assertEquals("Rect object's width.", 100, rect2.width);
  assertEquals("Rect object's height.", 120, rect2.height);

  assertEquals("Rect object's left position.", 60, rect2.left);
  assertEquals("Rect object's top position.", 70, rect2.top);
  assertEquals("Rect object's right position.", 160, rect2.right);
  assertEquals("Rect object's bottom position.", 190, rect2.bottom);
  
  assertTrue("Rect should be still valid.", rect2.isValid);
  

  rect2.setWidth(50);
  
  assertEquals("Rect object's width.", 50, rect2.width);
  assertEquals("Rect object's height.", 120, rect2.height);

  assertEquals("Rect object's left position.", 60, rect2.left);
  assertEquals("Rect object's top position.", 70, rect2.top);
  assertEquals("Rect object's right position.", 110, rect2.right);
  assertEquals("Rect object's bottom position.", 190, rect2.bottom);
  
  assertTrue("Rect should be still valid.", rect2.isValid);
  

  rect2.setHeight(50);
  
  assertEquals("Rect object's width.", 50, rect2.width);
  assertEquals("Rect object's height.", 50, rect2.height);

  assertEquals("Rect object's left position.", 60, rect2.left);
  assertEquals("Rect object's top position.", 70, rect2.top);
  assertEquals("Rect object's right position.", 110, rect2.right);
  assertEquals("Rect object's bottom position.", 120, rect2.bottom);
  
  assertTrue("Rect should be still valid.", rect2.isValid);
  

  rect2.setSize(230,180);
  
  assertEquals("Rect object's width.", 230, rect2.width);
  assertEquals("Rect object's height.", 180, rect2.height);

  assertEquals("Rect object's left position.", 60, rect2.left);
  assertEquals("Rect object's top position.", 70, rect2.top);
  assertEquals("Rect object's right position.", 290, rect2.right);
  assertEquals("Rect object's bottom position.", 250, rect2.bottom);
  
  assertTrue("Rect should be still valid.", rect2.isValid);


