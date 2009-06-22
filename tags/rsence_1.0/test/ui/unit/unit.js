
unitTest = function( path_prefix, tests ){
  var _depsLoader = JSLoader.nu(path_prefix);
  for(var i=0;i<tests.length;i++){
    var _test = tests[i];
    with({}){
      testCategory(_test);
      _depsLoader.load(_test);
    }
  }
};

testCategory = function(descr){
  console.log("Test category: "+descr);
};

testName = function(descr){
  console.log("Testing: "+descr);
};

assertEquals = function(descr,val1,val2){
  if(val1===val2){
    //console.log("OK:"+descr);
  }
  else{
    console.error("FAIL:"+descr+' (val1:'+val1+', val2:'+val2+')');
  }
};

assertNotUndefined = function(descr,val){
  if(val!==undefined){
    //console.log("OK:"+descr);
  }
  else{
    console.error("FAIL:"+descr);
  }
};

assertNotNull = function(descr,val){
  if(val!==null){
    //console.log("OK:"+descr);
  }
  else{
    console.error("FAIL:"+descr);
  }
};

assertNull = function(descr,val){
  if(val===null){
    //console.log("OK:"+descr);
  }
  else{
    console.error("FAIL:"+descr);
  }
};

assertFalse = function(descr,val){
  if(val===false){
    //console.log("OK:"+descr);
  }
  else{
    console.error("FAIL:"+descr);
  }
};

assertTrue = function(descr,val){
  if(val===true){
    //console.log("OK:"+descr);
  }
  else{
    console.error("FAIL:"+descr);
  }
};

