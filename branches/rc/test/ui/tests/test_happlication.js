/**
 **  HApplication test runner.
 **/

testName('HApplication creation');
  var app = new HApplication();
  assertNotNull( 'Application instance created', app );