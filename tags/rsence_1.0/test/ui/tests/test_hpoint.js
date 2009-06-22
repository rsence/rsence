var point, point2, point3;
point = new HPoint();
// Values
point2 = new HPoint(50,60);
// copy constructor
point3 = new HPoint( new HPoint(1,1) );

////////////////////////////////////////////////////////////////////////////////

testName("Create");
  assertNotNull("Point object created without parameters.", point);

testName("InitialPosition");
  assertNull("Point object's initial x position.", point.x);
  assertNull("Point object's initial y position.", point.y);

testName("PositionSetting");
  point.set(10,20);
  assertEquals("Point object's x position.", 10, point.x);
  assertEquals("Point object's y position.", 20, point.y);

  point.set(55,160);
  assertEquals("Point object's x position.", 55, point.x);
  assertEquals("Point object's y position.", 160, point.y);

  point.set(-100,-200);
  assertEquals("Point object's x position.", -100, point.x);
  assertEquals("Point object's y position.", -200, point.y);

////////////////////////////////////////////////////////////////////////////////

testName("CreateWithValues");
  assertNotNull("Point object created with values.", point2);

testName("InitialPositionFromValues");
  assertNotNull("Point object's x position.", point2.x);
  assertNotNull("Point object's y position.", point2.y);

  assertEquals("Point object's x position.", 50, point2.x);
  assertEquals("Point object's y position.", 60, point2.y);

////////////////////////////////////////////////////////////////////////////////

testName("CreateFromCopy");
  assertNotNull("Point object created by the copy constructor", point3);

testName("InitialPositionFromCopy");
  assertNotNull("Point object's x position.", point3.x);
  assertNotNull("Point object's y position.", point3.y);

  assertEquals("Point object's x position.", 1, point3.x);
  assertEquals("Point object's y position.", 1, point3.y);

testName("CreationWithNils");
  var p=new HPoint(0,0);
  assertNotNull("Point object created with (0,0)", p);

////////////////////////////////////////////////////////////////////////////////

testName("ConstrainTo");
  // left, top, right, bottom
  var rect = new HRect(120,80,300,180);
  point.set(50,60);

  assertEquals("Point object's x position.", 50, point.x);
  assertEquals("Point object's y position.", 60, point.y);
  point.constrainTo(rect);
  assertEquals("Point object's x position in rect.", 120, point.x);
  assertEquals("Point object's y position in rect.", 80, point.y);


  point.set(350,99);
  assertEquals("Point object's x position.", 350, point.x);
  assertEquals("Point object's y position.", 99, point.y);
  point.constrainTo(rect);
  assertEquals("Point object's x position in rect.", 300, point.x);
  assertEquals("Point object's y position in rect.", 99, point.y);


  point.set(250,600);
  assertEquals("Point object's x position.", 250, point.x);
  assertEquals("Point object's y position.", 600, point.y);
  point.constrainTo(rect);
  assertEquals("Point object's x position in rect.", 250, point.x);
  assertEquals("Point object's y position in rect.", 180, point.y);


  point.set(250,0);
  assertEquals("Point object's x position.", 250, point.x);
  assertEquals("Point object's y position.", 0, point.y);
  point.constrainTo(rect);
  assertEquals("Point object's x position in rect.", 250, point.x);
  assertEquals("Point object's y position in rect.", 80, point.y);


  point.set(200,80);
  assertEquals("Point object's x position.", 200, point.x);
  assertEquals("Point object's y position.", 80, point.y);
  point.constrainTo(rect);
  assertEquals("Point object's x position in rect.", 200, point.x);
  assertEquals("Point object's y position in rect.", 80, point.y);


////////////////////////////////////////////////////////////////////////////////

testName("Addition");
  point.set(10,20);
  point2.set(62,5);

  point = point.add(point2);
  assertEquals("Point object's x position.", 72, point.x);
  assertEquals("Point object's y position.", 25, point.y);

  point = point.add(point2);
  assertEquals("Point object's x position.", 134, point.x);
  assertEquals("Point object's y position.", 30, point.y);

testName("Subtraction");
  point.set(100,200);
  point2.set(62,5);

  point = point.subtract(point2);
  assertEquals("Point object's x position.", 38, point.x);
  assertEquals("Point object's y position.", 195, point.y);

  point = point.subtract(point2);
  assertEquals("Point object's x position.", -24, point.x);
  assertEquals("Point object's y position.", 190, point.y);

testName("Equality");
  point.set(100,200);

  point2.set(62,5);
  assertFalse("Point objects are not equal.", point.equals(point2));

  point2.set(100,5);
  assertFalse("Point objects are not equal.", point.equals(point2));

  point2.set(10,200);
  assertFalse("Point objects are not equal.", point.equals(point2));

  point2.set(100,200);
  assertTrue("Point objects are equal.", point.equals(point2));
